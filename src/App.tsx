import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { Landing } from './components/Landing';
import { HotelsLanding } from './components/HotelsLanding';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from './i18n';

type View = 'hero' | 'landing' | 'hotels';

const App: React.FC = () => {
  // Initialize view from URL path
  const getInitialView = (): View => {
    const path = window.location.pathname;
    if (path === '/landing' || path === '/en/landing') return 'landing';
    if (path === '/hotels' || path === '/en/hotels') return 'hotels';
    // Support hash fallback for backwards compatibility
    if (window.location.hash === '#landing') return 'landing';
    if (window.location.hash === '#hotels') return 'hotels';
    return 'hero';
  };

  const [view, setView] = useState<View>(getInitialView);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const vibrationActivated = useRef(false);
  const { t, lang } = useI18n();

  const minSwipeDistance = 70;

  // Sync view state with URL path using History API
  useEffect(() => {
    const basePath = lang === 'en' ? '/en' : '';
    const pathMap: Record<View, string> = {
      hero: basePath || '/',
      landing: `${basePath}/landing`,
      hotels: `${basePath}/hotels`
    };
    const newPath = pathMap[view];
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view }, '', newPath);
    }
  }, [view, lang]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const activateVibration = () => {
    if (!vibrationActivated.current && 'vibrate' in navigator) {
      navigator.vibrate(1);
      vibrationActivated.current = true;
    }
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const goToHero = () => {
    triggerHaptic();
    setView('hero');
  };

  const goToLanding = () => {
    triggerHaptic();
    setView('landing');
  };

  const goToHotels = () => {
    triggerHaptic();
    setView('hotels');
  };

  const toggleHeroLanding = () => {
    triggerHaptic();
    setView(prev => (prev === 'hero' ? 'landing' : 'hero'));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    activateVibration();
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Navigation: hero <-> landing <-> hotels
    if (isLeftSwipe) {
      if (view === 'hero') {
        triggerHaptic();
        setView('landing');
      } else if (view === 'landing') {
        triggerHaptic();
        setView('hotels');
      }
    }
    if (isRightSwipe) {
      if (view === 'landing') {
        triggerHaptic();
        setView('hero');
      } else if (view === 'hotels') {
        triggerHaptic();
        setView('landing');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (view === 'hero') {
          triggerHaptic();
          setView('landing');
        } else if (view === 'landing') {
          triggerHaptic();
          setView('hotels');
        }
      }
      if (e.key === 'ArrowLeft') {
        if (view === 'landing') {
          triggerHaptic();
          setView('hero');
        } else if (view === 'hotels') {
          triggerHaptic();
          setView('landing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const translateClass = {
    hero: 'translate-x-0',
    landing: '-translate-x-[100vw]',
    hotels: '-translate-x-[200vw]'
  };

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden bg-white text-[#121212]"
      onClick={activateVibration}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`flex w-[300vw] h-full transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${translateClass[view]}`}
      >
        {/* Main Hero Screen */}
        <div className="w-[100vw] h-full flex-shrink-0 relative">
          <Hero />

          {/* Mobile Swipe Guidance Indicator */}
          <div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-none">
            <div className="w-16 h-[1.5px] bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-guide-swipe" />
            </div>
          </div>

          {/* Glassmorphic Portfolio Navigation Handle */}
          <button
            onClick={goToLanding}
            className="absolute right-0 top-0 h-full w-10 md:w-16 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-2xl border-l border-white/5 hover:bg-black/20 transition-all group overflow-hidden"
          >
            <div className="flex flex-col items-center gap-6 md:gap-8 group-hover:scale-110 transition-transform duration-300">
              <span className="[writing-mode:vertical-lr] font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-[9px] md:text-xs text-white/80">
                {t.hero.navForward}
              </span>
              <div className="relative">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white animate-[bounce-x_2s_infinite]" />
              </div>
            </div>
          </button>
        </div>

        {/* Landing Page Content */}
        <div className="w-[100vw] h-full flex-shrink-0 relative bg-white flex overflow-hidden">
          {/* Glassmorphic Back handle */}
          <button
            onClick={goToHero}
            className="h-full w-10 md:w-16 flex-shrink-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-2xl border-r border-zinc-200/30 hover:bg-zinc-100/40 transition-all group"
          >
            <div className="flex flex-col items-center gap-6 md:gap-8 group-hover:scale-110 transition-transform duration-300">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-black animate-[bounce-x-reverse_2s_infinite]" />
              <span className="[writing-mode:vertical-lr] rotate-180 font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-[9px] md:text-xs text-black/60">
                {t.landing.nav.back}
              </span>
            </div>
          </button>

          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
             <Landing onBack={goToHero} onGoToHotels={goToHotels} />
          </div>
        </div>

        {/* Hotels Page Content */}
        <div className="w-[100vw] h-full flex-shrink-0 relative bg-white flex overflow-hidden">
          {/* Glassmorphic Back handle */}
          <button
            onClick={goToLanding}
            className="h-full w-10 md:w-16 flex-shrink-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-2xl border-r border-zinc-200/30 hover:bg-zinc-100/40 transition-all group"
          >
            <div className="flex flex-col items-center gap-6 md:gap-8 group-hover:scale-110 transition-transform duration-300">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-black animate-[bounce-x-reverse_2s_infinite]" />
              <span className="[writing-mode:vertical-lr] rotate-180 font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-[9px] md:text-xs text-black/60">
                {t.landing.nav.back}
              </span>
            </div>
          </button>

          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
             <HotelsLanding onBack={goToLanding} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes bounce-x-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes guide-swipe {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-guide-swipe {
          animation: guide-swipe 3s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
