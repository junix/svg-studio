// auroral-spectrograph — deck panels (docs/svg-feature-demos.md §3.5, 构造要点 10–14).
// C1 grating calibration card (vectors / spread / offsets), C2 transmittance & stop-colour panel, C3 focal calibration
// spheres, C4 96-wedge conic emulation. Each builder appends its paint servers to the shared <defs> and returns a <g>.
import { el, fragment, FONT_MONO, FONT_CJK, type Attrs } from './lib';

const f = (n: number, d = 2) => n.toFixed(d).replace(/\.?0+$/, '') || '0';
const label = (x: number, y: number, str: string, attrs: Attrs = {}) => el('text', { x, y, 'font-size': 11, fill: '#9fb3c8', 'font-family': FONT_CJK, ...attrs }, str);
const mono = (x: number, y: number, str: string, attrs: Attrs = {}) => label(x, y, str, { 'font-family': FONT_MONO, ...attrs });

export const panelTitle = (x: number, y: number, str: string): SVGTextElement =>
  el('text', { x, y, 'font-size': 11, 'font-family': FONT_CJK, fill: '#dbe7f3', 'letter-spacing': 0.6 }, str);

/** Opaque calibration ramp (same hues as the aurora master, no transparent ends) so pad plateaus, zero-length fills and
 *  repeat seams are visible on the card. Its children are href-only, exactly like the sky gradients. */
const CARD_STOPS = `
  <linearGradient id="cardStops" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#3fe08a"/><stop offset="0.3" stop-color="#5cffb1"/><stop offset="0.55" stop-color="#35d6c9"/>
    <stop offset="0.78" stop-color="#6f7dff"/><stop offset="1" stop-color="#ff5f7e"/>
  </linearGradient>
  <linearGradient id="crestDemo" href="#cardStops" xlink:href="#cardStops" x1="0" y1="0" x2="1" y2="0"/>
  <pattern id="padDots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#dbe7f3" fill-opacity="0.55"/></pattern>`;

// ---------------------------------------------------------------------------------------------------------
// C1 · grating calibration card: x 72–436, two columns of 7 splines (176×14, pitch 30, first row y=626).
// ---------------------------------------------------------------------------------------------------------
interface Spline { id: string; attrs: Attrs; vector?: [number, number, number, number]; pad?: [number, number]; note: string; stops?: string }
export function buildCalibrationCard(defs: SVGDefsElement): SVGGElement {
  defs.append(fragment(CARD_STOPS));
  const g = el('g', { id: 'calibrationCard' });
  const W = 176, H = 14, ROW = 30, Y0 = 626;
  const href = (extra: Attrs): Attrs => ({ href: '#cardStops', 'xlink:href': '#cardStops', ...extra });
  // Left column — at:linearGradient.x1 vectors; every ramp is href-only.
  const left: Spline[] = [
    { id: 'card-h', attrs: href({ x1: 0, y1: 0, x2: 1, y2: 0 }), vector: [0, 0, 1, 0], note: 'x1=0 x2=1 · 水平' },
    { id: 'card-v', attrs: href({ x1: 0, y1: 0, x2: 0, y2: 1 }), vector: [0, 0, 0, 1], note: 'y1=0 y2=1 · 竖直' },
    { id: 'card-diag', attrs: href({ x1: 0, y1: 0, x2: 1, y2: 1 }), vector: [0, 0, 1, 1], note: '(0,0)→(1,1) · 对角' },
    // av:linearGradient.spreadMethod=pad — vector ends at 50 %, the rest is the last stop's plateau (dotted)
    { id: 'card-pad50', attrs: href({ x1: 0, y1: 0, x2: '50%', y2: 0, spreadMethod: 'pad' }), vector: [0, 0, 0.5, 0], pad: [0.5, 1], note: 'x2=50% pad · 右半平台' },
    // concept:zero-length-gradient-vector — solid last-stop colour (opaque here, unlike sky band 37)
    { id: 'card-zero', attrs: href({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 }), note: 'x1=x2 y1=y2 · 零长→末 stop 纯色' },
    // at:linearGradient.gradientTransform on an untransformed shape
    { id: 'card-skew', attrs: href({ x1: 0, y1: 0, x2: 1, y2: 0, gradientTransform: 'skewX(24)' }), vector: [0, 0, 1, 0], note: 'gradientTransform=skewX(24)' },
    { id: 'card-rev', attrs: href({ x1: 1, y1: 0, x2: 0, y2: 0 }), vector: [1, 0, 0, 0], note: 'x1=1 x2=0 · 反向' },
  ];
  // Right column — spread methods on one short vector, then stop-offset syntax and ordering (own stops where needed).
  const right: Spline[] = [
    // av:linearGradient.spreadMethod=repeat — 8 % vector → 12.5 sawtooth bands with hard wrap seams
    { id: 'card-repeat', attrs: href({ x1: 0, y1: 0, x2: 0.08, y2: 0, spreadMethod: 'repeat' }), vector: [0, 0, 0.08, 0], note: 'repeat · x2=.08 · 硬边锯齿' },
    { id: 'card-reflect', attrs: href({ x1: 0, y1: 0, x2: 0.08, y2: 0, spreadMethod: 'reflect' }), vector: [0, 0, 0.08, 0], note: 'reflect · 同向量 · 镜像无缝' },
    { id: 'card-padshort', attrs: href({ x1: 0, y1: 0, x2: 0.08, y2: 0, spreadMethod: 'pad' }), vector: [0, 0, 0.08, 0], pad: [0.08, 1], note: 'pad · 8% 后为末 stop 平台' },
    { id: 'card-offsets', attrs: {}, note: 'offset=0.5 ≡ offset=50% · 孪生' },
    // concept:hard-stop-banding — paired stops at identical offsets: a filter cut-on
    { id: 'card-hard', attrs: { x1: 0, y1: 0, x2: 1, y2: 0 }, note: '同 offset 双 stop · 滤光片 cut-on', stops: '<stop offset="0" stop-color="#3fe08a"/><stop offset="0.3333" stop-color="#3fe08a"/><stop offset="0.3333" stop-color="#6f7dff"/><stop offset="0.6667" stop-color="#6f7dff"/><stop offset="0.6667" stop-color="#ff5f7e"/><stop offset="1" stop-color="#ff5f7e"/>' },
    // concept:stop-offset-clamping — -0.2→0, 1.3→1, and 0.6 after 0.9 is forced up to 0.9 (hard edge at 90 %)
    { id: 'card-clamp', attrs: { x1: 0, y1: 0, x2: 1, y2: 0 }, note: 'offset −.2 / .9 / .6 / 1.3 → 夹紧·单调', stops: '<stop offset="-0.2" stop-color="#3fe08a"/><stop offset="0.9" stop-color="#35d6c9"/><stop offset="0.6" stop-color="#6f7dff"/><stop offset="1.3" stop-color="#ff5f7e"/>' },
    { id: 'card-bunch', attrs: { x1: 0, y1: 0, x2: 1, y2: 0 }, note: 'offset 0 · .88 · .92 · 1 · 非对称', stops: '<stop offset="0" stop-color="#3fe08a"/><stop offset="0.88" stop-color="#35d6c9"/><stop offset="0.92" stop-color="#6f7dff"/><stop offset="1" stop-color="#ff5f7e"/>' },
  ];
  // at:stop.offset — number and percentage syntaxes are equivalent
  defs.append(fragment(`
    <linearGradient id="card-off-num" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3fe08a"/><stop offset="0.5" stop-color="#6f7dff"/><stop offset="1" stop-color="#ff5f7e"/></linearGradient>
    <linearGradient id="card-off-pct" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#3fe08a"/><stop offset="50%" stop-color="#6f7dff"/><stop offset="100%" stop-color="#ff5f7e"/></linearGradient>`));

  const arrow = (x: number, y: number, v: [number, number, number, number]) => {
    const [ax, ay, bx, by] = [x + 3 + v[0] * (W - 6), y + 2 + v[1] * (H - 4), x + 3 + v[2] * (W - 6), y + 2 + v[3] * (H - 4)];
    const ang = Math.atan2(by - ay, bx - ax), hx = bx - 5 * Math.cos(ang), hy = by - 5 * Math.sin(ang), nx = -Math.sin(ang) * 2.4, ny = Math.cos(ang) * 2.4;
    return el('g', { stroke: '#ffffff', 'stroke-opacity': 0.75, 'stroke-width': 0.9, fill: '#ffffff', 'fill-opacity': 0.75 },
      el('line', { x1: f(ax, 1), y1: f(ay, 1), x2: f(hx, 1), y2: f(hy, 1) }),
      el('polygon', { points: `${f(bx, 1)},${f(by, 1)} ${f(hx + nx, 1)},${f(hy + ny, 1)} ${f(hx - nx, 1)},${f(hy - ny, 1)}`, stroke: 'none' }));
  };
  const column = (x: number, rows: Spline[]) => {
    rows.forEach((s, k) => {
      const y = Y0 + k * ROW;
      if (s.id === 'card-offsets') {
        g.append(el('rect', { x, y, width: 84, height: H, fill: 'url(#card-off-num)' }), el('rect', { x: x + 92, y, width: 84, height: H, fill: 'url(#card-off-pct)' }));
        g.append(mono(x + 42, y + 10, '0.5', { 'text-anchor': 'middle', fill: '#08131c', 'font-size': 10 }), mono(x + 134, y + 10, '50%', { 'text-anchor': 'middle', fill: '#08131c', 'font-size': 10 }));
      } else {
        const grad = el('linearGradient', { id: s.id, ...s.attrs });
        if (s.stops) grad.append(fragment(s.stops));
        defs.append(grad);
        g.append(el('rect', { x, y, width: W, height: H, fill: `url(#${s.id})` }));
        if (s.pad) g.append(el('rect', { x: x + s.pad[0] * W, y, width: (s.pad[1] - s.pad[0]) * W, height: H, fill: 'url(#padDots)' }));
        if (s.vector) g.append(arrow(x, y, s.vector));
        else g.append(el('circle', { cx: x + W / 2, cy: y + H / 2, r: 2.2, fill: '#ffffff', 'fill-opacity': 0.85 }));
      }
      g.append(label(x, y + 25, s.note));
    });
  };
  column(72, left);
  column(260, right);
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// C2 · transmittance & stop-colour panel: x 456–700 (content 466–690).
// ---------------------------------------------------------------------------------------------------------
export function buildTransmittancePanel(defs: SVGDefsElement): SVGGElement {
  const g = el('g', { id: 'transmittancePanel' });
  const X = 466;
  // pr:stop-opacity — one hue, opacity 1 → 0 over a hand-drawn 16×3 checkerboard
  defs.append(fragment(`
    <linearGradient id="transRamp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5cffb1" stop-opacity="1"/><stop offset="1" stop-color="#5cffb1" stop-opacity="0"/></linearGradient>
    <!-- concept:premultiplied-transparent-stop — fading to transparent BLACK vs transparent SAME HUE renders identically -->
    <linearGradient id="fadeBlack" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5f7e"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>
    <linearGradient id="fadeSame" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5f7e"/><stop offset="1" stop-color="#ff5f7e" stop-opacity="0"/></linearGradient>
    <!-- pr:stop-color four ways: attribute, inline style, stylesheet class, currentcolor from an ancestor's color -->
    <linearGradient id="scAttr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5cffb1"/><stop offset="1" stop-color="#6f7dff"/></linearGradient>
    <linearGradient id="scStyle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:#5cffb1"/><stop offset="1" style="stop-color:#6f7dff"/></linearGradient>
    <linearGradient id="scClass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="ox-line"/><stop offset="1" class="n-line"/></linearGradient>
    <g color="#5cffb1"><linearGradient id="scCurrent" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="currentcolor"/><stop offset="1" stop-color="#6f7dff"/></linearGradient></g>
    <!-- css:gradient-stop-selectors + css:custom-properties-in-gradients: attribute-less stops coloured by
         #nightRamp stop:nth-child(n) { stop-color: var(--line-…) }, the variables set by .theme-night / .theme-red -->
    <g class="theme-night"><linearGradient id="nightRamp" class="stop-ramp" x1="0" y1="0" x2="1" y2="0"><stop offset="0"/><stop offset="0.25"/><stop offset="0.5"/><stop offset="0.75"/><stop offset="1"/></linearGradient></g>
    <g class="theme-red"><linearGradient id="nightRampRed" class="stop-ramp" x1="0" y1="0" x2="1" y2="0"><stop offset="0"/><stop offset="0.25"/><stop offset="0.5"/><stop offset="0.75"/><stop offset="1"/></linearGradient></g>`));

  for (let c = 0; c < 16; c++) for (let r = 0; r < 3; r++)
    g.append(el('rect', { x: X + c * 14, y: 626 + r * 14, width: 14, height: 14, fill: (c + r) % 2 ? '#233553' : '#16233a' }));
  g.append(el('rect', { id: 'transCover', x: X, y: 626, width: 224, height: 42, fill: 'url(#transRamp)' }));
  g.append(label(X, 680, 'stop-opacity 1 → 0 · 检验格逐格透出'));

  g.append(el('rect', { x: X, y: 692, width: 60, height: 14, fill: 'url(#fadeBlack)' }), el('rect', { x: X + 70, y: 692, width: 60, height: 14, fill: 'url(#fadeSame)' }));
  g.append(mono(X, 718, '→ black/0', { 'font-size': 10 }), mono(X + 70, 718, '→ same/0', { 'font-size': 10 }));
  g.append(label(X + 142, 703, '预乘插值 · 无灰边差', { fill: '#dbe7f3' }));

  const ramps: Array<[string, string]> = [['scAttr', 'stop-color="…" 属性'], ['scStyle', 'style="stop-color:…"'], ['scClass', '<style> .ox-line 类'], ['scCurrent', 'currentcolor ← g color']];
  ramps.forEach(([id, note], i) => {
    const x = X + (i % 2) * 116, y = 730 + Math.floor(i / 2) * 34;
    g.append(el('rect', { x, y, width: 108, height: 14, fill: `url(#${id})` }));
    g.append(label(x, y + 25, note));
  });
  g.append(el('rect', { id: 'nightSwatch', x: X, y: 800, width: 108, height: 14, fill: 'url(#nightRamp)' }), el('rect', { x: X + 116, y: 800, width: 108, height: 14, fill: 'url(#nightRampRed)' }));
  g.append(label(X, 825, '.theme-night var()'), label(X + 116, 825, '.theme-red 换主题'));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// C3 · focal calibration spheres: x 720–1006, r=30, columns 766/836/906/976, rows cy 700/800.
// ---------------------------------------------------------------------------------------------------------
export function buildSphereArray(defs: SVGDefsElement): SVGGElement {
  const g = el('g', { id: 'sphereArray' });
  // el:radialGradient master; the eight balls href it and only change geometry / spread (href inheritance works for radial too).
  defs.append(fragment(`
    <radialGradient id="sphereStops" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f4fffb"/><stop offset="0.22" stop-color="#5cffb1"/><stop offset="0.62" stop-color="#2b6f9e"/><stop offset="1" stop-color="#0a1626"/>
    </radialGradient>
    <radialGradient id="calBase" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5"/>
    <!-- at:radialGradient.fx — highlight upper-left, rim still a full circle; pointer y rewrites fx/fy at runtime -->
    <radialGradient id="calGloss" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5" fx="0.34" fy="0.30"/>
    <!-- at:radialGradient.fr — solid inner disc of the first stop before the ramp begins (aperture); fr=0 twin beside it -->
    <radialGradient id="calAperture" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5" fr="0.38"/>
    <radialGradient id="calFr0" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5" fr="0"/>
    <!-- at:radialGradient.cx — centre in a corner, r shrunk: rings off-centre, last stop pads the rest -->
    <radialGradient id="calOffset" href="#sphereStops" xlink:href="#sphereStops" cx="0.18" cy="0.18" r="0.25"/>
    <!-- av:radialGradient.spreadMethod=reflect / =repeat with a focal offset: Fabry–Pérot fringes, eccentric toward fx -->
    <radialGradient id="calEtalon" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.16" fx="0.38" fy="0.5" spreadMethod="reflect"/>
    <radialGradient id="calEtalonRepeat" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.16" fx="0.38" fy="0.5" spreadMethod="repeat"/>
    <!-- concept:focal-point-outside-circle — focal point beyond r is clamped onto the rim: highlight drawn into a comet tail -->
    <radialGradient id="calFlare" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5" fx="0.95" fy="0.05"/>`));
  const balls: Array<[string, string]> = [
    ['calBase', 'cx cy r .5'], ['calGloss', 'fx.34 fy.30'], ['calAperture', 'fr=.38 光阑'], ['calFr0', 'fr=0 孪生'],
    ['calOffset', 'c=.18 r=.25'], ['calEtalon', 'reflect fx.38'], ['calEtalonRepeat', 'repeat fx.38'], ['calFlare', 'fx.95 fy.05'],
  ];
  balls.forEach(([id, note], i) => {
    const cx = 766 + (i % 4) * 70, cy = i < 4 ? 700 : 800;
    g.append(el('circle', { id: `ball-${id}`, cx, cy, r: 30, fill: `url(#${id})`, stroke: '#5b6b82', 'stroke-opacity': 0.7, 'stroke-width': 1 }));
    g.append(el('circle', { cx: cx - 30, cy: cy - 30, r: 7, fill: '#0a1626', stroke: '#5b6b82', 'stroke-width': 0.8 }));
    g.append(mono(cx - 30, cy - 26.5, String(i + 1), { 'text-anchor': 'middle', fill: '#dbe7f3', 'font-size': 10 }));
    g.append(label(cx, cy + 44, note, { 'text-anchor': 'middle' }));
  });
  g.append(label(720, 640, '1 基准 · 2 光泽 · 5 偏心 · 6/7 干涉环 · 8 焦点越界', { fill: '#7f93aa' }));
  g.append(label(720, 656, 'fr 不被支持时 3 退化为 4 · 两球外缘直径相同', { fill: '#7f93aa' }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// C4 · conic emulation: 96 wedges, centre (1188,738), r 44–110, 8° zero-order gap at the top.
// ---------------------------------------------------------------------------------------------------------
export function buildColourWheel(defs: SVGDefsElement): SVGGElement {
  const g = el('g', { id: 'colourWheel' });
  const CX = 1188, CY = 738, R_IN = 44, R_OUT = 110, R_MID = 77, N = 96, SPAN = 352, GAP = 8;
  const step = SPAN / N, S = (2 * Math.PI * R_MID) / N, O0 = 0.12, O1 = 0.86, L = (N * S) / (O1 - O0);
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const pt = (r: number, deg: number) => `${f(CX + r * Math.cos(rad(deg)), 2)} ${f(CY + r * Math.sin(rad(deg)), 2)}`;
  const wedges = el('g', { id: 'wedges' });
  for (let k = 0; k < N; k++) {
    const a0 = -90 + GAP / 2 + k * step, a1 = a0 + step;
    const e0 = a0 - (k ? 0.175 : 0), e1 = a1 + (k < N - 1 ? 0.175 : 0); // 0.35° overlap hides antialiasing seams
    const d = `M${pt(R_IN, e0)} L${pt(R_OUT, e0)} A${R_OUT} ${R_OUT} 0 0 1 ${pt(R_OUT, e1)} L${pt(R_IN, e1)} A${R_IN} ${R_IN} 0 0 0 ${pt(R_IN, e0)} Z`;
    // concept:conic-gradient-emulation — wedge k is placed on slice k of one long userSpaceOnUse vector tangent to its bisector,
    // so neighbouring wedge boundaries share a colour; all 96 gradients href the master and breathe with the sky.
    const phi = rad((a0 + a1) / 2), cx = CX + R_MID * Math.cos(phi), cy = CY + R_MID * Math.sin(phi), ux = -Math.sin(phi), uy = Math.cos(phi);
    const along = (O0 + ((k + 0.5) / N) * (O1 - O0)) * L;
    const x1 = cx - along * ux, y1 = cy - along * uy;
    defs.append(el('linearGradient', { id: `wedge-${k}`, href: '#auroraStops', 'xlink:href': '#auroraStops', gradientUnits: 'userSpaceOnUse', x1: f(x1, 2), y1: f(y1, 2), x2: f(x1 + L * ux, 2), y2: f(y1 + L * uy, 2) }));
    wedges.append(el('path', { d, fill: `url(#wedge-${k})` }));
  }
  g.append(wedges);
  // hub: radial gradient with a focal radius (solid core, then ramp)
  defs.append(fragment('<radialGradient id="hubGrad" href="#sphereStops" xlink:href="#sphereStops" cx="0.5" cy="0.5" r="0.5" fr="0.3"/>'));
  g.append(el('circle', { cx: CX, cy: CY, r: R_IN - 4, fill: 'url(#hubGrad)', stroke: '#22344f', 'stroke-width': 2 }));
  // rim ticks + degree labels every 30°, zero-order mark in the gap
  const ticks = el('g', { stroke: '#5b6b82', 'stroke-width': 1 });
  for (let a = 0; a < 360; a += 30) {
    const deg = a - 90;
    ticks.append(el('line', { x1: f(CX + (R_OUT + 1) * Math.cos(rad(deg)), 1), y1: f(CY + (R_OUT + 1) * Math.sin(rad(deg)), 1), x2: f(CX + (R_OUT + 5) * Math.cos(rad(deg)), 1), y2: f(CY + (R_OUT + 5) * Math.sin(rad(deg)), 1) }));
    g.append(mono(Math.round(CX + 116 * Math.cos(rad(deg))), Math.round(CY + 116 * Math.sin(rad(deg))), `${a}°`, { 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: a ? '#7f93aa' : '#dbe7f3', 'font-size': 10 }));
  }
  g.append(ticks);
  g.append(el('line', { x1: CX, y1: CY - R_IN, x2: CX, y2: CY - R_OUT, stroke: '#dbe7f3', 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }));
  return g;
}
