// pipeline-mimic-board — bottom band (24,676,1352,200).
//   left  x 60..690 : dimension band — .dim{marker:url(#mk-dim)} (pr:marker) on 0° / 90° / 30° lines, end ticks stay
//                     perpendicular via orient=auto (concept:marker-dimension-ticks); #mk-tick range ticks hang below (refY=0)
//   right x 700..1352: legend tracks (line hosts, symbols only), marker-vs-symbol (concept:marker-vs-symbol), interlock graph
//                     (concept:marker-graph-nodes), flow trend (concept:marker-vertex-glyphs), alarm star (at:polygon.points)
import { el, fmt } from './lib';
import { DIM, INK, TAG_FONT, label, plate, tag } from './pipeline-mimic-board';

const ORANGE = '#e8792b';
const CW = '#7f9db0';
const PANEL = '#8d959b';

/** Dimension band: three dimension lines whose end ticks come from one CSS `marker` shorthand rule. */
function dimensionBand(): SVGGElement {
  const g = el('g', { id: 'dim-band' });
  g.append(label(40, 696, '尺寸标注带 · .dim{marker:url(#mk-dim)} 一条声明覆盖起/中/末端撇 · orient=auto → 端撇永远垂直于尺寸线', { 'font-size': 12, 'font-weight': 700 }));
  // 0°: horizontal <line> 8600
  g.append(el('line', { id: 'dim-h', class: 'dim', x1: 80, y1: 720, x2: 500, y2: 720, stroke: INK, 'stroke-width': 1.2, 'data-angle': '0' }));
  g.append(tag(290, 712, '8600', { 'text-anchor': 'middle', 'font-size': 12 }));
  // 90°: vertical <line> 3200
  g.append(el('line', { id: 'dim-v', class: 'dim', x1: 540, y1: 708, x2: 540, y2: 808, stroke: INK, 'stroke-width': 1.2, 'data-angle': '90' }));
  g.append(tag(531, 758, '3200', { 'text-anchor': 'middle', 'font-size': 12, transform: 'rotate(-90 531 758)' }));
  // 30°: <polyline> following the skewed skid, with one interior vertex so a mid tick shows up too
  const rise = 100 * Math.tan(Math.PI / 6);
  const p30 = [[100, 850], [200, 850 - rise], [300, 850 - 2 * rise]].map(([x, y]) => `${fmt(x)},${fmt(y, 1)}`).join(' ');
  g.append(el('polyline', { id: 'dim-30', class: 'dim', points: p30, fill: 'none', stroke: INK, 'stroke-width': 1.2, 'data-angle': '30' }));
  g.append(tag(200, 850 - rise - 10, '2400 ∠30°', { 'text-anchor': 'middle', 'font-size': 12, transform: `rotate(-30 200 ${fmt(850 - rise - 10, 1)})` }));
  // range ticks: #mk-tick has refY=0 → the bar starts at the line centre and hangs below the pipe
  const xs = [380, 404, 428, 452, 476, 500];
  g.append(el('polyline', { id: 'gauge-run', points: xs.map(x => `${x},780`).join(' '), fill: 'none', stroke: CW, 'stroke-width': 3,
    'marker-start': 'url(#mk-tick)', 'marker-mid': 'url(#mk-tick)', 'marker-end': 'url(#mk-tick)' }));
  g.append(label(380, 768, '量程短撇 #mk-tick · refY=0 → 刻度悬在管下，不骑线', { 'font-size': 11, fill: DIM }));
  g.append(label(380, 818, '端撇 #mk-dim：标记内沿局部 y 的竖条', { 'font-size': 11, fill: DIM }));
  g.append(label(380, 832, '0° / 90° / 30° 三条线上端撇夹角均为 90°', { 'font-size': 11, fill: DIM }));
  // filled in by runProbes() once layout exists: getBBox() vs getBBox({markers:true}) vs manual marker allowance
  g.append(tag(80, 868, '', { id: 'bbox-readout', 'font-size': 11, fill: INK }));
  return g;
}

/** Legend: <line> hosts whose stroke is dashed away (`0 999`) so only the markers remain; the last track has stroke=none
 *  and a fill — a line has no fill area, so only context-fill markers are visible (concept:line-has-no-fill-area). */
function legend(): SVGGElement {
  const g = el('g', { id: 'legend' });
  g.append(label(700, 696, '图例 · 宿主 <line> 只留符号', { 'font-size': 12, 'font-weight': 700 }));
  const track = (y: number, attrs: Record<string, string | number>, caption: string) => {
    g.append(el('line', { x1: 716, y1: y, x2: 764, y2: y, 'stroke-dasharray': '0 999', ...attrs }));
    g.append(label(784, y + 4, caption, { 'font-size': 11, fill: DIM }));
  };
  track(712, { stroke: ORANGE, 'stroke-width': 5, 'marker-start': 'url(#mk-arrow)', 'marker-end': 'url(#mk-arrow)', 'marker-knockout-left': 'auto' }, '#mk-arrow 流向 · 同一定义两端反向');
  track(736, { stroke: ORANGE, 'stroke-width': 6, 'marker-start': 'url(#mk-valve)', 'marker-end': 'url(#mk-valve)' }, '#mk-valve 蝶阀 · strokeWidth 单位随管径');
  track(760, { stroke: PANEL, 'stroke-width': 1.5, 'marker-start': 'url(#mk-inst)', 'marker-end': 'url(#mk-inst)' }, '#mk-inst 仪表圈 · userSpaceOnUse 恒 24px');
  track(784, { stroke: CW, 'stroke-width': 3, 'marker-start': 'url(#mk-tick)', 'marker-end': 'url(#mk-dim)' }, '#mk-tick 量程撇 · #mk-dim 尺寸端撇');
  track(808, { stroke: PANEL, 'stroke-width': 5, 'marker-start': 'url(#mk-node)', 'marker-end': 'url(#mk-head)' }, '#mk-node 联锁节点 · #mk-head 渐变主箭头');
  // stroke=none + fill: the line body cannot show its fill, but context-fill markers pick the fill colour up
  g.append(el('line', { id: 'legend-nofill', x1: 716, y1: 832, x2: 764, y2: 832, stroke: 'none', fill: ORANGE, 'stroke-width': 6, 'marker-start': 'url(#mk-weld)', 'marker-end': 'url(#mk-valve)' }));
  g.append(label(784, 836, 'line stroke=none fill=橙：线无填充区域，只剩 context-fill 符号', { 'font-size': 11, fill: DIM }));
  // diagnostics: context-stroke outside marker/use content resolves to none — the rect stays hollow (crossed out)
  g.append(el('rect', { id: 'ctx-outside', x: 716, y: 848, width: 48, height: 12, fill: 'context-stroke', stroke: CW, 'stroke-width': 1 }));
  g.append(el('path', { d: 'M716,848 L764,860 M764,848 L716,860', stroke: '#ff5a3c', 'stroke-width': 1.5 }));
  g.append(label(784, 858, '普通 rect 写 fill=context-stroke → none：上下文取色只在标记内容中有效', { 'font-size': 11, fill: DIM }));
  // SVG 2 markers on basic shapes: a rect with marker-mid shows nothing; the equivalent path gets its corner dots
  g.append(el('rect', { id: 'rect-markers', x: 716, y: 866, width: 20, height: 6, fill: 'none', stroke: CW, 'stroke-width': 1, 'marker-mid': 'url(#mk-dot)', 'marker-start': 'url(#mk-dot)' }));
  g.append(el('path', { id: 'rect-as-path', d: 'M744,866 h20 v6 h-20 Z', fill: 'none', stroke: CW, 'stroke-width': 1, 'marker-mid': 'url(#mk-dot)', 'marker-start': 'url(#mk-dot)' }));
  g.append(label(784, 873, 'rect 上的 marker 无效 → 等价 path 才长点 · marker-pattern / marker-knockout-left：未实现', { 'font-size': 11, fill: DIM }));
  return g;
}

/** marker vs symbol: the marker valve auto-orients and scales with the stroke but cannot be hit; the <use> twin is
 *  placed by hand yet receives hover (css:hover tooltip). Its parts use context paints from the <use> (concept:context-paint-in-use). */
function markerVsSymbol(): SVGGElement {
  const g = el('g', { id: 'mvs' });
  g.append(label(968, 696, 'marker 对 symbol', { 'font-size': 12, 'font-weight': 700 }));
  g.append(el('polyline', { id: 'mvs-marker', points: '980,746 1008,720 1036,746', fill: 'none', stroke: ORANGE, 'stroke-width': 6, 'marker-mid': 'url(#mk-valve)' }));
  const hit = el('g', { id: 'mvs-use', class: 'hit' });
  hit.append(el('use', { href: '#sym-valve', x: 1080, y: 712, width: 40, height: 40, fill: '#5a4210', stroke: ORANGE, 'stroke-width': 8 }));
  const tip = el('g', { class: 'tip', transform: 'translate(1058,690)' });
  tip.append(el('rect', { x: 0, y: 0, width: 92, height: 18, rx: 3, fill: '#ffd166' }));
  tip.append(el('text', { x: 46, y: 13, 'text-anchor': 'middle', 'font-family': TAG_FONT, 'font-size': 11, fill: '#1c1a18' }, 'use#sym-valve ✓ hover'));
  hit.append(tip);
  g.append(hit);
  g.append(label(968, 772, '左 marker：自动定向 · 随描边缩放 · 不可命中', { 'font-size': 11, fill: DIM }));
  g.append(label(968, 786, '右 symbol+use：手工摆放 · 可 hover 出提示', { 'font-size': 11, fill: DIM }));
  return g;
}

/** Alarm star: a points list mixing comma and whitespace separators; one vertex is pushed by SVGPointList at runtime. */
function alarmStar(): SVGGElement {
  const g = el('g', { id: 'alarm' });
  const cx = 996, cy = 832, ro = 22, ri = 9;
  const parts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / 5;
    const x = fmt(cx + r * Math.cos(a), 1), y = fmt(cy + r * Math.sin(a), 1);
    parts.push(i % 3 === 0 ? `${x} ${y}` : `${x},${y}`);   // mixed separators, still one valid list
  }
  // pairs alternate "x y" and "x,y" and are joined by a space → commas and whitespace mixed in one valid list
  g.append(el('polygon', { id: 'alarm-star', points: parts.join(' '), fill: '#ff5a3c', stroke: '#1c1a18', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  g.append(label(1030, 822, '报警星 polygon', { 'font-size': 11, fill: INK }));
  g.append(label(1030, 836, 'points 逗号 / 空白混排', { 'font-size': 11, fill: DIM }));
  g.append(label(1030, 850, 'SVGPointList.replaceItem 顶点闪烁', { 'font-size': 11, fill: DIM }));
  return g;
}

/** Interlock graph: four <line> edges; the node circle grows from marker-start, the arrowhead from marker-end.
 *  Edge endpoints are written by script (at:line.x1) so the arrow tip stops at the target node's rim. */
function interlock(): SVGGElement {
  const g = el('g', { id: 'interlock' });
  g.append(label(1160, 696, '联锁逻辑 · marker-start=#mk-node · marker-end=#mk-arrow', { 'font-size': 12, 'font-weight': 700 }));
  const nodes: Record<string, [number, number, string]> = { a: [1184, 728, 'LAH-101'], b: [1254, 728, 'I-201'], c: [1324, 728, 'ESD'], d: [1254, 776, 'FIC-201'] };
  const edges: Array<[string, string]> = [['a', 'b'], ['b', 'c'], ['d', 'b'], ['c', 'd']];
  const R = 11;   // #mk-node is 22px (userSpaceOnUse) → stop the arrow 11px short of the target centre
  for (const [from, to] of edges) {
    const [x1, y1] = nodes[from], [x2, y2] = nodes[to];
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const edge = el('line', { class: 'ilk', stroke: PANEL, 'stroke-width': 2, 'marker-start': 'url(#mk-node)', 'marker-end': 'url(#mk-arrow)', 'data-edge': `${from}-${to}` });
    edge.setAttribute('x1', fmt(x1)); edge.setAttribute('y1', fmt(y1));
    edge.setAttribute('x2', fmt(x2 - ux * (R + 2), 1)); edge.setAttribute('y2', fmt(y2 - uy * (R + 2), 1));
    g.append(edge);
  }
  for (const [x, y, name] of Object.values(nodes)) g.append(tag(x, y + 24, name, { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));
  return g;
}

/** Flow trend: a data polyline with a dot at every vertex from one marker rule. */
function trend(rand: () => number): SVGGElement {
  const g = el('g', { id: 'trend' });
  g.append(label(1160, 812, 'FT-301 流量趋势 · marker-mid=#mk-dot 每个数据顶点一枚圆点', { 'font-size': 11, fill: DIM }));
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) pts.push(`${1170 + i * 19},${fmt(858 - 10 - rand() * 28, 1)}`);
  g.append(el('polyline', { id: 'trend-line', points: pts.join(' '), fill: 'none', stroke: CW, 'stroke-width': 1.5,
    'marker-start': 'url(#mk-dot)', 'marker-mid': 'url(#mk-dot)', 'marker-end': 'url(#mk-dot)' }));
  g.append(el('line', { x1: 1166, y1: 862, x2: 1346, y2: 862, stroke: DIM, 'stroke-width': .8 }));
  return g;
}

export function buildBand(_stage: SVGSVGElement, rand: () => number): SVGGElement {
  const g = el('g', { id: 'band' });
  g.append(plate(24, 676, 1352, 200));
  g.append(el('line', { x1: 694, y1: 690, x2: 694, y2: 866, stroke: 'rgba(200,150,90,.28)', 'stroke-width': 1 }));
  g.append(dimensionBand(), legend(), markerVsSymbol(), alarmStar(), interlock(), trend(rand));
  return g;
}
