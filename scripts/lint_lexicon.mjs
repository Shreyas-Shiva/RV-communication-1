import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const entriesFilePath = path.join(rootDir, 'frontend', 'src', 'data', 'lexicon', 'entries.ts');
if (!fs.existsSync(entriesFilePath)) {
  console.error(`[FAIL] Lexicon entries file not found at ${entriesFilePath}`);
  process.exit(1);
}

// Read the TypeScript source and parse entries
const content = fs.readFileSync(entriesFilePath, 'utf8');

// Also verify against communication assets
const assetsFilePath = path.join(rootDir, 'frontend', 'src', 'data', 'assets.ts');
const assetsContent = fs.readFileSync(assetsFilePath, 'utf8');
const assetIdMatches = [...assetsContent.matchAll(/id:\s*['"]([a-z0-9_]+)['"]/g)].map(m => m[1]);
const uniqueAssetIds = [...new Set(assetIdMatches)];

// Simple parser for entries
const entryRegex = /id:\s*['"]([a-z0-9_]+)['"][\s\S]*?type:\s*['"]([a-z_]+)['"][\s\S]*?english:\s*\{([\s\S]*?)\}[\s\S]*?hindi:\s*\{([\s\S]*?)\}[\s\S]*?kannada:\s*\{([\s\S]*?)\}[\s\S]*?reviewed:\s*(true|false)/g;

let match;
let totalEntries = 0;
let failures = [];
let unreviewedCount = 0;
const parsedIds = new Set();

const VALID_TYPES = new Set([
  'food', 'drink', 'object', 'place', 'person', 'feeling', 'body_part',
  'symptom', 'action', 'response', 'time', 'school_item', 'toy', 'vehicle',
  'animal', 'clothing', 'weather'
]);

while ((match = entryRegex.exec(content)) !== null) {
  totalEntries++;
  const [_, id, type, englishRaw, hindiRaw, kannadaRaw, reviewedStr] = match;
  parsedIds.add(id);

  const isReviewed = reviewedStr === 'true';
  if (!isReviewed) {
    unreviewedCount++;
  }

  // Check type
  if (!VALID_TYPES.has(type)) {
    failures.push(`Item '${id}': invalid type '${type}'`);
  }

  // Check English
  if (!englishRaw.includes('singular:') || !englishRaw.includes('plural:')) {
    failures.push(`Item '${id}': missing English singular or plural`);
  }
  if (!englishRaw.includes('countability:') || !englishRaw.includes('articleRule:')) {
    failures.push(`Item '${id}': missing English countability or articleRule`);
  }
  if (type === 'action' && (!englishRaw.includes('verbForms:') || !englishRaw.includes('base:') || !englishRaw.includes('ing:'))) {
    failures.push(`Item '${id}' (action): missing English verbForms (base, ing)`);
  }

  // Check Hindi
  if (!hindiRaw.includes('gender:') || !hindiRaw.includes('number:') || !hindiRaw.includes('base:')) {
    failures.push(`Item '${id}': missing Hindi gender, number, or base`);
  }
  if (type === 'feeling' && (!hindiRaw.includes('adjective:') || !hindiRaw.includes('neutral:'))) {
    failures.push(`Item '${id}' (feeling): missing Hindi adjective agreement forms`);
  }

  // Check Kannada
  if (!kannadaRaw.includes('base:') || !kannadaRaw.includes('dative:') || !kannadaRaw.includes('accusative:') || !kannadaRaw.includes('locative:')) {
    failures.push(`Item '${id}': missing Kannada case forms (base, dative, accusative, locative)`);
  }
}

// Check if any asset from assets.ts is missing in lexicon
for (const assetId of uniqueAssetIds) {
  if (!parsedIds.has(assetId)) {
    failures.push(`Communication asset '${assetId}' is missing from Lexicon`);
  }
}

console.log('==================================================');
console.log('            COMMUNIQ LEXICON LINTER               ');
console.log('==================================================');
console.log(`Total Lexicon Items Scanned: ${totalEntries}`);
console.log(`Matching Asset IDs: ${parsedIds.size}`);
console.log(`Unreviewed Items (Pending Native Review): ${unreviewedCount} / ${totalEntries}`);

if (failures.length > 0) {
  console.error('\n[FAIL] Found validation failures:');
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  process.exit(1);
}

console.log('\n[PASS] All items have valid types and complete language forms across English, Kannada, and Hindi.');
process.exit(0);
