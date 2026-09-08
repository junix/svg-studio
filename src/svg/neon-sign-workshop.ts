// neon-sign-workshop — 霓虹招牌工坊 (docs/svg-feature-demos.md §3.13)
// A rainy-night neon workshop: one hand-wired neon filter (#ns-f-neon), one clipPath and one mask are shared by
// an SVG sign group and a real HTML price board; six method cards wire glow / shadow / inner shadow by hand;
// jig references, a morphology radius ruler, CMY/RGB blend inspection, and puddles cut with CSS masks.
// Layer order inside #stage: #wall (HTML tiles) → #svg-base → #world-html (HTML board) → #svg-glow (screen) → #svg-ui.
import { el, fragment, html, mark, mulberry32, fmt, isExport, type Attrs } from './lib';
import { stageCss, TUBE_D, TUBE_W, TUBE_FILL_BOX, TUBE_STROKE_BOX, WALL_TILE_URI } from './neon-sign-workshop-css';

declare global { interface Window { __sceneReady?: boolean } }

const CARD_W = 212, CARD_FACE_H = 150, CARD_Y = 466;
const cardX = (i: number) => 34 + i * 224;
const label = (x: number, y: number, str: string, attrs: Attrs = {}) => el('text', { x, y, 'font-size': 11, fill: 'currentColor', ...attrs }, str);
const mono = (x: number, y: number, str: string, attrs: Attrs = {}) => label(x, y, str, { class: 'mono', ...attrs });

/** Puddle basin for #ns-m-puddle: a seeded-noise superellipse in objectBoundingBox units. */
function puddleBasin(seed: number): string {
  const rnd = mulberry32(seed);
  const harmonics = Array.from({ length: 6 }, () => rnd() * 2 - 1);
  const parts: string[] = [];
  for (let i = 0; i < 72; i++) {
    const th = (i / 72) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
    const superellipse = Math.pow(Math.pow(Math.abs(c), 3) + Math.pow(Math.abs(s), 3), -1 / 3);
    let wobble = 1;
    harmonics.forEach((a, j) => { wobble += a * 0.035 * Math.sin((j + 2) * th + a * 3); });
    parts.push(`${i ? 'L' : 'M'}${(0.5 + 0.47 * c * superellipse * wobble).toFixed(4)} ${(0.5 + 0.45 * s * superellipse * wobble).toFixed(4)}`);
  }
  return parts.join('') + 'Z';
}

// ---------------------------------------------------------------------------------------------------------
// <defs>: every filter / clipPath / mask / gradient / pattern, ids prefixed `ns-`.
// ---------------------------------------------------------------------------------------------------------
function buildDefs(): SVGDefsElement {
  const defs = el('defs', { id: 'ns-defs' });
  // Shared neon filter (构造要点 4). concept:neon-glow-morphology — dilate alpha FIRST, blur second, so the halo
  // leaves the stroke instead of hugging it. concept:filter-input-wiring — the named `halo` result feeds feMerge twice.
  // pr:color-interpolation-filters locked to sRGB; region widened to -45%/190% or the default -10%/120% cuts the halo.
  const neon = (id: string, cif: string, withAnim: boolean) => `
    <filter id="${id}" x="-45%" y="-45%" width="190%" height="190%" color-interpolation-filters="${cif}">
      <feMorphology ${withAnim ? 'id="ns-morph"' : ''} in="SourceAlpha" operator="dilate" radius="3" result="fat"/>
      <feGaussianBlur ${withAnim ? 'id="ns-halo"' : ''} in="fat" stdDeviation="10" result="soft">${withAnim
        // concept:animate-filter-stddeviation — the only start-up flicker: additive on top of the pointer-written base value
        ? '<animate attributeName="stdDeviation" additive="sum" values="0;2.6;.4;3.2;0" dur="2.4s" repeatCount="indefinite"/>' : ''}</feGaussianBlur>
      <feFlood flood-color="#ff2f9d" result="pink"/>
      <feComposite in="pink" in2="soft" operator="in" result="halo"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="coreSoft"/>
      <feFlood flood-color="#8ff6ff" result="cyan"/>
      <feComposite in="cyan" in2="coreSoft" operator="in" result="core"/>
      <feMerge><feMergeNode in="halo"/><feMergeNode in="halo"/><feMergeNode in="core"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  defs.append(fragment(`
    ${neon('ns-f-neon', 'sRGB', true)}
    ${neon('ns-f-ref-srgb', 'sRGB', false)}
    ${neon('ns-f-ref-linear', 'linearRGB', false)}

    <!-- card 1 · concept:morphology-outline-stroke — dilate alpha, flood, composite OUT the original -->
    <filter id="ns-f-outline" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="fat"/>
      <feFlood flood-color="#ff2f9d" result="pink"/>
      <feComposite in="pink" in2="fat" operator="in" result="fatPink"/>
      <feComposite in="fatPink" in2="SourceAlpha" operator="out" result="ring"/>
      <feMerge><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- card 2 · concept:outline-stroke-via-alpha-dilate — blur alpha, threshold with feFuncA discrete, flood -->
    <filter id="ns-f-threshold" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="soft"/>
      <feComponentTransfer in="soft" result="hard"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feFlood flood-color="#8ff6ff" result="cyan"/>
      <feComposite in="cyan" in2="hard" operator="in" result="halo"/>
      <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- card 3 · concept:classic-drop-shadow-chain — SourceAlpha → blur → offset → flood/in → merge -->
    <filter id="ns-f-classic" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feOffset in="blur" dx="6" dy="8" result="shifted"/>
      <feFlood flood-color="#001f2e" flood-opacity=".95" result="ink"/>
      <feComposite in="ink" in2="shifted" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- card 4 · concept:inner-shadow-technique — offset alpha, blur, composite OUT of SourceAlpha keeps only the inner band -->
    <filter id="ns-f-inner" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
      <feOffset in="SourceAlpha" dx="0" dy="5" result="shifted"/>
      <feGaussianBlur in="shifted" stdDeviation="6" result="soft"/>
      <feComposite in="SourceAlpha" in2="soft" operator="out" result="band"/>
      <feFlood flood-color="#050d14" flood-opacity=".82" result="ink"/>
      <feComposite in="ink" in2="band" operator="in" result="inner"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="inner"/></feMerge>
    </filter>
    <!-- card 5 · el:feDropShadow — one primitive, parameters identical to card 3 for pixel comparison -->
    <filter id="ns-f-drop" x="-40%" y="-60%" width="180%" height="220%" color-interpolation-filters="sRGB">
      <feDropShadow dx="6" dy="8" stdDeviation="4" flood-color="#001f2e" flood-opacity=".95"/>
    </filter>
    <!-- card 6 · tint used inside a CSS filter chain -->
    <filter id="ns-f-tint" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="1 0 0 0 .28  0 0 0 0 0  0 0 0 0 .34  0 0 0 1 0"/>
    </filter>

    <!-- radius ruler · at:feMorphology.radius with two values (anisotropic); region widened for the dilation -->
    <filter id="ns-f-r00" x="-30%" y="-40%" width="160%" height="180%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="0 0"/></filter>
    <filter id="ns-f-r10" x="-30%" y="-40%" width="160%" height="180%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceGraphic" operator="dilate" radius="10 0">
        <!-- concept:smil-animate-morphology-radius — the press rests at 10 0 for the first 40% so the still frame reads the labelled value -->
        <animate attributeName="radius" values="10 0;10 0;2 8;9 1;10 0" keyTimes="0;.4;.6;.8;1" dur="4.2s" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1" repeatCount="indefinite"/>
      </feMorphology>
    </filter>
    <filter id="ns-f-r01" x="-30%" y="-40%" width="160%" height="180%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="0 10"/></filter>
    <filter id="ns-f-r77" x="-30%" y="-40%" width="160%" height="180%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="7 7"/></filter>
    <!-- av:feGaussianBlur.stdDeviation=0 — zero parameter is identity, but the element is still filtered -->
    <filter id="ns-f-blur0" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0"/></filter>
    <!-- at:feMorphology.operator — erode to hairline, dilate to chunky -->
    <filter id="ns-f-erode" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="erode" radius="2"/></filter>
    <filter id="ns-f-dilate" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="5"/></filter>

    <!-- the ONLY clipPath in the document: normalized nameplate, so one shape fits an SVG bbox and an HTML box -->
    <clipPath id="ns-clip-plate" clipPathUnits="objectBoundingBox">
      <path d="M.04 0H.96L1 .08V.92L.96 1H.04L0 .92V.08Z"/>
    </clipPath>
    <!-- el:mask + pr:mask-type — luminance mask in objectBoundingBox content units shared by sign and board -->
    <linearGradient id="ns-g-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#b4b4b4"/></linearGradient>
    <mask id="ns-m-tube-fade" mask-type="luminance" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#ns-g-fade)"/></mask>
    <mask id="ns-m-puddle" mask-type="luminance" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="#000"/>
      <path d="${puddleBasin(2026)}" fill="#fff"/>
      ${[0.28, 0.41, 0.55, 0.7, 0.84].map((y, i) => `<path d="M0 ${y}H1" stroke="#${i % 2 ? '6a6a6a' : '8c8c8c'}" stroke-width="${fmt(0.012 + i * 0.004)}"/>`).join('')}
    </mask>

    <radialGradient id="ns-g-spill" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#ff2f9d" stop-opacity=".28"/><stop offset=".55" stop-color="#8ff6ff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="ns-g-asphalt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a25"/><stop offset="1" stop-color="#050d14"/></linearGradient>
    <linearGradient id="ns-g-wet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d6f8e"/><stop offset=".5" stop-color="#173e55"/><stop offset="1" stop-color="#4b2a5e"/></linearGradient>
    <linearGradient id="ns-g-far" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b3a4c"/><stop offset=".5" stop-color="#2a5068"/><stop offset="1" stop-color="#1b3a4c"/></linearGradient>
    <linearGradient id="ns-g-patch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8ff6ff"/><stop offset="1" stop-color="#ff2f9d"/></linearGradient>
    <linearGradient id="ns-g-rain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff0ff"/><stop offset="1" stop-color="#2b7aa0"/></linearGradient>
    <pattern id="ns-pat-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="14" height="14" fill="#0c1e2a"/><rect width="6" height="14" fill="#245066"/></pattern>
  `));
  return defs;
}

// ---------------------------------------------------------------------------------------------------------
// HTML layers (foreignObject): wall tiles, the price board, the bad/good samples and the reflection.
// ---------------------------------------------------------------------------------------------------------
function wallLayer(): SVGForeignObjectElement {
  const fo = el('foreignObject', { id: 'wall', x: 0, y: 0, width: 1400, height: 900, 'pointer-events': 'none' });
  const root = html('div', { class: 'html-root' });
  const panels: Array<[number, number, number, number]> = [[32, 32, 1336, 64], [32, 104, 668, 348], [1060, 104, 308, 166], [1060, 286, 308, 166], [32, 466, 1336, 186]];
  root.innerHTML = panels.map(([x, y, w, h]) => `<div class="wall-panel" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`).join('');
  fo.append(root);
  return fo;
}

const PRICE_ROWS: Array<[string, string]> = [['直段 straight', '¥12 /cm'], ['圆角 r26 bend', '¥38 /角'], ['字形弯 glyph', '¥260 /字'], ['焊接封口 seal', '¥45'], ['充气点亮 fill+light', '¥180'], ['24H 保修 warranty', '1 年']];
const boardMarkup = () => `<h3>弯管工时 · 价目</h3>${PRICE_ROWS.map(([k, v]) => `<div class="row"><span>${k}</span><b>${v}</b></div>`).join('')}<p class="foot">OPEN · 24H</p>`;

function worldHtmlLayer(): SVGForeignObjectElement {
  const fo = el('foreignObject', { id: 'world-html', x: 0, y: 0, width: 1400, height: 900, 'pointer-events': 'none' });
  const root = html('div', { class: 'html-root' });
  root.innerHTML = `
    <div class="board-frame"><div class="board">${boardMarkup()}</div></div>
    <div class="board-bad">OPEN 24H</div>
    <div class="board-ok">OPEN 24H</div>
    <div class="reflection"><div class="reflection-inner">${boardMarkup()}</div></div>`;
  fo.append(root);
  return fo;
}

// ---------------------------------------------------------------------------------------------------------
// SVG base layer: bench, plates, blend inspection, jig, ruler, cards, ground.
// ---------------------------------------------------------------------------------------------------------
function tube(attrs: Attrs = {}): SVGPathElement {
  return el('path', { d: TUBE_D, fill: 'none', stroke: '#fff0f6', 'stroke-width': TUBE_W, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs });
}

function benchBase(): SVGGElement {
  const g = el('g', { id: 'ns-bench' });
  // power-on light spill (circle() reveal) and the morphing acrylic backing plate behind the tubes
  g.append(el('rect', { class: 'power-reveal', x: 196, y: 136, width: 340, height: 200, fill: 'url(#ns-g-spill)' }));
  g.append(el('rect', { class: 'plate-morph', x: 206, y: 146, width: 320, height: 180, fill: '#0b1723', 'fill-opacity': .96 }));
  // bench top strip (inspection area)
  g.append(el('rect', { x: 40, y: 352, width: 652, height: 92, rx: 6, fill: '#0e1c27', 'fill-opacity': .92 }));
  // colour-interpolation reference pair (right column): same wiring, sRGB vs linearRGB
  g.append(el('text', { x: 560, y: 190, 'font-size': 22, 'font-weight': 700, 'letter-spacing': 3, fill: 'currentColor', filter: 'url(#ns-f-ref-srgb)' }, 'OPEN'));
  g.append(el('text', { x: 560, y: 262, 'font-size': 22, 'font-weight': 700, 'letter-spacing': 3, fill: 'currentColor', filter: 'url(#ns-f-ref-linear)' }, 'OPEN'));
  // isolation switches A/B (pr:isolation): identical screen-blended mini signs on one striped backdrop
  g.append(el('rect', { x: 48, y: 358, width: 250, height: 82, rx: 4, fill: 'url(#ns-pat-stripes)' }));
  const miniSign = (x: number, isolate: boolean) => el('g', { style: isolate ? 'isolation:isolate' : 'isolation:auto' },
    el('rect', { x, y: 368, width: 108, height: 60, rx: 4, fill: '#14283a', 'fill-opacity': .55 }),
    el('text', { x: x + 54, y: 411, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 700, fill: '#ff2f9d', style: 'mix-blend-mode:screen' }, '24H'));
  g.append(miniSign(60, true), miniSign(180, false));
  // pr:mix-blend-mode — CMY multiply on a white lightbox (subtractive) beside RGB screen on the dark bench (additive)
  const triad = (cx: number, cy: number, colours: string[], mode: string) => colours.map((c, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
    return el('circle', { cx: fmt(cx + 17.32 * Math.cos(a)), cy: fmt(cy + 17.32 * Math.sin(a)), r: 26, fill: c, style: `mix-blend-mode:${mode}` });
  });
  g.append(el('g', { style: 'isolation:isolate' }, el('rect', { x: 470, y: 358, width: 104, height: 82, rx: 4, fill: '#fdfdfd' }), ...triad(522, 403, ['#00b7eb', '#ec008c', '#fff100'], 'multiply')));
  g.append(el('g', { style: 'isolation:isolate' }, el('rect', { x: 586, y: 358, width: 104, height: 82, rx: 4, fill: '#06111a' }), ...triad(638, 403, ['#ff2222', '#22ff44', '#2a5cff'], 'screen')));
  return g;
}

/** Jig: three copies of the tube clipped with inset(10%) against fill-box / stroke-box / view-box. */
function jigPanel(): SVGGElement {
  const g = el('g', { id: 'ns-jig' });
  const s = .3, cellW = 96, cellH = 110, cellY = 130;
  const cells: Array<[string, string]> = [['jig-fill', 'fill-box'], ['jig-stroke', 'stroke-box'], ['jig-view', 'view-box']];
  const boxes = { 'fill-box': TUBE_FILL_BOX, 'stroke-box': TUBE_STROKE_BOX } as Record<string, { x: number; y: number; w: number; h: number }>;
  cells.forEach(([cls, name], i) => {
    const cx = 1066 + i * 104;
    // each sample sits in its own nested <svg>, so `view-box` resolves to this 96×110 viewport
    const cell = el('svg', { x: cx, y: cellY, width: cellW, height: cellH, viewBox: `0 0 ${cellW} ${cellH}`, overflow: 'visible' });
    cell.append(el('rect', { x: .5, y: .5, width: cellW - 1, height: cellH - 1, rx: 4, fill: '#0b1620', stroke: '#2a4758' }));
    cell.append(el('g', { transform: `translate(6 34) scale(${s})` }, tube({ class: cls, stroke: '#ffd166' })));
    g.append(cell);
    const box = boxes[name];
    const line1 = box ? `${name} ${fmt(box.w * s, 1)}×${fmt(box.h * s, 1)}px` : `${name} ${cellW}×${cellH}px`;
    const line2 = box ? `inset ${fmt(box.w * s * .1, 1)} / ${fmt(box.h * s * .1, 1)}px` : `inset ${fmt(cellW * .1, 1)} / ${fmt(cellH * .1, 1)}px`;
    g.append(mono(cx + 4, 252, line1), mono(cx + 4, 265, line2, { fill: '#8fd8ff' }));
  });
  return g;
}

/** Radius ruler: same tube at .25 scale under dilate radius 0 0 / 10 0 / 0 10 / 7 7, plus erode/dilate on text. */
function rulerPanel(): SVGGElement {
  const g = el('g', { id: 'ns-ruler' });
  const s = .25;
  // filter on the OUTER group: primitive units stay in stage pixels while the tube itself is scaled
  const sample = (x: number, y: number, id: string, filterId: string) =>
    el('g', { id, filter: `url(#${filterId})` }, el('g', { transform: `translate(${x} ${y}) scale(${s})` }, tube({ stroke: '#ffd166' })));
  g.append(sample(1074, 316, 'ns-r00', 'ns-f-r00'), sample(1170, 316, 'ns-r10', 'ns-f-r10'));
  g.append(sample(1074, 384, 'ns-r01', 'ns-f-r01'), sample(1168, 384, 'ns-r77', 'ns-f-r77'));
  // concept:morphology-zero-radius beside a stdDeviation=0 blur: zero parameters are identities, not vanishing
  g.append(el('circle', { cx: 1150, cy: 322, r: 5, fill: '#8ff6ff', filter: 'url(#ns-f-blur0)' }));
  g.append(mono(1074, 372, 'radius="0 0" 恒等'), mono(1140, 372, 'σ=0', { fill: '#8fd8ff' }));
  g.append(mono(1170, 372, 'radius="10 0" 横胀 · 加压中'));
  g.append(mono(1074, 446, 'radius="0 10" 纵胀'), mono(1168, 446, 'radius="7 7" 各向同性'));
  // operator column · concept:morphology-thicken-text
  g.append(el('text', { x: 1312, y: 346, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: 'currentColor', filter: 'url(#ns-f-erode)' }, '霓虹'));
  g.append(el('text', { x: 1312, y: 420, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: 'currentColor', filter: 'url(#ns-f-dilate)' }, '霓虹'));
  g.append(mono(1268, 372, 'erode r=2 发丝'), mono(1268, 446, 'dilate r=5 胖体'));
  return g;
}

interface CardSpec { cls: string; filter?: string; caption: [string, string]; build?: (g: SVGGElement, cx: number, cy: number) => void }

function cardsBand(): SVGGElement {
  const band = el('g', { id: 'ns-cards' });
  const glyph = (cx: number, cy: number, attrs: Attrs = {}) => el('text', { x: cx, y: cy + 20, 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 700, fill: 'currentColor', ...attrs }, '霓虹');
  const rectSupported = typeof CSS !== 'undefined' && CSS.supports('clip-path', 'rect(0 auto auto 0)');
  const specs: CardSpec[] = [
    { cls: 'card-1', filter: 'ns-f-outline', caption: ['dilate 4 → flood → comp out → merge', 'clip inset(6px round 12px)'] },
    { cls: 'card-2', filter: 'ns-f-threshold', caption: ['blur 4 → feFuncA discrete 0 1 → in', 'clip circle(46% at 50% 48%)'] },
    { cls: 'card-3', filter: 'ns-f-classic', caption: ['SA → blur 4 → offset 6 8 → in → merge', 'clip ellipse(48% 44%)'] },
    { cls: 'card-4', caption: ['offset dy5 → blur 6 → out SA → in → merge', 'clip polygon(… 缺角铭牌)'], build: (g, cx, cy) => {
      // inner shadow needs a filled shape to look recessed: plate + glyph share one SourceAlpha
      g.append(el('g', { filter: 'url(#ns-f-inner)' }, el('rect', { x: cx - 80, y: cy - 42, width: 160, height: 84, rx: 12, fill: '#5fb9e6' }), glyph(cx, cy, { fill: '#0b2230', 'font-size': 50 })));
    } },
    { cls: 'card-5', filter: 'ns-f-drop', caption: ['feDropShadow dx6 dy8 σ4 (≡ card 3)', 'clip path("M6 22 Q6 6 22 6 …")'] },
    { cls: 'card-6', caption: ['url(#tint) drop-shadow blur(.4px) · 换序小样', rectSupported ? 'clip rect(4px auto auto 4px)' : 'clip inset(4px) ← rect() 回退'], build: (g, cx, cy) => {
      g.append(glyph(cx, cy - 8, { class: 'chain-a' }));
      // reorder sample: the tint placed AFTER drop-shadow colours the shadow too
      g.append(mono(cx - 96, cy + 46, 'url()→shadow', { fill: '#8fd8ff' }), mono(cx + 10, cy + 46, 'shadow→url()', { fill: '#8fd8ff' }));
      g.append(el('text', { x: cx - 62, y: cy + 68, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: 'currentColor', class: 'chain-a' }, '霓虹'));
      g.append(el('text', { x: cx + 46, y: cy + 68, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: 'currentColor', class: 'chain-b' }, '霓虹'));
    } },
  ];
  specs.forEach((spec, i) => {
    const x = cardX(i), cx = x + CARD_W / 2, cy = CARD_Y + 76;
    const card = el('g', { class: `card ${spec.cls}`, 'data-card': i + 1 });
    card.append(el('rect', { x, y: CARD_Y, width: CARD_W, height: CARD_FACE_H, fill: '#0c1a26', 'fill-opacity': .94 }));
    if (spec.build) spec.build(card, cx, cy);
    else card.append(glyph(cx, cy, { filter: `url(#${spec.filter})` }));
    band.append(card);
    band.append(mono(x + 4, 634, `${i + 1} ${spec.caption[0]}`), mono(x + 4, 648, spec.caption[1], { fill: '#8fd8ff' }));
  });
  return band;
}

function groundBand(): SVGGElement {
  const g = el('g', { id: 'ns-ground' });
  g.append(el('rect', { x: 32, y: 668, width: 1336, height: 200, rx: 10, fill: 'url(#ns-g-asphalt)', 'fill-opacity': .94 }));
  // far ground fading with a plain CSS gradient mask — no <mask> element
  g.append(el('rect', { class: 'ground-far', x: 40, y: 672, width: 1320, height: 34, fill: 'url(#ns-g-far)' }));
  // three puddles: same two radial-gradient layers, three mask-composite operators
  (['puddle-sub', 'puddle-int', 'puddle-exc'] as const).forEach((cls, i) => {
    g.append(el('rect', { class: `puddle ${cls}`, x: 56 + i * 200, y: 700, width: 180, height: 130, fill: 'url(#ns-g-wet)' }));
  });
  // wet basin under the HTML reflection: the same <mask> the reflection uses, applied here as an SVG attribute
  g.append(el('rect', { x: 716, y: 700, width: 328, height: 150, fill: '#123344', mask: 'url(#ns-m-puddle)' }));
  // mask-mode pair: identical colour gradient read as alpha vs luminance
  g.append(el('rect', { class: 'patch patch-alpha', x: 1056, y: 704, width: 82, height: 64, fill: 'url(#ns-g-patch)' }));
  g.append(el('rect', { class: 'patch patch-lum', x: 1056, y: 782, width: 82, height: 64, fill: 'url(#ns-g-patch)' }));
  // rain: same drop URI tiled at 40px versus contained once; wall tile reused as a mask
  g.append(el('rect', { class: 'rain-tile', x: 1150, y: 704, width: 100, height: 142, fill: 'url(#ns-g-rain)' }));
  g.append(el('rect', { class: 'rain-one', x: 1262, y: 704, width: 98, height: 100, fill: 'url(#ns-g-rain)' }));
  g.append(el('rect', { class: 'rain-wall', x: 1262, y: 808, width: 98, height: 38, fill: '#4c7789' }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// Glow layer: the sign group. mix-blend-mode:screen is written on the nested <svg> ELEMENT itself, so the halo
// blends across the SVG/HTML boundary with the HTML wall behind it (concept:svg-blend-with-html-backdrop).
// ---------------------------------------------------------------------------------------------------------
function glowLayer(): SVGSVGElement {
  const svg = el('svg', { id: 'svg-glow', x: 0, y: 0, width: 1400, height: 900, viewBox: '0 0 1400 900', overflow: 'visible', style: 'mix-blend-mode:screen' });
  const sign = el('g', { id: 'ns-sign', filter: 'url(#ns-f-neon)', 'clip-path': 'url(#ns-clip-plate)', mask: 'url(#ns-m-tube-fade)' });
  // invisible padding rect: widens the objectBoundingBox so clip + mask leave room for the halo; alpha 0 so it adds no glow
  sign.append(el('rect', { x: 182, y: 122, width: 368, height: 228, fill: '#000', 'fill-opacity': 0 }));
  sign.append(tube({ transform: 'translate(226 166)' }));
  sign.append(el('text', { x: 366, y: 240, 'text-anchor': 'middle', 'font-size': 58, 'font-weight': 700, fill: 'currentColor' }, '霓虹'));
  sign.append(el('text', { x: 366, y: 284, 'text-anchor': 'middle', 'font-size': 20, 'letter-spacing': 5, fill: 'currentColor' }, 'OPEN · 24H'));
  svg.append(sign);
  return svg;
}

// ---------------------------------------------------------------------------------------------------------
// UI layer: titles, annotations and the pointer torch that reveals the wiring wireframes.
// ---------------------------------------------------------------------------------------------------------
function uiLayer(): SVGGElement {
  const g = el('g', { id: 'svg-ui', 'pointer-events': 'none' });
  // title band
  g.append(el('text', { x: 48, y: 72, 'font-size': 26, 'font-weight': 700, fill: 'currentColor' }, '霓虹招牌工坊', el('tspan', { 'font-size': 15, 'font-weight': 400, fill: '#8fd8ff', dx: 14 }, 'Neon Sign Workshop · 手工接线的光晕、辉光、内阴影与投影')));
  g.append(mono(48, 90, 'filter:url(#ns-f-neon) · clip-path:url(#ns-clip-plate) · mask:url(#ns-m-tube-fade) — 同一枚滤镜 / 裁切 / 遮罩，<svg> 招牌与 HTML 价目板共用；辉光层 <svg style="mix-blend-mode:screen">', { fill: '#8fd8ff' }));
  // hover morph sample (triangle → hexagon, six vertices both) — in the ui layer but hit-testable
  g.append(el('rect', { class: 'morph-sample hit', x: 1318, y: 42, width: 40, height: 40, fill: '#ffd166', 'pointer-events': 'auto' }));
  g.append(label(1306, 90, 'hover: polygon() 三角→六边', { 'text-anchor': 'end' }));
  // bench annotations
  g.append(label(48, 128, '两界并置 · 同一枚 #ns-f-neon', { 'font-size': 12, 'font-weight': 700 }));
  g.append(label(48, 198, '背景不透明 → 胀的是整块 alpha ✗', { fill: '#ff8fc6' }));
  g.append(label(48, 266, '背景透明 → 胀的是字形 alpha ✓', { fill: '#8ff6ff' }));
  g.append(mono(48, 292, 'clipPathUnits / maskContentUnits'), mono(48, 305, '= objectBoundingBox：归一化坐标'), mono(48, 318, '同时套住 SVG bbox 与 HTML 盒'));
  g.append(label(540, 128, 'color-interpolation-filters', { 'font-size': 12, 'font-weight': 700 }));
  g.append(label(540, 212, 'sRGB（锁定）— 粉晕保持粉色', { fill: '#8ff6ff' }));
  g.append(label(540, 284, 'linearRGB（默认）— 晕更亮更白', { fill: '#ff8fc6' }));
  g.append(mono(540, 308, 'x=-45% y=-45% w=190% h=190%'), mono(540, 321, '默认 -10%/120% 会削掉外晕'));
  g.append(label(60, 450, 'A isolation:isolate — 条纹被挡在组外'), label(180, 450, 'B 不隔离 — 条纹透过 screen 可见', { x: 186 }));
  g.append(label(322, 380, '检验位', { 'font-size': 12, 'font-weight': 700 }), mono(322, 396, 'multiply 减色 → RGB+黑'), mono(322, 410, 'screen 加色 → 向白'), mono(322, 424, '霓虹 = 加色逻辑'));
  g.append(label(470, 450, 'multiply · 白灯箱'), label(586, 450, 'screen · 深色台面'));
  // jig + ruler headers
  g.append(label(1068, 122, '夹具三参照 · clip-path: inset(10%) <geometry-box>', { 'font-size': 12, 'font-weight': 700 }));
  g.append(label(1068, 302, '弯管半径尺 · feMorphology radius="x y"', { 'font-size': 12, 'font-weight': 700 }));
  // ground labels
  g.append(mono(48, 692, 'mask-image: linear-gradient(to bottom,#000 30%,transparent) — 远端地面渐隐，全程没有 <mask> 元素', { fill: '#8fd8ff' }));
  ['subtract → 单月牙', 'intersect → 透镜', 'exclude → 双月牙'].forEach((t, i) => g.append(mono(146 + i * 200, 848, t, { 'text-anchor': 'middle' })));
  g.append(mono(50, 862, 'mask-image: radial-gradient ×2 · mask-composite（-webkit-mask-composite: source-out / source-in / xor 并写）', { fill: '#8fd8ff' }));
  g.append(mono(716, 864, 'HTML 倒影 · mask: url(#ns-m-puddle) luminance, linear-gradient(...) alpha', { fill: '#8fd8ff' }));
  g.append(label(1056, 778, 'mask-mode: alpha'), label(1056, 858, 'mask-mode: luminance'));
  g.append(mono(1056, 692, '同一张遮罩，两种读法', { fill: '#8fd8ff' }));
  g.append(mono(1150, 692, 'mask-size 40px · repeat', { fill: '#8fd8ff' }), mono(1262, 692, 'contain · no-repeat', { fill: '#8fd8ff' }));
  g.append(label(1150, 860, '雨点窗口：同一颗水滴 data-URI，尺度不同'));
  return g;
}

/** Torch content: dashed filter regions and wiring names, revealed through a scripted circle() clip. */
function torchLayer(): SVGGElement {
  const torch = el('g', { id: 'ns-torch', 'pointer-events': 'none', style: 'clip-path:circle(0px at 0px 0px)' });
  // padding rect: makes the reference box the whole stage so `circle(160px at Xpx Ypx)` is in stage coordinates
  torch.append(el('rect', { x: 0, y: 0, width: 1400, height: 900, fill: '#000', 'fill-opacity': 0 }));
  const wire = (x: number, y: number, w: number, h: number, txt: string) => {
    torch.append(el('rect', { x, y, width: w, height: h, fill: 'none', stroke: '#8ff6ff', 'stroke-width': 1, 'stroke-dasharray': '4 3', 'stroke-opacity': .8 }));
    torch.append(mono(x + 6, y + 13, txt, { fill: '#8ff6ff' }));
  };
  const wiring = ['SourceAlpha→fat→pink∘in→out(SA)', 'SourceAlpha→soft→hard(discrete)→in', 'SourceAlpha→blur→shifted→in→merge', 'SourceAlpha→shifted→soft→out(SA)→in', 'feDropShadow (single primitive)', 'CSS: url(#ns-f-tint) drop-shadow() blur()'];
  wiring.forEach((txt, i) => wire(cardX(i) + 4, CARD_Y + 4, CARD_W - 8, CARD_FACE_H - 8, txt));
  wire(732, 120, 296, 316, '.board bbox = objectBoundingBox');
  wire(599, 22, 562, 512, 'filter region -45%/-45% · 190%');
  wire(182, 122, 368, 228, '#ns-sign bbox (padding rect α=0)');
  return torch;
}

// ---------------------------------------------------------------------------------------------------------
export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-Hans');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'ns-title ns-desc');
  stage.append(el('title', { id: 'ns-title' }, '霓虹招牌工坊 — Neon Sign Workshop'));
  stage.append(el('desc', { id: 'ns-desc' }, '雨夜霓虹工坊：feMorphology 胀大 alpha 再经 feGaussianBlur 摊开成粉色外晕的共享滤镜，同时套在 SVG 招牌与 HTML 价目板上；六块做法卡对照描边、阈值光晕、四基元阴影链、内阴影、feDropShadow 与 CSS 滤镜链；夹具三参照与半径尺展示 geometry-box 与各向异性 radius；地面积水由 mask-composite、mask-mode、mask-size 切出。'));
  const style = el('style');
  style.textContent = stageCss();
  stage.append(style);
  stage.append(buildDefs());
  stage.append(wallLayer());
  stage.append(el('g', { id: 'svg-base' }, benchBase(), jigPanel(), rulerPanel(), cardsBand(), groundBand()));
  stage.append(worldHtmlLayer());
  stage.append(glowLayer());
  const ui = uiLayer();
  ui.append(torchLayer());
  stage.append(ui);

  // Pointer interaction (构造要点 16): one move edits the SHARED filter — sign and HTML board breathe together —
  // and the torch clip follows via style.clipPath (api:CSSStyleDeclaration.clipPath).
  const morph = stage.querySelector<SVGFEMorphologyElement>('#ns-morph')!;
  const halo = stage.querySelector<SVGFEGaussianBlurElement>('#ns-halo')!;
  const torch = stage.querySelector<SVGGElement>('#ns-torch')!;
  const onMove = (event: PointerEvent) => {
    const box = stage.getBoundingClientRect();
    const px = Math.max(0, Math.min(1400, (event.clientX - box.left) * 1400 / box.width));
    const py = Math.max(0, Math.min(900, (event.clientY - box.top) * 900 / box.height));
    morph.radiusX.baseVal = 1 + 8 * (px / 1400);           // api:SVGFEMorphologyElement.radiusX
    const v = 4 + 12 * (py / 900);
    halo.setStdDeviation(v, v);                              // api:SVGFEGaussianBlurElement.setStdDeviation
    torch.style.clipPath = `circle(160px at ${fmt(px, 1)}px ${fmt(py, 1)}px)`;
  };
  stage.addEventListener('pointermove', onMove);
  // synthetic first move so the still frame has a meaningful pose (radiusX 6.6, σ 9.73, torch at (980,430))
  const box = stage.getBoundingClientRect();
  stage.dispatchEvent(new PointerEvent('pointermove', { clientX: box.left + 980 * box.width / 1400, clientY: box.top + 430 * box.height / 900, bubbles: true }));

  mark(stage,
    'concept:inline-svg-in-html', 'concept:svg-as-css-background-image', 'concept:svg-data-uri-encoding', 'css:font-face-data-uri',
    'api:CSSStyleDeclaration.clipPath', 'concept:clip-path-html-to-svg-reference', 'concept:clip-path-shape-transition',
    'concept:mask-html-to-svg-reference', 'css:clip-path-basic-shapes', 'css:clip-path-geometry-box',
    'css:mask-composite', 'css:mask-image', 'css:mask-layers', 'css:mask-mode', 'css:mask-size', 'css:mask-repeat', 'concept:mask-image-svg-url',
    'concept:classic-drop-shadow-chain', 'concept:filter-input-wiring', 'concept:inner-shadow-technique', 'concept:outline-stroke-via-alpha-dilate',
    'css:filter-chaining', 'css:filter-functions-on-svg', 'css:filter-transition', 'css:svg-filter-on-html-element',
    'concept:morphology-outline-stroke', 'concept:neon-glow-morphology', 'concept:animate-filter-stddeviation',
    'api:SVGFEGaussianBlurElement.setStdDeviation', 'api:SVGFEMorphologyElement.radiusX', 'concept:morphology-thicken-text',
    'concept:morphology-zero-radius', 'concept:smil-animate-morphology-radius', 'concept:svg-blend-with-html-backdrop');

  if (isExport()) {
    // deliberate still: SMIL at 1.6 s (flicker mid-pulse, press still resting at "10 0"), CSS animations at 2.4 s
    stage.pauseAnimations();
    stage.setCurrentTime(1.6);
    document.getAnimations().forEach(animation => { animation.currentTime = 2400; animation.pause(); });
  }
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  window.__sceneReady = true;
}
