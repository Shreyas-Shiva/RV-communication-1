import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { ScreenId } from './Navigation';
import { LanguageCode } from '../translations';
import { Settings as SettingsIcon, AlertCircle, Smile, GraduationCap, User } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenId;
  currentScreenName?: string;
  helperLine?: string;
  onNavigate: (screen: ScreenId) => void;
  onOpenSettings: () => void;
  onOpenProfileModal: () => void;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  currentScreenName,
  onNavigate,
  onOpenSettings,
  onOpenProfileModal,
  onOpenEmergency
}) => {
  const { language, setLanguage, userMode, t } = useCommuniq();

  const isChatActive = currentScreen === 'talk' || currentScreen === 'home';
  const isBoardActive = currentScreen === 'communicate';

  const languages: { code: LanguageCode; short: string; label: string }[] = [
    { code: 'en', short: 'EN', label: 'English' },
    { code: 'kn', short: 'KN', label: 'ಕನ್ನಡ' },
    { code: 'hi', short: 'HI', label: 'हिन्दी' }
  ];

  const profileLabel =
    userMode === 'child' ? 'Class 1-5' : userMode === 'student' ? 'Class 6-12' : 'Class 18+';

  const ProfileIcon =
    userMode === 'child' ? Smile : userMode === 'student' ? GraduationCap : User;

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8EF] border-b-2 border-[#E5DACF] px-2.5 sm:px-4 h-12 max-h-12 flex items-center shadow-xs">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand Logo & Segmented Switch: [Chat] | [Board] */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('talk')}
            aria-label="Communiq Home"
            className="flex items-center gap-1.5 sm:gap-2 text-left rounded-[8px] p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer shrink-0"
          >
            <div className="w-7 h-7 rounded-[8px] bg-[#0A6C6E] border border-[#0A6C6E] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" width="18" height="18" aria-hidden="true">
                <circle cx="50" cy="50" r="10" fill="#FFB703" />
                <path d="M 28 50 A 22 22 0 0 1 72 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                <path d="M 18 50 A 32 32 0 0 1 82 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="font-black text-sm tracking-tight text-[#085557] leading-none hidden xs:inline">
              <span>COMMUNIQ</span>
              <span className="sr-only"> - {currentScreenName || 'Dual-Mode AAC'}</span>
            </h1>
          </button>

          {/* Segmented Switch: [Chat] | [Board] (36px height, 8px radius, teal indicator) */}
          <div
            role="tablist"
            aria-label="Main spaces"
            className="flex items-center h-8 sm:h-9 p-0.5 bg-[#E5DACF]/60 rounded-[8px] border border-[#E5DACF]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isChatActive}
              onClick={() => onNavigate('talk')}
              className={`h-full px-2.5 sm:px-3.5 rounded-[6px] text-xs font-black transition-all cursor-pointer ${
                isChatActive
                  ? 'bg-[#0A6C6E] text-white shadow-xs'
                  : 'text-[#1F1B16] hover:bg-white/80'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isBoardActive}
              onClick={() => onNavigate('communicate')}
              className={`h-full px-2.5 sm:px-3.5 rounded-[6px] text-xs font-black transition-all cursor-pointer ${
                isBoardActive
                  ? 'bg-[#0A6C6E] text-white shadow-xs'
                  : 'text-[#1F1B16] hover:bg-white/80'
              }`}
            >
              Board
            </button>
          </div>
        </div>

        {/* Right: Language Selector, Profile Selector, Emergency Help, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Selector (EN / KN / HI) */}
          <div
            role="group"
            aria-label="Language selection"
            className="flex items-center h-8 p-0.5 bg-white border border-[#E5DACF] rounded-[8px]"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                title={l.label}
                aria-label={`Switch language to ${l.label}`}
                className={`h-full px-1.5 sm:px-2 rounded-[5px] text-[11px] font-black transition-all cursor-pointer ${
                  language === l.code
                    ? 'bg-[#0A6C6E] text-white shadow-2xs'
                    : 'text-[#5E564D] hover:text-[#1F1B16]'
                }`}
              >
                {l.short}
              </button>
            ))}
          </div>

          {/* Profile Selector (opens age modal) */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            title={`Active profile: ${profileLabel}. Tap to change profile.`}
            aria-label={`Current profile ${profileLabel}. Tap to switch profile`}
            className="h-8 px-2 sm:px-2.5 rounded-[8px] bg-white border border-[#E5DACF] hover:border-[#0A6C6E] flex items-center gap-1 text-[#1F1B16] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <ProfileIcon className="w-3.5 h-3.5 text-[#0A6C6E]" />
            <span className="hidden sm:inline text-xs font-extrabold">{profileLabel}</span>
          </button>

          {/* ONE Red Button: Help (opens emergency screen with confirm) */}
          <button
            type="button"
            onClick={onOpenEmergency}
            title="Emergency Help"
            aria-label="Emergency Help"
            className="h-8 px-2.5 sm:px-3 rounded-[8px] bg-[#D62828] text-white hover:bg-[#B91C1C] flex items-center gap-1 font-black text-xs cursor-pointer active:scale-95 shadow-xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={t.settings || 'Settings'}
            aria-label={t.settings || 'Settings'}
            className="w-8 h-8 rounded-[8px] bg-white border border-[#E5DACF] hover:border-[#0A6C6E] flex items-center justify-center text-[#1F1B16] cursor-pointer active:scale-95 shadow-2xs"
          >
            <SettingsIcon className="w-4 h-4 text-[#1F1B16]" />
          </button>
        </div>
      </div>
    </header>
  );
};
