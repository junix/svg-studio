// ship-lofting-floor — the matrix table (930,660)-(1360,876): one station section projected by three
// matrix() transforms into an axonometric box (concept:isometric-projection-matrix), a starboard
// half-breadth group mirrored to port with matrix(-1 0 0 1 2290 0) (concept:negative-scale-mirroring), and a
// twin pair proving that a transform-function list equals one matrix() (pv:transform=matrix).
import { el, mark, FONT_MONO } from './lib';
import { C, panel, label, g } from './ship-lofting-floor-ui';

/** centreline of the mirror pair — matrix(-1 0 0 1 2·CLX 0) reflects about x = CLX */
export const CLX = 1145;

export function buildMatrixTable(stage: SVGSVGElement): void {
  const table = g({ id: 'matrix-table' }, panel(930, 660, 430, 216));
  table.append(label(942, 676, '矩阵台 · matrix() 轴测分段箱 / 镜像 / 等价', { fill: C.dim }));

  // ── twins (left): transform list vs the single matrix it multiplies out to.
  //    rotate(-18)·scale(1.2 .8)·translate(40 12) = matrix(a b c d e f), computed here at full precision.
  const twins = g({ id: 'iso-twins', transform: 'translate(950 738)' });
  const rad = -18 * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  const a = cos * 1.2, b = sin * 1.2, c = -sin * .8, d = cos * .8;
  const e = a * 40 + c * 12, f = b * 40 + d * 12;
  const mtx = `matrix(${[a, b, c, d, e, f].map(v => v.toFixed(8)).join(' ')})`;
  const glyph = 'M0 0 H40 V26 A14 10 0 0 1 26 36 H0 Z M8 8 H32'; // asymmetric so a wrong matrix would show
  twins.append(g({ id: 'iso-check-a', transform: 'rotate(-18) scale(1.2 .8) translate(40 12)' },
    el('path', { d: glyph, fill: C.yellow, 'fill-opacity': .25, stroke: C.yellow, 'stroke-width': 2.5, 'stroke-linejoin': 'round' })));
  twins.append(g({ id: 'iso-check-b', transform: mtx },
    el('path', { d: glyph, fill: 'none', stroke: C.cyan, 'stroke-width': 1, 'stroke-dasharray': '3 2' })));
  table.append(twins);
  table.append(label(942, 700, 'rotate(-18) scale(1.2 .8)', { mono: true, fill: C.yellow }));
  table.append(label(942, 712, '  translate(40 12)', { mono: true, fill: C.yellow }));
  table.append(label(942, 790, '= matrix(1.14127 -0.37082', { mono: true, fill: C.cyan }));
  table.append(label(942, 802, '  0.24721 0.76085 48.617 -5.703)', { mono: true, fill: C.cyan }));
  table.append(label(942, 822, '函数串 = 一次 matrix', { fill: C.dim }));
  table.append(label(942, 836, '逐像素重合 · CTM 相等', { fill: C.faint }));

  // ── mirror (centre): starboard half-breadth lines right of CL, the port side is a <use> through matrix(-1 …).
  const mirror = g({ id: 'mirror-bench' });
  mirror.append(el('line', { x1: CLX, y1: 690, x2: CLX, y2: 846, stroke: C.white, 'stroke-width': .75, 'stroke-dasharray': '6 3', opacity: .7 }));
  mirror.append(label(CLX, 858, 'CL  matrix(-1 0 0 1 2290 0)', { mono: true, fill: C.dim, anchor: 'middle' }));
  const starboard = g({ id: 'starboard', class: 'halfbreadth' });
  starboard.append(el('path', { d: `M${CLX} 696 C${CLX + 34} 696 ${CLX + 66} 712 ${CLX + 80} 742 S${CLX + 62} 802 ${CLX} 810`, fill: C.cyan, 'fill-opacity': .12, stroke: C.cyan, 'stroke-width': 1.5 }));
  starboard.append(el('path', { d: `M${CLX} 716 Q${CLX + 48} 718 ${CLX + 70} 744`, fill: 'none', stroke: C.green, 'stroke-width': 1 }));
  starboard.append(el('path', { d: `M${CLX} 736 Q${CLX + 40} 736 ${CLX + 60} 760`, fill: 'none', stroke: C.green, 'stroke-width': 1 }));
  starboard.append(el('path', { d: `M${CLX} 756 Q${CLX + 30} 758 ${CLX + 44} 776`, fill: 'none', stroke: C.green, 'stroke-width': 1 }));
  // the label is written mirror-inverted with scale(-1 1): readable only in the port-side reflection
  starboard.append(el('text', { transform: `translate(${CLX + 78} 828) scale(-1 1)`, 'font-family': FONT_MONO, 'font-size': 12, fill: C.yellow, 'letter-spacing': 1 }, 'STARBOARD'));
  // draught mark flipped vertically with scale(1 -1) — as real hull draught numerals are painted
  starboard.append(el('text', { transform: `translate(${CLX + 8} 772) scale(1 -1)`, 'font-family': FONT_MONO, 'font-size': 11, fill: C.orange }, '▲3.2m'));
  mirror.append(starboard);
  mirror.append(el('use', { id: 'port', href: '#starboard', transform: `matrix(-1 0 0 1 ${2 * CLX} 0)`, opacity: .85 }));
  mirror.append(label(CLX - 78, 846, 'port ← 镜', { fill: C.faint }));
  mirror.append(label(CLX + 78, 846, '镜 → stbd', { fill: C.faint, anchor: 'end' }));
  table.append(mirror);

  // ── axonometric box (right): the same 64×64 section on three faces.
  //    top   matrix(0.866 0.5 -0.866 0.5 OX OY)          — x axis → (.866,.5), y axis → (-.866,.5)
  //    right matrix(0.866 -0.5 0 1 OX OY+64)             — x axis → (.866,-.5), y axis → down
  //    left  matrix(0.866 0.5 0 1 OX-55.4 OY+32)         — x axis → (.866,.5),  y axis → down
  const OX = 1292, OY = 688, S = 64, K = 0.866;
  const box = g({ id: 'iso-box' });
  const section = 'M0 0 H64 V40 A24 18 0 0 1 40 64 H0 Z';
  const faces: [string, string, string, number][] = [
    ['iso-left', `matrix(${K} 0.5 0 1 ${(OX - K * S).toFixed(3)} ${OY + S / 2})`, C.edge, .55],
    ['iso-right', `matrix(${K} -0.5 0 1 ${OX} ${OY + S})`, C.cyan, .35],
    ['iso-top', `matrix(${K} 0.5 -${K} 0.5 ${OX} ${OY})`, C.cyan, .7],
  ];
  faces.forEach(([id, transform, fill, opacity]) => {
    const face = g({ id, transform });
    face.append(el('path', { d: section, fill, 'fill-opacity': opacity, stroke: C.white, 'stroke-width': 1, 'stroke-linejoin': 'round' }));
    face.append(el('path', { d: 'M16 0 V60 M32 0 V64 M48 0 V56 M0 20 H64 M0 40 H64', fill: 'none', stroke: C.white, 'stroke-width': .5, opacity: .5 }));
    box.append(face);
  });
  box.append(label(OX, 834, '顶 / 右 / 左 = 三个 matrix()', { fill: C.dim, anchor: 'middle' }));
  box.append(label(OX, 848, '共边严丝合缝的分段箱', { fill: C.faint, anchor: 'middle' }));
  table.append(box);

  stage.append(table);
  mark(stage, 'concept:isometric-projection-matrix', 'concept:negative-scale-mirroring', 'pv:transform=matrix');
}
