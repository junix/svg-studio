// Registry of native SVG demos: `?scene=<id>` → lazy module exporting `render(stage)`.
// Ids and catalog fields come from docs/svg-feature-demos.json.
import type { SvgDemo } from './lib';

export const SVG_DEMOS: Record<string, () => Promise<SvgDemo>> = {
  'celestial-astrolabe-cabinet': () => import('./celestial-astrolabe-cabinet'),
  'museum-label-panel': () => import('./museum-label-panel'),
  'ship-lofting-floor': () => import('./ship-lofting-floor'),
  'guilloche-intaglio-plate': () => import('./guilloche-intaglio-plate'),
  'auroral-spectrograph': () => import('./auroral-spectrograph'),
  'jacquard-loom-draft': () => import('./jacquard-loom-draft'),
  'stele-rubbing-hall': () => import('./stele-rubbing-hall'),
  'letterpress-type-specimen': () => import('./letterpress-type-specimen'),
  'pipeline-mimic-board': () => import('./pipeline-mimic-board'),
  'four-colour-press-check': () => import('./four-colour-press-check'),
  'forge-metallography-bench': () => import('./forge-metallography-bench'),
  'mycelium-culture-chamber': () => import('./mycelium-culture-chamber'),
  'neon-sign-workshop': () => import('./neon-sign-workshop'),
  'escapement-chronometer': () => import('./escapement-chronometer'),
  'core-sample-stratigraphy': () => import('./core-sample-stratigraphy'),
  'seismic-drum-console': () => import('./seismic-drum-console'),
};

export const isSvgDemo = (scene: string): boolean => Object.hasOwn(SVG_DEMOS, scene);
