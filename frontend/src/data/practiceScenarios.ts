/**
 * COMMUNIQ Practice Conversation Scenarios.
 * 8 comprehensive roleplay scenarios with 4-6 turns each.
 * Complete offline scripted dialogue with full English, Kannada, and Hindi support.
 */

export interface PracticeTurn {
  partnerPrompt: {
    en: string;
    kn: string;
    hi: string;
  };
  options: {
    id: string;
    pictogram: string;
    en: string;
    kn: string;
    hi: string;
  }[];
}

export interface PracticeScenario {
  id: string;
  title: {
    en: string;
    kn: string;
    hi: string;
  };
  description: {
    en: string;
    kn: string;
    hi: string;
  };
  icon: string;
  category: string;
  turns: PracticeTurn[];
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  // 1. Restaurant
  {
    id: 'restaurant',
    title: { en: 'At a Restaurant', kn: 'ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ', hi: 'रेस्तरां में' },
    description: {
      en: 'Practice ordering meals, drinks and asking for the bill.',
      kn: 'ಊಟ, ಪಾನೀಯಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಮತ್ತು ಬಿಲ್ ಕೇಳಲು ಅಭ್ಯಾಸ ಮಾಡಿ.',
      hi: 'खाना, पेय ऑर्डर करने और बिल मांगने का अभ्यास करें।'
    },
    icon: 'UtensilsCrossed',
    category: 'food_drink',
    turns: [
      {
        partnerPrompt: {
          en: 'Welcome! Where would you like to sit today?',
          kn: 'ಸ್ವಾಗತ! ಇಂದು ನೀವು ಎಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?',
          hi: 'स्वागत है! आज आप कहाँ बैठना पसंद करेंगे?'
        },
        options: [
          { id: 'table_corner', pictogram: 'home', en: 'Table by the window please', kn: 'ಕಿಟಕಿಯ ಬಳಿ ಟೇಬಲ್ ದಯವಿಟ್ಟು', hi: 'कृपया खिड़की के पास वाली मेज' },
          { id: 'quiet_spot', pictogram: 'calm', en: 'A quiet table please', kn: 'ಶಾಂತವಾದ ಸ್ಥಳ ದಯವಿಟ್ಟು', hi: 'कृपया एक शांत जगह' },
          { id: 'family_table', pictogram: 'friend', en: 'Table for my family', kn: 'ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಟೇಬಲ್', hi: 'मेरे परिवार के लिए मेज' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Here is the menu. What would you like to eat?',
          kn: 'ಇಲ್ಲಿ ಮೆನು ಇದೆ. ನೀವು ಏನು ತಿನ್ನಲು ಬಯಸುತ್ತೀರಿ?',
          hi: 'यह मेनू है। आप क्या खाना पसंद करेंगे?'
        },
        options: [
          { id: 'pizza_order', pictogram: 'pizza', en: 'I would like pizza please', kn: 'ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು ದಯವಿಟ್ಟು', hi: 'मुझे पिज़्ज़ा चाहिए कृपया' },
          { id: 'rice_order', pictogram: 'rice', en: 'Warm bowl of rice please', kn: 'ಬಿಸಿ ಅನ್ನ ದಯವಿಟ್ಟು', hi: 'कृपया गर्म चावल' },
          { id: 'bread_order', pictogram: 'bread', en: 'Fresh bread please', kn: 'ತಾಜಾ ರೊಟ್ಟಿ ದಯವಿಟ್ಟು', hi: 'कृपया ताज़ी रोटी' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Great choice! Would you like something to drink?',
          kn: 'ಉತ್ತಮ ಆಯ್ಕೆ! ಕುಡಿಯಲು ಏನಾದರೂ ಬೇಕೆ?',
          hi: 'बहुत बढ़िया पसंद! क्या आप पीने के लिए कुछ लेंगे?'
        },
        options: [
          { id: 'drink_water', pictogram: 'water', en: 'Just clean water please', kn: 'ಕೇವಲ ಶುದ್ಧ ನೀರು ದಯವಿಟ್ಟು', hi: 'कृपया सिर्फ साफ़ पानी' },
          { id: 'drink_tea', pictogram: 'tea', en: 'Warm cup of tea please', kn: 'ಬಿಸಿ ಚಹಾ ದಯವಿಟ್ಟು', hi: 'कृपया गर्म चाय' },
          { id: 'drink_milk', pictogram: 'milk', en: 'Glass of cold milk please', kn: 'ತಣ್ಣನೆಯ ಹಾಲು ದಯವಿಟ್ಟು', hi: 'कृपया ठंडा दूध' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Here is your delicious meal! Is everything okay for you?',
          kn: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಊಟ ಬಂದಿದೆ! ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆಯೇ?',
          hi: 'यह आपका खाना है! क्या सब कुछ ठीक है?'
        },
        options: [
          { id: 'meal_good', pictogram: 'happy', en: 'This is delicious, thank you!', kn: 'ಇದು ತುಂಬಾ ರುಚಿಯಾಗಿದೆ, ಧನ್ಯವಾದಗಳು!', hi: 'यह बहुत स्वादिष्ट है, धन्यवाद!' },
          { id: 'need_water', pictogram: 'water', en: 'More water please', kn: 'ಇನ್ನಷ್ಟು ನೀರು ದಯವಿಟ್ಟು', hi: 'कृपया थोड़ा और पानी' },
          { id: 'all_good', pictogram: 'check_yes', en: 'Everything is great', kn: 'ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿದೆ', hi: 'सब कुछ बहुत अच्छा है' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Are you ready for the bill?',
          kn: 'ಬಿಲ್ ತರಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
          hi: 'क्या मैं बिल ले आऊं?'
        },
        options: [
          { id: 'bill_please', pictogram: 'pencil', en: 'Yes, the bill please', kn: 'ಹೌದು, ಬಿಲ್ ತನ್ನಿ ದಯವಿಟ್ಟು', hi: 'हाँ, कृपया बिल ले आएं' },
          { id: 'thank_you_waiter', pictogram: 'thank_you', en: 'Thank you for your kind service', kn: 'ನಿಮ್ಮ ಉತ್ತಮ ಸೇವೆಗೆ ಧನ್ಯವಾದ', hi: 'आपकी अच्छी सेवा के लिए धन्यवाद' }
        ]
      }
    ]
  },

  // 2. School
  {
    id: 'school',
    title: { en: 'In the Classroom', kn: 'ತರಗತಿಯಲ್ಲಿ', hi: 'कक्षा में' },
    description: {
      en: 'Communicate with teachers and classmates at school.',
      kn: 'ಶಾಲೆಯಲ್ಲಿ ಶಿಕ್ಷಕರು ಮತ್ತು ಸಹಪಾಠಿಗಳೊಂದಿಗೆ ಸಂವಹನ ನಡೆಸಿ.',
      hi: 'स्कूल में शिक्षकों और सहपाठियों के साथ बातचीत करें।'
    },
    icon: 'GraduationCap',
    category: 'school',
    turns: [
      {
        partnerPrompt: {
          en: 'Good morning! Are you ready for today’s lesson?',
          kn: 'ಶುಭೋದಯ! ಇಂದಿನ ಪಾಠಕ್ಕೆ ಸಿದ್ಧರಿದ್ದೀರಾ?',
          hi: 'सुप्रभात! क्या आप आज के पाठ के लिए तैयार हैं?'
        },
        options: [
          { id: 'ready_yes', pictogram: 'check_yes', en: 'Good morning! Yes, I am ready', kn: 'ಶುಭೋದಯ! ಹೌದು, ನಾನು ಸಿದ್ಧ', hi: 'सुप्रभात! हाँ, मैं तैयार हूँ' },
          { id: 'excited', pictogram: 'happy', en: 'I am excited to learn', kn: 'ಕಲಿಯಲು ನಾನು ಉತ್ಸುಕನಾಗಿದ್ದೇನೆ', hi: 'मैं सीखने के लिए बहुत उत्सुक हूँ' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Please open your textbook to page ten. Do you have a pencil?',
          kn: 'ದಯವಿಟ್ಟು ಪುಸ್ತಕದ ಹತ್ತನೇ ಪುಟ ತೆರೆಯಿರಿ. ಪೆನ್ಸಿಲ್ ಇದೆಯೇ?',
          hi: 'कृपया अपनी किताब का पेज दस खोलें। क्या आपके पास पेंसिल है?'
        },
        options: [
          { id: 'have_pencil', pictogram: 'pencil', en: 'Yes, I have my pencil', kn: 'ಹೌದು, ನನ್ನ ಬಳಿ ಪೆನ್ಸಿಲ್ ಇದೆ', hi: 'हाँ, मेरे पास पेंसिल है' },
          { id: 'need_pencil', pictogram: 'emergency_help', en: 'May I borrow a pencil please?', kn: 'ದಯವಿಟ್ಟು ಒಂದು ಪೆನ್ಸಿಲ್ ಕೊಡುತ್ತೀರಾ?', hi: 'क्या मुझे एक पेंसिल मिल सकती है?' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Would you like to solve this question together or try alone?',
          kn: 'ಈ ಪ್ರಶ್ನೆಯನ್ನು ಒಟ್ಟಿಗೆ ಉತ್ತರಿಸೋಣವೇ ಅಥವಾ ನೀವೇ ಪ್ರಯತ್ನಿಸುತ್ತೀರಾ?',
          hi: 'क्या आप यह सवाल मिलकर हल करना चाहते हैं या अकेले?'
        },
        options: [
          { id: 'together', pictogram: 'friend', en: 'Let us work together please', kn: 'ಒಟ್ಟಿಗೆ ಕೆಲಸ ಮಾಡೋಣ ದಯವಿಟ್ಟು', hi: 'कृपया मिलकर करते हैं' },
          { id: 'alone', pictogram: 'calm', en: 'I want to try on my own', kn: 'ನಾನೇ ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ', hi: 'मैं खुद कोशिश करूँगा' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Well done! It is time for recess. Would you like to go to the playground?',
          kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು! ಈಗ ವಿರಾಮದ ಸಮಯ. ಆಟದ ಮೈದಾನಕ್ಕೆ ಹೋಗಲು ಇಷ್ಟಪಡುತ್ತೀರಾ?',
          hi: 'शाबाश! अब छुट्टी का समय है। क्या आप मैदान में जाना चाहते हैं?'
        },
        options: [
          { id: 'go_play', pictogram: 'playground', en: 'Yes, let us go play!', kn: 'ಹೌದು, ಆಟವಾಡಲು ಹೋಗೋಣ!', hi: 'हाँ, खेलने चलते हैं!' },
          { id: 'read_book', pictogram: 'book', en: 'I want to read my book', kn: 'ನಾನು ಪುಸ್ತಕ ಓದಲು ಬಯಸುತ್ತೇನೆ', hi: 'मैं किताब पढ़ना चाहता हूँ' }
        ]
      }
    ]
  },

  // 3. Home
  {
    id: 'home',
    title: { en: 'At Home with Family', kn: 'ಮನೆಯಲ್ಲಿ ಕುಟುಂಬದೊಂದಿಗೆ', hi: 'घर पर परिवार के साथ' },
    description: {
      en: 'Share feelings, meals, and daily activities with your family.',
      kn: 'ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಅನುಭವ ಮತ್ತು ಅಗತ್ಯಗಳನ್ನು ಕುಟುಂಬದೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.',
      hi: 'अपने दैनिक अनुभवों और जरूरतों को परिवार के साथ साझा करें।'
    },
    icon: 'Home',
    category: 'home',
    turns: [
      {
        partnerPrompt: {
          en: 'How was your day today?',
          kn: 'ಇಂದು ನಿಮ್ಮ ದಿನ ಹೇಗಿತ್ತು?',
          hi: 'आज आपका दिन कैसा रहा?'
        },
        options: [
          { id: 'day_happy', pictogram: 'happy', en: 'I had a wonderful day!', kn: 'ನನ್ನ ದಿನ ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು!', hi: 'मेरा दिन बहुत अच्छा रहा!' },
          { id: 'day_tired', pictogram: 'tired', en: 'I am a little tired', kn: 'ಸ್ವಲ್ಪ ದಣಿವಾಗಿದೆ', hi: 'मुझे थोड़ी थकान महसूस हो रही है' },
          { id: 'day_calm', pictogram: 'calm', en: 'It was quiet and peaceful', kn: 'ದಿನ ಶಾಂತವಾಗಿತ್ತು', hi: 'दिन शांत और सामान्य रहा' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Dinner is ready soon. Would you like to help set the table?',
          kn: 'ಊಟ ಶೀಘ್ರದಲ್ಲೇ ಸಿದ್ಧವಾಗಲಿದೆ. ಟೇಬಲ್ ಸಿದ್ಧಪಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೀರಾ?',
          hi: 'खाना जल्द तैयार हो जाएगा। क्या आप मेज लगाने में मदद करेंगे?'
        },
        options: [
          { id: 'help_yes', pictogram: 'check_yes', en: 'Yes, I would love to help', kn: 'ಹೌದು, ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ', hi: 'हाँ, मैं खुशी से मदद करूँगा' },
          { id: 'wash_hands_first', pictogram: 'wash_hands', en: 'I will wash my hands first', kn: 'ಮೊದಲು ಕೈ ತೊಳೆಯುತ್ತೇನೆ', hi: 'मैं पहले हाथ धो लेता हूँ' }
        ]
      },
      {
        partnerPrompt: {
          en: 'What would you like to do after dinner?',
          kn: 'ಊಟದ ನಂತರ ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
          hi: 'खाने के बाद आप क्या करना चाहेंगे?'
        },
        options: [
          { id: 'watch_read', pictogram: 'book', en: 'Read a story with you', kn: 'ನಿಮ್ಮೊಂದಿಗೆ ಕಥೆ ಓದಲು ಇಷ್ಟ', hi: 'आपके साथ कहानी पढ़ना' },
          { id: 'sleep_early', pictogram: 'moon', en: 'Go to bed and rest', kn: 'ಮಲಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಲು ಇಷ್ಟ', hi: 'सोकर आराम करना' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Goodnight! Sleep well.',
          kn: 'ಶುಭರಾತ್ರಿ! ಚೆನ್ನಾಗಿ ನಿದ್ರೆ ಮಾಡಿ.',
          hi: 'शुभ रात्रि! अच्छी नींद लें।'
        },
        options: [
          { id: 'goodnight_family', pictogram: 'thank_you', en: 'Goodnight! Love you', kn: 'ಶುಭರಾತ್ರಿ! ಪ್ರೀತಿಯ ಶುಭಾಶಯಗಳು', hi: 'शुभ रात्रि! बहुत सारा प्यार' }
        ]
      }
    ]
  },

  // 4. Travel
  {
    id: 'travel',
    title: { en: 'Public Transit and Travel', kn: 'ಪ್ರಯಾಣ ಮತ್ತು ಬಸ್ಸು', hi: 'यात्रा और बस' },
    description: {
      en: 'Practice buying tickets, asking directions, and riding the bus.',
      kn: 'ಟಿಕೆಟ್ ಪಡೆಯಲು ಮತ್ತು ಬಸ್ಸಿನಲ್ಲಿ ಪ್ರಯಾಣಿಸಲು ಸಂಭಾಷಣೆ ನಡೆಸಿ.',
      hi: 'टिकट लेने और बस में यात्रा करने का अभ्यास करें।'
    },
    icon: 'Bus',
    category: 'travel',
    turns: [
      {
        partnerPrompt: {
          en: 'Where are you traveling to today?',
          kn: 'ಇಂದು ನೀವು ಎಲ್ಲಿಗೆ ಪ್ರಯಾಣಿಸುತ್ತಿದ್ದೀರಿ?',
          hi: 'आज आप कहाँ यात्रा कर रहे हैं?'
        },
        options: [
          { id: 'travel_home', pictogram: 'home', en: 'I am going home please', kn: 'ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ ದಯವಿಟ್ಟು', hi: 'कृपया मैं घर जा रहा हूँ' },
          { id: 'travel_school', pictogram: 'school', en: 'Going to school please', kn: 'ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ', hi: 'स्कूल जा रहा हूँ' }
        ]
      },
      {
        partnerPrompt: {
          en: 'That will be one ticket. Do you need help finding a seat?',
          kn: 'ಒಂದು ಟಿಕೆಟ್. ಆಸನ ಹುಡುಕಲು ಸಹಾಯ ಬೇಕೇ?',
          hi: 'एक टिकट। क्या आपको बैठने के लिए सीट खोजने में मदद चाहिए?'
        },
        options: [
          { id: 'seat_yes', pictogram: 'emergency_help', en: 'Yes please, a seat near the door', kn: 'ಹೌದು ದಯವಿಟ್ಟು, ಬಾಗಿಲಿನ ಬಳಿ ಆಸನ', hi: 'हाँ कृपया, दरवाजे के पास सीट' },
          { id: 'seat_ok', pictogram: 'check_yes', en: 'I found a seat, thank you!', kn: 'ಆಸನ ಸಿಕ್ಕಿತು, ಧನ್ಯವಾದಗಳು!', hi: 'मुझे सीट मिल गई, धन्यवाद!' }
        ]
      },
      {
        partnerPrompt: {
          en: 'This is the main stop. Is this your destination?',
          kn: 'ಇದು ಮುಖ್ಯ ನಿಲ್ದಾಣ. ನೀವು ಇಲ್ಲಿ ಇಳಿಯಬೇಕೆ?',
          hi: 'यह मुख्य स्टॉप है। क्या आपको यहाँ उतरना है?'
        },
        options: [
          { id: 'stop_yes', pictogram: 'check_yes', en: 'Yes, this is my stop. Thank you!', kn: 'ಹೌದು, ಇದು ನನ್ನ ನಿಲ್ದಾಣ. ಧನ್ಯವಾದ!', hi: 'हाँ, यही मेरा स्टॉप है। धन्यवाद!' },
          { id: 'stop_next', pictogram: 'bus', en: 'Next stop for me please', kn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ ದಯವಿಟ್ಟು', hi: 'कृपया अगला स्टॉप' }
        ]
      }
    ]
  },

  // 5. Shopping
  {
    id: 'shopping',
    title: { en: 'Grocery and Market', kn: 'ಅಂಗಡಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ', hi: 'दुकान और बाज़ार' },
    description: {
      en: 'Ask for grocery items, fresh fruits and pay the cashier.',
      kn: 'ಹಣ್ಣು, ದಿನಸಿ ವಸ್ತುಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಬಿಲ್ ಪಾವತಿಸಿ.',
      hi: 'फल, किराने का सामान मांगें और भुगतान करें।'
    },
    icon: 'ShoppingBag',
    category: 'food_drink',
    turns: [
      {
        partnerPrompt: {
          en: 'Hello! What can I help you find today?',
          kn: 'ನಮಸ್ಕಾರ! ಇಂದು ನೀವು ಏನನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?',
          hi: 'नमस्ते! आज आपको क्या सामान चाहिए?'
        },
        options: [
          { id: 'buy_apples', pictogram: 'apple', en: 'Fresh red apples please', kn: 'ತಾಜಾ ಸೇಬುಗಳು ದಯವಿಟ್ಟು', hi: 'कृपया ताज़े सेब' },
          { id: 'buy_bread', pictogram: 'bread', en: 'Loaf of fresh bread please', kn: 'ತಾಜಾ ಬ್ರೆಡ್ ದಯವಿಟ್ಟು', hi: 'कृपया ताज़ी रोटी' },
          { id: 'buy_milk', pictogram: 'milk', en: 'One bottle of milk please', kn: 'ಒಂದು ಬಾಟಲಿ ಹಾಲು ದಯವಿಟ್ಟು', hi: 'कृपया एक बोतल दूध' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Here are the fresh items. Do you need anything else?',
          kn: 'ಇಲ್ಲಿ ತಾಜಾ ವಸ್ತುಗಳಿವೆ. ಬೇರೆ ಏನಾದರೂ ಬೇಕೇ?',
          hi: 'यह ताज़ा सामान है। क्या कुछ और चाहिए?'
        },
        options: [
          { id: 'buy_water', pictogram: 'water', en: 'A bottle of water please', kn: 'ಒಂದು ಬಾಟಲಿ ನೀರು ದಯವಿಟ್ಟು', hi: 'कृपया एक बोतल पानी' },
          { id: 'that_is_all', pictogram: 'check_yes', en: 'That is all for today, thank you', kn: 'ಇಂದಿಗೆ ಅಷ್ಟೇ ಸಾಕು, ಧನ್ಯವಾದ', hi: 'आज के लिए बस इतना ही, धन्यवाद' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Your total is ready. How would you like to pay?',
          kn: 'ನಿಮ್ಮ ಬಿಲ್ ಸಿದ್ಧವಾಗಿದೆ. ಹೇಗೆ ಪಾವತಿಸುತ್ತೀರಿ?',
          hi: 'आपका बिल तैयार है। आप भुगतान कैसे करेंगे?'
        },
        options: [
          { id: 'pay_card', pictogram: 'pencil', en: 'Card or digital pay please', kn: 'ಕಾರ್ಡ್ ಅಥವಾ ಡಿಜಿಟಲ್ ಪಾವತಿ', hi: 'कृपया कार्ड या ऑनलाइन भुगतान' },
          { id: 'pay_thanks', pictogram: 'thank_you', en: 'Here is the payment. Thank you!', kn: 'ಇಲ್ಲಿ ಹಣವಿದೆ. ಧನ್ಯವಾದ!', hi: 'यह भुगतान है। धन्यवाद!' }
        ]
      }
    ]
  },

  // 6. Hospital
  {
    id: 'hospital',
    title: { en: 'At the Clinic / Doctor', kn: 'ಆಸ್ಪತ್ರೆ ಅಥವಾ ವೈದ್ಯರ ಬಳಿ', hi: 'अस्पताल या डॉक्टर के पास' },
    description: {
      en: 'Explain how you feel, where it hurts, and ask for medicine.',
      kn: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ, ನೋವು ಮತ್ತು ಔಷಧಿಯ ಬಗ್ಗೆ ತಿಳಿಸಿ.',
      hi: 'अपनी परेशानी, दर्द और दवा के बारे में डॉक्टर को बताएं।'
    },
    icon: 'Stethoscope',
    category: 'health',
    turns: [
      {
        partnerPrompt: {
          en: 'Hello. How are you feeling today?',
          kn: 'ನಮಸ್ಕಾರ. ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಹೇಗಿದೆ?',
          hi: 'नमस्ते। आज आपकी तबीयत कैसी है?'
        },
        options: [
          { id: 'feel_sick', pictogram: 'sick', en: 'I am feeling sick', kn: 'ನನಗೆ ಹುಷಾರಿಲ್ಲ', hi: 'मेरी तबीयत ठीक नहीं है' },
          { id: 'feel_pain', pictogram: 'pain', en: 'I have pain in my body', kn: 'ನನ್ನ ದೇಹದಲ್ಲಿ ನೋವಿದೆ', hi: 'मेरे शरीर में दर्द है' },
          { id: 'feel_fever', pictogram: 'fever', en: 'I have a fever and feel hot', kn: 'ನನಗೆ ಜ್ವರ ಬಂದಿದೆ', hi: 'मुझे बुखार है और गर्मी लग रही है' }
        ]
      },
      {
        partnerPrompt: {
          en: 'I understand. How long have you felt like this?',
          kn: 'ತಿಳಿಯಿತು. ಎಷ್ಟು ಸಮಯದಿಂದ ಹೀಗನ್ನಿಸುತ್ತಿದೆ?',
          hi: 'मैं समझ गया। आपको कब से ऐसा लग रहा है?'
        },
        options: [
          { id: 'since_morning', pictogram: 'moon', en: 'Since this morning', kn: 'ಇಂದು ಬೆಳಗಿನಿಂದ', hi: 'आज सुबह से' },
          { id: 'few_days', pictogram: 'tired', en: 'For the past two days', kn: 'ಕಳೆದ ಎರಡು ದಿನಗಳಿಂದ', hi: 'पिछले दो दिनों से' }
        ]
      },
      {
        partnerPrompt: {
          en: 'I have written a gentle prescription for you. Please drink water and rest.',
          kn: 'ನಿಮಗಾಗಿ ಔಷಧಿ ಚೀಟಿ ಬರೆದಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ನೀರು ಕುಡಿದು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
          hi: 'मैंने आपके लिए दवा लिख दी है। कृपया पानी पिएं और आराम करें।'
        },
        options: [
          { id: 'thank_doctor', pictogram: 'thank_you', en: 'Thank you doctor for your help', kn: 'ಧನ್ಯವಾದಗಳು ವೈದ್ಯರೇ', hi: 'मदद के लिए धन्यवाद डॉक्टर' },
          { id: 'ask_water', pictogram: 'water', en: 'I will drink water and rest', kn: 'ನಾನು ವಿಶ್ರಾಂತಿ ಪಡೆಯುತ್ತೇನೆ', hi: 'मैं पानी पीकर आराम करूँगा' }
        ]
      }
    ]
  },

  // 7. Playing
  {
    id: 'playing',
    title: { en: 'Playing at the Park', kn: 'ಉದ್ಯಾನದಲ್ಲಿ ಆಟವಾಡುವುದು', hi: 'पार्क में खेलना' },
    description: {
      en: 'Take turns, invite friends, and play sports outdoors.',
      kn: 'ಸ್ನೇಹಿತರೊಂದಿಗೆ ಸರದಿಯಲ್ಲಿ ಆಟವಾಡಿ ಮತ್ತು ಆನಂದಿಸಿ.',
      hi: 'दोस्तों के साथ बारी-बारी से खेलें और मज़ा करें।'
    },
    icon: 'Smile',
    category: 'playing',
    turns: [
      {
        partnerPrompt: {
          en: 'Hey! Would you like to play ball with us?',
          kn: 'ನಮಸ್ಕಾರ! ನಮ್ಮೊಂದಿಗೆ ಚೆಂಡಿನ ಆಟ ಆಡುತ್ತೀರಾ?',
          hi: 'अरे! क्या आप हमारे साथ गेंद खेलेंगे?'
        },
        options: [
          { id: 'play_ball_yes', pictogram: 'ball', en: 'Yes! I love playing ball', kn: 'ಹೌದು! ಚೆಂಡಿನಾಟ ನನಗೆ ಇಷ್ಟ', hi: 'हाँ! मुझे गेंद खेलना पसंद है' },
          { id: 'play_swing', pictogram: 'playground', en: 'I want to go on the swing first', kn: 'ನಾನು ಮೊದಲು ಜೋಕಾಲಿಗೆ ಹೋಗುತ್ತೇನೆ', hi: 'मैं पहले झूले पर जाना चाहता हूँ' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Catch! It is your turn now!',
          kn: 'ಹಿಡಿಯಿರಿ! ಈಗ ನಿಮ್ಮ ಸರದಿ!',
          hi: 'पकड़ो! अब तुम्हारी बारी है!'
        },
        options: [
          { id: 'my_turn', pictogram: 'happy', en: 'I caught it! Here it comes!', kn: 'ಹಿಡಿದೆ! ಇಗೋ ಬಂತು ನೋಡಿ!', hi: 'मैंने पकड़ लिया! यह आ रही है!' },
          { id: 'take_break', pictogram: 'tired', en: 'Let us pause for some water', kn: 'ಸ್ವಲ್ಪ ನೀರು ಕುಡಿಯೋಣ ಬನ್ನಿ', hi: 'चलो थोड़ा पानी पी लेते हैं' }
        ]
      },
      {
        partnerPrompt: {
          en: 'That was super fun! Will you play with us again tomorrow?',
          kn: 'ತುಂಬಾ ಖುಷಿಯಾಯಿತು! ನಾಳೆಯೂ ಆಡಲು ಬರುತ್ತೀರಾ?',
          hi: 'बहुत मज़ा आया! क्या आप कल फिर खेलेंगे?'
        },
        options: [
          { id: 'play_tomorrow', pictogram: 'check_yes', en: 'Yes, see you tomorrow!', kn: 'ಹೌದು, ನಾಳೆ ಸಿಗೋಣ!', hi: 'हाँ, कल मिलते हैं!' },
          { id: 'thanks_friends', pictogram: 'friend', en: 'Thank you for playing with me', kn: 'ನನ್ನೊಂದಿಗೆ ಆಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ', hi: 'मेरे साथ खेलने के लिए धन्यवाद' }
        ]
      }
    ]
  },

  // 8. Family
  {
    id: 'family',
    title: { en: 'Family Gathering', kn: 'ಕುಟುಂಬ ಸಮ್ಮಿಲನ', hi: 'पारिवारिक मिलन' },
    description: {
      en: 'Greet relatives, share stories, and express warmth.',
      kn: 'ಸಂಬಂಧಿಕರಿಗೆ ನಮಸ್ಕರಿಸಿ ಮತ್ತು ಪ್ರೀತಿಯಿಂದ ಮಾತನಾಡಿ.',
      hi: 'रिश्तेदारों का अभिवादन करें और प्यार से बात करें।'
    },
    icon: 'Users',
    category: 'family',
    turns: [
      {
        partnerPrompt: {
          en: 'Everyone is so happy you are here! How have you been?',
          kn: 'ನೀವು ಬಂದಿದ್ದಕ್ಕೆ ಎಲ್ಲರಿಗೂ ತುಂಬಾ ಸಂತೋಷ! ಹೇಗಿದ್ದೀರಿ?',
          hi: 'आपके आने से सब बहुत खुश हैं! आप कैसे हैं?'
        },
        options: [
          { id: 'happy_to_be_here', pictogram: 'happy', en: 'I am so happy to see everyone', kn: 'ಎಲ್ಲರನ್ನೂ ನೋಡಿ ನನಗೆ ತುಂಬಾ ಸಂತೋಷ', hi: 'आप सभी से मिलकर मुझे बहुत खुशी हुई' },
          { id: 'greet_family', pictogram: 'wave_hand', en: 'Warm greetings to everyone', kn: 'ಎಲ್ಲರಿಗೂ ನನ್ನ ನಮಸ್ಕಾರಗಳು', hi: 'सभी को मेरा प्यार भरा नमस्कार' }
        ]
      },
      {
        partnerPrompt: {
          en: 'We made special treats for the family. Would you like a snack?',
          kn: 'ಕುಟುಂಬಕ್ಕಾಗಿ ವಿಶೇಷ ತಿಂಡಿ ಮಾಡಿದ್ದೇವೆ. ತಿಂಡಿ ಬೇಕೇ?',
          hi: 'हमने परिवार के लिए खास नाश्ता बनाया है। क्या आप लेंगे?'
        },
        options: [
          { id: 'snack_yes', pictogram: 'snack', en: 'Yes please, it looks delicious', kn: 'ಹೌದು ದಯವಿಟ್ಟು, ರುಚಿಯಾಗಿ ಕಾಣುತ್ತಿದೆ', hi: 'हाँ कृपया, यह बहुत स्वादिष्ट लग रहा है' },
          { id: 'tea_with_family', pictogram: 'tea', en: 'A cup of tea with everyone please', kn: 'ಎಲ್ಲರೊಂದಿಗೆ ಒಂದು ಕಪ್ ಚಹಾ ದಯವಿಟ್ಟು', hi: 'कृपया सबके साथ एक कप चाय' }
        ]
      },
      {
        partnerPrompt: {
          en: 'Thank you for spending time with us today. It means so much to the whole family.',
          kn: 'ಇಂದು ನಮ್ಮೊಂದಿಗೆ ಸಮಯ ಕಳೆದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ. ಕುಟುಂಬಕ್ಕೆ ಇದು ತುಂಬಾ ಮುಖ್ಯ.',
          hi: 'आज हमारे साथ समय बिताने के लिए धन्यवाद। पूरे परिवार के लिए यह बहुत खास है।'
        },
        options: [
          { id: 'love_family', pictogram: 'thank_you', en: 'I love you all. Thank you!', kn: 'ನಾನು ನಿಮ್ಮೆಲ್ಲರನ್ನೂ ಪ್ರೀತಿಸುತ್ತೇನೆ. ಧನ್ಯವಾದ!', hi: 'मैं आप सभी से बहुत प्यार करता हूँ। धन्यवाद!' }
        ]
      }
    ]
  }
];
