// seismic-drum-console — static console furniture: header, calibration bar (percentage diagonal), overflow
// triplet, calibration target (negative viewBox origin), cursor bricks, meet/slice miniatures, a tiny SVG
// slider widget and text helpers. Everything here is stage-space (台面) geometry; the camera lives in the main module.
import { el, FONT_CJK, FONT_MONO, FONT_SERIF, type Attrs } from './lib';
import { R, C, fitViewport, f2 } from './seismic-drum-console-data';

type Anchor = 'start' | 'middle' | 'end';

/** CJK/UI label (Noto Sans CJK subset embedded by scripts/build-fonts.mjs). */
export const label = (x: number, y: number, str: string, size = 12, fill: string = C.cream, anchor: Anchor = 'start', extra: Attrs = {}): SVGTextElement =>
  el('text', { x, y, 'font-family': FONT_CJK, 'font-size': size, fill, 'text-anchor': anchor, ...extra }, str);

/** Monospace readout (Latin Modern Mono) — every number in the console uses this so digits line up column by column. */
export const mono = (x: number, y: number, str: string, size = 11, fill: string = C.cream, anchor: Anchor = 'start', extra: Attrs = {}): SVGTextElement =>
  el('text', { x, y, 'font-family': FONT_MONO, 'font-size': size, fill, 'text-anchor': anchor, ...extra }, str);

/** Dark rounded console panel. Gaps between panels stay transparent (no full-stage backdrop). */
export const panel = (r: { x: number; y: number; w: number; h: number }, extra: Attrs = {}): SVGRectElement =>
  el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 6, fill: C.panel, 'fill-opacity': .94, stroke: C.panelEdge, 'stroke-width': 1, ...extra });

// ---- header (no backdrop: the whole strip stays transparent apart from type and a rule)
export function header(): SVGGElement {
  const g = el('g', { id: 'header' });
  const r = R.header;
  g.append(
    label(r.x + 8, r.y + 40, '地震记录鼓控制台', 28, C.cream, 'start', { 'font-weight': 700 }),
    el('text', { x: r.x + 262, y: r.y + 40, 'font-family': FONT_SERIF, 'font-style': 'italic', 'font-size': 19, fill: C.amber }, 'Seismic Drum Console'),
    label(r.x + 8, r.y + 68, '一段记录的坐标真相究竟住在 viewBox 里、CTM 里，还是指针里？— 三条换算链对同一个采样点各报一次走时，逐位相同校验灯才亮绿。', 13, C.muted),
    el('line', { x1: r.x, y1: r.y + 82, x2: r.x + r.w, y2: r.y + 82, stroke: C.panelEdge, 'stroke-width': 1 }),
    // the three coordinate layers every readout names
    mono(r.x + r.w, r.y + 22, '屏幕空间  client px  (clientX, clientY)', 11, C.blue, 'end'),
    mono(r.x + r.w, r.y + 40, '台面空间  #stage viewBox 0 0 1400 900  (1 单位 = 1 px)', 11, C.amber, 'end'),
    mono(r.x + r.w, r.y + 58, '记录纸空间  #camera viewBox 1440×840  (24 单位/分, 1 单位 = 2.5 s, 行高 35)', 11, C.cyan, 'end'),
    mono(r.x + r.w, r.y + 76, '滚轮 缩放锚在光标下 · 拖拽 平移 · Shift+拖拽 框选 · 笔/台面拖拽 手描注记', 11, C.dim, 'end'),
  );
  return g;
}

// ---- calibration bar: circle r="50%" inside a 400×100 nested viewport → r = 0.5·sqrt((400²+100²)/2) = 145.77
//      (concept:percentage-diagonal-formula). The viewport clips the circle into a wide arc band.
export function calibrationBar(): SVGGElement {
  const r = R.calib;
  const diag = 0.5 * Math.sqrt((400 * 400 + 100 * 100) / 2);
  const g = el('g', { id: 'calibration-bar' });
  const inner = el('svg', { id: 'calib-viewport', x: r.x, y: r.y, width: r.w, height: r.h, viewBox: '0 0 400 100' });
  inner.append(
    el('rect', { width: 400, height: 100, fill: C.panel, 'fill-opacity': .94, stroke: C.panelEdge }),
    // references: r=50 fits the height exactly, r=200 would touch the side walls
    el('circle', { cx: 200, cy: 50, r: 50, fill: 'none', stroke: C.dim, 'stroke-dasharray': '3 3' }),
    el('circle', { cx: 200, cy: 50, r: 200, fill: 'none', stroke: C.dim, 'stroke-dasharray': '3 3' }),
    // the specimen: a non-axis percentage resolves against the normalized diagonal
    el('circle', { id: 'calib-circle', cx: 200, cy: 50, r: '50%', fill: C.amber, 'fill-opacity': .18, stroke: C.amber, 'stroke-width': 1.5 }),
    el('line', { x1: 200, y1: 50, x2: 200 + diag * Math.cos(-0.35), y2: 50 + diag * Math.sin(-0.35), stroke: C.amber, 'stroke-width': 1, 'stroke-dasharray': '4 2' }),
  );
  g.append(inner,
    label(r.x + 10, r.y + 16, '标定条 · 嵌套视口 400×100', 12, C.cream),
    mono(r.x + 10, r.y + 34, 'circle r="50%" → r = 0.5·√((400²+100²)/2) = ' + diag.toFixed(2), 11, C.amber),
    mono(r.x + 10, r.y + 50, '> 半高 50   < 半宽 200   → 被裁成宽弧带', 11, C.muted),
    mono(r.x + r.w - 10, r.y + 92, 'getBBox().width ≈ ' + (2 * diag).toFixed(1), 11, C.dim, 'end'),
  );
  return g;
}

// ---- overflow triplet: three 120×72 nested viewports with a spilling circle, overflow hidden / visible / scroll
//      (pr:overflow, pv:overflow=scroll — scroll behaves as hidden on SVG viewports, no scrollbar is generated).
export function overflowTriplet(): SVGGElement {
  const g = el('g', { id: 'overflow-triplet' });
  const cells: { mode: 'hidden' | 'visible' | 'scroll'; note: string; colour: string }[] = [
    { mode: 'hidden', note: '裁在框内', colour: C.blue },
    { mode: 'visible', note: '溢到台面上', colour: C.magenta },
    { mode: 'scroll', note: '实测 ≡ hidden，无滚动条', colour: C.green },
  ];
  cells.forEach((cell, i) => {
    const x = R.overflow.x + i * 140, y = R.overflow.y;
    const v = el('svg', { class: 'overflow-cell', x, y, width: 120, height: 72, viewBox: '0 0 120 72', overflow: cell.mode, 'data-overflow': cell.mode });
    v.append(
      el('rect', { width: 120, height: 72, fill: C.panel, 'fill-opacity': .94 }),
      el('circle', { cx: 104, cy: 40, r: 34, fill: cell.colour, 'fill-opacity': .35, stroke: cell.colour, 'stroke-width': 1.5 }),
    );
    g.append(v,
      el('rect', { x, y, width: 120, height: 72, fill: 'none', stroke: C.panelEdge, 'stroke-dasharray': '3 2' }),
      mono(x + 6, y + 14, 'overflow:' + cell.mode, 11, C.cream),
      label(x + 6, y + 64, cell.note, 11, C.muted),
    );
  });
  return g;
}

// ---- calibration target: viewBox="-50 -50 100 100" puts (0,0) at the panel centre (concept:viewbox-negative-origin).
export interface Target { g: SVGGElement; dot: SVGCircleElement; originMark: SVGGElement; originText: SVGTextElement }
export function calibrationTarget(): Target {
  const r = R.target;
  const g = el('g', { id: 'calibration-target' });
  const v = el('svg', { id: 'target-viewport', x: r.x, y: r.y, width: r.w, height: r.h, viewBox: '-50 -50 100 100' });
  v.append(el('rect', { x: -50, y: -50, width: 100, height: 100, fill: C.panel, 'fill-opacity': .94 }));
  for (let t = -40; t <= 40; t += 10) {
    if (t === 0) continue;
    v.append(el('line', { x1: t, y1: -2, x2: t, y2: 2, stroke: C.dim, 'stroke-width': .8 }), el('line', { x1: -2, y1: t, x2: 2, y2: t, stroke: C.dim, 'stroke-width': .8 }));
  }
  v.append(
    el('line', { x1: -50, y1: 0, x2: 50, y2: 0, stroke: C.muted, 'stroke-width': .8 }),
    el('line', { x1: 0, y1: -50, x2: 0, y2: 50, stroke: C.muted, 'stroke-width': .8 }),
    el('circle', { cx: 0, cy: 0, r: 30, fill: 'none', stroke: C.dim, 'stroke-width': .6, 'stroke-dasharray': '2 2' }),
  );
  const dot = el('circle', { id: 'target-dot', cx: 0, cy: 0, r: 3, fill: C.cyan, stroke: C.panel, 'stroke-width': 1 });
  v.append(dot);
  // hand-computed origin marker drawn in stage space via DOMPoint(0,0).matrixTransform(handMatrix)
  const originMark = el('g', { id: 'target-origin', fill: 'none', stroke: C.green, 'stroke-width': 1.2 },
    el('circle', { r: 6 }), el('line', { x1: -10, x2: 10 }), el('line', { y1: -10, y2: 10 }));
  const { k, tx, ty } = fitViewport(r.x, r.y, r.w, r.h, -50, -50, 100, 100);
  const o = new DOMPoint(0, 0).matrixTransform(new DOMMatrix().translateSelf(tx, ty).scaleSelf(k, k));
  originMark.setAttribute('transform', `translate(${o.x} ${o.y})`);
  const originText = mono(r.x + r.w / 2, r.y + r.h - 6, `手算原点 (${f2(o.x)}, ${f2(o.y)}) ✓ 正中`, 11, C.green, 'middle');
  g.append(v, originMark,
    mono(r.x + 4, r.y + 12, 'viewBox -50 -50 100 100', 11, C.muted),
    mono(r.x + r.w - 4, r.y + 12, 'I', 11, C.dim, 'end'), mono(r.x + 4, r.y + r.h - 20, 'III', 11, C.dim), mono(r.x + r.w - 4, r.y + r.h - 20, 'IV', 11, C.dim, 'end'),
    originText);
  return { g, dot, originMark, originText };
}

// ---- four 24×24 cursor sample bricks (pr:cursor)
export function cursorBricks(x: number, y: number): SVGGElement {
  const g = el('g', { id: 'cursor-bricks' });
  g.append(label(x, y - 8, 'cursor 取值样例（悬停试试）', 11, C.muted));
  const bricks: [string, string][] = [['grab', C.amber], ['crosshair', C.cyan], ['ns-resize', C.blue], ['not-allowed', C.red]];
  bricks.forEach(([cursor, colour], i) => {
    const bx = x + i * 36;
    g.append(el('rect', { x: bx, y, width: 24, height: 24, rx: 3, fill: colour, 'fill-opacity': .3, stroke: colour, cursor }));
    g.append(mono(bx + 12, y + (i % 2 ? 50 : 36), cursor, 11, colour, 'middle'));
  });
  return g;
}

// ---- meet vs slice miniatures (40×20 viewports on a square viewBox)
export function miniMeetSlice(x: number, y: number): SVGGElement {
  const g = el('g', { id: 'mini-meet-slice' });
  (['meet', 'slice'] as const).forEach((mode, i) => {
    const mx = x + i * 66;
    const v = el('svg', { x: mx, y, width: 40, height: 20, viewBox: '0 0 100 100', preserveAspectRatio: `xMidYMid ${mode}` });
    v.append(el('rect', { width: 100, height: 100, fill: C.cyan, 'fill-opacity': .18 }), el('circle', { cx: 50, cy: 50, r: 44, fill: 'none', stroke: C.cyan, 'stroke-width': 8 }));
    g.append(v, el('rect', { x: mx, y, width: 40, height: 20, fill: 'none', stroke: C.panelEdge }));
    g.append(mono(mx + 20, y + 33, mode === 'meet' ? 'meet 留空隙' : 'slice 裁两头', 11, C.muted, 'middle'));
  });
  return g;
}

// ---- tiny SVG slider: track + handle; pointer position is mapped through stage.getScreenCTM().inverse()
export interface Slider { g: SVGGElement; set(value: number): void; readonly value: number }
export interface SliderOptions {
  x: number; y: number; w: number; label: string; min: number; max: number; value: number;
  format(v: number): string; onChange(v: number): void;
}
export function slider(stage: SVGSVGElement, o: SliderOptions): Slider {
  const g = el('g', { class: 'slider', cursor: 'ew-resize' });
  const trackY = o.y + 20;
  const title = label(o.x, o.y + 4, o.label, 11, C.muted);
  const readout = mono(o.x + o.w, o.y + 4, o.format(o.value), 11, C.cream, 'end');
  const track = el('rect', { x: o.x, y: trackY - 3, width: o.w, height: 6, rx: 3, fill: C.dim, 'fill-opacity': .5 });
  const fill = el('rect', { x: o.x, y: trackY - 3, width: 0, height: 6, rx: 3, fill: C.amber, 'fill-opacity': .7 });
  const handle = el('circle', { cy: trackY, r: 6, fill: C.cream, stroke: C.amber, 'stroke-width': 1.5 });
  const hit = el('rect', { x: o.x - 8, y: trackY - 12, width: o.w + 16, height: 24, fill: '#000', 'fill-opacity': 0 });
  g.append(title, readout, track, fill, handle, hit);
  let value = o.value;
  const paint = () => {
    const t = (value - o.min) / (o.max - o.min);
    handle.setAttribute('cx', String(o.x + t * o.w));
    fill.setAttribute('width', String(t * o.w));
    readout.textContent = o.format(value);
  };
  const set = (v: number) => { value = Math.min(o.max, Math.max(o.min, v)); paint(); };
  const fromEvent = (e: PointerEvent) => {
    // screen → 台面: invert the root's screen CTM (api:SVGGraphicsElement.getScreenCTM)
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(stage.getScreenCTM()!.inverse());
    set(o.min + ((p.x - o.x) / o.w) * (o.max - o.min));
    o.onChange(value);
  };
  let dragging = false;
  hit.addEventListener('pointerdown', e => { dragging = true; hit.setPointerCapture(e.pointerId); e.stopPropagation(); fromEvent(e); });
  hit.addEventListener('pointermove', e => { if (dragging) { e.stopPropagation(); fromEvent(e); } });
  hit.addEventListener('pointerup', () => { dragging = false; });
  hit.addEventListener('pointercancel', () => { dragging = false; });
  paint();
  return { g, set, get value() { return value; } };
}
