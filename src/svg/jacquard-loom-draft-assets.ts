// jacquard-loom-draft — procedurally generated "scanned" assets. Everything is drawn at runtime with
// Canvas 2D from a seeded PRNG (mulberry32) and exported as base64 data URIs, so the demo makes zero
// network requests (`concept:image-data-uri`) and stays deterministic between captures.
import { mulberry32 } from './lib';

export const INK = '#14243f';
export const BOARD = '#223f6d';
export const PAPER = '#ece4d2';
export const MADDER = '#b8433a';
export const GOLD = '#c8a24a';
export const WEFT = '#c9b98f';

const canvas2d = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')!];
};

/** 128×128 linen scan: a 2-unit warp/weft lattice with seeded slubs; the lattice period divides 128 so the tile is seamless. */
export function linenPng(): string {
  const [c, ctx] = canvas2d(128, 128);
  const rnd = mulberry32(0x11ee01);
  ctx.fillStyle = '#d9cfb6';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 2) {
    ctx.fillStyle = `rgba(255,250,235,${(0.18 + rnd() * 0.2).toFixed(3)})`;
    ctx.fillRect(0, y, 128, 1);
    ctx.fillStyle = `rgba(120,100,70,${(0.08 + rnd() * 0.12).toFixed(3)})`;
    ctx.fillRect(0, y + 1, 128, 1);
  }
  for (let x = 0; x < 128; x += 2) {
    ctx.fillStyle = `rgba(110,90,60,${(0.06 + rnd() * 0.1).toFixed(3)})`;
    ctx.fillRect(x, 0, 1, 128);
  }
  for (let i = 0; i < 90; i++) { // slubs: short thicker fibre runs
    const x = Math.floor(rnd() * 128), y = Math.floor(rnd() * 64) * 2, len = 3 + Math.floor(rnd() * 6);
    ctx.fillStyle = `rgba(90,70,40,${(0.15 + rnd() * 0.2).toFixed(3)})`;
    ctx.fillRect(x, y, len, 1);
  }
  return c.toDataURL('image/png');
}

/** 64×256 yarn strip: indigo yarn with diagonal twist highlights (the pattern later rotates it by -12°). */
export function yarnPng(): string {
  const [c, ctx] = canvas2d(64, 256);
  const rnd = mulberry32(0x9a3701);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 64; x++) {
      const twist = 0.5 + 0.5 * Math.sin(x * 0.42 + y * 0.16); // spiral highlight bands
      const edge = 1 - Math.pow(Math.abs(x - 31.5) / 32, 2.2); // round the yarn cross-section
      const l = 18 + twist * 34 * edge + (rnd() - 0.5) * 6;
      ctx.fillStyle = `hsl(218 48% ${l.toFixed(1)}%)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  for (let i = 0; i < 140; i++) { // stray fibres
    ctx.fillStyle = `rgba(225,215,190,${(0.15 + rnd() * 0.25).toFixed(3)})`;
    ctx.fillRect(Math.floor(rnd() * 64), Math.floor(rnd() * 256), 1, 1 + Math.floor(rnd() * 3));
  }
  return c.toDataURL('image/png');
}

/** 3×3 card-hole sprite; scaled 20× it exposes image-rendering: auto (smoothed) vs pixelated (hard blocks). */
export function holeSpritePng(): string {
  const [c, ctx] = canvas2d(3, 3);
  const px: string[][] = [[GOLD, PAPER, GOLD], [PAPER, INK, PAPER], [MADDER, PAPER, MADDER]];
  px.forEach((row, y) => row.forEach((color, x) => { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); }));
  return c.toDataURL('image/png');
}

/** 96×96 yarn-sample "photo": madder cloth with a round cream label and a diagonal indigo stripe. The round label
 *  shows where preserveAspectRatio parks the image and becomes an ellipse under `none`. */
export function swatchPng(): string {
  const [c, ctx] = canvas2d(96, 96);
  const rnd = mulberry32(0x5a4c01);
  ctx.fillStyle = '#7a2f2a';
  ctx.fillRect(0, 0, 96, 96);
  for (let y = 0; y < 96; y += 2) { ctx.fillStyle = `rgba(255,220,200,${(0.05 + rnd() * 0.08).toFixed(3)})`; ctx.fillRect(0, y, 96, 1); }
  for (let x = 0; x < 96; x += 3) { ctx.fillStyle = `rgba(40,10,10,${(0.05 + rnd() * 0.1).toFixed(3)})`; ctx.fillRect(x, 0, 1, 96); }
  ctx.fillStyle = '#ece4d2';
  ctx.beginPath(); ctx.arc(48, 48, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(48, 48, 30, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = BOARD; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(30, 66); ctx.lineTo(66, 30); ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.fillRect(4, 4, 10, 10); // corner mark, top-left: proves orientation is kept
  return c.toDataURL('image/png');
}

/** The pattern ticket, as an SVG document (viewBox 0 0 24 24). Text was "converted to paths" at authoring time:
 *  the "7" is a path, so no font is needed. The :hover rule and <a> deliberately exist to show that they are inert
 *  in secure static mode (`concept:image-nested-svg-document`). */
export function ticketSvgDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
    `<style>.b:hover{fill:#b8433a}</style>` +
    `<a href="https://example.invalid/ticket"><rect class="b" x=".5" y=".5" width="23" height="23" rx="3" fill="#ece4d2" stroke="#14243f"/></a>` +
    `<path d="M3 3h18v18H3z" fill="none" stroke="#223f6d" stroke-width=".6"/>` +
    `<path d="M3 9l6-6M3 15l12-12M3 21l18-18M9 21l12-12M15 21l6-6" stroke="#223f6d" stroke-width=".5"/>` +
    `<circle cx="12" cy="12" r="5" fill="#c8a24a" stroke="#14243f" stroke-width=".8"/>` +
    `<path d="M9.8 9.4h4.4l-2.8 5.6" fill="none" stroke="#14243f" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<path d="M6 20.2h12" stroke="#b8433a" stroke-width="1.2"/>` +
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/** The same ticket rasterised at 24×24 — displayed at 56×56 it blurs, unlike the vector twin. */
export function ticketPng(): string {
  const [c, ctx] = canvas2d(24, 24);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 24, 24);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, 23, 23);
  ctx.strokeStyle = BOARD; ctx.lineWidth = 0.6; ctx.strokeRect(3, 3, 18, 18);
  ctx.lineWidth = 0.5;
  for (const [x1, y1, x2, y2] of [[3, 9, 9, 3], [3, 15, 15, 3], [3, 21, 21, 3], [9, 21, 21, 9], [15, 21, 21, 15]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(12, 12, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9.8, 9.4); ctx.lineTo(14.2, 9.4); ctx.lineTo(11.4, 15); ctx.stroke();
  ctx.strokeStyle = MADDER; ctx.beginPath(); ctx.moveTo(6, 20.2); ctx.lineTo(18, 20.2); ctx.stroke();
  return c.toDataURL('image/png');
}

/** The master weave artwork: one 36×36 repeat of a 3/1 twill as 4×4 nine-unit cells (rect rx=1.2). Returned as
 *  SVG markup so the same drawing can be a DOM <g id="weaveCell"> and, for Gecko, a data:image/svg+xml fallback. */
export function weaveCellMarkup(): string {
  let out = `<rect x="0" y="0" width="36" height="36" fill="${WEFT}"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if ((c + r) % 4 === 0) continue; // the single weft spot per row of a 3/1 twill
    out += `<rect x="${c * 9}" y="${r * 9}" width="9" height="9" rx="1.2" fill="${INK}"/>`;
  }
  return out;
}

export function weaveCellSvgDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">${weaveCellMarkup()}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
