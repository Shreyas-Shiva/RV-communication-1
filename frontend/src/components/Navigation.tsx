import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { Home, MessageSquare, MessagesSquare, Dumbbell, Calendar } from 'lucide-react';

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
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  const { t, userMode } = useCommuniq();

  const navItems = [
    { id: 'home' as ScreenId, label: t.home, icon: Home },
    { id: 'communicate' as ScreenId, label: t.communicate, icon: MessageSquare },
    { id: 'talk' as ScreenId, label: t.talk, icon: MessagesSquare },
    { id: 'practice' as ScreenId, label: t.practice, icon: Dumbbell },
    { id: 'myDay' as ScreenId, label: t.myDay, icon: Calendar },
  ];

  // In child mode, permanent bottom quick needs bar occupies the bottom on mobile.
  // On desktop, the sidebar is always clean and accessible.
  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside
        aria-label="Main Navigation"
        className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r-2 border-[#E5DACF] p-4 gap-2 min-h-screen"
      >
        <div className="mb-4 px-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E564D]">
            Navigation
          </p>
        </div>

        <nav aria-label="Sidebar navigation" className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-[56px] rounded-[12px] border-2 px-4 py-3 flex items-center gap-3.5 font-black text-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0A6C6E] ${
                  isActive
                    ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#085557]'
                    : 'bg-white border-transparent text-[#1F1B16] hover:bg-[#FFF8EF] hover:border-[#E5DACF]'
                }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-[#085557]' : 'text-[#5E564D]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer links in sidebar */}
        <div className="pt-4 border-t-2 border-[#E5DACF] flex flex-col gap-1.5 text-xs text-[#5E564D]">
          <div className="flex flex-wrap gap-x-2 gap-y-1 font-bold">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              About
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('help')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Help
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('accessibility')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Accessibility
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Contact
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              {t.privacy}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              {t.terms}
            </button>
          </div>
          <p className="mt-1 text-[11px] leading-tight">
            ARASAAC pictograms licensed under CC (BY-NC-SA).
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Bar (visible on screens below md, positioned above child quick needs if child mode) */}
      <nav
        aria-label="Mobile Navigation"
        className={`md:hidden fixed left-0 right-0 z-20 bg-white border-t-2 border-[#E5DACF] px-1 py-1.5 shadow-md flex items-center justify-around ${
          userMode === 'child' ? 'bottom-[88px]' : 'bottom-0'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-h-[54px] rounded-[10px] flex flex-col items-center justify-center p-1 select-none transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D] ${
                isActive
                  ? 'bg-[#E2F3F3] text-[#085557] font-black'
                  : 'text-[#5E564D] font-bold hover:bg-[#FFF8EF]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-xs truncate w-full text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
