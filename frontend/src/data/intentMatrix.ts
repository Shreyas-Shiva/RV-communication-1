import { WordType, LexiconEntry } from './lexicon/types';

export interface TypeIntent {
  id: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  iconName: string;
  color: string;
  textColor: string;
  borderColor: string;
  isSensitive?: boolean;
  appliesTo?: (entry: LexiconEntry) => boolean;
}

export const FOOD_DRINK_INTENTS: TypeIntent[] = [
  {
    id: 'want',
    labels: { en: 'I want', kn: 'ನನಗೆ ಬೇಕು', hi: 'मुझे चाहिए' },
    iconName: 'Hand',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'would_like',
    labels: { en: 'I would like', kn: 'ದಯವಿಟ್ಟು ಕೊಡಿ', hi: 'कृपया दीजिए' },
    iconName: 'Sparkles',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'can_have',
    labels: { en: 'Can I have', kn: 'ಕೊಡುತ್ತೀರಾ?', hi: 'क्या मिल सकता है?' },
    iconName: 'HelpCircle',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'hungry_thirsty',
    labels: { en: 'Hungry / Thirsty', kn: 'ಹಸಿವು / ಬಾಯಾರಿಕೆ', hi: 'भूख / प्यास' },
    iconName: 'Utensils',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  },
  {
    id: 'like',
    labels: { en: 'I like', kn: 'ನನಗೆ ಇಷ್ಟ', hi: 'मुझे पसंद है' },
    iconName: 'ThumbsUp',
    color: '#E2EFCB',
    textColor: '#2B5E1E',
    borderColor: '#7EAE49'
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
    id: 'finished',
    labels: { en: 'Finished', kn: 'ಮುಗಿಯಿತು', hi: 'खत्म हो गया' },
    iconName: 'Check',
    color: '#E9ECEF',
    textColor: '#343A40',
    borderColor: '#ADB5BD'
  },
  {
    id: 'where_is',
    labels: { en: 'Where is it?', kn: 'ಎಲ್ಲಿದೆ?', hi: 'कहाँ है?' },
    iconName: 'Search',
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B'
  },
  {
    id: 'hot_cold',
    labels: { en: 'Hot or cold?', kn: 'ಬಿಸಿ / ತಣ್ಣಗೆ', hi: 'गरम / ठंडा' },
    iconName: 'Thermometer',
    color: '#FFF3CD',
    textColor: '#664D03',
    borderColor: '#FFECB5'
  }
];

export const FEELING_INTENTS: TypeIntent[] = [
  {
    id: 'feel',
    labels: { en: 'I feel', kn: 'ನನಗೆ ಅನ್ನಿಸುತ್ತಿದೆ', hi: 'मुझे लग रहा है' },
    iconName: 'Heart',
    color: '#E2F3F3',
    textColor: '#085557',
    borderColor: '#0A6C6E'
  },
  {
    id: 'do_not_feel',
    labels: { en: 'I do not feel', kn: 'ನನಗೆ ಅನ್ನಿಸುತ್ತಿಲ್ಲ', hi: 'मुझे नहीं लग रहा' },
    iconName: 'ShieldAlert',
    color: '#FDE2E4',
    textColor: '#832838',
    borderColor: '#E56B6F'
  },
  {
    id: 'felt_earlier',
    labels: { en: 'Felt earlier', kn: 'ಮೊದಲು ಹೀಗನ್ನಿಸಿತು', hi: 'पहले लगा था' },
    iconName: 'Clock',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  },
  {
    id: 'tell_why',
    labels: { en: 'Tell you why', kn: 'ಏಕೆಂದು ಹೇಳುವೆ', hi: 'वजह बताना चाहता हूँ' },
    iconName: 'MessageSquare',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'help_feel_better',
    labels: { en: 'Help me feel better', kn: 'ಸಮಾಧಾನ ಮಾಡಿ', hi: 'मेरी मदद करें' },
    iconName: 'Smile',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788',
    appliesTo: (entry: LexiconEntry) => ['sad', 'angry', 'scared', 'tired'].includes(entry.id)
  }
];

export const RESPONSE_INTENTS: TypeIntent[] = [
  {
    id: 'option_1',
    labels: { en: 'Say politely', kn: 'ವಿನಯವಾಗಿ ಹೇಳಿ', hi: 'विनम्रता से कहें' },
    iconName: 'Heart',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'option_2',
    labels: { en: 'Confirm clearly', kn: 'ಸ್ಪಷ್ಟವಾಗಿ ದೃಢೀಕರಿಸಿ', hi: 'स्पष्ट कहें' },
    iconName: 'Check',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'option_3',
    labels: { en: 'Full sentence', kn: 'ಪೂರ್ಣ ವಾಕ್ಯ', hi: 'पूरा वाक्य' },
    iconName: 'MessageSquare',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'option_4',
    labels: { en: 'Follow-up', kn: 'ಮುಂದಿನ ಮಾತು', hi: 'आगे की बात' },
    iconName: 'Sparkles',
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B'
  }
];

export const PLACE_INTENTS: TypeIntent[] = [
  {
    id: 'want_go_to',
    labels: { en: 'Want to go', kn: 'ಹೋಗಬೇಕು', hi: 'जाना है' },
    iconName: 'Navigation',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'can_we_go',
    labels: { en: 'Can we go?', kn: 'ಹೋಗಬಹುದೇ?', hi: 'क्या जा सकते हैं?' },
    iconName: 'HelpCircle',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'at_place',
    labels: { en: 'I am here', kn: 'ಇಲ್ಲಿದ್ದೇನೆ', hi: 'यहाँ हूँ' },
    iconName: 'MapPin',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'where_is',
    labels: { en: 'Where is it?', kn: 'ಎಲ್ಲಿದೆ?', hi: 'कहाँ है?' },
    iconName: 'Search',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  },
  {
    id: 'do_not_want_go',
    labels: { en: 'Do not want to go', kn: 'ಹೋಗಲು ಇಷ್ಟವಿಲ್ಲ', hi: 'नहीं जाना है' },
    iconName: 'Ban',
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828'
  }
];

export const PERSON_INTENTS: TypeIntent[] = [
  {
    id: 'want_see',
    labels: { en: 'Want to see', kn: 'ನೋಡಬೇಕು', hi: 'मिलना है' },
    iconName: 'Eye',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'where_is',
    labels: { en: 'Where are they?', kn: 'ಎಲ್ಲಿದ್ದಾರೆ?', hi: 'कहाँ हैं?' },
    iconName: 'Search',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'call_person',
    labels: { en: 'Please call', kn: 'ಕರೆ ಮಾಡಿ', hi: 'कॉल करें' },
    iconName: 'Phone',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'miss_person',
    labels: { en: 'I miss them', kn: 'ನೆನಪಾಗುತ್ತಿದೆ', hi: 'याद आ रही है' },
    iconName: 'Heart',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  },
  {
    id: 'come_here',
    labels: { en: 'Please come here', kn: 'ಇಲ್ಲಿ ಬನ್ನಿ', hi: 'यहाँ आइए' },
    iconName: 'UserCheck',
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B'
  }
];

export const ACTION_INTENTS: TypeIntent[] = [
  {
    id: 'want_to',
    labels: { en: 'I want to', kn: 'ಮಾಡಬೇಕು', hi: 'करना है' },
    iconName: 'Check',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'need_help_to',
    labels: { en: 'Need help to', kn: 'ಸಹಾಯ ಬೇಕು', hi: 'मदद चाहिए' },
    iconName: 'Hand',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'cannot',
    labels: { en: 'I cannot', kn: 'ಆಗುತ್ತಿಲ್ಲ', hi: 'नहीं हो रहा' },
    iconName: 'AlertCircle',
    color: '#FDE2E4',
    textColor: '#832838',
    borderColor: '#E56B6F'
  },
  {
    id: 'can_we_do_now',
    labels: { en: 'Can we do now?', kn: 'ಈಗ ಮಾಡಬಹುದೇ?', hi: 'क्या अब कर सकते हैं?' },
    iconName: 'Clock',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'finished',
    labels: { en: 'Finished', kn: 'ಮುಗಿಯಿತು', hi: 'हो गया' },
    iconName: 'CheckCheck',
    color: '#E9ECEF',
    textColor: '#343A40',
    borderColor: '#ADB5BD'
  }
];

export const SYMPTOM_BODY_INTENTS: TypeIntent[] = [
  {
    id: 'hurts',
    labels: { en: 'It hurts', kn: 'ನೋವಾಗುತ್ತಿದೆ', hi: 'दर्द हो रहा है' },
    iconName: 'AlertTriangle',
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828',
    isSensitive: true
  },
  {
    id: 'feels_bad',
    labels: { en: 'Feels bad', kn: 'ಕೆಟ್ಟದಾಗಿ ಅನ್ನಿಸುತ್ತಿದೆ', hi: 'तकलीफ हो रही है' },
    iconName: 'Activity',
    color: '#FDE2E4',
    textColor: '#832838',
    borderColor: '#E56B6F',
    isSensitive: true
  },
  {
    id: 'need_doctor',
    labels: { en: 'Need a doctor', kn: 'ವೈದ್ಯರು ಬೇಕು', hi: 'डॉक्टर की ज़रूरत है' },
    iconName: 'Stethoscope',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59',
    isSensitive: true
  }
];

export const OBJECT_ITEM_INTENTS: TypeIntent[] = [
  {
    id: 'want',
    labels: { en: 'I want', kn: 'ನನಗೆ ಬೇಕು', hi: 'मुझे चाहिए' },
    iconName: 'Hand',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  },
  {
    id: 'give_me',
    labels: { en: 'Please give me', kn: 'ದಯವಿಟ್ಟು ಕೊಡಿ', hi: 'कृपया दीजिए' },
    iconName: 'Sparkles',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'where_is',
    labels: { en: 'Where is it?', kn: 'ಎಲ್ಲಿದೆ?', hi: 'कहाँ है?' },
    iconName: 'Search',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'need',
    labels: { en: 'I need it', kn: 'ನನಗೆ ಅಗತ್ಯವಿದೆ', hi: 'ज़रूरत है' },
    iconName: 'Check',
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B'
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
    id: 'lost',
    labels: { en: 'I lost it', kn: 'ಕಳೆದುಹೋಗಿದೆ', hi: 'खो गया है' },
    iconName: 'HelpCircle',
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B'
  }
];

export const VEHICLE_INTENTS: TypeIntent[] = [
  {
    id: 'take_vehicle',
    labels: { en: 'Take this', kn: 'ಇದರಲ್ಲಿ ಹೋಗಬೇಕು', hi: 'इसमें जाना है' },
    iconName: 'Navigation',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'is_coming',
    labels: { en: 'Is it coming?', kn: 'ಬರುತ್ತಿದೆಯೇ?', hi: 'क्या आ रही है?' },
    iconName: 'Clock',
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788'
  },
  {
    id: 'where_is',
    labels: { en: 'Where is it?', kn: 'ಎಲ್ಲಿದೆ?', hi: 'कहाँ है?' },
    iconName: 'Search',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  }
];

export const TIME_WEATHER_INTENTS: TypeIntent[] = [
  {
    id: 'statement',
    labels: { en: 'Say this', kn: 'ಹೇಳಿ', hi: 'बताएं' },
    iconName: 'MessageSquare',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE'
  },
  {
    id: 'question',
    labels: { en: 'Ask about this', kn: 'ಕೇಳಿ', hi: 'पूछें' },
    iconName: 'HelpCircle',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59'
  }
];

export function getIntentsForType(type: WordType, item?: LexiconEntry): TypeIntent[] {
  let list: TypeIntent[];
  switch (type) {
    case 'food':
    case 'drink':
      list = FOOD_DRINK_INTENTS;
      break;
    case 'feeling':
      list = FEELING_INTENTS;
      break;
    case 'response':
      list = RESPONSE_INTENTS;
      break;
    case 'place':
      list = PLACE_INTENTS;
      break;
    case 'person':
      list = PERSON_INTENTS;
      break;
    case 'action':
      list = ACTION_INTENTS;
      break;
    case 'body_part':
    case 'symptom':
      list = SYMPTOM_BODY_INTENTS;
      break;
    case 'object':
    case 'school_item':
    case 'toy':
    case 'clothing':
    case 'animal':
      list = OBJECT_ITEM_INTENTS;
      break;
    case 'vehicle':
      list = VEHICLE_INTENTS;
      break;
    case 'time':
    case 'weather':
      list = TIME_WEATHER_INTENTS;
      break;
    default:
      list = FOOD_DRINK_INTENTS;
  }

  if (item) {
    return list.filter(intent => !intent.appliesTo || intent.appliesTo(item));
  }
  return list;
}
