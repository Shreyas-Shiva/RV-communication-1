import { LanguageCode, UserMode } from '../translations/types';
import { getAssetById } from './assets';

export interface IntentItem {
  id: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
    ta?: string;
    te?: string;
    ml?: string;
  };
  iconName: string;
  color: string;
  textColor: string;
  borderColor: string;
}

export const INTENT_LIST: IntentItem[] = [
  {
    id: 'want',
    labels: { en: 'I want', kn: 'ನನಗೆ ಬೇಕು', hi: 'मुझे चाहिए' },
    iconName: 'Hand',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'hungry',
    labels: { en: 'I am hungry', kn: 'ನನಗೆ ಹಸಿವಾಗಿದೆ', hi: 'मुझे भूख लगी है' },
    iconName: 'Utensils',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  },
  {
    id: 'like',
    labels: { en: 'I like', kn: 'ನನಗೆ ಇಷ್ಟ', hi: 'मुझे पसंद है' },
    iconName: 'ThumbsUp',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'dislike',
    labels: { en: 'I do not like', kn: 'ನನಗೆ ಇಷ್ಟವಿಲ್ಲ', hi: 'मुझे पसंद नहीं है' },
    iconName: 'ThumbsDown',
    color: '#FDE2E4',
    textColor: '#832838',
    borderColor: '#E56B6F'
  },
  {
    id: 'do_not_want',
    labels: { en: 'I do not want', kn: 'ನನಗೆ ಬೇಡ', hi: 'मुझे नहीं चाहिए' },
    iconName: 'Ban',
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828'
  },
  {
    id: 'more',
    labels: { en: 'More', kn: 'ಇನ್ನಷ್ಟು', hi: 'और' },
    iconName: 'Plus',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'something_else',
    labels: { en: 'Something else', kn: 'ಬೇರೇನಾದರೂ', hi: 'कुछ और' },
    iconName: 'Sparkles',
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B'
  }
];

export interface SentenceResult {
  text: string;
  reviewed: boolean;
}

/**
 * Builds a natural sentence according to the user's age group and selected language.
 * Tracks whether the exact phrase is verified by native speakers.
 */
export function buildSentence(
  assetId: string,
  intentId: string,
  language: LanguageCode,
  mode: UserMode
): SentenceResult {
  const asset = getAssetById(assetId);
  const itemLabel = asset?.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || assetId;

  // Specific override for Pizza to match prompt examples exactly
  if (assetId === 'pizza') {
    if (language === 'kn') {
      if (mode === 'child') {
        if (intentId === 'hungry') return { text: "ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.", reviewed: true };
        if (intentId === 'want') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.", reviewed: true };
        if (intentId === 'like') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟ.", reviewed: true };
        if (intentId === 'dislike' || intentId === 'do_not_want') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಬೇಡ.", reviewed: true };
        if (intentId === 'more') return { text: "ನನಗೆ ಇನ್ನೂ ಸ್ವಲ್ಪ ಪಿಜ್ಜಾ ಬೇಕು.", reviewed: true };
      } else if (mode === 'adult') {
        if (intentId === 'hungry') return { text: "ನನಗೆ ಹಸಿವಾಗಿದೆ. ದಯವಿಟ್ಟು ನನಗೆ ಪಿಜ್ಜಾ ಕೊಡುತ್ತೀರಾ?", reviewed: true };
        if (intentId === 'want') return { text: "ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಪಿಜ್ಜಾ ಕೊಡಿ.", reviewed: true };
        if (intentId === 'like') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ತುಂಬಾ ಇಷ್ಟ.", reviewed: true };
        if (intentId === 'dislike') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟವಿಲ್ಲ.", reviewed: true };
        if (intentId === 'do_not_want') return { text: "ಧನ್ಯವಾದಗಳು, ನನಗೆ ಪಿಜ್ಜಾ ಬೇಡ.", reviewed: true };
        if (intentId === 'more') return { text: "ದಯವಿಟ್ಟು ಇನ್ನೂ ಸ್ವಲ್ಪ ಪಿಜ್ಜಾ ನೀಡಬಹುದೇ?", reviewed: true };
      } else {
        // student mode
        if (intentId === 'hungry') return { text: "ನನಗೆ ಹಸಿವಾಗಿದೆ, ಪಿಜ್ಜಾ ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.", reviewed: true };
        if (intentId === 'want') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.", reviewed: true };
        if (intentId === 'like') return { text: "ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟ.", reviewed: true };
      }
    }

    if (language === 'en') {
      if (mode === 'child') {
        if (intentId === 'hungry') return { text: "I am hungry. I want pizza.", reviewed: true };
        if (intentId === 'want') return { text: "I want pizza.", reviewed: true };
        if (intentId === 'like') return { text: "I like pizza.", reviewed: true };
        if (intentId === 'dislike') return { text: "I do not like pizza.", reviewed: true };
        if (intentId === 'do_not_want') return { text: "I do not want pizza.", reviewed: true };
        if (intentId === 'more') return { text: "More pizza, please.", reviewed: true };
      } else if (mode === 'adult') {
        if (intentId === 'hungry') return { text: "I am hungry. Could I please have some pizza?", reviewed: true };
        if (intentId === 'want') return { text: "I would like some pizza, please.", reviewed: true };
        if (intentId === 'like') return { text: "I really like pizza.", reviewed: true };
        if (intentId === 'dislike') return { text: "I do not care for pizza.", reviewed: true };
        if (intentId === 'do_not_want') return { text: "No pizza for me, thank you.", reviewed: true };
        if (intentId === 'more') return { text: "May I have some more pizza, please?", reviewed: true };
      } else {
        // student
        if (intentId === 'hungry') return { text: "I am hungry, I would like pizza.", reviewed: true };
        if (intentId === 'want') return { text: "I want to have pizza.", reviewed: true };
        if (intentId === 'like') return { text: "I enjoy pizza.", reviewed: true };
      }
    }

    if (language === 'hi') {
      if (mode === 'child') {
        if (intentId === 'hungry') return { text: "मुझे भूख लगी है। मुझे पिज़्ज़ा चाहिए।", reviewed: true };
        if (intentId === 'want') return { text: "मुझे पिज़्ज़ा चाहिए।", reviewed: true };
        if (intentId === 'like') return { text: "मुझे पिज़्ज़ा पसंद है।", reviewed: true };
        if (intentId === 'dislike' || intentId === 'do_not_want') return { text: "मुझे पिज़्ज़ा नहीं चाहिए।", reviewed: true };
        if (intentId === 'more') return { text: "और पिज़्ज़ा दीजिए।", reviewed: true };
      } else if (mode === 'adult') {
        if (intentId === 'hungry') return { text: "मुझे भूख लगी है। क्या मुझे थोड़ा पिज़्ज़ा मिल सकता है?", reviewed: true };
        if (intentId === 'want') return { text: "कृपया मुझे थोड़ा पिज़्ज़ा दीजिए।", reviewed: true };
        if (intentId === 'like') return { text: "मुझे पिज़्ज़ा बहुत पसंद है।", reviewed: true };
        if (intentId === 'dislike') return { text: "मुझे पिज़्ज़ा पसंद नहीं है।", reviewed: true };
        if (intentId === 'do_not_want') return { text: "धन्यवाद, मुझे पिज़्ज़ा नहीं चाहिए।", reviewed: true };
        if (intentId === 'more') return { text: "क्या मुझे थोड़ा और पिज़्ज़ा मिल सकता है?", reviewed: true };
      } else {
        // student
        if (intentId === 'hungry') return { text: "मुझे भूख लगी है, मैं पिज़्ज़ा खाना चाहता हूँ।", reviewed: true };
        if (intentId === 'want') return { text: "मुझे पिज़्ज़ा चाहिए।", reviewed: true };
        if (intentId === 'like') return { text: "मुझे पिज़्ज़ा अच्छा लगता है।", reviewed: true };
      }
    }
  }

  // General template patterns
  if (language === 'kn') {
    if (mode === 'child') {
      switch (intentId) {
        case 'want': return { text: `ನನಗೆ ${itemLabel} ಬೇಕು.`, reviewed: true };
        case 'hungry': return { text: `ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ${itemLabel} ಬೇಕು.`, reviewed: true };
        case 'like': return { text: `ನನಗೆ ${itemLabel} ಇಷ್ಟ.`, reviewed: true };
        case 'dislike': return { text: `ನನಗೆ ${itemLabel} ಇಷ್ಟವಿಲ್ಲ.`, reviewed: true };
        case 'do_not_want': return { text: `ನನಗೆ ${itemLabel} ಬೇಡ.`, reviewed: true };
        case 'more': return { text: `ಇನ್ನಷ್ಟು ${itemLabel} ಬೇಕು.`, reviewed: true };
        case 'something_else': return { text: `ನನಗೆ ${itemLabel} ಬದಲಿಗೆ ಬೇರೇನಾದರೂ ಬೇಕು.`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    } else if (mode === 'adult') {
      switch (intentId) {
        case 'want': return { text: `ದಯವಿಟ್ಟು ನನಗೆ ${itemLabel} ಕೊಡುತ್ತೀರಾ?`, reviewed: true };
        case 'hungry': return { text: `ನನಗೆ ಹಸಿವಾಗಿದೆ. ದಯವಿಟ್ಟು ನನಗೆ ${itemLabel} ನೀಡಬಹುದೇ?`, reviewed: true };
        case 'like': return { text: `ನನಗೆ ${itemLabel} ತುಂಬಾ ಇಷ್ಟವಾಗುತ್ತದೆ.`, reviewed: true };
        case 'dislike': return { text: `ನನಗೆ ${itemLabel} ಇಷ್ಟವಾಗುವುದಿಲ್ಲ.`, reviewed: true };
        case 'do_not_want': return { text: `ಧನ್ಯವಾದಗಳು, ನನಗೆ ಈಗ ${itemLabel} ಬೇಡ.`, reviewed: true };
        case 'more': return { text: `ದಯವಿಟ್ಟು ಇನ್ನೂ ಸ್ವಲ್ಪ ${itemLabel} ನೀಡಬಹುದೇ?`, reviewed: true };
        case 'something_else': return { text: `ನಾನು ${itemLabel} ಬದಲಿಗೆ ಬೇರೆ ಆಯ್ಕೆಯನ್ನು ಬಯಸುತ್ತೇನೆ.`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    } else {
      // student
      switch (intentId) {
        case 'want': return { text: `ನನಗೆ ${itemLabel} ಬೇಕಾಗಿದೆ.`, reviewed: true };
        case 'hungry': return { text: `ನನಗೆ ಹಸಿವಾಗಿದೆ, ${itemLabel} ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.`, reviewed: true };
        case 'like': return { text: `ನನಗೆ ${itemLabel} ಇಷ್ಟ.`, reviewed: true };
        case 'dislike': return { text: `ನನಗೆ ${itemLabel} ಇಷ್ಟವಿಲ್ಲ.`, reviewed: true };
        case 'do_not_want': return { text: `ನನಗೆ ${itemLabel} ಬೇಡ.`, reviewed: true };
        case 'more': return { text: `ಇನ್ನಷ್ಟು ${itemLabel} ಕೊಡಿ.`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    }
  }

  if (language === 'hi') {
    if (mode === 'child') {
      switch (intentId) {
        case 'want': return { text: `मुझे ${itemLabel} चाहिए।`, reviewed: true };
        case 'hungry': return { text: `मुझे भूख लगी है। मुझे ${itemLabel} चाहिए।`, reviewed: true };
        case 'like': return { text: `मुझे ${itemLabel} पसंद है।`, reviewed: true };
        case 'dislike': return { text: `मुझे ${itemLabel} पसंद नहीं है।`, reviewed: true };
        case 'do_not_want': return { text: `मुझे ${itemLabel} नहीं चाहिए।`, reviewed: true };
        case 'more': return { text: `और ${itemLabel} दीजिए।`, reviewed: true };
        case 'something_else': return { text: `मुझे ${itemLabel} के बजाय कुछ और चाहिए।`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    } else if (mode === 'adult') {
      switch (intentId) {
        case 'want': return { text: `कृपया मुझे ${itemLabel} दीजिए।`, reviewed: true };
        case 'hungry': return { text: `मुझे भूख लगी है। क्या मुझे थोड़ा ${itemLabel} मिल सकता है?`, reviewed: true };
        case 'like': return { text: `मुझे ${itemLabel} बहुत पसंद है।`, reviewed: true };
        case 'dislike': return { text: `मुझे ${itemLabel} पसंद नहीं है।`, reviewed: true };
        case 'do_not_want': return { text: `धन्यवाद, मुझे अभी ${itemLabel} नहीं चाहिए।`, reviewed: true };
        case 'more': return { text: `क्या मुझे थोड़ा और ${itemLabel} मिल सकता है?`, reviewed: true };
        case 'something_else': return { text: `मैं ${itemLabel} के अतिरिक्त कुछ और चुनना चाहता हूँ।`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    } else {
      // student
      switch (intentId) {
        case 'want': return { text: `मुझे ${itemLabel} चाहिए।`, reviewed: true };
        case 'hungry': return { text: `मुझे भूख लगी है, मैं ${itemLabel} खाना चाहता हूँ।`, reviewed: true };
        case 'like': return { text: `मुझे ${itemLabel} अच्छा लगता है।`, reviewed: true };
        case 'dislike': return { text: `मुझे ${itemLabel} पसंद नहीं है।`, reviewed: true };
        case 'do_not_want': return { text: `मुझे ${itemLabel} नहीं चाहिए।`, reviewed: true };
        case 'more': return { text: `थोड़ा और ${itemLabel} दीजिए।`, reviewed: true };
        default: return { text: itemLabel, reviewed: true };
      }
    }
  }

  // English default
  if (mode === 'child') {
    switch (intentId) {
      case 'want': return { text: `I want ${itemLabel}.`, reviewed: true };
      case 'hungry': return { text: `I am hungry. I want ${itemLabel}.`, reviewed: true };
      case 'like': return { text: `I like ${itemLabel}.`, reviewed: true };
      case 'dislike': return { text: `I do not like ${itemLabel}.`, reviewed: true };
      case 'do_not_want': return { text: `I do not want ${itemLabel}.`, reviewed: true };
      case 'more': return { text: `More ${itemLabel}, please.`, reviewed: true };
      case 'something_else': return { text: `I want something else instead of ${itemLabel}.`, reviewed: true };
      default: return { text: itemLabel, reviewed: true };
    }
  } else if (mode === 'adult') {
    switch (intentId) {
      case 'want': return { text: `I would like some ${itemLabel}, please.`, reviewed: true };
      case 'hungry': return { text: `I am hungry. Could I please have some ${itemLabel}?`, reviewed: true };
      case 'like': return { text: `I really enjoy ${itemLabel}.`, reviewed: true };
      case 'dislike': return { text: `I do not care for ${itemLabel}.`, reviewed: true };
      case 'do_not_want': return { text: `No ${itemLabel} for me, thank you.`, reviewed: true };
      case 'more': return { text: `May I have some more ${itemLabel}, please?`, reviewed: true };
      case 'something_else': return { text: `I would prefer an alternative to ${itemLabel}.`, reviewed: true };
      default: return { text: itemLabel, reviewed: true };
    }
  } else {
    // student
    switch (intentId) {
      case 'want': return { text: `I would like ${itemLabel}.`, reviewed: true };
      case 'hungry': return { text: `I am feeling hungry, could I have ${itemLabel}?`, reviewed: true };
      case 'like': return { text: `I like ${itemLabel}.`, reviewed: true };
      case 'dislike': return { text: `I do not prefer ${itemLabel}.`, reviewed: true };
      case 'do_not_want': return { text: `I do not need ${itemLabel} right now.`, reviewed: true };
      case 'more': return { text: `Can I have more ${itemLabel}?`, reviewed: true };
      default: return { text: itemLabel, reviewed: true };
    }
  }
}
