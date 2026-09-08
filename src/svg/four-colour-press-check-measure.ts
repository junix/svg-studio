// four-colour-press-check — measurements printed on the table. Each helper rasterises the same markup the
// stage shows (same <defs>) through <img> → canvas and scans pixels, so every printed number describes what
// this browser actually drew (构造要点 11/12/14/9: edge widths, pixel columns, transition counts, gradient mids).
import { rasterize, scanRow, measureRuns, imageDataToDataUrl, type RunStats } from './four-colour-press-check-bitmaps';

const wrap = (defs: string, body: string) => `<defs>${defs}</defs><g transform="translate(0.5 0.5)">${body}</g>`;

export interface LoupeReading { left: RunStats; right: RunStats }

/** ×8 view of the bench seam: left half vector pattern dots, right half feImage screen dots (paper 255, cyan ink ≈131). */
export async function measureLoupe(defs: string, art: string, cx: number, cy: number, r: number): Promise<LoupeReading | null> {
  const half = r / 8;
  const img = await rasterize(wrap(defs, art), [cx - half, cy - half, half * 2, half * 2], 8);
  if (!img) return null;
  const row = scanRow(img, Math.round(img.height / 2));
  const mid = Math.round(img.width / 2);
  return { left: measureRuns(row.slice(0, mid), 255, 131), right: measureRuns(row.slice(mid), 255, 131) };
}

export interface ColumnReading { columns: number; darkest: number; zoom: string }

/** 1× raster of a registration cross window; counts the dark columns of its vertical hairline and returns a pixel-zoom PNG. */
export async function measureCross(defs: string, body: string, x: number, y: number, w: number, h: number): Promise<ColumnReading | null> {
  const img = await rasterize(wrap(defs, body), [x, y, w, h], 1);
  if (!img) return null;
  const row = scanRow(img, 1); // row through the vertical arm only (above the horizontal arm)
  const dark = row.filter(v => v < 250);
  return { columns: dark.length, darkest: dark.length ? Math.min(...dark) : 255, zoom: imageDataToDataUrl(img) };
}

export interface TargetReading { transition: number; zoom: string }

/** 1× raster of one shape-rendering target; counts grey (anti-aliased) pixels along a row crossing its diagonal edges. */
export async function measureTarget(defs: string, body: string, x: number, y: number, size: number): Promise<TargetReading | null> {
  const img = await rasterize(wrap(defs, body), [x, y, size, size], 1);
  if (!img) return null;
  const row = scanRow(img, 2);
  const transition = row.filter(v => v > 12 && v < 243).length;
  return { transition, zoom: imageDataToDataUrl(img) };
}

/** Mean / max luminance of a filtered plate thumbnail (residual films, consistency film). */
export async function measureFilm(defs: string, filterId: string, scale: number): Promise<{ mean: number; max: number } | null> {
  const img = await rasterize(wrap(defs, `<use href="#plate-source" filter="url(#${filterId})"/>`), [0, 0, 320, 200], scale);
  if (!img) return null;
  let sum = 0, max = 0, n = 0;
  for (let y = 0; y < img.height; y++) {
    const row = scanRow(img, y);
    for (const v of row) { sum += v; if (v > max) max = v; n++; }
  }
  return { mean: sum / n, max };
}

/** Midpoint colours of the two color-interpolation gradients (Firefox differs, Chrome/Safari do not). */
export async function measureGradientMid(defs: string, body: string, x: number, y: number, w: number, h: number): Promise<{ delta: number } | null> {
  const img = await rasterize(wrap(defs, body), [x, y, w, h], 1);
  if (!img) return null;
  const px = (yy: number) => { const i = (yy * img.width + Math.floor(img.width / 2)) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
  const a = px(Math.floor(h * 0.25)), b = px(Math.floor(h * 0.75));
  return { delta: Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) };
}
