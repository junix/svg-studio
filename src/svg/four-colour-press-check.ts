// four-colour-press-check — 四色套印检版台 (docs/svg-feature-demos.md §3.10)
// A press-check table: the proof in the middle is separated into four ink plates by feColorMatrix → feComponentTransfer
// (exposure curve) → duotone, and re-assembled by multiplying transmittances with feComposite arithmetic k1=1. The right
// column proves the separation is reversible (feBlend difference ×6 ≈ black) and shows what a cross-space (linearRGB)
// overprint does to it; the bench below screens one midtone ramp twice — vector <pattern> dots vs a feImage filter
// screen — with an ×8 loupe on the seam. Only three bitmaps exist (source art, screen, blue noise); everything else is vector.
// Helper modules: -bitmaps (procedural PNGs + rasteriser), -filters (<defs> markup), -measure (pixel readouts).
import { el, fragment, mark, isExport, fmt, FONT_CJK, FONT_MONO, type Attrs } from './lib';
import { makeSourceImage, makeScreenBitmap, makeNoiseBitmap } from './four-colour-press-check-bitmaps';
import { buildDefsMarkup, INKS, INK_KEYS, CURVE_DEFAULT, fmtTable, type InkKey } from './four-colour-press-check-filters';
import { measureLoupe, measureCross, measureTarget, measureFilm, measureGradientMid } from './four-colour-press-check-measure';

const PAPER = '#f7f4ec', LINE = '#9a938a', INK = '#22252a', MUTED = '#5b6068', WHITE = '#ffffff';
const rect = (x: number, y: number, w: number, h: number, attrs: Attrs = {}) => el('rect', { x, y, width: w, height: h, ...attrs });
const txt = (x: number, y: number, s: string, attrs: Attrs = {}) =>
  el('text', { x, y, 'font-family': FONT_CJK, 'font-size': 11, fill: INK, ...attrs }, s);
const mono = (x: number, y: number, s: string, attrs: Attrs = {}) => txt(x, y, s, { 'font-family': FONT_MONO, ...attrs });

/** Panel: 8px radius, 1px border, numbered type block top-left (构造要点 1). */
function panel(parent: Element, x: number, y: number, w: number, h: number, num: number, title?: string): SVGGElement {
  const g = el('g', { class: 'panel' });
  g.append(rect(x, y, w, h, { rx: 8, fill: PAPER, stroke: LINE, 'stroke-width': 1 }));
  g.append(rect(x + 8, y + 8, 16, 16, { rx: 2, fill: INK }));
  g.append(txt(x + 16, y + 20, String(num), { fill: PAPER, 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle' }));
  if (title) g.append(txt(x + 30, y + 20, title, { 'font-weight': 700 }));
  parent.append(g);
  return g;
}

/** A copy of the source plate at `scale`, optionally filtered (`<use href="#plate-source">` is reused everywhere). */
function plate(x: number, y: number, scale: number, filter?: string, attrs: Attrs = {}): SVGGElement {
  return el('g', { transform: `translate(${x} ${y}) scale(${scale})` }, el('use', { href: '#plate-source', filter: filter ? `url(#${filter})` : undefined, ...attrs }));
}

/** 1px registration cross, arms ±7 (构造要点 12). */
function cross(cx: number, cy: number, attrs: Attrs = {}): SVGGElement {
  return el('g', { fill: 'none', stroke: INK, 'stroke-width': 1, ...attrs },
    el('path', { d: `M${cx - 7} ${cy}H${cx + 7}M${cx} ${cy - 7}V${cy + 7}` }), el('circle', { cx, cy, r: 4 }));
}

const STAR = (s: number) => `${s / 2},0 ${s * .64},${s * .36} ${s},${s / 2} ${s * .64},${s * .64} ${s / 2},${s} ${s * .36},${s * .64} 0,${s / 2} ${s * .36},${s * .36}`;
const SR_VALUES = ['auto', 'optimizeSpeed', 'crispEdges', 'geometricPrecision'] as const;
const SR_SHORT = ['auto', 'speed', 'crisp', 'geom'];

// Bench geometry shared by the pattern block, the filter block and the loupe.
const BENCH = { x: 356, y: 528, w: 480, h: 140, seam: 596 };
const LOUPE_R = 92, LOUPE_HOME = { x: 596, y: 604 };
const PLOT = { y: 124, w: 64, h: 48, x: (i: number) => 1052 + i * 78 };

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'fc-title fc-desc');
  stage.append(el('title', { id: 'fc-title' }, '四色套印检版台 — four-colour press check'));
  stage.append(el('desc', { id: 'fc-desc' }, 'A press-check table: four ink separations by feColorMatrix and feComponentTransfer, an overprint proof multiplied back together with feComposite arithmetic, residual films proving reversibility, and a halftone bench comparing pattern dots with a feImage filter screen under an ×8 loupe.'));

  // 构造要点 2 — the only bitmaps: procedural source art, 45° screen and blue noise, all data: URIs.
  const sourceUri = makeSourceImage(), screenUri = makeScreenBitmap(), noiseUri = makeNoiseBitmap();
  const defsMarkup = buildDefsMarkup(sourceUri, screenUri, noiseUri);
  const root = el('g', { id: 'press-table', transform: 'translate(0.5 0.5)' }); // concept:half-pixel-crisp-alignment
  const defs = el('defs');
  defs.append(fragment(defsMarkup));
  defs.append(el('marker', { id: 'wire-arrow', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 5, markerHeight: 5, orient: 'auto' }, el('path', { d: 'M0 0L6 3L0 6Z', fill: LINE })));
  root.append(defs);
  stage.append(root);

  // ---------------------------------------------------------------- header + original reference (pv:filter=none)
  root.append(txt(36, 62, '四色套印检版台', { 'font-size': 26, 'font-weight': 700 }));
  root.append(txt(36, 84, 'Four-colour press check · feColorMatrix 取墨 → feComponentTransfer 曝光 → duotone → feComposite arithmetic k1=1 连乘 · 残差 feBlend difference ×6 · 网点 pattern vs feImage', { fill: MUTED }));
  root.append(rect(1283, 33, 82, 52, { fill: WHITE, stroke: LINE }));
  root.append(plate(1284, 34, .25, undefined, { filter: 'none' }));
  root.append(txt(1276, 64, '原稿 filter=none', { 'text-anchor': 'end', fill: MUTED }));

  // ---------------------------------------------------------------- A · four separation films (构造要点 3)
  const FILM_Y = [108, 296, 484, 672];
  INK_KEYS.forEach((key, i) => {
    const ink = INKS[key], fx = 36, fy = FILM_Y[i];
    const g = panel(root, fx, fy, 264, 176, i + 1, `${ink.label} · ${ink.name}`);
    g.append(txt(fx + 256, fy + 20, `网角 ${ink.angle}°`, { 'text-anchor': 'end', fill: ink.hex, 'font-weight': 700 }));
    g.append(rect(fx + 7, fy + 33, 155.6, 98, { fill: WHITE, stroke: LINE }));
    g.append(plate(fx + 8, fy + 34, .48, `sep-${key}`));
    if (i < 3) {
      // single-channel close-ups: only one feFunc* is switched on (el:feFuncR / el:feFuncG / el:feFuncB)
      const chan = ['r', 'g', 'b'][i];
      g.append(rect(fx + 167, fy + 33, 92, 58, { fill: WHITE, stroke: LINE }));
      g.append(plate(fx + 168, fy + 34, .28125, `chan-${chan}`));
      const cap = [['只开 feFuncR', 'table 1 0 · 白变青'], ['只开 feFuncG', 'gamma .45 · 灰偏绿'], ['只开 feFuncB', 'table 0 0 · 暖黄']][i];
      g.append(txt(fx + 168, fy + 106, cap[0], { fill: MUTED }), txt(fx + 168, fy + 120, cap[1], { fill: MUTED }));
    } else {
      g.append(txt(fx + 168, fy + 48, 'saturate 0', { fill: MUTED }), txt(fx + 168, fy + 62, '→ matrix 1−L', { fill: MUTED }), txt(fx + 168, fy + 76, '→ discrete ×8', { fill: MUTED }), txt(fx + 168, fy + 90, '骨架黑 UCR', { fill: MUTED }));
    }
    const extractLabel = key === 'k' ? 'saturate 0 → 1−L' : `matrix 1−${'RGB'[ink.channel]}`;
    g.append(mono(fx + 8, fy + 148, `${extractLabel} → ${ink.curveLabel}`.slice(0, 44)));
    g.append(mono(fx + 8, fy + 164, `duotone: 纸白 1 → 墨色 ${ink.rgb.map(v => fmt(v)).join(' ')} (${ink.hex})`));
  });

  // ---------------------------------------------------------------- B1 · the proof sheet (构造要点 4/5/6/12/13)
  const sheet = panel(root, 348, 100, 640, 392, 5, '套印样张 Press proof · filter=url(#overprint) · 四版透射率连乘');
  sheet.append(plate(388, 150, 1.45, 'overprint'));
  // colour-control strip: ordinary rects on the paper band the filter floods at y=176..192 (image units)
  const barY = 150 + 176 * 1.45 + 1.5;
  [['#0f9ecc'], ['#db1a85'], ['#fadb0d'], ['#1f1f21']].forEach(([fill], i) => sheet.append(rect(400 + i * 20, barY, 16, 16, { fill })));
  sheet.append(rect(484, barY, 16, 16, { fill: 'url(#dots-c50)' }), rect(504, barY, 16, 16, { fill: 'url(#dots-k50)' }));
  sheet.append(el('g', { filter: 'url(#trap-ring)' }, rect(540, barY + 3, 10, 10, { fill: '#fadb0d' })));
  sheet.append(txt(556, barY + 12, '50% 网点 · 陷印环 0.6pt', { fill: MUTED }));
  // registration crosses: top pair = filter-region trap, bottom pair = half-pixel alignment
  sheet.append(cross(372, 124, { filter: 'url(#reg-glow-default)' }));
  sheet.append(cross(964, 124, { filter: 'url(#reg-glow-wide)' }));
  sheet.append(txt(384, 143, '默认区域 -10%/120% → 晕被切成方边', { fill: MUTED }));
  sheet.append(txt(952, 143, 'x=-50% y=-50% w=200% h=200% → 晕完整', { fill: MUTED, 'text-anchor': 'end' }));
  sheet.append(el('g', { transform: 'translate(-0.5 -0.5)' }, cross(372, 476)));  // integer coordinates (cancels the global half pixel)
  sheet.append(cross(964, 476));                                                    // half-pixel aligned
  sheet.append(txt(386, 480, '整数坐标 1px', { fill: MUTED }));
  sheet.append(txt(950, 480, 'translate(.5 .5) 1px', { fill: MUTED, 'text-anchor': 'end' }));
  sheet.append(mono(388, 452, 'feFlood x=12.8 y=176 w=294.4 h=16 (primitive subregion) → feComposite in=paper in2=cmyk operator=in → bar'));
  sheet.append(mono(388, 466, 'feMerge: spread(blur 1.6 网点扩大晕) → trap(spread→feFuncA discrete→out) → press(×.96+.03) → bar 顶层'));
  // dot gain: filterUnits objectBoundingBox (scales) vs userSpaceOnUse fixed box; filter attribute vs CSS filter
  sheet.append(txt(860, 166, '网点扩大 dot gain', { 'font-weight': 700 }));
  const dotSample = (x: number, y: number, s: number, attrs: Attrs) => el('g', attrs, rect(x, y, s, s, { fill: 'url(#dots-c50)' }));
  sheet.append(dotSample(860, 172, 36, { filter: 'url(#dot-gain-obb)' }), dotSample(904, 172, 72, { filter: 'url(#dot-gain-obb)' }));
  sheet.append(txt(860, 256, 'objectBoundingBox · 晕随尺寸变 ✗', { fill: MUTED }));
  sheet.append(dotSample(860, 264, 36, { filter: 'url(#dot-gain-fixed)' }), dotSample(904, 264, 72, { style: 'filter:url(#dot-gain-fixed)' }));
  sheet.append(txt(860, 348, 'userSpaceOnUse · 固定 2px ✓', { fill: MUTED }));
  sheet.append(txt(860, 362, 'filter= 属性 / style= 一致', { fill: MUTED }));
  sheet.append(rect(867, 371, 98, 62, { fill: WHITE, stroke: LINE }));
  sheet.append(plate(868, 372, .3, 'overprint-fullflood'));
  sheet.append(txt(860, 446, '无 x/y/w/h → 铺满滤镜区', { fill: MUTED }));

  // ---------------------------------------------------------------- B2 · halftone bench (构造要点 10/11)
  const bench = panel(root, 348, 504, 640, 196, 6, '网点对照台 · 同一渐变两次加网');
  const art = el('g', { id: 'table-art' });
  art.append(rect(BENCH.x, BENCH.y, BENCH.w, BENCH.h, { fill: WHITE }));
  for (let i = 0; i < 5; i++) art.append(rect(356 + i * 48, BENCH.y, 48, BENCH.h, { fill: `url(#screen-c-${i + 1})` })); // concept:halftone-pattern
  art.append(rect(BENCH.seam, BENCH.y, 240, BENCH.h, { fill: 'url(#tone-ramp)', filter: 'url(#screen-filter)' }));       // concept:halftone-dots
  bench.append(art);
  bench.append(el('line', { x1: BENCH.seam, y1: BENCH.y + BENCH.h, x2: BENCH.seam, y2: BENCH.y + BENCH.h + 8, stroke: INK }));
  const chip = (x: number, y: number, ids: string[]) => {
    const g = el('g');
    g.append(rect(x, y, 136, 56, { fill: WHITE, stroke: LINE }));
    ids.forEach(id => g.append(rect(x, y, 136, 56, { fill: `url(#${id})`, style: 'mix-blend-mode:multiply' })));
    return g;
  };
  bench.append(chip(844, 528, ['ros-y', 'ros-c', 'ros-m', 'ros-k']));
  bench.append(txt(844, 596, 'C15° M75° Y0° K45° → 玫瑰斑', { fill: MUTED }));
  bench.append(chip(844, 606, ['moire-a', 'moire-b']));
  bench.append(txt(844, 674, '15° / 18° → 莫尔纹 · 只差 rotate(θ)', { fill: MUTED }));
  bench.append(mono(356, 690, 'pattern 8px cell rotate(45) · 五档半径 1.69→3.06'));
  bench.append(mono(700, 690, 'feImage 网屏 · arithmetic k2=.5 k3=.5 · discrete 0 1 · 45°'));

  // loupe: clip on the child, barrel shadow on the parent (filter → clip-path order, 构造要点 11)
  const loupeUse = el('use', { href: '#table-art' });
  const loupe = el('g', { id: 'loupe', filter: 'url(#loupe-shadow)' },
    el('g', { 'clip-path': 'url(#loupe-clip)' }, el('circle', { r: LOUPE_R, fill: WHITE }), loupeUse),
    el('circle', { r: LOUPE_R, fill: 'none', stroke: INK, 'stroke-width': 3 }),
    el('circle', { r: LOUPE_R - 3, fill: 'none', stroke: WHITE, 'stroke-width': 1, 'stroke-opacity': .6 }),
    el('line', { x1: 0, y1: -LOUPE_R + 4, x2: 0, y2: LOUPE_R - 4, stroke: INK, 'stroke-dasharray': '2 4', 'stroke-opacity': .5 }));
  const chipBox = (x: number, y: number, w: number, h: number) => rect(x, y, w, h, { rx: 3, fill: PAPER, 'fill-opacity': .92, stroke: LINE });
  const loupeTop = mono(0, -74, '', { 'text-anchor': 'middle', 'font-size': 11 });
  const loupeL1 = txt(-84, 70, 'pattern (矢量)', { 'font-weight': 700 }), loupeL2 = mono(-84, 83, '测量中…');
  const loupeR1 = txt(4, 70, 'feImage (位图)', { 'font-weight': 700 }), loupeR2 = mono(4, 83, '测量中…');
  loupe.append(chipBox(-66, -86, 132, 17), loupeTop, chipBox(-88, 58, 86, 30), loupeL1, loupeL2, chipBox(0, 58, 86, 30), loupeR1, loupeR2);
  bench.append(loupe);
  let loupePos = { ...LOUPE_HOME };
  const placeLoupe = () => {
    loupe.setAttribute('transform', `translate(${fmt(loupePos.x)} ${fmt(loupePos.y)})`);
    loupeUse.setAttribute('transform', `scale(8) translate(${fmt(-loupePos.x)} ${fmt(-loupePos.y)})`);
    loupeTop.textContent = `×8 · (${Math.round(loupePos.x)}, ${Math.round(loupePos.y)}) · 接缝 x=596`;
  };
  placeLoupe();

  // ---------------------------------------------------------------- B3 · check row (构造要点 9/12/14)
  const check = panel(root, 348, 712, 640, 154, 7, '检查行 · 灰梯尺 · color-interpolation · 套准十字 ×8 · shape-rendering ×4');
  check.append(rect(356, 738, 240, 14, { fill: 'url(#wedge-grey)' }));
  check.append(rect(356, 756, 240, 14, { fill: 'url(#wedge-grey)', filter: 'url(#wedge-discrete)' }));
  check.append(rect(356, 774, 240, 14, { fill: 'url(#wedge-grey)', filter: 'url(#wedge-dither)' }));
  check.append(txt(602, 749, '连续渐变', { fill: MUTED }), txt(602, 767, 'discrete ×21', { fill: MUTED }), txt(602, 785, '+蓝噪 → discrete', { fill: MUTED }));
  check.append(rect(668, 738, 240, 14, { fill: 'url(#ci-srgb)' }), rect(668, 756, 240, 14, { fill: 'url(#ci-linear)' }));
  check.append(txt(914, 749, 'sRGB', { fill: MUTED }), txt(914, 767, 'linearRGB', { fill: MUTED }));
  const ciLabel = mono(668, 785, 'color-interpolation: 测量中…');
  check.append(ciLabel);
  check.append(txt(356, 802, '套准十字 ×8 · 1px 竖线的像素列', { 'font-weight': 700 }));
  const zoomL = el('image', { x: 356, y: 806, width: 72, height: 48, style: 'image-rendering:pixelated' });
  const zoomR = el('image', { x: 436, y: 806, width: 72, height: 48, style: 'image-rendering:pixelated' });
  const zoomLabelL = mono(356, 862, '整数: …'), zoomLabelR = mono(436, 862, '+.5: …');
  check.append(zoomL, zoomR, zoomLabelL, zoomLabelR);
  check.append(txt(760, 802, 'shape-rendering ×4 · 斜边灰度过渡像素 (实测)', { 'font-weight': 700 }));
  const srZooms: SVGImageElement[] = [], srLabels: SVGTextElement[] = [];
  SR_VALUES.forEach((value, i) => {
    const x0 = 760 + i * 57;
    check.append(el('polygon', { points: STAR(11), transform: `translate(${x0} 808)`, fill: INK, 'shape-rendering': value })); // pr:shape-rendering
    const zoom = el('image', { x: x0 + 12, y: 808, width: 44, height: 44, style: 'image-rendering:pixelated' });
    const label = mono(x0, 862, `${SR_SHORT[i]} …`);
    srZooms.push(zoom); srLabels.push(label);
    check.append(zoom, label);
  });

  // ---------------------------------------------------------------- C1 · exposure curves (构造要点 16)
  const curves = panel(root, 1044, 100, 320, 112, 8, '叠印曝光曲线 · feFuncR/G/B type=table ×9 · 拖动改中段');
  const curveLines: Record<InkKey, SVGPolylineElement> = {} as never;
  const curveValues: Record<InkKey, SVGTextElement> = {} as never;
  const curveState: Record<InkKey, number[]> = { c: [...CURVE_DEFAULT.c], m: [...CURVE_DEFAULT.m], y: [...CURVE_DEFAULT.y], k: [...CURVE_DEFAULT.k] };
  const curvePoints = (values: number[], i: number) => values.map((v, k) => `${fmt(PLOT.x(i) + k / 8 * PLOT.w)},${fmt(PLOT.y + PLOT.h - v * PLOT.h)}`).join(' ');
  INK_KEYS.forEach((key, i) => {
    const x0 = PLOT.x(i);
    curves.append(rect(x0, PLOT.y, PLOT.w, PLOT.h, { fill: WHITE, stroke: LINE, class: 'curve-plot', 'data-ink': key }));
    curves.append(el('line', { x1: x0, y1: PLOT.y + PLOT.h, x2: x0 + PLOT.w, y2: PLOT.y, stroke: LINE, 'stroke-dasharray': '2 3' }));
    const line = el('polyline', { id: `curve-${key}-line`, points: curvePoints(curveState[key], i), fill: 'none', stroke: INKS[key].hex, 'stroke-width': 2 });
    curveLines[key] = line;
    curves.append(line);
    curves.append(txt(x0, 186, `${INKS[key].label} 第5项 =`, { fill: MUTED }));
    curveValues[key] = mono(x0, 200, fmt(curveState[key][4], 3));
    curves.append(curveValues[key]);
  });

  // ---------------------------------------------------------------- C2 · overprint wiring (read back from the DOM) + algebra films
  const algo = panel(root, 1044, 220, 320, 220, 9, '#overprint 接线 · result → in / in2（读自 DOM）');
  drawWiring(algo, stage.querySelector('#overprint') as SVGFilterElement);
  const filmLabels: Record<string, SVGTextElement> = {};
  [['overprint-arith', 'arithmetic k1=1 ×3'], ['overprint-blend', 'feBlend multiply ×3'], ['overprint-diff', '一致性 difference ×6']].forEach(([id, label], i) => {
    const x = 1052 + i * 104;
    algo.append(rect(x - 1, 329, 98, 62, { fill: WHITE, stroke: LINE }));
    algo.append(plate(x, 330, .3, id));
    filmLabels[id] = mono(x, 402, label);
    algo.append(filmLabels[id]);
  });
  ['multiply', 'screen', 'darken', 'overlay', 'luminosity'].forEach((mode, i) => {
    const x = 1052 + i * 62;
    algo.append(el('g', { filter: `url(#blend-${mode})` }, rect(x, 410, 40, 14, { fill: 'url(#wedge-grey)' }), rect(x, 410, 20, 14, { fill: '#fadb0d' })));
    algo.append(mono(x, 435, mode, { fill: mode === 'multiply' ? INK : MUTED, 'font-weight': mode === 'multiply' ? 700 : 400 }));
  });

  // ---------------------------------------------------------------- C3 · residual films (构造要点 8)
  const verify = panel(root, 1044, 448, 320, 118, 10, '回验残差 feBlend difference → linear slope 6');
  verify.append(rect(1051, 471, 130, 82, { fill: WHITE, stroke: LINE }), plate(1052, 472, .4, 'verify-srgb'));
  verify.append(rect(1187, 471, 130, 82, { fill: WHITE, stroke: LINE }), plate(1188, 472, .4, 'verify-linear'));
  const vLabelL = mono(1052, 562, 'sRGB 全链 · 残差近黑 → 分色可逆'), vLabelR = mono(1188, 562, '叠印段 linearRGB → 为什么发灰');
  verify.append(vLabelL, vLabelR);
  const rgPair = (x: number, y: number, filter: string) => el('g', { filter: `url(#${filter})` }, rect(x, y, 16, 22, { fill: '#e5312b' }), rect(x + 16, y, 16, 22, { fill: '#26a63a' }));
  verify.append(rgPair(1324, 472, 'rg-linear'), txt(1324, 506, 'linear', { fill: MUTED }), rgPair(1324, 514, 'rg-srgb'), txt(1324, 548, 'sRGB', { fill: MUTED }));

  // ---------------------------------------------------------------- C4 · duotone card (concept:duotone-via-component-transfer)
  const duo = panel(root, 1044, 574, 320, 62, 11);
  duo.append(rect(1051, 579, 88, 56, { fill: WHITE, stroke: LINE }), plate(1052, 580, .27, 'duotone-card'));
  duo.append(txt(1148, 594, '双色打样卡 duotone', { 'font-weight': 700 }));
  duo.append(mono(1148, 610, 'saturate 0 → feFuncR/G/B 两端点 table'));
  duo.append(mono(1148, 626, '#17324f → #f2c14e · 与分色片同一套 primitive'));

  // ---------------------------------------------------------------- C5 · colour-check trio + premultiplied warning (构造要点 15)
  const cc = panel(root, 1044, 644, 320, 68, 12, 'feColorMatrix matrix · saturate 0 · hueRotate 30 ｜ 预乘警示');
  ['cm-matrix', 'cm-saturate', 'cm-hue'].forEach((id, i) => cc.append(rect(1051 + i * 80, 663, 74, 47, { fill: WHITE, stroke: LINE }), plate(1052 + i * 80, 664, .225, id)));
  cc.append(el('g', { transform: 'translate(1294 668) scale(.727)' }, rect(0, 0, 44, 44, { fill: 'none', filter: 'url(#premul-bare)' })));
  cc.append(el('g', { transform: 'translate(1328 668) scale(.727)' }, rect(0, 0, 44, 44, { fill: 'none', filter: 'url(#premul-paper)' })));
  cc.append(rect(1294, 668, 32, 32, { fill: 'none', stroke: LINE }), rect(1328, 668, 32, 32, { fill: 'none', stroke: LINE }));
  cc.append(txt(1294, 709, '透明片基 vs 纸基 · 相乘前先垫纸', { fill: MUTED, 'font-size': 11 }));

  // ---------------------------------------------------------------- C6 · feMerge node order (构造要点 6)
  const merge = panel(root, 1044, 720, 320, 66, 13, 'feMerge 节点顺序 · 最后一个节点画在最上');
  merge.append(rect(1051, 741, 66, 42, { fill: WHITE, stroke: LINE }), plate(1052, 742, .2, 'overprint'));
  merge.append(rect(1123, 741, 66, 42, { fill: WHITE, stroke: LINE }), plate(1124, 742, .2, 'overprint-swapped'));
  merge.append(mono(1196, 754, '左 spread·trap·press·bar → 色控条在上'));
  merge.append(mono(1196, 768, '右 spread·bar·cmyk → 色控条被盖住'));
  merge.append(mono(1196, 782, '输出 = 最后一条 primitive (feMerge)'));

  // ---------------------------------------------------------------- C7 · knockout / trap chips: every feComposite operator
  const ko = panel(root, 1044, 794, 320, 72, 14, 'feComposite operator · 挖空／陷印试片');
  [['over', '压印'], ['in', '限域'], ['out', '挖空'], ['atop', '承印'], ['xor', '互斥'], ['lighter', '加亮']].forEach(([op, name], i) => {
    const x = 1052 + i * 50;
    ko.append(rect(x - 1, 819, 30, 30, { fill: WHITE, stroke: LINE }));
    ko.append(el('g', { transform: `translate(${x} 820) scale(.82)` }, el('g', { filter: `url(#comp-${op})` }, rect(0, 0, 34, 34, { fill: 'none' }), el('circle', { cx: 12, cy: 12, r: 10, fill: '#fadb0d' }))));
    ko.append(txt(x, 861, `${name} ${op}`, { fill: MUTED }));
  });

  // ---------------------------------------------------------------- footer
  root.append(txt(36, 886, 'pointermove → getScreenCTM().inverse() · 放大镜跟随（网点台内）· 曲线面板拖动改写 tableValues[1..7]，样张与残差片同步', { fill: MUTED }));
  const supports = typeof CSS !== 'undefined' && CSS.supports('filter', 'url(#dot-gain-fixed)'); // api:CSS.supports-filter
  root.append(mono(1364, 886, `CSS.supports('filter','url(#dot-gain-fixed)') = ${supports}`, { 'text-anchor': 'end', fill: MUTED }));

  // ---------------------------------------------------------------- live curve editing (构造要点 16b)
  const setCurve = (key: InkKey, amount: number) => {
    const base = CURVE_DEFAULT[key];
    const values = base.map((v, k) => Math.max(0, Math.min(1, v + amount * Math.sin(Math.PI * k / 8))));
    curveState[key] = values;
    const table = fmtTable(values);
    stage.querySelectorAll(`feComponentTransfer[data-curve="${key}"] > feFuncR, feComponentTransfer[data-curve="${key}"] > feFuncG, feComponentTransfer[data-curve="${key}"] > feFuncB`)
      .forEach(fn => fn.setAttribute('tableValues', table));
    // read back through the SVG DOM (api:SVGComponentTransferFunctionElement.tableValues)
    const probe = stage.querySelector(`#curve-${key} > feFuncG`) as SVGComponentTransferFunctionElement | null;
    const n = probe?.tableValues.baseVal.numberOfItems ?? 0;
    curveLines[key].setAttribute('points', curvePoints(values, INK_KEYS.indexOf(key)));
    curveValues[key].textContent = `${fmt(values[4], 3)} (n=${n})`;
  };
  INK_KEYS.forEach(key => { curveValues[key].textContent = `${fmt(curveState[key][4], 3)} (n=9)`; });

  // ---------------------------------------------------------------- pointer → SVG coordinates (api:SVGGraphicsElement.getScreenCTM)
  let loupeFrame = 0, idleTimer = 0;
  const benchRect = { x: 348, y: 504, w: 640, h: 196 };
  stage.addEventListener('pointermove', ev => {
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    const x = p.x - 0.5, y = p.y - 0.5; // into the half-pixel-shifted table space
    if (x >= benchRect.x && x <= benchRect.x + benchRect.w && y >= benchRect.y && y <= benchRect.y + benchRect.h) {
      loupePos = { x: Math.max(368, Math.min(824, x)), y: Math.max(540, Math.min(656, y)) };
      if (!loupeFrame) loupeFrame = requestAnimationFrame(() => { loupeFrame = 0; placeLoupe(); }); // one filter re-raster per frame
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => { void refreshLoupeReading(); }, 250);            // measure only when the pointer rests
    }
    INK_KEYS.forEach((key, i) => {
      const x0 = PLOT.x(i);
      if (x >= x0 && x <= x0 + PLOT.w && y >= PLOT.y && y <= PLOT.y + PLOT.h) setCurve(key, Math.max(-1, Math.min(1, (PLOT.y + PLOT.h / 2 - y) / (PLOT.h / 2))) * 0.4);
    });
  });

  // ---------------------------------------------------------------- measurements printed on the table
  const artMarkup = art.outerHTML;
  const refreshLoupeReading = async () => {
    const r = await measureLoupe(defsMarkup, artMarkup, loupePos.x, loupePos.y, LOUPE_R);
    if (!r) { loupeL2.textContent = loupeR2.textContent = '无法栅格化'; return; }
    loupeL2.textContent = `边 ${r.left.edgeWidth}px · 距 ${fmt(r.left.pitch, 1)} · ${Math.round(r.left.inkFraction * 100)}%`;
    loupeR2.textContent = `边 ${r.right.edgeWidth}px · 距 ${fmt(r.right.pitch, 1)} · ${Math.round(r.right.inkFraction * 100)}%`;
  };
  const crossMarkup = (half: boolean) => half ? cross(964, 476).outerHTML : `<g transform="translate(-0.5 -0.5)">${cross(372, 476).outerHTML}</g>`;
  const wedgeMarkup = `<rect x="668" y="738" width="240" height="14" fill="url(#ci-srgb)"/><rect x="668" y="756" width="240" height="14" fill="url(#ci-linear)"/>`;
  await Promise.all([
    refreshLoupeReading(),
    measureCross(defsMarkup, crossMarkup(false), 368, 466, 9, 6).then(r => { if (r) { zoomL.setAttribute('href', r.zoom); zoomLabelL.textContent = `整数: ${r.columns}列 最暗 ${r.darkest}`; } }),
    measureCross(defsMarkup, crossMarkup(true), 960, 466, 9, 6).then(r => { if (r) { zoomR.setAttribute('href', r.zoom); zoomLabelR.textContent = `+.5: ${r.columns}列 最暗 ${r.darkest}`; } }),
    ...SR_VALUES.map((value, i) => measureTarget(defsMarkup, `<polygon points="${STAR(11)}" fill="${INK}" shape-rendering="${value}"/>`, 0, 0, 11)
      .then(r => { if (r) { srZooms[i].setAttribute('href', r.zoom); srLabels[i].textContent = `${SR_SHORT[i]} ${r.transition}px`; } })),
    measureGradientMid(defsMarkup, wedgeMarkup, 668, 738, 240, 32).then(r => { if (r) ciLabel.textContent = `color-interpolation 中点 Δ=${r.delta} → 本浏览器${r.delta > 4 ? '有' : '无'}差异（Firefox 有）`; }),
    measureFilm(defsMarkup, 'verify-srgb', .4).then(r => { if (r) vLabelL.textContent = `sRGB 全链 · 均值 ${fmt(r.mean, 1)}/255 → 可逆`; }),
    measureFilm(defsMarkup, 'verify-linear', .4).then(r => { if (r) vLabelR.textContent = `叠印段 linearRGB · 均值 ${fmt(r.mean, 1)} → 发灰`; }),
    measureFilm(defsMarkup, 'overprint-diff', .3).then(r => { if (r) filmLabels['overprint-diff'].textContent = `difference ×6 均值 ${fmt(r.mean, 1)} 峭 ${r.max}`; }),
  ]);

  // ---------------------------------------------------------------- still frame + declared concepts
  if (isExport()) { loupePos = { ...LOUPE_HOME }; placeLoupe(); INK_KEYS.forEach(key => setCurve(key, 0)); }
  mark(stage,
    'concept:halftone-pattern', 'concept:halftone-dots', 'concept:duotone-via-component-transfer', 'concept:filter-input-wiring',
    'concept:filter-primitive-subregion', 'concept:filter-device-pixel-resolution', 'concept:half-pixel-crisp-alignment',
    'concept:mouse-to-svg-coordinates', 'api:SVGGraphicsElement.getScreenCTM',
    // detail tier, all exercised above
    'concept:half-pixel-crisp-lines', 'concept:gradient-banding-noise', 'api:CSS.supports-filter',
    'api:SVGComponentTransferFunctionElement.tableValues', 'api:SVGFilterPrimitiveStandardAttributes.result',
    'concept:filter-region-default', 'concept:filter-region-clipping-trap', 'concept:reuse-filter-across-elements',
    'concept:filter-clip-mask-opacity-order', 'concept:primitive-subregion-defaults', 'concept:implicit-chaining',
    'concept:last-primitive-is-output', 'concept:multiple-results-fan-out');
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/**
 * Wiring diagram of #overprint drawn from the live DOM: every primitive's `result` names a box, every `in`/`in2`
 * (and feMergeNode `in`) draws an arrow (concept:filter-input-wiring, api:SVGFilterPrimitiveStandardAttributes.result).
 */
function drawWiring(parent: Element, filter: SVGFilterElement | null): void {
  if (!filter) return;
  const grid: Record<string, [number, number]> = {
    src: [0, 1.5], cInk: [1, 0], cExp: [2, 0], cyanT: [3, 0], mInk: [1, 1], mExp: [2, 1], magT: [3, 1], yInk: [1, 2], yExp: [2, 2], yelT: [3, 2],
    kInk: [1, 3], kExp: [2, 3], blkT: [3, 3], cm: [4, .5], cmy: [4, 1.5], cmyk: [4, 2.5], press: [5, 0], spread: [5, 1], trap: [5, 2], bar: [5, 3], feMerge: [6, 1.5],
  };
  const BW = 38, BH = 13, X0 = 1052, Y0 = 250, CX = 44, RY = 18;
  const pos = (name: string) => { const [c, r] = grid[name]; return { x: X0 + c * CX, y: Y0 + r * RY }; };
  const boxes = new Set<string>();
  const edges: Array<[string, string]> = [];
  type Prim = SVGElement & { result?: SVGAnimatedString; in1?: SVGAnimatedString; in2?: SVGAnimatedString };
  for (const prim of Array.from(filter.children) as Prim[]) {
    const name = prim.localName === 'feMerge' ? 'feMerge' : prim.result?.baseVal ?? '';
    if (!grid[name]) continue;
    boxes.add(name);
    const inputs = prim.localName === 'feMerge'
      ? Array.from(prim.children).map(node => (node as Prim).in1?.baseVal ?? '')
      : [prim.in1?.baseVal ?? '', prim.in2?.baseVal ?? ''];
    for (const input of inputs) if (grid[input] && input !== name) edges.push([input, name]);
  }
  const g = el('g', { class: 'wiring' });
  for (const [from, to] of edges) {
    const a = pos(from), b = pos(to);
    g.append(el('path', { d: `M${a.x + BW} ${a.y + BH / 2}C${a.x + BW + 8} ${a.y + BH / 2} ${b.x - 8} ${b.y + BH / 2} ${b.x} ${b.y + BH / 2}`, fill: 'none', stroke: LINE, 'stroke-width': .8, 'marker-end': 'url(#wire-arrow)' }));
  }
  const inkOf = (name: string) => name.startsWith('c') && name !== 'cm' && name !== 'cmy' && name !== 'cmyk' ? INKS.c.hex : name.startsWith('m') ? INKS.m.hex : name.startsWith('y') ? INKS.y.hex : name.startsWith('k') || name === 'blkT' ? INKS.k.hex : INK;
  for (const name of boxes) {
    const p = pos(name);
    g.append(rect(p.x, p.y, BW, BH, { rx: 2, fill: WHITE, stroke: inkOf(name), 'stroke-width': name === 'feMerge' ? 1.5 : .8 }));
    g.append(txt(p.x + BW / 2, p.y + 10, name, { 'text-anchor': 'middle', 'font-size': 11, fill: inkOf(name) }));
  }
  g.append(txt(1052, 322, 'SourceGraphic → src 扇出 4 路 → cyanT·magT·yelT·blkT 三次 ×(k1=1) → cmyk → press/spread(→trap)/bar → feMerge', { fill: MUTED }));
  parent.append(g);
}
