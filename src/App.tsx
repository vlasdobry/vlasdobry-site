import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { Landing } from './components/Landing';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from './i18n';

type MotionDebugSample = {
  viewport: string;
  reducedMotion: boolean;
  trackLeft: string;
  trackTransform: string;
  trackTransition: string;
  stripeTransform: string;
  stripeAnimation: string;
  arrowTransform: string;
  arrowAnimation: string;
  backwardArrowTransform: string;
};

type MotionDebugState = {
  ua: string;
  view: 'hero' | 'landing';
  lastTouch: string;
  sample: MotionDebugSample;
  logs: string[];
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
  const motionDebugEnabled = useRef(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('motionDebug')
  );
  const { t } = useI18n();

  const minSwipeDistance = 70;
  const [motionDebug, setMotionDebug] = useState<MotionDebugState>(() => ({
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    view: getInitialView(),
    lastTouch: 'none',
    sample: {
      viewport: 'n/a',
      reducedMotion: false,
      trackLeft: 'n/a',
      trackTransform: 'n/a',
      trackTransition: 'n/a',
      stripeTransform: 'n/a',
      stripeAnimation: 'n/a',
      arrowTransform: 'n/a',
      arrowAnimation: 'n/a',
      backwardArrowTransform: 'n/a',
    },
    logs: [],
  }));

  const appendMotionLog = (message: string) => {
    if (!motionDebugEnabled.current) return;

    const timestamp = new Date().toISOString().slice(11, 19);
    setMotionDebug(prev => ({
      ...prev,
      logs: [`${timestamp} ${message}`, ...prev.logs].slice(0, 10),
    }));
  };

  const collectMotionSample = (): MotionDebugSample => {
    const trackStyle = trackRef.current ? window.getComputedStyle(trackRef.current) : null;
    const stripeStyle = stripeRef.current ? window.getComputedStyle(stripeRef.current) : null;
    const arrowStyle = forwardArrowRef.current ? window.getComputedStyle(forwardArrowRef.current) : null;
    const backwardArrowStyle = backwardArrowRef.current ? window.getComputedStyle(backwardArrowRef.current) : null;
    const trackRect = trackRef.current?.getBoundingClientRect();

    return {
      viewport: `${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}`,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      trackLeft: trackRect ? `${trackRect.left.toFixed(2)}px` : 'missing',
      trackTransform: trackStyle?.transform || 'missing',
      trackTransition: trackStyle
        ? `${trackStyle.transitionProperty} | ${trackStyle.transitionDuration} | ${trackStyle.transitionTimingFunction}`
        : 'missing',
      stripeTransform: stripeStyle?.transform || 'missing',
      stripeAnimation: stripeStyle
        ? `${stripeStyle.animationName} | ${stripeStyle.animationDuration} | ${stripeStyle.animationPlayState}`
        : 'missing',
      arrowTransform: arrowStyle?.transform || 'missing',
      arrowAnimation: arrowStyle
        ? `${arrowStyle.animationName} | ${arrowStyle.animationDuration} | ${arrowStyle.animationPlayState}`
        : 'missing',
      backwardArrowTransform: backwardArrowStyle?.transform || 'missing',
    };
  };

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

  const toggleView = () => {
    triggerHaptic();
    setView(prev => (prev === 'hero' ? 'landing' : 'hero'));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    activateVibration();
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    if (motionDebugEnabled.current) {
      setMotionDebug(prev => ({
        ...prev,
        lastTouch: `start ${e.targetTouches[0].clientX.toFixed(1)}`,
      }));
      appendMotionLog(`touchstart x=${e.targetTouches[0].clientX.toFixed(1)}`);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
    if (motionDebugEnabled.current) {
      setMotionDebug(prev => ({
        ...prev,
        lastTouch: `move ${e.targetTouches[0].clientX.toFixed(1)}`,
      }));
    }
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (motionDebugEnabled.current) {
      setMotionDebug(prev => ({
        ...prev,
        lastTouch: `end ${touchEnd.current.toFixed(1)} | distance ${distance.toFixed(1)}`,
      }));
      appendMotionLog(`touchend distance=${distance.toFixed(1)} left=${isLeftSwipe} right=${isRightSwipe}`);
    }

    if (isLeftSwipe && view === 'hero') {
      triggerHaptic();
      setView('landing');
    }
    if (isRightSwipe && view === 'landing') {
      triggerHaptic();
      setView('hero');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && view === 'hero') {
        triggerHaptic();
        setView('landing');
      }
      if (e.key === 'ArrowLeft' && view === 'landing') {
        triggerHaptic();
        setView('hero');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  useEffect(() => {
    if (!motionDebugEnabled.current) return;

    setMotionDebug(prev => ({
      ...prev,
      view,
      sample: collectMotionSample(),
    }));
  }, [view]);

  useEffect(() => {
    if (!motionDebugEnabled.current) return;

    const track = trackRef.current;
    const stripe = stripeRef.current;
    const forwardArrow = forwardArrowRef.current;
    const backwardArrow = backwardArrowRef.current;

    const cleanups: Array<() => void> = [];
    const registerEvent = (
      node: HTMLElement | SVGElement | null,
      name: string,
      label: string
    ) => {
      if (!node) return;
      const handler = () => appendMotionLog(`${label}:${name}`);
      node.addEventListener(name, handler);
      cleanups.push(() => node.removeEventListener(name, handler));
    };

    ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'].forEach(eventName => {
      registerEvent(track, eventName, 'track');
    });

    ['animationstart', 'animationiteration', 'animationcancel'].forEach(eventName => {
      registerEvent(stripe, eventName, 'stripe');
      registerEvent(forwardArrow, eventName, 'arrow');
      registerEvent(backwardArrow, eventName, 'back-arrow');
    });

    const intervalId = window.setInterval(() => {
      setMotionDebug(prev => ({
        ...prev,
        view,
        sample: collectMotionSample(),
      }));
    }, 250);

    appendMotionLog('motion-debug mounted');

    return () => {
      cleanups.forEach(cleanup => cleanup());
      window.clearInterval(intervalId);
    };
  }, [view]);

  const copyMotionDebug = async () => {
    if (!motionDebugEnabled.current || !navigator.clipboard) return;

    const payload = JSON.stringify(
      {
        ...motionDebug,
        view,
        sample: collectMotionSample(),
      },
      null,
      2
    );

    await navigator.clipboard.writeText(payload);
    appendMotionLog('debug copied');
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
        ref={trackRef}
        className={`flex w-[200vw] h-full transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          view === 'landing' ? '-translate-x-[100vw]' : 'translate-x-0'
        }`}
      >
        {/* Main Hero Screen */}
        <div className="w-[100vw] h-full flex-shrink-0 relative">
          <Hero />

          {/* Mobile Swipe Guidance Indicator */}
          <div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-none">
            <div className="w-16 h-[3px] bg-white/15 rounded-full overflow-hidden">
                <div
                  ref={stripeRef}
                  className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-guide-swipe"
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
                  className="w-4 h-4 md:w-5 md:h-5 text-white animate-[bounce-x_2s_infinite]"
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
                className="w-4 h-4 md:w-5 md:h-5 text-black animate-[bounce-x-reverse_2s_infinite]"
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
      `}</style>

      {motionDebugEnabled.current && (
        <div className="fixed inset-x-2 bottom-2 z-[999] max-h-[45svh] overflow-y-auto rounded-2xl bg-black/88 p-3 text-[10px] leading-relaxed text-white shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <strong className="text-[11px] uppercase tracking-[0.18em] text-white/90">Motion Debug</strong>
            <button
              type="button"
              onClick={copyMotionDebug}
              className="pointer-events-auto rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85"
            >
              Copy
            </button>
          </div>
          <div>view: {view}</div>
          <div>lastTouch: {motionDebug.lastTouch}</div>
          <div>viewport: {motionDebug.sample.viewport}</div>
          <div>reducedMotion: {String(motionDebug.sample.reducedMotion)}</div>
          <div>trackLeft: {motionDebug.sample.trackLeft}</div>
          <div>trackTransform: {motionDebug.sample.trackTransform}</div>
          <div>trackTransition: {motionDebug.sample.trackTransition}</div>
          <div>stripeTransform: {motionDebug.sample.stripeTransform}</div>
          <div>stripeAnimation: {motionDebug.sample.stripeAnimation}</div>
          <div>arrowTransform: {motionDebug.sample.arrowTransform}</div>
          <div>arrowAnimation: {motionDebug.sample.arrowAnimation}</div>
          <div>backArrowTransform: {motionDebug.sample.backwardArrowTransform}</div>
          <div className="mt-2 break-all text-white/60">ua: {motionDebug.ua}</div>
          <div className="mt-2 border-t border-white/10 pt-2 text-white/75">
            {motionDebug.logs.map(log => (
              <div key={log}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
