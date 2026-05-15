import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { Landing } from './components/Landing';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from './i18n';

const MotionDebug = lazy(() => import('./components/MotionDebug'));

const isManualMotionRequired = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.has('forceMotionFallback')) return true;

  const isYandexBrowser = navigator.userAgent.includes('YaBrowser');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return isYandexBrowser && prefersReducedMotion;
};

const easeInOutCubic = (progress: number) => {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
};

const App: React.FC = () => {
  // Initialize view from URL hash
  const getInitialView = () => {
    return window.location.hash === '#landing' ? 'landing' : 'hero';
  };

  const [view, setView] = useState<'hero' | 'landing'>(getInitialView);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const vibrationActivated = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<HTMLDivElement | null>(null);
  const forwardArrowRef = useRef<SVGSVGElement | null>(null);
  const backwardArrowRef = useRef<SVGSVGElement | null>(null);
  const manualMotionEnabled = useRef(isManualMotionRequired());
  const trackPosition = useRef(view === 'landing' ? -window.innerWidth : 0);
  const trackAnimationFrame = useRef<number | null>(null);
  const stripeAnimationFrame = useRef<number | null>(null);
  const arrowAnimationFrame = useRef<number | null>(null);
  const motionDebugEnabled = useRef(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('motionDebug')
  );
  const [debugTouch, setDebugTouch] = useState('none');
  const { t } = useI18n();

  const minSwipeDistance = 70;

  // Sync view state with URL hash
  useEffect(() => {
    const newHash = view === 'landing' ? '#landing' : '';
    if (window.location.hash !== newHash) {
      const baseUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, '', newHash ? `${baseUrl}${newHash}` : baseUrl);
    }
  }, [view]);

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

  const setManualTrackPosition = (position: number) => {
    trackPosition.current = position;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${position}px, 0, 0)`;
    }
  };

  const animateManualTrack = (nextView: 'hero' | 'landing') => {
    if (!manualMotionEnabled.current) return;

    if (trackAnimationFrame.current !== null) {
      window.cancelAnimationFrame(trackAnimationFrame.current);
      trackAnimationFrame.current = null;
    }

    const target = nextView === 'landing' ? -window.innerWidth : 0;
    const start = trackPosition.current;
    const distance = target - start;
    const durationMs = 700;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const easedProgress = easeInOutCubic(progress);

      setManualTrackPosition(start + distance * easedProgress);

      if (progress < 1) {
        trackAnimationFrame.current = window.requestAnimationFrame(tick);
        return;
      }

      setManualTrackPosition(target);
      trackAnimationFrame.current = null;
    };

    trackAnimationFrame.current = window.requestAnimationFrame(tick);
  };

  const setViewWithMotion = (nextView: 'hero' | 'landing') => {
    if (nextView === view) return;

    animateManualTrack(nextView);
    setView(nextView);
  };

  const toggleView = () => {
    triggerHaptic();
    setViewWithMotion(view === 'hero' ? 'landing' : 'hero');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    activateVibration();
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    if (motionDebugEnabled.current) {
      setDebugTouch(`start x=${e.targetTouches[0].clientX.toFixed(1)}`);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
    if (motionDebugEnabled.current) {
      setDebugTouch(`move x=${e.targetTouches[0].clientX.toFixed(1)}`);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (motionDebugEnabled.current) {
      setDebugTouch(`end x=${touchEnd.current.toFixed(1)} distance=${distance.toFixed(1)} left=${isLeftSwipe} right=${isRightSwipe}`);
    }

    if (isLeftSwipe && view === 'hero') {
      triggerHaptic();
      setViewWithMotion('landing');
    }
    if (isRightSwipe && view === 'landing') {
      triggerHaptic();
      setViewWithMotion('hero');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && view === 'hero') {
        triggerHaptic();
        setViewWithMotion('landing');
      }
      if (e.key === 'ArrowLeft' && view === 'landing') {
        triggerHaptic();
        setViewWithMotion('hero');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  useEffect(() => {
    if (!manualMotionEnabled.current) return;

    setManualTrackPosition(view === 'landing' ? -window.innerWidth : 0);

    return () => {
      if (trackAnimationFrame.current !== null) {
        window.cancelAnimationFrame(trackAnimationFrame.current);
        trackAnimationFrame.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!manualMotionEnabled.current) return;

    const durationMs = 3000;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = ((now - startedAt) % durationMs) / durationMs;
      const position = 64 - 128 * easeInOutCubic(progress);

      if (stripeRef.current) {
        stripeRef.current.style.transform = `translate3d(${position}px, 0, 0)`;
      }

      stripeAnimationFrame.current = window.requestAnimationFrame(tick);
    };

    stripeAnimationFrame.current = window.requestAnimationFrame(tick);

    return () => {
      if (stripeAnimationFrame.current !== null) {
        window.cancelAnimationFrame(stripeAnimationFrame.current);
        stripeAnimationFrame.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!manualMotionEnabled.current) return;

    const durationMs = 2000;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = ((now - startedAt) % durationMs) / durationMs;
      const bounceProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      const offset = 4 * easeInOutCubic(bounceProgress);

      if (forwardArrowRef.current) {
        forwardArrowRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
      if (backwardArrowRef.current) {
        backwardArrowRef.current.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      arrowAnimationFrame.current = window.requestAnimationFrame(tick);
    };

    arrowAnimationFrame.current = window.requestAnimationFrame(tick);

    return () => {
      if (arrowAnimationFrame.current !== null) {
        window.cancelAnimationFrame(arrowAnimationFrame.current);
        arrowAnimationFrame.current = null;
      }
    };
  }, []);

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden bg-white text-[#121212]"
      onClick={activateVibration}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={trackRef}
        data-motion-track
        data-motion-mode={manualMotionEnabled.current ? 'manual' : 'css'}
        className={
          manualMotionEnabled.current
            ? 'motion-manual-track flex w-[200vw] h-full'
            : `flex w-[200vw] h-full transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                view === 'landing' ? '-translate-x-[100vw]' : 'translate-x-0'
              }`
        }
        style={
          manualMotionEnabled.current
            ? { transform: `translate3d(${trackPosition.current}px, 0, 0)` }
            : undefined
        }
      >
        {/* Main Hero Screen */}
        <div className="w-[100vw] h-full flex-shrink-0 relative">
          <Hero />

          {/* Mobile Swipe Guidance Indicator */}
          <div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-none">
            <div className="w-16 h-[3px] bg-white/15 rounded-full overflow-hidden">
              <div
                ref={stripeRef}
                className={`h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent ${
                  manualMotionEnabled.current ? 'swipe-guide-glint-manual' : 'animate-guide-swipe'
                }`}
              />
            </div>
          </div>

          {/* Glassmorphic Portfolio Navigation Handle */}
          <button
            onClick={toggleView}
            className="absolute right-0 top-0 h-full w-10 md:w-16 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-2xl border-l border-white/5 hover:bg-black/20 transition-all group overflow-hidden"
          >
            <div className="flex flex-col items-center gap-6 md:gap-8 group-hover:scale-110 transition-transform duration-300">
              <span className="[writing-mode:vertical-lr] font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-[9px] md:text-xs text-white/80">
                {t.hero.navForward}
              </span>
              <div className="relative">
                <ChevronRight
                  ref={forwardArrowRef}
                  data-forward-arrow
                  className={`w-4 h-4 md:w-5 md:h-5 text-white ${
                    manualMotionEnabled.current ? 'motion-arrow-manual' : 'animate-[bounce-x_2s_infinite]'
                  }`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Landing Page Content */}
        <div className="w-[100vw] h-full flex-shrink-0 relative bg-white flex overflow-hidden">
          {/* Glassmorphic Back handle */}
          <button
            onClick={toggleView}
            className="h-full w-10 md:w-16 flex-shrink-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-2xl border-r border-zinc-200/30 hover:bg-zinc-100/40 transition-all group"
          >
            <div className="flex flex-col items-center gap-6 md:gap-8 group-hover:scale-110 transition-transform duration-300">
              <ChevronLeft
                ref={backwardArrowRef}
                data-backward-arrow
                className={`w-4 h-4 md:w-5 md:h-5 text-black ${
                  manualMotionEnabled.current ? 'motion-arrow-manual' : 'animate-[bounce-x-reverse_2s_infinite]'
                }`}
              />
              <span className="[writing-mode:vertical-lr] rotate-180 font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-[9px] md:text-xs text-black/60">
                {t.landing.nav.back}
              </span>
            </div>
          </button>

          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <Landing onBack={toggleView} />
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
        .motion-manual-track {
          transition: none !important;
          will-change: transform;
          backface-visibility: hidden;
        }
        .swipe-guide-glint-manual {
          animation: none !important;
          will-change: transform;
          backface-visibility: hidden;
        }
        .motion-arrow-manual {
          animation: none !important;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>

      {motionDebugEnabled.current && (
        <Suspense fallback={null}>
          <MotionDebug
            view={view}
            lastTouch={debugTouch}
            trackRef={trackRef}
            stripeRef={stripeRef}
            forwardArrowRef={forwardArrowRef}
            backwardArrowRef={backwardArrowRef}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
