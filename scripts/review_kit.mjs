/**
 * COMMUNIQ Translation Review Kit
 * Exports and imports strings to CSV for native speaker human review.
 * Tracks: id, category, english, native_script, language, reviewed (yes/no), reviewer, notes
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const assetsFile = path.join(rootDir, 'frontend', 'src', 'data', 'assets.ts');
const csvFile = path.join(rootDir, 'translations_review.csv');

function parseAssets(content) {
  const assets = [];
  const regex = /{\s*id:\s*'([^']+)',\s*categoryId:\s*'([^']+)',\s*labels:\s*{\s*en:\s*'([^']+)',\s*kn:\s*'([^']+)',\s*hi:\s*'([^']+)'\s*},\s*alt:\s*'([^']+)',\s*svgIcon:\s*'([^']+)'(?:,\s*requiresConfirmation:\s*(true|false))?,\s*reviewed:\s*(true|false)\s*}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    assets.push({
      id: match[1],
      categoryId: match[2],
      en: match[3],
      kn: match[4],
      hi: match[5],
      alt: match[6],
      reviewed: match[8] === 'true'
    });
  }
  return assets;
}

function exportCsv() {
  console.log('Exporting translation strings for human review...');
  const content = fs.readFileSync(assetsFile, 'utf8');
  const assets = parseAssets(content);

  const rows = [
    'id,category,english,language,native_script,reviewed (yes/no),reviewer,notes'
  ];

  let unreviewedCount = 0;

  for (const a of assets) {
    // Kannada row
    rows.push(`"${a.id}","${a.categoryId}","${a.en.replace(/"/g, '""')}","kn","${a.kn.replace(/"/g, '""')}","${a.reviewed ? 'yes' : 'no'}","",""`);
    // Hindi row
    rows.push(`"${a.id}","${a.categoryId}","${a.en.replace(/"/g, '""')}","hi","${a.hi.replace(/"/g, '""')}","${a.reviewed ? 'yes' : 'no'}","",""`);
    if (!a.reviewed) unreviewedCount++;
  }

  fs.writeFileSync(csvFile, '\uFEFF' + rows.join('\n'), 'utf8');
  console.log(`Saved ${rows.length - 1} translation rows to: ${csvFile}`);
  console.log(`Total Communication Assets: ${assets.length}`);
  console.log(`Unreviewed Assets: ${unreviewedCount}`);
  console.log('Reviewers can open translations_review.csv in Excel/Google Sheets, review, and re-import with "npm run import:review".\n');
}

function importCsv() {
  if (!fs.existsSync(csvFile)) {
    console.error(`Error: CSV file not found at ${csvFile}. Run "npm run export:review" first.`);
    process.exit(1);
  }

  console.log('Importing reviewed translations from CSV...');
  const csvContent = fs.readFileSync(csvFile, 'utf8').replace(/^\uFEFF/, '');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const reviewedIds = new Set();

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
    const id = parts[0];
    const reviewed = (parts[5] || '').toLowerCase();
    if (reviewed === 'yes' || reviewed === 'true') {
      reviewedIds.add(id);
    }
  }

  console.log(`Found ${reviewedIds.size} assets marked as reviewed.`);
  let content = fs.readFileSync(assetsFile, 'utf8');
  for (const id of reviewedIds) {
    const idPattern = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?reviewed:\\s*)false`, 'g');
    content = content.replace(idPattern, '$1true');
  }

  fs.writeFileSync(assetsFile, content, 'utf8');
  console.log('Successfully updated assets.ts with reviewed statuses!\n');
}

const command = process.argv[2] || 'export';
if (command === 'import') {
  importCsv();
} else {
  exportCsv();
}
