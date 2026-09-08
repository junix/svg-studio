// museum-label-panel — 博物馆展签面板 (docs/svg-feature-demos.md §3.2).
//
// One standalone SVG document (built by ./museum-label-panel-doc.ts, committed as public/museum-label-panel/*.svg) is
// shown in every way a browser can host it:
//   • inline copy (the big panel, x 32–832 / y 64–724) — shares the page DOM, scripts and forms work;
//   • <img src="data:image/svg+xml;base64,…"> copies — secure static mode: no script, no forms, no hover, no external;
//   • <object data="/museum-label-panel/museum-label.svg#identity"> copies — separate documents with scripts, readable
//     through contentDocument.
// The archive column on the right (x 864–1368) holds the identity wall (five media-query identities), the embedding
// comparison, the intrinsic-size row with three ill-formed examples; the bottom strip holds the accession catalogue
// (reading order), the keyboard/metadata notes and the rasterisation archive canvas.
import { el, html, text, mark, isExport, FONT_CJK, FONT_MONO } from './lib';
import {
  ACCESSION, FIRST_SENTENCE, IDENTITY_NAMES, LABEL_FILE, LABEL_H, LABEL_W, PARTS, SCRIPT_BODY,
  buildLabelDocument, toDataUri, type Identity,
} from './museum-label-panel-doc';

const DC_NS = 'http://purl.org/dc/elements/1.1/';
const MUSEUM_NS = 'urn:x-museum:label';
const H = { ink: '#efe9dd', dim: '#a8a196', card: '#262a31', line: '#3d444f', accent: '#e5936c', ok: '#7fc8a9', bad: '#e0776a', mono: '#d3bd93' };
const PANEL_X = 32, PANEL_Y = 64;
const COL_X = 864, COL_W = 504;
const MISSING_FILE = '/museum-label-panel/missing.svg';
/** Same host, a port nothing listens on: an honest network failure when the dev server rewrites 404s to index.html. */
const UNREACHABLE_FILE = `${location.protocol}//${location.hostname}:1${MISSING_FILE}`;

/** Resolve when an <img>/<object> has loaded (or failed / timed out) so the still frame is final. */
const settled = (node: HTMLElement, ms = 5000): Promise<void> => new Promise(resolve => {
  const done = () => resolve();
  node.addEventListener('load', done, { once: true });
  node.addEventListener('error', done, { once: true });
  window.setTimeout(done, ms);
});
const sha256Hex = async (source: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
};
const setText = (scope: ParentNode, selector: string, value: string): void => { const node = scope.querySelector<HTMLElement | SVGElement>(selector); if (node) node.textContent = value; };

const hostStyle = (): string => `
.h-title{font:700 20px ${FONT_CJK};fill:#b4452a}
.h-sub{font:11px ${FONT_MONO};fill:#8a7659}
.h-mono{font:11px ${FONT_MONO};fill:${H.mono}}
.h-card{fill:${H.card};stroke:${H.line};stroke-width:1}
.h-h{font:700 13px ${FONT_CJK};fill:${H.ink}}
.h-note{font:11px ${FONT_CJK};fill:${H.dim}}
.h-html{margin:0;font:11px/1.35 ${FONT_CJK};color:${H.dim}}
.h-html b{color:${H.ink};font-weight:700}
.h-html code{font:11px ${FONT_MONO};color:${H.mono}}
.h-html p{margin:0 0 2px}
.tiles{display:flex;gap:6px}
.tile{width:96px;flex:none}
.frame{position:relative;overflow:hidden;border:1px solid ${H.line};background:#e9e2d2;width:96px;height:79px}
.frame img,.frame object{display:block}
.frame .scaled{transform-origin:0 0}
.tile .name{display:block;margin-top:4px;font-weight:700;color:${H.ink}}
.tile .mq{display:block;font:11px/1.25 ${FONT_MONO};color:${H.mono}}
.tile .mode{display:block;line-height:1.25}
.embeds{display:flex;gap:8px}
.embed{width:150px;flex:none}
.embed .frame{width:150px;height:124px}
.embed .frame.inline-card{background:${H.card};border-color:${H.accent};padding:6px;font:11px/1.45 ${FONT_CJK};color:${H.dim}}
.embed .frame.inline-card b{color:${H.accent}}
.chips{display:grid;grid-template-columns:1fr 1fr;gap:2px 4px;margin-top:4px}
.chip{font:11px ${FONT_MONO};color:${H.dim};padding:0 4px;border:1px solid ${H.line};border-radius:2px;white-space:nowrap;line-height:14px}
.chip.ok{color:${H.ok};border-color:${H.ok}}
.chip.bad{color:${H.bad};border-color:${H.bad}}
.status{display:block;margin-top:3px;line-height:1.3}
.sizes{display:grid;grid-template-columns:repeat(3,156px);gap:6px}
.size .frame{width:156px;height:58px;background:${H.card}}
.size .frame .fallback{padding:4px 6px;font:11px/1.3 ${FONT_CJK};color:${H.bad}}
.size .frame img{max-width:none}
.size code,.size .cap{display:block;line-height:1.25;white-space:nowrap}
.size .cap{margin-top:1px}
.notes p{line-height:1.3}
.archive{display:flex;flex-direction:column;gap:4px}
.archive .row{display:flex;align-items:center;gap:6px;height:16px}
.archive button{font:11px ${FONT_CJK};padding:0 6px;height:16px;line-height:14px;border:1px solid ${H.accent};background:transparent;color:${H.accent};border-radius:2px;cursor:pointer}
.archive button:focus-visible{outline:2px dashed ${H.accent};outline-offset:2px}
.archive .badge{font:700 11px ${FONT_CJK};color:${H.ok};border:1px solid ${H.ok};padding:0 6px;border-radius:2px;white-space:nowrap}
.archive .badge.missing{color:${H.bad};border-color:${H.bad}}
.archive canvas{display:block;border:1px solid ${H.line};background:#1c1f25}
.legend-row .lg{font:12px ${FONT_CJK};fill:${H.ink}}
.legend-row .pi{font:11px ${FONT_MONO};fill:${H.dim}}
.legend-row .dot{fill:${H.accent}}
/* css:has — hovering or focusing a hotspot inside the inline label highlights the matching catalogue row */
${PARTS.map(p => `#stage:has(.hotspot[data-accession="${p.accession}"]:hover) .legend-row[data-accession="${p.accession}"] .lg,#stage:has(.hotspot[data-accession="${p.accession}"]:focus) .legend-row[data-accession="${p.accession}"] .lg{fill:${H.accent};font-weight:700}`).join('\n')}
.legend-row:has(.dot[data-accession]):hover .lg{fill:${H.accent}}
`;

export async function render(stage: SVGSVGElement): Promise<void> {
  const exportMode = isExport();
  const source = buildLabelDocument();
  const dataUri = toDataUri(source);
  // The 404 fallback (<object data="…/missing.svg">) and the blocked https seal are intentional; only those resource
  // failures are tolerated by the capture (see AGENT-GUIDE addenda).
  stage.dataset.expectedErrors = 'Failed to load resource';
  stage.setAttribute('role', 'graphics-document');
  stage.setAttribute('aria-label', '博物馆展签面板：一份独立 SVG 文档的五种身份、三种嵌入与七个可达部位');
  stage.setAttribute('lang', 'zh-Hans');
  stage.append(
    el('title', {}, '博物馆展签面板 — museum-label.svg 的五种身份、三种嵌入与七个可达部位'),
    el('desc', {}, '左侧是彩陶双耳罐展签的 inline 副本（800×660 的独立 SVG 文档）；右侧档案栏以 img 与 object 再次挂出同一文件，展示浅色、深色、强制高对比、打印与窄幅五种媒体查询身份、脚本与表单在安全静态模式下的失效、固有尺寸三态与三个反例；底部为按展品编号排列的阅读顺序目录、键盘说明、档案元数据与栅格化存档画布。'),
    el('style', {}, hostStyle()),
  );

  // ── stage header ────────────────────────────────────────────────────────────────────────────────────────────────────
  stage.append(
    text('博物馆展签面板', { x: PANEL_X, y: 44, class: 'h-title' }),
    text('museum-label.svg · 800×660 · 一份文档 · 五种身份 · 三种嵌入 · 七个可达部位', { x: PANEL_X + 176, y: 44, class: 'h-sub' }),
    text('inline ← 主面板　　img / object → 档案栏', { x: COL_X + COL_W, y: 44, class: 'h-sub', 'text-anchor': 'end' }),
  );

  // ── inline copy (concept:standalone-svg-document parsed as XML, adopted into the page) ─────────────────────────────
  const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (parsed.getElementsByTagName('parsererror').length) throw new Error('museum-label.svg is not well-formed');
  const inlineRoot = document.importNode(parsed.documentElement, true) as unknown as SVGSVGElement;
  inlineRoot.setAttribute('x', String(PANEL_X));
  inlineRoot.setAttribute('y', String(PANEL_Y));
  inlineRoot.querySelector('script')?.remove(); // adopted scripts never run; the host invokes SCRIPT_BODY explicitly
  stage.append(inlineRoot);

  // ── archive column A: identity wall (css:prefers-color-scheme / forced-colors / media-print / media-width) ───────
  const cardA = section(stage, COL_X, 64, COL_W, 192, '五种身份 · 同一文档 · 四条媒体查询', '@media ⇄ :root[data-identity]');
  const identities: { id: Identity; mq: string; mode: string; node: HTMLElement }[] = [
    { id: 'light', mq: '默认 · 无媒体查询', mode: 'object · 96px', node: objectCopy('', 96, 79) },
    { id: 'dark', mq: '@media (prefers-color-scheme: dark)', mode: 'img · color-scheme', node: html('img', { src: dataUri, width: 96, alt: '深色身份', style: 'color-scheme:dark' }) },
    { id: 'forced', mq: '@media (forced-colors: active)', mode: 'object · #forced', node: objectCopy('#forced', 96, 79) },
    { id: 'print', mq: '@media print', mode: 'object · 100%', node: objectCopy('#print', '100%', '100%') },
    { id: 'narrow', mq: '@media (max-width: 420px)', mode: 'object · 380px ×.2526', node: objectCopy('', 380, 314, 'scaled', 'transform:scale(0.2526)') },
  ];
  const tiles = html('div', { class: 'h-html tiles', id: 'identity-wall' });
  for (const tile of identities) {
    tiles.append(html('div', { class: 'tile', 'data-identity': tile.id },
      html('div', { class: 'frame', 'data-identity': tile.id }, tile.node),
      html('span', { class: 'name' }, IDENTITY_NAMES[tile.id]),
      html('span', { class: 'mq' }, tile.mq),
      html('span', { class: 'mode' }, tile.mode)));
  }
  cardA.append(el('foreignObject', { x: COL_X + 12, y: 94, width: COL_W - 24, height: 156 }, tiles));

  // ── archive column B: embedding comparison (concept:svg-script-security-context) ───────────────────────────────────
  const cardB = section(stage, COL_X, 268, COL_W, 232, '三种嵌入 · 同一文件 · 安全静态模式', 'inline · <img> · <object>');
  const imgCopy = html('img', { src: dataUri, width: 150, alt: '彩陶双耳罐展签（img 副本）', id: 'embed-img' });
  const objCopy = objectCopy('', 150, 124);
  objCopy.id = 'embed-object';
  const inlineCard = html('div', { class: 'frame inline-card' },
    html('b', {}, '← 主面板即 inline 副本'), html('br'),
    '与宿主同一 DOM：', html('br'),
    html('code', { id: 'inline-fo-count' }, 'foreignObject × …'), html('br'),
    html('code', { id: 'inline-stamp' }, '#script-stamp …'), html('br'),
    html('code', { id: 'inline-lines' }, '正文换行 …'));
  const embeds = html('div', { class: 'h-html embeds' },
    embedColumn('inline', inlineCard, [true, true, true, true], html('span', { class: 'status', id: 'status-inline' }, '同一 DOM · Ctrl+F 可搜到')),
    embedColumn('<img> data:', html('div', { class: 'frame' }, imgCopy), [false, false, false, false], html('span', { class: 'status', id: 'status-img' }, 'naturalWidth … · 无 DOM')),
    embedColumn('<object> 同源', html('div', { class: 'frame' }, objCopy), [true, true, true, true], html('span', { class: 'status', id: 'status-object' }, '跨文档读取 …')),
  );
  cardB.append(el('foreignObject', { x: COL_X + 12, y: 298, width: COL_W - 24, height: 196 }, embeds));

  // ── archive column C: intrinsic sizing + three ill-formed examples (concept:intrinsic-sizing-of-embedded-svg) ─────
  const cardC = section(stage, COL_X, 512, COL_W, 212, '固有尺寸三态 · 三个反例', 'width/height · viewBox · 无 · xmlns · 404 · XML');
  const variant = (suffix: string) => LABEL_FILE.replace('.svg', `${suffix}.svg`);
  const imgOriginal = html('img', { src: dataUri, alt: '原件：width=800 height=660', id: 'size-original' });
  const imgRatio = html('img', { src: variant('-ratio'), alt: '仅 viewBox', id: 'size-ratio', style: 'width:100%' });
  const imgBare = html('img', { src: variant('-bare'), alt: '无 width/height/viewBox', id: 'size-bare' });
  const imgNoXmlns = html('img', { src: variant('-noxmlns'), alt: '无 xmlns：浏览器按 XML 树处理', id: 'size-noxmlns', style: `color:${H.bad};font:11px ${FONT_CJK}` });
  const fallbackContent = () => html('div', { class: 'fallback' }, html('b', {}, '回退内容'), html('br'), 'missing.svg 无法取得，<object> 显示其子内容。');
  const objMissing = html('object', { data: MISSING_FILE, type: 'image/svg+xml', width: 156, height: 58, id: 'size-missing' }, fallbackContent());
  const objMalformed = html('object', { data: variant('-malformed'), type: 'image/svg+xml', width: 156, height: 58, id: 'size-malformed' }, '（若无错误页则显示此回退）');
  const sizes = html('div', { class: 'h-html sizes' },
    sizeCell(imgOriginal, 'width="800" height="660"', 'size-cap-original', '→ 800×660 · 溢出容器被裁'),
    sizeCell(imgRatio, '-ratio.svg 只留 viewBox', 'size-cap-ratio', '→ 撑满容器宽 · 保持 800∶660'),
    sizeCell(imgBare, '-bare.svg 无尺寸无 viewBox', 'size-cap-bare', '→ 默认 300×150'),
    sizeCell(imgNoXmlns, '-noxmlns.svg 缺 xmlns', 'size-cap-noxmlns', '→ 非 SVG 命名空间 · 只显示 alt'),
    sizeCell(objMissing, '<object data="missing">', 'size-cap-missing', '→ 404 · 回退内容'),
    sizeCell(objMalformed, '-malformed.svg 未转义的 &', 'size-cap-malformed', '→ XML 不合法 · 解析错误页'),
  );
  cardC.append(el('foreignObject', { x: COL_X + 12, y: 540, width: COL_W - 24, height: 180 }, sizes));

  // ── bottom strip D: accession catalogue = reading order (concept:screen-reader-reading-order, concept:role-group) ──
  const cardD = section(stage, PANEL_X, 736, 400, 156, '编号目录 · role="list" · 屏幕阅读器按 DOM 序读 M-01→M-07', '');
  const list = el('g', { role: 'list', 'aria-label': '器物部位编号目录' });
  PARTS.forEach((p, i) => {
    const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
    const x = PANEL_X + 20 + col * 190, y = 780 + row * 18;
    list.append(el('g', { role: 'listitem', class: 'legend-row', 'data-accession': p.accession },
      el('circle', { class: 'dot', cx: x, cy: y - 4, r: 4, 'data-accession': p.accession }),
      text(`${p.accession} ${p.name}`, { x: x + 10, y, class: 'lg' }),
      text(`绘制序 ${p.paint}`, { x: x + 96, y, class: 'pi' })));
  });
  cardD.append(list,
    el('line', { x1: PANEL_X + 20, y1: 862, x2: PANEL_X + 60, y2: 862, stroke: H.dim, 'stroke-width': 1, 'stroke-dasharray': '4 3' }),
    text('绘制序（虚线）', { x: PANEL_X + 66, y: 866, class: 'h-note' }),
    el('line', { x1: PANEL_X + 170, y1: 862, x2: PANEL_X + 210, y2: 862, stroke: H.accent, 'stroke-width': 1.4 }),
    text('编号序（实线）= DOM 序 = Tab 序', { x: PANEL_X + 216, y: 866, class: 'h-note' }),
    text('口沿最先落笔却编号 M-03；热点悬停/聚焦时本目录同行高亮（:has）', { x: PANEL_X + 20, y: 884, class: 'h-note' }));

  // ── bottom strip E: keyboard, focus, metadata (concept:keyboard-events, api:SVGElement.focus, el:metadata) ──────────
  const cardE = section(stage, 444, 736, 672, 156, '键盘 · 焦点 · 档案元数据 · 换行对照', 'Tab · ← → · Space/Enter · focus()');
  const notes = html('div', { class: 'h-html notes' },
    html('p', {}, html('b', {}, 'Tab'), ' 沿 M-01→M-07 推进（DOM 序）· ', html('b', {}, '←/→'), ' 沿轮廓 path 以 12 px 步进移动测量游标（getPointAtLength）· ', html('b', {}, 'Space/Enter'), ' 翻转 aria-pressed 并勾选「剖面」→ :root:has(#layer-section:checked) .layer-section{display:block}，不经 JS。'),
    html('p', {}, '焦点环 .hotspot:focus 3 px + :focus-visible 虚线 outline · focus 事件写 .kbd-focus 镜像类 · 表单外框 :focus-within · 「聚焦 M-04」→ SVGElement.focus()。'),
    html('p', { id: 'host-meta' }, '档案元数据 · 读取中…'),
    html('p', { id: 'host-compare' }, '换行对照 · 测量中…'),
    html('p', { id: 'host-digest' }, 'SHA-256 · 计算中…'),
  );
  cardE.append(el('foreignObject', { x: 456, y: 762, width: 648, height: 126 }, notes));

  // ── bottom strip F: rasterisation archive (concept:svg-to-canvas-rasterization) ────────────────────────────────────
  const canvas = html('canvas', { width: 240, height: 132, id: 'archive-canvas' });
  const badge = html('span', { class: 'badge', id: 'raster-badge' }, '栅格化中…');
  const archiveBtn = html('button', { type: 'button', id: 'btn-archive' }, '存档 ↻');
  stage.append(el('foreignObject', { x: 1128, y: 736, width: 240, height: 156 },
    html('div', { class: 'h-html archive' }, html('div', { class: 'row' }, archiveBtn, badge), canvas)));

  // ── run the document script against the inline copy (shares the page DOM: same behaviour as in <object>) ───────────
  new Function('root', SCRIPT_BODY)(inlineRoot);

  // ── probes that need loaded resources ──────────────────────────────────────────────────────────────────────────────
  const loadables = Array.from(stage.querySelectorAll<HTMLElement>('img, object'));
  await Promise.all(loadables.map(node => settled(node)));

  // Dark tile: color-scheme propagation into the <img> document. If the paper stayed light (Firefox), fall back to the
  // <object>+#dark mirror so the still frame keeps five identities.
  const darkImg = identities[1].node as HTMLImageElement;
  if (!imgIsDark(darkImg)) {
    const fallback = objectCopy('#dark', 96, 79);
    darkImg.replaceWith(fallback);
    setText(tiles, '.tile[data-identity="dark"] .mode', 'object · #dark 镜像（img 未传播 color-scheme）');
    await settled(fallback);
  }

  // 404 example: a dev server that rewrites unknown paths to index.html hands the <object> an HTML page instead of a
  // failure; detect that and retry against a same-host port nothing listens on, so the fallback content really shows.
  if (objMissing.contentDocument?.documentElement?.localName === 'html') {
    const retry = html('object', { data: UNREACHABLE_FILE, type: 'image/svg+xml', width: 156, height: 58, id: 'size-missing' }, fallbackContent());
    objMissing.replaceWith(retry);
    setText(sizes, '#size-cap-missing', '→ 回退内容 · dev 无真 404');
    await settled(retry);
  }

  // SHA-256: the in-memory source that feeds every <img> data: URI equals the committed file behind every <object>.
  try {
    const fileText = await (await fetch(LABEL_FILE)).text();
    const [a, b] = await Promise.all([sha256Hex(source), sha256Hex(fileText)]);
    setText(notes, '#host-digest', a === b
      ? `SHA-256 一致 ✓ ${a.slice(0, 16)}… · img data: URI 与 object 文件同一摘要 · 5 瓦片 + 3 嵌入引用同一份文件。`
      : `SHA-256 漂移 ✗ 内嵌 ${a.slice(0, 12)} ≠ 文件 ${b.slice(0, 12)} — 请重新生成 public/museum-label-panel/。`);
    stage.dataset.digestMatch = String(a === b);
  } catch { setText(notes, '#host-digest', 'SHA-256 · 无法读取文件'); }

  // <img>: intrinsic size known, DOM unreachable. <object>: contentDocument readable (api:HTMLObjectElement.contentDocument).
  setText(embeds, '#status-img', `naturalWidth ${imgCopy.naturalWidth} · 无 DOM 可读`);
  const objDoc = objCopy.contentDocument;
  if (objDoc?.documentElement?.localName === 'svg') {
    const stamp = objDoc.getElementById('script-stamp')?.textContent ?? '';
    setText(embeds, '#status-object', `跨文档读取成功 · ${stamp.split(' · ')[0]}`);
    const dc = (name: string) => objDoc.getElementsByTagNameNS(DC_NS, name)[0]?.textContent ?? '?';
    const accession = objDoc.getElementById('vessel')?.getAttributeNS(MUSEUM_NS, 'accession') ?? '?';
    setText(notes, '#host-meta', `元数据 · 4 字段 · 无可见输出 — dc:title ${dc('title')} · dc:date ${dc('date')} · dc:identifier ${dc('identifier')} · dc:rights ${dc('rights')} · museum:accession="${accession}"（getAttributeNS，渲染忽略）。`);
    mark(stage, 'api:HTMLObjectElement.contentDocument', 'concept:cross-document-svg-scripting', 'concept:metadata-rdf-dublin-core', 'concept:foreign-namespace-attributes-ignored');
  } else {
    setText(embeds, '#status-object', 'contentDocument 不可用');
    setText(notes, '#host-meta', '档案元数据 · object 文档不可读');
  }
  // Inline copy facts written back from the shared DOM.
  const foCount = inlineRoot.querySelectorAll('foreignObject').length;
  setText(inlineCard, '#inline-fo-count', `foreignObject × ${foCount}`);
  setText(inlineCard, '#inline-stamp', inlineRoot.querySelector('#script-stamp')?.textContent ?? '');
  const para = inlineRoot.querySelector<HTMLParagraphElement>('#fo-desc p')!;
  const lineHeight = parseFloat(getComputedStyle(para).lineHeight) || 21;
  const lines = Math.round(para.getBoundingClientRect().height / lineHeight);
  setText(inlineCard, '#inline-lines', `正文自动换行 ${lines} 行`);
  // Wrapping comparison (api:SVGTextContentElement.getComputedTextLength): the same sentence as one SVG <text>.
  const compare = inlineRoot.querySelector<SVGTextElement>('#compare-text')!;
  const runLength = compare.getComputedTextLength();
  setText(notes, '#host-compare', `换行对照 · 首句 ${FIRST_SENTENCE.length} 字：SVG <text> getComputedTextLength() = ${runLength.toFixed(0)} px > 456，一行横穿、clipPath 裁于 776；foreignObject 内自动折为 ${lines} 行。`);
  stage.dataset.compareLength = runLength.toFixed(1);
  stage.dataset.descLines = String(lines);

  // Intrinsic-size measurements (getBoundingClientRect on the loaded <img>s).
  const measure = (img: HTMLImageElement, id: string, note: string) => {
    const r = img.getBoundingClientRect();
    setText(sizes, `#${id}`, `${note} · 实测 ${r.width.toFixed(0)}×${r.height.toFixed(0)} px`);
  };
  measure(imgOriginal, 'size-cap-original', '800×660');
  measure(imgRatio, 'size-cap-ratio', '撑满宽');
  measure(imgBare, 'size-cap-bare', '默认');
  setText(sizes, '#size-cap-noxmlns', `只显示 alt · naturalWidth ${imgNoXmlns.naturalWidth}`);

  // Rasterise the inline copy (XMLSerializer → data: URI → Image → drawImage) and self-check whether the HTML inside
  // foreignObject made it into the bitmap (concept:foreignobject-canvas-rasterization).
  const rasterise = async () => {
    const result = await drawArchive(inlineRoot, canvas);
    badge.textContent = result.participated ? 'foreignObject 已参与栅格化' : 'foreignObject 未参与栅格化';
    badge.classList.toggle('missing', !result.participated);
    stage.dataset.rasterParticipated = String(result.participated);
    stage.dataset.rasterInk = String(result.inkPixels);
  };
  archiveBtn.addEventListener('click', () => { void rasterise(); });
  await rasterise();

  // ── export pose: keyboard focus on M-03 so the focus ring + live announcement are in the still frame ──────────────
  if (exportMode) {
    inlineRoot.querySelector<SVGRectElement>('[data-accession="M-03"]')?.focus(); // api:SVGElement.focus
  }

  mark(stage,
    'concept:standalone-svg-document', 'concept:svg-auto-sizing', 'concept:intrinsic-sizing-of-embedded-svg',
    'concept:foreignobject-html-text-wrapping', 'concept:foreignobject-form-controls', 'concept:foreignobject-css-grid-flex',
    'concept:foreignobject-mathml', 'concept:foreignobject-video', 'concept:foreignobject-transform', 'concept:foreignobject-filter-clip-mask',
    'concept:foreignobject-overflow-clipping', 'concept:foreignobject-xmlns-requirement', 'concept:foreignobject-canvas-rasterization',
    'concept:svg-as-img-restrictions', 'concept:svg-as-object-embed-iframe', 'concept:svg-script-security-context', 'concept:animation-in-img-context',
    'concept:svg-to-canvas-rasterization', 'concept:xml-entities-and-cdata', 'concept:xml-well-formedness-errors',
    'css:media-print', 'css:media-width-in-standalone-svg', 'css:prefers-color-scheme', 'css:forced-colors', 'css:prefers-contrast',
    'css:custom-properties', 'css:root-selector-scope', 'css:supports-rule', 'css:light-dark-function', 'css:property-registered-animation',
    'css:container-queries', 'css:presentation-attribute-specificity', 'concept:var-in-presentation-attribute', 'css:system-colors',
    'concept:aria-live', 'concept:role-button-keyboard', 'concept:role-group', 'concept:role-graphics-document', 'concept:screen-reader-reading-order',
    'concept:tabindex-focusable-svg-elements', 'concept:tabindex-focus-order', 'concept:keyboard-events', 'concept:focus-events',
    'api:SVGElement.focus', 'api:SVGTextContentElement.getComputedTextLength',
    'css:focus', 'css:focus-visible', 'css:focus-within', 'css:outline', 'css:has', 'css:checked-sibling-toggle',
    'concept:title-placement-first-child', 'concept:custom-tooltip', 'concept:html-controls-via-foreignObject', 'concept:svg-text-accessibility-and-find');
}

// ── helpers ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function section(stage: SVGSVGElement, x: number, y: number, w: number, h: number, title: string, aside: string): SVGGElement {
  const g = el('g', { class: 'h-section' },
    el('rect', { x, y, width: w, height: h, rx: 6, class: 'h-card' }),
    text(title, { x: x + 12, y: y + 20, class: 'h-h' }));
  if (aside) g.append(text(aside, { x: x + w - 12, y: y + 20, class: 'h-mono', 'text-anchor': 'end' }));
  stage.append(g);
  return g;
}
/** Same-origin <object> copy of the label file; `hash` selects the identity mirror (`#dark`, `#forced`, `#print`). */
function objectCopy(hash: string, width: number | string, height: number | string, cls = '', style = ''): HTMLObjectElement {
  return html('object', { data: `${LABEL_FILE}${hash}`, type: 'image/svg+xml', width, height, class: cls || null, style: style || null, 'aria-label': `彩陶双耳罐展签 ${hash || '#light'}` });
}
function embedColumn(name: string, frame: HTMLElement, flags: boolean[], status: HTMLElement): HTMLElement {
  const names = ['脚本', '表单', '悬停', '外链'];
  return html('div', { class: 'embed' },
    html('b', {}, name), frame,
    html('div', { class: 'chips' }, ...flags.map((ok, i) => html('span', { class: `chip ${ok ? 'ok' : 'bad'}` }, `${ok ? '✓' : '✗'} ${names[i]}${i === 3 && ok ? '→占位' : ''}`))),
    status);
}
function sizeCell(node: HTMLElement, label: string, capId: string, cap: string): HTMLElement {
  return html('div', { class: 'size' }, html('div', { class: 'frame' }, node), html('code', {}, label), html('span', { class: 'cap', id: capId }, cap));
}
/** Sample the paper of a loaded <img> copy: dark identity ⇒ low luminance. */
function imgIsDark(img: HTMLImageElement): boolean {
  try {
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    const ctx = probe.getContext('2d')!;
    ctx.drawImage(img, 560, 8, 60, 20, 0, 0, 1, 1); // plain paper top-right of the document
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return (r + g + b) / 3 < 110;
  } catch { return false; }
}
/** Serialize the inline copy and draw it into the archive canvas; count ink pixels inside the wrapped paragraph. */
async function drawArchive(root: SVGSVGElement, canvas: HTMLCanvasElement): Promise<{ participated: boolean; inkPixels: number }> {
  const clone = root.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('x'); clone.removeAttribute('y');
  const svgText = new XMLSerializer().serializeToString(clone);
  const image = new Image();
  image.decoding = 'sync';
  const loaded = new Promise<boolean>(resolve => { image.onload = () => resolve(true); image.onerror = () => resolve(false); });
  image.src = toDataUri(svgText);
  const ok = await loaded;
  const ctx = canvas.getContext('2d')!;
  const scale = canvas.height / LABEL_H, w = LABEL_W * scale, ox = (canvas.width - w) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1c1f25'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (ok) ctx.drawImage(image, 0, 0, LABEL_W, LABEL_H, ox, 0, w, canvas.height);
  // Sample the description paragraph area (doc 330–770 × 158–300): wrapped HTML text leaves dark ink pixels there.
  const sx = Math.round(ox + 330 * scale), sy = Math.round(158 * scale), sw = Math.round(440 * scale), sh = Math.round(142 * scale);
  const data = ctx.getImageData(sx, sy, sw, sh).data;
  let ink = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 0 && (data[i] + data[i + 1] + data[i + 2]) / 3 < 120) ink++;
  const participated = ok && ink > 40;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillStyle = H.mono;
  ctx.fillText(`archive · ${ACCESSION} · 240×${canvas.height}`, ox + 2, canvas.height - 4);
  if (!participated) {
    // Engines that drop foreignObject in image rasterisation: paint a summary line so the archive is still legible.
    ctx.fillStyle = '#2a241d';
    ctx.font = `bold 9px ${FONT_CJK}`;
    ctx.fillText('彩陶双耳罐 · 马家窑文化 · 正文见展册 p.38', ox + 96, 60);
  }
  return { participated, inkPixels: ink };
}
