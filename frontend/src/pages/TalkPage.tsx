import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { useSpeechRecognition, SpeechRecognitionState } from '../hooks/useSpeechRecognition';
import {
  ConversationThread,
  ConversationTurn,
  saveConversationThread,
  logActivity
} from '../services/db';
import {
  predictConversationResponses,
  improveUserText,
  extractSpeechTokens,
  PredictedOption
} from '../services/ai';
import { Button } from '../components/Button';
import { Pictogram } from '../components/Pictogram';
import { SpeakIndicator } from '../components/SpeakIndicator';
import { MascotView } from '../components/MascotView';
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Sparkles,
  Volume2,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  Play,
  Check,
  Edit3,
  Image as ImageIcon,
  Hand,
  Keyboard,
  User,
  Users
} from 'lucide-react';

interface TalkPageProps {
  onNavigateToTab?: (tab: string) => void;
}

export const TalkPage: React.FC<TalkPageProps> = ({ onNavigateToTab }) => {
  const {
    language,
    userMode,
    preferences,
    speak,
    isSpeaking,
    activeSpokenText,
    replaySpokenText,
    stopSpeaking,
    celebrate,
    t
  } = useCommuniq();

  // Active conversation thread state
  const [threadId, setThreadId] = useState<string>(() => `convo_${Date.now()}`);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('greeting');

  // Partner input and speech state
  const [partnerTypedInput, setPartnerTypedInput] = useState<string>('');
  const [showMicHelp, setShowMicHelp] = useState<boolean>(false);
  const [activePartnerSpeech, setActivePartnerSpeech] = useState<string>('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<PredictedOption[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [activeProvider, setActiveProvider] = useState<string>('local_fallback');

  // User manual type box state
  const [userInput, setUserInput] = useState<string>('');
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [isImprovingText, setIsImprovingText] = useState<boolean>(false);

  // Sensitive response confirmation modal
  const [pendingSensitiveOption, setPendingSensitiveOption] = useState<PredictedOption | null>(null);

  // "Something else" modal
  const [showSomethingElseModal, setShowSomethingElseModal] = useState<boolean>(false);

  // Scripted Demo Mode state
  const [demoActive, setDemoActive] = useState<boolean>(preferences.demoMode || false);
  const [demoScenario, setDemoScenario] = useState<'hungry' | 'homework'>('hungry');
  const [demoStep, setDemoStep] = useState<number>(0);

  // Tone controls: Short, Polite, Casual
  const [talkTone, setTalkTone] = useState<'short' | 'polite' | 'casual'>('polite');

  const repairOptions = useMemo(() => {
    if (language === 'kn') {
      return [
        { text: 'ನಾನು ಹಾಗೆ ಹೇಳಲು ಉದ್ದೇಶಿಸಿರಲಿಲ್ಲ.' },
        { text: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ.' },
        { text: 'ನಾನು ಇನ್ನೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ.' },
        { text: 'ನಾನು ಹೇಳಲು ಬಯಸಿದ್ದು ಅದಲ್ಲ.' }
      ];
    }
    if (language === 'hi') {
      return [
        { text: 'मेरा यह मतलब नहीं था।' },
        { text: 'कृपया थोड़ा इंतज़ार करें।' },
        { text: 'मुझे फिर से कोशिश करने दें।' },
        { text: 'मैं यह नहीं कहना चाहता था।' }
      ];
    }
    return [
      { text: 'I did not mean that.' },
      { text: 'Please wait.' },
      { text: 'Let me try again.' },
      { text: 'That is not what I wanted to say.' }
    ];
  }, [language]);

  // Bottom scroll anchor
  const threadEndRef = useRef<HTMLDivElement>(null);
  const userInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new turns arrive
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, activePartnerSpeech]);

  // Load suggestions given current turns and topic
  const fetchSuggestions = useCallback(
    async (currentTurns: ConversationTurn[], topic: string) => {
      setLoadingSuggestions(true);
      try {
        const payloadTurns = currentTurns.map((turn) => ({
          speaker: turn.speaker,
          text: turn.text,
          time: turn.timestamp
        }));

        const result = await predictConversationResponses({
          language,
          ageGroup: userMode,
          conversationId: threadId,
          messages: payloadTurns,
          currentTopic: topic,
          enableAI: preferences.enableAI,
          demoMode: demoActive
        });

        setSuggestions(result.responses);
        setActiveProvider(result.providerUsed);
      } catch {
        // Fallback already guaranteed inside predictConversationResponses
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [language, userMode, threadId, preferences.enableAI, demoActive]
  );

  // Initial load
  useEffect(() => {
    let mounted = true;
    predictConversationResponses({
      language,
      ageGroup: userMode,
      conversationId: threadId,
      messages: [],
      currentTopic: 'greeting',
      enableAI: preferences.enableAI,
      demoMode: demoActive
    }).then((result) => {
      if (mounted) {
        setSuggestions(result.responses);
        setActiveProvider(result.providerUsed);
      }
    });
    return () => {
      mounted = false;
    };
  }, [language, userMode, threadId, preferences.enableAI, demoActive]);

  // Save thread to Dexie database whenever turns change
  const persistThread = useCallback(
    async (updatedTurns: ConversationTurn[]) => {
      if (updatedTurns.length === 0) return;
      const firstTurn = updatedTurns[0];
      const title = firstTurn.text.slice(0, 32) + (firstTurn.text.length > 32 ? '...' : '');

      const thread: ConversationThread = {
        id: threadId,
        title,
        startedAt: updatedTurns[0].timestamp,
        updatedAt: Date.now(),
        language,
        userMode,
        turns: updatedTurns
      };

      await saveConversationThread(thread);
    },
    [threadId, language, userMode]
  );

  // Handle partner's speech turn (from mic, typing, or quick prompts)
  const handlePartnerSpeech = useCallback(
    async (partnerText: string) => {
      if (!partnerText.trim()) return;

      setActivePartnerSpeech(partnerText);

      // Detect topic change from partner text
      let newTopic = currentTopic;
      const lower = partnerText.toLowerCase();
      if (/hungry|eat|food|breakfast|lunch|dinner|ಹಸಿವು|ಊಟ|ತಿಂಡಿ|भूख|खाना/.test(lower)) {
        newTopic = 'hunger';
      } else if (/drink|water|juice|tea|ನೀರು|ಕುಡಿಯಲು|पानी|प्यास/.test(lower)) {
        newTopic = 'drink';
      } else if (/homework|school|study|ಶಾಲೆ|ಪಾಠ|ಮನೆಕೆಲಸ|स्कूल|गृहकार्य|होमवर्क/.test(lower)) {
        newTopic = 'homework';
      } else if (/doctor|medicine|hurt|pain|sick|ವೈದ್ಯರು|ನೋವು|डॉक्टर|दर्द|बीमार/.test(lower)) {
        newTopic = 'health';
      } else if (/help|ಸಹಾಯ|मदद/.test(lower)) {
        newTopic = 'help';
      }

      setCurrentTopic(newTopic);

      const newTurn: ConversationTurn = {
        speaker: 'other',
        text: partnerText,
        timestamp: Date.now()
      };

      const updated = [...turns, newTurn];
      setTurns(updated);
      await persistThread(updated);

      // Also log to activityLogs for My Day
      await logActivity({
        phrase: partnerText,
        language,
        category: 'conversation',
        speaker: 'partner',
        userMode,
        isFavorite: false
      });

      setPartnerTypedInput('');

      // Predict next options for user
      await fetchSuggestions(updated, newTopic);
    },
    [currentTopic, turns, persistThread, language, userMode, fetchSuggestions]
  );

  // Speech Recognition hook for listening to the speaking partner
  const handleFinalSpeechResult = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      handlePartnerSpeech(text.trim());
    },
    [handlePartnerSpeech]
  );

  const {
    state: micState,
    interimTranscript,
    error: micError,
    startListening,
    stopListening
  } = useSpeechRecognition(handleFinalSpeechResult);

  // Execute user speech turn
  const executeUserSpeech = useCallback(
    async (spokenText: string, pictogramKeyword?: string) => {
      // 1. Immediate speech playback via Web Speech API in native script
      // Never block audio, never freeze UI
      speak(spokenText, { category: 'conversation', speaker: 'user' });

      // Child celebration
      if (userMode === 'child') {
        celebrate();
      }

      // 2. Add turn to conversation thread
      const newTurn: ConversationTurn = {
        speaker: 'user',
        text: spokenText,
        timestamp: Date.now(),
        pictogramKeyword: pictogramKeyword || 'yes'
      };

      const updated = [...turns, newTurn];
      setTurns(updated);
      await persistThread(updated);

      // 3. Save into My Day activity log
      await logActivity({
        phrase: spokenText,
        language,
        category: 'conversation',
        speaker: 'user',
        userMode,
        isFavorite: false
      });

      setPendingSensitiveOption(null);
      setShowSomethingElseModal(false);

      // 4. Predict the next set of responses
      await fetchSuggestions(updated, currentTopic);
    },
    [speak, userMode, celebrate, turns, persistThread, language, fetchSuggestions, currentTopic]
  );

  // Handle non-speaking user selecting a response
  const handleUserSelect = (option: PredictedOption) => {
    // If sensitive, require confirmation first
    if (option.sensitive) {
      setPendingSensitiveOption(option);
      return;
    }

    executeUserSpeech(option.spokenText, option.pictogramKeyword);
  };

  // User typed words in manual input box
  const handleUserSendManual = async () => {
    const textToSend = improvedText || userInput.trim();
    if (!textToSend) return;

    await executeUserSpeech(textToSend);
    setUserInput('');
    setImprovedText(null);
  };

  // AI text improvement
  const handleImproveText = async () => {
    if (!userInput.trim()) return;
    setIsImprovingText(true);
    try {
      const improved = await improveUserText(userInput.trim(), language, userMode);
      setImprovedText(improved);
    } catch {
      // Ignore fallback
    } finally {
      setIsImprovingText(false);
    }
  };

  // Start fresh conversation
  const handleNewConversation = () => {
    const newId = `convo_${Date.now()}`;
    setThreadId(newId);
    setTurns([]);
    setActivePartnerSpeech('');
    setCurrentTopic('greeting');
    setUserInput('');
    setImprovedText(null);
    fetchSuggestions([], 'greeting');
  };

  // Scripted Demo Mode scenario steps
  const demoScenarios = {
    hungry: [
      { partner: 'Are you hungry? What would you like to eat?', topic: 'hunger' },
      { partner: 'I can make pizza or prepare fresh rice. Which one?', topic: 'hunger' },
      { partner: 'Would you like some water or cold juice to drink?', topic: 'drink' },
      { partner: 'Here is your fresh food and water. Enjoy your meal!', topic: 'greeting' }
    ],
    homework: [
      { partner: 'Did you finish your school homework today?', topic: 'homework' },
      { partner: 'Do you need help understanding the math problems?', topic: 'homework' },
      { partner: 'We can solve them step by step together. Ready?', topic: 'homework' },
      { partner: 'Great job! You finished your homework today.', topic: 'greeting' }
    ]
  };

  const handleRunDemoStep = async () => {
    const scenarioList = demoScenarios[demoScenario];
    const stepIdx = demoStep % scenarioList.length;
    const currentScenarioItem = scenarioList[stepIdx];

    await handlePartnerSpeech(currentScenarioItem.partner);
    setDemoStep((prev) => prev + 1);
  };

  // Quick partner starter chips
  const quickPartnerStarters = [
    { label: 'Are you hungry?', text: 'Are you hungry? Would you like something to eat?' },
    { label: 'Drink water?', text: 'Would you like some water to drink?' },
    { label: 'Homework done?', text: 'Did you finish your school homework?' },
    { label: 'Need any help?', text: 'Do you need any help right now?' },
    { label: 'How are you?', text: 'Hello, how are you feeling today?' }
  ];

  // Dynamic status text for partner mic state
  const getMicStatusLabel = (state: SpeechRecognitionState) => {
    switch (state) {
      case 'listening':
        return 'Listening to partner...';
      case 'understanding':
        return 'Understanding speech...';
      case 'error':
        return 'Speech notice';
      default:
        return 'Listen to Partner';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Toolbar */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">{t.talkWithSomeone}</h2>
            <span
              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-[8px] border ${
                activeProvider === 'demo_mode'
                  ? 'bg-[#FFF4D6] border-[#FFB703] text-[#7A5400]'
                  : activeProvider === 'local_fallback'
                  ? 'bg-[#FFF8EF] border-[#E5DACF] text-[#5E564D]'
                  : 'bg-[#EBF7EF] border-[#1B7A42] text-[#1E4620]'
              }`}
            >
              {activeProvider === 'demo_mode'
                ? 'Demo Mode'
                : activeProvider === 'local_fallback'
                ? 'Local Offline'
                : activeProvider.toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#085557] mt-0.5">
            Tap Listen when the other person is ready.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-1.5">
            <button
              type="button"
              onClick={() => setDemoActive(!demoActive)}
              aria-pressed={demoActive}
              className={`text-xs font-black px-3 py-1.5 rounded-[8px] transition-colors ${
                demoActive ? 'bg-[#FFB703] text-[#1F1B16]' : 'bg-transparent text-[#5E564D]'
              }`}
            >
              Demo: {demoActive ? 'ON' : 'OFF'}
            </button>

            {demoActive && (
              <>
                <select
                  value={demoScenario}
                  onChange={(e) => {
                    setDemoScenario(e.target.value as 'hungry' | 'homework');
                    setDemoStep(0);
                  }}
                  className="text-xs font-bold bg-white border border-[#E5DACF] rounded-[6px] px-2 py-1 text-[#1F1B16]"
                  aria-label="Select Demo Scenario"
                >
                  <option value="hungry">Scenario 1: Hungry</option>
                  <option value="homework">Scenario 2: Homework</option>
                </select>

                <Button
                  variant="secondary"
                  size="normal"
                  onClick={handleRunDemoStep}
                  icon={<Play className="w-3.5 h-3.5 text-[#0A6C6E]" />}
                >
                  Next Step
                </Button>
              </>
            )}
          </div>

          {/* New Conversation Button */}
          <Button
            variant="secondary"
            size="normal"
            onClick={handleNewConversation}
            icon={<PlusCircle className="w-4 h-4 text-[#0A6C6E]" />}
          >
            New Conversation
          </Button>
        </div>
      </div>

      {/* AI Consent Notice if AI is off */}
      {!preferences.enableAI && !demoActive && (
        <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#5E564D]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0A6C6E] shrink-0" />
            <span>AI suggestions are off. Communiq is using local offline suggestions.</span>
          </div>
          <span className="text-[#085557] font-extrabold">Offline Engine</span>
        </div>
      )}

      {/* Active Speaking Indicator */}
      {activeSpokenText && (
        <SpeakIndicator
          isSpeaking={isSpeaking}
          phrase={activeSpokenText}
          onReplay={replaySpokenText}
          onStop={stopSpeaking}
          replayLabel={t.speakAgain}
          stopLabel={t.stop}
          speakingLabel={t.speaking}
          userMode={userMode}
        />
      )}

      {/* 2. Main Two-Column Split Screen on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Conversation Partner (HEAR & UNDERSTAND) */}
        {/* =================================================================== */}
        <section
          aria-labelledby="partner-side-heading"
          className="lg:col-span-5 space-y-4 bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A6C6E]" />
              <h3 id="partner-side-heading" className="text-lg font-black text-[#1F1B16]">
                Conversation Partner
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowMicHelp(!showMicHelp)}
              className="text-xs font-bold text-[#085557] hover:underline flex items-center gap-1 cursor-pointer"
              aria-label="Microphone privacy explanation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Mic Privacy</span>
            </button>
          </div>

          {/* Microphone Privacy Explanation Card */}
          {showMicHelp && (
            <div className="bg-[#E2F3F3] border-2 border-[#0A6C6E] rounded-[12px] p-3 text-xs text-[#1F1B16] space-y-1.5">
              <p className="font-extrabold text-[#085557]">On-Device Audio Processing</p>
              <p className="font-semibold leading-relaxed">
                Communiq listens to turn the other person's voice into text. Audio is processed on your device
                and never stored, recorded, or sent anywhere.
              </p>
              <button
                type="button"
                onClick={() => setShowMicHelp(false)}
                className="text-[11px] font-black underline text-[#085557] block cursor-pointer"
              >
                Close notice
              </button>
            </div>
          )}

          {/* Large Listen Button (Rectangular, 10-12px radius, zero pill buttons) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (micState === 'listening' || micState === 'understanding') {
                  stopListening();
                } else {
                  startListening(language);
                }
              }}
              aria-label={getMicStatusLabel(micState)}
              aria-live="polite"
              className={`w-full min-h-[68px] rounded-[12px] border-2 font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-colors active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer ${
                micState === 'listening'
                  ? 'bg-[#FFB703] border-[#1F1B16] text-[#1F1B16]'
                  : micState === 'understanding'
                  ? 'bg-[#EBF7EF] border-[#1B7A42] text-[#1E4620]'
                  : 'bg-[#0A6C6E] border-[#0A6C6E] text-white hover:bg-[#085557]'
              }`}
            >
              {micState === 'listening' ? (
                <>
                  <MicOff className="w-6 h-6 text-[#1F1B16] shrink-0" />
                  <span>Tap to Stop Listening</span>
                </>
              ) : micState === 'understanding' ? (
                <>
                  <Sparkles className="w-6 h-6 text-[#1B7A42] shrink-0" />
                  <span>Understanding Words...</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 text-white shrink-0" />
                  <span>Listen to Partner</span>
                </>
              )}
            </button>

            {/* Interim live speech feedback */}
            {interimTranscript && (
              <div
                aria-live="polite"
                className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-2.5 text-sm font-bold text-[#5E564D] italic"
              >
                Hearing: "{interimTranscript}..."
              </div>
            )}

            {/* Speech error notice */}
            {micError && (
              <div
                role="alert"
                className="bg-[#FFF4D6] border border-[#FFB703] rounded-[10px] p-2.5 text-xs font-bold text-[#7A5400] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}
          </div>

          {/* Quick Partner Starters (Essential for testing or quick conversation flow) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#5E564D] block">
              Quick Partner Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPartnerStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePartnerSpeech(starter.text)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-[8px] bg-[#FFF8EF] border border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E] hover:bg-[#E2F3F3] active:scale-95 transition-colors text-left cursor-pointer"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Type Box for Partner */}
          <div className="space-y-2 pt-2 border-t border-[#E5DACF]">
            <label
              htmlFor="partner-typed-input"
              className="text-xs font-black uppercase tracking-wider text-[#5E564D] block"
            >
              Or Type What Partner Said
            </label>
            <div className="flex gap-2">
              <input
                id="partner-typed-input"
                type="text"
                value={partnerTypedInput}
                onChange={(e) => setPartnerTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePartnerSpeech(partnerTypedInput);
                }}
                placeholder="Partner words (e.g. Are you hungry?)..."
                className="flex-1 min-h-[48px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] bg-white font-bold text-sm text-[#1F1B16] focus:border-[#0A6C6E] focus:outline-none"
              />
              <Button
                variant="secondary"
                size="normal"
                onClick={() => handlePartnerSpeech(partnerTypedInput)}
                disabled={!partnerTypedInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Most Recent Partner Speech Bubble with Inline Pictograms (UNDERSTAND STEP) */}
          {activePartnerSpeech && (
            <div className="pt-3 border-t-2 border-[#E5DACF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#085557]">
                  Partner Said (Understood)
                </span>
                <button
                  type="button"
                  onClick={() => speak(activePartnerSpeech, { category: 'conversation', speaker: 'partner' })}
                  className="text-xs font-bold text-[#085557] hover:underline flex items-center gap-1 cursor-pointer"
                  aria-label="Hear partner words again"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Hear again</span>
                </button>
              </div>

              {/* Speech bubble with keyword pictogram tags */}
              <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-3.5 space-y-2">
                <div className="flex flex-wrap items-end gap-x-2 gap-y-2 text-lg font-bold text-[#1F1B16] leading-snug">
                  {extractSpeechTokens(activePartnerSpeech).map((token, idx) => (
                    <span key={idx} className="inline-flex flex-col items-center">
                      {token.pictogram && (
                        <span className="w-7 h-7 mb-0.5 flex items-center justify-center bg-white border border-[#E5DACF] rounded-[6px] p-0.5">
                          <Pictogram name={token.pictogram} alt={token.word} size={22} />
                        </span>
                      )}
                      <span>{token.word}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Child mascot encouragement when in child mode */}
          {userMode === 'child' && (
            <div className="pt-2">
              <MascotView
                message={t.mascotEncouragement1}
                pose={turns.length > 0 ? 'celebrate' : 'calm'}
              />
            </div>
          )}
        </section>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Non-speaking User ("You could say" SUGGEST & SPEAK) */}
        {/* =================================================================== */}
        <section
          aria-labelledby="user-side-heading"
          className="lg:col-span-7 space-y-5 bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 sm:p-5 shadow-sm"
        >
          {/* Header */}
          <div className="border-b-2 border-[#E5DACF] pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0A6C6E]" />
                <h3 id="user-side-heading" className="text-xl font-black text-[#1F1B16]">
                  You could say
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#5E564D] mt-0.5">
                Tap any card to speak aloud immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {loadingSuggestions && (
                <span className="text-xs font-bold text-[#085557] hidden sm:flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thinking...
                </span>
              )}

              {/* Tone controls: Short, Polite, Casual */}
              <div className="flex items-center gap-1 bg-[#FFF8EF] p-1 rounded-[8px] border border-[#E5DACF]">
                {(['short', 'polite', 'casual'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setTalkTone(tone)}
                    className={`h-7 px-2.5 rounded-[6px] font-bold text-xs capitalize transition-transform active:scale-95 ${
                      talkTone === tone
                        ? 'bg-[#0A6C6E] text-white shadow-xs'
                        : 'text-[#5E564D] hover:text-[#1F1B16]'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestion Options Grid */}
          <div
            className={`grid gap-3 ${
              userMode === 'child'
                ? 'grid-cols-1 sm:grid-cols-2'
                : userMode === 'student'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}
          >
            {loadingSuggestions && suggestions.length === 0 ? (
              // Skeleton cards while loading
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[110px] rounded-[14px] border-2 border-[#E5DACF] bg-[#FFF8EF] p-4 animate-pulse flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E5DACF]" />
                  <div className="w-24 h-4 rounded bg-[#E5DACF]" />
                </div>
              ))
            ) : suggestions.length === 0 ? (
              <div className="col-span-full py-8 text-center text-[#5E564D] font-bold">
                <p>Choose an action below or type words to speak.</p>
              </div>
            ) : (
              suggestions.map((option, idx) => {
                const isSomethingElse = option.intent === 'custom';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSomethingElse) {
                        setShowSomethingElseModal(true);
                      } else {
                        handleUserSelect(option);
                      }
                    }}
                    aria-label={`Say: ${option.spokenText}`}
                    className={`card-communiq group relative flex flex-col items-center justify-between text-center select-none w-full border-2 rounded-[14px] transition-transform duration-100 p-3.5 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer ${
                      isSomethingElse
                        ? 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E]'
                        : option.sensitive
                        ? 'bg-[#FFF4D6] border-[#FFB703] text-[#1F1B16] hover:border-[#D62828]'
                        : 'bg-white border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E] hover:bg-[#E2F3F3]'
                    } ${
                      userMode === 'child'
                        ? 'min-h-[140px]'
                        : userMode === 'student'
                        ? 'min-h-[110px]'
                        : 'min-h-[96px]'
                    }`}
                  >
                    {/* Sensitive indicator badge */}
                    {option.sensitive && (
                      <span className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-[#D62828] text-white">
                        Caution
                      </span>
                    )}

                    {/* Pictogram */}
                    <div className="flex-1 flex items-center justify-center py-1">
                      <Pictogram
                        name={option.pictogramKeyword}
                        alt={option.label}
                        size={userMode === 'child' ? 64 : 48}
                      />
                    </div>

                    {/* Label in Native Script */}
                    <div className="w-full pt-1.5 border-t border-[#E5DACF]/60">
                      <span
                        className={`block font-black leading-snug break-words ${
                          userMode === 'child'
                            ? 'text-lg sm:text-xl text-[#085557]'
                            : userMode === 'student'
                            ? 'text-base sm:text-lg text-[#1F1B16]'
                            : 'text-base font-bold text-[#1F1B16]'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* 1-tap Conversation Repair Row */}
          <div className="pt-2 border-t border-[#E5DACF] flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-[#5E564D] mr-1">
              Repair:
            </span>
            {repairOptions.map((rep: { text: string }, idx: number) => (
              <button
                key={`talk-repair-${idx}`}
                type="button"
                onClick={() => executeUserSpeech(rep.text, 'help')}
                className="h-7 px-2.5 rounded-[6px] bg-[#FFF4D6] border border-[#FFB703] text-[#7A5400] font-bold text-xs hover:border-[#7A5400] transition-transform active:scale-95"
              >
                {rep.text}
              </button>
            ))}
          </div>

          {/* User Custom Typed Voice Box */}
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="user-manual-input"
                className="text-xs font-black uppercase tracking-wider text-[#085557]"
              >
                Type what you want to say
              </label>

              <button
                type="button"
                onClick={handleImproveText}
                disabled={!userInput.trim() || isImprovingText}
                className="text-xs font-black text-[#085557] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                aria-label="Improve text with AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0A6C6E]" />
                <span>{isImprovingText ? 'Improving...' : 'Improve with AI'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                ref={userInputRef}
                id="user-manual-input"
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setImprovedText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUserSendManual();
                }}
                placeholder="Type words you want to speak..."
                className="flex-1 min-h-[48px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] bg-white font-bold text-base text-[#1F1B16] focus:border-[#0A6C6E] focus:outline-none"
              />
              <Button
                variant="primary"
                size="normal"
                onClick={handleUserSendManual}
                disabled={!userInput.trim()}
                icon={<Send className="w-4 h-4 text-white" />}
              >
                {t.speak}
              </Button>
            </div>

            {/* AI Improved suggestion preview buttons */}
            {improvedText && (
              <div className="bg-white border-2 border-[#0A6C6E] rounded-[10px] p-3 space-y-2">
                <span className="text-xs font-black text-[#085557] block">
                  Natural Sentence Suggestion:
                </span>
                <p className="text-base font-bold text-[#1F1B16]">"{improvedText}"</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={() => {
                      executeUserSpeech(improvedText);
                      setUserInput('');
                      setImprovedText(null);
                    }}
                    icon={<Check className="w-3.5 h-3.5 text-white" />}
                  >
                    Use improved
                  </Button>
                  <Button
                    variant="secondary"
                    size="normal"
                    onClick={() => {
                      executeUserSpeech(userInput.trim());
                      setUserInput('');
                      setImprovedText(null);
                    }}
                  >
                    Use original
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 3. Conversation Thread Log (Visual history of the dialog) */}
      <section
        aria-label="Conversation Thread History"
        className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 sm:p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-[#E5DACF] pb-3">
          <h3 className="text-base font-black text-[#1F1B16]">
            Conversation History ({turns.length} turns)
          </h3>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={handleNewConversation}
              className="text-xs font-bold text-[#5E564D] hover:underline cursor-pointer"
            >
              Clear thread
            </button>
          )}
        </div>

        <div
          role="log"
          aria-live="polite"
          className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1"
        >
          {turns.length === 0 ? (
            <div className="text-center py-8 text-[#5E564D]">
              <p className="text-sm font-bold">Start a two-way conversation above.</p>
              <p className="text-xs mt-1">Tap Listen for the partner, or pick a card to speak aloud.</p>
            </div>
          ) : (
            turns.map((turn, idx) => {
              const isUser = turn.speaker === 'user';
              const timeString = new Date(turn.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isUser ? (
                      <>
                        <span className="text-xs font-bold text-[#085557]">You</span>
                        <User className="w-3.5 h-3.5 text-[#0A6C6E]" />
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5 text-[#5E564D]" />
                        <span className="text-xs font-bold text-[#5E564D]">Partner</span>
                      </>
                    )}
                    <span className="text-[10px] text-[#5E564D] ml-1">{timeString}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-[14px] border-2 p-3 sm:p-4 text-base sm:text-lg font-bold leading-snug ${
                      isUser
                        ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#1F1B16]'
                        : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16]'
                    }`}
                  >
                    <p>{turn.text}</p>
                    <div className="mt-2 flex items-center justify-between gap-3 pt-1 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => speak(turn.text, { category: 'conversation', speaker: turn.speaker === 'user' ? 'user' : 'partner' })}
                        aria-label={`Replay phrase: ${turn.text}`}
                        className="text-xs font-bold text-[#085557] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Say again</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={threadEndRef} />
        </div>
      </section>

      {/* 4. Sensitive Confirmation Modal */}
      {pendingSensitiveOption && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sensitive-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-md bg-white border-2 border-[#D62828] rounded-[16px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#D62828]">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h4 id="sensitive-dialog-title" className="text-xl font-black text-[#1F1B16]">
                Confirm Spoken Message
              </h4>
            </div>

            <p className="text-sm font-semibold text-[#5E564D]">
              This card conveys an urgent or sensitive phrase:
            </p>

            <div className="bg-[#FFF4D6] border border-[#FFB703] rounded-[10px] p-3 text-base font-bold text-[#1F1B16]">
              "{pendingSensitiveOption.spokenText}"
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setPendingSensitiveOption(null)}
              >
                {t.cancel}
              </Button>
              <Button
                variant="emergency"
                size="normal"
                onClick={() => executeUserSpeech(pendingSensitiveOption.spokenText, pendingSensitiveOption.pictogramKeyword)}
              >
                Yes, speak
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. "Something Else" Action Modal */}
      {showSomethingElseModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="something-else-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-md bg-white border-2 border-[#0A6C6E] rounded-[16px] p-6 shadow-2xl space-y-4">
            <h4 id="something-else-title" className="text-xl font-black text-[#1F1B16]">
              Choose Another Way to Communicate
            </h4>
            <p className="text-xs font-semibold text-[#5E564D]">
              Select how you would like to express your words:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSomethingElseModal(false);
                  userInputRef.current?.focus();
                }}
                className="p-3.5 rounded-[12px] border-2 border-[#E5DACF] bg-[#FFF8EF] hover:border-[#0A6C6E] flex items-center gap-3 font-bold text-sm text-[#1F1B16] text-left cursor-pointer"
              >
                <Keyboard className="w-5 h-5 text-[#0A6C6E] shrink-0" />
                <span>Type words</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSomethingElseModal(false);
                  if (onNavigateToTab) onNavigateToTab('communicate');
                }}
                className="p-3.5 rounded-[12px] border-2 border-[#E5DACF] bg-[#FFF8EF] hover:border-[#0A6C6E] flex items-center gap-3 font-bold text-sm text-[#1F1B16] text-left cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-[#0A6C6E] shrink-0" />
                <span>Picture cards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSomethingElseModal(false);
                  if (onNavigateToTab) onNavigateToTab('practice');
                }}
                className="p-3.5 rounded-[12px] border-2 border-[#E5DACF] bg-[#FFF8EF] hover:border-[#0A6C6E] flex items-center gap-3 font-bold text-sm text-[#1F1B16] text-left cursor-pointer"
              >
                <Edit3 className="w-5 h-5 text-[#0A6C6E] shrink-0" />
                <span>Draw on canvas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSomethingElseModal(false);
                  if (onNavigateToTab) onNavigateToTab('practice');
                }}
                className="p-3.5 rounded-[12px] border-2 border-[#E5DACF] bg-[#FFF8EF] hover:border-[#0A6C6E] flex items-center gap-3 font-bold text-sm text-[#1F1B16] text-left cursor-pointer"
              >
                <Hand className="w-5 h-5 text-[#0A6C6E] shrink-0" />
                <span>Sign language</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setShowSomethingElseModal(false)}
              >
                {t.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
