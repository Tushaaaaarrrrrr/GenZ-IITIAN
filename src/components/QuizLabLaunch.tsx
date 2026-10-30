import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Lightbulb, Timer, Trophy, Volume2, VolumeX, X } from 'lucide-react';

/**
 * Quiz Lab launch surprise.
 *  1) First visit: full-screen "mystery box shuffle" surprise.
 *  2) Every visit after: a small corner box that opens a mini card.
 * Self-contained: pure CSS keyframes + React state, no extra libraries.
 * To see the full-screen version again: localStorage.removeItem('quizlab-launch-seen-v1')
 */

const STORAGE_KEY = 'quizlab-launch-seen-v1';
const QUIZ_URL = 'https://quiz.genziitian.in/';
const LOGO_SRC = '/quiz-lab-logo.webp';

type Phase = 'intro' | 'shuffle' | 'pick' | 'pop' | 'reveal' | 'closing';
const cv = (o: Record<string, string | number>) => o as React.CSSProperties;

const readSeen = () => {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
};
const writeSeen = () => {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* storage unavailable */ }
};
const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// deterministic PRNG so the decorative layout is stable
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};


/* SFX START ---------------------------------------------------------- */
// Tiny synthesized sound effects (Web Audio API, no audio files, no libraries).
// Browsers only allow audio after the user has interacted with the page, so sounds that fire
// before the first tap/key press are silently skipped.
const SOUND_KEY = 'quizlab-launch-sound-v1';
let actx: AudioContext | null = null;
let outNode: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let gestureSeen = false;
let unlockBound = false;

const soundOn = () => {
  try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
};
const setSoundOn = (on: boolean) => {
  try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
};

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined' || !soundOn()) return null;
  const activated = gestureSeen || !!(navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
  if (!activated) return null;
  try {
    if (!actx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      const comp = actx.createDynamicsCompressor();
      outNode = actx.createGain();
      outNode.gain.value = 0.6;
      outNode.connect(comp); comp.connect(actx.destination);
    }
    if (actx.state === 'suspended') void actx.resume().catch(() => undefined);
    return actx.state === 'running' ? actx : null;
  } catch { return null; }
};

const bindAudioUnlock = () => {
  if (unlockBound || typeof window === 'undefined') return;
  unlockBound = true;
  const unlock = () => { gestureSeen = true; getCtx(); };
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true, passive: true });
};

type ToneOpts = { f: number; f2?: number; t: number; d: number; v?: number; type?: OscillatorType };
const tone = (c: AudioContext, o: ToneOpts) => {
  const osc = c.createOscillator(); const g = c.createGain();
  const v = o.v ?? 0.2; const t = c.currentTime + o.t;
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.012, o.d / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
  osc.connect(g); g.connect(outNode!);
  osc.start(t); osc.stop(t + o.d + 0.03);
};

type NoiseOpts = { t: number; d: number; v?: number; f1: number; f2?: number; q?: number; type?: BiquadFilterType };
const noise = (c: AudioContext, o: NoiseOpts) => {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = c.createBiquadFilter(); f.type = o.type ?? 'bandpass'; f.Q.value = o.q ?? 1.2;
  const g = c.createGain(); const t = c.currentTime + o.t; const v = o.v ?? 0.2;
  f.frequency.setValueAtTime(o.f1, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.03, o.d / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
  src.connect(f); f.connect(g); g.connect(outNode!);
  src.start(t); src.stop(t + o.d + 0.03);
};

const play = (fn: (c: AudioContext, d: number) => void) => (delay = 0) => {
  try { const c = getCtx(); if (c) fn(c, delay); } catch { /* audio is optional */ }
};

const sfx = {
  pop: play((c, d) => { tone(c, { f: 560, f2: 190, t: d, d: 0.1, v: 0.32 }); noise(c, { t: d, d: 0.04, v: 0.08, f1: 3000, type: 'highpass' }); }),
  tick: play((c, d) => tone(c, { f: 900, f2: 700, t: d, d: 0.05, v: 0.12, type: 'triangle' })),
  whoosh: play((c, d) => noise(c, { t: d, d: 0.52, v: 0.22, f1: 350, f2: 2600, q: 0.9 })),
  down: play((c, d) => noise(c, { t: d, d: 0.5, v: 0.2, f1: 2400, f2: 260, q: 0.9 })),
  shimmer: play((c, d) => { [784, 988, 1175, 1568].forEach((f, i) => tone(c, { f, t: d + i * 0.07, d: 0.35, v: 0.1, type: 'sine' })); }),
  boom: play((c, d) => { tone(c, { f: 150, f2: 42, t: d, d: 0.55, v: 0.6 }); noise(c, { t: d, d: 0.4, v: 0.3, f1: 1400, f2: 180, type: 'lowpass', q: 0.7 }); }),
  sparkle: play((c, d) => {
    [1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(c, { f, t: d + i * 0.055, d: 0.26, v: 0.11, type: 'triangle' }));
    noise(c, { t: d, d: 0.25, v: 0.1, f1: 5000, type: 'highpass' });
  }),
  chime: play((c, d) => { [523, 659, 784, 1047].forEach((f, i) => { tone(c, { f, t: d + i * 0.09, d: 1.0, v: 0.17 }); tone(c, { f: f * 2, t: d + i * 0.09, d: 0.5, v: 0.05, type: 'triangle' }); }); }),
  slap: play((c, d) => { noise(c, { t: d, d: 0.08, v: 0.3, f1: 1600, q: 0.8 }); tone(c, { f: 210, f2: 70, t: d, d: 0.09, v: 0.22, type: 'square' }); }),
};
/* SFX END ------------------------------------------------------------ */

const CONFETTI = ['#34d399', '#10b981', '#60a5fa', '#2563eb', '#f6a623', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c', '#ffffff'];

/* ------------------------------------------------------------------ */
/* Gift boxes (pure CSS)                                               */
/* ------------------------------------------------------------------ */
type GiftCfg = { c1: string; c2: string; rb: string; special?: boolean };
const GIFTS: GiftCfg[] = [
  { c1: '#60a5fa', c2: '#2563eb', rb: '#fde68a' },
  { c1: '#fbbf24', c2: '#d97706', rb: '#ffffff' },
  { c1: '#6ee7b7', c2: '#10b981', rb: '#ecfdf5', special: true },
  { c1: '#fb923c', c2: '#ef4444', rb: '#ffffff' },
  { c1: '#a78bfa', c2: '#7c3aed', rb: '#fef3c7' },
];

function Gift({ cfg, className = '' }: { cfg: GiftCfg; className?: string }) {
  return (
    <span className={`qll-gift ${cfg.special ? 'qll-gift--special' : ''} ${className}`} style={cv({ '--c1': cfg.c1, '--c2': cfg.c2, '--rb': cfg.rb })}>
      <span className="qll-gift-body"><i className="qll-rib" /></span>
      <span className="qll-gift-lid">
        <i className="qll-rib" />
        <i className="qll-bow"><b className="l" /><b className="r" /><b className="k" /></i>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Decorative pieces                                                   */
/* ------------------------------------------------------------------ */
type SymKind = 'A' | 'B' | 'C' | 'D' | 'q' | 'check' | 'bulb' | 'trophy' | 'timer' | 'xp';
const CLUSTERS: { cls: string; delay: number; pts: [number, number, SymKind][] }[] = [
  { cls: 'c1', delay: 0.5, pts: [[12, 72, 'A'], [38, 40, 'q'], [66, 60, 'bulb'], [88, 22, 'xp']] },
  { cls: 'c2', delay: 0.8, pts: [[14, 28, 'B'], [42, 66, 'check'], [74, 36, 'trophy'], [84, 86, 'C']] },
  { cls: 'c3', delay: 1.1, pts: [[14, 40, 'timer'], [44, 72, 'D'], [76, 48, 'q'], [92, 80, 'check']] },
  { cls: 'c4', delay: 1.4, pts: [[18, 62, 'C'], [48, 26, 'xp'], [82, 56, 'bulb']] },
];

function SymContent({ k }: { k: SymKind }) {
  const ic = { style: { width: '1.15em', height: '1.15em' }, strokeWidth: 2.4 };
  switch (k) {
    case 'q': return <>?</>;
    case 'check': return <Check {...ic} />;
    case 'bulb': return <Lightbulb {...ic} />;
    case 'trophy': return <Trophy {...ic} />;
    case 'timer': return <Timer {...ic} />;
    case 'xp': return <>+10 XP</>;
    default: return <>{k}</>;
  }
}

const Background = React.memo(function Background({ phone }: { phone: boolean }) {
  const stars = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: phone ? 24 : 46 }, () => ({
      left: `${(r() * 100).toFixed(1)}%`, top: `${(r() * 100).toFixed(1)}%`,
      s: `${(1 + r() * 2.2).toFixed(1)}px`, d: `${(r() * 4).toFixed(2)}s`, t: `${(2.4 + r() * 3).toFixed(2)}s`,
    }));
  }, [phone]);
  return (
    <div className="qll-bgwrap" aria-hidden="true">
      <div className="qll-bg" />
      <i className="qll-glow g1" /><i className="qll-glow g2" /><i className="qll-glow g3" />
      <div className="qll-dots" />
      {stars.map((s, i) => (
        <i key={i} className="qll-twk" style={cv({ left: s.left, top: s.top, '--s': s.s, '--d': s.d, '--t': s.t })} />
      ))}
      {CLUSTERS.map((c, ci) => (
        <div key={c.cls} className={`qll-const ${c.cls}`} style={cv({ '--cd': `${c.delay}s` })}>
          <div className="qll-drift" style={cv({ '--dd': `${ci * -3}s` })}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points={c.pts.map(p => `${p[0]},${p[1]}`).join(' ')} />
            </svg>
            {c.pts.map((p, i) => (
              <span key={i} className={`qll-sym k-${p[2]} ${i === 3 ? 'x' : ''}`} style={{ left: `${p[0]}%`, top: `${p[1]}%` }}>
                <SymContent k={p[2]} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

type Particle = { dx: number; dy: number; r: number; t: number; dl: number; sz: number; c: string; br: string; ar: number };
function makeBurst(count: number, spread: number, seed: number): Particle[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + r() * 0.35;
    const d = spread * (0.45 + r() * 0.75);
    const shape = r();
    return {
      dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d * 0.85 - spread * 0.15),
      r: Math.round((r() - 0.5) * 1300), t: +(0.95 + r() * 0.8).toFixed(2), dl: +(r() * 0.08).toFixed(2),
      sz: Math.round(6 + r() * 7), c: CONFETTI[Math.floor(r() * CONFETTI.length)],
      br: shape < 0.35 ? '50%' : '2px', ar: shape > 0.7 ? 2.4 : 1,
    };
  });
}
function Burst({ items, className = '' }: { items: Particle[]; className?: string }) {
  return (
    <>
      {items.map((p, i) => (
        <i key={i} className={`qll-p ${className}`}
          style={cv({ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--r': `${p.r}deg`, '--t': `${p.t}s`, '--dl': `${p.dl}s`, '--sz': `${p.sz}px`, '--c': p.c, '--br': p.br, '--ar': p.ar })} />
      ))}
    </>
  );
}

const FallingConfetti = React.memo(function FallingConfetti({ phone }: { phone: boolean }) {
  const items = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: phone ? 12 : 22 }, () => {
      const t = 7 + r() * 6;
      return {
        left: `${(r() * 100).toFixed(1)}%`, sz: Math.round(6 + r() * 6), c: CONFETTI[Math.floor(r() * CONFETTI.length)],
        t: `${t.toFixed(1)}s`, dl: `${(-r() * t).toFixed(1)}s`, sw: `${Math.round((r() - 0.5) * 140)}px`,
        rot: `${Math.round(360 + r() * 720)}deg`, br: r() < 0.4 ? '50%' : '2px',
      };
    });
  }, [phone]);
  return (
    <div className="qll-confall" aria-hidden="true">
      {items.map((p, i) => (
        <i key={i} style={cv({ left: p.left, '--sz': `${p.sz}px`, '--c': p.c, '--t': p.t, '--dl': p.dl, '--sw': p.sw, '--r': p.rot, '--br': p.br })} />
      ))}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Side cards (wide screens only)                                       */
/* ------------------------------------------------------------------ */
function useCountUp(active: boolean, to: number, delay: number, dur: number, reduced: boolean) {
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!active) return;
    if (reduced) { setV(to); return; }
    let raf = 0; let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const t = window.setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { window.clearTimeout(t); cancelAnimationFrame(raf); };
  }, [active, to, delay, dur, reduced]);
  return v;
}

function QuestionCard() {
  const opts = ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'];
  return (
    <div className="qll-side l" aria-hidden="true" data-keep>
      <div className="qll-glass"><div className="qll-gfloat">
        <div className="qll-qhead"><span>Q3</span><em>Algorithms</em></div>
        <p className="qll-q">What is the time complexity of binary search?</p>
        {opts.map((o, i) => (
          <div key={o} className={`qll-opt ${i === 1 ? 'ok' : ''}`}>
            <span className="qll-ol">{'ABCD'[i]}</span><span className="qll-ot">{o}</span>
            {i === 1 && <Check className="qll-tick" strokeWidth={3.4} />}
          </div>
        ))}
        <span className="qll-xp">+10 XP</span>
      </div></div>
    </div>
  );
}

function ScoreCard({ active, reduced }: { active: boolean; reduced: boolean }) {
  const v = useCountUp(active, 90, 2300, 1500, reduced);
  const C = 2 * Math.PI * 42;
  return (
    <div className="qll-side r" aria-hidden="true" data-keep>
      <div className="qll-glass"><div className="qll-gfloat">
        <div className="qll-qhead"><span>Result</span><em>Quiz complete</em></div>
        <div className="qll-ringbox">
          <svg viewBox="0 0 100 100">
            <defs><linearGradient id="qllrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6ee7b7" /><stop offset="1" stopColor="#60a5fa" /></linearGradient></defs>
            <circle cx="50" cy="50" r="42" className="qll-rtrack" />
            <circle cx="50" cy="50" r="42" className="qll-rfill" stroke="url(#qllrg)" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} />
          </svg>
          <b>{v}%</b>
        </div>
        <p className="qll-great">Great job!</p>
        <div className="qll-stats"><span>9/10 correct</span><span>+90 XP</span></div>
      </div></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full-screen surprise                                                */
/* ------------------------------------------------------------------ */
const SWAP_MS = 560;
const SWAP_GAP = 110;

function FullScreen({ onClose, reduced, cornerRef }: {
  onClose: () => void; reduced: boolean; cornerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const phone = useMemo(() => Math.min(window.innerWidth, window.innerHeight) < 600, []);
  const n = phone ? 3 : 5;
  const cfg = useMemo(() => (phone ? [GIFTS[0], GIFTS[2], GIFTS[3]] : GIFTS), [phone]);
  const specialId = cfg.findIndex(g => g.special);
  const swaps = useMemo<[number, number][]>(
    () => (phone ? [[0, 1], [1, 2], [0, 2], [0, 1]] : [[0, 2], [1, 3], [0, 4], [3, 4]]), [phone]);
  const mid = (n - 1) / 2;

  const [phase, setPhase] = useState<Phase>(reduced ? 'reveal' : 'intro');
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: n }, (_, i) => i));
  const orderRef = useRef<number[]>(order);
  const [arcs, setArcs] = useState<Record<number, string>>({});
  const [wiggle, setWiggle] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [closing, setClosing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundOn());

  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const tryRef = useRef<HTMLAnchorElement>(null);
  const closingRef = useRef(false);
  const closeTimer = useRef<number>(0);

  const burst = useMemo(() => makeBurst(phone ? 26 : 44, phone ? 120 : 210, 5), [phone]);
  const sparks = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: phone ? 6 : 10 }, (_, i) => {
      const a = (i / (phone ? 6 : 10)) * Math.PI * 2 + r() * 0.5;
      const d = (phone ? 80 : 120) + r() * (phone ? 70 : 120);
      return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d), s: Math.round(14 + r() * 16), dl: +(r() * 0.2).toFixed(2) };
    });
  }, [phone]);

  const revealed = phase === 'pop' || phase === 'reveal' || phase === 'closing';

  /* --- measure logo position (for halo + fly-out animation) --- */
  const syncPos = useCallback(() => {
    const root = rootRef.current; const logo = logoRef.current;
    if (!root || !logo || closingRef.current) return;
    const rr = root.getBoundingClientRect(); const lr = logo.getBoundingClientRect();
    const lx = lr.left - rr.left + lr.width / 2; const ly = lr.top - rr.top + lr.height / 2;
    root.style.setProperty('--lx', `${lx}px`); root.style.setProperty('--ly', `${ly}px`);
    root.style.setProperty('--fly-x', `${rr.width / 2 - lx}px`); root.style.setProperty('--fly-y', `${rr.height / 2 - ly}px`);
  }, []);
  useLayoutEffect(() => { syncPos(); }, [syncPos, phase]);
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(syncPos); };
    window.addEventListener('resize', on); window.addEventListener('orientationchange', on);
    const col = colRef.current; col?.addEventListener('scroll', on, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(on) : null;
    if (col && ro) ro.observe(col);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on);
      col?.removeEventListener('scroll', on); ro?.disconnect();
    };
  }, [syncPos]);

  /* --- lock page scroll --- */
  useEffect(() => {
    const body = document.body; const html = document.documentElement;
    const prev = { bo: body.style.overflow, ho: html.style.overflow, pr: body.style.paddingRight };
    const sb = window.innerWidth - html.clientWidth;
    body.style.overflow = 'hidden'; html.style.overflow = 'hidden';
    if (sb > 0) body.style.paddingRight = `${sb}px`;
    return () => { body.style.overflow = prev.bo; html.style.overflow = prev.ho; body.style.paddingRight = prev.pr; };
  }, []);

  /* --- closing --- */
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    writeSeen();
    if (reduced) { onClose(); return; }
    const root = rootRef.current; const c = cornerRef.current;
    if (root && c) {
      const r = c.getBoundingClientRect();
      root.style.setProperty('--ox', `${r.left + r.width / 2}px`); root.style.setProperty('--oy', `${r.top + r.height / 2}px`);
    }
    setClosing(true); setPhase('closing');
    closeTimer.current = window.setTimeout(onClose, 640);
  }, [onClose, reduced, cornerRef]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  /* --- keyboard: Escape + focus trap --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const root = rootRef.current; if (!root) return;
      const list = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'))
        .filter(el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0]; const last = list[list.length - 1]; const act = document.activeElement as HTMLElement | null;
      if (!act || !root.contains(act)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && act === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);
  useEffect(() => { rootRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (phase === 'reveal') tryRef.current?.focus({ preventScroll: true }); }, [phase]);

  /* --- sound --- */
  useEffect(() => { bindAudioUnlock(); }, []);
  useEffect(() => {
    if (reduced) return;
    if (phase === 'intro') { for (let k = 0; k < n; k++) sfx.pop(0.68 + k * 0.09); }
    if (phase === 'pick') sfx.shimmer();
    if (phase === 'pop') {
      sfx.boom(); sfx.sparkle(0.06); sfx.chime(0.95);
      sfx.slap(1.3); sfx.slap(1.55); sfx.slap(1.8);
    }
    if (phase === 'closing') sfx.down();
  }, [phase, reduced, n]);
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundOn(next); setSoundEnabled(next);
    if (next) sfx.tick();
  };

  /* --- phase machine --- */
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = window.setTimeout(() => setPhase('shuffle'), 1500);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'shuffle') return;
    const ids: number[] = [];
    swaps.forEach(([a, b], i) => {
      const t0 = 150 + i * (SWAP_MS + SWAP_GAP);
      ids.push(window.setTimeout(() => {
        const par = i % 2 ? 'b' : 'a';
        sfx.whoosh();
        const prev = orderRef.current;
        const next = prev.slice(); [next[a], next[b]] = [next[b], next[a]];
        orderRef.current = next;
        setOrder(next);
        setArcs({ [prev[a]]: `up-${par}`, [prev[b]]: `dn-${par}` });
      }, t0));
      ids.push(window.setTimeout(() => { setArcs({}); sfx.tick(); }, t0 + SWAP_MS));
    });
    const end = 150 + swaps.length * (SWAP_MS + SWAP_GAP) + 100;
    ids.push(window.setTimeout(() => { setWiggle(true); for (let k = 0; k < 5; k++) sfx.tick(k * 0.13); }, end));
    ids.push(window.setTimeout(() => { setWiggle(false); setPhase('pick'); }, end + 850));
    return () => ids.forEach(clearTimeout);
  }, [phase, swaps]);

  useEffect(() => {
    if (phase !== 'pick') return;
    const t = window.setTimeout(() => setPhase('pop'), tapped ? 520 : 4500);
    return () => window.clearTimeout(t);
  }, [phase, tapped]);

  useEffect(() => {
    if (phase !== 'pop') return;
    const t = window.setTimeout(() => setPhase('reveal'), 1300);
    return () => window.clearTimeout(t);
  }, [phase]);

  const onTapBox = () => {
    if (phase === 'pick') setPhase('pop');
    else if (phase === 'intro' || phase === 'shuffle') { setWiggle(false); setArcs({}); setTapped(true); setPhase('pick'); }
  };

  const onRootClick = (e: React.MouseEvent) => {
    if (phase !== 'reveal') return;
    if ((e.target as HTMLElement).closest('[data-keep]')) return;
    close();
  };

  const showBoxes = phase === 'intro' || phase === 'shuffle' || phase === 'pick' || phase === 'pop';
  const picked = phase === 'pick' || phase === 'pop';

  return (
    <div
      ref={rootRef}
      className={`qll-root ${revealed ? 'is-revealed' : ''} ${closing ? 'is-closing' : ''} ${reduced ? 'is-rm' : ''}`}
      data-n={n} data-ph={phone ? 1 : 0}
      role="dialog" aria-modal="true" aria-label="Quiz Lab launch surprise" tabIndex={-1}
      onClick={onRootClick}
    >
      <Background phone={phone} />
      {revealed && !reduced && <FallingConfetti phone={phone} />}
      {!reduced && (
        <div className={`qll-halo ${revealed ? 'on' : ''}`} aria-hidden="true">
          <div className="qll-halo-glow" />
          <div className="qll-beams"><i /></div>
          <div className="qll-halo-ring" style={cv({ '--i': 0 })} />
          <div className="qll-halo-ring" style={cv({ '--i': 1 })} />
          <div className="qll-halo-ring" style={cv({ '--i': 2 })} />
        </div>
      )}
      {reduced && <div className="qll-halo on" aria-hidden="true"><div className="qll-halo-glow" /><div className="qll-beams"><i /></div></div>}

      {showBoxes && !reduced && (
        <div className="qll-boxes">
          {cfg.map((g, id) => {
            const special = id === specialId;
            const slot = special && picked ? mid : order.indexOf(id);
            const away = picked && !special;
            const rnd = rng(id * 13 + 3);
            return (
              <div key={id}
                className={`qll-slot ${special ? 'qll-special' : ''} ${away ? 'is-away' : ''} ${special && picked ? 'is-lift' : ''} ${special && phase === 'pop' ? 'is-popped' : ''} ${wiggle ? 'qll-wiggle' : ''}`}
                style={cv({ '--slot': slot, '--mid': mid, '--k': id, '--rot': `${Math.round((rnd() - 0.5) * 120)}deg`, '--dl': `${(rnd() * 0.18).toFixed(2)}s` })}>
                <div className="qll-fall">
                  <div className={`qll-arc ${arcs[id] ?? ''}`}>
                    {special ? (
                      <button type="button" className={`qll-wob qll-hit ${phase === 'pick' ? 'is-trem' : ''}`} aria-label="Open the surprise box" onClick={onTapBox}>
                        <Gift cfg={g} />
                      </button>
                    ) : (
                      <div className="qll-wob" aria-hidden="true"><Gift cfg={g} /></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {phase === 'pick' && <p className="qll-hint" aria-live="polite">Something new is inside… tap the box</p>}
        </div>
      )}

      {(phase === 'pop' || phase === 'reveal' || phase === 'closing') && !reduced && (
        <div className="qll-fx" aria-hidden="true">
          <i className="qll-flash" />
          <i className="qll-ringx" /><i className="qll-ringx b" />
          <Burst items={burst} />
          {sparks.map((s, i) => (
            <i key={i} className="qll-spark" style={cv({ '--x': `${s.x}px`, '--y': `${s.y}px`, '--ss': `${s.s}px`, '--dl': `${s.dl}s` })} />
          ))}
        </div>
      )}

      {/* reveal content */}
      <div ref={colRef} className={`qll-center ${revealed ? '' : 'qll-hide'}`}>
        <div className="qll-col">
          <div ref={logoRef} className="qll-logo" data-keep>
            <div className="qll-fly">
              <div className="qll-logo-float">
                <img className="qll-logo-img" src={LOGO_SRC} alt="Quiz Lab logo" width={184} height={184} />
                <span className="qll-sticker s1">NEW</span>
                <span className="qll-sticker s2">NEW</span>
                <span className="qll-sticker s3">NEW</span>
              </div>
            </div>
          </div>
          <div data-keep>
            <h2 className="qll-title" id="qll-title">
              <span className="qll-nowrap">
                <span className="qll-word qll-grad" style={cv({ '--i': 0 })}>Quiz</span>{' '}
                <span className="qll-word qll-grad" style={cv({ '--i': 1 })}>Lab</span>
              </span>{' '}
              <span className="qll-word" style={cv({ '--i': 2 })}>is</span>{' '}
              <span className="qll-word" style={cv({ '--i': 3 })}>here</span>
            </h2>
            <p className="qll-sub">Practice quizzes to test what you've learned.</p>
          </div>
          <div className="qll-btns" data-keep>
            <a ref={tryRef} className="qll-cta" href={QUIZ_URL} onClick={() => writeSeen()}><span>Try now →</span></a>
            <button type="button" className="qll-later" onClick={close}>Maybe later</button>
          </div>
          <div className="qll-chips" data-keep>
            {['Topic-wise quizzes', 'Instant results', 'Track your progress'].map((c, i) => (
              <span key={c} className="qll-chip" style={cv({ '--i': i })}><Check strokeWidth={3.2} />{c}</span>
            ))}
          </div>
        </div>
      </div>

      <QuestionCard />
      <ScoreCard active={revealed} reduced={reduced} />

      <div className="qll-brand" data-keep>
        <img src={LOGO_SRC} alt="" width={36} height={36} />
        <span className="qll-brand-t"><b>QUIZ-LAB</b><i>by <u>Gen-Z</u> <em>IITian</em></i></span>
      </div>
      <button type="button" className="qll-mute" aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'} aria-pressed={!soundEnabled} onClick={toggleSound} data-keep>
        {soundEnabled ? <Volume2 strokeWidth={2.4} /> : <VolumeX strokeWidth={2.4} />}
      </button>
      <button type="button" className="qll-close" aria-label="Close" onClick={close} data-keep><X strokeWidth={2.6} /></button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Corner box                                                          */
/* ------------------------------------------------------------------ */
function Corner({ hidden, reduced, boxRef }: { hidden: boolean; reduced: boolean; boxRef: React.RefObject<HTMLDivElement | null> }) {
  const [cardOpen, setCardOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [bottom, setBottom] = useState(0);
  const mini = useMemo(() => makeBurst(16, 90, 99), []);

  // sit just above the floating 1:1 pill (or the mobile tab bar) if present
  useEffect(() => {
    const measure = () => {
      const pill = document.querySelector('aside[aria-label="1:1 Personalised Batch"]') as HTMLElement | null;
      if (!pill) { setBottom(0); return; }
      const r = pill.getBoundingClientRect();
      if (!r.width || !r.height) { setBottom(0); return; }
      setBottom(Math.max(0, Math.round(window.innerHeight - r.top + 12)));
    };
    measure();
    const id = window.setInterval(measure, 800);
    window.addEventListener('resize', measure);
    return () => { window.clearInterval(id); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => { if (hidden) setCardOpen(false); }, [hidden]);
  useEffect(() => {
    if (!cardOpen) return;
    const down = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setCardOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setCardOpen(false); };
    document.addEventListener('pointerdown', down); window.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); window.removeEventListener('keydown', key); };
  }, [cardOpen, boxRef]);

  const toggle = () => {
    setCardOpen(o => {
      if (!o && !reduced) { setBurstKey(k => k + 1); sfx.pop(); sfx.sparkle(0.05); }
      return !o;
    });
  };

  return (
    <div ref={boxRef} className={`qll-corner ${hidden ? 'is-hidden' : 'qll-enter'} ${cardOpen ? 'is-open' : ''}`}
      style={cv({ '--qll-bot': `${bottom}px` })}>
      {cardOpen && (
        <div className="qll-card" role="group" aria-label="Quiz Lab is here">
          <button type="button" className="qll-card-x" aria-label="Close" onClick={() => setCardOpen(false)}><X strokeWidth={3} /></button>
          <div className="qll-card-top">
            <img src={LOGO_SRC} alt="" width={46} height={46} />
            <div><div><b>Quiz Lab</b><span className="qll-card-new">NEW</span></div><small className="qll-card-by">by Gen-Z <em>IITian</em></small></div>
          </div>
          <p>Practice quizzes to test what you've learned.</p>
          <a className="qll-card-cta" href={QUIZ_URL}>Try now →</a>
        </div>
      )}
      {burstKey > 0 && !reduced && <div className="qll-mini" aria-hidden="true" key={burstKey}><Burst items={mini} /></div>}
      <button type="button" className="qll-tile" aria-label="Quiz Lab is here. Open the surprise" aria-expanded={cardOpen} onClick={toggle}>
        <span className="qll-tile-in"><Gift cfg={GIFTS[2]} /></span>
        <span className="qll-newtag">NEW</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */
export default function QuizLabLaunch() {
  const reduced = useMemo(() => prefersReduced(), []);
  const [open, setOpen] = useState<boolean>(() => !readSeen());
  const cornerRef = useRef<HTMLDivElement | null>(null);
  const handleClose = useCallback(() => setOpen(false), []);
  useEffect(() => { bindAudioUnlock(); }, []);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <style>{CSS}</style>
      <Corner hidden={open} reduced={reduced} boxRef={cornerRef} />
      {open && <FullScreen onClose={handleClose} reduced={reduced} cornerRef={cornerRef} />}
    </>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const CSS = `
.qll-root{--vh:1vh;--logo:clamp(88px,min(30vw,calc(var(--vh)*21)),184px);--bw:clamp(54px,min(13vw,calc(var(--vh)*17)),116px);--gap:calc(var(--bw)*.22);
  position:fixed;inset:0;z-index:2147483000;overflow:hidden;overflow:clip;color:#fff;background:#0b1120;font-family:inherit;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain;outline:none;touch-action:manipulation}
@supports (height:1dvh){.qll-root{--vh:1dvh}}
.qll-root[data-n="3"]{--bw:clamp(70px,min(25vw,calc(var(--vh)*18)),130px)}
.qll-root *,.qll-corner *{box-sizing:border-box}
.qll-root.is-closing{transform-origin:var(--ox,100%) var(--oy,100%);animation:qll-shrink .62s cubic-bezier(.6,0,.9,.4) forwards}
@keyframes qll-shrink{to{transform:scale(.04);opacity:0}}

/* background */
.qll-bgwrap{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.qll-bg{position:absolute;inset:0;background:linear-gradient(155deg,#0b1120 0%,#161a52 40%,#2c1a75 72%,#4c1d95 100%)}
.qll-glow{position:absolute;width:70vmax;height:70vmax;border-radius:50%}
.qll-glow.g1{left:-22vmax;top:-26vmax;background:radial-gradient(circle,rgba(16,185,129,.40),transparent 62%);animation:qll-gl1 18s ease-in-out infinite alternate}
.qll-glow.g2{right:-26vmax;top:8vmax;background:radial-gradient(circle,rgba(37,99,235,.46),transparent 62%);animation:qll-gl2 22s ease-in-out infinite alternate}
.qll-glow.g3{left:6vmax;bottom:-36vmax;background:radial-gradient(circle,rgba(139,92,246,.52),transparent 62%);animation:qll-gl3 20s ease-in-out infinite alternate}
@keyframes qll-gl1{to{transform:translate3d(14vmax,10vmax,0) scale(1.15)}}
@keyframes qll-gl2{to{transform:translate3d(-16vmax,12vmax,0) scale(1.1)}}
@keyframes qll-gl3{to{transform:translate3d(14vmax,-12vmax,0) scale(1.18)}}
.qll-dots{position:absolute;inset:0;opacity:.55;background-image:radial-gradient(rgba(255,255,255,.12) 1.2px,transparent 1.7px);background-size:22px 22px;
  -webkit-mask-image:radial-gradient(ellipse at center,transparent 14%,#000 78%);mask-image:radial-gradient(ellipse at center,transparent 14%,#000 78%)}
.qll-twk{position:absolute;width:var(--s);height:var(--s);border-radius:50%;background:#fff;opacity:.6;animation:qll-twinkle var(--t) ease-in-out var(--d) infinite}
@keyframes qll-twinkle{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.95;transform:scale(1.3)}}

.qll-const{position:absolute;width:clamp(150px,26vw,330px);aspect-ratio:1.15;animation:qll-fade 1.3s ease backwards;animation-delay:var(--cd)}
.qll-const.c1{left:1.5%;top:7%}.qll-const.c2{right:1.5%;top:9%}.qll-const.c3{left:2%;bottom:8%}.qll-const.c4{right:2%;bottom:9%}
@keyframes qll-fade{from{opacity:0}}
.qll-drift{position:absolute;inset:0;animation:qll-drift 14s ease-in-out var(--dd,0s) infinite alternate}
@keyframes qll-drift{from{transform:translate3d(-8px,-6px,0) rotate(-1.5deg)}to{transform:translate3d(10px,8px,0) rotate(1.5deg)}}
.qll-const svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.qll-const polyline{fill:none;stroke:rgba(255,255,255,.26);stroke-width:1;stroke-dasharray:3 4;vector-effect:non-scaling-stroke}
.qll-sym{position:absolute;transform:translate(-50%,-50%);min-width:2em;height:2em;padding:0 .35em;border-radius:999px;display:inline-grid;place-items:center;font-size:clamp(11px,1.4vw,16px);font-weight:900;color:#e9e7ff;
  background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.24);box-shadow:0 0 1.2em rgba(139,92,246,.4);white-space:nowrap}
.qll-sym.k-check{color:#6ee7b7}.qll-sym.k-trophy,.qll-sym.k-xp{color:#fcd34d}.qll-sym.k-bulb{color:#fde68a}.qll-sym.k-timer{color:#93c5fd}
.qll-root[data-ph="1"] .qll-const.c2,.qll-root[data-ph="1"] .qll-const.c3,.qll-root[data-ph="1"] .qll-sym.x{display:none}
.qll-root[data-ph="1"] .qll-const{opacity:.8}
@media (max-height:560px){.qll-const.c3,.qll-const.c4{display:none}}

/* gift boxes */
.qll-gift{position:relative;display:block;width:1em;height:1em;isolation:isolate}
.qll-gift-body{position:absolute;left:.07em;right:.07em;bottom:0;height:.62em;border-radius:.07em;overflow:hidden;background:linear-gradient(135deg,var(--c1),var(--c2));
  box-shadow:inset 0 -.06em 0 rgba(0,0,0,.2),inset 0 .035em 0 rgba(255,255,255,.4),0 .05em .1em rgba(0,0,0,.35)}
.qll-rib{position:absolute;left:50%;top:0;bottom:0;width:.18em;transform:translateX(-50%);background:var(--rb);box-shadow:inset .02em 0 0 rgba(0,0,0,.12),inset -.02em 0 0 rgba(255,255,255,.45)}
.qll-gift-lid{position:absolute;left:0;right:0;bottom:.56em;height:.24em;border-radius:.06em;background:linear-gradient(135deg,var(--c1),var(--c2));filter:brightness(1.1);
  box-shadow:inset 0 -.04em 0 rgba(0,0,0,.18),inset 0 .035em 0 rgba(255,255,255,.45),0 .04em .08em rgba(0,0,0,.3);transform-origin:20% 100%;transition:transform .45s cubic-bezier(.3,1.4,.5,1)}
.qll-gift-lid .qll-rib{box-shadow:inset .02em 0 0 rgba(0,0,0,.12)}
.qll-bow{position:absolute;left:50%;top:-.17em;width:.36em;height:.2em;transform:translateX(-50%)}
.qll-bow b{position:absolute;top:0;width:.18em;height:.14em;border:.04em solid var(--rb);border-radius:50%}
.qll-bow .l{left:0;transform:rotate(-28deg)}.qll-bow .r{right:0;transform:rotate(28deg)}
.qll-bow .k{left:50%;top:.075em;width:.085em;height:.085em;margin-left:-.0425em;border:0;background:var(--rb);box-shadow:0 0 .02em rgba(0,0,0,.4)}
.qll-gift--special::before{content:"";position:absolute;inset:-.4em;border-radius:50%;z-index:-1;background:radial-gradient(circle,rgba(110,231,183,.8),rgba(16,185,129,.28) 45%,transparent 70%);animation:qll-glow 1.6s ease-in-out infinite}
@keyframes qll-glow{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.12)}}

.qll-boxes{position:absolute;left:50%;top:50%;width:0;height:0;z-index:3}
.qll-slot{position:absolute;left:calc(var(--bw)*-.5);top:calc(var(--bw)*-.5);width:var(--bw);height:var(--bw);font-size:var(--bw);
  transform:translateX(calc((var(--slot) - var(--mid))*(var(--bw) + var(--gap))));transition:transform .56s cubic-bezier(.55,.05,.25,1)}
.qll-fall{position:absolute;inset:0;transition:transform .6s cubic-bezier(.3,1.35,.5,1),opacity .5s ease;animation:qll-slide-in .95s cubic-bezier(.25,.9,.35,1) backwards;animation-delay:calc(var(--k)*.09s + .08s)}
@keyframes qll-slide-in{0%{transform:translateY(calc(var(--vh)*70)) scale(.9);opacity:0}15%{opacity:1}62%{transform:translateY(-.14em)}80%{transform:translateY(.05em)}100%{transform:none}}
.qll-slot.is-away .qll-fall{transform:translateY(calc(var(--vh)*70)) rotate(var(--rot));opacity:0;transition:transform .85s cubic-bezier(.5,0,1,.55) var(--dl),opacity .7s ease-in var(--dl)}
.qll-slot.is-lift .qll-fall{transform:translateY(calc(var(--bw)*-.28)) scale(1.38)}
.qll-arc.up-a{animation:qll-up-a .56s cubic-bezier(.4,0,.3,1)}.qll-arc.up-b{animation:qll-up-b .56s cubic-bezier(.4,0,.3,1)}
.qll-arc.dn-a{animation:qll-dn-a .56s cubic-bezier(.4,0,.3,1)}.qll-arc.dn-b{animation:qll-dn-b .56s cubic-bezier(.4,0,.3,1)}
@keyframes qll-up-a{0%,100%{transform:none}50%{transform:translateY(-.55em) scale(1.12)}}
@keyframes qll-up-b{0%,100%{transform:none}50%{transform:translateY(-.55em) scale(1.12)}}
@keyframes qll-dn-a{0%,100%{transform:none}50%{transform:translateY(.36em) scale(.92)}}
@keyframes qll-dn-b{0%,100%{transform:none}50%{transform:translateY(.36em) scale(.92)}}
.qll-wiggle .qll-wob{animation:qll-wiggle .28s ease-in-out 3;animation-delay:calc(var(--k)*.04s)}
@keyframes qll-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg) translateY(-.02em)}75%{transform:rotate(7deg) translateY(-.02em)}}
.qll-wob{display:block;width:100%;height:100%;transform-origin:50% 90%}
.qll-hit{all:unset;display:block;width:100%;height:100%;cursor:pointer;border-radius:.2em;transform-origin:50% 90%}
.qll-hit:focus-visible{outline:3px solid #fff;outline-offset:.12em}
.qll-wob.is-trem{animation:qll-trem .22s linear infinite}
@keyframes qll-trem{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(.012em,0) rotate(-1.6deg)}75%{transform:translate(-.012em,.008em) rotate(1.6deg)}}
.qll-special.is-lift .qll-gift--special::before{animation-duration:.9s}
.qll-special.is-popped{pointer-events:none}
.qll-special.is-popped .qll-gift-lid{animation:qll-lid .85s cubic-bezier(.3,.7,.4,1) forwards}
@keyframes qll-lid{0%{transform:none;opacity:1}100%{transform:translate(.9em,-2.6em) rotate(560deg);opacity:0}}
.qll-special.is-popped .qll-fall{animation:qll-gone .5s ease-in .6s forwards}
@keyframes qll-gone{from{transform:translateY(calc(var(--bw)*-.28)) scale(1.38);opacity:1}to{transform:translateY(calc(var(--bw)*-.28)) scale(.55);opacity:0}}
.qll-hint{position:absolute;left:50%;top:calc(var(--bw)*.8 + 14px);transform:translateX(-50%);margin:0;width:max-content;max-width:88vw;text-align:center;font-weight:800;font-size:clamp(.95rem,2.8vw,1.3rem);color:#e7e5ff;text-shadow:0 2px 14px rgba(0,0,0,.4);animation:qll-hint .6s ease backwards}
@keyframes qll-hint{from{opacity:0;transform:translate(-50%,10px)}}

/* pop effects */
.qll-fx{position:absolute;left:50%;top:50%;width:0;height:0;z-index:4;pointer-events:none}
.qll-flash{position:absolute;left:-100vmax;top:-100vmax;width:200vmax;height:200vmax;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(167,243,208,.55) 14%,transparent 30%);animation:qll-flash .65s ease-out both}
@keyframes qll-flash{0%{opacity:0;transform:scale(.3)}25%{opacity:1}100%{opacity:0;transform:scale(1)}}
.qll-ringx{position:absolute;left:calc(var(--bw)*-.5);top:calc(var(--bw)*-.5);width:var(--bw);height:var(--bw);border-radius:50%;border:4px solid rgba(255,255,255,.9);animation:qll-ringx .95s ease-out both}
.qll-ringx.b{border-color:rgba(110,231,183,.85);animation-delay:.14s}
@keyframes qll-ringx{from{transform:scale(.4);opacity:1}to{transform:scale(7);opacity:0}}
.qll-p{position:absolute;left:0;top:0;width:var(--sz);height:calc(var(--sz)*var(--ar,1));margin:calc(var(--sz)*-.5);background:var(--c);border-radius:var(--br,2px);animation:qll-burst var(--t) cubic-bezier(.16,.75,.3,1) var(--dl,0s) both}
@keyframes qll-burst{0%{transform:translate(0,0) rotate(0) scale(.3);opacity:1}45%{transform:translate(var(--dx),var(--dy)) rotate(calc(var(--r)*.5)) scale(1);opacity:1}100%{transform:translate(calc(var(--dx)*1.12),calc(var(--dy) + 190px)) rotate(var(--r)) scale(.9);opacity:0}}
.qll-spark{position:absolute;left:0;top:0;width:var(--ss);height:var(--ss);margin:calc(var(--ss)*-.5);background:linear-gradient(135deg,#fff,#fde68a);
  clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:qll-spark 1.1s ease-out var(--dl) both}
@keyframes qll-spark{0%{transform:translate(0,0) scale(0) rotate(0);opacity:1}40%{transform:translate(var(--x),var(--y)) scale(1.3) rotate(90deg);opacity:1}100%{transform:translate(calc(var(--x)*1.15),calc(var(--y)*1.15)) scale(0) rotate(200deg);opacity:0}}

/* halo (rays + rings) behind the logo */
.qll-halo{position:absolute;left:var(--lx,50%);top:var(--ly,32%);width:0;height:0;z-index:2;pointer-events:none;opacity:0;visibility:hidden}
.qll-halo.on{opacity:1;visibility:visible}
.is-revealed .qll-halo{animation:qll-fly 1.15s cubic-bezier(.2,.8,.3,1) .3s backwards}
.qll-halo-glow{position:absolute;left:calc(var(--logo)*-1.3);top:calc(var(--logo)*-1.3);width:calc(var(--logo)*2.6);height:calc(var(--logo)*2.6);border-radius:50%;background:radial-gradient(circle,rgba(52,211,153,.5),rgba(96,165,250,.18) 45%,transparent 68%);animation:qll-breathe 3.4s ease-in-out infinite alternate}
@keyframes qll-breathe{from{opacity:.65;transform:scale(.92)}to{opacity:1;transform:scale(1.08)}}
.qll-beams{position:absolute;left:calc(var(--logo)*-2.6);top:calc(var(--logo)*-2.6);width:calc(var(--logo)*5.2);height:calc(var(--logo)*5.2);
  -webkit-mask-image:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 32%,transparent 66%);mask-image:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 32%,transparent 66%)}
.qll-beams i{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.2) 0 6deg,transparent 6deg 24deg);animation:qll-spin 30s linear infinite}
@keyframes qll-spin{to{transform:rotate(360deg)}}
.qll-halo-ring{position:absolute;left:calc(var(--logo)*-.5);top:calc(var(--logo)*-.5);width:var(--logo);height:var(--logo);border-radius:26%;border:2px solid rgba(110,231,183,.65);animation:qll-ringp 3.2s ease-out calc(var(--i)*1.05s) infinite}
@keyframes qll-ringp{0%{transform:scale(1);opacity:.8}100%{transform:scale(2);opacity:0}}
@keyframes qll-fly{
  0%{transform:translate(var(--fly-x,0px),var(--fly-y,0px)) scale(.25);opacity:0}
  12%{opacity:1}
  58%{transform:translate(0,calc(var(--fly-y,0px)*-.1)) scale(1.14)}
  80%{transform:translate(0,calc(var(--fly-y,0px)*.03)) scale(.97)}
  100%{transform:none}}

/* reveal column */
.qll-confall{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}
.qll-confall i{position:absolute;top:-4vh;width:var(--sz);height:calc(var(--sz)*1.6);background:var(--c);border-radius:var(--br);opacity:.85;animation:qll-cf var(--t) linear var(--dl) infinite}
@keyframes qll-cf{0%{transform:translate3d(0,-6vh,0) rotate(0)}100%{transform:translate3d(var(--sw),112vh,0) rotate(var(--r))}}
.qll-center{position:absolute;inset:0;z-index:5;overflow-x:hidden;overflow-y:auto;display:flex;overscroll-behavior:contain;
  padding:max(56px,calc(env(safe-area-inset-top) + 48px)) 20px calc(24px + env(safe-area-inset-bottom))}
.qll-hide{opacity:0;visibility:hidden;pointer-events:none}
.qll-col{margin:auto;width:100%;max-width:640px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:clamp(8px,1.8vh,18px)}
.qll-logo{position:relative;width:var(--logo);height:var(--logo);flex:none;margin-bottom:clamp(14px,3.2vh,32px)}
.qll-fly{position:absolute;inset:0}
.is-revealed .qll-fly{animation:qll-fly 1.15s cubic-bezier(.2,.8,.3,1) .3s backwards}
.qll-logo-float{position:absolute;inset:0}
.is-revealed .qll-logo-float{animation:qll-float 4s ease-in-out 1.6s infinite alternate}
@keyframes qll-float{from{transform:translateY(-5px)}to{transform:translateY(7px)}}
.qll-logo-img{display:block;width:100%;height:100%;border-radius:22%;object-fit:cover;box-shadow:0 0 0 2px rgba(255,255,255,.2),0 0 60px rgba(16,185,129,.6),0 18px 40px rgba(0,0,0,.45)}
.qll-sticker{position:absolute;font-weight:900;font-size:clamp(9px,calc(var(--logo)*.105),19px);padding:.28em .6em;border-radius:.5em;border:2px solid #0b1120;box-shadow:2px 2px 0 #0b1120;letter-spacing:.06em;color:#0b1120;transform:rotate(var(--rot))}
.qll-sticker.s1{--rot:-14deg;top:-4%;left:-15%;background:#f6a623}
.qll-sticker.s2{--rot:12deg;top:10%;right:-17%;background:#34d399}
.qll-sticker.s3{--rot:7deg;bottom:-2%;left:-9%;background:#f9a8d4}
.is-revealed .qll-sticker{animation:qll-slap .55s cubic-bezier(.2,.9,.3,1) backwards,qll-wob 2.4s ease-in-out infinite alternate}
.is-revealed .s1{animation-delay:1.3s,1.95s}.is-revealed .s2{animation-delay:1.55s,2.2s}.is-revealed .s3{animation-delay:1.8s,2.45s}
@keyframes qll-slap{0%{transform:rotate(var(--rot)) scale(3.2);opacity:0}55%{transform:rotate(var(--rot)) scale(.82);opacity:1}78%{transform:rotate(var(--rot)) scale(1.1)}100%{transform:rotate(var(--rot)) scale(1)}}
@keyframes qll-wob{from{transform:rotate(calc(var(--rot) - 5deg))}to{transform:rotate(calc(var(--rot) + 5deg))}}
.qll-title{margin:0;font-weight:900;line-height:1.08;letter-spacing:-.02em;font-size:clamp(1.7rem,min(7.4vw,calc(var(--vh)*6.2)),3.5rem);text-shadow:0 4px 24px rgba(0,0,0,.35)}
.qll-nowrap{white-space:nowrap}
.qll-word{display:inline-block}
.is-revealed .qll-word{animation:qll-word .6s cubic-bezier(.2,.9,.3,1.3) backwards;animation-delay:calc(var(--i)*.13s + 1.05s)}
@keyframes qll-word{from{opacity:0;transform:translateY(.7em) scale(.8)}}
.qll-grad{background:linear-gradient(90deg,#34d399,#60a5fa,#c084fc,#fbbf24,#34d399);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.is-revealed .qll-grad{animation:qll-word .6s cubic-bezier(.2,.9,.3,1.3) backwards,qll-gradmove 4s linear infinite;animation-delay:calc(var(--i)*.13s + 1.05s),0s;text-shadow:none}
@keyframes qll-gradmove{to{background-position:300% 0}}
.qll-sub{margin:clamp(6px,1.2vh,12px) 0 0;font-size:clamp(.9rem,2.4vw,1.15rem);font-weight:600;color:rgba(255,255,255,.8);max-width:30em}
.is-revealed .qll-sub{animation:qll-up .6s ease backwards 1.75s}
@keyframes qll-up{from{opacity:0;transform:translateY(14px)}}
.qll-btns{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:clamp(4px,1.2vh,12px)}
.is-revealed .qll-btns{animation:qll-up .6s ease backwards 1.95s}
.qll-cta{position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;isolation:isolate;padding:.95em 2em;border-radius:999px;font-weight:900;font-size:clamp(1rem,2.6vw,1.2rem);color:#052e1f;text-decoration:none;
  background:linear-gradient(135deg,#6ee7b7,#10b981 55%,#34d399);box-shadow:0 8px 30px rgba(16,185,129,.55),inset 0 -3px 0 rgba(0,0,0,.14);transition:transform .15s ease}
.qll-cta:hover{transform:translateY(-2px) scale(1.03)}.qll-cta:active{transform:scale(.97)}
.qll-cta:focus-visible,.qll-later:focus-visible,.qll-close:focus-visible,.qll-mute:focus-visible{outline:3px solid #fff;outline-offset:3px}
.qll-cta::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;box-shadow:0 0 0 0 rgba(52,211,153,.7);animation:qll-cta 1.8s ease-out infinite}
@keyframes qll-cta{0%{box-shadow:0 0 0 0 rgba(52,211,153,.65)}80%,100%{box-shadow:0 0 0 18px rgba(52,211,153,0)}}
.qll-cta::after{content:"";position:absolute;top:0;bottom:0;left:0;width:38%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);transform:translateX(-160%) skewX(-18deg);animation:qll-shine 3.2s ease-in-out 2.4s infinite}
@keyframes qll-shine{0%{transform:translateX(-160%) skewX(-18deg)}40%,100%{transform:translateX(420%) skewX(-18deg)}}
.qll-later{all:unset;cursor:pointer;padding:.7em 1.2em;font-weight:700;font-size:.95rem;color:rgba(255,255,255,.72);border-radius:999px}
.qll-later:hover{color:#fff;text-decoration:underline}
.qll-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:520px}
.qll-chip{display:inline-flex;align-items:center;gap:.4em;padding:.5em .95em;border-radius:999px;font-size:clamp(11px,2.6vw,13px);font-weight:700;color:#e8e7ff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22)}
.qll-chip svg{width:1.1em;height:1.1em;color:#6ee7b7}
.is-revealed .qll-chip{animation:qll-up .5s ease backwards;animation-delay:calc(var(--i)*.12s + 2.3s)}
@media (max-height:700px){.qll-chips{display:none}}
@media (max-height:520px){.qll-center{padding-top:44px;padding-bottom:12px}.qll-col{gap:6px}}

.qll-brand{position:absolute;z-index:20;top:max(12px,calc(env(safe-area-inset-top) + 8px));left:max(14px,env(safe-area-inset-left));display:flex;align-items:center;gap:9px;animation:qll-fade .9s ease .3s backwards}
.qll-brand img{width:36px;height:36px;border-radius:10px;object-fit:cover;box-shadow:0 0 0 1.5px rgba(52,211,153,.7),0 0 14px rgba(16,185,129,.5)}
.qll-brand-t{display:flex;flex-direction:column;line-height:1.15;text-align:left}
.qll-brand-t b{font-size:15px;font-weight:900;letter-spacing:.09em;color:#fff}
.qll-brand-t i{font-style:normal;font-size:11px;font-weight:700;color:rgba(255,255,255,.66)}
.qll-brand-t u{text-decoration:none;color:#fff;font-weight:900}.qll-brand-t em{font-style:normal;color:#f87171;font-weight:900}
.qll-mute,.qll-close{position:absolute;z-index:20;top:max(12px,calc(env(safe-area-inset-top) + 8px));right:max(12px,env(safe-area-inset-right));width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.34);padding:0}
.qll-mute{right:calc(max(12px,env(safe-area-inset-right)) + 52px)}
.qll-mute:hover,.qll-close:hover{background:rgba(255,255,255,.26)}
.qll-mute svg{width:20px;height:20px}
.qll-close svg{width:20px;height:20px}

/* side cards (wide + tall screens only) */
.qll-side{display:none;position:absolute;top:50%;z-index:4;width:clamp(220px,19vw,268px);margin-top:-150px}
.qll-root:not(.is-revealed) .qll-side{opacity:0;visibility:hidden}
.qll-side.l{left:clamp(20px,3.6vw,80px)}.qll-side.r{right:clamp(20px,3.6vw,80px)}
@media (min-width:1180px) and (min-height:600px){.qll-side{display:block}}
.qll-glass{border-radius:22px;padding:16px;background:linear-gradient(160deg,rgba(255,255,255,.17),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.28);box-shadow:0 18px 50px rgba(5,5,30,.45),inset 0 1px 0 rgba(255,255,255,.35);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.l .qll-glass{transform:rotate(-6deg)}.r .qll-glass{transform:rotate(6deg)}
.is-revealed .l .qll-glass{animation:qll-side-l .8s cubic-bezier(.2,.9,.3,1) 1.4s backwards}
.is-revealed .r .qll-glass{animation:qll-side-r .8s cubic-bezier(.2,.9,.3,1) 1.6s backwards}
@keyframes qll-side-l{from{opacity:0;transform:translateX(-90px) rotate(-18deg)}}
@keyframes qll-side-r{from{opacity:0;transform:translateX(90px) rotate(18deg)}}
.is-revealed .qll-gfloat{animation:qll-float 5s ease-in-out 2.4s infinite alternate}
.qll-qhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:11px;font-weight:800}
.qll-qhead span{padding:.25em .7em;border-radius:999px;background:rgba(255,255,255,.16);color:#fff}
.qll-qhead em{font-style:normal;color:#c4b5fd}
.qll-q{margin:0 0 12px;font-size:14px;line-height:1.35;font-weight:800;color:#fff}
.qll-opt{position:relative;display:flex;align-items:center;gap:10px;margin-top:7px;padding:9px 11px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);font-size:13px;font-weight:700;color:#f3f2ff;overflow:hidden;isolation:isolate}
.qll-ol{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.16);font-size:11px;font-weight:900;flex:none}
.qll-opt.ok::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#059669,#10b981);}
.is-revealed .qll-opt.ok::before{animation:qll-okfade .5s ease 2.9s backwards}
@keyframes qll-okfade{from{opacity:0}}
.qll-opt .qll-ot{flex:1}
.qll-tick{width:18px;height:18px;color:#fff;flex:none}
.is-revealed .qll-tick{animation:qll-tickpop .45s cubic-bezier(.2,1.5,.4,1) 3s backwards}
@keyframes qll-tickpop{from{opacity:0;transform:scale(0) rotate(-40deg)}}
.qll-xp{position:absolute;right:10px;bottom:-14px;padding:.3em .75em;border-radius:999px;background:#fbbf24;color:#0b1120;font-size:12px;font-weight:900;border:2px solid #0b1120;box-shadow:2px 2px 0 #0b1120;transform:rotate(6deg)}
.is-revealed .qll-xp{animation:qll-xppop .6s cubic-bezier(.2,1.5,.4,1) 3.1s backwards}
@keyframes qll-xppop{from{opacity:0;transform:translateY(14px) rotate(6deg) scale(.4)}}
.qll-ringbox{position:relative;width:128px;height:128px;margin:6px auto 4px}
.qll-ringbox svg{width:100%;height:100%;transform:rotate(-90deg)}
.qll-rtrack{fill:none;stroke:rgba(255,255,255,.16);stroke-width:9}
.qll-rfill{fill:none;stroke-width:9;stroke-linecap:round}
.qll-ringbox b{position:absolute;inset:0;display:grid;place-items:center;font-size:30px;font-weight:900;color:#fff}
.qll-great{margin:6px 0 0;text-align:center;font-weight:900;font-size:15px;color:#6ee7b7}
.qll-stats{display:flex;justify-content:center;gap:8px;margin-top:8px;font-size:11px;font-weight:800}
.qll-stats span{padding:.35em .8em;border-radius:999px;background:rgba(255,255,255,.12);color:#e8e7ff}

/* corner box */
.qll-corner{--qll-def-bot:24px;position:fixed;z-index:160;right:calc(16px + env(safe-area-inset-right,0px));bottom:max(var(--qll-def-bot),var(--qll-bot,0px));width:clamp(68px,17vw,78px);height:clamp(68px,17vw,78px)}
@media (min-width:640px){.qll-corner{right:calc(24px + env(safe-area-inset-right,0px))}}
@media (max-width:767px){.qll-corner{--qll-def-bot:calc(env(safe-area-inset-bottom,0px) + 88px)}}
.qll-corner.is-hidden{visibility:hidden;pointer-events:none}
.qll-corner.qll-enter{animation:qll-corner-in .65s cubic-bezier(.2,.9,.3,1.4) .35s backwards}
@keyframes qll-corner-in{from{transform:scale(.15);opacity:0}}
.qll-tile{all:unset;box-sizing:border-box;position:relative;display:grid;place-items:center;width:100%;height:100%;cursor:pointer;border-radius:24%;
  background:radial-gradient(circle at 30% 20%,#0f6a4a,#063a28 60%,#031d14);border:2.5px solid #0b1120;box-shadow:0 0 0 2px rgba(52,211,153,.7),4px 4px 0 #0b1120,0 0 22px rgba(16,185,129,.55);animation:qll-corner-wiggle 5s ease-in-out 1.6s infinite}
.qll-tile:focus-visible{outline:3px solid #fff;outline-offset:4px}
.qll-tile::before{content:"";position:absolute;inset:-10px;border-radius:30%;z-index:-1;background:radial-gradient(circle,rgba(52,211,153,.55),transparent 70%);animation:qll-glow 2.4s ease-in-out infinite}
@keyframes qll-corner-wiggle{0%,74%,100%{transform:none}78%{transform:rotate(-10deg) scale(1.07)}82%{transform:rotate(9deg) scale(1.07)}86%{transform:rotate(-6deg)}90%{transform:rotate(4deg)}94%{transform:rotate(-2deg)}}
.qll-tile-in{display:block;font-size:calc(clamp(68px,17vw,78px)*.5);margin-top:.06em}
.qll-corner.is-open .qll-gift-lid{transform:translate(-.1em,-.32em) rotate(-26deg)}
.qll-newtag{position:absolute;top:-9px;right:-9px;padding:2px 6px;border-radius:999px;background:#f6a623;color:#0b1120;border:2px solid #0b1120;font-size:10px;font-weight:900;letter-spacing:.05em;transform:rotate(10deg);box-shadow:1px 1px 0 #0b1120}
.qll-mini{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;z-index:2}
.qll-card{position:absolute;right:0;bottom:calc(100% + 14px);width:min(290px,calc(100vw - 32px));padding:16px;border-radius:20px;background:#fff;color:#0b1120;border:3px solid #0b1120;box-shadow:6px 6px 0 #10b981;transform-origin:92% 100%;animation:qll-card-in .35s cubic-bezier(.2,1.2,.4,1) backwards;text-align:left}
@keyframes qll-card-in{from{opacity:0;transform:scale(.6) translateY(14px)}}
.qll-card-top{display:flex;align-items:center;gap:10px;padding-right:26px}
.qll-card-top img{width:46px;height:46px;border-radius:12px;object-fit:cover;border:2px solid #0b1120;flex:none}
.qll-card-top b{font-size:17px;font-weight:900;margin-right:8px}
.qll-card-by{display:block;margin-top:2px;font-size:11px;font-weight:800;color:#6b7280}.qll-card-by em{font-style:normal;color:#ef4444}
.qll-card-new{padding:2px 7px;border-radius:999px;background:#f6a623;border:2px solid #0b1120;font-size:10px;font-weight:900;letter-spacing:.05em}
.qll-card p{margin:10px 0 12px;font-size:13.5px;line-height:1.4;font-weight:600;color:#374151}
.qll-card-cta{display:block;text-align:center;padding:.7em 1em;border-radius:12px;background:#10b981;color:#052e1f;border:2px solid #0b1120;box-shadow:3px 3px 0 #0b1120;font-weight:900;font-size:14px;text-decoration:none}
.qll-card-cta:hover{background:#34d399}
.qll-card-x{all:unset;position:absolute;top:10px;right:10px;width:26px;height:26px;display:grid;place-items:center;cursor:pointer;border-radius:50%;color:#6b7280}
.qll-card-x:hover{background:#f3f4f6;color:#0b1120}.qll-card-x svg{width:15px;height:15px}
.qll-card-x:focus-visible,.qll-card-cta:focus-visible{outline:3px solid #10b981;outline-offset:2px}

@media (prefers-reduced-motion:reduce){
  .qll-root,.qll-root *,.qll-corner,.qll-corner *{animation:none!important;transition:none!important}
}
`;
