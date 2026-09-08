import { el, fragment, mark, freezeAt, isExport, fontFaceCss } from './lib';
import { buildCatalogue, ZONES, zoneRect, zonePlate, symbolMarkup, MAG_CSS, altAzGridMarkup, zoneTintStyle, type Star } from './celestial-astrolabe-cabinet-catalogue';
import { buildDoor, buildShelf, buildColourStrip, mono, serif, plate, BRASS, BRASS_HI, BRASS_DK, NAVY, VERD } from './celestial-astrolabe-cabinet-panels';

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('role', 'img'); stage.setAttribute('aria-labelledby', 'atlas-title atlas-desc');
  stage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  stage.append(el('title', { id: 'atlas-title' }, '铜盘星图柜'), el('desc', { id: 'atlas-desc' }, '九枚星形母版，二十四个天区视口。点击门上天区切换主盘与取景卡，移动指针读取星表。'));
  stage.append(el('style', {}, fontFaceCss() + MAG_CSS + `
    #stage a{cursor:pointer} .slip{opacity:0;pointer-events:none}.zone:target .slip{opacity:1}
    .zone:target .tag-plate{stroke:#fff2b0;stroke-width:3}.star:hover{filter:brightness(1.6)}
    use .star-core{fill:red} #gl-var .pulse-ring{stroke:#ffd36e}`));
  const cat = buildCatalogue(), defs = el('defs');
  defs.append(fragment(symbolMarkup()), fragment(altAzGridMarkup()),
    el('circle', { id: 'rivet', r: 2, fill: BRASS_HI }), el('circle', { id: 'pin', r: 3, fill: BRASS_HI }),
    el('rect', { id: 'tally-bar', width: 28, height: 4, fill: BRASS_HI }),
    el('svg', { id: 'gl-k-corner', viewBox: '0 0 20 20' }, el('use', { href: '#gl-k', x: 10, y: 10, width: 20, height: 20 })));
  for (const z of ZONES) defs.append(fragment(zonePlate(z, cat)), el('view', { id: `view-${z.id}`, viewBox: zoneRect(z) }));
  defs.append(el('g', { id: 'star-field' }, ...ZONES.map(z => el('use', { href: `#${z.id}-plate`, style: zoneTintStyle(z), fill: 'var(--tint)' }))));
  stage.append(defs, serif(50, 48, 'CELESTIAL ASTROLABE CABINET', { 'font-size': 25 }),
    mono(52, 72, `CATALOGUE 1054 · ${cat.stars.length} STARS · NINE MASTERS`, { fill: BRASS_HI }));
  stage.append(el('circle', { cx: 430, cy: 400, r: 320, fill: NAVY, 'fill-opacity': .55, stroke: BRASS_DK, 'stroke-width': 3 }));
  const dial = el('svg', { id: 'dial-window', x: 200, y: 170, width: 460, height: 460, viewBox: zoneRect(ZONES[6]), preserveAspectRatio: 'xMidYMid slice' },
    el('use', { href: '#alt-az-grid' }), el('use', { href: '#star-field' }));
  const sweep = el('animate', { id: 'sweep', attributeName: 'viewBox', begin: 'sweep-lever.click', dur: '18s', fill: 'freeze', values: `${zoneRect(ZONES[6])};${zoneRect(ZONES[7])}` });
  dial.append(sweep); stage.append(dial);
  stage.append(el('path', { d: 'M750 400A320 320 0 1 0 110 400A320 320 0 1 0 750 400ZM658 400A228 228 0 1 1 202 400A228 228 0 1 1 658 400Z', fill: BRASS, 'fill-opacity': .88, 'fill-rule': 'evenodd', stroke: BRASS_DK }));
  for (let i = 0; i < 120; i++) {
    const a = i * Math.PI / 60, r0 = i % 10 === 0 ? 292 : i % 5 === 0 ? 303 : 310;
    stage.append(el('line', { x1: 430 + Math.sin(a)*r0, y1: 400-Math.cos(a)*r0, x2: 430+Math.sin(a)*316, y2: 400-Math.cos(a)*316, stroke: BRASS_DK, 'stroke-width': i%5 ? .8 : 1.5 }));
    if (i%10 === 0) stage.append(mono(430+Math.sin(a)*278, 404-Math.cos(a)*278, `${i*3}°`, { 'text-anchor': 'middle' }));
  }
  const alidade = (transform: string, ghost = false) => el('g', { id: ghost ? 'alidade-ghost' : 'alidade', transform, 'pointer-events': 'none' },
    el('path', { d: 'M145 393H715V407H145Z', fill: ghost ? 'none' : BRASS, stroke: ghost ? VERD : BRASS_DK, 'stroke-dasharray': ghost ? '4 3' : null, 'fill-opacity': .82 }),
    el('use', { href: '#pin', x: 430, y: 400 }));
  stage.append(alidade('translate(430,400) rotate(37) translate(-430,-400)', true), alidade('rotate(37 430 400)'));
  const lever = el('g', { id: 'sweep-lever', role: 'button', tabindex: 0, 'aria-label': '巡天' }, plate(62, 654, 104, 34), mono(74, 676, 'SWEEP SKY'));
  lever.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') sweep.beginElement(); }); stage.append(lever);
  const readout = el('g', { id: 'atlas-readout', 'pointer-events': 'none' }, plate(252, 641, 392, 63));
  const lines = Array.from({ length: 4 }, (_, i) => mono(262, 654+i*14, '', { id: `atlas-readout-${i}`, 'font-size': 11 })); readout.append(...lines); stage.append(readout);
  const writeStar = (s: Star, target: Element | null) => {
    lines[0].textContent = `EVENT TARGET ${target?.localName ?? 'use'}#${target?.id ?? s.id}`;
    lines[1].textContent = 'INSTANCE ROOT: NOT EXPOSED BY THIS ENGINE';
    lines[2].textContent = `VIEWPORT ${target instanceof SVGElement ? target.viewportElement?.id || 'dial-window' : 'dial-window'}`;
    lines[3].textContent = `RA ${(s.x/100).toFixed(2)}h DEC ${(90-s.y*.15).toFixed(1)} M ${s.mag.toFixed(1)} ${s.master.toUpperCase()}`;
  };
  stage.append(buildColourStrip(), buildDoor()); const shelf = buildShelf(); stage.append(shelf.group);
  const select = () => {
    const z = ZONES.find(z => `#${z.id}` === location.hash) ?? ZONES[6];
    const previous = dial.getAttribute('viewBox')!;
    dial.setAttribute('viewBox', zoneRect(z)); sweep.setAttribute('values', `${previous};${zoneRect(z)}`);
    if (!isExport() && !matchMedia('(prefers-reduced-motion: reduce)').matches) sweep.beginElement();
    writeStar(cat.byZone[z.n-1][0], null); stage.dataset.zone = z.id;
  };
  if (!ZONES.some(z => `#${z.id}` === location.hash)) location.hash = 'zone-07';
  window.addEventListener('hashchange', select); select(); window.scrollTo(0, 0);
  dial.addEventListener('pointermove', event => {
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(dial.getScreenCTM()!.inverse());
    const nearest = cat.stars.reduce((best,s) => Math.hypot(s.x-p.x,s.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y) ? s : best);
    writeStar(nearest, event.target as Element);
  });
  const probe = new Image(); probe.src = '/celestial-astrolabe-cabinet/probe.svg#svgView(viewBox(100 0 100 100))';
  let honored = false;
  try { await probe.decode(); const canvas = new OffscreenCanvas(20,20), ctx = canvas.getContext('2d')!; ctx.drawImage(probe,0,0,20,20); const [r,g] = ctx.getImageData(10,10,1,1).data; honored = g > r; } catch { /* Inline mirrors preserve the selected viewport. */ }
  stage.querySelector('#svgview-status')!.textContent = `SVGVIEW: ${honored ? 'HONORED' : 'FALLBACK'}`;
  if (!honored) { stage.querySelectorAll('.slip-image').forEach(n=>n.setAttribute('opacity','0')); stage.querySelectorAll('.slip-mirror').forEach(n=>n.setAttribute('opacity','1')); }
  await document.fonts.ready;
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  const externalOk = shelf.comets.every(n=>n.getBBox().width>0);
  if (!externalOk) shelf.comets.forEach(n=>n.setAttribute('href','#gl-neb'));
  stage.querySelector('#external-status')!.textContent = `EXTERNAL USE: ${externalOk ? 'HONORED' : 'FALLBACK'}`;
  const reference = stage.querySelector<SVGUseElement>('#ref-probe')!;
  const refBox = reference.getBBox();
  const needsAnchor = refBox.x > reference.x.baseVal.value - 2;
  stage.dataset.symbolAnchor = needsAnchor ? 'translated-fallback' : 'native';
  if (needsAnchor) for (const use of stage.querySelectorAll<SVGUseElement>('use[href^="#gl-"]')) {
    if (!/^#gl-(ob|a|f|g|k|m|double|var|neb)$/.test(use.getAttribute('href')!)) continue;
    const w = use.width.baseVal.value, h = use.height.baseVal.value;
    if (w > 0 && h > 0) use.setAttribute('transform', `translate(${-w/2} ${-h/2}) ${use.getAttribute('transform') ?? ''}`);
  }
  if (isExport() || matchMedia('(prefers-reduced-motion: reduce)').matches) freezeAt(stage,4.8);
  mark(stage, 'concept:fragment-identifier-viewid','concept:nested-svg','concept:nested-viewport-clipping','concept:painting-order-document',
    'concept:sprite-sheet','concept:svgview-fragment-identifier','concept:svgview-viewbox','concept:use-css-custom-properties-passthrough',
    'concept:use-currentcolor-passthrough','concept:use-external-fragment','concept:use-inherited-fill-override','concept:use-of-use',
    'concept:use-shadow-tree-styling','concept:standalone-svg-document','concept:use-inheritance','concept:animate-in-use-shadow-tree',
    'concept:animate-use-href','concept:animate-viewbox','concept:y-down-clockwise-angles','concept:use-shadow-event-retargeting','css:target');
}
