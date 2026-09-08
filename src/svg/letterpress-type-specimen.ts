// letterpress-type-specimen — 铅字样本册 (docs/svg-feature-demos.md §3.8)
// A warm-white specimen sheet floating on a transparent background. Every metric claim printed on the paper is
// measured from the live SVG text DOM (getComputedTextLength / getStartPositionOfChar / getExtentOfChar /
// getSubStringLength / getBBox / getComputedStyle) after `document.fonts.ready`, then flushed in one pass.
// Layer order (构造要点 3): <defs> (style + filters) → paper & registration marks → rows → gauge → readouts → anim → cursor.
import { el, mark, isExport, fmt } from './lib';
import {
  INK, RED, INDIGO, GREEN, PURPLE, HAIR, PAPER, TITLE_FILL, NOTE, FAMILY, SPEC, CJK, MONO,
  specimenFontFaceCss, f2, type Layers, type Report, lab, mono, txt, vtick, box, ctl, plateHeader, stamp,
} from './letterpress-type-specimen-kit';
import { buildLadder, buildMatrix, buildOpenType, buildBody } from './letterpress-type-specimen-left';
import { buildForced, buildCascade, buildCards, buildCursorBar } from './letterpress-type-specimen-right';

// ---------------------------------------------------------------------------------------------------------
// Stylesheet (el:style, at:style.type). Class rules deliberately set only font families — never fill/font-size —
// so that presentation attributes on individual elements keep working (the cascade section shows why).
// ---------------------------------------------------------------------------------------------------------
function stylesheet(): string {
  return `
${specimenFontFaceCss()}
.spec{font-family:${SPEC}}
.lab,.head{font-family:${CJK}}
.num{font-family:${MONO};font-variant-numeric:tabular-nums}
.pre{white-space:pre}
.plate{flood-color:var(--plate);transition:flood-color .4s}
.sheet text{fill:${INDIGO}}
.sheet text.claim{fill:${RED}}
.sheet .override{fill:${PURPLE} !important}
.probe{transition:fill .3s,stroke-width .3s}
.probe.hot{fill:${RED}}
@keyframes lts-ink{0%,100%{fill:${RED}}50%{fill:${INDIGO}}}
@keyframes lts-run{to{stroke-dashoffset:-64}}
@keyframes lts-pulse{0%,100%{opacity:.25}50%{opacity:1}}
.roller{animation:lts-ink 4.2s linear infinite}
.web{animation:lts-run 2.1s linear infinite}
.proof{animation:lts-pulse 2.1s ease-in-out infinite}
.frozen .roller,.frozen .web,.frozen .proof{animation-delay:-1.4s;animation-play-state:paused}
`;
}

/** Paper path: M56 36 H1344 V864 H56 Z, the left edge deckled by a sine wobble of ±1.5u every 40u. */
function paperPath(): string {
  let d = 'M56 36 H1344 V864 H56';
  for (let y = 824; y > 36; y -= 40) d += ` L${(56 + 1.5 * Math.sin(y / 40 * 1.9)).toFixed(2)} ${y}`;
  return d + ' Z';
}

function buildPaper(stage: SVGSVGElement): void {
  const paper = el('g', { id: 'lts-paper' });
  paper.append(el('path', { d: paperPath(), fill: PAPER }));
  paper.append(el('rect', { x: 84, y: 64, width: 1232, height: 772, fill: 'none', stroke: HAIR, 'stroke-width': 0.6 }));
  for (const [cx, cy] of [[70, 50], [1330, 50], [70, 850], [1330, 850]]) {
    paper.append(el('circle', { cx, cy, r: 5, fill: 'none', stroke: INK, 'stroke-width': 0.6 }));
    paper.append(el('path', { d: `M${cx - 9} ${cy}H${cx + 9}M${cx} ${cy - 9}V${cy + 9}`, stroke: INK, 'stroke-width': 0.6 }));
  }
  paper.append(el('line', { x1: 920, y1: 76, x2: 920, y2: 830, stroke: HAIR, 'stroke-width': 0.6 })); // gutter
  stage.append(paper);
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 14 — the 92pt hollow headline on a vermilion ink plate, with its getBBox geometry box.
// ---------------------------------------------------------------------------------------------------------
function buildTitle(L: Layers, R: Report): void {
  // concept:filter-on-text — feFlood (pr:flood-color / pr:flood-opacity) + feMerge behind real, selectable text.
  L.defs.append(el('filter', { id: 'inkPlate', x: '-3%', y: '-6%', width: '106%', height: '112%' },
    el('feFlood', { 'flood-color': RED, 'flood-opacity': 0.92, result: 'plate' }),
    el('feMerge', {}, el('feMergeNode', { in: 'plate' }), el('feMergeNode', { in: 'SourceGraphic' }))));
  // concept:text-stroke-paint-order — 7u stroke painted under the fill so the letter interiors stay clean.
  const title = txt(100, 168, 'Handgloves', {
    class: 'spec title', 'font-size': 92, 'font-weight': 800, fill: TITLE_FILL, stroke: INK, 'stroke-width': 7,
    'paint-order': 'stroke', 'stroke-linejoin': 'round', filter: 'url(#inkPlate)',
  });
  L.rows.append(title);
  // api:SVGGraphicsElement.getBBox / api:SVGBoundingBoxOptions.stroke / concept:bbox-excludes-stroke-and-control-points
  const bb = title.getBBox();
  const bbS = (title as SVGGraphicsElement & { getBBox(o?: { stroke?: boolean }): DOMRect }).getBBox({ stroke: true });
  const w = ctl(title);
  const sameBox = Math.abs(bbS.width - bb.width) < 0.01 && Math.abs(bbS.height - bb.height) < 0.01;
  L.gauge.append(box(bb, RED, { 'stroke-width': 1, 'stroke-dasharray': '6 3', class: 'title-bbox' }));
  L.gauge.append(el('rect', { x: bb.x - 3.5, y: bb.y - 3.5, width: bb.width + 7, height: bb.height + 7, fill: 'none', stroke: INK, 'stroke-width': 0.7, 'stroke-dasharray': '1 2' }));
  // Baseline anchors for every glyph start (api:SVGTextContentElement.getStartPositionOfChar), extent boxes on #3 / #8.
  const n = title.getNumberOfChars();
  for (let i = 0; i < n; i++) L.gauge.append(vtick(title.getStartPositionOfChar(i).x, 168, 178, RED, 1));
  L.gauge.append(vtick(title.getEndPositionOfChar(n - 1).x, 168, 178, RED, 1));
  for (const i of [2, 7]) L.gauge.append(box(title.getExtentOfChar(i), GREEN, { 'stroke-dasharray': '3 2' }));
  L.readouts.append(mono(bb.x, 210, `getBBox ${f2(bb.width)}×${f2(bb.height)} = getComputedTextLength ${f2(w)} · getBBox({stroke:true}) ${sameBox ? '在本引擎返回同一矩形' : `${f2(bbS.width)}×${f2(bbS.height)}`} · 点线 = 手工外扩 stroke-width/2，7u 描边越出虚框`, { fill: RED, 'font-size': 10 }));
  R.facts.push({ ok: Math.abs(bb.width - w) < 1, text: `标题 getBBox 宽 ${f2(bb.width)} vs getComputedTextLength ${f2(w)}（差 ${f2(Math.abs(bb.width - w))}）` });
  R.facts.push({ ok: false, text: sameBox ? 'getBBox({stroke:true}) 与无参结果相同 → SVGBoundingBoxOptions 未生效' : 'getBBox({stroke:true}) 包含描边' });
}

/** Masthead / colophon to the right of the headline: what the alias really is, and whether the face loaded. */
function buildMasthead(L: Layers, fontsOk: boolean): void {
  const lines: Array<[string, string]> = [
    ['铅字样本册 · LETTERPRESS TYPE SPECIMEN · No. 3.8', INK],
    [`字面别名 '${FAMILY}' → Latin Modern Roman 10 子集（400 / 700 / italic）`, NOTE],
    ['以 data URI 写入本页 <style> @font-face；无 wght / wdth 轴，无 smcp', NOTE],
    ['GUST Font License 1.0 · 所有度量于 document.fonts.ready 之后实测', NOTE],
    [`document.fonts.check('16px "${FAMILY}"') → ${fontsOk}`, fontsOk ? GREEN : RED],
  ];
  lines.forEach(([s, fill], i) => L.readouts.append(lab(660, 92 + i * 15, s, { fill, 'font-size': i ? 10.5 : 11.5, 'font-weight': i ? null : 700 })));
  L.readouts.append(el('line', { x1: 660, y1: 100, x2: 900, y2: 100, stroke: HAIR, 'stroke-width': 0.5, transform: 'translate(0 -4)' }));
}

// ---------------------------------------------------------------------------------------------------------
// Self-check column (x 656…900, y 226…742): the runtime facts collected by every section, wrapped by measurement.
// ---------------------------------------------------------------------------------------------------------
function buildSelfCheck(L: Layers, R: Report): void {
  plateHeader(L, R, 'check', INK, 656, 236, '自检结论 · 运行时生成 · ✓ 已验证 ✗ 缺失/无效 · 说明');
  const maxW = 238, x = 660, step = 14.5, limit = 742;
  let y = 254;
  for (const fact of R.facts) {
    if (y > limit) { L.readouts.append(lab(x, limit, '…', { fill: NOTE })); break; }
    const glyph = fact.ok === null ? '·' : fact.ok ? '✓' : '✗';
    const colour = fact.ok === null ? NOTE : fact.ok ? GREEN : RED;
    L.readouts.append(lab(x, y, glyph, { fill: colour, 'font-weight': 700 }));
    let rest = fact.text;
    while (rest.length) {
      const t = lab(x + 12, y, rest, { fill: INK, 'font-size': 10.5 });
      L.readouts.append(t);
      // api:SVGTextContentElement.getSubStringLength drives the wrap: longest prefix that fits the column.
      if (ctl(t) <= maxW) break;
      let cut = rest.length;
      while (cut > 1 && t.getSubStringLength(0, cut) > maxW) cut--;
      t.textContent = rest.slice(0, cut);
      rest = rest.slice(cut);
      y += step;
      if (y > limit) break;
    }
    y += step;
  }
}

// ---------------------------------------------------------------------------------------------------------
// 构造要点 16 — ink roller (css:keyframes-on-svg / css:keyframes-paint-animation) and pointer cursor.
// ---------------------------------------------------------------------------------------------------------
function buildRoller(L: Layers): void {
  L.anim.append(el('rect', { class: 'roller', x: 92, y: 840, width: 1216, height: 14, rx: 7, fill: RED }));
  L.anim.append(el('line', { class: 'web', x1: 96, y1: 847, x2: 1304, y2: 847, stroke: PAPER, 'stroke-width': 0.8, 'stroke-dasharray': '18 14', 'stroke-dashoffset': 0 }));
  L.anim.append(lab(104, 851, '墨辊走版 · @keyframes fill 色相 / stroke-dashoffset / opacity · hover 栏目标题 = flood-color transition', { fill: PAPER, 'font-size': 10 }));
  // concept:hollow-outline-text — the proof stamp is outline-only text (fill none, stroke set) pulsing in opacity.
  L.anim.append(txt(1250, 851.5, '校样中', { class: 'lab proof', 'font-size': 11.5, 'font-weight': 700, fill: 'none', stroke: TITLE_FILL, 'stroke-width': 0.7 }));
}

function setupCursor(L: Layers, R: Report, readout: SVGTextElement): void {
  const frame = el('rect', { class: 'cursor-box', fill: 'none', stroke: GREEN, 'stroke-width': 1, 'stroke-dasharray': '3 2' });
  L.cursor.append(frame);
  let hot: SVGTextElement | null = null;
  const show = (t: SVGTextElement, i: number): void => {
    const ext = t.getExtentOfChar(i);
    const tf = t.getAttribute('transform');
    frame.setAttribute('x', String(ext.x)); frame.setAttribute('y', String(ext.y));
    frame.setAttribute('width', String(ext.width)); frame.setAttribute('height', String(ext.height));
    if (tf) frame.setAttribute('transform', tf); else frame.removeAttribute('transform');
    const ch = (t.textContent ?? '')[i] ?? '';
    const size = getComputedStyle(t).fontSize.replace('px', '');
    const where = t.dataset.row ?? `${size}pt ${t.classList.contains('ladder') || (t.parentElement?.classList.contains('ladder')) ? '阶梯行' : '样字'}`;
    readout.textContent = `#${i} '${ch === ' ' ? '␣' : ch}' · 前进宽 ${f2(ext.width)} · getSubStringLength(0,${i}) = ${f2(t.getSubStringLength(0, i))} · ${where}`;
    if (hot !== t) { hot?.classList.remove('hot'); t.classList.add('hot'); hot = t; }
  };
  // Default hit for the still frame: character #4 of the 32pt ladder row.
  if (R.defaultProbe) show(R.defaultProbe, 4);
  // api:SVGTextContentElement.getCharNumAtPosition — pointer → user space via getScreenCTM().inverse().
  L.stage.addEventListener('pointermove', event => {
    const ctm = L.stage.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    for (const t of R.probes) {
      const b = t.getBBox();
      if (p.x < b.x || p.x > b.x + b.width || p.y < b.y || p.y > b.y + b.height) continue;
      const i = t.getCharNumAtPosition(p);
      if (i >= 0) { show(t, i); return; }
    }
  });
}

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('lang', 'zh-Hans');
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'lts-title');
  if (isExport()) stage.classList.add('frozen'); // still frame: roller at two thirds, proof stamp half-transparent
  stage.append(el('title', { id: 'lts-title' }, 'Letterpress type specimen — 铅字样本册'));
  stage.append(el('desc', {}, 'A warm-white type specimen sheet whose every metric (advance widths, x-heights, kerning deltas, textLength squeeze, cascade results) is measured from the live SVG text DOM and printed on the paper.'));

  const defs = el('defs');
  defs.append(el('style', { type: 'text/css' }, stylesheet()));
  stage.append(defs);
  buildPaper(stage);
  const L: Layers = {
    stage, defs,
    rows: el('g', { class: 'rows' }), gauge: el('g', { class: 'gauge' }), readouts: el('g', { class: 'readouts' }),
    anim: el('g', { class: 'anim' }), cursor: el('g', { class: 'cursor' }),
  };
  stage.append(L.rows, L.gauge, L.readouts, L.anim, L.cursor);
  const R: Report = { facts: [], headers: [], probes: [], pending: [] };

  // 构造要点 3 — every weight/style combination is loaded before a single measurement (api:FontFaceSet.ready).
  await Promise.all([`400 16px "${FAMILY}"`, `700 16px "${FAMILY}"`, `italic 400 16px "${FAMILY}"`, `16px ${CJK}`, `16px ${MONO}`]
    .map(spec => document.fonts.load(spec).catch(() => [])));
  await document.fonts.ready;
  const fontsOk = document.fonts.check(`16px "${FAMILY}"`);
  R.facts.push({ ok: fontsOk, text: `document.fonts.check('16px "${FAMILY}"') → ${fontsOk}` });

  buildTitle(L, R);
  buildMasthead(L, fontsOk);
  buildLadder(L, R);
  buildMatrix(L, R);
  buildOpenType(L, R);
  buildBody(L, R);
  buildForced(L, R);
  buildCascade(L, R);
  buildCards(L, R);
  const readout = buildCursorBar(L, R);
  buildRoller(L);

  // api:SVGElement.getPresentationAttribute — removed from every engine; the exhibit prints the typeof.
  const legacy = typeof (stage as unknown as { getPresentationAttribute?: unknown }).getPresentationAttribute;
  R.facts.push({ ok: false, text: `typeof el.getPresentationAttribute → "${legacy}"（SVG 1.1 接口已移除；fill 改由 getComputedStyle 读回）` });

  await Promise.all(R.pending); // pixel probes and card rasterisation
  // Plate widths: the flood region is 108% of each header's bbox, so it stretches with the label.
  const plateW = R.headers.map(h => h.getBBox().width * 1.08);
  R.facts.push({ ok: Math.max(...plateW) >= 2 * Math.min(...plateW), text: `${R.headers.length} 块 feFlood 底板随标题张缩：最短 ${fmt(Math.min(...plateW), 1)}px，最长 ${fmt(Math.max(...plateW), 1)}px` });
  buildSelfCheck(L, R);
  setupCursor(L, R, readout);
  if (!fontsOk) stamp(L.cursor, 660, 200, '字体未就绪 · 数值来自回退字面', RED, -4, 12);

  mark(stage,
    'css:font-face-data-uri', 'api:FontFaceSet.ready', 'concept:svg-as-image-external-font-blocked', 'concept:xml-stylesheet-pi',
    'api:SVGGraphicsElement.getBBox', 'api:SVGBoundingBoxOptions.stroke', 'concept:bbox-excludes-stroke-and-control-points',
    'concept:text-stroke-paint-order', 'concept:hollow-outline-text', 'concept:filter-on-text', 'concept:text-background-box-via-flood',
    'concept:flood-fills-filter-region', 'css:custom-properties-in-filter', 'css:flood-color-transition',
    'api:SVGTextContentElement.getComputedTextLength', 'api:SVGTextContentElement.getStartPositionOfChar',
    'api:SVGTextContentElement.getExtentOfChar', 'api:SVGTextContentElement.getSubStringLength',
    'api:SVGTextContentElement.getNumberOfChars', 'api:SVGTextContentElement.getCharNumAtPosition',
    'concept:textlength-on-tspan', 'concept:faux-italic-skewx', 'css:text-decoration-styling',
    'concept:presentation-attribute-specificity', 'css:presentation-attribute-specificity', 'concept:presentation-attribute-cascade',
    'concept:style-attribute', 'css:important-override', 'concept:ua-stylesheet-defaults', 'api:SVGElement.style',
    'api:CSSStyleDeclaration.fill', 'api:Window.getComputedStyle', 'api:SVGElement.getPresentationAttribute',
    'concept:length-units-font-relative', 'css:keyframes-on-svg', 'css:keyframes-paint-animation', 'css:transitions');
}
