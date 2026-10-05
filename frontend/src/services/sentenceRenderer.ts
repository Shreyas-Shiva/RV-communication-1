import { LexiconEntry, HindiSpeakerWording } from '../data/lexicon/types';

export type SupportedLanguage = 'en' | 'kn' | 'hi';
export type UserAgeGroup = 'child' | 'student' | 'adult';
export type SentenceTone = 'short' | 'polite' | 'casual';

export interface RenderSentenceOptions {
  entry: LexiconEntry;
  intentId: string;
  language: SupportedLanguage;
  ageGroup: UserAgeGroup;
  tone?: SentenceTone;
  wording?: HindiSpeakerWording; // Hindi first-person gender agreement
}

export interface RenderResult {
  text: string;
  reviewed: boolean; // true only if signed off by native speaker
}

export function renderSentence(options: RenderSentenceOptions): RenderResult {
  const {
    entry,
    intentId,
    language,
    ageGroup,
    tone = ageGroup === 'adult' ? 'polite' : 'short',
    wording = 'neutral'
  } = options;

  switch (language) {
    case 'kn':
      return { text: renderKannada(entry, intentId, ageGroup, tone), reviewed: false };
    case 'hi':
      return { text: renderHindi(entry, intentId, ageGroup, tone, wording), reviewed: false };
    case 'en':
    default:
      return { text: renderEnglish(entry, intentId, ageGroup, tone), reviewed: false };
  }
}

// -------------------------------------------------------------
// ENGLISH RENDERER
// -------------------------------------------------------------
function renderEnglish(
  entry: LexiconEntry,
  intentId: string,
  ageGroup: UserAgeGroup,
  tone: SentenceTone
): string {
  const { type, english, id } = entry;
  const isAdult = ageGroup === 'adult';
  const isChild = ageGroup === 'child';

  // Format noun with proper article
  const withArticle = (rule: string, noun: string) => {
    if (rule === 'an') return `an ${noun}`;
    if (rule === 'a') return `a ${noun}`;
    if (rule === 'some') return `some ${noun}`;
    if (rule === 'the') return `the ${noun}`;
    if (rule === 'my') return `my ${noun}`;
    return noun;
  };

  const articleNoun = withArticle(english.articleRule, english.singular);

  // 1. FOOD & DRINK
  if (type === 'food' || type === 'drink') {
    switch (intentId) {
      case 'want':
        if (isChild) return `I want ${articleNoun}.`;
        if (isAdult || tone === 'polite') return `I would like ${articleNoun}, please.`;
        return `I want ${articleNoun}.`;

      case 'would_like':
        return `I would like ${articleNoun}, please.`;

      case 'can_have':
        return `Could I please have ${articleNoun}?`;

      case 'hungry_thirsty':
        if (type === 'drink') {
          return isAdult
            ? `I am thirsty. Could I please have ${articleNoun}?`
            : `I am thirsty. I want ${articleNoun}.`;
        }
        return isAdult
          ? `I am hungry. Could I please have ${articleNoun}?`
          : `I am hungry. I want ${articleNoun}.`;

      case 'like':
        if (isAdult) return `I really enjoy ${english.singular}.`;
        return `I like ${english.singular}.`;

      case 'dislike':
        if (isAdult) return `I do not care for ${english.singular}.`;
        return `I do not like ${english.singular}.`;

      case 'do_not_want':
        if (isAdult) return `No ${english.singular} for me, thank you.`;
        return `I do not want ${english.singular}.`;

      case 'more':
        if (isAdult || tone === 'polite') return `May I have some more ${english.singular}, please?`;
        return `More ${english.singular}, please.`;

      case 'finished':
        return `I am finished with ${english.singular}.`;

      case 'where_is':
        return `Where is the ${english.singular}?`;

      case 'hot_cold':
        return `Is this hot or cold?`;

      default:
        return `I want ${articleNoun}.`;
    }
  }

  // 2. FEELINGS
  if (type === 'feeling') {
    switch (intentId) {
      case 'feel':
        if (isChild) return `I feel ${english.singular}.`;
        if (isAdult) return `I am feeling ${english.singular} today.`;
        return `I feel ${english.singular}.`;

      case 'do_not_feel':
        return `I do not feel ${english.singular}.`;

      case 'felt_earlier':
        return isChild ? `I felt this earlier.` : `I felt ${english.singular} earlier today.`;

      case 'tell_why':
        return isChild ? `I want to say why.` : `I want to tell you why I feel ${english.singular}.`;

      case 'help_feel_better':
        return `Please help me feel better.`;

      default:
        return `I feel ${english.singular}.`;
    }
  }

  // 3. RESPONSES (Never like or want)
  if (type === 'response') {
    if (id === 'yes_card') {
      if (intentId === 'option_1') return `Yes, please.`;
      if (intentId === 'option_2') return `Yes, that is right.`;
      if (intentId === 'option_3') return `Yes, I understand.`;
      return `Yes, I agree.`;
    }
    if (id === 'no_card') {
      if (intentId === 'option_1') return `No, thank you.`;
      if (intentId === 'option_2') return `No, that is not right.`;
      if (intentId === 'option_3') return `No, I do not want that.`;
      return `No, I do not understand.`;
    }
    if (id === 'please') {
      if (intentId === 'option_1') return `Please help me.`;
      if (intentId === 'option_2') return `Please wait a moment.`;
      if (intentId === 'option_3') return `Please give me this.`;
      return `Could you please assist me?`;
    }
    if (id === 'thank_you') {
      if (intentId === 'option_1') return `Thank you very much.`;
      if (intentId === 'option_2') return `Thank you for your help.`;
      if (intentId === 'option_3') return `You are very kind, thank you.`;
      return `I appreciate your help.`;
    }
    if (id === 'hello') {
      if (intentId === 'option_1') return `Hello, nice to see you.`;
      if (intentId === 'option_2') return `Good morning.`;
      if (intentId === 'option_3') return `Hi there!`;
      return `Hello, how are you?`;
    }
    if (id === 'more_card') {
      if (intentId === 'option_1') return `More, please.`;
      if (intentId === 'option_2') return `May I have some more?`;
      if (intentId === 'option_3') return `I would like more of this.`;
      return `A little bit more, please.`;
    }
    if (id === 'stop_card') {
      if (intentId === 'option_1') return `Please stop.`;
      if (intentId === 'option_2') return `I want to stop now.`;
      if (intentId === 'option_3') return `Stop this right now.`;
      return `Please do not do that.`;
    }
    if (id === 'maybe') {
      if (intentId === 'option_1') return `Maybe later.`;
      if (intentId === 'option_2') return `I am not sure yet.`;
      if (intentId === 'option_3') return `Perhaps, let me think.`;
      return `Maybe, give me a moment.`;
    }
    if (id === 'dont_know') {
      if (intentId === 'option_1') return `I do not know.`;
      if (intentId === 'option_2') return `I am not sure.`;
      if (intentId === 'option_3') return `Could you please explain?`;
      return `I need more information.`;
    }
    return `Yes, please.`;
  }

  // 4. PLACES
  if (type === 'place') {
    const prepPlace = english.singular === 'home' || english.singular === 'school' || english.singular === 'work' || english.singular === 'college'
      ? english.singular
      : `the ${english.singular}`;

    switch (intentId) {
      case 'want_go_to':
        if (isChild) return `I want to go to ${prepPlace}.`;
        if (isAdult || tone === 'polite') return `I would like to go to ${prepPlace}, please.`;
        return `I want to go to ${prepPlace}.`;

      case 'can_we_go':
        return `Can we go to ${prepPlace}?`;

      case 'at_place':
        return `I am at ${prepPlace}.`;

      case 'where_is':
        return `Where is ${prepPlace}?`;

      case 'do_not_want_go':
        if (isChild) return `I do not want to go.`;
        return `I do not want to go to ${prepPlace}.`;

      default:
        return `I want to go to ${prepPlace}.`;
    }
  }

  // 5. PEOPLE
  if (type === 'person') {
    const personName = id === 'friend' ? 'my friend' : id === 'doctor' ? 'the doctor' : english.singular;

    switch (intentId) {
      case 'want_see':
        if (isAdult || tone === 'polite') return `I would like to see ${personName}, please.`;
        return `I want to see ${personName}.`;

      case 'where_is':
        return `Where is ${personName}?`;

      case 'call_person':
        return `Please call ${personName}.`;

      case 'miss_person':
        return `I miss ${personName}.`;

      case 'come_here':
        return `Please come here, ${personName}.`;

      default:
        return `I want to see ${personName}.`;
    }
  }

  // 6. ACTIONS
  if (type === 'action') {
    const baseAction = english.verbForms?.base || english.singular;

    switch (intentId) {
      case 'want_to':
        if (isAdult || tone === 'polite') return `I would like to ${baseAction}, please.`;
        return `I want to ${baseAction}.`;

      case 'need_help_to':
        return `I need help to ${baseAction}.`;

      case 'cannot':
        return `I cannot ${baseAction} right now.`;

      case 'can_we_do_now':
        return `Can we ${baseAction} now?`;

      case 'finished':
        return `I am finished with this.`;

      default:
        return `I want to ${baseAction}.`;
    }
  }

  // 7. SYMPTOMS & BODY PARTS
  if (type === 'body_part' || type === 'symptom') {
    switch (intentId) {
      case 'hurts':
        if (type === 'body_part') return `My ${english.singular} hurts.`;
        if (id === 'fever') return `I have a fever.`;
        return `I am having ${english.singular}.`;

      case 'feels_bad':
        return `This feels very uncomfortable.`;

      case 'need_doctor':
        return `I need to see a doctor immediately.`;

      default:
        return `I am feeling sick.`;
    }
  }

  // 8. OBJECTS, SCHOOL ITEMS, TOYS
  if (type === 'object' || type === 'school_item' || type === 'toy' || type === 'clothing') {
    switch (intentId) {
      case 'want':
        if (isAdult || tone === 'polite') return `I would like ${articleNoun}, please.`;
        return `I want ${articleNoun}.`;

      case 'give_me':
        return `Please give me ${articleNoun}.`;

      case 'where_is':
        return `Where is my ${english.singular}?`;

      case 'need':
        return `I need my ${english.singular}.`;

      case 'do_not_want':
        return `I do not want this ${english.singular}.`;

      case 'lost':
        return `I lost my ${english.singular}.`;

      default:
        return `I want ${articleNoun}.`;
    }
  }

  // 9. VEHICLES
  if (type === 'vehicle') {
    switch (intentId) {
      case 'take_vehicle':
        return `I want to take the ${english.singular}.`;

      case 'is_coming':
        return `Is the ${english.singular} coming?`;

      case 'where_is':
        return `Where is the ${english.singular}?`;

      default:
        return `I want to take the ${english.singular}.`;
    }
  }

  return `I want ${articleNoun}.`;
}

// -------------------------------------------------------------
// KANNADA RENDERER (Standard Spoken Kannada in Karnataka)
// -------------------------------------------------------------
function renderKannada(
  entry: LexiconEntry,
  intentId: string,
  ageGroup: UserAgeGroup,
  tone: SentenceTone
): string {
  const { type, kannada, id } = entry;
  const isAdult = ageGroup === 'adult';

  // 1. FOOD & DRINK
  if (type === 'food' || type === 'drink') {
    switch (intentId) {
      case 'want':
        if (isAdult || tone === 'polite') return `ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ${kannada.base} ಕೊಡುತ್ತೀರಾ?`;
        return `ನನಗೆ ${kannada.base} ಬೇಕು.`;

      case 'would_like':
        return `ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ${kannada.base} ಕೊಡಿ.`;

      case 'can_have':
        return `ನನಗೆ ಸ್ವಲ್ಪ ${kannada.base} ಸಿಗಬಹುದೇ?`;

      case 'hungry_thirsty':
        if (type === 'drink') {
          return isAdult
            ? `ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ${kannada.base} ನೀಡಬಹುದೇ?`
            : `ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ. ನನಗೆ ${kannada.base} ಬೇಕು.`;
        }
        return isAdult
          ? `ನನಗೆ ಹಸಿವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ${kannada.base} ನೀಡಬಹುದೇ?`
          : `ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ${kannada.base} ಬೇಕು.`;

      case 'like':
        if (isAdult) return `ನನಗೆ ${kannada.base} ತುಂಬಾ ಇಷ್ಟವಾಗುತ್ತದೆ.`;
        return `ನನಗೆ ${kannada.base} ಇಷ್ಟ.`;

      case 'dislike':
        if (isAdult) return `ನನಗೆ ${kannada.base} ಇಷ್ಟವಾಗುವುದಿಲ್ಲ.`;
        return `ನನಗೆ ${kannada.base} ಇಷ್ಟವಿಲ್ಲ.`;

      case 'do_not_want':
        if (isAdult) return `ಧನ್ಯವಾದಗಳು, ನನಗೆ ${kannada.base} ಬೇಡ.`;
        return `ನನಗೆ ${kannada.base} ಬೇಡ.`;

      case 'more':
        return `ದಯವಿಟ್ಟು ಇನ್ನೂ ಸ್ವಲ್ಪ ${kannada.base} ಕೊಡಿ.`;

      case 'finished':
        return `${kannada.base} ಮುಗಿಯಿತು.`;

      case 'where_is':
        return `${kannada.base} ಎಲ್ಲಿದೆ?`;

      case 'hot_cold':
        return `ಇದು ಬಿಸಿಯಾಗಿದೆಯೋ ಅಥವಾ ತಣ್ಣಗಿದೆಯೋ?`;

      default:
        return `ನನಗೆ ${kannada.base} ಬೇಕು.`;
    }
  }

  // 2. FEELINGS
  if (type === 'feeling') {
    switch (intentId) {
      case 'feel':
        if (id === 'happy') {
          if (isAdult) return `ನನಗೆ ಇಂದು ತುಂಬಾ ಸಂತೋಷವಾಗುತ್ತಿದೆ.`;
          return `ನಾನು ಖುಷಿಯಾಗಿದ್ದೇನೆ.`;
        }
        if (id === 'calm') return `ನಾನು ಶಾಂತವಾಗಿದ್ದೇನೆ.`;
        if (id === 'sad') return `ನನಗೆ ದುಃಖವಾಗುತ್ತಿದೆ.`;
        if (id === 'angry') return `ನನಗೆ ಕೋಪ ಬರುತ್ತಿದೆ.`;
        if (id === 'scared') return `ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ.`;
        if (id === 'tired') return `ನನಗೆ ತುಂಬಾ ದಣಿವಾಗಿದೆ.`;
        return `ನನಗೆ ${kannada.base} ಅನ್ನಿಸುತ್ತಿದೆ.`;

      case 'do_not_feel':
        return `ನನಗೆ ${kannada.base} ಅನ್ನಿಸುತ್ತಿಲ್ಲ.`;

      case 'felt_earlier':
        return `ನನಗೆ ಮೊದಲು ಹೀಗೆ ಅನ್ನಿಸಿತು.`;

      case 'tell_why':
        if (ageGroup === 'child') return `ನನಗೆ ಏಕೆ ಅನ್ನಿಸಿತು ಹೇಳುವೆ.`;
        return `ನನಗೆ ಹೀಗೇಕೆ ಅನ್ನಿಸುತ್ತಿದೆ ಎಂದು ಹೇಳಲು ಬಯಸುತ್ತೇನೆ.`;

      case 'help_feel_better':
        return `ದಯವಿಟ್ಟು ನನಗೆ ಸಮಾಧಾನ ಮಾಡಿ.`;

      default:
        return `ನಾನು ${kannada.base}ಯಾಗಿದ್ದೇನೆ.`;
    }
  }

  // 3. RESPONSES
  if (type === 'response') {
    if (id === 'yes_card') {
      if (intentId === 'option_1') return `ಹೌದು, ದಯವಿಟ್ಟು.`;
      if (intentId === 'option_2') return `ಹೌದು, ಅದು ಸರಿ.`;
      if (intentId === 'option_3') return `ಹೌದು, ನನಗೆ ಅರ್ಥವಾಯಿತು.`;
      return `ಹೌದು, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.`;
    }
    if (id === 'no_card') {
      if (intentId === 'option_1') return `ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.`;
      if (intentId === 'option_2') return `ಇಲ್ಲ, ಅದು ಸರಿಯಲ್ಲ.`;
      if (intentId === 'option_3') return `ಇಲ್ಲ, ನನಗೆ ಅದು ಬೇಡ.`;
      return `ಇಲ್ಲ, ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ.`;
    }
    if (id === 'please') {
      if (intentId === 'option_1') return `ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.`;
      if (intentId === 'option_2') return `ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ಕಾಯಿರಿ.`;
      if (intentId === 'option_3') return `ದಯವಿಟ್ಟು ಇದನ್ನು ಕೊಡಿ.`;
      return `ದಯವಿಟ್ಟು ಒಂದು ಕ್ಷಣ ನಿಲ್ಲಿ.`;
    }
    if (id === 'thank_you') {
      if (intentId === 'option_1') return `ತುಂಬಾ ಧನ್ಯವಾದಗಳು.`;
      if (intentId === 'option_2') return `ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.`;
      if (intentId === 'option_3') return `ತುಂಬಾ ಉಪಕಾರವಾಯಿತು, ಧನ್ಯವಾದಗಳು.`;
      return `ನಿಮ್ಮ ಪ್ರೀತಿಗೆ ಧನ್ಯವಾದಗಳು.`;
    }
    if (id === 'hello') {
      if (intentId === 'option_1') return `ನಮಸ್ಕಾರ, ನಿಮ್ಮನ್ನು ನೋಡಿ ಸಂತೋಷವಾಯಿತು.`;
      if (intentId === 'option_2') return `ಶುಭೋದಯ.`;
      if (intentId === 'option_3') return `ನಮಸ್ತೆ!`;
      return `ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಾ?`;
    }
    if (id === 'more_card') {
      if (intentId === 'option_1') return `ಇನ್ನಷ್ಟು, ದಯವಿಟ್ಟು.`;
      if (intentId === 'option_2') return `ಇನ್ನೂ ಸ್ವಲ್ಪ ಕೊಡುತ್ತೀರಾ?`;
      if (intentId === 'option_3') return `ನನಗೆ ಇನ್ನಷ್ಟು ಬೇಕು.`;
      return `ಸ್ವಲ್ಪ ಹೆಚ್ಚು ಕೊಡಿ.`;
    }
    if (id === 'stop_card') {
      if (intentId === 'option_1') return `ದಯವಿಟ್ಟು ನಿಲ್ಲಿಸಿ.`;
      if (intentId === 'option_2') return `ನಾನು ಈಗ ನಿಲ್ಲಿಸಲು ಬಯಸುತ್ತೇನೆ.`;
      if (intentId === 'option_3') return `ಇದನ್ನು ಈಗಲೇ ನಿಲ್ಲಿಸಿ.`;
      return `ದಯವಿಟ್ಟು ಹಾಗೆ ಮಾಡಬೇಡಿ.`;
    }
    if (id === 'maybe') {
      if (intentId === 'option_1') return `ಬಹುಶಃ ಆಮೇಲೆ.`;
      if (intentId === 'option_2') return `ನನಗೆ ಇನ್ನೂ ಖಚಿತವಿಲ್ಲ.`;
      if (intentId === 'option_3') return `ಬಹುಶಃ, ಯೋಚಿಸಲು ಸಮಯ ಕೊಡಿ.`;
      return `ನೋಡೋಣ, ಸ್ವಲ್ಪ ಸಮಯ ಬೇಕು.`;
    }
    if (id === 'dont_know') {
      if (intentId === 'option_1') return `ನನಗೆ ಗೊತ್ತಿಲ್ಲ.`;
      if (intentId === 'option_2') return `ನನಗೆ ಇದರ ಬಗ್ಗೆ ತಿಳಿದಿಲ್ಲ.`;
      if (intentId === 'option_3') return `ದಯವಿಟ್ಟು ವಿವರಿಸುವಿರಾ?`;
      return `ನನಗೆ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಬೇಕು.`;
    }
    return `ಹೌದು, ದಯವಿಟ್ಟು.`;
  }

  // 4. PLACES
  if (type === 'place') {
    switch (intentId) {
      case 'want_go_to':
        if (isAdult || tone === 'polite') return `ನಾನು ${kannada.dative} ಹೋಗಲು ಬಯಸುತ್ತೇನೆ.`;
        return `ನಾನು ${kannada.dative} ಹೋಗಬೇಕು.`;

      case 'can_we_go':
        return `ನಾವು ${kannada.dative} ಹೋಗಬಹುದೇ?`;

      case 'at_place':
        return `ನಾನು ${kannada.locative} ಇದ್ದೇನೆ.`;

      case 'where_is':
        return `${kannada.base} ಎಲ್ಲಿದೆ?`;

      case 'do_not_want_go':
        return `ನನಗೆ ${kannada.dative} ಹೋಗಲು ಇಷ್ಟವಿಲ್ಲ.`;

      default:
        return `ನಾನು ${kannada.dative} ಹೋಗಬೇಕು.`;
    }
  }

  // 5. PEOPLE
  if (type === 'person') {
    switch (intentId) {
      case 'want_see':
        if (isAdult || tone === 'polite') return `ನಾನು ${kannada.accusative} ಮಾತನಾಡಿಸಲು ಬಯಸುತ್ತೇನೆ.`;
        return `ನಾನು ${kannada.accusative} ನೋಡಬೇಕು.`;

      case 'where_is':
        return `${kannada.base} ಎಲ್ಲಿದ್ದಾರೆ?`;

      case 'call_person':
        return `ದಯವಿಟ್ಟು ${kannada.dative} ಕರೆ ಮಾಡಿ.`;

      case 'miss_person':
        return `ನನಗೆ ${kannada.base} ನೆನಪಾಗುತ್ತಿದೆ.`;

      case 'come_here':
        return `ದಯವಿಟ್ಟು ಇಲ್ಲಿ ಬನ್ನಿ.`;

      default:
        return `ನಾನು ${kannada.accusative} ನೋಡಬೇಕು.`;
    }
  }

  // 6. ACTIONS
  if (type === 'action') {
    switch (intentId) {
      case 'want_to':
        return `ನಾನು ${kannada.base} ಬಯಸುತ್ತೇನೆ.`;

      case 'need_help_to':
        return `ನನಗೆ ${kannada.dative} ಸಹಾಯ ಬೇಕು.`;

      case 'cannot':
        return `ನನಗೆ ಈಗ ${kannada.base} ಆಗುತ್ತಿಲ್ಲ.`;

      case 'can_we_do_now':
        return `ನಾವು ಈಗ ${kannada.base} ಮಾಡಬಹುದೇ?`;

      case 'finished':
        return `${kannada.base} ಮುಗಿಯಿತು.`;

      default:
        return `ನಾನು ${kannada.base} ಬಯಸುತ್ತೇನೆ.`;
    }
  }

  // 7. SYMPTOMS & BODY PARTS
  if (type === 'body_part' || type === 'symptom') {
    switch (intentId) {
      case 'hurts':
        return `${kannada.base} ನೋವಾಗುತ್ತಿದೆ.`;

      case 'feels_bad':
        return `ನನಗೆ ತುಂಬಾ ತೊಂದರೆಯಾಗುತ್ತಿದೆ.`;

      case 'need_doctor':
        return `ನನಗೆ ವೈದ್ಯರ ಸಹಾಯ ಬೇಕಾಗಿದೆ.`;

      default:
        return `ನನಗೆ ಹುಷಾರಿಲ್ಲ.`;
    }
  }

  // 8. OBJECTS, ITEMS
  if (type === 'object' || type === 'school_item' || type === 'toy' || type === 'clothing') {
    switch (intentId) {
      case 'want':
        return `ನನಗೆ ${kannada.base} ಬೇಕು.`;

      case 'give_me':
        return `ದಯವಿಟ್ಟು ನನಗೆ ${kannada.accusative} ಕೊಡಿ.`;

      case 'where_is':
        return `${kannada.base} ಎಲ್ಲಿದೆ?`;

      case 'need':
        return `ನನಗೆ ${kannada.base} ಅಗತ್ಯವಿದೆ.`;

      case 'do_not_want':
        return `ನನಗೆ ಈ ${kannada.base} ಬೇಡ.`;

      case 'lost':
        return `ನನ್ನ ${kannada.base} ಕಳೆದುಹೋಗಿದೆ.`;

      default:
        return `ನನಗೆ ${kannada.base} ಬೇಕು.`;
    }
  }

  // 9. VEHICLES
  if (type === 'vehicle') {
    switch (intentId) {
      case 'take_vehicle':
        return `ನಾವು ${kannada.locative} ಹೋಗೋಣ.`;

      case 'is_coming':
        return `${kannada.base} ಬರುತ್ತಿದೆಯೇ?`;

      case 'where_is':
        return `${kannada.base} ಎಲ್ಲಿದೆ?`;

      default:
        return `ನಾವು ${kannada.locative} ಹೋಗೋಣ.`;
    }
  }

  return `ನನಗೆ ${kannada.base} ಬೇಕು.`;
}

// -------------------------------------------------------------
// HINDI RENDERER (Conversational Standard Hindi with Gender Agreement)
// -------------------------------------------------------------
function renderHindi(
  entry: LexiconEntry,
  intentId: string,
  ageGroup: UserAgeGroup,
  tone: SentenceTone,
  wording: HindiSpeakerWording
): string {
  const { type, hindi, id } = entry;
  const isAdult = ageGroup === 'adult';

  // 1. FOOD & DRINK
  if (type === 'food' || type === 'drink') {
    switch (intentId) {
      case 'want':
        if (isAdult || tone === 'polite') return `कृपया मुझे थोड़ा ${hindi.base} दीजिए।`;
        return `मुझे ${hindi.base} चाहिए।`;

      case 'would_like':
        return `कृपया मुझे थोड़ा ${hindi.base} दीजिए।`;

      case 'can_have':
        return `क्या मुझे थोड़ा ${hindi.base} मिल सकता है?`;

      case 'hungry_thirsty':
        if (type === 'drink') {
          return isAdult
            ? `मुझे प्यास लगी है। क्या मुझे थोड़ा ${hindi.base} मिल सकता है?`
            : `मुझे प्यास लगी है। मुझे ${hindi.base} चाहिए।`;
        }
        return isAdult
          ? `मुझे भूख लगी है। क्या मुझे थोड़ा ${hindi.base} मिल सकता है?`
          : `मुझे भूख लगी है। मुझे ${hindi.base} चाहिए।`;

      case 'like':
        if (isAdult) return `मुझे ${hindi.base} बहुत पसंद है।`;
        return `मुझे ${hindi.base} पसंद है।`;

      case 'dislike':
        return `मुझे ${hindi.base} पसंद नहीं है।`;

      case 'do_not_want':
        if (isAdult) return `धन्यवाद, मुझे ${hindi.base} नहीं चाहिए।`;
        return `मुझे ${hindi.base} नहीं चाहिए।`;

      case 'more':
        return `कृपया थोड़ा और ${hindi.base} दीजिए।`;

      case 'finished':
        return `${hindi.base} खत्म हो गया।`;

      case 'where_is':
        return `${hindi.base} कहाँ है?`;

      case 'hot_cold':
        return `यह गरम है या ठंडा?`;

      default:
        return `मुझे ${hindi.base} चाहिए।`;
    }
  }

  // 2. FEELINGS
  if (type === 'feeling') {
    switch (intentId) {
      case 'feel':
        if (id === 'happy') {
          return `मैं खुश हूँ।`;
        }
        if (id === 'calm') return `मैं शांत हूँ।`;
        if (id === 'sad') return `मैं उदास हूँ।`;
        if (id === 'angry') return `मुझे गुस्सा आ रहा है।`;
        if (id === 'scared') return `मुझे डर लग रहा है।`;
        if (id === 'tired') {
          if (wording === 'feminine') return `मैं थक गई हूँ।`;
          if (wording === 'masculine') return `मैं थक गया हूँ।`;
          return `मुझे थकान हो रही है।`;
        }
        return `मुझे ${hindi.base} महसूस हो रहा है।`;

      case 'do_not_feel':
        if (wording === 'feminine') return `मैं ${hindi.base} महसूस नहीं कर रही हूँ।`;
        if (wording === 'masculine') return `मैं ${hindi.base} महसूस नहीं कर रहा हूँ।`;
        return `मुझे ${hindi.base} महसूस नहीं हो रहा है।`;

      case 'felt_earlier':
        return `मुझे पहले ऐसा लगा था।`;

      case 'tell_why':
        if (ageGroup === 'child') {
          return wording === 'feminine' ? `मैं बताना चाहती हूँ।` : `मैं बताना चाहता हूँ।`;
        }
        if (wording === 'feminine') return `मैं बताना चाहती हूँ कि मुझे ऐसा क्यों लग रहा है।`;
        if (wording === 'masculine') return `मैं बताना चाहता हूँ कि मुझे ऐसा क्यों लग रहा है।`;
        return `मैं बताना चाहता हूँ कि ऐसा क्यों लग रहा है।`;

      case 'help_feel_better':
        return `कृपया मेरी मदद करें।`;

      default:
        return `मैं ${hindi.base} हूँ।`;
    }
  }

  // 3. RESPONSES
  if (type === 'response') {
    if (id === 'yes_card') {
      if (intentId === 'option_1') return `हाँ, कृपया।`;
      if (intentId === 'option_2') return `हाँ, यह सही है।`;
      if (intentId === 'option_3') return `हाँ, मुझे समझ आ गया।`;
      return `हाँ, मैं सहमत हूँ।`;
    }
    if (id === 'no_card') {
      if (intentId === 'option_1') return `नहीं, धन्यवाद।`;
      if (intentId === 'option_2') return `नहीं, यह सही नहीं है।`;
      if (intentId === 'option_3') return `नहीं, मुझे यह नहीं चाहिए।`;
      return `नहीं, मुझे समझ नहीं आया।`;
    }
    if (id === 'please') {
      if (intentId === 'option_1') return `कृपया मेरी मदद करें।`;
      if (intentId === 'option_2') return `कृपया थोड़ा इंतज़ार करें।`;
      if (intentId === 'option_3') return `कृपया मुझे यह दीजिए।`;
      return `कृपया एक क्षण रुकिए।`;
    }
    if (id === 'thank_you') {
      if (intentId === 'option_1') return `बहुत बहुत धन्यवाद।`;
      if (intentId === 'option_2') return `आपकी मदद के लिए धन्यवाद।`;
      if (intentId === 'option_3') return `आप बहुत दयालु हैं, धन्यवाद।`;
      return `मैं आभारी हूँ।`;
    }
    if (id === 'hello') {
      if (intentId === 'option_1') return `नमस्ते, आपसे मिलकर खुशी हुई।`;
      if (intentId === 'option_2') return `सुप्रभात।`;
      if (intentId === 'option_3') return `नमस्ते!`;
      return `नमस्ते, आप कैसे हैं?`;
    }
    if (id === 'more_card') {
      if (intentId === 'option_1') return `और, कृपया।`;
      if (intentId === 'option_2') return `क्या थोड़ा और मिल सकता है?`;
      if (intentId === 'option_3') return `मुझे और चाहिए।`;
      return `थोड़ा और दीजिए।`;
    }
    if (id === 'stop_card') {
      if (intentId === 'option_1') return `कृपया रोकिए।`;
      if (intentId === 'option_2') return `मैं इसे अब रोकना चाहता हूँ।`;
      if (intentId === 'option_3') return `इसे तुरंत रोकें।`;
      return `कृपया ऐसा न करें।`;
    }
    if (id === 'maybe') {
      if (intentId === 'option_1') return `शायद बाद में।`;
      if (intentId === 'option_2') return `मुझे अभी पक्का पता नहीं है।`;
      if (intentId === 'option_3') return `शायद, मुझे सोचने का समय दें।`;
      return `देखते हैं, थोड़ा समय चाहिए।`;
    }
    if (id === 'dont_know') {
      if (intentId === 'option_1') return `मुझे नहीं पता।`;
      if (intentId === 'option_2') return `मुझे इसके बारे में जानकारी नहीं है।`;
      if (intentId === 'option_3') return `क्या आप समझा सकते हैं?`;
      return `मुझे और जानकारी चाहिए।`;
    }
    return `हाँ, कृपया।`;
  }

  // 4. PLACES
  if (type === 'place') {
    switch (intentId) {
      case 'want_go_to':
        if (wording === 'feminine') return `मैं ${hindi.base} जाना चाहती हूँ।`;
        if (wording === 'masculine') return `मैं ${hindi.base} जाना चाहता हूँ।`;
        return `मुझे ${hindi.base} जाना है।`;

      case 'can_we_go':
        return `क्या हम ${hindi.base} जा सकते हैं?`;

      case 'at_place':
        return `मैं ${hindi.base} पर हूँ।`;

      case 'where_is':
        return `${hindi.base} कहाँ है?`;

      case 'do_not_want_go':
        if (wording === 'feminine') return `मैं ${hindi.base} नहीं जाना चाहती।`;
        if (wording === 'masculine') return `मैं ${hindi.base} नहीं जाना चाहता।`;
        return `मुझे ${hindi.base} नहीं जाना है।`;

      default:
        return `मुझे ${hindi.base} जाना है।`;
    }
  }

  // 5. PEOPLE
  if (type === 'person') {
    switch (intentId) {
      case 'want_see':
        return `मुझे ${hindi.base} से मिलना है।`;

      case 'where_is':
        return `${hindi.base} कहाँ हैं?`;

      case 'call_person':
        return `कृपया ${hindi.base} को कॉल करें।`;

      case 'miss_person':
        return `मुझे ${hindi.base} की याद आ रही है।`;

      case 'come_here':
        return `कृपया यहाँ आइए।`;

      default:
        return `मुझे ${hindi.base} से मिलना है।`;
    }
  }

  // 6. ACTIONS
  if (type === 'action') {
    switch (intentId) {
      case 'want_to':
        if (wording === 'feminine') return `मैं ${hindi.base} चाहती हूँ।`;
        if (wording === 'masculine') return `मैं ${hindi.base} चाहता हूँ।`;
        return `मुझे ${hindi.base} है।`;

      case 'need_help_to':
        return `मुझे ${hindi.base} में मदद चाहिए।`;

      case 'cannot':
        return `मुझसे अभी यह नहीं हो रहा है।`;

      case 'can_we_do_now':
        return `क्या हम यह अभी कर सकते हैं?`;

      case 'finished':
        return `यह खत्म हो गया है।`;

      default:
        return `मुझे ${hindi.base} है।`;
    }
  }

  // 7. SYMPTOMS & BODY PARTS
  if (type === 'body_part' || type === 'symptom') {
    switch (intentId) {
      case 'hurts':
        if (type === 'body_part') return `मेरे ${hindi.base} में दर्द हो रहा है।`;
        if (id === 'fever') return `मुझे बुखार है।`;
        return `मुझे ${hindi.base} हो रहा है।`;

      case 'feels_bad':
        return `मुझे बहुत तकलीफ हो रही है।`;

      case 'need_doctor':
        return `मुझे डॉक्टर को दिखाना है।`;

      default:
        return `मेरी तबीयत ठीक नहीं है।`;
    }
  }

  // 8. OBJECTS, ITEMS
  if (type === 'object' || type === 'school_item' || type === 'toy' || type === 'clothing') {
    switch (intentId) {
      case 'want':
        return `मुझे ${hindi.base} चाहिए।`;

      case 'give_me':
        return `कृपया मुझे ${hindi.base} दीजिए।`;

      case 'where_is':
        return `मेरी ${hindi.base} कहाँ है?`;

      case 'need':
        return `मुझे ${hindi.base} की ज़रूरत है।`;

      case 'do_not_want':
        return `मुझे यह ${hindi.base} नहीं चाहिए।`;

      case 'lost':
        return `मेरी ${hindi.base} खो गई है।`;

      default:
        return `मुझे ${hindi.base} चाहिए।`;
    }
  }

  // 9. VEHICLES
  if (type === 'vehicle') {
    switch (intentId) {
      case 'take_vehicle':
        return `हम ${hindi.base} से चलेंगे।`;

      case 'is_coming':
        return `क्या ${hindi.base} आ रही है?`;

      case 'where_is':
        return `${hindi.base} कहाँ है?`;

      default:
        return `हम ${hindi.base} से चलेंगे।`;
    }
  }

  return `मुझे ${hindi.base} चाहिए।`;
}
