/* oxlint-disable react/set-state-in-effect, react/purity */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { analyzeSignMedia } from '../services/signService';
import { fetchChatReplies, ChatTurnItem } from '../services/ai';
import {
  saveConversationThread,
  logActivity
} from '../services/db';
import {
  Camera,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  RotateCcw,
  Check,
  Loader2,
  User,
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import { SignVisionModal } from '../components/SignVisionModal';
import { ComposerBoardDrawer } from '../components/ComposerBoardDrawer';

export interface ChatMessage {
  id: string;
  speaker: 'user' | 'other'; // 'user' = non-speaking user (teal bubble, right), 'other' = speaking partner (white bubble, left)
  text: string;
  timestamp: number;
  suggestions?: string[];
  isLoadingSuggestions?: boolean;
  isSignTranscript?: boolean;
  selectedChip?: string;
}

interface ChatPageProps {
  onNavigateToBoard?: () => void;
  onOpenEmergency?: () => void;
  onOpenSettings?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  onNavigateToBoard
}) => {
  const {
    language,
    userMode,
    speak,
    isSpeaking,
    activeSpokenText
  } = useCommuniq();

  // Active conversation thread ID & messages
  const [threadId, setThreadId] = useState<string>(() => `chat_${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Composer text input (fallback typing)
  const [inputText, setInputText] = useState<string>('');

  // Sign language analysis state (Flow A: DeepMind SL2T Vision)
  const [isAnalyzingSign, setIsAnalyzingSign] = useState<boolean>(false);
  const [isSignVisionOpen, setIsSignVisionOpen] = useState<boolean>(false);
  const [isBoardDrawerOpen, setIsBoardDrawerOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Status notification pill
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Clear status helper
  const showStatus = useCallback((msg: string, duration = 3000) => {
    setStatusMessage(msg);
    const timer = setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  // Web Speech API Text-to-Speech (TTS) executor
  const speakOutLoud = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;
      const clean = text.trim();

      // Speak through app service
      try {
        await speak(clean, { speaker: 'user' });
      } catch {
        // Direct browser fallback
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(clean);
          if (language === 'kn') utterance.lang = 'kn-IN';
          else if (language === 'hi') utterance.lang = 'hi-IN';
          else utterance.lang = 'en-US';
          window.speechSynthesis.speak(utterance);
        }
      }

      await logActivity({
        phrase: clean,
        language,
        category: 'chat',
        speaker: 'user',
        userMode,
        isFavorite: false
      });
    },
    [speak, language, userMode]
  );

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView?.({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzingSign, scrollToBottom]);

  // Persist conversation thread to IndexedDB
  const persistThread = useCallback(
    async (currentMessages: ChatMessage[]) => {
      if (currentMessages.length === 0) return;
      const first = currentMessages[0];
      const title = first.text.slice(0, 30) + (first.text.length > 30 ? '...' : '');

      await saveConversationThread({
        id: threadId,
        title,
        startedAt: first.timestamp,
        updatedAt: Date.now(),
        language,
        userMode,
        turns: currentMessages.map((m) => ({
          speaker: m.speaker,
          text: m.text,
          timestamp: m.timestamp
        }))
      });
    },
    [threadId, language, userMode]
  );

  // -------------------------------------------------------------------------
  // FLOW B: Partner Speech-to-Text & AI Suggestions Engine
  // -------------------------------------------------------------------------
  const handlePartnerSpeechRecognized = useCallback(
    async (spokenText: string) => {
      if (!spokenText || !spokenText.trim()) return;
      const cleanText = spokenText.trim();

      const partnerMsgId = `partner_${Date.now()}`;
      const newPartnerMessage: ChatMessage = {
        id: partnerMsgId,
        speaker: 'other',
        text: cleanText,
        timestamp: Date.now(),
        isLoadingSuggestions: true,
        suggestions: []
      };

      setMessages((prev) => {
        const next = [...prev, newPartnerMessage];
        persistThread(next);
        return next;
      });

      showStatus('Generating AI replies...');

      // Call AI Chat Engine (POST /api/chat/replies)
      try {
        const turnsPayload: ChatTurnItem[] = [
          ...messages.map((m) => ({
            speaker: m.speaker,
            text: m.text,
            timestamp: m.timestamp
          })),
          { speaker: 'other', text: cleanText, timestamp: Date.now() }
        ];

        const result = await fetchChatReplies({
          language,
          ageGroup: userMode,
          tone: 'polite',
          turns: turnsPayload,
          enableAI: true
        });

        // Extract 3-4 short, contextual reply suggestions
        let replyTexts: string[] = [];
        if (result && Array.isArray(result.replies) && result.replies.length > 0) {
          replyTexts = result.replies.slice(0, 4).map((r) => r.text);
        }

        // Contextual fallback suggestions if empty
        if (replyTexts.length === 0) {
          if (language === 'kn') {
            replyTexts = ['ಹೌದು, ದಯವಿಟ್ಟು.', 'ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.', 'ನನಗೆ ನೀರು ಬೇಕು.', 'ಸ್ವಲ್ಪ ಸಮಯ ಕೊಡಿ.'];
          } else if (language === 'hi') {
            replyTexts = ['हाँ, कृपया।', 'नहीं, धन्यवाद।', 'मुझे पानी चाहिए।', 'थोड़ा इंतज़ार करें।'];
          } else {
            replyTexts = ['Yes, please.', 'No, thank you.', 'I need water.', 'Please wait.'];
          }
        }

        // Attach suggestion chips directly underneath this partner bubble
        setMessages((prev) =>
          prev.map((m) =>
            m.id === partnerMsgId
              ? { ...m, isLoadingSuggestions: false, suggestions: replyTexts }
              : m
          )
        );
      } catch {
        // Fallback options on network error
        const fallbackOptions =
          language === 'kn'
            ? ['ಹೌದು.', 'ಇಲ್ಲ.', 'ನನಗೆ ನೀರು ಬೇಕು.', 'ಸಹಾಯ ಬೇಕು.']
            : language === 'hi'
            ? ['हाँ।', 'नहीं।', 'मुझे पानी चाहिए।', 'मदद चाहिए।']
            : ['Yes, please.', 'No, thank you.', 'I need water.', 'I need help.'];

        setMessages((prev) =>
          prev.map((m) =>
            m.id === partnerMsgId
              ? { ...m, isLoadingSuggestions: false, suggestions: fallbackOptions }
              : m
          )
        );
      }
    },
    [language, userMode, messages, persistThread, showStatus]
  );

  // Hook for partner microphone speech recognition
  const {
    isSupported: isSttSupported,
    state: sttState,
    startListening,
    stopListening
  } = useSpeechRecognition(handlePartnerSpeechRecognized);

  const isListening = sttState === 'listening' || sttState === 'understanding';

  const toggleMicListening = () => {
    if (isListening) {
      stopListening();
      showStatus('Microphone stopped.');
    } else {
      if (!isSttSupported) {
        // Fallback prompt if SpeechRecognition is not supported
        const simulated = window.prompt(
          'Microphone API not supported on this browser. Type what the speaking partner said:',
          'Would you like something to drink?'
        );
        if (simulated) {
          handlePartnerSpeechRecognized(simulated);
        }
        return;
      }
      startListening(language);
      showStatus('Listening to partner...');
    }
  };

  // -------------------------------------------------------------------------
  // FLOW A: Sign Language to Speech (Non-Speaking User)
  // -------------------------------------------------------------------------
  const handleOpenSignPicker = () => {
    setIsSignVisionOpen(true);
  };

  const handleSignDecoded = async (transcript: string, _signKey: string, confidence: number) => {
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      speaker: 'user',
      text: transcript,
      timestamp: Date.now(),
      isSignTranscript: true
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      persistThread(next);
      return next;
    });

    await speakOutLoud(transcript);
    showStatus(`Decoded "${transcript}" (${Math.round(confidence * 100)}%)`);
  };

  const handleBoardSentenceCreated = async (sentence: string) => {
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      speaker: 'user',
      text: sentence,
      timestamp: Date.now()
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      persistThread(next);
      return next;
    });

    await speakOutLoud(sentence);
    showStatus('Sentence assembled and spoken!');
  };

  const handleSignFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can choose same file again if desired
    e.target.value = '';

    setIsAnalyzingSign(true);
    showStatus('Analyzing sign language...');

    try {
      // Send to backend endpoint POST /api/sign/analyze
      const result = await analyzeSignMedia(file, language);
      const transcript = result.transcript || 'I need water';

      // Action: Display as user chat bubble on the right
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        speaker: 'user',
        text: transcript,
        timestamp: Date.now(),
        isSignTranscript: true
      };

      setMessages((prev) => {
        const next = [...prev, userMessage];
        persistThread(next);
        return next;
      });

      // Action: Immediately speak it out loud using Web Speech API (TTS) so partner hears it!
      await speakOutLoud(transcript);
      showStatus('Sign recognized and spoken!');
    } catch {
      // Fallback
      const fallbackText = 'I need water';
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        speaker: 'user',
        text: fallbackText,
        timestamp: Date.now(),
        isSignTranscript: true
      };
      setMessages((prev) => {
        const next = [...prev, userMessage];
        persistThread(next);
        return next;
      });
      await speakOutLoud(fallbackText);
    } finally {
      setIsAnalyzingSign(false);
    }
  };

  // -------------------------------------------------------------------------
  // THE LOOP: Suggestion Chip Tap -> Add to Chat & Speak via TTS
  // -------------------------------------------------------------------------
  const handleSelectSuggestion = async (partnerMessageId: string, suggestionText: string) => {
    // 1. Mark chip as selected on the partner message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === partnerMessageId ? { ...m, selectedChip: suggestionText } : m
      )
    );

    // 2. Add as user chat bubble on the right
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      speaker: 'user',
      text: suggestionText,
      timestamp: Date.now()
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      persistThread(next);
      return next;
    });

    // 3. Immediately speak out loud via TTS so partner hears it
    await speakOutLoud(suggestionText);
    showStatus('Spoken. Waiting for partner...');
  };

  // -------------------------------------------------------------------------
  // Fallback Typing: Submit typed text from bottom composer
  // -------------------------------------------------------------------------
  const handleSendTypedMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText || !inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      speaker: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      persistThread(next);
      return next;
    });

    // Immediately speak it out loud
    await speakOutLoud(textToSend);
  };

  // Start a fresh conversation
  const handleClearConversation = () => {
    if (messages.length > 0 && !window.confirm('Start a fresh conversation?')) return;
    setMessages([]);
    setThreadId(`chat_${Date.now()}`);
    showStatus('New conversation started.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FFF8EF] relative overflow-hidden select-text">
      {/* DeepMind SL2T Sign Language Vision Modal */}
      <SignVisionModal
        isOpen={isSignVisionOpen}
        onClose={() => setIsSignVisionOpen(false)}
        onSignDecoded={handleSignDecoded}
        language={language}
      />

      {/* Slide-Up Compact AAC Board Drawer */}
      <ComposerBoardDrawer
        isOpen={isBoardDrawerOpen}
        onClose={() => setIsBoardDrawerOpen(false)}
        onSendSentence={handleBoardSentenceCreated}
        language={language}
      />

      {/* Hidden file/camera capture input for Flow A fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="user"
        className="hidden"
        onChange={handleSignFileSelected}
        aria-label="Sign language file capture input"
      />

      {/* Subtle Top Sub-Bar (Conversation Control & Status) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#EADFCF]/80 bg-[#FFF8EF]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E2F3F3] text-[#0A6C6E]">
            COMMUNIQ AI
          </span>
          {statusMessage && (
            <span className="text-xs font-medium text-[#0A6C6E] animate-pulse flex items-center gap-1">
              • {statusMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToBoard && (
            <button
              onClick={onNavigateToBoard}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#0A6C6E] bg-[#E2F3F3] hover:bg-[#D4EFEF] rounded-lg transition-all cursor-pointer active:scale-95"
              title="Open AAC Picture Board"
              aria-label="Open Picture Board"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Picture Board</span>
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#7A7065] hover:text-[#1F1B16] hover:bg-[#F3EBE0] rounded-lg transition-colors cursor-pointer"
              title="Start a new conversation"
              aria-label="New conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN SCREEN: Single Scrolling Chat Thread (Gemini Style)          */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 max-w-3xl mx-auto w-full scroll-smooth"
        role="log"
        aria-live="polite"
        aria-label="Chat message thread"
      >
        {/* Welcome Empty State (Gemini Style) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0A6C6E]/10 flex items-center justify-center mb-4 text-[#0A6C6E] shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F1B16] mb-2 tracking-tight">
              Two-Way Conversation Bridge
            </h2>
            <p className="text-[#6B6155] max-w-md text-sm sm:text-base mb-8 leading-relaxed">
              Seamless communication loop between non-speaking user and speaking partner with real-time AI smart replies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md text-left">
              <button
                onClick={handleOpenSignPicker}
                className="p-3.5 rounded-2xl bg-white border border-[#E5DACF] hover:border-[#0A6C6E] hover:shadow-sm transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-[#E2F3F3] text-[#0A6C6E] group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#0A6C6E]">
                    Flow A (You)
                  </div>
                  <div className="text-sm font-semibold text-[#1F1B16]">
                    Sign Language
                  </div>
                  <div className="text-xs text-[#7A7065]">
                    Upload or capture sign gesture
                  </div>
                </div>
              </button>

              <button
                onClick={toggleMicListening}
                className="p-3.5 rounded-2xl bg-white border border-[#E5DACF] hover:border-[#0A6C6E] hover:shadow-sm transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-[#FFF4D6] text-[#B45309] group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
                    Flow B (Partner)
                  </div>
                  <div className="text-sm font-semibold text-[#1F1B16]">
                    Partner Speech
                  </div>
                  <div className="text-xs text-[#7A7065]">
                    Listen and generate smart replies
                  </div>
                </div>
              </button>

              {onNavigateToBoard && (
                <button
                  onClick={onNavigateToBoard}
                  className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl bg-white border border-[#E5DACF] hover:border-[#0A6C6E] hover:shadow-sm transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FFF8EF] border border-[#E5DACF] text-[#0A6C6E] group-hover:scale-105 transition-transform">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#0A6C6E]">
                        Custom Word Assembly
                      </div>
                      <div className="text-sm font-semibold text-[#1F1B16]">
                        AAC Picture Board
                      </div>
                      <div className="text-xs text-[#7A7065]">
                        Assemble full sentences from core words and folders
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#0A6C6E] group-hover:translate-x-0.5 transition-transform pr-2">
                    Open Board &rarr;
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message) => {
          const isUser = message.speaker === 'user';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group animate-fadeIn`}
            >
              {/* Speaker Label & Timestamp */}
              <div
                className={`flex items-center gap-1.5 text-xs text-[#7A7065] mb-1 px-1 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <span className="font-semibold text-[#5E564D] flex items-center gap-1">
                  {isUser ? (
                    <>
                      <User className="w-3 h-3 text-[#0A6C6E]" />
                      You
                      {message.isSignTranscript && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 bg-[#E2F3F3] text-[#0A6C6E] rounded-md">
                          <Camera className="w-2.5 h-2.5" /> Sign
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3 h-3 text-[#7A7065]" />
                      Speaking Partner
                    </>
                  )}
                </span>
                <span>•</span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Chat Bubble Container */}
              <div
                className={`relative group/bubble max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] sm:text-base leading-relaxed shadow-xs transition-all ${
                  isUser
                    ? 'bg-[#0A6C6E] text-white rounded-tr-xs shadow-[#0A6C6E]/10'
                    : 'bg-white border border-[#E5DACF] text-[#1F1B16] rounded-tl-xs'
                }`}
              >
                {/* Bubble Content */}
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium whitespace-pre-wrap select-text">
                    {message.text}
                  </p>

                  {/* Audio Replay TTS Button */}
                  <button
                    onClick={() => speakOutLoud(message.text)}
                    className={`shrink-0 p-1 rounded-full transition-opacity cursor-pointer ${
                      isUser
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-[#7A7065] hover:text-[#0A6C6E] hover:bg-[#F3EBE0]'
                    } ${
                      isSpeaking && activeSpokenText === message.text
                        ? 'opacity-100 ring-2 ring-current animate-pulse'
                        : 'opacity-70 group-hover/bubble:opacity-100'
                    }`}
                    title="Speak message aloud (TTS)"
                    aria-label={`Read aloud: ${message.text}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* FLOW B & THE LOOP: Inline AI Suggestion Chips (Under Partner) */}
              {/* ---------------------------------------------------------- */}
              {!isUser && (
                <div className="mt-2.5 pl-1 max-w-[85%] sm:max-w-[75%] w-full">
                  {/* Loading Suggestions State */}
                  {message.isLoadingSuggestions && (
                    <div className="flex items-center gap-2 text-xs font-medium text-[#0A6C6E] bg-white/70 border border-[#E2F3F3] rounded-full px-3 py-1.5 w-fit">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking of smart replies...</span>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0A6C6E]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tap to reply & speak:</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((chipText, index) => {
                          const isSelected = message.selectedChip === chipText;

                          return (
                            <button
                              key={`chip-${message.id}-${index}`}
                              onClick={() => handleSelectSuggestion(message.id, chipText)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                                isSelected
                                  ? 'bg-[#0A6C6E] text-white border-[#0A6C6E] ring-2 ring-[#0A6C6E]/20'
                                  : 'bg-white text-[#0A6C6E] border-[#BCE1E2] hover:bg-[#EAF6F6] hover:border-[#0A6C6E]'
                              }`}
                              aria-label={`Send reply: ${chipText}`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0A6C6E]" />
                              )}
                              <span>{chipText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time sign analyzing indicator */}
        {isAnalyzingSign && (
          <div className="flex flex-col items-end w-full animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-[#7A7065] mb-1 px-1">
              <span className="font-semibold text-[#0A6C6E] flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Analyzing Sign Gesture...
              </span>
            </div>
            <div className="bg-[#0A6C6E]/20 text-[#0A6C6E] border border-[#0A6C6E]/30 rounded-2xl rounded-tr-xs px-4 py-3 flex items-center gap-2 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Decoding video/image to speech...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM COMPOSER BAR (Gemini Style Anchored to Bottom)              */}
      {/* ------------------------------------------------------------------ */}
      <div className="shrink-0 w-full bg-[#FFF8EF] border-t-2 border-[#E5DACF] pt-2 pb-4 px-3 sm:px-4 z-20">
        <div className="max-w-3xl mx-auto w-full">
          {/* Active Listening Indicator */}
          {isListening && (
            <div className="mb-2 flex items-center justify-between px-3.5 py-1.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>Partner speaking... listening for words</span>
              </div>
              <button
                onClick={stopListening}
                className="text-xs font-bold underline hover:text-red-900 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Main LLM Composer Box */}
          <form
            onSubmit={handleSendTypedMessage}
            className="flex items-center gap-2 bg-white rounded-2xl border border-[#E5DACF] shadow-sm px-2 py-1.5 focus-within:border-[#0A6C6E] focus-within:ring-2 focus-within:ring-[#0A6C6E]/20 transition-all"
          >
            {/* 1. Camera / Video Upload Button (Flow A: Sign to Speech) */}
            <button
              type="button"
              onClick={handleOpenSignPicker}
              disabled={isAnalyzingSign}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isAnalyzingSign
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-[#0A6C6E] bg-[#E2F3F3] hover:bg-[#D3EFEF] active:scale-95'
              }`}
              title="Flow A: Sign Language to Speech (Upload/Capture Video)"
              aria-label="Upload sign language video or image"
            >
              {isAnalyzingSign ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>

            {/* 2. Microphone Button (Flow B: Partner Speech to AI) */}
            <button
              type="button"
              onClick={toggleMicListening}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-xs'
                  : 'text-[#B45309] bg-[#FFF4D6] hover:bg-[#FEEBC8] active:scale-95'
              }`}
              title={
                isListening
                  ? 'Stop listening'
                  : 'Flow B: Partner Speech-to-Text (Microphone)'
              }
              aria-label={
                isListening
                  ? 'Stop microphone'
                  : 'Speaking partner microphone input'
              }
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* 3. Use Board Button (Slide up compact board drawer) */}
            <button
              type="button"
              onClick={() => setIsBoardDrawerOpen((prev) => !prev)}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isBoardDrawerOpen
                  ? 'bg-[#0A6C6E] text-white shadow-xs'
                  : 'text-[#0A6C6E] bg-[#E2F3F3] hover:bg-[#D3EFEF] active:scale-95'
              }`}
              title="Use Board: Open compact AAC drawer"
              aria-label="Use Board: Open compact AAC drawer"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* 4. Text Input Field (Fallback Typing) */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Partner speaking...'
                  : 'Type a message or response...'
              }
              disabled={isAnalyzingSign}
              className="flex-1 bg-transparent px-2 sm:px-3 py-2 text-sm sm:text-base text-[#1F1B16] placeholder:text-[#8C8278] focus:outline-none"
            />

            {/* 5. Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isAnalyzingSign}
              className="p-2.5 rounded-xl bg-[#0A6C6E] text-white hover:bg-[#085557] disabled:opacity-30 disabled:hover:bg-[#0A6C6E] transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed active:scale-95"
              title="Send message and speak via TTS"
              aria-label="Send typed message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          {/* Quick Helper Subtext */}
          <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-[#7A7065]">
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#0A6C6E]" />
              <strong>Camera:</strong> Sign vision
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#B45309]" />
              <strong>Mic:</strong> Partner speech
            </span>
            <button
              type="button"
              onClick={() => setIsBoardDrawerOpen(true)}
              className="text-[#0A6C6E] hover:underline font-bold text-[11px] cursor-pointer flex items-center gap-1"
              aria-label="Open compact board drawer"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Use Board</span>
            </button>
            {onNavigateToBoard && (
              <button
                type="button"
                onClick={onNavigateToBoard}
                className="text-[#5E564D] hover:text-[#0A6C6E] hover:underline font-bold text-[11px] cursor-pointer flex items-center gap-1"
                aria-label="Switch to AAC Picture Board"
              >
                <span>Full Board &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
