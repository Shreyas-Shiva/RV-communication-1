export interface PlaceItem {
  id: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  desc: {
    en: string;
    kn: string;
    hi: string;
  };
  iconName: string;
  color: string;
  borderColor: string;
  textColor: string;
  relatedCategory: string;
}

export const CHILD_PLACES: PlaceItem[] = [
  {
    id: 'kitchen',
    labels: { en: 'Kitchen', kn: 'ಅಡುಗೆ ಮನೆ', hi: 'रसोई' },
    desc: { en: 'Food, drinks, snacks and meals', kn: 'ಆಹಾರ, ನೀರು, ತಿಂಡಿ ಮತ್ತು ಊಟ', hi: 'खाना, पानी और नाश्ता' },
    iconName: 'Utensils',
    color: '#FFE8D6',
    borderColor: '#F39A59',
    textColor: '#8D4004',
    relatedCategory: 'food'
  },
  {
    id: 'home',
    labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    desc: { en: 'Bed, family, toys and quiet spaces', kn: 'ಹಾಸಿಗೆ, ಕುಟುಂಬ, ಆಟಿಕೆಗಳು', hi: 'बिस्तर, परिवार और खिलौने' },
    iconName: 'Home',
    color: '#E2EFCB',
    borderColor: '#7EAE49',
    textColor: '#2B5E1E',
    relatedCategory: 'home'
  },
  {
    id: 'school',
    labels: { en: 'School', kn: 'ಶಾಲೆ', hi: 'स्कूल' },
    desc: { en: 'Books, pencils, teachers and learning', kn: 'ಪುಸ್ತಕಗಳು, ಪೆನ್ಸಿಲ್, ಶಿಕ್ಷಕರು', hi: 'किताबें, पेंसिल और शिक्षक' },
    iconName: 'GraduationCap',
    color: '#FFF2C6',
    borderColor: '#FFC83B',
    textColor: '#7A5400',
    relatedCategory: 'school'
  },
  {
    id: 'playground',
    labels: { en: 'Playground', kn: 'ಆಟದ ಮೈದಾನ', hi: 'खेल का मैदान' },
    desc: { en: 'Balls, swings, slides and friends', kn: 'ಚೆಂಡು, ಆಟಗಳು ಮತ್ತು ಗೆಳೆಯರು', hi: 'गेंद, झूले और दोस्त' },
    iconName: 'Gamepad2',
    color: '#D8F3DC',
    borderColor: '#52B788',
    textColor: '#1B6A47',
    relatedCategory: 'play'
  },
  {
    id: 'hospital',
    labels: { en: 'Hospital', kn: 'ಆಸ್ಪತ್ರೆ', hi: 'अस्पताल' },
    desc: { en: 'Doctors, medicine and feeling better', kn: 'ವೈದ್ಯರು, ಔಷಧಿ ಮತ್ತು ಚೇತರಿಕೆ', hi: 'डॉक्टर, दवा और इलाज' },
    iconName: 'HeartPulse',
    color: '#E0F2F1',
    borderColor: '#00897B',
    textColor: '#0B5351',
    relatedCategory: 'body_health'
  },
  {
    id: 'shop',
    labels: { en: 'Shop', kn: 'ಅಂಗಡಿ', hi: 'दुकान' },
    desc: { en: 'Buying snacks, toys and groceries', kn: 'ತಿಂಡಿ ಮತ್ತು ದಿನಸಿ ಖರೀದಿ', hi: 'नाश्ता और सामान खरीदना' },
    iconName: 'ShoppingCart',
    color: '#FDE4CF',
    borderColor: '#F48C06',
    textColor: '#7C3E1D',
    relatedCategory: 'shopping'
  },
  {
    id: 'bus_stop',
    labels: { en: 'Bus Stop', kn: 'ಬಸ್ ನಿಲ್ದಾಣ', hi: 'बस स्टॉप' },
    desc: { en: 'Riding the bus, cars and roads', kn: 'ಬಸ್ಸು, ಕಾರು ಮತ್ತು ಪ್ರಯಾಣ', hi: 'बस, गाड़ी और यात्रा' },
    iconName: 'Bus',
    color: '#DCEBFA',
    borderColor: '#4EA8DE',
    textColor: '#184E77',
    relatedCategory: 'travel'
  },
  {
    id: 'feelings_garden',
    labels: { en: 'Feelings Garden', kn: 'ಭಾವನೆಗಳ ತೋಟ', hi: 'भावनाओं का बगीचा' },
    desc: { en: 'Happy, sad, tired and calm words', kn: 'ಸಂತೋಷ, ದುಃಖ, ದಣಿವು ಮತ್ತು ಶಾಂತಿ', hi: 'खुशी, उदासी और शांति के शब्द' },
    iconName: 'Smile',
    color: '#FDE2E4',
    borderColor: '#E56B6F',
    textColor: '#832838',
    relatedCategory: 'feelings'
  }
];

export const ADULT_SITUATIONS: PlaceItem[] = [
  {
    id: 'dining',
    labels: { en: 'Meals & Dining', kn: 'ಊಟ ಮತ್ತು ಉಪಾಹಾರ', hi: 'भोजन और नाश्ता' },
    desc: { en: 'Food, drinks, snacks and dining', kn: 'ಆಹಾರ, ನೀರು ಮತ್ತು ಊಟದ ಮಾತುಕತೆ', hi: 'खाना, पानी और भोजन की बातें' },
    iconName: 'Utensils',
    color: '#FFE0C2',
    borderColor: '#D9731A',
    textColor: '#8D4004',
    relatedCategory: 'food'
  },
  {
    id: 'health',
    labels: { en: 'Health & Clinic', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ಚಿಕಿತ್ಸೆ', hi: 'स्वास्थ्य और क्लिनिक' },
    desc: { en: 'Doctor visits, pain, medicine and symptoms', kn: 'ವೈದ್ಯರು, ನೋವು, ಔಷಧಿ ಮತ್ತು ಲಕ್ಷಣಗಳು', hi: 'डॉक्टर, दर्द, दवा और लक्षण' },
    iconName: 'HeartPulse',
    color: '#FFE5E5',
    borderColor: '#D62828',
    textColor: '#7A1C1C',
    relatedCategory: 'body_health'
  },
  {
    id: 'home_daily',
    labels: { en: 'At Home', kn: 'ಮನೆಯಲ್ಲಿ', hi: 'घर पर' },
    desc: { en: 'Family routines, comfort and daily needs', kn: 'ಕುಟುಂಬ, ವಿಶ್ರಾಂತಿ ಮತ್ತು ನಿತ್ಯದ ಅಗತ್ಯಗಳು', hi: 'परिवार, आराम और दैनिक जरूरतें' },
    iconName: 'Home',
    color: '#EFE6CF',
    borderColor: '#8F7A3E',
    textColor: '#574618',
    relatedCategory: 'home'
  },
  {
    id: 'errands',
    labels: { en: 'Shopping & Store', kn: 'ಶಾಪಿಂಗ್ ಮತ್ತು ಅಂಗಡಿ', hi: 'खरीदारी और बाज़ार' },
    desc: { en: 'Groceries, paying, asking for items', kn: 'ದಿನಸಿ, ಹಣ ಪಾವತಿ ಮತ್ತು ಸಾಮಗ್ರಿಗಳು', hi: 'किराना, भुगतान और सामान' },
    iconName: 'ShoppingCart',
    color: '#FFE0C2',
    borderColor: '#D9731A',
    textColor: '#8D4004',
    relatedCategory: 'shopping'
  },
  {
    id: 'transit',
    labels: { en: 'Travel & Transit', kn: 'ಪ್ರಯಾಣ ಮತ್ತು ವಾಹನ', hi: 'यात्रा और परिवहन' },
    desc: { en: 'Bus, taxi, directions and places to go', kn: 'ಬಸ್ಸು, ಟ್ಯಾಕ್ಸಿ ಮತ್ತು ರಸ್ತೆ ಮಾರ್ಗಗಳು', hi: 'बस, गाड़ी और यात्रा' },
    iconName: 'Bus',
    color: '#D3E8FA',
    borderColor: '#2F78BD',
    textColor: '#184E77',
    relatedCategory: 'travel'
  },
  {
    id: 'mood',
    labels: { en: 'Feelings & State', kn: 'ಭಾವನೆಗಳು ಮತ್ತು ಮನಸ್ಥಿತಿ', hi: 'भावनाएँ और मनःस्थिति' },
    desc: { en: 'Calm, tired, happy, needing a break', kn: 'ನೆಮ್ಮದಿ, ಆಯಾಸ, ಸಂತೋಷ, ವಿಶ್ರಾಂತಿ ಬೇಕು', hi: 'शांति, थकान, खुशी, आराम चाहिए' },
    iconName: 'Smile',
    color: '#FFD9E0',
    borderColor: '#C23B5E',
    textColor: '#73172E',
    relatedCategory: 'feelings'
  },
  {
    id: 'community',
    labels: { en: 'People & Social', kn: 'ಜನರು ಮತ್ತು ಪರಿಚಯಸ್ಥರು', hi: 'लोग और सामाजिक संबंध' },
    desc: { en: 'Friends, helpers, family and greetings', kn: 'ಸ್ನೇಹಿತರು, ಸಹಾಯಕರು ಮತ್ತು ಕುಟುಂಬ', hi: 'दोस्त, मददगार और परिवार' },
    iconName: 'Users',
    color: '#FFF1B8',
    borderColor: '#C99A00',
    textColor: '#664E00',
    relatedCategory: 'people'
  },
  {
    id: 'questions_needs',
    labels: { en: 'Questions & Help', kn: 'ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಸಹಾಯ', hi: 'सवाल और मदद' },
    desc: { en: 'Who, what, where, when and asking help', kn: 'ಯಾರು, ಏನು, ಎಲ್ಲಿ, ಯಾವಾಗ ಮತ್ತು ಸಹಾಯ ಕೇಳುವುದು', hi: 'कौन, क्या, कहाँ, कब और सहायता माँगना' },
    iconName: 'HelpCircle',
    color: '#CFEFEF',
    borderColor: '#0A6C6E',
    textColor: '#085557',
    relatedCategory: 'questions'
  }
];
