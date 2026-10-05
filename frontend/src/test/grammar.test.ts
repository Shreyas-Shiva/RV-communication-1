import { describe, it, expect } from 'vitest';
import { getLexiconEntry } from '../data/lexicon/entries';
import { getIntentsForType } from '../data/intentMatrix';
import { renderSentence } from '../services/sentenceRenderer';
import { validateSentence } from '../services/sentenceValidator';

describe('Grammar Quality System & Defect Prevention', () => {
  it('prevents defect a: "Yes" can NEVER produce "I do not like Yes"', () => {
    const yesEntry = getLexiconEntry('yes_card')!;
    expect(yesEntry).toBeDefined();
    expect(yesEntry.type).toBe('response');

    // Intents for response items MUST NEVER include like, dislike, want, or hungry
    const allowedIntents = getIntentsForType(yesEntry.type, yesEntry);
    const intentIds = allowedIntents.map(i => i.id);

    expect(intentIds).not.toContain('like');
    expect(intentIds).not.toContain('dislike');
    expect(intentIds).not.toContain('want');
    expect(intentIds).not.toContain('hungry_thirsty');

    // Rendering all valid intents for Yes across all modes
    for (const age of ['child', 'student', 'adult'] as const) {
      for (const intent of allowedIntents) {
        const result = renderSentence({
          entry: yesEntry,
          intentId: intent.id,
          language: 'en',
          ageGroup: age
        });

        expect(result.text).not.toContain('I do not like Yes');
        expect(result.text).not.toContain('like Yes');
        expect(result.text).not.toContain('want Yes');

        // Must validate cleanly
        const val = validateSentence(result.text, 'en', age);
        expect(val.valid).toBe(true);
      }
    }

    // Direct banned pattern check
    const bannedCheck = validateSentence('I do not like Yes.', 'en', 'child');
    expect(bannedCheck.valid).toBe(false);
    expect(bannedCheck.reason).toContain('banned');
  });

  it('prevents defect b: "Happy" can NEVER produce "I do not care for Happy"', () => {
    const happyEntry = getLexiconEntry('happy')!;
    expect(happyEntry).toBeDefined();
    expect(happyEntry.type).toBe('feeling');

    // Feelings MUST NOT have food-like dislike/want templates
    const allowedIntents = getIntentsForType(happyEntry.type, happyEntry);
    const intentIds = allowedIntents.map(i => i.id);

    expect(intentIds).not.toContain('dislike');
    expect(intentIds).not.toContain('want');
    expect(intentIds).not.toContain('hungry_thirsty');

    for (const age of ['child', 'student', 'adult'] as const) {
      for (const intent of allowedIntents) {
        const result = renderSentence({
          entry: happyEntry,
          intentId: intent.id,
          language: 'en',
          ageGroup: age
        });

        expect(result.text).not.toContain('I do not care for Happy');
        expect(result.text).not.toContain('care for Happy');
        expect(result.text).not.toContain('like Happy');

        const val = validateSentence(result.text, 'en', age);
        expect(val.valid).toBe(true);
      }
    }

    // Direct banned pattern check
    const bannedCheck = validateSentence('I do not care for Happy.', 'en', 'adult');
    expect(bannedCheck.valid).toBe(false);
    expect(bannedCheck.reason).toContain('banned');
  });

  it('renders benchmark sentences correctly in English, Kannada and Hindi', () => {
    // English
    const pizza = getLexiconEntry('pizza')!;
    const enPizza = renderSentence({
      entry: pizza,
      intentId: 'would_like',
      language: 'en',
      ageGroup: 'adult'
    });
    expect(enPizza.text).toBe('I would like some pizza, please.');

    const happy = getLexiconEntry('happy')!;
    const enHappy = renderSentence({
      entry: happy,
      intentId: 'feel',
      language: 'en',
      ageGroup: 'child'
    });
    expect(enHappy.text).toBe('I feel happy.');

    const yes = getLexiconEntry('yes_card')!;
    const enYes = renderSentence({
      entry: yes,
      intentId: 'option_1',
      language: 'en',
      ageGroup: 'adult'
    });
    expect(enYes.text).toBe('Yes, please.');

    // Kannada
    const knPizza = renderSentence({
      entry: pizza,
      intentId: 'want',
      language: 'kn',
      ageGroup: 'child'
    });
    expect(knPizza.text).toBe('ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.');

    const knHappy = renderSentence({
      entry: happy,
      intentId: 'feel',
      language: 'kn',
      ageGroup: 'child'
    });
    expect(knHappy.text).toBe('ನಾನು ಖುಷಿಯಾಗಿದ್ದೇನೆ.');

    const knHungry = renderSentence({
      entry: pizza,
      intentId: 'hungry_thirsty',
      language: 'kn',
      ageGroup: 'child'
    });
    expect(knHungry.text).toContain('ನನಗೆ ಹಸಿವಾಗಿದೆ.');

    // Hindi
    const hiPizza = renderSentence({
      entry: pizza,
      intentId: 'want',
      language: 'hi',
      ageGroup: 'child'
    });
    expect(hiPizza.text).toBe('मुझे पिज़्ज़ा चाहिए।');

    const hiHappy = renderSentence({
      entry: happy,
      intentId: 'feel',
      language: 'hi',
      ageGroup: 'child'
    });
    expect(hiHappy.text).toBe('मैं खुश हूँ।');

    const hiHungry = renderSentence({
      entry: pizza,
      intentId: 'hungry_thirsty',
      language: 'hi',
      ageGroup: 'child'
    });
    expect(hiHungry.text).toContain('मुझे भूख लगी है।');
  });

  it('supports Hindi gender agreement in first-person forms', () => {
    const tired = getLexiconEntry('tired')!;

    const hiNeutral = renderSentence({
      entry: tired,
      intentId: 'feel',
      language: 'hi',
      ageGroup: 'adult',
      wording: 'neutral'
    });
    expect(hiNeutral.text).toBe('मुझे थकान हो रही है।');

    const hiMasc = renderSentence({
      entry: tired,
      intentId: 'feel',
      language: 'hi',
      ageGroup: 'adult',
      wording: 'masculine'
    });
    expect(hiMasc.text).toBe('मैं थक गया हूँ।');

    const hiFem = renderSentence({
      entry: tired,
      intentId: 'feel',
      language: 'hi',
      ageGroup: 'adult',
      wording: 'feminine'
    });
    expect(hiFem.text).toBe('मैं थक गई हूँ।');
  });

  it('rejects sentences with leaked internal IDs or slot markers', () => {
    expect(validateSentence('I want home_place.', 'en', 'adult').valid).toBe(false);
    expect(validateSentence('I feel {feeling}.', 'en', 'child').valid).toBe(false);
    expect(validateSentence('Here is undefined.', 'en', 'student').valid).toBe(false);
  });
});
