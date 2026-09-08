// jacquard-loom-draft — 提花纹版房 (docs/svg-feature-demos.md §3.6).
// An indigo card-cutting room: a proof sheet with threading / reed / weave / treadling drafts that share one
// userSpaceOnUse grid, a full-scale swatch with two nesting levels of pattern, a width-deformation rack for
// objectBoundingBox units, a scanned-yarn / image column, and a seam-inspection rule whose three lanes tile
// the SAME 36×36 weave repeat by user-space pattern, bounding-box pattern and feImage + feTile.
// Feature keys are quoted in comments next to the block that demonstrates them.
import { el, fragment, isExport, freezeAt, mark, setAttrs, FONT_CJK, FONT_MONO } from './lib';
import { BOARD, GOLD, INK, MADDER, PAPER, WEFT, holeSpritePng, linenPng, swatchPng, ticketPng, ticketSvgDataUri, weaveCellMarkup, weaveCellSvgDataUri, yarnPng } from './jacquard-loom-draft-assets';

declare global { interface Window { __sceneReady?: boolean } }

// ─── geometry shared by construction and the pointer hook ────────────────────────────────────────────
const SWATCH = { x: 728, y: 88, w: 360, h: 360, cell: 6 }; // 60 ends × 60 picks
const LANES = [56, 492, 928].map(x => ({ x, y: 632, w: 412, h: 180, cx: x + 206, cy: 632 + 90 }));
const LANE_STRIP_Y = 816, LANE_STRIP_H = 40;
const THREAD = { x0: 80, y0: 150, cols: 36, colW: 8, rowH: 18 };
const TREAD = { x0: 416, y0: 384, colW: 16, rowH: 12, picks: 12, treadles: 6 };
const CELL = 36; // one weave repeat in #weaveCell units (4 ends × 9)
const LANE_BB = { w: 412 * 0.0485, h: 180 * 0.0909 }; // tile of #laneBB on the 412×180 box → 19.98 × 16.36

const shaftOf = (i: number): number => i > 24 ? 7 - ((i * 3) % 8) : (i * 3) % 8; // broken (point-return) twill
const treadleOf = (p: number): number => p % 4; // 3/1 twill on treadles 1-4; 5/6 are tabby treadles

const label = (x: number, y: number, content: string, attrs: Record<string, string | number> = {}) =>
  el('text', { x, y, 'font-family': FONT_CJK, 'font-size': 11, fill: INK, ...attrs }, content);

/** A small opaque caption pill; keeps text legible over patterned fills. */
function pill(x: number, y: number, content: string, opts: { fill?: string; color?: string; size?: number; mono?: boolean } = {}): SVGGElement {
  const size = opts.size ?? 11;
  const w = Math.round(content.replace(/[^\x00-\x7f]/g, 'xx').length * size * 0.56 + 12);
  return el('g', {},
    el('rect', { x, y, width: w, height: size + 7, rx: 4, fill: opts.fill ?? INK, 'fill-opacity': .88 }),
    el('text', { x: x + 6, y: y + size + 1, 'font-family': opts.mono ? FONT_MONO : FONT_CJK, 'font-size': size, fill: opts.color ?? PAPER }, content));
}

export async function render(stage: SVGSVGElement): Promise<void> {
  setAttrs(stage, { lang: 'zh-Hans', role: 'img', 'aria-labelledby': 'jld-title jld-desc' });
  stage.append(
    el('title', { id: 'jld-title' }, '提花纹版房 — Jacquard loom draft: where pattern tiling shows its seams'),
    el('desc', { id: 'jld-desc' }, 'A weaving draft room: threading, reed, weave and treadling drafts on one userSpaceOnUse grid; a full-scale swatch with nested patterns over a scanned linen tile; a width-deformation rack for objectBoundingBox units; scanned yarn images with href/xlink:href, data-URI SVG vs PNG, image-rendering and preserveAspectRatio comparisons; and a seam-inspection rule tiling the same weave cell by user-space pattern, bounding-box pattern and feImage + feTile with stitchTiles noise.'));

  const isGecko = 'MozAppearance' in document.documentElement.style; // Firefox: feImage href="#el" is not rendered (bug 455986)
  const assets = { linen: linenPng(), yarn: yarnPng(), sprite: holeSpritePng(), swatch: swatchPng(), ticketSvg: ticketSvgDataUri(), ticketPng: ticketPng(), cell: weaveCellSvgDataUri() };
  const defs = el('defs');
  stage.append(defs);

  // ─── the room: one board, margins stay transparent (no full-stage backdrop) ──────────────────────
  stage.append(el('rect', { x: 40, y: 40, width: 1320, height: 836, rx: 14, fill: BOARD }));
  stage.append(el('rect', { x: 44, y: 44, width: 1312, height: 828, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 1.5 }));
  stage.append(el('text', { x: 56, y: 68, 'font-family': FONT_CJK, 'font-size': 20, 'font-weight': 700, fill: PAPER }, '提花纹版房 · Jacquard Loom Draft'));
  stage.append(el('text', { x: 1344, y: 66, 'text-anchor': 'end', 'font-family': FONT_MONO, 'font-size': 12, fill: GOLD }, 'pattern · href · feImage + feTile · stitchTiles'));

  // ═══════════════════════════════ 1. proof sheet with DRAFT watermark ═════════════════════════════
  // `concept:pattern-with-text` + `at:pattern.patternTransform`: the tile grid is rotated -30°, the paper stays level.
  defs.append(fragment(`
    <pattern id="wmDraft" patternUnits="userSpaceOnUse" width="150" height="96" patternTransform="rotate(-30)">
      <text x="4" y="58" font-family="${FONT_CJK}" font-size="22" font-weight="700" fill="${INK}">校样 · DRAFT</text>
    </pattern>`));
  stage.append(el('rect', { x: 56, y: 88, width: 648, height: 472, rx: 10, fill: PAPER, 'fill-opacity': .94 })); // `at:rect.rx`
  stage.append(el('rect', { x: 56, y: 88, width: 648, height: 472, rx: 10, fill: 'url(#wmDraft)', opacity: .12 }));
  stage.append(label(76, 112, '校样纸 · Proof sheet — 3/1 twill draft, 36 ends × 12 picks，四联格共用一张 userSpaceOnUse 方格底纹 #grid8', { 'font-size': 12 }));

  // `av:pattern.patternUnits=userSpaceOnUse`: one 8×8 grid shared by all four panels, columns align across A and C.
  defs.append(fragment(`
    <pattern id="grid8" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M0 .25H8M.25 0V8" stroke="${BOARD}" stroke-width=".5" stroke-opacity=".45" fill="none"/>
    </pattern>`));
  const panels: Array<[string, number, number, string]> = [['A', 76, 124, 'A · 穿综图 Threading'], ['B', 392, 124, 'B · 穿筘图 Reed / denting'], ['C', 76, 344, 'C · 组织图 Weave structures（viewBox 0 0 100 100）'], ['D', 392, 344, 'D · 踏板图 Treadling ｜ 纹版带 →']];
  for (const [, x, y, title] of panels) {
    stage.append(el('rect', { x, y, width: 292, height: 196, rx: 10, fill: '#f7f2e6' }));
    stage.append(el('rect', { x, y, width: 292, height: 196, rx: 10, fill: 'url(#grid8)' }));
    stage.append(label(x + 8, y + 14, title, { 'font-weight': 700 }));
  }

  // ─── A. threading draft: 8 shafts × 36 ends, algorithmic broken twill ───────────────────────────
  const threadG = el('g', { id: 'threading' });
  for (let i = 0; i < THREAD.cols; i++) {
    threadG.append(el('rect', { x: THREAD.x0 + i * THREAD.colW, y: THREAD.y0 + (7 - shaftOf(i)) * THREAD.rowH, width: 8, height: 18, rx: 1.6, fill: INK }));
  }
  for (let s = 0; s < 8; s++) stage.append(el('line', { x1: 80, x2: 368, y1: THREAD.y0 + s * THREAD.rowH, y2: THREAD.y0 + s * THREAD.rowH, stroke: INK, 'stroke-opacity': .25, 'stroke-width': .5 }));
  stage.append(el('rect', { id: 'threadHi', x: THREAD.x0, y: THREAD.y0, width: 8, height: 144, fill: GOLD, 'fill-opacity': .45 }));
  stage.append(threadG);
  stage.append(el('rect', { id: 'threadHiCell', x: THREAD.x0, y: THREAD.y0, width: 8, height: 18, rx: 1.6, fill: MADDER }));
  stage.append(label(80, 310, 'shaft = (3·i) mod 8；i > 24 回穿 7 − (…) → 破斜纹折返'));

  // ─── B. reed draft: pattern href inheritance (`at:pattern.href`, `at:pattern.width`) ─────────────
  // #dent12 / #dent16 have NO children: they inherit the 1.5-wide line and only override the tile width.
  // #dentCross inherits everything and rotates the tile grid 90° → stacked on #dent it forms a cross-hatch
  // (`concept:hatching-pattern`, `concept:cross-hatch-layering`).
  defs.append(fragment(`
    <pattern id="dent" patternUnits="userSpaceOnUse" width="8" height="36">
      <line x1="4" y1="0" x2="4" y2="36" stroke="${INK}" stroke-width="1.5"/>
    </pattern>
    <pattern id="dent12" href="#dent" width="12"/>
    <pattern id="dent16" href="#dent" width="16"/>
    <pattern id="dentCross" href="#dent" patternTransform="rotate(90)"/>`));
  const bands: Array<[number, string[], string]> = [[150, ['#dent'], '8 · #dent'], [190, ['#dent12'], '12 · href=#dent width=12'], [230, ['#dent16'], '16 · href=#dent width=16'], [270, ['#dent', '#dentCross'], '8 ⨯ 8 · #dent + href rotate(90)']];
  for (const [y, fills, caption] of bands) {
    stage.append(el('rect', { x: 400, y, width: 276, height: 36, fill: '#f7f2e6' }));
    for (const f of fills) stage.append(el('rect', { x: 400, y, width: 276, height: 36, fill: `url(${f})` }));
    stage.append(pill(404, y + 10, caption, { fill: PAPER, color: INK }));
  }
  stage.append(label(400, 310, '#dent12/16 只写 href + width：密度 8:12:16，线宽恒 1.5'));

  // ─── C. weave structures: every tile authored in viewBox 0 0 100 100 (`at:pattern.viewBox`) ──────
  const cells = (n: number, on: (c: number, r: number) => boolean, inset = 0): string => {
    const s = 100 / n; let out = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (on(c, r)) out += `<rect x="${c * s + inset}" y="${r * s + inset}" width="${s - 2 * inset}" height="${s - 2 * inset}" fill="${INK}"/>`;
    return out;
  };
  defs.append(fragment(`
    <pattern id="plainW" patternUnits="userSpaceOnUse" width="16" height="16" viewBox="0 0 100 100">${cells(2, (c, r) => (c + r) % 2 === 0)}</pattern>
    <pattern id="basketW" patternUnits="userSpaceOnUse" width="16" height="16" viewBox="0 0 100 100">${cells(4, (c, r) => (Math.floor(c / 2) + Math.floor(r / 2)) % 2 === 0)}</pattern>
    <pattern id="honeyW" patternUnits="userSpaceOnUse" width="24" height="24" viewBox="0 0 100 100">${cells(8, (c, r) => Math.abs(c - r) === 4 || c + r === 4 || c + r === 12 || (c === 4 && r === 4) || (c === 0 && r === 0))}</pattern>
    <pattern id="twillLine" patternUnits="userSpaceOnUse" width="8" height="8" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="50" fill="${INK}"/></pattern>
    <pattern id="twill13" href="#twillLine" patternTransform="rotate(-26.565)"/>
    <pattern id="twill22" href="#twillLine" patternTransform="rotate(-45)"/>
    <pattern id="twill31" href="#twillLine" patternTransform="rotate(-63.435)"/>
    <pattern id="satin5" patternUnits="userSpaceOnUse" width="16" height="16" viewBox="0 0 100 100">${cells(5, (c, r) => c === (r * 2) % 5, 1.5)}</pattern>
    <pattern id="satin5-24" href="#satin5" width="24" height="24"/>
    <pattern id="satin5-36" href="#satin5" width="36" height="36"/>
    <pattern id="satin5-wide" href="#satin5" width="36" height="18" preserveAspectRatio="none"/>`));
  const weaveSlots: Array<[number, number, string, string]> = [
    [0, 0, 'plainW', '平纹 16'], [1, 0, 'basketW', '方平 16'], [2, 0, 'honeyW', '蜂巢 24'],
    [0, 1, 'twill13', '斜纹 1/3 −26.6°'], [1, 1, 'twill22', '斜纹 2/2 −45°'], [2, 1, 'twill31', '斜纹 3/1 −63.4°'],
    [0, 2, 'satin5', '缎纹 tile 16'], [1, 2, 'satin5-24', 'href · 24'], [2, 2, 'satin5-36', 'href · 36'], [3, 2, 'satin5-wide', '36×18 pAR none'],
  ];
  for (const [c, r, id, caption] of weaveSlots) {
    const x = 88 + c * 70, y = 366 + r * 58;
    stage.append(el('rect', { x, y, width: 48, height: 40, fill: '#fbf8f0', stroke: INK, 'stroke-width': .5 }));
    stage.append(el('rect', { x, y, width: 48, height: 40, fill: `url(#${id})` }));
    stage.append(label(x, y + 51, caption));
  }
  stage.append(label(298, 380, '逐格 rect 画在'), label(298, 393, '100×100 点格纸上'));
  stage.append(label(298, 438, '#twillLine 一份排线'), label(298, 451, '只改 patternTransform'));

  // ─── D. treadling + card chain (`concept:animated-pattern` via animateTransform on patternTransform) ─
  for (let t = 0; t < TREAD.treadles; t++) {
    stage.append(el('text', { x: TREAD.x0 + t * TREAD.colW + 8, y: 378, 'text-anchor': 'middle', 'font-family': FONT_MONO, 'font-size': 11, fill: t < 4 ? INK : MADDER }, String(t + 1)));
    if (t >= 4) stage.append(el('rect', { x: TREAD.x0 + t * TREAD.colW, y: TREAD.y0, width: 16, height: TREAD.picks * TREAD.rowH, fill: MADDER, 'fill-opacity': .08 }));
  }
  stage.append(el('rect', { id: 'treadHi', x: TREAD.x0, y: TREAD.y0, width: 96, height: 12, fill: GOLD, 'fill-opacity': .45 }));
  for (let p = 0; p < TREAD.picks; p++) {
    stage.append(el('rect', { x: TREAD.x0 + treadleOf(p) * TREAD.colW + 2, y: TREAD.y0 + p * TREAD.rowH + 1.5, width: 12, height: 9, rx: 1.6, fill: INK }));
  }
  stage.append(el('rect', { id: 'treadHiCell', x: TREAD.x0 + 2, y: TREAD.y0 + 1.5, width: 12, height: 9, rx: 1.6, fill: MADDER }));
  stage.append(el('rect', { x: TREAD.x0, y: TREAD.y0, width: 96, height: TREAD.picks * TREAD.rowH, fill: 'none', stroke: INK, 'stroke-width': .6 }));
  stage.append(label(400, 538, '1-4 直踏 3/1 斜纹 · 纹版带 tile 高 24 = 两纬，t=0 对齐'));
  // Card chain: one 112×24 card (rx=6 → circular corners) holds two hole rows (one per pick) and its card number.
  // The animateTransform feeds the chain by exactly one tile per cycle, so t=0 aligns holes with pick rows.
  const holes = (y: number, punched: number[]) => [0, 1, 2, 3, 4, 5].map(t => `<circle cx="${14 + t * 12}" cy="${y}" r="3.2" ${punched.includes(t) ? `fill="${INK}"` : `fill="none" stroke="${INK}" stroke-width=".6" stroke-opacity=".55"`}/>`).join('');
  defs.append(fragment(`
    <pattern id="cardChain" patternUnits="userSpaceOnUse" width="112" height="24">
      <rect x="1" y="1" width="110" height="22" rx="6" fill="#e6dcc4" stroke="${INK}" stroke-width=".6"/>
      ${holes(6, [0])}${holes(18, [1])}
      <text x="106" y="16" text-anchor="end" font-family="${FONT_MONO}" font-size="11" fill="${MADDER}">№4</text>
      <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -24" dur="2.4s" repeatCount="indefinite"/>
    </pattern>`));
  stage.append(el('rect', { x: 560, y: 352, width: 112, height: 180, rx: 8, fill: INK }));
  stage.append(el('rect', { x: 560, y: 352, width: 112, height: 180, rx: 8, fill: 'url(#cardChain)' }));
  stage.append(el('rect', { x: 560, y: 352, width: 112, height: 180, rx: 8, fill: 'none', stroke: GOLD, 'stroke-width': 1 }));
  // gold check line proving grid continuity across panels A and C
  stage.append(el('line', { x1: 200, x2: 200, y1: 124, y2: 540, stroke: GOLD, 'stroke-width': 1.5 }));
  stage.append(label(206, 336, '金线 x=200：userSpaceOnUse 使 A/C 格线逐列对齐', { fill: '#8a6a1e' }));
  // the scrap card: rx=6 ry=2 → elliptical corners (`at:rect.ry`), unlike every other rounded rect here
  stage.append(el('rect', { x: 56, y: 563, width: 128, height: 19, rx: 6, ry: 2, fill: '#e6dcc4', stroke: INK, 'stroke-width': .6 }));
  stage.append(el('text', { x: 64, y: 576, 'font-family': FONT_CJK, 'font-size': 11, fill: MADDER }, '废版 · rx=6 ry=2 椭圆角'));
  stage.append(label(200, 576, '其余纹版卡只写 rx=6，ry 默认取 rx 得圆角', { fill: PAPER }));

  // ═══════════════════════════════ 2. full-scale swatch: two nesting levels ═══════════════════════
  // `concept:pattern-with-image`: 48×48 tile carrying the 128×128 linen scan (data URI PNG).
  // `concept:nested-pattern` + `concept:checkerboard-pattern`: #satinBlock's two checker cells are themselves
  // filled with #floatFine / #floatFineB (href twin rotated 90°) — 96-unit blocks and 6-unit float lines at once.
  defs.append(fragment(`
    <pattern id="linenScan" patternUnits="userSpaceOnUse" width="48" height="48">
      <image href="${assets.linen}" x="0" y="0" width="48" height="48" decoding="sync"/>
    </pattern>
    <pattern id="floatFine" patternUnits="userSpaceOnUse" width="6" height="6">
      <rect x="0" y="0" width="6" height="2" fill="${PAPER}" fill-opacity=".55"/>
    </pattern>
    <pattern id="floatFineB" href="#floatFine" patternTransform="rotate(90)"/>
    <pattern id="satinBlock" patternUnits="userSpaceOnUse" width="96" height="96">
      <rect x="0" y="0" width="48" height="48" fill="${INK}" fill-opacity=".82"/><rect x="0" y="0" width="48" height="48" fill="url(#floatFine)"/>
      <rect x="48" y="48" width="48" height="48" fill="${INK}" fill-opacity=".82"/><rect x="48" y="48" width="48" height="48" fill="url(#floatFine)"/>
      <rect x="48" y="0" width="48" height="48" fill="#3f679e" fill-opacity=".72"/><rect x="48" y="0" width="48" height="48" fill="url(#floatFineB)"/>
      <rect x="0" y="48" width="48" height="48" fill="#3f679e" fill-opacity=".72"/><rect x="0" y="48" width="48" height="48" fill="url(#floatFineB)"/>
    </pattern>
    <pattern id="weftGrid" patternUnits="userSpaceOnUse" width="6" height="6">
      <path d="M0 .25H6M.25 0V6" stroke="${PAPER}" stroke-width=".5" stroke-opacity=".28" fill="none"/>
    </pattern>`));
  stage.append(el('text', { x: SWATCH.x, y: 80, 'font-family': FONT_CJK, 'font-size': 12, fill: PAPER }, '足尺放大样 · 60 经 × 60 纬 · 1 格 = 6 单位 · 移动指针读取经纬'));
  const swatchRect = { x: SWATCH.x, y: SWATCH.y, width: SWATCH.w, height: SWATCH.h, rx: 10 };
  stage.append(el('rect', { ...swatchRect, fill: 'url(#linenScan)' }));
  stage.append(el('rect', { ...swatchRect, fill: 'url(#satinBlock)' }));
  stage.append(el('rect', { ...swatchRect, fill: 'url(#weftGrid)' }));
  const warpBand = el('rect', { id: 'warpBand', x: SWATCH.x, y: SWATCH.y, width: 6, height: SWATCH.h, fill: MADDER, 'fill-opacity': .55 });
  const weftBand = el('rect', { id: 'weftBand', x: SWATCH.x, y: SWATCH.y, width: SWATCH.w, height: 6, fill: MADDER, 'fill-opacity': .55 });
  const hitDot = el('rect', { id: 'hitDot', x: SWATCH.x, y: SWATCH.y, width: 6, height: 6, fill: GOLD });
  stage.append(warpBand, weftBand, hitDot);
  stage.append(el('rect', { ...swatchRect, fill: 'none', stroke: GOLD, 'stroke-width': 1 }));
  const swatchHit = el('rect', { ...swatchRect, fill: 'transparent', style: 'cursor: crosshair' });
  stage.append(swatchHit);

  // ═══════════════════════════════ 3. width-deformation rack ═══════════════════════════════════════
  // `av:pattern.patternContentUnits=objectBoundingBox` + `concept:objectboundingbox-unit-skew`: the motif is
  // authored in bbox fractions; on wider rects the same circle stretches into a flatter ellipse. No viewBox on
  // purpose — a viewBox would override patternContentUnits. #motifUser reuses the artwork through <use> with a
  // uniform scale(96) and userSpaceOnUse units (`av:pattern.patternContentUnits=userSpaceOnUse`) → stays round.
  defs.append(fragment(`
    <g id="motifArt">
      <ellipse cx=".125" cy=".12" rx=".03" ry=".07" fill="${MADDER}" fill-opacity=".8"/>
      <ellipse cx=".125" cy=".38" rx=".03" ry=".07" fill="${MADDER}" fill-opacity=".8"/>
      <ellipse cx=".04" cy=".25" rx=".03" ry=".07" fill="${MADDER}" fill-opacity=".8"/>
      <ellipse cx=".21" cy=".25" rx=".03" ry=".07" fill="${MADDER}" fill-opacity=".8"/>
      <circle cx=".125" cy=".25" r=".1" fill="${GOLD}" stroke="${INK}" stroke-width=".01"/>
    </g>
    <pattern id="motifBB" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width=".25" height=".5">
      <use href="#motifArt"/>
    </pattern>
    <pattern id="motifUser" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse" width="24" height="48">
      <use href="#motifArt" transform="scale(96)"/>
    </pattern>`));
  stage.append(el('text', { x: 736, y: 454, 'font-family': FONT_CJK, 'font-size': 11, fill: PAPER }, '幅宽变形架 · patternUnits + patternContentUnits = objectBoundingBox（刻意不写 viewBox）'));
  const rack: Array<[number, number, string]> = [[460, 96, '90 cm'], [494, 168, '150 cm'], [528, 240, '220 cm']];
  for (const [y, w, cm] of rack) {
    // fill-only carrier (bbox excludes strokes); the frame is a separate rect so tile size never depends on stroke
    stage.append(el('rect', { x: 736, y, width: w, height: 28, fill: PAPER }));
    stage.append(el('rect', { x: 736, y, width: w, height: 28, fill: 'url(#motifBB)' }));
    stage.append(el('rect', { x: 736, y, width: w, height: 28, fill: 'none', stroke: INK, 'stroke-width': .8 }));
    stage.append(pill(740, y + 5, cm, { fill: INK, mono: true }));
  }
  stage.append(el('rect', { x: 1000, y: 460, width: 96, height: 96, fill: PAPER }));
  stage.append(el('rect', { x: 1000, y: 460, width: 96, height: 96, fill: 'url(#motifUser)' }));
  stage.append(el('rect', { x: 1000, y: 460, width: 96, height: 96, fill: 'none', stroke: GOLD, 'stroke-width': .8 }));
  stage.append(el('text', { x: 1000, y: 580, 'font-family': FONT_CJK, 'font-size': 11, fill: PAPER }, 'userSpaceOnUse 对照：正圆'));
  stage.append(el('text', { x: 736, y: 568, 'font-family': FONT_CJK, 'font-size': 11, fill: GOLD }, '同一 <use> 花样：幅宽 96/168/240 把圆拉成横椭圆'));
  stage.append(el('text', { x: 736, y: 581, 'font-family': FONT_CJK, 'font-size': 11, fill: GOLD }, '陷阱：一写 viewBox 即顶掉 patternContentUnits'));

  // ═══════════════════════════════ 4. yarn roll + image column ═════════════════════════════════════
  // `el:image`, `at:image.href`, `concept:image-data-uri`, `pr:image-rendering`, `at:image.preserveAspectRatio`.
  defs.append(fragment(`
    <pattern id="yarnRoll" patternUnits="userSpaceOnUse" width="64" height="96" patternTransform="rotate(-12) scale(1 .9)">
      <image href="${assets.yarn}" x="0" y="0" width="64" height="96" preserveAspectRatio="xMidYMin slice" decoding="sync"/>
    </pattern>`));
  stage.append(el('rect', { x: 1112, y: 88, width: 96, height: 260, rx: 26, fill: INK }));
  stage.append(el('rect', { x: 1112, y: 88, width: 96, height: 260, rx: 26, fill: 'url(#yarnRoll)' }));
  stage.append(el('rect', { x: 1112, y: 88, width: 96, height: 260, rx: 26, fill: 'none', stroke: GOLD, 'stroke-width': 1 }));
  stage.append(pill(1118, 322, '#yarnRoll 64×96', { mono: true }));
  const imgFrame = (x: number, y: number, w: number, h: number) => el('rect', { x: x - 1, y: y - 1, width: w + 2, height: h + 2, fill: 'none', stroke: GOLD, 'stroke-width': .8 });
  const cap = (x: number, y: number, content: string) => el('text', { x, y, 'font-family': FONT_MONO, 'font-size': 11, fill: PAPER }, content);
  // (a) href vs xlink:href — identical output (`concept:xlink-href-legacy`)
  stage.append(el('image', { href: assets.swatch, x: 1224, y: 92, width: 56, height: 56, decoding: 'sync' }), imgFrame(1224, 92, 56, 56), cap(1224, 159, 'href'));
  stage.append(el('image', { 'xlink:href': assets.swatch, x: 1288, y: 92, width: 56, height: 56, decoding: 'sync' }), imgFrame(1288, 92, 56, 56), cap(1288, 159, 'xlink:href'));
  // (b) nested SVG document (vector, crisp when scaled) vs a 24×24 PNG of the same ticket (blurs)
  stage.append(el('image', { href: assets.ticketSvg, x: 1224, y: 164, width: 56, height: 56, decoding: 'sync' }), imgFrame(1224, 164, 56, 56), cap(1224, 231, 'svg 矢量'));
  stage.append(el('image', { href: assets.ticketPng, x: 1288, y: 164, width: 56, height: 56, decoding: 'sync' }), imgFrame(1288, 164, 56, 56), cap(1288, 231, 'png 24px'));
  // (c) 3×3 sprite scaled 20×: image-rendering auto vs pixelated (`pv:image-rendering=pixelated`)
  stage.append(el('image', { id: 'spriteAuto', href: assets.sprite, x: 1222, y: 236, width: 60, height: 60, 'image-rendering': 'auto', decoding: 'sync' }), imgFrame(1222, 236, 60, 60), cap(1222, 308, 'auto'));
  stage.append(el('image', { id: 'spritePixel', href: assets.sprite, x: 1284, y: 236, width: 60, height: 60, 'image-rendering': 'pixelated', decoding: 'sync' }), imgFrame(1284, 236, 60, 60), cap(1284, 308, 'pixelated'));
  stage.append(cap(1224, 322, '3×3 纹版孔精灵 ×20'));
  // preserveAspectRatio: meet alignment left / centre / right, then `none` (`av:image.preserveAspectRatio=none`)
  const pars = ['xMinYMid meet', 'xMidYMid meet', 'xMaxYMid meet', 'none'];
  pars.forEach((par, i) => {
    const y = 356 + i * 46;
    stage.append(el('rect', { x: 1128, y, width: 200, height: 40, fill: INK, 'fill-opacity': .5 }));
    stage.append(el('image', { href: assets.swatch, x: 1128, y, width: 200, height: 40, preserveAspectRatio: par, decoding: 'sync' }));
    stage.append(el('rect', { x: 1128, y, width: 200, height: 40, fill: 'none', stroke: GOLD, 'stroke-width': .8 }));
    stage.append(pill(1131, y + 21, par, { mono: true, size: 11 }));
  });
  stage.append(cap(1128, 552, '同一 96×96 纱样 · 200×40 框'), cap(1128, 566, 'meet 留白左/中/右移，none 拉伸'));

  // ═══════════════════════════════ 5. seam inspection rule ═════════════════════════════════════════
  // `at:pattern.x`: the tick pattern's x is rewritten on pointer move so the long tick sits on the current end.
  defs.append(fragment(`
    <pattern id="ruleTick" patternUnits="userSpaceOnUse" x="0" y="0" width="64" height="40">
      <path d="M12 28V36M20 28V36M28 28V36M36 28V36M44 28V36M52 28V36M60 28V36" stroke="${INK}" stroke-width="1" fill="none"/>
      <path d="M4 14V36" stroke="${MADDER}" stroke-width="1.5" fill="none"/>
    </pattern>`));
  const ruleTick = defs.querySelector<SVGPatternElement>('#ruleTick')!;
  stage.append(el('rect', { x: 56, y: 584, width: 1288, height: 40, rx: 6, fill: PAPER }));
  stage.append(el('rect', { x: 56, y: 584, width: 1288, height: 40, rx: 6, fill: 'url(#ruleTick)' }));
  stage.append(pill(62, 588, '接缝检验尺 · 1 格 = 1 经纱 · 每 8 格一根长刻度 · #ruleTick x 相位跟随指针 · 三条车道平铺同一枚 #weaveCell →', { fill: PAPER, color: INK }));
  // the master artwork, once, and a visible legend copy of it on the rule
  defs.append(fragment(`<g id="weaveCell">${weaveCellMarkup()}</g>`));
  stage.append(el('rect', { x: 984, y: 586, width: 44, height: 36, rx: 6, fill: '#f7f2e6', stroke: GOLD, 'stroke-width': .8 }));
  stage.append(el('use', { href: '#weaveCell', transform: 'translate(988 586)' }));
  // readout bar (rx=12)
  stage.append(el('rect', { x: 1036, y: 588, width: 300, height: 32, rx: 12, fill: INK }));
  const readout = el('text', { id: 'readout', x: 1186, y: 609, 'text-anchor': 'middle', 'font-family': FONT_CJK, 'font-size': 13, fill: PAPER }, '');
  stage.append(readout);

  // ─── the three lanes ───────────────────────────────────────────────────────────────────────────
  // Lane 1 `#laneUser`: userSpaceOnUse, fractional 17.3 tile through viewBox 0 0 36 36 (`concept:pattern-seams`,
  // `concept:pattern-with-use`). Its fix `#laneFixed`: integer 18 tile, overflow="visible" with the artwork bleeding
  // one unit, and the carrier rect uses shape-rendering="crispEdges" (`concept:pattern-overflow-visible`).
  // Lane 2 `#laneBB`: only href + objectBoundingBox tile fractions + preserveAspectRatio none — artwork and
  // viewBox are inherited (`av:pattern.patternUnits=objectBoundingBox`, `at:pattern.preserveAspectRatio`).
  defs.append(fragment(`
    <pattern id="laneUser" patternUnits="userSpaceOnUse" width="17.3" height="17.3" viewBox="0 0 36 36"><use href="#weaveCell"/></pattern>
    <pattern id="laneFixed" patternUnits="userSpaceOnUse" width="18" height="18" viewBox="0 0 36 36" overflow="visible">
      <rect x="-1" y="-1" width="38" height="38" fill="${WEFT}"/><use href="#weaveCell"/>
    </pattern>
    <pattern id="laneBB" href="#laneUser" patternUnits="objectBoundingBox" width=".0485" height=".0909" preserveAspectRatio="none"/>`));
  // Lane 3 filter: everything in userSpaceOnUse with explicit subregions. feImage(#weaveCell) 36×36 is the tile
  // that feTile repeats over the lane (`av:feImage.href=#element`, `el:feTile`, `concept:fetile-subregion-pattern`).
  // Two 45×45 fractalNoise squares are tiled over the correction strip halves: noStitch vs stitch
  // (`at:feTurbulence.stitchTiles`, `av:feTurbulence.stitchTiles=noStitch`).
  const L3 = LANES[2];
  defs.append(fragment(`
    <filter id="laneTile" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="${L3.x}" y="${L3.y}" width="${L3.w}" height="${LANE_STRIP_Y + LANE_STRIP_H - L3.y}" color-interpolation-filters="sRGB">
      <feImage id="laneCell" href="${isGecko ? assets.cell : '#weaveCell'}" x="${L3.x}" y="${L3.y}" width="${CELL}" height="${CELL}" result="cell"/>
      <feTile in="cell" x="${L3.x}" y="${L3.y}" width="${L3.w}" height="${L3.h}" result="tiled"/>
      <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7" x="${L3.x}" y="${L3.y}" width="${L3.w}" height="${L3.h}" result="fuzzNoise"/>
      <feColorMatrix in="fuzzNoise" type="matrix" values="0 0 0 0 .95  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .18 0" result="fuzz"/>
      <feBlend in="fuzz" in2="tiled" mode="soft-light" x="${L3.x}" y="${L3.y}" width="${L3.w}" height="${L3.h}" result="lane"/>
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" stitchTiles="noStitch" x="${L3.x}" y="${LANE_STRIP_Y}" width="45" height="45" result="nzA"/>
      <feTile in="nzA" x="${L3.x}" y="${LANE_STRIP_Y}" width="206" height="${LANE_STRIP_H}" result="tileA"/>
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" stitchTiles="stitch" x="${L3.x + 206}" y="${LANE_STRIP_Y}" width="45" height="45" result="nzB"/>
      <feTile in="nzB" x="${L3.x + 206}" y="${LANE_STRIP_Y}" width="206" height="${LANE_STRIP_H}" result="tileB"/>
      <feMerge x="${L3.x}" y="${LANE_STRIP_Y}" width="${L3.w}" height="${LANE_STRIP_H}" result="noise"><feMergeNode in="tileA"/><feMergeNode in="tileB"/></feMerge>
      <feColorMatrix in="noise" type="matrix" values="1.1 0 0 0 .1  0 .9 0 0 .05  0 0 .7 0 -.05  0 0 0 1.6 0" result="fibre"/>
      <feFlood flood-color="${WEFT}" x="${L3.x}" y="${LANE_STRIP_Y}" width="${L3.w}" height="${LANE_STRIP_H}" result="stripBase"/>
      <feComposite in="fibre" in2="stripBase" operator="over" x="${L3.x}" y="${LANE_STRIP_Y}" width="${L3.w}" height="${LANE_STRIP_H}" result="strip"/>
      <feMerge><feMergeNode in="lane"/><feMergeNode in="strip"/></feMerge>
    </filter>`));

  const laneCaptions = ['车道 1 · #laneUser userSpaceOnUse 17.3 分数 tile · viewBox 0 0 36 36', '车道 2 · #laneBB href=#laneUser · objectBoundingBox .0485×.0909 · pAR none', `车道 3 · filter feImage(#weaveCell) 36×36 → feTile${isGecko ? ' · Gecko 回退：data URI 元件' : ''}`];
  LANES.forEach((lane, i) => {
    stage.append(el('rect', { x: lane.x, y: lane.y, width: lane.w, height: lane.h, fill: PAPER })); // light base → seams read as light gaps
    stage.append(el('rect', { x: lane.x, y: LANE_STRIP_Y, width: lane.w, height: LANE_STRIP_H, fill: PAPER }));
    if (i === 0) {
      stage.append(el('rect', { id: 'lane1Fill', x: lane.x, y: lane.y, width: lane.w, height: lane.h, fill: 'url(#laneUser)' }));
      stage.append(el('rect', { x: lane.x, y: LANE_STRIP_Y, width: lane.w, height: LANE_STRIP_H, fill: 'url(#laneFixed)', 'shape-rendering': 'crispEdges' }));
    } else if (i === 1) {
      stage.append(el('rect', { id: 'lane2Fill', x: lane.x, y: lane.y, width: lane.w, height: lane.h, fill: 'url(#laneBB)' })); // fill-only: bbox excludes strokes
      stage.append(el('rect', { x: lane.x, y: LANE_STRIP_Y, width: lane.w, height: LANE_STRIP_H, fill: 'url(#laneBB)' })); // same pattern, 412×40 bbox → tile 20×3.6
    } else {
      stage.append(el('rect', { id: 'lane3Fill', x: lane.x, y: lane.y, width: lane.w, height: LANE_STRIP_Y + LANE_STRIP_H - lane.y, fill: WEFT, filter: 'url(#laneTile)' }));
    }
    stage.append(el('rect', { x: lane.x, y: lane.y, width: lane.w, height: lane.h, fill: 'none', stroke: GOLD, 'stroke-width': 1 }));
    stage.append(el('rect', { x: lane.x, y: LANE_STRIP_Y, width: lane.w, height: LANE_STRIP_H, fill: 'none', stroke: GOLD, 'stroke-width': 1 }));
    // crosshair: the selected end/pick is moved under it in every lane
    stage.append(el('g', { stroke: MADDER, 'stroke-width': 1.5, fill: 'none' },
      el('line', { x1: lane.cx - 26, x2: lane.cx + 26, y1: lane.cy, y2: lane.cy }), el('line', { x1: lane.cx, x2: lane.cx, y1: lane.cy - 26, y2: lane.cy + 26 }),
      el('circle', { cx: lane.cx, cy: lane.cy, r: 9 })));
    stage.append(pill(lane.x + 8, lane.y + 8, laneCaptions[i]));
    stage.append(el('text', { x: lane.x, y: 868, 'font-family': FONT_CJK, 'font-size': 11, fill: PAPER }, [
      '分数 tile → 规则浅色接缝网格；修正条：整数 tile 18 + crispEdges，无缝',
      '继承画稿与 viewBox，只换单位：412×180 → tile 20×16.4，斜纹角改变',
      'feTile 与源元件逐像素同源无缝；45×45 噪声：左 noStitch 断纹，右 stitch 连续',
    ][i]));
  });
  stage.append(pill(LANES[0].x + 8, LANE_STRIP_Y + 11, '修正条 · #laneFixed 18 + crispEdges', { fill: PAPER, color: INK }));
  stage.append(pill(LANES[1].x + 8, LANE_STRIP_Y + 11, '同 #laneBB · 412×40 包围盒', { fill: PAPER, color: INK }));
  stage.append(pill(LANES[2].x + 8, LANE_STRIP_Y + 11, 'stitchTiles="noStitch"', { mono: true }));
  stage.append(pill(LANES[2].x + 214, LANE_STRIP_Y + 11, 'stitchTiles="stitch"', { mono: true }));

  // ═══════════════════════════════ 6. pointer hook ═════════════════════════════════════════════════
  // `api:SVGPatternElement.patternTransform`: lanes 1/2 are phase-shifted via patternTransform.baseVal; lane 3
  // moves the feImage subregion (x/y) — three tiling methods reporting on the same yarn.
  const laneUser = defs.querySelector<SVGPatternElement>('#laneUser')!;
  const laneBB = defs.querySelector<SVGPatternElement>('#laneBB')!;
  const laneCell = defs.querySelector<SVGFEImageElement>('#laneCell')!;
  const threadHi = stage.querySelector('#threadHi')!, threadHiCell = stage.querySelector('#threadHiCell')!;
  const treadHi = stage.querySelector('#treadHi')!, treadHiCell = stage.querySelector('#treadHiCell')!;
  const setTranslate = (pattern: SVGPatternElement, tx: number, ty: number) => {
    const t = stage.createSVGTransform();
    t.setTranslate(tx, ty);
    pattern.patternTransform.baseVal.initialize(t);
  };
  const select = (end: number, pick: number) => {
    const e = Math.max(0, Math.min(59, end)), p = Math.max(0, Math.min(59, pick));
    const warpUp = (e + p) % 4 !== 0;
    readout.textContent = `经 #${e + 1} · 纬 #${p + 1} · 3/1 斜纹右斜面 · ${warpUp ? '经浮' : '纬浮点'}`;
    setAttrs(warpBand, { x: SWATCH.x + e * SWATCH.cell });
    setAttrs(weftBand, { y: SWATCH.y + p * SWATCH.cell });
    setAttrs(hitDot, { x: SWATCH.x + e * SWATCH.cell, y: SWATCH.y + p * SWATCH.cell });
    const col = e % THREAD.cols, row = p % TREAD.picks;
    setAttrs(threadHi, { x: THREAD.x0 + col * THREAD.colW });
    setAttrs(threadHiCell, { x: THREAD.x0 + col * THREAD.colW, y: THREAD.y0 + (7 - shaftOf(col)) * THREAD.rowH });
    setAttrs(treadHi, { y: TREAD.y0 + row * TREAD.rowH });
    setAttrs(treadHiCell, { x: TREAD.x0 + treadleOf(row) * TREAD.colW + 2, y: TREAD.y0 + row * TREAD.rowH + 1.5 });
    ruleTick.setAttribute('x', String((56 + e * 8) % 64)); // long tick onto the current end
    // lane 1: tile grid origin is user-space (0,0); one end = 17.3/4 units
    const u = 17.3 / 4;
    setTranslate(laneUser, LANES[0].cx - (e + .5) * u, LANES[0].cy - (p + .5) * u);
    // lane 2: tile grid origin is the bbox corner; one end = 19.98/4, one pick = 16.36/4
    setTranslate(laneBB, LANES[1].cx - (LANES[1].x + (e + .5) * LANE_BB.w / 4), LANES[1].cy - (LANES[1].y + (p + .5) * LANE_BB.h / 4));
    // lane 3: move the feImage subregion; feTile repeats from wherever the cell sits. The anchor is wrapped
    // modulo one repeat so the 36×36 subregion stays inside the filter region (outside it would be clipped away).
    const wrap = (v: number, origin: number) => origin + ((((v - origin) % CELL) + CELL) % CELL);
    setAttrs(laneCell, { x: wrap(LANES[2].cx - (e + .5) * 9, LANES[2].x), y: wrap(LANES[2].cy - (p + .5) * 9, LANES[2].y) });
  };
  swatchHit.addEventListener('pointermove', event => {
    const box = swatchHit.getBoundingClientRect();
    const end = Math.floor((event.clientX - box.left) / box.width * (SWATCH.w / SWATCH.cell));
    const pick = Math.floor((event.clientY - box.top) / box.height * (SWATCH.h / SWATCH.cell));
    select(end, pick);
  });
  select(Math.floor((946 - SWATCH.x) / SWATCH.cell), Math.floor((214 - SWATCH.y) / SWATCH.cell)); // default point (946,214) → 经 #37 · 纬 #22

  // ─── declared features (behaviour that the DOM scan cannot derive) ─────────────────────────────
  mark(stage, 'concept:pattern-with-text', 'concept:pattern-with-image', 'concept:nested-pattern', 'concept:checkerboard-pattern',
    'concept:hatching-pattern', 'concept:cross-hatch-layering', 'concept:pattern-with-use', 'concept:pattern-seams', 'concept:pattern-overflow-visible',
    'concept:animated-pattern', 'concept:objectboundingbox-unit-skew', 'concept:image-data-uri', 'concept:image-nested-svg-document',
    'concept:xlink-href-legacy', 'concept:fetile-subregion-pattern', 'api:SVGPatternElement.patternTransform');
  if (!isGecko) mark(stage, 'av:feImage.href=#element');

  // ─── readiness: fonts + every <image> decoded (`api:SVGImageElement.decode`) + one frame ───────────
  const images = [...stage.querySelectorAll('image')] as Array<SVGImageElement & { decode?: () => Promise<void> }>;
  if (images.length && typeof images[0].decode === 'function') {
    await Promise.all(images.map(img => img.decode!().catch(() => undefined)));
    mark(stage, 'api:SVGImageElement.decode');
  }
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  // SMIL fallback: if animateTransform is unsupported, drive the chain by rAF (skipped in export for a fixed frame)
  const smil = typeof SVGAnimateTransformElement !== 'undefined' && 'beginElement' in SVGAnimateTransformElement.prototype;
  const cardChain = defs.querySelector<SVGPatternElement>('#cardChain')!;
  if (isExport()) freezeAt(stage, 0); // still frame: holes aligned with pick rows
  else if (!smil) {
    let t0: number | undefined;
    const step = (now: number) => { t0 ??= now; setTranslate(cardChain, 0, -(((now - t0) / 2400) % 1) * 24); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  window.__sceneReady = true;
}
