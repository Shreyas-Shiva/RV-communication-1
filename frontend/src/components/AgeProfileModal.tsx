import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { UserMode, LanguageCode } from '../translations';
import { Sparkles, Check, X, Smile, GraduationCap, User } from 'lucide-react';

interface AgeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLaunch?: boolean;
}

interface ProfileOption {
  mode: UserMode;
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  ringClass: string;
}

export const AgeProfileModal: React.FC<AgeProfileModalProps> = ({
  isOpen,
  onClose,
  isFirstLaunch = false
}) => {
  const {
    userMode,
    language,
    setLanguage,
    updatePreferences
  } = useCommuniq();

  if (!isOpen) return null;

  const profiles: ProfileOption[] = [
    {
      mode: 'child',
      badge: 'Young Children',
      title: 'Class 1 to 5',
      subtitle:
        'Playful mascot, large tactile pictograms, simplified vocabulary, silent-on-tap until "Say It" is pressed.',
      features: [
        'Playful mascot & large tactile pictograms (5x4 grid)',
        'Silent-on-tap until "Say It" is pressed',
        'Simplified vocabulary without distracting rails'
      ],
      icon: <Smile className="w-6 h-6 text-[#B45309]" />,
      bgClass: 'bg-[#FFF9E6]',
      borderClass: 'border-[#F6C343]',
      ringClass: 'ring-[#F6C343]'
    },
    {
      mode: 'student',
      badge: 'Students & Teens',
      title: 'Class 6 to 12',
      subtitle:
        'Standard density, balanced pictograms + words, active AI assistance, school/social categories.',
      features: [
        'Standard density (7x5 grid) with folder tabs',
        'School and social communication categories',
        'Active AI assistance & smart sentence builder'
      ],
      icon: <GraduationCap className="w-6 h-6 text-[#0369A1]" />,
      bgClass: 'bg-[#F0F7FF]',
      borderClass: 'border-[#7DD3FC]',
      ringClass: 'ring-[#38BDF8]'
    },
    {
      mode: 'adult',
      badge: 'Adults & Elders',
      title: 'Class 18+',
      subtitle:
        'Proloquo4Text style, clean typography, compact grid, high contrast, dignified minimalist styling.',
      features: [
        'Proloquo4Text style with dignified clean typography',
        'Compact 8x5 dense grid with core words',
        'High efficiency conversational AI bridge'
      ],
      icon: <User className="w-6 h-6 text-[#0A6C6E]" />,
      bgClass: 'bg-[#F0FDF4]',
      borderClass: 'border-[#86EFAC]',
      ringClass: 'ring-[#22C55E]'
    }
  ];

  const handleSelectProfile = async (chosenMode: UserMode) => {
    // Silent on tap for child mode until Say It is pressed; speak on tap for student and adult
    const silentOnTap = chosenMode === 'child';

    await updatePreferences({
      userMode: chosenMode,
      speakOnTap: !silentOnTap,
      onboardingCompleted: true
    });

    try {
      localStorage.setItem('communiq_user_mode', chosenMode);
      localStorage.setItem('communiq_onboarding_completed', 'true');
    } catch {
      // safe fallback
    }

    onClose();
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-[#FFFBF5] border-2 border-[#E5DACF] rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-hidden animate-fadeIn">
        {/* Close Button (only if not mandatory first launch) */}
        {!isFirstLaunch && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="absolute top-5 right-5 p-2 rounded-xl text-[#7A7065] hover:text-[#1F1B16] hover:bg-[#EFE6DC] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2F3F3] text-[#0A6C6E] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            COMMUNIQ AAC PROFILES
          </div>
          <h2
            id="profile-modal-title"
            className="text-2xl sm:text-3xl font-black text-[#1F1B16] tracking-tight"
          >
            Who is using Communiq today?
          </h2>
          <p className="text-sm sm:text-base text-[#6B6155] font-medium mt-1 max-w-lg mx-auto">
            Choose an age-adapted profile. This configures both the Picture Board and the AI Chat experience.
          </p>

          {/* Quick Language Switcher */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-[#7A7065]">Voice Language:</span>
            <div className="inline-flex rounded-xl p-1 bg-[#EBE2D5] border border-[#E0D5C5]">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-[#0A6C6E] text-white shadow-xs'
                      : 'text-[#4A4237] hover:text-[#1F1B16]'
                  }`}
                >
                  {l.label} ({l.native})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Selectable Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-4">
          {profiles.map((p) => {
            const isSelected = userMode === p.mode;

            return (
              <button
                key={p.mode}
                type="button"
                onClick={() => handleSelectProfile(p.mode)}
                className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer group relative shadow-xs hover:shadow-md active:scale-[0.98] ${
                  p.bgClass
                } ${p.borderClass} ${
                  isSelected ? `ring-3 ${p.ringClass} border-transparent shadow-md` : 'hover:border-[#0A6C6E]/60'
                }`}
              >
                {/* Top Badge & Selection Indicator */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="p-2 rounded-xl bg-white/90 shadow-2xs border border-black/5">
                    {p.icon}
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A6C6E] text-white text-[11px] font-bold shadow-xs">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                {/* Profile Title & Subtitle */}
                <div className="mb-4">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#6B6155] mb-0.5">
                    {p.badge}
                  </div>
                  <h3 className="text-xl font-black text-[#1F1B16] leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#524B43] mt-1.5 leading-relaxed font-medium">
                    {p.subtitle}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-3 border-t border-black/10 w-full space-y-1.5">
                  {p.features.map((feat, i) => (
                    <div
                      key={i}
                      className="text-[11px] text-[#4A4237] font-semibold flex items-start gap-1.5 leading-tight"
                    >
                      <span className="text-[#0A6C6E] shrink-0 font-bold">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="mt-4 pt-2 w-full">
                  <div
                    className={`w-full py-2 px-3 rounded-xl text-center text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-[#0A6C6E] text-white shadow-xs'
                        : 'bg-white/80 group-hover:bg-[#0A6C6E] group-hover:text-white text-[#1F1B16] border border-black/10'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : `Select ${p.title}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Subtext */}
        <p className="text-center text-xs text-[#7A7065] mt-2 font-medium">
          You can change this profile anytime by tapping <strong>Profile</strong> in the top header.
        </p>
      </div>
    </div>
  );
};
