// four-colour-press-check — the three procedural bitmaps (all other artwork is vector) plus the
// offscreen rasteriser used to *measure* what the browser actually drew (edge widths, pixel columns,
// gradient midpoints). Everything is deterministic: mulberry32, no Date / Math.random.
import { mulberry32 } from './lib';

export const SRC_W = 320;
export const SRC_H = 200;

/** Bench geometry shared with the halftone screen bitmap so both dot lattices coincide. */
export const SCREEN_ORIGIN = { x: 596, y: 528 };
export const SCREEN_CELL = 8;
export const SCREEN_ANGLE = 45;

const canvas2d = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')!];
};

/**
 * The original artwork: an orange on blue cloth with press-test patches — C/M/Y/K solids 84×84 (they
 * become the 100% areas of each separation film and stay ≥40×40 at the films' 0.48 scale), R/G/B,
 * 18% and 50% neutral greys, a paper-white chip and a skin ramp. Dark content is kept small so the
 * skeleton black (K only for L < 0.375) leaves the sRGB round trip nearly exact.
 */
export function makeSourceImage(): string {
  const [c, ctx] = canvas2d(SRC_W, SRC_H);
  const rnd = mulberry32(0x5eed01);
  ctx.fillStyle = '#4f78b8';
  ctx.fillRect(0, 0, SRC_W, SRC_H);
  // woven cloth: alternating warp/weft hairlines with seeded jitter
  for (let y = 0; y < SRC_H; y += 2) {
    ctx.fillStyle = `rgba(255,255,255,${(0.03 + rnd() * 0.05).toFixed(3)})`;
    ctx.fillRect(0, y, 150, 1);
  }
  for (let x = 0; x < 150; x += 3) {
    ctx.fillStyle = `rgba(20,30,60,${(0.02 + rnd() * 0.05).toFixed(3)})`;
    ctx.fillRect(x, 0, 1, SRC_H);
  }
  // cast shadow (the only large dark area → skeleton black picks it up)
  ctx.fillStyle = '#2c3b5c';
  ctx.beginPath(); ctx.ellipse(86, 142, 48, 8, 0, 0, Math.PI * 2); ctx.fill();
  // the orange
  const g = ctx.createRadialGradient(64, 72, 6, 78, 88, 58);
  g.addColorStop(0, '#ffc86e'); g.addColorStop(0.35, '#f7952e'); g.addColorStop(0.8, '#e0701a'); g.addColorStop(1, '#c65e12');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(78, 88, 54, 0, Math.PI * 2); ctx.fill();
  // peel dimples
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 50;
    ctx.fillStyle = `rgba(150,70,10,${(0.08 + rnd() * 0.12).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(78 + Math.cos(a) * r, 88 + Math.sin(a) * r, 0.9, 0, Math.PI * 2); ctx.fill();
  }
  // stem + leaf
  ctx.fillStyle = '#4d7a35';
  ctx.fillRect(76, 30, 5, 9);
  ctx.beginPath(); ctx.ellipse(92, 38, 16, 6, -0.5, 0, Math.PI * 2); ctx.fill();
  // press-test patches: C M / Y K solids (84×84 each, flush), then R G B / 18% / 50% chips
  const solid: Array<[string, number, number, number, number]> = [
    ['#00ffff', 152, 0, 84, 84], ['#ff00ff', 236, 0, 84, 84], ['#ffff00', 152, 84, 84, 84], ['#000000', 236, 84, 84, 84],
    ['#ff0000', 152, 172, 30, 28], ['#00ff00', 184, 172, 30, 28], ['#0000ff', 216, 172, 30, 28], ['#767676', 248, 172, 30, 28], ['#bcbcbc', 280, 172, 40, 28],
  ];
  for (const [fill, x, y, w, h] of solid) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  // skin ramp
  const skin = ctx.createLinearGradient(8, 0, 148, 0);
  skin.addColorStop(0, '#f9dcc4'); skin.addColorStop(1, '#b8794f');
  ctx.fillStyle = skin; ctx.fillRect(8, 176, 140, 16);
  ctx.fillStyle = '#f4f1ea'; ctx.fillRect(8, 8, 40, 12); // paper-white reference chip
  return c.toDataURL('image/png');
}

/**
 * 45° halftone screen, 8 px cell, pre-tiled 640×400. Stores the *inverted* threshold
 * s' = 1 − min(1, π·d²/cell²) so that `feComposite arithmetic k2=.5 k3=.5` (alpha stays 1) yields
 * 0.5 + 0.5·(tone − s): ink wherever tone > s, dot area = tone × cell area. The lattice is phase-locked
 * to the vector `<pattern patternTransform="rotate(45)">` on the other half of the bench.
 */
export function makeScreenBitmap(): string {
  const w = 640, h = 400;
  const [c, ctx] = canvas2d(w, h);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const th = -SCREEN_ANGLE * Math.PI / 180, cos = Math.cos(th), sin = Math.sin(th);
  const cell = SCREEN_CELL, half = cell / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ux = SCREEN_ORIGIN.x + x + 0.5, uy = SCREEN_ORIGIN.y + y + 0.5;   // stage coordinates
    const px = ux * cos - uy * sin, py = ux * sin + uy * cos;               // into pattern space (rotate −45)
    const fu = px - half - Math.round((px - half) / cell) * cell;
    const fv = py - half - Math.round((py - half) / cell) * cell;
    const s = Math.min(1, Math.PI * (fu * fu + fv * fv) / (cell * cell));
    const i = (y * w + x) * 4, v = Math.round((1 - s) * 255);
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

/** 128×128 blue-ish noise: seeded white noise minus its 3×3 mean (a cheap high-pass), re-centred at 0.5. */
export function makeNoiseBitmap(): string {
  const n = 128;
  const rnd = mulberry32(0xb14e);
  const white = Float32Array.from({ length: n * n }, () => rnd());
  const [c, ctx] = canvas2d(n, n);
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let sum = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += white[((y + dy + n) % n) * n + (x + dx + n) % n];
    const v = Math.max(0, Math.min(1, 0.5 + (white[y * n + x] - sum / 9) * 2.2));
    const i = (y * n + x) * 4, g = Math.round(v * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = g; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

/**
 * Rasterise an SVG fragment (same defs as the stage) through an <img> into a canvas and return the
 * pixels. `viewBox` selects the stage region, `scale` the device pixels per user unit — the same
 * mechanism the loupe's `<use transform="scale(8)">` relies on, so the numbers describe what the
 * viewer sees. Resolves to null if the browser refuses (tainted canvas, decode failure).
 */
export async function rasterize(markup: string, viewBox: [number, number, number, number], scale: number): Promise<ImageData | null> {
  const [vx, vy, vw, vh] = viewBox;
  const w = Math.round(vw * scale), h = Math.round(vh * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">${markup}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const [c, ctx] = canvas2d(w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Luminance row (0..255) of an ImageData scanline, alpha-composited over white. */
export function scanRow(img: ImageData, y: number): number[] {
  const out: number[] = [];
  const row = Math.max(0, Math.min(img.height - 1, y));
  for (let x = 0; x < img.width; x++) {
    const i = (row * img.width + x) * 4;
    const a = img.data[i + 3] / 255;
    const l = 0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2];
    out.push(Math.round(l * a + 255 * (1 - a)));
  }
  return out;
}

/** Paint an ImageData into a canvas and return it as a PNG data URI (for the pixel-zoom `<image>`s). */
export function imageDataToDataUrl(img: ImageData): string {
  const [c, ctx] = canvas2d(img.width, img.height);
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export interface RunStats { edgeWidth: number; pitch: number; runs: number; inkFraction: number }

/**
 * Along a luminance scanline, segment paper/ink runs and measure: the median width of the grey
 * transition between them, the mean spacing of ink-run centres, and the ink fraction.
 */
export function measureRuns(row: number[], paper: number, ink: number): RunStats {
  const lo = ink + (paper - ink) * 0.12, hi = paper - (paper - ink) * 0.12;
  const state = (v: number) => (v <= lo ? 'ink' : v >= hi ? 'paper' : 'edge');
  const edges: number[] = [];
  const centres: number[] = [];
  let i = 0, inkPixels = 0;
  while (i < row.length) {
    const s = state(row[i]);
    let j = i;
    while (j < row.length && state(row[j]) === s) j++;
    if (s === 'edge' && i > 0 && j < row.length) edges.push(j - i);
    if (s === 'ink') { centres.push((i + j - 1) / 2); inkPixels += j - i; }
    i = j;
  }
  edges.sort((a, b) => a - b);
  const median = edges.length ? edges[Math.floor(edges.length / 2)] : 0;
  let pitch = 0;
  if (centres.length > 1) { for (let k = 1; k < centres.length; k++) pitch += centres[k] - centres[k - 1]; pitch /= centres.length - 1; }
  return { edgeWidth: median, pitch, runs: centres.length, inkFraction: inkPixels / row.length };
}
