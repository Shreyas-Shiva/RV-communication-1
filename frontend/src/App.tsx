import { useState, useEffect } from 'react';
import { useCommuniq } from './hooks/useCommuniq';
import { Header } from './components/Header';
import { ScreenId } from './components/Navigation';
import { EmergencyModal } from './components/EmergencyModal';
import { GrownUpsModal } from './components/GrownUpsModal';
import { MissingVoiceBanner } from './components/MissingVoiceBanner';
import { AgeProfileModal } from './components/AgeProfileModal';

import { ChatPage } from './pages/ChatPage';
import { CommunicatePage } from './pages/CommunicatePage';
import { PracticePage } from './pages/PracticePage';
import { MyDayPage } from './pages/MyDayPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { DesignShowcasePage } from './pages/DesignShowcasePage';
import { AboutPage } from './pages/AboutPage';
import { HelpPage } from './pages/HelpPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { ContactPage } from './pages/ContactPage';
import { SignLabPage } from './pages/SignLabPage';
import { ReviewPage } from './pages/ReviewPage';
import { NotFoundPage } from './pages/NotFoundPage';

function getInitialScreen(): ScreenId {
  if (typeof window === 'undefined') return 'talk';
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === '' || path === 'chat' || path === 'talk' || path === 'home') return 'talk';
  if (path === 'board' || path === 'communicate') return 'communicate';
  if (path === 'practice') return 'practice';
  if (path === 'myday') return 'myDay';
  if (path === 'settings') return 'settings';
  if (path === 'about') return 'about';
  if (path === 'help') return 'help';
  if (path === 'accessibility') return 'accessibility';
  if (path === 'contact') return 'contact';
  if (path === 'privacy') return 'privacy';
  if (path === 'terms') return 'terms';
  if (path === 'design') return 'design';
  if (path === 'dev/sign-samples' || path === 'sign-lab') return 'signLab';
  if (path === 'dev/review' || path === 'review') return 'review';
  return '404';
}

export function App() {
  const { preferences, t } = useCommuniq();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isGrownUpsModalOpen, setIsGrownUpsModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync navigation with browser URL history without reloading
  const navigateTo = (screen: ScreenId) => {
    setCurrentScreen(screen);
    let newPath = '/';
    if (screen === 'talk' || screen === 'home') newPath = '/chat';
    else if (screen === 'communicate') newPath = '/board';
    else if (screen === 'signLab') newPath = '/dev/sign-samples';
    else if (screen === 'review') newPath = '/dev/review';
    else if (screen === '404') newPath = '/404';
    else newPath = `/${screen}`;

    if (window.location.pathname !== newPath && window.location.pathname !== '/' && (window.location.pathname !== '/chat' || newPath !== '/chat')) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentScreen(getInitialScreen());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // First run check: Open directly into Welcome Profile Modal
  if (!preferences.onboardingCompleted) {
    return (
      <AgeProfileModal
        isOpen={true}
        isFirstLaunch={true}
        onClose={() => {
          navigateTo('talk');
        }}
      />
    );
  }

  // Compute helper line based on current screen
  const screenMeta: Record<ScreenId, { title: string; helper: string }> = {
    home: {
      title: "Chat",
      helper: "Type what they said, or tap a reply."
    },
    talk: {
      title: "Chat",
      helper: "Type what they said, or tap a reply."
    },
    communicate: {
      title: "Board",
      helper: t.communicateInstruction || "Tap pictures to build a sentence."
    },
    practice: {
      title: t.practice || "Practice",
      helper: t.practiceInstruction || "Practice words and sentences at your own pace."
    },
    myDay: {
      title: t.myDay || "My Day",
      helper: t.myDayInstruction || "Review what you said and did today."
    },
    settings: {
      title: t.settings || "Settings",
      helper: t.settingsInstruction || "Adjust voices, display, and privacy."
    },
    about: {
      title: "About COMMUNIQ",
      helper: "Everyone deserves a voice."
    },
    help: {
      title: "Help & Guides",
      helper: "How to use COMMUNIQ offline and online."
    },
    accessibility: {
      title: "Accessibility",
      helper: "WCAG 2.1 Level AA conformance details."
    },
    contact: {
      title: "Contact",
      helper: "Reach out to the team."
    },
    signLab: {
      title: "Sign Lab",
      helper: "Collect gesture landmark samples locally."
    },
    review: {
      title: "Translation Review",
      helper: "Native speaker translation verification."
    },
    privacy: {
      title: t.privacy || "Privacy Policy",
      helper: "Your offline and data rights."
    },
    terms: {
      title: t.terms || "Terms of Use",
      helper: "Terms of service and ARASAAC attribution."
    },
    design: {
      title: "Design System",
      helper: "Component gallery in 3 interface modes."
    },
    404: {
      title: "Page Not Found",
      helper: "The requested screen was not found."
    }
  };

  const isMainSpace = currentScreen === 'talk' || currentScreen === 'communicate' || currentScreen === 'home';

  return (
    <div className="h-screen max-h-screen bg-[#FFF8EF] text-[#1F1B16] flex flex-col overflow-hidden selection:bg-[#0A6C6E] selection:text-white">
      {/* Universal Top Header (<= 48px height) */}
      <Header
        currentScreen={currentScreen}
        currentScreenName={screenMeta[currentScreen]?.title || 'Chat'}
        helperLine={screenMeta[currentScreen]?.helper}
        onNavigate={navigateTo}
        onOpenSettings={() => navigateTo('settings')}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {/* Main layout container with ZERO vertical page scroll on Chat & Board */}
      <div className="flex-1 flex flex-col w-full h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] overflow-hidden">
        <main
          className={`flex-1 w-full h-full overflow-hidden ${
            isMainSpace
              ? 'p-0'
              : 'p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto'
          }`}
        >
          {/* Missing Voice Warning Banner for auxiliary screens */}
          {!isMainSpace && <MissingVoiceBanner />}

          {/* Active Screen View */}
          {(currentScreen === 'talk' || currentScreen === 'home') && (
            <ChatPage
              onNavigateToBoard={() => navigateTo('communicate')}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onOpenSettings={() => navigateTo('settings')}
            />
          )}

          {currentScreen === 'communicate' && (
            <CommunicatePage initialCategoryId="all" />
          )}

          {currentScreen === 'practice' && <PracticePage />}
          {currentScreen === 'myDay' && <MyDayPage />}
          {currentScreen === 'settings' && (
            <SettingsPage
              onBack={() => navigateTo('talk')}
              onOpenGrownUps={() => setIsGrownUpsModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}
          {currentScreen === 'about' && <AboutPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'help' && <HelpPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'accessibility' && <AccessibilityPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'contact' && <ContactPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'signLab' && <SignLabPage />}
          {currentScreen === 'review' && <ReviewPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'privacy' && <PrivacyPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'terms' && <TermsPage onBack={() => navigateTo('talk')} />}
          {currentScreen === 'design' && <DesignShowcasePage onBack={() => navigateTo('talk')} />}
          {currentScreen === '404' && (
            <NotFoundPage
              onNavigateHome={() => navigateTo('talk')}
              onNavigateCommunicate={() => navigateTo('talk')}
              onNavigateHelp={() => navigateTo('help')}
            />
          )}

          {/* Footer on scrollable auxiliary pages */}
          {!isMainSpace && (
            <footer className="mt-12 pt-6 border-t-2 border-[#E5DACF] text-xs text-[#5E564D] pb-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#0A6C6E]">COMMUNIQ</span>
                  <span>•</span>
                  <span>{t.tagline}</span>
                </div>
                <p className="text-[11px] leading-tight text-[#5E564D] max-w-sm sm:text-right">
                  Pictographic symbols belong to the Government of Aragon, created by Sergio Palao for ARASAAC (http://www.arasaac.org), licensed under CC (BY-NC-SA) non-commercial.
                </p>
              </div>
            </footer>
          )}
        </main>
      </div>

      {/* Emergency & Grown-Ups & Profile Modals */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
      <GrownUpsModal
        isOpen={isGrownUpsModalOpen}
        onClose={() => setIsGrownUpsModalOpen(false)}
      />
      <AgeProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default App;
