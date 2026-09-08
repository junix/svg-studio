// stele-rubbing-hall — 碑林拓片厅 (docs/svg-feature-demos.md §3.7).
//
// A freshly lifted full-sheet rubbing hangs from a rod: indigo brocade mount, ink-black ground, paper-white glyphs.
// The body text is eight upright vertical columns read right-to-left (pv:writing-mode=vertical-rl, pr:text-orientation),
// every glyph nudged by a per-glyph rotate/dx list (at:text.rotate, at:text.dx). One arc (#arc-e) inside the round head
// carries both the centred title (el:textPath, startOffset=50%) and the side colophon hanging on the other side of the
// same geometry (at:textPath.side, with a probe + reversed-path fallback). The ink ground is a luminance mask cut by
// cloned text (concept:mask-with-text) — grey glyphs stay half-inked, which a clip could never do. The small cinnabar
// sample on the left sends the same text through a clipPath as a window (concept:text-in-clippath). A round seal rides
// the seam between the rubbing and the interpretation card (concept:textpath-closed-path), and a cinnabar reading-order
// line ties title → columns → colophon → last line → seal → card together. The card itself lives in
// ./stele-rubbing-hall-card.ts.
import { el, fragment, mark, isExport, freezeAt, mulberry32, fmt, fontFaceCss, FONT_CJK, FONT_MONO, FONT_SERIF } from './lib';
import { buildCard, PALETTE as P } from './stele-rubbing-hall-card';

// ── geometry shared by several blocks ────────────────────────────────────────────────────────────
const STELE_D = 'M 320 340 A 280 280 0 0 1 880 340 L 880 836 L 320 836 Z'; // round-headed stele, centre (600,340) r=280
const ARC_D = 'M 386 340 A 214 214 0 0 1 814 340';                           // the shared title arc, r=214
const ARC_REV_D = 'M 814 340 A 214 214 0 0 0 386 340';                       // same circle, opposite direction (side fallback)
const RIBBON_D = 'M 300 30 q 300 34 600 0';
const ARC_C = { x: 600, y: 340, r: 214 };
const COL_X = (i: number): number => 836 - 62 * i;
const COL_Y = 402;

// Eight columns, rightmost first. Columns 4–5 (i = 3, 4) carry the same Latin transliteration in two orientations.
const COLUMNS = [
  '維丙午歲孟夏之月碑林長', '廊重葺既成乃椎拓舊石以', '傳其文石在唐時已立風雨',
  'BEILIN JI', 'BEILIN JI',
  '剝蝕字口漸淺拓工以淡墨', '輕椎三過紙背乃見白文如', '月照石亦如燭映紗永藏廳',
];
const TITLE = '碑林重葺記';
const COLOPHON = '碑側題記：舊石原在長廊東壁，丙午孟夏移置西廊，拓工淡墨椎拓，紙背白文可讀，時二〇二六年五月十二日記，編號〇三四七';
const SEAL_A = '碑林拓片廳整拓藏本印記', SEAL_B = '丙午孟夏騎縫鈐記勿分';
const LAST_LINE = '石斷字殘不敢妄補';
const LAST_X = '352 392 436 520 560 648 690 734';
const LAST_X_EVEN = '352 386 420 454 488 522 556 590';
const LAST_Y = '800 802 799 801 800 803 798 801';

const inStele = (x: number, y: number): boolean => x > 330 && x < 870 && y < 826 && (y >= 340 || Math.hypot(x - 600, y - 340) < 270);

/** Deep-clone a real text node for use inside <mask>/<clipPath>/the pounce layer: no ids, not selectable, hidden from AT. */
function cloneText<T extends SVGElement>(node: T, fill?: string): T {
  const c = node.cloneNode(true) as T;
  c.removeAttribute('id');
  c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  c.setAttribute('aria-hidden', 'true');
  c.classList.add('clone');
  if (fill) c.setAttribute('fill', fill);
  c.style.userSelect = 'none';
  c.style.setProperty('-webkit-user-select', 'none');
  return c;
}

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  stage.setAttribute('lang', 'zh-Hant');                       // at:svg.lang — inherited by every text; :lang() below keys off it
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'srh-title srh-desc');
  stage.append(el('title', { id: 'srh-title' }, '碑林拓片廳 — 墨底白字整拓、朱拓小樣與釋文卡'));
  stage.append(el('desc', { id: 'srh-desc' }, '一張掛在橫杆上的整幅拓片：八列右起豎排碑文逐字微旋，題額與碑側題記共用圓首內同一條弧，左側朱拓小樣以裁切路徑作窗，右側釋文卡按系統語言切換釋文並列出基線、錨點與雙向文本對照；一枚朱文圓印騎在接縫上。'));

  // css:font-face-data-uri — the CJK subset is declared inside the stage so the SVG stands alone; plus selection/lang rules.
  stage.append(el('style', {}, `
${fontFaceCss(['Studio CJK'])}
#zhengwen text, #zhengwen tspan { user-select: text; -webkit-user-select: text; }
#zhengwen text::selection, #zhengwen tspan::selection { fill: ${P.cinnabar}; background: rgba(179,36,31,.38); }
.clone, .clone * { user-select: none; -webkit-user-select: none; }
text:lang(ja) { fill: #5a6b7a; font-family: ${FONT_CJK}; }
tspan:lang(arc) { fill: ${P.indigo}; }
.ribbon { text-transform: uppercase; letter-spacing: .04em; }
`));

  // ── defs: stele shape, gradients, patterns ─────────────────────────────────────────────────────
  const defs = el('defs');
  defs.append(el('path', { id: 'stele', d: STELE_D }));
  defs.append(el('path', { id: 'arc-zhu', d: 'M 100 575 A 70 70 0 0 1 240 575' }));
  defs.append(fragment(`
<linearGradient id="g-ink" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#211c15"/><stop offset=".55" stop-color="${P.ink}"/><stop offset="1" stop-color="#0e0c09"/>
</linearGradient>
<linearGradient id="g-zhu" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#c22a22"/><stop offset=".5" stop-color="${P.cinnabar}"/><stop offset="1" stop-color="#8a3a1e"/>
</linearGradient>
<linearGradient id="g-sheen" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#ffe2c4" stop-opacity="0"/><stop offset=".5" stop-color="#ffe2c4" stop-opacity=".45"/><stop offset="1" stop-color="#ffe2c4" stop-opacity="0"/>
</linearGradient>
<radialGradient id="g-pounce">
  <stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<pattern id="p-brocade" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <path d="M 0 8 H 16 M 8 0 V 16" stroke="#3d6483" stroke-width="1" stroke-opacity=".55" fill="none"/>
  <circle cx="8" cy="8" r="1.4" fill="#d8a13a" fill-opacity=".35"/>
</pattern>
<pattern id="p-fiber" width="72" height="72" patternUnits="userSpaceOnUse">
  <path d="M -4 12 C 20 8 40 18 76 10 M -4 40 C 24 46 44 34 76 42 M 8 -4 C 12 20 4 40 10 76 M 50 -4 C 46 24 56 48 48 76" stroke="#b7a684" stroke-width=".7" fill="none"/>
</pattern>
<pattern id="p-felt" width="7" height="7" patternUnits="userSpaceOnUse">
  <path d="M -1 8 L 8 -1 M -1 1 L 1 -1 M 6 8 L 8 6" stroke="#f6dccb" stroke-width=".9" fill="none"/>
</pattern>`));
  stage.append(defs);

  // ── hanging rod (y=44, x 260–920) with two hubs, and the gallery ribbon on an inline-path textPath ──
  const rod = el('g', { id: 'rod' });
  rod.append(el('line', { x1: 260, y1: 44, x2: 920, y2: 44, stroke: '#1f3345', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  rod.append(el('line', { x1: 260, y1: 42, x2: 920, y2: 42, stroke: '#5c7a92', 'stroke-width': 1.2, 'stroke-linecap': 'round', 'stroke-opacity': .7 }));
  for (const x of [260, 920]) rod.append(el('circle', { cx: x, cy: 44, r: 9, fill: P.gamboge, stroke: P.ink, 'stroke-width': 1.5 }));
  for (const x of [336, 844]) rod.append(el('path', { d: `M ${x} 47 v 17`, stroke: '#1f3345', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  stage.append(rod);

  // at:textPath.path — SVG 2 inline geometry with no <path> element anywhere (Firefox); probed + href fallback below.
  const ribbonTP = el('textPath', { id: 'tp-ribbon', path: RIBBON_D, startOffset: '6%' }, '碑林拓片廳 · gallery of stele rubbings · 讀序自右而左，題額循弧，題記倒讀');
  const ribbon = el('text', { id: 'ribbon', class: 'ribbon', 'font-size': 12, 'font-family': FONT_CJK, fill: P.indigo, dy: -7 }, ribbonTP);
  stage.append(ribbon);

  // ── brocade mount 282–898 × 64–856 ─────────────────────────────────────────────────────────────
  const mount = el('g', { id: 'mount' });
  mount.append(el('rect', { x: 282, y: 64, width: 616, height: 792, rx: 3, fill: P.indigo }));
  mount.append(el('rect', { x: 282, y: 64, width: 616, height: 792, rx: 3, fill: 'url(#p-brocade)' }));
  mount.append(el('rect', { x: 288, y: 70, width: 604, height: 780, fill: 'none', stroke: P.gamboge, 'stroke-width': .8, 'stroke-opacity': .55 }));
  // pv:writing-mode=vertical-lr — the modern catalogue label on the left brocade edge stacks its lines left→right,
  // the mirror of the inscription's right→left column order.
  const zhulu = el('g', { id: 'zhulu', style: 'writing-mode:vertical-lr', 'font-size': 13, 'font-family': FONT_CJK, fill: '#e2d3ae' });
  zhulu.append(el('text', { x: 294, y: 430 }, '館藏編號 碑林拓〇三四七'));
  zhulu.append(el('text', { x: 310, y: 430 }, '丙午年揭拓 整幅 行序左起'));
  mount.append(zhulu);
  stage.append(mount);

  // ── the rubbing: paper → ink (masked) → pounce layer → visible text ─────────────────────────────
  const clipMount = el('clipPath', { id: 'clip-mount' }, el('rect', { x: 282, y: 64, width: 616, height: 792 }));
  defs.append(clipMount);
  const rubbing = el('g', { id: 'rubbing', 'clip-path': 'url(#clip-mount)', 'font-family': FONT_CJK });
  rubbing.append(el('use', { href: '#stele', fill: P.paper }));                       // (a) paper
  rubbing.append(el('use', { href: '#stele', fill: 'url(#p-fiber)', opacity: .35 })); //     fibre lines
  // (b) ink ground, cut by the luminance mask #m-ink
  rubbing.append(el('use', { id: 'ink', href: '#stele', fill: 'url(#g-ink)', mask: 'url(#m-ink)' }));

  // visible body text — real, selectable text nodes on top of the ink
  const zhengwen = el('g', { id: 'zhengwen', 'font-size': 30, fill: P.paper });
  const colTexts: SVGTextElement[] = COLUMNS.map((s, i) => {
    const orientation = i === 3 ? 'mixed' : 'upright';
    // at:text.rotate — list shorter than the glyph count: the final 2° repeats to the end of the column.
    // at:text.dx — per-glyph horizontal jitter, the chisel's own irregularity.
    const t = el('text', {
      x: COL_X(i), y: COL_Y, rotate: '-3 2 -1 4 -2 3 2', dx: '0 1.4 -1.1 1.6 -0.8 1.2 -1.4', 'data-col': i,
      style: `writing-mode:vertical-rl;text-orientation:${orientation};letter-spacing:.06em;user-select:text;-webkit-user-select:text`,
    });
    if (i === 2) t.append(el('tspan', { class: 'weituo', style: 'fill-opacity:0' }, s.slice(0, 2)), s.slice(2));
    else if (i === 5) t.append(s.slice(0, -2), el('tspan', { class: 'weituo', style: 'fill-opacity:0' }, s.slice(-2)));
    else t.append(s);
    return t;
  });
  zhengwen.append(...colTexts);
  // pr:text-orientation — the two Latin columns side by side: mixed (letters turned sideways) vs upright (stacked)
  zhengwen.append(el('text', { x: COL_X(3), y: 390, 'font-size': 11, 'font-family': FONT_MONO, 'text-anchor': 'middle', fill: P.gamboge }, 'mixed'));
  zhengwen.append(el('text', { x: COL_X(4), y: 390, 'font-size': 11, 'font-family': FONT_MONO, 'text-anchor': 'middle', fill: P.gamboge }, 'upright'));

  // the shared arc and its three riders
  const arcE = el('path', { id: 'arc-e', d: ARC_D, fill: 'none', stroke: P.cinnabar, 'stroke-opacity': .18, 'stroke-width': 1.5 });
  // concept:textpath-centered-text — startOffset=50% + text-anchor=middle centres the title on the apex (outside)
  const titleText = el('text', { id: 'tie', 'font-size': 34, 'font-weight': 700, fill: P.paper, 'text-anchor': 'middle' },
    el('textPath', { href: '#arc-e', startOffset: '50%', 'text-anchor': 'middle' }, TITLE));
  // at:textPath.side — the colophon hangs on the inner side of the same arc, reading back from the other end;
  // startOffset is a length (120 user units), and the string is ~12% longer than the arc so the tail is clipped
  // (concept:textpath-overflow-clipped: glyphs past the path end are not rendered).
  const colophonTP = el('textPath', { id: 'tp-ce', href: '#arc-e', side: 'right', startOffset: '120' }, COLOPHON);
  const colophon = el('text', { id: 'tiji', 'font-size': 15, fill: P.paper, 'fill-opacity': .92 }, colophonTP);
  // at:textPath.xlink:href — legacy syntax still resolves
  const carver = el('text', { 'font-size': 11, fill: P.paper, 'fill-opacity': .8 }, el('textPath', { 'xlink:href': '#arc-e', startOffset: '1.5%' }, '刻工 王二郎'));

  // fragmentary last line: at:text.x / at:text.y absolute lists, animated back and forth from an even spacing
  const lastLine = el('text', { id: 'canzi', x: LAST_X, y: LAST_Y, 'font-size': 22, fill: P.paper }, LAST_LINE,
    el('animate', { attributeName: 'x', values: `${LAST_X_EVEN}; ${LAST_X}; ${LAST_X}`, keyTimes: '0;0.35;1', dur: '5s', repeatCount: 'indefinite' }));
  // at:text.dy — the pouncer's colophon rides the stone's undulation
  const postscript = el('text', { x: 352, y: 826, dy: '0 -3 2 -4 3 -2 4 -3 2 0', 'font-size': 14, fill: P.paper, 'fill-opacity': .85 }, '拓工淡墨椎拓於碑林長廊之下');

  // ── #m-ink: luminance mask — white = ink everywhere, black clones = paper windows, grey = half-inked ──
  const mInk = el('mask', { id: 'm-ink', maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: 282, y: 56, width: 616, height: 800, style: 'mask-type:luminance' });
  mInk.append(el('use', { href: '#stele', fill: '#fff', stroke: '#6a6a6a', 'stroke-width': 9 })); // soft, uneven rubbing edge
  const rnd = mulberry32(347);
  const speck = el('g', { id: 'shihua' });                                                   // 石花 — pitted stone shows as pale specks
  for (let n = 0; n < 140; n++) {
    const x = 330 + rnd() * 540, y = 70 + rnd() * 760;
    if (!inStele(x, y)) continue;
    const grey = rnd() < .3 ? '#000' : `#${Math.round(0x55 + rnd() * 0x55).toString(16).repeat(3)}`;
    speck.append(el('circle', { cx: fmt(x, 1), cy: fmt(y, 1), r: fmt(.6 + rnd() * 2.2, 1), fill: grey }));
  }
  mInk.append(speck);
  for (const t of colTexts) {
    const c = cloneText(t, '#000');
    // the four "not rubbed through" glyphs: #6b6b6b, so ~42% ink remains over the paper — a clip could only do 0 or 1
    c.querySelectorAll('.weituo').forEach(ts => ts.setAttribute('style', 'fill:#6b6b6b;fill-opacity:1'));
    mInk.append(c);
  }
  mInk.append(cloneText(titleText, '#000'));
  defs.append(mInk);

  // ── #m-pounce: the pouncer's dabber — a radial white disc that moves with the pointer ─────────────
  const pounce = el('circle', { id: 'pounce', cx: 470, cy: 610, r: 96, fill: 'url(#g-pounce)' });
  defs.append(el('mask', { id: 'm-pounce', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1400, height: 900 }, pounce));
  const pounceLayer = el('g', { id: 'pounce-layer', mask: 'url(#m-pounce)', 'pointer-events': 'none' });
  pounceLayer.append(el('use', { href: '#stele', fill: '#000', mask: 'url(#m-ink)' }));            // ink deepens
  for (const t of colTexts) {
    const c = cloneText(t, '#fffaf0');                                                             // glyph edges brighten
    c.setAttribute('fill-opacity', '.55');
    c.querySelectorAll('.weituo').forEach(ts => ts.setAttribute('style', 'fill-opacity:.25'));
    pounceLayer.append(c);
  }
  const pounceRing = el('circle', { cx: 470, cy: 610, r: 96, fill: 'none', stroke: P.cinnabar, 'stroke-opacity': .3, 'stroke-dasharray': '3 5' });

  rubbing.append(arcE, carver, colophon, titleText, zhengwen, lastLine, postscript, pounceLayer, pounceRing);
  stage.append(rubbing);

  // ── 朱拓小样 70–270 × 470–830: the same text, now a clipPath window onto cinnabar and felt ─────────
  const zhu = el('g', { id: 'zhu', 'font-family': FONT_CJK });
  zhu.append(el('text', { x: 170, y: 458, 'font-size': 12, 'text-anchor': 'middle', fill: P.indigo }, '朱拓小樣 · 陽拓（clipPath 作窗）'));
  zhu.append(el('rect', { x: 70, y: 470, width: 200, height: 360, rx: 3, fill: P.indigo }));
  zhu.append(el('rect', { x: 70, y: 470, width: 200, height: 360, rx: 3, fill: 'url(#p-brocade)' }));
  zhu.append(el('rect', { x: 78, y: 478, width: 184, height: 344, fill: P.paper }));
  // concept:text-in-clippath / concept:text-as-clip-path — real text, text-on-path and a 48px glyph as the clip
  const clipZhu = el('clipPath', { id: 'clip-zhu', clipPathUnits: 'userSpaceOnUse' });
  for (const i of [0, 1]) {
    const c = cloneText(colTexts[i]);
    c.setAttribute('transform', 'translate(-376 231) scale(.72)');
    clipZhu.append(c);
  }
  clipZhu.append(el('text', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', class: 'clone', 'aria-hidden': 'true' },
    el('textPath', { href: '#arc-zhu', startOffset: '50%' }, '朱拓小樣 · 同文異身')));
  clipZhu.append(el('text', { x: 118, y: 640, 'font-size': 48, 'font-weight': 700, 'text-anchor': 'middle', class: 'clone', 'aria-hidden': 'true' }, '陽'));
  defs.append(clipZhu);
  const window_ = el('g', { 'clip-path': 'url(#clip-zhu)' });
  window_.append(el('rect', { x: 78, y: 478, width: 184, height: 344, fill: 'url(#g-zhu)' }));
  window_.append(el('rect', { x: 78, y: 478, width: 184, height: 344, fill: 'url(#p-felt)', opacity: .6 }));
  window_.append(el('rect', { x: -130, y: 478, width: 600, height: 344, fill: 'url(#g-sheen)' },
    el('animateTransform', { attributeName: 'transform', type: 'translate', values: '-160 0; 160 0; -160 0', dur: '12s', repeatCount: 'indefinite' })));
  zhu.append(window_);
  zhu.append(el('text', { x: 170, y: 812, 'font-size': 11, 'text-anchor': 'middle', fill: P.indigo }, '主拓白文為陰，此處朱窗為陽'));
  stage.append(zhu);

  // ── seal riding the seam (905,700) r=54 — concept:textpath-closed-path ────────────────────────────
  const seal = el('g', { id: 'seal', 'font-family': FONT_CJK, fill: P.cinnabar, 'fill-opacity': .82 });
  const sealRing = el('path', { id: 'seal-ring', d: 'M 905 646 a 54 54 0 1 1 -0.1 0 Z', fill: 'none', stroke: P.cinnabar, 'stroke-width': 2.5, 'stroke-opacity': .82 });
  seal.append(sealRing);
  seal.append(el('circle', { cx: 905, cy: 700, r: 37, fill: 'none', stroke: P.cinnabar, 'stroke-width': 1.5, 'stroke-opacity': .7 }));
  const sealTPa = el('textPath', { id: 'seal-a', href: '#seal-ring', startOffset: '1%', lengthAdjust: 'spacing' }, SEAL_A);
  const sealTPb = el('textPath', { id: 'seal-b', href: '#seal-ring', startOffset: '51%', lengthAdjust: 'spacing' }, SEAL_B);
  seal.append(el('text', { 'font-size': 13, 'font-weight': 700 }, sealTPa), el('text', { 'font-size': 13, 'font-weight': 700 }, sealTPb));
  // pv:dominant-baseline=central + text-anchor middle — four seal characters in a 2×2 block
  const sealChars = '拓廳之印';
  [[919, 686], [919, 714], [891, 686], [891, 714]].forEach(([cx, cy], i) =>
    seal.append(el('text', { x: cx, y: cy, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, sealChars[i])));
  stage.append(seal);

  // ── interpretation card ────────────────────────────────────────────────────────────────────────
  const card = buildCard();
  stage.append(card.root);

  // ── reading-order line ①…⑦ and the patrolling ▶讀 marker ──────────────────────────────────────
  const guide = el('g', { id: 'duxu', 'font-family': FONT_SERIF, 'pointer-events': 'none' });
  const stops: Array<[number, number]> = [[554, 82], [858, 376], [386, 376], [600, 300], [615, 786], [905, 786], [933, 826]];
  const route = [stops[0], [690, 92], [790, 172], [856, 290], stops[1], stops[2], stops[3], [619, 330], stops[4], [615, 812], [870, 812], stops[5], stops[6]];
  guide.append(el('polyline', { points: route.map(p => p.join(',')).join(' '), fill: 'none', stroke: P.cinnabar, 'stroke-opacity': .35, 'stroke-width': 1.6, 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }));
  stops.forEach(([x, y], i) => {
    guide.append(el('circle', { cx: x, cy: y, r: 9, fill: P.cinnabar, 'fill-opacity': .88, stroke: P.paper, 'stroke-width': 1 }));
    guide.append(el('text', { x, y: y + 4, 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff' }, String(i + 1)));
  });
  // concept:textpath-startoffset-animation — the marker patrols the arc via <animate attributeName="startOffset">
  const markerTP = el('textPath', { id: 'tp-marker', href: '#arc-e', startOffset: '4%' }, '▶讀',
    el('animate', { attributeName: 'startOffset', values: '4%;96%;4%', dur: '9s', repeatCount: 'indefinite' }));
  const marker = el('text', { id: 'marker', 'font-size': 13, 'font-weight': 700, 'font-family': FONT_CJK, fill: P.cinnabar, dy: -40 }, markerTP);
  guide.append(marker);
  stage.append(guide);

  // ── probes: does this renderer honour textPath side / path? Fall back without changing the picture ──
  // side="right": a probe glyph at 50% must land INSIDE the arc (centre y > apex y=126) if side works.
  const probe = el('text', { 'font-size': 10, fill: 'none' }, el('textPath', { href: '#arc-e', side: 'right', startOffset: '50%', 'text-anchor': 'middle' }, '十'));
  rubbing.append(probe);
  let sideNative = false;
  try { const ext = probe.getExtentOfChar(0); sideNative = ext.y + ext.height / 2 > ARC_C.y - ARC_C.r + 2; } catch { sideNative = false; }
  probe.remove();
  if (!sideNative) {
    // same circle, endpoints swapped and sweep-flag inverted: identical geometry, opposite direction → text hangs inside
    defs.append(el('path', { id: 'arc-e-rev', d: ARC_REV_D }));
    colophonTP.setAttribute('href', '#arc-e-rev');
    card.chip(0, 'side=right → 反向路徑回退', 'fallback');
  } else card.chip(0, 'side=right → 原生', 'ok');
  // inline path attribute: unsupported renderers draw nothing (zero-height box) → write the same d into <defs> and use href
  let pathNative = false;
  try { pathNative = ribbonTP.getBBox().height > 2 && ribbonTP.getComputedTextLength() > 0; } catch { pathNative = false; }
  if (!pathNative) {
    defs.append(el('path', { id: 'ribbon-path', d: RIBBON_D }));
    ribbonTP.setAttribute('href', '#ribbon-path');
    card.chip(1, 'path 屬性 → href 回退', 'fallback');
  } else card.chip(1, 'textPath path → 原生', 'ok');

  // seal ring: make each half-ring exactly half the circumference minus a small gap (textLength on the textPath)
  const ringLen = sealRing.getTotalLength();
  const half = ringLen / 2 - 6.5;
  sealTPa.setAttribute('textLength', fmt(half, 1));
  sealTPb.setAttribute('textLength', fmt(Math.min(half, ringLen * .49 - 3), 1));

  // ── language ledger: who rendered (DOM) vs who should (navigator.languages), printed side by side ──
  const branches = [...card.switchEl.children] as SVGElement[];
  const rendered = branches.map(b => b.getBoundingClientRect().width > 0);
  const lang = (navigator.language || 'en-US');
  const matches = (b: SVGElement): boolean => {
    if (b.hasAttribute('requiredExtensions')) return false;                       // no extension is ever supported
    const sl = b.getAttribute('systemLanguage');
    if (!sl) return true;
    const l = lang.toLowerCase();
    return sl.split(',').map(s => s.trim().toLowerCase()).some(t => t === l || (t.length === 2 && l.startsWith(t)) || l.startsWith(t + '-'));
  };
  const first = branches.findIndex(matches);
  const predicted = branches.map((_, i) => i === first);
  card.ledger(rendered, predicted);
  card.ledgerHead.textContent = `分支帳 · navigator.language = ${lang} · languages = ${(navigator.languages ?? [lang]).join(',')}`;
  const consistent = rendered.every((r, i) => r === predicted[i]) && rendered.filter(Boolean).length === 1;
  card.chip(2, consistent ? `帳目一致 · ${lang}` : '帳目不一致 · 請核對', consistent ? 'ok' : 'warn');

  // api:SVGTextPositioningElement.x — read the measured x/y lists back through SVGLengthList for the catalogue
  const xs = [...lastLine.x.baseVal].map(v => fmt(v.value)), ys = [...lastLine.y.baseVal].map(v => fmt(v.value));
  card.xList.textContent = `x = ${xs.join(' ')}`;
  card.yList.textContent = `y = ${ys.join(' ')}`;
  card.readout.textContent = `拓包 (x, y) = ${pounce.getAttribute('cx')}, ${pounce.getAttribute('cy')}`;

  // ── interaction: pointer → user space → pounce + readout; near the arc it drags the ▶讀 marker ──
  const arcLen = arcE.getTotalLength();
  let arcHover = false;
  stage.addEventListener('pointermove', event => {
    const ctm = stage.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const x = Math.round(p.x * 10) / 10, y = Math.round(p.y * 10) / 10;
    for (const c of [pounce, pounceRing]) { c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); }
    stage.dataset.pounce = `${x},${y}`;
    card.readout.textContent = `拓包 (x, y) = ${x}, ${y}`;
    // api:SVGTextPathElement.startOffset — nearest point on the arc → baseVal, while the SMIL patrol is paused
    const d = Math.hypot(x - ARC_C.x, y - ARC_C.y);
    const near = y < ARC_C.y && Math.abs(d - ARC_C.r) < 70;
    if (near) {
      const theta = Math.atan2(ARC_C.y - y, x - ARC_C.x);              // 0 at the right end … π at the left end
      const frac = Math.min(.98, Math.max(.02, 1 - theta / Math.PI));
      markerTP.startOffset.baseVal.value = frac * arcLen;
      if (!arcHover && !isExport()) { stage.pauseAnimations(); arcHover = true; }
    } else if (arcHover && !isExport()) { stage.unpauseAnimations(); arcHover = false; }
  });

  mark(stage,
    'concept:multiline-text-tspan', 'concept:text-as-clip-path', 'concept:textpath-closed-path', 'css:font-face-data-uri',
    'concept:mask-with-text', 'concept:text-in-clippath', 'concept:animate-text-attributes', 'css:user-select',
    'api:SVGTextPathElement.startOffset', 'api:SVGTextPositioningElement.x', 'concept:conditional-attrs-outside-switch',
    'css:lang-selector', 'concept:mixed-script-bidi', 'concept:nested-tspan-inheritance', 'concept:text-anchor-rtl-interaction',
    'concept:textpath-centered-text', 'concept:textpath-overflow-clipped', 'concept:textpath-startoffset-animation',
    'concept:tspan-absolute-repositioning', 'css:text-transform', 'css:selection-pseudo');

  // ── export: freeze the SMIL clock at 2.4 s (last line at its measured positions, marker just past the apex)
  //    and select the third column so ::selection shows in the still frame ────────────────────────────
  await document.fonts.ready;
  if (isExport()) {
    freezeAt(stage, 2.4);
    const range = document.createRange();
    range.selectNodeContents(colTexts[2]);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
