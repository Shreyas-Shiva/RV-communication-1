import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface SpeakIndicatorProps {
  isSpeaking: boolean;
  phrase: string;
  onReplay: () => void;
  onStop: () => void;
  replayLabel: string;
  stopLabel: string;
  speakingLabel: string;
  userMode?: 'child' | 'student' | 'adult';
}

export const SpeakIndicator: React.FC<SpeakIndicatorProps> = ({
  isSpeaking,
  phrase,
  onReplay,
  onStop,
  replayLabel,
  stopLabel,
  speakingLabel,
  userMode = 'adult'
}) => {
  if (!phrase) return null;

  const phraseTextSize = userMode === 'child'
    ? 'text-2xl sm:text-4xl font-extrabold'
    : userMode === 'student'
    ? 'text-xl sm:text-3xl font-bold'
    : 'text-xl sm:text-2xl font-bold';

  return (
    <div
      role="region"
      aria-label="Active spoken sentence"
      className="w-full bg-white border-2 border-[#0F8B8D] rounded-[16px] p-4 sm:p-5 shadow-sm transition-all duration-150"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 border-2 transition-colors duration-150 ${
              isSpeaking
                ? 'bg-[#E2F3F3] border-[#0F8B8D] text-[#0F8B8D]'
                : 'bg-[#FFF8EF] border-[#E5DACF] text-[#5E564D]'
            }`}
            aria-hidden="true"
          >
            {isSpeaking ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-[#0F8B8D] rounded-[2px] animate-pulse" />
                <span className="w-1.5 h-6 bg-[#0F8B8D] rounded-[2px] animate-pulse delay-75" />
                <span className="w-1.5 h-3 bg-[#0F8B8D] rounded-[2px] animate-pulse delay-150" />
              </div>
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#085557]">
                {isSpeaking ? speakingLabel : 'Spoken Phrase'}
              </span>
            </div>
            <p className={`text-[#1F1B16] leading-snug break-words ${phraseTextSize}`}>
              "{phrase}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          {isSpeaking ? (
            <Button
              variant="secondary"
              size={userMode === 'child' ? 'child' : 'normal'}
              onClick={onStop}
              icon={<VolumeX className="w-5 h-5 text-[#D62828]" />}
              aria-label={stopLabel}
            >
              {stopLabel}
            </Button>
          ) : (
            <Button
              variant="accent"
              size={userMode === 'child' ? 'child' : 'normal'}
              onClick={onReplay}
              icon={<RotateCcw className="w-5 h-5 text-[#1F1B16]" />}
              aria-label={replayLabel}
            >
              {replayLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
