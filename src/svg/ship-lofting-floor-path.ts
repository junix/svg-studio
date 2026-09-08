// ship-lofting-floor — path-grammar table.
// A small, complete parser for SVG path data (M L H V C S Q T A Z, upper/lower case, implicit command
// repetition, compact number syntax, arc flags without separators). It normalises every drawn segment into
// {absolute string, relative string, start, end, written controls, reflected controls} so the scene can
// show the same geometry in both notations (concept:relative-vs-absolute-commands) and reveal the control
// net of any segment on hover (concept:smooth-cubic-reflection / concept:smooth-quadratic-reflection).
// getPathData() is unavailable in Firefox and in the reference Chromium, so this table is authoritative.
import { fmt } from './lib';

export interface Pt { x: number; y: number }

export interface RawSeg { cmd: string; params: number[] }

export interface Seg {
  /** command letter exactly as written in the source d (case preserved) */
  cmd: string;
  /** canonical absolute notation, e.g. `C 380 604 460 598 516 588` */
  abs: string;
  /** canonical relative notation, e.g. `c 140 0 220 -6 276 -16` */
  rel: string;
  start: Pt;
  end: Pt;
  /** control points written in the d string (absolute coordinates) */
  ctrl: Pt[];
  /** control points derived by reflection (S/T) — never written, mirrored from the previous segment */
  reflected: Pt[];
  /** the previous segment's last control point that was mirrored to produce `reflected[0]` */
  mirror: Pt | null;
  /** arc parameters for A/a segments (rx ry rotation large-arc sweep) */
  arc?: { rx: number; ry: number; rot: number; laf: number; sf: number };
  /** arc-length position of start / end along the whole path (from getTotalLength on prefix probes) */
  len0: number;
  len1: number;
  /** 24 evenly spaced samples (getPointAtLength) used for pointer hit-testing */
  samples: Pt[];
  index: number;
  path: SVGPathElement;
}

const PARAM_COUNT: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;

/** Tokenise path data into raw commands. Handles implicit repetition (`M10 10 50 50` → M then L) and arc
 *  flags glued to the following number (`a25 25 0 1130 0` → flags 1 1, dx 30). */
export function tokenize(d: string): RawSeg[] {
  const out: RawSeg[] = [];
  let i = 0;
  let cmd = '';
  const skip = () => { while (i < d.length && /[\s,]/.test(d[i])) i++; };
  const readNumber = () => {
    skip();
    const m = NUMBER.exec(d.slice(i));
    if (!m) throw new Error(`ship-lofting-floor: bad number at ${i} in "${d}"`);
    i += m[0].length;
    return parseFloat(m[0]);
  };
  const readFlag = () => {
    skip();
    const c = d[i];
    if (c !== '0' && c !== '1') throw new Error(`ship-lofting-floor: bad arc flag at ${i} in "${d}"`);
    i++;
    return Number(c);
  };
  for (;;) {
    skip();
    if (i >= d.length) break;
    const c = d[i];
    if (/[A-Za-z]/.test(c)) {
      cmd = c;
      i++;
      if (cmd === 'Z' || cmd === 'z') { out.push({ cmd, params: [] }); continue; }
    } else if (!cmd || cmd === 'Z' || cmd === 'z') {
      throw new Error(`ship-lofting-floor: path data must start with a moveto ("${d}")`);
    }
    const upper = cmd.toUpperCase();
    const count = PARAM_COUNT[upper];
    if (count === undefined) throw new Error(`ship-lofting-floor: unknown command ${cmd}`);
    const params: number[] = [];
    for (let k = 0; k < count; k++) params.push(upper === 'A' && (k === 3 || k === 4) ? readFlag() : readNumber());
    out.push({ cmd, params });
    // implicit repetition: numbers after a moveto continue as lineto of the same case
    if (cmd === 'M') cmd = 'L'; else if (cmd === 'm') cmd = 'l';
  }
  return out;
}

const n = (v: number): string => fmt(Math.abs(v) < 1e-9 ? 0 : v, 3);
const pt = (p: Pt): string => `${n(p.x)} ${n(p.y)}`;
const dpt = (p: Pt, o: Pt): string => `${n(p.x - o.x)} ${n(p.y - o.y)}`;

type Analysed = Omit<Seg, 'len0' | 'len1' | 'samples' | 'path'>;

/** Normalise raw commands into absolute + relative notation with control-point bookkeeping. */
export function analyse(d: string): Analysed[] {
  const raws = tokenize(d);
  const segs: Analysed[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let subStart: Pt = cur;
  let lastCubic: Pt | null = null;   // last control of previous C/S
  let lastQuad: Pt | null = null;    // control (written or reflected) of previous Q/T
  let prev = '';
  raws.forEach((raw, index) => {
    const upper = raw.cmd.toUpperCase();
    const relative = raw.cmd !== upper;
    const p = raw.params;
    const P = (x: number, y: number): Pt => relative ? { x: cur.x + x, y: cur.y + y } : { x, y };
    let seg: Analysed;
    switch (upper) {
      case 'M': {
        const end = P(p[0], p[1]);
        subStart = end;
        seg = { cmd: raw.cmd, abs: `M ${pt(end)}`, rel: `m ${dpt(end, cur)}`, start: cur, end, ctrl: [], reflected: [], mirror: null, index };
        break;
      }
      case 'L': {
        const end = P(p[0], p[1]);
        seg = { cmd: raw.cmd, abs: `L ${pt(end)}`, rel: `l ${dpt(end, cur)}`, start: cur, end, ctrl: [], reflected: [], mirror: null, index };
        break;
      }
      case 'H': {
        const end = { x: relative ? cur.x + p[0] : p[0], y: cur.y };
        seg = { cmd: raw.cmd, abs: `H ${n(end.x)}`, rel: `h ${n(end.x - cur.x)}`, start: cur, end, ctrl: [], reflected: [], mirror: null, index };
        break;
      }
      case 'V': {
        const end = { x: cur.x, y: relative ? cur.y + p[0] : p[0] };
        seg = { cmd: raw.cmd, abs: `V ${n(end.y)}`, rel: `v ${n(end.y - cur.y)}`, start: cur, end, ctrl: [], reflected: [], mirror: null, index };
        break;
      }
      case 'C': {
        const c1 = P(p[0], p[1]), c2 = P(p[2], p[3]), end = P(p[4], p[5]);
        seg = { cmd: raw.cmd, abs: `C ${pt(c1)} ${pt(c2)} ${pt(end)}`, rel: `c ${dpt(c1, cur)} ${dpt(c2, cur)} ${dpt(end, cur)}`, start: cur, end, ctrl: [c1, c2], reflected: [], mirror: null, index };
        lastCubic = c2;
        break;
      }
      case 'S': {
        // concept:smooth-cubic-reflection — first control = reflection of previous C/S second control about the
        // current point; concept:smooth-command-without-predecessor — otherwise it collapses onto the current point
        const c2 = P(p[0], p[1]), end = P(p[2], p[3]);
        const hasPrev = (prev === 'C' || prev === 'S') && lastCubic !== null;
        const refl = hasPrev ? { x: 2 * cur.x - lastCubic!.x, y: 2 * cur.y - lastCubic!.y } : { ...cur };
        seg = { cmd: raw.cmd, abs: `S ${pt(c2)} ${pt(end)}`, rel: `s ${dpt(c2, cur)} ${dpt(end, cur)}`, start: cur, end, ctrl: [c2], reflected: [refl], mirror: hasPrev ? lastCubic : null, index };
        lastCubic = c2;
        break;
      }
      case 'Q': {
        const c = P(p[0], p[1]), end = P(p[2], p[3]);
        seg = { cmd: raw.cmd, abs: `Q ${pt(c)} ${pt(end)}`, rel: `q ${dpt(c, cur)} ${dpt(end, cur)}`, start: cur, end, ctrl: [c], reflected: [], mirror: null, index };
        lastQuad = c;
        break;
      }
      case 'T': {
        // concept:smooth-quadratic-reflection — control = reflection of previous Q/T control about the current point
        const end = P(p[0], p[1]);
        const hasPrev = (prev === 'Q' || prev === 'T') && lastQuad !== null;
        const refl = hasPrev ? { x: 2 * cur.x - lastQuad!.x, y: 2 * cur.y - lastQuad!.y } : { ...cur };
        seg = { cmd: raw.cmd, abs: `T ${pt(end)}`, rel: `t ${dpt(end, cur)}`, start: cur, end, ctrl: [], reflected: [refl], mirror: hasPrev ? lastQuad : null, index };
        lastQuad = refl;
        break;
      }
      case 'A': {
        const end = P(p[5], p[6]);
        const head = `${n(p[0])} ${n(p[1])} ${n(p[2])} ${p[3]} ${p[4]}`;
        seg = { cmd: raw.cmd, abs: `A ${head} ${pt(end)}`, rel: `a ${head} ${dpt(end, cur)}`, start: cur, end, ctrl: [], reflected: [], mirror: null, arc: { rx: p[0], ry: p[1], rot: p[2], laf: p[3], sf: p[4] }, index };
        break;
      }
      default: { // Z
        seg = { cmd: raw.cmd, abs: 'Z', rel: 'z', start: cur, end: subStart, ctrl: [], reflected: [], mirror: null, index };
      }
    }
    if (upper !== 'C' && upper !== 'S') lastCubic = null;
    if (upper !== 'Q' && upper !== 'T') lastQuad = null;
    cur = seg.end;
    prev = upper;
    segs.push(seg);
  });
  return segs;
}

/** Whole-path notation: `M x0 y0 …` in absolute commands and `m x0 y0 …` in relative commands. */
export const absoluteNotation = (segs: Pick<Seg, 'abs'>[]): string => segs.map(s => s.abs).join(' ');
export const relativeNotation = (segs: Pick<Seg, 'rel'>[]): string => segs.map(s => s.rel).join(' ');

/**
 * Build the segment table for a rendered path: arc-length bounds via prefix probes
 * (api:SVGGeometryElement.getTotalLength) and 24 hit-test samples per segment
 * (api:SVGGeometryElement.getPointAtLength).
 */
export function buildSegments(path: SVGPathElement, probe: SVGPathElement, d = path.getAttribute('d') ?? ''): Seg[] {
  const analysed = analyse(d);
  const out: Seg[] = [];
  let len0 = 0;
  for (let k = 0; k < analysed.length; k++) {
    probe.setAttribute('d', absoluteNotation(analysed.slice(0, k + 1)));
    const len1 = probe.getTotalLength();
    const samples: Pt[] = [];
    if (len1 - len0 > 0.5) {
      for (let s = 0; s < 24; s++) {
        const p = path.getPointAtLength(len0 + (len1 - len0) * s / 23);
        samples.push({ x: p.x, y: p.y });
      }
    }
    out.push({ ...analysed[k], len0, len1, samples, path });
    len0 = len1;
  }
  return out;
}

export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Nearest sampled segment to a user-space point; returns null beyond `threshold`. */
export function nearestSegment(segs: Seg[], p: Pt, threshold: number): Seg | null {
  let best: Seg | null = null;
  let bestD = threshold;
  for (const seg of segs) {
    for (const s of seg.samples) {
      const d = dist(s, p);
      if (d < bestD) { bestD = d; best = seg; }
    }
  }
  return best;
}
