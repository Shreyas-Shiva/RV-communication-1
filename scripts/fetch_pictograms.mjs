import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const wordsFile = path.resolve(__dirname, 'pictogram-words.json');
const mapFile = path.resolve(__dirname, 'pictogram-map.json');
const missingFile = path.resolve(__dirname, 'pictograms-missing.txt');
const reviewHtmlFile = path.resolve(__dirname, 'pictogram-review.html');
const outDir = path.resolve(projectRoot, 'frontend', 'public', 'pictograms');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function main() {
  console.log('==================================================');
  console.log('         COMMUNIQ ARASAAC PICTOGRAM FETCHER       ');
  console.log('==================================================\n');

  if (!fs.existsSync(wordsFile)) {
    console.error(`Error: words file not found at ${wordsFile}`);
    process.exit(1);
  }

  const wordMap = JSON.parse(fs.readFileSync(wordsFile, 'utf-8'));
  const cardIds = Object.keys(wordMap);
  console.log(`Loaded ${cardIds.length} card IDs to process.\n`);

  let existingMap = {};
  if (fs.existsSync(mapFile)) {
    try {
      existingMap = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
    } catch {
      existingMap = {};
    }
  }

  const resultsMap = { ...existingMap };
  const missingCards = [];
  const reviewItems = [];

  for (let i = 0; i < cardIds.length; i++) {
    const cardId = cardIds[i];
    const keyword = wordMap[cardId];
    const targetPng = path.join(outDir, `${cardId}.png`);

    console.log(`[${i + 1}/${cardIds.length}] Processing card: ${cardId} (keyword: "${keyword}")...`);

    let arasaacId = resultsMap[cardId]?.arasaacId;

    if (!arasaacId) {
      try {
        const searchUrl = `https://api.arasaac.org/v1/pictograms/en/search/${encodeURIComponent(keyword)}`;
        const searchResults = await fetchJson(searchUrl);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          arasaacId = searchResults[0]._id;
          resultsMap[cardId] = {
            cardId,
            keyword,
            arasaacId,
            downloadedAt: Date.now()
          };
        } else {
          console.warn(`  Warning: No ARASAAC result found for keyword: "${keyword}"`);
          missingCards.push(cardId);
          continue;
        }
      } catch (err) {
        console.error(`  Search failed for "${keyword}":`, err.message);
        missingCards.push(cardId);
        await sleep(250);
        continue;
      }
      await sleep(250);
    }

    if (arasaacId) {
      reviewItems.push({ cardId, keyword, arasaacId });

      if (fs.existsSync(targetPng)) {
        console.log(`  File exists: ${cardId}.png (skipping download).`);
      } else {
        try {
          const imgUrl = `https://static.arasaac.org/pictograms/${arasaacId}/${arasaacId}_500.png`;
          console.log(`  Downloading from ${imgUrl}...`);
          await downloadFile(imgUrl, targetPng);
          console.log(`  Saved to ${targetPng}`);
        } catch (err) {
          console.error(`  Failed to download image for ${cardId}:`, err.message);
          missingCards.push(cardId);
        }
        await sleep(250);
      }
    }
  }

  // Write pictogram-map.json
  fs.writeFileSync(mapFile, JSON.stringify(resultsMap, null, 2), 'utf-8');
  console.log(`\nUpdated map saved to: ${mapFile}`);

  // Write pictograms-missing.txt
  fs.writeFileSync(missingFile, missingCards.join('\n'), 'utf-8');
  console.log(`Missing cards list saved to: ${missingFile} (${missingCards.length} missing)`);

  // Generate pictogram-review.html contact sheet
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>COMMUNIQ Pictogram Review Contact Sheet</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #FFF8EF; color: #1F1B16; padding: 24px; }
    h1 { margin-bottom: 8px; color: #0A6C6E; }
    p.credit { font-size: 13px; color: #5E564D; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .card { background: white; border: 2px solid #E5DACF; border-radius: 12px; padding: 12px; text-align: center; }
    .card img { width: 100px; height: 100px; object-fit: contain; margin-bottom: 8px; }
    .card .id { font-size: 12px; font-weight: bold; color: #0A6C6E; }
    .card .kw { font-size: 11px; color: #5E564D; }
    .card .aid { font-size: 10px; color: #8F7A3E; }
  </style>
</head>
<body>
  <h1>COMMUNIQ Pictogram Review Contact Sheet</h1>
  <p class="credit">Pictographic symbols used are property of Aragon Government and created by Sergio Palao for ARASAAC (http://www.arasaac.org), licensed under CC (BY-NC-SA).</p>
  <div class="grid">
    ${reviewItems.map(item => `
      <div class="card">
        <img src="../frontend/public/pictograms/${item.cardId}.png" alt="${item.keyword}" onerror="this.style.display='none'" />
        <div class="id">${item.cardId}</div>
        <div class="kw">Keyword: ${item.keyword}</div>
        <div class="aid">ARASAAC ID: ${item.arasaacId}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(reviewHtmlFile, htmlContent, 'utf-8');
  console.log(`Contact sheet saved to: ${reviewHtmlFile}`);
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
