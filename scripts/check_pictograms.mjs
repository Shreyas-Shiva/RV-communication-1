import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const wordsFile = path.resolve(__dirname, 'pictogram-words.json');
const pictoDir = path.resolve(projectRoot, 'frontend', 'public', 'pictograms');

console.log('==================================================');
console.log('         COMMUNIQ PICTOGRAM ASSET CHECK          ');
console.log('==================================================\n');

if (!fs.existsSync(wordsFile)) {
  console.error(`Error: words file not found at ${wordsFile}`);
  process.exit(1);
}

const wordMap = JSON.parse(fs.readFileSync(wordsFile, 'utf-8'));
const cardIds = Object.keys(wordMap);
let presentCount = 0;
const missing = [];

for (const cid of cardIds) {
  const filePath = path.join(pictoDir, `${cid}.png`);
  if (fs.existsSync(filePath)) {
    presentCount++;
  } else {
    missing.push(cid);
  }
}

console.log(`Total configured cards: ${cardIds.length}`);
console.log(`Present PNG files: ${presentCount}`);
console.log(`Missing PNG files: ${missing.length}`);

if (missing.length > 0) {
  console.log('\nCards without local PNG assets (will render clean SVG/label fallback):');
  missing.forEach(m => console.log(`  - ${m} (search keyword: "${wordMap[m]}")`));
  console.log('\nTo download official ARASAAC pictograms, run: npm run fetch:pictograms');
} else {
  console.log('\nAll cards have local PNG pictograms installed!');
}
