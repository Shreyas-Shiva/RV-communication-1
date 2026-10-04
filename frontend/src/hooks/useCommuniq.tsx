/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { LanguageCode, UserMode, Translations, getTranslations } from '../translations';
import { UserPreferences, DEFAULT_PREFERENCES, getPreferences, savePreferences, logActivity } from '../services/db';
import { speechService } from '../services/speech';
import { soundService } from '../services/sound';
import confetti from 'canvas-confetti';

interface CommuniqContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => Promise<void>;
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>;
  t: Translations;
  isSpeaking: boolean;
  activeSpokenText: string;
  speak: (text: string, meta?: { category?: string; assetId?: string; intentId?: string; speaker?: 'user' | 'partner' }) => Promise<boolean>;
  stopSpeaking: () => void;
  replaySpokenText: () => void;
  celebrate: () => void;
  stars: number;
  streak: number;
  showMissingVoiceWarning: boolean;
  dismissMissingVoiceWarning: () => void;
  emergencyConfirmTarget: { phrase: string; onConfirm: () => void } | null;
  requestEmergencyConfirm: (phrase: string, onConfirm: () => void) => void;
  cancelEmergencyConfirm: () => void;
  executeEmergencyConfirm: () => void;
}

const CommuniqContext = createContext<CommuniqContextType | null>(null);

export const CommuniqProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpokenText, setActiveSpokenText] = useState<string>('');
  const [showMissingVoiceWarning, setShowMissingVoiceWarning] = useState<boolean>(false);
  const [emergencyConfirmTarget, setEmergencyConfirmTarget] = useState<{ phrase: string; onConfirm: () => void } | null>(null);

  // Initialize from Dexie DB
  useEffect(() => {
    let mounted = true;
    getPreferences().then(prefs => {
      if (mounted) {
        setPreferences(prefs);
        soundService.enabled = prefs.soundEffects;

        // Apply dark mode or high contrast classes to body
        if (prefs.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }

        if (prefs.highContrast) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }
      }
    });

    const unsubscribe = speechService.subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const language = preferences.language;
  const userMode = preferences.userMode;
  const t = useMemo(() => getTranslations(language), [language]);

  const setLanguage = useCallback(async (newLang: LanguageCode) => {
    const updated = await savePreferences({ language: newLang });
    setPreferences(updated);

    // Verify voice availability for the selected language
    const voiceAvailable = speechService.isVoiceAvailable(newLang);
    if (!voiceAvailable) {
      setShowMissingVoiceWarning(true);
    } else {
      setShowMissingVoiceWarning(false);
    }
  }, []);

  const setUserMode = useCallback(async (newMode: UserMode) => {
    const updated = await savePreferences({ userMode: newMode });
    setPreferences(updated);
  }, []);

  const updatePreferences = useCallback(async (partial: Partial<UserPreferences>) => {
    const updated = await savePreferences(partial);
    setPreferences(updated);

    if (partial.soundEffects !== undefined) {
      soundService.enabled = partial.soundEffects;
    }

    if (partial.darkMode !== undefined) {
      if (partial.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }

    if (partial.highContrast !== undefined) {
      if (partial.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }
  }, []);

  const celebrate = useCallback(() => {
    soundService.playCelebration();
    // Confetti celebration for child mode without heavy motion
    if (!preferences.reducedMotion && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#0F8B8D', '#FFB703', '#2E9E5B']
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [preferences.reducedMotion]);

  const speak = useCallback(async (
    text: string,
    meta?: { category?: string; assetId?: string; intentId?: string; speaker?: 'user' | 'partner' }
  ): Promise<boolean> => {
    const cleanText = text.trim();
    if (!cleanText) return false;

    setActiveSpokenText(cleanText);

    // Trigger tap audio feedback
    soundService.playTap();

    // Check if voice is available
    const voiceAvailable = speechService.isVoiceAvailable(language);
    if (!voiceAvailable && (language === 'kn' || language === 'hi')) {
      setShowMissingVoiceWarning(true);
    }

    // Always attempt Web Speech API synthesis
    speechService.speak(cleanText, language, {
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      voiceURI: preferences.voiceURI,
      onError: () => {
        // Continue showing visual text even if speech failed
      }
    });

    // Save turn to My Day activity log in Dexie
    await logActivity({
      phrase: cleanText,
      language,
      category: meta?.category || 'general',
      assetId: meta?.assetId,
      intentId: meta?.intentId,
      speaker: meta?.speaker || 'user',
      userMode,
      isFavorite: false
    });

    // Child mode star celebration on complete sentences
    if (userMode === 'child' && (meta?.intentId || cleanText.includes('.'))) {
      celebrate();
    }

    return true;
  }, [language, preferences.speechRate, preferences.speechPitch, preferences.voiceURI, userMode, celebrate]);

  const stopSpeaking = useCallback(() => {
    speechService.cancel();
  }, []);

  const replaySpokenText = useCallback(() => {
    if (activeSpokenText) {
      speak(activeSpokenText);
    }
  }, [activeSpokenText, speak]);

  const dismissMissingVoiceWarning = useCallback(() => {
    setShowMissingVoiceWarning(false);
  }, []);

  const requestEmergencyConfirm = useCallback((phrase: string, onConfirm: () => void) => {
    setEmergencyConfirmTarget({ phrase, onConfirm });
  }, []);

  const cancelEmergencyConfirm = useCallback(() => {
    setEmergencyConfirmTarget(null);
  }, []);

  const executeEmergencyConfirm = useCallback(() => {
    if (emergencyConfirmTarget) {
      const { onConfirm } = emergencyConfirmTarget;
      setEmergencyConfirmTarget(null);
      onConfirm();
    }
  }, [emergencyConfirmTarget]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    userMode,
    setUserMode,
    preferences,
    updatePreferences,
    t,
    isSpeaking,
    activeSpokenText,
    speak,
    stopSpeaking,
    replaySpokenText,
    celebrate,
    stars: preferences.starsCount,
    streak: preferences.dailyStreak,
    showMissingVoiceWarning,
    dismissMissingVoiceWarning,
    emergencyConfirmTarget,
    requestEmergencyConfirm,
    cancelEmergencyConfirm,
    executeEmergencyConfirm
  }), [
    language,
    setLanguage,
    userMode,
    setUserMode,
    preferences,
    updatePreferences,
    t,
    isSpeaking,
    activeSpokenText,
    speak,
    stopSpeaking,
    replaySpokenText,
    celebrate,
    showMissingVoiceWarning,
    dismissMissingVoiceWarning,
    emergencyConfirmTarget,
    requestEmergencyConfirm,
    cancelEmergencyConfirm,
    executeEmergencyConfirm
  ]);

  return (
    <CommuniqContext.Provider value={value}>
      {children}
    </CommuniqContext.Provider>
  );
};

export function useCommuniq(): CommuniqContextType {
  const context = useContext(CommuniqContext);
  if (!context) {
    throw new Error('useCommuniq must be used within a CommuniqProvider');
  }
  return context;
}
