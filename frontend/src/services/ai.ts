import { UserMode } from '../translations/types';

export interface PredictedOption {
  pictogramKeyword: string;
  label: string;
  spokenText: string;
  intent: string;
  sensitive: boolean;
}

export interface PredictionResult {
  responses: PredictedOption[];
  providerUsed: string;
  cached: boolean;
  safetyTriggered: boolean;
}

export interface ConversationTurnPayload {
  speaker: 'other' | 'user';
  text: string;
  time: number | string;
}

export interface ConversationContextPayload {
  language: string;
  ageGroup: UserMode;
  conversationId: string;
  messages: ConversationTurnPayload[];
  currentTopic?: string;
  enableAI?: boolean;
  demoMode?: boolean;
}

export interface ServiceStatus {
  groq: 'working' | 'not_configured' | 'rate_limited';
  gemini: 'working' | 'not_configured' | 'rate_limited';
  localFallback: 'working';
  speechRecognition: 'working';
  whisper: 'working' | 'not_configured';
  activeProvider: string;
}

// ----------------------------------------------------------------------
// Offline Rule-Based Predictions (100% functional without network)
// ----------------------------------------------------------------------

function getLocalOfflinePredictions(context: ConversationContextPayload): PredictedOption[] {
  const lang = context.language.toLowerCase();
  const isKn = lang.includes('kn');
  const isHi = lang.includes('hi');
  const isChild = context.ageGroup === 'child';

  // Last turn from speaking partner
  let lastPartnerText = '';
  for (let i = context.messages.length - 1; i >= 0; i--) {
    if (context.messages[i].speaker === 'other') {
      lastPartnerText = context.messages[i].text.toLowerCase();
      break;
    }
  }

  // Detect already spoken phrases by user to prevent repeats
  const userSpoken = new Set(
    context.messages.filter(m => m.speaker === 'user').map(m => m.text.toLowerCase().trim())
  );

  let options: PredictedOption[] = [];

  // 1. Food / Hunger
  if (/hungry|eat|food|lunch|dinner|breakfast|ಹಸಿವು|ಊಟ|ತಿಂಡಿ|ತಿನ್ನಲು|भूख|खाना|नाश्ता/.test(lastPartnerText)) {
    // If user already said hungry, suggest food items
    const alreadySaidHungry = Array.from(userSpoken).some(t => /hungry|ಹಸಿವಾಗಿದೆ|भूख/.test(t));
    if (alreadySaidHungry) {
      if (isKn) {
        options = [
          { pictogramKeyword: 'pizza', label: 'ಪಿಜ್ಜಾ', spokenText: isChild ? 'ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.' : 'ದಯವಿಟ್ಟು ನನಗೆ ಪಿಜ್ಜಾ ಕೊಡುತ್ತೀರಾ?', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'rice', label: 'ಅನ್ನ / ಊಟ', spokenText: 'ನನಗೆ ಬಿಸಿ ಅನ್ನ ಮತ್ತು ಊಟ ಬೇಕು.', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'bread', label: 'ಸ್ಯಾಂಡ್ವಿಚ್', spokenText: 'ನನಗೆ ಲಘು ಉಪಹಾರ ಅಥವಾ ಸ್ಯಾಂಡ್ವಿಚ್ ಸಾಕು.', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'apple', label: 'ಹಣ್ಣುಗಳು', spokenText: 'ನಾನು ತಾಜಾ ಹಣ್ಣುಗಳನ್ನು ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.', intent: 'choose', sensitive: false },
        ];
      } else if (isHi) {
        options = [
          { pictogramKeyword: 'pizza', label: 'पिज़्ज़ा', spokenText: isChild ? 'मुझे पिज़्ज़ा चाहिए।' : 'कृपया मुझे पिज़्ज़ा दीजिए।', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'rice', label: 'चावल', spokenText: 'मैं चावल और सादा खाना खाना चाहता हूँ।', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'bread', label: 'सैंडविच', spokenText: 'मुझे सैंडविच या हल्का नाश्ता चाहिए।', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'apple', label: 'फल', spokenText: 'मुझे ताजे फल खाने हैं।', intent: 'choose', sensitive: false },
        ];
      } else {
        options = [
          { pictogramKeyword: 'pizza', label: 'Pizza', spokenText: isChild ? 'I want pizza!' : 'I would like some pizza, please.', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'rice', label: 'Rice', spokenText: 'I would prefer a rice dish, please.', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'bread', label: 'Sandwich', spokenText: 'A sandwich sounds very nice, thank you.', intent: 'choose', sensitive: false },
          { pictogramKeyword: 'apple', label: 'Fruit', spokenText: 'I would like some fresh fruit, please.', intent: 'choose', sensitive: false },
        ];
      }
    } else {
      if (isKn) {
        options = [
          { pictogramKeyword: 'pizza', label: 'ಹಸಿವಾಗಿದೆ', spokenText: 'ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ಊಟ ಬೇಕು.', intent: 'want', sensitive: false },
          { pictogramKeyword: 'food', label: 'ಆಹಾರ ಬೇಕು', spokenText: 'ನಾನು ಏನಾದರೂ ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.', intent: 'want', sensitive: false },
          { pictogramKeyword: 'no', label: 'ಹಸಿವಿಲ್ಲ', spokenText: 'ಇಲ್ಲ, ನನಗೆ ಈಗ ಹಸಿವಿಲ್ಲ.', intent: 'decline', sensitive: false },
          { pictogramKeyword: 'water', label: 'ಬಾಯಾರಿಕೆ', spokenText: 'ನನಗೆ ಹಸಿವಿಲ್ಲ, ಆದರೆ ನೀರು ಬೇಕು.', intent: 'want', sensitive: false },
        ];
      } else if (isHi) {
        options = [
          { pictogramKeyword: 'pizza', label: 'भूख लगी है', spokenText: 'हाँ, मुझे भूख लगी है।', intent: 'want', sensitive: false },
          { pictogramKeyword: 'food', label: 'खाना चाहिए', spokenText: 'मुझे कुछ खाने के लिए चाहिए।', intent: 'want', sensitive: false },
          { pictogramKeyword: 'no', label: 'भूख नहीं है', spokenText: 'नहीं, मुझे अभी भूख नहीं है।', intent: 'decline', sensitive: false },
          { pictogramKeyword: 'water', label: 'प्यास लगी है', spokenText: 'मुझे भूख नहीं, प्यास लगी है।', intent: 'want', sensitive: false },
        ];
      } else {
        options = [
          { pictogramKeyword: 'pizza', label: 'Yes I am hungry', spokenText: isChild ? 'Yes, I am hungry!' : 'Yes, I am hungry. I would like food.', intent: 'want', sensitive: false },
          { pictogramKeyword: 'food', label: 'I want food', spokenText: 'I would like something to eat, please.', intent: 'want', sensitive: false },
          { pictogramKeyword: 'no', label: 'No I am not hungry', spokenText: 'No thank you, I am not hungry right now.', intent: 'decline', sensitive: false },
          { pictogramKeyword: 'water', label: 'I am thirsty', spokenText: 'I am not hungry, but I am thirsty.', intent: 'want', sensitive: false },
        ];
      }
    }
  }
  // 2. Drink / Thirst
  else if (/drink|water|thirsty|juice|tea|ನೀರು|ಕುಡಿಯಲು|ಬಾಯಾರಿಕೆ|पानी|प्यास|चाय/.test(lastPartnerText)) {
    if (isKn) {
      options = [
        { pictogramKeyword: 'water', label: 'ನೀರು ಕೊಡಿ', spokenText: 'ದಯವಿಟ್ಟು ನನಗೆ ಕುಡಿಯಲು ನೀರು ಕೊಡಿ.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'milk', label: 'ಜ್ಯೂಸ್ / ಹಾಲು', spokenText: 'ನನಗೆ ಹಾಲು ಅಥವಾ ಜ್ಯೂಸ್ ಬೇಕು.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'tea', label: 'ಬಿಸಿ ಚಹಾ', spokenText: 'ನನಗೆ ಒಂದು ಕಪ್ ಬಿಸಿ ಚಹಾ ಬೇಕು.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'no', label: 'ಬೇಡ ಧನ್ಯವಾದ', spokenText: 'ಇಲ್ಲ, ಈಗ ಏನೂ ಬೇಡ ಧನ್ಯವಾದಗಳು.', intent: 'decline', sensitive: false },
      ];
    } else if (isHi) {
      options = [
        { pictogramKeyword: 'water', label: 'पानी चाहिए', spokenText: 'कृपया मुझे पीने के लिए पानी दीजिए।', intent: 'want', sensitive: false },
        { pictogramKeyword: 'milk', label: 'जूस या दूध', spokenText: 'मुझे ठंडा जूस या दूध चाहिए।', intent: 'want', sensitive: false },
        { pictogramKeyword: 'tea', label: 'चाय', spokenText: 'मुझे एक कप गर्म चाय चाहिए।', intent: 'want', sensitive: false },
        { pictogramKeyword: 'no', label: 'नहीं धन्यवाद', spokenText: 'नहीं धन्यवाद, अभी कुछ नहीं चाहिए।', intent: 'decline', sensitive: false },
      ];
    } else {
      options = [
        { pictogramKeyword: 'water', label: 'Water please', spokenText: isChild ? 'Water please!' : 'I would like some water, please.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'milk', label: 'Juice please', spokenText: 'I would like some cold juice, please.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'tea', label: 'Warm tea', spokenText: 'A cup of warm tea would be nice.', intent: 'want', sensitive: false },
        { pictogramKeyword: 'no', label: 'No thank you', spokenText: 'No thank you, I have enough to drink.', intent: 'decline', sensitive: false },
      ];
    }
  }
  // 3. School & Homework
  else if (/homework|school|study|assignment|class|ಶಾಲೆ|ಪಾಠ|ಮನೆಕೆಲಸ|गृहकार्य|होमवर्क|स्कूल/.test(lastPartnerText)) {
    if (isKn) {
      options = [
        { pictogramKeyword: 'yes', label: 'ಮುಗಿಸಿದ್ದೇನೆ', spokenText: 'ಹೌದು, ನಾನು ಮನೆಕೆಲಸ ಮುಗಿಸಿದ್ದೇನೆ.', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'ಇನ್ನೂ ಇಲ್ಲ', spokenText: 'ಇಲ್ಲ, ಇನ್ನೂ ಮುಗಿದಿಲ್ಲ.', intent: 'status', sensitive: false },
        { pictogramKeyword: 'help', label: 'ಸಹಾಯ ಬೇಕು', spokenText: 'ನನಗೆ ಈ ಪಾಠದಲ್ಲಿ ಸ್ವಲ್ಪ ಸಹಾಯ ಬೇಕು.', intent: 'request', sensitive: false },
        { pictogramKeyword: 'home', label: 'ನಂತರ ಮಾಡುವೆ', spokenText: 'ನಾನು ಇದನ್ನು ನಂತರ ಮಾಡುತ್ತೇನೆ.', intent: 'delay', sensitive: false },
      ];
    } else if (isHi) {
      options = [
        { pictogramKeyword: 'yes', label: 'पूरा कर लिया', spokenText: 'हाँ, मैंने अपना होमवर्क पूरा कर लिया है।', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'अभी नहीं', spokenText: 'नहीं, अभी पूरा नहीं हुआ है।', intent: 'status', sensitive: false },
        { pictogramKeyword: 'help', label: 'मदद चाहिए', spokenText: 'मुझे इसमें आपकी थोड़ी मदद चाहिए।', intent: 'request', sensitive: false },
        { pictogramKeyword: 'home', label: 'बाद में करूँगा', spokenText: 'मैं इसे थोड़ी देर में पूरा करूँगा।', intent: 'delay', sensitive: false },
      ];
    } else {
      options = [
        { pictogramKeyword: 'yes', label: 'Yes I finished', spokenText: isChild ? 'Yes, I finished it!' : 'Yes, I finished all my homework.', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'No not yet', spokenText: 'No, not yet. I am still working on it.', intent: 'status', sensitive: false },
        { pictogramKeyword: 'help', label: 'I need help', spokenText: 'I need some help understanding this question.', intent: 'request', sensitive: false },
        { pictogramKeyword: 'home', label: 'I will do it later', spokenText: 'I plan to do it a little later today.', intent: 'delay', sensitive: false },
      ];
    }
  }
  // 4. Default / Greetings / General
  else {
    if (isKn) {
      options = [
        { pictogramKeyword: 'hello', label: 'ನಮಸ್ಕಾರ', spokenText: 'ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?', intent: 'greeting', sensitive: false },
        { pictogramKeyword: 'yes', label: 'ಹೌದು', spokenText: 'ಹೌದು, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'ಇಲ್ಲ', spokenText: 'ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.', intent: 'decline', sensitive: false },
        { pictogramKeyword: 'happy', label: 'ಚೆನ್ನಾಗಿದ್ದೇನೆ', spokenText: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.', intent: 'state', sensitive: false },
      ];
    } else if (isHi) {
      options = [
        { pictogramKeyword: 'hello', label: 'नमस्ते', spokenText: 'नमस्ते, आप कैसे हैं?', intent: 'greeting', sensitive: false },
        { pictogramKeyword: 'yes', label: 'हाँ', spokenText: 'हाँ, मैं सहमत हूँ।', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'नहीं', spokenText: 'नहीं, धन्यवाद।', intent: 'decline', sensitive: false },
        { pictogramKeyword: 'happy', label: 'मैं ठीक हूँ', spokenText: 'मैं बिल्कुल ठीक हूँ, धन्यवाद।', intent: 'state', sensitive: false },
      ];
    } else {
      options = [
        { pictogramKeyword: 'hello', label: 'Hello', spokenText: isChild ? 'Hello friend!' : 'Hello, nice to see you.', intent: 'greeting', sensitive: false },
        { pictogramKeyword: 'yes', label: 'Yes', spokenText: isChild ? 'Yes please!' : 'Yes, that sounds good.', intent: 'affirm', sensitive: false },
        { pictogramKeyword: 'no', label: 'No', spokenText: isChild ? 'No thank you.' : 'No, thank you.', intent: 'decline', sensitive: false },
        { pictogramKeyword: 'happy', label: 'I am good', spokenText: 'I am doing well, thank you.', intent: 'state', sensitive: false },
      ];
    }
  }

  // Filter already said items
  const filtered = options.filter(opt => !userSpoken.has(opt.spokenText.toLowerCase().trim()));
  const listToUse = filtered.length >= 2 ? filtered : options;

  const maxItems = isChild ? 4 : 5;
  const resultList = listToUse.slice(0, maxItems);

  // Always append Something Else
  const somethingElseLabel = isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else';
  const somethingElseSpoken = isKn ? 'ನನಗೆ ಬೇರೆ ವಿಷಯ ಹೇಳಬೇಕಿದೆ.' : isHi ? 'मुझे कुछ और कहना है।' : 'I would like to say something else.';
  resultList.push({
    pictogramKeyword: 'more',
    label: somethingElseLabel,
    spokenText: somethingElseSpoken,
    intent: 'custom',
    sensitive: false
  });

  return resultList;
}

// ----------------------------------------------------------------------
// Scripted Demo Mode (Scenario 1 Hungry and Scenario 2 Homework)
// ----------------------------------------------------------------------

function getScriptedDemoPredictions(context: ConversationContextPayload): PredictedOption[] {
  const isKn = context.language.toLowerCase().includes('kn');
  const isHi = context.language.toLowerCase().includes('hi');

  let lastPartner = '';
  for (let i = context.messages.length - 1; i >= 0; i--) {
    if (context.messages[i].speaker === 'other') {
      lastPartner = context.messages[i].text.toLowerCase();
      break;
    }
  }

  // Scenario 1: Food / Drink chain
  if (/are you hungry|ಹಸಿವಾಗಿದೆಯೇ|भूख लगी/.test(lastPartner)) {
    return [
      { pictogramKeyword: 'pizza', label: isKn ? 'ಹಸಿವಾಗಿದೆ' : isHi ? 'भूख लगी है' : 'Yes I am hungry', spokenText: isKn ? 'ನನಗೆ ಹಸಿವಾಗಿದೆ.' : isHi ? 'हाँ, मुझे भूख लगी है।' : 'Yes I am hungry.', intent: 'want', sensitive: false },
      { pictogramKeyword: 'food', label: isKn ? 'ಆಹಾರ ಬೇಕು' : isHi ? 'खाना चाहिए' : 'I want food', spokenText: isKn ? 'ನನಗೆ ಆಹಾರ ಬೇಕು.' : isHi ? 'मुझे खाना चाहिए।' : 'I want food.', intent: 'want', sensitive: false },
      { pictogramKeyword: 'no', label: isKn ? 'ಹಸಿವಿಲ್ಲ' : isHi ? 'भूख नहीं है' : 'No not hungry', spokenText: isKn ? 'ಇಲ್ಲ, ಹಸಿವಿಲ್ಲ.' : isHi ? 'नहीं, भूख नहीं है।' : 'No I am not hungry.', intent: 'decline', sensitive: false },
      { pictogramKeyword: 'water', label: isKn ? 'ಬಾಯಾರಿಕೆ' : isHi ? 'प्यास लगी' : 'I am thirsty', spokenText: isKn ? 'ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.' : isHi ? 'मुझे प्यास लगी है।' : 'I am thirsty.', intent: 'want', sensitive: false },
      { pictogramKeyword: 'more', label: isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else', spokenText: 'Something else', intent: 'custom', sensitive: false }
    ];
  }

  if (/what would you like to eat|ಏನು ತಿನ್ನುವಿರಿ|क्या खाएंगे/.test(lastPartner)) {
    return [
      { pictogramKeyword: 'pizza', label: isKn ? 'ಪಿಜ್ಜಾ' : isHi ? 'पिज़्ज़ा' : 'Pizza', spokenText: isKn ? 'ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.' : isHi ? 'मुझे पिज़्ज़ा चाहिए।' : 'I would like some pizza.', intent: 'choose', sensitive: false },
      { pictogramKeyword: 'rice', label: isKn ? 'ಅನ್ನ' : isHi ? 'चावल' : 'Rice', spokenText: isKn ? 'ನನಗೆ ಅನ್ನ ಬೇಕು.' : isHi ? 'मुझे चावल चाहिए।' : 'I would like rice.', intent: 'choose', sensitive: false },
      { pictogramKeyword: 'bread', label: isKn ? 'ಸ್ಯಾಂಡ್ವಿಚ್' : isHi ? 'सैंडविच' : 'Sandwich', spokenText: isKn ? 'ನನಗೆ ಸ್ಯಾಂಡ್ವಿಚ್ ಬೇಕು.' : isHi ? 'मुझे सैंडविच चाहिए।' : 'A sandwich please.', intent: 'choose', sensitive: false },
      { pictogramKeyword: 'apple', label: isKn ? 'ಹಣ್ಣು' : isHi ? 'फल' : 'Fruit', spokenText: isKn ? 'ನನಗೆ ತಾಜಾ ಹಣ್ಣು ಬೇಕು.' : isHi ? 'मुझे ताजे फल चाहिए।' : 'Fruit please.', intent: 'choose', sensitive: false },
      { pictogramKeyword: 'more', label: isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else', spokenText: 'Something else', intent: 'custom', sensitive: false }
    ];
  }

  if (/something to drink|ಕುಡಿಯಲು ಏನಾದರೂ|कुछ पीने के लिए/.test(lastPartner)) {
    return [
      { pictogramKeyword: 'water', label: isKn ? 'ನೀರು ದಯವಿಟ್ಟು' : isHi ? 'पानी कृपया' : 'Water please', spokenText: isKn ? 'ದಯವಿಟ್ಟು ನೀರು ಕೊಡಿ.' : isHi ? 'कृपया पानी दीजिए।' : 'Water please.', intent: 'want', sensitive: false },
      { pictogramKeyword: 'milk', label: isKn ? 'ಜ್ಯೂಸ್ ದಯವಿಟ್ಟು' : isHi ? 'जूस कृपया' : 'Juice please', spokenText: isKn ? 'ದಯವಿಟ್ಟು ಜ್ಯೂಸ್ ಕೊಡಿ.' : isHi ? 'कृपया जूस दीजिए।' : 'Juice please.', intent: 'want', sensitive: false },
      { pictogramKeyword: 'no', label: isKn ? 'ಬೇಡ ಧನ್ಯವಾದ' : isHi ? 'नहीं धन्यवाद' : 'No thank you', spokenText: isKn ? 'ಬೇಡ, ಧನ್ಯವಾದಗಳು.' : isHi ? 'नहीं धन्यवाद।' : 'No thank you.', intent: 'decline', sensitive: false },
      { pictogramKeyword: 'more', label: isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else', spokenText: 'Something else', intent: 'custom', sensitive: false }
    ];
  }

  // Scenario 2: Teacher homework chain
  if (/finish your homework|ಮನೆಕೆಲಸ ಮುಗಿಸಿದಿರಾ|गृहकार्य पूरा किया/.test(lastPartner)) {
    return [
      { pictogramKeyword: 'yes', label: isKn ? 'ಮುಗಿಸಿದ್ದೇನೆ' : isHi ? 'हाँ पूरा कर लिया' : 'Yes I finished', spokenText: isKn ? 'ಹೌದು, ಮುಗಿಸಿದ್ದೇನೆ.' : isHi ? 'हाँ मैंने पूरा कर लिया।' : 'Yes I finished.', intent: 'affirm', sensitive: false },
      { pictogramKeyword: 'no', label: isKn ? 'ಇನ್ನೂ ಇಲ್ಲ' : isHi ? 'अभी नहीं' : 'No not yet', spokenText: isKn ? 'ಇಲ್ಲ, ಇನ್ನೂ ಇಲ್ಲ.' : isHi ? 'नहीं अभी नहीं।' : 'No not yet.', intent: 'status', sensitive: false },
      { pictogramKeyword: 'help', label: isKn ? 'ಸಹಾಯ ಬೇಕು' : isHi ? 'मदद चाहिए' : 'I need help', spokenText: isKn ? 'ನನಗೆ ಸಹಾಯ ಬೇಕು.' : isHi ? 'मुझे मदद चाहिए।' : 'I need help.', intent: 'request', sensitive: false },
      { pictogramKeyword: 'home', label: isKn ? 'ನಂತರ ಮಾಡುವೆ' : isHi ? 'बाद में करूँगा' : 'I will do it later', spokenText: isKn ? 'ನಂತರ ಮಾಡುವೆನು.' : isHi ? 'मैं बाद में करूँगा।' : 'I will do it later.', intent: 'delay', sensitive: false },
      { pictogramKeyword: 'more', label: isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else', spokenText: 'Something else', intent: 'custom', sensitive: false }
    ];
  }

  if (/do you need help|ಸಹಾಯ ಬೇಕಾ|मदद चाहिए/.test(lastPartner)) {
    return [
      { pictogramKeyword: 'yes', label: isKn ? 'ಹೌದು ದಯವಿಟ್ಟು' : isHi ? 'हाँ कृपया' : 'Yes please', spokenText: isKn ? 'ಹೌದು, ದಯವಿಟ್ಟು.' : isHi ? 'हाँ कृपया मदद करें।' : 'Yes please.', intent: 'affirm', sensitive: false },
      { pictogramKeyword: 'no', label: isKn ? 'ಬೇಡ ಧನ್ಯವಾದ' : isHi ? 'नहीं धन्यवाद' : 'No thank you', spokenText: isKn ? 'ಬೇಡ ಧನ್ಯವಾದಗಳು.' : isHi ? 'नहीं धन्यवाद।' : 'No thank you.', intent: 'decline', sensitive: false },
      { pictogramKeyword: 'help', label: isKn ? 'ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ' : isHi ? 'समझ नहीं आया' : 'I do not understand', spokenText: isKn ? 'ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ.' : isHi ? 'मुझे समझ नहीं आ रहा।' : 'I do not understand this question.', intent: 'clarify', sensitive: false },
      { pictogramKeyword: 'school', label: isKn ? 'ವಿವರಿಸಿ ಹೇಳಿ' : isHi ? 'समझा दीजिए' : 'Can you explain it?', spokenText: isKn ? 'ದಯವಿಟ್ಟು ವಿವರಿಸಿ ಹೇಳುವಿರಾ?' : isHi ? 'क्या आप समझा सकते हैं?' : 'Can you explain it?', intent: 'request', sensitive: false },
      { pictogramKeyword: 'more', label: isKn ? 'ಬೇರೆ ವಿಷಯ' : isHi ? 'कुछ और' : 'Something else', spokenText: 'Something else', intent: 'custom', sensitive: false }
    ];
  }

  return getLocalOfflinePredictions(context);
}

// ----------------------------------------------------------------------
// Main API Client Functions
// ----------------------------------------------------------------------

export async function predictConversationResponses(context: ConversationContextPayload): Promise<PredictionResult> {
  // If demo mode active: return strictly scripted scenario
  if (context.demoMode) {
    return {
      responses: getScriptedDemoPredictions(context),
      providerUsed: 'demo_mode',
      cached: false,
      safetyTriggered: false
    };
  }

  // If user disabled AI: return local offline predictions immediately
  if (!context.enableAI) {
    return {
      responses: getLocalOfflinePredictions(context),
      providerUsed: 'local_fallback',
      cached: false,
      safetyTriggered: false
    };
  }

  // Try Backend AI Engine
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/ai/predict-responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': context.conversationId || 'default'
      },
      body: JSON.stringify({
        language: context.language,
        ageGroup: context.ageGroup === 'child' ? 'class_1_7' : context.ageGroup === 'student' ? 'class_8_12' : 'adult',
        conversationId: context.conversationId,
        messages: context.messages,
        currentTopic: context.currentTopic
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: PredictionResult = await res.json();
      if (data.responses && data.responses.length > 0) {
        return data;
      }
    }
  } catch {
    // Network offline or server unreachable: fall through silently to local fallback
  }

  return {
    responses: getLocalOfflinePredictions(context),
    providerUsed: 'local_fallback',
    cached: false,
    safetyTriggered: false
  };
}

export interface ChatTurnItem {
  speaker: 'other' | 'user';
  text: string;
  timestamp?: number;
}

export interface ChatReplyOption {
  id: string;
  text: string;
  pictogramKeyword: string;
  intent: string;
  sensitive: boolean;
  source: string;
  grammarChecked: boolean;
}

export interface ChatRepliesResult {
  questionClass: string;
  replies: ChatReplyOption[];
  provider: string;
  cached: boolean;
  safetyTriggered: boolean;
}

export async function fetchChatReplies(payload: {
  language: string;
  ageGroup: UserMode;
  tone?: 'short' | 'polite' | 'casual';
  wording?: string;
  role?: string;
  turns: ChatTurnItem[];
  hints?: string[];
  enableAI?: boolean;
}): Promise<ChatRepliesResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/chat/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: payload.language,
        ageGroup: payload.ageGroup,
        tone: payload.tone || 'polite',
        wording: payload.wording || 'first_person',
        role: payload.role || 'someone_else',
        turns: payload.turns,
        hints: payload.hints || [],
        enableAI: payload.enableAI || false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.replies && data.replies.length > 0) {
        return data;
      }
    }
  } catch {
    // Network offline or server error
  }

  // Fallback to local offline predictions
  const offlineOptions = getLocalOfflinePredictions({
    language: payload.language,
    ageGroup: payload.ageGroup,
    conversationId: 'offline',
    messages: payload.turns.map(t => ({ speaker: t.speaker, text: t.text, time: t.timestamp || Date.now() })),
    enableAI: false
  });

  return {
    questionClass: 'fallback',
    replies: offlineOptions.map((opt, idx) => ({
      id: `fallback_${idx}`,
      text: opt.spokenText,
      pictogramKeyword: opt.pictogramKeyword,
      intent: opt.intent,
      sensitive: opt.sensitive,
      source: 'offline_fallback',
      grammarChecked: true
    })),
    provider: 'local_fallback',
    cached: false,
    safetyTriggered: false
  };
}

export async function fetchChatStarters(
  language: string,
  ageGroup: UserMode,
  tone: 'short' | 'polite' | 'casual' = 'polite'
): Promise<ChatReplyOption[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/chat/starters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, ageGroup, tone }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.starters && data.starters.length > 0) {
        return data.starters;
      }
    }
  } catch {
    // Fallback
  }

  if (language === 'kn') {
    return [
      { id: 'st_1', text: 'ನಮಸ್ಕಾರ!', pictogramKeyword: 'hello', intent: 'greet', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_2', text: 'ಕ್ಷಮಿಸಿ, ಕೇಳಬಹುದೇ?', pictogramKeyword: 'help', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_3', text: 'ನಾನು ಒಂದು ಮಾತು ಹೇಳಬೇಕಿದೆ.', pictogramKeyword: 'chat', intent: 'state', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_4', text: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', pictogramKeyword: 'happy', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true }
    ];
  }
  if (language === 'hi') {
    return [
      { id: 'st_1', text: 'नमस्ते!', pictogramKeyword: 'hello', intent: 'greet', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_2', text: 'माफ़ कीजिए, क्या मैं कुछ पूछ सकता हूँ?', pictogramKeyword: 'help', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_3', text: 'मुझे आपसे कुछ कहना है।', pictogramKeyword: 'chat', intent: 'state', sensitive: false, source: 'fallback', grammarChecked: true },
      { id: 'st_4', text: 'आप कैसे हैं?', pictogramKeyword: 'happy', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true }
    ];
  }
  return [
    { id: 'st_1', text: 'Hello!', pictogramKeyword: 'hello', intent: 'greet', sensitive: false, source: 'fallback', grammarChecked: true },
    { id: 'st_2', text: 'Excuse me, may I ask something?', pictogramKeyword: 'help', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true },
    { id: 'st_3', text: 'I want to tell you something.', pictogramKeyword: 'chat', intent: 'state', sensitive: false, source: 'fallback', grammarChecked: true },
    { id: 'st_4', text: 'How are you today?', pictogramKeyword: 'happy', intent: 'question', sensitive: false, source: 'fallback', grammarChecked: true }
  ];
}

export async function improveUserText(text: string, language: string, userMode: UserMode): Promise<string> {
  if (!text || text.trim() === '') return text;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/ai/improve-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language,
        ageGroup: userMode === 'child' ? 'class_1_7' : userMode === 'student' ? 'class_8_12' : 'adult'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.improved) return data.improved;
    }
  } catch {
    // Fallback
  }

  // Offline expansion
  const lower = text.toLowerCase();
  const isKn = language.includes('kn');
  const isHi = language.includes('hi');
  const isChild = userMode === 'child';

  if (lower.includes('water')) return isChild ? 'I want water!' : 'I would like some water, please.';
  if (lower.includes('pizza')) return isChild ? 'I want pizza!' : 'I would like some pizza, please.';
  if (lower.includes('food') || lower.includes('hungry')) return isChild ? 'I am hungry!' : 'I am feeling hungry, could I have something to eat?';
  if (lower.includes('help')) return isChild ? 'Help me please.' : 'Could you please assist me with this?';

  if (isKn) return isChild ? `ನನಗೆ ${text} ಬೇಕು.` : `ದಯವಿಟ್ಟು ನನಗೆ ${text} ಕೊಡುತ್ತೀರಾ?`;
  if (isHi) return isChild ? `मुझे ${text} चाहिए।` : `कृपया क्या आप मुझे ${text} दे सकते हैं?`;
  return isChild ? `I want ${text}.` : `I would like ${text}, please.`;
}

export async function fetchServiceStatus(): Promise<ServiceStatus> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }

  return {
    groq: 'not_configured',
    gemini: 'not_configured',
    localFallback: 'working',
    speechRecognition: 'working',
    whisper: 'not_configured',
    activeProvider: 'local_fallback'
  };
}

export interface SentenceOption {
  text: string;
  intentId: string;
  tone: string;
  grammarChecked: boolean;
  providerUsed: string;
}

export async function fetchSentenceOptions(params: {
  assetId: string;
  language: string;
  userMode: UserMode;
  tone?: string;
  wording?: string;
}): Promise<SentenceOption[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('/api/ai/sentence-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: params.assetId,
        language: params.language,
        ageGroup: params.userMode === 'child' ? 'class_1_7' : params.userMode === 'student' ? 'class_8_12' : 'adult',
        tone: params.tone || 'polite',
        wording: params.wording || 'neutral'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.options)) {
        return data.options;
      }
    }
  } catch {
    // Fall through silently without blocking the UI
  }

  return [];
}

export interface ContinueOptionItem {
  text: string;
  kind: string;
  grammarChecked: boolean;
  providerUsed: string;
}

export interface ContinueResult {
  options: ContinueOptionItem[];
  repairOptions: ContinueOptionItem[];
  providerUsed: string;
}

export async function fetchContinueOptions(params: {
  lastSentence: string;
  language: string;
  userMode: UserMode;
  tone?: string;
  wording?: string;
  scenario?: string;
}): Promise<ContinueResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('/api/ai/continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastSentence: params.lastSentence,
        language: params.language,
        ageGroup: params.userMode === 'child' ? 'class_1_7' : params.userMode === 'student' ? 'class_8_12' : 'adult',
        tone: params.tone || 'polite',
        wording: params.wording || 'neutral',
        scenario: params.scenario
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        options: data.options || [],
        repairOptions: data.repairOptions || [],
        providerUsed: data.providerUsed || 'local'
      };
    }
  } catch {
    // Fallback locally
  }

  const lang = params.language.toLowerCase();
  const isKn = lang.includes('kn');
  const isHi = lang.includes('hi');

  if (isKn) {
    return {
      repairOptions: [
        { text: 'ನಾನು ಹಾಗೆ ಹೇಳಲು ಉದ್ದೇಶಿಸಿರಲಿಲ್ಲ.', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ.', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'ನಾನು ಇನ್ನೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ.', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'ನಾನು ಹೇಳಲು ಬಯಸಿದ್ದು ಅದಲ್ಲ.', kind: 'repair', grammarChecked: true, providerUsed: 'local' }
      ],
      options: [
        { text: 'ಇದರ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹೇಳಿ.', kind: 'detail', grammarChecked: true, providerUsed: 'local' },
        { text: 'ಧನ್ಯವಾದಗಳು.', kind: 'close', grammarChecked: true, providerUsed: 'local' },
        { text: 'ಅಷ್ಟೇ.', kind: 'close', grammarChecked: true, providerUsed: 'local' },
        { text: 'ಸರಿ.', kind: 'close', grammarChecked: true, providerUsed: 'local' }
      ],
      providerUsed: 'local'
    };
  }

  if (isHi) {
    return {
      repairOptions: [
        { text: 'मेरा यह मतलब नहीं था।', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'कृपया थोड़ा इंतज़ार करें।', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'मुझे फिर से कोशिश करने दें।', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
        { text: 'मैं यह नहीं कहना चाहता था।', kind: 'repair', grammarChecked: true, providerUsed: 'local' }
      ],
      options: [
        { text: 'इसके बारे में और बताएं।', kind: 'detail', grammarChecked: true, providerUsed: 'local' },
        { text: 'धन्यवाद।', kind: 'close', grammarChecked: true, providerUsed: 'local' },
        { text: 'बस इतना ही।', kind: 'close', grammarChecked: true, providerUsed: 'local' },
        { text: 'ठीक है।', kind: 'close', grammarChecked: true, providerUsed: 'local' }
      ],
      providerUsed: 'local'
    };
  }

  return {
    repairOptions: [
      { text: 'I did not mean that.', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
      { text: 'Please wait.', kind: 'repair', grammarChecked: true, providerUsed: 'local' },
      { text: 'Let me try again.', kind: 'repair', providerUsed: 'local', grammarChecked: true },
      { text: 'That is not what I wanted to say.', kind: 'repair', providerUsed: 'local', grammarChecked: true }
    ],
    options: [
      { text: 'Tell me more about this.', kind: 'detail', grammarChecked: true, providerUsed: 'local' },
      { text: 'Thank you.', kind: 'close', grammarChecked: true, providerUsed: 'local' },
      { text: 'That is all.', kind: 'close', grammarChecked: true, providerUsed: 'local' },
      { text: 'Okay.', kind: 'close', grammarChecked: true, providerUsed: 'local' }
    ],
    providerUsed: 'local'
  };
}

// ----------------------------------------------------------------------
// Speech Bubble Pictogram Keyword Tagger
// ----------------------------------------------------------------------

const KEYWORD_PICTOGRAM_MAP: Record<string, string> = {
  // English
  food: 'food',
  eat: 'food',
  snack: 'food',
  pizza: 'pizza',
  water: 'water',
  drink: 'water',
  thirsty: 'water',
  tea: 'tea',
  milk: 'milk',
  apple: 'apple',
  fruit: 'apple',
  rice: 'rice',
  bread: 'bread',
  school: 'school',
  homework: 'school',
  study: 'school',
  help: 'help',
  doctor: 'doctor',
  medicine: 'doctor',
  home: 'home',
  house: 'home',
  bed: 'home',
  sleep: 'tired',
  tired: 'tired',
  happy: 'happy',
  play: 'ball',
  game: 'ball',
  yes: 'yes',
  no: 'no',
  bus: 'bus',
  family: 'family',
  mom: 'family',
  dad: 'family',
  friend: 'friend',
  emergency: 'emergency',

  // Kannada
  ಆಹಾರ: 'food',
  ಊಟ: 'food',
  ತಿಂಡಿ: 'food',
  ಪಿಜ್ಜಾ: 'pizza',
  ನೀರು: 'water',
  ಚಹಾ: 'tea',
  ಹಾಲು: 'milk',
  ಅನ್ನ: 'rice',
  ಹಣ್ಣು: 'apple',
  ಶಾಲೆ: 'school',
  ಪಾಠ: 'school',
  ಮನೆಕೆಲಸ: 'school',
  ಸಹಾಯ: 'help',
  ವೈದ್ಯರು: 'doctor',
  ಔಷಧಿ: 'doctor',
  ಮನೆ: 'home',
  ಆಟ: 'ball',
  ಚೆಂಡು: 'ball',
  ಹೌದು: 'yes',
  ಇಲ್ಲ: 'no',
  ಸಂತೋಷ: 'happy',
  ದಣಿವು: 'tired',
  ಕುಟುಂಬ: 'family',

  // Hindi
  खाना: 'food',
  नाश्ता: 'food',
  पिज़्ज़ा: 'pizza',
  पानी: 'water',
  चाय: 'tea',
  दूध: 'milk',
  चावल: 'rice',
  फल: 'apple',
  स्कूल: 'school',
  पढ़ाई: 'school',
  गृहकार्य: 'school',
  मदद: 'help',
  सहायता: 'help',
  डॉक्टर: 'doctor',
  दवा: 'doctor',
  घर: 'home',
  खेल: 'ball',
  गेंद: 'ball',
  हाँ: 'yes',
  नहीं: 'no',
  खुश: 'happy',
  थका: 'tired',
  परिवार: 'family'
};

export function extractSpeechTokens(text: string): Array<{ word: string; pictogram?: string }> {
  if (!text) return [];

  const rawTokens = text.split(/\s+/);
  return rawTokens.map(raw => {
    // Strip punctuation for matching
    const clean = raw.toLowerCase().replace(/^[^\w\u0900-\u0D7F]+|[^\w\u0900-\u0D7F]+$/g, '');
    const picto = KEYWORD_PICTOGRAM_MAP[clean];
    return {
      word: raw,
      pictogram: picto
    };
  });
}
