// guilloche-intaglio-plate — curve generators (docs/svg-feature-demos.md §3.4, construction notes 2–3).
// Pure geometry: trochoid families as multi-subpath `d` strings, rounded-rect ground-band rings,
// the S-1 proof sample cut out of the H-11 family, and the rosette petal ribbon.

export type TrochoidKind = 'hypo' | 'epi';

export interface Family {
  /** Plate name printed on the readout panel, e.g. `H-11`. */
  id: string;
  kind: TrochoidKind;
  R: number;
  r: number;
  d: number;
  /** Curves per family; phases advance by 360°/N. */
  N: number;
  /** Lobe count (R/r). */
  lobes: number;
  /** Hover annulus [inner, outer] radius in field coordinates (readout band, not the full extent). */
  hit: [number, number];
}

// The four families of construction note 3. Radii are chosen so every curve stays outside the
// 150-unit hollow that becomes the window (150×1.18 ≈ 177 by 150×0.72 ≈ 108 on the plate).
export const FAMILIES: Record<'E7' | 'H11' | 'H19' | 'E5', Family> = {
  E7:  { id: 'E-7',  kind: 'epi',  R: 210, r: 30, d: 64, N: 72, lobes: 7,  hit: [255, 304] }, // 176..304  outer ring
  H11: { id: 'H-11', kind: 'hypo', R: 264, r: 24, d: 48, N: 96, lobes: 11, hit: [225, 255] }, // 192..288  middle ring
  H19: { id: 'H-19', kind: 'hypo', R: 228, r: 12, d: 34, N: 64, lobes: 19, hit: [195, 225] }, // 182..250  inner ring
  E5:  { id: 'E-5',  kind: 'epi',  R: 150, r: 30, d: 30, N: 48, lobes: 5,  hit: [150, 195] }, // 150..210  window ring
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const f2 = (n: number): string => (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');

/** Radial extent [min, max] of a family. */
export const extent = (f: Family): [number, number] =>
  f.kind === 'hypo' ? [f.R - f.r - f.d, f.R - f.r + f.d] : [f.R + f.r - f.d, f.R + f.r + f.d];

/**
 * One trochoid curve as points. Hypotrochoid: x=(R−r)cos t + d·cos(((R−r)/r)t), y=(R−r)sin t − d·sin(((R−r)/r)t);
 * epitrochoid: x=(R+r)cos t − d·cos(((R+r)/r)t), y=(R+r)sin t − d·sin(((R+r)/r)t). t runs over
 * [0, 2π·r/gcd(R,r)] in `steps` samples; `phase` rotates the whole curve (radians).
 */
export function trochoid(f: Family, phase: number, steps = 288, scale = 1): [number, number][] {
  const period = (2 * Math.PI * f.r) / gcd(f.R, f.r);
  const k = f.kind === 'hypo' ? (f.R - f.r) / f.r : (f.R + f.r) / f.r;
  const base = f.kind === 'hypo' ? f.R - f.r : f.R + f.r;
  const sgn = f.kind === 'hypo' ? 1 : -1;
  const cosP = Math.cos(phase), sinP = Math.sin(phase);
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (period * i) / steps;
    const x = base * Math.cos(t) + sgn * f.d * Math.cos(k * t);
    const y = base * Math.sin(t) - f.d * Math.sin(k * t);
    pts.push([(x * cosP - y * sinP) * scale, (x * sinP + y * cosP) * scale]);
  }
  return pts;
}

/** Polyline → closed `M … L … Z` subpath around (cx, cy), two decimals. */
export const polyD = (pts: [number, number][], cx = 0, cy = 0, close = true): string =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f2(cx + x)} ${f2(cy + y)}`).join('') + (close ? 'Z' : '');

/**
 * A whole family in ONE `d` string: `count` curves with phases 360°/N apart (optionally offset by half
 * a step for the highlight pass), so four elements carry ~280 curves (construction note 2).
 */
export function familyD(f: Family, cx: number, cy: number, opts: { count?: number; halfStep?: boolean; steps?: number; scale?: number } = {}): string {
  const count = opts.count ?? f.N;
  const step = (2 * Math.PI) / f.N;
  const offset = opts.halfStep ? step / 2 : 0;
  const stride = Math.max(1, Math.round(f.N / count));
  let d = '';
  for (let i = 0; i < count; i++) d += polyD(trochoid(f, i * stride * step + offset, opts.steps ?? 288, opts.scale ?? 1), cx, cy);
  return d;
}

/** Rounded rectangle as a closed path (used for the ground-band rings under the frame). */
export function roundedRectD(x: number, y: number, w: number, h: number, rx: number): string {
  const r = Math.max(0, Math.min(rx, w / 2, h / 2));
  return `M${f2(x + r)} ${f2(y)}H${f2(x + w - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w)} ${f2(y + r)}V${f2(y + h - r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w - r)} ${f2(y + h)}H${f2(x + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x)} ${f2(y + h - r)}V${f2(y + r)}A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + r)} ${f2(y)}Z`;
}

/**
 * Paper-thickness sliver: the region between the frame outline shifted down by `d − thick` and by `d`,
 * restricted to the lower half (construction note 1: three bands at +4/+8/+12 fake the sheet thickness).
 */
export function bottomBandD(x: number, y: number, w: number, h: number, rx: number, d: number, thick: number): string {
  const yb = y + h, r = rx;
  const lo = d, hi = d - thick;
  return [
    `M${f2(x)} ${f2(yb - r + hi)}`,
    `V${f2(yb - r + lo)}`,
    `A${r} ${r} 0 0 0 ${f2(x + r)} ${f2(yb + lo)}`,
    `H${f2(x + w - r)}`,
    `A${r} ${r} 0 0 0 ${f2(x + w)} ${f2(yb - r + lo)}`,
    `V${f2(yb - r + hi)}`,
    `A${r} ${r} 0 0 1 ${f2(x + w - r)} ${f2(yb + hi)}`,
    `H${f2(x + r)}`,
    `A${r} ${r} 0 0 1 ${f2(x)} ${f2(yb - r + hi)}Z`,
  ].join('');
}

/**
 * S-1 proof sample (construction note 10): a `w × h` window cut from the H-11 family near the top of the ring,
 * returned as open `M/L` fragments positioned with the window's left-middle at the local origin (x 0..w, y −h/2..h/2).
 */
export function sampleS1D(w: number, h: number): string {
  const f = FAMILIES.H11;
  const [rMin, rMax] = extent(f);
  const cyWin = -(rMin + rMax) / 2;           // window centred radially on the ring, at its top
  const step = (2 * Math.PI) / f.N;
  let d = '';
  for (let i = 0; i < f.N; i++) {
    const pts = trochoid(f, i * step, 720);
    let run: [number, number][] = [];
    const flush = () => { if (run.length > 1) d += polyD(run, w / 2, -cyWin, false); run = []; };
    for (const [x, y] of pts) {
      if (Math.abs(x) <= w / 2 && Math.abs(y - cyWin) <= h / 2) run.push([x, y]); else flush();
    }
    flush();
  }
  return d;
}

/** A tiny closed rosette (one hypotrochoid with several phases in one path) for satellites, wastes and corners. */
export function miniRosetteD(radius: number, phases = 6, lobes = 5): string {
  const f: Family = { id: 'mini', kind: 'hypo', R: lobes * 3, r: 3, d: 7, N: phases, lobes, hit: [0, 0] };
  const [, rMax] = extent(f);
  return familyD(f, 0, 0, { count: phases, steps: 144, scale: radius / rMax });
}

/**
 * One petal ribbon pointing along angle `deg` in unit-circle space (tip at radius 1), scaled by `s`.
 * Two cubic arcs; half-width 0.075 so 24 petals just touch at their widest.
 */
export function petalD(deg: number, s: number): string {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
  const P = (x: number, y: number): string => `${f2((x * c - y * sn) * s)} ${f2((x * sn + y * c) * s)}`;
  return `M${P(0.28, 0)}C${P(0.5, 0.078)} ${P(0.85, 0.07)} ${P(1, 0)}C${P(0.85, -0.07)} ${P(0.5, -0.078)} ${P(0.28, 0)}Z`;
}

/** Points of one H-11 curve scaled to pass through (px, py) relative to the root — for the pen-pin trajectory. */
export function trajectoryThrough(px: number, py: number, spanDeg = 130, steps = 220): [number, number][] {
  const f = FAMILIES.H11;
  const target = Math.hypot(px, py);
  const [rMin, rMax] = extent(f);
  const scale = target / ((rMin + rMax) / 2);
  const raw = trochoid(f, 0, 2880, scale);
  // find a sample whose radius matches the pin radius, then rotate the curve so that sample lands on the pin
  let best = 0, err = Infinity;
  raw.forEach(([x, y], i) => { const e = Math.abs(Math.hypot(x, y) - target); if (e < err) { err = e; best = i; } });
  const [bx, by] = raw[best];
  const phase = Math.atan2(py, px) - Math.atan2(by, bx);
  const rotated = trochoid(f, phase, 2880, scale);
  const half = Math.round((2880 * spanDeg) / 360 / 2);
  const out: [number, number][] = [];
  for (let k = -half; k <= half; k += Math.max(1, Math.round((2 * half) / steps))) out.push(rotated[(best + k + 2880) % 2880]);
  return out;
}
