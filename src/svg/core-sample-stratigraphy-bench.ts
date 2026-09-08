// core-sample-stratigraphy — right-hand interpretation section (P5, SMIL clipPath reveal), the processing-order
// rack under the bench (filter → clip → mask → opacity, with self-sampled hit maps) and the pointer-events pick bar.
import { el, fragment } from './lib';
import { type Ctx, type Layer, type Litho, ACCENT, CYAN, INK, MUTED, RED, PANEL, PANEL_STROKE, LITHO, chip, label, ghost, yOf } from './core-sample-stratigraphy-data';

const f = (n: number): string => n.toFixed(2).replace(/\.?0+$/, '');
const star = (cx: number, cy: number, R: number): string => Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? R * .42 : R, a = -Math.PI / 2 + k * Math.PI / 5; return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`; }).join(' ');

// ───────────────────────────────────────────── P5 · interpretation section (x 1038–1340)
export function buildSection(c: Ctx, layers: Layer[]): SVGGElement {
  const { defs } = c;
  const X0 = 1038, X1 = 1340, XF = 1190, W = 302;
  const g = el('g', { id: 'p5' });
  g.append(label(X0, 136, '解释剖面 · SMIL 揭开', { size: 13, fill: ACCENT, weight: 700 }));

  // Interpreted section art: dipping layer polygons, right block dropped 24 px across fault F1, no textures.
  const art = el('g', { id: 'section-art', 'clip-path': 'url(#sec-extent)' });
  defs.append(el('clipPath', { id: 'sec-extent' }, el('rect', { x: X0, y: 142, width: W, height: 468 })));
  art.append(el('rect', { x: X0, y: 142, width: W, height: 468, fill: '#1a2530' }));
  const tone: Record<Litho, string> = { sand: '#c9a961', mud: '#4a545f', limestone: '#a9b9c3' };
  for (const L of layers) {
    const t = yOf(L.top), b = yOf(L.bottom);
    art.append(el('polygon', { points: `${X0},${f(t - 8)} ${XF},${f(t + 4)} ${XF},${f(b + 4)} ${X0},${f(b - 8)}`, fill: tone[L.litho], stroke: '#141c24', 'stroke-width': .6 }));
    art.append(el('polygon', { points: `${XF},${f(t + 28)} ${X1},${f(t + 40)} ${X1},${f(b + 40)} ${XF},${f(b + 28)}`, fill: tone[L.litho], stroke: '#141c24', 'stroke-width': .6 }));
  }
  art.append(el('line', { x1: XF, y1: 142, x2: XF, y2: 610, stroke: RED, 'stroke-width': 1.6 }));
  for (let i = 0; i < 5; i++) art.append(label(X0 + 6, 142 + 93.6 * i + 14, `第${'一二三四五'[i]}段`, { size: 11, fill: INK, halo: true }));
  defs.append(art);

  // concept:animated-clippath-reveal: five rects inside clipPath#reveal animate width 0→302 in sequence; the
  // fifth rect only covers the upper part of its segment — the lower part is revealed through a feathered mask
  // whose white front rect animates in lockstep, so one reveal front is hard (clip) above and soft (mask) below.
  const reveal = el('clipPath', { id: 'reveal' });
  for (let i = 0; i < 5; i++) {
    const r = el('rect', { x: X0, y: f(142 + 93.6 * i), width: 0, height: i < 4 ? 93.6 : 53.6 });
    c.anim(r, 'width', '0', String(W), `${(0.6 + 0.5 * i).toFixed(1)}s`, '0.9s', 'freeze');
    reveal.append(r);
  }
  defs.append(reveal);
  defs.append(el('clipPath', { id: 'seg5-lower' }, el('rect', { x: X0, y: 570, width: W, height: 40 })));
  const front = el('rect', { x: X0 - 20, y: 556, width: 20, height: 68, fill: '#fff', filter: 'url(#f-soft)' });
  c.anim(front, 'width', '20', String(W + 20), '2.6s', '0.9s', 'freeze');
  defs.append(el('mask', { id: 'm-front', maskUnits: 'userSpaceOnUse', x: X0 - 60, y: 540, width: W + 120, height: 90 }, front));
  g.append(el('g', { 'clip-path': 'url(#reveal)' }, el('use', { href: '#section-art' })));
  g.append(el('g', { mask: 'url(#m-front)' }, el('use', { href: '#section-art', 'clip-path': 'url(#seg5-lower)' })));
  for (let i = 0; i <= 5; i++) g.append(el('line', { x1: X0 - 8, y1: f(142 + 93.6 * i), x2: X0 - 1, y2: f(142 + 93.6 * i), stroke: MUTED, 'stroke-width': 1 }));

  // pv:pointer-events=bounding-box: the seismic tie star reacts on its empty corners too (dashed bbox drawn);
  // Safari lacks bounding-box → probe CSS.supports and slide a fill="transparent" rect under the star.
  const supportsBB = typeof CSS !== 'undefined' && CSS.supports('pointer-events', 'bounding-box');
  if (!supportsBB) g.append(el('rect', { x: 1282, y: 178, width: 28, height: 28, fill: 'transparent', class: 'tie-fallback' }));
  g.append(el('polygon', { points: star(1296, 192, 14), fill: ACCENT, class: 'tie-star', id: 'tie-star', 'pointer-events': 'bounding-box' }));
  g.append(ghost(1282, 178, 28, 28, CYAN));
  g.append(label(1296, 224, supportsBB ? '标定点 · bbox' : '井震标定点 · Safari 兜底', { anchor: 'middle', fill: CYAN, halo: true }));

  // pv:pointer-events=none: interpretation notes lie on top of the section but never block picking.
  g.append(el('g', { 'pointer-events': 'none', class: 'notes' },
    label(1050, 300, 'F1 逆断层 · 右盘下移 24 px（6 m）', { fill: INK, halo: true }),
    label(1050, 316, '注记组 pointer-events=none', { fill: MUTED, halo: true }),
    label(1050, 436, '尖灭砂体 → 楔形裁切区', { fill: INK, halo: true }),
    label(1050, 452, '88–92 m 零采取率 → 推断', { fill: MUTED, halo: true })));
  g.append(label(X0, 624, '揭开锋面：上半 clip 硬边 · 下半 mask 软边 · t=3.2 s 第五段 67%', { fill: MUTED }));
  return g;
}

// ───────────────────────────────────────────── processing-order rack (y 646–812)
export interface RackCell { x0: number; target: Element; thumb: SVGGElement; ratioLabel: SVGTextElement }

export function buildRack(c: Ctx): { g: SVGGElement; cells: RackCell[] } {
  const { defs, rand } = c;
  const g = el('g', { id: 'rack' });
  const Y = 652, RW = 186, RH = 110;
  defs.append(chip(rand, 0, 0, RW, RH, { id: 'rack-core' }));
  defs.append(fragment(`
    <clipPath id="rk-clip" clipPathUnits="objectBoundingBox"><rect x=".05" y=".08" width=".55" height=".84" rx=".06"/></clipPath>
    <linearGradient id="g-black-right" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#fff"/><stop offset=".55" stop-color="#000"/></linearGradient>
    <mask id="m-rk-black" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#g-black-right)"/></mask>`));
  const xs = [60, 385, 710, 1035];
  const titles = [
    ['格1 单元素 filter+clip+mask+opacity', '规范顺序 filter→clip→mask→opacity · 模糊被裁出硬边'],
    ['格2 外层 <g filter> · 内层 use clip', 'clip-after-blur：模糊溢出裁切边约 4 px'],
    ['格3 内层 mask · 外层 <g clip-path>', 'mask-and-clip：先羽化再硬切'],
    ['格4 mask + opacity（无裁切）', '左 <g opacity=.5> 交叠 128 ｜ 右各 opacity=.5 交叠 192'],
  ];
  const cells: RackCell[] = [];
  xs.forEach((x0, i) => {
    g.append(el('rect', { x: x0 - 6, y: 646, width: 294, height: 166, rx: 8, fill: PANEL, 'fill-opacity': .88, stroke: PANEL_STROKE }));
    g.append(el('rect', { x: x0, y: Y, width: RW, height: RH, fill: '#08111a', stroke: PANEL_STROKE, 'stroke-width': .6, class: 'rack-bg' }));
    let target: Element;
    if (i === 0) {
      // concept:effect-order-filter-clip-mask-opacity — all four on one element.
      target = el('use', { id: 'rk-t1', href: '#rack-core', x: x0, y: Y, filter: 'url(#f-blur6)', 'clip-path': 'url(#rk-clip)', mask: 'url(#m-fade)', opacity: .5 });
    } else if (i === 1) {
      // concept:clip-after-blur-via-group — clip the inner element, blur the outer group: soft edge escapes the clip.
      target = el('g', { id: 'rk-t2', filter: 'url(#f-blur6)' }, el('use', { href: '#rack-core', x: x0, y: Y, 'clip-path': 'url(#rk-clip)' }));
    } else if (i === 2) {
      // concept:mask-and-clip-combined — mask inside, clip outside.
      target = el('g', { id: 'rk-t3', 'clip-path': 'url(#rk-clip)' }, el('use', { href: '#rack-core', x: x0, y: Y, mask: 'url(#m-fade)' }));
    } else {
      // concept:masked-hit-testing — the base core is masked to full black on the right yet stays hit-testable;
      // group opacity composites first (overlap α 128) vs per-element opacity (overlap α 192).
      const slab = (x: number, y: number, l: Litho, op?: number) => el('rect', { x, y, width: 56, height: 36, fill: LITHO[l].base, stroke: LITHO[l].ink, 'stroke-width': .8, opacity: op });
      target = el('g', { id: 'rk-t4' },
        el('use', { href: '#rack-core', x: x0, y: Y, mask: 'url(#m-rk-black)' }),
        el('g', { opacity: .5 }, slab(x0 + 14, Y + 30, 'sand'), slab(x0 + 44, Y + 50, 'mud')),
        slab(x0 + 108, Y + 30, 'sand', .5), slab(x0 + 124, Y + 50, 'mud', .5));
    }
    g.append(target);
    // hit thumbnail (filled at runtime by elementFromPoint sampling) and 3× zoom of the top-left clip edge
    const tx = x0 + 196;
    const thumb = el('g', { id: `hit-${i + 1}`, class: 'hitmap' }, el('rect', { x: tx, y: Y, width: 84, height: 50, fill: '#08111a', stroke: PANEL_STROKE, 'stroke-width': .6 }));
    g.append(thumb);
    g.append(label(tx + 42, Y - 2, '命中图 5 px 网格', { size: 11, anchor: 'middle', fill: MUTED }));
    defs.append(el('clipPath', { id: `zoom-${i + 1}` }, el('rect', { x: tx, y: Y + 60, width: 84, height: 50 })));
    const rx = x0 + 1.3, ry = Y + 3.8;
    g.append(el('rect', { x: tx, y: Y + 60, width: 84, height: 50, fill: '#08111a', stroke: PANEL_STROKE, 'stroke-width': .6 }));
    g.append(el('g', { 'clip-path': `url(#zoom-${i + 1})`, 'pointer-events': 'none' }, el('use', { href: `#rk-t${i + 1}`, transform: `translate(${f(tx - 3 * rx)},${f(Y + 60 - 3 * ry)}) scale(3)` })));
    g.append(label(tx + 42, Y + 122, '左上边缘 ×3', { size: 11, anchor: 'middle', fill: MUTED }));
    g.append(label(x0, 782, titles[i][0], { fill: INK }));
    g.append(label(x0, 796, titles[i][1], { fill: MUTED }));
    const ratioLabel = label(x0, 808, '命中率 …', { fill: CYAN, mono: true });
    g.append(ratioLabel);
    cells.push({ x0, target, thumb, ratioLabel });
  });
  return { g, cells };
}

/** concept:clipped-hit-testing / concept:masked-hit-testing — sample each render area on a 5 px grid with
 *  document.elementFromPoint; clipped-away points miss, masked-invisible points still hit. Draw at 0.45 scale. */
export function sampleHitMaps(stage: SVGSVGElement, cells: RackCell[]): void {
  const box = stage.getBoundingClientRect();
  for (const cell of cells) {
    let hits = 0, total = 0, d = '';
    for (let gy = 0; gy < 110; gy += 5) for (let gx = 0; gx < 186; gx += 5) {
      total++;
      const e = document.elementFromPoint(box.left + cell.x0 + gx + 2.5, box.top + 652 + gy + 2.5);
      if (e && (e === cell.target || cell.target.contains(e))) { hits++; d += `M${f(cell.x0 + 196 + gx * .45)} ${f(652 + gy * .45)}h2.25v2.25h-2.25z`; }
    }
    const ratio = hits / total;
    cell.thumb.append(el('path', { d, fill: CYAN, 'pointer-events': 'none' }));
    cell.thumb.dataset.hitRatio = ratio.toFixed(3);
    cell.ratioLabel.textContent = `命中率 ${ratio.toFixed(2)} · ${hits}/${total}`;
  }
}

// ───────────────────────────────────────────── pick-strategy bar (y 820–876)
/** pr:pointer-events with all eleven values, plus fill=transparent vs fill=none and the overlay-rect idiom. */
export function buildPickBar(): SVGGElement {
  const g = el('g', { id: 'pick-bar' });
  g.append(label(60, 840, '拾取策略条', { fill: ACCENT, weight: 700 }), label(60, 854, '悬停变色', { fill: MUTED }));
  const values = ['auto', 'visiblePainted', 'visibleFill', 'visibleStroke', 'visible', 'painted', 'fill', 'stroke', 'all', 'none', 'bounding-box'];
  const sand = LITHO.sand.base, ink = LITHO.sand.ink;
  values.forEach((v, i) => {
    const cx = 158 + 88 * i, x = cx - 28, y = 826;
    const base = { class: 'pe-chip', 'data-pe': v, x, y, width: 56, height: 28, rx: 4 };
    let node: SVGElement;
    let tag = v;
    switch (v) {
      case 'visibleFill': node = el('rect', { ...base, fill: 'none', stroke: ink, 'stroke-width': 3, 'pointer-events': v }); break;
      case 'visibleStroke': node = el('rect', { ...base, fill: sand, stroke: ink, 'stroke-width': 4, 'pointer-events': v }); break;
      case 'visible': node = el('rect', { ...base, fill: 'none', stroke: 'none', 'pointer-events': v }); g.append(ghost(x, y, 56, 28)); tag = 'visible · 未涂色'; break;
      case 'painted': node = el('rect', { ...base, fill: sand, stroke: ink, visibility: 'hidden', 'pointer-events': v }); g.append(ghost(x, y, 56, 28)); tag = 'painted · vis:hidden'; break;
      case 'fill': node = el('rect', { ...base, fill: 'none', stroke: ink, 'stroke-width': 1.5, 'stroke-dasharray': '3 2', 'pointer-events': v }); tag = 'fill · fill=none'; break;
      case 'stroke': node = el('rect', { ...base, fill: sand, stroke: 'transparent', 'stroke-width': 12, 'pointer-events': v }); tag = 'stroke · 12px 透明描边'; break;
      case 'all': node = el('rect', { ...base, fill: 'none', stroke: 'none', visibility: 'hidden', 'pointer-events': v }); g.append(ghost(x, y, 56, 28)); tag = 'all · vis:hidden'; break;
      case 'bounding-box': node = el('polygon', { class: 'pe-chip', 'data-pe': v, points: star(cx, y + 14, 15), fill: sand, stroke: ink, 'pointer-events': v }); g.append(ghost(cx - 15, y - 1, 30, 30)); break;
      default: node = el('rect', { ...base, fill: sand, stroke: ink, 'stroke-width': 1.5, 'pointer-events': v });
    }
    g.append(node);
    const short = v.replace('visiblePainted','visPainted').replace('visibleStroke','visStroke').replace('visibleFill','visFill').replace('bounding-box','bbox');
    const caption = label(cx, 870, short, { size: 11, anchor: 'middle', fill: MUTED, mono: true });
    caption.append(el('title', {}, tag)); g.append(caption);
  });
  // concept:hit-test-transparent-fill: fill=transparent reacts on its interior, fill=none only on its outline.
  const ex = (i: number) => 158 + 88 * (values.length + i);
  g.append(el('rect', { class: 'pe-chip', 'data-pe': '透明填充', x: ex(0) - 28, y: 826, width: 56, height: 28, rx: 4, fill: 'transparent', stroke: CYAN, 'stroke-width': 1.5 }));
  g.append(label(ex(0), 870, '透明填充', { size: 11, anchor: 'middle', fill: MUTED, mono: true }));
  g.append(el('rect', { class: 'pe-chip', 'data-pe': 'fill=none', x: ex(1) - 28, y: 826, width: 56, height: 28, rx: 4, fill: 'none', stroke: CYAN, 'stroke-width': 1.5 }));
  g.append(label(ex(1), 870, '仅描边', { size: 11, anchor: 'middle', fill: MUTED, mono: true }));
  // concept:hit-test-overlay-rect: Safari fallback for bounding-box — a transparent rect over the star catches hits.
  g.append(el('polygon', { points: star(ex(2), 840, 15), fill: sand, stroke: ink, 'pointer-events': 'none' }));
  g.append(el('rect', { class: 'pe-chip pe-overlay', 'data-pe': 'overlay rect (Safari 兜底)', x: ex(2) - 16, y: 824, width: 32, height: 32, fill: 'transparent' }));
  g.append(ghost(ex(2) - 16, 824, 32, 32, CYAN));
  g.append(label(ex(2), 870, '覆盖矩形', { size: 11, anchor: 'middle', fill: MUTED, mono: true }));
  return g;
}
