// letterpress-type-specimen — shared palette, fonts and small drawing helpers used by the section builders.
import { el, FONT_CJK, FONT_MONO } from './lib';

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

/** The specimen face: Latin Modern Roman re-declared in-stage as 'Specimen Roman' via @font-face data URIs. */
export const SPEC = "'Specimen Roman', 'Studio Serif', serif";
export const MONO_CJK = `${FONT_MONO.split(',')[0]}, 'Studio CJK', ${FONT_MONO.split(',').slice(1).join(',')}`;
export const CJK = FONT_CJK;
export const XML_NS = 'http://www.w3.org/XML/1998/namespace';

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
}

type Attrs = Record<string, string | number | boolean | null | undefined>;

export const txt = (x: number, y: number, content: string, attrs: Attrs = {}): SVGTextElement =>
  el('text', { x, y, ...attrs }, content);
/** Small Chinese/Latin caption (class .lab → Studio CJK 11px, note colour). */
export const lab = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement => txt(x, y, s, { class: 'lab', ...attrs });
/** Tabular readout (class .num → mono + tabular-nums). */
export const mono = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement => txt(x, y, s, { class: 'num', ...attrs });
/** Specimen sample in the embedded face; `probe` makes it hit-testable by the pointer cursor. */
export const spec = (x: number, y: number, s: string, size: number, attrs: Attrs = {}): SVGTextElement =>
  txt(x, y, s, { class: 'spec probe', 'font-size': size, ...attrs });

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

/** A small letterpress "stamp": rotated outlined box + bold CJK text. */
export function stamp(x: number, y: number, s: string, color: string, rotate = -3): SVGGElement {
  const g = el('g', { class: 'stamp', transform: `rotate(${rotate} ${x} ${y})` });
  const t = txt(x + 5, y, s, { class: 'lab', 'font-weight': 700, fill: color, 'font-size': 11 });
  g.append(t);
  // width is resolved after insertion by the caller via fitStamp()
  return g;
}
export function fitStamp(g: SVGGElement, color: string): void {
  const t = g.querySelector('text')!;
  const b = t.getBBox();
  g.prepend(el('rect', { x: b.x - 5, y: b.y - 1.5, width: b.width + 10, height: b.height + 3, rx: 2, fill: 'none', stroke: color, 'stroke-width': 0.8, 'stroke-dasharray': '3 1.5' }));
}

/**
 * Section header on a flood plate (concept:text-background-box-via-flood): `<text filter="url(#plate-id)">` whose
 * filter is feFlood → feMerge. The filter region (-4% / -30% / 108% / 160%) is relative to the text bbox, so the
 * plate grows and shrinks with the label — no rect element anywhere. `--plate` on the <filter> drives flood-color
 * (css:custom-properties-in-filter); `currentColor: true` instead uses flood-color="currentColor" resolved against
 * the <filter>'s own `color` (pv:flood-color=currentColor).
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
  return t;
}

/** Ink-bounds probe through Canvas TextMetrics (SVG getExtentOfChar only returns the line box, not glyph ink). */
export function inkMetrics(size: number, family = SPEC): { xHeight: number; capHeight: number; ascent: number; descent: number } {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${size}px ${family}`;
  const x = ctx.measureText('x'), H = ctx.measureText('H');
  return { xHeight: x.actualBoundingBoxAscent, capHeight: H.actualBoundingBoxAscent, ascent: H.fontBoundingBoxAscent, descent: H.fontBoundingBoxDescent };
}
