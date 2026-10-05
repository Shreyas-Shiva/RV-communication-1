import { LexiconEntry } from './types';

export const LEXICON_ENTRIES: LexiconEntry[] = [
  // -------------------------------------------------------------
  // FOOD & DRINK
  // -------------------------------------------------------------
  {
    id: 'pizza',
    type: 'food',
    english: {
      singular: 'pizza',
      plural: 'pizzas',
      countability: 'countable',
      articleRule: 'some'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'पिज़्ज़ा',
      oblique: 'पिज़्ज़ा'
    },
    kannada: {
      base: 'ಪಿಜ್ಜಾ',
      dative: 'ಪಿಜ್ಜಾಕ್ಕೆ',
      accusative: 'ಪಿಜ್ಜಾವನ್ನು',
      locative: 'ಪಿಜ್ಜಾದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'water',
    type: 'drink',
    english: {
      singular: 'water',
      plural: 'water',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'पानी',
      oblique: 'पानी'
    },
    kannada: {
      base: 'ನೀರು',
      dative: 'ನೀರಿಗೆ',
      accusative: 'ನೀರನ್ನು',
      locative: 'ನೀರಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'rice',
    type: 'food',
    english: {
      singular: 'rice',
      plural: 'rice',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'चावल',
      oblique: 'चावल'
    },
    kannada: {
      base: 'ಅನ್ನ',
      dative: 'ಅನ್ನಕ್ಕೆ',
      accusative: 'ಅನ್ನವನ್ನು',
      locative: 'ಅನ್ನದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'apple',
    type: 'food',
    english: {
      singular: 'apple',
      plural: 'apples',
      countability: 'countable',
      articleRule: 'an'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'सेब',
      oblique: 'सेब'
    },
    kannada: {
      base: 'ಸೇಬು',
      dative: 'ಸೇಬಿಗೆ',
      accusative: 'ಸೇಬನ್ನು',
      locative: 'ಸೇಬಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'milk',
    type: 'drink',
    english: {
      singular: 'milk',
      plural: 'milk',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'दूध',
      oblique: 'दूध'
    },
    kannada: {
      base: 'ಹಾಲು',
      dative: 'ಹಾಲಿಗೆ',
      accusative: 'ಹಾಲನ್ನು',
      locative: 'ಹಾಲಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'bread',
    type: 'food',
    english: {
      singular: 'bread',
      plural: 'bread',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'रोटी',
      oblique: 'रोटी'
    },
    kannada: {
      base: 'ರೊಟ್ಟಿ',
      dative: 'ರೊಟ್ಟಿಗೆ',
      accusative: 'ರೊಟ್ಟಿಯನ್ನು',
      locative: 'ರೊಟ್ಟಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'tea',
    type: 'drink',
    english: {
      singular: 'tea',
      plural: 'tea',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'चाय',
      oblique: 'चाय'
    },
    kannada: {
      base: 'ಚಹಾ',
      dative: 'ಚಹಾಗೆ',
      accusative: 'ಚಹಾವನ್ನು',
      locative: 'ಚಹಾದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'snack',
    type: 'food',
    english: {
      singular: 'snack',
      plural: 'snacks',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'नाश्ता',
      oblique: 'नाश्ते'
    },
    kannada: {
      base: 'ತಿಂಡಿ',
      dative: 'ತಿಂಡಿಗೆ',
      accusative: 'ತಿಂಡಿಯನ್ನು',
      locative: 'ತಿಂಡಿಯಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // PERSONAL NEEDS & ACTIONS
  // -------------------------------------------------------------
  {
    id: 'bathroom',
    type: 'place',
    english: {
      singular: 'bathroom',
      plural: 'bathrooms',
      countability: 'countable',
      articleRule: 'the'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'शौचालय',
      oblique: 'शौचालय'
    },
    kannada: {
      base: 'ಶೌಚಾಲಯ',
      dative: 'ಶೌಚಾಲಯಕ್ಕೆ',
      accusative: 'ಶೌಚಾಲಯವನ್ನು',
      locative: 'ಶೌಚಾಲಯದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'wash_hands',
    type: 'action',
    english: {
      singular: 'wash hands',
      plural: 'wash hands',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'wash my hands',
        ing: 'washing my hands'
      }
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'हाथ धोना',
      oblique: 'हाथ धोने'
    },
    kannada: {
      base: 'ಕೈ ತೊಳೆಯುವುದು',
      dative: 'ಕೈ ತೊಳೆಯುವುದಕ್ಕೆ',
      accusative: 'ಕೈ ತೊಳೆಯುವುದನ್ನು',
      locative: 'ಕೈ ತೊಳೆಯುವುದರಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'brush_teeth',
    type: 'action',
    english: {
      singular: 'brush teeth',
      plural: 'brush teeth',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'brush my teeth',
        ing: 'brushing my teeth'
      }
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'दांत साफ़ करना',
      oblique: 'दांत साफ़ करने'
    },
    kannada: {
      base: 'ಹಲ್ಲುಜ್ಜುವುದು',
      dative: 'ಹಲ್ಲುಜ್ಜುವುದಕ್ಕೆ',
      accusative: 'ಹಲ್ಲುಜ್ಜುವುದನ್ನು',
      locative: 'ಹಲ್ಲುಜ್ಜುವುದರಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'shower',
    type: 'action',
    english: {
      singular: 'shower',
      plural: 'showers',
      countability: 'countable',
      articleRule: 'a',
      verbForms: {
        base: 'take a shower',
        ing: 'taking a shower'
      }
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'स्नान करना',
      oblique: 'स्नान करने'
    },
    kannada: {
      base: 'ಸ್ನಾನ ಮಾಡುವುದು',
      dative: 'ಸ್ನಾನಕ್ಕೆ',
      accusative: 'ಸ್ನಾನವನ್ನು',
      locative: 'ಸ್ನಾನದಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // HEALTH & SYMPTOMS (Sensitive)
  // -------------------------------------------------------------
  {
    id: 'medicine',
    type: 'object',
    english: {
      singular: 'medicine',
      plural: 'medicines',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'दवा',
      oblique: 'दवा'
    },
    kannada: {
      base: 'ಔಷಧಿ',
      dative: 'ಔಷಧಿಗೆ',
      accusative: 'ಔಷಧಿಯನ್ನು',
      locative: 'ಔಷಧಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'doctor',
    type: 'person',
    english: {
      singular: 'doctor',
      plural: 'doctors',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'डॉक्टर',
      oblique: 'डॉक्टर'
    },
    kannada: {
      base: 'ವೈದ್ಯರು',
      dative: 'ವೈದ್ಯರಿಗೆ',
      accusative: 'ವೈದ್ಯರನ್ನು',
      locative: 'ವೈದ್ಯರಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'pain',
    type: 'symptom',
    english: {
      singular: 'pain',
      plural: 'pains',
      countability: 'mass',
      articleRule: 'some'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'दर्द',
      oblique: 'दर्द'
    },
    kannada: {
      base: 'ನೋವು',
      dative: 'ನೋವಿಗೆ',
      accusative: 'ನೋವನ್ನು',
      locative: 'ನೋವಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'fever',
    type: 'symptom',
    english: {
      singular: 'fever',
      plural: 'fevers',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'बुखार',
      oblique: 'बुखार'
    },
    kannada: {
      base: 'ಜ್ವರ',
      dative: 'ಜ್ವರಕ್ಕೆ',
      accusative: 'ಜ್ವರವನ್ನು',
      locative: 'ಜ್ವರದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'tired',
    type: 'feeling',
    english: {
      singular: 'tired',
      plural: 'tired',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'थकान',
      oblique: 'थकान',
      adjective: {
        neutral: 'थकान हो रही',
        masculine: 'थक गया',
        feminine: 'थक गई'
      }
    },
    kannada: {
      base: 'ದಣಿವು',
      dative: 'ದಣಿವಿಗೆ',
      accusative: 'ದಣಿವನ್ನು',
      locative: 'ದಣಿವಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'sick',
    type: 'symptom',
    english: {
      singular: 'sick',
      plural: 'sick',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'बीमार',
      oblique: 'बीमार',
      adjective: {
        neutral: 'तबीयत खराब',
        masculine: 'बीमार',
        feminine: 'बीमार'
      }
    },
    kannada: {
      base: 'ಹುಷಾರಿಲ್ಲ',
      dative: 'ಹುಷಾರಿಲ್ಲ',
      accusative: 'ಹುಷಾರಿಲ್ಲ',
      locative: 'ಹುಷಾರಿಲ್ಲ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // EMERGENCY
  // -------------------------------------------------------------
  {
    id: 'emergency_help',
    type: 'action',
    english: {
      singular: 'help',
      plural: 'help',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'get help',
        ing: 'getting help'
      }
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'मदद',
      oblique: 'मदद'
    },
    kannada: {
      base: 'ಸಹಾಯ',
      dative: 'ಸಹಾಯಕ್ಕೆ',
      accusative: 'ಸಹಾಯವನ್ನು',
      locative: 'ಸಹಾಯದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'call_ambulance',
    type: 'action',
    english: {
      singular: 'call ambulance',
      plural: 'call ambulance',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'call an ambulance',
        ing: 'calling an ambulance'
      }
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'एम्बुलेंस बुलाना',
      oblique: 'एम्बुलेंस बुलाने'
    },
    kannada: {
      base: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯುವುದು',
      dative: 'ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ',
      accusative: 'ಆಂಬ್ಯುಲೆನ್ಸ್‌ನ್ನು',
      locative: 'ಆಂಬ್ಯುಲೆನ್ಸ್‌ನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'lost',
    type: 'feeling',
    english: {
      singular: 'lost',
      plural: 'lost',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'भटक गया',
      adjective: {
        neutral: 'रास्ता भटक गया',
        masculine: 'भटक गया',
        feminine: 'भटक गई'
      }
    },
    kannada: {
      base: 'ದಾರಿ ತಪ್ಪಿದೆ',
      dative: 'ದಾರಿ ತಪ್ಪಿದೆ',
      accusative: 'ದಾರಿ ತಪ್ಪಿದೆ',
      locative: 'ದಾರಿ ತಪ್ಪಿದೆ'
    },
    reviewed: false
  },
  {
    id: 'call_family',
    type: 'action',
    english: {
      singular: 'call family',
      plural: 'call family',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'call my family',
        ing: 'calling my family'
      }
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'परिवार को कॉल करना',
      oblique: 'परिवार को कॉल करने'
    },
    kannada: {
      base: 'ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡುವುದು',
      dative: 'ಕುಟುಂಬಕ್ಕೆ',
      accusative: 'ಕುಟುಂಬವನ್ನು',
      locative: 'ಕುಟುಂಬದಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // FEELINGS
  // -------------------------------------------------------------
  {
    id: 'happy',
    type: 'feeling',
    english: {
      singular: 'happy',
      plural: 'happy',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'खुश',
      adjective: {
        neutral: 'खुशी महसूस हो रही',
        masculine: 'खुश',
        feminine: 'खुश'
      }
    },
    kannada: {
      base: 'ಖುಷಿ',
      dative: 'ಖುಷಿಗೆ',
      accusative: 'ಖುಷಿಯನ್ನು',
      locative: 'ಖುಷಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'sad',
    type: 'feeling',
    english: {
      singular: 'sad',
      plural: 'sad',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'उदास',
      adjective: {
        neutral: 'उदासी महसूस हो रही',
        masculine: 'उदास',
        feminine: 'उदास'
      }
    },
    kannada: {
      base: 'ದುಃಖ',
      dative: 'ದುಃಖಕ್ಕೆ',
      accusative: 'ದುಃಖವನ್ನು',
      locative: 'ದುಃಖದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'angry',
    type: 'feeling',
    english: {
      singular: 'angry',
      plural: 'angry',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'गुस्सा',
      adjective: {
        neutral: 'गुस्सा आ रहा',
        masculine: 'गुस्से में',
        feminine: 'गुस्से में'
      }
    },
    kannada: {
      base: 'ಕೋಪ',
      dative: 'ಕೋಪಕ್ಕೆ',
      accusative: 'ಕೋಪವನ್ನು',
      locative: 'ಕೋಪದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'calm',
    type: 'feeling',
    english: {
      singular: 'calm',
      plural: 'calm',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'शांत',
      adjective: {
        neutral: 'शांति महसूस हो रही',
        masculine: 'शांत',
        feminine: 'शांत'
      }
    },
    kannada: {
      base: 'ಶಾಂತ',
      dative: 'ಶಾಂತಿಗೆ',
      accusative: 'ಶಾಂತಿಯನ್ನು',
      locative: 'ಶಾಂತಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'scared',
    type: 'feeling',
    english: {
      singular: 'scared',
      plural: 'scared',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'डर',
      adjective: {
        neutral: 'डर लग रहा',
        masculine: 'डरा हुआ',
        feminine: 'डरी हुई'
      }
    },
    kannada: {
      base: 'ಭಯ',
      dative: 'ಭಯಕ್ಕೆ',
      accusative: 'ಭಯವನ್ನು',
      locative: 'ಭಯದಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // PLACES
  // -------------------------------------------------------------
  {
    id: 'home_place',
    type: 'place',
    english: {
      singular: 'home',
      plural: 'homes',
      countability: 'countable',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'घर',
      oblique: 'घर'
    },
    kannada: {
      base: 'ಮನೆ',
      dative: 'ಮನೆಗೆ',
      accusative: 'ಮನೆಯನ್ನು',
      locative: 'ಮನೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'bed',
    type: 'object',
    english: {
      singular: 'bed',
      plural: 'beds',
      countability: 'countable',
      articleRule: 'the'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'बिस्तर',
      oblique: 'बिस्तर'
    },
    kannada: {
      base: 'ಹಾಸಿಗೆ',
      dative: 'ಹಾಸಿಗೆಗೆ',
      accusative: 'ಹಾಸಿಗೆಯನ್ನು',
      locative: 'ಹಾಸಿಗೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'sleep',
    type: 'action',
    english: {
      singular: 'sleep',
      plural: 'sleep',
      countability: 'mass',
      articleRule: 'none',
      verbForms: {
        base: 'sleep',
        ing: 'sleeping'
      }
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'सोना',
      oblique: 'सोने'
    },
    kannada: {
      base: 'ನಿದ್ರೆ',
      dative: 'ನಿದ್ರೆಗೆ',
      accusative: 'ನಿದ್ರೆಯನ್ನು',
      locative: 'ನಿದ್ರೆಯಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // PEOPLE
  // -------------------------------------------------------------
  {
    id: 'mom',
    type: 'person',
    english: {
      singular: 'mom',
      plural: 'moms',
      countability: 'countable',
      articleRule: 'none'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'माँ',
      oblique: 'माँ'
    },
    kannada: {
      base: 'ಅಮ್ಮ',
      dative: 'ಅಮ್ಮನಿಗೆ',
      accusative: 'ಅಮ್ಮನನ್ನು',
      locative: 'ಅಮ್ಮನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'dad',
    type: 'person',
    english: {
      singular: 'dad',
      plural: 'dads',
      countability: 'countable',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'पापा',
      oblique: 'पापा'
    },
    kannada: {
      base: 'ಅಪ್ಪ',
      dative: 'ಅಪ್ಪನಿಗೆ',
      accusative: 'ಅಪ್ಪನನ್ನು',
      locative: 'ಅಪ್ಪನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'friend',
    type: 'person',
    english: {
      singular: 'friend',
      plural: 'friends',
      countability: 'countable',
      articleRule: 'my'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'दोस्त',
      oblique: 'दोस्त'
    },
    kannada: {
      base: 'ಸ್ನೇಹಿತ',
      dative: 'ಸ್ನೇಹಿತನಿಗೆ',
      accusative: 'ಸ್ನೇಹಿತನನ್ನು',
      locative: 'ಸ್ನೇಹಿತನಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // SCHOOL & PLAYING
  // -------------------------------------------------------------
  {
    id: 'book',
    type: 'school_item',
    english: {
      singular: 'book',
      plural: 'books',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'किताब',
      oblique: 'किताब'
    },
    kannada: {
      base: 'ಪುಸ್ತಕ',
      dative: 'ಪುಸ್ತಕಕ್ಕೆ',
      accusative: 'ಪುಸ್ತಕವನ್ನು',
      locative: 'ಪುಸ್ತಕದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'pencil',
    type: 'school_item',
    english: {
      singular: 'pencil',
      plural: 'pencils',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'पेंसिल',
      oblique: 'पेंसिल'
    },
    kannada: {
      base: 'ಪೆನ್ಸಿಲ್',
      dative: 'ಪೆನ್ಸಿಲ್‌ಗೆ',
      accusative: 'ಪೆನ್ಸಿಲ್‌ನ್ನು',
      locative: 'ಪೆನ್ಸಿಲ್‌ನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'school_place',
    type: 'place',
    english: {
      singular: 'school',
      plural: 'schools',
      countability: 'countable',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'स्कूल',
      oblique: 'स्कूल'
    },
    kannada: {
      base: 'ಶಾಲೆ',
      dative: 'ಶಾಲೆಗೆ',
      accusative: 'ಶಾಲೆಯನ್ನು',
      locative: 'ಶಾಲೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'ball',
    type: 'toy',
    english: {
      singular: 'ball',
      plural: 'balls',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'गेंद',
      oblique: 'गेंद'
    },
    kannada: {
      base: 'ಚೆಂಡು',
      dative: 'ಚೆಂಡಿಗೆ',
      accusative: 'ಚೆಂಡನ್ನು',
      locative: 'ಚೆಂಡಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'playground_place',
    type: 'place',
    english: {
      singular: 'playground',
      plural: 'playgrounds',
      countability: 'countable',
      articleRule: 'the'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'खेल का मैदान',
      oblique: 'खेल के मैदान'
    },
    kannada: {
      base: 'ಆಟದ ಮೈದಾನ',
      dative: 'ಆಟದ ಮೈದಾನಕ್ಕೆ',
      accusative: 'ಆಟದ ಮೈದಾನವನ್ನು',
      locative: 'ಆಟದ ಮೈದಾನದಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // VEHICLES
  // -------------------------------------------------------------
  {
    id: 'bus',
    type: 'vehicle',
    english: {
      singular: 'bus',
      plural: 'buses',
      countability: 'countable',
      articleRule: 'the'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'बस',
      oblique: 'बस'
    },
    kannada: {
      base: 'ಬಸ್ಸು',
      dative: 'ಬಸ್ಸಿಗೆ',
      accusative: 'ಬಸ್ಸನ್ನು',
      locative: 'ಬಸ್ಸಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'car',
    type: 'vehicle',
    english: {
      singular: 'car',
      plural: 'cars',
      countability: 'countable',
      articleRule: 'the'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'गाड़ी',
      oblique: 'गाड़ी'
    },
    kannada: {
      base: 'ಕಾರು',
      dative: 'ಕಾರಿಗೆ',
      accusative: 'ಕಾರನ್ನು',
      locative: 'ಕಾರಿನಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // RESPONSES (Never liked or wanted)
  // -------------------------------------------------------------
  {
    id: 'hello',
    type: 'response',
    english: {
      singular: 'hello',
      plural: 'hello',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'नमस्ते'
    },
    kannada: {
      base: 'ನಮಸ್ಕಾರ',
      dative: 'ನಮಸ್ಕಾರ',
      accusative: 'ನಮಸ್ಕಾರ',
      locative: 'ನಮಸ್ಕಾರ'
    },
    reviewed: false
  },
  {
    id: 'thank_you',
    type: 'response',
    english: {
      singular: 'thank you',
      plural: 'thank you',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'धन्यवाद'
    },
    kannada: {
      base: 'ಧನ್ಯವಾದ',
      dative: 'ಧನ್ಯವಾದ',
      accusative: 'ಧನ್ಯವಾದ',
      locative: 'ಧನ್ಯವಾದ'
    },
    reviewed: false
  },
  {
    id: 'please',
    type: 'response',
    english: {
      singular: 'please',
      plural: 'please',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'कृपया'
    },
    kannada: {
      base: 'ದಯವಿಟ್ಟು',
      dative: 'ದಯವಿಟ್ಟು',
      accusative: 'ದಯವಿಟ್ಟು',
      locative: 'ದಯವಿಟ್ಟು'
    },
    reviewed: false
  },
  {
    id: 'yes_card',
    type: 'response',
    english: {
      singular: 'yes',
      plural: 'yes',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'हाँ'
    },
    kannada: {
      base: 'ಹೌದು',
      dative: 'ಹೌದು',
      accusative: 'ಹೌದು',
      locative: 'ಹೌದು'
    },
    reviewed: false
  },
  {
    id: 'no_card',
    type: 'response',
    english: {
      singular: 'no',
      plural: 'no',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'नहीं'
    },
    kannada: {
      base: 'ಇಲ್ಲ',
      dative: 'ಇಲ್ಲ',
      accusative: 'ಇಲ್ಲ',
      locative: 'ಇಲ್ಲ'
    },
    reviewed: false
  },
  {
    id: 'more_card',
    type: 'response',
    english: {
      singular: 'more',
      plural: 'more',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'और'
    },
    kannada: {
      base: 'ಇನ್ನಷ್ಟು',
      dative: 'ಇನ್ನಷ್ಟು',
      accusative: 'ಇನ್ನಷ್ಟು',
      locative: 'ಇನ್ನಷ್ಟು'
    },
    reviewed: false
  },
  {
    id: 'stop_card',
    type: 'response',
    english: {
      singular: 'stop',
      plural: 'stop',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'रोको'
    },
    kannada: {
      base: 'ನಿಲ್ಲಿಸಿ',
      dative: 'ನಿಲ್ಲಿಸಿ',
      accusative: 'ನಿಲ್ಲಿಸಿ',
      locative: 'ನಿಲ್ಲಿಸಿ'
    },
    reviewed: false
  },
  {
    id: 'maybe',
    type: 'response',
    english: {
      singular: 'maybe',
      plural: 'maybe',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'शायद'
    },
    kannada: {
      base: 'ಬಹುಶಃ',
      dative: 'ಬಹುಶಃ',
      accusative: 'ಬಹುಶಃ',
      locative: 'ಬಹುಶಃ'
    },
    reviewed: false
  },
  {
    id: 'dont_know',
    type: 'response',
    english: {
      singular: 'I do not know',
      plural: 'I do not know',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'मुझे नहीं पता'
    },
    kannada: {
      base: 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ',
      dative: 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ',
      accusative: 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ',
      locative: 'ನನಗೆ ಗೊತ್ತಿಲ್ಲ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // ADULT LIFE SPECIFIC
  // -------------------------------------------------------------
  {
    id: 'work_place',
    type: 'place',
    english: {
      singular: 'work',
      plural: 'work',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'काम',
      oblique: 'काम'
    },
    kannada: {
      base: 'ಕೆಲಸ',
      dative: 'ಕೆಲಸಕ್ಕೆ',
      accusative: 'ಕೆಲಸವನ್ನು',
      locative: 'ಕೆಲಸದಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'meeting',
    type: 'action',
    english: {
      singular: 'meeting',
      plural: 'meetings',
      countability: 'countable',
      articleRule: 'a',
      verbForms: {
        base: 'attend a meeting',
        ing: 'attending a meeting'
      }
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'मीटिंग',
      oblique: 'मीटिंग'
    },
    kannada: {
      base: 'ಸಭೆ',
      dative: 'ಸಭೆಗೆ',
      accusative: 'ಸಭೆಯನ್ನು',
      locative: 'ಸಭೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'college_place',
    type: 'place',
    english: {
      singular: 'college',
      plural: 'colleges',
      countability: 'countable',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'कॉलेज',
      oblique: 'कॉलेज'
    },
    kannada: {
      base: 'ಕಾಲೇಜು',
      dative: 'ಕಾಲೇಜಿಗೆ',
      accusative: 'ಕಾಲೇಜನ್ನು',
      locative: 'ಕಾಲೇಜಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'shopping_card',
    type: 'action',
    english: {
      singular: 'shop',
      plural: 'shops',
      countability: 'countable',
      articleRule: 'the',
      verbForms: {
        base: 'go shopping',
        ing: 'going shopping'
      }
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'खरीदारी',
      oblique: 'खरीदारी'
    },
    kannada: {
      base: 'ಅಂಗಡಿ',
      dative: 'ಅಂಗಡಿಗೆ',
      accusative: 'ಅಂಗಡಿಯನ್ನು',
      locative: 'ಅಂಗಡಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'public_place_card',
    type: 'place',
    english: {
      singular: 'public place',
      plural: 'public places',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'सार्वजनिक स्थान',
      oblique: 'सार्वजनिक स्थान'
    },
    kannada: {
      base: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳ',
      dative: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳಕ್ಕೆ',
      accusative: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳವನ್ನು',
      locative: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳದಲ್ಲಿ'
    },
    reviewed: false
  },

  // -------------------------------------------------------------
  // ADDITIONAL TYPES TO MEET VOCABULARY REQUIREMENTS
  // -------------------------------------------------------------
  {
    id: 'head',
    type: 'body_part',
    english: {
      singular: 'head',
      plural: 'heads',
      countability: 'countable',
      articleRule: 'my'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'सिर',
      oblique: 'सिर'
    },
    kannada: {
      base: 'ತಲೆ',
      dative: 'ತಲೆಗೆ',
      accusative: 'ತಲೆಯನ್ನು',
      locative: 'ತಲೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'stomach',
    type: 'body_part',
    english: {
      singular: 'stomach',
      plural: 'stomachs',
      countability: 'countable',
      articleRule: 'my'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'पेट',
      oblique: 'पेट'
    },
    kannada: {
      base: 'ಹೊಟ್ಟೆ',
      dative: 'ಹೊಟ್ಟೆಗೆ',
      accusative: 'ಹೊಟ್ಟೆಯನ್ನು',
      locative: 'ಹೊಟ್ಟೆಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'now_time',
    type: 'time',
    english: {
      singular: 'now',
      plural: 'now',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'अभी'
    },
    kannada: {
      base: 'ಈಗ',
      dative: 'ಈಗಲೇ',
      accusative: 'ಈಗ',
      locative: 'ಈಗ'
    },
    reviewed: false
  },
  {
    id: 'sunny_weather',
    type: 'weather',
    english: {
      singular: 'sunny',
      plural: 'sunny',
      countability: 'mass',
      articleRule: 'none'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'धूप'
    },
    kannada: {
      base: 'ಬಿಸಿಲು',
      dative: 'ಬಿಸಿಲಿಗೆ',
      accusative: 'ಬಿಸಿಲನ್ನು',
      locative: 'ಬಿಸಿಲಿನಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'dog_animal',
    type: 'animal',
    english: {
      singular: 'dog',
      plural: 'dogs',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'm',
      number: 'sg',
      base: 'कुत्ता',
      oblique: 'कुत्ते'
    },
    kannada: {
      base: 'ನಾಯಿ',
      dative: 'ನಾಯಿಗೆ',
      accusative: 'ನಾಯಿಯನ್ನು',
      locative: 'ನಾಯಿಯಲ್ಲಿ'
    },
    reviewed: false
  },
  {
    id: 'shirt_clothing',
    type: 'clothing',
    english: {
      singular: 'shirt',
      plural: 'shirts',
      countability: 'countable',
      articleRule: 'a'
    },
    hindi: {
      gender: 'f',
      number: 'sg',
      base: 'कमीज़',
      oblique: 'कमीज़'
    },
    kannada: {
      base: 'ಅಂಗಿ',
      dative: 'ಅಂಗಿಗೆ',
      accusative: 'ಅಂಗಿಯನ್ನು',
      locative: 'ಅಂಗಿಯಲ್ಲಿ'
    },
    reviewed: false
  }
];

export const LEXICON_MAP: Record<string, LexiconEntry> = Object.fromEntries(
  LEXICON_ENTRIES.map(e => [e.id, e])
);

export function getLexiconEntry(id: string): LexiconEntry | undefined {
  return LEXICON_MAP[id];
}
