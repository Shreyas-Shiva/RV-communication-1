import React, { useState } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { QUICK_NEEDS, QuickNeed } from '../data/needs';
import { getAssetById } from '../data/assets';
import { Pictogram } from './Pictogram';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface QuickNeedsBarProps {
  className?: string;
}

export const QuickNeedsBar: React.FC<QuickNeedsBarProps> = ({ className = '' }) => {
  const { language, speak, requestEmergencyConfirm } = useCommuniq();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
      className={`fixed bottom-0 left-0 right-0 z-30 bg-[#FFF8EF] border-t-2 border-[#E5DACF] shadow-lg transition-all duration-150 ${className}`}
    >
      {/* Collapse/Expand Toggle Handle */}
      <div className="flex justify-center -mt-3.5 mb-0.5">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand Quick Needs bar' : 'Collapse Quick Needs bar'}
          className="bg-white border-2 border-[#E5DACF] rounded-[8px] px-2.5 py-0.5 text-xs font-bold text-[#5E564D] hover:text-[#0A6C6E] hover:border-[#0A6C6E] flex items-center gap-1 shadow-xs cursor-pointer select-none"
        >
          <span>Quick Needs</span>
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="max-w-7xl mx-auto px-2 pb-1.5 pt-0.5 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-h-[64px]">
          {QUICK_NEEDS.map((need) => {
            const label = need.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || need.labels.en;
            const isEmergency = need.requiresConfirm;
            const asset = getAssetById(need.assetId);
            const iconName = asset?.svgIcon || need.assetId;

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
                className={`flex-1 min-w-[62px] sm:min-w-[80px] h-[52px] max-h-[54px] rounded-[10px] border-2 flex flex-col items-center justify-center px-1 py-0.5 select-none cursor-pointer transition-transform duration-100 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] ${
                  isEmergency ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <Pictogram name={iconName} fallbackLabel={label} alt="" size={26} />
                <span className="text-[11px] sm:text-xs font-bold tracking-tight text-center leading-none truncate w-full px-0.5 mt-0.5">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
