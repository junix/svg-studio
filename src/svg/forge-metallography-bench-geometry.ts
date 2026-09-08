// forge-metallography-bench — geometry helpers.
// Everything the bench "engraves" is generated here at runtime: a 5×7 stencil font emitted as path
// sub-paths (no font files, no <image>), rounded/chamfered plates, the hexagonal maker's mark, the
// jittered hatch field, and a small Voronoi + Lloyd relaxation for the etched grain specimen.
// All randomness comes from a seeded mulberry32 so the scene is deterministic.

export interface Rect { x: number; y: number; w: number; h: number }
export interface Pt { x: number; y: number }

/** 5×7 stencil bitmaps (rows top→bottom, 'X' = cut cell). Only the glyphs the bench needs. */
const STENCIL: Record<string, string[]> = {
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  N: ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X', 'X...X'],
  '-': ['.....', '.....', '.....', 'XXXXX', '.....', '.....', '.....'],
  '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
  '1': ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  '7': ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
  A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  C: ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
  r: ['.....', '.....', 'X.XX.', 'XX..X', 'X....', 'X....', 'X....'],
  M: ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
  o: ['.....', '.....', '.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  F: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'X....'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

/** One glyph → horizontal runs of cut cells (merged per row so the path has few sub-paths). */
export function glyphRuns(ch: string, x: number, y: number, cell: number): Rect[] {
  const rows = STENCIL[ch] ?? STENCIL[' '];
  const runs: Rect[] = [];
  rows.forEach((row, r) => {
    let start = -1;
    for (let c = 0; c <= 5; c++) {
      const on = c < 5 && row[c] === 'X';
      if (on && start < 0) start = c;
      if (!on && start >= 0) { runs.push({ x: x + start * cell, y: y + r * cell, w: (c - start) * cell, h: cell }); start = -1; }
    }
  });
  return runs;
}

/** A string of stencil glyphs; `pitch` is the glyph advance in cells (5 cells + gap). */
export function textRuns(str: string, x: number, y: number, cell: number, pitch = 6): Rect[] {
  return [...str].flatMap((ch, i) => glyphRuns(ch, x + i * pitch * cell, y, cell));
}

export const textWidth = (str: string, cell: number, pitch = 6): number => (str.length * pitch - (pitch - 5)) * cell;

export const rectPath = (r: Rect): string => `M${f(r.x)} ${f(r.y)}h${f(r.w)}v${f(r.h)}h${f(-r.w)}Z`;
export const rectsPath = (rects: Rect[]): string => rects.map(rectPath).join('');

export function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
}

/** Bench plate outline: rectangle with four 45° chamfered corners. */
export function chamferRect(x: number, y: number, w: number, h: number, c: number): string {
  return `M${x + c} ${y}H${x + w - c}L${x + w} ${y + c}V${y + h - c}L${x + w - c} ${y + h}H${x + c}L${x} ${y + h - c}V${y + c}Z`;
}

export function hexagon(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + i * Math.PI / 3;
    return `${i ? 'L' : 'M'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  }).join('') + 'Z';
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

/** Quarter-disc wedge (for the four etch-specimen quadrants). q = 0..3 counter-clockwise from +x/+y. */
export function quadrant(cx: number, cy: number, r: number, q: number): string {
  const a0 = q * Math.PI / 2, a1 = a0 + Math.PI / 2;
  return `M${cx} ${cy}L${f(cx + r * Math.cos(a0))} ${f(cy + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f(cx + r * Math.cos(a1))} ${f(cy + r * Math.sin(a1))}Z`;
}

/**
 * Hatch field: horizontal slits at a fixed pitch whose start/end x and thickness are jittered by the
 * seeded PRNG. As sub-paths of the plate they become shallow grooves in the alpha height map.
 */
export function hatchRuns(x: number, y: number, w: number, h: number, step: number, rng: () => number, thickness: [number, number] = [1.1, 1.8]): Rect[] {
  const runs: Rect[] = [];
  for (let yy = y; yy + thickness[1] <= y + h; yy += step) {
    const x0 = x + rng() * 18, x1 = x + w - rng() * 18;
    runs.push({ x: x0, y: yy, w: x1 - x0, h: thickness[0] + rng() * (thickness[1] - thickness[0]) });
  }
  return runs;
}

// ---------- Voronoi grain network (half-plane clipping + Lloyd relaxation) ----------

function clipHalfPlane(poly: Pt[], a: Pt, b: Pt): Pt[] {
  // keep points closer to `a` than to `b`: 2p·(b−a) − (|b|²−|a|²) ≤ 0
  const nx = b.x - a.x, ny = b.y - a.y, c = b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y;
  const side = (p: Pt) => 2 * (p.x * nx + p.y * ny) - c;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp <= 0) !== (sq <= 0)) { const t = sp / (sp - sq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); }
  }
  return out;
}

function centroid(poly: Pt[]): Pt {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const cross = p.x * q.y - q.x * p.y;
    a += cross; cx += (p.x + q.x) * cross; cy += (p.y + q.y) * cross;
  }
  if (Math.abs(a) < 1e-9) return poly[0];
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Voronoi cells of `seeds` clipped to a disc, relaxed `rounds` times toward cell centroids. */
export function voronoiDisc(seedsIn: Pt[], cx: number, cy: number, r: number, rounds: number): { seeds: Pt[]; cells: Pt[][] } {
  const disc: Pt[] = Array.from({ length: 48 }, (_, i) => ({ x: cx + r * Math.cos(i / 48 * 2 * Math.PI), y: cy + r * Math.sin(i / 48 * 2 * Math.PI) }));
  let seeds = seedsIn;
  let cells: Pt[][] = [];
  for (let round = 0; round <= rounds; round++) {
    cells = seeds.map((s, i) => seeds.reduce((poly, o, j) => (j === i ? poly : clipHalfPlane(poly, s, o)), disc));
    if (round < rounds) seeds = cells.map((cell, i) => (cell.length ? centroid(cell) : seeds[i]));
  }
  return { seeds, cells };
}

export const polyPath = (poly: Pt[]): string => poly.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join('') + 'Z';

const f = (n: number): string => (Math.round(n * 100) / 100).toString();
