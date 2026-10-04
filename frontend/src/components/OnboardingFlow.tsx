import React, { useState } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { LanguageCode, UserMode } from '../translations';
import { Button } from './Button';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { language, setLanguage, userMode, setUserMode, updatePreferences, t } = useCommuniq();
  const [step, setStep] = useState<'language' | 'mode' | 'consent'>('language');

  const languages: { code: LanguageCode; name: string; nativeName: string; helper: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', helper: 'Listen and speak in English.' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', helper: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಿ ಮತ್ತು ಮಾತನಾಡಿ.' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', helper: 'हिन्दी में सुनें और बोलें।' }
  ];

  const modes: { mode: UserMode; title: string; desc: string; color: string; borderColor: string }[] = [
    {
      mode: 'child',
      title: t.childTitle,
      desc: t.childDesc,
      color: '#FFF2C6',
      borderColor: '#FFC83B'
    },
    {
      mode: 'student',
      title: t.studentTitle,
      desc: t.studentDesc,
      color: '#DCEBFA',
      borderColor: '#4EA8DE'
    },
    {
      mode: 'adult',
      title: t.adultTitle,
      desc: t.adultDesc,
      color: '#E2F3F3',
      borderColor: '#0F8B8D'
    }
  ];

  const handleSelectLanguage = async (code: LanguageCode) => {
    await setLanguage(code);
    setStep('mode');
  };

  const handleSelectMode = async (chosenMode: UserMode) => {
    await setUserMode(chosenMode);
    if (chosenMode === 'child') {
      setStep('consent');
    } else {
      await updatePreferences({ onboardingCompleted: true });
      onComplete();
    }
  };

  const handleConsentAccept = async () => {
    await updatePreferences({
      parentConsentGiven: true,
      onboardingCompleted: true
    });
    onComplete();
  };

  return (
    <main className="min-h-screen bg-[#FFF8EF] flex items-center justify-center p-4 sm:p-6" role="main">
      <div className="w-full max-w-2xl bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-lg">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-[12px] bg-[#0F8B8D] border-2 border-[#0F8B8D] items-center justify-center mb-3">
            <svg viewBox="0 0 100 100" width="40" height="40" aria-hidden="true">
              <circle cx="50" cy="50" r="10" fill="#FFB703" />
              <path d="M 28 50 A 22 22 0 0 1 72 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              <path d="M 18 50 A 32 32 0 0 1 82 50" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F8B8D] tracking-tight">
            COMMUNIQ
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#1F1B16] mt-1">
            {t.tagline}
          </p>
          <p className="text-xs sm:text-sm text-[#5E564D] mt-0.5">
            {t.supportingLine}
          </p>
        </div>

        {/* SCREEN 1: Choose your language */}
        {step === 'language' && (
          <div role="region" aria-label="Step 1: Choose Language">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
                {t.chooseLanguageTitle}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#5E564D] mt-1">
                {t.chooseLanguageHelper}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  aria-label={`Select ${item.name}`}
                  className={`min-h-[140px] rounded-[16px] border-2 p-5 text-center flex flex-col items-center justify-center select-none cursor-pointer transition-transform duration-100 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D] ${
                    language === item.code
                      ? 'bg-[#E2F3F3] border-[#0F8B8D] ring-2 ring-[#0F8B8D]'
                      : 'bg-white border-[#E5DACF] hover:border-[#0F8B8D] hover:bg-[#FFF8EF]'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl font-black text-[#0F8B8D] mb-1">
                    {item.nativeName}
                  </span>
                  <span className="text-lg font-bold text-[#1F1B16]">
                    {item.name}
                  </span>
                  <span className="text-xs text-[#5E564D] mt-2 font-medium">
                    {item.helper}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-center text-[#5E564D] mt-6">
              {t.changeChoiceAnytime}
            </p>
          </div>
        )}

        {/* SCREEN 2: Who is using Communiq? */}
        {step === 'mode' && (
          <div role="region" aria-label="Step 2: Choose Age Group">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
                {t.whoIsUsingTitle}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#5E564D] mt-1">
                {t.whoIsUsingHelper}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {modes.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => handleSelectMode(item.mode)}
                  aria-label={`Select ${item.title}`}
                  style={{ backgroundColor: item.color, borderColor: item.borderColor }}
                  className={`min-h-[100px] rounded-[16px] border-2 p-5 text-left flex items-center justify-between select-none cursor-pointer transition-transform duration-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D] ${
                    userMode === item.mode ? 'ring-3 ring-[#0F8B8D]' : ''
                  }`}
                >
                  <div>
                    <span className="block text-2xl font-black text-[#1F1B16]">
                      {item.title}
                    </span>
                    <span className="block text-sm sm:text-base font-medium text-[#1F1B16] mt-1">
                      {item.desc}
                    </span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[#1F1B16] shrink-0 ml-4" />
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-[#E5DACF]">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setStep('language')}
              >
                {t.back}
              </Button>
              <span className="text-xs text-[#5E564D]">
                {t.changeChoiceAnytime}
              </span>
            </div>
          </div>
        )}

        {/* SCREEN 2.5: Parental Consent (for Class 1-7 mode) */}
        {step === 'consent' && (
          <div role="region" aria-label="Step 3: Parental Consent">
            <div className="flex items-center gap-3 mb-4 text-[#0F8B8D]">
              <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0F8B8D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#0F8B8D]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1F1B16]">
                  {t.parentalConsentTitle}
                </h2>
                <p className="text-xs font-semibold text-[#5E564D]">
                  Safety and Privacy First
                </p>
              </div>
            </div>

            <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-5 my-5 text-[#1F1B16] space-y-3">
              <p className="text-base font-semibold leading-relaxed">
                {t.parentalConsentDesc}
              </p>
              <ul className="text-sm space-y-1.5 list-disc list-inside font-medium text-[#5E564D]">
                <li>Spoken phrases and words stay stored safely on this device.</li>
                <li>Zero advertising, zero analytics trackers, and zero sold data.</li>
                <li>You can review the daily timeline or delete all data in one tap.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => setStep('mode')}
              >
                {t.back}
              </Button>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleConsentAccept}
                icon={<Check className="w-5 h-5 text-white" />}
              >
                {t.parentalConsentAgree}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
