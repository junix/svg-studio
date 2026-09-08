// seismic-drum-console — 地震记录鼓控制台 (docs/svg-feature-demos.md §3.16).
// A smoked-paper drum record flattened into a 24-row sheet inside a nested-viewport camera. Three pens develop
// three rows — CSS @keyframes, Web Animations and a requestAnimationFrame loop — while the readout bar answers
// the design question ("where does the coordinate truth live?") by converting the same pointer through three
// independent chains (camera viewBox arithmetic, getScreenCTM/getCTM, a hand-built DOMMatrix) and demanding
// digit-for-digit agreement; a fourth, naive offsetX chain shows how far the letterbox and viewBox origin drift.
import { el, fragment, isExport, mark, FONT_MONO } from './lib';
import {
  R, C, PAPER_W, PAPER_H, ROW_H, UNITS_PER_MIN, TRACE_X0, TRACE_X1, ROW_TRAVEL, ROW_FRACTION, LOOP_MS,
  generateDay, arcAtX, penXAtPhase, offsetPctAtPhase, phaseAtOffsetPct, penPathD, fitViewport, pickStep,
  travelSeconds, fmtTime, f2, f3, signed, clamp, presetFrameIntervals, type Row,
} from './seismic-drum-console-data';
import { label, mono, panel, header, calibrationBar, overflowTriplet, calibrationTarget, cursorBricks, miniMeetSlice, slider } from './seismic-drum-console-panels';

const EXPORT_PHASE = { css: 0.88, waapi: 0.62, raf: 0.41 };  // §16: three visibly different development lengths
const PEN_ROWS = { css: 9, waapi: 10, raf: 11 } as const;
const rowBaseline = (hour: number): number => hour * ROW_H + ROW_H / 2;   // 332.5 / 367.5 / 402.5

export async function render(stage: SVGSVGElement): Promise<void> {
  const exporting = isExport();
  stage.setAttribute('lang', 'zh-CN');
  stage.setAttribute('role', 'application');
  stage.setAttribute('aria-labelledby', 'sdc-title sdc-desc');
  stage.append(el('title', { id: 'sdc-title' }, '地震记录鼓控制台 — viewBox 相机、CTM 链与指针的三种坐标真相'));
  stage.append(el('desc', { id: 'sdc-desc' }, '展平的二十四小时熏烟记录纸放在嵌套视口相机里；三支笔分别由 CSS 关键帧、Web Animations 与 requestAnimationFrame 驱动显影；读数条用相机链、变换链、手算链把同一个指针位置换算成走时并逐位校验。'));

  const rows = generateDay();
  const cssRow = rows[PEN_ROWS.css], waapiRow = rows[PEN_ROWS.waapi], rafRow = rows[PEN_ROWS.raf];

  // ------------------------------------------------------------------ <style>: state colouring, cursors, motion paths
  // concept:line-drawing-dash-animation — 40 keyframe segments (every 2% of the row travel) derived from the cumLen table
  const dashFrames = (row: Row): { offset: number; value: number }[] => {
    const frames: { offset: number; value: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const phase = ROW_TRAVEL * i / 40;
      frames.push({ offset: phase, value: row.length - arcAtX(row, penXAtPhase(phase)) });
    }
    frames.push({ offset: 1, value: 0 });
    return frames;
  };
  const cssDash = dashFrames(cssRow).map(f => `${(f.offset * 100).toFixed(2)}%{stroke-dashoffset:${f.value.toFixed(2)}}`).join('');
  const penPath = (hour: number) => `offset-path: path('${penPathD(rowBaseline(hour))}'); transform-box: view-box; transform-origin: 0 0;`;
  stage.append(fragment(`<style>
    /* api:SVGElement.dataset — row state colouring through [data-state] selectors */
    .row .trace { fill: none; stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
    [data-state="sealed"] .trace { stroke: ${C.sealed}; opacity: .7; }
    [data-state="recording"] .trace { stroke: ${C.recording}; }
    [data-state="flagged"] { filter: none; }
    [data-state="flagged"] .trace { stroke: ${C.recording}; }
    [data-state="flagged"] .flag { fill: ${C.flag}; fill-opacity: .16; }
    .row .hit { fill: #000; fill-opacity: 0; pointer-events: all; }
    [data-state="sealed"] .hit { cursor: not-allowed; }
    .row.selected .hit { fill: ${C.cyan}; fill-opacity: .08; }
    /* api:SVGSVGElement.checkIntersection — selection results */
    .trace[data-select="intersect"] { stroke: ${C.yellow} !important; opacity: 1 !important; }
    .trace[data-select="enclose"] { stroke: ${C.green} !important; opacity: 1 !important; }
    /* pr:cursor */
    #camera .paper { cursor: grab; }
    #stage[data-drag] #camera .paper, #stage[data-drag] .row .hit { cursor: grabbing; }
    #sample-cross { cursor: crosshair; }
    #ruler .ruler-hit { cursor: ns-resize; }
    /* pr:offset-path — one motion path per pen, shared by the three pieces of its pen carriage */
    .pen-css .piece { ${penPath(PEN_ROWS.css)} }
    .pen-waapi .piece { ${penPath(PEN_ROWS.waapi)} }
    .pen-debug .piece { ${penPath(8)} }
    /* pr:offset-rotate — nib follows the tangent, scraper faces backwards, ink weight stays upright */
    .piece.nib { offset-rotate: auto; }
    .piece.scraper { offset-rotate: reverse; }
    .piece.weight { offset-rotate: 0deg; }
    /* pr:offset-distance — CSS keyframes: 0→0, 82%→46.75% (row written), 100%→100% (lift, sweep back, drop) */
    .pen-css .piece { animation: pen-run ${LOOP_MS}ms linear infinite; }
    @keyframes pen-run { 0% { offset-distance: 0%; } 82% { offset-distance: ${(ROW_FRACTION * 100).toFixed(2)}%; } 100% { offset-distance: 100%; } }
    #trace-09 { animation: develop-09 ${LOOP_MS}ms linear infinite; }
    @keyframes develop-09 { ${cssDash} }
    /* css:animation-timeline-scroll — the paper feed draws itself as the drum scrolls; idle = frozen */
    .feed-ink { animation: ink linear both; animation-timeline: scroll(nearest block); }
    @keyframes ink { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: 0; } }
    .hour-block { transition: none; }
    .lamp[data-verdict="match"] { fill: ${C.green}; }
    .lamp[data-verdict="mismatch"] { fill: ${C.red}; }
  </style>`));

  // ------------------------------------------------------------------ camera: nested viewport (concept:nested-svg-viewport)
  const camera = el('svg', {
    id: 'camera', x: R.camera.x, y: R.camera.y, width: R.camera.w, height: R.camera.h,
    viewBox: `0 0 ${PAPER_W} ${PAPER_H}`, preserveAspectRatio: 'xMidYMid meet',
    style: 'touch-action: none;',   // pr:touch-action / pv:touch-action=none — drag pans the paper, never the page
  });
  stage.append(camera);
  const paperRect = el('rect', { class: 'paper', width: PAPER_W, height: PAPER_H, fill: C.paper });
  camera.append(paperRect);
  // grid: minute lines every 5 min, row separators every 35 units
  const grid = el('g', { id: 'grid', stroke: C.gridMinor, 'stroke-width': 1 });
  for (let m = 0; m <= 60; m += 5) grid.append(el('line', { x1: m * UNITS_PER_MIN, y1: 0, x2: m * UNITS_PER_MIN, y2: PAPER_H, stroke: m % 15 === 0 ? C.grid : C.gridMinor }));
  for (let h = 0; h <= 24; h++) grid.append(el('line', { x1: 0, y1: h * ROW_H, x2: PAPER_W, y2: h * ROW_H, stroke: C.grid }));
  camera.append(grid);

  // rows: <g class="row" data-hour data-state transform="translate(0, h·35)"> — sealed first, recording last (layer order)
  const rowEls: SVGGElement[] = [];
  const traceEls: SVGGeometryElement[] = [];
  const rowLayer = el('g', { id: 'rows' });
  for (const row of rows) {
    const g = el('g', { class: 'row', 'data-hour': String(row.hour).padStart(2, '0'), 'data-state': row.state, transform: `translate(0,${row.hour * ROW_H})` });
    if (row.state === 'flagged') g.append(el('rect', { class: 'flag', width: PAPER_W, height: ROW_H }));
    g.append(el('rect', { class: 'hit', width: PAPER_W, height: ROW_H }));
    if (row.hour === PEN_ROWS.raf) {
      // api:Window.requestAnimationFrame — this trace is a <polyline> whose points are rewritten each frame
      const poly = el('polyline', { id: 'trace-11', class: 'trace', points: `${TRACE_X0},${ROW_H / 2}` });
      g.append(poly); traceEls.push(poly);
    } else if (row.pts.length) {
      const path = el('path', { id: `trace-${String(row.hour).padStart(2, '0')}`, class: 'trace', d: row.d });
      if (row.state === 'recording') { path.setAttribute('stroke-dasharray', `${row.length.toFixed(2)} ${row.length.toFixed(2)}`); path.setAttribute('stroke-dashoffset', row.length.toFixed(2)); }
      g.append(path); traceEls.push(path);
    }
    rowEls.push(g); rowLayer.append(g);
  }
  camera.append(rowLayer);
  // event annotations (P / S arrivals on the flagged rows)
  const events = el('g', { id: 'events', 'font-family': FONT_MONO, 'font-size': 18, fill: C.flag });
  for (const row of rows) for (const ev of row.events) {
    const y = row.hour * ROW_H;
    events.append(el('line', { x1: ev.x, y1: y + 2, x2: ev.x, y2: y + ROW_H - 2, stroke: C.flag, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
    events.append(el('text', { x: ev.x + 4, y: y + 15 }, `${ev.label} ${String(row.hour).padStart(2, '0')}:${String(Math.floor(ev.x * 2.5 / 60)).padStart(2, '0')}`));
  }
  camera.append(events);

  // ------------------------------------------------------------------ jitter band (rows 12–13 are the paper splice)
  const jitter = el('g', { id: 'jitter-band' });
  const JY0 = 12 * ROW_H;   // 420
  const jitterBars: SVGRectElement[] = [];
  const barsG = el('g', { fill: C.muted });
  for (let i = 0; i < 240; i++) { const r = el('rect', { x: TRACE_X0 + i * (1368 / 240), y: JY0 + 44, width: 4, height: 0 }); jitterBars.push(r); barsG.append(r); }
  const phaseLines = (['css', 'waapi', 'raf'] as const).map(kind => el('polyline', { class: `phase-${kind}`, fill: 'none', 'stroke-width': 1.2, stroke: kind === 'css' ? C.blue : kind === 'waapi' ? C.magenta : C.green, points: '' }));
  const jitterText = el('text', { x: TRACE_X1, y: JY0 + 14, 'font-family': FONT_MONO, 'font-size': 18, fill: C.muted, 'text-anchor': 'end' }, '');
  jitter.append(
    el('line', { x1: TRACE_X0, y1: JY0 + 44, x2: TRACE_X1, y2: JY0 + 44, stroke: C.grid }),
    el('line', { x1: TRACE_X0, y1: JY0 + 58, x2: TRACE_X1, y2: JY0 + 58, stroke: C.grid, 'stroke-dasharray': '4 4' }),
    barsG, ...phaseLines,
    el('text', { x: TRACE_X0, y: JY0 + 14, 'font-family': FONT_MONO, 'font-size': 18, fill: C.muted }, '抖动带 · 竖条 = 每帧 dt（>20 ms 红）· 细线 = 三笔相位误差  CSS 蓝 · WAAPI 紫 · rAF 绿'),
    jitterText,
  );
  camera.append(jitter);

  // ------------------------------------------------------------------ pens: three carriages on shared motion paths
  const pieceShapes = {
    nib: () => el('g', { class: 'piece nib' }, el('polygon', { points: '0,0 -16,-5 -13,0 -16,5', fill: C.recording }), el('circle', { r: 2.2, fill: C.cream })),
    scraper: () => el('g', { class: 'piece scraper' }, el('polygon', { points: '4,0 18,-3 18,3', fill: C.cyan, 'fill-opacity': .9 })),
    weight: () => el('g', { class: 'piece weight' }, el('rect', { x: -5, y: -19, width: 10, height: 9, rx: 2, fill: C.amber }), el('line', { y1: -10, y2: -3, stroke: C.amber, 'stroke-width': 1.5 })),
  };
  const makePen = (cls: string): { g: SVGGElement; pieces: SVGGElement[] } => {
    const pieces = [pieceShapes.weight(), pieceShapes.scraper(), pieceShapes.nib()];
    const g = el('g', { class: `pen ${cls}` }, ...pieces);
    return { g, pieces };
  };
  const penCss = makePen('pen-css'), penWaapi = makePen('pen-waapi'), penRaf = makePen('pen-raf'), penDebug = makePen('pen-debug');
  penDebug.g.setAttribute('opacity', '.45');
  penDebug.pieces.forEach(p => { p.style.offsetDistance = '30%'; });   // static offset-distance (slider-driven, for freeze debugging)
  // rAF pen pieces: transform lists manipulated per frame through transform.baseVal items
  penRaf.pieces.forEach(p => p.setAttribute('transform', 'translate(0 0) rotate(0)'));
  // visible motion paths (thin dotted) so the return arcs are readable
  const pathsG = el('g', { fill: 'none', stroke: C.dim, 'stroke-width': .8, 'stroke-dasharray': '3 5' });
  for (const hour of [PEN_ROWS.css, PEN_ROWS.waapi, PEN_ROWS.raf]) pathsG.append(el('path', { d: penPathD(rowBaseline(hour)) }));
  const rafPath = el('path', { id: 'pen-path-raf', d: penPathD(rowBaseline(PEN_ROWS.raf)) });
  pathsG.append(rafPath);
  camera.append(pathsG, penDebug.g, penCss.g, penWaapi.g, penRaf.g);
  // lasso rectangle in paper space (drawn from camera.createSVGRect())
  const lasso = el('rect', { id: 'lasso', fill: C.yellow, 'fill-opacity': .08, stroke: C.yellow, 'stroke-width': 1.5, 'stroke-dasharray': '8 5', visibility: 'hidden' });
  camera.append(lasso);

  // ------------------------------------------------------------------ camera chrome (stage space): letterbox bars, frame, corners, hour labels
  const chrome = el('g', { id: 'camera-chrome' });
  const letterboxL = el('rect', { class: 'letterbox', fill: '#0e0906', 'fill-opacity': .9 });
  const letterboxR = el('rect', { class: 'letterbox', fill: '#0e0906', 'fill-opacity': .9 });
  const letterboxLabel = mono(0, 0, '', 11, C.amber, 'middle');
  const cameraFrame = el('rect', { id: 'camera-frame', x: R.camera.x, y: R.camera.y, width: R.camera.w, height: R.camera.h, fill: 'none', stroke: C.amber, 'stroke-width': 1.5 });
  const hourClip = el('clipPath', { id: 'camera-clip' }, el('rect', { id: 'camera-clip-rect', x: R.camera.x, y: R.camera.y, width: R.camera.w, height: R.camera.h }));
  const hourLabels = el('g', { id: 'hour-labels', 'clip-path': 'url(#camera-clip)' });
  const corners = el('g', { id: 'camera-corners' }, ...[0, 1, 2, 3].map(() => el('circle', { r: 4, fill: C.cyan, stroke: C.panel, 'stroke-width': 1 })));
  chrome.append(hourClip, letterboxL, letterboxR, letterboxLabel, hourLabels, cameraFrame, corners);
  stage.append(chrome);

  // ------------------------------------------------------------------ overlay: sample crosshair, annotation ink, touch points
  const overlay = el('g', { id: 'overlay' });
  const cross = el('g', { id: 'sample-cross', 'pointer-events': 'none' },
    el('line', { class: 'cx-h', stroke: C.cyan, 'stroke-width': 1, 'stroke-dasharray': '4 4', 'stroke-opacity': .8 }),
    el('line', { class: 'cx-v', stroke: C.cyan, 'stroke-width': 1, 'stroke-dasharray': '4 4', 'stroke-opacity': .8 }),
    el('circle', { class: 'cx-dot', r: 5, fill: 'none', stroke: C.cyan, 'stroke-width': 1.5 }),
    el('circle', { class: 'cx-b', r: 2, fill: C.green }),   // chain-B getCTM round trip lands here
    mono(0, 0, '', 11, C.cyan, 'start', { class: 'cx-label' }));
  const ink = el('g', { id: 'annotation-ink', fill: 'none', 'stroke-linecap': 'round', 'pointer-events': 'none' });
  const touches = el('g', { id: 'touch-points', 'pointer-events': 'none' });
  overlay.append(ink, touches, cross);
  stage.append(overlay);

  // ------------------------------------------------------------------ panels
  const rulerG = el('g', { id: 'ruler' });
  const rulerTicks = el('g', { id: 'ruler-ticks' });
  const rulerLeft = mono(R.ruler.x + 4, R.ruler.y + 30, '', 11, C.muted);
  const rulerRight = mono(R.ruler.x + R.ruler.w - 4, R.ruler.y + 30, '', 11, C.green, 'end');
  rulerG.append(panel(R.ruler, { rx: 3 }), el('rect', { class: 'ruler-hit', x: R.ruler.x, y: R.ruler.y, width: R.ruler.w, height: R.ruler.h, fill: '#000', 'fill-opacity': 0 }), rulerTicks, rulerLeft, rulerRight);

  // overview: same viewBox, slice → crops 22.67 px top and bottom (av:svg.preserveAspectRatio=slice)
  const overviewG = el('g', { id: 'overview-panel' });
  const overview = el('svg', { id: 'overview', x: R.overview.x, y: R.overview.y, width: R.overview.w, height: R.overview.h, viewBox: `0 0 ${PAPER_W} ${PAPER_H}`, preserveAspectRatio: 'xMidYMid slice' });
  overview.append(el('rect', { width: PAPER_W, height: PAPER_H, fill: C.paper }));
  for (const row of rows) if (row.pts.length) overview.append(el('polyline', {
    fill: 'none', stroke: row.state === 'sealed' ? C.sealed : C.recording, 'stroke-width': 3, 'stroke-opacity': .8,
    points: row.pts.filter((_, i) => i % 5 === 0).map(p => `${p.x.toFixed(1)},${(row.hour * ROW_H + p.y).toFixed(1)}`).join(' '),
  }));
  // concept:nearest-viewport-percentage-resolution — width="50%" resolves against this viewport's viewBox (720 units = 152 px)
  const pctBand = el('rect', { id: 'pct-overview', x: 0, y: 118, width: '50%', height: 28, fill: C.cyan, 'fill-opacity': .28, stroke: C.cyan, 'stroke-width': 3 });
  const ovFrame = el('rect', { id: 'ov-frame', fill: 'none', stroke: C.cyan, 'stroke-width': 7 });
  overview.append(pctBand, ovFrame);
  const ovClip = el('clipPath', { id: 'ov-clip' }, el('rect', { x: R.overview.x - 6, y: R.overview.y - 6, width: R.overview.w + 12, height: R.overview.h + 12 }));
  const ovCorners = el('g', { id: 'ov-corners', 'clip-path': 'url(#ov-clip)' }, ...[0, 1, 2, 3].map(() => el('circle', { r: 3.5, fill: C.cyan, stroke: C.panel })));
  // stage-space sibling: the same width="50%" is 700 台面 units here
  const pctStage = el('rect', { id: 'pct-stage', x: R.overview.x, y: 691, width: '50%', height: 3, fill: C.cyan, 'fill-opacity': .6 });
  overviewG.append(overview, ovClip, ovCorners, el('rect', { x: R.overview.x, y: R.overview.y, width: R.overview.w, height: R.overview.h, fill: 'none', stroke: C.panelEdge }), pctStage,
    mono(R.overview.x + 4, R.overview.y + 12, 'preserveAspectRatio="xMidYMid slice" · k=0.2111 · 上下各裁 22.67 px', 11, C.cream),
    miniMeetSlice(R.overview.x, 846),
    mono(R.overview.x + 138, 852, 'width="50%" 于总览 = 720 纸单位 = 152 px', 11, C.cyan),
    mono(R.overview.x + 138, 866, 'width="50%" 于台面 = 700 台面单位 (上方青线)', 11, C.cyan),
    mono(R.overview.x + 138, 880, '青点 = 取景框四角 DOMPoint·matrixTransform', 11, C.muted),
  );

  const target = calibrationTarget();
  const readoutG = el('g', { id: 'readout' });
  readoutG.append(panel(R.readout));
  const RX = R.readout.x + 10;
  // transform-list stand (top strip)
  const tlHost = el('g', { transform: `translate(${R.readout.x + 36} ${R.readout.y + 34})` });
  const tlGlyph = el('g', { id: 'tl-glyph' }, el('polygon', { points: '0,0 -22,-6 -22,6', fill: C.amber }), el('circle', { r: 3, fill: C.cream }), el('rect', { x: -6, y: -18, width: 12, height: 9, rx: 2, fill: C.amber, 'fill-opacity': .7 }));
  tlHost.append(el('circle', { r: 26, fill: 'none', stroke: C.dim, 'stroke-dasharray': '2 3' }), tlGlyph);
  const tlLines = [0, 1, 2].map(i => mono(RX + 60, R.readout.y + 18 + i * 15, '', 11, i === 0 ? C.cream : C.muted));
  readoutG.append(tlHost, ...tlLines, el('line', { x1: R.readout.x, y1: R.readout.y + 60, x2: R.readout.x + R.readout.w, y2: R.readout.y + 60, stroke: C.panelEdge }));
  // readout lines
  const roTitle = label(RX, R.readout.y + 76, '', 12, C.cream);
  const roLines = ['A', 'B', 'C', 'D', 'F', 'G', 'H'].map((_, i) => mono(RX, R.readout.y + 91 + i * 14, '', 11, C.cream));
  const lamp = el('circle', { class: 'lamp', id: 'verdict-lamp', cx: R.readout.x + R.readout.w - 14, cy: R.readout.y + 115, r: 6, fill: C.dim, 'data-verdict': 'pending' });
  readoutG.append(roTitle, ...roLines, lamp);

  const controls = el('g', { id: 'controls' });
  controls.append(panel(R.controls), label(R.controls.x + 10, R.controls.y + 20, '控制列', 13, C.cream, 'start', { 'font-weight': 700 }));

  stage.append(rulerG, overviewG, calibrationBar(), overflowTriplet(), target.g, readoutG, controls);

  // ------------------------------------------------------------------ paper feed drum: scroll-driven ink (foreignObject host)
  const feedFO = el('foreignObject', { id: 'feed-host', x: R.feed.x, y: R.feed.y, width: R.feed.w, height: R.feed.h });
  const feedDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div') as HTMLDivElement;
  feedDiv.id = 'feed';
  feedDiv.setAttribute('style', `width:${R.feed.w}px;height:${R.feed.h}px;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;border:1px solid ${C.panelEdge};border-radius:6px;background:rgba(23,17,12,.94);scrollbar-width:thin;scrollbar-color:${C.panelEdge} transparent;box-sizing:border-box;`);
  const feedSvg = el('svg', { width: R.feed.w - 2, height: 1560, viewBox: `0 0 ${R.feed.w - 2} 1560`, style: 'display:block' });
  const feedBlocks: SVGGElement[] = [];
  const feedInks: { el: SVGPolylineElement; len: number }[] = [];
  for (const row of rows) {
    const y0 = row.hour * 65;
    const block = el('g', { class: 'hour-block', 'data-hour': String(row.hour).padStart(2, '0'), style: 'opacity:.25' });
    block.append(el('rect', { x: 0, y: y0, width: R.feed.w - 2, height: 65, fill: row.hour % 2 ? '#1d1610' : '#17110c' }));
    block.append(el('text', { x: 6, y: y0 + 14, 'font-family': FONT_MONO, 'font-size': 11, fill: row.state === 'recording' ? C.recording : C.muted }, `${String(row.hour).padStart(2, '0')}h`));
    if (row.pts.length) {
      const pts = row.pts.filter((_, i) => i % 3 === 0).map(p => ({ x: 34 + (p.x - TRACE_X0) / 1368 * 166, y: y0 + 36 + (p.y - ROW_H / 2) * 0.8 }));
      let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      const poly = el('polyline', { class: 'feed-ink', fill: 'none', stroke: row.state === 'sealed' ? C.sealed : C.recording, 'stroke-width': 1.2, 'stroke-dasharray': len.toFixed(1), style: `--len:${len.toFixed(1)}`, points: pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') });
      block.append(poly); feedInks.push({ el: poly, len });
    }
    feedBlocks.push(block); feedSvg.append(block);
  }
  feedDiv.append(feedSvg); feedFO.append(feedDiv);
  const feedPanel = el('g', { id: 'feed-panel' }, feedFO, mono(R.feed.x + R.feed.w / 2, R.feed.y - 6, '走纸卷筒 · animation-timeline: scroll()', 11, C.muted, 'middle'));
  const feedChip = mono(R.feed.x + R.feed.w / 2, R.feed.y + R.feed.h + 14, '', 11, C.muted, 'middle');
  feedPanel.append(feedChip);
  stage.append(feedPanel, header());

  // ------------------------------------------------------------------ camera state and viewport arithmetic
  const view = { vx: 0, vy: 0, vw: PAPER_W, vh: PAPER_H };
  const camGeom = () => ({ x0: camera.x.baseVal.value, y0: camera.y.baseVal.value, w: camera.width.baseVal.value, h: camera.height.baseVal.value });
  /** Chain-A style fit of the current camera (reads viewBox.baseVal — api:SVGSVGElement.viewBox / api:SVGAnimatedRect.baseVal). */
  const cameraFit = () => { const vb = camera.viewBox.baseVal; const g = camGeom(); return fitViewport(g.x0, g.y0, g.w, g.h, vb.x, vb.y, vb.width, vb.height); };
  const clampView = () => {
    view.vw = clamp(view.vw, 180, 2880); view.vh = view.vw * PAPER_H / PAPER_W;
    view.vx = clamp(view.vx, -view.vw / 2, PAPER_W - view.vw / 2); view.vy = clamp(view.vy, -view.vh / 2, PAPER_H - view.vh / 2);
  };
  const applyView = () => {
    clampView();
    // concept:viewbox-camera-zoom / concept:viewbox-camera-pan — the camera is nothing but viewBox.baseVal
    const vb = camera.viewBox.baseVal;
    vb.x = view.vx; vb.y = view.vy; vb.width = view.vw; vb.height = view.vh;
    refreshAll();
  };

  // ---- ruler (mapped through the chain-A matrix; ticks fall inside the letterbox)
  let roText = 'ResizeObserver 等待首次回调';
  const refreshRuler = () => {
    rulerTicks.replaceChildren();
    const fit = cameraFit(); const g = camGeom();
    const step = pickStep(fit.k);
    const left = g.x0 + Math.max(0, fit.gapX), right = g.x0 + g.w - Math.max(0, fit.gapX);
    const M = new DOMMatrix().translateSelf(fit.tx, fit.ty).scaleSelf(fit.k, fit.k);
    for (let m = 0; m <= 60; m += step) {
      const sx = new DOMPoint(m * UNITS_PER_MIN, 0).matrixTransform(M).x;
      if (sx < left - 0.01 || sx > right + 0.01) continue;
      const major = m % (step * 5) === 0;
      rulerTicks.append(el('line', { x1: sx, y1: R.ruler.y, x2: sx, y2: R.ruler.y + (major ? 9 : 6), stroke: major ? C.amber : C.muted, 'stroke-width': major ? 1.5 : 1 }));
      rulerTicks.append(mono(sx, R.ruler.y + 19, String(m).padStart(2, '0'), 11, major ? C.cream : C.muted, 'middle'));
    }
    rulerLeft.textContent = `时标尺 · 步长 ${step} min (间距 ${(step * UNITS_PER_MIN * fit.k).toFixed(1)} px ≥ 26) · k=${fit.k.toFixed(4)} · 信箱 ${f2(Math.max(0, fit.gapX))} px`;
    rulerRight.textContent = roText;
  };

  // ---- camera chrome
  const refreshChrome = () => {
    const fit = cameraFit(); const g = camGeom();
    const gx = Math.max(0, fit.gapX), gy = Math.max(0, fit.gapY);
    if (gx > 0.5) {
      letterboxL.setAttribute('x', String(g.x0)); letterboxL.setAttribute('y', String(g.y0)); letterboxL.setAttribute('width', String(gx)); letterboxL.setAttribute('height', String(g.h));
      letterboxR.setAttribute('x', String(g.x0 + g.w - gx)); letterboxR.setAttribute('y', String(g.y0)); letterboxR.setAttribute('width', String(gx)); letterboxR.setAttribute('height', String(g.h));
      letterboxLabel.setAttribute('transform', `translate(${g.x0 + g.w - gx / 2 + 4} ${g.y0 + g.h / 2}) rotate(-90)`);
      letterboxLabel.textContent = `信箱边 ${f2(gx)} px · meet 留空`;
    } else {
      letterboxL.setAttribute('x', String(g.x0)); letterboxL.setAttribute('y', String(g.y0)); letterboxL.setAttribute('width', String(g.w)); letterboxL.setAttribute('height', String(gy));
      letterboxR.setAttribute('x', String(g.x0)); letterboxR.setAttribute('y', String(g.y0 + g.h - gy)); letterboxR.setAttribute('width', String(g.w)); letterboxR.setAttribute('height', String(gy));
      letterboxLabel.setAttribute('transform', `translate(${g.x0 + g.w / 2} ${g.y0 + g.h - gy / 2 + 4})`);
      letterboxLabel.textContent = `信箱边 ${f2(gy)} px（上下）`;
    }
    cameraFrame.setAttribute('width', String(g.w)); cameraFrame.setAttribute('height', String(g.h));
    (hourClip.firstElementChild as SVGRectElement).setAttribute('width', String(g.w));
    // hour labels in the left letterbox band, mapped through the same matrix as the ruler
    hourLabels.replaceChildren();
    if (gx >= 20) for (const row of rows) {
      const y = fit.ty + fit.k * (row.hour * ROW_H + ROW_H / 2);
      if (y < g.y0 || y > g.y0 + g.h) continue;
      hourLabels.append(mono(g.x0 + gx / 2, y + 4, String(row.hour).padStart(2, '0'), 11, row.state === 'recording' ? C.recording : row.state === 'flagged' ? C.flag : C.muted, 'middle'));
    }
    // api:DOMPoint.matrixTransform — the four viewBox corners mapped into 台面 space (they must stay on the frame corners)
    const M = new DOMMatrix().translateSelf(fit.tx, fit.ty).scaleSelf(fit.k, fit.k);
    const vb = camera.viewBox.baseVal;
    const cornersP = [[vb.x, vb.y], [vb.x + vb.width, vb.y], [vb.x, vb.y + vb.height], [vb.x + vb.width, vb.y + vb.height]];
    cornersP.forEach(([x, y], i) => { const p = new DOMPoint(x, y).matrixTransform(M); const c = corners.children[i]; c.setAttribute('cx', f2(p.x)); c.setAttribute('cy', f2(p.y)); });
  };

  // ---- overview frame + corner dots (paper → overview space by the slice fit)
  const refreshOverview = () => {
    const vb = camera.viewBox.baseVal;
    ovFrame.setAttribute('x', String(vb.x)); ovFrame.setAttribute('y', String(vb.y)); ovFrame.setAttribute('width', String(vb.width)); ovFrame.setAttribute('height', String(vb.height));
    const fit = fitViewport(R.overview.x, R.overview.y, R.overview.w, R.overview.h, 0, 0, PAPER_W, PAPER_H, true);
    const M = new DOMMatrix().translateSelf(fit.tx, fit.ty).scaleSelf(fit.k, fit.k);
    [[vb.x, vb.y], [vb.x + vb.width, vb.y], [vb.x, vb.y + vb.height], [vb.x + vb.width, vb.y + vb.height]].forEach(([x, y], i) => {
      const p = new DOMPoint(x, y).matrixTransform(M); const c = ovCorners.children[i]; c.setAttribute('cx', f2(p.x)); c.setAttribute('cy', f2(p.y));
    });
  };

  // ------------------------------------------------------------------ the three conversion chains (§8)
  interface Sample { client: DOMPoint; stagePt: DOMPoint; a: DOMPoint; b: DOMPoint; c: DOMPoint; bStage: DOMPoint; naive: DOMPoint; legacyOk: boolean; rowEl: SVGGElement; coalesced: number }
  let checks = 0, mismatches = 0;
  let lastClient = new DOMPoint(0, 0);
  let lastRow: SVGGElement = rowEls[PEN_ROWS.css];
  let lastCoalesced = 1;
  let selectedRow: SVGGElement | null = null;

  const convert = (cx: number, cy: number, rowEl: SVGGElement, offsetX?: number, offsetY?: number): Sample => {
    const screenCTM = stage.getScreenCTM()!;
    const stagePt = new DOMPoint(cx, cy).matrixTransform(screenCTM.inverse());
    // Chain A — camera chain: viewBox.baseVal + viewport attributes, meet arithmetic by hand, composed with the root screen CTM
    const vb = camera.viewBox.baseVal; const g = camGeom();
    const k = Math.min(g.w / vb.width, g.h / vb.height);
    const tx = g.x0 + (g.w - vb.width * k) / 2, ty = g.y0 + (g.h - vb.height * k) / 2;
    const MA = DOMMatrix.fromMatrix(screenCTM).translate(tx, ty).scale(k).translate(-vb.x, -vb.y);
    const a = new DOMPoint(cx, cy).matrixTransform(MA.inverse());   // api:DOMMatrixReadOnly.inverse
    // Chain B — transform chain: getScreenCTM().inverse() into the row's local space, getCTM() back out to the
    // camera's viewport coordinate system (= 台面, because nearestViewportElement is the camera and getCTM stops
    // at the coordinate system the camera is *placed in*), then camera.getCTM().inverse() into paper space.
    const local = new DOMPoint(cx, cy).matrixTransform(rowEl.getScreenCTM()!.inverse());
    const bStage = local.matrixTransform(rowEl.getCTM()!);
    const b = bStage.matrixTransform(camera.getCTM()!.inverse());
    // Chain C — hand chain: no CTM API at all, only getBoundingClientRect() and attribute numbers
    const rect = stage.getBoundingClientRect();
    const sx = rect.width / 1400, sy = rect.height / 900;
    const [avx, avy, avw, avh] = camera.getAttribute('viewBox')!.split(/[\s,]+/).map(Number);
    const ax = Number(camera.getAttribute('x')), ay = Number(camera.getAttribute('y')), aw = Number(camera.getAttribute('width')), ah = Number(camera.getAttribute('height'));
    const kc = Math.min(aw / avw, ah / avh);
    const MC = new DOMMatrix().translateSelf(rect.x, rect.y).scaleSelf(sx, sy).translateSelf(ax + (aw - avw * kc) / 2, ay + (ah - avh * kc) / 2).scaleSelf(kc, kc).translateSelf(-avx, -avy);
    const c = new DOMPoint(cx, cy).matrixTransform(MC.inverse());
    // Legacy footnote: the same hand chain through createSVGPoint()/createSVGMatrix() (SVGMatrix is a DOMMatrix alias)
    const sp = stage.createSVGPoint(); sp.x = cx; sp.y = cy;
    const sm = stage.createSVGMatrix().translate(rect.x, rect.y).scaleNonUniform(sx, sy).translate(ax + (aw - avw * kc) / 2, ay + (ah - avh * kc) / 2).scale(kc).translate(-avx, -avy);
    const lp = sp.matrixTransform(sm.inverse());
    const legacyOk = Math.abs(lp.x - c.x) < 1e-6 && Math.abs(lp.y - c.y) < 1e-6 && stage.createSVGMatrix() instanceof DOMMatrix;
    // Naive chain: offsetX·vw/width — forgets the letterbox and the viewBox origin (api:MouseEvent.offsetX)
    const ox = offsetX ?? stagePt.x, oy = offsetY ?? stagePt.y;
    const naive = new DOMPoint((ox - ax) * avw / aw, (oy - ay) * avh / ah);
    return { client: new DOMPoint(cx, cy), stagePt, a, b, c, bStage, naive, legacyOk, rowEl, coalesced: lastCoalesced };
  };

  let animCount = { total: 0, css: 0, waapi: 0, feed: 0, rate: 1 };
  let currentScaleLine = '';
  const refreshReadout = (s: Sample) => {
    const tA = travelSeconds(s.a.x, s.a.y), tB = travelSeconds(s.b.x, s.b.y), tC = travelSeconds(s.c.x, s.c.y), tN = travelSeconds(s.naive.x, s.naive.y);
    const match = Math.abs(tA - tB) < 1e-6 && Math.abs(tA - tC) < 1e-6;
    checks++; if (!match) mismatches++;
    lamp.dataset.verdict = match ? 'match' : 'mismatch';
    const hour = s.rowEl.dataset.hour, state = s.rowEl.dataset.state;   // api:SVGElement.dataset
    const sel = selectedRow ? ` · 选中 ${selectedRow.dataset.hour} 时行 · ${selectedRow.dataset.state}` : '';
    roTitle.textContent = `采样 屏幕(${f2(s.client.x)}, ${f2(s.client.y)}) → 台面(${f2(s.stagePt.x)}, ${f2(s.stagePt.y)}) · 经 ${hour} 行(${state})${sel} · 合并事件 ${s.coalesced}`;
    roLines[0].textContent = `A 相机链  ${fmtTime(tA)}   纸(${s.a.x.toFixed(3)}, ${s.a.y.toFixed(3)})  viewBox.baseVal + meet 手推 k`;
    roLines[1].textContent = `B 变换链  ${fmtTime(tB)}   纸(${s.b.x.toFixed(3)}, ${s.b.y.toFixed(3)})  getScreenCTM⁻¹ → getCTM → camera.getCTM⁻¹`;
    roLines[2].textContent = `C 手算链  ${fmtTime(tC)}   纸(${s.c.x.toFixed(3)}, ${s.c.y.toFixed(3)})  DOMMatrix 链 · 校验 ${checks} 次 / 失配 ${mismatches}`;
    roLines[2].setAttribute('fill', match ? C.green : C.red);
    const drift = Math.abs(tN - tA) > 1e-3;
    roLines[3].textContent = `D 天真链  ${fmtTime(tN)}   Δ ${signed(tN - tA)} s  offsetX·vw/w 漏了信箱边与 viewBox 原点`;
    roLines[3].setAttribute('fill', drift ? C.red : C.muted);
    roLines[3].dataset.verdict = drift ? 'drift' : 'coincide';
    const nearestOk = (traceEls[0].nearestViewportElement === camera);
    roLines[4].textContent = `createSVGPoint/createSVGMatrix 复算 ${s.legacyOk ? '✓ 同值' : '✗ 不同'} · trace.nearestViewportElement === camera ${nearestOk ? '✓' : '✗'} · SVGMatrix instanceof DOMMatrix ✓`;
    roLines[5].textContent = `getAnimations() ${animCount.total} 条 · CSS 09 行 ${animCount.css} · WAAPI 10 行 ${animCount.waapi} · 卷筒 scroll ${animCount.feed} · rAF 11 行 0（不在列表）· playbackRate ${animCount.rate.toFixed(2)}`;
    roLines[6].textContent = currentScaleLine;
    roLines[6].setAttribute('fill', C.muted);
    // crosshair at the pointer (台面) and the chain-B getCTM round trip (green dot must sit on the same spot)
    const g = camGeom();
    cross.querySelector('.cx-h')!.setAttribute('x1', String(g.x0)); cross.querySelector('.cx-h')!.setAttribute('x2', String(g.x0 + g.w));
    cross.querySelector('.cx-h')!.setAttribute('y1', f2(s.stagePt.y)); cross.querySelector('.cx-h')!.setAttribute('y2', f2(s.stagePt.y));
    cross.querySelector('.cx-v')!.setAttribute('y1', String(g.y0)); cross.querySelector('.cx-v')!.setAttribute('y2', String(g.y0 + g.h));
    cross.querySelector('.cx-v')!.setAttribute('x1', f2(s.stagePt.x)); cross.querySelector('.cx-v')!.setAttribute('x2', f2(s.stagePt.x));
    const dot = cross.querySelector('.cx-dot')!; dot.setAttribute('cx', f2(s.stagePt.x)); dot.setAttribute('cy', f2(s.stagePt.y));
    const bd = cross.querySelector('.cx-b')!; bd.setAttribute('cx', f2(s.bStage.x)); bd.setAttribute('cy', f2(s.bStage.y));
    const lab = cross.querySelector('.cx-label') as SVGTextElement;
    lab.setAttribute('x', f2(s.stagePt.x + 10)); lab.setAttribute('y', f2(s.stagePt.y - 8));
    lab.textContent = `${fmtTime(tA)} · 纸(${s.a.x.toFixed(1)}, ${s.a.y.toFixed(1)})`;
    // calibration target: the sample normalised to ±50, the origin marker recomputed from the hand matrix
    target.dot.setAttribute('cx', f2(clamp(s.a.x / PAPER_W * 100 - 50, -50, 50))); target.dot.setAttribute('cy', f2(clamp(s.a.y / PAPER_H * 100 - 50, -50, 50)));
    stage.dataset.sampleX = s.a.x.toFixed(6); stage.dataset.sampleY = s.a.y.toFixed(6);
  };
  const sampleAt = (cx: number, cy: number, rowEl?: SVGGElement, offsetX?: number, offsetY?: number) => {
    lastClient = new DOMPoint(cx, cy); if (rowEl) lastRow = rowEl;
    refreshReadout(convert(cx, cy, lastRow, offsetX, offsetY));
  };
  const refreshAll = () => { refreshChrome(); refreshRuler(); refreshOverview(); sampleAt(lastClient.x, lastClient.y); };

  // ------------------------------------------------------------------ camera interaction (§9): wheel zoom anchored under the cursor, drag pan, lasso, pinch
  let mode: 'none' | 'pan' | 'lasso' | 'ink' = 'none';
  let dragStart = { cx: 0, cy: 0, vx: 0, vy: 0, paper: new DOMPoint() };
  const clientToPaperB = (cx: number, cy: number): DOMPoint => new DOMPoint(cx, cy).matrixTransform(camera.getScreenCTM()!.inverse());
  camera.addEventListener('wheel', e => {
    e.preventDefault();                                              // concept:wheel-zoom — the page must not scroll
    const p = clientToPaperB(e.clientX, e.clientY);
    const f = clamp(Math.pow(1.0018, e.deltaY), 0.5, 2);
    const vw = clamp(view.vw * f, 180, 2880); const ff = vw / view.vw;
    view.vx = p.x - (p.x - view.vx) * ff; view.vy = p.y - (p.y - view.vy) * ff; view.vw = vw; view.vh = vw * PAPER_H / PAPER_W;
    applyView();
  }, { passive: false });

  // selection (Shift+drag) — api:SVGSVGElement.createSVGRect / checkIntersection / checkEnclosure; bbox-based in Chrome
  const supportsIntersection = typeof (camera as SVGSVGElement).checkIntersection === 'function';
  const runSelection = (x: number, y: number, w: number, h: number) => {
    lasso.setAttribute('x', f2(x)); lasso.setAttribute('y', f2(y)); lasso.setAttribute('width', f2(w)); lasso.setAttribute('height', f2(h)); lasso.setAttribute('visibility', 'visible');
    const rect = camera.createSVGRect(); rect.x = x; rect.y = y; rect.width = w; rect.height = h;
    let inter = 0, encl = 0;
    for (const t of traceEls) {
      let intersects: boolean, encloses: boolean;
      if (supportsIntersection) { intersects = camera.checkIntersection(t, rect); encloses = camera.checkEnclosure(t, rect); }
      else {
        // fallback: getBBox() mapped through the row transform, plain rectangle arithmetic
        const bb = t.getBBox(); const m = (t.parentElement as unknown as SVGGElement).transform.baseVal.consolidate()?.matrix ?? new DOMMatrix();
        const p1 = new DOMPoint(bb.x, bb.y).matrixTransform(m), p2 = new DOMPoint(bb.x + bb.width, bb.y + bb.height).matrixTransform(m);
        intersects = p1.x < x + w && p2.x > x && p1.y < y + h && p2.y > y;
        encloses = p1.x >= x && p2.x <= x + w && p1.y >= y && p2.y <= y + h;
        camera.dataset.fallback = 'bbox';
      }
      if (encloses) { t.dataset.select = 'enclose'; encl++; } else if (intersects) { t.dataset.select = 'intersect'; inter++; } else delete t.dataset.select;
    }
    lassoNote.textContent = `框选 ${f2(w)}×${f2(h)} 纸单位 · 相交 ${inter} 道(黄) · 全入 ${encl} 道(绿) · ${supportsIntersection ? 'checkIntersection 基于 bbox 粗筛' : 'getBBox 回退 data-fallback=bbox'}`;
  };
  const lassoNote = mono(R.camera.x + 6, R.camera.y + R.camera.h - 8, '', 11, C.yellow);
  chrome.append(lassoNote);

  // hand-drawn annotation ink (concept:pointer-events-api): width from pressure, colour from pointerType
  const inkColour = (type: string) => type === 'pen' ? C.pen : type === 'touch' ? C.touch : C.mouse;
  let inkLast: DOMPoint | null = null;
  const inkSegment = (from: DOMPoint, to: DOMPoint, pressure: number, type: string) =>
    ink.append(el('line', { x1: f2(from.x), y1: f2(from.y), x2: f2(to.x), y2: f2(to.y), stroke: inkColour(type), 'stroke-width': (0.8 + 2.6 * (pressure || 0.5)).toFixed(2), 'stroke-opacity': .9 }));
  const toStage = (cx: number, cy: number) => new DOMPoint(cx, cy).matrixTransform(stage.getScreenCTM()!.inverse());

  camera.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    camera.setPointerCapture(e.pointerId);
    const paper = clientToPaperB(e.clientX, e.clientY);
    dragStart = { cx: e.clientX, cy: e.clientY, vx: view.vx, vy: view.vy, paper };
    if (e.shiftKey) { mode = 'lasso'; traceEls.forEach(t => delete t.dataset.select); }
    else if (e.pointerType === 'pen' || e.altKey) { mode = 'ink'; inkLast = toStage(e.clientX, e.clientY); }
    else { mode = 'pan'; stage.dataset.drag = ''; }
  });
  camera.addEventListener('pointermove', e => {
    const rowEl = (e.target as Element).closest?.('.row') as SVGGElement | null;
    // api:PointerEvent.getCoalescedEvents — fill in the intermediate points the compositor merged into this event
    const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    lastCoalesced = Math.max(1, coalesced.length);
    if (mode === 'pan') {
      const fit = cameraFit(); const sx = stage.getScreenCTM()!.a;
      view.vx = dragStart.vx - (e.clientX - dragStart.cx) / (fit.k * sx); view.vy = dragStart.vy - (e.clientY - dragStart.cy) / (fit.k * sx);
      applyView();
      return;
    }
    if (mode === 'lasso') {
      const p = clientToPaperB(e.clientX, e.clientY);
      runSelection(Math.min(p.x, dragStart.paper.x), Math.min(p.y, dragStart.paper.y), Math.abs(p.x - dragStart.paper.x), Math.abs(p.y - dragStart.paper.y));
    }
    if (mode === 'ink' && inkLast) {
      for (const ce of (coalesced.length ? coalesced : [e])) { const p = toStage(ce.clientX, ce.clientY); inkSegment(inkLast, p, ce.pressure, e.pointerType); inkLast = p; }
    }
    sampleAt(e.clientX, e.clientY, rowEl ?? undefined, e.offsetX, e.offsetY);
  });
  const endDrag = () => { mode = 'none'; delete stage.dataset.drag; inkLast = null; };
  camera.addEventListener('pointerup', endDrag); camera.addEventListener('pointercancel', endDrag);
  camera.addEventListener('click', e => {
    const rowEl = (e.target as Element).closest?.('.row') as SVGGElement | null;
    if (!rowEl || Math.hypot(e.clientX - dragStart.cx, e.clientY - dragStart.cy) > 3) return;
    selectedRow?.classList.remove('selected'); selectedRow = rowEl; rowEl.classList.add('selected');
    sampleAt(e.clientX, e.clientY, rowEl, e.offsetX, e.offsetY);
  });
  // ink outside the camera: the whole stage is a drawing pad
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0 || camera.contains(e.target as Node) || (e.target as Element).closest('.slider, #feed-host')) return;
    mode = 'ink'; inkLast = toStage(e.clientX, e.clientY);
  });
  stage.addEventListener('pointermove', e => {
    if (camera.contains(e.target as Node)) return;
    if (mode === 'ink' && inkLast) { const p = toStage(e.clientX, e.clientY); inkSegment(inkLast, p, e.pressure, e.pointerType); inkLast = p; }
    sampleAt(e.clientX, e.clientY, undefined, e.offsetX, e.offsetY);
  });
  stage.addEventListener('pointerup', endDrag);
  // ruler: vertical drag zooms (ns-resize)
  let rulerDrag: { cy: number; vw: number } | null = null;
  rulerG.addEventListener('pointerdown', e => { rulerDrag = { cy: e.clientY, vw: view.vw }; rulerG.setPointerCapture(e.pointerId); e.stopPropagation(); });
  rulerG.addEventListener('pointermove', e => { if (!rulerDrag) return; const c = view.vx + view.vw / 2, cy = view.vy + view.vh / 2; view.vw = rulerDrag.vw * Math.pow(1.005, e.clientY - rulerDrag.cy); view.vh = view.vw * PAPER_H / PAPER_W; view.vx = c - view.vw / 2; view.vy = cy - view.vh / 2; applyView(); });
  rulerG.addEventListener('pointerup', () => { rulerDrag = null; });

  // touch events (concept:touch-events, concept:multi-touch-gesture): numbered finger circles, two-finger pinch on the viewBox
  let pinch: { dist: number; vw: number; cx: number; cy: number } | null = null;
  const drawTouches = (list: TouchList) => {
    touches.replaceChildren();
    for (let i = 0; i < list.length; i++) {
      const t = list.item(i)!; const p = toStage(t.clientX, t.clientY);
      touches.append(el('circle', { cx: f2(p.x), cy: f2(p.y), r: 22, fill: C.touch, 'fill-opacity': .2, stroke: C.touch, 'stroke-width': 2 }), mono(p.x, p.y + 4, String(i + 1), 12, C.cream, 'middle'));
    }
  };
  camera.addEventListener('touchstart', e => { drawTouches(e.touches); if (e.touches.length === 2) { const [a, b] = [e.touches[0], e.touches[1]]; pinch = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), vw: view.vw, cx: view.vx + view.vw / 2, cy: view.vy + view.vh / 2 }; } }, { passive: true });
  camera.addEventListener('touchmove', e => {
    drawTouches(e.touches);
    if (pinch && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      view.vw = pinch.vw * pinch.dist / Math.max(1, d); view.vh = view.vw * PAPER_H / PAPER_W; view.vx = pinch.cx - view.vw / 2; view.vy = pinch.cy - view.vh / 2; applyView();
    }
  }, { passive: true });
  const touchEnd = (e: TouchEvent) => { drawTouches(e.touches); if (e.touches.length < 2) pinch = null; if (!e.touches.length) replayTouches(); };
  camera.addEventListener('touchend', touchEnd); camera.addEventListener('touchcancel', touchEnd);
  // no touch screen: a recorded TouchList replay keeps the panel readable
  const replayTouches = () => {
    touches.replaceChildren();
    const rec = [[1010, 590], [1096, 548]];
    touches.append(el('line', { x1: rec[0][0], y1: rec[0][1], x2: rec[1][0], y2: rec[1][1], stroke: C.touch, 'stroke-dasharray': '4 4', 'stroke-opacity': .6 }));
    rec.forEach(([x, y], i) => touches.append(el('circle', { cx: x, cy: y, r: 20, fill: C.touch, 'fill-opacity': .12, stroke: C.touch, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }), mono(x, y + 4, String(i + 1), 12, C.touch, 'middle')));
    touches.append(mono((rec[0][0] + rec[1][0]) / 2, (rec[0][1] + rec[1][1]) / 2 + 40, `回放 TouchList(2) · 双指距 ${Math.hypot(rec[1][0] - rec[0][0], rec[1][1] - rec[0][1]).toFixed(1)} px → 缩放 viewBox`, 11, C.touch, 'middle'));
  };
  replayTouches();

  // ------------------------------------------------------------------ control column: sliders, cursor bricks, chips, legend
  const CX = R.controls.x + 12, CW = R.controls.w - 24;
  const fmtPct = (v: number) => `${v.toFixed(1)}%`;
  const sView = slider(stage, { x: CX, y: R.controls.y + 40, w: CW, label: '取景 viewBox.x', min: -720, max: 1440, value: 0, format: v => v.toFixed(0), onChange: v => { view.vx = v; applyView(); } });
  const sWidth = slider(stage, { x: CX, y: R.controls.y + 86, w: CW, label: '取景 viewBox.width', min: 180, max: 2880, value: PAPER_W, format: v => v.toFixed(0), onChange: v => { const c = view.vx + view.vw / 2, cy = view.vy + view.vh / 2; view.vw = v; view.vh = v * PAPER_H / PAPER_W; view.vx = c - v / 2; view.vy = cy - view.vh / 2; applyView(); } });
  const sCam = slider(stage, { x: CX, y: R.controls.y + 132, w: CW, label: '台面宽度 camera width', min: 720, max: 1120, value: R.camera.w, format: v => `${v.toFixed(0)} px`, onChange: v => {
    camera.setAttribute('width', v.toFixed(0)); cameraFrame.setAttribute('width', v.toFixed(0)); refreshAll();
  } });
  const sPen = slider(stage, { x: CX, y: R.controls.y + 178, w: CW, label: '笔位 offset-distance (调试笔)', min: 0, max: 100, value: 30, format: fmtPct, onChange: v => penDebug.pieces.forEach(p => { p.style.offsetDistance = `${v}%`; }) });
  let rafRate = 1;
  const sRate = slider(stage, { x: CX, y: R.controls.y + 224, w: CW, label: '走纸速度 playbackRate', min: 0.25, max: 4, value: 1, format: v => `×${v.toFixed(2)}`, onChange: v => {
    // api:Animation.playbackRate — CSS and WAAPI pens through their Animation objects, the rAF pen through its own clock
    for (const a of document.getAnimations()) if (camera.contains(((a.effect as KeyframeEffect).target as Element))) a.playbackRate = v;
    rafRate = v; animCount.rate = v; sampleAt(lastClient.x, lastClient.y);
  } });
  controls.append(sView.g, sWidth.g, sCam.g, sPen.g, sRate.g);
  controls.append(cursorBricks(CX, R.controls.y + 286));
  // touch-action chips read back from getComputedStyle
  const chipCam = mono(CX, R.controls.y + 372, '', 11, C.cyan), chipFeed = mono(CX, R.controls.y + 386, '', 11, C.cyan);
  controls.append(label(CX, R.controls.y + 358, 'touch-action 实测', 11, C.muted), chipCam, chipFeed);
  // pointer legend
  controls.append(label(CX, R.controls.y + 412, '手描注记 · 线宽 = pressure', 11, C.muted));
  ([['mouse', C.mouse], ['pen', C.pen], ['touch', C.touch]] as const).forEach(([t, c], i) => {
    controls.append(el('rect', { x: CX + i * 48, y: R.controls.y + 420, width: 14, height: 14, rx: 3, fill: c }), mono(CX + i * 48 + 18, R.controls.y + 431, t, 11, c));
  });
  controls.append(label(CX, R.controls.y + 462, '滚轮：缩放锚在光标下', 11, C.muted), label(CX, R.controls.y + 478, '拖拽：平移相机原点', 11, C.muted), label(CX, R.controls.y + 494, 'Shift+拖拽：框选道', 11, C.muted), label(CX, R.controls.y + 510, 'Alt/笔 拖拽：手描注记', 11, C.muted), label(CX, R.controls.y + 526, '时标尺竖拖：缩放', 11, C.muted));
  const fallbackNote = mono(CX, R.controls.y + 554, '', 11, C.dim);
  controls.append(fallbackNote);

  // ------------------------------------------------------------------ animations: CSS (row 09), WAAPI (row 10), rAF (row 11)
  const trace10 = camera.querySelector('#trace-10') as SVGPathElement;
  const waapiFrames = dashFrames(waapiRow).map(f => ({ strokeDashoffset: `${f.value.toFixed(2)}px`, offset: f.offset }));
  // api:Element.animate — the same keyframe table as the CSS pen, fed through the Web Animations API
  const traceAnim = trace10.animate(waapiFrames, { duration: LOOP_MS, iterations: Infinity });
  const penAnims = penWaapi.pieces.map(p => p.animate([{ offsetDistance: '0%' }, { offsetDistance: `${(ROW_FRACTION * 100).toFixed(2)}%`, offset: ROW_TRAVEL }, { offsetDistance: '100%' }], { duration: LOOP_MS, iterations: Infinity }));
  // concept:waapi-non-css-attribute-animation — 'points' is not a CSS property: the keyframe property is dropped silently
  let pointsProbe = '';
  try {
    const probe = (camera.querySelector('#trace-11') as SVGPolylineElement).animate([{ points: '0,0 1,1' }, { points: '2,2 3,3' }] as Keyframe[], 10);
    const keys = (probe.effect as KeyframeEffect).getKeyframes().flatMap(k => Object.keys(k)).filter(k => k === 'points');
    probe.cancel();
    pointsProbe = `animate({points}) 关键帧中 points 项 ${keys.length} 个 → WAAPI 动不了几何属性，改由 rAF 重写`;
  } catch (err) { pointsProbe = `animate({points}) 抛出 ${(err as Error).name}`; }

  // rAF pen renderer: a deterministic function of the loop phase (used live and for the export still)
  const rafPathLen = rafPath.getTotalLength();
  const poly11 = camera.querySelector('#trace-11') as SVGPolylineElement;
  const renderRafPen = (phase: number) => {
    const penX = penXAtPhase(phase);
    const pts = rafRow.pts.filter(p => p.x <= penX);
    if (phase <= ROW_TRAVEL && pts.length && pts.length < rafRow.pts.length) {
      const a = rafRow.pts[pts.length - 1], b = rafRow.pts[pts.length]; const f = (penX - a.x) / (b.x - a.x);
      pts.push({ x: penX, y: a.y + f * (b.y - a.y) });
    }
    poly11.setAttribute('points', pts.length ? pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') : `${TRACE_X0},${ROW_H / 2}`);
    const dist = offsetPctAtPhase(phase) / 100 * rafPathLen;
    const p = rafPath.getPointAtLength(dist), q = rafPath.getPointAtLength(Math.min(rafPathLen, dist + 1));
    const angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    // api:SVGAnimatedTransformList.baseVal — translate/rotate items rewritten in place, no attribute string rebuilding
    penRaf.pieces.forEach((piece, i) => {
      const list = piece.transform.baseVal;
      list.getItem(0).setTranslate(p.x, p.y);
      list.getItem(1).setRotate(i === 2 ? angle : i === 1 ? angle + 180 : 0, 0, 0);
    });
  };

  // jitter band painter
  const paintJitter = (dts: number[], phases: { css: number[]; waapi: number[]; raf: number[] }) => {
    dts.forEach((dt, i) => { const r = jitterBars[i]; const h = Math.min(30, dt * 0.9); r.setAttribute('y', f2(JY0 + 44 - h)); r.setAttribute('height', f2(h)); r.setAttribute('fill', dt > 20 ? C.red : C.muted); });
    for (let i = dts.length; i < 240; i++) jitterBars[i].setAttribute('height', '0');
    (['css', 'waapi', 'raf'] as const).forEach((k, idx) => {
      const series = phases[k];
      phaseLines[idx].setAttribute('points', series.map((v, i) => `${(TRACE_X0 + i * (1368 / 120)).toFixed(1)},${(JY0 + 58 - clamp(v, -40, 40) * 0.25).toFixed(2)}`).join(' '));
    });
    const sorted = [...dts].sort((a, b) => a - b); const median = sorted.length ? sorted[sorted.length >> 1] : 0;
    const all = [...phases.css, ...phases.waapi, ...phases.raf]; const maxErr = all.length ? Math.max(...all.map(Math.abs)) : 0;
    jitterText.textContent = `中位 dt ${median.toFixed(1)} ms · 丢帧 ${dts.filter(d => d > 20).length} · 最大相位差 ${maxErr.toFixed(1)} ms`;
  };

  // transform-list teaching stand (api:SVGTransformList, createSVGTransformFromMatrix, setRotate, consolidate)
  const tlList = tlGlyph.transform.baseVal;
  const TL_NAMES: Record<number, string> = { 1: 'MATRIX', 2: 'TRANSLATE', 3: 'SCALE', 4: 'ROTATE' };
  const handShift = new DOMMatrix().translate(18, 0);                  // api:DOMMatrix
  const tlStep = (step: number) => {
    tlList.clear();
    if (step >= 1) tlList.appendItem(stage.createSVGTransformFromMatrix(handShift));
    if (step >= 2) { const t = stage.createSVGTransform(); t.setRotate(28, 0, 0); tlList.appendItem(t); }
    if (step >= 3) { const t = stage.createSVGTransform(); t.setScale(1.25, 1.25); tlList.appendItem(t); }
    const types = Array.from({ length: tlList.numberOfItems }, (_, i) => TL_NAMES[tlList.getItem(i).type]).join(' · ');
    tlLines[0].textContent = `SVGTransformList 演示台 · 步 ${Math.min(step, 3)}/3 · numberOfItems: ${tlList.numberOfItems}`;
    tlLines[1].textContent = types ? `[${types}]  appendItem(createSVGTransformFromMatrix) → setRotate(28) → setScale(1.25)` : '(空列表) 每秒推进一步：平移 → 旋转 → 缩放 → consolidate()';
    if (step === 4) {
      const one = tlList.consolidate();                                 // api:SVGTransformList.consolidate
      const m = one?.matrix;
      tlLines[2].textContent = m ? `consolidate() → 1 项 matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(v => f3(v)).join(' ')})` : 'consolidate() → null';
    } else {
      const m = new DOMMatrix().translate(18, 0).rotate(28).scale(1.25);
      tlLines[2].textContent = `预计 consolidate() → matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(v => f3(v)).join(' ')})`;
    }
  };

  // currentScale negative/positive control (api:SVGSVGElement.currentScale): measured, then restored
  {
    const a0 = stage.getScreenCTM()!.a;
    stage.currentScale = 2;
    const readBack = stage.currentScale;
    const a1 = stage.getScreenCTM()!.a;
    stage.currentScale = 1;
    const effective = Math.abs(a1 - a0) > 1e-9;
    currentScaleLine = `currentScale 写入 2.000 / 读回 ${readBack.toFixed(3)} / 生效：${effective ? '是' : '否'}（getScreenCTM().a ${a0.toFixed(2)}→${a1.toFixed(2)}，已复位；真实缩放一律由 viewBox 承担）· currentTranslate (${stage.currentTranslate.x}, ${stage.currentTranslate.y})`;
  }

  // ------------------------------------------------------------------ observers
  // api:ResizeObserver.observe — camera <svg>, the root and the stage-space frame rect. Chrome reports a nested
  // <svg> as its bbox in viewBox units (1440×840, never changing with width), so the frame rect is what tracks width.
  let roFired = 0;
  const ro = new ResizeObserver(entries => {
    roFired++;
    const frame = entries.find(e => e.target === cameraFrame), cam = entries.find(e => e.target === camera);
    const parts: string[] = [];
    if (cam) parts.push(`#camera bbox ${f2(cam.contentRect.width)}×${f2(cam.contentRect.height)} (viewBox 单位)`);
    if (frame) parts.push(`#camera-frame contentRect ${f2(frame.contentRect.width)}×${f2(frame.contentRect.height)}`);
    roText = `ResizeObserver #${roFired} · ${parts.join(' · ') || '(root)'}`;
    stage.dataset.resizeCallbacks = String(roFired);
    refreshRuler();
  });
  ro.observe(camera); ro.observe(stage); ro.observe(cameraFrame);

  // css:animation-timeline-scroll probe + api:IntersectionObserver.observe on the feed blocks
  const scrollTimelines = CSS.supports('animation-timeline: scroll()');
  if (!scrollTimelines) {
    feedInks.forEach(i => i.el.classList.remove('feed-ink'));
    const paintScroll = () => { const p = feedDiv.scrollTop / Math.max(1, feedDiv.scrollHeight - feedDiv.clientHeight); feedInks.forEach(i => i.el.setAttribute('stroke-dashoffset', (i.len * (1 - p)).toFixed(1))); };
    feedDiv.addEventListener('scroll', paintScroll, { passive: true }); paintScroll();
    feedPanel.dataset.fallback = 'scroll-listener';
    fallbackNote.textContent = 'data-fallback=scroll-listener';
  }
  let ioInitial = true;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const block = e.target as SVGGElement;
      if (ioInitial) block.style.opacity = '1';                        // already in view: no replay
      else block.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 600, fill: 'forwards' });
      io.unobserve(block);
    }
    ioInitial = false;
  }, { root: feedDiv, threshold: 0.25 });
  feedBlocks.forEach(b => io.observe(b));
  feedDiv.addEventListener('scroll', () => { feedChip.textContent = `scrollTop ${feedDiv.scrollTop.toFixed(0)} / ${feedDiv.scrollHeight - feedDiv.clientHeight}`; }, { passive: true });

  // ------------------------------------------------------------------ feature marks (behaviour the DOM cannot show)
  mark(stage,
    'concept:mouse-to-svg-coordinates', 'concept:pointer-to-user-space', 'api:SVGGraphicsElement.getScreenCTM', 'api:SVGGraphicsElement.getCTM',
    'api:DOMMatrix', 'api:DOMMatrixReadOnly.inverse', 'api:DOMPoint.matrixTransform', 'api:SVGSVGElement.viewBox', 'api:SVGAnimatedRect.baseVal',
    'concept:wheel-zoom', 'concept:viewbox-camera-zoom', 'concept:viewbox-camera-pan', 'concept:nested-svg-viewport', 'concept:viewbox-negative-origin',
    'concept:nearest-viewport-percentage-resolution', 'concept:percentage-diagonal-formula', 'api:SVGElement.dataset', 'concept:line-drawing-dash-animation',
    'api:Element.animate', 'api:Animation.playbackRate', 'api:Document.getAnimations', 'concept:waapi-non-css-attribute-animation', 'api:Window.requestAnimationFrame',
    'api:SVGTransformList', 'api:SVGAnimatedTransformList.baseVal', 'api:SVGSVGElement.createSVGTransformFromMatrix', 'api:SVGTransform.setRotate', 'api:SVGTransformList.consolidate',
    'api:SVGSVGElement.createSVGPoint', 'api:SVGSVGElement.createSVGMatrix', 'api:SVGMatrix', 'api:SVGGraphicsElement.nearestViewportElement', 'api:MouseEvent.offsetX',
    'api:SVGSVGElement.checkIntersection', 'api:SVGSVGElement.createSVGRect', 'api:ResizeObserver.observe', 'api:IntersectionObserver.observe',
    'concept:pointer-events-api', 'api:PointerEvent.getCoalescedEvents', 'concept:touch-events', 'concept:multi-touch-gesture', 'api:SVGSVGElement.currentScale',
  );
  if (scrollTimelines) mark(stage, 'css:animation-timeline-scroll');

  // ------------------------------------------------------------------ initial state, presets and export freeze (§16)
  applyView();
  chipCam.textContent = `#camera touch-action: ${getComputedStyle(camera).touchAction}`;
  chipFeed.textContent = `#feed touch-action: ${getComputedStyle(feedDiv).touchAction}`;
  // preset lasso: rows 14–16 fully enclosed (green), row 17 clipped (yellow)
  runSelection(20, 480, 1400, 120);
  // preset annotation: a pen loop around the 14h P arrival (stage space through the default fit)
  {
    const fit = cameraFit(); const ev = rows[14].events[0];
    const cxp = fit.tx + fit.k * ev.x, cyp = fit.ty + fit.k * (14 * ROW_H + ROW_H / 2);
    let prev: DOMPoint | null = null;
    for (let i = 0; i <= 28; i++) {
      const a = i / 28 * Math.PI * 2.15 - 0.4; const rr = 16 + 3 * Math.sin(i * 1.7);
      const p = new DOMPoint(cxp + rr * 1.6 * Math.cos(a), cyp + rr * Math.sin(a));
      if (prev) inkSegment(prev, p, 0.35 + 0.45 * Math.abs(Math.sin(i / 28 * Math.PI)), 'pen');
      prev = p;
    }
    ink.append(mono(cxp + 34, cyp - 18, 'pen · pressure 0.35–0.80', 11, C.pen));
  }
  // count animations by driver (api:Document.getAnimations): CSS pen (row 09), WAAPI pen (row 10), feed scroll timelines; the rAF pen is absent
  const countAnimations = () => {
    const all = document.getAnimations();
    const tgt = (a: Animation) => (a.effect as KeyframeEffect).target as Element | null;
    animCount = {
      total: all.length,
      css: all.filter(a => { const t = tgt(a); return t && (t.closest('.pen-css') || t.id === 'trace-09'); }).length,
      waapi: all.filter(a => { const t = tgt(a); return t && (t.closest('.pen-waapi') || t.id === 'trace-10'); }).length,
      feed: all.filter(a => { const t = tgt(a); return t && feedSvg.contains(t); }).length,
      rate: animCount.rate,
    };
    stage.dataset.animations = `${animCount.total}`;
  };

  // preset sample point (台面 700,400) so the still frame shows a full three-chain readout
  const rect0 = stage.getBoundingClientRect();
  const sx0 = rect0.width / 1400, sy0 = rect0.height / 900;
  sampleAt(rect0.x + 700 * sx0, rect0.y + 400 * sy0, rowEls[Math.floor(((400 - R.camera.y - cameraFit().gapY) / cameraFit().k) / ROW_H)]);
  fallbackNote.textContent = fallbackNote.textContent || pointsProbe.replace(/ →.*$/, '');

  if (exporting) {
    // freeze CSS + WAAPI pens at deliberately different phases; scroll-driven feed animations are left alone
    for (const a of document.getAnimations()) {
      const t = (a.effect as KeyframeEffect).target as Element | null;
      if (!t || !camera.contains(t)) continue;
      const phase = (t.closest('.pen-css') || t.id === 'trace-09') ? EXPORT_PHASE.css : EXPORT_PHASE.waapi;
      a.currentTime = LOOP_MS * phase; a.pause();
    }
    renderRafPen(EXPORT_PHASE.raf);
    const dts = presetFrameIntervals();
    const preset = (amp: number, seed: number) => Array.from({ length: 120 }, (_, i) => amp * Math.sin(i * 0.23 + seed) + 0.6 * Math.sin(i * 1.3 + seed * 2));
    paintJitter(dts, { css: preset(1.8, 1), waapi: preset(0.4, 2), raf: preset(3.2, 3) });
    tlStep(2);
    feedDiv.scrollTop = Math.round(0.38 * (feedDiv.scrollHeight - feedDiv.clientHeight));
    feedChip.textContent = `预滚 38% · scrollTop ${feedDiv.scrollTop} / ${feedDiv.scrollHeight - feedDiv.clientHeight}`;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    countAnimations();
    sampleAt(lastClient.x, lastClient.y);
    return;
  }

  // live loop: rAF pen + jitter band + phase sampling + transform stand
  const dts: number[] = [];
  const phases = { css: [] as number[], waapi: [] as number[], raf: [] as number[] };
  let last = performance.now(), lastSample = 0, lastStep = 0, step = 0, virtual = 0;
  traceAnim.ready.then(() => { virtual = Number(traceAnim.currentTime ?? 0); });
  const wrapMs = (ms: number) => ((ms + LOOP_MS / 2) % LOOP_MS + LOOP_MS) % LOOP_MS - LOOP_MS / 2;
  const frame = (now: number) => {
    const dt = now - last; last = now;
    virtual += dt * rafRate;
    const phase = ((virtual % LOOP_MS) + LOOP_MS) % LOOP_MS / LOOP_MS;
    renderRafPen(phase);
    dts.push(dt); if (dts.length > 240) dts.shift();
    if (now - lastSample >= 500) {
      lastSample = now;
      const ref = ((Number(traceAnim.currentTime ?? 0) % LOOP_MS) + LOOP_MS) % LOOP_MS;                 // WAAPI clock is the reference
      const cssPhase = phaseAtOffsetPct(parseFloat(getComputedStyle(penCss.pieces[2]).offsetDistance) || 0);
      const push = (arr: number[], v: number) => { arr.push(v); if (arr.length > 120) arr.shift(); };
      push(phases.css, wrapMs(cssPhase * LOOP_MS - ref)); push(phases.waapi, 0); push(phases.raf, wrapMs(phase * LOOP_MS - ref));
      countAnimations(); sampleAt(lastClient.x, lastClient.y);
    }
    paintJitter(dts, phases);
    if (now - lastStep >= 1000) { lastStep = now; step = (step + 1) % 5; tlStep(step); }
    requestAnimationFrame(frame);
  };
  tlStep(0);
  countAnimations();
  requestAnimationFrame(frame);
}
