import { el, fragment, freezeAt, isExport, mark, mulberry32, fontFaceCss } from './lib';
import { makeLayers, corePhotoDataUri, texture, label, yOf, CYAN, ACCENT, MUTED, type Ctx } from './core-sample-stratigraphy-data';
import { buildClipCard, buildMaskStrip } from './core-sample-stratigraphy-cards';
import { buildSection, buildRack, sampleHitMaps, buildPickBar } from './core-sample-stratigraphy-bench';

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('role', 'img');
  stage.setAttribute('aria-labelledby', 'core-title core-desc');
  stage.append(el('title', { id: 'core-title' }, '岩芯地层揭示台'), el('desc', { id: 'core-desc' }, '同一段岩芯经过裁切、亮度遮罩与处理顺序的对照。右侧剖面逐层揭开，下方网格实测裁切和遮罩的命中差别。'));
  stage.dataset.expectedBrokenReferences = 'missing-core nope';
  const defs = el('defs');
  stage.append(defs, el('style', {}, fontFaceCss() + '.blk-fw{clip-path:url(#blk-fw)} .pe-chip:hover{fill:#f2b84b} .fade{mask:url(#m-fade)}'));
  defs.append(fragment(`<filter id="f-sil" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/><feFlood flood-color="#06121f" flood-opacity=".55"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="f-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="f-blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="f-l2a"><feColorMatrix type="luminanceToAlpha"/></filter>
    <filter id="f-l2a-srgb" color-interpolation-filters="sRGB"><feColorMatrix type="luminanceToAlpha"/></filter>
    <filter id="f-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`));
  const layers = makeLayers(), photo = corePhotoDataUri(layers);
  const c: Ctx = { stage, defs, rand: mulberry32(0x5ea1), photo, staticMode: matchMedia('(prefers-reduced-motion: reduce)').matches,
    probes: [], after: [], refs: {}, anim(target, attr, from, to, begin, dur, fill) {
      target.append(el('animate', { attributeName: attr, from, to, begin, dur, fill }));
    } };
  defs.append(texture(c.rand, 'limestone', 0, 0, 78, 46, 3, { id: 'core-seg' }));
  defs.append(el('image', { id: 'core-photo', href: photo, x: 60, y: 130, width: 112, height: 496, preserveAspectRatio: 'none' }));
  stage.append(label(60, 60, '岩芯地层揭示台', { size: 30, fill: ACCENT, weight: 700 }), label(60, 88, 'CORE 42 / 0–120 m · 几何裁切与连续遮罩', { size: 14, fill: MUTED }));
  const readout = label(720, 64, '移动指针：裁切之外不命中，遮罩不可见仍命中', { size: 13, fill: CYAN, id: 'core-readout' });
  stage.append(readout, label(720, 86, '左：岩性记录　中：取样窗与遮罩　右：解释剖面', { fill: MUTED }));
  const barrelClip = el('clipPath', { id: 'clip-barrel' },
    el('rect', { x: 60, y: 150, width: 112, height: 446, fill: 'red', 'stroke-width': 20 }),
    el('ellipse', { cx: 116, cy: 150, rx: 56, ry: 14 }), el('path', { d: 'M60 594L88 610L113 600L140 620L172 594Z' }),
    el('rect', { x: 40, y: 130, width: 152, height: 500, display: 'none' }), el('g', {}, el('rect', { width: 1400, height: 900 })));
  defs.append(barrelClip);
  stage.append(label(60, 130, 'P1 岩芯桶', { fill: CYAN }), el('g', { filter: 'url(#f-sil)' }, el('use', { href: '#core-photo', 'clip-path': 'url(#clip-barrel)' })));
  for (const layer of layers) {
    const y = yOf(layer.top);
    stage.append(el('line', { x1: 60, x2: 172, y1: y, y2: y, stroke: CYAN, 'stroke-width': .9 }));
    const handle = el('line', { x1: 60, x2: 172, y1: y, y2: y, stroke: 'transparent', 'stroke-width': 22, 'pointer-events': 'stroke' });
    handle.addEventListener('pointermove', () => { readout.textContent = `层界深度 ${layer.top.toFixed(1)} m · 22 px 透明描边命中`; });
    stage.append(handle);
  }
  defs.append(fragment(`<clipPath id="log-extent"><rect x="186" y="142" width="222" height="468"/></clipPath>
    <clipPath id="blk-hw" clip-path="url(#log-extent)"><polygon points="186,142 380,142 248,610 186,610"/></clipPath>
    <clipPath id="blk-fw"><polygon points="380,142 408,142 408,610 248,610"/></clipPath>
    <clipPath id="clip-void"/>
    <clipPath id="taper-1"><path d="M186 300H408L186 320Z"/></clipPath>
    <clipPath id="taper-2"><path d="M186 330H408L186 350Z"/></clipPath>
    <clipPath id="taper-3"><path d="M186 360H408L186 380Z"/></clipPath>
    <clipPath id="pinch"><rect x="186" y="380" width="222" height="230"/><rect x="186" y="300" width="222" height="20" clip-path="url(#taper-1)"/><rect x="186" y="330" width="222" height="20" clip-path="url(#taper-2)"/><rect x="186" y="360" width="222" height="20" clip-path="url(#taper-3)"/></clipPath>`));
  stage.append(label(186, 130, 'P2 展开柱 · 断层与尖灭', { fill: CYAN }));
  const log = el('g', { id: 'log-layers' });
  for (const layer of layers) log.append(texture(c.rand, layer.litho, 186, yOf(layer.top), 222, yOf(layer.bottom)-yOf(layer.top), layer.grain));
  defs.append(log);
  const whole = el('g', { 'clip-path': 'url(#log-extent)' }, el('use', { href: '#log-layers', 'clip-path': 'url(#blk-hw)' }),
    el('use', { href: '#log-layers', transform: 'translate(0 24)', class: 'blk-fw' }));
  // Empty recovery interval is genuinely transparent, including the faulted layers underneath it.
  defs.append(el('clipPath', { id: 'recovery' }, el('rect', { x: 186, y: 142, width: 222, height: yOf(88)-142 }), el('rect', { x: 186, y: yOf(92), width: 222, height: 610-yOf(92) })));
  whole.setAttribute('clip-path', 'url(#recovery)');
  stage.append(whole, el('g', { 'clip-path': 'url(#recovery)' }, el('use', { href: '#log-layers', 'clip-path': 'url(#pinch)', opacity: .35 })),
    el('rect', { x: 186, y: yOf(88), width: 222, height: yOf(92)-yOf(88), fill: ACCENT, 'clip-path': 'url(#clip-void)' }),
    el('rect', { x: 186, y: yOf(92), width: 222, height: yOf(96)-yOf(92), fill: ACCENT, 'clip-path': 'none' }),
    el('rect', { x: 186, y: yOf(96), width: 222, height: 12, fill: CYAN, 'clip-path': 'url(#missing-core)' }));
  stage.append(buildClipCard(c), buildMaskStrip(c), buildSection(c, layers));
  const rack = buildRack(c); stage.append(rack.g, buildPickBar());
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  if (isExport() || c.staticMode) freezeAt(stage, 3.2);
  c.after.forEach(fn => fn()); sampleHitMaps(stage, rack.cells);
  stage.addEventListener('pointermove', event => {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(stage.getScreenCTM()!.inverse());
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const probe = c.probes.find(p => p.el === target || (target && p.el.contains(target)));
    if (probe) readout.textContent = `${probe.id} · ${probe.kind === 'mask' ? '掩码不可见 · 仍命中' : '裁切之内 · 命中'}`;
    else if (point.x > 422 && point.x < 716) readout.textContent = '裁切之外 · 未命中';
    else readout.textContent = `${target?.id || target?.localName} · ${point.x.toFixed(1)}, ${point.y.toFixed(1)}`;
  });
  mark(stage, 'concept:animated-clippath-reveal', 'concept:clip-group-vs-children', 'concept:clip-path-on-clippath-children',
    'concept:clipped-hit-testing', 'concept:effect-order-filter-clip-mask-opacity', 'concept:gradient-feathered-mask',
    'concept:mask-on-group-vs-element', 'concept:mask-smil-animation', 'concept:masked-hit-testing', 'concept:nested-clippath',
    'concept:use-in-clippath', 'concept:hit-test-invisible-stroke', 'concept:hit-test-transparent-fill');
}
