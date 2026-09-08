// pipeline-mimic-board — 管网模拟盘 (docs/svg-feature-demos.md §3.9)
// A process mimic board where every arrowhead, butterfly valve, instrument bubble and dimension tick is a <marker>
// grown on the vertices of polyline / line / polygon / path hosts. The right-hand column dissects the marker
// geometry rules (bisector, closed-path direction, non-scaling-stroke, refX / markerWidth / preserveAspectRatio)
// and the bottom band carries dimensioning, legend, interlock graph and the marker-vs-symbol comparison.
import { el, fragment, mark, isExport, freezeAt, fontFaceCss, FONT_CJK, mulberry32 } from './lib';
import { buildAnatomy } from './pipeline-mimic-board-anatomy';
import { buildBand } from './pipeline-mimic-board-band';
import { runProbes, wireInteraction } from './pipeline-mimic-board-interact';

export const TAG_FONT = "'MimicMono', ui-monospace, 'Studio Mono', Menlo, monospace";
export const UI_FONT = FONT_CJK;
export const INK = '#e9e2d8';
export const DIM = '#b9b1a6';

type Attrs = Record<string, string | number | undefined>;
/** UI label (CJK-capable sans). */
export const label = (x: number, y: number, str: string, attrs: Attrs = {}) =>
  el('text', { x, y, 'font-family': UI_FONT, 'font-size': 12, fill: INK, ...attrs }, str);
/** Equipment tag (narrow mono face embedded as data-URI @font-face 'MimicMono'). */
export const tag = (x: number, y: number, str: string, attrs: Attrs = {}) =>
  el('text', { x, y, 'font-family': TAG_FONT, 'font-size': 12, fill: INK, ...attrs }, str);
/** Semi-transparent board plate — the stage itself stays transparent (no full-stage backdrop). */
export const plate = (x: number, y: number, w: number, h: number) =>
  el('rect', { x, y, width: w, height: h, rx: 10, fill: 'rgba(28,26,24,.82)', stroke: 'rgba(200,150,90,.28)' });

/** Design tokens + all marker-related CSS. `:root` custom properties, the MimicMono @font-face (css:font-face-data-uri),
 *  the `marker` shorthand (pr:marker), inherited marker-mid on a group, `marker:none`, the `.live` state swap and hover/active. */
function styleText(): string {
  return `
:root{--steam:#e8792b;--cw:#7f9db0;--cond:#c98a3c;--panel:#8d959b;--ink:#e9e2d8;--alarm:#ff5a3c;--hi:#ffd166}
${fontFaceCss(['Studio Mono']).replace("'Studio Mono'", "'MimicMono'")}
.dim{marker:url(#mk-dim)}                 /* pr:marker — one shorthand declaration covers start, mid and end ticks */
.equip{marker:url(#mk-weld)}              /* weld dots on every vertex of the filled equipment polygons */
#instr-group{marker-mid:url(#mk-inst)}    /* concept:marker-property-inheritance — every signal line inherits the bubble */
.isolated{marker:none}                    /* pv:marker=none — isolated maintenance segment loses all symbols */
.pipe{cursor:crosshair;transition:stroke .3s ease,stroke-width .3s ease}   /* concept:hover-state-transition */
.pipe.dn300:hover{stroke-width:11}
.pipe.dn100:hover{stroke-width:5}
.pipe.dn50:hover{stroke-width:4}
.pipe:active{stroke:var(--ink)}           /* css:active — pressed pipe goes ink-white */
.live{marker-start:url(#mk-cursor);marker-mid:url(#mk-valve-hi);marker-end:url(#mk-arrow-hi)}  /* concept:marker-css-state-swap */
.hit .tip{opacity:0;transition:opacity .2s}
.hit:hover .tip{opacity:1}                /* css:hover — tooltip on the <use> valve (markers cannot be hovered) */
.btn{cursor:pointer}
.btn rect{fill:#2f3439;stroke:var(--panel);transition:fill .2s}
.btn:hover rect{fill:#3d444b}
.btn:active rect{fill:#15171a}
`;
}

/** The marker family. Everything lives in <defs>; markers are never drawn directly (UA style display:none). */
function defsMarkup(): string {
  const ARROW = 'M6 14 L92 50 L6 86 Z';
  const VALVE = 'M8 18 L50 50 L8 82 Z M92 18 L50 50 L92 82 Z';
  const valveBody = (fill: string, stroke: string) =>
    `<path d="${VALVE}" fill="${fill}" stroke="${stroke}" stroke-width="8" stroke-linejoin="round"/>
     <ellipse cx="50" cy="50" rx="6" ry="30" fill="${stroke}">
       <animateTransform attributeName="transform" type="rotate" values="0 50 50;90 50 50;0 50 50" dur="9.6s" repeatCount="indefinite"/>
     </ellipse>`; // concept:marker-animated-content — the disc pulses inside the marker; at t=2.4s it sits at 45° (half open)
  const flange = `<rect x="10" y="10" width="80" height="80" rx="10" fill="#7f9db0" stroke="#e9e2d8" stroke-width="6"/><circle cx="50" cy="50" r="16" fill="#1c1a18"/>`;
  return `
<defs>
  <!-- userSpaceOnUse gradient for the DN300 steam main; #mk-arrow picks it up through fill=context-stroke -->
  <linearGradient id="g-steam" gradientUnits="userSpaceOnUse" x1="72" y1="0" x2="420" y2="0">
    <stop offset="0" stop-color="#e8792b"/><stop offset="1" stop-color="#c98a3c"/>
  </linearGradient>
  <!-- objectBoundingBox gradient resolved against the marker content's own bbox (concept:gradient-on-marker) -->
  <radialGradient id="g-head" cx=".35" cy=".5" r=".75">
    <stop offset="0" stop-color="#ffd9b0"/><stop offset=".55" stop-color="#e8792b"/><stop offset="1" stop-color="#8a3d12"/>
  </radialGradient>
  <pattern id="p-hatch" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
    <rect width="20" height="20" fill="#3b3a38"/><rect width="8" height="20" fill="#c98a3c"/>
  </pattern>
  <!-- symbol twin of the valve for the marker-vs-symbol comparison; its parts use context paints from <use> -->
  <symbol id="sym-valve" viewBox="0 0 100 100">
    <path d="${VALVE}" fill="context-fill" stroke="context-stroke" stroke-width="8" stroke-linejoin="round"/>
    <ellipse cx="50" cy="50" rx="6" ry="30" fill="context-stroke" transform="rotate(45 50 50)"/>
  </symbol>

  <!-- #mk-arrow: the one arrowhead. fill=context-stroke → solid tip in the host's stroke paint; strokeWidth units;
       orient=auto-start-reverse makes the start copy point backwards, so one definition reads as reversible flow. -->
  <marker id="mk-arrow" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
    <path d="${ARROW}" fill="context-stroke"/>
  </marker>
  <!-- traditional fallback: a second definition rotated 180° around the anchor (concept:marker-reverse-arrow-fallback) -->
  <marker id="mk-arrow-rev" viewBox="0 0 100 100" refX="8" refY="50" markerUnits="strokeWidth" markerWidth="4" markerHeight="4" orient="auto">
    <path d="${ARROW}" fill="context-stroke" transform="rotate(180 50 50)"/>
  </marker>
  <marker id="mk-arrow-hi" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="${ARROW}" fill="#ffd166" stroke="#1c1a18" stroke-width="4"/>
  </marker>
  <marker id="mk-arrow-plain" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6" orient="auto">
    <path d="${ARROW}" fill="#e9e2d8"/>
  </marker>
  <marker id="mk-arrow-ghost" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
    <path d="${ARROW}" fill="none" stroke="#7f9db0" stroke-width="6" stroke-dasharray="12 8"/>
  </marker>

  <!-- #mk-valve: butterfly valve — outline stroke=context-stroke, interior fill=context-fill (hollow on fill=none pipes,
       solid on filled hosts); strokeWidth units so DN300 valves are big and DN50 valves small. -->
  <marker id="mk-valve" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto">
    ${valveBody('context-fill', 'context-stroke')}
  </marker>
  <marker id="mk-valve-hi" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto">
    ${valveBody('#5a4210', '#ffd166')}
  </marker>
  <!-- dynamic twin of marker:none — SMIL drives markerWidth 6 → 0, a zero viewport disables the marker entirely -->
  <marker id="mk-valve-off" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto">
    ${valveBody('context-fill', 'context-stroke')}
    <animate attributeName="markerWidth" values="6;0;0;6" keyTimes="0;.3;.7;1" dur="6s" repeatCount="indefinite"/>
  </marker>

  <!-- #mk-inst: instrument bubble, userSpaceOnUse so the tag stays 24px on any pipe; no viewBox → content in px;
       the <text> names MimicMono explicitly because marker content does not inherit the host's font (style isolation). -->
  <marker id="mk-inst" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" refX="12" refY="12" orient="0">
    <circle cx="12" cy="12" r="10.5" fill="#1c1a18" stroke="context-stroke" stroke-width="1.6"/>
    <text x="12" y="16" font-size="11" text-anchor="middle" font-family="MimicMono, ui-monospace, monospace" fill="#e9e2d8">FT</text>
  </marker>
  <!-- #mk-tick: range tick hanging below the line — refY=0 puts the anchor at the top of the bar -->
  <marker id="mk-tick" viewBox="0 0 100 100" refX="50" refY="0" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="14" orient="auto" preserveAspectRatio="none">
    <rect x="35" y="0" width="30" height="100" fill="#e9e2d8"/>
  </marker>
  <!-- #mk-dim: dimension end tick — a bar along local y; orient=auto keeps it perpendicular to any dimension line -->
  <marker id="mk-dim" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="16" orient="auto" preserveAspectRatio="none">
    <rect x="42" y="0" width="16" height="100" fill="#e9e2d8"/>
  </marker>
  <!-- #mk-node: interlock node circle with a text glyph (concept:marker-graph-nodes, concept:marker-text-content) -->
  <marker id="mk-node" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" orient="0">
    <circle cx="50" cy="50" r="44" fill="#8d959b" stroke="#1c1a18" stroke-width="6"/>
    <text x="50" y="69" font-size="54" font-weight="700" text-anchor="middle" font-family="MimicMono, ui-monospace, monospace" fill="#1c1a18">I</text>
  </marker>
  <!-- #mk-hatch: insulation hatch filled by a <pattern>, fixed-angle orient (av:marker.orient=angle); the panel buttons
       flip it with setOrientToAuto() / setOrientToAngle() -->
  <marker id="mk-hatch" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="22" orient="30" preserveAspectRatio="none">
    <rect x="20" y="0" width="60" height="100" fill="url(#p-hatch)"/>
  </marker>
  <!-- #mk-head: main-flow arrow with its own radialGradient; SMIL toggles orient between a fixed angle and auto -->
  <marker id="mk-head" viewBox="0 0 100 100" refX="94" refY="50" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M4 8 L94 50 L4 92 L28 50 Z" fill="url(#g-head)" stroke="#3b2a1f" stroke-width="3"/>
    <animate attributeName="orient" values="auto;0;auto;auto" keyTimes="0;.5;.75;1" calcMode="discrete" dur="6s" repeatCount="indefinite"/>
  </marker>
  <!-- #mk-noz: nozzle symbol whose inner polyline carries its own marker-end (concept:nested-markers) -->
  <marker id="mk-noz" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="4" markerHeight="4" orient="auto">
    <rect x="0" y="16" width="14" height="68" fill="context-stroke"/>
    <polyline id="mk-noz-stem" points="14,50 62,50" fill="none" stroke="context-stroke" stroke-width="10" marker-end="url(#mk-noz-tip)"/>
  </marker>
  <marker id="mk-noz-tip" viewBox="0 0 100 100" refX="90" refY="50" markerUnits="strokeWidth" markerWidth="4" markerHeight="4" orient="auto">
    <path d="M10 15 L90 50 L10 85 Z" fill="#e9e2d8"/>
  </marker>
  <!-- #mk-weld: vertex dot for filled equipment polygons — ring stroke=context-fill, core fill=context-fill -->
  <marker id="mk-weld" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14">
    <circle cx="50" cy="50" r="36" fill="#1c1a18" stroke="context-fill" stroke-width="14"/>
    <circle cx="50" cy="50" r="12" fill="context-fill"/>
  </marker>
  <!-- #mk-alarm: currentColor inside marker content follows the marker's own color, not the host's (concept:marker-currentcolor) -->
  <marker id="mk-alarm" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="20" markerHeight="20" color="#ff5a3c">
    <polygon points="50,6 94,84 6,84" fill="currentColor" stroke="#1c1a18" stroke-width="6" stroke-linejoin="round"/>
    <text x="50" y="76" font-size="46" font-weight="700" text-anchor="middle" font-family="MimicMono, ui-monospace, monospace" fill="#1c1a18">!</text>
  </marker>
  <!-- #mk-cursor: range cursor; refX is animated (additive) so the glyph slides along the tangent of the start segment -->
  <marker id="mk-cursor" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="26" refX="-4" refY="13" orient="auto">
    <path d="M7 0 L14 13 L7 26 L0 13 Z" fill="#ffd166" stroke="#1c1a18" stroke-width="1"/>
    <animate id="cursor-slide" attributeName="refX" values="0;-80;0" dur="6s" additive="sum" repeatCount="indefinite"/>
  </marker>
  <!-- userSpaceOnUse reference square for W3 (still scales with the CTM, unlike the stroke) -->
  <marker id="mk-ref-us" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8">
    <rect x="6" y="6" width="88" height="88" fill="#c98a3c"/>
  </marker>

  <!-- W4 geometry trio -->
  <marker id="mk-ref0" viewBox="0 0 100 100" refX="0" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6" orient="auto"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-refc" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6" orient="auto"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-w3" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="3" markerHeight="3" orient="auto"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-w8" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-novb" refX="0" refY="4" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L100 40 L0 80 Z" fill="#e9e2d8"/></marker>
  <marker id="mk-par-l" viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="8" markerHeight="4" orient="auto">${flange}</marker>
  <marker id="mk-par-r" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMid meet" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="8" markerHeight="4" orient="auto">${flange}</marker>
  <marker id="mk-par-n" viewBox="0 0 100 100" preserveAspectRatio="none" refX="50" refY="50" markerUnits="strokeWidth" markerWidth="8" markerHeight="4" orient="auto">${flange}</marker>
  <marker id="mk-o1" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6" orient="45"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-o2" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-o3" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6"><path d="${ARROW}" fill="#e9e2d8"/></marker>
  <marker id="mk-o4" viewBox="0 0 100 100" refX="92" refY="50" markerUnits="strokeWidth" markerWidth="6" markerHeight="6"><path d="${ARROW}" fill="#e9e2d8"/></marker>
</defs>
<!-- concept:marker-display-ua-style — a marker outside <defs> is still never rendered directly, only when referenced -->
<marker id="mk-dot" viewBox="0 0 100 100" refX="50" refY="50" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8">
  <circle cx="50" cy="50" r="40" fill="context-stroke" stroke="#1c1a18" stroke-width="10"/>
</marker>`;
}

/** Main process board (24,24,976,636): tank, exchanger, pump skid, cooling loop, pipes and signal lines. */
function buildMainBoard(): SVGGElement {
  const g = el('g', { id: 'main-board' });
  g.append(plate(24, 24, 976, 636));
  g.append(label(40, 52, 'UNIT 300 · 车间调度模拟盘 — 阀、箭头、仪表圈、量程撇全部由 <marker> 在顶点生成', { 'font-size': 15, 'font-weight': 700 }));

  // ── equipment polygons with real fill → weld-dot markers pick the fill via context-fill (.equip{marker:url(#mk-weld)})
  g.append(el('polygon', { id: 'tank', class: 'equip', points: '72,140 192,140 192,318 132,340 72,318', fill: '#4a545c', stroke: 'var(--panel)', 'stroke-width': 2 }));
  g.append(el('rect', { x: 74, y: 236, width: 116, height: 80, fill: '#5f7b8c', opacity: .75 })); // liquid level
  g.append(tag(132, 200, 'T-01', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }));
  g.append(label(132, 216, '原料罐', { 'text-anchor': 'middle', fill: DIM, 'font-size': 11 }));
  g.append(el('polygon', { id: 'exchanger', class: 'equip', points: '470,150 650,150 650,270 470,270', fill: '#3f474d', stroke: 'var(--panel)', 'stroke-width': 2 }));
  g.append(el('polyline', { points: '484,186 504,258 524,186 544,258 564,186 584,258 604,186 624,258 638,186', fill: 'none', stroke: 'var(--panel)', 'stroke-width': 1.5, opacity: .8 })); // baffles
  g.append(tag(560, 172, 'E-01 换热器', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, 'font-family': UI_FONT }));
  // cooling-water closed loop: polygon (el:polygon) with low-opacity fill
  g.append(el('polygon', { id: 'cw-loop', class: 'equip pipe dn50', points: '700,250 860,232 905,340 862,470 716,486 658,368', fill: '#7f9db0', 'fill-opacity': .18, stroke: 'var(--cw)', 'stroke-width': 3, 'data-dn': '50', 'data-medium': '冷却水闭环' }));
  g.append(label(782, 352, 'CW-01 冷却水闭环', { 'text-anchor': 'middle', fill: DIM, 'font-size': 11 }));
  g.append(label(782, 368, 'polygon · 顶点焊点 = #mk-weld (context-fill)', { 'text-anchor': 'middle', fill: DIM, 'font-size': 11 }));

  // ── steam main 1: gradient stroke; #mk-arrow inherits the gradient through context-stroke (concept:context-paint-gradient)
  g.append(el('polyline', { id: 'st1', class: 'pipe dn300', points: '72,96 420,96 420,150', fill: 'none', stroke: 'url(#g-steam)', 'stroke-width': 9,
    'marker-start': 'url(#mk-noz)', 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '300', 'data-medium': '蒸汽' }));
  // insulation hatch track: stroke=none host, only markers show (concept:marker-without-stroke)
  g.append(el('polyline', { id: 'insulation', points: '130,80 160,80 190,80 220,80 250,80 280,80 310,80 340,80 370,80 400,80', fill: 'none', stroke: 'none', 'stroke-width': 4, 'marker-mid': 'url(#mk-hatch)' }));
  g.append(label(312, 140, 'DN300 蒸汽总管 · stroke=url(#g-steam) · 上方保温撇 #mk-hatch（宿主 stroke=none）', { 'font-size': 11, fill: DIM }));
  // curved inlet: orient=auto follows the Bézier tangent (concept:marker-curve-tangent)
  g.append(el('path', { id: 'st-inlet', class: 'pipe dn300', d: 'M420,150 C420,195 435,210 470,210', fill: 'none', stroke: 'var(--steam)', 'stroke-width': 9, 'marker-end': 'url(#mk-arrow)', 'data-dn': '300', 'data-medium': '蒸汽' }));
  // steam main 2: nozzle start, corner valve, gradient head (#mk-head) at the end
  g.append(el('polyline', { id: 'st2', class: 'pipe dn300', points: '650,210 940,210 940,470', fill: 'none', stroke: 'var(--steam)', 'stroke-width': 9,
    'marker-start': 'url(#mk-noz)', 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-head)', 'data-dn': '300', 'data-medium': '蒸汽' }));
  g.append(label(664, 228, 'DN300 → 冷凝器 · 折点即阀位 · 末端 #mk-head', { 'font-size': 11, fill: DIM }));

  // ── return branch: ONE marker (#mk-arrow) at both ends, auto-start-reverse flips the start copy → reversible flow
  g.append(el('polyline', { id: 'return', class: 'pipe dn100', points: '560,290 560,360 300,360 300,132 150,132', fill: 'none', stroke: 'var(--cond)', 'stroke-width': 4,
    'marker-start': 'url(#mk-arrow)', 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '100', 'data-medium': '回流' }));
  g.append(label(430, 344, '回流 DN100 · 两端同一 #mk-arrow (auto-start-reverse) → 可逆流', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));
  // bypass: traditional two-definition fallback (#mk-arrow-rev rotated 180°)
  g.append(el('polyline', { id: 'bypass', class: 'pipe dn100', points: '600,290 600,400 390,400', fill: 'none', stroke: 'var(--cond)', 'stroke-width': 4,
    'marker-start': 'url(#mk-arrow-rev)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '100', 'data-medium': '旁通' }));
  g.append(label(495, 414, '旁通 · 起点用 rotate(180) 的 #mk-arrow-rev 回退', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));
  // crossover: two M subpaths — start/end markers only at the path ends, subpath joins get mid markers (concept:marker-subpath-vertices)
  g.append(el('path', { id: 'crossover', class: 'pipe dn50', d: 'M420,470 L480,470 M500,470 L560,470', fill: 'none', stroke: 'var(--cond)', 'stroke-width': 3,
    'marker-start': 'url(#mk-arrow)', 'marker-mid': 'url(#mk-dot)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '50', 'data-medium': '跨接' }));
  g.append(label(490, 458, '跨接管 · 两个 M 子段：子段端点长 mid 点', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));

  // ── paint-order pair: markers painted first → the thick stroke knocks through the valve symbol
  const stubAttrs = { class: 'pipe dn300', fill: 'var(--ink)', stroke: 'var(--cond)', 'stroke-width': 9, 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '300', 'data-medium': '冷凝液' };
  g.append(el('polyline', { id: 'po-markers', points: '420,562 510,562 600,562', 'paint-order': 'markers stroke fill', ...stubAttrs }));
  g.append(el('polyline', { id: 'po-default', points: '420,622 510,622 600,622', ...stubAttrs }));
  g.append(label(420, 546, 'paint-order="markers stroke fill" → 描边压过阀符（击穿）', { 'font-size': 11, fill: DIM }));
  g.append(el('line', { x1: 510, y1: 578, x2: 510, y2: 606, stroke: DIM, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
  g.append(label(522, 596, '同一阀符 · 默认顺序 → 阀符压描边', { 'font-size': 11, fill: DIM }));

  // ── cooling-water branches (DN50, stroke-width 3 → small valves) — el:line and el:polyline
  // DN50 branch into E-01: the SAME #mk-valve as the DN300 mains, now 15px and grey-blue through context-stroke
  g.append(el('polyline', { id: 'cw-e01', class: 'pipe dn50', points: '700,250 674,250 650,250', fill: 'none', stroke: 'var(--cw)', 'stroke-width': 3, 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '50', 'data-medium': '冷却水' }));
  // gauge run: the range cursor #mk-cursor rides marker-start and slides along via animated refX
  g.append(el('polyline', { id: 'cw-gauge', class: 'pipe dn50', points: '716,486 596,486', fill: 'none', stroke: 'var(--cw)', 'stroke-width': 3,
    'marker-start': 'url(#mk-cursor)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '50', 'data-medium': '冷却水' }));
  g.append(label(656, 474, 'FT-301 量程游标 · #mk-cursor refX 动画', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));
  // isolated maintenance segment: attributes still reference markers, CSS marker:none wins
  g.append(el('polyline', { id: 'isolated', class: 'isolated', points: '716,486 716,514 745,514 745,533', fill: 'none', stroke: 'var(--cw)', 'stroke-width': 3,
    'marker-start': 'url(#mk-valve)', 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)' }));
  g.append(label(752, 526, '隔离检修 .isolated{marker:none}', { 'font-size': 11, fill: DIM }));
  // symbol-off branch: #mk-valve-off's markerWidth is animated to 0 (av:marker.markerWidth=0)
  g.append(el('polyline', { id: 'valve-off', class: 'pipe dn50', points: '862,470 862,494 890,494 890,513', fill: 'none', stroke: 'var(--cw)', 'stroke-width': 3, 'marker-mid': 'url(#mk-valve-off)', 'data-dn': '50', 'data-medium': '补水' }));
  g.append(label(896, 498, '符号停用', { 'font-size': 11, fill: DIM }));
  g.append(label(896, 511, 'markerWidth 6→0', { 'font-size': 11, fill: DIM }));
  // suction from tank to skid — a plain <line> host (at:line.x1)
  g.append(el('line', { id: 'suction', class: 'pipe dn100', x1: 132, y1: 340, x2: 132, y2: 416, stroke: 'var(--cond)', 'stroke-width': 4, 'marker-end': 'url(#mk-arrow)', 'data-dn': '100', 'data-medium': '物料' }));

  // ── pump skid under skewX(-12): pipes, valves and arrows are sheared together (concept:marker-transform-inheritance)
  const skid = el('g', { id: 'skid', transform: 'skewX(-12) translate(236,392)' });
  skid.append(el('rect', { x: 0, y: 0, width: 220, height: 110, rx: 4, fill: '#2b3035', stroke: 'var(--panel)', 'stroke-width': 1.5 }));
  skid.append(el('polyline', { id: 'skid-header', class: 'pipe dn100', points: '-24,30 60,30 160,30 244,30', fill: 'none', stroke: 'var(--cond)', 'stroke-width': 4,
    'marker-start': 'url(#mk-noz)', 'marker-mid': 'url(#mk-valve)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '100', 'data-medium': '泵撬汇管' }));
  for (const [x, name] of [[60, 'P-01'], [160, 'P-02']] as const) {
    skid.append(el('line', { x1: x, y1: 30, x2: x, y2: 54, stroke: 'var(--cond)', 'stroke-width': 4 }));
    skid.append(el('circle', { cx: x, cy: 76, r: 21, fill: '#3a4148', stroke: 'var(--cond)', 'stroke-width': 3 }));
    skid.append(tag(x, 80, name, { 'text-anchor': 'middle', 'font-size': 11 }));
  }
  g.append(skid);
  g.append(label(240, 522, '泵撬 P-01/P-02 · g[transform="skewX(-12)"] → 阀符与箭头随管线一起切变', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));
  // cooling-tower platform under skewY(-8): horizontal edges tilt, verticals stay upright (contrast)
  const ct = el('g', { id: 'ct-platform', transform: 'translate(700,556) skewY(-8)' });
  ct.append(el('rect', { x: 0, y: 0, width: 200, height: 56, rx: 3, fill: '#2b3035', stroke: 'var(--panel)', 'stroke-width': 1.5 }));
  for (const cx of [36, 100, 164]) {
    ct.append(el('circle', { cx, cy: 28, r: 15, fill: 'none', stroke: 'var(--cw)', 'stroke-width': 2 }));
    ct.append(el('path', { d: `M${cx - 10} ${28 - 4} L${cx + 10} ${28 + 4} M${cx - 10} ${28 + 4} L${cx + 10} ${28 - 4}`, stroke: 'var(--cw)', 'stroke-width': 1.5 }));
  }
  g.append(ct);
  g.append(label(800, 630, 'CT-01 冷却塔平台 · skewY(-8) 对照：横边倾斜、竖边保持竖直', { 'text-anchor': 'middle', 'font-size': 11, fill: DIM }));

  // ── SMIL-animated path: the end arrow re-orients to the animated tangent (concept:marker-follows-animated-path)
  const flex = el('path', { id: 'p-flex', class: 'pipe dn50', d: 'M36,500 C60,464 94,536 118,500', fill: 'none', stroke: 'var(--cw)', 'stroke-width': 3,
    'marker-start': 'url(#mk-dot)', 'marker-end': 'url(#mk-arrow)', 'data-dn': '50', 'data-medium': '软管' });
  flex.append(fragment(`<animate attributeName="d" values="M36,500 C60,464 94,536 118,500;M36,500 C60,536 94,464 118,500;M36,500 C60,464 94,536 118,500" dur="5s" repeatCount="indefinite"/>`));
  g.append(flex);
  g.append(label(36, 548, 'SMIL 动画 d → 箭头随切线', { 'font-size': 11, fill: DIM }));

  // ── alarm line: host colour is green, but the marker glyph is red — marker content resolves currentColor from the marker
  const alarmHost = el('g', { id: 'alarm-host', color: '#3ad17c' });
  alarmHost.append(el('line', { x1: 192, y1: 240, x2: 240, y2: 240, stroke: 'var(--panel)', 'stroke-width': 1.5, 'stroke-dasharray': '5 3', 'marker-end': 'url(#mk-alarm)' }));
  alarmHost.append(tag(254, 244, 'LAH-101', { 'font-size': 11 }));
  g.append(alarmHost);

  // ── signal lines: dashed strokes, bubble inherited from #instr-group{marker-mid}; group font-size is NOT inherited by the marker text
  const instr = el('g', { id: 'instr-group', fill: 'none', stroke: 'var(--panel)', 'stroke-width': 1.5, 'stroke-dasharray': '6 4', 'font-size': 24 });
  instr.append(el('polyline', { points: '300,96 300,58 350,58' }));
  instr.append(el('polyline', { points: '780,210 780,168 830,168' }));
  instr.append(el('polyline', { points: '656,486 656,528 610,528' }));
  g.append(instr);
  for (const [x, y, name, anchor] of [[356, 62, 'FIC-101', 'start'], [836, 172, 'FIC-201', 'start'], [604, 532, 'FIC-301', 'end']] as const)
    g.append(tag(x, y, name, { 'font-size': 11, 'text-anchor': anchor }));

  // ── panel buttons (setOrientToAuto / setOrientToAngle on #mk-hatch) and readout lines
  for (const [id, x, txt] of [['btn-auto', 690, 'setOrientToAuto()'], ['btn-45', 840, 'setOrientToAngle(45°)']] as const) {
    const b = el('g', { id, class: 'btn', role: 'button', tabindex: 0, transform: `translate(${x},36)` });
    b.append(el('rect', { x: 0, y: 0, width: 144, height: 24, rx: 4 }));
    b.append(el('text', { x: 72, y: 16, 'text-anchor': 'middle', 'font-family': TAG_FONT, 'font-size': 11, fill: INK, 'pointer-events': 'none' }, txt));
    g.append(b);
  }
  g.append(label(984, 76, '↑ 按钮改写 #mk-hatch 的 orient，诊断行回读 DOM 属性', { 'text-anchor': 'end', 'font-size': 11, fill: DIM }));
  g.append(tag(40, 604, '', { id: 'diag-probes', 'font-size': 11, fill: DIM }));
  g.append(tag(40, 618, '', { id: 'diag', 'font-size': 11, fill: DIM }));
  g.append(tag(40, 632, '', { id: 'diag-2', 'font-size': 11, fill: DIM }));
  g.append(label(40, 653, '指针停在管段上 → 整线换高亮标记，量程游标滑到指针处并报出 DN 与流向', { id: 'readout', 'font-size': 12, fill: 'var(--hi)' }));
  return g;
}

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'pmb-title pmb-desc');
  stage.append(el('title', { id: 'pmb-title' }, '管网模拟盘 — 一套 marker 定义扛起流向、阀态、仪表与尺寸标注'));
  stage.append(el('desc', { id: 'pmb-desc' }, '灰橙调车间调度模拟盘：主盘上的原料罐、换热器、泵撬与冷却水环由 polyline、line、polygon 拉通，全部箭头、蝶阀、仪表圈与量程撇是同一批 marker 在顶点生成；右柱四扇解剖窗放大 marker 的角平分线、闭合方向、非缩放描边与 refX/markerWidth/preserveAspectRatio 规则；底带是尺寸标注、图例、联锁小图与 marker 对 symbol 的取舍。'));
  stage.append(el('style', {}, styleText()));
  stage.append(fragment(defsMarkup()));
  stage.append(buildMainBoard());
  stage.append(buildAnatomy(stage));
  stage.append(buildBand(stage, mulberry32(309)));

  await runProbes(stage);
  wireInteraction(stage);

  // Features exercised but not derivable from markup alone.
  mark(stage,
    // core
    'concept:marker-vertex-bisector', 'concept:marker-dimension-ticks', 'concept:marker-closed-path-direction',
    'concept:marker-smil-attribute-animation', 'concept:marker-non-scaling-stroke', 'concept:gradient-on-marker',
    'api:SVGMarkerElement.setOrientToAuto', 'av:marker.orient=angle', 'concept:marker-arrowhead', 'concept:marker-css-state-swap',
    'concept:marker-graph-nodes', 'concept:marker-transform-inheritance', 'concept:marker-vertex-glyphs', 'concept:marker-vs-symbol',
    'css:hover', 'pv:transform=skewX', 'pv:transform=skewY',
    // detail tier, genuinely exercised
    'api:SVGPointList', 'concept:line-has-no-fill-area', 'concept:polyline-fill-implicit-close', 'concept:context-paint-in-use',
    'api:CSSStyleDeclaration.markerEnd', 'api:SVGBoundingBoxOptions.markers', 'api:SVGMarkerElement.markerUnits',
    'api:SVGMarkerElement.orientType', 'api:SVGMarkerElement.refX', 'api:SVGMarkerElement.setOrientToAngle', 'api:SVGMarkerElement.viewBox',
    'av:marker.markerWidth=0', 'concept:context-paint-gradient', 'concept:marker-animated-content', 'concept:marker-content-paint-servers',
    'concept:marker-currentcolor', 'concept:marker-curve-tangent', 'concept:marker-dashed-stroke', 'concept:marker-display-ua-style',
    'concept:marker-follows-animated-path', 'concept:marker-pointer-events', 'concept:marker-property-inheritance',
    'concept:marker-reverse-arrow-fallback', 'concept:marker-style-isolation', 'concept:marker-subpath-vertices', 'concept:marker-text-content',
    'concept:marker-without-stroke', 'concept:marker-zero-length-direction', 'concept:nested-markers', 'css:marker-properties',
    'css:active', 'concept:hover-state-transition', 'concept:points-odd-coordinate-count', 'concept:points-parse-error-partial-render',
    'concept:markers-on-basic-shapes', 'av:marker.refX=center', 'css:font-face-data-uri');

  // Export still: cursor mid-run on its segment, valve discs half open (45°), #mk-head back on orient=auto.
  if (isExport()) freezeAt(stage, 2.4);
}
