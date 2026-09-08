// museum-label-panel — single source of truth for the standalone label document.
//
// `buildLabelDocument()` returns the complete XML text of museum-label.svg (`concept:standalone-svg-document`):
// XML declaration, xmlns / xmlns:xlink on the root, <metadata> (RDF / Dublin Core) → <title> → <desc> → <defs>,
// then the drawing, seven foreignObjects and a CDATA-wrapped <script>. The same string feeds every embedding:
//   • inline copy inserted into #stage (scripts re-created so they run in the page context),
//   • `<img src="data:image/svg+xml;base64,…">` copies (secure static mode),
//   • `<object data="/museum-label-panel/museum-label.svg#identity">` copies (same-origin file, scripts run).
// The committed file public/museum-label-panel/museum-label.svg MUST equal this output; the host compares SHA-256 at
// runtime and shows a warning chip when they drift. Regenerate the file with:
//   node --experimental-strip-types -e "import('./src/svg/museum-label-panel-doc.ts').then(m => require('node:fs').writeFileSync('public/museum-label-panel/museum-label.svg', m.buildLabelDocument()))"
// This module is intentionally free of DOM dependencies so Node can execute it.

export const LABEL_W = 800;
export const LABEL_H = 660;
export const LABEL_FILE = '/museum-label-panel/museum-label.svg';
export const ACCESSION = 'M-2026-118';

export type Identity = 'light' | 'dark' | 'forced' | 'print' | 'narrow';
export const IDENTITY_NAMES: Record<Identity, string> = { light: '浅色', dark: '深色', forced: '强制高对比', print: '打印', narrow: '窄幅' };

/** Vessel parts in ACCESSION order (= DOM order = Tab order). `paint` is the order the draughtsman drew them. */
export interface Part { accession: string; name: string; paint: number; rect: [number, number, number, number]; desc: string }
export const PARTS: Part[] = [
  { accession: 'M-01', name: '圈足', paint: 6, rect: [124, 428, 104, 34], desc: '圈足略外撇，足端平切，底径 10.4 cm。' },
  { accession: 'M-02', name: '鼓腹', paint: 5, rect: [96, 186, 160, 192], desc: '腹部最大径 20.0 cm，位于全器高度约五分之二处。' },
  { accession: 'M-03', name: '口沿', paint: 1, rect: [138, 96, 76, 20], desc: '口沿外侈，唇部圆钝，口径 7.6 cm；绘制时最先落笔。' },
  { accession: 'M-04', name: '双耳', paint: 4, rect: [244, 128, 42, 74], desc: '双耳对称贴附于颈肩之间，桥形，横断面近椭圆。' },
  { accession: 'M-05', name: '颈', paint: 2, rect: [144, 116, 64, 34], desc: '束颈，颈高 5.0 cm，内壁留有轮制旋痕。' },
  { accession: 'M-06', name: '肩', paint: 3, rect: [112, 150, 128, 36], desc: '溜肩，肩部以黑彩带纹为界。' },
  { accession: 'M-07', name: '纹样带', paint: 7, rect: [180, 196, 90, 110], desc: '肩腹部三组旋涡纹与波折纹，间以点纹。' },
];

export const FIRST_SENTENCE = '这件彩陶双耳罐出土于甘肃临夏东乡林家遗址第三层灰坑，属马家窑文化马家窑类型，距今约五千二百年。';
const BODY_REST = '器身以细泥红陶轮制成形，口沿外侈，束颈，溜肩，鼓腹下收，双耳对称贴附于颈肩之间，圈足略外撇。肩腹部以黑彩绘出三组连续的旋涡纹与波折纹，线条流畅而匀细，间以点纹填空，是马家窑类型彩陶中构图最为繁密的一类。器内壁残留炭化谷物痕迹，经淀粉粒分析初步判定为粟；器底可见两行墨书，字迹漫漶，尚待红外成像复核。';

// ---------------------------------------------------------------------------------------------------------------------
// Geometry (all numbers in the 800×660 user space; 10 px = 1 cm).
const CX = 176;
const f = (n: number): string => (Math.round(n * 100) / 100).toString();
type Seg = [number, number, number, number, number, number];
/** Right-hand profile from the rim corner (214,100) down to the foot join (224,440). */
const RIGHT: Seg[] = [
  [214, 118, 210, 134, 208, 150],
  [206, 172, 236, 178, 260, 190],
  [276, 202, 278, 226, 276, 250],
  [274, 282, 266, 312, 258, 330],
  [250, 356, 240, 380, 236, 400],
  [232, 418, 226, 430, 224, 440],
];
type Map2 = (x: number, y: number) => [number, number];
const pt = (m: Map2, x: number, y: number): string => { const [px, py] = m(x, y); return `${f(px)} ${f(py)}`; };
const mirror = (x: number): number => 2 * CX - x;

/** Closed outline: rim top (left→right), right profile, foot ring, left profile. Starts at the rim's LEFT corner so
 *  that the measuring cursor (getPointAtLength) moves to the RIGHT along the rim for the first 76 px. */
function outlinePath(m: Map2, withFoot = true): string {
  const d: string[] = [`M ${pt(m, 138, 100)}`, `L ${pt(m, 214, 100)}`];
  for (const s of RIGHT) d.push(`C ${pt(m, s[0], s[1])} ${pt(m, s[2], s[3])} ${pt(m, s[4], s[5])}`);
  if (withFoot) d.push(`L ${pt(m, 228, 458)}`, `L ${pt(m, 124, 458)}`, `L ${pt(m, 128, 440)}`);
  else d.push(`L ${pt(m, 128, 440)}`);
  for (let i = RIGHT.length - 1; i >= 0; i--) {
    const s = RIGHT[i];
    const [ex, ey] = i === 0 ? [138, 100] : [RIGHT[i - 1][4], RIGHT[i - 1][5]];
    d.push(`C ${pt(m, mirror(s[2]), s[3])} ${pt(m, mirror(s[0]), s[1])} ${pt(m, mirror(ex), ey)}`);
  }
  d.push('Z');
  return d.join(' ');
}
const identity: Map2 = (x, y) => [x, y];
const inner: Map2 = (x, y) => [CX + (x - CX) * 0.9, 280 + (y - 280) * 0.965];
const unit: Map2 = (x, y) => [(x - 76) / 200, (y - 100) / 358];
const HANDLE_R = 'M 206 134 C 246 128 270 156 258 186 C 254 196 246 200 240 202 C 250 192 252 168 238 154 C 230 146 218 142 206 144 Z';
const HANDLE_L = HANDLE_R.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, x, y) => `${f(mirror(+x))} ${y}`);

function gridLines(): string {
  // aria-hidden 5 mm grid (`at:g.aria-hidden`): painted, but removed from the accessibility tree.
  const out: string[] = [];
  for (let x = 30; x <= 295; x += 5) out.push(`<line x1="${x}" y1="60" x2="${x}" y2="610"${x % 10 === 0 ? ' class="major"' : ''}/>`);
  for (let y = 60; y <= 610; y += 5) out.push(`<line x1="30" y1="${y}" x2="295" y2="${y}"${y % 10 === 0 ? ' class="major"' : ''}/>`);
  return out.join('');
}
function scaleBar(): string {
  // 0–20 cm scale from Array.from({length: 21}); every 5 cm a long tick with a numeral.
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const x = 50 + i * 10, long = i % 5 === 0;
    return `<line x1="${x}" y1="${long ? 588 : 594}" x2="${x}" y2="600"/>${long ? `<text x="${x}" y="613" text-anchor="middle">${i}</text>` : ''}`;
  }).join('');
  return `<g class="scale" role="group" aria-label="比例尺 0 至 20 厘米" style="color:var(--ink)"><line x1="50" y1="600" x2="250" y2="600"/>${ticks}<text x="262" y="604" fill="currentcolor">cm</text><text x="50" y="580" fill="currentcolor" class="scale-title">比例尺 · 10 px = 1 cm</text></g>`;
}
function hotspots(): string {
  return PARTS.map((p, i) => {
    const [x, y, w, h] = p.rect;
    // <title> first child → native tooltip + accessible name (`concept:title-placement-first-child`); <desc> via aria-describedby.
    return `<rect class="hotspot part" id="hs-${p.accession}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" tabindex="0" role="button" aria-pressed="false" aria-describedby="d-${p.accession}" data-accession="${p.accession}" data-name="${p.name}" data-paint-index="${p.paint}" data-order="${i + 1}"><title>${p.name} ${p.accession}</title><desc id="d-${p.accession}">${p.desc}</desc></rect>`;
  }).join('');
}
function hotspotLabels(): string {
  return PARTS.map(p => {
    const [x, y, w] = p.rect;
    const narrow = w < 60;
    return `<text class="hs-label" x="${x + 4}" y="${y + 13}">${p.accession}</text><text class="hs-label paint" x="${narrow ? x + 4 : x + w - 4}" y="${narrow ? y + 27 : y + 13}"${narrow ? '' : ' text-anchor="end"'}>绘${p.paint}</text>`;
  }).join('');
}
const center = (p: Part): [number, number] => [p.rect[0] + p.rect[2] / 2, p.rect[1] + p.rect[3] / 2];
function orderPolylines(): string {
  const byPaint = [...PARTS].sort((a, b) => a.paint - b.paint);
  const paintPts = byPaint.map(p => { const [x, y] = center(p); return `${x - 6},${y}`; }).join(' ');
  const accPts = PARTS.map(p => { const [x, y] = center(p); return `${x + 6},${y}`; }).join(' ');
  return `<polyline class="order-paint" points="${paintPts}"/><polyline class="order-acc" points="${accPts}"/>`;
}
const XRF_PTS: [number, number][] = [[580, 540], [604.5, 533], [629, 523], [653.5, 486], [678, 514], [702.5, 534], [727, 504], [751.5, 537], [776, 541]];

// ---------------------------------------------------------------------------------------------------------------------
// Identity CSS. Each media block is mirrored by a `:root[data-identity="…"]` selector so the host can show all five
// identities in one still frame (`css:prefers-color-scheme`, `css:forced-colors`, `css:media-print`,
// `css:media-width-in-standalone-svg`). Written once here, emitted twice.
type Rule = [string, string];
function identityBlock(query: string, id: Identity, rules: Rule[]): string {
  const body = rules.map(([sel, decl]) => `${sel}{${decl}}`).join('\n  ');
  // Every selector of a comma list gets the mirror prefix (a bare `.label …` would hide the element unconditionally).
  const prefix = (sel: string): string => sel.trim() === ':root' ? `:root[data-identity="${id}"]` : `:root[data-identity="${id}"] ${sel.trim()}`;
  const mirrored = rules.map(([sel, decl]) => `${sel.split(',').map(prefix).join(',')}{${decl}}`).join('\n');
  return `/* ${IDENTITY_NAMES[id]} — ${query} (mirror: :root[data-identity="${id}"]) */\n@media ${query}{\n  ${body}\n}\n${mirrored}\n`;
}
const DARK: Rule[] = [[':root', '--paper:#1d1a16;--ink:#ece2cc;--rule:#a89373;--accent:#e5936c;--hair:#3a332a;--plate:#2a251f;--cell:#2b2620;--cell-ink:#ece2cc;--tag:#5a4a33;--tag-ink:#f2e8d2']];
const FORCED: Rule[] = [
  [':root', '--paper:Canvas;--ink:CanvasText;--rule:CanvasText;--accent:Highlight;--hair:GrayText;--plate:Canvas;--cell:Highlight;--cell-ink:HighlightText;--tag:Canvas;--tag-ink:CanvasText'],
  ['.label .grid line', 'stroke-width:1'],
  ['.label .hotspot', 'fill-opacity:0;stroke-width:2'],
  ['.label .plate', 'stroke:CanvasText;stroke-width:2'],
  ['.label .live', 'border:2px solid CanvasText'],
];
const PRINT: Rule[] = [
  [':root', '--paper:#ffffff;--ink:#000000;--rule:#000000;--accent:#000000;--hair:#c8c8c8;--plate:#ffffff;--cell:#ffffff;--cell-ink:#000000;--tag:#ffffff;--tag-ink:#000000'],
  ['.label #fo-form,.label .hotspots,.label .hs-labels,.label .btn,.label #fo-redact,.label .dot,.label .order-paint,.label .order-acc,.label .focus-layer,.label .stamp', 'display:none'],
  ['.label .print-only', 'display:block'],
  ['.label .plate', 'stroke:#000;stroke-width:.75'],
  ['.label .layer-pattern', 'filter:grayscale(1)'],
  ['.label .live', 'background:#fff;color:#000;border:1px solid #000'],
];
const NARROW: Rule[] = [
  [':root', '--plate:var(--accent);--tag:var(--paper)'],
  ['.label .heading,.label .heading-en,.label .eyebrow,.label .accession,.label #fo-desc,.label #fo-math,.label .xrf,.label .compare,.label .compare-note,.label #fo-redact,.label .dim,.label .grid,.label .stamp,.label .dot,.label .rule,.label .order-paint,.label .order-acc,.label .hs-labels', 'display:none'],
  ['.label .heading-narrow', 'display:block'],
  ['.label .col-draw,.label .hotspots,.label .focus-layer', 'transform:translate(80px,10px)'],
  ['.label .geometry path,.label .geometry line,.label .scale line', 'stroke:var(--paper)'],
  ['.label .scale text,.label .scale', 'color:var(--paper);fill:var(--paper)'],
  ['.label .geometry .hatch', 'fill:none'],
  ['.label .layer-pattern .ink', 'stroke:var(--paper)'],
  ['.label #fo-grid', 'overflow:visible;transform:translate(120px,-196px)'],
  ['.label .info-wrap', 'width:260px;height:auto;overflow:visible'],
  ['.label .info-grid', 'grid-template-columns:1fr'],
  ['.label #fo-form', 'transform:translate(100px,0)'],
  ['.label .form-box', 'width:356px'],
];

function styleSheet(): string {
  return `
/* css:property-registered-animation — registered custom property gets a real 240 ms transition */
@property --accent { syntax: '<color>'; inherits: true; initial-value: #b4452a; }
/* css:custom-properties + css:root-selector-scope — in the standalone file :root IS this <svg>; inline it is <html> */
:root {
  --paper:#efe2c6; --ink:#2a241d; --rule:#8a7659; --accent:#b4452a; --hair:#cdbd97; --plate:#e4d3ae; --cell:#f7efdd; --cell-ink:#2a241d; --tag:#d9b98a; --tag-ink:#3a2c1a;
  --font-cjk:'Studio CJK','Studio Sans','Noto Sans CJK SC','Noto Sans CJK JP','PingFang SC',sans-serif;
  --font-serif:'Studio Serif','Noto Serif CJK SC','Noto Serif CJK JP',Georgia,serif;
  --font-mono:'Studio Mono','Latin Modern Mono',Menlo,Consolas,monospace;
  transition: --accent 240ms;
}
.label{font-family:var(--font-cjk);color:var(--ink);color-scheme:light dark}
.label:focus{outline:none}
.label .paper{fill:var(--paper)}
.label .plate{fill:var(--plate)}
.label .grid line{stroke:var(--hair);stroke-width:.4;stroke-opacity:.7}
.label .grid line.major{stroke-width:.8}
.label .geometry path,.label .geometry line{fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}
.label .geometry .hatch{fill:url(#p-hatch);stroke:none}
.label .geometry .thin{stroke-width:.8}
.label .dim line,.label .dim path{stroke:var(--rule);stroke-width:.9;fill:none}
.label .dim text,.label .scale text{fill:var(--rule);font-size:11px;font-family:var(--font-mono)}
.label .scale line{stroke:var(--ink);stroke-width:1}
.label .scale .scale-title{font-family:var(--font-cjk);font-size:11px}
.label .layer-pattern{display:none}
:root:has(#layer-pattern:checked) .layer-pattern{display:block}
.label .layer-section{display:none}
:root:has(#layer-section:checked) .layer-section{display:block}
.label .layer-section .wall{fill:url(#p-dense)}
.label .layer-section .void{fill:var(--paper)}
.label .layer-pattern .ink{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
.label .layer-pattern .brand{fill:var(--accent);forced-color-adjust:none}
.label text{font-family:var(--font-cjk);fill:var(--ink)}
.label .eyebrow{font-size:11px;letter-spacing:.18em;fill:var(--rule)}
.label .heading{font-family:var(--font-serif);font-size:30px;font-weight:700}
.label .heading-en{font-family:var(--font-serif);font-style:italic;font-size:12px;fill:var(--rule)}
.label .heading-narrow{display:none;font-family:var(--font-mono);font-size:40px;font-weight:700;fill:var(--accent)}
.label .accession{font-family:var(--font-mono);font-size:13px;fill:var(--accent)}
/* css:presentation-attribute-specificity — the line is authored stroke="#999"; this rule wins */
.label .rule{stroke:var(--accent);stroke-width:2}
.label .stamp,.label .caption{font-family:var(--font-mono);font-size:11px;fill:var(--rule)}
.label .seal-mark{fill:none;stroke:var(--accent);stroke-width:1.4;stroke-linejoin:round;stroke-dasharray:2 2}
.label .seal-text{font-size:11px;fill:var(--accent)}
.label .dot{fill:var(--accent);animation:breathe 1.6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.2;r:3}50%{opacity:1;r:4.5}}
@supports (color: light-dark(#fff,#000)){.label .ld{fill:light-dark(#b4452a,#e5936c)}}
.label .compare{font-size:12px;fill:var(--ink);opacity:.85}
.label .compare-note{font-size:11px;fill:var(--accent)}
.label .xrf polyline{fill:none;stroke:var(--ink);stroke-width:1.2;stroke-linejoin:round}
.label .xrf .axis{stroke:var(--rule);stroke-width:.8}
.label .xrf .pick{fill:var(--accent)}
.label .xrf text{font-size:11px;fill:var(--rule);font-family:var(--font-mono)}
.label .leader{stroke:var(--accent);stroke-width:1;fill:none;stroke-dasharray:3 2}
/* concept:tabindex-focusable-svg-elements / css:focus / css:focus-visible / css:outline */
.label .hotspot{fill:var(--accent);fill-opacity:.07;stroke:var(--accent);stroke-opacity:.6;stroke-width:1;stroke-dasharray:3 2;cursor:pointer;transition:opacity 160ms}
.label .hotspot:focus{stroke-width:3;stroke-dasharray:none;stroke-opacity:1;outline:none}
.label .hotspot:focus-visible,.label .hotspot.kbd-focus{stroke-width:3;stroke-dasharray:none;stroke-opacity:1;outline:2px dashed var(--accent);outline-offset:4px}
.label .hotspot[aria-pressed="true"]{fill-opacity:.22}
/* css:has — hovering one hotspot dims its siblings */
.label:has(.hotspot:hover) .hotspot:not(:hover){opacity:.35}
.label .hs-label{font-family:var(--font-mono);font-size:11px;fill:var(--accent);pointer-events:none}
.label .hs-label.paint{fill:var(--rule)}
.label .order-paint{fill:none;stroke:var(--rule);stroke-width:1;stroke-dasharray:4 3}
.label .order-acc{fill:none;stroke:var(--accent);stroke-width:1.2}
.label .tip{pointer-events:none;display:none}
.label .tip.on{display:block}
.label .tip rect{fill:var(--ink);rx:3}
.label .tip text{fill:var(--paper);font-size:11px}
.label .cursor circle{fill:var(--paper);stroke:var(--accent);stroke-width:2}
.label .cursor text{font-family:var(--font-mono);font-size:11px;fill:var(--accent)}
.label .print-only{display:none}
.label .print-only line{stroke:#000;stroke-width:.6}
.label .print-only text{font-family:var(--font-mono);font-size:11px;fill:#000}
/* XHTML inside the foreignObjects (each root div carries xmlns="http://www.w3.org/1999/xhtml") */
.label .html{margin:0;font:14px/1.5 var(--font-cjk);color:var(--ink)}
.label .desc-box{display:flex;flex-direction:column;height:176px;overflow:hidden}
.label .desc-box p{margin:0;flex:1;overflow:hidden;text-align:justify;text-justify:inter-ideograph}
.label .desc-box .more{font-size:11px;color:var(--accent);text-align:right;font-family:var(--font-mono);flex:none;padding-top:4px}
.label .info-wrap{container-type:inline-size;height:112px;overflow:hidden}
.label .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 14px;list-style:none;margin:0;padding:0}
.label .info-grid li{border-top:1px solid var(--rule);padding-top:3px}
.label .info-grid .k{display:block;font-size:11px;letter-spacing:.14em;color:var(--rule);font-family:var(--font-mono)}
.label .info-grid .v{display:block;font-size:13px;line-height:1.35;color:var(--cell-ink);background:var(--cell);padding:2px 5px;margin-top:2px}
@container (max-width:300px){.label .info-grid{grid-template-columns:1fr}}
.label .math-box{display:flex;align-items:center;gap:10px;height:90px;box-sizing:border-box;padding:0 4px;border-left:2px solid var(--accent)}
.label .math-box .k{font-size:11px;line-height:1.35;color:var(--rule);font-family:var(--font-mono);width:78px;flex:none}
.label math{font-size:17px;color:var(--ink)}
.label .math-fallback{display:none}
.label .form-box{display:flex;align-items:center;gap:6px;height:56px;padding:0 8px;border:1px dashed var(--rule);border-radius:4px;box-sizing:border-box;font-size:12px;background:var(--cell)}
.label .form-box:focus-within{border-style:solid;box-shadow:0 0 0 2px var(--accent)}
.label .form-box label{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.label .form-box input[type=text]{width:118px;font:12px var(--font-cjk);padding:2px 4px}
.label .form-box select,.label .form-box button{font:12px var(--font-cjk)}
.label .live{display:flex;align-items:center;gap:8px;height:30px;padding:0 8px;box-sizing:border-box;background:var(--ink);color:var(--paper);font:12px var(--font-mono);white-space:nowrap;overflow:hidden}
.label .live .chip{background:var(--accent);color:#fff;padding:0 6px;border-radius:2px;font-weight:700;font-size:11px;forced-color-adjust:none}
.label .live p{margin:0}
.label .tag{box-sizing:border-box;width:120px;height:80px;padding:6px 8px 4px;background:var(--tag);color:var(--tag-ink);border:1px solid rgba(0,0,0,.25);border-radius:3px;box-shadow:1px 2px 3px rgba(0,0,0,.25);font:11px/1.3 var(--font-cjk)}
.label .tag .hole{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--paper);border:1px solid rgba(0,0,0,.35);vertical-align:-1px;margin-right:4px}
.label .tag .row{display:flex;gap:4px;align-items:flex-start;margin-top:3px}
.label .tag iframe{border:1px solid rgba(0,0,0,.3);background:#fff;flex:none}
.label .tag canvas{width:44px;height:44px;flex:none;clip-path:url(#c-vessel)}
.label .redact{box-sizing:border-box;width:110px;height:110px;padding:22px 10px 0;border-radius:50%;background:var(--tag);color:var(--tag-ink);font:11px/1.35 var(--font-cjk);text-align:center}
.label .redact b{display:block;font-size:11px;margin-bottom:2px}
/* concept:foreignobject-filter-clip-mask — hover/focus swaps the blur filter reference (3.2 → 0.2) */
.label #fo-redact{filter:url(#f-redact);cursor:help}
.label #fo-redact:hover,.label #fo-redact:focus-within{filter:url(#f-reveal)}
.label #fo-redact .redact:focus{outline:2px dashed var(--accent);outline-offset:-2px}
/* css:prefers-contrast — thin hairlines become ink-coloured */
@media (prefers-contrast: more){:root{--hair:var(--ink);--rule:var(--ink)} .label .grid line{stroke-width:1}}
${identityBlock('(prefers-color-scheme: dark)', 'dark', DARK)}
${identityBlock('(forced-colors: active)', 'forced', FORCED)}
${identityBlock('print', 'print', PRINT)}
${identityBlock('(max-width: 420px)', 'narrow', NARROW)}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// The document script (CDATA). Runs in <object>/<iframe> copies and — invoked by the host with the inline root as
// `root` — in the inline copy; it never runs inside <img> (`concept:svg-script-security-context`).
// Deterministic: no Date / Math.random. `SCRIPT_BODY` expects a `root` binding (the <svg class="label"> element).
export const SCRIPT_BODY = `
  var doc = root.ownerDocument, win = doc.defaultView;
  var standalone = root === doc.documentElement;
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var NAMES = { light: '浅色', dark: '深色', forced: '强制高对比', print: '打印', narrow: '窄幅' };
  /* identity mirror from the fragment: museum-label.svg#dark → :root[data-identity="dark"] */
  var hash = standalone && win && win.location.hash ? win.location.hash.slice(1) : '';
  if (NAMES[hash] && hash !== 'light') root.setAttribute('data-identity', hash);
  var exportMode = false;
  try { exportMode = /[?&]export=1/.test(win.top.location.search); } catch (e) { exportMode = false; }
  root.setAttribute('data-script', standalone ? 'standalone' : 'inline');
  var stamp = $('#script-stamp');
  if (stamp) stamp.textContent = '脚本已运行 · ' + (standalone ? 'object 独立文档' : 'inline · 与宿主同一 DOM');
  /* aria-live announcer (concept:aria-live) — every focus / pointermove / form input passes through here */
  var live = $('#live-text'), hotspots = $$('.hotspot'), msg = $('#msg'), who = $('#who'), echo = $('#form-echo');
  var focused = null;
  function identityName() { return NAMES[root.getAttribute('data-identity') || 'light']; }
  function count() { return msg && msg.value ? msg.value.replace(/\\s+/g, '').length : 0; }
  function announce() {
    if (!live) return;
    var idx = focused ? hotspots.indexOf(focused) + 1 : 0;
    var part = focused ? focused.getAttribute('data-accession') + ' ' + focused.getAttribute('data-name') : '—';
    live.textContent = '焦点 ' + part + ' · 顺序 ' + idx + '/' + hotspots.length + ' · 身份 ' + identityName() + ' · 留言 ' + count() + ' 字';
    if (win && typeof win.__INTERACTION_COUNT__ === 'number') win.__INTERACTION_COUNT__ += 1;
  }
  /* custom SVG tooltip (concept:custom-tooltip) mirrors the native <title> tooltip so it can appear in a still frame */
  var tip = $('.tip'), tipText = tip && tip.querySelector('text'), tipRect = tip && tip.querySelector('rect');
  function showTip(h) {
    if (!tip) return;
    var x = +h.getAttribute('x'), y = +h.getAttribute('y'), w = +h.getAttribute('width');
    tip.classList.add('on');
    tipText.textContent = h.querySelector('title').textContent + ' · 绘制序 ' + h.getAttribute('data-paint-index');
    var tw = tipText.getComputedTextLength() + 12;
    tipRect.setAttribute('width', tw);
    var tx = x + w + 6; if (tx + tw > 300) tx = x - tw - 6;
    tip.setAttribute('transform', 'translate(' + tx + ' ' + (y - 4) + ')');
  }
  function hideTip() { if (tip) tip.classList.remove('on'); }
  /* measuring cursor rides the outline path: ArrowLeft/Right step 12 px via getPointAtLength (concept:keyboard-events) */
  var outline = $('#outline'), cursor = $('.cursor'), cDot = cursor && cursor.querySelector('circle'), cText = cursor && cursor.querySelector('text');
  var total = outline ? outline.getTotalLength() : 0, pos = 0;
  function placeCursor() {
    if (!outline || !total) return;
    var p = outline.getPointAtLength(((pos % total) + total) % total);
    cDot.setAttribute('cx', p.x); cDot.setAttribute('cy', p.y);
    cText.setAttribute('x', p.x + 8); cText.setAttribute('y', p.y - 8);
    cText.textContent = 's=' + Math.round(pos) + ' (' + p.x.toFixed(0) + ',' + p.y.toFixed(0) + ')';
    root.setAttribute('data-cursor-x', p.x.toFixed(2));
  }
  var sectionBox = $('#layer-section');
  function toggle(h) { /* role=button + aria-pressed (concept:role-button-keyboard); the checkbox drives .layer-section via :has(:checked) */
    var on = h.getAttribute('aria-pressed') !== 'true';
    h.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (sectionBox) sectionBox.checked = on;
    announce();
  }
  hotspots.forEach(function (h) {
    h.addEventListener('focus', function () { focused = h; h.classList.add('kbd-focus'); showTip(h); announce(); });
    h.addEventListener('blur', function () { h.classList.remove('kbd-focus'); hideTip(); });
    h.addEventListener('pointerenter', function () { showTip(h); });
    h.addEventListener('pointerleave', function () { if (focused !== h) hideTip(); else showTip(focused); });
    h.addEventListener('click', function () { toggle(h); });
    h.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { pos += 12; placeCursor(); announce(); e.preventDefault(); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { pos -= 12; placeCursor(); announce(); e.preventDefault(); }
      else if (k === ' ' || k === 'Spacebar' || k === 'Enter') { toggle(h); e.preventDefault(); }
    });
  });
  /* HTML form controls and SVG text share one DOM (concept:foreignobject-form-controls) */
  function echoForm() { if (echo) echo.textContent = '留言 ' + count() + ' 字 · ' + (who ? who.value : '观众') + ' · 待审'; announce(); }
  if (msg) msg.addEventListener('input', echoForm);
  if (who) who.addEventListener('change', echoForm);
  var btn = $('#btn-focus');
  if (btn) btn.addEventListener('click', function () { var t = root.querySelector('[data-accession="M-04"]'); if (t) t.focus(); }); /* api:SVGElement.focus */
  root.addEventListener('pointermove', function () { announce(); }, { passive: true });
  /* polariscope canvas inside the hanging tag (concept:foreignobject-video — canvas/iframe media in foreignObject) */
  var cv = $('#polar');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2;
      for (var i = 0; i < 12; i++) {
        var a0 = t * 2 + i * Math.PI / 6;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a0 + Math.PI / 6); ctx.closePath();
        ctx.fillStyle = 'hsl(' + ((i * 30 + t * 57) % 360) + ' 72% ' + (46 + 18 * Math.sin(t + i)) + '%)';
        ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, r * .32, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
    };
    var t = 0.37;
    if (exportMode) draw(t); else (function loop() { draw(t); t += 0.012; win.requestAnimationFrame(loop); })();
  }
  /* MathML metric sanity check: if the fraction did not lay out, show the hand-drawn SVG fraction instead */
  var frac = $('mfrac'), fallback = $('.math-fallback');
  if (frac && fallback && frac.getBoundingClientRect().height < 8) { fallback.style.display = 'block'; $('math').style.display = 'none'; }
  /* external https <image> (external-link chip): when blocked, hide Chrome's broken-image glyph so the seal placeholder shows */
  var ext = $('.seal image');
  if (ext) ext.addEventListener('error', function () { ext.setAttribute('visibility', 'hidden'); root.setAttribute('data-external', 'blocked'); });
  placeCursor();
  announce();
`;
const SCRIPT = `(function (root) {${SCRIPT_BODY}})(document.documentElement);`;

// ---------------------------------------------------------------------------------------------------------------------
export function buildLabelDocument(): string {
  const outline = outlinePath(identity);
  const innerWall = outlinePath(inner, false);
  const bodyClip = outlinePath(identity);
  const vesselUnit = outlinePath(unit);
  const xrf = XRF_PTS.map(([x, y]) => `${x},${y}`).join(' ');
  const [px, py] = XRF_PTS[3];
  const cropMarks = [[8, 8, 1, 1], [792, 8, -1, 1], [8, 652, 1, -1], [792, 652, -1, -1]]
    .map(([x, y, sx, sy]) => `<line x1="${x}" y1="${y}" x2="${x + sx * 22}" y2="${y}"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + sy * 22}"/>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:museum="urn:x-museum:label" width="${LABEL_W}" height="${LABEL_H}" viewBox="0 0 ${LABEL_W} ${LABEL_H}" role="img" aria-labelledby="lbl-title lbl-desc" aria-label="彩陶双耳罐展签" class="label" id="museum-label" tabindex="-1" xml:lang="zh-Hans">
<metadata>
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <rdf:Description rdf:about="">
      <dc:title>彩陶双耳罐 · 展签</dc:title>
      <dc:date>2026-03-04</dc:date>
      <dc:identifier>${ACCESSION}</dc:identifier>
      <dc:rights>CC BY 4.0 · 器物测绘图由考古工作站授权</dc:rights>
    </rdf:Description>
  </rdf:RDF>
</metadata>
<title id="lbl-title">彩陶双耳罐 · 展签 ${ACCESSION}</title>
<desc id="lbl-desc">展签面板：左栏为彩陶双耳罐测绘图（外轮廓、半剖斜线、尺寸线与 0 至 20 厘米比例尺），右栏为说明正文、三列信息表、铅同位素比值公式、观众留言表单与播报条；器物七个部位的热点按编号 M-01 至 M-07 依 DOM 顺序排列，Tab 键沿编号推进。</desc>
<defs>
  <pattern id="p-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--rule)" stroke-width="1"/></pattern>
  <pattern id="p-dense" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="3" stroke="var(--ink)" stroke-width="1.6"/></pattern>
  <clipPath id="c-half"><rect x="0" y="0" width="${CX}" height="${LABEL_H}"/></clipPath>
  <clipPath id="c-right"><rect x="${CX}" y="0" width="${LABEL_W - CX}" height="${LABEL_H}"/></clipPath>
  <clipPath id="c-body"><path d="${bodyClip}"/></clipPath>
  <clipPath id="c-vessel" clipPathUnits="objectBoundingBox"><path d="${vesselUnit}"/></clipPath>
  <clipPath id="c-round"><circle cx="235" cy="535" r="52"/></clipPath>
  <clipPath id="c-panel"><rect x="0" y="0" width="776" height="${LABEL_H}"/></clipPath>
  <linearGradient id="g-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".62" stop-color="#fff"/><stop offset=".84" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="m-fade" maskUnits="userSpaceOnUse" x="320" y="150" width="456" height="176"><rect x="320" y="150" width="456" height="176" fill="url(#g-fade)"/></mask>
  <filter id="f-redact" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter>
  <filter id="f-reveal" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.2"/></filter>
  <marker id="mk-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.5 L8 4 L0 7.5 Z" fill="var(--rule)"/></marker>
</defs>
<style><![CDATA[${styleSheet()}]]></style>
<rect class="paper" x="0" y="0" width="${LABEL_W}" height="${LABEL_H}" fill="var(--paper,#efe2c6)"/>
<g class="print-only" aria-hidden="true">${cropMarks}<text x="400" y="655" text-anchor="middle">${ACCESSION} · 展签打印稿 · 1/1</text></g>
<text class="caption" x="24" y="30">MUSEUM LABEL · 测绘图 1∶1 · 单位 cm</text>
<circle class="dot ld" cx="28" cy="44" r="3.5"/>
<text class="stamp" id="script-stamp" x="38" y="48">脚本未运行（img 安全静态模式）</text>
<g class="col-draw">
  <rect class="plate" x="24" y="56" width="276" height="558" rx="4" fill="var(--plate,#e4d3ae)"/>
  <g class="grid" aria-hidden="true">${gridLines()}</g>
  <g id="vessel" role="list" aria-label="彩陶双耳罐测绘图" museum:accession="${ACCESSION}">
    <g class="geometry" role="group" aria-label="器物几何" id="vessel-geom">
      <path class="hatch" d="${outline}" clip-path="url(#c-half)"/>
      <path id="outline" d="${outline}"/>
      <path class="thin" d="M 144 106 Q ${CX} 113 208 106"/>
      <path class="thin" d="M 128 440 L 224 440"/>
      <path class="handle" d="${HANDLE_R}"/>
      <path class="handle" d="${HANDLE_L}"/>
      <line class="thin" x1="${CX}" y1="92" x2="${CX}" y2="466" stroke-dasharray="6 4"/>
    </g>
    <g class="layer-pattern" role="group" aria-label="彩绘纹样" clip-path="url(#c-right)">
      <g clip-path="url(#c-body)">
        <path class="ink" d="M 176 170 L 186 162 L 196 170 L 206 162 L 216 170 L 226 162 L 236 170 L 246 162 L 256 170 L 266 162 L 276 170"/>
        <path class="ink" d="M 176 208 C 194 190 206 226 224 208 S 254 190 272 208 S 292 226 300 214"/>
        <path class="ink" d="M 176 240 C 194 222 206 258 224 240 S 254 222 272 240 S 292 258 300 246"/>
        <path class="ink" d="M 176 272 C 194 254 206 290 224 272 S 254 254 272 272 S 292 290 300 278"/>
        <circle class="brand" cx="200" cy="224" r="4.5"/><circle class="brand" cx="248" cy="224" r="4.5"/>
        <circle class="brand" cx="200" cy="256" r="4.5"/><circle class="brand" cx="248" cy="256" r="4.5"/>
        <circle class="brand" cx="224" cy="288" r="4.5"/>
        <path class="ink" d="M 176 318 L 272 318" stroke-dasharray="8 5"/>
      </g>
    </g>
    ${scaleBar()}
  </g>
  <g class="layer-section" aria-hidden="true" clip-path="url(#c-half)"><path class="wall" d="${outline}"/><path class="void" d="${innerWall}"/></g>
  <g class="dim" aria-hidden="true">
    <line x1="138" y1="88" x2="214" y2="88" marker-start="url(#mk-arrow)" marker-end="url(#mk-arrow)"/><text x="${CX}" y="84" text-anchor="middle">口径 7.6</text>
    <line x1="290" y1="100" x2="290" y2="458" marker-start="url(#mk-arrow)" marker-end="url(#mk-arrow)"/><line x1="214" y1="100" x2="292" y2="100"/><line x1="228" y1="458" x2="292" y2="458"/>
    <text x="286" y="279" text-anchor="middle" transform="rotate(-90 286 279)">通高 35.8</text>
    <line x1="76" y1="472" x2="276" y2="472" marker-start="url(#mk-arrow)" marker-end="url(#mk-arrow)"/><line x1="76" y1="250" x2="76" y2="474"/><line x1="276" y1="250" x2="276" y2="474"/>
    <text x="${CX}" y="486" text-anchor="middle">腹径 20.0</text>
  </g>
</g>
<text class="eyebrow" x="320" y="66">PAINTED POTTERY · 新石器时代 · 马家窑文化</text>
<text class="heading" x="320" y="100">彩陶双耳罐</text>
<text class="heading-narrow" x="776" y="120" text-anchor="end">${ACCESSION}</text>
<text class="heading-en" x="320" y="120">Painted pottery amphora with two handles · Majiayao culture, c. 3200 BCE</text>
<text class="accession" x="776" y="100" text-anchor="end">${ACCESSION}</text>
<g class="seal" aria-hidden="true">
  <!-- external link chip: the hand-drawn seal is the placeholder; the https <image> covers it only when the network
       allows (never inside <img>: secure static mode loads no external resources) -->
  <path class="seal-mark" d="M 742 42 h 30 v 30 h -30 Z M 747 49 h 20 M 747 57 h 20 M 747 65 h 12" />
  <text class="seal-text" x="757" y="80" text-anchor="middle">占位</text>
  <image href="https://museum.invalid/seal/${ACCESSION}.png" x="740" y="40" width="34" height="34"/>
</g>
<line class="rule" x1="320" y1="130" x2="776" y2="130" stroke="#999" stroke-width="2"/>
<foreignObject id="fo-desc" x="320" y="150" width="456" height="176" mask="url(#m-fade)">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html desc-box" lang="zh-Hans">
    <p>${FIRST_SENTENCE}${BODY_REST}</p>
    <div class="more">续见展册第 38 页 ›</div>
  </div>
</foreignObject>
<text class="compare-note" x="320" y="334">↓ 同一句 · SVG text 不换行 · 被 clipPath 裁于面板右缘 776</text>
<g clip-path="url(#c-panel)"><text class="compare" id="compare-text" x="320" y="347">${FIRST_SENTENCE}</text></g>
<foreignObject id="fo-grid" x="320" y="352" width="456" height="112">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html info-wrap" lang="zh-Hans">
    <ul class="info-grid" role="list">
      <li role="listitem"><span class="k">年代</span><span class="v">马家窑文化马家窑类型 · 约前 3200 年</span></li>
      <li role="listitem"><span class="k">出土</span><span class="v">甘肃临夏东乡林家遗址 T3③ H21</span></li>
      <li role="listitem"><span class="k">材质</span><span class="v">细泥红陶 · 黑彩</span></li>
      <li role="listitem"><span class="k">尺寸</span><span class="v">口径 7.6 &#x2014; 腹径 20.0 &#x2014; 通高 35.8 cm</span></li>
      <li role="listitem"><span class="k">编号</span><span class="v">${ACCESSION} · 旧藏号 LJ-77-0412</span></li>
      <li role="listitem"><span class="k">入藏</span><span class="v">1977 年考古发掘移交 · 2026 年重新著录</span></li>
    </ul>
  </div>
</foreignObject>
<foreignObject id="fo-math" x="320" y="470" width="250" height="90">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html math-box" lang="zh-Hans">
    <span class="k">铅同位素比值<br/>黑彩 · XRF 复核</span>
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      <mrow>
        <mfrac><mrow><msup><mi mathvariant="normal">Pb</mi><mn>207</mn></msup></mrow><mrow><msup><mi mathvariant="normal">Pb</mi><mn>206</mn></msup></mrow></mfrac>
        <mo>=</mo><mn>0.861</mn><mo>±</mo>
        <msqrt><mfrac><msup><mi>σ</mi><mn>2</mn></msup><mi>n</mi></mfrac></msqrt>
      </mrow>
    </math>
  </div>
</foreignObject>
<g class="math-fallback" aria-hidden="true"><text x="420" y="510" font-size="14">²⁰⁷Pb / ²⁰⁶Pb = 0.861 ± √(σ²/n)</text></g>
<g class="xrf" role="group" aria-label="XRF 谱线">
  <text x="580" y="466">XRF · counts vs keV</text>
  <line class="axis" x1="580" y1="548" x2="776" y2="548"/>
  <polyline points="${xrf}"/>
  <circle class="pick" cx="${px}" cy="${py}" r="4"/>
  <text x="${px + 8}" y="${py - 6}">Pb Lβ · 第 4 点</text>
  <path class="leader" d="M 570 508 C 600 508 620 ${py} ${px - 5} ${py}"/>
</g>
<text class="caption" x="320" y="554">观众留言 · HTML 表单与 SVG 文字同属一个 DOM</text>
<text class="caption" id="form-echo" x="776" y="554" text-anchor="end">留言 0 字 · 观众 · 待审</text>
<foreignObject id="fo-form" x="320" y="556" width="456" height="56">
  <form xmlns="http://www.w3.org/1999/xhtml" class="html form-box" onsubmit="return false" lang="zh-Hans">
    <label>留言 <input id="msg" type="text" placeholder="写给策展人…"/></label>
    <select id="who" aria-label="身份"><option>观众</option><option>研究者</option><option>学生</option></select>
    <label><input id="layer-pattern" type="checkbox" checked="checked"/>纹样</label>
    <label><input id="layer-section" type="checkbox"/>剖面</label>
    <button type="button" id="btn-focus" class="btn">聚焦 M-04</button>
  </form>
</foreignObject>
<foreignObject id="fo-live" x="24" y="620" width="752" height="30" role="status" aria-live="polite">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html live" lang="zh-Hans"><span class="chip">LIVE</span><p id="live-text">播报待命 · 脚本未运行时保持此文本</p></div>
</foreignObject>
<foreignObject id="fo-tag" x="26" y="488" width="120" height="80" transform="rotate(-5 86 528) skewX(-4)">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html tag" lang="zh-Hans">
    <div><span class="hole"></span><b>暂挂 · 待入库</b> 库房 B-12</div>
    <div class="row">
      <iframe srcdoc="&lt;body style='margin:0;font:9px/1.3 sans-serif;color:#222;padding:3px'&gt;&lt;b&gt;展册 p.38&lt;/b&gt;&lt;br/&gt;林家遗址彩陶&lt;br/&gt;图版 XII&lt;/body&gt;" width="60" height="44" title="展册页 p.38" sandbox=""></iframe>
      <canvas id="polar" width="88" height="88"></canvas>
    </div>
  </div>
</foreignObject>
<foreignObject id="fo-redact" x="180" y="480" width="110" height="110" clip-path="url(#c-round)">
  <div xmlns="http://www.w3.org/1999/xhtml" class="html redact" tabindex="0" lang="zh-Hans"><b>待考释文</b>器底墨书两行，疑为「□氏作□」，待红外成像复核。悬停或聚焦即显形。</div>
</foreignObject>
<g class="hotspots" role="group" aria-label="器物部位 · 按展品编号排列">${hotspots()}</g>
<g class="hs-labels" aria-hidden="true">${hotspotLabels()}${orderPolylines()}</g>
<g class="focus-layer" aria-hidden="true">
  <g class="cursor"><circle cx="138" cy="100" r="4"/><text x="146" y="92">s=0</text></g>
  <g class="tip"><rect x="0" y="-14" width="80" height="18" rx="3"/><text x="6" y="0">tooltip</text></g>
</g>
<script><![CDATA[${SCRIPT}]]></script>
</svg>
`;
}

/** Derived copies for the intrinsic-size row and the two ill-formed examples. */
export function labelVariants(source: string): { ratio: string; bare: string; noxmlns: string; malformed: string } {
  const sizeAttrs = ` width="${LABEL_W}" height="${LABEL_H}"`;
  const viewBox = ` viewBox="0 0 ${LABEL_W} ${LABEL_H}"`;
  return {
    ratio: source.replace(sizeAttrs, ''),                                   // only viewBox → fills container width, keeps 800:660
    bare: source.replace(sizeAttrs, '').replace(viewBox, ''),                // neither → 300×150 default
    noxmlns: source.replace(' xmlns="http://www.w3.org/2000/svg"', ''),      // root not in the SVG namespace
    malformed: source.replace('尚待红外成像复核。', '尚待红外成像复核 & 送检。'), // unescaped & → XML parse error
  };
}

export const toDataUri = (svg: string): string => `data:image/svg+xml;base64,${btoa(String.fromCharCode(...new TextEncoder().encode(svg)))}`;
