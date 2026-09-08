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
  g.append(el('line', { id: 'dim-v', class: 'dim', x1: 660, y1: 708, x2: 660, y2: 808, stroke: INK, 'stroke-width': 1.2, 'data-angle': '90' }));
  g.append(tag(651, 758, '3200', { 'text-anchor': 'middle', 'font-size': 12, transform: 'rotate(-90 651 758)' }));
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
    g.append(label(782, y + 4, caption, { 'font-size': 11, fill: DIM }));
  };
  track(710, { stroke: ORANGE, 'stroke-width': 5, 'marker-start': 'url(#mk-arrow)', 'marker-end': 'url(#mk-arrow)', 'marker-knockout-left': 'auto' }, '#mk-arrow 流向 · 两端同一定义');
  track(731, { stroke: ORANGE, 'stroke-width': 6, 'marker-start': 'url(#mk-valve)', 'marker-end': 'url(#mk-valve)' }, '#mk-valve 蝶阀 · 随管径 (strokeWidth)');
  track(752, { stroke: PANEL, 'stroke-width': 1.5, 'marker-start': 'url(#mk-inst)', 'marker-end': 'url(#mk-inst)' }, '#mk-inst 仪表圈 · 恒 24px (uSOU)');
  track(773, { stroke: CW, 'stroke-width': 3, 'marker-start': 'url(#mk-tick)', 'marker-end': 'url(#mk-dim)' }, '#mk-tick 量程撇 · #mk-dim 端撇');
  track(794, { stroke: PANEL, 'stroke-width': 5, 'marker-start': 'url(#mk-node)', 'marker-end': 'url(#mk-head)' }, '#mk-node 节点 · #mk-head 渐变箭头');
  // stroke=none + fill: the line body cannot show its fill, but context-fill markers pick the fill colour up
  g.append(el('line', { id: 'legend-nofill', x1: 716, y1: 815, x2: 764, y2: 815, stroke: 'none', fill: ORANGE, 'stroke-width': 6, 'marker-start': 'url(#mk-weld)', 'marker-end': 'url(#mk-valve)' }));
  g.append(label(782, 819, 'line stroke=none：只剩 context-fill 符号', { 'font-size': 11, fill: DIM }));
  // diagnostics: context-stroke outside marker/use content resolves to none — the rect stays hollow (crossed out)
  g.append(el('rect', { id: 'ctx-outside', x: 716, y: 830, width: 48, height: 12, fill: 'context-stroke', stroke: CW, 'stroke-width': 1 }));
  g.append(el('path', { d: 'M716,830 L764,842 M764,830 L716,842', stroke: '#ff5a3c', 'stroke-width': 1.5 }));
  g.append(label(782, 840, 'rect 写 context-stroke → none (仅标记内有效)', { 'font-size': 11, fill: DIM }));
  // SVG 2 markers on basic shapes: a rect with marker-mid shows nothing; the equivalent path gets its corner dots
  g.append(el('rect', { id: 'rect-markers', x: 716, y: 852, width: 20, height: 8, fill: 'none', stroke: CW, 'stroke-width': 1, 'marker-mid': 'url(#mk-dot)', 'marker-start': 'url(#mk-dot)' }));
  g.append(el('path', { id: 'rect-as-path', d: 'M744,852 h20 v8 h-20 Z', fill: 'none', stroke: CW, 'stroke-width': 1, 'marker-mid': 'url(#mk-dot)', 'marker-start': 'url(#mk-dot)' }));
  g.append(label(782, 860, 'rect 上 marker 无效 → 等价 path 才长点', { 'font-size': 11, fill: DIM }));
  g.append(label(700, 873, 'SVG2 marker-pattern / marker-knockout-left：各引擎未实现', { 'font-size': 11, fill: DIM }));
  return g;
}

/** marker vs symbol: the marker valve auto-orients and scales with the stroke but cannot be hit; the <use> twin is
 *  placed by hand yet receives hover (css:hover tooltip). Its parts use context paints from the <use> (concept:context-paint-in-use). */
function markerVsSymbol(): SVGGElement {
  const g = el('g', { id: 'mvs' });
  g.append(label(1020, 696, 'marker 对 symbol', { 'font-size': 12, 'font-weight': 700 }));
  g.append(el('polyline', { id: 'mvs-marker', points: '1030,746 1058,720 1086,746', fill: 'none', stroke: ORANGE, 'stroke-width': 6, 'marker-mid': 'url(#mk-valve)' }));
  const hit = el('g', { id: 'mvs-use', class: 'hit' });
  hit.append(el('use', { href: '#sym-valve', x: 1118, y: 712, width: 40, height: 40, fill: '#5a4210', stroke: ORANGE, 'stroke-width': 8 }));
  const tip = el('g', { class: 'tip', transform: 'translate(1076,690)' });
  tip.append(el('rect', { x: 0, y: 0, width: 92, height: 18, rx: 3, fill: '#ffd166' }));
  tip.append(el('text', { x: 46, y: 13, 'text-anchor': 'middle', 'font-family': TAG_FONT, 'font-size': 11, fill: '#1c1a18' }, 'use#sym-valve ✓ hover'));
  hit.append(tip);
  g.append(hit);
  g.append(label(1020, 770, '左 marker：自动定向 · 随描边 · 不可命中', { 'font-size': 11, fill: DIM }));
  g.append(label(1020, 783, '右 use：手工摆放 · 可 hover 出提示', { 'font-size': 11, fill: DIM }));
  return g;
}

/** Alarm star: a points list mixing comma and whitespace separators; one vertex is pushed by SVGPointList at runtime. */
function alarmStar(): SVGGElement {
  const g = el('g', { id: 'alarm' });
  const cx = 1040, cy = 838, ro = 22, ri = 9;
  const parts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / 5;
    const x = fmt(cx + r * Math.cos(a), 1), y = fmt(cy + r * Math.sin(a), 1);
    parts.push(i % 3 === 0 ? `${x} ${y}` : `${x},${y}`);   // mixed separators, still one valid list
  }
  // pairs alternate "x y" and "x,y" and are joined by a space → commas and whitespace mixed in one valid list
  g.append(el('polygon', { id: 'alarm-star', points: parts.join(' '), fill: '#ff5a3c', stroke: '#1c1a18', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  g.append(label(1068, 826, '报警星 polygon', { 'font-size': 11, fill: INK }));
  g.append(label(1068, 840, 'points 逗号/空白混排', { 'font-size': 11, fill: DIM }));
  g.append(label(1068, 854, 'replaceItem 顶点闪烁', { 'font-size': 11, fill: DIM }));
  return g;
}

/** Interlock graph: four <line> edges; the node circle grows from marker-start, the arrowhead from marker-end.
 *  Edge endpoints are written by script (at:line.x1) so the arrow tip stops at the target node's rim. */
function interlock(): SVGGElement {
  const g = el('g', { id: 'interlock' });
  g.append(label(1196, 696, '联锁逻辑 · 节点与箭头皆为标记', { 'font-size': 12, 'font-weight': 700 }));
  const nodes: Record<string, [number, number, string]> = { a: [1212, 728, 'LAH-101'], b: [1276, 728, 'I-201'], c: [1340, 728, 'ESD'], d: [1276, 776, 'FIC-201'] };
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
  for (const [key, [x, y, name]] of Object.entries(nodes)) g.append(tag(x, key === 'b' ? y - 16 : y + 24, name, { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));  // b's tag goes above: an edge enters it from below
  return g;
}

/** Flow trend: a data polyline with a dot at every vertex from one marker rule. */
function trend(rand: () => number): SVGGElement {
  const g = el('g', { id: 'trend' });
  g.append(label(1196, 814, 'FT-301 趋势 · #mk-dot 顶点圆点', { 'font-size': 11, fill: DIM }));
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) pts.push(`${1200 + i * 16},${fmt(858 - 8 - rand() * 26, 1)}`);
  g.append(el('polyline', { id: 'trend-line', points: pts.join(' '), fill: 'none', stroke: CW, 'stroke-width': 1.5,
    'marker-start': 'url(#mk-dot)', 'marker-mid': 'url(#mk-dot)', 'marker-end': 'url(#mk-dot)' }));
  g.append(el('line', { x1: 1196, y1: 862, x2: 1348, y2: 862, stroke: DIM, 'stroke-width': .8 }));
  return g;
}

export function buildBand(_stage: SVGSVGElement, rand: () => number): SVGGElement {
  const g = el('g', { id: 'band' });
  g.append(plate(24, 676, 1352, 200));
  g.append(el('line', { x1: 690, y1: 690, x2: 690, y2: 866, stroke: 'rgba(200,150,90,.28)', 'stroke-width': 1 }));
  g.append(dimensionBand(), legend(), markerVsSymbol(), alarmStar(), interlock(), trend(rand));
  return g;
}
