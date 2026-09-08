// ship-lofting-floor — title-band stroke ladder and the tool shelf (40,704)-(900,876):
// absolute-unit lofting rules, spline ducks with a baseVal gauge, and the cap / join / miterlimit templates.
import { el, mark, FONT_CJK } from './lib';
import { C, panel, label, g } from './ship-lofting-floor-ui';

export interface Detect { cssD: boolean; cssGeom: boolean; getPathData: boolean; pathSegList: boolean }

export interface Shelf {
  /** slider band in user units — pointermove inside it drives the duck radius */
  slider: { x: number; y: number; w: number; h: number };
  /** t ∈ [0,1] → r = 6 + 8t written through SVGAnimatedLength.baseVal (and the --duck-r custom property) */
  setDuckT(t: number): void;
}

/** Title band (40,24)-(1360,92): heading plus the line-weight ladder (pr:stroke-width, pv:stroke-width=0)
 *  and a rect whose 12px stroke straddles the 0.5px geometry guide by 6 on each side. */
export function buildTitleBand(stage: SVGSVGElement): void {
  const band = g({ id: 'title-band' }, panel(40, 24, 1320, 68));
  band.append(el('text', { x: 56, y: 56, 'font-family': FONT_CJK, 'font-size': 24, 'font-weight': 700, fill: C.white }, '船体放样间 · Ship Lofting Floor'));
  band.append(label(56, 78, '每一条路径命令化作一根足尺型线：M L H V C S Q T A Z · 控制网即时核对 · matrix() 轴测 · 绝对单位放样尺', { fill: C.dim }));
  // line-weight ladder: stroke-width 0.5 / 1 / 4 / 12 / 0 — the last row draws nothing (pv:stroke-width=0)
  const rows: [number, number, string][] = [[0.5, 34, '0.5'], [1, 45, '1'], [4, 57, '4'], [12, 72, '12'], [0, 86, '0 → 不出线']];
  const ladder = g({ id: 'stroke-ladder' });
  rows.forEach(([w, y, name]) => {
    ladder.append(el('line', { x1: 1040, y1: y, x2: 1110, y2: y, stroke: w === 0 ? C.red : C.cyan, 'stroke-width': w }));
    ladder.append(label(1000, y + 4, name, { mono: w !== 0, fill: w === 0 ? C.red : C.dim }));
  });
  ladder.append(label(1000, 30, 'stroke-width 梯', { fill: C.faint }));
  // straddle: the same 60×34 rect twice — 12px stroke (half inside, half outside) under a 0.5px geometry guide
  ladder.append(el('rect', { x: 1170, y: 41, width: 60, height: 34, fill: 'none', stroke: C.cyan, 'stroke-opacity': .45, 'stroke-width': 12 }));
  ladder.append(el('rect', { x: 1170, y: 41, width: 60, height: 34, fill: 'none', stroke: C.white, 'stroke-width': .5 }));
  ladder.append(label(1246, 54, '描边骑跨几何边', { fill: C.text }));
  ladder.append(label(1246, 68, '12 → 内外各占 6', { fill: C.dim }));
  band.append(ladder);
  stage.append(band);
}

/** Tool shelf (40,704)-(900,876). */
export function buildShelf(stage: SVGSVGElement, detect: Detect): Shelf {
  const shelf = g({ id: 'shelf' }, panel(40, 704, 860, 172));
  shelf.append(label(52, 720, '工具搁架 · 放样尺 / 压铁 / 样板', { fill: C.dim }));

  // ── Column A: absolute units (concept:length-units-absolute) — six rules, same left end, six unit spellings.
  const rulers = g({ id: 'rulers' });
  const units = ['96px', '1in', '2.54cm', '25.4mm', '72pt', '6pc'];
  const fills = [C.yellow, C.cyan, C.green, C.violet, C.pink, C.orange];
  units.forEach((w, i) => {
    const y = 730 + i * 11;
    rulers.append(el('rect', { class: 'ruler', x: 60, y, width: w, height: 8, fill: fills[i], 'fill-opacity': .85 }));
    rulers.append(label(162, y + 8, w === '6pc' ? '6pc = 96px' : w, { mono: true, fill: C.dim }));
  });
  // right-end guide: all six rules must end exactly here (x = 60 + 96)
  rulers.append(el('line', { x1: 156, y1: 726, x2: 156, y2: 798, stroke: C.yellow, 'stroke-width': .75, 'stroke-dasharray': '3 2' }));
  rulers.append(label(156, 808, 'x=156', { mono: true, fill: C.yellow, anchor: 'middle' }));
  // nested viewport: the same 1in rule inside viewBox 0 0 200 24 drawn at width 100 → 48 screen px, not 96
  // (concept:units-inside-viewbox-scaled)
  const nested = el('svg', { id: 'unit-viewbox', x: 60, y: 816, width: 100, height: 12, viewBox: '0 0 200 24', preserveAspectRatio: 'none' });
  nested.append(el('rect', { x: 0, y: 0, width: 200, height: 24, fill: 'none', stroke: C.edge, 'stroke-width': 1 }));
  nested.append(el('rect', { id: 'inch-in-viewbox', x: 0, y: 4, width: '1in', height: 16, fill: C.cyan, 'fill-opacity': .85 }));
  rulers.append(nested);
  rulers.append(label(166, 826, '← 1in 在 viewBox 内 = 48px', { fill: C.dim }));
  rulers.append(label(60, 846, 'width="1in" 先换算为 96 用户单位', { fill: C.faint }));
  rulers.append(label(60, 860, '再随 viewBox 0 0 200 24 缩放 ×0.5', { fill: C.faint }));
  shelf.append(rulers);
  mark(stage, 'concept:length-units-absolute', 'concept:units-inside-viewbox-scaled');

  // ── Column B: spline ducks. CSS geometry properties give the radius (css:geometry-properties,
  //    css:custom-properties-in-geometry, css:geometry-properties-transition); a pointer gauge writes r.baseVal.
  const ducksCol = g({ id: 'ducks-column' });
  ducksCol.append(label(282, 738, '压铁 · r.baseVal 游标', { fill: C.text }));
  const slider = { x: 282, y: 742, w: 200, h: 14 };
  ducksCol.append(el('line', { x1: 290, y1: 749, x2: 470, y2: 749, stroke: C.faint, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const handle = el('rect', { id: 'duck-slider-handle', x: 290 - 4, y: 741, width: 8, height: 16, rx: 2, fill: C.yellow });
  const gauge = el('circle', { id: 'duck-gauge', cx: 500, cy: 749, r: 9, fill: 'none', stroke: C.yellow, 'stroke-width': 2 });
  const gaugeText = label(282, 770, '', { mono: true, fill: C.dim, id: 'duck-gauge-text' });
  ducksCol.append(handle, gauge, gaugeText);
  // tray rect: width comes from the stylesheet rule `rect.duck-tray{ width:210px }` (css:geometry-properties)
  const tray = el('rect', { class: 'duck-tray', x: 282, y: 780, height: 70, rx: 6, fill: C.panel, stroke: C.edge, 'stroke-width': .5 });
  if (!detect.cssGeom) tray.setAttribute('width', '210'); // Firefox: attribute fallback
  ducksCol.append(tray);
  // batten: a miniature sheer; nine ducks sit at equal arc-length steps (api:SVGGeometryElement.getPointAtLength)
  const batten = el('path', { id: 'batten', d: 'M292 832 C340 806 400 796 480 802', fill: 'none', stroke: C.white, 'stroke-width': 1.5, 'stroke-opacity': .8 });
  ducksCol.append(batten);
  shelf.append(ducksCol);
  stage.append(shelf); // append before measuring so getPointAtLength has a live element
  const L = batten.getTotalLength();
  const ducks: SVGCircleElement[] = [];
  for (let i = 0; i < 9; i++) {
    const p = batten.getPointAtLength(L * i / 8);
    const duck = el('circle', { class: 'duck', cx: p.x, cy: p.y, r: 9, fill: C.yellow, 'fill-opacity': .9, stroke: C.panel, 'stroke-width': 1 });
    ducks.push(duck);
    ducksCol.append(duck);
  }
  ducksCol.append(label(282, 866, 'r: var(--duck-r) · :hover → 14px', { mono: true, fill: C.faint }));
  mark(stage, 'css:geometry-properties', 'css:custom-properties-in-geometry', 'css:geometry-properties-transition');

  // ── Column C: three templates.
  // end-cap template (pr:stroke-linecap, pv:stroke-linecap=round / square): 14px lines over a 1px guide
  const caps = g({ id: 'cap-board' });
  caps.append(label(540, 738, '端帽 linecap', { fill: C.text }));
  (['butt', 'round', 'square'] as const).forEach((cap, i) => {
    const y = 756 + i * 24;
    caps.append(el('line', { x1: 544, y1: y, x2: 608, y2: y, stroke: C.white, 'stroke-width': 1 }));
    caps.append(el('line', { x1: 552, y1: y, x2: 600, y2: y, stroke: [C.pink, C.green, C.cyan][i], 'stroke-opacity': .8, 'stroke-width': 14, 'stroke-linecap': cap }));
    caps.append(label(612, y + 4, cap, { mono: true, fill: C.dim }));
  });
  caps.append(label(540, 836, 'round / square 各伸出 7', { fill: C.faint }));
  caps.append(label(540, 850, 'butt 与 1px 导线齐平', { fill: C.faint }));
  shelf.append(caps);
  // join template (pr:stroke-linejoin, pv:stroke-linejoin=round / bevel; miter-clip & arcs are Firefox-only)
  const joins = g({ id: 'join-board' });
  joins.append(label(655, 738, '接头 linejoin', { fill: C.text }));
  const joinKinds = ['miter', 'round', 'bevel', 'miter-clip', 'arcs'];
  joinKinds.forEach((join, i) => {
    const y = 746 + i * 24;
    joins.append(el('path', { d: 'M0 14 L12 0 L24 14 L36 0', fill: 'none', stroke: i < 3 ? C.cyan : C.orange, 'stroke-opacity': .85, 'stroke-width': 8, 'stroke-linejoin': join, transform: `translate(663 ${y})` }));
    joins.append(label(708, y + 11, i < 3 ? join : `${join}*`, { mono: true, fill: i < 3 ? C.dim : C.orange }));
  });
  joins.append(label(655, 866, '* Firefox only → 此处回退 miter', { fill: C.faint }));
  shelf.append(joins);
  // miterlimit template (pr:stroke-miterlimit): 20° chevrons, miter ratio 1/sin(10°) ≈ 5.76 → only limit 10 spikes
  const miter = g({ id: 'miter-board' });
  miter.append(label(785, 738, 'miterlimit 1 / 4 / 10', { fill: C.text }));
  const dx = 36 * Math.sin(Math.PI / 18), dy = 36 * Math.cos(Math.PI / 18);
  [1, 4, 10].forEach((limit, i) => {
    const ax = 802 + i * 36, ay = 770;
    miter.append(el('path', { d: `M${(ax - dx).toFixed(2)} ${(ay + dy).toFixed(2)} L${ax} ${ay} L${(ax + dx).toFixed(2)} ${(ay + dy).toFixed(2)}`, fill: 'none', stroke: limit === 10 ? C.yellow : C.violet, 'stroke-width': 8, 'stroke-linejoin': 'miter', 'stroke-miterlimit': limit }));
    miter.append(label(ax, 822, String(limit), { mono: true, fill: C.dim, anchor: 'middle' }));
  });
  miter.append(label(785, 840, '夹角 20° → 斜接比 5.76', { fill: C.faint }));
  miter.append(label(785, 854, '1 与 4 削平，10 长出尖刺', { fill: C.faint }));
  miter.append(label(785, 868, '尖刺高 = 4 / sin10° ≈ 23', { fill: C.faint }));
  shelf.append(miter);

  // gauge: t → r via SVGAnimatedLength.baseVal, mm read back through SVGLength.convertToSpecifiedUnits
  const MM = 7; // SVGLength.SVG_LENGTHTYPE_MM
  const setDuckT = (t: number): void => {
    const tt = Math.min(1, Math.max(0, t));
    const r = 6 + 8 * tt;
    gauge.r.baseVal.value = r;                       // api:SVGAnimatedLength.baseVal — the gauge resizes live
    handle.x.baseVal.value = 290 + 180 * tt - 4;
    if (detect.cssGeom) ducksCol.style.setProperty('--duck-r', `${r}px`); // all nine ducks follow one custom property
    for (const duck of ducks) duck.r.baseVal.value = r; // attribute stays in sync (Firefox visible path)
    const probe = gauge.r.baseVal;
    probe.convertToSpecifiedUnits(MM);
    const mm = probe.valueInSpecifiedUnits;
    probe.convertToSpecifiedUnits(1);                // back to user units (SVG_LENGTHTYPE_NUMBER)
    gaugeText.textContent = `r.baseVal = ${r.toFixed(2)}px = ${mm.toFixed(2)}mm`;
  };
  setDuckT(3 / 8);
  mark(stage, 'api:SVGAnimatedLength.baseVal', 'api:SVGLength.convertToSpecifiedUnits');
  return { slider, setDuckT };
}
