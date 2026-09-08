// core-sample-stratigraphy — deterministic geology data, hand-drawn lithology textures and the in-page
// <canvas> core photograph. Everything is seeded (mulberry32) so every capture is pixel-identical.
import { el, mulberry32, type Attrs } from './lib';

export type Litho = 'sand' | 'mud' | 'limestone';
export interface Layer { top: number; bottom: number; litho: Litho; grain: number }

/** Depth mapping shared by every panel: y(d) = 142 + 3.9·d, d ∈ [0,120] m → y ∈ [142,610]. */
export const Y0 = 142, K = 3.9;
export const yOf = (d: number): number => Y0 + K * d;

export const INK = '#dbe7f2', MUTED = '#93a7ba', ACCENT = '#f2b84b', CYAN = '#5fd3c4', RED = '#e0533e';
export const PANEL = '#0f1a26', PANEL_STROKE = '#2b4358';
export const LITHO: Record<Litho, { base: string; ink: string; name: string }> = {
  sand: { base: '#cfae67', ink: '#7a5a22', name: '砂' },
  mud: { base: '#4f5864', ink: '#242a32', name: '泥' },
  limestone: { base: '#b4c3cc', ink: '#5e7383', name: '灰岩' },
};

/** 16 layers over 0–120 m from mulberry32(0x5EA1): top, bottom, lithology and grain size 1–5. */
export function makeLayers(): Layer[] {
  const rand = mulberry32(0x5EA1);
  const raw = Array.from({ length: 16 }, () => 3 + rand() * 11);
  const total = raw.reduce((a, b) => a + b, 0);
  const cycle: Litho[] = ['sand', 'mud', 'limestone'];
  const layers: Layer[] = [];
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const th = raw[i] * 120 / total;
    const litho = rand() < .3 ? cycle[Math.floor(rand() * 3)] : cycle[i % 3];
    layers.push({ top: d, bottom: i === 15 ? 120 : d + th, litho, grain: 1 + Math.floor(rand() * 5) });
    d += th;
  }
  return layers;
}

const f = (n: number): string => n.toFixed(2).replace(/\.?0+$/, '');

/**
 * Self-drawn lithology texture (no <pattern>): base fill + one geometry path.
 * sand = jittered dot field (r = 1.1 + 1.6·rand, density ∝ grain); mud = 3.2 px spaced 0.7 px hairlines with ±0.4
 * end jitter; limestone = 24×9 brick joints, alternate rows offset by half a brick.
 */
export function texture(rand: () => number, litho: Litho, x: number, y: number, w: number, h: number, grain = 3, attrs: Attrs = {}): SVGGElement {
  const g = el('g', { class: `lith lith-${litho}`, ...attrs });
  const { base, ink } = LITHO[litho];
  g.append(el('rect', { x, y, width: w, height: h, fill: base }));
  let d = '';
  if (litho === 'sand') {
    const s = 6.6 - .85 * grain;                       // grid pitch shrinks with grain → denser
    for (let gy = y; gy < y + h; gy += s) for (let gx = x; gx < x + w; gx += s) {
      const cx = gx + rand() * s, cy = gy + rand() * s, r = 1.1 + 1.6 * rand();
      if (cx - r < x || cx + r > x + w || cy - r < y || cy + r > y + h) continue;
      d += `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
    }
    g.append(el('path', { d, fill: ink, 'fill-opacity': .78 }));
  } else if (litho === 'mud') {
    for (let ly = y + 1.6; ly < y + h - .4; ly += 3.2) {
      const j0 = (rand() - .5) * .8, j1 = (rand() - .5) * .8;
      d += `M${f(x + .6 + j0)} ${f(ly)}H${f(x + w - .6 + j1)}`;
    }
    g.append(el('path', { d, stroke: ink, 'stroke-width': .7, fill: 'none' }));
  } else {
    const bw = 24, bh = 9;
    for (let r = 0, yy = y; yy < y + h; r++, yy += bh) {
      const y1 = Math.min(yy + bh, y + h);
      if (r) d += `M${f(x)} ${f(yy)}H${f(x + w)}`;
      const off = r % 2 ? bw / 2 : 0;
      for (let vx = x + off; vx < x + w; vx += bw) d += `M${f(vx)} ${f(yy)}V${f(y1)}`;
    }
    g.append(el('path', { d, stroke: ink, 'stroke-width': .8, fill: 'none', 'stroke-opacity': .85 }));
  }
  return g;
}

/** A stratified chip (sand / mud / limestone bands) of arbitrary size — the reusable “core sample”. */
export function chip(rand: () => number, x: number, y: number, w: number, h: number, attrs: Attrs = {}): SVGGElement {
  const g = el('g', attrs);
  const cuts = [0, .3, .6, 1];
  const lith: Litho[] = ['sand', 'mud', 'limestone'];
  for (let i = 0; i < 3; i++) {
    const y0 = y + Math.round(h * cuts[i]), y1 = y + Math.round(h * cuts[i + 1]);
    g.append(texture(rand, lith[i], x, y0, w, y1 - y0, 2 + i));
  }
  return g;
}

/**
 * Core photograph: a 128×496 cylinder drawn in a <canvas> from the same layer data (limestone bright, mud dark,
 * sand mid), exported with toDataURL('image/png') → data: URI. Zero network requests.
 */
export function corePhotoDataUri(layers: Layer[]): string {
  const W = 128, H = 496;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const rand = mulberry32(0x5EA1 ^ 0x9E3779B9);
  const tone: Record<Litho, [number, number, number]> = { limestone: [205, 214, 218], mud: [52, 59, 68], sand: [176, 146, 84] };
  const img = ctx.createImageData(W, H);
  const data = img.data;
  for (const L of layers) {
    const y0 = Math.floor(L.top * H / 120), y1 = Math.ceil(L.bottom * H / 120);
    const [r0, g0, b0] = tone[L.litho];
    for (let y = y0; y < y1 && y < H; y++) {
      const band = 1 + (rand() - .5) * .12;                      // per-row brightness streaks
      for (let x = 0; x < W; x++) {
        const shade = .62 + .38 * Math.sin(Math.PI * (x + .5) / W); // cylindrical shading
        const speck = 1 + (rand() - .5) * (L.litho === 'sand' ? .5 : .22);
        const k = band * shade * speck;
        const i = (y * W + x) * 4;
        data[i] = Math.min(255, r0 * k); data[i + 1] = Math.min(255, g0 * k); data[i + 2] = Math.min(255, b0 * k); data[i + 3] = 255;
      }
    }
  }
  // hairline contacts between layers
  for (const L of layers.slice(1)) {
    const y = Math.floor(L.top * H / 120);
    for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; data[i] *= .55; data[i + 1] *= .55; data[i + 2] *= .55; }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

/** Thin dark outline around light text so labels stay readable on top of textures. */
export const LABEL_HALO: Attrs = { stroke: '#0b131c', 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };

/** Build context shared by the panel modules. */
export interface ProbeTarget { id: string; el: Element; kind: 'clip' | 'mask'; alphaAt?: (clientX: number, clientY: number) => number }
export interface Ctx {
  stage: SVGSVGElement;
  defs: SVGDefsElement;
  rand: () => number;
  photo: string;                       // data: URI of the canvas core photograph
  staticMode: boolean;                 // ?static=1 / prefers-reduced-motion: final values instead of <animate>
  probes: ProbeTarget[];               // hover readout targets (clipped / masked)
  after: Array<() => void>;            // callbacks that need layout (getBBox, getComputedStyle)
  refs: Record<string, SVGTextElement>; // labels filled with runtime measurements
  /** SMIL helper: appends <animate from to begin dur fill> or, in static mode, writes the resting value. */
  anim: (target: Element, attr: string, from: string, to: string, begin: string, dur: string, fill: 'freeze' | 'remove') => void;
}

export interface LabelOpts { size?: number; anchor?: 'start' | 'middle' | 'end'; fill?: string; mono?: boolean; halo?: boolean; weight?: number; id?: string; extra?: Attrs }
export function label(x: number, y: number, str: string, o: LabelOpts = {}): SVGTextElement {
  return el('text', {
    x, y, 'font-size': o.size ?? 11, 'text-anchor': o.anchor ?? 'start', fill: o.fill ?? INK,
    'font-family': o.mono ? "'Studio Mono', 'Latin Modern Mono', Menlo, monospace" : "'Studio CJK', 'Studio Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif",
    'font-weight': o.weight, id: o.id, ...(o.halo ? LABEL_HALO : {}), ...(o.extra ?? {}),
  }, str);
}

/** Instrument-card backdrop with a title. (Cards are local panels — the stage itself stays transparent.) */
export function panel(x: number, y: number, w: number, h: number, title: string): SVGGElement {
  return el('g', { class: 'panel' },
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, 'fill-opacity': .88, stroke: PANEL_STROKE, 'stroke-width': 1 }),
    label(x + 12, y + 18, title, { size: 13, fill: ACCENT, weight: 700 }));
}

/** Dashed ghost outline showing where a clipped-away / masked-out target would have been. */
export function ghost(x: number, y: number, w: number, h: number, color = MUTED): SVGRectElement {
  return el('rect', { x, y, width: w, height: h, fill: 'none', stroke: color, 'stroke-width': .8, 'stroke-dasharray': '3 3', 'pointer-events': 'none', opacity: .7 });
}
