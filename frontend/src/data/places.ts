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
    relatedCategory: 'food_drink'
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
    relatedCategory: 'playing'
  },
  {
    id: 'hospital',
    labels: { en: 'Hospital', kn: 'ಆಸ್ಪತ್ರೆ', hi: 'अस्पताल' },
    desc: { en: 'Doctors, medicine and feeling better', kn: 'ವೈದ್ಯರು, ಔಷಧಿ ಮತ್ತು ಚೇತರಿಕೆ', hi: 'डॉक्टर, दवा और इलाज' },
    iconName: 'HeartPulse',
    color: '#E0F2F1',
    borderColor: '#00897B',
    textColor: '#0B5351',
    relatedCategory: 'health'
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
