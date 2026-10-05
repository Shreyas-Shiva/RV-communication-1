import { WordClass } from './palette';
import { UserMode, LanguageCode } from '../translations/types';

export interface BoardCardItem {
  id: string;
  type: 'word' | 'folder';
  wordClass: WordClass;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  spokenText: {
    en: string;
    kn: string;
    hi: string;
  };
  svgIcon: string;
  folderId?: string;
  level: 1 | 2 | 3;
  // Fixed slot index for motor planning
  adultSlot: number;   // 0 to 39 for 8x5 grid (row * 8 + col)
  studentSlot: number; // 0 to 34 for 7x5 grid (row * 7 + col)
  childSlot: number;   // 0 to 19 for 5x4 grid (row * 5 + col)
  alt?: string;
}

export interface FolderDefinition {
  id: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  svgIcon: string;
  items: BoardCardItem[];
}

/**
 * FIXED CORE BOARD ITEMS (Avaz-style Motor Planning Layout)
 *
 * Column-by-column layout:
 * Adult (8 cols x 5 rows = 40 cards):
 *   c1: yes, no, please, thank you, sorry
 *   c2: I, you, he, she, we
 *   c3: want, like, need, have, go
 *   c4: eat, drink, play, help, stop
 *   c5: more, again, finished, not, my
 *   c6: folders People, Food, Drinks, Things, Places
 *   c7: folders Feelings, Body and Health, Actions, Questions, Time
 *   c8: folders Describe, School, Home, Situations, My phrases
 *
 * Student (7 cols x 5 rows = 35 cards):
 *   Adult c1 through c7, with School and Home inside More topics folder.
 *
 * Child (5 cols x 4 rows = 20 cards):
 *   c1: yes, no, please, help
 *   c2: I, you, want, like
 *   c3: more, stop, go, finished
 *   c4: folders Food, Drinks, People, Feelings
 *   c5: folders Places, Things, Body and Health, More topics
 *
 * Row-major index formula: row * cols + col
 */
export const CORE_BOARD_ITEMS: BoardCardItem[] = [
  // --- COLUMN 1 (Social Responses) ---
  // r0: yes
  {
    id: 'core_yes',
    type: 'word',
    wordClass: 'social',
    labels: { en: 'Yes', kn: 'ಹೌದು', hi: 'हाँ' },
    spokenText: { en: 'Yes', kn: 'ಹೌದು', hi: 'हाँ' },
    svgIcon: 'check_yes',
    level: 1,
    adultSlot: 0,   // 0*8 + 0
    studentSlot: 0, // 0*7 + 0
    childSlot: 0,   // 0*5 + 0
    alt: 'Green checkmark for yes'
  },
  // r1: no
  {
    id: 'core_no',
    type: 'word',
    wordClass: 'social',
    labels: { en: 'No', kn: 'ಇಲ್ಲ', hi: 'नहीं' },
    spokenText: { en: 'No', kn: 'ಇಲ್ಲ', hi: 'नहीं' },
    svgIcon: 'cross_no',
    level: 1,
    adultSlot: 8,   // 1*8 + 0
    studentSlot: 7, // 1*7 + 0
    childSlot: 5,   // 1*5 + 0
    alt: 'Red cross for no'
  },
  // r2: please
  {
    id: 'core_please',
    type: 'word',
    wordClass: 'social',
    labels: { en: 'Please', kn: 'ದಯವಿಟ್ಟು', hi: 'कृपया' },
    spokenText: { en: 'Please', kn: 'ದಯವಿಟ್ಟು', hi: 'कृपया' },
    svgIcon: 'please',
    level: 1,
    adultSlot: 16,   // 2*8 + 0
    studentSlot: 14, // 2*7 + 0
    childSlot: 10,   // 2*5 + 0
    alt: 'Hands folded in prayer for please'
  },
  // r3: thank you
  {
    id: 'core_thank_you',
    type: 'word',
    wordClass: 'social',
    labels: { en: 'Thank you', kn: 'ಧನ್ಯವಾದಗಳು', hi: 'धन्यवाद' },
    spokenText: { en: 'Thank you', kn: 'ಧನ್ಯವಾದಗಳು', hi: 'धन्यवाद' },
    svgIcon: 'thank_you',
    level: 1,
    adultSlot: 24,   // 3*8 + 0
    studentSlot: 21, // 3*7 + 0
    childSlot: -1,
    alt: 'Smiling face saying thank you'
  },
  // r4: sorry
  {
    id: 'core_sorry',
    type: 'word',
    wordClass: 'social',
    labels: { en: 'Sorry', kn: 'ಕ್ಷಮಿಸಿ', hi: 'माफ़ कीजिए' },
    spokenText: { en: 'I am sorry', kn: 'ನನ್ನನ್ನು ಕ್ಷಮಿಸಿ', hi: 'मुझे माफ़ कीजिए' },
    svgIcon: 'feel_sorry',
    level: 2,
    adultSlot: 32,   // 4*8 + 0
    studentSlot: 28, // 4*7 + 0
    childSlot: -1,
    alt: 'Apologetic face'
  },

  // --- COLUMN 2 (Pronouns) ---
  // r0: I
  {
    id: 'core_i',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'I', kn: 'ನಾನು', hi: 'मैं' },
    spokenText: { en: 'I', kn: 'ನಾನು', hi: 'मैं' },
    svgIcon: 'wave_hand',
    level: 1,
    adultSlot: 1,   // 0*8 + 1
    studentSlot: 1, // 0*7 + 1
    childSlot: 1,   // 0*5 + 1
    alt: 'Person pointing to self'
  },
  // r1: you
  {
    id: 'core_you',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'You', kn: 'ನೀವು', hi: 'आप' },
    spokenText: { en: 'You', kn: 'ನೀವು', hi: 'आप' },
    svgIcon: 'friend',
    level: 1,
    adultSlot: 9,   // 1*8 + 1
    studentSlot: 8, // 1*7 + 1
    childSlot: 6,   // 1*5 + 1
    alt: 'Person pointing to partner'
  },
  // r2: he
  {
    id: 'core_he',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'He', kn: 'ಅವನು', hi: 'वह (लड़का)' },
    spokenText: { en: 'He', kn: 'ಅವನು', hi: 'वह' },
    svgIcon: 'boy',
    level: 2,
    adultSlot: 17,   // 2*8 + 1
    studentSlot: 15, // 2*7 + 1
    childSlot: -1,
    alt: 'Boy silhouette'
  },
  // r3: she
  {
    id: 'core_she',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'She', kn: 'ಅವಳು', hi: 'वह (लड़की)' },
    spokenText: { en: 'She', kn: 'ಅವಳು', hi: 'वह' },
    svgIcon: 'girl',
    level: 2,
    adultSlot: 25,   // 3*8 + 1
    studentSlot: 22, // 3*7 + 1
    childSlot: -1,
    alt: 'Girl silhouette'
  },
  // r4: we
  {
    id: 'core_we',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'We', kn: 'ನಾವು', hi: 'हम' },
    spokenText: { en: 'We', kn: 'ನಾವು', hi: 'हम' },
    svgIcon: 'meeting',
    level: 2,
    adultSlot: 33,   // 4*8 + 1
    studentSlot: 29, // 4*7 + 1
    childSlot: -1,
    alt: 'Group representing we'
  },

  // --- COLUMN 3 (Core Action Verbs 1) ---
  // r0: want
  {
    id: 'core_want',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Want', kn: 'ಬೇಕು', hi: 'चाहिए' },
    spokenText: { en: 'I want', kn: 'ನನಗೆ ಬೇಕು', hi: 'मुझे चाहिए' },
    svgIcon: 'please',
    level: 1,
    adultSlot: 2,    // 0*8 + 2
    studentSlot: 2,  // 0*7 + 2
    childSlot: 11,   // 2*5 + 1
    alt: 'Hands wanting item'
  },
  // r1: like
  {
    id: 'core_like',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Like', kn: 'ಇಷ್ಟ', hi: 'पसंद' },
    spokenText: { en: 'I like this', kn: 'ನನಗೆ ಇದು ಇಷ್ಟ', hi: 'मुझे यह पसंद है' },
    svgIcon: 'heart',
    level: 1,
    adultSlot: 10,   // 1*8 + 2
    studentSlot: 9,  // 1*7 + 2
    childSlot: 16,   // 3*5 + 1
    alt: 'Heart for like'
  },
  // r2: need
  {
    id: 'core_need',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Need', kn: 'ಅಗತ್ಯ', hi: 'जरूरत' },
    spokenText: { en: 'I need', kn: 'ನನಗೆ ಅಗತ್ಯವಿದೆ', hi: 'मुझे जरूरत है' },
    svgIcon: 'help',
    level: 2,
    adultSlot: 18,   // 2*8 + 2
    studentSlot: 16, // 2*7 + 2
    childSlot: -1,
    alt: 'Exclamation mark indicating need'
  },
  // r3: have
  {
    id: 'core_have',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Have', kn: 'ಇದೆ', hi: 'पास है' },
    spokenText: { en: 'I have', kn: 'ನನ್ನ ಬಳಿ ಇದೆ', hi: 'मेरे पास है' },
    svgIcon: 'cart',
    level: 2,
    adultSlot: 26,   // 3*8 + 2
    studentSlot: 23, // 3*7 + 2
    childSlot: -1,
    alt: 'Hands holding an object'
  },
  // r4: go
  {
    id: 'core_go',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Go', kn: 'ಹೋಗು', hi: 'जाओ' },
    spokenText: { en: 'Let us go', kn: 'ಹೋಗೋಣ', hi: 'चलते हैं' },
    svgIcon: 'bus',
    level: 2,
    adultSlot: 34,   // 4*8 + 2
    studentSlot: 30, // 4*7 + 2
    childSlot: 12,   // 2*5 + 2
    alt: 'Green forward arrow for go'
  },

  // --- COLUMN 4 (Core Action Verbs 2 & Help) ---
  // r0: eat
  {
    id: 'core_eat',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Eat', kn: 'ತಿನ್ನು', hi: 'खाओ' },
    spokenText: { en: 'I want to eat', kn: 'ನಾನು ತಿನ್ನಬೇಕು', hi: 'मुझे खाना है' },
    svgIcon: 'apple',
    level: 1,
    adultSlot: 3,    // 0*8 + 3
    studentSlot: 3,  // 0*7 + 3
    childSlot: -1,
    alt: 'Person eating food'
  },
  // r1: drink
  {
    id: 'core_drink',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Drink', kn: 'ಕುಡಿ', hi: 'पियो' },
    spokenText: { en: 'I want to drink', kn: 'ನಾನು ಕುಡಿಯಬೇಕು', hi: 'मुझे पीना है' },
    svgIcon: 'water',
    level: 1,
    adultSlot: 11,   // 1*8 + 3
    studentSlot: 10, // 1*7 + 3
    childSlot: -1,
    alt: 'Glass of water'
  },
  // r2: play
  {
    id: 'core_play',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Play', kn: 'ಆಟವಾಡು', hi: 'खेलो' },
    spokenText: { en: 'Let us play', kn: 'ಆಟವಾಡೋಣ', hi: 'खेलते हैं' },
    svgIcon: 'ball',
    level: 1,
    adultSlot: 19,   // 2*8 + 3
    studentSlot: 17, // 2*7 + 3
    childSlot: -1,
    alt: 'Soccer ball for play'
  },
  // r3: help
  {
    id: 'core_help',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Help', kn: 'ಸಹಾಯ', hi: 'मदद' },
    spokenText: { en: 'Please help me', kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ', hi: 'कृपया मेरी मदद कीजिए' },
    svgIcon: 'help',
    level: 1,
    adultSlot: 27,   // 3*8 + 3
    studentSlot: 24, // 3*7 + 3
    childSlot: 15,   // 3*5 + 0
    alt: 'Helping hands'
  },
  // r4: stop
  {
    id: 'core_stop',
    type: 'word',
    wordClass: 'verb',
    labels: { en: 'Stop', kn: 'ನಿಲ್ಲಿಸು', hi: 'रुको' },
    spokenText: { en: 'Please stop', kn: 'ದಯವಿಟ್ಟು ನಿಲ್ಲಿಸಿ', hi: 'कृपया रुकिए' },
    svgIcon: 'stop',
    level: 2,
    adultSlot: 35,   // 4*8 + 3
    studentSlot: 31, // 4*7 + 3
    childSlot: 7,    // 1*5 + 2
    alt: 'Red stop sign'
  },

  // --- COLUMN 5 (Modifiers & Modals) ---
  // r0: more
  {
    id: 'core_more',
    type: 'word',
    wordClass: 'descriptor',
    labels: { en: 'More', kn: 'ಇನ್ನೂ ಬೇಕು', hi: 'और' },
    spokenText: { en: 'More please', kn: 'ಇನ್ನೂ ಸ್ವಲ್ಪ ಬೇಕು', hi: 'थोड़ा और दीजिए' },
    svgIcon: 'more',
    level: 1,
    adultSlot: 4,    // 0*8 + 4
    studentSlot: 4,  // 0*7 + 4
    childSlot: 2,    // 0*5 + 2
    alt: 'Plus symbol for more'
  },
  // r1: again
  {
    id: 'core_again',
    type: 'word',
    wordClass: 'descriptor',
    labels: { en: 'Again', kn: 'ಮತ್ತೆ', hi: 'फिर से' },
    spokenText: { en: 'Once again', kn: 'ಮತ್ತೊಮ್ಮೆ', hi: 'एक बार फिर' },
    svgIcon: 'rotate_ccw',
    level: 2,
    adultSlot: 12,   // 1*8 + 4
    studentSlot: 11, // 1*7 + 4
    childSlot: -1,
    alt: 'Circular repeat arrow'
  },
  // r2: finished
  {
    id: 'core_finished',
    type: 'word',
    wordClass: 'descriptor',
    labels: { en: 'Finished', kn: 'ಮುಗಿಯಿತು', hi: 'खत्म' },
    spokenText: { en: 'I am finished', kn: 'ನನ್ನ ಕೆಲಸ ಮುಗಿಯಿತು', hi: 'मेरा काम खत्म हो गया' },
    svgIcon: 'check_yes',
    level: 2,
    adultSlot: 20,   // 2*8 + 4
    studentSlot: 18, // 2*7 + 4
    childSlot: 17,   // 3*5 + 2
    alt: 'Checkmark indicating all done'
  },
  // r3: not
  {
    id: 'core_not',
    type: 'word',
    wordClass: 'descriptor',
    labels: { en: 'Not', kn: 'ಅಲ್ಲ', hi: 'नहीं' },
    spokenText: { en: 'Not this', kn: 'ಇದಲ್ಲ', hi: 'यह नहीं' },
    svgIcon: 'cross_no',
    level: 2,
    adultSlot: 28,   // 3*8 + 4
    studentSlot: 25, // 3*7 + 4
    childSlot: -1,
    alt: 'Negation slash'
  },
  // r4: my
  {
    id: 'core_my',
    type: 'word',
    wordClass: 'pronoun',
    labels: { en: 'My', kn: 'ನನ್ನ', hi: 'मेरा' },
    spokenText: { en: 'This is mine', kn: 'ಇದು ನನ್ನದು', hi: 'यह मेरा है' },
    svgIcon: 'wave_hand',
    level: 2,
    adultSlot: 36,   // 4*8 + 4
    studentSlot: 32, // 4*7 + 4
    childSlot: -1,
    alt: 'Hand pointing inwards'
  },

  // --- COLUMN 6 (Folders Set 1) ---
  // r0: People
  {
    id: 'folder_people',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'People', kn: 'ಜನರು', hi: 'लोग' },
    spokenText: { en: 'People', kn: 'ಜನರು', hi: 'लोग' },
    svgIcon: 'friend',
    folderId: 'people',
    level: 2,
    adultSlot: 5,    // 0*8 + 5
    studentSlot: 5,  // 0*7 + 5
    childSlot: 13,   // 2*5 + 3
    alt: 'Folder of people'
  },
  // r1: Food
  {
    id: 'folder_food',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Food', kn: 'ಆಹಾರ', hi: 'भोजन' },
    spokenText: { en: 'Food', kn: 'ಆಹಾರ', hi: 'भोजन' },
    svgIcon: 'pizza',
    folderId: 'food',
    level: 2,
    adultSlot: 13,   // 1*8 + 5
    studentSlot: 12, // 1*7 + 5
    childSlot: 3,    // 0*5 + 3
    alt: 'Folder of food'
  },
  // r2: Drinks
  {
    id: 'folder_drinks',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Drinks', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय' },
    spokenText: { en: 'Drinks', kn: 'ಪಾನೀಯಗಳು', hi: 'पेಯ' },
    svgIcon: 'water',
    folderId: 'drinks',
    level: 2,
    adultSlot: 21,   // 2*8 + 5
    studentSlot: 19, // 2*7 + 5
    childSlot: 8,    // 1*5 + 3
    alt: 'Folder of drinks'
  },
  // r3: Things
  {
    id: 'folder_things',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Things', kn: 'ವಸ್ತುಗಳು', hi: 'चीजें' },
    spokenText: { en: 'Things', kn: 'ವಸ್ತುಗಳು', hi: 'चीजें' },
    svgIcon: 'cart',
    folderId: 'things',
    level: 3,
    adultSlot: 29,   // 3*8 + 5
    studentSlot: 26, // 3*7 + 5
    childSlot: 9,    // 1*5 + 4
    alt: 'Folder of things and objects'
  },
  // r4: Places
  {
    id: 'folder_places',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Places', kn: 'ಸ್ಥಳಗಳು', hi: 'जगहें' },
    spokenText: { en: 'Places', kn: 'ಸ್ಥಳಗಳು', hi: 'जगहें' },
    svgIcon: 'home',
    folderId: 'places',
    level: 3,
    adultSlot: 37,   // 4*8 + 5
    studentSlot: 33, // 4*7 + 5
    childSlot: 4,    // 0*5 + 4
    alt: 'Folder of places'
  },

  // --- COLUMN 7 (Folders Set 2) ---
  // r0: Feelings
  {
    id: 'folder_feelings',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Feelings', kn: 'ಭಾವನೆಗಳು', hi: 'भावनाएँ' },
    spokenText: { en: 'Feelings', kn: 'ಭಾವನೆಗಳು', hi: 'भावनाएँ' },
    svgIcon: 'happy',
    folderId: 'feelings',
    level: 3,
    adultSlot: 6,    // 0*8 + 6
    studentSlot: 6,  // 0*7 + 6
    childSlot: 18,   // 3*5 + 3
    alt: 'Folder of feelings'
  },
  // r1: Body and Health
  {
    id: 'folder_body_health',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Body & Health', kn: 'ದೇಹ ಮತ್ತು ಆರೋಗ್ಯ', hi: 'शरीर और स्वास्थ्य' },
    spokenText: { en: 'Body and Health', kn: 'ದೇಹ ಮತ್ತು ಆರೋಗ್ಯ', hi: 'शरीर और स्वास्थ्य' },
    svgIcon: 'hospital',
    folderId: 'body_health',
    level: 3,
    adultSlot: 14,   // 1*8 + 6
    studentSlot: 13, // 1*7 + 6
    childSlot: 14,   // 2*5 + 4
    alt: 'Folder of body and health'
  },
  // r2: Actions
  {
    id: 'folder_actions',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Actions', kn: 'ಕ್ರಿಯೆಗಳು', hi: 'क्रियाएँ' },
    spokenText: { en: 'Actions', kn: 'ಕ್ರಿಯೆಗಳು', hi: 'क्रियाएँ' },
    svgIcon: 'run',
    folderId: 'actions',
    level: 2,
    adultSlot: 22,   // 2*8 + 6
    studentSlot: 20, // 2*7 + 6
    childSlot: -1,
    alt: 'Folder of action verbs'
  },
  // r3: Questions
  {
    id: 'folder_questions',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Questions', kn: 'ಪ್ರಶ್ನೆಗಳು', hi: 'प्रश्न' },
    spokenText: { en: 'Questions', kn: 'ಪ್ರಶ್ನೆಗಳು', hi: 'प्रश्न' },
    svgIcon: 'question',
    folderId: 'questions',
    level: 2,
    adultSlot: 30,   // 3*8 + 6
    studentSlot: 27, // 3*7 + 6
    childSlot: -1,
    alt: 'Folder of questions'
  },
  // r4: Time
  {
    id: 'folder_time',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Time', kn: 'ಸಮಯ', hi: 'समय' },
    spokenText: { en: 'Time', kn: 'ಸಮಯ', hi: 'समय' },
    svgIcon: 'clock',
    folderId: 'time',
    level: 2,
    adultSlot: 38,   // 4*8 + 6
    studentSlot: 34, // 4*7 + 6
    childSlot: -1,
    alt: 'Folder of time concepts'
  },

  // --- COLUMN 8 (Folders Set 3 - Adult specific, with sub-boards) ---
  // r0: Describe
  {
    id: 'folder_describe',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Describe', kn: 'ವಿವರಣೆ', hi: 'वर्णन' },
    spokenText: { en: 'Describe', kn: 'ವಿವರಣೆ', hi: 'वर्णन' },
    svgIcon: 'star',
    folderId: 'describe',
    level: 2,
    adultSlot: 7,    // 0*8 + 7
    studentSlot: -1,
    childSlot: -1,
    alt: 'Folder of descriptors and colors'
  },
  // r1: School
  {
    id: 'folder_school',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
    spokenText: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
    svgIcon: 'school',
    folderId: 'school',
    level: 2,
    adultSlot: 15,   // 1*8 + 7
    studentSlot: -1,
    childSlot: -1,
    alt: 'Folder of school items'
  },
  // r2: Home
  {
    id: 'folder_home',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    spokenText: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    svgIcon: 'home',
    folderId: 'home',
    level: 2,
    adultSlot: 23,   // 2*8 + 7
    studentSlot: -1,
    childSlot: -1,
    alt: 'Folder of home items'
  },
  // r3: Situations / More topics
  {
    id: 'folder_situations',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'Situations', kn: 'ಸಂದರ್ಭಗಳು', hi: 'परिस्थितियाँ' },
    spokenText: { en: 'Situations', kn: 'ಸಂದರ್ಭಗಳು', hi: 'परिस्थितियाँ' },
    svgIcon: 'grid',
    folderId: 'situations',
    level: 2,
    adultSlot: 31,   // 3*8 + 7
    studentSlot: -1,
    childSlot: -1,
    alt: 'Folder of daily situation subboards'
  },
  // r4: My phrases
  {
    id: 'folder_my_phrases',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'My phrases', kn: 'ನನ್ನ ವಾಕ್ಯಗಳು', hi: 'मेरे वाक्य' },
    spokenText: { en: 'My phrases', kn: 'ನನ್ನ ವಾಕ್ಯಗಳು', hi: 'मेरे वाक्य' },
    svgIcon: 'heart',
    folderId: 'my_phrases',
    level: 2,
    adultSlot: 39,   // 4*8 + 7
    studentSlot: -1,
    childSlot: -1,
    alt: 'Folder of saved favorites and recent phrases'
  },

  // Child & Student 'More topics' folder card
  {
    id: 'folder_more_topics',
    type: 'folder',
    wordClass: 'folder',
    labels: { en: 'More topics', kn: 'ಇನ್ನಷ್ಟು ವಿಷಯಗಳು', hi: 'और विषय' },
    spokenText: { en: 'More topics', kn: 'ಇನ್ನಷ್ಟು ವಿಷಯಗಳು', hi: 'और विषय' },
    svgIcon: 'grid',
    folderId: 'situations',
    level: 3,
    adultSlot: -1,
    studentSlot: -1,
    childSlot: 19,   // 3*5 + 4
    alt: 'Folder of more topics'
  }
];

/**
 * 16 CATEGORY FOLDERS WITH SUB-BOARDS
 */
export const CATEGORY_FOLDERS: Record<string, FolderDefinition> = {
  food: {
    id: 'food',
    labels: { en: 'Food', kn: 'ಆಹಾರ', hi: 'भोजन' },
    svgIcon: 'pizza',
    items: [
      {
        id: 'food_pizza',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Pizza', kn: 'ಪಿಜ್ಜಾ', hi: 'पिज़्ज़ा' },
        spokenText: { en: 'I want pizza', kn: 'ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು', hi: 'मुझे पिज़्ज़ा चाहिए' },
        svgIcon: 'pizza',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'food_rice',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Rice', kn: 'ಅನ್ನ', hi: 'चावल' },
        spokenText: { en: 'I want rice', kn: 'ನನಗೆ ಅನ್ನ ಬೇಕು', hi: 'मुझे चावल चाहिए' },
        svgIcon: 'rice',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'food_bread',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Bread', kn: 'ಬ್ರೆಡ್', hi: 'ब्रेड' },
        spokenText: { en: 'Bread please', kn: 'ಬ್ರೆಡ್ ಕೊಡಿ ದಯವಿಟ್ಟು', hi: 'ब्रेड दीजिए' },
        svgIcon: 'bread',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'food_apple',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Apple', kn: 'ಸೇಬು', hi: 'सेब' },
        spokenText: { en: 'Apple', kn: 'ಸೇಬು', hi: 'सेब' },
        svgIcon: 'apple',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      },
      {
        id: 'food_banana',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Banana', kn: 'ಬಾಳೆಹಣ್ಣು', hi: 'केला' },
        spokenText: { en: 'Banana', kn: 'ಬಾಳೆಹಣ್ಣು', hi: 'केला' },
        svgIcon: 'banana',
        level: 1, adultSlot: 4, studentSlot: 4, childSlot: 4
      },
      {
        id: 'food_biscuit',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Biscuit', kn: 'ಬಿಸ್ಕತ್ತು', hi: 'बिस्कुट' },
        spokenText: { en: 'Biscuit', kn: 'ಬಿಸ್ಕತ್ತು', hi: 'बिस्कुट' },
        svgIcon: 'biscuit',
        level: 1, adultSlot: 5, studentSlot: 5, childSlot: 5
      }
    ]
  },
  drinks: {
    id: 'drinks',
    labels: { en: 'Drinks', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय' },
    svgIcon: 'water',
    items: [
      {
        id: 'drink_water',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Water', kn: 'ನೀರು', hi: 'पानी' },
        spokenText: { en: 'Water please', kn: 'ನೀರು ಕೊಡಿ ದಯವಿಟ್ಟು', hi: 'पानी दीजिए' },
        svgIcon: 'water',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'drink_milk',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Milk', kn: 'ಹಾಲು', hi: 'दूध' },
        spokenText: { en: 'Milk please', kn: 'ಹಾಲು ಕೊಡಿ', hi: 'दूध दीजिए' },
        svgIcon: 'milk',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'drink_tea',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Tea', kn: 'ಚಹಾ', hi: 'चाय' },
        spokenText: { en: 'Tea', kn: 'ಚಹಾ', hi: 'चाय' },
        svgIcon: 'tea',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'drink_juice',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Juice', kn: 'ಹಣ್ಣಿನ ರಸ', hi: 'जूस' },
        spokenText: { en: 'Fruit juice', kn: 'ಜ್ಯೂಸ್ ಬೇಕು', hi: 'जूस चाहिए' },
        svgIcon: 'water',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  people: {
    id: 'people',
    labels: { en: 'People', kn: 'ಜನರು', hi: 'लोग' },
    svgIcon: 'friend',
    items: [
      {
        id: 'ppl_mom',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Mom', kn: 'ಅಮ್ಮ', hi: 'माँ' },
        spokenText: { en: 'Mom', kn: 'ಅಮ್ಮ', hi: 'माँ' },
        svgIcon: 'mother',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'ppl_dad',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Dad', kn: 'ಅಪ್ಪ', hi: 'पापा' },
        spokenText: { en: 'Dad', kn: 'ಅಪ್ಪ', hi: 'पापा' },
        svgIcon: 'father',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'ppl_teacher',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Teacher', kn: 'ಶಿಕ್ಷಕರು', hi: 'अध्यापक' },
        spokenText: { en: 'Teacher', kn: 'ಶಿಕ್ಷಕರು', hi: 'अध्यापक' },
        svgIcon: 'teacher',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'ppl_friend',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Friend', kn: 'ಸ್ನೇಹಿತ', hi: 'दोस्त' },
        spokenText: { en: 'My friend', kn: 'ನನ್ನ ಸ್ನೇಹಿತ', hi: 'मेरा दोस्त' },
        svgIcon: 'friend',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      },
      {
        id: 'ppl_doctor',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Doctor', kn: 'ವೈದ್ಯರು', hi: 'डॉक्टर' },
        spokenText: { en: 'Doctor', kn: 'ವೈದ್ಯರು', hi: 'डॉक्टर' },
        svgIcon: 'hospital',
        level: 1, adultSlot: 4, studentSlot: 4, childSlot: 4
      }
    ]
  },
  things: {
    id: 'things',
    labels: { en: 'Things', kn: 'ವಸ್ತುಗಳು', hi: 'चीजें' },
    svgIcon: 'cart',
    items: [
      {
        id: 'thg_book',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Book', kn: 'ಪುಸ್ತಕ', hi: 'किताब' },
        spokenText: { en: 'Book', kn: 'ಪುಸ್ತಕ', hi: 'किताब' },
        svgIcon: 'book',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'thg_ball',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Ball', kn: 'ಚೆಂಡು', hi: 'गेंद' },
        spokenText: { en: 'Ball', kn: 'ಚೆಂಡು', hi: 'गेंद' },
        svgIcon: 'ball',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'thg_phone',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Phone', kn: 'ಫೋನ್', hi: 'फ़ोन' },
        spokenText: { en: 'Phone', kn: 'ಫೋನ್', hi: 'फ़ोन' },
        svgIcon: 'phone',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'thg_bag',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Bag', kn: 'ಚೀಲ', hi: 'बस्ता' },
        spokenText: { en: 'My bag', kn: 'ನನ್ನ ಬ್ಯಾಗ್', hi: 'मेरा बस्ता' },
        svgIcon: 'school',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  places: {
    id: 'places',
    labels: { en: 'Places', kn: 'ಸ್ಥಳಗಳು', hi: 'जगहें' },
    svgIcon: 'home',
    items: [
      {
        id: 'plc_home',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
        spokenText: { en: 'Go home', kn: 'ಮನೆಗೆ ಹೋಗೋಣ', hi: 'घर चलें' },
        svgIcon: 'home',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'plc_school',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
        spokenText: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
        svgIcon: 'school',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'plc_park',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Park', kn: 'ಉದ್ಯಾನ', hi: 'पार्क' },
        spokenText: { en: 'Go to park', kn: 'ಪಾರ್ಕ್ ಹೋಗೋಣ', hi: 'पार्क चलें' },
        svgIcon: 'playground',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'plc_shop',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Shop', kn: 'ಅಂಗಡಿ', hi: 'दुकान' },
        spokenText: { en: 'The store', kn: 'ಅಂಗಡಿ', hi: 'दुकान' },
        svgIcon: 'cart',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      },
      {
        id: 'plc_hospital',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Hospital', kn: 'ಆಸ್ಪತ್ರೆ', hi: 'अस्पताल' },
        spokenText: { en: 'Hospital', kn: 'ಆಸ್ಪತ್ರೆ', hi: 'अस्पताल' },
        svgIcon: 'hospital',
        level: 1, adultSlot: 4, studentSlot: 4, childSlot: 4
      }
    ]
  },
  feelings: {
    id: 'feelings',
    labels: { en: 'Feelings', kn: 'ಭಾವನೆಗಳು', hi: 'भावनाएँ' },
    svgIcon: 'happy',
    items: [
      {
        id: 'flg_happy',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Happy', kn: 'ಸಂತೋಷ', hi: 'खुश' },
        spokenText: { en: 'I am happy', kn: 'ನನಗೆ ಸಂತೋಷವಾಗಿದೆ', hi: 'मैं खुश हूँ' },
        svgIcon: 'happy',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'flg_sad',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Sad', kn: 'ದುಃಖ', hi: 'उदास' },
        spokenText: { en: 'I am sad', kn: 'ನನಗೆ ದುಃಖವಾಗಿದೆ', hi: 'मैं उदास हूँ' },
        svgIcon: 'feel_sad',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'flg_tired',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Tired', kn: 'ದಣಿವು', hi: 'थका हुआ' },
        spokenText: { en: 'I am tired', kn: 'ನನಗೆ ದಣಿವಾಗಿದೆ', hi: 'मैं थका हुआ हूँ' },
        svgIcon: 'feel_tired',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'flg_angry',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Angry', kn: 'ಕೋಪ', hi: 'गुस्सा' },
        spokenText: { en: 'I feel angry', kn: 'ನನಗೆ ಕೋಪ ಬಂದಿದೆ', hi: 'मुझे गुस्सा आ रहा है' },
        svgIcon: 'feel_angry',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      },
      {
        id: 'flg_scared',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Scared', kn: 'ಭಯ', hi: 'डरा हुआ' },
        spokenText: { en: 'I am scared', kn: 'ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ', hi: 'मुझे डर लग रहा है' },
        svgIcon: 'feel_scared',
        level: 1, adultSlot: 4, studentSlot: 4, childSlot: 4
      }
    ]
  },
  body_health: {
    id: 'body_health',
    labels: { en: 'Body & Health', kn: 'ದೇಹ ಮತ್ತು ಆರೋಗ್ಯ', hi: 'शरीर और स्वास्थ्य' },
    svgIcon: 'hospital',
    items: [
      {
        id: 'hlth_hurt',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Hurt', kn: 'ನೋವು', hi: 'दर्द' },
        spokenText: { en: 'It hurts here', kn: 'ಇಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ', hi: 'यहाँ दर्द हो रहा है' },
        svgIcon: 'hurt',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'hlth_head',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Head', kn: 'ತಲೆ', hi: 'सिर' },
        spokenText: { en: 'My head', kn: 'ನನ್ನ ತಲೆ', hi: 'मेरा सिर' },
        svgIcon: 'head',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'hlth_stomach',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Stomach', kn: 'ಹೊಟ್ಟೆ', hi: 'पेट' },
        spokenText: { en: 'My stomach hurts', kn: 'ಹೊಟ್ಟೆ ನೋವು', hi: 'पेट दर्द' },
        svgIcon: 'stomach',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'hlth_medicine',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Medicine', kn: 'ಔಷಧಿ', hi: 'दवाई' },
        spokenText: { en: 'I need medicine', kn: 'ಔಷಧಿ ಬೇಕು', hi: 'दवाई चाहिए' },
        svgIcon: 'medicine',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  actions: {
    id: 'actions',
    labels: { en: 'Actions', kn: 'ಕ್ರಿಯೆಗಳು', hi: 'क्रियाएँ' },
    svgIcon: 'run',
    items: [
      {
        id: 'act_walk',
        type: 'word',
        wordClass: 'verb',
        labels: { en: 'Walk', kn: 'ನಡೆ', hi: 'चलो' },
        spokenText: { en: 'Walk', kn: 'ನಡೆಯೋಣ', hi: 'चलते हैं' },
        svgIcon: 'run',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'act_sleep',
        type: 'word',
        wordClass: 'verb',
        labels: { en: 'Sleep', kn: 'ಮಲಗು', hi: 'सो जाओ' },
        spokenText: { en: 'I want to sleep', kn: 'ನಾನು ಮಲಗಬೇಕು', hi: 'मुझे सोना है' },
        svgIcon: 'feel_tired',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'act_look',
        type: 'word',
        wordClass: 'verb',
        labels: { en: 'Look', kn: 'ನೋಡು', hi: 'देखो' },
        spokenText: { en: 'Look at this', kn: 'ಇಲ್ಲಿ ನೋಡಿ', hi: 'यहाँ देखो' },
        svgIcon: 'sparkles',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      }
    ]
  },
  questions: {
    id: 'questions',
    labels: { en: 'Questions', kn: 'ಪ್ರಶ್ನೆಗಳು', hi: 'प्रश्न' },
    svgIcon: 'question',
    items: [
      {
        id: 'qst_what',
        type: 'word',
        wordClass: 'question',
        labels: { en: 'What', kn: 'ಏನು', hi: 'क्या' },
        spokenText: { en: 'What is that?', kn: 'ಅದು ಏನು?', hi: 'वह क्या है?' },
        svgIcon: 'question',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'qst_where',
        type: 'word',
        wordClass: 'question',
        labels: { en: 'Where', kn: 'ಎಲ್ಲಿ', hi: 'कहाँ' },
        spokenText: { en: 'Where is it?', kn: 'ಅದು ಎಲ್ಲಿದೆ?', hi: 'वह कहाँ है?' },
        svgIcon: 'question',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'qst_who',
        type: 'word',
        wordClass: 'question',
        labels: { en: 'Who', kn: 'ಯಾರು', hi: 'कौन' },
        spokenText: { en: 'Who is that?', kn: 'ಅವರು ಯಾರು?', hi: 'वह कौन है?' },
        svgIcon: 'question',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'qst_why',
        type: 'word',
        wordClass: 'question',
        labels: { en: 'Why', kn: 'ಏಕೆ', hi: 'क्यों' },
        spokenText: { en: 'Why?', kn: 'ಏಕೆ?', hi: 'क्यों?' },
        svgIcon: 'question',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  time: {
    id: 'time',
    labels: { en: 'Time', kn: 'ಸಮಯ', hi: 'समय' },
    svgIcon: 'clock',
    items: [
      {
        id: 'tim_now',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Now', kn: 'ಈಗ', hi: 'अभी' },
        spokenText: { en: 'Right now', kn: 'ಈಗಲೇ', hi: 'अभी' },
        svgIcon: 'clock',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'tim_later',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Later', kn: 'ಆಮೇಲೆ', hi: 'बाद में' },
        spokenText: { en: 'Later please', kn: 'ಆಮೇಲೆ ನೋಡೋಣ', hi: 'बाद में करेंगे' },
        svgIcon: 'clock',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'tim_today',
        type: 'word',
        wordClass: 'place_time',
        labels: { en: 'Today', kn: 'ಇಂದು', hi: 'आज' },
        spokenText: { en: 'Today', kn: 'ಇವತ್ತು', hi: 'आज' },
        svgIcon: 'sun',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      }
    ]
  },
  describe: {
    id: 'describe',
    labels: { en: 'Describe', kn: 'ವಿವರಣೆ', hi: 'वर्णन' },
    svgIcon: 'star',
    items: [
      {
        id: 'dsc_good',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Good', kn: 'ಒಳ್ಳೆಯದು', hi: 'अच्छा' },
        spokenText: { en: 'Very good', kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು', hi: 'बहुत अच्छा' },
        svgIcon: 'check_yes',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'dsc_bad',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Bad', kn: 'ಕೆಟ್ಟದ್ದು', hi: 'खराब' },
        spokenText: { en: 'Not good', kn: 'ಸರಿಯಿಲ್ಲ', hi: 'अच्छा नहीं है' },
        svgIcon: 'cross_no',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'dsc_big',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Big', kn: 'ದೊಡ್ಡದು', hi: 'बड़ा' },
        spokenText: { en: 'It is big', kn: 'ದೊಡ್ಡದು', hi: 'बड़ा है' },
        svgIcon: 'shapes',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'dsc_small',
        type: 'word',
        wordClass: 'descriptor',
        labels: { en: 'Small', kn: 'ಚಿಕ್ಕದು', hi: 'छोटा' },
        spokenText: { en: 'It is small', kn: 'ಚಿಕ್ಕದು', hi: 'छोटा है' },
        svgIcon: 'shapes',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  school: {
    id: 'school',
    labels: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
    svgIcon: 'school',
    items: [
      {
        id: 'sch_book',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Book', kn: 'ಪುಸ್ತಕ', hi: 'किताब' },
        spokenText: { en: 'Book', kn: 'ಪುಸ್ತಕ', hi: 'किताब' },
        svgIcon: 'book',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'sch_pen',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Pen', kn: 'ಲೇಖನಿ', hi: 'पेन' },
        spokenText: { en: 'Pen', kn: 'ಪೆನ್ನು', hi: 'पेन' },
        svgIcon: 'pencil',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      }
    ]
  },
  home: {
    id: 'home',
    labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    svgIcon: 'home',
    items: [
      {
        id: 'hm_bed',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Bed', kn: 'ಹಾಸಿಗೆ', hi: 'बिस्तर' },
        spokenText: { en: 'Go to bed', kn: 'ಹಾಸಿಗೆ', hi: 'बिस्तर' },
        svgIcon: 'home',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'hm_chair',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Chair', kn: 'ಕುರ್ಚಿ', hi: 'कुर्सी' },
        spokenText: { en: 'Chair', kn: 'ಕುರ್ಚಿ', hi: 'कुर्सी' },
        svgIcon: 'home',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      }
    ]
  },
  situations: {
    id: 'situations',
    labels: { en: 'Situations', kn: 'ಸಂದರ್ಭಗಳು', hi: 'परिस्थितियाँ' },
    svgIcon: 'grid',
    items: [
      {
        id: 'sit_meals',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Meals', kn: 'ಊಟ', hi: 'भोजन' },
        spokenText: { en: 'Meals and dining', kn: 'ಊಟದ ಸಮಯ', hi: 'भोजन' },
        svgIcon: 'pizza',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'sit_clinic',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Clinic', kn: 'ಚಿಕಿತ್ಸಾಲಯ', hi: 'क्लिनिक' },
        spokenText: { en: 'Health and clinic', kn: 'ಆಸ್ಪತ್ರೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ', hi: 'स्वास्थ्य केंद्र' },
        svgIcon: 'hospital',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      },
      {
        id: 'sit_store',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Store', kn: 'ಅಂಗಡಿ', hi: 'दुकान' },
        spokenText: { en: 'Shopping and store', kn: 'ಖರೀದಿ ಅಂಗಡಿ', hi: 'दुकान' },
        svgIcon: 'cart',
        level: 1, adultSlot: 2, studentSlot: 2, childSlot: 2
      },
      {
        id: 'sit_transit',
        type: 'word',
        wordClass: 'noun',
        labels: { en: 'Transit', kn: 'ಸಾರಿಗೆ', hi: 'यातायात' },
        spokenText: { en: 'Travel and transit', kn: 'ಪ್ರಯಾಣ ಮತ್ತು ಸಾರಿಗೆ', hi: 'यात्रा और बस' },
        svgIcon: 'bus',
        level: 1, adultSlot: 3, studentSlot: 3, childSlot: 3
      }
    ]
  },
  my_phrases: {
    id: 'my_phrases',
    labels: { en: 'My phrases', kn: 'ನನ್ನ ವಾಕ್ಯಗಳು', hi: 'मेरे वाक्य' },
    svgIcon: 'heart',
    items: [
      {
        id: 'mph_fav1',
        type: 'word',
        wordClass: 'social',
        labels: { en: 'How are you?', kn: 'ಹೇಗಿದ್ದೀರಿ?', hi: 'आप कैसे हैं?' },
        spokenText: { en: 'How are you?', kn: 'ಹೇಗಿದ್ದೀರಿ?', hi: 'आप कैसे हैं?' },
        svgIcon: 'question',
        level: 1, adultSlot: 0, studentSlot: 0, childSlot: 0
      },
      {
        id: 'mph_fav2',
        type: 'word',
        wordClass: 'social',
        labels: { en: 'Thank you for helping.', kn: 'ಸಹಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.', hi: 'मदद के लिए धन्यवाद।' },
        spokenText: { en: 'Thank you for helping me.', kn: 'ಸಹಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.', hi: 'मदद के लिए धन्यवाद।' },
        svgIcon: 'thank_you',
        level: 1, adultSlot: 1, studentSlot: 1, childSlot: 1
      }
    ]
  }
};

/**
 * Returns the slots array for the root board according to userMode and vocabLevel.
 * Empty/locked slots return null to preserve exact spatial motor coordinates.
 */
export function getRootBoardGrid(
  userMode: UserMode,
  vocabLevel: 1 | 2 | 3 = 3
): (BoardCardItem | null)[] {
  const totalSlots = userMode === 'child' ? 20 : userMode === 'student' ? 35 : 40;
  const grid: (BoardCardItem | null)[] = new Array(totalSlots).fill(null);

  for (const item of CORE_BOARD_ITEMS) {
    const slot =
      userMode === 'child'
        ? item.childSlot
        : userMode === 'student'
        ? item.studentSlot
        : item.adultSlot;

    if (slot >= 0 && slot < totalSlots) {
      if (item.level <= vocabLevel) {
        grid[slot] = item;
      }
    }
  }

  return grid;
}

/**
 * Returns folder board items with fixed slots.
 */
export function getFolderBoardGrid(
  folderId: string,
  userMode: UserMode,
  vocabLevel: 1 | 2 | 3 = 3
): (BoardCardItem | null)[] {
  const folder = CATEGORY_FOLDERS[folderId];
  if (!folder) return [];

  const totalSlots = userMode === 'child' ? 20 : userMode === 'student' ? 35 : 40;
  const grid: (BoardCardItem | null)[] = new Array(totalSlots).fill(null);

  for (let idx = 0; idx < folder.items.length; idx++) {
    const item = folder.items[idx];
    if (idx < totalSlots && item.level <= vocabLevel) {
      grid[idx] = item;
    }
  }

  return grid;
}

/**
 * Universal search across all boards & folders in EN, KN, and HI.
 */
export function searchBoard(query: string, _language?: LanguageCode): BoardCardItem[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const matches: BoardCardItem[] = [];
  const seenIds = new Set<string>();

  const checkItem = (item: BoardCardItem) => {
    if (seenIds.has(item.id)) return;
    const lEn = item.labels.en.toLowerCase();
    const lKn = item.labels.kn.toLowerCase();
    const lHi = item.labels.hi.toLowerCase();
    if (lEn.includes(cleanQ) || lKn.includes(cleanQ) || lHi.includes(cleanQ)) {
      seenIds.add(item.id);
      matches.push(item);
    }
  };

  CORE_BOARD_ITEMS.forEach(checkItem);
  Object.values(CATEGORY_FOLDERS).forEach(f => f.items.forEach(checkItem));

  return matches;
}
