import arrowComponentsSvg from '../examples/arrow-components.svg?raw';

declare global {
  interface Window {
    __ARROW_COMPONENTS__?: {
      ids: string[];
      selected: string;
      sourcePath: string;
      select: (id: string) => boolean;
      getTemplate: (id: string) => string | null;
    };
  }
}

export const ARROW_COMPONENT_IDS = [
  'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08',
  'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08',
] as const;

export function mountArrowComponents(app: HTMLDivElement): SVGSVGElement {
  app.innerHTML = arrowComponentsSvg.trim();
  const stage = app.querySelector<SVGSVGElement>('#stage');
  if (!stage) throw new Error('arrow-components.svg must contain #stage');

  const specimens = Array.from(stage.querySelectorAll<SVGGElement>('.arrow-component'));
  const domIds = specimens.map(item => item.dataset.id ?? '');
  if (domIds.join(',') !== ARROW_COMPONENT_IDS.join(',')) throw new Error('arrow component SVG ids do not match the TypeScript manifest');
  const readout = stage.querySelector<SVGTextElement>('#selected-readout');
  const api = {
    ids: [...ARROW_COMPONENT_IDS],
    selected: 'S01',
    sourcePath: 'examples/arrow-components.svg',
    select: (_id: string) => false,
    getTemplate: (id: string) => stage.querySelector<SVGGElement>(`#component-${id}`)?.outerHTML ?? null,
  };

  const select = (id: string): boolean => {
    const target = specimens.find(item => item.dataset.id === id);
    if (!target) return false;
    for (const item of specimens) {
      const active = item === target;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    }
    api.selected = id;
    if (readout) readout.textContent = `${id} · ${target.dataset.use ?? ''}`;
    return true;
  };
  api.select = select;

  for (const specimen of specimens) {
    specimen.addEventListener('click', () => select(specimen.dataset.id ?? ''));
    specimen.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      select(specimen.dataset.id ?? '');
    });
  }

  window.__INTERACTION_COUNT__ = 0;
  stage.addEventListener('pointermove', () => {
    window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
    stage.style.filter = 'saturate(1.04)';
  });
  stage.addEventListener('pointerdown', () => {
    window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0) + 1;
  });
  window.__ARROW_COMPONENTS__ = api;
  select('S01');
  window.__VIS_READY__ = true;
  return stage;
}
