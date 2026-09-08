// forge-metallography-bench — 锻件金相台 (docs/svg-feature-demos.md §3.11)
// A steel metallography bench: one forged nameplate whose SourceAlpha is the ONLY height map in the
// scene (glyph cut-outs, hexagonal maker's mark, hatch grooves), read by feDiffuseLighting /
// feSpecularLighting under a draggable feSpotLight / fePointLight / feDistantLight, then re-read by a
// 3×3 grid of feConvolveMatrix tiles. No fonts, images or noise are used for the relief.
import { el, fragment, mark, mulberry32, fmt, isExport, freezeAt, FONT_MONO } from './lib';
import * as G from './forge-metallography-bench-geometry';
import * as F from './forge-metallography-bench-filters';

// ---------- palette ----------
const INK = '#d5dce4', DIM = '#8d97a2', AMBER = '#ffb547', CYAN = '#5fd3e6', ORANGE = '#ff7a1a';
const PANEL_STROKE = '#4a535d', SHADOW = '#04060a';
const TINTS: Record<string, string> = { white: '#ffffff', amber: AMBER, cyan: CYAN };

// ---------- fixed coordinate table (construction note 2) ----------
const PLATE = { x: 56, y: 136, w: 644, h: 334 };
const PLATE_CENTER = { x: PLATE.x + PLATE.w / 2, y: PLATE.y + PLATE.h / 2 };
const RULER_XS = [56, 220, 384, 548], RULER_Y = 486, RULER_SCALES = [-12, 6, 18, 34];
const BRUSH = { x: 56, y: 604, w: 316, h: 112 }, CHROME = { x: 388, y: 604, w: 312, h: 112 };
const ETCH = { x: 56, y: 732, w: 316, h: 132 }, PROBE = { x: 388, y: 732, w: 312, h: 132 };
const CONSOLE = { x: 720, y: 136, w: 632, h: 278 }, READER = { x: 720, y: 434, w: 632, h: 430 };
const TITLE = { x: 56, y: 40, w: 414, h: 72 }, HUD = { x: 486, y: 44, w: 634, h: 64 }, BASEPLATE = { x: 1136, y: 40, w: 216, h: 72 };
const CROP = { x: 392, y: 262, w: 297, h: 129 };                    // plate crop feeding the reader tiles
const CROP_SCALE = 0.62;
const INSPECT: F.Region[] = [0, 1, 2, 3, 4, 5].map(i => ({ x: 1160 + (i % 2) * 90, y: 160 + Math.floor(i / 2) * 76, w: 74, h: 56 }));
const READER_TILES: F.Region[] = F.KERNELS.map((_, i) => ({ x: 736 + (i % 3) * 206, y: 470 + Math.floor(i / 3) * 132, w: 184, h: 80 }));

// ---------- lamp arm (construction note 7) ----------
const BASE = { x: 1330, y: 76 }, L1 = 420, L2 = 380, REACH = L1 + L2 - 4;
const LAMP0 = { x: 600, y: 268, z: 110 }, AIM0 = { x: 330, y: 320 }, CONE0 = 26, FOCUS0 = 3;
const SURFACE0 = 18, PLATE_EXP = 20;
// Auto-scan stops (construction note 9): unevenly spaced, paced → constant speed, last == first so it loops.
const X_STOPS = [600, 610, 700, 560, 600], Y_STOPS = [268, 150, 230, 180, 268], DUR = 11;
const EXPORT_TIME = 2.4;

// side-view mapping (console)
const SIDE = { x0: 748, x1: 990, base: 290, zScale: 0.55 };
const sx = (x: number) => SIDE.x0 + (x - PLATE.x) * (SIDE.x1 - SIDE.x0) / PLATE.w;
const sz = (z: number) => SIDE.base - z * SIDE.zScale;
const DIAL = { cx: 1088, cy: 236, rOuter: 44, rInner: 27 };
const TRACK = { x0: 760, x1: 1120, y: 372, vMin: 560, vMax: 700 };
const TRACK_S = (TRACK.x1 - TRACK.x0) / (TRACK.vMax - TRACK.vMin);

type Mode = 'spot' | 'point' | 'distant';
type Tint = 'white' | 'amber' | 'cyan';

export function render(stage: SVGSVGElement): void {
  stage.setAttribute('lang', 'en');
  stage.setAttribute('role', 'application');
  stage.setAttribute('aria-label', 'Forge metallography bench: nameplate height map under draggable SVG lights');
  stage.append(
    el('title', {}, 'Forge metallography bench — alpha height map, lighting filters and convolution read-out'),
    el('desc', {}, 'A forged nameplate SN-4417-A whose cut-out glyphs form the only height map. feDiffuseLighting and feSpecularLighting light it with a draggable feSpotLight, fePointLight or feDistantLight; depth rulers vary surfaceScale; brushed, chrome and etched samples vary lighting-color, specularExponent and azimuth; nine feConvolveMatrix tiles re-read the lit plate.'),
    el('style', {}, `
      text{font-family:${FONT_MONO};fill:${INK}}
      .dim{fill:${DIM}} .amber{fill:${AMBER}} .cyan{fill:${CYAN}}
      .tint-white{lighting-color:#ffffff} .tint-amber{lighting-color:${AMBER}} .tint-cyan{lighting-color:${CYAN}}
      .handle{cursor:grab} .handle.captured{cursor:grabbing} .handle.captured .ring{stroke:${AMBER}}
      .btn{cursor:pointer} .btn rect{fill:#3a424b;stroke:#5a6570} .btn text{fill:${INK}}
      .btn.active rect{fill:#4d3f22;stroke:${AMBER}} .btn.active text{fill:#ffd79a}
      .ruler{cursor:pointer} .ruler .frame{fill:none;stroke:none} .ruler.selected .frame{stroke:${AMBER};stroke-width:2.5}
      .tile{cursor:crosshair}
    `),
  );

  const rng = mulberry32(0x4417);
  const defs = el('defs');
  stage.append(defs);

  // ---------- gradients ----------
  defs.append(
    fragment(`
      <linearGradient id="g-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#343b43"/><stop offset="1" stop-color="#272d34"/></linearGradient>
      <linearGradient id="g-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3bac2"/><stop offset=".45" stop-color="#8a929b"/><stop offset=".7" stop-color="#a1a9b2"/><stop offset="1" stop-color="#76808a"/></linearGradient>
      <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2126"/><stop offset="1" stop-color="#2a3037"/></linearGradient>
      <linearGradient id="g-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d0f12"/><stop offset=".14" stop-color="#f4f6f8"/><stop offset=".28" stop-color="#5a6169"/><stop offset=".42" stop-color="#ffffff"/>
        <stop offset=".56" stop-color="#1a1d22"/><stop offset=".7" stop-color="#c9ced4"/><stop offset=".84" stop-color="#3a3f46"/><stop offset="1" stop-color="#eef1f4"/>
      </linearGradient>
    `),
  );

  // ---------- the single height map: #plate-face (construction note 3) ----------
  const outer = G.roundedRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h, 18);
  const logo = { cx: 118, cy: 210, r: 40, ri: 28 };
  const logoPath = G.hexagon(logo.cx, logo.cy, logo.r) + G.hexagon(logo.cx, logo.cy, logo.ri) + G.rectsPath(G.glyphRuns('F', logo.cx - 12.5, logo.cy - 17.5, 5));
  const serial = 'SN-4417-A', serialCell = 9, serialX = 190, serialY = 178;
  const serialGlyphs = [...serial].map((ch, i) => ({ ch, x: serialX + i * 6 * serialCell, rects: G.glyphRuns(ch, serialX + i * 6 * serialCell, serialY, serialCell) }));
  const hatch = G.hatchRuns(82, 278, 300, 166, 3.5, rng);
  const bigCell = 14, bigX = 436, bigY = 286;
  const bigGlyphs = [0, 1].map(i => ({ x: bigX + i * 6 * bigCell, rects: G.glyphRuns('4', bigX + i * 6 * bigCell, bigY, bigCell) }));
  const rivets = [[78, 158], [678, 158], [78, 448], [678, 448]].map(([cx, cy]) => G.circlePath(cx, cy, 7));
  const holesPath = logoPath + serialGlyphs.map(g => G.rectsPath(g.rects)).join('') + G.rectsPath(hatch) + bigGlyphs.map(g => G.rectsPath(g.rects)).join('') + rivets.join('');

  // clip used by the cast-shadow layer: only the cut-outs (evenodd keeps the hexagon ring + F as holes)
  defs.append(el('clipPath', { id: 'holes-clip' }, el('path', { d: holesPath, 'clip-rule': 'evenodd' })));
  defs.append(el('clipPath', { id: 'crop-clip' }, el('rect', { x: CROP.x, y: CROP.y, width: CROP.w, height: CROP.h })));
  [0, 1, 2, 3].forEach(q => defs.append(el('clipPath', { id: `etch-q${q}` }, el('path', { d: G.quadrant(136, 798, 64, q) }))));

  // ---------- filters (table driven) ----------
  const plateRegion = { x: PLATE.x - 24, y: PLATE.y - 24, w: PLATE.w + 48, h: PLATE.h + 48 };
  defs.append(fragment(F.plateFilter('f-plate', plateRegion, SURFACE0, PLATE_EXP)));
  RULER_SCALES.forEach((s, i) => defs.append(fragment(F.rulerFilter(`f-ruler-${i}`, { x: RULER_XS[i] - 12, y: RULER_Y - 12, w: 176, h: 124 }, s))));
  (['white', 'amber', 'cyan'] as Tint[]).forEach((tint, i) => defs.append(fragment(F.brushFilter(`f-brush-${tint}`, { x: 64, y: 602 + i * 36, w: 240, h: 42 }, tint))));
  defs.append(fragment(F.brushFilter('f-brush-v', { x: 316, y: 606, w: 24, h: 34 }, 'white', '0 9')));
  defs.append(fragment(F.chromeFilter('f-chrome', { x: CHROME.x + 4, y: CHROME.y, w: CHROME.w - 8, h: 84 })));
  [0, 90, 180, 270].forEach((az, i) => defs.append(fragment(F.etchFilter(`f-etch-${i}`, { x: 70, y: 732, w: 132, h: 132 }, az))));
  defs.append(fragment(F.inspectionFilters('insp', INSPECT)));
  F.KERNELS.forEach((spec, i) => defs.append(fragment(F.kernelFilter(spec, READER_TILES[i]))));

  // light sources for #f-plate — exactly one child per lighting primitive at any time (note 6)
  const fPlate = defs.querySelector<SVGFilterElement>('#f-plate')!;
  const diffuse = fPlate.querySelector<SVGFEDiffuseLightingElement>('feDiffuseLighting')!;
  const specular = fPlate.querySelector<SVGFESpecularLightingElement>('feSpecularLighting')!;
  const mkSpot = () => el('feSpotLight', { x: LAMP0.x, y: LAMP0.y, z: LAMP0.z, pointsAtX: AIM0.x, pointsAtY: AIM0.y, pointsAtZ: 0, limitingConeAngle: CONE0, specularExponent: FOCUS0 },
    el('animate', { attributeName: 'x', values: X_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'paced', repeatCount: 'indefinite' }),
    el('animate', { attributeName: 'y', values: Y_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'paced', repeatCount: 'indefinite' }));
  const mkPoint = () => el('fePointLight', { x: LAMP0.x, y: LAMP0.y, z: LAMP0.z },
    el('animate', { attributeName: 'x', values: X_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'paced', repeatCount: 'indefinite' }),
    el('animate', { attributeName: 'y', values: Y_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'paced', repeatCount: 'indefinite' }));
  const mkDistant = () => el('feDistantLight', { azimuth: 200, elevation: 30 });
  const lights = {
    spot: [mkSpot(), mkSpot()] as SVGFESpotLightElement[],
    point: [mkPoint(), mkPoint()] as SVGFEPointLightElement[],
    distant: [mkDistant(), mkDistant()] as SVGFEDistantLightElement[],
  };
  diffuse.append(lights.spot[0]);
  specular.append(lights.spot[1]);

  // ---------- reusable sources in <defs> ----------
  // brushed-aluminium source: translucent base + 13 jittered hairlines (alpha jitter = groove depth)
  const brushSrc = el('g', { id: 'brush-src' }, el('rect', { width: 232, height: 34, fill: '#fff', 'fill-opacity': .55 }));
  for (let i = 0; i < 13; i++) {
    const x0 = rng() * 14, x1 = 232 - rng() * 14;
    brushSrc.append(el('rect', { x: fmt(x0), y: fmt(1.5 + i * 2.5), width: fmt(x1 - x0), height: 1, fill: '#fff', 'fill-opacity': fmt(.5 + rng() * .5) }));
  }
  defs.append(brushSrc);
  // etched specimen source: 30 seeds, 2 Lloyd rounds, grain boundaries 1.2 wide, per-grain alpha
  const seeds: G.Pt[] = Array.from({ length: 30 }, () => { const r = 58 * Math.sqrt(rng()), a = rng() * Math.PI * 2; return { x: 136 + r * Math.cos(a), y: 798 + r * Math.sin(a) }; });
  const { cells } = G.voronoiDisc(seeds, 136, 798, 64, 2);
  defs.append(el('g', { id: 'etch-src' },
    el('circle', { cx: 136, cy: 798, r: 64, fill: '#fff', 'fill-opacity': .5 }),
    ...cells.map(cell => el('path', { d: G.polyPath(cell), fill: '#fff', 'fill-opacity': fmt(.3 + rng() * .45), stroke: '#fff', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }))));
  // inspection-window source: a small raised "44"
  defs.append(el('path', { id: 'insp-src', d: G.rectsPath(G.textRuns('44', 0, 0, 6)), fill: '#9ba3ac' }));
  // track pointers (drawn in a horizontally scaled group, so they are pre-compensated)
  defs.append(el('g', { id: 'ptr-paced' }, el('path', { d: 'M0 -3L-6 -14L6 -14Z', fill: AMBER, transform: `scale(${fmt(1 / TRACK_S, 4)} 1)` })));
  defs.append(el('g', { id: 'ptr-linear' }, el('path', { d: 'M0 3L-6 14L6 14Z', fill: CYAN, transform: `scale(${fmt(1 / TRACK_S, 4)} 1)` })));

  // ---------- bench layers ----------
  const bench = el('g', { id: 'bench' });
  stage.append(bench);
  bench.append(el('rect', { id: 'hit-plane', width: 1400, height: 900, fill: 'none', 'pointer-events': 'all' }));

  const panel = (id: string, r: F.Region, extra: Record<string, string | number> = {}) =>
    el('path', { id, class: 'panel', d: G.chamferRect(r.x, r.y, r.w, r.h, 14), fill: 'url(#g-panel)', stroke: PANEL_STROKE, 'stroke-width': 1.2, ...extra });
  const label = (x: number, y: number, str: string, attrs: Record<string, string | number> = {}) => el('text', { x, y, 'font-size': 11, ...attrs }, str);

  // nameplate: floor (seen through the cut-outs) → filtered face → cast shadows clipped into the cut-outs
  const plateFace = el('path', { id: 'plate-face', d: outer + holesPath, 'fill-rule': 'evenodd', fill: 'url(#g-steel)', filter: 'url(#f-plate)' });
  const shadowPieces: { node: SVGPathElement; cx: number; cy: number }[] = [];
  const castShadow = el('g', { id: 'cast-shadow', 'clip-path': 'url(#holes-clip)', 'pointer-events': 'none' });
  const addShadow = (d: string, cx: number, cy: number) => { const node = el('path', { d, fill: SHADOW, 'fill-opacity': .8 }); castShadow.append(node); shadowPieces.push({ node, cx, cy }); };
  addShadow(logoPath, logo.cx, logo.cy);
  serialGlyphs.forEach(g => addShadow(G.rectsPath(g.rects), g.x + 22, serialY + 31));
  addShadow(G.rectsPath(hatch), 232, 361);
  bigGlyphs.forEach(g => addShadow(G.rectsPath(g.rects), g.x + 35, bigY + 49));
  rivets.forEach((d, i) => addShadow(d, [78, 678, 78, 678][i], [158, 158, 448, 448][i]));
  const plateLit = el('g', { id: 'plate-lit' }, el('path', { id: 'plate-floor', d: outer, fill: 'url(#g-floor)' }), plateFace, castShadow);
  bench.append(plateLit);

  // arm links live UNDER the deck panels (the arm is bench-mounted below the plates); a faint dashed ghost
  // above the deck reveals the two-link IK, and the lamp head itself floats above everything.
  const armLinks = el('g', { id: 'arm', 'pointer-events': 'none' },
    el('polyline', { id: 'arm-outer', points: '', fill: 'none', stroke: '#1d2227', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('polyline', { id: 'arm-inner', points: '', fill: 'none', stroke: '#6f7984', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('circle', { id: 'arm-elbow', r: 9, fill: '#2b3238', stroke: '#8a94a0', 'stroke-width': 2 }));
  bench.append(armLinks);

  // ---------- title / HUD / base plate ----------
  bench.append(panel('panel-title', TITLE),
    el('text', { x: 72, y: 70, 'font-size': 19, 'font-weight': 700, fill: INK }, 'FORGE METALLOGRAPHY BENCH'),
    label(72, 92, 'alpha height map → feDiffuse/feSpecularLighting → feConvolveMatrix read-out', { class: 'dim' }));
  bench.append(panel('panel-hud', HUD));
  const hudLine1 = el('text', { id: 'hud-line-1', x: 500, y: 67, 'font-size': 12 });
  const hudLine2 = el('text', { id: 'hud-line-2', x: 500, y: 89, 'font-size': 12 });
  const hudScale = el('tspan', { id: 'hud-surface-scale', class: 'amber' }, String(SURFACE0));
  bench.append(hudLine1, hudLine2);

  bench.append(panel('panel-base', BASEPLATE),
    label(1150, 60, `ARM BASE (${BASE.x},${BASE.y}) · L1 ${L1} · L2 ${L2}`, { class: 'dim' }),
    el('circle', { id: 'arm-pivot', cx: BASE.x, cy: BASE.y, r: 13, fill: '#2b3238', stroke: '#8a94a0', 'stroke-width': 3 }),
    el('circle', { cx: BASE.x, cy: BASE.y, r: 4, fill: AMBER }));
  const btn = (id: string, x: number, y: number, w: number, txt: string, data: Record<string, string>) =>
    el('g', { id, class: 'btn', ...data }, el('rect', { x, y, width: w, height: 22, rx: 4 }), el('text', { x: x + w / 2, y: y + 15, 'font-size': 11, 'text-anchor': 'middle' }, txt));
  bench.append(btn('btn-rescan', 1150, 72, 82, 'RE-SCAN', { 'data-action': 'rescan' }));
  const ledAuto = el('circle', { id: 'led-auto', cx: 1252, cy: 83, r: 5, fill: CYAN });
  const ledText = el('text', { id: 'led-text', x: 1264, y: 87, 'font-size': 11 }, 'AUTO');
  bench.append(ledAuto, ledText);

  // ---------- depth rulers: same "44", only surfaceScale differs (note 5) ----------
  const rulerLights: SVGFEDistantLightElement[] = [];
  const rulerGroups = RULER_SCALES.map((s, i) => {
    const x = RULER_XS[i];
    const d = G.roundedRect(x, RULER_Y, 152, 100, 6) + G.rectsPath(G.textRuns('44', x + 32, RULER_Y + 12, 8));
    rulerLights.push(defs.querySelector<SVGFEDistantLightElement>(`#f-ruler-${i} feDistantLight`)!);
    const g = el('g', { id: `ruler-${i}`, class: 'ruler', 'data-scale': s, 'data-tile': '' },
      el('path', { d, 'fill-rule': 'evenodd', fill: 'url(#g-steel)', filter: `url(#f-ruler-${i})` }),
      el('path', { class: 'frame', d: G.roundedRect(x, RULER_Y, 152, 100, 6) }),
      el('rect', { x: x + 8, y: RULER_Y + 76, width: 136, height: 17, rx: 3, fill: '#1f252b', 'fill-opacity': .85 }),
      label(x + 76, RULER_Y + 89, `surfaceScale ${s < 0 ? '−' : ''}${Math.abs(s)}`, { 'text-anchor': 'middle', class: s === SURFACE0 ? 'amber' : '' }));
    bench.append(g);
    return g;
  });

  // ---------- brushed aluminium bands (note 12) ----------
  bench.append(panel('panel-brush', BRUSH));
  (['white', 'amber', 'cyan'] as Tint[]).forEach((tint, i) => {
    const y = 606 + i * 36;
    bench.append(el('g', { id: `brush-${tint}`, class: 'tile', 'data-tile': '', filter: `url(#f-brush-${tint})` }, el('use', { href: '#brush-src', x: 68, y })));
    bench.append(el('rect', { x: 72, y: y + 10, width: 150, height: 15, rx: 3, fill: '#14181c', 'fill-opacity': .8 }),
      label(76, y + 21, `${i === 0 ? 'BRUSHED Al · ' : 'lighting-color '}.tint-${tint}`, { class: tint === 'white' ? '' : tint }));
  });
  bench.append(el('g', { id: 'brush-vertical', filter: 'url(#f-brush-v)' }, el('use', { href: '#brush-src', transform: 'translate(340 606) rotate(90)' })),
    label(316, 660, 'σ 0 9', { class: 'dim' }), label(316, 674, 'vs 9 0', { class: 'dim' }));

  // ---------- chrome piece (note 13) ----------
  bench.append(panel('panel-chrome', CHROME),
    el('path', { id: 'chrome-glyphs', d: G.rectsPath(G.textRuns('CrMo-4', 404, 616, 8)), fill: 'url(#g-chrome)', filter: 'url(#f-chrome)' }),
    label(404, 692, 'CHROME · CrMo-4 · 8-band mirror gradient + bevel blur 2.4'),
    label(404, 707, 'feSpecularLighting specularConstant 1.15 · specularExponent 48  (brush: 0.35 / 3)', { class: 'dim' }));

  // ---------- etched specimen (note 13) ----------
  bench.append(panel('panel-etch', ETCH));
  const etchLights = [0, 1, 2, 3].map(q => {
    bench.append(el('g', { id: `etch-q${q}-lit`, class: 'tile', 'data-tile': '', 'clip-path': `url(#etch-q${q})`, filter: `url(#f-etch-${q})` }, el('use', { href: '#etch-src' })));
    return defs.querySelector<SVGFEDistantLightElement>(`#f-etch-${q} feDistantLight`)!;
  });
  bench.append(el('circle', { cx: 136, cy: 798, r: 64, fill: 'none', stroke: '#11161b', 'stroke-width': 1.5 }),
    el('path', { d: 'M136 734V862M72 798H200', stroke: '#11161b', 'stroke-width': 1, 'stroke-dasharray': '3 3', fill: 'none' }),
    label(214, 752, 'ETCHED SPECIMEN Ø128'),
    label(214, 768, 'Voronoi · 30 seeds · 2 Lloyd rounds · grain 1.2', { class: 'dim' }),
    label(214, 784, 'feDistantLight elevation 32, one azimuth per quadrant', { class: 'dim' }),
    label(214, 800, 'lower-right → lower-left → upper-left → upper-right', { class: 'dim' }),
    el('text', { id: 'etch-azimuths', x: 214, y: 818, 'font-size': 11, class: 'cyan' }, `azimuth.baseVal ${etchLights.map(l => l.azimuth.baseVal).join(' · ')}`),
    label(214, 838, 'same grain boundary flips light/dark across quadrants', { class: 'dim' }));

  // ---------- probe & event log panel (note 15) ----------
  bench.append(panel('panel-probe', PROBE), label(404, 752, 'PROBE · EVENT LOG'));
  const probeReadout = el('text', { id: 'probe-readout', x: 404, y: 770, 'font-size': 11, class: 'cyan' }, 'move over the plate — isPointInFill reads h');
  const logLines = [0, 1, 2, 3].map(i => el('text', { id: `log-${i}`, x: 404, y: 792 + i * 14, 'font-size': 11, class: 'dim' }, '·'));
  const logMode = el('text', { id: 'log-mode', x: 404, y: 855, 'font-size': 11 }, '');
  bench.append(probeReadout, ...logLines, logMode);

  // ---------- light console (notes 6, 7, 9, 14) ----------
  const consolePath = G.chamferRect(CONSOLE.x, CONSOLE.y, CONSOLE.w, CONSOLE.h, 14) + INSPECT.map(t => G.rectPath({ x: t.x, y: t.y, w: t.w, h: t.h })).join('');
  bench.append(el('path', { id: 'panel-console', class: 'panel', d: consolePath, 'fill-rule': 'evenodd', fill: 'url(#g-panel)', stroke: PANEL_STROKE, 'stroke-width': 1.2 }));
  bench.append(label(736, 158, 'LIGHT CONSOLE · one light-source child · primitiveUnits userSpaceOnUse (light x,y,z = stage px)'));
  // side view (height map profile + lamp on its z rail)
  bench.append(el('rect', { x: SIDE.x0 - 6, y: 172, width: SIDE.x1 - SIDE.x0 + 12, height: 128, rx: 4, fill: '#1c2126', stroke: '#3c444d' }),
    el('line', { x1: SIDE.x0, y1: SIDE.base, x2: SIDE.x1, y2: SIDE.base, stroke: '#4d5761', 'stroke-width': 1 }),
    label(SIDE.x0, 184, 'SIDE VIEW · plate section y=209 · z rail', { class: 'dim' }));
  const sideProfile = el('path', { id: 'side-profile', d: '', fill: 'none', stroke: '#b3bac2', 'stroke-width': 1.5 });
  const sideCone = el('path', { id: 'side-cone', d: '', fill: AMBER, 'fill-opacity': .12, stroke: AMBER, 'stroke-width': 1, 'stroke-dasharray': '3 3' });
  const sideLamp = el('circle', { id: 'side-lamp', r: 5, fill: AMBER });
  const sideZ = el('text', { id: 'side-z', 'font-size': 11, class: 'amber' }, '');
  bench.append(sideCone, sideProfile, sideLamp, sideZ);
  // z rail 20..200
  const RAIL_X = 1012;
  bench.append(el('line', { x1: RAIL_X, y1: sz(200), x2: RAIL_X, y2: sz(20), stroke: '#5a6570', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    ...[20, 110, 200].map(z => el('line', { x1: RAIL_X - 6, y1: sz(z), x2: RAIL_X + 6, y2: sz(z), stroke: '#8a94a0' })),
    ...[20, 110, 200].map(z => label(RAIL_X + 10, sz(z) + 4, String(z), { class: 'dim' })),
    label(RAIL_X - 4, 176, 'z', { class: 'dim' }));
  const handle = (id: string, kind: string, r: number) => el('g', { id, class: 'handle', 'data-handle': kind },
    el('circle', { class: 'ring', r, fill: '#1f252b', stroke: '#aeb6be', 'stroke-width': 3 }), el('circle', { r: r - 6, fill: AMBER }));
  const zHandle = handle('z-handle', 'z', 9);
  bench.append(zHandle);
  // cone dial: outer ring limitingConeAngle 6..48, inner ring spot specularExponent 1..40
  const arc = (r: number) => G.polyPath(Array.from({ length: 37 }, (_, i) => { const a = (-135 + i * 7.5) * Math.PI / 180; return { x: DIAL.cx + r * Math.sin(a), y: DIAL.cy - r * Math.cos(a) }; })).replace(/Z$/, '');
  bench.append(el('path', { d: arc(DIAL.rOuter), fill: 'none', stroke: '#5a6570', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    el('path', { d: arc(DIAL.rInner), fill: 'none', stroke: '#4a545e', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    label(DIAL.cx, DIAL.cy - 54, 'limitingConeAngle 6–48°', { 'text-anchor': 'middle', class: 'dim' }),
    label(DIAL.cx, DIAL.cy + 66, 'spot specularExponent 1–40', { 'text-anchor': 'middle', class: 'dim' }));
  const dialCone = el('text', { id: 'dial-cone', x: DIAL.cx, y: DIAL.cy - 2, 'font-size': 13, 'text-anchor': 'middle', class: 'amber' }, '');
  const dialFocus = el('text', { id: 'dial-focus', x: DIAL.cx, y: DIAL.cy + 13, 'font-size': 11, 'text-anchor': 'middle', class: 'cyan' }, '');
  const coneHandle = handle('cone-handle', 'cone', 9), focusHandle = handle('focus-handle', 'focus', 8);
  bench.append(dialCone, dialFocus, coneHandle, focusHandle);
  // six inspection windows (cut through the console so raw alpha / specular float on transparency)
  const inspNames = ['α SourceAlpha', 'α blur 2.6', 'S exp 1', 'S exp 24', 'P z 24', 'P z 180'];
  const inspIds = ['alpha', 'alpha-blur', 'spec-1', 'spec-24', 'point-24', 'point-180'];
  INSPECT.forEach((t, i) => {
    bench.append(el('g', { id: `insp-tile-${inspIds[i]}`, class: 'tile', 'data-tile': '', filter: `url(#insp-${inspIds[i]})` }, el('use', { href: '#insp-src', x: t.x + 4, y: t.y + 7 })),
      el('rect', { x: t.x - .5, y: t.y - .5, width: t.w + 1, height: t.h + 1, fill: 'none', stroke: '#5a6570' }),
      label(t.x, t.y + t.h + 13, inspNames[i], { class: i >= 2 ? 'amber' : 'dim' }));
  });
  // mode + tint buttons
  const modeBtns: Record<Mode, SVGGElement> = {
    spot: btn('btn-mode-spot', 748, 312, 58, 'SPOT', { 'data-mode': 'spot' }),
    point: btn('btn-mode-point', 812, 312, 58, 'POINT', { 'data-mode': 'point' }),
    distant: btn('btn-mode-distant', 876, 312, 66, 'DISTANT', { 'data-mode': 'distant' }),
  };
  const tintBtns: Record<Tint, SVGGElement> = {
    white: btn('btn-tint-white', 966, 312, 52, 'WHITE', { 'data-tint': 'white' }),
    amber: btn('btn-tint-amber', 1024, 312, 52, 'AMBER', { 'data-tint': 'amber' }),
    cyan: btn('btn-tint-cyan', 1082, 312, 52, 'CYAN', { 'data-tint': 'cyan' }),
  };
  bench.append(...Object.values(modeBtns), ...Object.values(tintBtns), label(950, 328, '·', { class: 'dim' }));
  // scan track: same x stops, one pointer paced, one linear (note 9)
  const tx = (v: number) => TRACK.x0 + (v - TRACK.vMin) * TRACK_S;
  const trackGroup = el('g', { id: 'scan-track', transform: `translate(${fmt(TRACK.x0 - TRACK.vMin * TRACK_S, 3)} ${TRACK.y}) scale(${fmt(TRACK_S, 4)} 1)` },
    el('rect', { x: TRACK.vMin, y: -1, width: TRACK.vMax - TRACK.vMin, height: 2, fill: '#5a6570' }),
    ...[...new Set(X_STOPS)].map(v => el('rect', { x: v - .5 / TRACK_S, y: -6, width: 1 / TRACK_S, height: 12, fill: '#aeb6be' })),
    el('use', { id: 'ptr-paced-use', href: '#ptr-paced', x: X_STOPS[0], y: 0 },
      el('animate', { attributeName: 'x', values: X_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'paced', repeatCount: 'indefinite' })),
    el('use', { id: 'ptr-linear-use', href: '#ptr-linear', x: X_STOPS[0], y: 0 },
      el('animate', { attributeName: 'x', values: X_STOPS.join(';'), dur: `${DUR}s`, calcMode: 'linear', repeatCount: 'indefinite' })));
  const segs = X_STOPS.slice(1).map((v, i) => Math.abs(v - X_STOPS[i]));
  bench.append(trackGroup,
    ...[...new Set(X_STOPS)].map(v => label(tx(v), TRACK.y + 24, String(v), { 'text-anchor': 'middle', class: 'dim' })),
    label(TRACK.x0, TRACK.y - 20, '▲ calcMode="paced"', { class: 'amber' }),
    label(TRACK.x0 + 150, TRACK.y - 20, '▼ calcMode="linear"', { class: 'cyan' }),
    label(TRACK.x0 + 300, TRACK.y - 20, `values ${X_STOPS.join('→')} · |Δ| ${segs.join('·')} · dur ${DUR}s`, { class: 'dim' }),
    label(TRACK.x1 - 100, TRACK.y + 24, 'SCAN TRACK (light x)', { class: 'dim' }));

  // ---------- reader: nine feConvolveMatrix tiles over the same lit crop (notes 10–11) ----------
  bench.append(panel('panel-reader', READER),
    label(736, 456, `READER · feConvolveMatrix on the lit plate crop (${CROP.w}×${CROP.h} @ ${CROP_SCALE}) · kernel text read from kernelMatrix.baseVal`));
  const crop = el('g', { id: 'crop-44', 'clip-path': 'url(#crop-clip)' }, el('use', { href: '#plate-lit' }),
    // orange locator in the crop's bottom-left corner — wraps to the opposite edges under edgeMode="wrap"
    el('path', { id: 'crop-locator', d: `M${CROP.x} ${CROP.y + CROP.h}v-${52}h9v${43}h${86}v9z`, fill: ORANGE }));
  defs.append(crop);
  const kernelTiles = F.KERNELS.map((spec, i) => {
    const t = READER_TILES[i];
    const g = el('g', { id: `tile-kv-${spec.id}`, class: 'tile', 'data-tile': '', filter: `url(#kv-${spec.id})` },
      el('rect', { x: t.x, y: t.y, width: t.w, height: t.h, fill: '#171b20' }),
      el('use', { href: '#crop-44', transform: `translate(${fmt(t.x - CROP.x * CROP_SCALE, 3)} ${fmt(t.y - CROP.y * CROP_SCALE, 3)}) scale(${CROP_SCALE})` }));
    const fe = defs.querySelector<SVGFEConvolveMatrixElement>(`#kv-${spec.id} feConvolveMatrix`)!;
    const params = [`order ${spec.order}`, spec.divisor && `÷${spec.divisor}`, spec.bias && `bias ${spec.bias}`, spec.preserveAlpha && 'preserveAlpha', spec.targetX && `targetX ${spec.targetX}`, spec.edgeMode && `edgeMode ${spec.edgeMode}`].filter(Boolean).join(' · ');
    bench.append(g, el('rect', { x: t.x - .5, y: t.y - .5, width: t.w + 1, height: t.h + 1, fill: 'none', stroke: '#5a6570' }),
      label(t.x, t.y + 96, `${spec.title} · ${params}`, { class: i % 3 === 0 ? 'amber' : '' }),
      el('text', { id: `kernel-text-${spec.id}`, x: t.x, y: t.y + 110, 'font-size': 11, class: 'dim' }, ''));
    return { spec, g, fe };
  });
  // kernel read-back (api:SVGFEConvolveMatrixElement.kernelMatrix): printed digits and attribute share one source
  const describeKernel = (fe: SVGFEConvolveMatrixElement) => {
    const list = fe.kernelMatrix.baseVal, ox = fe.orderX.baseVal, oy = fe.orderY.baseVal;
    const items = Array.from({ length: list.numberOfItems }, (_, i) => fmt(list.getItem(i).value));
    const rows = Array.from({ length: oy }, (_, r) => items.slice(r * ox, (r + 1) * ox).join(' '));
    const text = oy <= 3 ? rows.map(r => `[${r}]`).join(' ') : rows.every(r => r === rows[0]) ? `${oy} × [${rows[0]}]` : rows.map(r => `[${r}]`).join(' ');
    return { text, items };
  };
  kernelTiles.forEach(({ spec, g, fe }) => {
    const { text, items } = describeKernel(fe);
    g.setAttribute('data-kernel', items.join(' '));
    stage.querySelector(`#kernel-text-${spec.id}`)!.textContent = text;
  });

  // ---------- ghost arm, lamp head, aim (top layer) ----------
  const ghost = el('polyline', { id: 'arm-ghost', points: '', fill: 'none', stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '5 7', opacity: .28, 'pointer-events': 'none' });
  const coneLine = el('line', { id: 'cone-line', stroke: AMBER, 'stroke-width': 1.2, 'stroke-dasharray': '4 4', opacity: .7, 'pointer-events': 'none' });
  const lampHead = el('g', { id: 'lamp-head', class: 'handle', 'data-handle': 'head' },
    el('circle', { class: 'ring', r: 16, fill: '#171c21', stroke: '#c5ccd3', 'stroke-width': 3.5 }),
    el('circle', { id: 'lamp-bulb', r: 7, fill: '#ffffff' }),
    el('path', { d: 'M-22 0h-8M22 0h8M0 -22v-8M0 22v8', stroke: '#c5ccd3', 'stroke-width': 2 }));
  const aim = el('g', { id: 'aim', class: 'handle', 'data-handle': 'aim' },
    el('circle', { class: 'ring', r: 10, fill: 'none', stroke: AMBER, 'stroke-width': 2 }),
    el('circle', { r: 16, fill: 'none', 'pointer-events': 'all', stroke: 'none' }),
    el('path', { d: 'M-16 0h32M0 -16v32', stroke: AMBER, 'stroke-width': 1.2 }));
  const probe = el('g', { id: 'probe', 'pointer-events': 'none', visibility: 'hidden' },
    el('line', { id: 'probe-h', stroke: CYAN, 'stroke-width': 1, 'stroke-dasharray': '2 3' }),
    el('line', { id: 'probe-v', stroke: CYAN, 'stroke-width': 1, 'stroke-dasharray': '2 3' }),
    el('circle', { id: 'probe-dot', r: 4, fill: 'none', stroke: CYAN, 'stroke-width': 1.5 }));
  bench.append(ghost, coneLine, aim, lampHead, probe);

  // ================= state & behaviour =================
  const state = { mode: 'spot' as Mode, tint: 'white' as Tint, auto: true, phase: 0, lamp: { ...LAMP0 }, aim: { ...AIM0 } };
  const webkitFallback = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent);
  const allAnimates = () => [...stage.querySelectorAll('animate'), ...lights.spot.flatMap(l => [...l.querySelectorAll('animate')]), ...lights.point.flatMap(l => [...l.querySelectorAll('animate')])] as SVGAnimateElement[];

  /** SMIL `values` interpolation for calcMode paced (constant speed) / linear (equal time per segment). */
  const smilValue = (values: number[], t: number, mode: 'paced' | 'linear') => {
    const f = ((t / DUR) % 1 + 1) % 1;
    if (mode === 'linear') { const seg = Math.min(values.length - 2, Math.floor(f * (values.length - 1))); const u = f * (values.length - 1) - seg; return values[seg] + (values[seg + 1] - values[seg]) * u; }
    const lens = values.slice(1).map((v, i) => Math.abs(v - values[i])); const total = lens.reduce((a, b) => a + b, 0);
    let dist = f * total;
    for (let i = 0; i < lens.length; i++) { if (dist <= lens[i] || i === lens.length - 1) return values[i] + Math.sign(values[i + 1] - values[i]) * Math.min(dist, lens[i]); dist -= lens[i]; }
    return values[0];
  };

  const currentLight = () => lights[state.mode];
  const spotAttr = (name: 'x' | 'y' | 'z' | 'pointsAtX' | 'pointsAtY' | 'limitingConeAngle' | 'specularExponent', v: number) => lights.spot.forEach(l => { l[name].baseVal = v; });
  const azimuthOf = (lamp: G.Pt) => ((Math.atan2(lamp.y - PLATE_CENTER.y, lamp.x - PLATE_CENTER.x) * 180 / Math.PI) + 360) % 360;

  /** Push the scene lamp position into whichever light source is mounted (via IDL, not setAttribute). */
  const writeLightPosition = () => {
    const { x, y } = state.lamp;
    if (state.mode === 'spot') { if (!state.auto || webkitFallback) { spotAttr('x', x); spotAttr('y', y); } }
    else if (state.mode === 'point') { if (!state.auto || webkitFallback) lights.point.forEach(l => { l.x.baseVal = x; l.y.baseVal = y; }); }  // api:SVGFEPointLightElement.x
    const az = azimuthOf(state.lamp);
    lights.distant.forEach(l => { l.azimuth.baseVal = az; });                                       // api:SVGFEDistantLightElement.azimuth
    rulerLights.forEach(l => { l.azimuth.baseVal = az; });                                          // rulers follow the arm angle
  };

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const insideCone = (px: number, py: number) => {
    if (state.mode !== 'spot') return true;
    const L = { x: state.lamp.x, y: state.lamp.y, z: state.lamp.z };
    const ax = state.aim.x - L.x, ay = state.aim.y - L.y, az = -L.z;
    const vx = px - L.x, vy = py - L.y, vz = -L.z;
    const cos = (ax * vx + ay * vy + az * vz) / (Math.hypot(ax, ay, az) * Math.hypot(vx, vy, vz));
    return Math.acos(clamp(cos, -1, 1)) * 180 / Math.PI < lights.spot[0].limitingConeAngle.baseVal;
  };

  /** Two-link IK, elbow-up preferred (falls back to elbow-down when the upper solution leaves the stage). */
  const solveArm = (head: G.Pt) => {
    const dx = head.x - BASE.x, dy = head.y - BASE.y, d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1, L1 + L2 - 0.5);
    const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const up = { x: BASE.x + a * ux - h * -uy, y: BASE.y + a * uy - h * ux }, down = { x: BASE.x + a * ux + h * -uy, y: BASE.y + a * uy + h * ux };
    const [e1, e2] = up.y < down.y ? [up, down] : [down, up];
    return e1.y > 8 ? e1 : e2;
  };

  const sideProfileD = () => {
    const S = diffuse.surfaceScale.baseVal, hS = clamp(S, -34, 34) * 0.5, yTop = SIDE.base - hS, ySec = 209;
    const cuts: [number, number][] = [];
    serialGlyphs.forEach(g => g.rects.forEach(r => { if (ySec >= r.y && ySec < r.y + r.h) cuts.push([r.x, r.x + r.w]); }));
    const hw = logo.r * Math.cos(Math.PI / 6), hi = logo.ri * Math.cos(Math.PI / 6);
    cuts.push([logo.cx - hw, logo.cx - hi], [logo.cx + hi, logo.cx + hw]);
    G.glyphRuns('F', logo.cx - 12.5, logo.cy - 17.5, 5).forEach(r => { if (ySec >= r.y && ySec < r.y + r.h) cuts.push([r.x, r.x + r.w]); });
    cuts.sort((p, q) => p[0] - q[0]);
    let d = `M${fmt(sx(PLATE.x))} ${fmt(yTop)}`;
    cuts.forEach(([a, b]) => { d += `H${fmt(sx(a))}V${SIDE.base}H${fmt(sx(b))}V${fmt(yTop)}`; });
    return d + `H${fmt(sx(PLATE.x + PLATE.w))}`;
  };

  const setHud = () => {
    const spot = lights.spot[0];
    hudLine1.replaceChildren(
      el('tspan', { class: 'dim' }, 'MODE '), el('tspan', { class: 'amber' }, state.mode.toUpperCase()),
      el('tspan', { class: 'dim' }, ' · TINT '), el('tspan', { class: state.tint === 'white' ? '' : state.tint }, state.tint.toUpperCase()),
      el('tspan', { class: 'dim' }, ' · SCAN '), el('tspan', { id: 'hud-auto', class: 'cyan' }, state.auto ? 'AUTO (SMIL paced)' : 'MANUAL'),
      el('tspan', { class: 'dim' }, ' · pointsAt '), el('tspan', {}, `${fmt(state.aim.x, 0)},${fmt(state.aim.y, 0)},0`),
      el('tspan', { class: 'dim' }, ' · plate specularExponent '), el('tspan', {}, String(specular.specularExponent.baseVal)));
    hudScale.textContent = String(diffuse.surfaceScale.baseVal);   // read back from the filter, never a copy
    hudLine2.replaceChildren(
      el('tspan', { class: 'dim' }, 'SURFACE SCALE '), hudScale,
      el('tspan', { class: 'dim' }, ' · z '), el('tspan', {}, fmt(spot.z.baseVal, 0)),
      el('tspan', { class: 'dim' }, ' · limitingConeAngle '), el('tspan', {}, `${fmt(spot.limitingConeAngle.baseVal, 0)}°`),
      el('tspan', { class: 'dim' }, ' · spot exp '), el('tspan', {}, fmt(spot.specularExponent.baseVal, 0)),
      el('tspan', { class: 'dim' }, ' · light '), el('tspan', { id: 'hud-light-xy' }, `${fmt(state.lamp.x, 0)},${fmt(state.lamp.y, 0)},${fmt(state.lamp.z, 0)}`),
      el('tspan', { class: 'dim' }, ' · azimuth '), el('tspan', {}, `${fmt(lights.distant[0].azimuth.baseVal, 0)}°`));
    logMode.textContent = `${state.auto ? 'AUTO' : 'MANUAL'} · ${state.mode} · ${state.tint} · S ${diffuse.surfaceScale.baseVal}`;
    ledAuto.setAttribute('fill', state.auto ? CYAN : AMBER);
    ledText.textContent = state.auto ? 'AUTO' : 'MANUAL';
  };

  /** Redraw everything that depends on the lamp: arm, cast shadows (note 8), side view, dial, HUD. */
  const sync = () => {
    const { lamp, aim: aimPt } = state;
    const spot = lights.spot[0];
    const elbow = solveArm(lamp);
    const pts = `${BASE.x},${BASE.y} ${fmt(elbow.x)},${fmt(elbow.y)} ${fmt(lamp.x)},${fmt(lamp.y)}`;
    ['arm-outer', 'arm-inner'].forEach(id => stage.querySelector(`#${id}`)!.setAttribute('points', pts));
    ghost.setAttribute('points', pts);
    const elbowNode = stage.querySelector('#arm-elbow')!;
    elbowNode.setAttribute('cx', fmt(elbow.x)); elbowNode.setAttribute('cy', fmt(elbow.y));
    lampHead.setAttribute('transform', `translate(${fmt(lamp.x)} ${fmt(lamp.y)})`);
    aim.setAttribute('transform', `translate(${fmt(aimPt.x)} ${fmt(aimPt.y)})`);
    aim.setAttribute('visibility', state.mode === 'spot' ? 'visible' : 'hidden');
    coneLine.setAttribute('visibility', state.mode === 'spot' ? 'visible' : 'hidden');
    coneLine.setAttribute('x1', fmt(lamp.x)); coneLine.setAttribute('y1', fmt(lamp.y)); coneLine.setAttribute('x2', fmt(aimPt.x)); coneLine.setAttribute('y2', fmt(aimPt.y));
    // cast shadow: direction lamp → plate centre, length = surfaceScale·k / z, faded outside the cone
    const S = diffuse.surfaceScale.baseVal;
    const dx = PLATE_CENTER.x - lamp.x, dy = PLATE_CENTER.y - lamp.y, dl = Math.hypot(dx, dy) || 1;
    const len = clamp(Math.abs(S) * 48 / Math.max(20, lamp.z), 2, 28);
    castShadow.setAttribute('transform', `translate(${fmt(dx / dl * len)} ${fmt(dy / dl * len)})`);
    shadowPieces.forEach(p => p.node.setAttribute('fill-opacity', insideCone(p.cx, p.cy) ? '0.82' : '0.3'));
    // side view
    sideProfile.setAttribute('d', sideProfileD());
    const lx = sx(lamp.x), lz = sz(lamp.z);
    sideLamp.setAttribute('cx', fmt(lx)); sideLamp.setAttribute('cy', fmt(lz));
    sideZ.setAttribute('x', fmt(lx + 8)); sideZ.setAttribute('y', fmt(lz - 6)); sideZ.textContent = `z ${fmt(lamp.z, 0)}`;
    if (state.mode === 'spot') {
      const ang = Math.atan2(lamp.z, (lamp.x - aimPt.x)), half = spot.limitingConeAngle.baseVal * Math.PI / 180;
      const hit = (a: number) => Math.abs(Math.sin(a)) < 1e-3 ? lx - Math.sign(Math.cos(a)) * 400 : lx - Math.cos(a) * (lamp.z * SIDE.zScale) / Math.sin(a);
      const x1 = clamp(hit(ang - half), SIDE.x0 - 40, SIDE.x1 + 40), x2 = clamp(hit(ang + half), SIDE.x0 - 40, SIDE.x1 + 40);
      sideCone.setAttribute('d', `M${fmt(lx)} ${fmt(lz)}L${fmt(x1)} ${SIDE.base}L${fmt(x2)} ${SIDE.base}Z`);
      sideCone.setAttribute('visibility', 'visible');
    } else sideCone.setAttribute('visibility', 'hidden');
    zHandle.setAttribute('transform', `translate(${RAIL_X} ${fmt(sz(lamp.z))})`);
    // dial
    const dialPos = (r: number, v: number, min: number, max: number) => { const a = (-135 + (v - min) / (max - min) * 270) * Math.PI / 180; return `translate(${fmt(DIAL.cx + r * Math.sin(a))} ${fmt(DIAL.cy - r * Math.cos(a))})`; };
    coneHandle.setAttribute('transform', dialPos(DIAL.rOuter, spot.limitingConeAngle.baseVal, 6, 48));
    focusHandle.setAttribute('transform', dialPos(DIAL.rInner, spot.specularExponent.baseVal, 1, 40));
    dialCone.textContent = `${fmt(spot.limitingConeAngle.baseVal, 0)}°`;
    dialFocus.textContent = `exp ${fmt(spot.specularExponent.baseVal, 0)}`;
    setHud();
  };

  const setSurfaceScale = (S: number) => {
    diffuse.surfaceScale.baseVal = S;      // one height value for both lighting primitives (note 5)
    specular.surfaceScale.baseVal = S;
    rulerGroups.forEach(g => g.classList.toggle('selected', Number(g.dataset.scale) === S));
    sync();
  };
  const setMode = (mode: Mode) => {
    const next = lights[mode];
    diffuse.replaceChild(next[0], diffuse.firstElementChild!);   // exactly one light child each (note 6)
    specular.replaceChild(next[1], specular.firstElementChild!);
    state.mode = mode;
    (Object.keys(modeBtns) as Mode[]).forEach(m => modeBtns[m].classList.toggle('active', m === mode));
    writeLightPosition();
    if (mode !== 'spot') { lights[mode === 'point' ? 'point' : 'distant']; }
    sync();
  };
  const setTint = (tint: Tint) => {
    state.tint = tint;
    [diffuse, specular].forEach(fe => { fe.classList.remove('tint-white', 'tint-amber', 'tint-cyan'); fe.classList.add(`tint-${tint}`); });
    stage.querySelector('#lamp-bulb')!.setAttribute('fill', TINTS[tint]);
    (Object.keys(tintBtns) as Tint[]).forEach(t => tintBtns[t].classList.toggle('active', t === tint));
    setHud();
  };
  const stopAuto = () => {
    if (!state.auto) return;
    const t = stage.getCurrentTime() - state.phase;
    state.lamp.x = smilValue(X_STOPS, t, 'paced'); state.lamp.y = smilValue(Y_STOPS, t, 'paced');
    allAnimates().forEach(a => { if (a.isConnected) a.endElement(); });
    state.auto = false;
    writeLightPosition();
    sync();
  };
  const rescan = () => {
    state.phase = stage.getCurrentTime();
    allAnimates().forEach(a => { if (a.isConnected) a.beginElement(); });
    state.auto = true;
    sync();
  };

  // ---------- event log (delegated on #bench; mouseover bubbles, mouseenter is captured per tile) ----------
  const logBuf: string[] = [];
  const log = (type: string, target: EventTarget | null) => {
    const id = (target as Element | null)?.closest?.('[id]')?.id ?? 'stage';
    logBuf.push(`${type} · #${id}`); while (logBuf.length > 4) logBuf.shift();
    logLines.forEach((line, i) => { line.textContent = logBuf[i] ?? '·'; line.setAttribute('class', i === logBuf.length - 1 ? '' : 'dim'); });
  };
  const toStage = (e: PointerEvent | MouseEvent) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(stage.getScreenCTM()!.inverse()); return { x: p.x, y: p.y }; };
  const pointInPlate = (x: number, y: number) => {
    try { return plateFace.isPointInFill(new DOMPoint(x, y)); }
    catch { const p = stage.createSVGPoint(); p.x = x; p.y = y; return plateFace.isPointInFill(p as unknown as DOMPointInit); }
  };

  let drag: { handle: Element; kind: string } | null = null;
  bench.addEventListener('pointerdown', e => {
    const handle = (e.target as Element).closest('[data-handle]');
    log('pointerdown', e.target);
    if (!handle) return;
    e.preventDefault();
    drag = { handle, kind: handle.getAttribute('data-handle')! };
    handle.setPointerCapture(e.pointerId);            // api:Element.setPointerCapture
    if (drag.kind === 'head') stopAuto();              // first touch hands control from SMIL to the pointer
  });
  bench.addEventListener('gotpointercapture', e => { (e.target as Element).closest('[data-handle]')?.classList.add('captured'); log('gotpointercapture', e.target); });
  const endDrag = (e: PointerEvent) => {
    const handle = (e.target as Element).closest?.('[data-handle]');
    if (handle?.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    handle?.classList.remove('captured');
    if (drag && (handle === drag.handle || e.type === 'lostpointercapture')) drag = null;
    log(e.type, e.target);
  };
  bench.addEventListener('pointerup', endDrag);
  bench.addEventListener('lostpointercapture', endDrag);
  bench.addEventListener('pointermove', e => {
    window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
    const p = toStage(e);
    if (drag) {
      const spot = lights.spot[0];
      if (drag.kind === 'head') {
        // keep the lamp within the arm's reach and on stage
        let x = clamp(p.x, 20, 1380), y = clamp(p.y, 20, 880);
        const dx = x - BASE.x, dy = y - BASE.y, d = Math.hypot(dx, dy);
        if (d > REACH) { x = BASE.x + dx / d * REACH; y = BASE.y + dy / d * REACH; }
        state.lamp.x = x; state.lamp.y = y; writeLightPosition();
      } else if (drag.kind === 'aim') {
        state.aim.x = clamp(p.x, 0, 1400); state.aim.y = clamp(p.y, 0, 900);
        spotAttr('pointsAtX', state.aim.x); spotAttr('pointsAtY', state.aim.y);   // api:SVGFESpotLightElement.pointsAtX
      } else if (drag.kind === 'z') {
        const z = Math.round(clamp((SIDE.base - p.y) / SIDE.zScale, 20, 200));
        state.lamp.z = z; spotAttr('z', z); lights.point.forEach(l => { l.z.baseVal = z; });
      } else {
        const ang = clamp(Math.atan2(p.x - DIAL.cx, -(p.y - DIAL.cy)) * 180 / Math.PI, -135, 135), u = (ang + 135) / 270;
        if (drag.kind === 'cone') spotAttr('limitingConeAngle', Math.round(6 + u * 42));
        else spotAttr('specularExponent', Math.round(1 + u * 39));
      }
      sync();
      return;
    }
    // probe: pure pointer movement over the plate reads the height map through isPointInFill
    const over = p.x >= PLATE.x && p.x <= PLATE.x + PLATE.w && p.y >= PLATE.y && p.y <= PLATE.y + PLATE.h;
    probe.setAttribute('visibility', over ? 'visible' : 'hidden');
    if (over) {
      const onFace = pointInPlate(p.x, p.y);
      stage.querySelector('#probe-h')!.setAttribute('x1', String(PLATE.x)); stage.querySelector('#probe-h')!.setAttribute('x2', String(PLATE.x + PLATE.w));
      stage.querySelector('#probe-h')!.setAttribute('y1', fmt(p.y)); stage.querySelector('#probe-h')!.setAttribute('y2', fmt(p.y));
      stage.querySelector('#probe-v')!.setAttribute('y1', String(PLATE.y)); stage.querySelector('#probe-v')!.setAttribute('y2', String(PLATE.y + PLATE.h));
      stage.querySelector('#probe-v')!.setAttribute('x1', fmt(p.x)); stage.querySelector('#probe-v')!.setAttribute('x2', fmt(p.x));
      stage.querySelector('#probe-dot')!.setAttribute('cx', fmt(p.x)); stage.querySelector('#probe-dot')!.setAttribute('cy', fmt(p.y));
      probeReadout.textContent = `probe x ${fmt(p.x, 0)} y ${fmt(p.y, 0)} · ${onFace ? `face · h = S = ${diffuse.surfaceScale.baseVal}` : 'cut-out · h = 0'} · ${insideCone(p.x, p.y) ? 'in cone' : 'outside cone'}`;
    }
  });
  bench.addEventListener('mouseover', e => log('mouseover', e.target), true);
  bench.addEventListener('mouseenter', e => { if ((e.target as Element).hasAttribute?.('data-tile')) log('mouseenter', e.target); }, true);
  bench.addEventListener('click', e => {
    const t = e.target as Element;
    const mode = t.closest('[data-mode]')?.getAttribute('data-mode') as Mode | undefined;
    const tint = t.closest('[data-tint]')?.getAttribute('data-tint') as Tint | undefined;
    const ruler = t.closest('[data-scale]');
    if (mode) setMode(mode);
    else if (tint) setTint(tint);
    else if (ruler) setSurfaceScale(Number(ruler.getAttribute('data-scale')));
    else if (t.closest('[data-action="rescan"]')) rescan();
    log('click', e.target);
  });

  // ---------- initial state, auto-scan loop, export pose ----------
  setTint('white');
  modeBtns.spot.classList.add('active');
  setSurfaceScale(SURFACE0);
  writeLightPosition();
  if (webkitFallback) allAnimates().forEach(a => { if (a.isConnected && a.parentElement?.localName !== 'use') a.endElement(); });

  const tick = () => {
    if (state.auto) {
      const t = stage.getCurrentTime() - state.phase;
      state.lamp.x = smilValue(X_STOPS, t, 'paced'); state.lamp.y = smilValue(Y_STOPS, t, 'paced');
      writeLightPosition();
      sync();
    }
    requestAnimationFrame(tick);
  };
  if (isExport()) {
    // deliberate still: the scan highlight sits at the plate's upper right, paced/linear pointers clearly apart
    freezeAt(stage, EXPORT_TIME);
    state.lamp.x = smilValue(X_STOPS, EXPORT_TIME, 'paced'); state.lamp.y = smilValue(Y_STOPS, EXPORT_TIME, 'paced');
    writeLightPosition();
    sync();
  } else {
    sync();
    requestAnimationFrame(tick);
  }

  mark(stage,
    'concept:lighting-alpha-bump-map', 'concept:convolve-emboss', 'concept:convolve-sharpen', 'concept:convolve-edge-detect',
    'concept:convolve-box-blur', 'concept:brushed-metal-texture', 'concept:chrome-metal-effect', 'concept:animated-light-source',
    'concept:diffuse-output-opaque', 'concept:single-light-source-child', 'concept:specular-composite-add',
    'concept:mouse-events', 'concept:drag-with-pointer-events', 'concept:event-delegation-on-group', 'concept:mouseenter-vs-mouseover',
    'api:Element.setPointerCapture', 'api:SVGFEConvolveMatrixElement.kernelMatrix', 'api:SVGFEDistantLightElement.azimuth',
    'api:SVGFEPointLightElement.x', 'api:SVGFESpotLightElement.pointsAtX',
    'av:feGaussianBlur.stdDeviation=two-values');
}
