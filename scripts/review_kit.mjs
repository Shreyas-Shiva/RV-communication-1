/**
 * COMMUNIQ Translation Review Kit
 * Exports and imports strings to CSV for native speaker human review.
 * Tracks: id, category, english, native_script, language, reviewed (yes/no), reviewer, notes
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';
  const comboScript = path.join(__dirname, 'export_review_combinations.ts');

  const result = spawnSync(npxCmd, ['tsx', comboScript], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    console.error('Failed to export all review combinations via tsx.');
    process.exit(result.status ?? 1);
  }
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
