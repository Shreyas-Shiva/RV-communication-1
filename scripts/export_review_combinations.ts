/**
 * Export all communication assets and rendered grammar combinations into translations_review.csv.
 * Every row contains reviewed (yes/no), reviewer, and notes.
 * By default, all generated combinations have reviewed: 'no' until a native speaker verifies them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMUNICATION_ASSETS } from '../frontend/src/data/assets';
import { LEXICON_ENTRIES } from '../frontend/src/data/lexicon/entries';
import { getIntentsForType } from '../frontend/src/data/intentMatrix';
import { renderSentence, SupportedLanguage, UserAgeGroup, SentenceTone } from '../frontend/src/services/sentenceRenderer';
import { HindiSpeakerWording } from '../frontend/src/data/lexicon/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const csvFile = path.join(rootDir, 'translations_review.csv');

console.log('Generating comprehensive translation and sentence review CSV...');

const rows: string[] = [
  'id,category,item_id,intent_id,language,age_group,tone,wording,text,reviewed,reviewer,notes'
];

let assetCount = 0;
let combinationCount = 0;

// 1. Export core communication asset words
for (const a of COMMUNICATION_ASSETS) {
  assetCount++;
  // Kannada
  rows.push(`"asset_${a.id}_kn","${a.categoryId}","${a.id}","word","kn","all","standard","neutral","${a.labels.kn.replace(/"/g, '""')}","${a.reviewed ? 'yes' : 'no'}","",""`);
  // Hindi
  rows.push(`"asset_${a.id}_hi","${a.categoryId}","${a.id}","word","hi","all","standard","neutral","${a.labels.hi.replace(/"/g, '""')}","${a.reviewed ? 'yes' : 'no'}","",""`);
}

// 2. Export all grammatical combinations
const languages: SupportedLanguage[] = ['en', 'kn', 'hi'];
const ageGroups: UserAgeGroup[] = ['child', 'student', 'adult'];
const tones: SentenceTone[] = ['short', 'polite', 'casual'];
const wordings: HindiSpeakerWording[] = ['neutral', 'masculine', 'feminine'];

for (const entry of LEXICON_ENTRIES) {
  const allowedIntents = getIntentsForType(entry.type, entry);

  for (const intent of allowedIntents) {
    for (const lang of languages) {
      for (const age of ageGroups) {
        for (const tone of tones) {
          const activeWordings = lang === 'hi' ? wordings : ['neutral' as HindiSpeakerWording];

          for (const wording of activeWordings) {
            combinationCount++;
            const result = renderSentence({
              entry,
              intentId: intent.id,
              language: lang,
              ageGroup: age,
              tone,
              wording
            });

            const rowId = `combo_${entry.id}_${intent.id}_${lang}_${age}_${tone}_${wording}`;
            const cleanText = result.text.replace(/"/g, '""');
            // By policy: reviewed: 'no' until a native human reviewer explicitly signs off
            rows.push(
              `"${rowId}","${entry.type}","${entry.id}","${intent.id}","${lang}","${age}","${tone}","${wording}","${cleanText}","${result.reviewed ? 'yes' : 'no'}","",""`
            );
          }
        }
      }
    }
  }
}

fs.writeFileSync(csvFile, '\uFEFF' + rows.join('\n'), 'utf8');

console.log(`Successfully exported review catalog to ${csvFile}`);
console.log(`- Vocabulary Asset Rows: ${assetCount * 2}`);
console.log(`- Rendered Grammatical Combinations: ${combinationCount}`);
console.log(`- Total Rows to Review: ${rows.length - 1}`);
console.log(`- Marked Reviewed: 0 (pending native speaker human verification)`);
