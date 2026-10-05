import { LEXICON_ENTRIES } from '../frontend/src/data/lexicon/entries';
import { getIntentsForType } from '../frontend/src/data/intentMatrix';
import { renderSentence, SupportedLanguage, UserAgeGroup, SentenceTone } from '../frontend/src/services/sentenceRenderer';
import { validateSentence } from '../frontend/src/services/sentenceValidator';
import { HindiSpeakerWording } from '../frontend/src/data/lexicon/types';

console.log('==================================================');
console.log('            COMMUNIQ GRAMMAR LINTER               ');
console.log('==================================================');

const languages: SupportedLanguage[] = ['en', 'kn', 'hi'];
const ageGroups: UserAgeGroup[] = ['child', 'student', 'adult'];
const tones: SentenceTone[] = ['short', 'polite', 'casual'];
const wordings: HindiSpeakerWording[] = ['neutral', 'masculine', 'feminine'];

let totalCombinations = 0;
let failedCount = 0;
const failures: string[] = [];

const samples: Record<SupportedLanguage, string[]> = {
  en: [],
  kn: [],
  hi: []
};

for (const entry of LEXICON_ENTRIES) {
  const allowedIntents = getIntentsForType(entry.type, entry);

  for (const intent of allowedIntents) {
    for (const lang of languages) {
      for (const age of ageGroups) {
        for (const tone of tones) {
          // For Hindi test all 3 wordings, for EN/KN just neutral
          const activeWordings = lang === 'hi' ? wordings : ['neutral' as HindiSpeakerWording];

          for (const wording of activeWordings) {
            totalCombinations++;
            const result = renderSentence({
              entry,
              intentId: intent.id,
              language: lang,
              ageGroup: age,
              tone,
              wording
            });

            const validation = validateSentence(result.text, lang, age);

            if (!validation.valid) {
              failedCount++;
              if (failures.length < 15) {
                failures.push(
                  `[FAIL] ${entry.id} (${entry.type}) | intent: ${intent.id} | ${lang} | ${age} | wording: ${wording} -> "${result.text}" (Reason: ${validation.reason})`
                );
              }
            } else {
              // Collect samples
              if (samples[lang].length < 20) {
                samples[lang].push(`[${entry.id}] ${result.text}`);
              }
            }
          }
        }
      }
    }
  }
}

console.log(`Total Combinations Evaluated: ${totalCombinations}`);
console.log(`Validation Failures: ${failedCount}`);

if (failedCount > 0) {
  console.error('\nSample Failures:');
  for (const f of failures) {
    console.error(f);
  }
  console.error(`\n[FAIL] Grammar Linter detected ${failedCount} structural/linguistic violations.`);
  process.exit(1);
}

console.log('\n--- Sample Rendered Sentences (English) ---');
samples.en.forEach((s, i) => console.log(`${String(i + 1).padStart(2, ' ')}. ${s}`));

console.log('\n--- Sample Rendered Sentences (Kannada) ---');
samples.kn.forEach((s, i) => console.log(`${String(i + 1).padStart(2, ' ')}. ${s}`));

console.log('\n--- Sample Rendered Sentences (Hindi) ---');
samples.hi.forEach((s, i) => console.log(`${String(i + 1).padStart(2, ' ')}. ${s}`));

console.log('\n[PASS] All combinations generated valid, grammatical sentences without leaked IDs or banned patterns.');
process.exit(0);
