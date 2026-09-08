// forge-metallography-bench — table-driven filter definitions.
// Every filter declares an explicit userSpaceOnUse region and ends by clamping the (always opaque)
// lighting output back into the source silhouette with feComposite operator="in"
// (concept:diffuse-output-opaque). Without that, omitBackground screenshots would show solid boxes.

export interface Region { x: number; y: number; w: number; h: number }

const region = (r: Region): string => `filterUnits="userSpaceOnUse" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"`;

/** `<filter>` wrapper with explicit region and sRGB interpolation. */
export const filterMarkup = (id: string, r: Region, body: string): string =>
  `<filter id="${id}" ${region(r)} color-interpolation-filters="sRGB">${body}</filter>`;

/** Thresholded alpha: any partially transparent source pixel becomes a fully opaque mask sample. */
const alphaMask = (result = 'mask'): string =>
  `<feComponentTransfer in="SourceAlpha" result="${result}"><feFuncA type="linear" slope="6"/></feComponentTransfer>`;

/**
 * Main nameplate filter `#f-plate` (construction note 4). The light-source children are inserted by the
 * scene (one per lighting primitive, swapped by the mode buttons — concept:single-light-source-child).
 *   blur(SourceAlpha) → bump; diffuse(bump) ∘in SourceGraphic ×(k1) SourceGraphic + ambient(k3)
 *   specular(bump) ∘in SourceGraphic, then added (concept:specular-composite-add).
 */
export const plateFilter = (id: string, r: Region, surfaceScale: number, specularExponent: number): string => filterMarkup(id, r, `
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="bump"/>
  <feDiffuseLighting in="bump" surfaceScale="${surfaceScale}" diffuseConstant="0.92" lighting-color="#ffffff" class="tint-white" result="dif"></feDiffuseLighting>
  <feComposite in="dif" in2="SourceGraphic" operator="in" result="difIn"/>
  <feComposite in="difIn" in2="SourceGraphic" operator="arithmetic" k1="1.45" k2="0" k3="0.28" k4="0" result="lit"/>
  <feSpecularLighting in="bump" surfaceScale="${surfaceScale}" specularConstant="0.8" specularExponent="${specularExponent}" lighting-color="#ffffff" class="tint-white" result="spc"></feSpecularLighting>
  <feComposite in="spc" in2="SourceGraphic" operator="in" result="spcIn"/>
  <feComposite in="lit" in2="spcIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>`);

/** Depth-ruler tiles: same recipe, diffuse only, feDistantLight whose azimuth follows the lamp arm. */
export const rulerFilter = (id: string, r: Region, surfaceScale: number): string => filterMarkup(id, r, `
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="bump"/>
  <feDiffuseLighting in="bump" surfaceScale="${surfaceScale}" diffuseConstant="1" lighting-color="#ffffff" result="dif">
    <feDistantLight azimuth="200" elevation="55"/>
  </feDiffuseLighting>
  <feComposite in="dif" in2="SourceGraphic" operator="in" result="difIn"/>
  <feComposite in="difIn" in2="SourceGraphic" operator="arithmetic" k1="0.95" k2="0" k3="0.22" k4="0"/>`);

/**
 * Brushed aluminium (construction note 12): anisotropic blur `stdDeviation="9 0"` turns a jittered
 * hairline field into continuous horizontal streaks (av:feGaussianBlur.stdDeviation=two-values), then
 * broad, dull diffuse + specular. The only per-band difference is the `lighting-color` CSS class.
 */
export const brushFilter = (id: string, r: Region, tint: string, stdDeviation = '9 0'): string => filterMarkup(id, r, `
  <feGaussianBlur in="SourceAlpha" stdDeviation="${stdDeviation}" result="bump"/>
  ${alphaMask()}
  <feDiffuseLighting in="bump" surfaceScale="5" diffuseConstant="1.15" class="tint-${tint}" result="dif">
    <feDistantLight azimuth="250" elevation="38"/>
  </feDiffuseLighting>
  <feSpecularLighting in="bump" surfaceScale="5" specularConstant="0.35" specularExponent="3" class="tint-${tint}" result="spc">
    <feDistantLight azimuth="250" elevation="38"/>
  </feSpecularLighting>
  <feComposite in="dif" in2="spc" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="light"/>
  <feFlood flood-color="#9aa1a9" result="base"/>
  <feComposite in="light" in2="base" operator="arithmetic" k1="1.05" k2="0" k3="0.08" k4="0" result="tinted"/>
  <feComposite in="tinted" in2="mask" operator="in"/>`);

/** Chrome (construction note 13): mirror-band gradient + soft bevel (blur 2.4) + hard, narrow specular. */
export const chromeFilter = (id: string, r: Region): string => filterMarkup(id, r, `
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="bump"/>
  <feSpecularLighting in="bump" surfaceScale="7" specularConstant="1.15" specularExponent="48" lighting-color="#ffffff" result="spc">
    <feDistantLight azimuth="225" elevation="42"/>
  </feSpecularLighting>
  <feComposite in="spc" in2="SourceGraphic" operator="in" result="spcIn"/>
  <feComposite in="SourceGraphic" in2="spcIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>`);

/** Etched specimen quadrant: one feDistantLight per quadrant (azimuth 0/90/180/270, elevation 32). */
export const etchFilter = (id: string, r: Region, azimuth: number): string => filterMarkup(id, r, `
  <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="bump"/>
  ${alphaMask()}
  <feDiffuseLighting in="bump" surfaceScale="7" diffuseConstant="1" lighting-color="#ffffff" result="dif">
    <feDistantLight azimuth="${azimuth}" elevation="32"/>
  </feDiffuseLighting>
  <feFlood flood-color="#b9c0c8" result="base"/>
  <feComposite in="dif" in2="base" operator="arithmetic" k1="1.5" k2="0" k3="0.12" k4="0" result="lit"/>
  <feComposite in="lit" in2="mask" operator="in"/>`);

/** The six inspection windows (construction note 14): what the height map is and how lights read it. */
export const inspectionFilters = (prefix: string, tiles: Region[]): string => {
  const c = (t: Region) => ({ cx: t.x + t.w / 2, cy: t.y + t.h / 2 });
  const [a, ab, s1, s24, p24, p180] = tiles;
  return [
    // α — SourceAlpha flooded white, floating on the transparent cut-out
    filterMarkup(`${prefix}-alpha`, a, `<feFlood flood-color="#ffffff"/><feComposite in2="SourceAlpha" operator="in"/>`),
    // α·blur — the blurred alpha that the lighting primitives actually read (rounded bevel vs plateau)
    filterMarkup(`${prefix}-alpha-blur`, ab, `<feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/><feFlood flood-color="#ffffff" result="w"/><feComposite in="w" in2="b" operator="in"/>`),
    // S exp=1 / exp=24 — raw feSpecularLighting output only (white glints on transparency)
    filterMarkup(`${prefix}-spec-1`, s1, `<feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feSpecularLighting in="b" surfaceScale="8" specularConstant="1" specularExponent="1" lighting-color="#ffffff"><fePointLight x="${c(s1).cx - 8}" y="${c(s1).cy - 10}" z="34"/></feSpecularLighting>`),
    filterMarkup(`${prefix}-spec-24`, s24, `<feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feSpecularLighting in="b" surfaceScale="8" specularConstant="1" specularExponent="24" lighting-color="#ffffff"><fePointLight x="${c(s24).cx - 8}" y="${c(s24).cy - 10}" z="34"/></feSpecularLighting>`),
    // P z=24 / z=180 — the same fePointLight, hotspot tight vs broad (at:fePointLight.z)
    filterMarkup(`${prefix}-point-24`, p24, `<feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feDiffuseLighting in="b" surfaceScale="8" diffuseConstant="1.2" lighting-color="#ffffff" result="d"><fePointLight x="${c(p24).cx}" y="${c(p24).cy}" z="24"/></feDiffuseLighting><feFlood flood-color="#aeb6be" result="base"/><feComposite in="d" in2="base" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit"/><feComposite in="lit" in2="SourceGraphic" operator="in"/>`),
    filterMarkup(`${prefix}-point-180`, p180, `<feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feDiffuseLighting in="b" surfaceScale="8" diffuseConstant="1.2" lighting-color="#ffffff" result="d"><fePointLight x="${c(p180).cx}" y="${c(p180).cy}" z="180"/></feDiffuseLighting><feFlood flood-color="#aeb6be" result="base"/><feComposite in="d" in2="base" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit"/><feComposite in="lit" in2="SourceGraphic" operator="in"/>`),
  ].join('');
};

// ---------- feConvolveMatrix reader tiles (construction notes 10–11) ----------

export interface KernelSpec {
  id: string; title: string; order: string; kernel: string;
  divisor?: string; bias?: string; preserveAlpha?: string; targetX?: string; edgeMode?: string;
  concept: string;
}

const ones = (n: number): string => Array(n).fill('1').join(' ');

export const KERNELS: KernelSpec[] = [
  // row 1 — same order, three kernels
  { id: 'emboss', title: 'EMBOSS', order: '3 3', kernel: '-2 -1 0 -1 1 1 0 1 2', divisor: '1', bias: '0.5', concept: 'concept:convolve-emboss' },
  { id: 'sharpen', title: 'SHARPEN', order: '3 3', kernel: '0 -1 0 -1 5 -1 0 -1 0', preserveAlpha: 'true', concept: 'concept:convolve-sharpen' },
  { id: 'laplace', title: 'LAPLACIAN EDGE', order: '3 3', kernel: '1 1 1 1 -8 1 1 1 1', preserveAlpha: 'true', concept: 'concept:convolve-edge-detect' },
  // row 2 — box kernels of three orders, incl. the non-square 7×1 motion smear anchored at targetX=6
  { id: 'box3', title: 'BOX 3×3', order: '3 3', kernel: ones(9), divisor: '9', concept: 'concept:convolve-box-blur' },
  { id: 'box5', title: 'BOX 5×5', order: '5 5', kernel: ones(25), divisor: '25', concept: 'concept:convolve-box-blur' },
  { id: 'box7x1', title: 'BOX 7×1', order: '7 1', kernel: ones(7), divisor: '7', targetX: '6', concept: 'concept:convolve-box-blur' },
  // row 3 — one 9×9 box kernel, three border policies
  { id: 'edge-duplicate', title: 'EDGE duplicate', order: '9 9', kernel: ones(81), divisor: '81', edgeMode: 'duplicate', concept: 'concept:convolve-box-blur' },
  { id: 'edge-wrap', title: 'EDGE wrap', order: '9 9', kernel: ones(81), divisor: '81', edgeMode: 'wrap', concept: 'concept:convolve-box-blur' },
  { id: 'edge-none', title: 'EDGE none', order: '9 9', kernel: ones(81), divisor: '81', edgeMode: 'none', concept: 'concept:convolve-box-blur' },
];

/** Filter region is exactly the tile rectangle so edgeMode acts on the tile border. */
export const kernelFilter = (spec: KernelSpec, r: Region): string => {
  const attrs = [`order="${spec.order}"`, `kernelMatrix="${spec.kernel}"`,
    spec.divisor && `divisor="${spec.divisor}"`, spec.bias && `bias="${spec.bias}"`,
    spec.preserveAlpha && `preserveAlpha="${spec.preserveAlpha}"`, spec.targetX && `targetX="${spec.targetX}"`,
    spec.edgeMode && `edgeMode="${spec.edgeMode}"`].filter(Boolean).join(' ');
  return filterMarkup(`kv-${spec.id}`, r, `<feConvolveMatrix in="SourceGraphic" ${attrs}/>`);
};
