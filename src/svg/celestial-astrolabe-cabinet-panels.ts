// celestial-astrolabe-cabinet — cabinet furniture: colour proof strip, the door with its 24 zone tags and
// slip slot, and the bottom shelf (quadrant, symbol rack, preserveAspectRatio proof strip, overflow pair,
// painting-order proof). Every viewport here is a viewBox rectangle over the same catalogue space; no star
// is ever drawn twice — only <use> instances of the nine masters or of the zone plates.
import { el, fragment, text, FONT_MONO, FONT_SERIF, FONT_SANS, type Attrs } from './lib';
import { ZONES, zoneRect, zoneTintStyle, type Zone } from './celestial-astrolabe-cabinet-catalogue';

export const BRASS = '#c8a45c', BRASS_HI = '#f0d9a0', BRASS_DK = '#7a5c2a', NAVY = '#101a2c', SKY = '#0d1626', VERD = '#4fa58c', INK = '#2a1c0c';
export const ATLAS = '/celestial-astrolabe-cabinet/atlas-plates.svg';

export const mono = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement =>
  text(s, { x, y, 'font-family': FONT_MONO, 'font-size': 11, fill: INK, ...attrs });
export const serif = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement =>
  text(s, { x, y, 'font-family': FONT_SERIF, 'font-size': 14, fill: BRASS_HI, ...attrs });
export const sans = (x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement =>
  text(s, { x, y, 'font-family': FONT_SANS, 'font-size': 11, fill: BRASS_HI, ...attrs });
/** Brass plate: alpha .86 fill, dark engraved edge (construction note 1). */
export const plate = (x: number, y: number, w: number, h: number, attrs: Attrs = {}): SVGRectElement =>
  el('rect', { x, y, width: w, height: h, rx: 4, fill: BRASS, 'fill-opacity': .86, stroke: BRASS_DK, 'stroke-width': 1, ...attrs });
/** Rivet = <use> of the single #rivet circle in defs (keeps circle|ellipse|polygon out of the light DOM). */
export const rivets = (pts: [number, number][]): SVGElement[] => pts.map(([x, y]) => el('use', { href: '#rivet', x, y }));

// ---------------------------------------------------------------------------------------------------------
// Colour proof strip (construction note 11): x 776..842, y 90..690, twelve 50 px cells in one column.
// ---------------------------------------------------------------------------------------------------------
export function buildColourStrip(): SVGGElement {
  // Group fill = var(--tint) so the inherited .star-ring follows --tint unless a use sets its own fill.
  const g = el('g', { id: 'colour-strip', fill: 'var(--tint, #7fd9ff)', style: '--tint:#7fd9ff' });
  g.append(sans(842, 52, 'COLOUR PROOF', { 'text-anchor': 'end', 'font-weight': 700 }));
  g.append(mono(842, 66, 'd1  use .star-core{fill:#f00}  → no reach', { 'text-anchor': 'end', fill: BRASS_HI }));
  g.append(mono(842, 80, 'd2  #gl-var .pulse-ring{stroke:#ffd36e}  → all', { 'text-anchor': 'end', fill: BRASS_HI }));
  g.append(plate(776, 90, 66, 600, { rx: 3 }));
  const X = 776, W = 66;
  const cell = (i: number, label: string, ...content: SVGElement[]): void => {
    const y = 90 + i * 50;
    if (i > 0) g.append(el('line', { x1: X, y1: y, x2: X + W, y2: y, stroke: BRASS_DK, 'stroke-opacity': .7 }));
    g.append(el('rect', { x: X + 4, y: y + 3, width: W - 8, height: 30, rx: 2, fill: SKY, 'fill-opacity': .9 }));
    g.append(...content);
    g.append(mono(X + W / 2, y + 45, label, { 'text-anchor': 'middle' }));
  };
  const cx = X + W / 2;
  // a) three gl-m: fill on the use recolours the inherited ring; the hard-coded vermilion core never moves.
  [['#ff0000', 'fill:#f00'], ['#00ff00', 'fill:#0f0'], ['#0088ff', 'fill:#08f']].forEach(([fill, label], k) =>
    cell(k, label, el('use', { class: 'proof-m', href: '#gl-m', x: cx, y: 90 + k * 50 + 18, width: 26, height: 26, fill, color: '#ff9c6e' })));
  // b) three gl-g: only `color` changes → both ray sets (two tones of currentColor) follow.
  [['#ff8800', 'color:#f80'], ['#55ccff', 'color:#5cf'], ['#dd88ff', 'color:#d8f']].forEach(([color, label], k) =>
    cell(3 + k, label, el('use', { href: '#gl-g', x: cx, y: 90 + (3 + k) * 50 + 18, width: 26, height: 26, color })));
  // c) three gl-a: only --tint changes → halo + ring re-tint through the shadow boundary.
  [['#ff99aa', '--tint:#f9a'], ['#99ff99', '--tint:#9f9'], ['#9999ff', '--tint:#99f']].forEach(([tint, label], k) =>
    cell(6 + k, label, el('use', { href: '#gl-a', x: cx, y: 90 + (6 + k) * 50 + 18, width: 26, height: 26, color: '#e2ebff', style: `--tint:${tint}` })));
  // d) the two CSS rules: `use .star-core{fill:#f00}` (d1) cannot reach this instance; `#gl-var .pulse-ring`
  //    (d2, a selector on the master's own child) recolours the pulse ring of every variable star at once.
  cell(9, 'd1 no reach', el('use', { id: 'proof-d1', href: '#gl-k', x: cx, y: 90 + 9 * 50 + 18, width: 26, height: 26, color: '#ffcf8f' }));
  cell(10, 'd2 all var', el('use', { id: 'proof-d2', href: '#gl-var', x: cx, y: 90 + 10 * 50 + 18, width: 26, height: 26, color: '#ffe08a' }));
  // e) anchor check: left refX/refY = 10 (centred on the cross), right the corner-anchored twin (#gl-k-corner,
  //    an <svg> wrapper without refX) whose whole box lands below-right of its cross by half a use box.
  const y11 = 90 + 11 * 50 + 18;
  const cross = (x: number) => [el('line', { x1: x - 7, y1: y11, x2: x + 7, y2: y11, stroke: BRASS_HI, 'stroke-width': 1 }), el('line', { x1: x, y1: y11 - 7, x2: x, y2: y11 + 7, stroke: BRASS_HI, 'stroke-width': 1 })];
  cell(11, 'ref 10 | 0', ...cross(X + 18), ...cross(X + 44),
    el('use', { id: 'ref-probe', href: '#gl-k', x: X + 18, y: y11, width: 16, height: 16, color: '#ffcf8f' }),
    el('use', { href: '#gl-k-corner', x: X + 44, y: y11, width: 16, height: 16, color: '#ffcf8f' }));
  return g;
}

// ---------------------------------------------------------------------------------------------------------
// Door (construction notes 7–10): nested <svg id="door"> rotated 2.2° via its own transform attribute.
// ---------------------------------------------------------------------------------------------------------
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Fragment written on each slip: even zones name a <view>, odd zones use svgView(viewBox(...)). Zone 09
 *  spells the list with commas (whitespace tolerance); zone 11 is written with the legacy xlink:href. */
export function slipFragment(z: Zone): { href: string; attr: 'href' | 'xlink:href'; lines: string[] } {
  if (z.n % 2 === 0) return { href: `${ATLAS}#${z.id}`, attr: 'href', lines: [`#${z.id}`, 'named <view>', 'in atlas file'] };
  if (z.n === 9) return { href: `${ATLAS}#svgView(viewBox(${z.x},${z.y},${z.w},${z.h}))`, attr: 'href', lines: ['#svgView(', 'viewBox(', `${z.x},${z.y},`, `${z.w},${z.h}))`, 'comma list'] };
  if (z.n === 11) return { href: `${ATLAS}#svgView(viewBox(${zoneRect(z)}))`, attr: 'xlink:href', lines: ['xlink:href=', '#svgView(', 'viewBox(', `${z.x} ${z.y}`, `${z.w} ${z.h}))`] };
  return { href: `${ATLAS}#svgView(viewBox(${zoneRect(z)}))`, attr: 'href', lines: ['#svgView(', 'viewBox(', `${z.x} ${z.y}`, `${z.w} ${z.h}))`] };
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildDoor(): SVGSVGElement {
  // at:svg.transform — the rotation lives on the nested svg, never on the outermost #stage (Safari note 2).
  const door = el('svg', { id: 'door', x: 852, y: 76, width: 500, height: 622, viewBox: '0 0 500 622', transform: 'rotate(-2.2 1102 387)', overflow: 'visible' });
  door.append(el('title', {}, 'Cabinet door: 24 zone tags, slip slot, borrowed plate'));
  door.append(el('rect', { x: 0, y: 0, width: 500, height: 622, rx: 6, fill: BRASS, 'fill-opacity': .9, stroke: BRASS_DK, 'stroke-width': 1.5 }));
  door.append(el('rect', { x: 10, y: 48, width: 480, height: 428, rx: 4, fill: BRASS_DK, 'fill-opacity': .32 }));
  for (const hy of [70, 300, 530]) door.append(el('rect', { x: -6, y: hy, width: 12, height: 44, rx: 3, fill: BRASS_DK, 'fill-opacity': .9 }));
  door.append(el('rect', { x: 488, y: 262, width: 8, height: 60, rx: 3, fill: BRASS_DK, 'fill-opacity': .8 }));
  door.append(serif(18, 33, 'STAR ATLAS · DOOR', { 'font-size': 16, 'font-weight': 700, fill: INK }));
  door.append(mono(482, 33, '6 × 4 ZONE TAGS · RA 0-24h · DEC ±90', { 'text-anchor': 'end' }));
  door.append(...rivets([[12, 12], [488, 12], [12, 610], [488, 610]]));

  // 24 zone groups. Each <g id="zone-NN"> carries the tag (an <a href="#zone-NN"> around a 68×51 tag window
  // instancing the zone plate) AND that zone's slip in the groove, so :target on the g flips both.
  const zones: string[] = ZONES.map(z => {
    const tx = 14 + z.col * 79, ty = 56 + z.row * 103;
    const frag = slipFragment(z);
    const lines = frag.lines.map((s, i) => `<text x="138" y="${31 + i * 11}" font-family="${FONT_MONO}" font-size="11" fill="${INK}">${esc(s)}</text>`).join('');
    return `<g id="${z.id}" class="zone" style="${zoneTintStyle(z)}" fill="var(--tint)">
  <a href="#${z.id}">
    <rect class="tag-plate" x="${tx - 4}" y="${ty - 4}" width="76" height="86" rx="3" fill="${BRASS}" fill-opacity=".82" stroke="${BRASS_DK}" stroke-width="1"/>
    <svg class="tag-window" x="${tx}" y="${ty}" width="68" height="51" viewBox="${z.n === 13 ? ` ${z.x},${z.y}, ${z.w} ${z.h} ` : zoneRect(z)}">
      <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="${SKY}"/>
      <use href="#${z.id}-plate"/>
    </svg>
    <text class="tag-num" x="${tx + 3}" y="${ty + 12}" font-family="${FONT_SERIF}" font-size="11" font-weight="700" fill="${BRASS_HI}">${pad2(z.n)}</text>
    <text x="${tx}" y="${ty + 64}" font-family="${FONT_MONO}" font-size="11" fill="${INK}">${z.raRange}</text>
    <text x="${tx}" y="${ty + 77}" font-family="${FONT_MONO}" font-size="11" fill="${INK}">${z.decRange}</text>
  </a>
  <svg class="slip" x="24" y="489" width="220" height="108" viewBox="0 0 220 108">
    <rect width="220" height="108" rx="4" fill="#f4e6c2" stroke="${BRASS_DK}"/>
    <rect x="6" y="6" width="124" height="93" fill="${SKY}"/>
    <image class="slip-image" ${frag.attr}="${frag.href}" x="6" y="6" width="124" height="93"/>
    <use class="slip-mirror" href="#mirror-${pad2(z.n)}" x="6" y="6" width="124" height="93" opacity="0"/>
    <text x="138" y="17" font-family="${FONT_SERIF}" font-size="12" font-weight="700" fill="${INK}">ZONE ${pad2(z.n)}</text>
    ${lines}
    <text x="138" y="91" font-family="${FONT_MONO}" font-size="11" fill="${INK}">${z.raRange}</text>
    <text x="138" y="103" font-family="${FONT_MONO}" font-size="11" fill="${INK}">${z.decRange}</text>
  </svg>
</g>`;
  });
  // Groove first (painted under the slips), then the zone groups.
  door.append(el('rect', { x: 10, y: 484, width: 480, height: 118, rx: 4, fill: INK, 'fill-opacity': .55, stroke: BRASS_DK }));
  door.append(fragment(zones.join('\n')));

  // Status plate: SVGVIEW / EXTERNAL USE probe results (construction notes 9–10) — written by the script.
  door.append(plate(256, 492, 226, 44, { 'fill-opacity': .95 }));
  door.append(mono(266, 510, 'SVGVIEW: PROBING', { id: 'svgview-status', 'font-weight': 700 }));
  door.append(mono(266, 526, 'EXTERNAL USE: PROBING', { id: 'external-status', 'font-weight': 700 }));
  // Borrowed plate tag: <a target="_blank"> to the standalone atlas at one of its named views.
  const borrow = el('a', { id: 'borrow-link', href: `${ATLAS}#zone-19`, target: '_blank' });
  borrow.append(plate(256, 546, 226, 46, { 'fill-opacity': .95 }));
  borrow.append(mono(266, 564, 'BORROWED PLATE   target=_blank', { 'font-weight': 700 }));
  borrow.append(mono(266, 580, 'atlas-plates.svg#zone-19  ↗'));
  door.append(borrow, ...rivets([[262, 500], [476, 500], [262, 586], [476, 586]]));

  // Second <defs> of the document, after the slips that reference it (concept:defs-anywhere): one inline
  // mirror per zone with the same viewBox as the slip image — revealed only if svgView() is not honoured.
  door.append(fragment(`<defs id="slip-mirrors">${ZONES.map(z =>
    `<svg id="mirror-${pad2(z.n)}" viewBox="${zoneRect(z)}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="${SKY}"/><use href="#${z.id}-plate"/></svg>`).join('')}</defs>`));
  return door;
}

// ---------------------------------------------------------------------------------------------------------
// Bottom shelf (construction notes 12–13).
// ---------------------------------------------------------------------------------------------------------
export interface Shelf { group: SVGGElement; comets: SVGUseElement[]; nova: SVGUseElement }

export function buildShelf(): Shelf {
  const g = el('g', { id: 'shelf' });

  // -- Quadrant inset (x 44..168): y points down, positive rotate() is clockwise (concept:y-down-clockwise-angles).
  g.append(sans(44, 730, 'QUADRANT · +y DOWN'));
  g.append(plate(44, 736, 124, 130));
  g.append(mono(50, 752, 'SVG +30° = CW', { fill: BRASS_DK, 'font-weight': 700 }));
  g.append(mono(50, 764, 'MATH +30° = CCW', { fill: '#1f5c4a' }));
  const ox = 106, oy = 806;
  g.append(el('path', { d: `M${ox - 50} ${oy} H${ox + 52} M${ox + 46} ${oy - 4} L${ox + 52} ${oy} L${ox + 46} ${oy + 4} M${ox} ${oy - 34} V${oy + 52} M${ox - 4} ${oy + 46} L${ox} ${oy + 52} L${ox + 4} ${oy + 46}`, fill: 'none', stroke: INK, 'stroke-width': 1 }));
  g.append(mono(ox + 42, oy - 6, '+x', { fill: INK }));
  g.append(mono(ox + 6, oy + 50, '+y', { fill: INK }));
  // Solid brass arrow: transform="rotate(30 106 806)" — the three-argument form (pv:transform=rotate-cx-cy).
  g.append(el('path', { d: `M${ox} ${oy - 3} H${ox + 34} V${oy - 7} L${ox + 46} ${oy} L${ox + 34} ${oy + 7} V${oy + 3} H${ox} Z`, fill: BRASS_DK, transform: `rotate(30 ${ox} ${oy})` }));
  // Verdigris dashed arrow at the textbook +30° (counter-clockwise on screen).
  g.append(el('path', { d: `M${ox} ${oy} H${ox + 44} M${ox + 36} ${oy - 6} L${ox + 46} ${oy} L${ox + 36} ${oy + 6}`, fill: 'none', stroke: '#1f5c4a', 'stroke-width': 1.6, 'stroke-dasharray': '4 3', transform: `rotate(-30 ${ox} ${oy})` }));
  g.append(el('use', { href: '#pin', x: ox, y: oy }));

  // -- Symbol rack (x 188..468): 2 rows × 7 cells of 40. The masters themselves never render; every cell is a use.
  g.append(sans(188, 730, 'gl-* MASTERS · a symbol never renders itself — these cells are use too'));
  g.append(plate(188, 736, 280, 130));
  const rackCell = (col: number, row: number, label: string, inner: string, span = 1, viewBox = '0 0 40 40'): void => {
    const x = 188 + col * 40, y = row === 0 ? 744 : 806;
    g.append(fragment(`<svg x="${x}" y="${y}" width="${40 * span}" height="40" viewBox="${viewBox}" color="#e2ebff"><rect width="${40 * span}" height="40" fill="${SKY}" fill-opacity=".9"/>${inner}</svg>`));
    g.append(mono(x + 20 * span, y + 52, label, { 'text-anchor': 'middle' }));
  };
  ['ob', 'a', 'f', 'g', 'k', 'm', 'double'].forEach((m, i) => rackCell(i, 0, m, `<use href="#gl-${m}" x="20" y="20" width="26" height="26" color="${m === 'm' ? '#ff9c6e' : m === 'k' ? '#ffcf8f' : '#e2ebff'}"/>`));
  rackCell(0, 1, 'var', '<use href="#gl-var" x="20" y="20" width="26" height="26" color="#ffe08a"/>');
  rackCell(1, 1, 'neb', '<use href="#gl-neb" x="20" y="20" width="26" height="26" color="#c8b6ff"/>');
  // One master, three widths (24/44/72) — the nested svg's viewBox halves them so 72 fits the shelf.
  rackCell(2, 1, 'w 24/44/72', '<use href="#gl-a" x="18" y="40" width="24" height="24"/><use href="#gl-a" x="62" y="40" width="44" height="44"/><use href="#gl-a" x="122" y="40" width="72" height="72"/>', 2, '0 0 160 80');
  // No width/height → a symbol fills 100% × 100% of the enclosing viewport (concept:use-symbol-default-100pct-size).
  rackCell(4, 1, '100%', '<use href="#gl-neb" x="20" y="20" color="#c8b6ff"/>');
  // use width/height are ignored when the target is a plain <rect> (at:use.width, legacy xlink:href form).
  rackCell(5, 1, 'rect', '<use xlink:href="#tally-bar" x="6" y="17" width="60" height="12"/>');
  // Nova slot: SMIL cycles the href through three masters (concept:animate-use-href).
  rackCell(6, 1, 'nova', '<use id="nova-slot" class="star" href="#gl-neb" x="20" y="20" width="26" height="26" color="#c9e8ff"><animate id="nova-cycle" attributeName="href" calcMode="discrete" values="#gl-neb;#gl-ob;#gl-var" dur="8s" repeatCount="indefinite"/></use>');
  const nova = g.querySelector('#nova-slot') as SVGUseElement;

  // -- preserveAspectRatio proof strip (x 620..1096): eight 100×50 viewports on one square patch of zone-07.
  g.append(sans(620, 722, 'preserveAspectRatio PROOF · one square patch of zone-07 in eight 100×50 viewports'));
  g.append(plate(620, 728, 476, 138));
  const PAR = [['xMinYMin meet', 'xMidYMid meet', 'xMaxYMax meet', 'none'], ['xMinYMin slice', 'xMidYMid slice', 'xMaxYMax slice', 'xMidYMin meet']];
  PAR.forEach((row, r) => row.forEach((par, c) => {
    const x = 628 + c * 118, y = r === 0 ? 744 : 799;
    g.append(fragment(`<svg x="${x}" y="${y}" width="100" height="50" viewBox="140 390 120 120" preserveAspectRatio="${par}" class="par-cell" style="${zoneTintStyle(ZONES[6])}" fill="var(--tint)"><rect x="140" y="390" width="120" height="120" fill="${SKY}"/><use href="#zone-07-plate"/></svg>`));
    g.append(mono(x + 50, r === 0 ? y - 4 : y + 62, par, { 'text-anchor': 'middle' }));
  }));

  // -- Overflow pair (x 1116..1360): A clips at its viewport (default), B declares overflow:visible twice.
  g.append(sans(1116, 722, 'OVERFLOW · A default clip | B visible'));
  g.append(plate(1116, 728, 244, 138));
  const comets: SVGUseElement[] = [];
  [['A', 1122, false], ['B', 1242, true]].forEach(([tag, x, visible]) => {
    const cell = el('svg', { x: x as number, y: 736, width: 112, height: 66, viewBox: '0 0 112 66', class: 'overflow-cell', ...(visible ? { overflow: 'visible', style: 'overflow:visible' } : {}) });
    cell.append(el('rect', { width: 112, height: 66, fill: SKY, 'fill-opacity': .9 }));
    const comet = el('use', { id: `comet-${tag}`, href: `${ATLAS}#gl-comet`, x: 44, y: 33, width: 100, height: 34 });
    comets.push(comet);
    cell.append(comet);
    g.append(cell);
    g.append(el('rect', { x: x as number, y: 736, width: 112, height: 66, fill: 'none', stroke: BRASS_DK, 'stroke-dasharray': visible ? '3 3' : undefined }));
    g.append(mono((x as number) + 56, 814, visible ? 'B overflow:visible' : 'A clipped', { 'text-anchor': 'middle' }));
  });
  // -- Painting order (244×44): the tag drawn first carries style="z-index:99" and is still covered.
  g.append(el('rect', { x: 1122, y: 820, width: 232, height: 42, rx: 2, fill: INK, 'fill-opacity': .25 }));
  g.append(el('rect', { x: 1130, y: 826, width: 130, height: 30, rx: 3, fill: BRASS_HI, stroke: BRASS_DK, style: 'z-index:99' }));
  g.append(mono(1136, 845, 'drawn 1st z-index:99', { 'font-size': 11 }));
  g.append(el('rect', { x: 1214, y: 832, width: 134, height: 30, rx: 3, fill: BRASS_DK, stroke: BRASS_HI }));
  g.append(mono(1222, 851, 'drawn 2nd covers it', { fill: BRASS_HI }));
  return { group: g, comets, nova };
}
