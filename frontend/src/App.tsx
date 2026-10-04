import { useState, useEffect } from 'react';
import { useCommuniq } from './hooks/useCommuniq';
import { Header } from './components/Header';
import { Navigation, ScreenId } from './components/Navigation';
import { QuickNeedsBar } from './components/QuickNeedsBar';
import { EmergencyModal } from './components/EmergencyModal';
import { MissingVoiceBanner } from './components/MissingVoiceBanner';
import { OnboardingFlow } from './components/OnboardingFlow';

import { HomePage } from './pages/HomePage';
import { CommunicatePage } from './pages/CommunicatePage';
import { TalkPage } from './pages/TalkPage';
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
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === '' || path === 'home') return 'home';
  if (path === 'communicate') return 'communicate';
  if (path === 'talk') return 'talk';
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
  const { preferences, userMode, t } = useCommuniq();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [communicateNavParams, setCommunicateNavParams] = useState<{ categoryId?: string; assetId?: string }>({});

  // Sync navigation with browser URL history without reloading
  const navigateTo = (screen: ScreenId) => {
    setCurrentScreen(screen);
    let newPath = '/';
    if (screen === 'home') newPath = '/';
    else if (screen === 'signLab') newPath = '/dev/sign-samples';
    else if (screen === 'review') newPath = '/dev/review';
    else if (screen === '404') newPath = '/404';
    else newPath = `/${screen}`;

    if (window.location.pathname !== newPath) {
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

  // First run check: Open directly into Language and Age Selection
  if (!preferences.onboardingCompleted) {
    return (
      <OnboardingFlow
        onComplete={() => {
          navigateTo('home');
        }}
      />
    );
  }

  // Compute helper line based on current screen
  const screenMeta: Record<ScreenId, { title: string; helper: string }> = {
    home: {
      title: t.home,
      helper: userMode === 'child' ? t.helperWhatShouldITap : userMode === 'student' ? t.helperWhatCanISay : t.helperWhereAmI
    },
    communicate: {
      title: t.communicate,
      helper: t.helperWhatShouldITap
    },
    talk: {
      title: t.talk,
      helper: t.talkWithSomeoneDesc
    },
    practice: {
      title: t.practice,
      helper: t.helperWhatCanISay
    },
    myDay: {
      title: t.myDay,
      helper: t.myDayDesc
    },
    settings: {
      title: t.settings,
      helper: t.settingsDesc
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
      title: t.privacy,
      helper: "Your offline and data rights."
    },
    terms: {
      title: t.terms,
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

  const handleNavigateToCommunicateWithItem = (categoryId?: string, assetId?: string) => {
    setCommunicateNavParams({ categoryId, assetId });
    navigateTo('communicate');
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#1F1B16] flex flex-col selection:bg-[#0A6C6E] selection:text-white">
      {/* Universal Top Header */}
      <Header
        currentScreenName={screenMeta[currentScreen]?.title || t.home}
        helperLine={screenMeta[currentScreen]?.helper}
        onOpenSettings={() => navigateTo('settings')}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onNavigateHome={() => navigateTo('home')}
      />

      {/* Main layout container with responsive desktop sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={(scr) => {
            if (scr === 'communicate') {
              setCommunicateNavParams({});
            }
            navigateTo(scr);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          {/* Missing Voice Warning Banner */}
          <MissingVoiceBanner />

          {/* Active Screen View */}
          {currentScreen === 'home' && (
            <HomePage
              onNavigateToCommunicate={handleNavigateToCommunicateWithItem}
              onNavigateToTalk={() => navigateTo('talk')}
            />
          )}

          {currentScreen === 'communicate' && (
            <CommunicatePage
              initialCategoryId={communicateNavParams.categoryId || 'food_drink'}
              initialAssetId={communicateNavParams.assetId}
            />
          )}

          {currentScreen === 'talk' && (
            <TalkPage onNavigateToTab={(tab) => navigateTo(tab as ScreenId)} />
          )}

          {currentScreen === 'practice' && (
            <PracticePage />
          )}

          {currentScreen === 'myDay' && (
            <MyDayPage />
          )}

          {currentScreen === 'settings' && (
            <SettingsPage />
          )}

          {currentScreen === 'about' && (
            <AboutPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'help' && (
            <HelpPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'accessibility' && (
            <AccessibilityPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'contact' && (
            <ContactPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'signLab' && (
            <SignLabPage />
          )}

          {currentScreen === 'review' && (
            <ReviewPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'privacy' && (
            <PrivacyPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'terms' && (
            <TermsPage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === 'design' && (
            <DesignShowcasePage onBack={() => navigateTo('home')} />
          )}

          {currentScreen === '404' && (
            <NotFoundPage
              onNavigateHome={() => navigateTo('home')}
              onNavigateCommunicate={() => navigateTo('communicate')}
              onNavigateHelp={() => navigateTo('help')}
            />
          )}
        </main>
      </div>

      {/* Child mode permanent bottom Quick Needs bar */}
      {userMode === 'child' && (
        <QuickNeedsBar />
      )}

      {/* Emergency modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Global clean footer */}
      <footer className={`bg-white border-t-2 border-[#E5DACF] p-5 text-center text-xs text-[#5E564D] ${
        userMode === 'child' ? 'mb-[160px] md:mb-0' : 'mb-[64px] md:mb-0'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#0A6C6E]">COMMUNIQ</span>
            <span>•</span>
            <span>{t.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-bold">
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => navigateTo('help')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Help
            </button>
            <button
              type="button"
              onClick={() => navigateTo('accessibility')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Accessibility
            </button>
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => navigateTo('privacy')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              {t.privacy}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('terms')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              {t.terms}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('design')}
              className="hover:underline hover:text-[#0A6C6E]"
            >
              Design Gallery
            </button>
          </div>

          <p className="text-[11px] leading-tight text-[#5E564D] max-w-sm sm:text-right">
            Pictographic symbols used are property of Aragon Government and created by Sergio Palao for ARASAAC (http://www.arasaac.org), licensed under CC (BY-NC-SA).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
