import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { QUICK_NEEDS, QuickNeed } from '../data/needs';
import { Pictogram } from './Pictogram';

interface QuickNeedsBarProps {
  className?: string;
}

export const QuickNeedsBar: React.FC<QuickNeedsBarProps> = ({ className = '' }) => {
  const { language, speak, requestEmergencyConfirm } = useCommuniq();

  const handleNeedClick = (need: QuickNeed) => {
    const label = need.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || need.labels.en;

    if (need.requiresConfirm) {
      requestEmergencyConfirm(label, () => {
        speak(label, { category: 'emergency', assetId: need.assetId, intentId: need.intentId });
      });
    } else {
      speak(label, { category: 'personal_needs', assetId: need.assetId, intentId: need.intentId });
    }
  };

  return (
    <nav
      aria-label="Quick Needs"
      className={`fixed bottom-0 left-0 right-0 z-30 bg-[#FFF8EF] border-t-2 border-[#E5DACF] px-2 py-2 shadow-lg ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
        {QUICK_NEEDS.map((need) => {
          const label = need.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || need.labels.en;
          const isEmergency = need.requiresConfirm;

          return (
            <button
              key={need.id}
              type="button"
              onClick={() => handleNeedClick(need)}
              aria-label={`Quick need: ${label}`}
              style={{
                backgroundColor: need.color,
                borderColor: need.borderColor,
                color: need.textColor
              }}
              className={`flex-1 min-w-[72px] sm:min-w-[90px] min-h-[76px] sm:min-h-[82px] rounded-[12px] border-2 flex flex-col items-center justify-center p-1 select-none cursor-pointer transition-transform duration-100 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D] ${
                isEmergency ? 'ring-2 ring-red-300' : ''
              }`}
            >
              <Pictogram name={need.assetId} alt="" size={36} />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
