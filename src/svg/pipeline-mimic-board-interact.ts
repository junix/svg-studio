// pipeline-mimic-board — feature probes (with fallback branches) and pointer / button interaction.
//   runProbes: context paint support, auto-start-reverse, nested markers, refX="center", orient units,
//              getBBox({markers:true}) (api:SVGBoundingBoxOptions.markers) and the SVGMarkerElement DOM readouts.
//   wireInteraction: nearest-pipe hover → .live marker swap (concept:marker-css-state-swap) + style.markerEnd
//              (api:CSSStyleDeclaration.markerEnd), range cursor via refX.baseVal (api:SVGMarkerElement.refX),
//              readout of DN and flow direction, setOrientToAuto / setOrientToAngle buttons, SVGPointList alarm pulse.
import { fmt } from './lib';

const marker = (stage: SVGSVGElement, id: string) => stage.querySelector<SVGMarkerElement>(`#${id}`)!;
const setText = (stage: SVGSVGElement, id: string, value: string) => { const node = stage.querySelector(`#${id}`); if (node) node.textContent = value; };

/** Media colours used by the degraded "one marker per medium" branch when context paints are unavailable. */
const MEDIUM_COLOUR: Record<string, string> = { '蒸汽': '#e8792b', '冷却水': '#7f9db0', '冷却水闭环': '#7f9db0', '补水': '#7f9db0', '软管': '#7f9db0', '回流': '#c98a3c', '旁通': '#c98a3c', '跨接': '#c98a3c', '冷凝液': '#c98a3c', '物料': '#c98a3c', '泵撬汇管': '#c98a3c' };

/** context-fill / context-stroke probe: an unsupported engine fails to parse the keyword and reports the initial black fill. */
function contextPaintSupported(stage: SVGSVGElement): boolean {
  const path = stage.querySelector<SVGPathElement>('#mk-arrow path');
  return !!path && getComputedStyle(path).fill === 'context-stroke';
}

/** Fallback: clone #mk-arrow / #mk-valve per medium with literal colours and repoint the pipes (visual degradation only). */
function cloneMarkersPerMedium(stage: SVGSVGElement): void {
  const defs = stage.querySelector('defs')!;
  const made = new Set<string>();
  for (const pipe of Array.from(stage.querySelectorAll<SVGGraphicsElement>('.pipe[data-medium]'))) {
    const colour = MEDIUM_COLOUR[pipe.dataset.medium ?? ''] ?? '#e9e2d8';
    const key = colour.slice(1);
    for (const base of ['mk-arrow', 'mk-valve']) {
      const id = `${base}-${key}`;
      if (!made.has(id)) {
        const clone = marker(stage, base).cloneNode(true) as SVGMarkerElement;
        clone.id = id;
        for (const node of Array.from(clone.querySelectorAll('[fill], [stroke]'))) {
          if (node.getAttribute('fill')?.startsWith('context')) node.setAttribute('fill', node.getAttribute('fill') === 'context-fill' ? 'none' : colour);
          if (node.getAttribute('stroke')?.startsWith('context')) node.setAttribute('stroke', colour);
        }
        defs.append(clone);
        made.add(id);
      }
      for (const prop of ['marker-start', 'marker-mid', 'marker-end'])
        if (pipe.getAttribute(prop) === `url(#${base})`) pipe.setAttribute(prop, `url(#${id})`);
    }
  }
}

/** Probe auto-start-reverse: a parser without it rejects the value → orient falls back to ANGLE 0. Supported → UNKNOWN(0) exposed. */
function autoStartReverseSupported(stage: SVGSVGElement): boolean {
  const m = marker(stage, 'mk-arrow');
  return m.orientType.baseVal !== SVGMarkerElement.SVG_MARKER_ORIENT_ANGLE;
}

/** Nested marker content (#mk-noz's stem has its own marker-end) is occasionally dropped by WebKit → pre-baked tip. */
function bakeNestedMarkerIfNeeded(stage: SVGSVGElement): boolean {
  const ua = navigator.userAgent;
  const webkitOnly = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  if (!webkitOnly) return false;
  const stem = stage.querySelector('#mk-noz-stem');
  stem?.removeAttribute('marker-end');
  stem?.after(stage.ownerDocument.createElementNS(stem.namespaceURI, 'path'));
  const baked = stem?.nextElementSibling;
  baked?.setAttribute('d', 'M62 30 L90 50 L62 70 Z'); baked?.setAttribute('fill', '#e9e2d8');
  return true;
}

/** Run all probes after the tree is attached (layout needed for getBBox) and fill the diagnostic readouts. */
export async function runProbes(stage: SVGSVGElement): Promise<void> {
  const notes: string[] = [];
  // ① context paints
  if (!contextPaintSupported(stage)) { cloneMarkersPerMedium(stage); notes.push('context-paint: 退化为每介质一枚符号'); } else notes.push('context-paint ✓');
  // ② auto-start-reverse → otherwise use the rotate(180) twin on the return branch (concept:marker-reverse-arrow-fallback)
  if (!autoStartReverseSupported(stage)) { stage.querySelector('#return')?.setAttribute('marker-start', 'url(#mk-arrow-rev)'); notes.push('auto-start-reverse: 回退 #mk-arrow-rev'); } else notes.push('auto-start-reverse ✓');
  // ③ nested markers
  if (bakeNestedMarkerIfNeeded(stage)) notes.push('nested marker: 预烘焙'); else notes.push('nested marker ✓');

  // ④ refX="center" (SVG 2 keyword, unimplemented everywhere) → numeric viewBox centre fallback (av:marker.refX=center)
  const refc = marker(stage, 'mk-refc');
  // Chromium logs the rejected keyword on the console — declare that exact message as expected before writing it
  const expected = new Set((stage.dataset.expectedErrors ?? '').split(' | ').filter(Boolean));
  expected.add('attribute refX: Expected length');
  stage.dataset.expectedErrors = [...expected].join(' | ');
  refc.setAttribute('refX', 'center');
  const centreOk = Math.abs(refc.refX.baseVal.value - 50) < 0.5;
  if (!centreOk) refc.setAttribute('refX', '50');
  setText(stage, 'w4-refc-cap', centreOk ? 'refX=center ✓ 原生' : 'refX=center ✗ → 50');

  // ⑤ orient spellings: 45 / 45deg / 0.7854rad / 50grad — the measured orientAngle.baseVal.value becomes content
  const spellings: Array<[string, string]> = [['mk-o1', '45'], ['mk-o2', '45deg'], ['mk-o3', '0.785rad'], ['mk-o4', '50grad']];
  for (const [id, value] of spellings) {
    const m = marker(stage, id);
    m.setAttribute('orient', value);
    const angle = m.orientType.baseVal === SVGMarkerElement.SVG_MARKER_ORIENT_ANGLE ? m.orientAngle.baseVal.value : NaN;
    setText(stage, `${id}-cap`, `${value}→${Number.isFinite(angle) ? fmt(angle, 1) + '°' : '失效'}`);
  }

  // ⑥ getBBox({markers:true}) — engines ignore SVGBoundingBoxOptions.markers, so fold markerWidth × stroke-width in by hand
  const dimH = stage.querySelector<SVGLineElement>('#dim-h')!;
  const geo = dimH.getBBox();
  let withMarkers: DOMRect | null = null;
  try { withMarkers = dimH.getBBox({ markers: true }); } catch { withMarkers = null; }
  const dim = marker(stage, 'mk-dim');
  const sw = parseFloat(getComputedStyle(dimH).strokeWidth) || 1;
  const scale = dim.markerUnits.baseVal === SVGMarkerElement.SVG_MARKERUNITS_STROKEWIDTH ? sw : 1;
  const mw = dim.markerWidth.baseVal.value * scale, mh = dim.markerHeight.baseVal.value * scale;
  const manual = { width: geo.width + mw, height: Math.max(geo.height, mh) };
  const honoured = withMarkers && (withMarkers.width > geo.width + 0.5 || withMarkers.height > geo.height + 0.5);
  setText(stage, 'bbox-readout',
    `dim-h 几何 bbox ${fmt(geo.width)}×${fmt(geo.height)} · getBBox({markers:true}) ${honoured ? `${fmt(withMarkers!.width)}×${fmt(withMarkers!.height)} ✓` : '被忽略'} · 手工含标记 ${fmt(manual.width)}×${fmt(manual.height)} (+${fmt(mw)}×${fmt(mh)})`);

  // ⑦ SVGMarkerElement DOM readout for #mk-hatch (orientType / refX / markerUnits / viewBox)
  writeDiag(stage, notes.join(' · '));
  await Promise.resolve();
}

/** Diagnostic line: reads the animated properties of #mk-hatch back (api:SVGMarkerElement.orientType/refX/markerUnits/viewBox). */
function writeDiag(stage: SVGSVGElement, prefix?: string): void {
  const h = marker(stage, 'mk-hatch');
  const vb = h.viewBox.baseVal;
  const orient = h.orientType.baseVal === SVGMarkerElement.SVG_MARKER_ORIENT_AUTO ? 'AUTO' : h.orientType.baseVal === SVGMarkerElement.SVG_MARKER_ORIENT_ANGLE ? `ANGLE ${fmt(h.orientAngle.baseVal.value)}°` : 'UNKNOWN';
  const units = h.markerUnits.baseVal === SVGMarkerElement.SVG_MARKERUNITS_USERSPACEONUSE ? 'userSpaceOnUse' : 'strokeWidth';
  setText(stage, 'diag', `#mk-hatch orientType=${orient} · refX.baseVal.value=${fmt(h.refX.baseVal.value)}`);
  setText(stage, 'diag-2', `markerUnits.baseVal=${h.markerUnits.baseVal} (${units}) · viewBox.baseVal=${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.width)} ${fmt(vb.height)}`);
  if (prefix) { setText(stage, 'diag-probes', `探测: ${prefix}`); stage.dataset.probes = prefix; }
}

/** Host geometry as segments in user space (path hosts are sampled with getPointAtLength). */
function segmentsOf(node: SVGGeometryElement): Array<[number, number, number, number]> {
  const pts: Array<[number, number]> = [];
  if (node instanceof SVGLineElement) {
    pts.push([node.x1.baseVal.value, node.y1.baseVal.value], [node.x2.baseVal.value, node.y2.baseVal.value]);
  } else if (node instanceof SVGPolylineElement || node instanceof SVGPolygonElement) {
    const list = node.points;   // api:SVGPointList
    for (let i = 0; i < list.numberOfItems; i++) { const p = list.getItem(i); pts.push([p.x, p.y]); }
    if (node instanceof SVGPolygonElement && pts.length) pts.push(pts[0]);
  } else {
    const total = node.getTotalLength();
    for (let i = 0; i <= 24; i++) { const p = node.getPointAtLength(total * i / 24); pts.push([p.x, p.y]); }
  }
  const segs: Array<[number, number, number, number]> = [];
  for (let i = 1; i < pts.length; i++) segs.push([pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]]);
  return segs;
}

interface Hit { node: SVGGeometryElement; dist: number; seg: [number, number, number, number]; t: number; alongFirst: number }

/** Nearest pipe to a user-space point, projecting onto every segment (pipes inside skewX groups are mapped through their CTM). */
function nearestPipe(stage: SVGSVGElement, ux: number, uy: number): Hit | null {
  let best: Hit | null = null;
  const stageCtm = stage.getScreenCTM()!;
  for (const node of Array.from(stage.querySelectorAll<SVGGeometryElement>('.pipe'))) {
    const local = node.getScreenCTM();
    if (!local) continue;
    // pointer → this host's local coordinates (handles the skewed skid group)
    const toLocal = local.inverse().multiply(stageCtm);
    const p = new DOMPoint(ux, uy).matrixTransform(toLocal);
    const segs = segmentsOf(node);
    const firstLen = Math.hypot(segs[0][2] - segs[0][0], segs[0][3] - segs[0][1]);
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const [x1, y1, x2, y2] = seg;
      const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / len2));
      const qx = x1 + t * dx, qy = y1 + t * dy;
      const dist = Math.hypot(p.x - qx, p.y - qy);
      // the cursor rides marker-start and can only slide along the first segment's tangent → clamp to its length
      const alongFirst = i === 0 ? t * Math.sqrt(len2) : firstLen;
      if (!best || dist < best.dist) best = { node, dist, seg, t, alongFirst };
    }
  }
  return best && best.dist <= 18 ? best : null;
}

const compass = (dx: number, dy: number): string => {
  const a = Math.atan2(dy, dx) * 180 / Math.PI;
  const dir = Math.abs(a) <= 45 ? '→ 东' : Math.abs(a) >= 135 ? '← 西' : a > 0 ? '↓ 南' : '↑ 北';
  return `${dir} (${fmt(a)}°)`;
};

export function wireInteraction(stage: SVGSVGElement): void {
  const cursor = marker(stage, 'mk-cursor');
  const slide = stage.querySelector<SVGAnimateElement>('#cursor-slide');
  const readout = stage.querySelector('#readout');
  let live: SVGGeometryElement | null = null;
  let sliding = true;

  const clearLive = () => {
    if (!live) return;
    live.classList.remove('live');
    live.style.markerEnd = '';                     // script path cleared alongside the class swap
    live = null;
    if (!sliding) { slide?.beginElement(); sliding = true; }   // resume the SMIL cursor sweep
    if (readout) readout.textContent = '指针停在管段上 → 整线换高亮标记，量程游标滑到指针处并报出 DN 与流向';
  };

  stage.addEventListener('pointermove', event => {
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const hit = nearestPipe(stage, p.x, p.y);
    if (!hit) { clearLive(); return; }
    if (hit.node !== live) {
      if (live) { live.classList.remove('live'); live.style.markerEnd = ''; }
      live = hit.node;
      live.classList.add('live');                  // CSS: .live{marker-mid:url(#mk-valve-hi);marker-end:url(#mk-arrow-hi)}
      live.style.markerEnd = 'url(#mk-arrow-hi)';  // equivalent script path (api:CSSStyleDeclaration.markerEnd)
    }
    // stop the SMIL sweep while the pointer drives the cursor, then slide the glyph along the first segment's tangent
    if (sliding) { slide?.endElement(); sliding = false; }
    cursor.refX.baseVal.value = -hit.alongFirst;
    const [x1, y1, x2, y2] = hit.seg;
    const dn = live.dataset.dn ?? '?', medium = live.dataset.medium ?? '';
    if (readout) readout.textContent = `${medium} DN${dn} · 流向 ${compass(x2 - x1, y2 - y1)} · 命中 <${live.localName}#${live.id}> · 游标 refX=${fmt(cursor.refX.baseVal.value)}`;
  });
  stage.addEventListener('pointerleave', clearLive);
  // markers are not hit-testable: the event target is always the host shape (concept:marker-pointer-events)
  stage.addEventListener('pointerdown', event => {
    const target = event.target as Element;
    if (readout && target.classList.contains('pipe')) readout.textContent = `pointerdown 命中宿主 <${target.localName}#${target.id}>（标记内容不接收指针事件）`;
  });

  // panel buttons: setOrientToAuto() / setOrientToAngle(SVGAngle) on #mk-hatch, then read the DOM properties back
  const hatch = marker(stage, 'mk-hatch');
  stage.querySelector('#btn-auto')?.addEventListener('click', () => { hatch.setOrientToAuto(); writeDiag(stage, stage.dataset.probes); });
  stage.querySelector('#btn-45')?.addEventListener('click', () => {
    const angle = stage.createSVGAngle();
    angle.newValueSpecifiedUnits(SVGAngle.SVG_ANGLETYPE_DEG, 45);
    hatch.setOrientToAngle(angle);
    writeDiag(stage, stage.dataset.probes);
  });
  for (const btn of Array.from(stage.querySelectorAll<SVGGElement>('.btn'))) btn.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') btn.dispatchEvent(new MouseEvent('click')); });

  // alarm star: push one vertex with SVGPointList.getItem / replaceItem, driven by the document timeline (frozen → static)
  const star = stage.querySelector<SVGPolygonElement>('#alarm-star');
  if (star) {
    const list = star.points;
    const base = list.getItem(0);
    const bx = base.x, by = base.y;
    const tick = () => {
      const t = stage.getCurrentTime();
      const pt = stage.createSVGPoint();
      pt.x = bx; pt.y = by - 5 - 5 * Math.sin(t * 5);
      list.replaceItem(pt, 0);
      requestAnimationFrame(tick);
    };
    tick();
  }
}
