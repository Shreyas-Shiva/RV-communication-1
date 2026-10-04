import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { AlertTriangle, Settings as SettingsIcon, Globe, Star, Flame, Sparkles } from 'lucide-react';
import { LanguageCode, UserMode } from '../translations';

interface HeaderProps {
  currentScreenName: string;
  helperLine?: string;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreenName,
  helperLine,
  onOpenSettings,
  onOpenEmergency,
  onNavigateHome
}) => {
  const { language, setLanguage, userMode, setUserMode, stars, streak, t } = useCommuniq();

  const handleNextLanguage = () => {
    const cycle: LanguageCode[] = ['en', 'kn', 'hi'];
    const nextIdx = (cycle.indexOf(language) + 1) % cycle.length;
    setLanguage(cycle[nextIdx]);
  };

  const handleNextMode = () => {
    const modes: UserMode[] = ['child', 'student', 'adult'];
    const nextIdx = (modes.indexOf(userMode) + 1) % modes.length;
    setUserMode(modes[nextIdx]);
  };

  const languageLabels: Record<LanguageCode, string> = {
    en: 'English',
    kn: 'ಕನ್ನಡ',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    ml: 'മലയാളം'
  };

  const modeLabels: Record<UserMode, string> = {
    child: 'Child',
    student: 'Student',
    adult: 'Adult'
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8EF] border-b-2 border-[#E5DACF] px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand and Screen Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onNavigateHome}
            aria-label="Communiq Home"
            className="flex items-center gap-2.5 text-left rounded-[10px] p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#0F8B8D] border-2 border-[#0F8B8D] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true">
                <circle cx="50" cy="50" r="10" fill="#FFB703" />
                <path d="M 28 50 A 22 22 0 0 1 72 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                <path d="M 18 50 A 32 32 0 0 1 82 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="block font-black text-xl tracking-tight text-[#085557] leading-none">
                COMMUNIQ
              </span>
              <span className="block text-[11px] font-semibold text-[#5E564D] mt-0.5">
                {t.tagline}
              </span>
            </div>
          </button>

          <div className="border-l-2 border-[#E5DACF] pl-3 py-0.5">
            <h1 className="text-lg sm:text-xl font-black text-[#1F1B16] leading-tight">
              {currentScreenName}
            </h1>
            {helperLine && (
              <p className="text-xs sm:text-sm font-bold text-[#085557] leading-tight line-clamp-1">
                {helperLine}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Star & Streak badges for child mode */}
          {userMode === 'child' && (
            <div className="hidden md:flex items-center gap-2 bg-white border-2 border-[#FFB703] rounded-[10px] px-3 py-1.5">
              <span className="flex items-center gap-1 font-black text-sm text-[#7A5400]">
                <Star className="w-4 h-4 fill-[#FFB703] text-[#FFB703]" />
                {stars}
              </span>
              <span className="flex items-center gap-1 font-black text-sm text-[#D62828] border-l border-[#E5DACF] pl-2">
                <Flame className="w-4 h-4 text-[#D62828]" />
                {streak}
              </span>
            </div>
          )}

          {/* One-tap Language Quick Switch */}
          <button
            type="button"
            onClick={handleNextLanguage}
            title="Tap to switch language"
            aria-label={`Language: currently ${languageLabels[language]}. Tap to switch.`}
            className="h-11 px-3 rounded-[10px] bg-white border-2 border-[#E5DACF] hover:border-[#0F8B8D] flex items-center gap-1.5 font-bold text-sm text-[#1F1B16] transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
          >
            <Globe className="w-4 h-4 text-[#0F8B8D]" />
            <span className="truncate max-w-[70px] sm:max-w-none">{languageLabels[language]}</span>
          </button>

          {/* One-tap Mode Quick Switch */}
          <button
            type="button"
            onClick={handleNextMode}
            title="Tap to switch mode"
            aria-label={`Mode: currently ${modeLabels[userMode]}. Tap to switch.`}
            className="h-11 px-3 rounded-[10px] bg-white border-2 border-[#E5DACF] hover:border-[#0F8B8D] flex items-center gap-1.5 font-bold text-sm text-[#1F1B16] transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
          >
            <Sparkles className="w-4 h-4 text-[#FFB703]" />
            <span className="hidden sm:inline">{modeLabels[userMode]}</span>
          </button>

          {/* Emergency Button always visible in RED */}
          <button
            type="button"
            onClick={onOpenEmergency}
            title="Emergency help"
            aria-label="Emergency help button"
            className="h-11 px-3.5 rounded-[10px] bg-[#D62828] hover:bg-[#B31D1D] text-white border-2 border-[#D62828] flex items-center gap-1.5 font-black text-sm transition-transform active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-red-600"
          >
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="hidden xs:inline">{t.emergency}</span>
          </button>

          {/* One-tap Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={t.settings}
            aria-label={t.settings}
            className="w-11 h-11 rounded-[10px] bg-white border-2 border-[#E5DACF] hover:border-[#0F8B8D] flex items-center justify-center text-[#1F1B16] transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
