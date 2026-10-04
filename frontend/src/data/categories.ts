export interface Category {
  id: string;
  name: {
    en: string;
    kn: string;
    hi: string;
  };
  color: string;
  textColor: string;
  borderColor: string;
  iconName: string;
  forModes: ('child' | 'student' | 'adult')[];
}

// 14 Core Categories plus Adult & Elder Life Categories
// Flat colors only: solid accessible tones, high contrast WCAG AA compliant
export const CATEGORIES: Category[] = [
  {
    id: 'food_drink',
    name: {
      en: 'Food and Drink',
      kn: 'ಆಹಾರ ಮತ್ತು ಪಾನೀಯ',
      hi: 'भोजन और पेय'
    },
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59',
    iconName: 'Utensils',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'home',
    name: {
      en: 'Home',
      kn: 'ಮನೆ',
      hi: 'घर'
    },
    color: '#E2EFCB',
    textColor: '#2B5E1E',
    borderColor: '#7EAE49',
    iconName: 'Home',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'school',
    name: {
      en: 'School',
      kn: 'ಶಾಲೆ',
      hi: 'स्कूल'
    },
    color: '#FFF2C6',
    textColor: '#7A5400',
    borderColor: '#FFC83B',
    iconName: 'GraduationCap',
    forModes: ['child', 'student']
  },
  {
    id: 'playing',
    name: {
      en: 'Playing',
      kn: 'ಆಟ',
      hi: 'खेल'
    },
    color: '#D8F3DC',
    textColor: '#1B6A47',
    borderColor: '#52B788',
    iconName: 'Gamepad2',
    forModes: ['child', 'student']
  },
  {
    id: 'travel',
    name: {
      en: 'Travel',
      kn: 'ಪ್ರಯಾಣ',
      hi: 'यात्रा'
    },
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE',
    iconName: 'Bus',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'shopping',
    name: {
      en: 'Shopping',
      kn: 'ಖರೀದಿ',
      hi: 'खरीदारी'
    },
    color: '#FDE4CF',
    textColor: '#7C3E1D',
    borderColor: '#F48C06',
    iconName: 'ShoppingCart',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'health',
    name: {
      en: 'Health',
      kn: 'ಆರೋಗ್ಯ',
      hi: 'स्वास्थ्य'
    },
    color: '#E0F2F1',
    textColor: '#0B5351',
    borderColor: '#00897B',
    iconName: 'HeartPulse',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'feelings',
    name: {
      en: 'Feelings',
      kn: 'ಭಾವನೆಗಳು',
      hi: 'भावनाएं'
    },
    color: '#FDE2E4',
    textColor: '#832838',
    borderColor: '#E56B6F',
    iconName: 'Smile',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'family',
    name: {
      en: 'Family',
      kn: 'ಕುಟುಂಬ',
      hi: 'परिवार'
    },
    color: '#E8F5E9',
    textColor: '#1E4620',
    borderColor: '#43A047',
    iconName: 'Users',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'greetings',
    name: {
      en: 'Greetings',
      kn: 'ಶುಭಾಶಯಗಳು',
      hi: 'अभिवादन'
    },
    color: '#FEF9EF',
    textColor: '#574100',
    borderColor: '#FFB703',
    iconName: 'Hand',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'emergency',
    name: {
      en: 'Emergency',
      kn: 'ತುರ್ತು',
      hi: 'आपातकाल'
    },
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828',
    iconName: 'AlertTriangle',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'sleep',
    name: {
      en: 'Sleep',
      kn: 'ನಿದ್ರೆ',
      hi: 'नींद'
    },
    color: '#EBF4F6',
    textColor: '#1F4E5B',
    borderColor: '#468FAF',
    iconName: 'Moon',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'personal_needs',
    name: {
      en: 'Personal Needs',
      kn: 'ವೈಯಕ್ತಿಕ ಅಗತ್ಯಗಳು',
      hi: 'व्यक्तिगत ज़रूरतें'
    },
    color: '#EDF6F9',
    textColor: '#1D4E5B',
    borderColor: '#83C5BE',
    iconName: 'CheckSquare',
    forModes: ['child', 'student', 'adult']
  },
  {
    id: 'general',
    name: {
      en: 'General',
      kn: 'ಸಾಮಾನ್ಯ',
      hi: 'सामान्य'
    },
    color: '#F4F1DE',
    textColor: '#3D405B',
    borderColor: '#989788',
    iconName: 'MessageSquare',
    forModes: ['child', 'student', 'adult']
  },
  // Adult & Elder specialized categories
  {
    id: 'work',
    name: {
      en: 'Work',
      kn: 'ಕೆಲಸ',
      hi: 'काम'
    },
    color: '#E2E8F0',
    textColor: '#1E293B',
    borderColor: '#64748B',
    iconName: 'Briefcase',
    forModes: ['adult']
  },
  {
    id: 'college',
    name: {
      en: 'College',
      kn: 'ಕಾಲೇಜು',
      hi: 'कॉलेज'
    },
    color: '#FEF3C7',
    textColor: '#78350F',
    borderColor: '#D97706',
    iconName: 'BookOpen',
    forModes: ['student', 'adult']
  },
  {
    id: 'public_places',
    name: {
      en: 'Public Places',
      kn: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳು',
      hi: 'सार्वजनिक स्थान'
    },
    color: '#E0E7FF',
    textColor: '#1E3A8A',
    borderColor: '#3B82F6',
    iconName: 'Building',
    forModes: ['adult']
  },
  {
    id: 'independent_living',
    name: {
      en: 'Independent Living',
      kn: 'ಸ್ವತಂತ್ರ ಜೀವನ',
      hi: 'स्वतंत्र जीवन'
    },
    color: '#CCFBF1',
    textColor: '#115E59',
    borderColor: '#0D9488',
    iconName: 'Key',
    forModes: ['adult']
  }
];
