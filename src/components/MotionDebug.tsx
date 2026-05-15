import React, { useEffect, useRef, useState } from 'react';

type ViewName = 'hero' | 'landing';

type MotionDebugProps = {
  view: ViewName;
  lastTouch: string;
  trackRef: React.RefObject<HTMLDivElement | null>;
  stripeRef: React.RefObject<HTMLDivElement | null>;
  forwardArrowRef: React.RefObject<SVGSVGElement | null>;
  backwardArrowRef: React.RefObject<SVGSVGElement | null>;
};

type MotionSample = {
  viewport: string;
  reducedMotion: boolean;
  hash: string;
  trackLeft: string;
  trackTransform: string;
  trackTranslate: string;
  trackTransition: string;
  stripeTransform: string;
  stripeAnimation: string;
  forwardArrowTransform: string;
  backwardArrowTransform: string;
  pageLoad: string;
};

type MotionTrace = {
  status: 'idle' | 'recording' | 'done';
  label: string;
  frameCount: number;
  distinctTrackLeftCount: number;
  distinctStripeTransformCount: number;
  maxFrameGapMs: number;
  firstTrackLeft: string;
  lastTrackLeft: string;
  preview: string[];
};

type MotionDebugState = {
  ua: string;
  sample: MotionSample;
  trace: MotionTrace;
  logs: string[];
};

const emptySample: MotionSample = {
  viewport: 'n/a',
  reducedMotion: false,
  hash: '',
  trackLeft: 'n/a',
  trackTransform: 'n/a',
  trackTranslate: 'n/a',
  trackTransition: 'n/a',
  stripeTransform: 'n/a',
  stripeAnimation: 'n/a',
  forwardArrowTransform: 'n/a',
  backwardArrowTransform: 'n/a',
  pageLoad: 'n/a',
};

const emptyTrace: MotionTrace = {
  status: 'idle',
  label: 'none',
  frameCount: 0,
  distinctTrackLeftCount: 0,
  distinctStripeTransformCount: 0,
  maxFrameGapMs: 0,
  firstTrackLeft: 'n/a',
  lastTrackLeft: 'n/a',
  preview: [],
};

const getPageLoad = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navigation) return 'missing';

  return [
    `ttfb=${Math.round(navigation.responseStart)}ms`,
    `dom=${Math.round(navigation.domContentLoadedEventEnd)}ms`,
    `load=${Math.round(navigation.loadEventEnd)}ms`,
  ].join(' ');
};

export default function MotionDebug({
  view,
  lastTouch,
  trackRef,
  stripeRef,
  forwardArrowRef,
  backwardArrowRef,
}: MotionDebugProps) {
  const traceActive = useRef(false);
  const [state, setState] = useState<MotionDebugState>(() => ({
    ua: navigator.userAgent,
    sample: emptySample,
    trace: emptyTrace,
    logs: [],
  }));

  const appendLog = (message: string) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    setState(prev => ({
      ...prev,
      logs: [`${timestamp} ${message}`, ...prev.logs].slice(0, 12),
    }));
  };

  const collectSample = (): MotionSample => {
    const trackStyle = trackRef.current ? window.getComputedStyle(trackRef.current) : null;
    const stripeStyle = stripeRef.current ? window.getComputedStyle(stripeRef.current) : null;
    const forwardArrowStyle = forwardArrowRef.current ? window.getComputedStyle(forwardArrowRef.current) : null;
    const backwardArrowStyle = backwardArrowRef.current ? window.getComputedStyle(backwardArrowRef.current) : null;
    const trackRect = trackRef.current?.getBoundingClientRect();

    return {
      viewport: `${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}`,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hash: window.location.hash || '(empty)',
      trackLeft: trackRect ? `${trackRect.left.toFixed(2)}px` : 'missing',
      trackTransform: trackStyle?.transform || 'missing',
      trackTranslate: trackStyle?.translate || 'missing',
      trackTransition: trackStyle
        ? `${trackStyle.transitionProperty} | ${trackStyle.transitionDuration} | ${trackStyle.transitionTimingFunction}`
        : 'missing',
      stripeTransform: stripeStyle?.transform || 'missing',
      stripeAnimation: stripeStyle
        ? `${stripeStyle.animationName} | ${stripeStyle.animationDuration} | ${stripeStyle.animationPlayState}`
        : 'missing',
      forwardArrowTransform: forwardArrowStyle?.transform || 'missing',
      backwardArrowTransform: backwardArrowStyle?.transform || 'missing',
      pageLoad: getPageLoad(),
    };
  };

  const startTrace = (label: string) => {
    if (traceActive.current) return;

    traceActive.current = true;
    appendLog(`trace start ${label}`);
    setState(prev => ({
      ...prev,
      trace: { ...emptyTrace, status: 'recording', label },
    }));

    const startedAt = performance.now();
    const points: Array<{ t: number; trackLeft: string; stripeTransform: string }> = [];

    const tick = (now: number) => {
      const sample = collectSample();
      points.push({
        t: Math.round(now - startedAt),
        trackLeft: sample.trackLeft,
        stripeTransform: sample.stripeTransform,
      });

      if (now - startedAt < 950) {
        window.requestAnimationFrame(tick);
        return;
      }

      const frameGaps = points.slice(1).map((point, index) => point.t - points[index].t);
      const trace = {
        status: 'done' as const,
        label,
        frameCount: points.length,
        distinctTrackLeftCount: new Set(points.map(point => point.trackLeft)).size,
        distinctStripeTransformCount: new Set(points.map(point => point.stripeTransform)).size,
        maxFrameGapMs: frameGaps.length ? Math.max(...frameGaps) : 0,
        firstTrackLeft: points[0]?.trackLeft || 'n/a',
        lastTrackLeft: points.at(-1)?.trackLeft || 'n/a',
        preview: points
          .filter((_, index) => index < 6 || index >= Math.max(points.length - 4, 6))
          .map(point => `${point.t}ms track=${point.trackLeft} stripe=${point.stripeTransform}`),
      };

      setState(prev => ({
        ...prev,
        sample: collectSample(),
        trace,
      }));
      appendLog(`trace done ${label} frames=${points.length}`);
      traceActive.current = false;
    };

    window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    appendLog('motion-debug mounted');
    setState(prev => ({ ...prev, sample: collectSample() }));

    const intervalId = window.setInterval(() => {
      setState(prev => ({ ...prev, sample: collectSample() }));
    }, 250);

    const track = trackRef.current;
    const stripe = stripeRef.current;
    const cleanups: Array<() => void> = [];

    const register = (node: Element | null, eventName: string, label: string) => {
      if (!node) return;
      const handler = () => appendLog(`${label}:${eventName}`);
      node.addEventListener(eventName, handler);
      cleanups.push(() => node.removeEventListener(eventName, handler));
    };

    ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'].forEach(eventName => {
      register(track, eventName, 'track');
    });
    ['animationstart', 'animationiteration', 'animationcancel'].forEach(eventName => {
      register(stripe, eventName, 'stripe');
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setState(prev => ({ ...prev, sample: collectSample() }));
    startTrace(`view=${view}`);
  }, [view]);

  const copyDebug = async () => {
    const payload = JSON.stringify(
      {
        view,
        lastTouch,
        ua: state.ua,
        sample: collectSample(),
        trace: state.trace,
        logs: state.logs,
      },
      null,
      2
    );

    await navigator.clipboard?.writeText(payload);
    appendLog('debug copied');
  };

  return (
    <div
      data-motion-debug-panel
      className="fixed inset-x-2 bottom-2 z-[999] max-h-[48svh] overflow-y-auto rounded-2xl bg-black/90 p-3 text-[10px] leading-relaxed text-white shadow-2xl"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <strong className="text-[11px] uppercase tracking-[0.18em] text-white/90">Motion Debug</strong>
        <button
          type="button"
          onClick={copyDebug}
          className="pointer-events-auto rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85"
        >
          Copy
        </button>
      </div>
      <div>view: {view}</div>
      <div>lastTouch: {lastTouch}</div>
      <div>viewport: {state.sample.viewport}</div>
      <div>reducedMotion: {String(state.sample.reducedMotion)}</div>
      <div>hash: {state.sample.hash}</div>
      <div>trackLeft: {state.sample.trackLeft}</div>
      <div>trackTransform: {state.sample.trackTransform}</div>
      <div>trackTranslate: {state.sample.trackTranslate}</div>
      <div>trackTransition: {state.sample.trackTransition}</div>
      <div>stripeTransform: {state.sample.stripeTransform}</div>
      <div>stripeAnimation: {state.sample.stripeAnimation}</div>
      <div>forwardArrow: {state.sample.forwardArrowTransform}</div>
      <div>backArrow: {state.sample.backwardArrowTransform}</div>
      <div>pageLoad: {state.sample.pageLoad}</div>

      <div className="mt-2 border-t border-white/10 pt-2">
        <div>traceStatus: {state.trace.status}</div>
        <div>traceLabel: {state.trace.label}</div>
        <div>traceFrames: {state.trace.frameCount}</div>
        <div>distinctTrackLeft: {state.trace.distinctTrackLeftCount}</div>
        <div>distinctStripe: {state.trace.distinctStripeTransformCount}</div>
        <div>maxFrameGapMs: {state.trace.maxFrameGapMs}</div>
        <div>traceFirstTrack: {state.trace.firstTrackLeft}</div>
        <div>traceLastTrack: {state.trace.lastTrackLeft}</div>
      </div>

      <div className="mt-2 break-all text-white/60">ua: {state.ua}</div>

      <div className="mt-2 border-t border-white/10 pt-2 text-white/60">
        {state.trace.preview.map(line => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <div className="mt-2 border-t border-white/10 pt-2 text-white/75">
        {state.logs.map(log => (
          <div key={log}>{log}</div>
        ))}
      </div>
    </div>
  );
}
