// letterpress-type-specimen — right column (x 940…1308): forced column-width trial (textLength / lengthAdjust),
// cascade experiment (presentation attribute vs CSS), the three SVG-as-image proof cards and the cursor readout bar.
import { el, fmt } from './lib';
import {
  INK, RED, INDIGO, GREEN, HAIR, NOTE, f2,
  type Layers, type Report, txt, lab, mono, spec, hline, vtick, box,
  ctl, span, anchorTicks, stamp, plateHeader,
} from './letterpress-type-specimen-kit';
import { cardStylesheetPi, cardExternalFont, cardDataUriFont } from './letterpress-type-specimen-cards';

export const FORCED_SENTENCE = 'Handgloves & Hamburgefonstiv';
const X0 = 956;

// ---------------------------------------------------------------------------------------------------------
// 构造要点 10 + 11 — three rulers (320 / 260 / 200 u); the same sentence fitted twice under each one.
// at:text.textLength, av:text.lengthAdjust=spacing / spacingAndGlyphs, per-glyph anchors, double readouts.
// ---------------------------------------------------------------------------------------------------------
export function buildForced(L: Layers, R: Report): void {
  plateHeader(L, R, 'forced', RED, 940, 86, '强制栏宽试验 · textLength / lengthAdjust · 逐字锚点 getStartPositionOfChar');
  // Natural sample — the reference for glyph-width ratios.
  const natural = spec(X0, 112, FORCED_SENTENCE, 20);
  L.rows.append(natural);
  R.probes.push(natural);
  const naturalW = ctl(natural);
  const n = natural.getNumberOfChars();
  const naturalExt = Array.from({ length: n }, (_, i) => natural.getExtentOfChar(i).width);
  L.gauge.append(anchorTicks(natural, 115, 119, INK, 0.6));
  L.readouts.append(mono(X0 + naturalW + 8, 112, `自然 ${f2(naturalW)}`, { fill: NOTE }));

  interface Reading { L: number; mode: string; engine: number; span: number; ratio: number; gap: number; verdict: string; colour: string }
  const readings: Reading[] = [];
  [320, 260, 200].forEach((len, k) => {
    const y0 = 128 + k * 74;
    // Ruler: 20u minor / 100u major ticks with numbers.
    const ruler = el('g', { class: 'ruler' });
    ruler.append(hline(X0, X0 + len, y0, INK, 0.8));
    for (let u = 0; u <= len; u += 20) {
      const major = u % 100 === 0;
      ruler.append(vtick(X0 + u, y0, y0 + (major ? 7 : 3), INK, major ? 0.8 : 0.5));
      if (major) ruler.append(mono(X0 + u, y0 - 3, String(u), { 'text-anchor': 'middle', 'font-size': 9.5, fill: NOTE }));
    }
    ruler.append(mono(X0 + len + 6, y0 + 3, `${len}u`, { fill: RED }));
    L.gauge.append(ruler);

    (['spacing', 'spacingAndGlyphs'] as const).forEach((mode, m) => {
      const y = y0 + 30 + m * 28;
      const colour = mode === 'spacing' ? INDIGO : RED;
      const t = spec(X0, y, FORCED_SENTENCE, 20, { textLength: len, lengthAdjust: mode, fill: colour, 'data-row': `${len}u ${mode}` });
      L.rows.append(t);
      R.probes.push(t);
      // Per-glyph anchors + extent boxes of the first and last glyph (api:SVGTextContentElement.getExtentOfChar).
      L.gauge.append(anchorTicks(t, y + 3, y + 7, colour, 0.7));
      for (const i of [0, n - 1]) L.gauge.append(box(t.getExtentOfChar(i), colour, { 'stroke-dasharray': '2 1.5' }));
      const s = span(t);
      const ext = Array.from({ length: n }, (_, i) => t.getExtentOfChar(i).width);
      const ratio = ext[0] / naturalExt[0];
      const gap = (s - ext.reduce((a, b) => a + b, 0)) / (n - 1);
      const verdict = ratio < 0.9 ? '字形被压' : ratio > 1.1 ? '字形被拉' : s < naturalW ? '字距被挤' : '字距被拉';
      readings.push({ L: len, mode, engine: ctl(t), span: s, ratio, gap, verdict, colour });
    });
  });

  // Readout table (y 352…424): engine reading vs measured span — the two disagree under `spacing`, and that
  // disagreement is the exhibit.
  const cols = [X0, 1000, 1052, 1122, 1188, 1226, 1266];
  const head = ['标尺', '档', '引擎读数', '实测跨距', '宽比', '字距Δ', '判定'];
  head.forEach((h, i) => L.readouts.append(lab(cols[i], 352, h, { 'font-size': 10, 'font-weight': 700, fill: INK })));
  L.readouts.append(hline(X0, 1308, 355.5, HAIR, 0.5));
  let disagree = 0;
  readings.forEach((r, i) => {
    const y = 366 + i * 12;
    const cells = [`${r.L}`, r.mode === 'spacing' ? 'sp' : 's&g', f2(r.engine), f2(r.span), f2(r.ratio), fmt(r.gap, 2)];
    cells.forEach((c, j) => L.readouts.append(mono(cols[j], y, c, { fill: j === 2 && Math.abs(r.engine - r.span) > 0.5 ? RED : INK })));
    stamp(L.readouts, cols[6], y, r.verdict, r.colour, 0, 9.5);
    if (Math.abs(r.engine - r.span) > 0.5) disagree++;
  });
  const sp = readings.filter(r => r.mode === 'spacing'), sg = readings.filter(r => r.mode !== 'spacing');
  R.facts.push({ ok: sp.every(r => Math.abs(r.ratio - 1) < 0.003 && Math.abs(r.span - r.L) < 0.5), text: `spacing：首字宽比 ${sp.map(r => r.ratio.toFixed(3)).join('/')}，跨距 = textLength ±0.5` });
  R.facts.push({ ok: sg.every(r => r.ratio <= 0.9 || r.L >= naturalW), text: `spacingAndGlyphs：首字宽比 ${sg.map(r => r.ratio.toFixed(3)).join('/')}（自然 ${f2(naturalW)}）` });
  R.facts.push({ ok: null, text: disagree ? `getComputedTextLength 与实测跨距不等 ${disagree} 行（spacing 档返回自然宽）` : 'getComputedTextLength 与实测跨距全部一致' });

  // concept:textlength-on-tspan — textLength on a single tspan squeezes one word only.
  const y = 440;
  const t = txt(X0, y, '', { class: 'spec probe', 'font-size': 13, fill: INK });
  const inner = el('tspan', { textLength: 120, lengthAdjust: 'spacingAndGlyphs', fill: RED }, 'Hamburgefonstiv');
  t.append('The ', inner, ' quartz only');
  L.rows.append(t);
  R.probes.push(t);
  const a = t.getStartPositionOfChar(4).x, b = t.getEndPositionOfChar(4 + 14).x;
  L.gauge.append(hline(a, b, y + 4, RED, 0.8), vtick(a, y + 1, y + 7, RED), vtick(b, y + 1, y + 7, RED));
  L.readouts.append(mono(b + 8, y, `tspan textLength=120 → 实测 ${f2(b - a)}`, { fill: NOTE }));
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 12 — cascade experiment: five rows, every swatch filled with the string getComputedStyle returned.
// ---------------------------------------------------------------------------------------------------------
export function buildCascade(L: Layers, R: Report): SVGTextElement[] {
  plateHeader(L, R, 'cascade', INDIGO, 940, 462, '级联实验 · 呈现属性特异性 0 < 规则 < 内联 style < !important < UA 默认');
  const sheet = el('g', { class: 'sheet cascade' });
  const outside = el('g', { class: 'cascade' });
  const notes = el('g', { class: 'cascade-notes' });
  L.rows.append(sheet, outside, notes);
  const rows: Array<{ make: () => SVGTextElement; note: string; scope: SVGGElement }> = [
    { scope: sheet, note: '① fill="#b3271e" 呈现属性 ← .sheet text{fill:#14577a} 覆盖（特异性 0）',
      make: () => spec(X0, 486, 'Handgloves', 20, { class: 'spec', fill: RED }) },
    { scope: sheet, note: '② class="claim" ← .sheet text.claim{fill:#b3271e} 靠特异性夺回朱红',
      make: () => spec(X0, 516, 'Handgloves', 20, { class: 'spec claim', fill: RED }) },
    { scope: sheet, note: '③ 脚本 el.style.fill = "#1d7a4b" → 内联 style 压过所有规则',
      make: () => { const t = spec(X0, 546, 'Handgloves', 20, { class: 'spec', fill: RED }); t.style.fill = GREEN; return t; } },
    { scope: sheet, note: '④ .sheet .override{fill:#7a3fa0 !important} 压过内联 style="fill:#1d7a4b"',
      make: () => spec(X0, 576, 'Handgloves', 20, { class: 'spec override', fill: RED, style: `fill:${GREEN}` }) },
    { scope: outside, note: '⑤ 出 .sheet 作用域、不写任何 fill → UA 默认 black',
      make: () => spec(X0, 606, 'Handgloves', 20, { class: 'spec', fill: null }) },
  ];
  const texts: SVGTextElement[] = [];
  const computed: string[] = [];
  rows.forEach(row => {
    const t = row.make();
    row.scope.append(t);
    texts.push(t);
    const y = Number(t.getAttribute('y'));
    // api:Window.getComputedStyle — the resolved rgb() string becomes the swatch fill, verbatim.
    const fill = getComputedStyle(t).fill;
    computed.push(fill);
    L.readouts.append(el('rect', { x: 1090, y: y - 12, width: 18, height: 14, fill, stroke: HAIR, 'stroke-width': 0.5, class: 'swatch' }));
    L.readouts.append(mono(1114, y, fill));
    notes.append(lab(X0, y + 10, row.note, { 'font-size': 10 }));
  });
  // Four-step staircase: attribute (0) < rule < inline < !important.
  const steps = [600, 585, 570, 555];
  let d = `M1236 ${steps[0]}`;
  steps.forEach((h, i) => { d += ` H${1252 + i * 16} V${steps[i + 1] ?? h - 15}`; });
  L.gauge.append(el('path', { d, fill: 'none', stroke: INDIGO, 'stroke-width': 1 }));
  ['属性', '规则', '内联', '!imp'].forEach((s, i) => L.gauge.append(lab(1244 + i * 16, steps[i] - 3, s, { 'font-size': 8.5, 'text-anchor': 'middle', fill: INDIGO })));
  L.readouts.append(lab(1308, 619, '属性 0 < 规则 < 内联 < !important', { 'text-anchor': 'end', 'font-size': 10, fill: INDIGO }));
  const expect = ['rgb(20, 87, 122)', 'rgb(179, 39, 30)', 'rgb(29, 122, 75)', 'rgb(122, 63, 160)', 'rgb(0, 0, 0)'];
  R.facts.push({ ok: computed.every((c, i) => c === expect[i]), text: `级联五行 getComputedStyle fill：${computed.map(c => c.replace(/\s/g, '')).join(' ')}` });
  return texts;
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 15 — three proof cards, each a standalone SVG document in an <image>.
// ---------------------------------------------------------------------------------------------------------
export function buildCards(L: Layers, R: Report): void {
  // The header plate uses flood-color="currentColor" resolved against the <filter>'s own `color` (pv:flood-color=currentColor).
  plateHeader(L, R, 'cards', GREEN, 940, 642, '校样三卡 · SVG-as-image · 此板 flood-color:currentColor 取滤镜自身 color', { currentColor: true });
  const cards = [
    { href: cardStylesheetPi(), cap: ['<?xml-stylesheet?> PI 把朱红改成靛蓝', '呈朱红 = 本引擎忽略 PI'] },
    { href: cardExternalFont(), cap: ['卡内 <style> 生效，但 url(/…woff2)', '外部字体被阻断 → 回退 serif'] },
    { href: cardDataUriFont(), cap: ['卡内 @font-face data URI 微子集', '→ 字面与纸面完全一致'] },
  ];
  const y = 652;
  const images = cards.map((card, i) => {
    const x = 940 + i * 126;
    const img = el('image', { x, y, width: 116, height: 92, href: card.href, class: 'proof-card' });
    L.rows.append(img);
    card.cap.forEach((c, k) => L.readouts.append(lab(x, 757 + k * 12, c, { 'font-size': 9.5 })));
    return img;
  });
  // Pixel-check the cards by rasterising the same data URLs: the PI card's bottom bar tells whether the PI applied,
  // and card 2 vs card 3 differing proves the external face was blocked while the data-URI face was not.
  const raster = (href: string) => new Promise<ImageData>(resolve => {
    const im = new Image();
    im.onload = () => { const c = document.createElement('canvas'); c.width = 116; c.height = 92; const ctx = c.getContext('2d')!; ctx.drawImage(im, 0, 0); resolve(ctx.getImageData(0, 0, 116, 92)); };
    im.onerror = () => resolve(new ImageData(116, 92));
    im.src = href;
  });
  R.pending.push(Promise.all(images.map(im => raster(im.getAttribute('href')!))).then(([pi, ext, uri]) => {
    const px = (d: ImageData, x: number, yy: number) => { const o = (yy * 116 + x) * 4; return `rgb(${d.data[o]}, ${d.data[o + 1]}, ${d.data[o + 2]})`; };
    const bar = px(pi, 58, 82);
    const piApplied = bar === 'rgb(20, 87, 122)';
    if (!piApplied) stamp(L.readouts, 940, 748, '本引擎忽略 PI', RED, -3, 9.5);
    let diff = 0;
    for (let i = 3; i < ext.data.length; i += 4) if (Math.abs(ext.data[i] - uri.data[i]) > 24 || Math.abs(ext.data[i - 3] - uri.data[i - 3]) > 24) diff++;
    R.facts.push({ ok: piApplied, text: `校样卡 1：PI 样式表${piApplied ? '生效' : '被忽略'}（底条 ${bar}）` });
    R.facts.push({ ok: diff > 0, text: `校样卡 2 vs 3 像素差 ${diff}：外部 woff2 被阻断，data URI 字面随卡走` });
  }));
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 16 — cursor readout bar (y 776…830). The main module writes into #lts-cursor-readout.
// ---------------------------------------------------------------------------------------------------------
export function buildCursorBar(L: Layers, R: Report): SVGTextElement {
  plateHeader(L, R, 'cursor', INK, 940, 784, '游标读数 · getCharNumAtPosition → getExtentOfChar · getSubStringLength(0,i)');
  const readout = mono(X0, 803, '', { id: 'lts-cursor-readout', fill: GREEN, 'font-size': 11 });
  L.readouts.append(readout);
  L.readouts.append(lab(X0, 819, '指针掠过任一样字：绿框 = 该字 getExtentOfChar；未命中时游标停在 32pt 阶梯行 · 命中行 .hot 以 transition 变色', { 'font-size': 10 }));
  return readout;
}

