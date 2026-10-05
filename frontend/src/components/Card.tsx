import React from 'react';
import { WordClass, WORD_TYPE_PALETTE } from '../data/palette';

interface CardProps {
  onClick?: () => void;
  title?: string;
  image?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  wordClass?: WordClass;
  color?: string;
  borderColor?: string;
  textColor?: string;
  userMode?: 'child' | 'student' | 'adult';
  density?: 'compact' | 'comfortable' | 'large';
  isSelected?: boolean;
  isFolder?: boolean;
  isEmptySlot?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  className?: string;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  onClick,
  title = '',
  image,
  subtitle,
  badge,
  wordClass,
  color,
  borderColor,
  textColor,
  userMode = 'adult',
  density = 'compact',
  isSelected = false,
  isFolder = false,
  isEmptySlot = false,
  isFavorite,
  onToggleFavorite,
  className = '',
  ariaLabel
}) => {
  // If it's a blank locked slot, render an empty placeholder container
  if (isEmptySlot) {
    const slotMinHeight = userMode === 'child' ? 'min-h-[104px]' : userMode === 'student' ? 'min-h-[96px]' : 'min-h-[88px]';
    return (
      <div
        aria-hidden="true"
        className={`w-full rounded-[10px] border-2 border-dashed border-[#E5DACF]/60 bg-transparent pointer-events-none select-none ${slotMinHeight} ${className}`}
      />
    );
  }

  // Derive styling from word-type palette if wordClass is specified
  const paletteDef = wordClass ? WORD_TYPE_PALETTE[wordClass] : null;
  const finalFill = color || paletteDef?.fill || '#FFFFFF';
  const finalBorder = borderColor || paletteDef?.border || '#E5DACF';
  const finalTextColor = textColor || paletteDef?.text || '#1F1B16';

  // Density and mode based height classes:
  // Adult: 88 to 104px tall
  // Student: 96 to 108px tall
  // Child: 104 to 120px tall
  const heightClasses: Record<'child' | 'student' | 'adult', Record<'compact' | 'comfortable' | 'large', string>> = {
    child: {
      compact: 'min-h-[104px] max-h-[104px] p-2',
      comfortable: 'min-h-[112px] max-h-[112px] p-2.5',
      large: 'min-h-[120px] max-h-[120px] p-3'
    },
    student: {
      compact: 'min-h-[96px] max-h-[96px] p-2',
      comfortable: 'min-h-[102px] max-h-[102px] p-2',
      large: 'min-h-[108px] max-h-[108px] p-2.5'
    },
    adult: {
      compact: 'min-h-[88px] max-h-[88px] p-1.5',
      comfortable: 'min-h-[96px] max-h-[96px] p-2',
      large: 'min-h-[104px] max-h-[104px] p-2.5'
    }
  };

  const textSizes: Record<'child' | 'student' | 'adult', string> = {
    child: 'text-sm sm:text-base font-extrabold',
    student: 'text-xs sm:text-sm font-bold',
    adult: 'text-xs sm:text-sm font-bold'
  };

  const selectedRing = isSelected ? 'ring-3 ring-[#0A6C6E]' : '';

  return (
    <div
      style={{ backgroundColor: finalFill, borderColor: finalBorder }}
      className={`card-communiq group relative flex flex-col items-center justify-between text-center select-none w-full border-2 rounded-[10px] sm:rounded-[12px] shadow-sm transition-transform duration-100 ${heightClasses[userMode][density]} ${selectedRing} ${className}`}
    >
      {/* Folder Tab Notch (drawn flat with 6px top radius, never pill) */}
      {isFolder && (
        <div
          style={{ backgroundColor: finalFill, borderColor: finalBorder }}
          aria-hidden="true"
          className="absolute -top-[9px] left-3 h-3 w-12 rounded-t-[6px] border-t-2 border-l-2 border-r-2 pointer-events-none"
        />
      )}

      {badge && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          {badge}
        </div>
      )}

      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          className="absolute top-1.5 left-1.5 z-10 w-8 h-8 rounded-[8px] bg-white/95 border border-[#E5DACF] flex items-center justify-center text-[#FFB703] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill={isFavorite ? '#FFB703' : 'none'}
            stroke="#FFB703"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || title}
        className="w-full flex-1 flex flex-col items-center justify-between cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0A6C6E] focus-visible:outline-offset-2 rounded-[8px] sm:rounded-[10px] active:scale-[0.98]"
      >
        {image && (
          <div className={`flex-1 flex items-center justify-center py-0.5 w-full min-h-0 overflow-hidden ${
            userMode === 'child' ? 'max-h-[68px] sm:max-h-[74px]' : 'max-h-[48px] sm:max-h-[52px]'
          }`}>
            {image}
          </div>
        )}

        <div className="w-full mt-0.5 min-w-0">
          <span
            style={{ color: finalTextColor }}
            className={`block tracking-tight leading-tight truncate ${textSizes[userMode]}`}
          >
            {title}
          </span>
          {subtitle && (
            <span className="block text-[11px] sm:text-xs text-[#423C35] mt-0.5 font-bold truncate">
              {subtitle}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
