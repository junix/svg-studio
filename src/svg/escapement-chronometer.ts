// escapement-chronometer — 擒纵天文钟 (docs/svg-feature-demos.md §3.14).
// A cut-away brass chronometer whose entire gear train is assembled from declarative SMIL timing
// relations: syncbase begins, accumulate/additive stacking, keySplines vs linear, keyPoints motion,
// discard, set, restart modes, and a timeline-scrubbing time base. No script drives the mechanism —
// script only reads the timeline (getStartTime / getSimpleDuration / getCurrentTime) and seeks it.
import { el, fragment, isExport, freezeAt, mark, FONT_CJK, FONT_MONO } from './lib';
import {
  BRASS, BRASS_HI, BROWN, STEEL, RUBY, CREAM, SAGE, FELT, ORANGE, INK,
  polar, gearPath, escapeWheelPath, spiralPath, camPath, starPath, arcPath, label, mono, wheelParts, easingChart, button,
} from './escapement-chronometer-parts';

const T0 = 7.40;            // exported still frame (seconds of document time)
const T_MAX = 12;           // timeline ruler extent
const RULER_X0 = 70, RULER_PX = 77.5;  // x = 70 + t·77.5
const tx = (t: number): number => RULER_X0 + t * RULER_PX;
const BEAT = 0.8;
const SPLINE = '0.42 0 0.58 1;0.42 0 0.58 1';

declare global { interface Window { __chronoStrikeBegin?: (event: Event) => void } }

type AnimEl = SVGAnimationElement & { getStartTime(): number; getSimpleDuration(): number; getCurrentTime(): number; targetElement: SVGElement | null };

// Pre-computed schedule (same numbers as the SMIL attributes). Rows are lit by real DOM events only.
const SCHEDULE: { t: number; id: string; type: 'beginEvent' | 'repeatEvent' | 'endEvent'; n?: number }[] = [
  { t: 0.00, id: 'a_asm1', type: 'beginEvent' },
  { t: 0.60, id: 'a_asm1', type: 'endEvent' },
  { t: 1.10, id: 'a_asm3', type: 'beginEvent' },
  { t: 2.40, id: 'a_asm4', type: 'endEvent' },
  { t: 2.40, id: 'a_balance', type: 'beginEvent' },
  { t: 2.58, id: 'a_escape', type: 'beginEvent' },
  { t: 3.20, id: 'a_balance', type: 'repeatEvent', n: 1 },
  { t: 7.20, id: 'a_balance', type: 'repeatEvent', n: 6 },
  { t: 7.20, id: 'a_strike', type: 'beginEvent' },
  { t: 8.25, id: 'a_strike', type: 'endEvent' },
  { t: 12.00, id: 'a_balance_hard', type: 'endEvent' },
];

// Timeline ruler lanes (§11): which animation ids each swim lane shows.
const LANES: { name: string; ids: string[] }[] = [
  { name: '装配', ids: ['a_asm1', 'a_asm2', 'a_asm3', 'a_asm4'] },
  { name: '摆轮', ids: ['a_balance', 'a_balance_hard'] },
  { name: '叉瓦', ids: ['a_fork'] },
  { name: '擒纵', ids: ['a_escape'] },
  { name: '分轮', ids: ['a_minute'] },
  { name: '打点', ids: ['a_strike', 'a_hammer'] },
  { name: '凸轮', ids: ['a_cam_a', 'a_cam_b'] },
  { name: '跳秒', ids: ['a_seconds'] },
];
const LANE_Y0 = 704, LANE_H = 20;
const laneOf = (id: string): number => LANES.findIndex(l => l.ids.includes(id));

// Syncbase connectors drawn on the ruler (§11): from a dependency's begin/end/repeat to the dependent lane.
const LINKS: { from: string; at: 'begin' | 'end' | 'repeat'; n?: number; offset?: number; to: string; text: string }[] = [
  { from: 'a_asm3', at: 'end', to: 'a_asm4', text: 'a_asm3.end' },
  { from: 'a_asm4', at: 'end', to: 'a_balance', text: 'a_asm4.end' },
  { from: 'a_balance', at: 'begin', to: 'a_fork', text: 'a_balance.begin' },
  { from: 'a_fork', at: 'begin', offset: 0.18, to: 'a_escape', text: 'a_fork.begin+0.18s' },
  { from: 'a_escape', at: 'begin', to: 'a_minute', text: 'a_escape.begin' },
  { from: 'a_balance', at: 'repeat', n: 6, to: 'a_strike', text: 'a_balance.repeat(6)' },
];

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'chrono-title chrono-desc');
  stage.append(el('title', { id: 'chrono-title' }, '擒纵天文钟 — 由 SMIL 时序关系装配的机械擒纵'));
  stage.append(el('desc', { id: 'chrono-desc' }, '剖开的黄铜天文钟：syncbase 链驱动摆轮、擒纵叉、擒纵轮与分轮；keySplines 软硬游丝对照；keyPoints 凸轮从动件；discard 运输夹；时间基准台以 setCurrentTime 拖动整台机器。'));

  stage.pauseAnimations(); // api:SVGSVGElement.pauseAnimations — hold the clock until the log listeners exist
  const root = el('g', { id: 'chrono-root' });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- <style>: CSS fill for the fork (SMIL overrides it during impulse), CSS spin for the decorative
  //      star wheel and the css:prefers-reduced-motion switch that stops only the decoration.
  root.append(fragment(`<style>
    .pallet-fork { fill: ${STEEL}; }
    .deco-star { animation: chrono-spin 6s linear infinite; transform-origin: 990px 150px; transform-box: view-box; ${isExport() ? 'animation-play-state: paused; animation-delay: -2s;' : ''} }
    @keyframes chrono-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .deco-star { animation: none; } }
    .btn { cursor: pointer; }
    .btn:focus-visible { stroke: ${BRASS_HI}; stroke-width: 2.5; outline: none; }
    #hud { pointer-events: none; }
  </style>`));

  // ---- defs: felt hatch, arrow marker, the remote-driven power bar animation and the <discard>.
  root.append(fragment(`<defs>
    <pattern id="baize-hatch" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="12" stroke="${CREAM}" stroke-width="1" stroke-opacity="0.18"/>
    </pattern>
    <marker id="brass-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0.5 L8,4 L0,7.5 Z" fill="${BRASS_HI}"/>
    </marker>
    <radialGradient id="dial-face" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#2a3b36"/><stop offset="1" stop-color="${INK}"/>
    </radialGradient>
    <!-- at:animate.href — this animate lives in defs and drives the distant #power-bar by reference. -->
    <animate id="a_power" href="#power-bar" attributeName="width" attributeType="XML" from="220" to="46" dur="30s" fill="freeze"/>
    <!-- el:discard — removes the shipping clamp from the DOM permanently when assembly step 4 ends. -->
    <discard id="d_clamp" href="#shipping-clamp" begin="a_asm4.end"/>
  </defs>`));

  // ---- 1. Baize: the only backdrop, x∈[70,1330] y∈[688,868], opacity .26 + 45° hatch.
  root.append(el('rect', { x: 70, y: 688, width: 1260, height: 180, rx: 16, fill: FELT, opacity: 0.26 }));
  root.append(el('rect', { x: 70, y: 688, width: 1260, height: 180, rx: 16, fill: 'url(#baize-hatch)', opacity: 0.6, 'pointer-events': 'none' }));

  // ---- Title block and beat counter.
  root.append(el('text', { x: 470, y: 58, 'font-family': FONT_CJK, 'font-size': 26, 'font-weight': 700, fill: BRASS_HI }, '擒纵天文钟'));
  root.append(el('text', { x: 470, y: 80, 'font-family': FONT_CJK, 'font-size': 12, fill: SAGE }, 'Escapement Chronometer · 声明式 SMIL 时序轮系 · 机构没有一行驱动脚本，脚本只读取与拖动时间轴'));
  root.append(el('text', { id: 'beat-counter', x: 1330, y: 56, 'text-anchor': 'end', 'font-family': FONT_CJK, 'font-size': 18, fill: BRASS_HI }, '拍数 #0'));
  root.append(mono(1330, 72, 'a_balance.onrepeat → repeatEvent 计数', { 'text-anchor': 'end', 'font-size': 10 }));

  // ---- 2b. Meridian calibration bar: transform="rotate(5)" pivots at the user-space origin (pv:transform=rotate).
  const meridian = el('g', { id: 'meridian', transform: 'translate(18 18) scale(.85)' });
  meridian.append(el('line', { x1: 0, y1: 0, x2: 200, y2: 100, stroke: SAGE, 'stroke-width': 0.8, 'stroke-dasharray': '3 4' }));
  meridian.append(el('line', { x1: 0, y1: 0, x2: 190.5, y2: 117.0, stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '3 4' }));
  meridian.append(el('path', { d: arcPath(0, 0, 223.6, 19, 38), fill: 'none', stroke: BRASS, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
  meridian.append(el('path', { d: arcPath(0, 0, 223.6, 26.57, 31.57), fill: 'none', stroke: RUBY, 'stroke-width': 3 }));
  meridian.append(el('rect', { x: 200, y: 95, width: 220, height: 10, rx: 5, fill: SAGE, 'fill-opacity': 0.35, stroke: SAGE, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
  meridian.append(el('rect', { id: 'meridian-bar', x: 200, y: 95, width: 220, height: 10, rx: 5, fill: BRASS, stroke: BROWN, transform: 'rotate(5)' }));
  meridian.append(el('circle', { cx: 0, cy: 0, r: 4, fill: RUBY }));
  meridian.append(mono(214, 160, 'transform="rotate(5)"  支点 = 用户空间原点 (0,0)，不是杆件中心', { 'font-size': 10 }));
  meridian.append(mono(214, 172, '↔ 轮系全部写 rotate(a cx cy)，SMIL 只叠加，基础变换永远保留', { 'font-size': 10 }));
  root.append(meridian);

  // ---- 10c. Nameplate with a display:none tspan pulling the rest of the line left (pr:display on text).
  root.append(el('text', { x: 84, y: 178, 'font-family': FONT_CJK, 'font-size': 12, fill: CREAM },
    'No. 1714 · 擒纵天文钟 ', el('tspan', { display: 'none', fill: RUBY }, '（备用编号 II）'), 'Cal. XV  ← tspan display=none 使文字左移'));
  root.append(el('text', { x: 84, y: 194, 'font-family': FONT_CJK, 'font-size': 12, fill: SAGE },
    'No. 1714 · 擒纵天文钟 ', el('tspan', { fill: RUBY }, '（备用编号 II）'), 'Cal. XV'));

  // ---- 14. restart triple: three pawl buttons that each trigger the same 0.9 s winding of the mainspring.
  const restartModes: ['always' | 'whenNotActive' | 'never', number][] = [['always', 470], ['whenNotActive', 520], ['never', 570]];
  root.append(label(70, 462, 'restart= 三连（点击上条）', { fill: BRASS_HI }));
  for (const [mode, y] of restartModes) {
    root.append(button(`wind_${mode}`, 70, y, 110, 34, mode, { size: 11 }));
    root.append(el('text', { id: `cnt-${mode}`, x: 186, y: y + 22, 'font-family': FONT_MONO, 'font-size': 12, fill: BRASS_HI }, '×0'));
  }

  // ---- 2. Going train. Wheels are <g transform="rotate(a cx cy)"> with additive SMIL rotation on top.
  const train = el('g', { id: 'train' });
  const spin = (id: string, cx: number, cy: number, dur: number, dir: 1 | -1, begin = '0s'): SVGElement =>
    el('animateTransform', { id, attributeName: 'transform', type: 'rotate', values: `0 ${cx} ${cy};${360 * dir} ${cx} ${cy}`, dur: `${dur}s`, begin, repeatCount: 'indefinite', additive: 'sum' });
  // Barrel (170,300) r=86 with mainspring, ratchet click and the detachable cover.
  const barrel = el('g', { id: 'barrel', transform: 'rotate(3 170 300)' });
  barrel.append(...wheelParts(170, 300, 86, 72, { spokes: 0, rim: 10, hub: 8 }));
  barrel.append(el('circle', { cx: 170, cy: 300, r: 80, fill: INK, 'fill-opacity': 0.6 }));
  barrel.append(spin('a_barrel', 170, 300, 240, 1));
  train.append(barrel);
  // Mainspring: its dash-offset is what the restart buttons wind (at:animate.restart, av:animate.begin=event).
  train.append(el('path', { id: 'mainspring', d: spiralPath(170, 300, 20, 76, 3, 40), fill: 'none', stroke: STEEL, 'stroke-width': 2.2, 'stroke-dasharray': '14 5' },
    ...restartModes.map(([mode]) => el('animate', { id: `a_wind_${mode}`, attributeName: 'stroke-dashoffset', from: '0', to: '-57', dur: '0.9s', begin: `wind_${mode}.click`, restart: mode }))));
  train.append(el('circle', { id: 'barrel-cover', cx: 170, cy: 300, r: 30, fill: BRASS, 'fill-opacity': 0.85, stroke: BROWN, 'stroke-width': 1.5 },
    // av:animate.begin=indefinite — only beginElement()/beginElementAt() from the time base start this lift.
    el('animate', { id: 'a_detach', attributeName: 'cy', values: '300;236;300', keyTimes: '0;0.5;1', calcMode: 'spline', keySplines: SPLINE, dur: '1.6s', begin: 'indefinite' })));
  train.append(mono(84, 402, '#barrel-cover 起盖', { 'font-size': 9.5, 'font-family': FONT_CJK }));
  train.append(mono(84, 414, 'a_detach begin="indefinite"', { 'font-size': 9.5 }));
  // Centre wheel (330,350) r=74 · third (450,275) r=52 · fourth (520,380) r=42.
  const centre = el('g', { id: 'centre-wheel', transform: 'rotate(-6 330 350)' }, ...wheelParts(330, 350, 74, 60, { pinion: 16, hub: 9 }), spin('a_centre', 330, 350, 120, -1));
  const third = el('g', { id: 'third-wheel', transform: 'rotate(9 450 275)' }, ...wheelParts(450, 275, 52, 44, { pinion: 14, hub: 7, spokes: 4 }), spin('a_third', 450, 275, 40, 1));
  const fourth = el('g', { id: 'fourth-wheel', transform: 'rotate(-4 520 380)' }, ...wheelParts(520, 380, 42, 36, { pinion: 12, hub: 6, spokes: 4 }), spin('a_fourth', 520, 380, 8, -1));
  train.append(centre, third, fourth);
  root.append(train);

  // ---- 5/4. Escape wheel (580,460) r=60, 15 club teeth. Outer g keeps the base rotate; the inner rotor is a
  //      translate frame so the accumulating a_escape rotate uses plain angles (per beat +12° net).
  const escapeWheel = el('g', { id: 'escape-wheel', transform: 'rotate(6 580 460)' });
  escapeWheel.append(el('animateTransform', { id: 'a_asm2', attributeName: 'transform', type: 'translate', from: '90 -40', to: '0 0', dur: '0.5s', begin: 'a_asm1.end', additive: 'sum' }));
  const rotor = el('g', { id: 'escape-rotor', transform: 'translate(580 460)' });
  rotor.append(el('path', { d: escapeWheelPath(0, 0, 60), fill: BRASS_HI, stroke: BROWN, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
  rotor.append(el('circle', { cx: 0, cy: 0, r: 40, fill: INK, 'fill-opacity': 0.55, stroke: BROWN }));
  for (let i = 0; i < 4; i++) { const [x, y] = polar(0, 0, 40, i * 90 + 20); rotor.append(el('line', { x1: 0, y1: 0, x2: x, y2: y, stroke: BRASS, 'stroke-width': 5 })); }
  rotor.append(el('animateTransform', {
    id: 'a_escape', attributeName: 'transform', type: 'rotate', values: '0;6;6;12;12', keyTimes: '0;0.075;0.5;0.575;1',
    dur: `${BEAT}s`, begin: 'a_fork.begin+0.18s', repeatCount: 'indefinite', additive: 'sum', accumulate: 'sum',
  }));
  escapeWheel.append(rotor);
  // Escape-wheel jewel: its r animates so the HUD can print r.baseVal vs r.animVal (api:SVGAnimatedLength.animVal).
  escapeWheel.append(el('circle', { id: 'escape-jewel', cx: 580, cy: 460, r: 5, fill: RUBY, stroke: BROWN },
    el('animate', { id: 'a_jewel', attributeName: 'r', attributeType: 'XML', values: '5;7.5;5', keyTimes: '0;0.5;1', calcMode: 'spline', keySplines: SPLINE, dur: `${BEAT}s`, begin: 'a_escape.begin', repeatCount: 'indefinite' })));
  root.append(escapeWheel);

  // ---- 4. Pallet fork, pivot (470,520). Locked 0–.225 / .30–.725, impulse flips at .225–.30 and .725–.80 —
  //      exactly when the balance crosses zero (phase .25/.75). begin="a_balance.begin" (av:animate.begin=syncbase).
  const fork = el('g', { id: 'fork', transform: 'translate(470 520)' });
  fork.append(el('animateTransform', { id: 'a_asm3', attributeName: 'transform', type: 'translate', from: '0 60', to: '0 0', dur: '0.5s', begin: 'a_asm2.end', additive: 'sum' }));
  fork.append(el('animateTransform', { id: 'a_fork', attributeName: 'transform', type: 'rotate', values: '-9;-9;9;9;-9;-9', keyTimes: '0;0.225;0.30;0.725;0.80;1', dur: `${BEAT}s`, begin: 'a_balance.begin', repeatCount: 'indefinite', additive: 'sum' }));
  const forkBody = el('g', { transform: 'rotate(-28.6)' });
  forkBody.append(el('path', { id: 'fork-lever', class: 'pallet-fork', d: 'M-160,-7 L-150,-3 L-4,-4 L70,-3 L70,3 L-4,4 L-150,3 L-160,7 L-160,3 L-146,0 L-160,-3 Z', stroke: BROWN, 'stroke-width': 1.2 },
    // concept:smil-overrides-css — CSS says steel blue; this discrete SMIL fill wins during the impulse windows.
    el('animate', { id: 'a_fork_fill', attributeName: 'fill', attributeType: 'CSS', values: `${STEEL};${BRASS_HI};${STEEL};${BRASS_HI};${STEEL}`, keyTimes: '0;0.225;0.30;0.725;0.80', calcMode: 'discrete', dur: `${BEAT}s`, begin: 'a_balance.begin', repeatCount: 'indefinite' })));
  forkBody.append(el('path', { d: 'M52,-24 L74,-24 L74,-14 L52,-14 Z M52,14 L74,14 L74,24 L52,24 Z', fill: RUBY, stroke: BROWN, 'stroke-width': 1 }));
  forkBody.append(el('path', { d: 'M52,-24 L52,-4 M52,24 L52,4', stroke: STEEL, 'stroke-width': 4 }));
  forkBody.append(el('circle', { cx: -150, cy: 0, r: 2.2, fill: RUBY }));
  fork.append(forkBody);
  root.append(fork);
  // Pivot jewel: cx drifts 470→476 over 12 s, plus an additive wobble; the grey ghost marks the base value.
  root.append(el('circle', { cx: 470, cy: 520, r: 7, fill: 'none', stroke: SAGE, 'stroke-width': 1, 'stroke-dasharray': '2 2' }));
  root.append(el('circle', { id: 'fork-pivot', cx: 470, cy: 520, r: 7, fill: RUBY, stroke: BROWN, 'stroke-width': 1.2 },
    el('animate', { id: 'a_pivot_drift', attributeName: 'cx', from: '470', to: '476', dur: '12s', fill: 'freeze' }),
    // av:animate.additive=sum — presented cx = base(470→476) + wobble(−1.4…1.4).
    el('animate', { id: 'a_pivot_wobble', attributeName: 'cx', values: '-1.4;1.4;-1.4', dur: `${BEAT}s`, begin: 'a_balance.begin', repeatCount: 'indefinite', additive: 'sum' })));
  root.append(mono(412, 548, 'pivot cx 470→476 + wobble ±1.4 additive=sum', { 'font-size': 9 }));

  // ---- 3. Main balance (300,590) r=115 with a 3.5-turn hairspring (r 18→62). a_balance: keySplines symmetric ease.
  const balance = el('g', { id: 'balance', transform: 'rotate(0 300 590)' });
  balance.append(el('animateTransform', { id: 'a_asm4', attributeName: 'transform', type: 'translate', from: '-70 80', to: '0 0', dur: '0.8s', begin: 'a_asm3.end', additive: 'sum' }));
  balance.append(el('animateTransform', {
    id: 'a_balance', attributeName: 'transform', type: 'rotate', values: '-32 300 590;32 300 590;-32 300 590', dur: `${BEAT}s`,
    calcMode: 'spline', keyTimes: '0;0.5;1', keySplines: SPLINE, repeatCount: 'indefinite', begin: 'a_asm4.end', additive: 'sum',
  }));
  balance.append(el('circle', { cx: 300, cy: 590, r: 115, fill: 'none', stroke: BRASS, 'stroke-width': 9 }));
  balance.append(el('circle', { cx: 300, cy: 590, r: 115, fill: 'none', stroke: BROWN, 'stroke-width': 1 }));
  for (let i = 0; i < 3; i++) { const [x, y] = polar(300, 590, 111, i * 120 + 90); balance.append(el('line', { x1: 300, y1: 590, x2: x, y2: y, stroke: BRASS, 'stroke-width': 5 })); }
  for (let i = 0; i < 8; i++) { const [x, y] = polar(300, 590, 115, i * 45 + 22.5); balance.append(el('circle', { cx: x, cy: y, r: 3.2, fill: BRASS_HI, stroke: BROWN })); }
  balance.append(el('path', { id: 'hairspring', d: spiralPath(300, 590, 18, 62, 3.5, 200), fill: 'none', stroke: STEEL, 'stroke-width': 1.4, 'stroke-dasharray': '30 4' },
    // at:animate.keySplines on a plain <animate>: the coil breathes with the same easing as the balance.
    el('animate', { id: 'a_hairspring', attributeName: 'stroke-dashoffset', values: '0;-16;0', keyTimes: '0;0.5;1', calcMode: 'spline', keySplines: SPLINE, dur: `${BEAT}s`, begin: 'a_balance.begin', repeatCount: 'indefinite' })));
  balance.append(el('circle', { cx: 300, cy: 590, r: 20, fill: BRASS, stroke: BROWN }));
  const [pinX, pinY] = polar(300, 590, 16, -22.4);
  balance.append(el('circle', { cx: pinX, cy: pinY, r: 3.5, fill: RUBY, stroke: BROWN }));
  balance.append(el('circle', { cx: 300, cy: 590, r: 5, fill: STEEL, stroke: BROWN }));
  root.append(balance);
  // Balance cock (drops in first: a_asm1 begin="0s") and the staff jewel above everything.
  const cock = el('g', { id: 'balance-cock' });
  cock.append(el('animateTransform', { id: 'a_asm1', attributeName: 'transform', type: 'translate', from: '0 -70', to: '0 0', dur: '0.6s', begin: '0s' }));
  cock.append(el('rect', { x: 196, y: 476, width: 214, height: 16, rx: 8, fill: BRASS, 'fill-opacity': 0.9, stroke: BROWN, 'stroke-width': 1.2 }));
  cock.append(el('rect', { x: 295, y: 484, width: 10, height: 104, rx: 3, fill: BRASS, 'fill-opacity': 0.75, stroke: BROWN, 'stroke-width': 1 }));
  cock.append(el('circle', { cx: 300, cy: 590, r: 6, fill: RUBY, stroke: BROWN }));
  cock.append(el('circle', { cx: 210, cy: 484, r: 3.5, fill: STEEL, stroke: BROWN }), el('circle', { cx: 396, cy: 484, r: 3.5, fill: STEEL, stroke: BROWN }));
  root.append(cock);
  // Orange shipping clamp: <discard> in defs removes it at a_asm4.end; the <set> is the Firefox fallback.
  root.append(el('g', { id: 'shipping-clamp', transform: 'rotate(20 192 551)' },
    el('rect', { x: 179, y: 531, width: 26, height: 40, rx: 3, fill: ORANGE, stroke: BROWN, 'stroke-width': 1.5 }),
    el('circle', { cx: 192, cy: 539, r: 3.5, fill: BROWN }),
    el('text', { x: 192, y: 565, 'text-anchor': 'middle', 'font-family': FONT_CJK, 'font-size': 9, fill: BROWN }, '运输夹'),
    el('set', { id: 's_clamp', attributeName: 'opacity', to: '0', begin: 'a_asm4.end', fill: 'freeze' })));
  // Caption for the hidden top plate sits in the free strip between the centre wheel and the balance cock.
  root.append(label(200, 448, '#top-plate visibility=hidden：隐藏但仍占位（金色虚线 = getBBox）', { 'font-size': 10, fill: SAGE }));
  root.append(label(200, 461, '板内红宝石轴承 visibility=visible 仍显影（中心轮轴）', { 'font-size': 10, fill: SAGE }));

  // ---- 3b. Hard-hairspring comparison balance (560,650) r=52: same geometry, dur 2.4 s, linear, repeatDur 9.6 s.
  const hard = el('g', { id: 'balance-hard', transform: 'rotate(0 560 650)' });
  hard.append(el('animateTransform', { id: 'a_balance_hard', attributeName: 'transform', type: 'rotate', values: '-32 560 650;32 560 650;-32 560 650', dur: '2.4s', calcMode: 'linear', keyTimes: '0;0.5;1', repeatDur: '9.6s', begin: 'a_asm4.end', additive: 'sum' }));
  hard.append(el('circle', { cx: 560, cy: 650, r: 52, fill: 'none', stroke: BRASS, 'stroke-width': 6 }));
  for (let i = 0; i < 2; i++) { const [x, y] = polar(560, 650, 50, i * 180 + 90); const [x2, y2] = polar(560, 650, 50, i * 180 + 270); hard.append(el('line', { x1: x, y1: y, x2, y2, stroke: BRASS, 'stroke-width': 4 })); }
  hard.append(el('path', { d: spiralPath(560, 650, 8, 30, 2.5, 200), fill: 'none', stroke: STEEL, 'stroke-width': 2.6 }));
  hard.append(el('circle', { cx: 560, cy: 650, r: 9, fill: BRASS, stroke: BROWN }));
  const [hpX, hpY] = polar(560, 650, 7, -22.4);
  hard.append(el('circle', { cx: hpX, cy: hpY, r: 2.5, fill: RUBY }));
  root.append(hard);
  root.append(label(560, 574, '硬游丝 / 线性 / 3× 慢', { 'text-anchor': 'middle', fill: BRASS_HI }));
  root.append(mono(560, 586, 'dur=2.4s linear repeatDur=9.6s', { 'text-anchor': 'middle', 'font-size': 9.5 }));
  root.append(label(70, 632, '主摆轮 · 3.5 圈游丝', { fill: BRASS_HI }));
  root.append(mono(70, 645, 'dur=0.8s calcMode=spline', { 'font-size': 9.5 }));
  root.append(mono(70, 657, 'keySplines .42 0 .58 1', { 'font-size': 9.5 }));
  // Easing charts (moved from the plan's (908,706) because the ruler occupies x∈[70,1000] there).
  root.append(easingChart(652, 578, 74, [0.42, 0, 0.58, 1], 'keySplines .42 0 .58 1', '软游丝：慢-快-慢'));
  root.append(easingChart(742, 578, 74, null, 'calcMode=linear', '硬游丝：匀速对照'));

  // ---- 10. Cut-away top plate (visibility) — drawn after the train so the ruby bearing sits over the centre hub.
  const plateGroup = el('g', { id: 'plate-group' });
  const topPlate = el('g', { id: 'top-plate', visibility: 'hidden' },
    el('rect', { x: 150, y: 220, width: 490, height: 320, rx: 14, fill: BRASS, 'fill-opacity': 0.5 }),
    // concept:visibility-child-override — explicit visibility=visible re-enables this child inside a hidden group.
    el('circle', { id: 'ruby-bearing', cx: 330, cy: 350, r: 9, fill: RUBY, stroke: BROWN, 'stroke-width': 1.5, visibility: 'visible' }));
  plateGroup.append(topPlate);
  root.append(plateGroup);
  // Dummy plate (display:none) whose parent bbox shrinks to two screws.
  const dummyGroup = el('g', { id: 'dummy-group' },
    el('rect', { id: 'dummy-plate', x: 560, y: 180, width: 100, height: 62, rx: 6, fill: BRASS, display: 'none' }),
    el('circle', { cx: 620, cy: 236, r: 3.5, fill: STEEL, stroke: BROWN }),
    el('circle', { cx: 656, cy: 236, r: 3.5, fill: STEEL, stroke: BROWN }));
  root.append(dummyGroup);
  root.append(mono(506, 256, '#dummy-plate display=none', { 'font-size': 9 }));
  root.append(label(506, 268, '不绘制不占位：父组 bbox 仅剩两螺钉', { 'font-size': 10, fill: SAGE }));

  // ---- 9. additive comparison trio near (560,200) / (650,200).
  const cmp = el('g', { id: 'compare-wheels' });
  const cmpA = el('g', { id: 'cmp-replace', transform: 'rotate(-8 560 200)' }, ...wheelParts(560, 200, 40, 30, { spokes: 4, hub: 6 }));
  cmpA.append(el('line', { x1: 560, y1: 200, x2: 560, y2: 166, stroke: RUBY, 'stroke-width': 3 }));
  cmpA.append(el('animateTransform', { id: 'a_cmp_spin', attributeName: 'transform', type: 'rotate', values: '0 560 200;360 560 200', dur: '6s', repeatCount: 'indefinite', additive: 'sum' }));
  // No additive → replace: this translate throws away both the base rotate(-8) and the spin above it.
  cmpA.append(el('animateTransform', { id: 'a_cmp_bob', attributeName: 'transform', type: 'translate', values: '0 0;0 6;0 0', dur: `${BEAT}s`, repeatCount: 'indefinite' }));
  cmp.append(el('line', { x1: 560, y1: 200, x2: 560 + 34 * Math.sin(-8 * Math.PI / 180), y2: 200 - 34 * Math.cos(-8 * Math.PI / 180), stroke: SAGE, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }));
  cmp.append(cmpA);
  const cmpB = el('g', { id: 'cmp-animate-transform', transform: 'rotate(0 650 160)' }, ...wheelParts(650, 160, 26, 20, { spokes: 4, hub: 5 }));
  // concept:animate-transform-requires-animatetransform — <animate attributeName="transform"> is ignored.
  cmpB.append(el('animate', { id: 'a_cmp_noop', attributeName: 'transform', values: 'rotate(0 650 160);rotate(360 650 160)', dur: '4s', repeatCount: 'indefinite' }));
  cmp.append(cmpB);
  // Caption block for the trio sits in the free band above the wheels (x 436–740, y 104–128).
  cmp.append(label(436, 104, 'additive 对照：左轮第二条 animateTransform 无 additive → replace', { 'font-size': 10 }));
  cmp.append(label(436, 116, '丢失 rotate(-8) 底变换与自旋，只剩顶替的上下顶动', { 'font-size': 10, fill: SAGE }));
  cmp.append(label(436, 128, '右小轮只挂 <animate attributeName="transform">：完全不动，须用 animateTransform', { 'font-size': 10, fill: SAGE }));
  root.append(cmp);

  // ---- 8. Dial: centre (830,300) r=160; hour hand continuous 120 s; minute group stacked transforms; jumping seconds.
  const dial = el('g', { id: 'dial' });
  dial.append(el('circle', { cx: 830, cy: 300, r: 160, fill: 'url(#dial-face)', stroke: BRASS, 'stroke-width': 6 }));
  dial.append(el('circle', { cx: 830, cy: 300, r: 150, fill: 'none', stroke: BRASS_HI, 'stroke-width': 1, 'stroke-opacity': 0.6 }));
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = polar(830, 300, major ? 134 : 141, i * 6 - 90), [x2, y2] = polar(830, 300, 147, i * 6 - 90);
    dial.append(el('line', { x1, y1, x2, y2, stroke: major ? BRASS_HI : SAGE, 'stroke-width': major ? 2.5 : 1 }));
    if (major) { const [tx0, ty0] = polar(830, 300, 120, i * 6 - 90); dial.append(el('text', { x: tx0, y: ty0 + 5, 'text-anchor': 'middle', 'font-family': FONT_MONO, 'font-size': 14, fill: CREAM }, String(i === 0 ? 12 : i / 5))); }
  }
  dial.append(el('text', { x: 830, y: 222, 'text-anchor': 'middle', 'font-family': FONT_CJK, 'font-size': 11, fill: BRASS_HI }, '天文钟 · CHRONOMETER'));
  // Hour hand — av:animateTransform.type=rotate, angle cx cy triple.
  dial.append(el('g', { id: 'hour-hand', transform: 'rotate(0 830 300)' },
    el('path', { d: 'M826,312 L830,206 L834,312 Z', fill: BRASS_HI, stroke: BROWN, 'stroke-width': 1 }),
    el('animateTransform', { id: 'a_hour', attributeName: 'transform', type: 'rotate', from: '0 830 300', to: '360 830 300', dur: '120s', repeatCount: 'indefinite', additive: 'sum' })));
  // Minute group: base rotate(-8) + continuous rotate + per-beat accumulate step (inner frame) + additive translate wobble.
  const minuteHand = el('g', { id: 'minute-hand', transform: 'rotate(-8 830 300)' });
  minuteHand.append(el('animateTransform', { id: 'a_minute_sweep', attributeName: 'transform', type: 'rotate', from: '0 830 300', to: '360 830 300', dur: '60s', repeatCount: 'indefinite', additive: 'sum' }));
  minuteHand.append(el('animateTransform', { id: 'a_minute_orbit', attributeName: 'transform', type: 'translate', values: '0 0;0 1.5;0 0', dur: `${BEAT}s`, repeatCount: 'indefinite', additive: 'sum' }));
  const minuteFrame = el('g', { transform: 'translate(830 300)' });
  minuteFrame.append(el('path', { d: 'M-3,14 L0,-134 L3,14 Z', fill: STEEL, stroke: BROWN, 'stroke-width': 1 }));
  minuteFrame.append(el('animateTransform', { id: 'a_minute', attributeName: 'transform', type: 'rotate', values: '0;1.5;1.5', keyTimes: '0;0.075;1', dur: `${BEAT}s`, begin: 'a_escape.begin', repeatCount: 'indefinite', additive: 'sum', accumulate: 'sum' }));
  minuteHand.append(minuteFrame);
  dial.append(minuteHand);
  dial.append(el('circle', { cx: 830, cy: 300, r: 6, fill: BRASS, stroke: BROWN }));
  // Small seconds (830,400) r=52: discrete 18° jumps, breathing backlight via attributeType="CSS".
  dial.append(el('circle', { id: 'seconds-glow', cx: 830, cy: 400, r: 52, fill: STEEL, opacity: 0.25 },
    el('animate', { id: 'a_glow', attributeName: 'opacity', attributeType: 'CSS', values: '0.25;0.6;0.25', dur: '1.6s', repeatCount: 'indefinite' })));
  dial.append(el('circle', { cx: 830, cy: 400, r: 52, fill: 'none', stroke: BRASS, 'stroke-width': 2 }));
  for (let i = 0; i < 20; i++) { const [x1, y1] = polar(830, 400, 44, i * 18 - 90), [x2, y2] = polar(830, 400, 50, i * 18 - 90); dial.append(el('line', { x1, y1, x2, y2, stroke: CREAM, 'stroke-width': i % 5 ? 1 : 2 })); }
  const secondsValues = Array.from({ length: 20 }, (_, i) => `${i * 18} 830 400`).join(';');
  dial.append(el('g', { id: 'seconds-hand', transform: 'rotate(0 830 400)' },
    el('path', { d: 'M828,408 L830,356 L832,408 Z', fill: RUBY }),
    // av:animate.calcMode=discrete — 20 hard jumps, no in-between angles.
    el('animateTransform', { id: 'a_seconds', attributeName: 'transform', type: 'rotate', values: secondsValues, calcMode: 'discrete', dur: '8s', begin: '0s', repeatCount: 'indefinite', additive: 'sum' })));
  dial.append(el('circle', { cx: 830, cy: 400, r: 3, fill: BRASS }));
  dial.append(mono(890, 404, 'attributeType="CSS" (opacity)', { 'font-size': 9 }));
  dial.append(mono(890, 414, 'attributeType="XML" (r, width)', { 'font-size': 9 }));
  dial.append(mono(768, 404, 'calcMode=', { 'font-size': 9, 'text-anchor': 'end' }));
  dial.append(mono(768, 414, 'discrete ×20', { 'font-size': 9, 'text-anchor': 'end' }));
  // Power-reserve bar (700,468) 220 wide — animated remotely from <defs> (see a_power).
  dial.append(el('rect', { x: 700, y: 468, width: 220, height: 10, rx: 3, fill: INK, 'fill-opacity': 0.6, stroke: SAGE, 'stroke-width': 0.8 }));
  dial.append(el('rect', { id: 'power-bar', x: 700, y: 468, width: 220, height: 10, rx: 3, fill: BRASS }));
  dial.append(mono(926, 477, '动力储备 #power-bar', { 'font-size': 10, 'font-family': FONT_CJK }));
  root.append(dial);
  root.append(el('path', { d: 'M700,473 C 690,480 686,492 704,496', fill: 'none', stroke: BRASS_HI, 'stroke-width': 1, 'stroke-dasharray': '4 3', 'marker-end': 'url(#brass-arrow)' }));
  root.append(el('rect', { x: 652, y: 486, width: 210, height: 18, rx: 4, fill: INK, 'fill-opacity': 0.75, stroke: BRASS_HI, 'stroke-width': 1 }));
  root.append(mono(660, 499, '<defs> 通道：animate href="#power-bar" 远程驱动', { 'font-size': 10, fill: CREAM, 'font-family': FONT_CJK }));
  root.append(label(652, 524, '装饰星轮 CSS @keyframes', { 'font-size': 10, fill: SAGE }));
  root.append(label(652, 536, '机构 SMIL 时基', { 'font-size': 10, fill: SAGE }));
  root.append(label(652, 548, `减动 reduced-motion：${reduce ? '开' : '关'}`, { 'font-size': 10, fill: reduce ? RUBY : SAGE }));
  root.append(label(652, 560, reduce ? '装饰停转，时基冻结基准帧' : '开启时装饰停转、时基冻结', { 'font-size': 10, fill: SAGE }));

  // ---- 15. Decorative star wheel (990,150) — CSS animation, stopped by the reduce-motion media query.
  root.append(el('path', { class: 'deco-star', d: starPath(990, 150, 34), fill: BRASS, 'fill-opacity': 0.9, stroke: BROWN, 'stroke-width': 1.2 }));
  root.append(el('circle', { cx: 990, cy: 150, r: 6, fill: STEEL, stroke: BROWN }));
  root.append(mono(990, 198, 'CSS @keyframes spin', { 'text-anchor': 'middle', 'font-size': 9 }));

  // ---- 6. Striking work. a_strike releases on the 6th balance repeat or on the silence lever click.
  const strike = el('g', { id: 'strike' });
  strike.append(label(1046, 104, '打点机构 · 第六拍自动释放 / 止打杆一按即停', { fill: BRASS_HI }));
  strike.append(mono(1046, 117, 'begin="a_balance.repeat(6); silence_lever.click"', { 'font-size': 9 }));
  strike.append(mono(1046, 128, 'repeatCount="3"  end="silence_lever.click"', { 'font-size': 9 }));
  const countWheel = el('g', { id: 'count-wheel', transform: 'rotate(15 1110 180)' });
  const countFrame = el('g', { transform: 'translate(1110 180)' }, ...wheelParts(0, 0, 44, 12, { spokes: 3, hub: 6, teethDepth: 8 }));
  countFrame.append(el('animateTransform', {
    id: 'a_strike', attributeName: 'transform', type: 'rotate', from: '0', to: '40', dur: '0.35s', repeatCount: '3',
    begin: 'a_balance.repeat(6);silence_lever.click', end: 'silence_lever.click', additive: 'sum', accumulate: 'sum', onbegin: '__chronoStrikeBegin(event)',
  }));
  countWheel.append(countFrame);
  strike.append(countWheel);
  strike.append(el('rect', { id: 'strike-lock', x: 1166, y: 150, width: 36, height: 14, rx: 3, fill: BRASS, stroke: BROWN },
    // el:set / at:set.to — snaps to ruby at a_strike.begin and stays (no interpolation).
    el('set', { id: 's_lock', attributeName: 'fill', to: RUBY, begin: 'a_strike.begin', fill: 'freeze' })));
  strike.append(mono(1166, 176, '锁片 set fill', { 'font-size': 9, 'font-family': FONT_CJK }));
  // Hammer path (inline `path` attribute) and its faint guide; a frozen rest motion parks the hammer at the path start.
  const HAMMER_PATH = 'M1250,118 C1268,150 1262,196 1244,222';
  strike.append(el('path', { d: HAMMER_PATH, fill: 'none', stroke: SAGE, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
  const hammer = el('g', { id: 'hammer' });
  hammer.append(el('rect', { x: -30, y: -3, width: 32, height: 6, rx: 2, fill: BRASS, stroke: BROWN }));
  hammer.append(el('rect', { x: 0, y: -9, width: 16, height: 18, rx: 3, fill: STEEL, stroke: BROWN, 'stroke-width': 1.2 }));
  hammer.append(el('animateMotion', { id: 'a_hammer_rest', path: HAMMER_PATH, keyPoints: '0;0', keyTimes: '0;1', calcMode: 'linear', rotate: 'auto', dur: '0.01s', begin: '0s', fill: 'freeze' }));
  // at:animateMotion.path + av:animateMotion.rotate=auto — the strike hammer follows the inline Bézier, head first.
  hammer.append(el('animateMotion', { id: 'a_hammer', path: HAMMER_PATH, rotate: 'auto', dur: '0.35s', repeatCount: '3', begin: 'a_strike.begin', end: 'silence_lever.click' }));
  strike.append(hammer);
  strike.append(el('circle', { id: 'gong-ripple', cx: 1244, cy: 240, r: 17, fill: 'none', stroke: BRASS_HI, 'stroke-width': 1.5, opacity: 0.7 },
    el('animate', { id: 'a_gong', attributeName: 'r', values: '17;32', dur: '0.35s', repeatCount: '3', begin: 'a_strike.begin', end: 'silence_lever.click' }),
    el('animate', { attributeName: 'opacity', values: '0.9;0', dur: '0.35s', repeatCount: '3', begin: 'a_strike.begin', end: 'silence_lever.click' })));
  strike.append(el('circle', { cx: 1244, cy: 240, r: 17, fill: BRASS, stroke: BROWN, 'stroke-width': 1.5 }));
  strike.append(el('circle', { cx: 1244, cy: 240, r: 5, fill: BROWN }));
  strike.append(mono(1280, 244, '钟碗', { 'font-size': 9, 'font-family': FONT_CJK }));
  strike.append(button('silence_lever', 1046, 268, 120, 28, '止打杆 SILENCE', { font: FONT_CJK, size: 11, fill: '#4b3a2a' }));
  strike.append(el('text', { id: 'mute-plaque', x: 1178, y: 288, 'font-family': FONT_CJK, 'font-size': 12, fill: RUBY, visibility: 'hidden' }, '● 静音',
    // concept:set-visibility-toggle — the plaque appears on the lever click and stays.
    el('set', { id: 's_mute', attributeName: 'visibility', to: 'visible', begin: 'silence_lever.click', fill: 'freeze' })));
  root.append(strike);

  // ---- 7. Equation-of-time cam (1160,430): both followers ride the same stroked profile via <mpath>.
  const cam = el('g', { id: 'eot-cam' });
  cam.append(el('path', { id: 'eot-cam-profile', d: camPath(1160, 430), fill: BRASS, 'fill-opacity': 0.18, stroke: BRASS, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  cam.append(el('circle', { cx: 1160, cy: 430, r: 10, fill: STEEL, stroke: BROWN }), el('circle', { cx: 1160, cy: 430, r: 3, fill: BROWN }));
  // Follower A: own transform rotate(-12) stays underneath the motion (concept:animatemotion-transform-stacking);
  // keyPoints pauses it at 25 % arc length between keyTimes .3 and .55.
  const followerA = el('g', { id: 'follower-a', transform: 'rotate(-12)' });
  followerA.append(el('line', { x1: 0, y1: 0, x2: -18, y2: 0, stroke: SAGE, 'stroke-width': 3 }));
  followerA.append(el('circle', { cx: 0, cy: 0, r: 7, fill: STEEL, stroke: BROWN, 'stroke-width': 1.2 }));
  followerA.append(el('g', { transform: 'rotate(12)' }, el('path', { id: 'follower-a-arrow', d: 'M0,0 L22,0 M15,-6 L22,0 L15,6', fill: 'none', stroke: RUBY, 'stroke-width': 2.5, 'stroke-linecap': 'round' })));
  followerA.append(el('animateMotion', { id: 'a_cam_a', dur: '9s', repeatCount: 'indefinite', calcMode: 'linear', rotate: 'auto', keyPoints: '0;0.25;0.25;1', keyTimes: '0;0.3;0.55;1', begin: '0s' }, el('mpath', { href: '#eot-cam-profile' })));
  cam.append(followerA);
  // Follower B: keyPoints 1;0 runs the path backwards, tail-first (rotate=auto-reverse), 2.5 rounds then frozen.
  const followerB = el('g', { id: 'follower-b' });
  followerB.append(el('circle', { cx: 0, cy: 0, r: 6, fill: BRASS_HI, stroke: BROWN, 'stroke-width': 1.2 }));
  followerB.append(el('path', { id: 'follower-b-arrow', d: 'M0,0 L20,0 M14,-5 L20,0 L14,5', fill: 'none', stroke: STEEL, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  followerB.append(el('animateMotion', { id: 'a_cam_b', dur: '4s', repeatCount: '2.5', calcMode: 'linear', rotate: 'auto-reverse', keyPoints: '1;0', keyTimes: '0;1', begin: '0s', fill: 'freeze' }, el('mpath', { href: '#eot-cam-profile' })));
  cam.append(followerB);
  // Arc-length ticks (keyPoints) along the profile and a keyTimes ruler above it.
  const profile = cam.querySelector('#eot-cam-profile') as SVGPathElement;
  root.append(cam); // append early so getTotalLength() works
  const camLen = profile.getTotalLength();
  for (const s of [0, 0.25, 0.5, 0.75]) {
    const p = profile.getPointAtLength(s * camLen), q = profile.getPointAtLength(((s * camLen) + 1) % camLen);
    const nx = (p.y - q.y), ny = -(p.x - q.x), nl = Math.hypot(nx, ny) || 1;
    const ox = p.x + nx / nl * 10, oy = p.y + ny / nl * 10;
    cam.append(el('line', { x1: p.x, y1: p.y, x2: ox, y2: oy, stroke: RUBY, 'stroke-width': 1.5 }));
    cam.append(mono(ox + nx / nl * 9, oy + ny / nl * 9 + 3, `s=${s}`, { 'font-size': 9, fill: RUBY, 'text-anchor': 'middle' }));
  }
  cam.append(el('line', { x1: 1100, y1: 318, x2: 1320, y2: 318, stroke: SAGE, 'stroke-width': 1.5 }));
  for (const [k, lab] of [[0, '0'], [0.3, '.3'], [0.55, '.55'], [1, '1']] as [number, string][]) {
    const x = 1100 + k * 220;
    cam.append(el('line', { x1: x, y1: 313, x2: x, y2: 323, stroke: SAGE, 'stroke-width': 1.5 }));
    cam.append(mono(x, 333, lab, { 'font-size': 9, 'text-anchor': 'middle' }));
  }
  cam.append(el('rect', { x: 1100 + 0.3 * 220, y: 315, width: 0.25 * 220, height: 6, fill: RUBY, 'fill-opacity': 0.6 }));
  cam.append(mono(1046, 322, 'keyTimes', { 'font-size': 9.5, fill: CREAM }));
  cam.append(mono(1046, 333, '(时间)', { 'font-size': 9.5, 'font-family': FONT_CJK }));
  cam.append(mono(1256, 372, 'A  keyPoints', { 'font-size': 9.5, fill: RUBY }));
  cam.append(mono(1256, 384, '0;.25;.25;1', { 'font-size': 9.5, fill: RUBY }));
  cam.append(mono(1256, 396, 'keyTimes 0;.3;.55;1', { 'font-size': 9.5 }));
  cam.append(mono(1256, 408, '9s ↻ 中途停跳 2.25s', { 'font-size': 9.5, 'font-family': FONT_CJK }));
  cam.append(mono(1256, 428, 'B  keyPoints 1;0', { 'font-size': 9.5, fill: STEEL }));
  cam.append(mono(1256, 440, 'rotate=auto-reverse', { 'font-size': 9.5, fill: STEEL }));
  cam.append(mono(1256, 452, '4s ×2.5 fill=freeze', { 'font-size': 9.5 }));
  cam.append(mono(1256, 464, '逆行，半程冻结', { 'font-size': 9.5, 'font-family': FONT_CJK }));
  cam.append(label(1046, 530, '均时差凸轮：keyPoints 管距离（弧长 s），keyTimes 管时间', { 'font-size': 10, fill: SAGE }));
  cam.append(label(1046, 543, '两枚从动件共用 <mpath href="#eot-cam-profile">', { 'font-size': 10, fill: SAGE }));

  // ---- 15b. Support-status nameplate generated from feature detection (concept:smil-2026-support-status).
  const discardSupported = 'SVGDiscardElement' in window;
  root.append(label(1030, 559, 'SMIL 2026：Chrome / Firefox / Safari 均原生渲染，无 polyfill；', { 'font-size': 10.5, fill: CREAM }));
  root.append(label(1030, 572, `discard：${discardSupported ? '支持（元素将被真正移出 DOM）' : '本引擎忽略，已用 set 兜底'}`, { 'font-size': 10.5, fill: discardSupported ? BRASS_HI : RUBY }));

  // ---- 11. Timeline ruler: axis, lanes, dynamic bars (filled from getStartTime/getSimpleDuration) and playhead.
  const ruler = el('g', { id: 'ruler' });
  ruler.append(el('line', { x1: tx(0), y1: 700, x2: tx(T_MAX), y2: 700, stroke: BRASS, 'stroke-width': 1.5 }));
  for (let t = 0; t <= T_MAX; t++) {
    ruler.append(el('line', { x1: tx(t), y1: 696, x2: tx(t), y2: 704, stroke: BRASS, 'stroke-width': 1 }));
    ruler.append(el('line', { x1: tx(t), y1: 704, x2: tx(t), y2: LANE_Y0 + LANES.length * LANE_H, stroke: SAGE, 'stroke-width': 0.6, 'stroke-opacity': 0.3 }));
    ruler.append(mono(tx(t), 694, `${t}s`, { 'font-size': 9, 'text-anchor': 'middle' }));
  }
  LANES.forEach((lane, i) => {
    const y = LANE_Y0 + i * LANE_H;
    ruler.append(el('line', { x1: tx(0), y1: y + LANE_H, x2: tx(T_MAX), y2: y + LANE_H, stroke: SAGE, 'stroke-width': 0.6, 'stroke-opacity': 0.35 }));
    ruler.append(label(64, y + 14, lane.name, { 'text-anchor': 'end', 'font-size': 11, fill: BRASS_HI }));
  });
  // Ninth lane: visibility=collapse — nothing paints, but the row keeps its space just like hidden.
  const collapsedY = LANE_Y0 + LANES.length * LANE_H;
  ruler.append(el('g', { id: 'lane-collapsed', visibility: 'collapse' },
    el('rect', { x: tx(0), y: collapsedY + 4, width: tx(T_MAX) - tx(0), height: 12, fill: RUBY }),
    label(64, collapsedY + 14, '停用', { 'text-anchor': 'end' })));
  ruler.append(label(76, collapsedY + 14, '第九泳道 visibility=collapse：内容不绘制但仍占位（与 hidden 同理，不同于 display=none）', { 'font-size': 10, fill: SAGE }));
  const bars = el('g', { id: 'ruler-bars' });
  ruler.append(bars);
  const playhead = el('g', { id: 'playhead' },
    el('line', { x1: tx(T0), y1: 698, x2: tx(T0), y2: collapsedY + LANE_H, stroke: RUBY, 'stroke-width': 1.5 }),
    el('path', { d: `M${tx(T0) - 5},692 L${tx(T0) + 5},692 L${tx(T0)},699 Z`, fill: RUBY }),
    mono(tx(T0), collapsedY + LANE_H + 12, `t = ${T0.toFixed(2)} s`, { 'text-anchor': 'middle', 'font-size': 10, fill: RUBY }));
  ruler.append(playhead);
  root.append(ruler);

  // ---- 13. Event log panel (1030,580)–(1360,776).
  const log = el('g', { id: 'event-log' });
  log.append(el('rect', { x: 1030, y: 580, width: 330, height: 196, rx: 8, fill: INK, 'fill-opacity': 0.85, stroke: BRASS, 'stroke-width': 1.2 }));
  log.append(el('text', { id: 'log-title', x: 1040, y: 596, 'font-family': FONT_CJK, 'font-size': 12, fill: BRASS_HI }, '事件日志 · begin / repeat / end'));
  log.append(mono(1352, 596, 'TimeEvent.detail → #n', { 'text-anchor': 'end', 'font-size': 9 }));
  SCHEDULE.forEach((row, i) => {
    const y = 610 + i * 15.6;
    const g = el('g', { class: 'log-row', 'data-id': row.id, 'data-type': row.type, 'data-n': row.n ?? '', 'data-fired': '0' });
    g.append(el('circle', { cx: 1044, cy: y - 3.5, r: 4, fill: 'none', stroke: SAGE, 'stroke-width': 1.2 }));
    g.append(mono(1056, y, row.t.toFixed(2).padStart(5, ' '), { 'font-size': 10, fill: SAGE }));
    g.append(mono(1094, y, row.id, { 'font-size': 10, fill: SAGE }));
    g.append(mono(1214, y, row.type, { 'font-size': 10, fill: SAGE }));
    g.append(mono(1352, y, row.n !== undefined ? `#${row.n}` : '', { 'font-size': 10, fill: SAGE, 'text-anchor': 'end', class: 'log-detail' }));
    log.append(g);
  });
  root.append(log);

  // ---- 12. Time base: slider (1046,826)→(1330,826), freeze lever, lamp, beginElement / beginElementAt / endElement.
  const station = el('g', { id: 'time-base' });
  station.append(button('btn_begin', 1046, 786, 88, 22, 'beginElement()', { size: 9.5 }));
  station.append(button('btn_beginAt', 1142, 786, 92, 22, 'beginElementAt(.5)', { size: 9.5 }));
  station.append(button('btn_end', 1242, 786, 88, 22, 'endElement()', { size: 9.5 }));
  station.append(mono(1046, 780, '#a_detach 起盖：释放 / 预约 .5s / 急停 ｜ 滑轨 ↔ setCurrentTime(t)', { 'font-size': 9.5, 'font-family': FONT_CJK }));
  station.append(el('line', { x1: 1046, y1: 826, x2: 1330, y2: 826, stroke: BRASS, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  for (let t = 0; t <= T_MAX; t += 2) { const x = 1046 + t / T_MAX * 284; station.append(el('line', { x1: x, y1: 820, x2: x, y2: 832, stroke: BROWN, 'stroke-width': 1.5 })); station.append(mono(x, 846, `${t}`, { 'font-size': 8.5, 'text-anchor': 'middle' })); }
  station.append(el('rect', { id: 'time-track', x: 1034, y: 806, width: 308, height: 40, fill: 'transparent', style: 'cursor: ew-resize' }));
  station.append(el('rect', { id: 'time-handle', x: 1046 - 11, y: 809, width: 22, height: 34, rx: 4, fill: BRASS_HI, stroke: BROWN, 'stroke-width': 1.5, 'pointer-events': 'none' }));
  station.append(el('line', { id: 'time-handle-mark', x1: 1046, y1: 814, x2: 1046, y2: 838, stroke: BROWN, 'stroke-width': 1.5, 'pointer-events': 'none' }));
  station.append(button('freeze_lever', 1046, 850, 76, 18, '冻结 / 运行', { font: FONT_CJK, size: 10, fill: '#4b3a2a' }));
  station.append(el('circle', { id: 'pause-lamp', cx: 1136, cy: 859, r: 6, fill: '#4cc36a', stroke: BROWN }));
  station.append(mono(1150, 863, '', { id: 'time-readout', 'font-size': 10.5, fill: CREAM }));
  root.append(station);

  // ---- 16. Pointer HUD (top-most, pointer-events:none).
  const hud = el('g', { id: 'hud', transform: 'translate(824 516)' });
  hud.append(el('rect', { x: 0, y: 0, width: 200, height: 150, rx: 6, fill: INK, 'fill-opacity': 0.88, stroke: BRASS_HI, 'stroke-width': 1 }));
  const hudLines: SVGTextElement[] = [];
  for (let i = 0; i < 10; i++) { const t = mono(8, 16 + i * 13.5, '', { 'font-size': 9.5, fill: i === 0 ? BRASS_HI : CREAM }); hudLines.push(t); hud.append(t); }
  root.append(hud);

  stage.append(root);

  // ---- 10b. getBBox outlines (need layout): hidden plate keeps its box, display:none plate is excluded.
  const drawBBox = (target: SVGGraphicsElement, colour: string, dash: string): SVGRectElement => {
    const b = target.getBBox();
    const r = el('rect', { class: 'bbox-outline', x: b.x - 3, y: b.y - 3, width: b.width + 6, height: b.height + 6, rx: 6, fill: 'none', stroke: colour, 'stroke-width': 1.2, 'stroke-dasharray': dash, 'pointer-events': 'none' });
    return r;
  };
  root.insertBefore(drawBBox(plateGroup as SVGGraphicsElement, BRASS_HI, '8 5'), train);
  root.insertBefore(drawBBox(dummyGroup as SVGGraphicsElement, SAGE, '4 3'), train);

  // ================= Script side: reads the timeline, never drives the mechanism. =================
  const $ = <T extends Element = SVGElement>(id: string): T => stage.querySelector(`#${id}`) as unknown as T;
  const animEls = [...stage.querySelectorAll('animate,animateTransform,animateMotion,set')] as AnimEl[];
  const byId = new Map(animEls.filter(a => a.id).map(a => [a.id, a]));
  const timing = new Map<string, { start: number; dur: number }>();

  // Timeline bars: x/width come from getStartTime()/getSimpleDuration(); repeats become tick dots.
  const activeEnd = (a: AnimEl, start: number, dur: number): number => {
    const rc = a.getAttribute('repeatCount'), rd = a.getAttribute('repeatDur');
    if (rd) return start + parseFloat(rd);
    if (rc === 'indefinite') return T_MAX;
    if (rc) return start + dur * parseFloat(rc);
    return start + dur;
  };
  const refreshTiming = (): boolean => {
    let changed = false;
    for (const a of animEls) {
      if (!a.id || laneOf(a.id) < 0) continue;
      try {
        const start = a.getStartTime(), dur = a.getSimpleDuration();
        const prev = timing.get(a.id);
        if (!prev || prev.start !== start || prev.dur !== dur) { timing.set(a.id, { start, dur }); changed = true; }
      } catch { /* unresolved interval (e.g. a_strike before the 6th repeat) — keep the last known value */ }
    }
    return changed;
  };
  const drawBars = (): void => {
    bars.replaceChildren();
    for (const [id, { start, dur }] of timing) {
      const a = byId.get(id)!;
      const lane = laneOf(id);
      const stacked = LANES[lane].ids.length > 1 && LANES[lane].ids[0] !== id && lane !== 0;
      const y = LANE_Y0 + lane * LANE_H + (LANES[lane].ids.length > 1 && lane !== 0 ? (stacked ? 11 : 3) : 4);
      const h = LANES[lane].ids.length > 1 && lane !== 0 ? 6 : 12;
      const end = Math.min(T_MAX, activeEnd(a, start, dur));
      bars.append(el('rect', { x: tx(start), y: y + h / 2 - 1, width: Math.max(0, tx(end) - tx(start)), height: 2, fill: BRASS, 'fill-opacity': 0.35 }));
      bars.append(el('rect', { class: 'ruler-bar', 'data-anim': id, x: tx(start), y, width: Math.max(1, tx(Math.min(end, start + dur)) - tx(start)), height: h, rx: 2, fill: BRASS, 'fill-opacity': 0.75, stroke: BROWN, 'stroke-width': 0.8 }));
      for (let t = start + dur, k = 0; t < end - 1e-6 && k < 40; t += dur, k++) bars.append(el('circle', { cx: tx(t), cy: y + h / 2, r: 2.2, fill: BRASS_HI, stroke: BROWN, 'stroke-width': 0.6 }));
      if (end < T_MAX && a.getAttribute('fill') === 'freeze') bars.append(el('line', { x1: tx(end), y1: y - 1, x2: tx(end), y2: y + h + 1, stroke: STEEL, 'stroke-width': 2 }));
      if (lane === 0 || !stacked) bars.append(mono(tx(start) + 3, y + h - (h > 8 ? 3 : 0.5), id, { 'font-size': h > 8 ? 8.5 : 6.5, fill: INK, 'font-weight': 700 }));
    }
    // Syncbase connectors (brass arrows from the dependency's begin/end/repeat to the dependent's start).
    for (const link of LINKS) {
      const src = timing.get(link.from), dst = timing.get(link.to);
      if (!src) continue;
      const t = link.at === 'begin' ? src.start + (link.offset ?? 0) : link.at === 'end' ? activeEnd(byId.get(link.from)!, src.start, src.dur) : src.start + src.dur * (link.n ?? 1);
      const fromLane = laneOf(link.from), toLane = laneOf(link.to);
      const x = tx(t);
      const y0 = LANE_Y0 + fromLane * LANE_H + (fromLane === toLane ? 4 : LANE_H / 2);
      const y1 = LANE_Y0 + toLane * LANE_H + (fromLane === toLane ? 4 : 2);
      const path = fromLane === toLane
        ? `M${x - 12},${y0 + 6} L${x - 12},${y0 - 3} L${x},${y0 - 3} L${x},${y0 + 1}`
        : `M${x},${y0} L${x},${y1}`;
      bars.append(el('path', { class: 'sync-link', d: path, fill: 'none', stroke: BRASS_HI, 'stroke-width': 1.3, 'marker-end': 'url(#brass-arrow)', opacity: dst ? 1 : 0.5 }));
      const ly = fromLane === toLane ? y0 - 6 : (y0 + y1) / 2 + 3;
      bars.append(mono(x + 4, ly, link.text, { 'font-size': 8.5, fill: BRASS_HI }));
    }
  };

  // Event log lighting (concept:smil-events): addEventListener on every scheduled animation, plus the two
  // property/attribute forms (a_balance.onrepeat property, a_strike onbegin= XML attribute).
  const rows = [...log.querySelectorAll('.log-row')] as SVGGElement[];
  const fire = (id: string, type: string, detail?: number): void => {
    for (const row of rows) {
      if (row.dataset.id !== id || row.dataset.type !== type) continue;
      if (type === 'repeatEvent' && row.dataset.n && detail !== undefined && Number(row.dataset.n) !== detail) continue;
      if (row.dataset.fired === '1') continue;
      row.dataset.fired = '1';
      const dot = row.querySelector('circle')!;
      dot.setAttribute('fill', type === 'beginEvent' ? BRASS_HI : type === 'repeatEvent' ? STEEL : RUBY);
      dot.setAttribute('stroke', BROWN);
      row.querySelectorAll('text').forEach(t => t.setAttribute('fill', CREAM));
      if (type === 'repeatEvent' && detail !== undefined) row.querySelector('.log-detail')!.textContent = `#${detail}`;
    }
  };
  for (const id of new Set(SCHEDULE.map(r => r.id))) {
    const a = byId.get(id);
    if (!a) continue;
    a.addEventListener('beginEvent', () => fire(id, 'beginEvent'));
    a.addEventListener('endEvent', () => fire(id, 'endEvent'));
    a.addEventListener('repeatEvent', e => fire(id, 'repeatEvent', (e as Event & { detail?: number }).detail));
  }
  let beats = 0;
  const balanceAnim = byId.get('a_balance')!;
  // api:SVGAnimationElement.onbegin family — the onrepeat *property* drives the beat counter.
  (balanceAnim as unknown as { onrepeat: ((e: Event) => void) | null }).onrepeat = () => { beats++; $('beat-counter').textContent = `拍数 #${beats}`; };
  window.__chronoStrikeBegin = () => { fire('a_strike', 'beginEvent'); $('log-title').textContent = '事件日志 · 打点中 (onbegin=)'; };
  byId.get('a_strike')!.addEventListener('endEvent', () => { $('log-title').textContent = '打点结束 · a_strike endEvent'; });
  // restart triple counters via beginEvent.
  for (const [mode] of restartModes) byId.get(`a_wind_${mode}`)!.addEventListener('beginEvent', () => { const c = $(`cnt-${mode}`); c.textContent = `×${Number(c.textContent!.slice(1)) + 1}`; });

  // Time base wiring (api:SVGSVGElement.setCurrentTime / pauseAnimations / unpauseAnimations / animationsPaused).
  const handle = $<SVGRectElement>('time-handle'), handleMark = $<SVGLineElement>('time-handle-mark');
  const readout = $('time-readout'), lamp = $('pause-lamp');
  const toSvg = (e: PointerEvent): DOMPoint => { const p = new DOMPoint(e.clientX, e.clientY); return p.matrixTransform(stage.getScreenCTM()!.inverse()); };
  const seekFromPointer = (e: PointerEvent): void => {
    const x = Math.min(1330, Math.max(1046, toSvg(e).x));
    stage.setCurrentTime((x - 1046) / 284 * T_MAX);
    syncUi();
  };
  const track = $('time-track');
  let dragging = false;
  track.addEventListener('pointerdown', e => { dragging = true; track.setPointerCapture(e.pointerId); seekFromPointer(e); });
  track.addEventListener('pointermove', e => { if (dragging) seekFromPointer(e); });
  track.addEventListener('pointerup', () => { dragging = false; });
  track.addEventListener('pointercancel', () => { dragging = false; });
  $('freeze_lever').addEventListener('click', () => { if (stage.animationsPaused()) stage.unpauseAnimations(); else stage.pauseAnimations(); syncUi(); });
  const detach = byId.get('a_detach')!;
  $('btn_begin').addEventListener('click', () => detach.beginElement());
  $('btn_beginAt').addEventListener('click', () => detach.beginElementAt(0.5));
  $('btn_end').addEventListener('click', () => detach.endElement());
  for (const id of ['freeze_lever', 'btn_begin', 'btn_beginAt', 'btn_end', 'silence_lever', 'wind_always', 'wind_whenNotActive', 'wind_never']) {
    $(id).addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); $(id).dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  }

  // HUD: hovered element, the animation driving it, its timing, jewel animVal and the CSS-vs-SMIL fork fill.
  const jewel = $<SVGCircleElement>('escape-jewel');
  const forkLever = $('fork-lever');
  let hudTarget: Element = $('escape-wheel');
  const describe = (): void => {
    const t = stage.getCurrentTime();
    const hit = hudTarget.closest('[id]') as Element | null;
    const related = animEls.filter(a => a.id && a.targetElement && hit && (a.targetElement === hit || hit.contains(a.targetElement) || a.targetElement.contains(hit)));
    const resolved = (a: AnimEl): boolean => { try { a.getStartTime(); return true; } catch { return false; } };
    const anim = related.find(resolved) ?? related[0];
    let startText = '—', durText = '—';
    if (anim) { try { startText = anim.getStartTime().toFixed(3); } catch { startText = '未解析'; } try { durText = anim.getSimpleDuration().toFixed(3); } catch { durText = 'indefinite'; } }
    const lines = [
      `svg.getCurrentTime() = ${t.toFixed(3)} s ${stage.animationsPaused() ? '❚❚' : '▶'}`,
      `命中: #${hit?.id ?? '—'}`,
      anim ? `动画 #${anim.id} → target #${anim.targetElement?.id || anim.targetElement?.localName}` : '动画: —（无 SMIL 驱动）',
      `getStartTime ${startText} · simpleDur ${durText}`,
      anim ? `anim.getCurrentTime() = ${anim.getCurrentTime().toFixed(3)} s` : '',
      `jewel r.baseVal ${jewel.r.baseVal.value.toFixed(1)} / r.animVal ${jewel.r.animVal.value.toFixed(2)}`,
      `fork fill CSS: ${STEEL}`,
      `fork fill 呈现: ${getComputedStyle(forkLever).fill}`,
      '动画三明治：SMIL > CSS > 属性',
      `discard: ${document.getElementById('shipping-clamp') ? '运输夹在 DOM' : '运输夹已移出 DOM'}`,
    ];
    lines.forEach((s, i) => { hudLines[i].textContent = s; });
  };
  stage.addEventListener('pointermove', e => {
    hudTarget = e.target as Element;
    const p = toSvg(e);
    const x = Math.min(1400 - 206, p.x + 16), y = Math.min(900 - 156, p.y + 16);
    hud.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    describe();
  });

  // Per-frame UI sync: playhead, slider handle, lamp, readouts, ruler bars — all derived from the SMIL clock.
  const playLine = playhead.querySelector('line')!, playTri = playhead.querySelector('path')!, playText = playhead.querySelector('text')!;
  const syncUi = (): void => {
    const t = stage.getCurrentTime();
    const x = tx(Math.min(T_MAX, t));
    playLine.setAttribute('x1', String(x)); playLine.setAttribute('x2', String(x));
    playTri.setAttribute('d', `M${x - 5},692 L${x + 5},692 L${x},699 Z`);
    playText.setAttribute('x', String(x)); playText.textContent = `t = ${t.toFixed(2)} s`;
    const hx = 1046 + Math.min(1, t / T_MAX) * 284;
    handle.setAttribute('x', String(hx - 11)); handleMark.setAttribute('x1', String(hx)); handleMark.setAttribute('x2', String(hx));
    const paused = stage.animationsPaused();
    lamp.setAttribute('fill', paused ? RUBY : '#4cc36a');
    readout.textContent = `t = ${t.toFixed(3)} s · animationsPaused() = ${paused}`;
    if (refreshTiming()) drawBars();
    describe();
  };
  const loop = (): void => { syncUi(); requestAnimationFrame(loop); };

  // Restart the document clock at 0 so the schedule and the DOM events line up, then run.
  stage.pauseAnimations();
  stage.setCurrentTime(0);
  syncUi();
  if (reduce && !isExport()) {
    freezeAt(stage, T0); // reduced motion: mechanism parked on the reference frame, decoration stopped by CSS
  } else {
    stage.unpauseAnimations();
  }
  requestAnimationFrame(loop);

  mark(stage,
    'av:animate.begin=syncbase', 'av:animate.begin=event', 'pv:transform=rotate', 'css:prefers-reduced-motion',
    'api:SVGSVGElement.setCurrentTime', 'api:SVGSVGElement.pauseAnimations', 'api:SVGSVGElement.unpauseAnimations', 'api:SVGSVGElement.animationsPaused', 'api:SVGSVGElement.getCurrentTime',
    'api:SVGAnimationElement.beginElement', 'api:SVGAnimationElement.beginElementAt', 'api:SVGAnimationElement.endElement',
    'api:SVGAnimationElement.getStartTime', 'api:SVGAnimationElement.getSimpleDuration', 'api:SVGAnimationElement.getCurrentTime', 'api:SVGAnimationElement.targetElement',
    'api:SVGAnimationElement.onbegin', 'api:SVGAnimatedLength.animVal', 'api:TimeEvent',
    'concept:smil-events', 'concept:smil-2026-support-status', 'concept:smil-overrides-css', 'concept:animation-sandwich-priority',
    'concept:visibility-child-override', 'concept:set-visibility-toggle', 'concept:multiple-begin-values',
    'concept:animate-transform-requires-animatetransform', 'concept:animatetransform-base-transform-preserved', 'concept:animatemotion-transform-stacking',
    'av:animate.begin=offset', 'av:animate.begin=repeat', 'av:animate.calcMode=spline', 'av:animate.repeatCount=indefinite',
    'av:animate.restart=whenNotActive', 'av:animate.restart=never', 'av:animateMotion.rotate=auto-reverse', 'pv:visibility=collapse');

  // Export: run in real time to T0 so begin/repeat/end events genuinely fire, then freeze precisely at T0.
  if (isExport()) {
    await new Promise<void>(resolve => {
      const started = performance.now();
      const tick = (): void => {
        if (stage.getCurrentTime() >= T0 || performance.now() - started > 14000) {
          freezeAt(stage, T0);
          syncUi();
          resolve();
        } else requestAnimationFrame(tick);
      };
      tick();
    });
  }
}
