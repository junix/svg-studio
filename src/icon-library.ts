import iconLibrarySvg from '../examples/icon-library.svg?raw';

declare global {
  interface Window {
    __ICON_LIBRARY__?: {
      ids: string[];
      selected: string;
      sourcePath: string;
      select: (id: string) => boolean;
      getTemplate: (id: string) => string | null;
    };
  }
}

export const ICON_LIBRARY_IDS = [
  'O01', 'O02', 'O03', 'O04', 'O05', 'O06',
  'F01', 'F02', 'F03', 'F04', 'F05', 'F06',
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06',
  'E01', 'E02', 'E03', 'E04', 'E05', 'E06',
] as const;

export function mountIconLibrary(app: HTMLDivElement): SVGSVGElement {
  app.innerHTML = iconLibrarySvg.trim();
  const stage = app.querySelector<SVGSVGElement>('#stage');
  if (!stage) throw new Error('icon-library.svg must contain #stage');

  const specimens = Array.from(stage.querySelectorAll<SVGGElement>('.icon-specimen'));
  const domIds = specimens.map(item => item.dataset.id ?? '');
  if (domIds.join(',') !== ICON_LIBRARY_IDS.join(',')) throw new Error('icon library SVG ids do not match the TypeScript manifest');
  const readout = stage.querySelector<SVGTextElement>('#selected-readout');
  const api = {
    ids: [...ICON_LIBRARY_IDS],
    selected: 'O01',
    sourcePath: 'examples/icon-library.svg',
    select: (_id: string) => false,
    getTemplate: (id: string) => stage.querySelector<SVGGElement>(`#icon-${id}`)?.outerHTML ?? null,
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
  window.__ICON_LIBRARY__ = api;
  select('O01');
  window.__VIS_READY__ = true;
  return stage;
}
