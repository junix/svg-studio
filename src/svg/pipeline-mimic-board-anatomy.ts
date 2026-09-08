// pipeline-mimic-board — anatomy column (1016,24,360,636): four windows that isolate marker geometry rules.
//   W1 corner bisector (concept:marker-vertex-bisector, concept:marker-zero-length-direction)
//   W2 closed-path direction (concept:marker-closed-path-direction, concept:polyline-fill-implicit-close,
//      concept:points-odd-coordinate-count, concept:points-parse-error-partial-render)
//   W3 non-scaling stroke (concept:marker-non-scaling-stroke)
//   W4 geometry trio: refX / markerWidth+viewBox / preserveAspectRatio, plus the four orient spellings
//      (at:marker.refX, at:marker.markerWidth, at:marker.viewBox, at:marker.preserveAspectRatio, av:marker.orient=angle)
import { el, fmt } from './lib';
import { DIM, INK, label, plate, tag } from './pipeline-mimic-board';

const ORANGE = '#e8792b';
const CW = '#7f9db0';

/** Window frame: a faint inset rect plus a numbered caption. */
function windowFrame(x: number, y: number, w: number, h: number, id: string, title: string): SVGGElement {
  const g = el('g', { id });
  g.append(el('rect', { x, y, width: w, height: h, rx: 6, fill: 'rgba(255,255,255,.03)', stroke: 'rgba(200,150,90,.22)' }));
  g.append(label(x + 10, y + 16, title, { 'font-size': 12, 'font-weight': 700 }));
  return g;
}

/** Arc from angle a0 to a1 (degrees, SVG orientation) around (cx,cy) — used to annotate marker angles. */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, stroke: string): SVGPathElement {
  const p = (a: number) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return el('path', { d: `M${fmt(x0)},${fmt(y0)} A${r},${r} 0 ${large} ${sweep} ${fmt(x1)},${fmt(y1)}`, fill: 'none', stroke, 'stroke-width': 1, 'stroke-dasharray': '3 2' });
}

/** Direction of (x1,y1)→(x2,y2) in degrees, SVG orientation (y down). */
const dirDeg = (x1: number, y1: number, x2: number, y2: number) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
/** Bisector of two directions, the way marker-mid orients: mean of the unit vectors. */
function bisector(a: number, b: number): number {
  const ax = Math.cos(a * Math.PI / 180) + Math.cos(b * Math.PI / 180);
  const ay = Math.sin(a * Math.PI / 180) + Math.sin(b * Math.PI / 180);
  return Math.atan2(ay, ax) * 180 / Math.PI;
}

/** W1 — the mid marker at a right-angle corner points along the bisector, not along either edge. */
function windowBisector(): SVGGElement {
  const g = windowFrame(1032, 40, 328, 145, 'w1', 'W1 · 转角平分线 — marker-mid 取两邻段的角平分线');
  const P = [[1060, 78], [1160, 78], [1160, 168]] as const;
  // the actual corner: mid marker (#mk-mid-w1, centred on the vertex) on a real polyline
  g.append(el('polyline', { id: 'w1-corner', points: P.map(p => p.join(',')).join(' '), fill: 'none', stroke: CW, 'stroke-width': 3,
    'marker-mid': 'url(#mk-mid-w1)', 'marker-end': 'url(#mk-arrow-plain)' }));
  // ghost tangents: two 0.01-long sub-segments starting at the corner; orient=auto reads their tangent → in-edge (0°) and out-edge (90°)
  g.append(el('path', { id: 'w1-ghost-in', d: 'M1160,78 h0.01', fill: 'none', stroke: CW, 'stroke-width': 2, 'marker-end': 'url(#mk-arrow-ghost)' }));
  g.append(el('path', { id: 'w1-ghost-out', d: 'M1160,78 v0.01', fill: 'none', stroke: CW, 'stroke-width': 2, 'marker-end': 'url(#mk-arrow-ghost)' }));
  const inA = dirDeg(P[0][0], P[0][1], P[1][0], P[1][1]);   // 0°
  const outA = dirDeg(P[1][0], P[1][1], P[2][0], P[2][1]);  // 90°
  const mid = bisector(inA, outA);                           // 45°
  g.append(arc(1160, 78, 34, inA, mid, ORANGE));
  g.append(arc(1160, 78, 34, mid, outA, DIM));
  g.append(tag(1200, 118, `${fmt(mid, 1)}°`, { fill: ORANGE, 'font-size': 12, id: 'w1-angle', 'data-in': fmt(inA), 'data-out': fmt(outA), 'data-mid': fmt(mid, 2) }));
  g.append(label(1190, 66, '入边切向 0°（虚线幽灵箭头）', { 'font-size': 11, fill: DIM }));
  g.append(label(1176, 160, '出边切向 90°', { 'font-size': 11, fill: DIM }));
  g.append(label(1044, 178, `实心中点箭头 = (${fmt(inA)}° + ${fmt(outA)}°) / 2 = ${fmt(mid)}° · 既不朝进边也不朝出边`, { 'font-size': 11, fill: INK }));
  // zero-length tail: the last vertex repeats the corner; its end marker inherits the direction of the previous non-zero segment
  g.append(el('polyline', { id: 'w1-zero', points: '1258,140 1318,140 1318,140', fill: 'none', stroke: CW, 'stroke-width': 3, 'marker-end': 'url(#mk-arrow-plain)' }));
  g.append(label(1258, 128, '零长末段 (顶点重复)', { 'font-size': 11, fill: DIM }));
  g.append(label(1258, 156, '方向继承前一非零段 →', { 'font-size': 11, fill: DIM }));
  return g;
}

/** W2 — same points string on a <polygon> and a <polyline>: the closing segment changes the start marker's angle. */
function windowClosed(stage: SVGSVGElement): SVGGElement {
  const g = windowFrame(1032, 197, 328, 145, 'w2', 'W2 · 闭合方向 — 同一份 points 交给 polygon 与 polyline');
  const PTS = '0,64 30,6 110,6 130,64';                       // identical attribute string on both hosts (DOM-comparable)
  const pts = PTS.split(' ').map(s => s.split(',').map(Number));
  const first = dirDeg(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);             // first segment direction
  const closing = dirDeg(pts[3][0], pts[3][1], pts[0][0], pts[0][1]);           // closing segment (last → first)
  const polyAngle = bisector(closing, first);
  const common = { points: PTS, fill: CW, 'fill-opacity': .22, stroke: CW, 'stroke-width': 3, 'marker-start': 'url(#mk-start-w2)', 'marker-mid': 'url(#mk-dot)' };
  const left = el('g', { transform: 'translate(1052,232)' });
  left.append(el('polygon', { id: 'w2-polygon', ...common }));
  left.append(arc(0, 64, 26, first, polyAngle, ORANGE));
  left.append(tag(-6, 96, `polygon · start ${fmt(polyAngle, 1)}°`, { 'font-size': 11, fill: ORANGE, id: 'w2-polygon-angle', 'data-angle': fmt(polyAngle, 2) }));
  const right = el('g', { transform: 'translate(1206,232)' });
  // polyline: fill still closes the area implicitly (concept:polyline-fill-implicit-close) but the stroke stays open
  right.append(el('polyline', { id: 'w2-polyline', ...common, 'marker-end': 'url(#mk-arrow-plain)' }));
  right.append(arc(0, 64, 26, first, 0, ORANGE));
  right.append(tag(-6, 96, `polyline · start ${fmt(first, 1)}°`, { 'font-size': 11, fill: ORANGE, id: 'w2-polyline-angle', 'data-angle': fmt(first, 2) }));
  g.append(left, right);
  g.append(label(1046, 320, `起点箭头：polygon 在闭合段(${fmt(closing)}°)与首段(${fmt(first)}°)之间；polyline 只朝首段。fill 都隐式闭合，描边只有 polygon 封口。`, { 'font-size': 11, fill: INK }));
  // odd coordinate count: the dangling "1348" is dropped → only the three complete pairs render (a triangle)
  const odd = el('polygon', { id: 'w2-odd', points: '1296,318 1340,318 1318,296 1348', fill: ORANGE, 'fill-opacity': .35, stroke: ORANGE, 'stroke-width': 1.5 });
  g.append(odd);
  g.append(label(1298, 334, 'points 奇数个坐标 → 丢尾', { 'font-size': 11, fill: DIM }));
  // Chromium reports the truncated list on the console; declare the exact substring so the capture tolerates only that.
  const expected = new Set((stage.dataset.expectedErrors ?? '').split(' | ').filter(Boolean));
  expected.add('attribute points: Expected');
  stage.dataset.expectedErrors = [...expected].join(' | ');
  return g;
}

/** W3 — vector-effect="non-scaling-stroke" keeps the line a hairline while markers scale with the CTM. */
function windowNonScaling(): SVGGElement {
  const g = windowFrame(1032, 354, 328, 145, 'w3', 'W3 · 非缩放描边 — 发丝线配巨大箭头');
  // left: scale(3) group; stroke-width 2 → 2px on screen (non-scaling), arrow = markerWidth 6 × stroke-width 2 × CTM 3 = 36px
  const zoom = el('g', { id: 'w3-zoom', transform: 'translate(1058,384) scale(3)' });
  zoom.append(el('polyline', { id: 'w3-zoomed', points: '0,0 32,0 32,28', fill: 'none', stroke: ORANGE, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke',
    'marker-start': 'url(#mk-ref-us)', 'marker-mid': 'url(#mk-arrow-plain)', 'marker-end': 'url(#mk-arrow-plain)' }));
  g.append(zoom);
  g.append(label(1046, 484, 'scale(3) + non-scaling-stroke：描边仍 2px，箭头 ×3', { 'font-size': 11, fill: DIM }));
  // right: unscaled twin with the same on-screen footprint (coordinates pre-multiplied by 3); same markers, no zoom
  const twin = el('g', { id: 'w3-twin', transform: 'translate(1216,384)' });
  twin.append(el('polyline', { id: 'w3-plain', points: '0,0 96,0 96,84', fill: 'none', stroke: ORANGE, 'stroke-width': 2,
    'marker-start': 'url(#mk-ref-us)', 'marker-mid': 'url(#mk-arrow-plain)', 'marker-end': 'url(#mk-arrow-plain)' }));
  g.append(twin);
  g.append(label(1216, 484, '孪生件未缩放：同款箭头 12px · 起点 8px 基准方块', { 'font-size': 11, fill: DIM }));
  // equal-length baselines under both for measurement
  for (const x of [1058, 1216]) g.append(el('line', { x1: x, y1: 472, x2: x + 96, y2: 472, stroke: DIM, 'stroke-width': 1, 'marker-start': 'url(#mk-dim)', 'marker-end': 'url(#mk-dim)' }));
  return g;
}

/** W4 — refX / markerWidth+viewBox / preserveAspectRatio rows plus the four orient spellings. */
function windowGeometry(): SVGGElement {
  const g = windowFrame(1032, 511, 328, 145, 'w4', 'W4 · 几何三联 — refX · markerWidth/viewBox · preserveAspectRatio');
  const row = (y: number, name: string) => g.append(tag(1044, y + 4, name, { 'font-size': 11, fill: DIM }));
  const stub = (x: number, y: number, len: number, marker: string, sw = 5, extra: Record<string, string | number> = {}) =>
    g.append(el('line', { x1: x, y1: y, x2: x + len, y2: y, stroke: INK, 'stroke-width': sw, 'marker-end': marker, ...extra }));
  const cap = (x: number, y: number, s: string, attrs: Record<string, string | number> = {}) => g.append(label(x, y, s, { 'font-size': 11, fill: DIM, ...attrs }));

  // row 1: refX=0 (arrow body overshoots the vertex) vs refX=92 (tip presses on the vertex) vs refX="center" probe
  const y1 = 546;
  row(y1, 'refX');
  stub(1090, y1, 40, 'url(#mk-ref0)'); cap(1090, y1 + 18, 'refX=0 过冲');
  stub(1178, y1, 40, 'url(#mk-arrow-plain)'); cap(1178, y1 + 18, 'refX=92 箭尖压点');
  stub(1270, y1, 40, 'url(#mk-refc)'); cap(1270, y1 + 18, 'refX="center"', { id: 'w4-refc-cap' });
  for (const x of [1130, 1218, 1310]) g.append(el('line', { x1: x, y1: y1 - 9, x2: x, y2: y1 + 9, stroke: ORANGE, 'stroke-width': 1, 'stroke-dasharray': '2 2' }));

  // row 2: same content under markerWidth/markerHeight 3 vs 8 (viewBox scales it), and a copy without viewBox (content clipped)
  const y2 = 588;
  row(y2, 'markerWidth');
  stub(1090, y2, 40, 'url(#mk-w3)'); cap(1090, y2 + 18, 'markerWidth=3');
  stub(1178, y2, 40, 'url(#mk-w8)'); cap(1178, y2 + 18, 'markerWidth=8');
  stub(1270, y2, 40, 'url(#mk-novb)'); cap(1270, y2 + 18, '无 viewBox → 被视口裁掉');

  // row 3: square viewBox inside a 2:1 marker box — xMinYMid meet / xMaxYMid meet / none
  const y3 = 626;
  row(y3, 'pAR 2:1');
  stub(1090, y3, 40, 'url(#mk-par-l)', 6); cap(1090, y3 + 18, 'xMinYMid meet 左贴');
  stub(1178, y3, 40, 'url(#mk-par-r)', 6); cap(1178, y3 + 18, 'xMaxYMid meet 右贴');
  stub(1270, y3, 40, 'url(#mk-par-n)', 6); cap(1270, y3 + 18, 'none 拉伸');
  for (const x of [1130, 1218, 1310]) g.append(el('rect', { x: x - 24, y: y3 - 12, width: 48, height: 24, fill: 'none', stroke: ORANGE, 'stroke-width': 1, 'stroke-dasharray': '2 2' }));

  // orient spellings (SVG 2: number / deg / rad / grad) on a curvy path — every arrow keeps the same fixed angle
  const yo = 566;
  const orientHosts = el('g', { id: 'w4-orient', fill: 'none', stroke: CW, 'stroke-width': 3 });
  const ids = ['mk-o1', 'mk-o2', 'mk-o3', 'mk-o4'];
  ids.forEach((id, i) => {
    const x = 1044 + i * 76;
    orientHosts.append(el('path', { d: `M${x},${yo + 8} q10,-12 20,0`, 'marker-end': `url(#${id})`, 'data-marker': id }));
  });
  g.append(orientHosts);
  g.append(tag(1044, yo + 24, '', { id: 'w4-orient-readout', 'font-size': 11, fill: INK }));
  return g;
}

/** Local marker definitions used only by the anatomy windows (ids prefixed mk-*-w1/w2 to avoid collisions). */
function anatomyDefs(): SVGDefsElement {
  const defs = el('defs');
  // centred mid arrow so its body straddles the corner and the 45° reading is visible
  const midW1 = el('marker', { id: 'mk-mid-w1', viewBox: '0 0 100 100', refX: 50, refY: 50, markerUnits: 'strokeWidth', markerWidth: 10, markerHeight: 10, orient: 'auto' });
  midW1.append(el('path', { d: 'M6 20 L92 50 L6 80 L26 50 Z', fill: ORANGE }));
  // start arrow for W2, centred on the start vertex (refX=50) so polygon and polyline angles can be compared
  const startW2 = el('marker', { id: 'mk-start-w2', viewBox: '0 0 100 100', refX: 50, refY: 50, markerUnits: 'strokeWidth', markerWidth: 9, markerHeight: 9, orient: 'auto' });
  startW2.append(el('path', { d: 'M6 20 L92 50 L6 80 L26 50 Z', fill: ORANGE }));
  defs.append(midW1, startW2);
  return defs;
}

/** Build the anatomy column. `stage` receives the expected-console-error declaration for the odd points sample. */
export function buildAnatomy(stage: SVGSVGElement): SVGGElement {
  const g = el('g', { id: 'anatomy' });
  g.append(plate(1016, 24, 360, 636));
  g.append(anatomyDefs());
  g.append(windowBisector(), windowClosed(stage), windowNonScaling(), windowGeometry());
  return g;
}
