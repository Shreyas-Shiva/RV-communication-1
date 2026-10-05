import React from 'react';
import { ArrowLeft, Home, LayoutGrid, RotateCcw, Volume2 } from 'lucide-react';

interface RightRailProps {
  canGoBack: boolean;
  onGoBack: () => void;
  onGoHome: () => void;
  onGoCore: () => void;
  onUndoLast: () => void;
  onAttention: () => void;
  className?: string;
}

export const RightRail: React.FC<RightRailProps> = ({
  canGoBack,
  onGoBack,
  onGoHome,
  onGoCore,
  onUndoLast,
  onAttention,
  className = ''
}) => {
  return (
    <>
      {/* Desktop & Tablet Vertical Rail */}
      <aside
        role="toolbar"
        aria-label="Board navigation and quick actions"
        className={`hidden md:flex flex-col items-center justify-start gap-2 w-16 lg:w-20 shrink-0 bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-2 select-none shadow-xs ${className}`}
      >
        <button
          type="button"
          onClick={onGoBack}
          disabled={!canGoBack}
          aria-label="Go Back"
          className="w-full h-14 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#1F1B16] hover:border-[#0A6C6E] hover:bg-[#E2F3F3] disabled:opacity-35 disabled:pointer-events-none flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <ArrowLeft className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] lg:text-[11px] font-black mt-1 leading-none">Back</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          aria-label="Home Board"
          className="w-full h-14 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#1F1B16] hover:border-[#0A6C6E] hover:bg-[#E2F3F3] flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <Home className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] lg:text-[11px] font-black mt-1 leading-none">Home</span>
        </button>

        <button
          type="button"
          onClick={onGoCore}
          aria-label="Core Words"
          className="w-full h-14 rounded-[10px] border-2 border-[#0A6C6E] bg-[#E2F3F3] text-[#063D3E] hover:bg-[#D0EDED] flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <LayoutGrid className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] lg:text-[11px] font-black mt-1 leading-none text-center">Core</span>
        </button>

        <button
          type="button"
          onClick={onUndoLast}
          aria-label="Undo last card"
          className="w-full h-14 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#1F1B16] hover:border-[#1F1B16] flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
        >
          <RotateCcw className="w-5 h-5 text-[#5E564D]" />
          <span className="text-[10px] lg:text-[11px] font-black mt-1 leading-none">Undo</span>
        </button>

        <button
          type="button"
          onClick={onAttention}
          aria-label="Get attention politely"
          className="w-full h-14 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#0A6C6E] hover:border-[#0A6C6E] hover:bg-[#E2F3F3] flex flex-col items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] mt-auto"
        >
          <Volume2 className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] lg:text-[11px] font-black mt-1 leading-none">Attention</span>
        </button>
      </aside>

      {/* Phone Compact Bottom Bar */}
      <nav
        aria-label="Quick actions"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#E5DACF] flex items-center justify-around px-2 py-1.5 shadow-lg select-none"
      >
        <button
          type="button"
          onClick={onGoBack}
          disabled={!canGoBack}
          aria-label="Go Back"
          className="flex flex-col items-center justify-center p-1.5 rounded-[8px] text-[#1F1B16] disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] font-bold mt-0.5">Back</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          aria-label="Home"
          className="flex flex-col items-center justify-center p-1.5 rounded-[8px] text-[#1F1B16] active:scale-95"
        >
          <Home className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={onGoCore}
          aria-label="Core Words"
          className="flex flex-col items-center justify-center p-1.5 rounded-[8px] text-[#0A6C6E] active:scale-95 font-black"
        >
          <LayoutGrid className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] font-black mt-0.5">Core</span>
        </button>

        <button
          type="button"
          onClick={onUndoLast}
          aria-label="Undo"
          className="flex flex-col items-center justify-center p-1.5 rounded-[8px] text-[#5E564D] active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Undo</span>
        </button>

        <button
          type="button"
          onClick={onAttention}
          aria-label="Get attention politely"
          className="flex flex-col items-center justify-center p-1.5 rounded-[8px] text-[#0A6C6E] active:scale-95"
        >
          <Volume2 className="w-5 h-5 text-[#0A6C6E]" />
          <span className="text-[10px] font-bold mt-0.5">Attention</span>
        </button>
      </nav>
    </>
  );
};
