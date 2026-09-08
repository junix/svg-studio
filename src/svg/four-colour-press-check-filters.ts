// four-colour-press-check — every <defs> entry (filters, patterns, gradients, clipPath) as hand-authored markup.
// Feature keys named in comments refer to docs/svg-feature-demos.json.
import { SCREEN_ORIGIN, SCREEN_CELL, SCREEN_ANGLE } from './four-colour-press-check-bitmaps';

export type InkKey = 'c' | 'm' | 'y' | 'k';
export const INK_KEYS: InkKey[] = ['c', 'm', 'y', 'k'];

export interface Ink {
  key: InkKey; label: string; name: string; angle: number;
  /** printed ink colour (film duotone endpoint) */
  rgb: [number, number, number]; hex: string;
  /** 4×5 feColorMatrix rows extracting ink amount into R=G=B (黑版 first passes saturate 0) */
  matrix: string;
  /** ideal process transmittance: which channel the ink attenuates (overprint branches) */
  channel: 0 | 1 | 2 | 3;
  /** film exposure curve (构造要点 3): one transfer type per plate */
  curve: string; curveLabel: string;
}

const NEG = (col: number) => ['0', '0', '0'].map((v, i) => (i === col ? '-1' : v)).join(' ') + ' 0 1';
const ROWS = (col: number) => `${NEG(col)}  ${NEG(col)}  ${NEG(col)}  0 0 0 1 0`;

export const INKS: Record<InkKey, Ink> = {
  c: { key: 'c', label: 'C', name: '青版 Cyan', angle: 15, rgb: [.06, .62, .80], hex: '#0f9ecc', matrix: ROWS(0), channel: 0,
    curve: 'type="table" tableValues="0 .18 .42 .68 .86 1"', curveLabel: 'table 0 .18 .42 .68 .86 1' },
  m: { key: 'm', label: 'M', name: '品红版 Magenta', angle: 75, rgb: [.86, .10, .52], hex: '#db1a85', matrix: ROWS(1), channel: 1,
    curve: 'type="gamma" amplitude="1.02" exponent="0.85" offset="-0.02"', curveLabel: 'gamma amp 1.02 exp .85 off −.02' },
  y: { key: 'y', label: 'Y', name: '黄版 Yellow', angle: 0, rgb: [.98, .86, .05], hex: '#fadb0d', matrix: ROWS(2), channel: 2,
    curve: 'type="linear" slope="1.12" intercept="-0.06"', curveLabel: 'linear slope 1.12 intercept −.06' },
  k: { key: 'k', label: 'K', name: '黑版 Black', angle: 45, rgb: [.12, .12, .13], hex: '#1f1f21', matrix: ROWS(0), channel: 3,
    curve: 'type="discrete" tableValues="0 0 0 .15 .38 .62 .85 1"', curveLabel: 'discrete 0 0 0 .15 .38 .62 .85 1 (UCR 骨架黑)' },
};

/** Default 9-point exposure tables of the overprint branches: identity for C/M/Y, skeleton black for K. */
export const CURVE_DEFAULT: Record<InkKey, number[]> = {
  c: [0, .125, .25, .375, .5, .625, .75, .875, 1],
  m: [0, .125, .25, .375, .5, .625, .75, .875, 1],
  y: [0, .125, .25, .375, .5, .625, .75, .875, 1],
  k: [0, 0, 0, 0, 0, 0, .2, .6, 1],
};
export const fmtTable = (values: number[]): string => values.map(v => Number(v.toFixed(3)).toString().replace(/^0\./, '.')).join(' ');

const T_NAME: Record<InkKey, string> = { c: 'cyanT', m: 'magT', y: 'yelT', k: 'blkT' };
export const INK_RESULT = T_NAME;

/** Ink-amount extraction: `feColorMatrix type="matrix"` (黑版: `saturate 0` first). */
function extract(ink: Ink, input: string, out: string): string {
  if (ink.key === 'k') return `<feColorMatrix in="${input}" type="saturate" values="0" result="${out}L"/>\n      <feColorMatrix in="${out}L" type="matrix" values="${ink.matrix}" result="${out}"/>`;
  return `<feColorMatrix in="${input}" type="matrix" values="${ink.matrix}" result="${out}"/>`;
}

/** Ideal process ink as a two-endpoint duotone: paper (1 1 1) → ink transmittance that zeroes one channel. */
function idealDuotone(ink: Ink, input: string, out: string, cif = ''): string {
  const fn = ['R', 'G', 'B'].map((ch, i) => `<feFunc${ch} type="table" tableValues="${ink.channel === 3 || ink.channel === i ? '1 0' : '1 1'}"/>`).join('');
  return `<feComponentTransfer in="${input}" result="${out}"${cif}>${fn}<feFuncA type="identity"/></feComponentTransfer>`;
}

/**
 * One overprint ink branch (构造要点 4): extraction → 9-point exposure table (data-curve, live-edited) → ideal duotone.
 * `withIds` gives the #overprint copy its `curve-<ink>` ids; `cif` puts the colouring step in another colour space.
 */
export function inkBranch(key: InkKey, opts: { withIds?: boolean; cif?: string } = {}): string {
  const ink = INKS[key];
  const id = opts.withIds ? ` id="curve-${key}"` : '';
  const table = fmtTable(CURVE_DEFAULT[key]);
  const fn = ['R', 'G', 'B'].map(ch => `<feFunc${ch} type="table" tableValues="${table}"/>`).join('');
  return `
      ${extract(ink, 'src', `${key}Ink`)}
      <feComponentTransfer${id} in="${key}Ink" data-curve="${key}" result="${key}Exp">${fn}<feFuncA type="identity"/></feComponentTransfer>
      ${idealDuotone(ink, `${key}Exp`, T_NAME[key], opts.cif ?? '')}`;
}

/** Three subtractive multiplications: transmittances multiply (feComposite arithmetic k1=1). */
export function multiplyChain(out: string, cif = '', prefix = ''): string {
  const a = (i1: string, i2: string, r: string) => `<feComposite in="${i1}" in2="${i2}" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="${r}"${cif}/>`;
  return `
      ${a(T_NAME.c, T_NAME.m, `${prefix}cm`)}
      ${a(`${prefix}cm`, T_NAME.y, `${prefix}cmy`)}
      ${a(`${prefix}cmy`, T_NAME.k, out)}`;
}

const srcNode = '<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="src"/>';
const gain6 = (input: string) => `<feComponentTransfer in="${input}"><feFuncR type="linear" slope="6" intercept="0"/><feFuncG type="linear" slope="6" intercept="0"/><feFuncB type="linear" slope="6" intercept="0"/></feComponentTransfer>`;

/** Film separation chain (构造要点 3): extraction → plate-specific exposure type → printed-ink duotone. */
function separationFilter(ink: Ink): string {
  const fn = ['R', 'G', 'B'].map(ch => `<feFunc${ch} ${ink.curve}/>`).join('');
  const duo = ['R', 'G', 'B'].map((ch, i) => `<feFunc${ch} type="table" tableValues="1 ${ink.rgb[i]}"/>`).join('');
  return `
    <filter id="sep-${ink.key}" color-interpolation-filters="sRGB">
      ${extract(ink, 'SourceGraphic', 'amount')}
      <feComponentTransfer in="amount" result="exposed">${fn}<feFuncA type="identity"/></feComponentTransfer>
      <feComponentTransfer in="exposed">${duo}<feFuncA type="identity"/></feComponentTransfer>
    </filter>`;
}

/** Cyan ink colouring matrix used by the filter halftone path: value 1 → printed cyan, 0 → paper. */
const CYAN_MATRIX = `-0.94 0 0 0 1  0 -0.38 0 0 1  0 0 -0.2 0 1  0 0 0 0 1`;

export function buildDefsMarkup(sourceUri: string, screenUri: string, noiseUri: string): string {
  const dotR = (tone: number) => Math.sqrt(tone * 64 / Math.PI).toFixed(2);
  const pattern = (id: string, angle: number, r: string, fill: string) =>
    `<pattern id="${id}" width="${SCREEN_CELL}" height="${SCREEN_CELL}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><circle cx="4" cy="4" r="${r}" fill="${fill}"/></pattern>`;
  const blendChip = (mode: string) => `
    <filter id="blend-${mode}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feFlood flood-color="#0f9ecc" result="ink"/>
      <feBlend in="SourceGraphic" in2="ink" mode="${mode}"/>
    </filter>`;
  const compositeChip = (op: string) => `
    <filter id="comp-${op}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feFlood flood-color="#0f9ecc" x="12" y="12" width="20" height="20" result="spot"/>
      <feComposite in="SourceGraphic" in2="spot" operator="${op}"/>
    </filter>`;
  const dotGainBody = (sd: string) => `
      <feGaussianBlur in="SourceAlpha" stdDeviation="${sd}" result="soft"/>
      <feComponentTransfer in="soft" result="fat"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feFlood flood-color="#0f9ecc" result="ink"/>
      <feComposite in="ink" in2="fat" operator="in" result="gain"/>
      <feMerge><feMergeNode in="gain"/><feMergeNode in="SourceGraphic"/></feMerge>`;

  return `
    <!-- 构造要点 2: the only three bitmaps on the table -->
    <image id="plate-source" width="320" height="200" href="${sourceUri}"/>
    <image id="screen-bitmap" width="640" height="400" href="${screenUri}"/>
    <image id="dither-bitmap" width="128" height="128" href="${noiseUri}"/>

    <!-- 构造要点 3 · single-plate separations: el:feColorMatrix → el:feComponentTransfer (table/gamma/linear/discrete) → duotone -->
    ${INK_KEYS.map(k => separationFilter(INKS[k])).join('')}

    <!-- single-channel close-ups: el:feFuncR / el:feFuncG / el:feFuncB alone -->
    <filter id="chan-r" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="table" tableValues="1 0"/></feComponentTransfer></filter>
    <filter id="chan-g" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncG type="gamma" amplitude="1" exponent="0.45" offset="0"/></feComponentTransfer></filter>
    <filter id="chan-b" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncB type="table" tableValues="0 0"/></feComponentTransfer></filter>

    <!-- 构造要点 4/5/6 · #overprint: src fan-out → 4 ink branches → 3× arithmetic k1=1 → tone compression → spread/bar → feMerge -->
    <filter id="overprint" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k, { withIds: true })).join('')}
      ${multiplyChain('cmyk')}
      <feComposite in="cmyk" in2="cmyk" operator="arithmetic" k1="0" k2="0.96" k3="0" k4="0.03" result="press"/>
      <feGaussianBlur in="cmyk" stdDeviation="1.6" result="spread"/>
      <feComponentTransfer in="spread" result="fat"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feComposite in="fat" in2="cmyk" operator="out" result="trap"/>
      <feFlood flood-color="#f4f1ea" x="12.8" y="176" width="294.4" height="16" result="paper"/>
      <feComposite in="paper" in2="cmyk" operator="in" result="bar"/>
      <feMerge><feMergeNode in="spread"/><feMergeNode in="trap"/><feMergeNode in="press"/><feMergeNode in="bar"/></feMerge>
    </filter>
    <!-- 构造要点 6 · same chain, last two feMergeNodes swapped: the bar disappears under the print -->
    <filter id="overprint-swapped" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      ${multiplyChain('cmyk')}
      <feGaussianBlur in="cmyk" stdDeviation="1.6" result="spread"/>
      <feFlood flood-color="#f4f1ea" x="12.8" y="176" width="294.4" height="16" result="paper"/>
      <feComposite in="paper" in2="cmyk" operator="in" result="bar"/>
      <feMerge><feMergeNode in="spread"/><feMergeNode in="bar"/><feMergeNode in="cmyk"/></feMerge>
    </filter>
    <!-- 构造要点 5 · contrast: feFlood without x/y/width/height fills the whole filter region (default subregion) -->
    <filter id="overprint-fullflood" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      ${multiplyChain('cmyk')}
      <feFlood flood-color="#f4f1ea" flood-opacity="0.85" result="paper"/>
      <feComposite in="paper" in2="cmyk" operator="in" result="bar"/>
      <feMerge><feMergeNode in="cmyk"/><feMergeNode in="bar"/></feMerge>
    </filter>

    <!-- 构造要点 8 · verification: overprint vs original, feBlend difference ×6. Left all-sRGB; right colours & multiplies in linearRGB -->
    <filter id="verify-srgb" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      ${multiplyChain('cmyk')}
      <feBlend in="cmyk" in2="src" mode="difference" result="residual"/>
      ${gain6('residual')}
    </filter>
    <filter id="verify-linear" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k, { cif: ' color-interpolation-filters="linearRGB"' })).join('')}
      ${multiplyChain('cmyk', ' color-interpolation-filters="linearRGB"')}
      <feBlend in="cmyk" in2="src" mode="difference" result="residual"/>
      ${gain6('residual')}
    </filter>
    <!-- the washed-out proof itself (same cross-space chain, no difference step) -->
    <filter id="overprint-linear" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k, { cif: ' color-interpolation-filters="linearRGB"' })).join('')}
      ${multiplyChain('cmyk', ' color-interpolation-filters="linearRGB"')}
    </filter>

    <!-- 构造要点 7 · two overprint algebras and their consistency proof -->
    <filter id="overprint-arith" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      ${multiplyChain('cmyk')}
    </filter>
    <filter id="overprint-blend" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      <feBlend in="cyanT" in2="magT" mode="multiply" result="cm"/>
      <feBlend in="cm" in2="yelT" mode="multiply" result="cmy"/>
      <feBlend in="cmy" in2="blkT" mode="multiply" result="cmyk"/>
    </filter>
    <filter id="overprint-diff" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      ${srcNode}
      ${INK_KEYS.map(k => inkBranch(k)).join('')}
      ${multiplyChain('cmykA', '', 'a')}
      <feBlend in="cyanT" in2="magT" mode="multiply" result="bcm"/>
      <feBlend in="bcm" in2="yelT" mode="multiply" result="bcmy"/>
      <feBlend in="bcmy" in2="blkT" mode="multiply" result="cmykB"/>
      <feBlend in="cmykA" in2="cmykB" mode="difference" result="residual"/>
      ${gain6('residual')}
    </filter>
    ${['multiply', 'screen', 'darken', 'overlay', 'luminosity'].map(blendChip).join('')}

    <!-- 构造要点 12 · knockout / trap test chips: every Porter-Duff operator plus lighter -->
    ${['over', 'in', 'out', 'atop', 'xor', 'lighter'].map(compositeChip).join('')}
    <!-- trap ring (≈0.6pt): blur SourceAlpha → feFuncA discrete → flood ink → out SourceAlpha → merge -->
    <filter id="trap-ring" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="soft"/>
      <feComponentTransfer in="soft" result="fat"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feFlood flood-color="#db1a85" result="ink"/>
      <feComposite in="ink" in2="fat" operator="in" result="fatInk"/>
      <feComposite in="fatInk" in2="SourceAlpha" operator="out" result="ring"/>
      <feMerge><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- 构造要点 13 · registration glow: default region clips the halo; explicit region keeps it whole -->
    <filter id="reg-glow-default" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="glow"/>
      <feColorMatrix in="glow" type="matrix" values="0 0 0 0 .86  0 0 0 0 .1  0 0 0 0 .52  0 0 0 3 0" result="pink"/>
      <feMerge><feMergeNode in="pink"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="reg-glow-wide" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="glow"/>
      <feColorMatrix in="glow" type="matrix" values="0 0 0 0 .86  0 0 0 0 .1  0 0 0 0 .52  0 0 0 3 0" result="pink"/>
      <feMerge><feMergeNode in="pink"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- dot gain: objectBoundingBox units scale the gain with the sample (wrong); a fixed user-space box keeps 2px (right) -->
    <filter id="dot-gain-obb" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="-0.15" y="-0.15" width="1.3" height="1.3" color-interpolation-filters="sRGB">
      ${dotGainBody('0.035')}
    </filter>
    <filter id="dot-gain-fixed" filterUnits="userSpaceOnUse" x="852" y="250" width="136" height="100" color-interpolation-filters="sRGB">
      ${dotGainBody('2')}
    </filter>

    <!-- 构造要点 15 · colour-check trio and duotone card -->
    <filter id="cm-matrix" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${INKS.m.matrix}"/></filter>
    <filter id="cm-saturate" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter>
    <filter id="cm-hue" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="30"/></filter>
    <filter id="duotone-card" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0" result="grey"/>
      <feComponentTransfer in="grey">
        <feFuncR type="table" tableValues=".09 .95"/><feFuncG type="table" tableValues=".2 .76"/><feFuncB type="table" tableValues=".31 .31"/><feFuncA type="identity"/>
      </feComponentTransfer>
    </filter>
    <!-- premultiplied-alpha warning: arithmetic multiply of two soft discs on a transparent base vs on opaque paper -->
    <filter id="premul-bare" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feFlood flood-color="#0f9ecc" x="6" y="8" width="26" height="26" result="cBox"/>
      <feGaussianBlur in="cBox" stdDeviation="3" result="cSoft"/>
      <feFlood flood-color="#db1a85" x="18" y="14" width="26" height="26" result="mBox"/>
      <feGaussianBlur in="mBox" stdDeviation="3" result="mSoft"/>
      <feComposite in="cSoft" in2="mSoft" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
    <filter id="premul-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feFlood flood-color="#f7f4ec" result="paper"/>
      <feFlood flood-color="#0f9ecc" x="6" y="8" width="26" height="26" result="cBox"/>
      <feGaussianBlur in="cBox" stdDeviation="3" result="cSoft"/>
      <feMerge result="cOpaque"><feMergeNode in="paper"/><feMergeNode in="cSoft"/></feMerge>
      <feFlood flood-color="#db1a85" x="18" y="14" width="26" height="26" result="mBox"/>
      <feGaussianBlur in="mBox" stdDeviation="3" result="mSoft"/>
      <feMerge result="mOpaque"><feMergeNode in="paper"/><feMergeNode in="mSoft"/></feMerge>
      <feComposite in="cOpaque" in2="mOpaque" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>

    <!-- 构造要点 9 · grey wedges: 21-step discrete, then blue-noise dither before the same quantisation -->
    <linearGradient id="wedge-grey" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <filter id="wedge-discrete" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feComponentTransfer>
        ${['R', 'G', 'B'].map(ch => `<feFunc${ch} type="discrete" tableValues="${Array.from({ length: 21 }, (_, i) => fmtTable([i / 20])).join(' ')}"/>`).join('')}
      </feComponentTransfer>
    </filter>
    <filter id="wedge-dither" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage href="${noiseUri}" x="356" y="740" width="128" height="128" result="noise"/>
      <feTile in="noise" result="noiseTiled"/>
      <feComposite in="SourceGraphic" in2="noiseTiled" operator="arithmetic" k1="0" k2="1" k3="0.06" k4="-0.03" result="dithered"/>
      <feComponentTransfer in="dithered">
        ${['R', 'G', 'B'].map(ch => `<feFunc${ch} type="discrete" tableValues="${Array.from({ length: 21 }, (_, i) => fmtTable([i / 20])).join(' ')}"/>`).join('')}
      </feComponentTransfer>
    </filter>
    <!-- pr:color-interpolation on gradients (Firefox-only effect; the script measures and prints the result) -->
    <linearGradient id="ci-srgb" x1="0" y1="0" x2="1" y2="0" color-interpolation="sRGB"><stop offset="0" stop-color="#e5312b"/><stop offset="1" stop-color="#26a63a"/></linearGradient>
    <linearGradient id="ci-linear" x1="0" y1="0" x2="1" y2="0" color-interpolation="linearRGB"><stop offset="0" stop-color="#e5312b"/><stop offset="1" stop-color="#26a63a"/></linearGradient>
    <!-- classic red/green blur pair in the two filter colour spaces -->
    <filter id="rg-linear" x="0" y="0" width="100%" height="100%" color-interpolation-filters="linearRGB"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="rg-srgb" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3"/></filter>

    <!-- 构造要点 10 · halftone bench. Left: vector patterns, five dot radii (tone 14…46%). Right: the filter screen. -->
    ${[.14, .22, .30, .38, .46].map((t, i) => pattern(`screen-c-${i + 1}`, SCREEN_ANGLE, dotR(t), '#0f9ecc')).join('\n    ')}
    ${pattern('dots-k50', 45, dotR(.5), '#1f1f21')}
    ${pattern('dots-c50', 45, dotR(.5), '#0f9ecc')}
    <linearGradient id="tone-ramp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#808080"/><stop offset="1" stop-color="#1a1a1a"/></linearGradient>
    <filter id="screen-filter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage href="${screenUri}" x="${SCREEN_ORIGIN.x}" y="${SCREEN_ORIGIN.y}" width="640" height="400" result="screen"/>
      <feComposite in="SourceGraphic" in2="screen" operator="arithmetic" k1="0" k2="0.5" k3="0.5" k4="0" result="compared"/>
      <feComponentTransfer><feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feColorMatrix type="matrix" values="${CYAN_MATRIX}"/>
    </filter>
    <!-- rosette (C15 M75 Y0 K45) and moiré (15° vs 18°): only patternTransform differs -->
    ${pattern('ros-c', 15, dotR(.28), '#0f9ecc')}
    ${pattern('ros-m', 75, dotR(.24), '#db1a85')}
    ${pattern('ros-y', 0, dotR(.3), '#fadb0d')}
    ${pattern('ros-k', 45, dotR(.16), '#1f1f21')}
    ${pattern('moire-a', 15, dotR(.3), '#0f9ecc')}
    ${pattern('moire-b', 18, dotR(.3), '#0f9ecc')}

    <!-- 构造要点 11 · loupe: clip circle on the child, barrel shadow on the parent with a fixed user-space region -->
    <clipPath id="loupe-clip"><circle cx="0" cy="0" r="92"/></clipPath>
    <filter id="loupe-shadow" filterUnits="userSpaceOnUse" x="-112" y="-108" width="224" height="228" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="soft"/>
      <feOffset in="soft" dx="0" dy="6" result="shifted"/>
      <feFlood flood-color="#1b1d22" flood-opacity="0.45" result="shade"/>
      <feComposite in="shade" in2="shifted" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
}
