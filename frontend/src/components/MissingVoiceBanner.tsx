import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { VolumeX, Check } from 'lucide-react';
import { Button } from './Button';

export const MissingVoiceBanner: React.FC = () => {
  const { showMissingVoiceWarning, dismissMissingVoiceWarning, t } = useCommuniq();

  if (!showMissingVoiceWarning) return null;

  return (
    <div
      role="alert"
      className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[16px] p-4 sm:p-5 mb-5 shadow-sm text-[#1F1B16]"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-white border-2 border-[#FFB703] flex items-center justify-center shrink-0 text-[#8D4004]">
            <VolumeX className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#8D4004]">
              {t.missingVoiceTitle}
            </h3>
            <p className="text-sm font-medium text-[#5E564D] mt-0.5">
              {t.missingVoiceDesc}
            </p>
            <p className="text-xs text-[#5E564D] mt-1">
              {t.missingVoiceHowToFix}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <Button
            variant="accent"
            size="normal"
            onClick={dismissMissingVoiceWarning}
            icon={<Check className="w-4 h-4 text-[#1F1B16]" />}
          >
            {t.continueWithTextOnly}
          </Button>
        </div>
      </div>
    </div>
  );
};
