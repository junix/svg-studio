// auroral-spectrograph — 极光分光台 (docs/svg-feature-demos.md §3.5)
// How far can one set of gradient <stop>s be pushed? A single master ramp (#auroraStops, 7 stops, the only aurora
// colours in the file) is referenced by href from 44 curtain gradients, 44 crest-line strokes, 96 colour-wheel wedges,
// the dispersion spectrum and the gradient-filled title/labels. SMIL only pushes the master's stop offsets/colours,
// so the whole picture breathes in phase. Layout: sky y 40–470 (curtains), deck y 470–860 (spectrum + four panels).
import { el, fragment, mark, mulberry32, isExport, freezeAt, FONT_SERIF, FONT_SANS, FONT_MONO, FONT_CJK, type Attrs } from './lib';
import { buildCalibrationCard, buildTransmittancePanel, buildSphereArray, buildColourWheel, panelTitle } from './auroral-spectrograph-deck';

const SKY_TOP = 84, SKY_BOT = 466, SKY_H = SKY_BOT - SKY_TOP;
const SPEC_X0 = 72, SPEC_X1 = 1328, SPEC_BASE = 556, SPEC_TOP = 486;
const BAR_W = 18, BAR_PITCH = 19.6, BAR_COUNT = 64;
const FREEZE_T = 4.2; // export still frame: curtains fattest, sweep highlight ~2/3 along the band

type Family = 'A' | 'B' | 'C' | 'D' | 'Z';
interface Band { i: number; x0: number; w: number; A: number; k: number; phi: number; fam: Family }

const lambdaAt = (x: number) => 400 + ((x - SPEC_X0) / (SPEC_X1 - SPEC_X0)) * 280; // 400–680 nm across the band
const xAtLambda = (nm: number) => SPEC_X0 + ((nm - 400) / 280) * (SPEC_X1 - SPEC_X0);
const gauss = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
/** Synthetic auroral emission spectrum: 427.8 nm N2+, 557.7 nm O(1S), 630.0 nm O(1D) on a weak continuum. */
const intensity = (nm: number) => Math.min(1, 0.10 + 0.05 * gauss(nm, 520, 90) + 0.48 * gauss(nm, 427.8, 8) + 1.0 * gauss(nm, 557.7, 11) + 0.58 * gauss(nm, 630.0, 20));
const barHeight = (nm: number) => 6 + 62 * intensity(nm);
const f = (n: number, d = 2) => n.toFixed(d).replace(/\.?0+$/, '') || '0';

const label = (x: number, y: number, str: string, attrs: Attrs = {}) => el('text', { x, y, 'font-size': 11, fill: '#9fb3c8', ...attrs }, str);
/** Dark halo for text drawn over the curtains (stroke painted first, fill on top). */
const HALO: Attrs = { stroke: '#060b14', 'stroke-width': 3, 'stroke-linejoin': 'round', 'paint-order': 'stroke' };

// ---------------------------------------------------------------------------------------------------------
// Curtain geometry: the fold x(t) = x0 + A·sin(2πk t + φ) sampled exactly as 3 Hermite cubics per edge.
// ---------------------------------------------------------------------------------------------------------
function waveSegments(xc: number, A: number, k: number, phi: number, ts: number[]): string {
  const xAt = (t: number) => xc + A * Math.sin(2 * Math.PI * k * t + phi);
  const dxAt = (t: number) => A * 2 * Math.PI * k * Math.cos(2 * Math.PI * k * t + phi);
  const yAt = (t: number) => SKY_TOP + SKY_H * t;
  let d = '';
  for (let s = 0; s + 1 < ts.length; s++) {
    const ta = ts[s], tb = ts[s + 1], dt = tb - ta;
    d += ` C${f(xAt(ta) + dxAt(ta) * dt / 3, 1)} ${f(yAt(ta) + SKY_H * dt / 3, 1)} ${f(xAt(tb) - dxAt(tb) * dt / 3, 1)} ${f(yAt(tb) - SKY_H * dt / 3, 1)} ${f(xAt(tb), 1)} ${f(yAt(tb), 1)}`;
  }
  return d;
}
const DOWN = [0, 1 / 3, 2 / 3, 1], UP = [1, 2 / 3, 1 / 3, 0];
function bandPath(b: Band): string {
  const left = b.x0 - b.w / 2, right = b.x0 + b.w / 2;
  const xl = left + b.A * Math.sin(b.phi);
  const xr = right + b.A * 0.85 * Math.sin(2 * Math.PI * b.k + b.phi + 0.35);
  return `M${f(xl, 1)} ${SKY_TOP}${waveSegments(left, b.A, b.k, b.phi, DOWN)} L${f(xr, 1)} ${SKY_BOT}${waveSegments(right, b.A * 0.85, b.k, b.phi + 0.35, UP)} Z`;
}
function crestPath(b: Band): string {
  return `M${f(b.x0 + b.A * Math.sin(b.phi), 1)} ${SKY_TOP}${waveSegments(b.x0, b.A, b.k, b.phi, DOWN)}`;
}
/** Fold tangent angle (degrees from vertical) at the band midpoint — the C family's gradientTransform rotation. */
const foldAngle = (b: Band) => (Math.atan((b.A * 2 * Math.PI * b.k * Math.cos(Math.PI * b.k + b.phi)) / SKY_H) * 180) / Math.PI;

function makeBands(): Band[] {
  const rnd = mulberry32(0x5eed);
  const bands: Band[] = [];
  for (let i = 0; i < 44; i++) {
    // Four vector families by i%5 (A/B/C/B/D) → 18 B (the reflect protagonists) after two overrides; band 37 (i=36) degenerate.
    let fam: Family = (['A', 'B', 'C', 'B', 'D'] as Family[])[i % 5];
    if (i === 36) fam = 'Z';
    if (i === 35) fam = 'B';
    if (i === 37) fam = 'D'; // a pad plateau right next to the degenerate band: "plateau" ≠ "degenerate"
    const edge = i < 2 || i > 41 ? 0.5 : 1; // keep the outer bands inside the plate
    bands.push({ i, x0: 100 + i * 28 + 6 * Math.sin(1.7 * i), w: 22 + 34 * rnd(), A: (14 + 32 * rnd()) * edge, k: 1.2 + 1.2 * rnd(), phi: rnd() * Math.PI * 2, fam });
  }
  return bands;
}

// ---------------------------------------------------------------------------------------------------------
// <defs>: the master ramp, every href-only child gradient, the sweep, plate, clip.
// ---------------------------------------------------------------------------------------------------------
function buildDefs(bands: Band[]): SVGDefsElement {
  const defs = el('defs', { id: 'defs' });
  // el:linearGradient / el:stop / at:stop.offset / pr:stop-color / pr:stop-opacity — the ONE aurora stop list.
  // Vector bottom→top (y1=1 → y2=0): transparent horizon, 557.7 nm green low, 427.8 nm violet, 630.0 nm red high, transparent zenith.
  // concept:smil-animated-stops / concept:animate-gradient-stop / at:animate.values — stops 2/4/6 slide (9 s/11 s/13 s);
  // concept:animate-color — stop 2 cycles hex → hex → named (seagreen) → hex over 17 s. Everything that hrefs this ramp follows.
  defs.append(fragment(`
    <linearGradient id="auroraStops" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#071018" stop-opacity="0"/>
      <stop offset="0.12" stop-color="#3fe08a" stop-opacity="0.85">
        <animate attributeName="offset" values="0.12;0.06;0.19;0.09;0.12" dur="9s" calcMode="linear" repeatCount="indefinite"/>
        <animate attributeName="stop-color" values="#3fe08a;#5cffb1;seagreen;#3fe08a" dur="17s" calcMode="linear" repeatCount="indefinite"/>
      </stop>
      <stop offset="0.34" stop-color="#5cffb1" stop-opacity="0.95"/>
      <stop offset="0.52" stop-color="#35d6c9" stop-opacity="0.80">
        <animate attributeName="offset" values="0.52;0.46;0.61;0.48;0.52" dur="11s" calcMode="linear" repeatCount="indefinite"/>
      </stop>
      <stop offset="0.70" stop-color="#6f7dff" stop-opacity="0.60"/>
      <stop offset="0.86" stop-color="#ff5f7e" stop-opacity="0.45">
        <animate attributeName="offset" values="0.86;0.80;0.92;0.83;0.86" dur="13s" calcMode="linear" repeatCount="indefinite"/>
      </stop>
      <stop offset="1" stop-color="#ff2f6d" stop-opacity="0"/>
    </linearGradient>

    <!-- instrument plate: the only backdrop; 40 px margins + rounded corners stay alpha 0 -->
    <linearGradient id="deckPlate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a1626"/><stop offset="1" stop-color="#060b14"/>
    </linearGradient>
    <clipPath id="skyClip"><rect x="40" y="40" width="1320" height="430" rx="22"/></clipPath>

    <!-- at:linearGradient.href — no stops, own vectors. Horizontal ramps overshoot the bbox (-0.15…1.15) so the
         transparent end stops of the master fall outside the glyphs / stroke. concept:gradient-on-stroke (crestRamp),
         concept:gradient-on-text / concept:text-gradient-fill (titleRamp, labelRamp). -->
    <linearGradient id="crestRamp" href="#auroraStops" xlink:href="#auroraStops" x1="-0.15" y1="0" x2="1.15" y2="0"/>
    <linearGradient id="titleRamp" href="#auroraStops" xlink:href="#auroraStops" x1="-0.15" y1="0" x2="1.15" y2="0"/>
    <linearGradient id="labelRamp" href="#auroraStops" xlink:href="#auroraStops" x1="-0.25" y1="0" x2="1.25" y2="0"/>

    <!-- av:linearGradient.gradientUnits=userSpaceOnUse — 64 separate bars sample one canvas-wide vector (0…1400 so the
         band 72…1328 sits at offsets .05….95); its objectBoundingBox twin makes every bar run the full ramp. -->
    <linearGradient id="dispersionUS" href="#auroraStops" xlink:href="#auroraStops" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1400" y2="0"/>
    <linearGradient id="dispersionBB" href="#auroraStops" xlink:href="#auroraStops" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"/>

    <!-- #sweep: the only linear gradient in the sky/spectrum with its own stops. concept:animated-gradient-vector — an
         animateTransform on gradientTransform sweeps the highlight; the middle stop's offset AND colour animate at the same time. -->
    <linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="420" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.35">
        <animate attributeName="offset" values="0.38;0.62;0.38" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="stop-color" values="#ffffff;#bff5ff;#ffffff" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-420 0;1400 0" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
  `));

  // One href-only gradient per curtain (构造要点 3/4). Children specify their own vector explicitly because unspecified
  // attributes are inherited from the master (whose vector is vertical).
  for (const b of bands) {
    const attrs: Attrs = { id: `curtain-${b.i}`, href: '#auroraStops', 'xlink:href': '#auroraStops', 'data-family': b.fam };
    switch (b.fam) {
      case 'A': break; // inherits the master's vertical vector: plain horizon→zenith ramp
      case 'B': // av:linearGradient.spreadMethod=reflect — a 16 %-wide horizontal vector mirrored into seamless green-red-green pleats
        Object.assign(attrs, { x1: 0.42, y1: 0, x2: 0.58, y2: 0, spreadMethod: 'reflect' }); break;
      case 'C': // at:linearGradient.gradientTransform — diagonal vector rotated to the fold tangent; the shape is untransformed
        Object.assign(attrs, { x1: 0, y1: 0, x2: 1, y2: 1, gradientTransform: `rotate(${f(foldAngle(b), 1)} 0.5 0.5)` }); break;
      case 'D': // x2 stops halfway (pad): the upper half shows the last stop — transparent, so the plate shows through
        Object.assign(attrs, { x1: 0, y1: 1, x2: 0, y2: '50%' }); break;
      case 'Z': // concept:zero-length-gradient-vector — x1=x2, y1=y2 paints the LAST stop (here #ff2f6d at opacity 0 → nothing)
        Object.assign(attrs, { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 }); break;
    }
    defs.append(el('linearGradient', attrs));
  }
  return defs;
}

// ---------------------------------------------------------------------------------------------------------
// Sky: 44 curtains + 44 crest strokes + degenerate-band note + the thick isolated crest.
// ---------------------------------------------------------------------------------------------------------
function buildSky(bands: Band[]): SVGGElement {
  const sky = el('g', { id: 'sky', 'clip-path': 'url(#skyClip)' });
  const curtains = el('g', { id: 'curtains' });
  const crests = el('g', { id: 'crests', fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 });
  const rnd = mulberry32(0xa0a0);
  for (const b of bands) {
    // pv:fill=url() — every curtain body is painted by its own href-only gradient
    curtains.append(el('path', { class: `curtain fam-${b.fam}`, d: bandPath(b), fill: `url(#curtain-${b.i})`, 'fill-opacity': b.fam === 'B' ? 0.8 : 0.6 }));
    if (b.fam === 'Z') curtains.append(el('path', { d: bandPath(b), fill: 'none', stroke: '#ff5f7e', 'stroke-opacity': 0.55, 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
    // concept:gradient-on-stroke — open crest path stroked with the horizontal href ramp
    crests.append(el('path', { d: crestPath(b), stroke: 'url(#crestRamp)', 'stroke-width': f(3 + 2 * rnd(), 1) }));
  }
  sky.append(curtains, crests);

  // Band 37 note (rotated along the band): zero-length vector → last stop → #ff2f6d @ opacity 0 → nothing is painted.
  const z = bands[36];
  const nx = z.x0 + z.w / 2 + 10, ny = 300;
  sky.append(el('text', { x: nx, y: ny, 'font-size': 11, fill: '#ff8fa6', 'font-family': FONT_CJK, transform: `rotate(-90 ${nx} ${ny})`, 'text-anchor': 'middle', ...HALO },
    '零色散：光栅失调 · x1=x2 y1=y2 → 末 stop (opacity 0)'));

  // Isolated thick crest (构造要点 5): objectBoundingBox excludes the stroke, so the round caps beyond the geometry
  // bbox show the first/last stop as solid pad plateaus. Uses the opaque card ramp so the plateaus are visible.
  const wave = 'M70 446 C110 426 130 466 170 446 S230 426 270 446 S296 452 300 446';
  sky.append(el('path', { d: wave, fill: 'none', stroke: '#060b14', 'stroke-width': 19, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 }));
  sky.append(el('path', { id: 'crest-demo', d: wave, fill: 'none', stroke: 'url(#crestDemo)', 'stroke-width': 14, 'stroke-linecap': 'round' }));
  sky.append(el('path', { d: 'M70 446 L300 446', fill: 'none', stroke: '#ffffff', 'stroke-opacity': 0.35, 'stroke-width': 0.8, 'stroke-dasharray': '2 3' }));
  sky.append(el('path', { d: 'M310 446 L326 436', fill: 'none', stroke: '#9fb3c8', 'stroke-width': 0.8 }));
  sky.append(label(330, 434, 'stroke-width 14 · bbox 不含描边 → 两端圆帽 = 首末 stop 的 pad 平台', { 'font-family': FONT_CJK, fill: '#dbe7f3', ...HALO }));
  return sky;
}

// ---------------------------------------------------------------------------------------------------------
// Deck top: Δλ cursor row, 64-bar spectrum (userSpaceOnUse) + objectBoundingBox twin, sweep, wavelength labels, slots.
// ---------------------------------------------------------------------------------------------------------
function buildSpectrum(defs: SVGDefsElement): SVGGElement {
  const g = el('g', { id: 'spectrum' });
  // Δλ cursor row (构造要点 7): translate keyframes share dur=9s with master stop 2 → readout shifts as the curtains breathe.
  const cursor = el('g', { id: 'cursorRow', 'font-family': FONT_SANS });
  cursor.append(label(SPEC_X0, 482, 'Δλ / nm', { fill: '#dbe7f3' }));
  for (let j = 0; j <= 8; j++) {
    const x = 140 + j * 148;
    cursor.append(el('line', { x1: x, y1: 478, x2: x, y2: 486, stroke: '#5b6b82', 'stroke-width': 1 }));
    cursor.append(label(x + 4, 482, `${j - 4 >= 0 ? '+' : '−'}${Math.abs(j - 4) * 20}`, { fill: '#7f93aa' }));
  }
  const peak = xAtLambda(557.7);
  cursor.append(el('polygon', { points: `${f(peak - 6, 1)},474 ${f(peak + 6, 1)},474 ${f(peak, 1)},485`, fill: '#5cffb1' }));
  cursor.append(fragment('<animateTransform attributeName="transform" type="translate" values="0 0;34 0;12 0;48 0;0 0" dur="9s" repeatCount="indefinite"/>'));
  g.append(cursor);

  // Main band: 64 bars sharing #dispersionUS — separate elements assemble one continuous dispersion.
  const bars = el('g', { id: 'specBars' });
  const twin = el('g', { id: 'specTwin' });
  let envelope = '';
  for (let k = 0; k < BAR_COUNT; k++) {
    const x = SPEC_X0 + k * BAR_PITCH, h = barHeight(lambdaAt(x + BAR_W / 2)), top = SPEC_BASE - h;
    bars.append(el('rect', { x: f(x, 1), y: f(top, 1), width: BAR_W, height: f(h, 1), fill: 'url(#dispersionUS)' }));
    // av:linearGradient.gradientUnits=objectBoundingBox twin: each 18 px bar runs the whole ramp on its own
    twin.append(el('rect', { x: f(x, 1), y: 562, width: BAR_W, height: 18, fill: 'url(#dispersionBB)' }));
    envelope += `M${f(x, 1)} ${SPEC_BASE}V${f(top, 1)}h${BAR_W}V${SPEC_BASE}Z`;
  }
  defs.append(el('clipPath', { id: 'specClip' }, el('path', { d: envelope })));
  g.append(el('line', { x1: SPEC_X0, y1: SPEC_BASE + 0.5, x2: SPEC_X1, y2: SPEC_BASE + 0.5, stroke: '#3a4a63', 'stroke-width': 1 }));
  g.append(bars);
  // sweep highlight clipped to the bar envelope
  g.append(el('rect', { x: SPEC_X0, y: SPEC_TOP - 2, width: SPEC_X1 - SPEC_X0, height: SPEC_BASE - SPEC_TOP + 2, fill: 'url(#sweep)', 'clip-path': 'url(#specClip)' }));
  g.append(twin);
  
  // Wavelength labels (构造要点 15): gradient text, one built from two tspans (bbox = whole <text>), leaders stroked with the same ramp.
  const lines: Array<[number, string, string | null]> = [[427.8, '427.8', null], [557.7, '557.7', null], [630.0, '630', '.0']];
  for (const [nm, main, tail] of lines) {
    const x = xAtLambda(nm);
    const t = el('text', { x: f(x + 5, 1), y: 597, 'font-size': 13, 'font-family': FONT_MONO, fill: 'url(#labelRamp)', class: 'wl' });
    if (tail === null) t.append(main); else t.append(el('tspan', {}, main), el('tspan', {}, tail));
    g.append(el('line', { x1: f(x, 1), y1: 586, x2: f(x, 1), y2: f(SPEC_BASE - barHeight(nm) - 2, 1), stroke: 'url(#labelRamp)', 'stroke-width': 1.2 }));
    g.append(t);
  }
  g.append(label(SPEC_X0, 597, 'λ / nm', { fill: '#7f93aa' }));
  g.append(label(250, 597, '上行 64 片共用 userSpaceOnUse 连续色散 · 下行 objectBoundingBox 孪生条各跑整个色阶', { fill: '#7f93aa', 'font-family': FONT_CJK }));

  // Filter slots (构造要点 11): concept:paint-server-fallback — `#slot-missing` exists but is an empty <g>, not a paint
  // server, so the reference is invalid: slot A falls back to #f2a154, slot B (no fallback) paints nothing.
  defs.append(el('g', { id: 'slot-missing' }));
  const slot = (x: number, fill: string, id: string) => el('rect', { id, x, y: 584, width: 26, height: 26, rx: 3, fill, stroke: '#5b6b82', 'stroke-width': 1, 'stroke-dasharray': '3 3' });
  g.append(slot(1268, 'url(#slot-missing) #f2a154', 'slotA'), slot(1310, 'url(#slot-missing)', 'slotB'));
  g.append(label(1281, 622, '备用色', { 'text-anchor': 'middle', 'font-family': FONT_CJK }), label(1323, 622, '空载', { 'text-anchor': 'middle', 'font-family': FONT_CJK }));
  g.append(label(1336, 608, 'url(#slot-missing) #f2a154 | none', { 'text-anchor': 'end', 'font-family': FONT_MONO, fill: '#7f93aa', 'font-size': 10.5 }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// Interaction (构造要点 16): pointer x → Δ offset on master stops 2–6, pointer y → #calGloss fx/fy.
// ---------------------------------------------------------------------------------------------------------
function wireInteraction(stage: SVGSVGElement, readout: SVGTextElement): void {
  const master = stage.querySelector<SVGLinearGradientElement>('#auroraStops')!;
  const stops = [...master.querySelectorAll<SVGStopElement>(':scope > stop')];
  const animates = [...master.querySelectorAll<SVGAnimateElement>('animate')];
  const gloss = stage.querySelector<SVGRadialGradientElement>('#calGloss')!;
  const base = stops.map(s => s.offset.baseVal);
  let engaged = false;
  // A paused timeline still applies animVal (and endElement() does not resample a paused clock), so while the pointer
  // is engaged the master's <animate> nodes are detached — baseVal is then what renders — and re-attached on leave.
  const parked = animates.map(a => ({ node: a, parent: a.parentNode as Element }));
  const setLength = (len: SVGAnimatedLength, v: number) => len.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, v);
  const stagePoint = (e: PointerEvent) => {
    const m = stage.getScreenCTM();
    const p = new DOMPoint(e.clientX, e.clientY);
    return m ? p.matrixTransform(m.inverse()) : p;
  };
  stage.addEventListener('pointermove', e => {
    if (!engaged) {
      engaged = true;
      stage.pauseAnimations();
      for (const { node } of parked) node.remove();
    }
    const p = stagePoint(e);
    const u = Math.max(-1, Math.min(1, (p.x / 1400) * 2 - 1));
    const delta = 0.12 * Math.sign(u) * Math.sqrt(Math.abs(u)); // ∈ [-0.12, +0.12], responsive near the centre
    // api:SVGStopElement.offset — write baseVal on stops 2…6 (same Δ keeps the list monotonic)
    for (let i = 1; i <= 5; i++) stops[i].offset.baseVal = Math.max(0, Math.min(1, base[i] + delta));
    // api:SVGRadialGradientElement.fx — highlight follows the pointer height
    const v = Math.max(0, Math.min(1, p.y / 900));
    const fx = 0.18 + 0.56 * v, fy = 0.14 + 0.56 * v;
    setLength(gloss.fx, fx); setLength(gloss.fy, fy);
    readout.textContent = `Δλ ${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)} · f=(${fx.toFixed(2)},${fy.toFixed(2)}) · stop[2] ${stops[1].offset.animVal.toFixed(3)}`;
  });
  stage.addEventListener('pointerleave', () => {
    if (!engaged) return;
    engaged = false;
    stops.forEach((s, i) => { s.offset.baseVal = base[i]; });
    setLength(gloss.fx, 0.34); setLength(gloss.fy, 0.30);
    readout.textContent = 'Δλ +0.00 · f=(0.34,0.30)';
    for (const { node, parent } of parked) parent.append(node);
    if (!isExport()) stage.unpauseAnimations();
  });
}

// ---------------------------------------------------------------------------------------------------------
export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-Hans');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'title desc');
  stage.append(el('title', { id: 'title' }, 'Auroral Spectrograph — 极光分光台'));
  stage.append(el('desc', { id: 'desc' }, 'A night-sky aurora of 44 folded gradient curtains above a spectrograph deck: every gradient in the scene references one master stop list (#auroraStops) by href; SMIL animates only the master, so curtains, colour wheel, spectrum and title breathe together.'));

  // css:gradient-stop-selectors / css:custom-properties-in-gradients live in this stylesheet (see deck module).
  stage.append(el('style', {}, `
    #stage text { font-family: ${FONT_SANS}; }
    #stage .mono { font-family: ${FONT_MONO}; }
    #stage .cjk { font-family: ${FONT_CJK}; }
    .ox-line { stop-color: #5cffb1; }
    .n-line { stop-color: #6f7dff; }
    .theme-night { --line-o1: #3fe08a; --line-o2: #5cffb1; --line-n1: #35d6c9; --line-n2: #6f7dff; --line-n3: #ff5f7e; }
    .theme-red { --line-o1: #ff2f6d; --line-o2: #ff5f7e; --line-n1: #ff9a3c; --line-n2: #ffd166; --line-n3: #fff1c1; }
    #nightRamp stop:nth-child(1), .stop-ramp stop:nth-child(1) { stop-color: var(--line-o1); }
    #nightRamp stop:nth-child(2), .stop-ramp stop:nth-child(2) { stop-color: var(--line-o2); }
    #nightRamp stop:nth-child(3), .stop-ramp stop:nth-child(3) { stop-color: var(--line-n1); }
    #nightRamp stop:nth-child(4), .stop-ramp stop:nth-child(4) { stop-color: var(--line-n2); }
    #nightRamp stop:nth-child(5), .stop-ramp stop:nth-child(5) { stop-color: var(--line-n3); }
  `));

  const bands = makeBands();
  const defs = buildDefs(bands);
  stage.append(defs);
  stage.append(el('rect', { id: 'plate', x: 40, y: 40, width: 1320, height: 820, rx: 22, fill: 'url(#deckPlate)' }));

  // panels first so their defs (sphere/card ramps, #crestDemo) exist before the sky references them
  const card = buildCalibrationCard(defs);
  const trans = buildTransmittancePanel(defs);
  const spheres = buildSphereArray(defs);
  const wheel = buildColourWheel(defs);

  stage.append(buildSky(bands));
  stage.append(el('line', { x1: 40, y1: 470.5, x2: 1360, y2: 470.5, stroke: '#22344f', 'stroke-width': 1 }));

  // Title (构造要点 15): serif headline filled by the href ramp, dark stroke painted first for legibility over the curtains.
  stage.append(el('text', { id: 'headline', x: 88, y: 118, 'font-size': 42, 'font-family': FONT_SERIF, 'font-weight': 700, 'letter-spacing': 2, fill: 'url(#titleRamp)', stroke: '#060b14', 'stroke-width': 5, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, 'AURORAL SPECTROGRAPH'));
  stage.append(label(90, 142, '极光分光台 · 1 stop master · 44 curtains · 96 wedges · 0 bitmaps', { 'font-size': 13, fill: '#dbe7f3', 'font-family': FONT_CJK, stroke: '#060b14', 'stroke-width': 3, 'paint-order': 'stroke' }));
  const readout = el('text', { id: 'readout', x: 1330, y: 72, 'font-size': 12, 'font-family': FONT_MONO, fill: '#dbe7f3', 'text-anchor': 'end' }, 'Δλ +0.00 · f=(0.34,0.30)');
  stage.append(readout);
  stage.append(label(1330, 88, 'A 继承母版 · B reflect · C rotate(θ) · D pad · Z 零长', { 'text-anchor': 'end', 'font-family': FONT_CJK, fill: '#9fb3c8', ...HALO }));

  stage.append(buildSpectrum(defs));
  stage.append(panelTitle(72, 616, '光栅标定卡 · VECTOR / SPREAD / OFFSET'), card);
  stage.append(panelTitle(456, 616, '透过率与赋色 · STOP-OPACITY / STOP-COLOR'), trans);
  stage.append(panelTitle(720, 616, '标定球阵 · fx fy fr cx cy'), spheres);
  stage.append(panelTitle(1016, 616, '角向色轮 · 96×href'), wheel);

  mark(stage,
    'concept:paint-server-fallback', 'concept:conic-gradient-emulation', 'concept:gradient-on-stroke', 'concept:gradient-on-text',
    'concept:text-gradient-fill', 'concept:smil-animated-stops', 'concept:animate-gradient-stop', 'concept:animate-color',
    'concept:animated-gradient-vector', 'css:gradient-stop-selectors', 'css:custom-properties-in-gradients',
    'concept:zero-length-gradient-vector', 'concept:hard-stop-banding', 'concept:stop-offset-clamping', 'concept:premultiplied-transparent-stop',
    'concept:focal-point-outside-circle', 'api:SVGStopElement.offset', 'api:SVGRadialGradientElement.fx');

  wireInteraction(stage, readout);

  // Still frame: export or reduced motion → freeze the SMIL clock at 4.2 s, then let two frames settle.
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isExport() || reduced) freezeAt(stage, FREEZE_T);
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}
