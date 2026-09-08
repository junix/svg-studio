// Shared helpers for the native SVG feature demos (src/svg/<id>.ts).
// Every demo exports `render(stage: SVGSVGElement): void | Promise<void>`; main.ts owns the stage
// element (1400×900, transparent), the pointer-interaction counter and the `__VIS_READY__` flag.
import { EMBEDDED_FACES } from './font-data';

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
export const XHTML_NS = 'http://www.w3.org/1999/xhtml';
export const STAGE_W = 1400;
export const STAGE_H = 900;

export type Attrs = Record<string, string | number | boolean | null | undefined>;
export type Child = Node | string | number | null | undefined | false | Child[];

/** Create a namespaced SVG element with attributes and children. Attribute keys are written verbatim
 *  (so `'xlink:href'`, `'xml:lang'` and `'xmlns'` work); `null`/`undefined`/`false` values are skipped. */
export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs?: Attrs, ...children: Child[]): SVGElementTagNameMap[K];
export function el(tag: string, attrs?: Attrs, ...children: Child[]): SVGElement;
export function el(tag: string, attrs: Attrs = {}, ...children: Child[]): SVGElement {
  const node = document.createElementNS(SVG_NS, tag);
  setAttrs(node, attrs);
  append(node, children);
  return node;
}

/** Create an XHTML element (for use inside <foreignObject>). */
export function html<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const node = document.createElementNS(XHTML_NS, tag) as HTMLElementTagNameMap[K];
  setAttrs(node, attrs);
  append(node, children);
  return node;
}

export function setAttrs(node: Element, attrs: Attrs): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('xlink:')) node.setAttributeNS(XLINK_NS, key, String(value));
    else node.setAttribute(key, value === true ? '' : String(value));
  }
}

export function append(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(parent, child);
    else if (typeof child === 'string' || typeof child === 'number') parent.appendChild(document.createTextNode(String(child)));
    else parent.appendChild(child);
  }
}

/** Parse an SVG fragment (string) into elements; useful for hand-authored blocks such as filter chains. */
export function fragment(markup: string): DocumentFragment {
  const template = document.createElementNS(SVG_NS, 'svg');
  template.innerHTML = markup;
  const frag = document.createDocumentFragment();
  while (template.firstChild) frag.appendChild(template.firstChild);
  return frag;
}

/** Text node shorthand for `<text>`/`<tspan>` construction. */
export const text = (content: string, attrs: Attrs = {}): SVGTextElement => el('text', attrs, content);

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const fmt = (n: number, digits = 2): string => Number.isInteger(n) ? String(n) : n.toFixed(digits).replace(/\.?0+$/, '');

/** True when the capture pipeline is taking the screenshot (`?export=1`). */
export const isExport = (): boolean => new URLSearchParams(location.search).get('export') === '1';

/** Freeze the SMIL timeline at a meaningful still frame for export. Call after all animations exist. */
export function freezeAt(stage: SVGSVGElement, seconds: number): void {
  stage.setCurrentTime(seconds);
  stage.pauseAnimations();
}

/**
 * Declare features whose presence cannot be derived from the DOM (`api:`, `concept:`, `css:` keys).
 * The capture coverage gate reads `#stage[data-features]`; call this only for features the demo really exercises.
 */
export function mark(stage: SVGSVGElement, ...keys: string[]): void {
  const current = new Set((stage.dataset.features ?? '').split(/\s+/).filter(Boolean));
  for (const key of keys) current.add(key);
  stage.dataset.features = [...current].join(' ');
}

/** Font families embedded as data URIs (see scripts/build-fonts.mjs). */
export const FONT_SERIF = "'Studio Serif', 'Latin Modern Roman', Georgia, serif";
export const FONT_MONO = "'Studio Mono', 'Latin Modern Mono', Menlo, monospace";
export const FONT_SANS = "'Studio Sans', 'Noto Sans CJK SC', 'Helvetica Neue', Arial, sans-serif";
export const FONT_CJK = "'Studio CJK', 'Studio Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif";

/** `@font-face` rules for the embedded faces — inline into a demo `<style>` (this is the `css:font-face-data-uri` feature). */
export function fontFaceCss(families: string[] = EMBEDDED_FACES.map(face => face.family)): string {
  return EMBEDDED_FACES.filter(face => families.includes(face.family))
    .map(face => `@font-face{font-family:'${face.family}';font-weight:${face.weight};font-style:${face.style};src:url(${face.dataUri}) format('woff2');}`)
    .join('\n');
}

/** Ensure the embedded fonts are declared once at document level and resolve when they are usable. */
export async function ensureFonts(): Promise<void> {
  if (!document.getElementById('studio-fonts')) {
    const style = document.createElement('style');
    style.id = 'studio-fonts';
    style.textContent = fontFaceCss();
    document.head.appendChild(style);
  }
  await Promise.all(EMBEDDED_FACES.map(face => document.fonts.load(`${face.style} ${face.weight} 16px '${face.family}'`).catch(() => [])));
}

export interface SvgDemo {
  render: (stage: SVGSVGElement) => void | Promise<void>;
}
