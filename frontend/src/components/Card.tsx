import React from 'react';

interface CardProps {
  onClick?: () => void;
  title: string;
  image?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  color?: string;
  borderColor?: string;
  textColor?: string;
  userMode?: 'child' | 'student' | 'adult';
  isSelected?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  className?: string;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  onClick,
  title,
  image,
  subtitle,
  badge,
  color = '#FFFFFF',
  borderColor = '#E5DACF',
  textColor = '#1F1B16',
  userMode = 'adult',
  isSelected = false,
  isFavorite,
  onToggleFavorite,
  className = '',
  ariaLabel
}) => {
  // Mode-based text sizes: Child >= 24px, Student >= 20px, Adult >= 18px
  const textSizes: Record<'child' | 'student' | 'adult', string> = {
    child: 'text-2xl sm:text-3xl font-extrabold',
    student: 'text-xl sm:text-2xl font-bold',
    adult: 'text-lg sm:text-xl font-bold'
  };

  // Touch target min-height: Child >= 80px, others >= 56px
  const minHeightClasses: Record<'child' | 'student' | 'adult', string> = {
    child: 'min-h-[140px] p-4',
    student: 'min-h-[120px] p-3.5',
    adult: 'min-h-[100px] p-3'
  };

  const selectedBorder = isSelected ? 'border-[#0F8B8D] ring-4 ring-[#0F8B8D]/30' : '';

  return (
    <div
      style={{ backgroundColor: color, borderColor: borderColor }}
      className={`card-communiq group relative flex flex-col items-center justify-between text-center select-none w-full border-2 rounded-[16px] transition-transform duration-100 ${minHeightClasses[userMode]} ${selectedBorder} ${className}`}
    >
      {badge && (
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
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
          className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-[10px] bg-white/95 border border-[#E5DACF] flex items-center justify-center text-[#FFB703] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] cursor-pointer active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
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
        className="w-full flex-1 flex flex-col items-center justify-between cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0A6C6E] focus-visible:outline-offset-2 rounded-[14px] active:scale-[0.98]"
      >
        {image && (
          <div className="flex-1 flex items-center justify-center py-1 w-full max-h-[110px]">
            {image}
          </div>
        )}

        <div className="w-full mt-2">
          <span
            style={{ color: textColor }}
            className={`block tracking-tight leading-tight line-clamp-2 ${textSizes[userMode]}`}
          >
            {title}
          </span>
          {subtitle && (
            <span className="block text-xs sm:text-sm text-[#423C35] mt-1 font-bold">
              {subtitle}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
