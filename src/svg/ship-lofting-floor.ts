// ship-lofting-floor — 船体放样间 (docs/svg-feature-demos.md §3.3).
// A blueprint-coloured lofting floor: every path command becomes a full-size hull line laid on the station /
// waterline grid, and the pointer reveals any segment's control net while a readout prints the same segment in
// absolute and relative notation. Helper modules: -path (parser / segment table), -cards (command component
// table), -shelf (tool shelf + title band), -matrix (matrix table), -ui (palette).
import { el, mark, isExport, freezeAt, fmt } from './lib';
import { C, panel, label, g } from './ship-lofting-floor-ui';
import { buildSegments, nearestSegment, dist, type Seg, type Pt } from './ship-lofting-floor-path';
import { buildCards } from './ship-lofting-floor-cards';
import { buildTitleBand, buildShelf, type Detect } from './ship-lofting-floor-shelf';
import { buildMatrixTable } from './ship-lofting-floor-matrix';

// ── lofting grid: baseline y=604, station spacing SX=76 (St.0..10 → x=92..852), waterline spacing SY=62 (WL0..5)
const BASE_Y = 604, SX = 76, SY = 62, ST0 = 92;
const stX = (k: number): number => ST0 + SX * k;
const wlY = (j: number): number => BASE_Y - SY * j;
const LOFT = { x: 40, y: 96, w: 860, h: 544 };

// hull profile outline shared by #sheer-trace and the outer subpath of #hull-shell (sheer → stern → keel → bow)
const SHEER_D = 'M92 300 C168 268 244 252 320 250 S472 262 548 278 S700 306 852 296';
const OUTLINE_D = `${SHEER_D} L852 560 C660 566 572 578 516 588 C460 598 380 604 240 604 L92 604 Z`;
const DWL_A = 'M396 404 C472 380 548 366 624 362 S700 366 776 376 S814 382 852 384';
const DWL_B = 'M396 418 C472 402 548 392 624 388 S700 388 776 394 S814 396 852 398';
const DWL_BAD_A = 'M396 520 C472 506 548 500 624 498 S700 500 776 506 S814 510 852 514';
const DWL_BAD_B = 'M396 530 C472 520 548 514 624 512 S700 514 852 520'; // one S fewer → discrete fallback
const RABBET_A = 'M92 612H852', RABBET_B = 'M92 620C300 620 600 616 852 612';

interface Loft { lines: SVGPathElement[]; hullShell: SVGPathElement; probe: SVGPathElement; group: SVGGElement; rabbetD: string }

const inside = (p: Pt, r: { x: number; y: number; w: number; h: number }): boolean => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

/** Main lofting area (40,96)-(900,640): grid, hull shell, keel ×4, sheer, half-breadth, 11 sections, DWL morphs, rabbet. */
function buildLoft(stage: SVGSVGElement, detect: Detect): Loft {
  const group = g({ id: 'loft' }, panel(LOFT.x, LOFT.y, LOFT.w, LOFT.h));
  group.append(label(52, 112, '放样地板 · 型线 = 路径命令（指针掠过任一段 → 控制网）', { fill: C.dim }));
  group.append(label(52, 130, '横剖面 St.0–10：M V A L — 站 3/7 弧旋转 -12°，站 9 rx=0 退化为直线，站 10 弧起讫重合被忽略', { fill: C.faint }));

  // grid — ONE path, 17 subpaths: 6 waterlines with H only, 11 stations with V only (av:path.d=H/V, concept:multiple-subpaths)
  const gridD = [
    ...Array.from({ length: 6 }, (_, j) => `M${ST0} ${wlY(j)}H${stX(10)}`),
    ...Array.from({ length: 11 }, (_, k) => `M${stX(k)} ${BASE_Y}V${wlY(5)}`),
  ].join(' ');
  group.append(el('path', { id: 'loft-grid', d: gridD, fill: 'none', stroke: C.edge, 'stroke-width': .5, opacity: .45 }));
  for (let j = 0; j < 6; j++) group.append(label(86, wlY(j) + 4, `WL${j}`, { mono: true, fill: C.faint, anchor: 'end' }));
  group.append(label(72, 633, 'St.', { mono: true, fill: C.faint, anchor: 'end' }));
  for (let k = 0; k <= 10; k++) group.append(label(stX(k), 633, String(k), { mono: true, fill: C.faint, anchor: 'middle' }));

  // hull shell — four subpaths for isPointInFill / isPointInStroke: outer profile (clockwise), double-bottom ring
  // wound the other way (a hole under nonzero), two hatch islands wound like the outer (filled under nonzero,
  // holes under evenodd — the card ⑦ button toggles the rule)
  const hullShell = el('path', {
    id: 'hull-shell', 'fill-rule': 'nonzero', fill: C.cyan, 'fill-opacity': .07, stroke: C.cyan, 'stroke-opacity': 0, 'stroke-width': 8,
    d: `${OUTLINE_D} M200 548 L200 574 L760 574 L760 548 Z M380 310 H470 V330 H380 Z M560 316 H650 V336 H560 Z`,
  });
  group.append(hullShell);

  const lines: SVGPathElement[] = [];
  const line = (attrs: Record<string, string | number>, d: string | null, cls: string): SVGPathElement => {
    const p = el('path', { class: `hull-line ${cls}`, fill: 'none', ...attrs });
    if (d !== null) p.setAttribute('d', d);
    group.append(p);
    lines.push(p);
    return p;
  };

  // keel-drift ghost: the relative notation with ONE delta changed (l148 → l166) — everything after shifts +18
  line({ id: 'keel-drift', stroke: C.orange, 'stroke-opacity': .3, 'stroke-width': 4 }, 'm92 604l166 0c140 0 220-6 276-16s144-22 336-28', 'keel ghost');
  group.append(label(560, 552, 'keel-drift：l148 → l166 ⇒ 其后全体 +18', { fill: C.orange, opacity: .85 }));

  // the keel three ways (at:path.d, concept:relative-vs-absolute-commands, concept:path-number-syntax):
  // verbose absolute / compact (implicit L, glued negatives, 1.4e2) / all-relative — three strokes, one line
  line({ id: 'keel-verbose', stroke: C.yellow, 'stroke-width': 4, 'stroke-linecap': 'round' }, 'M 92 604 L 240 604 C 380 604, 460 598, 516 588 S 660 566, 852 560', 'keel');
  line({ id: 'keel-compact', stroke: C.cyan, 'stroke-width': 2, 'stroke-dasharray': '10 6' }, 'M92 604 240 604c1.4e2 0 220-6 276-16S660 566 852 560', 'keel');
  line({ id: 'keel-relative', stroke: C.white, 'stroke-width': 1, 'stroke-dasharray': '1 3', 'stroke-linecap': 'round' }, 'm92 604l148 0c140 0 220-6 276-16s144-22 336-28', 'keel');
  // legend
  const legend: [string, string, string, string][] = [
    ['#keel-verbose  M L C S 绝对', C.yellow, '', '4'], ['#keel-compact  隐式 L · 1.4e2', C.cyan, '10 6', '2'],
    ['#keel-relative m l c s 相对', C.white, '1 3', '1'], ['#keel-drift    l166 幽灵线', C.orange, '', '4'],
  ];
  legend.forEach(([name, stroke, dash, w], i) => {
    const x = 520 + (i % 2) * 186, y = 110 + Math.floor(i / 2) * 14;
    group.append(el('line', { x1: x, y1: y, x2: x + 26, y2: y, stroke, 'stroke-width': w, 'stroke-dasharray': dash || null, 'stroke-opacity': i === 3 ? .4 : 1 }));
    group.append(label(x + 32, y + 4, name, { mono: true, fill: C.dim }));
  });

  // sheer: one C then two S — tangent-continuous (av:path.d=C/S, concept:smooth-cubic-reflection)
  line({ id: 'sheer', stroke: C.green, 'stroke-width': 2.5 }, SHEER_D, 'sheer');
  group.append(label(700, 330, '#sheer  C + S + S 切线连续', { mono: true, fill: C.green }));
  // half-breadth: one Q then a chain of T — alternating symmetric humps (av:path.d=Q/T, concept:smooth-quadratic-reflection)
  line({ id: 'half-breadth', stroke: C.violet, 'stroke-width': 2 }, 'M92 470 Q168 430 244 470 T396 470 T548 470 T700 470 T852 470', 'half-breadth');
  group.append(label(852, 488, '#half-breadth  Q + T×4', { mono: true, fill: C.violet, anchor: 'end' }));

  // body plan: 11 sections `M<hb> <deck> V<bilge top> A rx ry rot 0 1 x y L92 604` (av:path.d=A/V/L, arc rotation,
  // rx=0 → straight line (concept:arc-zero-radius-line), coincident endpoints → arc ignored)
  const sections: [number, number, number, number, number, number][] = [ // hb deck rx ry rot endY
    [40, 300, 20, 24, 0, 598], [120, 282, 50, 40, 0, 600], [190, 268, 64, 46, 0, 602], [240, 260, 72, 50, -12, 604],
    [270, 258, 76, 52, 0, 604], [284, 262, 78, 52, 0, 604], [280, 270, 76, 52, 0, 604], [258, 280, 72, 50, -12, 604],
    [210, 290, 64, 46, 0, 602], [140, 298, 0, 24, 0, 604], [60, 296, 30, 30, 0, 574],
  ];
  sections.forEach(([hb, deck, rx, ry, rot, endY], k) => {
    const X = ST0 + hb;
    const endX = k === 10 ? X : X - (rx || 32);
    const d = `M${X} ${deck} V${BASE_Y - ry} A${rx} ${ry} ${rot} 0 1 ${endX} ${endY} L92 604`;
    line({ id: `station-${k}`, 'data-station': k, stroke: C.cyan, 'stroke-width': 1.2, 'stroke-opacity': .75 }, d, 'station');
  });

  // DWL — SMIL d morph between two paths with identical command sequences M C S S (concept:animate-path-d-morph);
  // both end states stay as faint dashes so the still frame still reads the morph interval
  for (const d of [DWL_A, DWL_B]) group.append(el('path', { class: 'dwl-ghost', d, fill: 'none', stroke: C.pink, 'stroke-width': .75, 'stroke-dasharray': '3 3', opacity: .2 }));
  const dwl = line({ id: 'dwl', stroke: C.pink, 'stroke-width': 2 }, DWL_A, 'dwl');
  dwl.append(el('animate', { attributeName: 'd', dur: '8s', repeatCount: 'indefinite', values: `${DWL_A};${DWL_B};${DWL_A}`, calcMode: 'spline', keyTimes: '0;.5;1', keySplines: '.4 0 .6 1;.4 0 .6 1' }));
  group.append(label(400, 352, '#dwl  设计水线 ⇄ 满载水线：M C S S ≡ M C S S → 平滑形变', { mono: true, fill: C.pink }));
  // DWL-bad — target has one S fewer: command lists differ → discrete jump at mid-interval (concept:animate-path-d-mismatch-discrete)
  for (const d of [DWL_BAD_A, DWL_BAD_B]) group.append(el('path', { class: 'dwl-ghost', d, fill: 'none', stroke: C.orange, 'stroke-width': .75, 'stroke-dasharray': '3 3', opacity: .2 }));
  const dwlBad = el('path', { id: 'dwl-bad', d: DWL_BAD_A, fill: 'none', stroke: C.orange, 'stroke-width': 1.5 });
  dwlBad.append(el('animate', { attributeName: 'd', dur: '4s', repeatCount: 'indefinite', values: `${DWL_BAD_A};${DWL_BAD_B};${DWL_BAD_A}` }));
  group.append(dwlBad);
  group.append(label(400, 494, '#dwl-bad  M C S S → M C S：命令不匹配 → 离散跳变', { mono: true, fill: C.orange }));

  // rabbet line — no d attribute: geometry from the stylesheet `d: path()` with a transition (css:d-property);
  // Firefox has no CSS d → write the same string back into the attribute
  const rabbet = line({ id: 'rabbet-line', stroke: C.yellow, 'stroke-width': 1, 'stroke-opacity': .7, 'stroke-dasharray': '6 3' }, detect.cssD ? null : RABBET_A, 'rabbet');
  group.append(label(520, 166, `#rabbet-line  ${detect.cssD ? 'CSS d: path() + transition .6s（指针进入地板触发）' : 'attribute fallback（无 CSS d）'}`, { mono: true, fill: C.yellow, opacity: .8 }));

  // sheer-trace: the whole profile as one stroke — stroke-dasharray = measured length (api:SVGGeometryElement.getTotalLength)
  const trace = el('path', { id: 'sheer-trace', d: OUTLINE_D, fill: 'none', stroke: C.white, 'stroke-width': 1, 'stroke-opacity': .55 });
  group.append(trace);
  // probe path for prefix-length measurements (buildSegments); never painted
  const probe = el('path', { id: 'seg-probe', d: 'M0 0', fill: 'none', stroke: 'none' });
  group.append(probe);
  stage.append(group);

  const L = trace.getTotalLength();
  trace.setAttribute('stroke-dasharray', `${L.toFixed(2)} ${L.toFixed(2)}`);
  group.append(label(520, 152, `#sheer-trace  L = ${L.toFixed(1)}mm → stroke-dasharray "L L"`, { mono: true, fill: C.dim }));

  // station marks along #sheer at L/10 steps, normals from ±1 samples (api:SVGGeometryElement.getPointAtLength)
  const sheer = lines.find(p => p.id === 'sheer')!;
  const SL = sheer.getTotalLength();
  const ticks = g({ id: 'sheer-ticks' });
  for (let k = 0; k <= 10; k++) {
    const s = SL * k / 10;
    const p = sheer.getPointAtLength(s), p0 = sheer.getPointAtLength(Math.max(0, s - 1)), p1 = sheer.getPointAtLength(Math.min(SL, s + 1));
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
    const nx = (p1.y - p0.y) / len, ny = -(p1.x - p0.x) / len; // normal pointing up
    ticks.append(el('line', { x1: p.x, y1: p.y, x2: p.x + nx * 12, y2: p.y + ny * 12, stroke: C.green, 'stroke-width': 1 }));
    ticks.append(label(p.x + nx * 22, p.y + ny * 22 + 4, String(k), { mono: true, fill: C.green, anchor: 'middle' }));
  }
  ticks.append(label(600, 236, 'L/10 等分站位 ← getPointAtLength', { mono: true, fill: C.green, opacity: .8 }));
  group.append(ticks);
  return { lines, hullShell, probe, group, rabbetD: RABBET_A };
}

// ── readout bar (40,648)-(900,700) ─────────────────────────────────────────────────────────────────────────
interface Readout { setSegment(seg: Seg): void; setState(insideHull: boolean, onStroke: boolean): void }

function buildReadout(stage: SVGSVGElement): Readout {
  const bar = g({ id: 'readout' }, panel(40, 648, 860, 52));
  const lamp = el('circle', { id: 'lamp-stroke', cx: 58, cy: 668, r: 4.5, fill: C.faint, stroke: C.edge, 'stroke-width': .5 });
  const lampText = label(66, 672, '压线', { fill: C.dim });
  const state = el('circle', { id: 'lamp-fill', cx: 58, cy: 688, r: 4.5, fill: C.green });
  const stateText = label(66, 692, '型内', { fill: C.dim, id: 'state-text' });
  bar.append(lamp, lampText, state, stateText);
  const rows = [660, 672, 684, 696].map(y => label(112, y, '', { mono: true, fill: C.text }));
  rows[1].setAttribute('fill', C.yellow);
  rows[2].setAttribute('fill', C.cyan);
  bar.append(...rows);
  // verification window: the absolute and relative strings each build a path; they coincide → Δ=0
  const win = el('svg', { id: 'verify-window', x: 770, y: 651, width: 120, height: 46, viewBox: '0 0 120 46', preserveAspectRatio: 'xMidYMid meet' });
  const frame = el('rect', { x: 770, y: 651, width: 120, height: 46, rx: 4, fill: C.panel, stroke: C.edge, 'stroke-width': .5 });
  const absPath = el('path', { id: 'verify-abs', fill: 'none', stroke: C.yellow, 'stroke-width': 3, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' });
  const relPath = el('path', { id: 'verify-rel', fill: 'none', stroke: C.cyan, 'stroke-width': 1, 'stroke-dasharray': '3 2', 'vector-effect': 'non-scaling-stroke' });
  win.append(absPath, relPath);
  const delta = label(764, 692, 'Δ=0', { mono: true, fill: C.green, anchor: 'end', id: 'verify-delta' });
  bar.append(frame, win, label(764, 664, '绝对串 / 相对串', { fill: C.faint, anchor: 'end' }), label(764, 678, '两条 path 叠画', { fill: C.faint, anchor: 'end' }), delta);
  stage.append(bar);
  return {
    setSegment(seg) {
      const path = seg.path;
      // api:SVGAnimatedString.baseVal — className.baseVal of the picked layer
      rows[0].textContent = `图层 class="${path.className.baseVal}"  #${path.id}  段 ${seg.index}  cmd ${seg.cmd}`;
      rows[1].textContent = `绝对  ${seg.abs}`;
      rows[2].textContent = `相对  ${seg.rel}`;
      const arc = seg.len1 - seg.len0, chord = dist(seg.start, seg.end);
      rows[3].textContent = `弧长 ${arc.toFixed(1)}mm  弦长 ${chord.toFixed(1)}mm  端点 (${fmt(seg.start.x)},${fmt(seg.start.y)})→(${fmt(seg.end.x)},${fmt(seg.end.y)})  相对 = 绝对 − 当前点`;
      const head = `M ${fmt(seg.start.x, 3)} ${fmt(seg.start.y, 3)} `;
      absPath.setAttribute('d', head + seg.abs);
      relPath.setAttribute('d', head + seg.rel);
      const bb = absPath.getBBox();
      const pad = 6, w = Math.max(bb.width + 2 * pad, 20), h = Math.max(bb.height + 2 * pad, 8);
      win.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${w} ${h}`);
      const diff = Math.abs(absPath.getTotalLength() - relPath.getTotalLength());
      delta.textContent = `Δ=${diff < .005 ? '0' : diff.toFixed(3)}`;
    },
    setState(insideHull, onStroke) {
      state.setAttribute('fill', insideHull ? C.green : C.red);
      stateText.textContent = insideHull ? '型内' : '型外';
      lamp.setAttribute('fill', onStroke ? C.yellow : C.faint);
      lampText.textContent = onStroke ? '压线 ●' : '压线';
    },
  };
}

// ── control-net reveal ───────────────────────────────────────────────────────────────────────────────────
/** Centre and radii of the ellipse an A segment lies on (SVG implementation notes F.6.5), or null for degenerate arcs. */
function arcEllipse(seg: Seg): { cx: number; cy: number; rx: number; ry: number; rot: number } | null {
  if (!seg.arc) return null;
  let { rx, ry } = seg.arc;
  const { rot, laf, sf } = seg.arc;
  rx = Math.abs(rx); ry = Math.abs(ry);
  if (rx === 0 || ry === 0 || dist(seg.start, seg.end) < 1e-6) return null;
  const phi = rot * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx2 = (seg.start.x - seg.end.x) / 2, dy2 = (seg.start.y - seg.end.y) / 2;
  const x1p = cos * dx2 + sin * dy2, y1p = -sin * dx2 + cos * dy2;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = (laf !== sf ? 1 : -1) * Math.sqrt(Math.max(0, num / den));
  const cxp = coef * rx * y1p / ry, cyp = -coef * ry * x1p / rx;
  return { cx: cos * cxp - sin * cyp + (seg.start.x + seg.end.x) / 2, cy: sin * cxp + cos * cyp + (seg.start.y + seg.end.y) / 2, rx, ry, rot };
}

function drawControlNet(net: SVGGElement, seg: Seg): void {
  net.replaceChildren();
  const { start, end, ctrl, reflected, mirror, samples } = seg;
  const dashed = (a: Pt, b: Pt, stroke: string, extra: Record<string, string | number> = {}) =>
    el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke, 'stroke-width': 1, 'stroke-dasharray': '4 3', ...extra });
  // chord
  net.append(dashed(start, end, C.faint, { 'stroke-dasharray': '2 4' }));
  // control polygon start → (reflected) → written controls → end (polyline, 1px dashed)
  const poly = [start, ...reflected, ...ctrl, end];
  net.append(el('polyline', { class: 'control-polygon', points: poly.map(p => `${fmt(p.x, 2)},${fmt(p.y, 2)}`).join(' '), fill: 'none', stroke: C.yellow, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
  // tangent extensions (40 user units) from the first / last sample pairs
  if (samples.length >= 2) {
    const ext = (a: Pt, b: Pt, from: Pt, sign: number): Pt => { const d = dist(a, b) || 1; return { x: from.x + sign * (b.x - a.x) / d * 40, y: from.y + sign * (b.y - a.y) / d * 40 }; };
    net.append(el('line', { x1: start.x, y1: start.y, ...pt2(ext(samples[0], samples[1], start, -1)), stroke: C.yellow, 'stroke-width': .75, 'stroke-opacity': .8 }));
    const n = samples.length;
    net.append(el('line', { x1: end.x, y1: end.y, ...pt2(ext(samples[n - 2], samples[n - 1], end, 1)), stroke: C.yellow, 'stroke-width': .75, 'stroke-opacity': .8 }));
  }
  // elliptical arc: the candidate ellipse and its radii
  const ell = arcEllipse(seg);
  if (ell) {
    net.append(el('ellipse', { cx: ell.cx, cy: ell.cy, rx: ell.rx, ry: ell.ry, transform: `rotate(${ell.rot} ${ell.cx} ${ell.cy})`, fill: 'none', stroke: C.cyan, 'stroke-width': .75, 'stroke-dasharray': '3 3', opacity: .7 }));
    net.append(el('path', { d: `M${ell.cx - 5} ${ell.cy}h10M${ell.cx} ${ell.cy - 5}v10`, stroke: C.cyan, 'stroke-width': 1 }));
    net.append(label(ell.cx + 8, ell.cy - 6, `rx ${fmt(ell.rx, 1)} ry ${fmt(ell.ry, 1)}${ell.rot ? ` rot ${ell.rot}°` : ''}`, { mono: true, fill: C.cyan }));
  }
  // S/T reflection: previous segment's last control (filled, violet) mirrored through the joint → hollow circle
  if (mirror && reflected.length) {
    net.append(dashed(mirror, reflected[0], C.violet, { 'stroke-dasharray': '3 3' }));
    net.append(el('rect', { class: 'ctrl-mirror', x: mirror.x - 2.5, y: mirror.y - 2.5, width: 5, height: 5, fill: C.violet }));
    net.append(label(mirror.x - 8, mirror.y - 8, '前段末控制点', { fill: C.violet, anchor: 'end' }));
    net.append(label(reflected[0].x + 8, reflected[0].y - 8, '镜射 · 未写出', { fill: C.yellow }));
  }
  for (const c of ctrl) net.append(el('rect', { class: 'ctrl-written', x: c.x - 2.5, y: c.y - 2.5, width: 5, height: 5, fill: C.yellow }));
  for (const r of reflected) net.append(el('circle', { class: 'ctrl-reflected', cx: r.x, cy: r.y, r: 5, fill: 'none', stroke: C.yellow, 'stroke-width': 1.5 }));
  // endpoints: hollow 7×7 squares with coordinates, arc length and chord length
  for (const p of [start, end]) net.append(el('rect', { class: 'endpoint', x: p.x - 3.5, y: p.y - 3.5, width: 7, height: 7, fill: 'none', stroke: C.white, 'stroke-width': 1.2 }));
  net.append(label(start.x, start.y - 9, `(${fmt(start.x)},${fmt(start.y)})`, { mono: true, fill: C.white, anchor: 'middle' }));
  net.append(label(end.x, end.y - 9, `(${fmt(end.x)},${fmt(end.y)})`, { mono: true, fill: C.white, anchor: 'middle' }));
  const mid = samples[Math.floor(samples.length / 2)] ?? start;
  net.append(label(mid.x, mid.y + 16, `${seg.cmd}  弧长 ${(seg.len1 - seg.len0).toFixed(1)}mm  弦长 ${dist(start, end).toFixed(1)}mm`, { mono: true, fill: C.yellow, anchor: 'middle' }));
}
const pt2 = (p: Pt): { x2: number; y2: number } => ({ x2: p.x, y2: p.y });

// ── scene ─────────────────────────────────────────────────────────────────────────────────────────────────
export function render(stage: SVGSVGElement): void {
  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-label', '船体放样间：路径命令化作船体型线');
  // card ⑧ renders two deliberately malformed d strings; Blink reports them as console errors
  stage.dataset.expectedErrors = 'attribute d: Expected';
  stage.append(el('title', {}, 'ship-lofting-floor — 船体放样间'));
  stage.append(el('desc', {}, '深靛地板上的足尺船体型线：龙骨三写法叠画、舷弧 C+S、半宽 Q+T、11 条横剖弧线、命令构件表、工具搁架与矩阵台；指针掠过任一段型线即揭示控制网并并排打印绝对/相对写法。'));

  const detect: Detect = {
    cssD: typeof CSS !== 'undefined' && CSS.supports('d', 'path("M0 0")'),
    cssGeom: typeof CSS !== 'undefined' && CSS.supports('r', '10px'),
    getPathData: typeof (SVGPathElement.prototype as unknown as { getPathData?: unknown }).getPathData === 'function',
    pathSegList: 'pathSegList' in SVGPathElement.prototype,
  };

  // stylesheet: picked-layer glow, duck geometry properties, CSS d for the rabbet line
  stage.append(el('style', {}, `
    #stage .hull-line.picked { filter: drop-shadow(0 0 3px rgba(255,255,255,.95)); }
    #stage circle.duck { r: var(--duck-r, 9px); transition: r .25s; }
    #stage circle.duck:hover { r: 14px; }
    #stage rect.duck-tray { width: 210px; }
    #stage #rabbet-line { d: path("${RABBET_A}"); transition: d .6s; }
    #stage.loaded #rabbet-line { d: path("${RABBET_B}"); }
    #stage .card .button:hover rect { fill-opacity: .7; }
  `));

  buildTitleBand(stage);
  const loft = buildLoft(stage, detect);
  let hullRule = 'nonzero';
  buildCards(stage, {
    detect,
    toggleHullRule: () => { hullRule = hullRule === 'nonzero' ? 'evenodd' : 'nonzero'; loft.hullShell.setAttribute('fill-rule', hullRule); return hullRule; },
  });
  const shelf = buildShelf(stage, detect);
  buildMatrixTable(stage);
  const readout = buildReadout(stage);

  // segment table: every hull line → {cmd, abs, rel, start, end, ctrl, reflected, len0, len1} (also serialised to data-seg)
  const segments: Seg[] = [];
  for (const path of loft.lines) {
    const segs = buildSegments(path, loft.probe, path.id === 'rabbet-line' ? loft.rabbetD : undefined);
    path.dataset.seg = JSON.stringify(segs.map(({ cmd, abs, rel, start, end, ctrl, reflected, len0, len1 }) => ({ cmd, abs, rel, start, end, ctrl, reflected, len0, len1 })));
    segments.push(...segs);
  }
  // getPathData cross-check where the engine offers it (Chrome/Safari); the built-in table stays authoritative
  if (detect.getPathData) {
    const keel = loft.lines.find(p => p.id === 'keel-verbose') as SVGPathElement & { getPathData(): unknown[] };
    const native = keel.getPathData().length, own = segments.filter(s => s.path === keel).length;
    stage.dataset.getPathDataCheck = `${native}/${own}`;
  }
  mark(stage, 'api:SVGPathElement.getPathData', 'api:SVGPathElement.pathSegList');

  // reveal layer — appended LAST so it sits above every hull line; pointer state dot on top of it
  const net = g({ id: 'control-net', 'pointer-events': 'none' });
  const stateDot = g({ id: 'pointer-state', 'pointer-events': 'none', transform: 'translate(300 520)' });
  stateDot.append(el('circle', { r: 6, fill: C.green, stroke: C.panel, 'stroke-width': 1.5 }), label(10, 4, '型内', { fill: C.green, id: 'pointer-state-text' }));
  stage.append(net, stateDot);

  let picked: Seg | null = null;
  const defaultSeg = segments.find(s => s.path.id === 'keel-verbose' && s.cmd === 'S')!; // keel S segment: shows the reflected control
  const select = (seg: Seg): void => {
    if (picked === seg) return;
    picked?.path.classList.remove('picked');   // api:Element.classList
    seg.path.classList.add('picked');
    picked = seg;
    drawControlNet(net, seg);
    readout.setSegment(seg);
  };
  select(defaultSeg);
  readout.setState(true, false);

  // pointer: screen → user space through getScreenCTM().inverse() (concept:mouse-to-svg-coordinates), rAF-throttled
  let pending: PointerEvent | null = null, frame = 0;
  const toUser = (ev: PointerEvent): Pt | null => {
    const ctm = stage.getScreenCTM();
    if (!ctm) return null;
    let p: DOMPoint | SVGPoint;
    if (typeof DOMPoint === 'function') p = new DOMPoint(ev.clientX, ev.clientY);
    else { p = stage.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; }
    const u = p.matrixTransform(ctm.inverse());
    return { x: u.x, y: u.y };
  };
  const tick = (): void => {
    frame = 0;
    const ev = pending;
    pending = null;
    if (!ev) return;
    const u = toUser(ev);
    if (!u) return;
    if (inside(u, LOFT)) {
      const hit = nearestSegment(segments, u, 40);
      select(hit ?? defaultSeg);
      const insideHull = loft.hullShell.isPointInFill(u);      // api:SVGGeometryElement.isPointInFill (fill-rule aware)
      const onStroke = loft.hullShell.isPointInStroke(u);      // api:SVGGeometryElement.isPointInStroke
      stateDot.setAttribute('transform', `translate(${fmt(u.x, 1)} ${fmt(u.y, 1)})`);
      stateDot.firstElementChild!.setAttribute('fill', insideHull ? C.green : C.red);
      const t = stateDot.querySelector('#pointer-state-text')!;
      t.textContent = insideHull ? '型内' : '型外';
      t.setAttribute('fill', insideHull ? C.green : C.red);
      readout.setState(insideHull, onStroke);
      window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
    } else if (inside(u, shelf.slider)) {
      shelf.setDuckT((u.x - 290) / 180);
      window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
    }
  };
  stage.addEventListener('pointermove', ev => { pending = ev; if (!frame) frame = requestAnimationFrame(tick); }); // api:Window.requestAnimationFrame
  loft.group.addEventListener('pointerenter', () => stage.classList.toggle('loaded')); // CSS d transition trigger

  // export still: freeze SMIL at 2.4s — #dwl mid-morph, #dwl-bad already jumped to its second value
  if (isExport()) freezeAt(stage, 2.4);

  mark(stage,
    'concept:relative-vs-absolute-commands', 'concept:path-number-syntax', 'concept:implicit-repeated-commands', 'concept:multiple-subpaths',
    'concept:smooth-cubic-reflection', 'concept:smooth-quadratic-reflection', 'concept:smooth-command-without-predecessor',
    'concept:arc-flag-combinations', 'concept:arc-flag-compact-parsing', 'concept:arc-radius-scaling', 'concept:arc-x-axis-rotation', 'concept:arc-zero-radius-line',
    'concept:zero-length-subpath-round-cap-dot', 'concept:zero-length-subpath-square-cap', 'concept:closepath-join-vs-cap', 'concept:fill-closes-open-subpaths',
    'concept:empty-d-not-rendered', 'concept:path-must-start-with-moveto', 'concept:path-error-partial-render', 'concept:relative-moveto-after-closepath',
    'concept:polygon-vs-path-equivalence', 'concept:winding-direction-holes',
    'concept:animate-path-d-morph', 'concept:animate-path-d-mismatch-discrete',
    'api:SVGGeometryElement.getTotalLength', 'api:SVGGeometryElement.getPointAtLength', 'api:SVGGeometryElement.isPointInFill', 'api:SVGGeometryElement.isPointInStroke',
    'api:SVGGeometryElement.pathLength', 'api:SVGGraphicsElement.getScreenCTM', 'api:Window.requestAnimationFrame', 'api:Element.classList', 'api:SVGAnimatedString.baseVal',
    'concept:mouse-to-svg-coordinates',
  );
  if (detect.cssD) mark(stage, 'css:d-property', 'css:d-property-transition');
}
