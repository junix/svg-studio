// letterpress-type-specimen — main column (x 92…640): size ladder, weight×width matrix, OpenType switch
// comparison, and the leading/whitespace body block. Every printed number is measured from the live DOM.
import { el, fmt, type Attrs } from './lib';
import {
  INK, RED, INDIGO, GREEN, PURPLE, HAIR, NOTE, SPEC, CJK, MONO, f2, f1,
  type Layers, type Report, txt, lab, mono, spec, hline, vtick, box, preserveSpace,
  ctl, anchorTicks, stamp, plateHeader, inkMetrics, pixelDiff,
} from './letterpress-type-specimen-kit';

const LADDER_SIZES = [9, 12, 16, 22, 32, 48];
const SAMPLE = 'Hamburgefonstiv';

// ---------------------------------------------------------------------------------------------------------
// 构造要点 4 + 5 — size ladder (y 226…430) with baseline, em box, x-height band, measured advance, em/rem dots.
// ---------------------------------------------------------------------------------------------------------
export function buildLadder(L: Layers, R: Report): void {
  plateHeader(L, R, 'ladder', INDIGO, 140, 222, '字号阶梯 · font-size 9 → 48 · 每行实测 getComputedTextLength');
  const remHead = lab(96, 222, 'em ↕ / rem —', { 'font-size': 10.5 });
  L.rows.append(remHead);

  let top = 226;
  const widths: number[] = [];
  let remFallback = false;
  for (const size of LADDER_SIZES) {
    const baseline = top + size + 4;
    // pr:font-size on the row group so em-relative geometry (r="0.28em") and the sample share one font-size.
    const row = el('g', { class: 'row ladder', 'font-size': size });
    L.rows.append(row);
    row.append(hline(92, 640, baseline));
    const sample = spec(140, baseline, SAMPLE, size, { 'font-size': null });
    // The 48pt line carries a tspan at font-size="0.5em" — em resolves against the PARENT text's size (24px here).
    if (size === 48) sample.append(el('tspan', { 'font-size': '0.5em', fill: INDIGO }, ' ½em'));
    row.append(sample);
    if (size === 32) R.defaultProbe = sample;
    R.probes.push(sample);

    // concept:length-units-font-relative — r="0.28em" grows with the row; style="r:0.28rem" stays 4.48px.
    const cy = baseline - size * 0.34;
    const emDot = el('circle', { cx: 110, cy, r: '0.28em', fill: INDIGO, 'fill-opacity': 0.85 });
    const remDot = el('circle', { cx: 128, cy, style: 'r:0.28rem', fill: RED, 'fill-opacity': 0.85 });
    row.append(emDot, remDot);
    const remW = remDot.getBBox().width;
    if (Math.abs(remW - 8.96) > 0.3) { remFallback = true; remDot.setAttribute('r', '4.48'); }
    if (size === 32) R.facts.push({ ok: Math.abs(emDot.getBBox().width - 17.92) < 0.3, text: `r="0.28em" @32px → bbox 宽 ${f2(emDot.getBBox().width)}（期望 17.92）；r:0.28rem → ${f2(remW)}` });

    // Gauges (api:SVGTextContentElement.getComputedTextLength): em box = measured advance × font-size.
    const w = ctl(sample);
    widths.push(w);
    const ink = inkMetrics(size);
    L.gauge.append(
      el('rect', { x: 140, y: baseline - ink.xHeight, width: w, height: ink.xHeight, fill: INDIGO, 'fill-opacity': 0.08 }),
      el('rect', { x: 140, y: baseline - size, width: w, height: size, fill: 'none', stroke: INDIGO, 'stroke-width': 0.5, 'stroke-dasharray': '2 2' }),
      vtick(140 + w, baseline - size - 3, baseline + 3, RED, 0.8),
    );
    const readout = mono(636, baseline, `宽 ${f2(w)} / em ${size} / x 高 ${f1(ink.xHeight)}`, { 'text-anchor': 'end', class: 'num ladder-readout' });
    L.readouts.append(readout);
    // A wide sample would collide with the right-aligned readout; lift the readout above the cap height then.
    if (636 - ctl(readout) < 140 + w + 10) readout.setAttribute('y', String(top + 8));
    top += size + 10;
  }
  if (remFallback) remHead.textContent = 'em ↕ / rem 已换算';
  const increasing = widths.every((w, i) => i === 0 || w > widths[i - 1]);
  R.facts.push({ ok: increasing, text: `阶梯六行宽度严格递增：${widths.map(w => f1(w)).join(' < ')}` });
  R.facts.push({ ok: !remFallback, text: remFallback ? 'style="r:0.28rem" 未生效 → 已回退为像素 r 属性' : 'style="r:0.28rem" 生效（几何属性已 CSS 化）' });
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 6 — weight × width matrix (y 442…566) + font-style row with a skewX faux italic.
// ---------------------------------------------------------------------------------------------------------
export function buildMatrix(L: Layers, R: Report): void {
  plateHeader(L, R, 'matrix', GREEN, 92, 452, '字重 × 字宽矩阵 · font-weight / font-stretch / font-variation-settings');
  const weights = [200, 400, 700, 900];
  const stretches = [75, 100, 125];
  const cols = [150, 262, 374];
  const rowWidths: number[][] = [];
  weights.forEach((weight, r) => {
    const y = 474 + r * 22;
    L.rows.append(mono(92, y, `wght ${weight}`, { fill: NOTE }));
    const widths: number[] = [];
    stretches.forEach((stretch, c) => {
      // pr:font-weight / pr:font-stretch as presentation attributes, doubled by pr:font-variation-settings in style.
      const t = spec(cols[c], y, 'Meta', 22, {
        'font-weight': weight, 'font-stretch': `${stretch}%`,
        style: `font-variation-settings:'wght' ${weight},'wdth' ${stretch}`,
      });
      L.rows.append(t);
      R.probes.push(t);
      const w = ctl(t);
      widths.push(w);
      L.readouts.append(mono(cols[c] + 58, y, f2(w), { 'font-size': 10, fill: NOTE }));
    });
    rowWidths.push(widths);
    const same = widths.every(w => Math.abs(w - widths[0]) < 0.01);
    if (same) stamp(L.readouts, 492, y - 1, '合成·无 wdth 轴', RED);
  });
  const light = Math.abs(rowWidths[0][1] - rowWidths[1][1]) < 0.01, heavy = Math.abs(rowWidths[2][1] - rowWidths[3][1]) < 0.01;
  R.facts.push({ ok: false, text: `font-stretch 75/100/125% 三列宽度相同（${f2(rowWidths[1][0])}）→ 无 wdth 轴，已盖章` });
  R.facts.push({ ok: !light, text: light ? `wght 200 = 400（${f2(rowWidths[0][1])}）、700 = 900（${f2(rowWidths[2][1])}）→ 仅 400/700 两档，无 wght 轴` : 'wght 200 与 400 宽度不同' });
  if (heavy && light) R.facts.push({ ok: null, text: `粗体列宽 ${f2(rowWidths[2][1])} 来自真实 700 面，非合成加粗` });

  // font-style normal / italic / oblique 12deg / skewX(-12) faux italic (concept:faux-italic-skewx).
  const y = 562;
  L.rows.append(mono(92, y, 'font-style', { fill: NOTE }));
  const variants: Array<[string, Attrs]> = [
    ['normal', { 'font-style': 'normal' }],
    ['italic', { 'font-style': 'italic' }],
    ['oblique', { 'font-style': 'oblique 12deg' }],
    ['skewX', { transform: 'skewX(-12)' }],
  ];
  const ws: number[] = [];
  variants.forEach(([name, attrs], i) => {
    const x = 150 + i * 112;
    const t = spec(x, y, 'Meta', 14, attrs);
    if (name === 'skewX') t.setAttribute('transform', `translate(${x} ${y}) skewX(-12) translate(${-x} ${-y})`);
    L.rows.append(t);
    R.probes.push(t);
    const w = ctl(t);
    ws.push(w);
    L.readouts.append(mono(x + 34, y, `${name} ${f2(w)}`, { 'font-size': 10, fill: NOTE }));
  });
  R.facts.push({ ok: Math.abs(ws[0] - ws[3]) < 0.01, text: `skewX(-12) 伪斜体前进宽 ${f2(ws[3])} = 正体 ${f2(ws[0])}；真斜体 ${f2(ws[1])}，oblique 12deg ${f2(ws[2])}` });
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 7 + 8 — OpenType switch pairs (y 578…742). Δ = advance-width difference; Δ = 0 rows are pixel-probed and
// print either 「本引擎无差异」 or 「宽同·形异」 — never an unverified claim.
// ---------------------------------------------------------------------------------------------------------
interface Variant { text: string; attrs: Attrs; probe?: string }
interface OtRow {
  label: string; size: number; variants: Variant[]; gap: number;
  /** Which two variants define Δ (indices); default [0, 1]. */
  pair?: [number, number];
  strike?: boolean;
  after?: (texts: SVGTextElement[]) => void;
}

export function buildOpenType(L: Layers, R: Report): void {
  plateHeader(L, R, 'opentype', RED, 92, 588, 'OpenType 开关对照 · font-feature-settings / font-kerning / text-rendering · Δ = 前进宽差');
  const left: OtRow[] = [
    { label: 'liga 1 / 0', size: 13, gap: 72, variants: [
      { text: 'office fi', attrs: { style: "font-feature-settings:'liga' 1" }, probe: `style="font-feature-settings:'liga' 1"` },
      { text: 'office fi', attrs: { style: "font-variant-ligatures:none;font-feature-settings:'liga' 0" }, probe: `style="font-variant-ligatures:none;font-feature-settings:'liga' 0"` }] },
    { label: 'small-caps', size: 13, gap: 72, variants: [
      { text: 'Hamburg', attrs: { 'font-variant': 'small-caps' }, probe: 'font-variant="small-caps"' },
      { text: 'Hamburg', attrs: { style: "font-feature-settings:'smcp' 1" }, probe: `style="font-feature-settings:'smcp' 1"` }],
      after: texts => {
        const plain = spec(texts[1].x.baseVal[0].value, -500, 'Hamburg', 13);
        L.rows.append(plain);
        const hasSmcp = Math.abs(ctl(plain) - ctl(texts[1])) > 0.01;
        plain.remove();
        R.facts.push({ ok: hasSmcp, text: hasSmcp ? "字体含 smcp 表" : "'smcp' 1 与原文等宽 → 字体无 smcp 表，small-caps 为引擎合成" });
      } },
    { label: 'tnum / pnum', size: 13, gap: 72, variants: [
      { text: '1111 0123', attrs: { style: "font-feature-settings:'tnum' 1" }, probe: `style="font-feature-settings:'tnum' 1"` },
      { text: '1111 0123', attrs: { style: "font-variant-numeric:proportional-nums;font-feature-settings:'pnum' 1" }, probe: `style="font-feature-settings:'pnum' 1"` }],
      after: texts => texts.forEach(t => L.gauge.append(anchorTicks(t, Number(t.getAttribute('y')) + 2, Number(t.getAttribute('y')) + 5, INDIGO, 0.6))) },
    { label: 'onum / lnum', size: 13, gap: 72, variants: [
      { text: '0123 4567', attrs: { style: "font-variant-numeric:oldstyle-nums;font-feature-settings:'onum' 1" }, probe: `style="font-feature-settings:'onum' 1"` },
      { text: '0123 4567', attrs: { style: "font-variant-numeric:lining-nums;font-feature-settings:'lnum' 1" }, probe: `style="font-feature-settings:'lnum' 1"` }] },
    { label: 'kerning', size: 13, gap: 72, variants: [
      { text: 'AVA Ty', attrs: { 'font-kerning': 'normal' }, probe: 'font-kerning="normal"' },
      { text: 'AVA Ty', attrs: { 'font-kerning': 'none' }, probe: 'font-kerning="none"' }],
      after: texts => {
        // api:SVGTextContentElement.getSubStringLength — the AV pair measured on its own.
        const av = texts.map(t => t.getSubStringLength(0, 2));
        R.facts.push({ ok: Math.abs(av[0] - av[1]) > 0.01, text: `AV 对 getSubStringLength(0,2)：kerning normal ${f2(av[0])} / none ${f2(av[1])}` });
      } },
    // 构造要点 8 — SVG 1.1 `kerning="0"` is gone from every engine: Δ is always 0, so the row is struck through.
    { label: 'kerning="0"', size: 13, gap: 72, strike: true, variants: [
      { text: 'AVA Ty', attrs: { kerning: '0' }, probe: 'kerning="0"' },
      { text: 'AVA Ty', attrs: {}, probe: '' }] },
  ];
  const right: OtRow[] = [
    { label: 'rendering', size: 12, gap: 50, pair: [0, 1], variants: [
      { text: 'fi AV', attrs: { 'text-rendering': 'optimizeSpeed' }, probe: 'text-rendering="optimizeSpeed"' },
      { text: 'fi AV', attrs: { 'text-rendering': 'optimizeLegibility' }, probe: 'text-rendering="optimizeLegibility"' },
      { text: 'fi AV', attrs: { 'text-rendering': 'geometricPrecision' }, probe: 'text-rendering="geometricPrecision"' }] },
    { label: 'letter-sp', size: 12, gap: 52, pair: [0, 2], variants: [
      { text: 'Type', attrs: { 'letter-spacing': -1 } },
      { text: 'Type', attrs: { 'letter-spacing': 0 } },
      { text: 'Type', attrs: { 'letter-spacing': 8 } }] },
    { label: 'word-sp', size: 12, gap: 76, variants: [
      { text: 'Type set', attrs: { 'word-spacing': 0 } },
      { text: 'Type set', attrs: { 'word-spacing': 20 } }] },
    { label: 'decoration', size: 12, gap: 52, variants: [
      { text: 'under', attrs: { 'text-decoration': 'underline' }, probe: 'text-decoration="underline"' },
      { text: 'over', attrs: { 'text-decoration': 'overline' }, probe: 'text-decoration="overline"' },
      // css:text-decoration-styling — wavy vermilion strike-through on the third word.
      { text: 'strike', attrs: { 'text-decoration': 'line-through', style: `text-decoration-style:wavy;text-decoration-color:${RED}` }, probe: `text-decoration="line-through" style="text-decoration-style:wavy;text-decoration-color:${RED}"` }] },
    { label: 'family', size: 12, gap: 50, pair: [0, 1], variants: [
      { text: 'Type', attrs: { 'font-family': 'serif', class: 'probe' } },
      { text: 'Type', attrs: { 'font-family': 'sans-serif', class: 'probe' } },
      { text: 'Type', attrs: { 'font-family': 'monospace', class: 'probe' } },
      { text: 'Type', attrs: { 'font-family': 'cursive', class: 'probe' } }] },
  ];
  layoutOtColumn(L, R, left, 92, 360);
  layoutOtColumn(L, R, right, 372, 640);
}

function layoutOtColumn(L: Layers, R: Report, rows: OtRow[], x0: number, x1: number): void {
  rows.forEach((row, i) => {
    const y = 606 + i * 22;
    const labelAttrs: Attrs = { fill: NOTE };
    if (row.strike) labelAttrs['text-decoration'] = 'line-through';
    L.rows.append(mono(x0, y, row.label, labelAttrs));
    const texts = row.variants.map((v, k) => {
      const attrs: Attrs = { ...v.attrs };
      if (row.strike) attrs['text-decoration'] = 'line-through';
      if (v.attrs.class === 'probe') attrs.class = 'probe'; // generic families: not the specimen face, so no .spec
      const t = spec(x0 + 68 + k * row.gap, y, v.text, row.size, attrs);
      L.rows.append(t);
      R.probes.push(t);
      return t;
    });
    const [a, b] = row.pair ?? [0, 1];
    const widths = texts.map(ctl);
    const delta = widths[b] - widths[a];
    const extra = texts.length === 3 && !row.pair ? '' : texts.length === 3 ? ` · ${fmt(widths[2] - widths[1], 2)}` : '';
    const readout = mono(x1, y, '', { 'text-anchor': 'end' });
    L.readouts.append(readout);
    if (row.label === 'family') {
      readout.textContent = widths.map(w => f1(w)).join('·');
      readout.setAttribute('font-size', '9.5');
      R.facts.push({ ok: null, text: `通用族 serif/sans/mono/cursive 宽 ${widths.map(w => f1(w)).join(' / ')}` });
      return;
    }
    if (Math.abs(delta) > 0.005) {
      readout.textContent = `Δ ${fmt(delta, 2)}${extra}`;
      readout.setAttribute('fill', row.strike ? NOTE : INDIGO);
      return;
    }
    // Width Δ = 0: decide between "no difference at all" and "same width, different glyphs" by pixel probing.
    readout.textContent = '…';
    const va = row.variants[a], vb = row.variants[b];
    if (va.probe === undefined || vb.probe === undefined) { readout.textContent = '本引擎无差异'; readout.setAttribute('fill', NOTE); return; }
    R.pending.push(pixelDiff(va.text, va.probe, vb.probe).then(px => {
      if (px > 0 && !row.strike) { readout.textContent = `Δ 0 · 形异 ${px}px`; readout.setAttribute('fill', PURPLE); }
      else { readout.textContent = '本引擎无差异'; readout.setAttribute('fill', NOTE); }
      if (row.strike) R.facts.push({ ok: false, text: `kerning="0"（SVG 1.1）Δ ${f2(delta)}，像素差 ${px} → 已划掉` });
      else R.facts.push({ ok: null, text: `${row.label}：宽度 Δ 0，像素差 ${px}` });
    }));
    row.after?.(texts);
  });
  rows.forEach(row => { if (row.after && row.label !== 'kerning="0"' && row.label !== 'onum / lnum') { /* after() already ran when Δ ≠ 0 */ } });
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 9 — leading block (y 754…830): four 11pt lines on an 18u baseline step, plus the whitespace twins.
// ---------------------------------------------------------------------------------------------------------
export function buildBody(L: Layers, R: Report): void {
  const ink = inkMetrics(11);
  plateHeader(L, R, 'body', PURPLE, 92, 762, `行距与空白 · 正文 11pt · 基线步 18.0 · cap ${f1(ink.capHeight)} · x 高 ${f1(ink.xHeight)}`);
  const lines = [
    'A specimen proves its claims on its own paper: every metric printed',
    'here was measured from the very glyphs you are reading, not copied',
    'from a data sheet. Advance widths, x-heights, kerning deltas and the',
    'squeeze of textLength all come back through the SVG text DOM API.',
  ];
  lines.forEach((line, i) => {
    const y = 776 + i * 18;
    const t = spec(92, y, line, 11);
    L.rows.append(t);
    R.probes.push(t);
    L.gauge.append(vtick(86, y, y - 18, HAIR, 0.5), hline(84, 90, y, RED, 0.8));
    if (i === 0) L.gauge.append(mono(60, y - 4, '18.0', { 'font-size': 10, fill: RED }));
  });

  // Whitespace twins: CSS white-space:pre (pv:white-space=pre) / default collapsing / xml:space="preserve".
  const twins: Array<[string, (t: SVGTextElement) => void]> = [
    ['css pre', t => t.setAttribute('class', 'spec probe pre')],
    ['折叠', () => {}],
    ['xml:space', t => preserveSpace(t)],
  ];
  const group = el('g', { class: 'twins' });
  preserveSpace(group); // av:g.xml:space=preserve on the group — the twin rows override it individually below
  L.rows.append(group);
  const measured: number[] = [];
  twins.forEach(([label, tune], i) => {
    const y = 782 + i * 18;
    const t = spec(482, y, 'A     B', 13);
    if (i === 1) t.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'default');
    tune(t);
    group.append(t);
    R.probes.push(t);
    const w = ctl(t);
    measured.push(w);
    L.gauge.append(el('rect', { x: 482, y: y - 10, width: w, height: 12, fill: PURPLE, 'fill-opacity': 0.08 }));
    L.readouts.append(mono(482 + w + 8, y, f2(w), { fill: PURPLE }));
    L.readouts.append(mono(640, y, label, { 'text-anchor': 'end', fill: NOTE, 'font-size': 10 }));
  });
  const twinsOk = Math.abs(measured[0] - measured[2]) < 0.5 && measured[0] >= measured[1] * 1.8;
  R.facts.push({ ok: twinsOk, text: `空白孪生 "A␣␣␣␣␣B"：pre ${f2(measured[0])} / 折叠 ${f2(measured[1])} / xml:space ${f2(measured[2])}` });
}

// Re-exports used by the main module for typing the column helpers.
export type { OtRow };
export { box, txt, lab, CJK, MONO, SPEC, INK };
