// stele-rubbing-hall — 释文卡 (interpretation card, x 920–1352 / y 96–840).
//
// The card is the "reading aid" half of the scene: a <switch> that swaps the whole transcription by system language
// (el:switch, at:switch.systemLanguage, at:switch.requiredExtensions, at:svg.lang), the branch ledger that prints every
// verdict, the bidi block (pr:direction, pr:unicode-bidi), the baseline ruler (pr:dominant-baseline,
// pr:alignment-baseline), the collation line (pr:baseline-shift, nested/absolute tspans) and the three anchor labels
// (pr:text-anchor). Everything is plain <text>/<tspan>, sized ≥ 11px.
import { el, FONT_CJK, FONT_MONO, FONT_SERIF } from './lib';

export const PALETTE = {
  ink: '#17140f', paper: '#efe6d4', indigo: '#2c4a63', cinnabar: '#b3241f', gamboge: '#d8a13a', malachite: '#4f7a63',
  card: '#f4ecdc', amber: '#c98a1a',
};
const P = PALETTE;
const MONO = `${FONT_MONO}, 'Studio CJK', monospace`;
const X0 = 944; // left text margin of the card

export interface CardHandles {
  root: SVGGElement;
  switchEl: SVGSwitchElement;
  /** Ledger rows: (index, renderedInDom, predicted) → fills the two verdict columns. */
  ledger: (rendered: boolean[], predicted: boolean[]) => void;
  ledgerHead: SVGTextElement;
  /** Bottom chips: set text + tone. */
  chip: (i: 0 | 1 | 2, label: string, tone: 'ok' | 'fallback' | 'warn') => void;
  xList: SVGTextElement;
  yList: SVGTextElement;
  readout: SVGTextElement;
}

/** Four-line paragraph: first tspan x="944" dy="0", following lines x="944" dy="1.28em" (concept:multiline-text-tspan). */
function paragraph(lines: string[], attrs: Record<string, string | number>): SVGTextElement {
  const t = el('text', { x: X0, y: 182, 'font-size': 13, fill: P.ink, ...attrs });
  lines.forEach((line, i) => t.append(el('tspan', { x: X0, dy: i === 0 ? '0' : '1.28em' }, line)));
  return t;
}

export function buildCard(): CardHandles {
  const root = el('g', { id: 'card', 'font-family': FONT_CJK });
  root.append(el('title', {}, '釋文卡 — 條件分支、雙向文本、基線校準'));
  root.append(el('rect', { x: 920, y: 96, width: 432, height: 744, rx: 6, fill: P.card, stroke: P.malachite, 'stroke-width': 2 }));
  root.append(el('line', { x1: 932, y1: 150, x2: 1340, y2: 150, stroke: P.malachite, 'stroke-width': .8, 'stroke-opacity': .7 }));

  // ── header ──────────────────────────────────────────────────────────────────────────────────────
  root.append(el('text', { x: X0, y: 128, 'font-size': 20, 'font-weight': 700, fill: P.ink }, '釋文卡'));
  root.append(el('text', { x: 1022, y: 127, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, 'switch · bidi · baselines'));
  // concept:conditional-attrs-outside-switch — conditional attributes are evaluated on any element, no <switch> needed:
  // the first <g> matches the viewer's language and shows; the second names a language nobody has and vanishes.
  const passG = el('g', { systemLanguage: 'en,en-US,zh,zh-CN,zh-Hans,zh-Hant,ja,de,fr' });
  passG.append(el('rect', { x: 1186, y: 106, width: 146, height: 16, rx: 8, fill: P.malachite, 'fill-opacity': .18 }));
  passG.append(el('text', { x: 1259, y: 118, 'font-size': 11, 'font-family': MONO, 'text-anchor': 'middle', fill: P.malachite }, 'systemLanguage 通過 · switch 外'));
  root.append(passG);
  const hiddenG = el('g', { systemLanguage: 'xx' });
  hiddenG.append(el('rect', { x: 1186, y: 126, width: 146, height: 16, rx: 8, fill: P.cinnabar }));
  hiddenG.append(el('text', { x: 1259, y: 138, 'font-size': 11, 'text-anchor': 'middle', fill: '#fff' }, '若見此條即為錯誤'));
  root.append(hiddenG);
  root.append(el('text', { x: 1259, y: 138, 'font-size': 11, 'font-family': MONO, 'text-anchor': 'middle', fill: P.indigo, 'fill-opacity': .75 }, 'systemLanguage="xx" → 隱去'));

  // ── <switch>: exactly one branch renders ─────────────────────────────────────────────────────────
  root.append(el('text', { x: X0, y: 166, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, '釋文 · <switch> 按 systemLanguage 整段替換（首個條件成立者勝）'));
  const switchEl = el('switch', { id: 'shiwen' });
  // (1) decoy — requiredExtensions can never be satisfied, so this English branch is skipped even for English viewers
  switchEl.append(paragraph([
    'DECOY — this branch must never render: requiredExtensions names',
    'an extension no viewer implements, so systemLanguage="en" alone',
    'cannot rescue it. If you can read this, conditional processing',
    'is broken in your renderer.',
  ], { requiredExtensions: 'http://example.org/svg-rubbing', systemLanguage: 'en', lang: 'en', 'font-family': FONT_SERIF, fill: P.cinnabar, 'data-cond': 'requiredExtensions=example.org/svg-rubbing + en' }));
  // (2) Simplified-Chinese viewers
  switchEl.append(paragraph([
    '释文：丙午年孟夏，碑林长廊重修完工，于是椎拓旧石以传其文。',
    '此石唐时已立，风雨剥蚀，字口渐浅；拓工以淡墨轻椎三过，',
    '纸背乃见白文，如月照石。题额循圆首之弧，碑侧题记倒读，',
    '末行残字各归实测坐标，缺字处留空不补。',
  ], { systemLanguage: 'zh,zh-Hans,zh-CN', lang: 'zh-Hans', 'font-size': 12.5, 'data-cond': 'zh,zh-Hans,zh-CN' }));
  // (3) Japanese viewers — :lang(ja) recolours this branch from the stylesheet (css:lang-selector)
  switchEl.append(paragraph([
    '釈文：丙午の年、孟夏。碑林の長廊が修復されたので、',
    '旧石を拓本にとってその文を伝える。石は唐代に立ち、',
    '風雨に蝕まれて字口は浅い。淡墨で三度軽く打ち、',
    '紙の裏に白い文字が月光のように現れた。',
  ], { systemLanguage: 'ja', lang: 'ja', 'font-size': 12.5, 'data-cond': 'ja' }));
  // (4) English viewers — what the capture pipeline (locale en-US) shows
  switchEl.append(paragraph([
    'Transcription — In the fourth month of the bingwu year the long gallery',
    'of the Forest of Steles was re-roofed, and the old stone was pounced to',
    'carry its text onward. Cut in Tang times, its incisions have worn shallow;',
    'three light passes of pale ink raised white glyphs like moonlight on stone.',
  ], { systemLanguage: 'en,en-US', lang: 'en', 'font-family': FONT_SERIF, 'data-cond': 'en,en-US' }));
  // (5) unconditional fallback — Sanskrit transliteration, forced to capitals by CSS (css:text-transform)
  switchEl.append(paragraph([
    'śilā-lekhaḥ · bīn-lín cháng-láng · bhāṇḍāgāra',
    'Forest of steles, long gallery, rubbing hall',
    'fallback branch — no systemLanguage attribute at all',
    'text-transform: uppercase applied via stylesheet',
  ], { lang: 'sa-Latn', 'font-family': FONT_SERIF, style: 'text-transform:uppercase', 'data-cond': '（無條件兜底 · lang=sa-Latn）' }));
  root.append(switchEl);

  // ── branch ledger (filled by the script once the DOM has laid out) ─────────────────────────────
  const ledgerHead = el('text', { x: X0, y: 254, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, '分支帳 · navigator.language = …');
  root.append(ledgerHead);
  root.append(el('text', { x: X0, y: 268, 'font-size': 11, 'font-family': MONO, fill: P.indigo, 'fill-opacity': .8 },
    el('tspan', { x: X0 }, '#'), el('tspan', { x: 962 }, 'systemLanguage / requiredExtensions'), el('tspan', { x: 1206 }, 'DOM 實測'), el('tspan', { x: 1272 }, 'navigator 推算')));
  const rows = [...switchEl.children].map((child, i) => {
    const y = 282 + i * 14;
    const g = el('g', { class: 'ledger-row' });
    g.append(el('text', { x: X0, y, 'font-size': 11, 'font-family': MONO, fill: P.ink }, String(i + 1)));
    g.append(el('text', { x: 962, y, 'font-size': 11, 'font-family': MONO, fill: P.ink }, child.getAttribute('data-cond') ?? ''));
    const dom = el('circle', { cx: 1228, cy: y - 4, r: 4, fill: 'none', stroke: P.indigo, 'stroke-width': 1 });
    const nav = el('circle', { cx: 1306, cy: y - 4, r: 4, fill: 'none', stroke: P.indigo, 'stroke-width': 1 });
    const tickDom = el('path', { d: `M 1240 ${y - 5} l 3 4 l 7 -9`, fill: 'none', stroke: P.cinnabar, 'stroke-width': 2, 'stroke-linecap': 'round', visibility: 'hidden' });
    const tickNav = el('path', { d: `M 1318 ${y - 5} l 3 4 l 7 -9`, fill: 'none', stroke: P.cinnabar, 'stroke-width': 2, 'stroke-linecap': 'round', visibility: 'hidden' });
    g.append(dom, nav, tickDom, tickNav);
    root.append(g);
    return { dom, nav, tickDom, tickNav };
  });
  const ledger = (rendered: boolean[], predicted: boolean[]): void => {
    rows.forEach((row, i) => {
      row.dom.setAttribute('fill', rendered[i] ? P.malachite : 'none');
      row.nav.setAttribute('fill', predicted[i] ? P.malachite : 'none');
      row.tickDom.setAttribute('visibility', rendered[i] ? 'visible' : 'hidden');
      row.tickNav.setAttribute('visibility', predicted[i] ? 'visible' : 'hidden');
    });
  };

  // ── bidi block: Aramaic in Hebrew square script (no Syriac font on this host → system fallback) ──
  root.append(el('line', { x1: 932, y1: 350, x2: 1340, y2: 350, stroke: P.malachite, 'stroke-width': .5, 'stroke-opacity': .6 }));
  const label = (y: number, s: string) => el('text', { x: X0, y, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, s);
  root.append(label(366, 'direction:rtl + unicode-bidi:isolate'));
  // pr:direction / pr:unicode-bidi — the isolated RTL run does not drag the following Han characters into reordering.
  root.append(el('text', { x: 1340, y: 366, 'font-size': 15, 'text-anchor': 'end', fill: P.ink },
    el('tspan', { direction: 'rtl', 'unicode-bidi': 'isolate', lang: 'arc', 'font-family': "'DejaVu Sans', 'Noto Sans Hebrew', sans-serif" }, 'אלהא משיחא'),
    ' 景教碑側題名（亞蘭文）'));
  root.append(label(394, 'unicode-bidi:embed（正常次序基準）'));
  root.append(el('text', { x: 1340, y: 394, 'font-size': 15, 'text-anchor': 'end', 'unicode-bidi': 'embed', fill: P.ink }, '建中二年 781 太簇月七日 · 大秦寺'));
  root.append(label(422, 'bidi-override + rtl · text-anchor:start（刀序倒刻對照）'));
  // concept:text-anchor-rtl-interaction — start anchor + rtl extends leftwards from x=1340; digits come out reversed.
  root.append(el('text', { x: 1340, y: 422, 'font-size': 15, 'text-anchor': 'start', direction: 'rtl', 'unicode-bidi': 'bidi-override', fill: P.ink }, '建中二年 781 太簇月七日 · 大秦寺'));

  // ── collation line: baseline-shift super / 30% / sub, nested tspans, absolute-repositioned tspan ──
  root.append(el('line', { x1: 932, y1: 436, x2: 1340, y2: 436, stroke: P.malachite, 'stroke-width': .5, 'stroke-opacity': .6 }));
  root.append(el('text', { x: X0, y: 458, 'font-size': 14, fill: P.ink },
    '校記：碑文',
    el('tspan', { 'baseline-shift': 'super', 'font-size': 10, fill: P.cinnabar }, '注①'),
    '字重見作',
    el('tspan', { 'baseline-shift': '30%', 'font-size': 11, fill: P.cinnabar, 'font-weight': 700 }, '＝'),
    '，殘畫作',
    el('tspan', { 'baseline-shift': 'sub', 'font-size': 10, fill: P.malachite }, '□殘'),
    '。'));
  // concept:nested-tspan-inheritance — outer cinnabar → middle bold → innermost larger; each level keeps the outer traits.
  root.append(el('text', { x: X0, y: 484, 'font-size': 14, fill: P.ink },
    '嵌套繼承：',
    el('tspan', { fill: P.cinnabar }, '朱',
      el('tspan', { 'font-weight': 700 }, '朱重',
        el('tspan', { 'font-size': 18 }, '朱重大'))),
    ' ← fill / weight / size 逐層繼承',
    // concept:tspan-absolute-repositioning — this two-line interlinear note jumps to x/y outside the column,
    // and the run continues from there.
    el('tspan', { x: 1214, y: 452, 'font-size': 11, fill: P.malachite }, '夾注：tspan x/y 跳欄'),
    el('tspan', { x: 1214, dy: '1.1em', 'font-size': 11, fill: P.malachite }, '雙行小字續於此')));

  // ── plumb line with three labels anchored start / middle / end at the same x ───────────────────
  root.append(el('line', { x1: 1136, y1: 496, x2: 1136, y2: 586, stroke: P.malachite, 'stroke-width': .8 }));
  root.append(el('text', { x: 1136, y: 518, 'font-size': 12, 'text-anchor': 'start', fill: P.ink }, '起拓 丙午五月十二日 · start'));
  root.append(el('text', { x: 1136, y: 546, 'font-size': 12, 'text-anchor': 'middle', fill: P.ink }, '碑名 碑林重葺記 · middle'));
  root.append(el('text', { x: 1136, y: 574, 'font-size': 12, 'text-anchor': 'end', fill: P.ink }, 'end · 編號 碑林拓〇三四七'));
  root.append(el('text', { x: X0, y: 512, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, 'text-anchor'));
  root.append(el('text', { x: X0, y: 526, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, '同一 x=1136'));

  // ── baseline ruler: 碑 ×5 with dominant-baseline alphabetic / ideographic / central / middle / hanging ──
  root.append(el('line', { x1: X0, y1: 612, x2: 1330, y2: 612, stroke: P.ink, 'stroke-width': .5 }));
  const baselines = ['alphabetic', 'ideographic', 'central', 'middle', 'hanging'] as const;
  baselines.forEach((db, i) => {
    const x = 952 + 80 * i;
    const t = el('text', { x, y: 612, 'font-size': 22, 'font-weight': 700, 'dominant-baseline': db, fill: P.ink }, '碑');
    // pr:alignment-baseline — only this tspan is lifted to the hanging baseline (Chrome/Safari; Firefox ignores it)
    if (db === 'central') t.append(el('tspan', { 'alignment-baseline': 'hanging', 'font-size': 11, fill: P.cinnabar }, '石'));
    root.append(t);
    root.append(el('text', { x, y: 632, 'font-size': 11, 'font-family': MONO, fill: db === 'ideographic' ? P.cinnabar : P.malachite }, db));
  });
  root.append(el('text', { x: 1032, y: 645, 'font-size': 11, 'font-family': MONO, fill: P.cinnabar }, '← 漢字裝裱取此檔'));
  root.append(el('text', { x: 1112, y: 645, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, '+ tspan hanging'));

  // ── catalogue table: the measured x list of the fragmentary last line, read back via SVGLengthList ──
  root.append(el('text', { x: 976, y: 668, 'font-size': 11, 'font-family': MONO, fill: P.malachite }, '著錄表 · 末行實測位置（x.baseVal SVGLengthList）'));
  const xList = el('text', { x: 976, y: 684, 'font-size': 11, 'font-family': MONO, fill: P.ink }, 'x = …');
  const yList = el('text', { x: 976, y: 698, 'font-size': 11, 'font-family': MONO, fill: P.ink }, 'y = …');
  root.append(xList, yList);
  root.append(el('text', { x: 976, y: 712, 'font-size': 11, 'font-family': MONO, fill: P.ink }, '缺字 2 處：436→520、560→648（留空不補）'));
  const readout = el('text', { x: 976, y: 726, 'font-size': 11, 'font-family': MONO, fill: P.cinnabar }, '拓包 (x, y) = …');
  root.append(readout);
  root.append(el('text', { x: 976, y: 740, 'font-size': 11, 'font-family': MONO, fill: P.indigo, 'fill-opacity': .8 }, '亞蘭文以希伯來方體代敘利亞文（系統字體回退）'));

  // ── chips: which branch each probe took ───────────────────────────────────────────────────────
  const chips = [0, 1, 2].map(i => {
    const x = 944 + i * 132;
    const g = el('g', { class: 'chip' });
    const rect = el('rect', { x, y: 780, width: 124, height: 22, rx: 11, fill: P.malachite, 'fill-opacity': .18, stroke: P.malachite, 'stroke-width': 1 });
    const txt = el('text', { x: x + 62, y: 795, 'font-size': 11, 'font-family': MONO, 'text-anchor': 'middle', fill: P.malachite }, '…');
    g.append(rect, txt);
    root.append(g);
    return { rect, txt };
  });
  const chip = (i: 0 | 1 | 2, text: string, tone: 'ok' | 'fallback' | 'warn'): void => {
    const colour = tone === 'ok' ? P.malachite : tone === 'fallback' ? P.gamboge : P.amber;
    chips[i].rect.setAttribute('fill', colour);
    chips[i].rect.setAttribute('stroke', colour);
    chips[i].txt.setAttribute('fill', tone === 'ok' ? P.malachite : '#5a3a00');
    chips[i].txt.textContent = text;
  };

  return { root, switchEl, ledger, ledgerHead, chip, xList, yList, readout };
}
