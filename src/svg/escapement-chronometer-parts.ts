// Geometry + small builders for the `escapement-chronometer` demo (docs/svg-feature-demos.md §3.14).
// Everything here is deterministic pure geometry; the SMIL wiring lives in escapement-chronometer.ts.
import { el, type Attrs, type Child, FONT_CJK, FONT_MONO } from './lib';

export const BRASS = '#d9a441';
export const BRASS_HI = '#f0c76b';
export const BROWN = '#4a3418';
export const STEEL = '#7fb2d6';
export const RUBY = '#d9455f';
export const CREAM = '#f2e6cf';
export const SAGE = '#9fb8ad';
export const FELT = '#2f5d4a';
export const ORANGE = '#e8843a';
export const INK = '#1c2926';

const f = (n: number): string => (Math.round(n * 100) / 100).toString();

export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = deg * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** Trapezoid-tooth gear outline (polar generator). */
export function gearPath(cx: number, cy: number, r: number, teeth: number, depth = Math.max(4, r * 0.11)): string {
  const step = 360 / teeth;
  const root = r - depth;
  const parts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const p = [polar(cx, cy, root, a - step * 0.30), polar(cx, cy, r, a - step * 0.14), polar(cx, cy, r, a + step * 0.14), polar(cx, cy, root, a + step * 0.30)];
    parts.push(p.map(([x, y], k) => `${i === 0 && k === 0 ? 'M' : 'L'}${f(x)},${f(y)}`).join(''));
  }
  return parts.join('') + 'Z';
}

/** Fifteen-tooth club-tooth escape wheel: steep locking face, sloped impulse face. */
export function escapeWheelPath(cx: number, cy: number, r: number, teeth = 15): string {
  const step = 360 / teeth;
  const root = r - 12;
  const parts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const p = [polar(cx, cy, root, a - 2.5), polar(cx, cy, r, a), polar(cx, cy, r - 1.5, a + 3), polar(cx, cy, root, a + 8.5)];
    parts.push(p.map(([x, y], k) => `${i === 0 && k === 0 ? 'M' : 'L'}${f(x)},${f(y)}`).join(''));
  }
  return parts.join('') + 'Z';
}

/** Archimedean spiral polyline (hairspring / mainspring). */
export function spiralPath(cx: number, cy: number, r0: number, r1: number, turns: number, startDeg = 0): string {
  const total = turns * 360;
  const pts: string[] = [];
  for (let t = 0; t <= total; t += 5) {
    const r = r0 + (r1 - r0) * t / total;
    const [x, y] = polar(cx, cy, r, startDeg + t);
    pts.push(`${pts.length ? 'L' : 'M'}${f(x)},${f(y)}`);
  }
  return pts.join('');
}

/** Equation-of-time cam: r(θ) = 60 + 50·|sin 2θ| (two lobes), closed. */
export function camPath(cx: number, cy: number): string {
  const pts: string[] = [];
  for (let d = 0; d < 360; d += 2) {
    const r = 60 + 50 * Math.abs(Math.sin(2 * d * Math.PI / 180));
    const [x, y] = polar(cx, cy, r, d);
    pts.push(`${pts.length ? 'L' : 'M'}${f(x)},${f(y)}`);
  }
  return pts.join('') + 'Z';
}

export function starPath(cx: number, cy: number, r: number, points = 8): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const [x, y] = polar(cx, cy, i % 2 ? r * 0.55 : r, i * 180 / points - 90);
    pts.push(`${i ? 'L' : 'M'}${f(x)},${f(y)}`);
  }
  return pts.join('') + 'Z';
}

export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const [x0, y0] = polar(cx, cy, r, fromDeg);
  const [x1, y1] = polar(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M${f(x0)},${f(y0)}A${r},${r} 0 ${large} ${toDeg > fromDeg ? 1 : 0} ${f(x1)},${f(y1)}`;
}

/** CJK label (Noto Sans CJK subset embedded by scripts/build-fonts.mjs). */
export function label(x: number, y: number, content: Child, attrs: Attrs = {}): SVGTextElement {
  return el('text', { x, y, 'font-family': FONT_CJK, 'font-size': 11, fill: CREAM, ...attrs }, content);
}

/** Monospace label for ids, times and attribute literals. */
export function mono(x: number, y: number, content: Child, attrs: Attrs = {}): SVGTextElement {
  return el('text', { x, y, 'font-family': FONT_MONO, 'font-size': 11, fill: SAGE, ...attrs }, content);
}

export interface WheelOptions { pinion?: number; spokes?: number; hub?: number; rim?: number; fill?: string; teethDepth?: number }

/** A brass train wheel: toothed rim, crossing spokes, optional pinion and hub — drawn in absolute coordinates. */
export function wheelParts(cx: number, cy: number, r: number, teeth: number, o: WheelOptions = {}): SVGElement[] {
  const spokes = o.spokes ?? 5;
  const rim = o.rim ?? Math.max(6, r * 0.16);
  const hub = o.hub ?? Math.max(6, r * 0.14);
  const parts: SVGElement[] = [
    el('path', { d: gearPath(cx, cy, r, teeth, o.teethDepth), fill: o.fill ?? BRASS, stroke: BROWN, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }),
    el('circle', { cx, cy, r: r - rim - Math.max(4, r * 0.11), fill: 'none', stroke: BROWN, 'stroke-width': Math.max(1, r * 0.04), 'stroke-opacity': 0.9 }),
  ];
  // Crossings: cut-outs between spokes rendered as dark sectors so the wheel reads as a wheel, not a disc.
  const inner = r - rim - Math.max(4, r * 0.11);
  for (let i = 0; i < spokes; i++) {
    const a0 = i * 360 / spokes + 8, a1 = (i + 1) * 360 / spokes - 8;
    const [x0, y0] = polar(cx, cy, inner - 1.5, a0);
    const [x1, y1] = polar(cx, cy, inner - 1.5, a1);
    const [ix0, iy0] = polar(cx, cy, hub + 3, a0);
    const [ix1, iy1] = polar(cx, cy, hub + 3, a1);
    parts.push(el('path', { d: `M${f(ix0)},${f(iy0)}L${f(x0)},${f(y0)}A${f(inner - 1.5)},${f(inner - 1.5)} 0 0 1 ${f(x1)},${f(y1)}L${f(ix1)},${f(iy1)}A${f(hub + 3)},${f(hub + 3)} 0 0 0 ${f(ix0)},${f(iy0)}Z`, fill: INK, 'fill-opacity': 0.55 }));
  }
  if (o.pinion) parts.push(el('path', { d: gearPath(cx, cy, o.pinion, Math.max(6, Math.round(o.pinion / 2)), 3), fill: BRASS_HI, stroke: BROWN, 'stroke-width': 1 }));
  parts.push(el('circle', { cx, cy, r: hub, fill: STEEL, stroke: BROWN, 'stroke-width': 1.2 }));
  parts.push(el('circle', { cx, cy, r: Math.max(2, hub * 0.35), fill: BROWN }));
  return parts;
}

/** 74×74 cubic-Bézier easing chart; `spline` null draws the linear diagonal only. */
export function easingChart(x: number, y: number, size: number, spline: [number, number, number, number] | null, title: string, caption: string): SVGGElement {
  const g = el('g', { class: 'easing-chart' });
  g.append(el('rect', { x, y, width: size, height: size, rx: 4, fill: INK, 'fill-opacity': 0.75, stroke: SAGE, 'stroke-width': 1 }));
  for (let i = 1; i < 4; i++) {
    g.append(el('line', { x1: x + i * size / 4, y1: y, x2: x + i * size / 4, y2: y + size, stroke: SAGE, 'stroke-opacity': 0.25 }));
    g.append(el('line', { x1: x, y1: y + i * size / 4, x2: x + size, y2: y + i * size / 4, stroke: SAGE, 'stroke-opacity': 0.25 }));
  }
  const px = (u: number) => x + u * size, py = (v: number) => y + size - v * size;
  if (spline) {
    const [x1, y1, x2, y2] = spline;
    g.append(el('path', { d: `M${px(0)},${py(0)}C${f(px(x1))},${f(py(y1))} ${f(px(x2))},${f(py(y2))} ${px(1)},${py(1)}`, fill: 'none', stroke: BRASS_HI, 'stroke-width': 2 }));
    g.append(el('line', { x1: px(0), y1: py(0), x2: px(x1), y2: py(y1), stroke: RUBY, 'stroke-width': 1 }));
    g.append(el('line', { x1: px(1), y1: py(1), x2: px(x2), y2: py(y2), stroke: RUBY, 'stroke-width': 1 }));
    g.append(el('circle', { cx: px(x1), cy: py(y1), r: 3, fill: RUBY }), el('circle', { cx: px(x2), cy: py(y2), r: 3, fill: RUBY }));
  } else {
    g.append(el('line', { x1: px(0), y1: py(0), x2: px(1), y2: py(1), stroke: STEEL, 'stroke-width': 2 }));
  }
  g.append(mono(x, y - 6, title, { 'font-size': 10, fill: CREAM }));
  g.append(label(x, y + size + 13, caption, { 'font-size': 10, fill: SAGE }));
  return g;
}

/** Rounded button rect + centred label; the label is pointer-transparent so SMIL event begins hit the rect id. */
export function button(id: string, x: number, y: number, w: number, h: number, caption: string, opts: { font?: string; fill?: string; size?: number } = {}): SVGGElement {
  const g = el('g', { class: 'btn-group' });
  g.append(el('rect', { id, class: 'btn', x, y, width: w, height: h, rx: 6, fill: opts.fill ?? '#35505a', stroke: BRASS, 'stroke-width': 1.2, tabindex: 0, role: 'button', 'aria-label': caption }));
  g.append(el('text', { x: x + w / 2, y: y + h / 2 + 4, 'text-anchor': 'middle', 'font-family': opts.font ?? FONT_MONO, 'font-size': opts.size ?? 11, fill: CREAM, 'pointer-events': 'none' }, caption));
  // av:animate.begin=event — hover highlight driven purely by SMIL (`id.mouseover` / `id.mouseout`), no script.
  g.append(el('set', { attributeName: 'fill', to: BRASS_HI, begin: `${id}.mouseover`, end: `${id}.mouseout`, href: `#${id}` }));
  return g;
}
