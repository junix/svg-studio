// STUB — replace with the full implementation of `seismic-drum-console` (docs/svg-feature-demos.md §3).
import { el, mark, FONT_SERIF } from './lib';

export function render(stage: SVGSVGElement): void {
  stage.append(el('title', {}, 'seismic-drum-console (stub)'));
  stage.append(el('rect', { x: 100, y: 100, width: 1200, height: 700, rx: 24, fill: '#1d2a3a', 'fill-opacity': .6 }));
  for (let i = 0; i < 40; i++) stage.append(el('circle', { cx: 160 + i * 28, cy: 450, r: 8, fill: `hsl(${i * 9} 70% 60%)` }));
  stage.append(el('text', { x: 700, y: 200, 'text-anchor': 'middle', 'font-family': FONT_SERIF, 'font-size': 40, fill: '#f0d9a0' }, 'seismic-drum-console'));
  mark(stage, 'concept:stub');
}
