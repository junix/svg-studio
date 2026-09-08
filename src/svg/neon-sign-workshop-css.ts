// neon-sign-workshop — stylesheet, data-URI SVG tiles and the shared tube-path generator.
// The <style> block lives inside #stage (an inline SVG in an HTML document, so it is a document-wide
// stylesheet); every selector is scoped with `#stage` and every id carries the `ns-` prefix so several
// inline SVGs can share one HTML document without id collisions.
import { fmt } from './lib';
import { EMBEDDED_FACES } from './font-data';

export type Pt = [number, number];

/**
 * Bent-tube path (构造要点 3): every interior vertex of the skeleton polyline is filleted with radius r —
 * from the in/out unit vectors we take the two tangent points, write `L` to the first and `A r r 0 0 sweep`
 * to the second. One `d` is produced and reused verbatim by the sign frame, the jig references and the
 * radius ruler, so those comparisons differ only by filter / clip, never by geometry.
 */
export function tubePath(points: Pt[], r: number): string {
  const parts = [`M${fmt(points[0][0])} ${fmt(points[0][1])}`];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1], [cx, cy] = points[i], [nx, ny] = points[i + 1];
    const inLen = Math.hypot(cx - px, cy - py), outLen = Math.hypot(nx - cx, ny - cy);
    const ux = (cx - px) / inLen, uy = (cy - py) / inLen;   // unit vector into the vertex
    const vx = (nx - cx) / outLen, vy = (ny - cy) / outLen; // unit vector out of the vertex
    const phi = Math.acos(Math.max(-1, Math.min(1, -(ux * vx + uy * vy)))); // interior angle
    const t = r / Math.tan(phi / 2);                          // tangent distance from the vertex
    const sweep = ux * vy - uy * vx > 0 ? 1 : 0;              // turn direction → arc sweep flag
    parts.push(`L${fmt(cx - ux * t)} ${fmt(cy - uy * t)}`, `A${r} ${r} 0 0 ${sweep} ${fmt(cx + vx * t)} ${fmt(cy + vy * t)}`);
  }
  const [ex, ey] = points[points.length - 1];
  parts.push(`L${fmt(ex)} ${fmt(ey)}`);
  return parts.join(' ');
}

/** Skeleton of the sign frame in local units (280×140, open at the bottom like a real tube). */
export const TUBE_SKELETON: Pt[] = [[120, 140], [0, 140], [0, 0], [280, 0], [280, 140], [160, 140]];
export const TUBE_R = 26;
export const TUBE_W = 22;
export const TUBE_D = tubePath(TUBE_SKELETON, TUBE_R);
/** Fill box (geometry only) and stroke box of the tube in local units — printed beside the jig samples. */
export const TUBE_FILL_BOX = { x: 0, y: 0, w: 280, h: 140 };
export const TUBE_STROKE_BOX = { x: -TUBE_W / 2, y: -TUBE_W / 2, w: 280 + TUBE_W, h: 140 + TUBE_W };

/**
 * `concept:svg-data-uri-encoding` — utf-8 data URI, not base64, so the markup stays readable:
 * single-quoted attributes, `#` → `%23`, `<`/`>` → `%3C`/`%3E`, braces and spaces percent-escaped.
 */
export const svgDataUri = (markup: string): string => 'data:image/svg+xml,' + markup.replace(/\s+/g, ' ').trim()
  .replace(/[<>#{}"%\s]/g, ch => ({ '<': '%3C', '>': '%3E', '#': '%23', '{': '%7B', '}': '%7D', '"': '%22', '%': '%25', ' ': '%20' } as Record<string, string>)[ch]);

/**
 * `concept:svg-as-css-background-image` — the wall tile. A media query inside the SVG reacts to the *box*
 * it is painted into: at background-size:120px (#wall) the full annotated tube drawing shows, at 48px
 * (.board-frame) only the two end dots remain. The same URI is reused once more as a CSS mask-image.
 */
export const WALL_TILE_URI = svgDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
  <style>.tube,.anno{display:none}@media (min-width:96px){.tube,.anno{display:block}}</style>
  <path class='tube' d='M18 96V44a22 22 0 0 1 22-22h56' fill='none' stroke='#2a4758' stroke-width='5' stroke-linecap='round'/>
  <circle cx='18' cy='96' r='3.5' fill='#3d6f82'/><circle cx='96' cy='22' r='3.5' fill='#3d6f82'/>
  <g class='anno' fill='none' stroke='#4c7789' stroke-width='1'>
    <path d='M18 44h22v-22' stroke-dasharray='3 3'/>
    <path d='M30 44a10 10 0 0 1 10-10'/>
    <path d='M8 96v-52M12 96h-8M12 44h-8'/>
    <text x='46' y='42' font-size='9' fill='#4c7789' stroke='none' font-family='monospace'>r22</text>
    <text x='60' y='110' font-size='9' fill='#4c7789' stroke='none' font-family='monospace'>%23 → %2523</text>
  </g>
</svg>`);

/** Rain-drop window used as `mask-image` (`concept:mask-image-svg-url`, `css:mask-size`, `css:mask-repeat`). */
export const DROP_URI = svgDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'>
  <path d='M20 3C20 3 8 19 8 26a12 12 0 0 0 24 0C32 19 20 3 20 3Z' fill='#fff'/>
</svg>`);

/** `css:font-face-data-uri` — the NeonSubset family: Latin from the embedded Noto Sans subset, CJK from the
 *  harvested Noto Sans CJK subset, both inline base64 WOFF2 (the network is blocked in capture). */
function neonFontFaces(): string {
  const face = (family: string, weight: number, range: string) => {
    const embedded = EMBEDDED_FACES.find(f => f.family === family && f.weight === weight && f.style === 'normal')
      ?? EMBEDDED_FACES.find(f => f.family === 'Studio Sans' && f.weight === weight);
    return embedded ? `@font-face{font-family:'NeonSubset';font-weight:${weight};font-style:normal;font-display:block;unicode-range:${range};src:url(${embedded.dataUri}) format('woff2');}` : '';
  };
  const latin = 'U+0000-024F,U+0370-03FF,U+2000-22FF,U+2500-25FF';
  const cjk = 'U+2E80-FFEF';
  return [face('Studio Sans', 400, latin), face('Studio Sans', 700, latin), face('Studio CJK', 400, cjk), face('Studio CJK', 700, cjk)].join('\n');
}

/** Three same-vertex-count polygons for the plate morph (nameplate → shield → arrow). */
export const PLATE_SHAPES = {
  nameplate: 'polygon(4% 0%, 96% 0%, 100% 8%, 100% 92%, 96% 100%, 50% 100%, 4% 100%, 0% 92%, 0% 8%)',
  shield: 'polygon(6% 0%, 94% 0%, 100% 12%, 96% 62%, 74% 88%, 50% 100%, 26% 88%, 4% 62%, 0% 12%)',
  arrow: 'polygon(0% 12%, 78% 12%, 78% 0%, 100% 50%, 78% 100%, 50% 88%, 0% 88%, 4% 50%, 0% 12%)',
};

const PUDDLE_MASKS = 'radial-gradient(circle at 38% 50%, #000 0 42%, transparent 43%), radial-gradient(circle at 62% 50%, #000 0 42%, transparent 43%)';

export function stageCss(): string {
  return `
${neonFontFaces()}
/* concept:inline-svg-in-html — one rule on the <svg> root recolours and refonts SVG <text fill=currentColor> and the HTML board alike */
#stage{color:#bfe9ff;font-family:'NeonSubset',ui-sans-serif,'Noto Sans CJK SC',sans-serif}
#stage .mono{font-family:'Studio Mono','Latin Modern Mono',Menlo,monospace}
#stage .html-root{position:relative;width:1400px;height:900px;margin:0;pointer-events:none}
/* concept:svg-as-css-background-image — same data-URI tile, two box sizes, two renderings (media query inside the SVG) */
#stage .wall-panel{position:absolute;box-sizing:border-box;border-radius:10px;background:rgba(9,19,29,.88) url("${WALL_TILE_URI}") repeat;background-size:120px 120px}
#stage .board-frame{position:absolute;left:716px;top:104px;width:328px;height:348px;box-sizing:border-box;border-radius:10px;border:1px solid rgba(143,246,255,.18);background:rgba(10,21,32,.9) url("${WALL_TILE_URI}") repeat;background-size:48px 48px}
/* css:svg-filter-on-html-element + concept:clip-path-html-to-svg-reference + concept:mask-html-to-svg-reference —
   the HTML board carries exactly the three references the SVG sign group carries as attributes */
#stage .board{position:absolute;inset:16px;box-sizing:border-box;padding:26px 28px 22px;background:transparent;color:inherit;filter:url(#ns-f-neon);clip-path:url(#ns-clip-plate);mask:url(#ns-m-tube-fade)}
#stage .board h3,#stage .reflection h3{margin:0 0 8px;font-size:18px;font-weight:700;letter-spacing:.04em}
#stage .row{display:grid;grid-template-columns:1fr auto;gap:0 10px;align-items:baseline;padding:5px 0 4px;font-size:15px;border-bottom:1px dotted rgba(191,233,255,.55)}
#stage .row b{font-weight:400;font-family:'Studio Mono',monospace;font-size:14px}
#stage .foot{margin:10px 0 0;font-size:13px;letter-spacing:.32em;text-align:center}
#stage .board-bad,#stage .board-ok{position:absolute;left:48px;width:124px;height:42px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;letter-spacing:.12em;border-radius:5px;filter:url(#ns-f-neon)}
#stage .board-bad{top:142px;background:#12202c}
#stage .board-ok{top:210px;background:transparent}
/* css:mask-layers + css:mask-mode — SVG <mask> read as luminance, gradient read as alpha; both constrain the HTML reflection */
#stage .reflection{position:absolute;left:716px;top:700px;width:328px;height:150px;overflow:hidden;color:#9fe0ff;filter:url(#ns-f-neon);
  mask:url(#ns-m-puddle) luminance,linear-gradient(#000 0%,transparent 78%) alpha;mask-mode:luminance,alpha;
  -webkit-mask-source-type:luminance,alpha}
@supports not (mask-image:url(#x)){#stage .reflection{-webkit-mask-image:radial-gradient(ellipse 48% 46% at 50% 50%,#000 60%,transparent 100%),linear-gradient(#000 0%,transparent 78%);mask-image:radial-gradient(ellipse 48% 46% at 50% 50%,#000 60%,transparent 100%),linear-gradient(#000 0%,transparent 78%)}}
#stage .reflection-inner{position:absolute;left:0;right:0;top:-6px;padding:0 28px;transform:scaleY(-1);transform-origin:50% 50%;opacity:.85}
#stage .reflection .row{font-size:14px;padding:3px 0 2px}
/* css:filter-transition — cards interpolate CSS filter functions on hover */
#stage .card{transition:filter .35s ease}
#stage .card:hover{filter:saturate(1.4)}
/* css:clip-path-basic-shapes — six card faces, six basic shapes, zero <clipPath> elements involved */
#stage .card-1{clip-path:inset(6px round 12px)}
#stage .card-2{clip-path:circle(46% at 50% 48%)}
#stage .card-3{clip-path:ellipse(48% 44% at 50% 50%)}
#stage .card-4{clip-path:polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%)}
#stage .card-5{clip-path:path("M6 22Q6 6 22 6H124L136 22L148 6H190Q206 6 206 22V128Q206 144 190 144H22Q6 144 6 128Z")}
#stage .card-6{clip-path:inset(4px)}
@supports (clip-path:rect(0 auto auto 0)){#stage .card-6{clip-path:rect(4px auto auto 4px)}}
/* css:filter-chaining + css:filter-functions-on-svg — url() filter mixed with functions; order matters */
#stage .chain-a{filter:url(#ns-f-tint) drop-shadow(6px 8px 4px #001f2e) blur(.4px)}
#stage .chain-b{filter:drop-shadow(6px 8px 4px #001f2e) url(#ns-f-tint)}
/* css:clip-path-geometry-box — one tube path, three reference boxes */
#stage .jig-fill{clip-path:inset(10%) fill-box}
#stage .jig-stroke{clip-path:inset(10%) stroke-box}
#stage .jig-view{clip-path:inset(10%) view-box}
/* css:mask-image + css:mask-composite — CSS gradient masks on SVG rects, legacy WebKit keywords alongside */
#stage .puddle{mask-image:${PUDDLE_MASKS};-webkit-mask-image:${PUDDLE_MASKS}}
#stage .puddle-sub{-webkit-mask-composite:source-out;mask-composite:subtract}
#stage .puddle-int{-webkit-mask-composite:source-in;mask-composite:intersect}
#stage .puddle-exc{-webkit-mask-composite:xor;mask-composite:exclude}
#stage .ground-far{mask-image:linear-gradient(to bottom,#000 30%,transparent);-webkit-mask-image:linear-gradient(to bottom,#000 30%,transparent)}
/* css:mask-mode — identical colour gradient, read as alpha (no fade) versus luminance (clear fade) */
#stage .patch{mask-image:linear-gradient(to right,#fff,#ff2f9d 55%,#061018);-webkit-mask-image:linear-gradient(to right,#fff,#ff2f9d 55%,#061018)}
#stage .patch-alpha{mask-mode:alpha;-webkit-mask-source-type:alpha}
#stage .patch-lum{mask-mode:luminance;-webkit-mask-source-type:luminance}
/* css:mask-size + css:mask-repeat — the drop pattern's scale, not its content, changes */
#stage .rain-tile{mask-image:url("${DROP_URI}");mask-size:40px 40px;mask-repeat:repeat;-webkit-mask-image:url("${DROP_URI}");-webkit-mask-size:40px 40px}
#stage .rain-one{mask-image:url("${DROP_URI}");mask-size:contain;mask-repeat:no-repeat;mask-position:center;-webkit-mask-image:url("${DROP_URI}");-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat}
#stage .rain-wall{mask-image:url("${WALL_TILE_URI}");mask-size:60px 60px;mask-repeat:repeat;-webkit-mask-image:url("${WALL_TILE_URI}");-webkit-mask-size:60px 60px}
/* concept:clip-path-shape-transition — same function, same vertex count, interpolable */
#stage .plate-morph{clip-path:${PLATE_SHAPES.nameplate};animation:ns-plate 9s ease-in-out infinite alternate}
@keyframes ns-plate{0%{clip-path:${PLATE_SHAPES.nameplate}}50%{clip-path:${PLATE_SHAPES.shield}}100%{clip-path:${PLATE_SHAPES.arrow}}}
#stage .power-reveal{clip-path:circle(75% at 50% 50%);animation:ns-power 3s ease-out both}
@keyframes ns-power{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(75% at 50% 50%)}}
#stage .morph-sample{clip-path:polygon(50% 0%,100% 100%,0% 100%,50% 0%,100% 100%,0% 100%);transition:clip-path .6s ease}
#stage .morph-sample:hover{clip-path:polygon(25% 4%,75% 4%,100% 50%,75% 96%,25% 96%,0% 50%)}
#stage .hit{cursor:crosshair}
`;
}
