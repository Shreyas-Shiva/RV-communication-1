import React from 'react';
import { MascotPose, renderMascotSvg } from '../data/mascot';

interface MascotViewProps {
  pose?: MascotPose;
  size?: number;
  message?: string;
  onClick?: () => void;
  className?: string;
}

export const MascotView: React.FC<MascotViewProps> = ({
  pose = 'calm',
  size = 88,
  message,
  onClick,
  className = ''
}) => {
  const svgHtml = renderMascotSvg(pose, size);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="Ollie the Owl assistant"
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      <div
        className="shrink-0 transition-transform duration-150"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      {message && (
        <div className="relative bg-white border-2 border-[#0F8B8D] rounded-[16px] px-4 py-2.5 shadow-sm max-w-xs">
          {/* Small talk bubble arrow */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[8px] border-r-[#0F8B8D]" />
          <p className="text-base sm:text-lg font-extrabold text-[#1F1B16] leading-snug">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
