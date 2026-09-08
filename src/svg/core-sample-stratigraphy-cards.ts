// core-sample-stratigraphy — the two instrument cards standing in the middle of the bench:
// P3 取心窗标定卡 (clipPath: units, transform, clip-rule, use, group vs children, traps) and
// P4 遮罩解释带 (mask: luminance vs alpha, feathering, luminanceToAlpha, regions, units, SMIL).
import { el, fragment } from './lib';
import { type Ctx, type Litho, ACCENT, CYAN, INK, MUTED, RED, LITHO, chip, texture, label, panel, ghost, yOf } from './core-sample-stratigraphy-data';

const f = (n: number): string => n.toFixed(2).replace(/\.?0+$/, '');

/** Self-intersecting pentagram path (for clip-rule nonzero vs evenodd). */
function pentagram(cx: number, cy: number, R: number): string {
  const pts = Array.from({ length: 5 }, (_, k) => { const a = -Math.PI / 2 + k * 4 * Math.PI / 5; return `${f(cx + R * Math.cos(a))} ${f(cy + R * Math.sin(a))}`; });
  return `M${pts.join('L')}Z`;
}

// ───────────────────────────────────────────── P3 · clip calibration card (x 422–716)
export function buildClipCard(c: Ctx): SVGGElement {
  const { defs, rand, photo } = c;
  const g = panel(422, 118, 294, 510, '取心窗标定卡 · clipPath');
  const note = (x: number, y: number, s: string, fill = MUTED) => g.append(label(x, y, s, { fill }));
  const leader = (rowY: number, depth: number) => {
    const yd = yOf(depth);
    g.append(el('path', { d: `M422 ${rowY}C414 ${rowY} 416 ${f(yd)} 408 ${f(yd)}`, fill: 'none', stroke: CYAN, 'stroke-width': .9, opacity: .75, 'pointer-events': 'none' }));
    g.append(el('circle', { cx: 408, cy: yd, r: 2.2, fill: CYAN }));
    g.append(label(706, rowY - 2, `→ ${depth} m`, { size: 11, anchor: 'end', fill: CYAN, mono: true }));
  };

  // Row 1 — at:clipPath.clipPathUnits / av:clipPath.clipPathUnits=userSpaceOnUse: one fixed canvas window on
  // a 120×54 and a 40×54 chip; the small chip barely overlaps the window and is almost entirely clipped away.
  const cpUsou = el('clipPath', { id: 'cp-usou', clipPathUnits: 'userSpaceOnUse' }, el('rect', { x: 444, y: 160, width: 116, height: 46, rx: 6 }));
  defs.append(cpUsou);
  g.append(chip(rand, 434, 156, 120, 54, { 'clip-path': 'url(#cp-usou)' }));
  g.append(chip(rand, 548, 156, 40, 54, { 'clip-path': 'url(#cp-usou)' }));
  g.append(ghost(548, 156, 40, 54));
  g.append(el('rect', { x: 444, y: 160, width: 116, height: 46, rx: 6, fill: 'none', stroke: ACCENT, 'stroke-width': .9, 'stroke-dasharray': '4 3', 'pointer-events': 'none' }));
  note(600, 172, '窗口 116×46 固定在', INK); note(600, 186, '画布坐标（uSOU）', INK); note(600, 202, '40×54 片几乎切光');
  note(434, 222, '行1 clipPathUnits=userSpaceOnUse（默认）· 同一窗口 · 120×54 vs 40×54');
  leader(186, 12);

  // Row 2 — av:clipPath.clipPathUnits=objectBoundingBox: a 0..1 circle scales to each target → proportional
  // elliptical windows on three different sizes. api:SVGClipPathElement.clipPathUnits reads the enum back (1 / 2).
  const cpObb = el('clipPath', { id: 'cp-obb', clipPathUnits: 'objectBoundingBox' }, el('circle', { cx: .5, cy: .5, r: .5 }));
  defs.append(cpObb);
  g.append(chip(rand, 434, 238, 120, 54, { 'clip-path': 'url(#cp-obb)' }));
  g.append(chip(rand, 566, 245, 72, 40, { 'clip-path': 'url(#cp-obb)' }));
  g.append(chip(rand, 650, 252, 44, 26, { 'clip-path': 'url(#cp-obb)' }));
  const enumUsou = cpUsou.clipPathUnits.baseVal, enumObb = cpObb.clipPathUnits.baseVal;
  note(434, 300, `行2 objectBoundingBox 0..1 圆 → 三种尺寸各得等比椭圆窗 · clipPathUnits.baseVal = ${enumUsou} / ${enumObb}`);
  leader(268, 26);

  // Row 3 — concept:objectboundingbox-zero-bbox-trap: a zero-height contact line + oBB clip vanishes (its bbox
  // has no height); adding 0.01 of height (and a tall unit window) brings it back.
  defs.append(el('clipPath', { id: 'cp-obb-line', clipPathUnits: 'objectBoundingBox' }, el('rect', { x: 0, y: 0, width: 1, height: 1 })));
  defs.append(el('clipPath', { id: 'cp-obb-fix', clipPathUnits: 'objectBoundingBox' }, el('rect', { x: 0, y: -150, width: 1, height: 300 })));
  g.append(el('line', { x1: 440, y1: 322, x2: 560, y2: 322, stroke: ACCENT, 'stroke-width': 3, 'clip-path': 'url(#cp-obb-line)' }));
  g.append(el('line', { x1: 440, y1: 322, x2: 560, y2: 322, stroke: MUTED, 'stroke-width': .8, 'stroke-dasharray': '2 4', opacity: .5, 'pointer-events': 'none' }));
  g.append(el('path', { d: 'M580 322h120v.01', stroke: ACCENT, 'stroke-width': 3, fill: 'none', 'clip-path': 'url(#cp-obb-fix)' }));
  note(434, 340, '行3 零 bbox 陷阱：0 高层界 + oBB 裁切 → 整条消失 ｜ 补 0.01 高度 → 可见');
  leader(322, 52);

  // Row 4 — at:clipPath.transform + concept:clip-follows-target-transform + concept:getbbox-ignores-clip:
  // identical 44 px square windows, the right <clipPath transform="rotate(45)"> turns into a diamond; both targets
  // sit in 12°-tilted layer groups so the windows rotate with the target user space. Dashed = getBBox() (unclipped).
  defs.append(el('clipPath', { id: 'cp-sq' }, el('rect', { x: 478, y: 426, width: 44, height: 44 })));
  defs.append(el('clipPath', { id: 'cp-sq-rot', transform: 'rotate(45 650 448)' }, el('rect', { x: 628, y: 426, width: 44, height: 44 })));
  note(434, 360, '行4 同一 44 px 方窗 · 右 clipPath transform=rotate(45) → 菱形');
  note(434, 374, '两目标各置 12° 倾角层组 → 裁切随目标坐标系旋转');
  note(434, 388, '虚线框 = getBBox()，忽略裁切，明显大于可见部分');
  const tiltL = el('g', { transform: 'rotate(12 500 448)' }), tiltR = el('g', { transform: 'rotate(12 650 448)' });
  const chipL = chip(rand, 440, 421, 120, 54, { 'clip-path': 'url(#cp-sq)' });
  const chipR = chip(rand, 590, 421, 120, 54, { id: 'p3-r4-diamond', 'clip-path': 'url(#cp-sq-rot)' });
  tiltL.append(chipL); tiltR.append(chipR);
  g.append(tiltL, tiltR);
  c.after.push(() => {
    for (const [tilt, ch] of [[tiltL, chipL], [tiltR, chipR]] as const) {
      const b = ch.getBBox();
      tilt.append(ghost(b.x, b.y, b.width, b.height, ACCENT));
      tilt.append(label(b.x + b.width - 2, b.y - 3, `getBBox ${f(b.width)}×${f(b.height)}`, { size: 11, anchor: 'end', fill: ACCENT, mono: true }));
    }
  });
  c.probes.push({ id: 'P3 行4 菱形窗', el: chipR, kind: 'clip' });
  leader(448, 40);

  // Row 5 — pr:clip-rule / pv:clip-rule=evenodd: pyrite twin star as clip; nonzero fills the whole star with
  // the core photo, evenodd punches out the centre. clip-rule only works on clipPath children.
  defs.append(el('clipPath', { id: 'cp-star-nz' }, el('path', { d: pentagram(464, 522, 24) })));
  defs.append(el('clipPath', { id: 'cp-star-eo' }, el('path', { d: pentagram(540, 522, 24), 'clip-rule': 'evenodd' })));
  g.append(el('image', { href: photo, x: 440, y: 498, width: 48, height: 48, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#cp-star-nz)' }));
  g.append(el('image', { href: photo, x: 516, y: 498, width: 48, height: 48, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#cp-star-eo)' }));
  note(590, 512, 'clip-rule 只作用于 clipPath', INK); note(590, 526, '子元素；直接写在图形上', INK); note(590, 540, '无效（此处两星均是子元素）');
  note(434, 556, '行5 clip-rule：黄铁矿双晶 · nonzero 整颗填满 ｜ evenodd 中心掏空');
  leader(524, 84);

  // Row 6 — concept:use-in-clippath (use→path works, use→g yields an empty clip) and
  // concept:clip-group-vs-children (one window on the group vs one window per fragment).
  defs.append(el('path', { id: 'glyph-nodule', d: 'M-22 0c0-12 10-18 22-18s22 6 22 18-8 16-22 16S-22 12-22 0z' }));
  defs.append(el('g', { id: 'legend-group' }, el('rect', { x: -30, y: -20, width: 60, height: 40 })));
  defs.append(el('clipPath', { id: 'cp-nodule' }, el('use', { href: '#glyph-nodule', x: 464, y: 588 })));
  defs.append(el('clipPath', { id: 'cp-use-g' }, el('use', { href: '#legend-group', x: 534, y: 588 })));
  defs.append(el('clipPath', { id: 'plug-window' }, el('circle', { cx: 604, cy: 588, r: 19 })));
  defs.append(el('clipPath', { id: 'cp-frag', clipPathUnits: 'objectBoundingBox' }, el('circle', { cx: .5, cy: .5, r: .5 })));
  g.append(texture(rand, 'limestone', 434, 566, 60, 44, 3, { 'clip-path': 'url(#cp-nodule)' }));
  g.append(chip(rand, 504, 566, 60, 44, { 'clip-path': 'url(#cp-use-g)' }));
  g.append(ghost(504, 566, 60, 44));
  g.append(label(534, 592, 'use→g 无效', { size: 11, anchor: 'middle', fill: RED }));
  const frags = (x0: number, each: boolean): SVGGElement => {
    const grp = el('g', each ? {} : { 'clip-path': 'url(#plug-window)' });
    const lith: Litho[] = ['sand', 'mud', 'limestone'];
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
      grp.append(el('rect', { x: x0 + k * 20 + 1, y: 566 + r * 22 + 1, width: 18, height: 20, fill: LITHO[lith[(r + k) % 3]].base, ...(each ? { 'clip-path': 'url(#cp-frag)' } : {}) }));
    }
    return grp;
  };
  g.append(frags(574, false), frags(644, true));
  note(434, 622, '行6 use→path ✓ ｜ use→g 空裁切 ｜ 整组开一窗 ｜ 逐块各开一窗');
  leader(588, 106);
  return g;
}

// ───────────────────────────────────────────── P4 · mask interpretation strip (x 730–1024)
export function buildMaskStrip(c: Ctx): SVGGElement {
  const { defs, rand, photo } = c;
  const g = panel(730, 118, 294, 510, '遮罩解释带 · mask');
  const COLS = [742, 832, 922], ROWS = [144, 210, 276, 342, 408, 474, 540], W = 78, H = 46;
  const seg = (col: number, row: number, attrs: Record<string, string | number> = {}) => el('use', { href: '#core-seg', x: COLS[col], y: ROWS[row], ...attrs });
  const cap = (col: number, row: number, s: string, id?: string, fill = MUTED) => { const t = label(COLS[col] + W / 2, ROWS[row] + H + 13, s, { anchor: 'middle', fill, id }); g.append(t); return t; };

  // Shared mask art (unit square): white→black gradient over the left half plus an opaque red spot on black.
  defs.append(fragment(`
    <linearGradient id="g-mask-wb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#000"/></linearGradient>
    <linearGradient id="g-fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <linearGradient id="g-feather" gradientUnits="userSpaceOnUse" x1="0" y1="149" x2="0" y2="167"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <radialGradient id="g-vig" cx=".5" cy=".5" r=".72"><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <g id="mask-art"><rect width="1" height="1" fill="url(#g-mask-wb)"/><ellipse cx=".72" cy=".5" rx=".2" ry=".2" fill="#e0533e"/></g>`));

  // Row A — pr:mask-type / pv:mask-type=luminance / pv:mask-type=alpha / concept:mask-luminance-colorspace:
  // the same content read two ways. The red spot passes ~0.21 (sRGB luminance) vs 1.0 (alpha); black hides vs shows.
  defs.append(fragment(`
    <mask id="m-lum" mask-type="luminance" maskContentUnits="objectBoundingBox"><use href="#mask-art"/></mask>
    <mask id="m-alpha" mask-type="alpha" maskContentUnits="objectBoundingBox"><use href="#mask-art"/></mask>`));
  g.append(seg(0, 0, { id: 'p4-lum', mask: 'url(#m-lum)' }), seg(1, 0, { id: 'p4-alpha', mask: 'url(#m-alpha)' }));
  c.refs.lum = cap(0, 0, 'luminance 红斑 α=…', 'lbl-lum', INK);
  c.refs.alpha = cap(1, 0, 'alpha 红斑 α=…', 'lbl-alpha', INK);
  // concept:gradient-feathered-mask: white→black linearGradient feathers the sand/mud contact within 18 px, a
  // radialGradient vignette (nested mask) rounds the edges, and the mask content itself carries feGaussianBlur.
  defs.append(fragment(`
    <mask id="m-vig" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#g-vig)"/></mask>
    <mask id="m-feather"><g mask="url(#m-vig)"><rect x="922" y="144" width="78" height="46" fill="url(#g-feather)" filter="url(#f-soft)"/></g></mask>`));
  g.append(seg(2, 0, { mask: 'url(#m-feather)' }));
  cap(2, 0, '羽化 18 px + 暗角 + 模糊');

  // Row B — av:feColorMatrix.type=luminanceToAlpha: the core photo becomes its own lithology mask (bright
  // limestone → opaque, dark mud → transparent). The output is black + alpha, so it only works with mask-type=alpha.
  const l2aMask = (id: string, col: number, type: 'alpha' | 'luminance', filter: string) =>
    defs.append(el('mask', { id, 'mask-type': type, maskUnits: 'userSpaceOnUse', x: COLS[col], y: ROWS[1], width: W, height: H },
      el('image', { href: photo, x: COLS[col], y: ROWS[1], width: W, height: H, preserveAspectRatio: 'xMidYMid slice', filter: `url(#${filter})` })));
  l2aMask('m-l2a-a', 0, 'alpha', 'f-l2a'); l2aMask('m-l2a-l', 1, 'luminance', 'f-l2a'); l2aMask('m-l2a-s', 2, 'alpha', 'f-l2a-srgb');
  g.append(seg(0, 1, { mask: 'url(#m-l2a-a)' }), seg(1, 1, { mask: 'url(#m-l2a-l)' }), seg(2, 1, { mask: 'url(#m-l2a-s)' }));
  g.append(ghost(COLS[1], ROWS[1], W, H));
  cap(0, 1, 'l2a 照片 · alpha ✓', undefined, INK); cap(1, 1, 'l2a · luminance 全黑', undefined, RED);
  c.refs.l2a = cap(2, 1, 'sRGB …', 'lbl-l2a');

  // Row C — concept:mask-on-group-vs-element + pr:mask (attribute form): three overlapping lithology bands
  // masked once as a group (continuous fade) vs each band masked with the same bbox-relative mask (seams).
  defs.append(fragment(`<mask id="m-fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#g-fade)"/></mask>`));
  const bands = (x0: number, each: boolean): SVGGElement => {
    const grp = el('g', each ? {} : { mask: 'url(#m-fade)' });
    const lith: Litho[] = ['sand', 'mud', 'limestone'];
    lith.forEach((l, i) => grp.append(texture(rand, l, x0 + i * 20, ROWS[2] + i * 9, 40, 28, 3, each ? { mask: 'url(#m-fade)' } : {})));
    return grp;
  };
  g.append(bands(COLS[0], false), bands(COLS[1] + 4, true));
  g.append(seg(2, 2, { mask: 'url(#m-fade)' }));
  cap(0, 2, '整组一张遮罩 · 连续'); cap(1, 2, '逐片同一遮罩 · 接缝'); cap(2, 2, 'mask="url(#m-fade)" 属性');

  // Row D — CSS form (.fade{mask:url(#m-fade)} inside @supports; label prints getComputedStyle().maskImage),
  // concept:invalid-mask-reference (style="mask:url(#nope)" renders unmasked) and
  // concept:mask-content-opacity | concept:nested-mask (both halves land at ≈0.50).
  const cssSeg = seg(0, 3, { class: 'fade', id: 'p4-css' });
  g.append(cssSeg);
  const cssLbl = cap(0, 3, 'CSS mask-image: …');
  c.after.push(() => { const mi = getComputedStyle(cssSeg).maskImage; cssLbl.textContent = mi && mi !== 'none' ? 'CSS mask-image: url(#m-fade)' : 'CSS mask-image: none'; });
  g.append(seg(1, 3, { style: 'mask:url(#nope)' }));
  cap(1, 3, 'mask:url(#nope) 依引擎', undefined, RED);
  defs.append(fragment(`
    <mask id="m-grey50" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="#808080"/></mask>
    <mask id="m-dual" maskContentUnits="objectBoundingBox"><rect x="0" y="0" width=".5" height="1" fill="#fff" fill-opacity=".5"/><rect x=".5" y="0" width=".5" height="1" fill="#fff" mask="url(#m-grey50)"/></mask>`));
  g.append(seg(2, 3, { mask: 'url(#m-dual)' }));
  cap(2, 3, 'fill-opacity .5 ｜ 嵌套遮罩');

  // Row E — mask regions. at:mask.x / at:mask.y: x=.25 (bbox units) leaves the left quarter invisible although the
  // content covers it (the hover probe at (756,414) lands here: invisible yet still hit).
  defs.append(fragment(`<mask id="m-x25" x=".25" y="0" width=".75" height="1" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="#fff"/></mask>`));
  const x25 = seg(0, 4, { id: 'p4-x25', mask: 'url(#m-x25)' });
  g.append(x25, ghost(COLS[0] + W * .25, ROWS[4], W * .75, H, ACCENT));
  c.probes.push({ id: 'P4 x=.25', el: x25, kind: 'mask', alphaAt: (cx) => { const r = x25.getBoundingClientRect(); return cx < r.left + r.width * .25 ? 0 : 1; } });
  cap(0, 4, 'mask x=.25 → 左 ¼ 不可见', undefined, INK);
  // at:mask.maskUnits / av:mask.maskUnits=userSpaceOnUse: same region in absolute coordinates — the short segment
  // lies entirely outside it and is wiped out.
  defs.append(el('mask', { id: 'm-usou', maskUnits: 'userSpaceOnUse', x: COLS[1], y: ROWS[4], width: W, height: 24 },
    el('rect', { x: COLS[1], y: ROWS[4], width: W, height: H, fill: '#fff' })));
  g.append(el('use', { href: '#core-seg', transform: `translate(${COLS[1]},${ROWS[4]}) scale(.46,1)`, mask: 'url(#m-usou)' }));
  g.append(el('use', { href: '#core-seg', transform: `translate(${COLS[1] + 42},${ROWS[4] + 26}) scale(.46,.43)`, mask: 'url(#m-usou)' }));
  g.append(ghost(COLS[1] + 42, ROWS[4] + 26, 36, 20), ghost(COLS[1], ROWS[4], W, 24, ACCENT));
  cap(1, 4, 'maskUnits=uSOU 矮段切光');
  // at:mask.width / at:mask.height: a glowing fault trace (filter halo) — the default −10%/120% region cuts the
  // halo, x/y=−50% width/height=200% keeps it.
  defs.append(fragment(`
    <mask id="m-halo-def" maskContentUnits="objectBoundingBox"><rect x="-1" y="-1" width="3" height="3" fill="#fff"/></mask>
    <mask id="m-halo-big" x="-50%" y="-50%" width="200%" height="200%" maskContentUnits="objectBoundingBox"><rect x="-1" y="-1" width="3" height="3" fill="#fff"/></mask>`));
  const trace = (col: number, row: number, mask: string) => {
    const x = COLS[col] + 7, y = ROWS[row] + 16;
    let d = '';
    for (let k = 4; k < 64; k += 6) d += `M${x + k} ${y + 1}l-3 12`;
    return el('g', { filter: 'url(#f-glow)', mask: `url(#${mask})` },
      el('rect', { x, y, width: 64, height: 14, fill: ACCENT }),
      el('path', { d, stroke: '#5a3a08', 'stroke-width': 1, fill: 'none' }));
  };
  g.append(trace(2, 4, 'm-halo-def'), trace(0, 5, 'm-halo-big'));
  cap(2, 4, '光晕 · 默认区域 -10%/120%'); cap(0, 5, '区域 -50% / 200% 保住光晕');

  // Row F — at:mask.maskContentUnits (default userSpaceOnUse: 24 px white circles open equal holes on a tall and
  // a short segment) vs av:mask.maskContentUnits=objectBoundingBox (0..1 circle scales with each bbox).
  const tallShort = (col: number, mask: string) => {
    g.append(el('use', { href: '#core-seg', transform: `translate(${COLS[col]},${ROWS[5]}) scale(.46,1)`, mask: `url(#${mask})` }));
    g.append(el('use', { href: '#core-seg', transform: `translate(${COLS[col] + 42},${ROWS[5] + 12}) scale(.46,.52)`, mask: `url(#${mask})` }));
    g.append(ghost(COLS[col], ROWS[5], 36, H), ghost(COLS[col] + 42, ROWS[5] + 12, 36, 24));
  };
  defs.append(el('mask', { id: 'm-hole-us', maskContentUnits: 'userSpaceOnUse' },
    el('circle', { cx: COLS[1] + 18, cy: ROWS[5] + 23, r: 12, fill: '#fff' }), el('circle', { cx: COLS[1] + 60, cy: ROWS[5] + 24, r: 12, fill: '#fff' })));
  defs.append(el('mask', { id: 'm-hole-obb', maskContentUnits: 'objectBoundingBox' }, el('circle', { cx: .5, cy: .5, r: .45, fill: '#fff' })));
  tallShort(1, 'm-hole-us'); tallShort(2, 'm-hole-obb');
  cap(1, 5, 'contentUnits uSOU 同尺寸孔'); cap(2, 5, 'contentUnits oBB 等比孔');

  // Row G — concept:mask-smil-animation: the sampling lamp (white circle, r 0→46, fill=freeze) leaves the strip
  // fully open after freezing; the scan band (fill=remove) snaps back to its start value. Plus an explicit
  // mask-type=luminance 50 % grey swatch (α ≈ 0.50).
  const lamp = el('circle', { cx: COLS[0] + W / 2, cy: ROWS[6] + H / 2, r: 0, fill: '#fff' });
  c.anim(lamp, 'r', '0', '46', '0s', '1.8s', 'freeze');
  defs.append(el('mask', { id: 'm-lamp', maskContentUnits: 'userSpaceOnUse' }, lamp));
  const band = el('rect', { x: COLS[1], y: ROWS[6], width: 16, height: H, fill: '#fff' });
  c.anim(band, 'x', String(COLS[1]), String(COLS[1] + 62), '0s', '1.8s', 'remove');
  defs.append(el('mask', { id: 'm-scan', maskContentUnits: 'userSpaceOnUse' }, band));
  defs.append(fragment(`<mask id="m-grey" mask-type="luminance" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="#808080"/></mask>`));
  g.append(seg(0, 6, { mask: 'url(#m-lamp)' }), seg(1, 6, { mask: 'url(#m-scan)' }), ghost(COLS[1], ROWS[6], W, H), seg(2, 6, { mask: 'url(#m-grey)' }));
  cap(0, 6, '取样灯 animate fill=freeze'); cap(1, 6, '扫描带 animate fill=remove'); cap(2, 6, 'luminance 50% 灰 α≈.50');
  return g;
}
