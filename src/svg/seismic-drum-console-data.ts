// seismic-drum-console — data layer: deterministic seismogram synthesis, the three coordinate layers
// (screen px → 台面 stage units → 记录纸 paper units), viewport fitting math (meet / slice) and formatting.
// Nothing in here touches the DOM, so the numbers the readout bar prints can be reproduced by hand.

// ---- paper space (相机嵌套视口的 viewBox 单位): 1440 wide = 60 min (24 units/min, 1 unit = 2.5 s), 840 = 24 rows × 35
export const PAPER_W = 1440, PAPER_H = 840, ROW_H = 35, UNITS_PER_MIN = 24, SEC_PER_UNIT = 2.5;
export const TRACE_X0 = 36, TRACE_X1 = 1404;                    // pen travel on a row (paper margins 1.5 min each side)
export const TRACE_LEN = TRACE_X1 - TRACE_X0;                   // 1368 units
export const ROW_TRAVEL = 0.82;                                 // pens spend 82% of a loop writing the row, 18% flying back
export const ROW_FRACTION = 0.4675;                             // row segment ≈ 46.75% of the motion path length (≈2926)
export const LOOP_MS = 24000;

// ---- 台面 layout rectangles (stage user units), straight from the plan §2
export const R = {
  header: { x: 16, y: 16, w: 1368, h: 88 },
  controls: { x: 16, y: 120, w: 164, h: 570 },
  target: { x: 24, y: 706, w: 148, h: 148 },
  camera: { x: 196, y: 128, w: 960, h: 520 },
  ruler: { x: 196, y: 656, w: 960, h: 32 },
  overview: { x: 196, y: 700, w: 304, h: 132 },
  calib: { x: 516, y: 700, w: 400, h: 100 },
  overflow: { x: 516, y: 812, w: 400, h: 72 },
  readout: { x: 936, y: 700, w: 448, h: 184 },
  feed: { x: 1172, y: 128, w: 210, h: 520 },
} as const;

// ---- palette (smoked amber paper in a dark console)
export const C = {
  panel: '#17110c', panelEdge: '#5a4222', paper: '#2a1d10', grid: '#4a3418', gridMinor: '#3a2914',
  sealed: '#8a6b46', recording: '#ffcf7a', flag: '#ffae3c', blank: '#3b2c19',
  cream: '#f2e3c4', muted: '#a58f6a', dim: '#6f5d42', amber: '#f0b352', cyan: '#5fd7e0',
  green: '#5ce0a0', red: '#ff6b6b', yellow: '#ffd84a', blue: '#7fb2ff', magenta: '#ff8ad4',
  mouse: '#7fb2ff', pen: '#ff8ad4', touch: '#5ce0a0',
} as const;

// ---- PRNG: xorshift32 (plan §4), seed 20260907
export function xorshift32(seed: number): () => number {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export type RowState = 'sealed' | 'recording' | 'flagged' | 'blank';

export interface Row {
  hour: number;
  state: RowState;
  /** decimated trace points in row-local paper units (baseline y = 17.5), 360 points */
  pts: { x: number; y: number }[];
  /** cumulative arc length at each decimated point */
  cum: number[];
  /** total polyline length */
  length: number;
  /** path data (M + L polyline) */
  d: string;
  /** event arrivals (P/S) in paper x, when the hour carries an event */
  events: { label: string; x: number }[];
}

export const stateOf = (hour: number): RowState => {
  if (hour <= 8) return 'sealed';
  if (hour <= 11) return 'recording';
  if (hour <= 13) return 'blank';                 // paper splice: the jitter band lives here
  if (hour === 14 || hour === 17) return 'flagged';
  return 'sealed';
};

/** Synthesize one day of drum paper: pink-noise baseline + P/S wave packets at 14h and 17h, clipped to ±15. */
export function generateDay(seed = 20260907): Row[] {
  const rnd = xorshift32(seed);
  const rows: Row[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const state = stateOf(hour);
    const samples = new Float64Array(1440);
    // Voss-McCartney pink noise: 6 octaves of held random values, each octave refreshed every 2^j samples
    const held = new Float64Array(6);
    for (let i = 0; i < 1440; i++) {
      let v = 0;
      for (let j = 0; j < 6; j++) {
        if (i % (1 << j) === 0) held[j] = rnd() * 2 - 1;
        v += held[j];
      }
      samples[i] = v * 0.9 + (rnd() - 0.5) * 0.6;
    }
    const events: { label: string; x: number }[] = [];
    if (hour === 14 || hour === 17) {
      // P arrival then S arrival 3.5 min later; exponentially decaying sines, S larger and slower
      const p0 = hour === 14 ? 288 : 610;                       // paper x of P arrival (12 min / 25.4 min)
      const s0 = p0 + 3.5 * UNITS_PER_MIN;
      const wave = (i: number, t0: number, amp: number, freq: number, decay: number): number => {
        const dt = i - t0;
        return dt < 0 ? 0 : amp * Math.exp(-dt / decay) * Math.sin(dt * freq);
      };
      for (let i = 0; i < 1440; i++) {
        samples[i] += wave(i, p0, 9, 0.9, 70) + wave(i, s0, 22, 0.45, 160) + wave(i, s0 + 40, 6, 1.3, 220);
      }
      events.push({ label: 'P', x: TRACE_X0 + p0 * (TRACE_LEN / 1440) }, { label: 'S', x: TRACE_X0 + s0 * (TRACE_LEN / 1440) });
    }
    for (let i = 0; i < 1440; i++) samples[i] = Math.max(-15, Math.min(15, samples[i]));
    // decimate to 360 points (every 4th sample) — the drawn geometry and the arc-length table share these points
    const pts: { x: number; y: number }[] = [];
    if (state !== 'blank') {
      for (let i = 0; i < 1440; i += 4) pts.push({ x: TRACE_X0 + i * (TRACE_LEN / 1440), y: ROW_H / 2 - samples[i] });
      pts.push({ x: TRACE_X1, y: ROW_H / 2 - samples[1439] });
    }
    const cum: number[] = [];
    let length = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) length += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      cum.push(length);
    }
    const d = pts.length ? 'M' + pts.map((p, i) => `${i ? 'L' : ''}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') : '';
    rows.push({ hour, state, pts, cum, length, d, events });
  }
  return rows;
}

/** Arc length already drawn when the pen tip sits at paper x (linear interpolation on the cumLen table). */
export function arcAtX(row: Row, x: number): number {
  const { pts, cum } = row;
  if (!pts.length || x <= pts[0].x) return 0;
  if (x >= pts[pts.length - 1].x) return row.length;
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid].x <= x) lo = mid; else hi = mid; }
  const f = (x - pts[lo].x) / (pts[hi].x - pts[lo].x);
  return cum[lo] + f * (cum[hi] - cum[lo]);
}

/** Pen x on the row for a loop phase in [0,1): linear during the writing segment, parked at the ends otherwise. */
export const penXAtPhase = (phase: number): number => phase <= ROW_TRAVEL ? TRACE_X0 + TRACE_LEN * (phase / ROW_TRAVEL) : TRACE_X1;

/** CSS offset-distance (percent of the motion path) for a loop phase: 0→0, 82%→46.75%, 100%→100%. */
export const offsetPctAtPhase = (phase: number): number =>
  phase <= ROW_TRAVEL ? ROW_FRACTION * 100 * (phase / ROW_TRAVEL) : ROW_FRACTION * 100 + (100 - ROW_FRACTION * 100) * ((phase - ROW_TRAVEL) / (1 - ROW_TRAVEL));

/** Inverse of offsetPctAtPhase (used to read a CSS pen's phase back from getComputedStyle). */
export const phaseAtOffsetPct = (pct: number): number =>
  pct <= ROW_FRACTION * 100 ? ROW_TRAVEL * pct / (ROW_FRACTION * 100) : ROW_TRAVEL + (1 - ROW_TRAVEL) * (pct - ROW_FRACTION * 100) / (100 - ROW_FRACTION * 100);

/** Motion path of a pen writing at row baseline yc: right along the row, up-and-back arc, left return, arc down (plan §6). */
export const penPathD = (yc: number): string =>
  `M ${TRACE_X0} ${yc} H ${TRACE_X1} C 1432 ${yc} 1432 ${yc - 30} ${TRACE_X1} ${yc - 30} H ${TRACE_X0} C 8 ${yc - 30} 8 ${yc} ${TRACE_X0} ${yc} Z`;

// ---- viewport fitting (the same arithmetic the browser applies for preserveAspectRatio xMidYMid meet|slice)
export interface Fit { k: number; tx: number; ty: number; gapX: number; gapY: number }
/** Map viewBox (vx,vy,vw,vh) into viewport (x0,y0,w,h): outer = tx + k·inner. gapX/gapY are the letterbox (meet) or crop (slice) per side. */
export function fitViewport(x0: number, y0: number, w: number, h: number, vx: number, vy: number, vw: number, vh: number, slice = false): Fit {
  const k = slice ? Math.max(w / vw, h / vh) : Math.min(w / vw, h / vh);
  const gapX = (w - vw * k) / 2, gapY = (h - vh * k) / 2;
  return { k, tx: x0 + gapX - vx * k, ty: y0 + gapY - vy * k, gapX, gapY };
}

/** Ruler step: first of {1,2,5,10,15} minutes whose tick pitch is ≥ 26 stage px at scale k. */
export function pickStep(k: number): number {
  for (const step of [1, 2, 5, 10, 15]) if (step * UNITS_PER_MIN * k >= 26) return step;
  return 15;
}

/** Travel time of a paper point: floor(y/35) hours + x·2.5 s. Returned in seconds (may fall outside the paper). */
export const travelSeconds = (x: number, y: number): number => Math.floor(y / ROW_H) * 3600 + x * SEC_PER_UNIT;

/** hh:mm:ss.mmm, with a sign for points off the paper. */
export function fmtTime(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const s = Math.abs(seconds);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const whole = Math.floor(sec), ms = Math.round((sec - whole) * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${sign}${pad(h)}:${pad(m)}:${pad(ms === 1000 ? whole + 1 : whole)}.${pad(ms === 1000 ? 0 : ms, 3)}`;
}

export const f2 = (n: number): string => (Math.abs(n) < 5e-3 ? 0 : n).toFixed(2);
export const f3 = (n: number): string => n.toFixed(3);
export const signed = (n: number, digits = 3): string => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(digits)}`;
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Deterministic frame-interval series for the jitter band's export still (240 frames, a few dropped frames). */
export function presetFrameIntervals(seed = 7): number[] {
  const rnd = xorshift32(seed);
  const out: number[] = [];
  for (let i = 0; i < 240; i++) {
    let dt = 16.67 + (rnd() - 0.5) * 2.4;
    if (i === 47 || i === 133 || i === 201) dt = 33.4 + rnd() * 4;   // dropped frames
    if (i === 88) dt = 24.9;
    out.push(dt);
  }
  return out;
}
