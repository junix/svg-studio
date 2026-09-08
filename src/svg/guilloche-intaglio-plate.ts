// guilloche-intaglio-plate — 玫瑰线雕版 (docs/svg-feature-demos.md §3.4).
// A banknote intaglio plate laid on a transparent bench: four trochoid families (~280 hairline curves in 4 <path>
// elements) overprinted in three passes whose crossings are decided only by DOM order × stroke-opacity; an
// anisotropically scaled field (transform + transform-box) whose hairlines stay 0.6 device pixels thanks to
// vector-effect:non-scaling-stroke; a 24-petal rosette whose two halves differ only in paint-order; a proof strip
// contrasting CTM-scaled strokes with non-scaling ones; transform-order, transform-box and cascade-precedence
// specimens; CSS colour syntaxes as ink recipes; and a readout panel driven by getScreenCTM().
import { el, fragment, isExport, mark, FONT_CJK, FONT_MONO } from './lib';
import {
  FAMILIES, familyD, roundedRectD, bottomBandD, sampleS1D, miniRosetteD, petalD, trajectoryThrough, polyD, extent, trochoid, type Family,
} from './guilloche-intaglio-plate-curves';

const INK = '#3b3226';                       // label ink
const BROWN = 'oklch(0.46 0.07 68)';         // brown pass recipe  (sRGB ≈ #72502a)
const GREEN = 'lab(42% -22 14)';             // green pass recipe  (sRGB ≈ #416d4b)
const LIGHT = 'color-mix(in oklab, lab(42% -22 14) 70%, #d8cfae)';
const CX = 620, CY = 478;                    // field / rosette centre
const FRAME = { x: 44, y: 32, w: 1312, h: 836, rx: 10 };
const HAIR = { stroke: 'currentColor', fill: 'none', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke' };

type Attrs = Record<string, string | number | undefined>;
const label = (x: number, y: number, s: string, attrs: Attrs = {}) =>
  el('text', { x, y, 'font-family': FONT_CJK, 'font-size': 11, fill: INK, ...attrs }, s);
const mono = (x: number, y: number, s: string, attrs: Attrs = {}) =>
  el('text', { x, y, 'font-family': FONT_MONO, 'font-size': 11, fill: INK, ...attrs }, s);
const leader = (x1: number, y1: number, x2: number, y2: number, attrs: Attrs = {}) =>
  el('line', { x1, y1, x2, y2, stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '3 2', ...attrs });

const RINGS: Record<string, { family: string; kind: string; params: string }> = {};

export function render(stage: SVGSVGElement): void {
  const still = isExport();
  // Export still: freeze every CSS animation at its (negative-delay) design pose before the first frame.
  if (still) document.documentElement.dataset.still = '';

  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'gp-title gp-desc');
  stage.append(el('title', { id: 'gp-title' }, '玫瑰线雕版 — 四族玫瑰线三次走版的钞券雕版'));
  stage.append(el('desc', { id: 'gp-desc' }, '一块微微翻起的钞券雕版：四个摆线族按棕、绿、棕三次走版叠印，交叉处上下关系只由走版先后与 stroke-opacity 决定；各向异性缩放的版心用 non-scaling-stroke 钉死 0.6 像素发丝；24 瓣团花左右两半只差一个 paint-order；试印条对照随 CTM 缩放与不缩放的笔画；右栏读出面板报出被命中环的参数与当前 CTM。'));
  // Deliberately malformed transform on one waste sample (construction note 14) — Chromium reports and ignores it.
  stage.dataset.expectedErrors = 'attribute transform:';

  stage.append(styleBlock(still));
  stage.append(defs());

  // #plate: the whole sheet, tilted with a 3D transform (css:3d-transforms — flattened inside SVG, see report).
  const plate = el('g', { id: 'plate' });
  stage.append(plate);

  plate.append(paperThickness());
  plate.append(el('rect', { id: 'frame', ...FRAME, fill: 'none', stroke: INK, 'stroke-width': 1.1 }));
  plate.append(groundBands());
  plate.append(cornerFlowers());
  plate.append(topStrip());
  plate.append(leftColumn());
  plate.append(field());
  plate.append(windowRing());
  plate.append(rosette());
  plate.append(safetyThread());
  plate.append(bottomStrip());
  plate.append(rightColumn());

  // ---- readout + hit testing (construction note 8) ----
  const panel = readoutPanel();
  plate.append(panel.node);
  const rings = [...stage.querySelectorAll<SVGGraphicsElement>('.ring')];
  const byFamily = (id: string) => rings.find(r => r.dataset.family === id)!;
  panel.show(byFamily('H-11'));                        // pre-seed before __VIS_READY__ (screenshot precedes pointer)
  stage.addEventListener('pointermove', event => {
    const target = event.target as Element | null;
    const ring = target?.closest?.<SVGGraphicsElement>('[data-family]');
    if (!ring) return;
    window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
    if (ring.dataset.family !== panel.current()) panel.show(ring);
  });

  mark(stage,
    'css:css-color-paint', 'css:3d-transforms', 'css:individual-transform-properties', 'css:transform-cascade-precedence',
    'css:transform-transition-animation', 'api:SVGGraphicsElement.getScreenCTM',
    'concept:stroke-scales-with-ctm', 'concept:transform-list-composition-order', 'concept:hairline-stroke-rendering',
    'concept:nested-group-ctm-accumulation', 'pv:transform=translate', 'pv:transform=scale',
    // detail tier, all exercised on the plate
    'concept:radius-percentage-normalized-diagonal', 'concept:stroke-over-fill-transparency', 'concept:opacity-zero-still-hit-testable',
    'concept:odd-dash-repetition', 'concept:dotted-line-round-caps', 'concept:marching-ants', 'concept:inner-outer-stroke-simulation',
    'concept:stroke-width-under-nonuniform-scale', 'concept:non-uniform-scale-stroke-distortion', 'concept:currentcolor-icon-theming',
    'concept:transform-attribute-css-syntax', 'concept:invalid-transform-attribute-ignored', 'concept:scale-about-point',
    'pv:transform-box=view-box', 'pv:transform-box=fill-box', 'pv:transform-box=stroke-box', 'av:ellipse.rx=auto');
}

// ---------------------------------------------------------------------------------------------------------------
// <style>: ink recipes (pr:color), the field transform (pr:transform, pr:transform-box, pr:transform-origin),
// paint-order groups, cascade precedence (.reg), individual transform properties + @keyframes, 3D tilt, still-frame.
function styleBlock(still: boolean): DocumentFragment {
  return fragment(`<style>
    /* separation: one \`color\` line per pass recolours every stroke="currentColor" hairline of that pass */
    #pass-brown-1, #pass-brown-2 { color: ${BROWN}; }
    #pass-green, #rosette-pass { color: ${GREEN}; }
    /* the field: CSS transform wins over the transform="translate(0 0)" attribute; fill-box centre pivot */
    #field { transform: rotate(-3.2deg) scale(1.18, 0.72); transform-box: fill-box; transform-origin: center; }
    .ring .ink { transition: scale .3s ease; transform-box: fill-box; transform-origin: center; }
    .ring:hover .ink { scale: 1.02; }
    .hit { cursor: crosshair; }
    /* rosette halves: identical geometry, only paint-order differs */
    .po-normal { paint-order: normal; }
    .po-stroke { paint-order: stroke fill markers; }
    /* registration cross: presentation attribute has specificity 0, any rule wins */
    .reg { transform: none; }
    /* whole sheet tilted; no 3D rendering context inside SVG, children are flattened */
    #plate { transform: perspective(2400px) rotateX(6deg) rotateY(-8deg); transform-box: view-box; transform-origin: 700px 450px; }
    /* rosette: two unrelated keyframes drive rotate and scale separately (no combined transform list) */
    #rosette-spin { rotate: 0deg; scale: 1; transform-box: fill-box; transform-origin: center;
      animation: gp-rot 40s linear infinite, gp-breathe 11s ease-in-out infinite alternate; animation-delay: -7.5s, -7.5s; }
    @keyframes gp-rot { to { rotate: 360deg; } }
    @keyframes gp-breathe { from { scale: 1; } to { scale: 1.05; } }
    /* gear train: the outermost group turns continuously; −4.2s of 16.8s leaves it exactly at 0° in the still */
    #gear-chain { transform-box: view-box; transform-origin: 0 0; animation: gp-chain 16.8s linear infinite; animation-delay: -4.2s; }
    @keyframes gp-chain { from { rotate: -90deg; } to { rotate: 270deg; } }
    /* safety thread: marching ants via stroke-dashoffset */
    .thread { animation: gp-ants 1.8s linear infinite; animation-delay: -1.8s; }
    @keyframes gp-ants { to { stroke-dashoffset: -28; } }
    /* transform-box specimens: same rotate, three reference boxes */
    .tb1 { rotate: 12deg; transform-box: view-box; }
    .tb2 { rotate: 12deg; transform-box: fill-box; transform-origin: center; }
    .tb3 { rotate: 12deg; transform-box: stroke-box; transform-origin: center; }
    /* corner flowers: three independent transform properties */
    .corner { rotate: -6deg; scale: 1.12; translate: 4px 0; transform-box: fill-box; transform-origin: center; }
    ${still ? ':root[data-still] * { animation-play-state: paused !important; }' : ''}
  </style>`);
}

function defs(): SVGDefsElement {
  const d = el('defs');
  // corner flower symbol; each <use> sets its own CSS color → currentColor theming
  const sym = el('symbol', { id: 'gp-corner', viewBox: '-20 -20 40 40', overflow: 'visible' });
  sym.append(el('path', { d: miniRosetteD(17, 8, 6), ...HAIR }));
  sym.append(el('circle', { cx: 0, cy: 0, r: 2.2, fill: 'currentColor' }));
  d.append(sym);
  return d;
}

// ---------------------------------------------------------------------------------------------------------------
// Sheet thickness: three 3.4px slivers under the bottom edge at +4/+8/+12, `stroke="none"`, below every ink layer.
function paperThickness(): SVGGElement {
  const g = el('g', { id: 'paper-thickness' });
  for (const off of [4, 8, 12]) {
    g.append(el('path', { d: bottomBandD(FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.rx, off, 3.4), fill: '#3b3226', 'fill-opacity': 0.5, stroke: 'none' }));
  }
  return g;
}

// Ground bands (construction note 9): a 40px ring inside the frame split into four sub-bands (12/10/9/9) whose line
// pitch closes from 6.0 to 1.7px; dash rhythms none / 10 2 / 20 5 5 5 / 7 (odd list → doubled, ink/gap swap).
function groundBands(): SVGGElement {
  const g = el('g', { id: 'ground-bands', style: `color: ${BROWN}` });
  const bands = [
    { w: 12, pitch: 6.0, dash: 'none', offsets: [0] },
    { w: 10, pitch: 4.0, dash: '10 2', offsets: [0, 5, -5] },
    { w: 9, pitch: 2.6, dash: '20 5 5 5', offsets: [0] },
    { w: 9, pitch: 1.7, dash: '7', offsets: [0] },
  ];
  let start = 0;
  bands.forEach((b, i) => {
    let d = '';
    let n = 0;
    for (let k = start + b.pitch / 2; k < start + b.w; k += b.pitch, n++) {
      d += roundedRectD(FRAME.x + k, FRAME.y + k, FRAME.w - 2 * k, FRAME.h - 2 * k, Math.max(FRAME.rx - k, 1));
    }
    // sub-band 2 also shows stroke-dashoffset 0 / 5 / −5 on its lines (split into one path per offset)
    if (b.offsets.length > 1) {
      let j = 0;
      for (let k = start + b.pitch / 2; k < start + b.w; k += b.pitch, j++) {
        g.append(el('path', {
          class: `ground-band gb-${i + 1}`, d: roundedRectD(FRAME.x + k, FRAME.y + k, FRAME.w - 2 * k, FRAME.h - 2 * k, Math.max(FRAME.rx - k, 1)),
          ...HAIR, 'stroke-opacity': 0.85, 'stroke-dasharray': b.dash, 'stroke-dashoffset': b.offsets[j % b.offsets.length], 'data-pitch': b.pitch,
        }));
      }
    } else {
      g.append(el('path', { class: `ground-band gb-${i + 1}`, d, ...HAIR, 'stroke-opacity': 0.85, 'stroke-dasharray': b.dash, 'data-pitch': b.pitch, 'data-lines': n }));
    }
    start += b.w;
  });
  return g;
}

// Corner flowers (construction note 16): <use> instances themed only through CSS color; rotate/scale/translate
// as three separate properties (`.corner`).
function cornerFlowers(): SVGGElement {
  const g = el('g', { id: 'corners' });
  const spots: [number, number, string][] = [[100, 88, BROWN], [1276, 88, GREEN], [100, 800, GREEN], [1276, 800, BROWN]];
  for (const [x, y, color] of spots) g.append(el('use', { href: '#gp-corner', x, y, width: 24, height: 24, class: 'corner', style: `color: ${color}` }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Top strip (y 92..252): gear train, transform-order specimen, title, transform-box lab, registration cross, stamp.
function topStrip(): SVGGElement {
  const g = el('g', { id: 'top-strip' });
  g.append(gearTrain());
  g.append(transformOrder());
  g.append(titleBlock());
  g.append(transformBoxLab());
  g.append(registrationCross());
  g.append(stamp());
  return g;
}

// Construction note 12: four nested <g transform="rotate(15) translate(24 0)"> accumulate 60° in the CTM; the
// pen pin <circle r="4"> sits at the end; the dotted trajectory is a scaled H-11 arc passing through the pin.
function gearTrain(): SVGGElement {
  const root = el('g', { id: 'gear-root', transform: 'translate(150 150)', style: `color: ${BROWN}` });
  // chuck + pitch circle (cx/cy/r circles)
  root.append(el('circle', { cx: 0, cy: 0, r: 18, fill: 'none', stroke: 'currentColor', 'stroke-width': 1 }));
  root.append(el('circle', { cx: 0, cy: 0, r: 14, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.6, 'stroke-dasharray': '2 2' }));
  root.append(el('circle', { cx: 0, cy: 0, r: 2.5, fill: 'currentColor' }));
  // pin position after four rotate(15) translate(24 0): Σ 24∠(15k), k=1..4
  let px = 0, py = 0;
  for (let k = 1; k <= 4; k++) { px += 24 * Math.cos((15 * k * Math.PI) / 180); py += 24 * Math.sin((15 * k * Math.PI) / 180); }
  // pre-drawn cut: dotted line (stroke-dasharray 0 4 + round caps) — a fragment of one H-11 curve
  root.append(el('path', { d: polyD(trajectoryThrough(px, py, 120), 0, 0, false), fill: 'none', stroke: GREEN, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-dasharray': '0 4', class: 'trajectory' }));
  const chain = el('g', { id: 'gear-chain' });
  root.append(chain);
  let parent: SVGGElement = chain;
  const radii = [12, 10, 8];
  for (let level = 0; level < 4; level++) {
    const link = el('g', { class: 'gear-level', transform: 'rotate(15) translate(24 0)', 'data-level': level + 1 });
    // arm from the previous pivot to this one (drawn in the child's frame: from (−24,0) to (0,0))
    link.append(el('line', { x1: -24, y1: 0, x2: 0, y2: 0, stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    if (level < 3) {
      link.append(el('circle', { cx: 0, cy: 0, r: radii[level], fill: 'none', stroke: 'currentColor', 'stroke-width': 1 }));
      link.append(el('circle', { cx: 0, cy: 0, r: radii[level] - 3, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.6, 'stroke-dasharray': '1.5 1.5' }));
      link.append(el('circle', { cx: 0, cy: 0, r: 1.6, fill: 'currentColor' }));
    } else {
      link.append(el('circle', { cx: 0, cy: 0, r: 4, fill: GREEN, stroke: 'currentColor', 'stroke-width': 0.8, class: 'pen-pin' }));
    }
    parent.append(link);
    parent = link;
  }
  const g = el('g', { id: 'gear-train' });
  g.append(root);
  g.append(label(100, 108, '转轮联动图 · 4 × rotate(15) translate(24 0) → CTM 60°'));
  g.append(label(100, 246, '点线：刀销将切出的 H-11 曲线（片段）', { 'font-size': 11 }));
  return g;
}

// Construction note 11: same anchor, translate(210 0) rotate(24) vs rotate(24) translate(210 0) — right-to-left
// evaluation lands the satellites 2·210·sin(12°) ≈ 87px apart. Third specimen: CSS unit syntax rotate(24deg).
function transformOrder(): SVGGElement {
  const g = el('g', { id: 'transform-order', style: `color: ${BROWN}` });
  const anchor = el('g', { transform: 'translate(352 136)' });
  anchor.append(el('circle', { cx: 0, cy: 0, r: 3, fill: 'currentColor', class: 'anchor' }));
  const satellite = (cls: string, transform: string, tone: string) => {
    const s = el('g', { class: `satellite ${cls}`, transform, style: `color: ${tone}` });
    s.append(el('path', { d: miniRosetteD(16, 7, 7), ...HAIR }));
    s.append(el('line', { x1: 0, y1: 0, x2: 16, y2: 0, stroke: 'currentColor', 'stroke-width': 1.2 })); // radial tick shows the rotation
    s.append(el('circle', { cx: 0, cy: 0, r: 1.5, fill: 'currentColor' }));
    return s;
  };
  anchor.append(satellite('sat-a', 'translate(210 0) rotate(24)', BROWN));
  anchor.append(satellite('sat-b', 'rotate(24) translate(210 0)', GREEN));
  // leaders from the anchor to both landing points
  const bx = 210 * Math.cos((24 * Math.PI) / 180), by = 210 * Math.sin((24 * Math.PI) / 180);
  anchor.append(leader(0, 0, 210, 0));
  anchor.append(leader(0, 0, bx, by));
  // SVG2 CSS-syntax sample: rotate(24deg) about the anchor; ghost marks where it sits if the attribute were ignored
  const css = el('g', { class: 'satellite sat-css', transform: 'rotate(24deg)', style: `color: ${GREEN}` });
  css.append(el('path', { d: miniRosetteD(11, 5, 5), ...HAIR, transform: 'translate(0 62)' }));
  css.append(el('circle', { cx: 0, cy: 62, r: 1.4, fill: 'currentColor' }));
  anchor.append(css);
  anchor.append(el('circle', { cx: 0, cy: 62, r: 11, fill: 'none', stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '2 2' }));
  g.append(anchor);
  g.append(label(336, 108, '轮位对照 · 同一锚点'));
  g.append(label(500, 124, '先移后转 translate(210 0) rotate(24)', { 'font-size': 11, 'text-anchor': 'middle' }));
  g.append(label(462, 244, '先转后移 rotate(24) translate(210 0)', { 'font-size': 11 }));
  g.append(mono(298, 222, 'rotate(24deg)', { 'font-size': 11 }));
  g.append(label(298, 235, 'SVG2 单位语法样品', { 'font-size': 11 }));
  return g;
}

function titleBlock(): SVGGElement {
  const g = el('g', { id: 'title-block' });
  g.append(el('text', { x: 604, y: 126, 'font-family': FONT_CJK, 'font-size': 22, 'font-weight': 700, fill: INK }, '玫瑰线雕版'));
  g.append(mono(604, 146, 'GUILLOCHE INTAGLIO PLATE', { 'letter-spacing': 1 }));
  g.append(label(604, 168, '四族玫瑰线 · 三次走版 · 0.60px 发丝'));
  g.append(label(604, 186, '版心 4 个 <path> 承载 280 条曲线'));
  g.append(label(604, 204, '交叉处上下关系 = 走版先后 × stroke-opacity'));
  g.append(label(604, 222, '无 mask / clipPath'));
  return g;
}

// Construction note 13: three identical hatch blocks, all `rotate: 12deg`, differing only in transform-box.
function transformBoxLab(): SVGGElement {
  const g = el('g', { id: 'transform-box-lab', style: `color: ${GREEN}` });
  const lab = el('g', { transform: 'translate(600 170)' });          // local origin 270px left of the first block
  const hatch = (cls: string, x: number, groove: boolean) => {
    const b = el('g', { class: `tb ${cls}`, 'data-x': x });
    let d = '';
    for (let k = -18; k <= 18; k += 3) d += `M${x + k} -18V18`;
    b.append(el('rect', { x: x - 18, y: -18, width: 36, height: 36, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.8 }));
    b.append(el('path', { d, ...HAIR }));
    if (groove) b.append(el('line', { x1: x + 18, y1: -18, x2: x + 18, y2: 18, stroke: 'currentColor', 'stroke-width': 24, 'stroke-opacity': 0.25, class: 'groove' }));
    return b;
  };
  // ghost outlines at the untransformed positions
  for (const x of [270, 330, 390]) lab.append(el('rect', { x: x - 18, y: -18, width: 36, height: 36, fill: 'none', stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '2 2' }));
  // arc of radius 270 the first block travels on (about the local origin)
  const a = (12 * Math.PI) / 180;
  lab.append(el('path', { d: `M270 0A270 270 0 0 1 ${(270 * Math.cos(a)).toFixed(2)} ${(270 * Math.sin(a)).toFixed(2)}`, fill: 'none', stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '3 2' }));
  lab.append(hatch('tb1', 270, false));
  lab.append(hatch('tb2', 330, false));
  lab.append(hatch('tb3', 390, true));
  // pivots: fill-box centre (390,0) vs stroke-box centre (396,0) of block 3
  for (const [px, tone] of [[390, INK], [396, GREEN]] as [number, string][]) {
    lab.append(el('path', { d: `M${px - 4} 0H${px + 4}M${px} -4V4`, stroke: tone, 'stroke-width': 0.6, fill: 'none' }));
  }
  g.append(lab);
  g.append(label(822, 108, '轮位试块 · 都只写 rotate: 12deg'));
  g.append(label(838, 138, 'view-box', { 'font-size': 11, 'text-anchor': 'middle' }));
  g.append(label(930, 138, 'fill-box', { 'font-size': 11, 'text-anchor': 'middle' }));
  g.append(label(990, 138, 'stroke-box', { 'font-size': 11, 'text-anchor': 'middle' }));
  g.append(label(822, 212, '默认原点 (0,0) 甩出 r≈270 弧', { 'font-size': 11 }));
  g.append(label(822, 226, '中心自转 ／ 24px 刻痕使 stroke-box 中心右移 6px', { 'font-size': 11 }));
  return g;
}

// Construction note 14: transform attribute translate(120 0) overridden by `.reg { transform: none }`.
function registrationCross(): SVGGElement {
  const g = el('g', { id: 'registration', style: `color: ${BROWN}` });
  const cross = (cx: number, cy: number) => `M${cx - 14} ${cy}H${cx + 14}M${cx} ${cy - 14}V${cy + 14}`;
  g.append(el('path', { class: 'reg', transform: 'translate(120 0)', d: cross(1052, 168), stroke: 'currentColor', 'stroke-width': 2, fill: 'none' }));
  g.append(el('circle', { class: 'reg', transform: 'translate(120 0)', cx: 1052, cy: 168, r: 8, fill: 'none', stroke: 'currentColor', 'stroke-width': 1 }));
  // ghost at the attribute position + leader
  g.append(el('path', { d: cross(1172, 168), stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '2 2', fill: 'none' }));
  g.append(el('circle', { cx: 1172, cy: 168, r: 8, fill: 'none', stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '2 2' }));
  g.append(leader(1062, 168, 1162, 168));
  g.append(label(1032, 108, '套准十字'));
  g.append(mono(1032, 124, 'transform="translate(120 0)"'));
  g.append(mono(1032, 212, '.reg { transform: none }'));
  g.append(label(1032, 226, '属性特异性 0，十字停在原处', { 'font-size': 11 }));
  return g;
}

// Plate stamp: no `color` written anywhere on its ancestors — fill="currentColor" inherits the HTML <main> colour.
function stamp(): SVGGElement {
  const g = el('g', { id: 'stamp' });
  g.append(el('rect', { x: 1206, y: 100, width: 52, height: 52, rx: 3, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }));
  g.append(el('rect', { x: 1210, y: 104, width: 44, height: 44, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.5 }));
  g.append(el('text', { x: 1232, y: 122, 'font-family': FONT_CJK, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: 'currentColor' }, '版'));
  g.append(el('text', { x: 1232, y: 141, 'font-family': FONT_MONO, 'font-size': 13, 'text-anchor': 'middle', fill: 'currentColor' }, 'No.07'));
  g.append(label(1232, 168, '钤记', { 'text-anchor': 'middle' }));
  g.append(label(1232, 182, 'fill=currentColor', { 'text-anchor': 'middle', 'font-family': FONT_MONO }));
  g.append(label(1232, 196, '继承 <main> 的 color', { 'text-anchor': 'middle' }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Left proof column (x 96..244): r=6% guide circle, three 44px wastes, auto-rx ellipse + dotted reference, ink trough.
function leftColumn(): SVGGElement {
  const g = el('g', { id: 'proof-column', style: `color: ${BROWN}` });
  // percentage radius resolves against the normalized diagonal √((1400²+900²)/2) = 1176.9 → 6% = 70.6px
  g.append(el('circle', { cx: 170, cy: 324, r: '6%', fill: 'none', stroke: 'currentColor', 'stroke-width': 0.6, 'stroke-dasharray': '4 2', class: 'pct-radius' }));
  g.append(el('circle', { cx: 170, cy: 324, r: 3, fill: 'currentColor' }));
  g.append(mono(170, 320, 'r="6%"', { 'text-anchor': 'middle' }));
  g.append(label(170, 334, '→ 70.6px', { 'text-anchor': 'middle' }));
  g.append(label(170, 348, '归一化对角线 1176.9', { 'text-anchor': 'middle' }));
  g.append(label(170, 270, '校样柱', { 'text-anchor': 'middle', 'font-weight': 700 }));

  // three wastes, 44px cells at x 122 / 170 / 218, y 424
  const rd = miniRosetteD(19, 12, 5);
  const cell = (cx: number) => el('g', { transform: `translate(${cx} 424)` });
  const good = cell(122); good.append(el('path', { d: rd, ...HAIR, class: 'waste-good' })); g.append(good);
  const solid = cell(170); solid.append(el('path', { d: rd, fill: '#6b5a33', stroke: 'none', class: 'waste-solid' })); g.append(solid);
  // invalid transform list → whole attribute ignored, rendered untransformed (Chromium logs and drops it)
  const bad = cell(218); bad.append(el('g', { transform: 'rotate(24,)', class: 'waste-bad' }, el('path', { d: rd, ...HAIR, 'stroke-opacity': 0.7 }))); g.append(bad);
  g.append(mono(122, 456, 'fill="none"', { 'text-anchor': 'middle', 'font-size': 11 }));
  g.append(label(122, 469, '正样', { 'text-anchor': 'middle' }));
  g.append(mono(170, 456, 'fill=#6b5a33', { 'text-anchor': 'middle', 'font-size': 11 }));
  g.append(label(170, 469, '自交填成墨块', { 'text-anchor': 'middle' }));
  g.append(mono(218, 456, 'rotate(24,)', { 'text-anchor': 'middle', 'font-size': 11 }));
  g.append(label(218, 469, '语法错→忽略', { 'text-anchor': 'middle' }));

  // auto-radius check ring: rx omitted (auto) → Chrome/Firefox draw a circle of radius ry; Safari draws nothing
  g.append(el('ellipse', { cx: 170, cy: 526, style: 'rx:auto', ry: 40, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.9, class: 'auto-rx' }));
  g.append(el('circle', { cx: 170, cy: 526, r: 40, fill: 'none', stroke: INK, 'stroke-width': 0.6, 'stroke-dasharray': '0 3', 'stroke-linecap': 'round', class: 'auto-ref' }));
  g.append(mono(170, 522, 'CSS rx:auto', { 'text-anchor': 'middle' }));
  g.append(label(170, 536, 'auto → 使用 ry=40', { 'text-anchor': 'middle' }));
  g.append(label(170, 580, '点线参照 <circle r=40>', { 'text-anchor': 'middle' }));

  // ink trough: tall narrow ellipse (ry ≫ rx) — the el:ellipse counterpart of the wide window ellipse
  g.append(el('ellipse', { cx: 170, cy: 648, rx: 26, ry: 52, fill: 'currentColor', 'fill-opacity': 0.12, stroke: 'currentColor', 'stroke-width': 1, class: 'trough' }));
  g.append(el('ellipse', { cx: 170, cy: 648, rx: 14, ry: 40, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.6 }));
  g.append(label(170, 652, '墨槽', { 'text-anchor': 'middle' }));
  g.append(mono(170, 666, 'rx=26 ry=52', { 'text-anchor': 'middle' }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// The field (construction notes 3–6): four families in three passes, hairlines stroke="currentColor" 0.6px with
// vector-effect:non-scaling-stroke, anisotropic CSS transform, inner keyline circle WITHOUT vector-effect.
function ringGroup(f: Family, extra: Record<string, string | number> = {}): SVGGElement {
  const [rMin, rMax] = extent(f);
  const g = el('g', {
    class: 'ring', 'data-family': f.id, 'data-kind': f.kind === 'hypo' ? '内摆线 hypotrochoid' : '外摆线 epitrochoid',
    'data-params': `R=${f.R} r=${f.r} d=${f.d} N=${f.N}`, 'data-extent': `${rMin}..${rMax}`,
  });
  g.append(el('path', { class: 'ink', d: familyD(f, CX, CY), ...HAIR, 'stroke-opacity': 0.5, ...extra }));
  // hover annulus: opacity 0 keeps it hit-testable; stroke-based so bands do not shadow each other
  const [hi, ho] = f.hit;
  g.append(el('ellipse', { class: 'hit', cx: CX, cy: CY, rx: (hi + ho) / 2, ry: (hi + ho) / 2, opacity: 0, fill: 'none', stroke: 'currentColor', 'stroke-width': ho - hi, 'pointer-events': 'stroke' }));
  RINGS[f.id] = { family: f.id, kind: g.dataset.kind!, params: g.dataset.params! };
  return g;
}

function field(): SVGGElement {
  const fld = el('g', { id: 'field', transform: 'translate(0 0)' });
  const brown1 = el('g', { id: 'pass-brown-1' });
  brown1.append(ringGroup(FAMILIES.E7));
  brown1.append(ringGroup(FAMILIES.H19));
  const green = el('g', { id: 'pass-green' });
  green.append(ringGroup(FAMILIES.H11));
  green.append(ringGroup(FAMILIES.E5));
  // second brown pass: highlight hairlines at half-step phases, lighter
  const brown2 = el('g', { id: 'pass-brown-2' });
  brown2.append(el('path', { d: familyD(FAMILIES.E7, CX, CY, { count: 36, halfStep: true }), ...HAIR, 'stroke-opacity': 0.3, class: 'highlight' }));
  brown2.append(el('path', { d: familyD(FAMILIES.H19, CX, CY, { count: 32, halfStep: true }), ...HAIR, 'stroke-opacity': 0.3, class: 'highlight' }));
  fld.append(brown1, green, brown2);
  // scaled keyline: a circle r=170 with NO vector-effect → stroke ≈1.18px at the sides, ≈0.72px top/bottom
  fld.append(el('circle', { id: 'keyline-scaled', cx: CX, cy: CY, r: 170, fill: 'none', stroke: INK, 'stroke-width': 1.3 }));
  return fld;
}

// Construction note 6: the true ellipse keyline outside #field (constant stroke), plus its own hit ring.
function windowRing(): SVGGElement {
  const g = el('g', { class: 'ring', 'data-family': 'WIN', 'data-kind': '开窗 真椭圆 keyline', 'data-params': 'rx=200 ry=132 (circle r=170 × scale 1.18/0.72 → 200.6/122.4)', style: `color: ${INK}` });
  g.append(el('ellipse', { id: 'keyline-true', class: 'ink', cx: CX, cy: CY, rx: 200, ry: 132, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3 }));
  g.append(el('ellipse', { class: 'hit', cx: CX, cy: CY, rx: 200, ry: 132, opacity: 0, fill: 'none', stroke: 'currentColor', 'stroke-width': 10, 'pointer-events': 'stroke' }));
  RINGS.WIN = { family: 'WIN', kind: g.dataset.kind!, params: g.dataset.params! };
  // keyline captions with 0.4px leaders
  g.append(leader(CX + 200, CY, CX + 232, CY - 40));
  g.append(label(CX + 236, CY - 44, '真椭圆 rx=200 ry=132', { 'font-size': 11 }));
  g.append(label(CX + 236, CY - 31, '笔宽沿周长恒定', { 'font-size': 11 }));
  g.append(leader(CX - 200.6, CY, CX - 232, CY - 40));
  g.append(label(CX - 236, CY - 44, '被缩放的圆 r=170', { 'font-size': 11, 'text-anchor': 'end' }));
  g.append(label(CX - 236, CY - 31, '无 vector-effect，左右 1.18px 上下 0.72px', { 'font-size': 11, 'text-anchor': 'end' }));
  return g;
}

// Construction note 7: 24 petals; petals 0–11 (left half in the frozen pose) paint-order normal, 12–23 (right half)
// paint-order stroke fill markers. Rotation happens in circle space, then an outer scale(1, .66) squashes to the ellipse.
function rosette(): SVGGElement {
  const pass = el('g', { id: 'rosette-pass' });
  const ring = el('g', { class: 'ring', 'data-family': 'R-24', 'data-kind': '团花 rosette', 'data-params': '24 瓣 rx=150 ry=99 · paint-order normal | stroke' });
  RINGS['R-24'] = { family: 'R-24', kind: ring.dataset.kind!, params: ring.dataset.params! };
  const tone = el('g', { style: `color: ${LIGHT}` });
  const squash = el('g', { id: 'rosette-squash', style: `transform: translate(${CX}px, ${CY}px) scale(1, 0.66)` });
  const spin = el('g', { id: 'rosette-spin' });
  const left = el('g', { class: 'petals po-normal', 'data-half': 'left' });
  const right = el('g', { class: 'petals po-stroke', 'data-half': 'right' });
  for (let k = 0; k < 24; k++) {
    // base angle 30°+15k: after the frozen −7.5s ⇒ +67.5° rotation, k≥12 spans −82.5°..82.5° (right half)
    const p = el('path', { class: 'ink petal', d: petalD(30 + 15 * k, 150), fill: 'currentColor', 'fill-opacity': 0.4, stroke: 'currentColor', 'stroke-width': 6, 'stroke-opacity': 0.55, 'data-petal': k });
    (k < 12 ? left : right).append(p);
  }
  spin.append(left, right);
  squash.append(spin);
  tone.append(squash);
  ring.append(tone);
  // guard line: translucent thick stroke over the petal fills (two-tone band where it crosses fills)
  ring.append(el('line', { x1: CX - 190, y1: CY, x2: CX + 190, y2: CY, stroke: GREEN, 'stroke-width': 14, 'stroke-opacity': 0.35, class: 'guard' }));
  // centre guide circle: percentage radius → 70.6px
  ring.append(el('circle', { cx: CX, cy: CY, r: '6%', fill: 'none', stroke: INK, 'stroke-width': 0.6, 'stroke-dasharray': '2 3', class: 'pct-radius' }));
  ring.append(el('circle', { cx: CX, cy: CY, r: 3, fill: INK }));
  // hit disk: opacity 0 filled ellipse, innermost, on top
  ring.append(el('ellipse', { class: 'hit', cx: CX, cy: CY, rx: 150, ry: 99, opacity: 0, fill: 'currentColor' }));
  pass.append(ring);
  // half labels below the window
  pass.append(label(CX - 160, CY + 150, 'paint-order: normal', { 'font-family': FONT_MONO }));
  pass.append(label(CX - 160, CY + 163, '描边吃掉半个瓣宽，内侧深色带'));
  pass.append(label(CX + 160, CY + 150, 'paint-order: stroke fill markers', { 'font-family': FONT_MONO, 'text-anchor': 'end' }));
  pass.append(label(CX + 160, CY + 163, '瓣型完整，等效外描边', { 'text-anchor': 'end' }));
  pass.append(label(CX, CY + 176, '团花 R-24 · 左右两半几何相同，只差 paint-order', { 'text-anchor': 'middle' }));
  return pass;
}

// Safety thread: dasharray 18 10, marching ants through stroke-dashoffset keyframes.
function safetyThread(): SVGGElement {
  const g = el('g', { id: 'safety' });
  g.append(el('line', { class: 'thread', x1: 96, y1: 706, x2: 1304, y2: 706, stroke: '#8a6d2f', 'stroke-width': 1.4, 'stroke-dasharray': '18 10', 'stroke-dashoffset': 0 }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Bottom strip (construction note 10): proof strip rows A (stroke scales with CTM) and B (non-scaling-stroke), legend.
function bottomStrip(): SVGGElement {
  const g = el('g', { id: 'bottom-strip' });
  const S1 = sampleS1D(50, 9);
  const sample = (nonScaling: boolean, cls: string) => {
    const s = el('g', { class: `sample ${cls}` });
    s.append(el('path', { d: S1, stroke: 'currentColor', fill: 'none', 'stroke-width': 0.6, 'vector-effect': nonScaling ? 'non-scaling-stroke' : undefined }));
    // dashed bottom rule makes the dash pitch part of the specimen
    s.append(el('path', { d: 'M0 4.5H50', stroke: 'currentColor', fill: 'none', 'stroke-width': 0.6, 'stroke-dasharray': '3 1.5', 'vector-effect': nonScaling ? 'non-scaling-stroke' : undefined }));
    return s;
  };
  const placements: [string, string, string][] = [
    ['translate(210) scale(0.25)', '0.25×', 's025'],
    ['translate(236) scale(0.5)', '0.5×', 's05'],
    ['translate(272)', '1×', 's1'],
    ['translate(336) scale(2)', '2×', 's2'],
    ['translate(450) scale(2 0.5)', 'scale(2 .5)', 's2h'],
    // 4×: grown about its own centre (25,0) so it stays on the baseline
    ['translate(639) translate(25 0) scale(4) translate(-25 0)', '4× 绕自身中心', 's4'],
  ];
  const row = (y: number, nonScaling: boolean, id: string) => {
    const r = el('g', { id, transform: `translate(0 ${y})`, style: `color: ${nonScaling ? GREEN : BROWN}` });
    for (const [t, , cls] of placements) {
      const s = sample(nonScaling, cls);
      s.setAttribute('transform', t);
      r.append(s);
    }
    // zero-width sample at the row end: disappears in both rows
    const zero = el('g', { class: 'sample s0', transform: 'translate(850)' });
    zero.append(el('path', { d: S1, stroke: 'currentColor', fill: 'none', 'stroke-width': 0, 'vector-effect': nonScaling ? 'non-scaling-stroke' : undefined }));
    r.append(zero);
    // ghost of a bare scale(4): 0.3px dashed frame where the sample would fly to
    r.append(el('rect', { x: 639, y: -18, width: 200, height: 36, fill: 'none', stroke: INK, 'stroke-width': 0.3, 'stroke-dasharray': '4 2', class: 'ghost-scale4' }));
    return r;
  };
  g.append(row(736, false, 'proof-row-a'));
  g.append(row(790, true, 'proof-row-b'));
  g.append(label(128, 732, 'A 行', { 'font-weight': 700 }));
  g.append(label(128, 745, '笔宽随 CTM'));
  g.append(label(128, 786, 'B 行', { 'font-weight': 700 }));
  g.append(label(128, 799, 'non-scaling', { 'font-family': FONT_MONO }));
  const lx = [210, 236, 272, 336, 450, 564];
  placements.forEach(([, name], i) => g.append(label(lx[i], 767, name, { 'font-size': 11 })));
  g.append(label(700, 767, '← 裸 scale(4) 鬼影框', { 'font-size': 11 }));
  g.append(mono(850, 767, 'stroke-width=0', { 'font-size': 11 }));
  g.append(label(210, 722, '试印条 S-1 = H-11 族 50×9 片段 · 六个倍率各用单参数 translate(tx) 放置，y 不变', { 'font-size': 11 }));

  // legend (x 930..1300)
  const lg = el('g', { id: 'legend' });
  const sw = (y: number, color: string, text: string) => {
    const s = el('g', { style: `color: ${color}` });
    s.append(el('path', { d: `M934 ${y - 4}h30M934 ${y} h30M934 ${y + 4}h30`, ...HAIR, 'stroke-opacity': 0.8 }));
    lg.append(s);
    lg.append(mono(972, y + 4, text, { 'font-size': 11 }));
  };
  sw(728, BROWN, '#pass-brown-1  E-7 + H-19  color: oklch(0.46 0.07 68)');
  sw(746, GREEN, '#pass-green    H-11 + E-5  color: lab(42% -22 14)');
  sw(764, BROWN, '#pass-brown-2  加光细纹 stroke-opacity .3');
  lg.append(label(934, 786, '所有发丝 stroke="currentColor" stroke-width=.6 + non-scaling-stroke'));
  lg.append(label(934, 802, '安全线 stroke-dasharray 18 10 · @keyframes stroke-dashoffset 行军蚁'));
  g.append(lg);
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Right column (x 998..1304): ink recipe swatches (CSS colour syntaxes) and the moiré comparison.
function rightColumn(): SVGGElement {
  const g = el('g', { id: 'right-column' });
  // ink recipes (construction note 4): 7 hairline-stroked swatches, syntax + sRGB fallback
  const recipes: [string, string][] = [
    ['hsl(38 34% 34%)', '#745f39'],
    ['#5c4a2aee', 'rgb(92 74 42 / .93)'],
    ['rgba(92,74,42,.72)', 'α .72 无 fill-opacity'],
    ['oklch(0.46 0.07 68)', '#72502a'],
    ['lab(42% -22 14)', '#416d4b'],
    ['color(display-p3 0.13 0.35 0.24)', '#005b3b 截到 sRGB'],
    [LIGHT, '团花二次走版 浅调'],
  ];
  g.append(label(1010, 466, '油墨配方 · CSS 颜色语法作 paint', { 'font-weight': 700 }));
  recipes.forEach(([syntax, fallback], i) => {
    const y = 474 + i * 17;
    g.append(el('rect', { x: 1010, y, width: 16, height: 12, fill: syntax, stroke: INK, 'stroke-width': 0.4, class: 'swatch' }));
    g.append(mono(1034, y + 10, syntax.length > 34 ? 'color-mix(in oklab, lab(…) 70%, #d8cfae)' : syntax, { 'font-size': 11 }));
    g.append(label(1296, y + 10, fallback, { 'font-size': 11, 'text-anchor': 'end', fill: '#6b5f4e' }));
  });

  // moiré comparison (construction note 15): 24 H-19 curves — A: per-line stroke-opacity .5; B: opaque lines, group opacity .5
  const H19 = FAMILIES.H19;
  const scale = 44 / extent(H19)[1];
  const block = (x: number, perLine: boolean) => {
    const b = el('g', { class: `moire ${perLine ? 'moire-a' : 'moire-b'}`, style: `color: ${BROWN}`, opacity: perLine ? undefined : 0.5 });
    b.append(el('rect', { x, y: 600, width: 120, height: 94, fill: 'none', stroke: INK, 'stroke-width': 0.5 }));
    const step = (2 * Math.PI) / 24;
    for (let i = 0; i < 24; i++) {
      b.append(el('path', { d: polyD(trochoid(H19, i * step, 240, scale), x + 60, 647), ...HAIR, 'stroke-width': 0.7, 'stroke-opacity': perLine ? 0.5 : 1 }));
    }
    return b;
  };
  g.append(label(1020, 596, 'A 每线 stroke-opacity .5', { 'font-size': 11 }));
  g.append(label(1172, 596, 'B 整组 <g opacity=.5>', { 'font-size': 11 }));
  g.append(block(1020, true));
  g.append(block(1172, false));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Readout panel (construction note 8): family parameters + getScreenCTM a/b/c/d → sx, sy, plus a
// getBoundingClientRect/getBBox cross-check; the last line is always the pinned hairline width.
function readoutPanel(): { node: SVGGElement; show: (ring: SVGGraphicsElement) => void; current: () => string } {
  const g = el('g', { id: 'readout' });
  g.append(el('rect', { x: 1010, y: 262, width: 286, height: 184, rx: 4, fill: '#d8cfae', 'fill-opacity': 0.18, stroke: INK, 'stroke-width': 0.8 }));
  g.append(label(1022, 282, '读出面板 READOUT', { 'font-weight': 700 }));
  g.append(label(1284, 282, '指针停在环上', { 'text-anchor': 'end', fill: '#6b5f4e' }));
  const rows: SVGTextElement[] = [];
  const ys = [306, 326, 348, 368, 388, 408, 432];
  for (let i = 0; i < ys.length; i++) {
    const t = mono(1022, ys[i], '', { 'font-size': i === 0 ? 13 : 11, class: `ro-${i}`, 'font-weight': i === 0 ? 700 : undefined });
    rows.push(t);
    g.append(t);
  }
  let current = '';
  const f3 = (n: number) => n.toFixed(3);
  const show = (ring: SVGGraphicsElement) => {
    const id = ring.dataset.family ?? '';
    current = id;
    const meta = RINGS[id];
    const m = ring.getScreenCTM();
    const bcr = ring.getBoundingClientRect();
    const bb = ring.getBBox();
    const sx = m ? Math.hypot(m.a, m.b) : NaN, sy = m ? Math.hypot(m.c, m.d) : NaN;
    rows[0].textContent = `族 ${id}  ${meta?.kind ?? ''}`;
    rows[1].textContent = meta?.params ?? '';
    rows[2].textContent = m ? `CTM a=${f3(m.a)} b=${f3(m.b)} c=${f3(m.c)} d=${f3(m.d)}` : 'CTM —';
    rows[3].textContent = `sx=√(a²+b²)=${f3(sx)}  sy=√(c²+d²)=${f3(sy)}`;
    rows[4].textContent = `校验 bcr.w/bbox.w=${bb.width ? f3(bcr.width / bb.width) : '—'}  bcr.h/bbox.h=${bb.height ? f3(bcr.height / bb.height) : '—'}`;
    rows[5].textContent = `(CSS transform 与拍平的 3D 分量各引擎折算不同)`;
    rows[6].textContent = '笔宽 0.60 设备像素';
    g.dataset.family = id;
  };
  return { node: g, show, current: () => current };
}
