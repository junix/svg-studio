import arrowLibrarySvg from '../examples/arrow-library.svg?raw';

declare global {
  interface Window {
    __ARROW_LIBRARY__?: {
      ids: string[];
      selected: string;
      sourcePath: string;
      select: (id: string) => boolean;
      getTemplate: (id: string) => string | null;
    };
  }
}

export const ARROW_LIBRARY_IDS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06',
  'B01', 'B02', 'B03', 'B04', 'B05', 'B06',
  'C01', 'C02', 'C03', 'C04', 'C05', 'C06',
] as const;

export function mountArrowLibrary(app: HTMLDivElement): SVGSVGElement {
  app.innerHTML = arrowLibrarySvg.trim();
  const stage = app.querySelector<SVGSVGElement>('#stage');
  if (!stage) throw new Error('arrow-library.svg must contain #stage');

  const specimens = Array.from(stage.querySelectorAll<SVGGElement>('.specimen'));
  const domIds = specimens.map(item => item.dataset.id ?? '');
  if (domIds.join(',') !== ARROW_LIBRARY_IDS.join(',')) throw new Error('arrow library SVG ids do not match the TypeScript manifest');
  const readout = stage.querySelector<SVGTextElement>('#selected-readout');
  const api = {
    ids: [...ARROW_LIBRARY_IDS],
    selected: 'A01',
    sourcePath: 'examples/arrow-library.svg',
    select: (_id: string) => false,
    getTemplate: (id: string) => stage.querySelector<SVGGElement>(`#spec-${id}`)?.outerHTML ?? null,
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
  window.__ARROW_LIBRARY__ = api;
  select('A01');
  window.__VIS_READY__ = true;
  return stage;
}
