import React from 'react';
import { Pictogram } from './Pictogram';
import { MascotView } from './MascotView';
import { MascotPose } from '../data/mascot';
import { WordClass, WORD_TYPE_PALETTE } from '../data/palette';
import { Volume2, Wand2, Delete, X } from 'lucide-react';

export interface StripToken {
  id: string;
  label: string;
  svgIcon: string;
  wordClass?: WordClass;
  alt?: string;
}

interface SentenceStripProps {
  tokens: StripToken[];
  onDeleteLast: () => void;
  onClear: () => void;
  onSayIt: () => void;
  onMakeSentence: () => void;
  isSpeaking?: boolean;
  userMode?: 'child' | 'student' | 'adult';
  mascotPose?: MascotPose;
  mascotPrompt?: string;
  className?: string;
}

export const SentenceStrip: React.FC<SentenceStripProps> = ({
  tokens,
  onDeleteLast,
  onClear,
  onSayIt,
  onMakeSentence,
  isSpeaking = false,
  userMode = 'adult',
  mascotPose = 'calm',
  mascotPrompt = 'Tap pictures to speak',
  className = ''
}) => {
  return (
    <div
      role="region"
      aria-label="Sentence Strip"
      className={`h-[78px] min-h-[72px] max-h-[88px] bg-white border-2 border-[#E5DACF] rounded-[12px] p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-sm ${className}`}
    >
      {/* Left: Owl mascot in child mode */}
      {userMode === 'child' && (
        <div className="flex items-center gap-2 shrink-0 border-r-2 border-[#E5DACF] pr-2 mr-1">
          <MascotView pose={mascotPose} size={54} />
          <div className="hidden md:block max-w-[130px]">
            <p className="text-[11px] font-bold text-[#0F8B8D] leading-tight">
              {mascotPrompt}
            </p>
          </div>
        </div>
      )}

      {/* Middle: Tokens scroll container */}
      <div
        className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0 h-full px-1 no-scrollbar"
        tabIndex={0}
        aria-label="Current sentence words"
      >
        {tokens.length === 0 ? (
          <span className="text-xs sm:text-sm font-semibold text-[#8C827A] italic select-none pl-1">
            {userMode === 'child' ? 'Your sentence appears here' : 'Tap cards to build a sentence'}
          </span>
        ) : (
          tokens.map((token, idx) => {
            const palette = token.wordClass ? WORD_TYPE_PALETTE[token.wordClass] : null;
            const fill = palette?.fill || '#FFF8EF';
            const border = palette?.border || '#E5DACF';
            const textCol = palette?.text || '#1F1B16';

            return (
              <div
                key={`strip-token-${idx}-${token.id}`}
                style={{ backgroundColor: fill, borderColor: border }}
                className="h-full min-w-[56px] max-w-[80px] px-1.5 py-0.5 rounded-[8px] border-2 flex flex-col items-center justify-center shrink-0 select-none shadow-xs"
              >
                <div className="w-7 h-7 flex items-center justify-center pointer-events-none">
                  <Pictogram name={token.svgIcon} alt={token.alt || token.label} size={26} fallbackLabel={token.label} />
                </div>
                <span
                  style={{ color: textCol }}
                  className="text-[11px] sm:text-xs font-black truncate max-w-full leading-none mt-0.5"
                >
                  {token.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Right: Strip action buttons */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l-2 border-[#E5DACF]">
        <button
          type="button"
          onClick={onDeleteLast}
          disabled={tokens.length === 0}
          aria-label="Delete last word"
          title="Delete last word"
          className="h-10 px-2 sm:px-2.5 rounded-[10px] border-2 border-[#E5DACF] bg-[#FFF8EF] text-[#5E564D] hover:border-[#1F1B16] hover:text-[#1F1B16] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-bold text-xs cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <Delete className="w-4 h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={tokens.length === 0}
          aria-label="Clear sentence"
          title="Clear sentence"
          className="h-10 px-2 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#5E564D] hover:border-[#D62828] hover:text-[#D62828] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center font-bold text-xs cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Clear</span>
        </button>

        <button
          type="button"
          onClick={onMakeSentence}
          disabled={tokens.length === 0}
          aria-label="Make it a sentence"
          title="Make it a sentence"
          className="h-10 px-2.5 rounded-[10px] border-2 border-[#2F78BD] bg-[#D3E8FA] text-[#12395E] hover:bg-[#BCE0FD] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-extrabold text-xs cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden md:inline">Make sentence</span>
        </button>

        <button
          type="button"
          onClick={onSayIt}
          disabled={tokens.length === 0}
          aria-label="Say it aloud"
          className={`h-10 px-3 sm:px-4 rounded-[10px] border-2 border-[#D97706] bg-[#FFB703] hover:bg-[#F59E0B] text-[#1F1B16] flex items-center gap-1.5 font-black text-xs sm:text-sm cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0A6C6E] disabled:opacity-40 disabled:pointer-events-none shadow-sm ${
            isSpeaking ? 'ring-3 ring-[#0A6C6E] animate-pulse' : ''
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#1F1B16]" />
          <span>Say it</span>
        </button>
      </div>
    </div>
  );
};
