// ship-lofting-floor — the "command component table": ten 205×100 cards pinned in two columns on the
// wall board (930,96)-(1360,640). Each card isolates one rule of the path grammar; the feature keys it
// demonstrates are listed in the comment above each builder.
import { el } from './lib';
import { C, label, g } from './ship-lofting-floor-ui';

export interface CardContext {
  detect: { cssD: boolean; cssGeom: boolean; getPathData: boolean; pathSegList: boolean };
  /** toggles the hull shell fill-rule and returns the new value */
  toggleHullRule: () => string;
}

const CARD_W = 205, CARD_H = 100, GAP = 10;
const COL_X = [935, 1150];
const ROW_Y = (row: number) => 98 + row * (CARD_H + GAP);

const cardFrame = (): SVGRectElement => el('rect', { width: CARD_W, height: CARD_H, rx: 6, fill: C.panel, 'fill-opacity': .72, stroke: C.edge, 'stroke-width': .5 });
const title = (s: string) => label(8, 15, s, { fill: C.yellow, weight: 700 });
const dline = (s: string, y = 93) => label(8, y, s, { mono: true, fill: C.dim });
const dot = (x: number, y: number, fill: string, r = 2.5) => el('circle', { cx: x, cy: y, r, fill });

/** ① concept:arc-flag-combinations + concept:arc-flag-compact-parsing (detail) */
function cardArcFlags(): SVGGElement {
  const card = g({ id: 'card-arc-flags' }, cardFrame(), title('① A 四种标志组合 · 同一对端点'));
  const arcs = g({ transform: 'translate(22 52) scale(.55)', fill: 'none', 'stroke-width': 3 });
  const colours = [C.pink, C.yellow, C.green, C.cyan];
  const flags = ['0 0', '0 1', '1 0', '1 1'];
  flags.forEach((f, i) => arcs.append(el('path', { class: 'arc-flag', 'data-flags': f, d: `M0 0A44 30 0 ${f} 60 0`, stroke: colours[i] })));
  arcs.append(dot(0, 0, C.white, 5), dot(60, 0, C.white, 5));
  card.append(arcs);
  flags.forEach((f, i) => {
    card.append(el('line', { x1: 74, x2: 88, y1: 30 + i * 13, y2: 30 + i * 13, stroke: colours[i], 'stroke-width': 3 }));
    card.append(label(92, 34 + i * 13, `laf sf = ${f}`, { mono: true }));
  });
  // compact flags: `a20 20 0 1124 0` reads as flags 1 1 then dx 24 — no separators needed after a flag
  card.append(el('path', { d: 'M164 58a20 20 0 1124 0', fill: 'none', stroke: C.orange, 'stroke-width': 1.5 }));
  card.append(label(176, 84, '1124 = 1 1 24', { mono: true, fill: C.orange, anchor: 'middle' }));
  card.append(dline('A44 30 0 ▢ ▢ 60 0  两椭圆四弧'));
  return card;
}

/** ② concept:arc-radius-scaling — rx=ry=1 between points 100 apart is scaled up to r=50 */
function cardRadiusScaling(): SVGGElement {
  const card = g({ id: 'card-radius-scaling' }, cardFrame(), title('② 半径过小 → 按规范放大'));
  const grp = g({ transform: 'translate(14 42)' });
  grp.append(el('circle', { cx: 50, cy: 30, r: 50, fill: 'none', stroke: C.dim, 'stroke-width': .5, 'stroke-dasharray': '3 3', opacity: .5 }));
  grp.append(el('path', { id: 'arc-scaled', d: 'M0 30A1 1 0 0 1 100 30', fill: 'none', stroke: C.cyan, 'stroke-width': 2.5 }));
  grp.append(el('circle', { cx: 0, cy: 30, r: 1, fill: 'none', stroke: C.pink, 'stroke-width': 1 }), dot(0, 30, C.white, 2.5), dot(100, 30, C.white, 2.5));
  grp.append(el('line', { x1: 50, y1: 30, x2: 50, y2: -20, stroke: C.yellow, 'stroke-width': .75, 'stroke-dasharray': '2 2' }));
  card.append(grp);
  card.append(label(124, 44, '写下 r = 1', { mono: true, fill: C.pink }), label(124, 58, '渲染 r = 50', { mono: true, fill: C.cyan }), label(124, 72, '高 50 的半圆', { fill: C.dim }));
  card.append(dline('M0 30A1 1 0 0 1 100 30'));
  return card;
}

/** ③ av:path.d=Z, concept:closepath-join-vs-cap, concept:fill-closes-open-subpaths */
function cardClosepath(): SVGGElement {
  const card = g({ id: 'card-closepath' }, cardFrame(), title('③ Z 闭合 · 开口端帽 · fill 补面'));
  const open = 'M4 34L20 4L36 34L14 34';
  const shapes: [string, string, string, Record<string, string | number>][] = [
    ['Z 斜接角', `${open}Z`, C.yellow, { fill: 'none' }],
    ['开口两端帽', open, C.green, { fill: 'none' }],
    ['fill 自动补面', open, C.cyan, { fill: C.cyan, 'fill-opacity': .3 }],
  ];
  shapes.forEach(([name, d, stroke, extra], i) => {
    const x = 10 + i * 66;
    card.append(el('path', { d, stroke, 'stroke-width': 6, 'stroke-linejoin': 'miter', 'stroke-linecap': 'butt', transform: `translate(${x} 24)`, ...extra }));
    card.append(label(x + 20, 76, name, { anchor: 'middle', fill: C.dim }));
  });
  card.append(dline('M4 34L20 4L36 34L14 34 [Z]'));
  return card;
}

/** ④ concept:zero-length-subpath-round-cap-dot, concept:zero-length-subpath-square-cap, pv:stroke-linecap=* ;
 *  the card background is an evenodd path with a hole under the butt row, so those pixels stay fully transparent. */
function cardZeroLength(): SVGGElement {
  const bg = el('path', {
    d: 'M6 0H199A6 6 0 0 1 205 6V94A6 6 0 0 1 199 100H6A6 6 0 0 1 0 94V6A6 6 0 0 1 6 0Z M4 64H104V80H4Z',
    'fill-rule': 'evenodd', fill: C.panel, 'fill-opacity': .72, stroke: C.edge, 'stroke-width': .5,
  });
  const card = g({ id: 'card-zero-length' }, bg, title('④ 零长子路径 h0 × 6'));
  const d = 'M8 20h0 M24 20h0 M40 20h0 M56 20h0 M72 20h0 M88 20h0';
  const rows: [string, string, string][] = [['round', C.green, 'round → 6 圆点'], ['square', C.cyan, 'square → 6 方块'], ['butt', C.pink, 'butt → 空白（α=0）']];
  rows.forEach(([cap, stroke, text], i) => {
    card.append(el('path', { id: `zero-${cap}`, d, stroke, 'stroke-width': 8, 'stroke-linecap': cap, fill: 'none', transform: `translate(6 ${12 + i * 20})` }));
    card.append(label(110, 36 + i * 20, text, { fill: C.dim }));
  });
  card.append(dline('M8 20h0 M24 20h0 … M88 20h0'));
  return card;
}

/** ⑤ concept:implicit-repeated-commands, concept:polygon-vs-path-equivalence, concept:smooth-command-without-predecessor */
function cardImplicit(): SVGGElement {
  const card = g({ id: 'card-implicit' }, cardFrame(), title('⑤ 隐式命令重复 · S 无前驱'));
  const grp = g({ transform: 'translate(8 22) scale(.6)' });
  grp.append(el('path', { d: 'M10 10 50 50 90 10', fill: 'none', stroke: C.yellow, 'stroke-width': 4 }));
  grp.append(el('polyline', { points: '10,10 50,50 90,10', fill: 'none', stroke: C.cyan, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
  card.append(grp, label(8, 72, '无 L 的 V 形 ≡ polyline', { fill: C.dim }));
  // S directly after M: its first control collapses onto the current point (hollow circle)
  card.append(el('path', { d: 'M136 62S160 26 194 62', fill: 'none', stroke: C.violet, 'stroke-width': 2 }));
  card.append(el('line', { x1: 136, y1: 62, x2: 160, y2: 26, stroke: C.violet, 'stroke-width': .75, 'stroke-dasharray': '2 2' }));
  card.append(el('circle', { cx: 136, cy: 62, r: 4, fill: 'none', stroke: C.yellow, 'stroke-width': 1.2 }));
  card.append(el('rect', { x: 157.5, y: 23.5, width: 5, height: 5, fill: C.yellow }));
  card.append(label(165, 78, 'S 无前驱', { anchor: 'middle', fill: C.dim }));
  card.append(dline('M10 10 50 50 90 10 | M S 无前驱'));
  return card;
}

/** ⑥ at:path.pathLength (+ api:SVGGeometryElement.pathLength detail) */
function cardPathLength(): SVGGElement {
  const card = g({ id: 'card-pathlength' }, cardFrame(), title('⑥ pathLength=100 归一 → 各 4 段'));
  const short = el('path', { id: 'plen-short', d: 'M0 20Q30 -14 60 20', fill: 'none', stroke: C.green, 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': '12.5', transform: 'translate(12 26)' });
  const long = el('path', { id: 'plen-long', d: 'M0 16C30 -20 90 50 180 16', fill: 'none', stroke: C.cyan, 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': '12.5', transform: 'translate(12 54)' });
  card.append(short, long);
  card.append(label(84, 32, 'pathLength.baseVal =', { mono: true, fill: C.dim }));
  card.append(label(84, 46, `${short.pathLength.baseVal} · dash 12.5 ⇒ 4 段`, { mono: true, fill: C.dim }));
  card.append(dline('pathLength=100 dasharray=12.5'));
  return card;
}

/** ⑦ pr:fill-rule, pv:fill-rule=nonzero, pv:fill-rule=evenodd, concept:winding-direction-holes + hull toggle */
function cardFillRule(ctx: CardContext): SVGGElement {
  const card = g({ id: 'card-fill-rule' }, cardFrame(), title('⑦ fill-rule'));
  const star = 'M50 0L79 90L2 35L98 35L21 90Z';
  const ring = 'M50 6L92 36L76 86L24 86L8 36Z M50 30L26 46L34 74L66 74L74 46Z'; // inner pentagon wound the other way
  const items: [string, string, string][] = [['nonzero', star, 'nonzero'], ['evenodd', star, 'evenodd'], ['nonzero', ring, '反向内环']];
  items.forEach(([rule, d, text], i) => {
    card.append(el('path', { d, 'fill-rule': rule, fill: C.yellow, 'fill-opacity': .85, stroke: C.white, 'stroke-width': 1.5, transform: `translate(${10 + i * 66} 24) scale(.4)` }));
    card.append(label(30 + i * 66, 78, text, { anchor: 'middle', fill: C.dim }));
  });
  // button: toggles the hull shell fill-rule used by isPointInFill in the lofting area
  const btn = g({ id: 'hull-rule-toggle', class: 'button', style: 'cursor:pointer' });
  const face = el('rect', { x: 86, y: 4, width: 112, height: 14, rx: 3, fill: C.edge, 'fill-opacity': .35, stroke: C.edge, 'stroke-width': .5 });
  const txt = label(142, 14.5, 'hull-shell: nonzero ⇄', { anchor: 'middle', fill: C.white, size: 11 });
  btn.append(face, txt);
  btn.addEventListener('pointerdown', ev => { ev.stopPropagation(); txt.textContent = `hull-shell: ${ctx.toggleHullRule()} ⇄`; });
  card.append(btn, dline('自交五角星：实心 / 空洞 · 反向内环 → 孔'));
  return card;
}

/** ⑧ error tolerance, all three rendered LIVE: concept:empty-d-not-rendered (d=""), concept:path-must-start-with-moveto
 *  (d starting with L renders nothing) and concept:path-error-partial-render (unknown command → drawn up to the error).
 *  Blink logs the two parse errors to the console; the scene declares them in #stage[data-expected-errors]. */
function cardErrors(): SVGGElement {
  const card = g({ id: 'card-errors' }, cardFrame(), title('⑧ 错误容忍 · 三条真实渲染'));
  const rows: [string, string, string, string][] = [
    ['path-empty', '', 'd=""', '空串 → 什么也不画'],
    ['path-no-moveto', 'L2 12 30 2', 'd="L2 12 30 2"', '不以 M 开头 → 整条不渲染'],
    ['path-partial', 'M2 12L16 2 X30 2', 'd="M2 12L16 2 X30 2"', 'X 非法 → 只画到 (16,2) 为止'],
  ];
  rows.forEach(([id, d, code, note], i) => {
    const y = 34 + i * 25;
    card.append(el('rect', { x: 8, y: y - 12, width: 32, height: 16, fill: 'none', stroke: C.faint, 'stroke-width': .5, 'stroke-dasharray': '2 2' }));
    card.append(el('path', { id, d, stroke: C.pink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', transform: `translate(9 ${y - 11})` }));
    card.append(label(46, y - 5, code, { mono: true, fill: C.text }));
    card.append(label(46, y + 6, note, { fill: C.dim }));
  });
  return card;
}

/** ⑨ concept:relative-moveto-after-closepath */
function cardRelativeMoveto(): SVGGElement {
  const card = g({ id: 'card-relative-moveto' }, cardFrame(), title('⑨ z 之后的相对 m'));
  const grp = g({ transform: 'translate(6 16) scale(.62)' });
  grp.append(el('path', { d: 'M20 20h40v40h-40z m0 60h40', fill: 'none', stroke: C.green, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  grp.append(el('path', { d: 'M20 22V78', stroke: C.yellow, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', fill: 'none' }));
  grp.append(el('circle', { cx: 20, cy: 20, r: 4, fill: C.yellow }), el('circle', { cx: 20, cy: 80, r: 4, fill: 'none', stroke: C.yellow, 'stroke-width': 1.5 }));
  card.append(grp);
  card.append(label(64, 40, 'z → 当前点回到 (20,20)', { fill: C.dim }));
  card.append(label(64, 56, 'm0 60 从 (20,20) 起算', { fill: C.dim }));
  card.append(label(64, 72, '⇒ (20,80)，非 (20,120)', { fill: C.dim }));
  card.append(dline('M20 20h40v40h-40z m0 60h40'));
  return card;
}

/** ⑩ feature-detect card: api:SVGPathElement.pathSegList (removed everywhere), api:SVGPathElement.getPathData,
 *  css:d-property / css:geometry-properties probes with their fallbacks. */
function cardApi(ctx: CardContext): SVGGElement {
  const { detect } = ctx;
  const card = g({ id: 'card-api' }, cardFrame(), title('⑩ 历史 API 与探测'));
  card.append(label(8, 36, 'pathSegList', { mono: true, fill: C.dim, style: 'text-decoration:line-through' }));
  card.append(label(96, 36, `in prototype: ${detect.pathSegList}`, { mono: true, fill: C.faint }));
  const stamp = g({ transform: 'rotate(-6 150 28)' });
  stamp.append(el('rect', { x: 100, y: 20, width: 104, height: 15, rx: 2, fill: 'none', stroke: C.red, 'stroke-width': 1 }));
  stamp.append(label(152, 31.5, '已从所有引擎移除', { anchor: 'middle', fill: C.red, size: 11, weight: 700 }));
  card.append(stamp);
  card.append(label(8, 58, 'getPathData()', { mono: true, fill: C.dim }));
  card.append(label(96, 58, detect.getPathData ? '✓ 可用 · 与内置表交叉校验' : '✗ 缺失 → 内置解析表', { fill: detect.getPathData ? C.green : C.orange }));
  card.append(label(8, 76, 'CSS d: path()', { mono: true, fill: C.dim }));
  card.append(label(96, 76, detect.cssD ? '✓ native + transition' : 'attribute fallback', { fill: detect.cssD ? C.green : C.orange, id: 'css-d-status' }));
  card.append(label(8, 93, 'CSS r/width', { mono: true, fill: C.dim }));
  card.append(label(96, 93, detect.cssGeom ? '✓ CSS r / width 生效' : 'attr + rAF 补间', { fill: detect.cssGeom ? C.green : C.orange }));
  return card;
}

export function buildCards(stage: SVGSVGElement, ctx: CardContext): void {
  // wall board: outline only — its interior must stay transparent so card ④'s butt row can prove α=0
  stage.append(el('rect', { x: 930, y: 96, width: 430, height: 544, rx: 10, fill: 'none', stroke: C.edge, 'stroke-width': .5, 'stroke-dasharray': '6 4', opacity: .8 }));
  const builders = [cardArcFlags, cardRadiusScaling, cardClosepath, cardZeroLength, cardImplicit, cardPathLength, () => cardFillRule(ctx), cardErrors, cardRelativeMoveto, () => cardApi(ctx)];
  builders.forEach((build, i) => {
    const card = build();
    card.setAttribute('transform', `translate(${COL_X[i % 2]} ${ROW_Y(Math.floor(i / 2))})`);
    card.classList.add('card');
    stage.append(card);
  });
}
