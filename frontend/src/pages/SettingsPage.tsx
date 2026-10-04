import React, { useState, useEffect, useCallback } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { speechService } from '../services/speech';
import { fetchServiceStatus, ServiceStatus } from '../services/ai';
import { LanguageCode, UserMode } from '../translations';
import { Button } from '../components/Button';
import {
  Globe,
  Users,
  Volume2,
  SunMoon,
  Contrast,
  Sliders,
  Bell,
  Sparkles,
  Shield,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    userMode,
    setUserMode,
    preferences,
    updatePreferences,
    speak,
    t
  } = useCommuniq();

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  const availableVoices = speechService.getVoices();

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const status = await fetchServiceStatus();
      setServiceStatus(status);
    } catch {
      // Ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchServiceStatus().then((status) => {
      if (mounted) {
        setServiceStatus(status);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleAI = (checked: boolean) => {
    if (checked) {
      // Show explicit plain consent modal before turning on
      setShowConsentModal(true);
    } else {
      updatePreferences({ enableAI: false });
    }
  };

  const handleConfirmAIConsent = async () => {
    await updatePreferences({ enableAI: true });
    setShowConsentModal(false);
  };

  const renderStatusBadge = (status: 'working' | 'not_configured' | 'rate_limited') => {
    switch (status) {
      case 'working':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-black bg-[#EBF7EF] border border-[#1B7A42] text-[#1E4620]">
            <CheckCircle className="w-3.5 h-3.5 text-[#1B7A42]" />
            Working
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-black bg-[#FFF4D6] border border-[#FFB703] text-[#7A5400]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FFB703]" />
            Rate Limited
          </span>
        );
      case 'not_configured':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-black bg-[#FFF8EF] border border-[#E5DACF] text-[#5E564D]">
            <XCircle className="w-3.5 h-3.5 text-[#5E564D]" />
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 shadow-sm">
        <h2 className="text-3xl font-black text-[#1F1B16]">{t.settingsTitle}</h2>
        <p className="text-base font-semibold text-[#085557] mt-1">
          {t.settingsDesc}
        </p>
      </div>

      {/* 1. Language Selection */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-[#0A6C6E]" />
          <h3 className="text-xl font-black text-[#1F1B16]">{t.languageSection}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { code: 'en' as LanguageCode, label: 'English', native: 'English' },
            { code: 'kn' as LanguageCode, label: 'Kannada', native: 'ಕನ್ನಡ' },
            { code: 'hi' as LanguageCode, label: 'Hindi', native: 'हिन्दी' },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              aria-pressed={language === lang.code}
              className={`min-h-[70px] rounded-[12px] border-2 p-3 text-center flex flex-col items-center justify-center font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer ${
                language === lang.code
                  ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#085557] ring-2 ring-[#0A6C6E]'
                  : 'bg-white border-[#E5DACF] text-[#1F1B16] hover:bg-[#FFF8EF]'
              }`}
            >
              <span className="text-2xl font-black">{lang.native}</span>
              <span className="text-xs text-[#5E564D]">{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Interface Mode */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#0A6C6E]" />
          <h3 className="text-xl font-black text-[#1F1B16]">{t.userModeSection}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { mode: 'child' as UserMode, title: t.childTitle, desc: 'Class 1-7 game feel' },
            { mode: 'student' as UserMode, title: t.studentTitle, desc: 'Class 8-12 clean grid' },
            { mode: 'adult' as UserMode, title: t.adultTitle, desc: '18+ direct space' },
          ].map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setUserMode(m.mode)}
              aria-pressed={userMode === m.mode}
              className={`min-h-[80px] rounded-[12px] border-2 p-4 text-left font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer ${
                userMode === m.mode
                  ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#085557] ring-2 ring-[#0A6C6E]'
                  : 'bg-white border-[#E5DACF] text-[#1F1B16] hover:bg-[#FFF8EF]'
              }`}
            >
              <span className="block text-xl font-black">{m.title}</span>
              <span className="block text-xs text-[#5E564D] mt-0.5">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Large and Simple Preset for Adult Mode */}
        {userMode === 'adult' && (
          <div className="pt-4 border-t border-[#E5DACF]">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="block text-base font-black text-[#1F1B16]">{t.largeAndSimple}</span>
                <span className="block text-xs font-semibold text-[#5E564D]">
                  Increases card text size to 28px and keeps 1 to 2 options per row.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.largeAndSimple}
                onChange={(e) => updatePreferences({ largeAndSimple: e.target.checked })}
                className="w-6 h-6 rounded-[6px] accent-[#0A6C6E]"
              />
            </label>
          </div>
        )}
      </section>

      {/* 3. AI Suggestions and Privacy Controls */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#0A6C6E]" />
          <div>
            <h3 className="text-xl font-black text-[#1F1B16]">AI Suggestions and Privacy</h3>
            <p className="text-xs font-semibold text-[#5E564D]">
              Assistance is optional. Communication never requires internet or AI.
            </p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-[#E5DACF]">
          {/* AI Suggestions Master Switch */}
          <div className="pt-3 first:pt-0 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="block text-base font-bold text-[#1F1B16]">
                Enable AI Suggestions (You could say)
              </span>
              <p className="text-xs font-semibold text-[#5E564D] max-w-xl leading-relaxed">
                When enabled, recent conversation text is sent to Groq or Google Gemini to predict next responses.
                When disabled, Communiq operates 100% offline with zero external network calls.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.enableAI}
              onChange={(e) => handleToggleAI(e.target.checked)}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E] shrink-0 mt-1 cursor-pointer"
              aria-label="Enable AI Suggestions"
            />
          </div>

          {/* Google Gemini Secondary Provider Toggle */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="block text-base font-bold text-[#1F1B16]">
                Allow Google Gemini Fallback (Free Tier)
              </span>
              <p className="text-xs font-semibold text-[#5E564D] max-w-xl leading-relaxed">
                Groq is primary and does not train on API requests. If Groq is unavailable, Google Gemini Flash is used.
                Under Google free-tier terms, Google may review inputs to train models. Turn this off to stay with Groq and local offline fallback only.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.enableGemini}
              disabled={!preferences.enableAI}
              onChange={(e) => updatePreferences({ enableGemini: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E] shrink-0 mt-1 cursor-pointer disabled:opacity-40"
              aria-label="Allow Google Gemini Fallback"
            />
          </div>

          {/* Scripted Demo Mode Toggle */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="block text-base font-bold text-[#1F1B16]">
                Scripted Demo Mode
              </span>
              <p className="text-xs font-semibold text-[#5E564D] max-w-xl leading-relaxed">
                Enables pre-scripted scenarios (Hungry, Homework) in the Talk screen so anyone can test the full two-way conversation loop without typing or microphone.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.demoMode}
              onChange={(e) => updatePreferences({ demoMode: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E] shrink-0 mt-1 cursor-pointer"
              aria-label="Scripted Demo Mode"
            />
          </div>
        </div>
      </section>

      {/* 4. Real-Time Service Status Screen */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5DACF] pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-6 h-6 text-[#0A6C6E]" />
            <div>
              <h3 className="text-xl font-black text-[#1F1B16]">Service Status Screen</h3>
              <p className="text-xs font-semibold text-[#5E564D]">
                Live availability of free-tier AI and speech infrastructure.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="normal"
            onClick={loadStatus}
            disabled={loadingStatus}
            icon={<RefreshCw className={`w-3.5 h-3.5 text-[#0A6C6E] ${loadingStatus ? 'animate-spin' : ''}`} />}
          >
            {loadingStatus ? 'Checking...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Groq Cloud */}
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm font-black text-[#1F1B16]">Groq Cloud AI (Primary)</span>
              <span className="block text-xs text-[#5E564D]">Llama-3.3-70B versatile free tier</span>
            </div>
            {renderStatusBadge(serviceStatus?.groq || 'not_configured')}
          </div>

          {/* Google Gemini */}
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm font-black text-[#1F1B16]">Google Gemini (Secondary)</span>
              <span className="block text-xs text-[#5E564D]">Gemini-1.5-Flash free tier</span>
            </div>
            {renderStatusBadge(serviceStatus?.gemini || 'not_configured')}
          </div>

          {/* Local Fallback Engine */}
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm font-black text-[#1F1B16]">Local Offline Engine</span>
              <span className="block text-xs text-[#5E564D]">Deterministic rule-based catalog</span>
            </div>
            {renderStatusBadge('working')}
          </div>

          {/* Browser Speech Recognition */}
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm font-black text-[#1F1B16]">Web Speech Recognition</span>
              <span className="block text-xs text-[#5E564D]">On-device partner listening API</span>
            </div>
            {renderStatusBadge(serviceStatus?.speechRecognition || 'working')}
          </div>

          {/* Server Whisper */}
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-4 flex items-center justify-between sm:col-span-2">
            <div className="space-y-0.5">
              <span className="block text-sm font-black text-[#1F1B16]">Server Whisper Speech Fallback</span>
              <span className="block text-xs text-[#5E564D]">Optional server-side audio transcription</span>
            </div>
            {renderStatusBadge(serviceStatus?.whisper || 'not_configured')}
          </div>
        </div>

        {/* Active Provider Footer Notice */}
        <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#5E564D]">
          <Cpu className="w-4 h-4 text-[#0A6C6E]" />
          <span>Active Provider: </span>
          <span className="text-[#085557] font-black uppercase">
            {preferences.demoMode
              ? 'Demo Mode'
              : !preferences.enableAI
              ? 'Local Fallback (AI Disabled)'
              : serviceStatus?.activeProvider || 'Local Fallback'}
          </span>
        </div>
      </section>

      {/* 5. Speech and Voice Settings */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-6 h-6 text-[#0A6C6E]" />
          <h3 className="text-xl font-black text-[#1F1B16]">{t.speechVoice}</h3>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="speech-rate-slider" className="text-sm font-bold text-[#1F1B16]">
              {t.speechSpeed}: {preferences.speechRate.toFixed(2)}x
            </label>
            <span className="text-xs text-[#5E564D] font-semibold">0.5x to 1.5x</span>
          </div>
          <input
            id="speech-rate-slider"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={preferences.speechRate}
            onChange={(e) => updatePreferences({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-[#0A6C6E]"
          />
        </div>

        {/* Voice Selection */}
        {availableVoices.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="voice-select" className="text-sm font-bold text-[#1F1B16] block">
              Device Voice Engine
            </label>
            <select
              id="voice-select"
              value={preferences.voiceURI}
              onChange={(e) => updatePreferences({ voiceURI: e.target.value })}
              className="w-full min-h-[50px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] bg-white font-bold text-sm focus:border-[#0A6C6E]"
            >
              <option value="">Default voice for language</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multilingual Voice Test Buttons */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-bold text-[#1F1B16] block">
            Test Speech in Supported Languages
          </label>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="normal"
              onClick={() => speak("Hello! This is COMMUNIQ speaking clearly.", { category: 'greetings' })}
              icon={<Volume2 className="w-4 h-4 text-[#0A6C6E]" />}
            >
              Test English
            </Button>
            <Button
              variant="secondary"
              size="normal"
              onClick={() => speak("ನಮಸ್ಕಾರ! ಇದು ಕಮ್ಯೂನಿಕ್ ಧ್ವನಿ.", { category: 'greetings' })}
              icon={<Volume2 className="w-4 h-4 text-[#0A6C6E]" />}
            >
              ಕನ್ನಡ ಪರೀಕ್ಷಿಸಿ (Test Kannada)
            </Button>
            <Button
              variant="secondary"
              size="normal"
              onClick={() => speak("नमस्ते! यह कम्यूनिक की आवाज़ है।", { category: 'greetings' })}
              icon={<Volume2 className="w-4 h-4 text-[#0A6C6E]" />}
            >
              हिन्दी परीक्षण (Test Hindi)
            </Button>
          </div>
        </div>

        {/* Platform Guides for Installing Offline Natural Voices */}
        <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-4 space-y-3 mt-4">
          <h4 className="font-extrabold text-sm text-[#1F1B16]">
            How to Install Natural Offline Voices on Your Device
          </h4>
          <p className="text-xs text-[#5E564D] leading-relaxed">
            COMMUNIQ runs 100% on your device and does not require internet for speech. If Kannada or Hindi voices sound mechanical or are missing, install free natural offline voice packs from your system settings:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3 space-y-1">
              <strong className="text-[#085557] block font-bold">Android</strong>
              <p className="text-[#5E564D]">
                Open <em>Settings &gt; Accessibility &gt; Text-to-speech output &gt; Google Speech Services gear &gt; Install voice data</em>. Download Kannada and Hindi.
              </p>
            </div>
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3 space-y-1">
              <strong className="text-[#085557] block font-bold">iOS and iPadOS</strong>
              <p className="text-[#5E564D]">
                Open <em>Settings &gt; Accessibility &gt; Spoken Content &gt; Voices</em>. Tap Hindi or Kannada and choose enhanced or premium voice.
              </p>
            </div>
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3 space-y-1">
              <strong className="text-[#085557] block font-bold">Windows</strong>
              <p className="text-[#5E564D]">
                Open <em>Settings &gt; Time &amp; Language &gt; Speech &gt; Manage Voices &gt; Add voices</em>. Select English (India), Hindi, or Kannada.
              </p>
            </div>
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3 space-y-1">
              <strong className="text-[#085557] block font-bold">macOS</strong>
              <p className="text-[#5E564D]">
                Open <em>System Settings &gt; Accessibility &gt; Spoken Content &gt; System Voice &gt; Manage Voices</em>. Search and download Indian voices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Accessibility and Display Preferences */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-[#0A6C6E]" />
          <h3 className="text-xl font-black text-[#1F1B16]">Display and Accessibility</h3>
        </div>

        <div className="space-y-4 divide-y divide-[#E5DACF]">
          {/* High Contrast */}
          <div className="pt-3 first:pt-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-[#5E564D]" />
              <div>
                <span className="block text-base font-bold text-[#1F1B16]">{t.highContrast}</span>
                <span className="block text-xs text-[#5E564D]">Maximum contrast black background with vivid outlines</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E]"
              aria-label={t.highContrast}
            />
          </div>

          {/* Dark Mode */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SunMoon className="w-5 h-5 text-[#5E564D]" />
              <div>
                <span className="block text-base font-bold text-[#1F1B16]">{t.darkMode}</span>
                <span className="block text-xs text-[#5E564D]">Warm charcoal palette for low light</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E]"
              aria-label={t.darkMode}
            />
          </div>

          {/* Reduced Motion */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#5E564D]" />
              <div>
                <span className="block text-base font-bold text-[#1F1B16]">{t.reducedMotion}</span>
                <span className="block text-xs text-[#5E564D]">Disables celebration bursts and animations</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E]"
              aria-label={t.reducedMotion}
            />
          </div>

          {/* Sound Feedback */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#5E564D]" />
              <div>
                <span className="block text-base font-bold text-[#1F1B16]">{t.soundEffects}</span>
                <span className="block text-xs text-[#5E564D]">Gentle acoustic pop on card taps</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.soundEffects}
              onChange={(e) => updatePreferences({ soundEffects: e.target.checked })}
              className="w-6 h-6 rounded-[6px] accent-[#0A6C6E]"
              aria-label={t.soundEffects}
            />
          </div>
        </div>
      </section>

      {/* 7. AI Plain Consent Modal */}
      {showConsentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-consent-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-lg bg-white border-2 border-[#0A6C6E] rounded-[16px] p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#0A6C6E]">
              <Shield className="w-8 h-8 shrink-0" />
              <h3 id="ai-consent-title" className="text-xl font-black text-[#1F1B16]">
                Plain AI Consent
              </h3>
            </div>

            <div className="space-y-3 text-sm text-[#1F1B16] font-medium leading-relaxed">
              <p>
                Before turning on AI suggestions, here is exactly what leaves your device:
              </p>

              <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-3.5 space-y-2 text-xs">
                <p>
                  <strong className="text-[#085557]">What is sent:</strong> Recent conversation text only (the last few turns) to predict helpful options under "You could say".
                </p>
                <p>
                  <strong className="text-[#085557]">What is NEVER sent:</strong> No names, no locations, no audio recordings, no camera images, and no account details.
                </p>
                <p>
                  <strong className="text-[#085557]">Where it goes:</strong> Requests are sent directly to Groq (which does not retain or train on requests). If Groq is unavailable and Gemini is allowed, requests are sent to Google Gemini Flash.
                </p>
                <p className="bg-[#FFF4D6] p-2 rounded-[6px] text-[#7A5400] font-bold">
                  Notice regarding Google Gemini free tier: Google terms state that free-tier queries may be used to improve Google products and may be read by human reviewers. You can disable Gemini in Settings anytime to use Groq exclusively.
                </p>
              </div>

              <p className="text-xs text-[#5E564D]">
                You can turn AI off at any time. When off, Communiq continues working 100% offline using its built-in rule catalog.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setShowConsentModal(false)}
              >
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                size="normal"
                onClick={handleConfirmAIConsent}
              >
                I Understand and Enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
