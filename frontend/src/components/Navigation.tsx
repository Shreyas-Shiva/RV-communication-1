import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { MessagesSquare, MessageSquare, Dumbbell, Calendar, AlertCircle } from 'lucide-react';

export type ScreenId =
  | 'home'
  | 'communicate'
  | 'talk'
  | 'practice'
  | 'myDay'
  | 'settings'
  | 'privacy'
  | 'terms'
  | 'design'
  | 'about'
  | 'help'
  | 'accessibility'
  | 'contact'
  | 'signLab'
  | 'review'
  | '404';

interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenEmergency?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate, onOpenEmergency }) => {
  const { t } = useCommuniq();

  const isChatActive = currentScreen === 'talk' || currentScreen === 'home';
  const isBoardActive = currentScreen === 'communicate';

  // Desktop sidebar is removed per Part 1. Navigation is in top bar.
  // Phone bottom bar provides: Chat, Board, Practice, My Day, Help.
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#E5DACF] px-1 py-1 shadow-lg flex items-center justify-around select-none"
    >
      {/* 1. Chat */}
      <button
        type="button"
        onClick={() => onNavigate('talk')}
        aria-current={isChatActive ? 'page' : undefined}
        className={`flex-1 min-h-[48px] rounded-[8px] flex flex-col items-center justify-center p-1 transition-transform active:scale-95 ${
          isChatActive
            ? 'bg-[#E2F3F3] text-[#085557] font-black'
            : 'text-[#5E564D] font-bold hover:bg-[#FFF8EF]'
        }`}
      >
        <MessagesSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">Chat</span>
      </button>

      {/* 2. Board */}
      <button
        type="button"
        onClick={() => onNavigate('communicate')}
        aria-current={isBoardActive ? 'page' : undefined}
        className={`flex-1 min-h-[48px] rounded-[8px] flex flex-col items-center justify-center p-1 transition-transform active:scale-95 ${
          isBoardActive
            ? 'bg-[#E2F3F3] text-[#085557] font-black'
            : 'text-[#5E564D] font-bold hover:bg-[#FFF8EF]'
        }`}
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">Board</span>
      </button>

      {/* 3. Practice */}
      <button
        type="button"
        onClick={() => onNavigate('practice')}
        aria-current={currentScreen === 'practice' ? 'page' : undefined}
        className={`flex-1 min-h-[48px] rounded-[8px] flex flex-col items-center justify-center p-1 transition-transform active:scale-95 ${
          currentScreen === 'practice'
            ? 'bg-[#E2F3F3] text-[#085557] font-black'
            : 'text-[#5E564D] font-bold hover:bg-[#FFF8EF]'
        }`}
      >
        <Dumbbell className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">{t.practice || 'Practice'}</span>
      </button>

      {/* 4. My Day */}
      <button
        type="button"
        onClick={() => onNavigate('myDay')}
        aria-current={currentScreen === 'myDay' ? 'page' : undefined}
        className={`flex-1 min-h-[48px] rounded-[8px] flex flex-col items-center justify-center p-1 transition-transform active:scale-95 ${
          currentScreen === 'myDay'
            ? 'bg-[#E2F3F3] text-[#085557] font-black'
            : 'text-[#5E564D] font-bold hover:bg-[#FFF8EF]'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">{t.myDay || 'My Day'}</span>
      </button>

      {/* 5. Help */}
      <button
        type="button"
        onClick={onOpenEmergency}
        aria-label="Emergency Help"
        className="flex-1 min-h-[48px] rounded-[8px] flex flex-col items-center justify-center p-1 text-[#D62828] font-black active:scale-95 hover:bg-[#FFE5E5]"
      >
        <AlertCircle className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">Help</span>
      </button>
    </nav>
  );
};
