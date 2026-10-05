export type LanguageCode = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml';
export type UserMode = 'child' | 'student' | 'adult';

export interface Translations {
  appName: string;
  tagline: string;
  supportingLine: string;

  // Common UI
  back: string;
  speakAgain: string;
  speak: string;
  stop: string;
  speaking: string;
  save: string;
  delete: string;
  favorite: string;
  cancel: string;
  confirm: string;
  close: string;
  continue: string;
  yes: string;
  no: string;
  edit: string;
  share: string;
  print: string;
  export: string;
  clear: string;
  search: string;

  // Onboarding & First two screens
  chooseLanguageTitle: string;
  chooseLanguageHelper: string;
  whoIsUsingTitle: string;
  whoIsUsingHelper: string;
  childTitle: string;
  childDesc: string;
  studentTitle: string;
  studentDesc: string;
  adultTitle: string;
  adultDesc: string;
  parentalConsentTitle: string;
  parentalConsentDesc: string;
  parentalConsentAgree: string;
  changeChoiceAnytime: string;

  // Navigation
  home: string;
  communicate: string;
  talk: string;
  practice: string;
  myDay: string;
  settings: string;
  emergency: string;
  privacy: string;
  terms: string;

  // Helper lines - one short natural instruction per screen
  helperWhereAmI: string;
  helperWhatCanISay: string;
  helperWhatShouldITap: string;
  helperWhatHappensNext: string;
  homeInstruction: string;
  communicateInstruction: string;
  talkInstruction: string;
  practiceInstruction: string;
  myDayInstruction: string;
  settingsInstruction: string;
  emergencyInstruction: string;

  // New settings
  speakOnTapLabel: string;
  speakOnTapDesc: string;
  screenDensityLabel: string;
  densityCompact: string;
  densityComfortable: string;
  densityLarge: string;
  wordingForMeLabel: string;
  wordingNeutral: string;
  wordingMasculine: string;
  wordingFeminine: string;

  // Sentence Tray
  sentenceTrayTitle: string;
  sayIt: string;
  makeItASentence: string;
  undo: string;
  trayFullNotice: string;

  // Continuation & You could say
  youCouldSayTitle: string;
  moreIdeasTitle: string;
  keepGoingTitle: string;
  repairTitle: string;

  // Home Screen
  childGreeting: string;
  studentGreeting: string;
  adultGreeting: string;
  saySomethingButton: string;
  chooseAndSay: string;
  chooseAndSayDesc: string;
  talkWithSomeone: string;
  talkWithSomeoneDesc: string;
  quickSayTitle: string;
  favoritesTitle: string;
  recentSpoken: string;
  placesMapTitle: string;
  placesMapDesc: string;

  // Core Communicate & Intents
  whatDoYouWantToSay: string;
  tapIntentHelper: string;
  sentenceReady: string;
  somethingElse: string;
  typeWhatYouWantToSay: string;
  typePlaceholder: string;

  // Missing Voice
  missingVoiceTitle: string;
  missingVoiceDesc: string;
  missingVoiceHowToFix: string;
  continueWithTextOnly: string;

  // Emergency
  emergencyTitle: string;
  emergencyHelper: string;
  emergencyConfirmPrompt: string;
  iNeedHelp: string;
  iNeedDoctor: string;
  callAmbulance: string;
  callFamily: string;
  iAmLost: string;
  iAmHurt: string;
  pleaseStay: string;

  // Quick Needs (Child permanent bottom bar)
  water: string;
  food: string;
  bathroom: string;
  help: string;
  tired: string;
  sick: string;
  parents: string;
  homePlace: string;

  // Places (Child map)
  kitchen: string;
  school: string;
  playground: string;
  hospital: string;
  shop: string;
  busStop: string;
  feelingsGarden: string;

  // Categories
  foodDrink: string;
  homeCat: string;
  schoolCat: string;
  playingCat: string;
  travelCat: string;
  shoppingCat: string;
  healthCat: string;
  feelingsCat: string;
  familyCat: string;
  greetingsCat: string;
  emergencyCat: string;
  sleepCat: string;
  personalNeedsCat: string;
  generalCat: string;

  // Adult Categories
  work: string;
  college: string;
  travelAdult: string;
  shoppingAdult: string;
  healthcareAdult: string;
  publicPlaces: string;
  familyAdult: string;
  social: string;
  emergencyAdult: string;
  independentLiving: string;

  // My Day Log
  myDayTitle: string;
  myDayDesc: string;
  today: string;
  yesterday: string;
  earlierDays: string;
  mostUsedPhrases: string;
  todaysWords: string;
  dailySummaryTitle: string;
  totalPhrasesSpoken: string;
  topCategories: string;
  deleteAllData: string;
  deleteAllDataConfirm: string;
  exportJson: string;
  printView: string;
  emptyLog: string;

  // Settings
  settingsTitle: string;
  settingsDesc: string;
  languageSection: string;
  userModeSection: string;
  speechSpeed: string;
  speechVoice: string;
  textSize: string;
  buttonSize: string;
  highContrast: string;
  darkMode: string;
  reducedMotion: string;
  soundEffects: string;
  largeAndSimple: string;

  // Mascot Messages
  mascotEncouragement1: string;
  mascotEncouragement2: string;
  mascotEncouragement3: string;
  mascotEncouragement4: string;
}
