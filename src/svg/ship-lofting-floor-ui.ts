// ship-lofting-floor — shared palette and tiny drawing helpers used by the scene modules.
import { el, FONT_MONO, FONT_CJK, type Attrs } from './lib';

export const C = {
  panel: '#0d2740', edge: '#4f8fc0', text: '#dbe8f4', dim: '#8fb8dc', faint: '#5f86ab',
  yellow: '#ffd166', orange: '#ff8d72', green: '#6ee7a8', cyan: '#7fd8ff', violet: '#b889ff', pink: '#ff6f91', red: '#ff7a7a', white: '#f4f9ff',
} as const;

/** Rounded functional panel — fill #0d2740 @ .72 with a .5 #4f8fc0 edge; margins between panels stay transparent. */
export const panel = (x: number, y: number, w: number, h: number, extra: Attrs = {}): SVGRectElement =>
  el('rect', { x, y, width: w, height: h, rx: 10, fill: C.panel, 'fill-opacity': .72, stroke: C.edge, 'stroke-width': .5, ...extra });

export interface LabelOpts { size?: number; fill?: string; mono?: boolean; anchor?: 'start' | 'middle' | 'end'; weight?: number | string; opacity?: number; id?: string; cls?: string; style?: string; transform?: string }

/** Text with the embedded families: CJK/Sans by default, Latin Modern Mono when `mono`. */
export function label(x: number, y: number, content: string, o: LabelOpts = {}): SVGTextElement {
  return el('text', {
    x, y, 'font-size': o.size ?? 11, fill: o.fill ?? C.text, 'font-family': o.mono ? FONT_MONO : FONT_CJK,
    'text-anchor': o.anchor, 'font-weight': o.weight, opacity: o.opacity, id: o.id, class: o.cls, style: o.style, transform: o.transform,
  }, content);
}

export const g = (attrs: Attrs = {}, ...children: (Node | null | undefined | false)[]): SVGGElement => el('g', attrs, ...children);
