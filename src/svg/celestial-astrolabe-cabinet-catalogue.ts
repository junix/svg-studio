// celestial-astrolabe-cabinet — catalogue space, star generation and the nine symbol masters.
// Pure data + markup strings (no DOM): the inline demo parses these with fragment(), and the same
// module is executed under Node to emit public/celestial-astrolabe-cabinet/atlas-plates.svg, so the
// external plates and the inline cabinet describe exactly the same sky.
import { mulberry32 } from './lib';

/** Catalogue space (construction note 2): x = RA(h) × 100, y = (90 − Dec) × 6.6667 → 0 0 2400 1200. */
export const CAT_W = 2400;
export const CAT_H = 1200;
export const raToX = (raHours: number): number => raHours * 100;
export const decToY = (dec: number): number => (90 - dec) * (CAT_H / 180);
export const xToRa = (x: number): number => x / 100;
export const yToDec = (y: number): number => 90 - y / (CAT_H / 180);

export type Master = 'ob' | 'a' | 'f' | 'g' | 'k' | 'm' | 'double' | 'var' | 'neb';
export const MASTERS: Master[] = ['ob', 'a', 'f', 'g', 'k', 'm', 'double', 'var', 'neb'];

/** Spectral colour → written into each use's `color` (concept:use-currentcolor-passthrough). */
export const SPECTRAL_COLOR: Record<Master, string> = {
  ob: '#a9c8ff', a: '#e2ebff', f: '#fff6df', g: '#fff0b4', k: '#ffcf8f', m: '#ff9c6e',
  double: '#e8f0ff', var: '#ffe08a', neb: '#c8b6ff',
};

export interface Zone {
  n: number;            // 1..24
  id: string;           // zone-07
  col: number; row: number;
  x: number; y: number; w: number; h: number;   // catalogue rect
  hue: number;          // (n-1) × 15
  tint: string;         // hsl(hue 70% 68%)
  raRange: string; decRange: string;             // engraved under each tag
}

export interface Star {
  id: string; zone: number; master: Master;
  x: number; y: number; mag: number; width: number;
  name?: string;
}

const pad2 = (n: number): string => String(n).padStart(2, '0');
const signed = (d: number): string => `${d < 0 ? '−' : '+'}${pad2(Math.abs(d))}`;

/** 24 zones: 6 RA columns of 4h × 4 Dec rows of 45° (construction notes 4, 7). */
export const ZONES: Zone[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1, col = i % 6, row = Math.floor(i / 6);
  const decTop = 90 - row * 45, decBottom = decTop - 45;
  return {
    n, id: `zone-${pad2(n)}`, col, row,
    x: col * 400, y: row * 300, w: 400, h: 300,
    hue: i * 15, tint: `hsl(${i * 15} 70% 68%)`,
    raRange: `RA ${pad2(col * 4)}h-${pad2(col * 4 + 4)}h`,
    decRange: `DEC ${signed(decTop)}/${signed(decBottom)}`,
  };
});
export const zoneRect = (z: Zone): string => `${z.x} ${z.y} ${z.w} ${z.h}`;
export const zoneOf = (x: number, y: number): Zone => ZONES[Math.min(3, Math.floor(y / 300)) * 6 + Math.min(5, Math.floor(x / 400))];

/** Magnitude → use width/height (at:use.width): clamp(26 − 3.4m, 5, 26). */
export const magWidth = (m: number): number => Math.min(26, Math.max(5, 26 - 3.4 * m));
export const magClass = (m: number): string => `m${Math.min(6, Math.max(1, Math.round(m)))}`;

/** Twelve real bright stars (construction note 4), named only on the main dial. */
const NAMED: { name: string; ra: number; dec: number; mag: number; master: Master }[] = [
  { name: 'SIRIUS', ra: 6.752, dec: -16.72, mag: -1.46, master: 'a' },
  { name: 'RIGEL', ra: 5.242, dec: -8.20, mag: 0.13, master: 'ob' },
  { name: 'BETELGEUSE', ra: 5.919, dec: 7.41, mag: 0.42, master: 'm' },
  { name: 'ALDEBARAN', ra: 4.599, dec: 16.51, mag: 0.85, master: 'k' },
  { name: 'VEGA', ra: 18.616, dec: 38.78, mag: 0.03, master: 'a' },
  { name: 'DENEB', ra: 20.690, dec: 45.28, mag: 1.25, master: 'a' },
  { name: 'ALTAIR', ra: 19.846, dec: 8.87, mag: 0.77, master: 'a' },
  { name: 'POLARIS', ra: 2.530, dec: 89.26, mag: 1.98, master: 'f' },
  { name: 'ARCTURUS', ra: 14.261, dec: 19.18, mag: -0.05, master: 'k' },
  { name: 'SPICA', ra: 13.420, dec: -11.16, mag: 1.04, master: 'ob' },
  { name: 'ANTARES', ra: 16.490, dec: -26.43, mag: 1.06, master: 'm' },
  { name: 'CANOPUS', ra: 6.399, dec: -52.70, mag: -0.74, master: 'f' },
];

export interface Catalogue { stars: Star[]; byZone: Star[][]; lines: string[][] }

/** Deterministic catalogue: mulberry32(1054), 62–76 stars per zone (~1680), power-law magnitudes. */
export function buildCatalogue(): Catalogue {
  const rnd = mulberry32(1054);
  const stars: Star[] = [];
  const byZone: Star[][] = ZONES.map(() => []);
  let next = 1000;
  const nextId = (): string => { if (next === 1042) next++; return `s-${next++}`; };
  for (const z of ZONES) {
    // Anchor star at the zone centre: the "principal star" of the zone; zone-07's anchor is use#s-1042.
    const anchor: Star = { id: z.n === 7 ? 's-1042' : nextId(), zone: z.n, master: 'g', x: z.x + 200, y: z.y + 150, mag: 0.8, width: magWidth(0.8) };
    byZone[z.n - 1].push(anchor);
    const count = 62 + Math.floor(rnd() * 15);
    for (let i = 1; i < count; i++) {
      const x = z.x + 8 + rnd() * 384, y = z.y + 8 + rnd() * 284;
      const mag = 6.2 - 5.4 * Math.pow(rnd(), 1.8);
      const t = rnd();
      let master: Master = t < .03 ? 'ob' : t < .12 ? 'a' : t < .26 ? 'f' : t < .47 ? 'g' : t < .75 ? 'k' : 'm';
      const u = rnd();
      if (u < .04) master = 'double'; else if (u < .07) master = 'var'; else if (u < .085) master = 'neb';
      byZone[z.n - 1].push({ id: nextId(), zone: z.n, master, x, y, mag, width: magWidth(mag) });
    }
  }
  for (const s of NAMED) {
    const x = raToX(s.ra), y = decToY(s.dec);
    const z = zoneOf(x, y);
    byZone[z.n - 1].push({ id: nextId(), zone: z.n, master: s.master, x, y, mag: s.mag, width: magWidth(s.mag), name: s.name });
  }
  for (const list of byZone) stars.push(...list);
  // Asterism polylines: chain the brightest stars of each zone by x (two chains per zone).
  const lines = byZone.map(list => {
    const bright = [...list].filter(s => s.master !== 'neb').sort((a, b) => a.mag - b.mag);
    const chain = (subset: Star[]): string => subset.sort((a, b) => a.x - b.x).map(s => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(' ');
    return [chain(bright.slice(0, 6)), chain(bright.slice(6, 10))];
  });
  return { stars, byZone, lines };
}

/** `<use>` for one star: magnitude in width, spectral type in color, id for event retargeting. */
export const starUse = (s: Star): string =>
  `<use id="${s.id}" class="star ${magClass(s.mag)}" href="#gl-${s.master}" x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}" width="${s.width.toFixed(1)}" height="${s.width.toFixed(1)}" color="${SPECTRAL_COLOR[s.master]}"/>`;

/** One zone plate: asterism polylines + every star use of the zone (construction note 5). */
export function zonePlate(z: Zone, cat: Catalogue): string {
  const lines = cat.lines[z.n - 1].map(pts => `<polyline class="asterism" points="${pts}" fill="none" stroke="currentColor" stroke-opacity=".38" stroke-width="1"/>`).join('');
  return `<g id="${z.id}-plate" class="plate">${lines}${cat.byZone[z.n - 1].map(starUse).join('')}</g>`;
}

/** Per-zone tint wrapper: --tint and color inherit into every use shadow tree beneath. */
export const zoneTintStyle = (z: Zone): string => `--tint:${z.tint};color:hsl(${z.hue} 60% 82%)`;

/** The nine masters (construction note 3): symbol viewBox 0 0 20 20, refX/refY = 10. */
export function symbolMarkup(): string {
  const halo = (r = 9.5, op = .22) => `<circle class="star-halo" cx="10" cy="10" r="${r}" fill="var(--tint, #7fd9ff)" fill-opacity="${op}" opacity="var(--mag-alpha, .8)"/>`;
  const ring = (r = 5.6) => `<circle class="star-ring" cx="10" cy="10" r="${r}" fill-opacity=".5"/>`; // fill unset → inherits from use / zone
  const core = (fill = '#ffffff', r = 2.4) => `<circle class="star-core" cx="10" cy="10" r="${r}" fill="${fill}"/>`;
  const rays4 = 'M10 .6 L11.2 8.8 L19.4 10 L11.2 11.2 L10 19.4 L8.8 11.2 L.6 10 L8.8 8.8Z';
  const rays4s = 'M10 2.6 L11 9 L17.4 10 L11 11 L10 17.4 L9 11 L2.6 10 L9 9Z';
  const ray1 = 'M10 1.4 L10.9 10 L10 18.6 L9.1 10Z';
  const sym = (id: string, body: string) => `<symbol id="${id}" viewBox="0 0 20 20" refX="10" refY="10">${body}</symbol>`;
  return [
    sym('gl-ob', `${halo(9.8, .2)}<path class="star-rays" d="${rays4}" fill="currentColor"/><path class="star-rays" d="${rays4}" fill="currentColor" fill-opacity=".7" transform="rotate(45 10 10) translate(10 10) scale(.72) translate(-10 -10)"/>${ring(5)}${core('#ffffff', 2.2)}`),
    sym('gl-a', `${halo()}<path class="star-rays" d="${rays4}" fill="currentColor"/>${ring()}${core()}`),
    sym('gl-f', `${halo(9, .22)}<path class="star-rays" d="${rays4s}" fill="currentColor"/>${ring(5.2)}${core('#fffaf0')}`),
    sym('gl-g', `${halo()}<path class="star-rays" d="${rays4}" fill="currentColor"/><path class="star-rays" d="${rays4s}" fill="currentColor" fill-opacity=".55" transform="rotate(45 10 10)"/>${ring()}${core('#fffbe6')}`),
    sym('gl-k', `${halo(9, .24)}<g class="star-rays" fill="currentColor"><path d="${ray1}"/><path d="${ray1}" transform="rotate(60 10 10)"/><path d="${ray1}" transform="rotate(120 10 10)"/></g>${ring(5.4)}${core('#ffe9c4')}`),
    // gl-m: the vermilion core is hard-coded and resists every inherited fill (concept:use-inherited-fill-override).
    sym('gl-m', `${halo(9.8, .3)}${ring(6.4)}${core('#ff7a59', 2.8)}`),
    sym('gl-double', `${halo(9, .2)}${ring(6)}<rect x="6.8" y="9.4" width="6.4" height="1.2" fill="currentColor"/><circle class="star-core" cx="7.2" cy="10" r="2" fill="#ffffff"/><circle class="star-core" cx="12.8" cy="10" r="2" fill="#ffffff"/>`),
    // gl-var: static twin ring keeps identity readable without SMIL; the pulse ring animates in every instance
    // (concept:animate-in-use-shadow-tree). Half-open (r≈3.9) at the exported frame t = 4.8 s.
    sym('gl-var', `${halo(9.6, .2)}<circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width=".7" stroke-opacity=".7"/><circle cx="10" cy="10" r="4.2" fill="none" stroke="currentColor" stroke-width=".7"/><circle class="pulse-ring" cx="10" cy="10" r="3.9" fill="none" stroke="#ffffff" stroke-width="1.2"><animate attributeName="r" values="3.9;5.4;2.4;3.9" keyTimes="0;.25;.75;1" dur="3.2s" repeatCount="indefinite"/></circle>${core('#fff4cc', 2)}`),
    sym('gl-neb', `<g transform="rotate(-20 10 10)"><ellipse class="star-halo" cx="10" cy="10" rx="9.6" ry="6.6" fill="var(--tint, #7fd9ff)" fill-opacity=".26" opacity="var(--mag-alpha, .8)"/><ellipse class="star-ring" cx="10" cy="10" rx="6" ry="4" fill-opacity=".35"/><ellipse class="star-core" cx="10" cy="10" rx="2.6" ry="1.7" fill="currentColor"/></g>`),
  ].join('\n');
}

/** Magnitude alpha classes: custom properties inherit through the use shadow boundary. */
export const MAG_CSS = '.m1{--mag-alpha:.95}.m2{--mag-alpha:.85}.m3{--mag-alpha:.72}.m4{--mag-alpha:.6}.m5{--mag-alpha:.48}.m6{--mag-alpha:.36}';

/** Comet master that exists ONLY in the external plates file (concept:use-external-fragment). Head at
 *  (8,10), tail streaming to the right past x = 60. Attribute-only styling: external CSS never applies. */
export const COMET_SYMBOL = `<symbol id="gl-comet" viewBox="0 0 60 20" refX="8" refY="10">
  <path d="M8 4 C24 3 44 1 60 0 L60 20 C44 19 24 17 8 16 Z" fill="#9fe7ff" fill-opacity=".28"/>
  <path d="M8 6.5 C26 6 44 5 60 6 L60 14 C44 15 26 14 8 13.5 Z" fill="#dff7ff" fill-opacity=".45"/>
  <circle cx="8" cy="10" r="5.5" fill="#bff0ff" fill-opacity=".5"/>
  <circle cx="8" cy="10" r="2.6" fill="#ffffff"/>
</symbol>`;

/** Alt-az grid for latitude 39.9° N at LST 12h, sampled into catalogue-space polylines (note 6). */
export function altAzGridMarkup(): string {
  const lat = 39.9 * Math.PI / 180, LST = 12;
  const toCat = (altDeg: number, azDeg: number): [number, number] => {
    const a = altDeg * Math.PI / 180, A = azDeg * Math.PI / 180;
    const sinDec = Math.sin(a) * Math.sin(lat) + Math.cos(a) * Math.cos(lat) * Math.cos(A);
    const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));
    const H = Math.atan2(-Math.sin(A) * Math.cos(a), Math.sin(a) * Math.cos(lat) - Math.cos(a) * Math.sin(lat) * Math.cos(A));
    let ra = LST - H * 12 / Math.PI;
    ra = ((ra % 24) + 24) % 24;
    return [raToX(ra), decToY(dec * 180 / Math.PI)];
  };
  const polylines: string[] = [];
  const emit = (pts: [number, number][], cls: string) => {
    let run: [number, number][] = [];
    const flush = () => { if (run.length > 1) polylines.push(`<polyline class="${cls}" points="${run.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>`); run = []; };
    for (let i = 0; i < pts.length; i++) {
      if (i > 0 && Math.abs(pts[i][0] - pts[i - 1][0]) > 1200) flush();   // RA wrap at 0h/24h
      run.push(pts[i]);
    }
    flush();
  };
  for (let alt = 0; alt <= 75; alt += 15) emit(Array.from({ length: 181 }, (_, i) => toCat(alt, i * 2)), alt === 0 ? 'horizon' : 'almucantar');
  for (let az = 0; az < 360; az += 30) emit(Array.from({ length: 45 }, (_, i) => toCat(i * 2, az)), 'vertical');
  return `<g id="alt-az-grid" fill="none" stroke="#4fa58c" stroke-opacity=".65" stroke-width="1.1">${polylines.join('')}</g>`;
}

/** The standalone external atlas document (concept:standalone-svg-document, el:view). */
export function atlasPlatesDocument(cat: Catalogue): string {
  const views = ZONES.map(z => `  <view id="${z.id}" viewBox="${zoneRect(z)}"/>`).join('\n');
  const plates = ZONES.map(z => `  <g class="zone-tint" style="${zoneTintStyle(z)}" fill="var(--tint)">${zonePlate(z, cat)}</g>`).join('\n');
  const frames = ZONES.map(z => `  <rect x="${z.x}" y="${z.y}" width="400" height="300" fill="none" stroke="#c8a45c" stroke-opacity=".35" stroke-width="2"/>
  <text x="${z.x + 14}" y="${z.y + 40}" font-family="serif" font-size="30" fill="#c8a45c" fill-opacity=".7">${pad2(z.n)}</text>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated from src/svg/celestial-astrolabe-cabinet-catalogue.ts (seed 1054). Same catalogue as the inline cabinet. -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2400" height="1200" viewBox="0 0 2400 1200">
  <title>Celestial atlas plates — 24 zone views over one 2400×1200 catalogue</title>
  <desc>Open with #zone-NN to see one named view, or #svgView(viewBox(x y w h)) for an arbitrary crop.</desc>
${views}
  <style>${MAG_CSS}</style>
  <defs>
${symbolMarkup()}
${COMET_SYMBOL}
  </defs>
  <rect width="2400" height="1200" fill="#0d1626"/>
${frames}
${plates}
</svg>
`;
}
