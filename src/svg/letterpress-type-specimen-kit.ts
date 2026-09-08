// letterpress-type-specimen — shared palette, fonts, layers and measurement helpers used by the section builders.
import { el, FONT_CJK, FONT_MONO, type Attrs } from './lib';
import { EMBEDDED_FACES } from './font-data';

// Ink palette from the plan (§3.8 构造要点 1).
export const INK = '#1c2733';       // 墨色
export const RED = '#b3271e';       // 量规朱红
export const INDIGO = '#14577a';    // 级联靛蓝
export const GREEN = '#1d7a4b';     // 铜绿
export const PURPLE = '#7a3fa0';    // 紫
export const HAIR = '#c3ae8b';      // 细线
export const PAPER = '#f4ead6';     // 暖白纸
export const TITLE_FILL = '#f6f1e6';
export const NOTE = '#5b5246';      // 图注灰褐

/**
 * The specimen face. The plan names it "Praktika VF"; this repository has no variable font, so the alias is bound
 * in-stage (css:font-face-data-uri) to the embedded Latin Modern Roman 10 subsets (400 / 700 / italic, GUST Font
 * License, `--layout-features='*'`). It therefore has liga/dlig/kern/onum/lnum/pnum/tnum but NO wght/wdth axes and
 * no smcp — the specimen measures and prints exactly that instead of claiming otherwise.
 */
export const FAMILY = 'Praktika VF';
export const SPEC = `'${FAMILY}', 'Studio Serif', serif`;
export const MONO = FONT_MONO;
export const CJK = FONT_CJK;
export const XML_NS = 'http://www.w3.org/XML/1998/namespace';

/** `@font-face` rules binding the alias to the embedded Latin Modern Roman data URIs. */
export function specimenFontFaceCss(): string {
  return EMBEDDED_FACES.filter(face => face.family === 'Studio Serif')
    .map(face => `@font-face{font-family:'${FAMILY}';font-weight:${face.weight};font-style:${face.style};src:url(${face.dataUri}) format('woff2')}`)
    .join('\n');
}
/** Regular-weight data URI (used by the pixel probe documents). */
export const regularFaceUri = (): string => EMBEDDED_FACES.find(face => face.family === 'Studio Serif' && face.weight === 400 && face.style === 'normal')?.dataUri ?? '';

export const f2 = (n: number): string => n.toFixed(2);
export const f1 = (n: number): string => n.toFixed(1);

/** Drawing layers in z-order (plan 构造要点 3): rows → gauge → readouts → anim → cursor. */
export interface Layers {
  stage: SVGSVGElement;
  defs: SVGDefsElement;
  rows: SVGGElement;
  gauge: SVGGElement;
  readouts: SVGGElement;
  anim: SVGGElement;
  cursor: SVGGElement;
}

/** Runtime facts collected by every section and printed in the self-check column. ok=null → informational. */
export interface Fact { ok: boolean | null; text: string }
export interface Report {
  facts: Fact[];
  /** Section header texts (for the plate-width self-check). */
  headers: SVGTextElement[];
  /** Texts that answer to getCharNumAtPosition hit-testing. */
  probes: SVGTextElement[];
  /** Default hit for the export still: the 32pt ladder row. */
  defaultProbe?: SVGTextElement;
  /** Deferred asynchronous checks (pixel probes) resolved before the frame is declared final. */
  pending: Promise<void>[];
}

export const txt = (x: number, y: number, content: string, attrs: Attrs = {}): SVGTextElement =>
  el('text', { x, y, ...attrs }, content);
/** Small Chinese/Latin caption (class .lab → CJK 11px, note colour). */
export const lab = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement => txt(x, y, s, { class: 'lab', ...attrs });
/** Tabular readout (class .num → mono + tabular-nums). */
export const mono = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement => txt(x, y, s, { class: 'num', ...attrs });
/** Specimen sample in the embedded face; class `probe` makes it hit-testable by the pointer cursor. */
export const spec = (x: number, y: number, s: string, size: number, attrs: Attrs = {}): SVGTextElement =>
  txt(x, y, s, { class: 'spec probe', 'font-size': size, fill: INK, ...attrs });

export const hline = (x1: number, x2: number, y: number, stroke = HAIR, width = 0.5, attrs: Attrs = {}): SVGLineElement =>
  el('line', { x1, x2, y1: y, y2: y, stroke, 'stroke-width': width, ...attrs });
export const vtick = (x: number, y1: number, y2: number, stroke: string, width = 0.8): SVGLineElement =>
  el('line', { x1: x, x2: x, y1, y2, stroke, 'stroke-width': width });
export const box = (r: DOMRect, stroke: string, attrs: Attrs = {}): SVGRectElement =>
  el('rect', { x: r.x, y: r.y, width: r.width, height: r.height, fill: 'none', stroke, 'stroke-width': 0.7, ...attrs });

/** Set xml:space="preserve" with the real XML namespace — Chromium only maps it to white-space when namespaced. */
export function preserveSpace(node: Element): void {
  node.setAttributeNS(XML_NS, 'xml:space', 'preserve');
}

// ---- measurement helpers (api:SVGTextContentElement.*) ----
export const ctl = (t: SVGTextContentElement): number => t.getComputedTextLength();
/** Measured span = end of last char − start of first char (the gauge the plan trusts over getComputedTextLength). */
export function span(t: SVGTextContentElement): number {
  const n = t.getNumberOfChars();
  return n ? t.getEndPositionOfChar(n - 1).x - t.getStartPositionOfChar(0).x : 0;
}
/** Start-of-char anchor ticks under a text (api:SVGTextContentElement.getStartPositionOfChar). */
export function anchorTicks(t: SVGTextContentElement, y1: number, y2: number, stroke: string, width = 0.8): SVGGElement {
  const g = el('g', { class: 'anchors' });
  const n = t.getNumberOfChars();
  for (let i = 0; i < n; i++) g.append(vtick(t.getStartPositionOfChar(i).x, y1, y2, stroke, width));
  if (n) g.append(vtick(t.getEndPositionOfChar(n - 1).x, y1, y2, stroke, width));
  return g;
}

/** A small letterpress "stamp": slightly rotated dashed box + bold CJK text, fitted after insertion. */
export function stamp(parent: SVGElement, x: number, y: number, s: string, color: string, rotate = -2, size = 10.5): SVGGElement {
  const g = el('g', { class: 'stamp', transform: `rotate(${rotate} ${x} ${y})` });
  const t = lab(x + 4, y, s, { 'font-weight': 700, fill: color, 'font-size': size });
  g.append(t);
  parent.append(g);
  const b = t.getBBox();
  g.prepend(el('rect', { x: b.x - 4, y: b.y + 0.5, width: b.width + 8, height: b.height - 1, rx: 1.5, fill: 'none', stroke: color, 'stroke-width': 0.8, 'stroke-dasharray': '3 1.5' }));
  return g;
}

/**
 * Section header on a flood plate (concept:text-background-box-via-flood): `<text filter="url(#plate-id)">` whose
 * filter is feFlood → feMerge. The filter region (-4% / -30% / 108% / 160%) is relative to the text bbox, so the
 * plate grows and shrinks with the label — no rect element anywhere (concept:flood-fills-filter-region). `--plate`
 * on the <filter> drives flood-color through `.plate{flood-color:var(--plate)}` (css:custom-properties-in-filter);
 * `currentColor: true` instead writes flood-color="currentColor", which resolves against the <filter>'s own `color`
 * (pv:flood-color=currentColor) — not against the colour of the referencing text.
 */
export function plateHeader(L: Layers, R: Report, id: string, color: string, x: number, y: number, s: string, opts: { currentColor?: boolean } = {}): SVGTextElement {
  const flood = opts.currentColor
    ? el('feFlood', { class: 'plate-cc', 'flood-color': 'currentColor', 'flood-opacity': 0.34, result: 'plate' })
    : el('feFlood', { class: 'plate', 'flood-opacity': 0.34, result: 'plate' });
  const filter = el('filter', {
    id: `plate-${id}`, x: '-4%', y: '-30%', width: '108%', height: '160%',
    style: opts.currentColor ? undefined : `--plate:${color}`,
    color: opts.currentColor ? color : undefined,
  }, flood, el('feMerge', {}, el('feMergeNode', { in: 'plate' }), el('feMergeNode', { in: 'SourceGraphic' })));
  L.defs.append(filter);
  const t = txt(x, y, s, { class: 'head', filter: `url(#plate-${id})`, 'data-plate': id });
  L.rows.append(t);
  R.headers.push(t);
  // css:flood-color-transition — hovering the label swaps the custom property; `.plate{transition:flood-color .4s}` tweens it.
  if (!opts.currentColor) {
    t.addEventListener('pointerenter', () => filter.style.setProperty('--plate', INK));
    t.addEventListener('pointerleave', () => filter.style.setProperty('--plate', color));
  }
  return t;
}

/** Ink-bounds probe through Canvas TextMetrics (SVG getExtentOfChar only returns the line box, not glyph ink). */
export function inkMetrics(size: number, family = SPEC): { xHeight: number; capHeight: number; ascent: number; descent: number } {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${size}px ${family}`;
  const x = ctx.measureText('x'), H = ctx.measureText('H');
  return { xHeight: x.actualBoundingBoxAscent, capHeight: H.actualBoundingBoxAscent, ascent: H.fontBoundingBoxAscent, descent: H.fontBoundingBoxDescent };
}

// ---- pixel probe -------------------------------------------------------------------------------------------
// Some OpenType switches (onum/lnum, decorations, rendering hints) change glyph shapes without changing the advance
// width, so a width Δ of 0 does not prove "no difference". The probe renders two variants of the same sample into a
// tiny standalone SVG document (carrying the specimen face as a data URI, exactly like proof card 3), rasterises each
// through <canvas>, and counts pixels whose alpha differs.
const PROBE_W = 320, PROBE_H = 44;
function probeImage(sample: string, attrs: string): Promise<ImageData> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PROBE_W}" height="${PROBE_H}">` +
    `<style>@font-face{font-family:'${FAMILY}';src:url(${regularFaceUri()}) format('woff2')}</style>` +
    `<text x="4" y="30" font-family="'${FAMILY}',serif" font-size="22" ${attrs}>${sample.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = PROBE_W; canvas.height = PROBE_H;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, PROBE_W, PROBE_H));
    };
    img.onerror = () => resolve(new ImageData(PROBE_W, PROBE_H));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
/** Number of pixels that differ between two renderings of `sample` (attribute strings are raw SVG markup). */
export async function pixelDiff(sample: string, attrsA: string, attrsB: string): Promise<number> {
  const [a, b] = await Promise.all([probeImage(sample, attrsA), probeImage(sample, attrsB)]);
  let diff = 0;
  for (let i = 3; i < a.data.length; i += 4) if (Math.abs(a.data[i] - b.data[i]) > 24) diff++;
  return diff;
}
