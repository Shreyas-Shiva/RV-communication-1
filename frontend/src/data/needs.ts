export interface QuickNeed {
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
  assetId: string;
  intentId: string;
  requiresConfirm?: boolean;
}

// Permanent bottom Quick Needs bar for Child mode:
// Water, Food, Bathroom, Help, Tired, Sick, Mom or Dad, Home
export const QUICK_NEEDS: QuickNeed[] = [
  {
    id: 'need_water',
    labels: { en: 'Water', kn: 'ನೀರು', hi: 'पानी' },
    iconName: 'Droplets',
    color: '#DCEBFA',
    textColor: '#184E77',
    borderColor: '#4EA8DE',
    assetId: 'water',
    intentId: 'want'
  },
  {
    id: 'need_food',
    labels: { en: 'Food', kn: 'ಆಹಾರ', hi: 'खाना' },
    iconName: 'Utensils',
    color: '#FFE8D6',
    textColor: '#8D4004',
    borderColor: '#F39A59',
    assetId: 'snack',
    intentId: 'hungry'
  },
  {
    id: 'need_bathroom',
    labels: { en: 'Bathroom', kn: 'ಶೌಚಾಲಯ', hi: 'शौचालय' },
    iconName: 'DoorClosed',
    color: '#EDF6F9',
    textColor: '#1D4E5B',
    borderColor: '#83C5BE',
    assetId: 'bathroom',
    intentId: 'want'
  },
  {
    id: 'need_help',
    labels: { en: 'Help', kn: 'ಸಹಾಯ', hi: 'मदद' },
    iconName: 'HelpCircle',
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828',
    assetId: 'emergency_help',
    intentId: 'want',
    requiresConfirm: true
  },
  {
    id: 'need_tired',
    labels: { en: 'Tired', kn: 'ದಣಿವಾಗಿದೆ', hi: 'थकान' },
    iconName: 'Moon',
    color: '#EBF4F6',
    textColor: '#1F4E5B',
    borderColor: '#468FAF',
    assetId: 'tired',
    intentId: 'want'
  },
  {
    id: 'need_sick',
    labels: { en: 'Sick', kn: 'ಹುಷಾರಿಲ್ಲ', hi: 'बीमार' },
    iconName: 'HeartPulse',
    color: '#FEE2E2',
    textColor: '#991B1B',
    borderColor: '#D62828',
    assetId: 'sick',
    intentId: 'want',
    requiresConfirm: true
  },
  {
    id: 'need_parents',
    labels: { en: 'Mom / Dad', kn: 'ಅಮ್ಮ / ಅಪ್ಪ', hi: 'मम्मी / पापा' },
    iconName: 'Users',
    color: '#E8F5E9',
    textColor: '#1E4620',
    borderColor: '#43A047',
    assetId: 'mom',
    intentId: 'want'
  },
  {
    id: 'need_home',
    labels: { en: 'Home', kn: 'ಮನೆ', hi: 'घर' },
    iconName: 'Home',
    color: '#E2EFCB',
    textColor: '#2B5E1E',
    borderColor: '#7EAE49',
    assetId: 'home_place',
    intentId: 'want'
  }
];
