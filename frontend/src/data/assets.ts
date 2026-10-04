export interface CommunicationAsset {
  id: string;
  categoryId: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  alt: string;
  svgIcon: string;
  requiresConfirmation?: boolean;
  reviewed: boolean; // Tracks native speaker review
}

export const COMMUNICATION_ASSETS: CommunicationAsset[] = [
  // Food and Drink
  {
    id: 'pizza',
    categoryId: 'food_drink',
    labels: { en: 'Pizza', kn: 'ಪಿಜ್ಜಾ', hi: 'पिज़्ज़ा' },
    alt: 'Slice of pizza with cheese',
    svgIcon: 'pizza',
    reviewed: true
  },
  {
    id: 'water',
    categoryId: 'food_drink',
    labels: { en: 'Water', kn: 'ನೀರು', hi: 'पानी' },
    alt: 'Glass of clean drinking water',
    svgIcon: 'water',
    reviewed: true
  },
  {
    id: 'rice',
    categoryId: 'food_drink',
    labels: { en: 'Rice', kn: 'ಅನ್ನ', hi: 'चावल' },
    alt: 'Warm bowl of rice',
    svgIcon: 'rice',
    reviewed: true
  },
  {
    id: 'apple',
    categoryId: 'food_drink',
    labels: { en: 'Apple', kn: 'ಸೇಬು', hi: 'सेब' },
    alt: 'Fresh red apple',
    svgIcon: 'apple',
    reviewed: true
  },
  {
    id: 'milk',
    categoryId: 'food_drink',
    labels: { en: 'Milk', kn: 'ಹಾಲು', hi: 'दूध' },
    alt: 'Glass of milk',
    svgIcon: 'milk',
    reviewed: true
  },
  {
    id: 'bread',
    categoryId: 'food_drink',
    labels: { en: 'Bread', kn: 'ರೊಟ್ಟಿ', hi: 'रोटी' },
    alt: 'Loaf or slice of bread',
    svgIcon: 'bread',
    reviewed: true
  },
  {
    id: 'tea',
    categoryId: 'food_drink',
    labels: { en: 'Tea', kn: 'ಚಹಾ', hi: 'चाय' },
    alt: 'Cup of warm tea',
    svgIcon: 'tea',
    reviewed: true
  },
  {
    id: 'snack',
    categoryId: 'food_drink',
    labels: { en: 'Snack', kn: 'ತಿಂಡಿ', hi: 'नाश्ता' },
    alt: 'Small snack bowl',
    svgIcon: 'snack',
    reviewed: true
  },

  // Personal Needs
  {
    id: 'bathroom',
    categoryId: 'personal_needs',
    labels: { en: 'Bathroom', kn: 'ಶೌಚಾಲಯ', hi: 'शौचालय' },
    alt: 'Restroom and toilet facility',
    svgIcon: 'bathroom',
    requiresConfirmation: false,
    reviewed: true
  },
  {
    id: 'wash_hands',
    categoryId: 'personal_needs',
    labels: { en: 'Wash hands', kn: 'ಕೈ ತೊಳೆಯಿರಿ', hi: 'हाथ धोना' },
    alt: 'Washing hands with soap and water',
    svgIcon: 'wash_hands',
    reviewed: true
  },
  {
    id: 'brush_teeth',
    categoryId: 'personal_needs',
    labels: { en: 'Brush teeth', kn: 'ಹಲ್ಲುಜ್ಜುವುದು', hi: 'दांत साफ़ करना' },
    alt: 'Toothbrush and toothpaste',
    svgIcon: 'brush_teeth',
    reviewed: true
  },
  {
    id: 'shower',
    categoryId: 'personal_needs',
    labels: { en: 'Shower', kn: 'ಸ್ನಾನ', hi: 'स्नान' },
    alt: 'Shower water head',
    svgIcon: 'shower',
    reviewed: true
  },

  // Health and Pain (Requires confirmation before speaking)
  {
    id: 'medicine',
    categoryId: 'health',
    labels: { en: 'Medicine', kn: 'ಔಷಧಿ', hi: 'दवा' },
    alt: 'Medicine pill and capsule',
    svgIcon: 'medicine',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'doctor',
    categoryId: 'health',
    labels: { en: 'Doctor', kn: 'ವೈದ್ಯರು', hi: 'डॉक्टर' },
    alt: 'Doctor with stethoscope',
    svgIcon: 'doctor',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'pain',
    categoryId: 'health',
    labels: { en: 'Pain', kn: 'ನೋವು', hi: 'दर्द' },
    alt: 'Lightning symbol representing bodily pain',
    svgIcon: 'pain',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'fever',
    categoryId: 'health',
    labels: { en: 'Fever', kn: 'ಜ್ವರ', hi: 'बुखार' },
    alt: 'Thermometer measuring temperature',
    svgIcon: 'fever',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'tired',
    categoryId: 'health',
    labels: { en: 'Tired', kn: 'ದಣಿವಾಗಿದೆ', hi: 'थकान' },
    alt: 'Person feeling sleepy or tired',
    svgIcon: 'tired',
    reviewed: true
  },
  {
    id: 'sick',
    categoryId: 'health',
    labels: { en: 'Sick', kn: 'ಹುಷಾರಿಲ್ಲ', hi: 'बीमार' },
    alt: 'Person feeling unwell',
    svgIcon: 'sick',
    requiresConfirmation: true,
    reviewed: true
  },

  // Emergency (Requires confirmation before speaking)
  {
    id: 'emergency_help',
    categoryId: 'emergency',
    labels: { en: 'I need help', kn: 'ನನಗೆ ಸಹಾಯ ಬೇಕು', hi: 'मुझे मदद चाहिए' },
    alt: 'Emergency red alert badge',
    svgIcon: 'emergency_help',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'call_ambulance',
    categoryId: 'emergency',
    labels: { en: 'Call ambulance', kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ', hi: 'एम्बुलेंस बुलाएं' },
    alt: 'Emergency ambulance medical vehicle',
    svgIcon: 'ambulance',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'lost',
    categoryId: 'emergency',
    labels: { en: 'I am lost', kn: 'ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ', hi: 'मैं भटक गया हूँ' },
    alt: 'Person looking for directions',
    svgIcon: 'lost',
    requiresConfirmation: true,
    reviewed: true
  },
  {
    id: 'call_family',
    categoryId: 'emergency',
    labels: { en: 'Call family', kn: 'ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ', hi: 'परिवार को कॉल करें' },
    alt: 'Phone call to family member',
    svgIcon: 'phone_call',
    requiresConfirmation: true,
    reviewed: true
  },

  // Feelings
  {
    id: 'happy',
    categoryId: 'feelings',
    labels: { en: 'Happy', kn: 'ಸಂತೋಷ', hi: 'खुश' },
    alt: 'Bright smiling face',
    svgIcon: 'happy',
    reviewed: true
  },
  {
    id: 'sad',
    categoryId: 'feelings',
    labels: { en: 'Sad', kn: 'ದುಃಖ', hi: 'उदास' },
    alt: 'Gentle frowning face',
    svgIcon: 'sad',
    reviewed: true
  },
  {
    id: 'angry',
    categoryId: 'feelings',
    labels: { en: 'Angry', kn: 'ಕೋಪ', hi: 'गुस्सा' },
    alt: 'Frustrated face',
    svgIcon: 'angry',
    reviewed: true
  },
  {
    id: 'calm',
    categoryId: 'feelings',
    labels: { en: 'Calm', kn: 'ಶಾಂತ', hi: 'शांत' },
    alt: 'Peaceful relaxed face',
    svgIcon: 'calm',
    reviewed: true
  },
  {
    id: 'scared',
    categoryId: 'feelings',
    labels: { en: 'Scared', kn: 'ಭಯ', hi: 'डर' },
    alt: 'Anxious face needing comfort',
    svgIcon: 'scared',
    reviewed: true
  },

  // Home & Places
  {
    id: 'home_place',
    categoryId: 'home',
    labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    alt: 'Comfortable family house',
    svgIcon: 'home',
    reviewed: true
  },
  {
    id: 'bed',
    categoryId: 'sleep',
    labels: { en: 'Bed', kn: 'ಹಾಸಿಗೆ', hi: 'बिस्तर' },
    alt: 'Comfortable sleeping bed',
    svgIcon: 'bed',
    reviewed: true
  },
  {
    id: 'sleep',
    categoryId: 'sleep',
    labels: { en: 'Sleep', kn: 'ನಿದ್ರೆ', hi: 'सोना' },
    alt: 'Crescent moon and stars',
    svgIcon: 'moon',
    reviewed: true
  },

  // Family
  {
    id: 'mom',
    categoryId: 'family',
    labels: { en: 'Mom', kn: 'ಅಮ್ಮ', hi: 'माँ' },
    alt: 'Mother figure',
    svgIcon: 'mom',
    reviewed: true
  },
  {
    id: 'dad',
    categoryId: 'family',
    labels: { en: 'Dad', kn: 'ಅಪ್ಪ', hi: 'पापा' },
    alt: 'Father figure',
    svgIcon: 'dad',
    reviewed: true
  },
  {
    id: 'friend',
    categoryId: 'family',
    labels: { en: 'Friend', kn: 'ಸ್ನೇಹಿತ', hi: 'दोस्त' },
    alt: 'Two friends waving',
    svgIcon: 'friend',
    reviewed: true
  },

  // School & Playing
  {
    id: 'book',
    categoryId: 'school',
    labels: { en: 'Book', kn: 'ಪುಸ್ತಕ', hi: 'किताब' },
    alt: 'Open reading book',
    svgIcon: 'book',
    reviewed: true
  },
  {
    id: 'pencil',
    categoryId: 'school',
    labels: { en: 'Pencil', kn: 'ಪೆನ್ಸಿಲ್', hi: 'पेंसिल' },
    alt: 'Drawing pencil',
    svgIcon: 'pencil',
    reviewed: true
  },
  {
    id: 'school_place',
    categoryId: 'school',
    labels: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
    alt: 'School building',
    svgIcon: 'school',
    reviewed: true
  },
  {
    id: 'ball',
    categoryId: 'playing',
    labels: { en: 'Ball', kn: 'ಚೆಂಡು', hi: 'गेंद' },
    alt: 'Playful sports ball',
    svgIcon: 'ball',
    reviewed: true
  },
  {
    id: 'playground_place',
    categoryId: 'playing',
    labels: { en: 'Playground', kn: 'ಆಟದ ಮೈದಾನ', hi: 'खेल का मैदान' },
    alt: 'Playground slide and swing',
    svgIcon: 'playground',
    reviewed: true
  },

  // Travel
  {
    id: 'bus',
    categoryId: 'travel',
    labels: { en: 'Bus', kn: 'ಬಸ್ಸು', hi: 'बस' },
    alt: 'City transit bus',
    svgIcon: 'bus',
    reviewed: true
  },
  {
    id: 'car',
    categoryId: 'travel',
    labels: { en: 'Car', kn: 'ಕಾರು', hi: 'गाड़ी' },
    alt: 'Passenger car',
    svgIcon: 'car',
    reviewed: true
  },

  // Greetings & General
  {
    id: 'hello',
    categoryId: 'greetings',
    labels: { en: 'Hello', kn: 'ನಮಸ್ಕಾರ', hi: 'नमस्ते' },
    alt: 'Waving friendly hand',
    svgIcon: 'wave_hand',
    reviewed: true
  },
  {
    id: 'thank_you',
    categoryId: 'greetings',
    labels: { en: 'Thank you', kn: 'ಧನ್ಯವಾದ', hi: 'धन्यवाद' },
    alt: 'Heartfelt thank you gesture',
    svgIcon: 'thank_you',
    reviewed: true
  },
  {
    id: 'please',
    categoryId: 'greetings',
    labels: { en: 'Please', kn: 'ದಯವಿಟ್ಟು', hi: 'कृपया' },
    alt: 'Polite please gesture',
    svgIcon: 'please',
    reviewed: true
  },
  {
    id: 'yes_card',
    categoryId: 'general',
    labels: { en: 'Yes', kn: 'ಹೌದು', hi: 'हाँ' },
    alt: 'Green check mark confirming yes',
    svgIcon: 'check_yes',
    reviewed: true
  },
  {
    id: 'no_card',
    categoryId: 'general',
    labels: { en: 'No', kn: 'ಇಲ್ಲ', hi: 'नहीं' },
    alt: 'Red cross mark indicating no',
    svgIcon: 'cross_no',
    reviewed: true
  },
  {
    id: 'more_card',
    categoryId: 'general',
    labels: { en: 'More', kn: 'ಇನ್ನಷ್ಟು', hi: 'और' },
    alt: 'Plus sign representing more',
    svgIcon: 'plus_more',
    reviewed: true
  },
  {
    id: 'stop_card',
    categoryId: 'general',
    labels: { en: 'Stop', kn: 'ನಿಲ್ಲಿಸಿ', hi: 'रोको' },
    alt: 'Octagon stop symbol',
    svgIcon: 'stop_sign',
    reviewed: true
  },

  // Adult Life Specific
  {
    id: 'work_place',
    categoryId: 'work',
    labels: { en: 'Work', kn: 'ಕೆಲಸ', hi: 'काम' },
    alt: 'Office desk and computer',
    svgIcon: 'briefcase',
    reviewed: true
  },
  {
    id: 'meeting',
    categoryId: 'work',
    labels: { en: 'Meeting', kn: 'ಸಭೆ', hi: 'मीटिंग' },
    alt: 'Conference room table',
    svgIcon: 'meeting',
    reviewed: true
  },
  {
    id: 'college_place',
    categoryId: 'college',
    labels: { en: 'College', kn: 'ಕಾಲೇಜು', hi: 'कॉलेज' },
    alt: 'College building',
    svgIcon: 'college',
    reviewed: true
  },
  {
    id: 'shopping_card',
    categoryId: 'shopping',
    labels: { en: 'Shop', kn: 'ಅಂಗಡಿ', hi: 'दुकान' },
    alt: 'Shopping grocery cart',
    svgIcon: 'cart',
    reviewed: true
  },
  {
    id: 'public_place_card',
    categoryId: 'public_places',
    labels: { en: 'Public place', kn: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳ', hi: 'सार्वजनिक स्थान' },
    alt: 'Public building with columns',
    svgIcon: 'building',
    reviewed: true
  }
];

export function getAssetById(id: string): CommunicationAsset | undefined {
  return COMMUNICATION_ASSETS.find(item => item.id === id);
}

export function getAssetsByCategory(categoryId: string): CommunicationAsset[] {
  return COMMUNICATION_ASSETS.filter(item => item.categoryId === categoryId);
}
