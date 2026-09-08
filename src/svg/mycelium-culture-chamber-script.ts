// mycelium-culture-chamber — shared constants + the source of the in-SVG `<script>` that grows the hyphae.
//
// The generator lives in a real `<script type="application/ecmascript">` element appended to #stage (`el:script`):
// Chromium runs SVG script elements when they are inserted through the DOM, so the 12k+ path segments really are
// created by the document's own script (`api:Document.createElementNS`). The code is wrapped in the classic
// `/*<![CDATA[*/ … /*]]>*/` guard (`concept:script-cdata`): serialised as a standalone XML SVG the `<` and `&&`
// inside `for (var i = 0; i < points && …; i++)` would otherwise abort the XML parser — the record card shows
// that failure state live via DOMParser. The companion file public/mycelium-culture-chamber/culture-pair.svg
// carries the same idiom as a genuine CDATA section.

/** Master noise (`#master-noise`) start value and the per-repeat `by` increment (accumulate="sum" staircase). */
export const MASTER_BASE = { x: 0.012, y: 0.018 };
export const MASTER_BY = { x: 0.004, y: 0.006 };
export const MASTER_DUR = 5;
export const MASTER_REPEATS = 5;
/** Fixed multipliers of the three consumers of the master noise (§4 of the plan). */
export const WARP_RATIO = 1.0;
export const BLEED_RATIO = 2.2;
export const GRAIN_RATIO = 64;
export const LIQUID_RATIO = 1.6;
/** Export still: timeline second at which the SMIL clock is frozen (2nd repeat, 56 % in → x ≈ 0.01824). */
export const EXPORT_TIME = 7.8;

/** Staircase value of the master baseFrequency at timeline second `t` — mirrors `by` + `accumulate="sum"` exactly. */
export function staircase(t: number): { x: number; y: number } {
  const done = Math.min(MASTER_REPEATS, Math.floor(Math.max(0, t) / MASTER_DUR));
  const frac = done >= MASTER_REPEATS ? 0 : (t - done * MASTER_DUR) / MASTER_DUR;
  const k = done + frac;
  return { x: MASTER_BASE.x + MASTER_BY.x * k, y: MASTER_BASE.y + MASTER_BY.y * k };
}

/**
 * ECMAScript source of the hyphae grower. It scans `#stage [data-lsystem]` hosts and fills each with `<path>`s.
 * Host attributes: data-cx/cy (inoculation centre), data-seed, data-gens (7), data-step (12), data-points (4),
 * data-spread (18, inoculation radius), data-paths (24, path count), data-width-scale, data-path-filter (C dish:
 * the bleed filter written on every path instead of the group). It writes back data-segments / data-path-count.
 *
 * L-system: axiom F, rule F → F[+F][−F]F. Every generation each apex draws F, may sprout [+F] and [−F] with
 * probability p(gen) = 0.72 − 0.06·gen, then draws the trailing F and stays alive; step = 12·0.86^gen, turn
 * ±(18° + rng·14°). Each F is drawn as two "M x y L x y" sub-segments with a mid kink so hyphae undulate.
 */
export const GROWER_SCRIPT = String.raw`/*<![CDATA[*/
(function () {
  'use strict';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var stage = document.getElementById('stage');
  if (!stage) return;
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var WIDTHS = [1.5, 1.3, 1.1, 0.9, 0.7, 0.5, 0.35];
  var C0 = [0xf2, 0xf7, 0xef], C1 = [0xb9, 0xd4, 0xbb];
  function genColor(g, gens) {
    var t = gens > 1 ? g / (gens - 1) : 0, c = [];
    for (var i = 0; i < 3; i++) c.push(Math.round(C0[i] + (C1[i] - C0[i]) * t));
    return 'rgb(' + c.join(',') + ')';
  }
  function num(node, name, dflt) { var v = node.getAttribute('data-' + name); return v === null ? dflt : parseFloat(v); }
  function grow(host) {
    var cx = num(host, 'cx', 0), cy = num(host, 'cy', 0), seed = num(host, 'seed', 7), gens = num(host, 'gens', 7);
    var step = num(host, 'step', 12), points = num(host, 'points', 4), spread = num(host, 'spread', 18);
    var pathCount = num(host, 'paths', 24), widthScale = num(host, 'width-scale', 1);
    var pathFilter = host.getAttribute('data-path-filter');
    var rng = mulberry32(seed);
    var buckets = [], g, i;
    for (g = 0; g < gens; g++) buckets.push([]);
    // Inoculation: up to `points` apices inside r <= spread, headings fanned around the circle.
    var tips = [];
    for (i = 0; i < points && tips.length < 64; i++) {
      var a = (i / points) * Math.PI * 2 + (rng() - 0.5) * 0.8, r = rng() * spread;
      tips.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, ang: a });
    }
    // One F: two drawn sub-segments with a perpendicular mid kink; the apex moves to the far end.
    function F(tip, len, gen) {
      var mx = tip.x + Math.cos(tip.ang) * len * 0.5, my = tip.y + Math.sin(tip.ang) * len * 0.5;
      var k = (rng() - 0.5) * len * 0.35;
      mx += -Math.sin(tip.ang) * k; my += Math.cos(tip.ang) * k;
      var ex = tip.x + Math.cos(tip.ang) * len, ey = tip.y + Math.sin(tip.ang) * len;
      buckets[gen].push(tip.x, tip.y, mx, my, mx, my, ex, ey);
      tip.x = ex; tip.y = ey;
    }
    for (g = 0; g < gens; g++) {
      var p = 0.72 - 0.06 * g, len = step * Math.pow(0.86, g), next = [];
      for (var t = 0; t < tips.length; t++) {
        var tip = tips[t];
        F(tip, len, g);                                  // F
        for (var b = 0; b < 2; b++) if (rng() < p) {     // [+F] and [-F], each with probability p(gen)
          var turn = (b === 0 ? 1 : -1) * (18 + rng() * 14) * Math.PI / 180;
          var branch = { x: tip.x, y: tip.y, ang: tip.ang + turn };
          F(branch, len, g);
          next.push(branch);
        }
        tip.ang += (rng() - 0.5) * 0.45;                 // trailing F continues with a little meander
        F(tip, len, g);
        next.push(tip);
      }
      tips = next;
    }
    // Distribute `pathCount` paths over the generations proportionally (>= 1 per non-empty generation).
    var counts = buckets.map(function (bk) { return bk.length / 4; });
    var total = counts.reduce(function (s, n) { return s + n; }, 0);
    var alloc = counts.map(function (n) { return n ? Math.max(1, Math.round(pathCount * n / total)) : 0; });
    var used = alloc.reduce(function (s, n) { return s + n; }, 0);
    while (used !== pathCount) {
      var best = -1;
      for (i = 0; i < gens; i++) {
        if (!counts[i]) continue;
        if (used > pathCount && alloc[i] < 2) continue;
        if (best < 0 || counts[i] / alloc[i] > counts[best] / alloc[best]) best = i;
      }
      if (best < 0) break;
      alloc[best] += used < pathCount ? 1 : -1;
      used += used < pathCount ? 1 : -1;
    }
    var segments = 0, paths = 0;
    for (g = 0; g < gens; g++) {
      var seg = buckets[g], n = counts[g];
      if (!n) continue;
      var per = Math.ceil(n / alloc[g]);
      for (var s = 0; s < n; s += per) {
        var end = Math.min(n, s + per), d = [];
        for (var q = s; q < end; q++) {
          var o = q * 4;
          d.push('M' + seg[o].toFixed(1) + ' ' + seg[o + 1].toFixed(1) + 'L' + seg[o + 2].toFixed(1) + ' ' + seg[o + 3].toFixed(1));
        }
        var path = document.createElementNS(SVG_NS, 'path');   // SVG namespace → renders (see #ns-control for the counter-example)
        path.setAttribute('d', d.join(''));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', genColor(g, gens));
        path.setAttribute('stroke-width', (WIDTHS[Math.min(g, WIDTHS.length - 1)] * widthScale).toFixed(2));
        path.setAttribute('stroke-opacity', '0.62');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('data-gen', String(g));
        if (pathFilter) path.setAttribute('filter', pathFilter);
        host.appendChild(path);
        segments += end - s; paths++;
      }
    }
    host.setAttribute('data-segments', String(segments));
    host.setAttribute('data-path-count', String(paths));
    return segments;
  }
  var hosts = stage.querySelectorAll('[data-lsystem]'), sum = 0;
  for (var h = 0; h < hosts.length; h++) sum += grow(hosts[h]);
  stage.setAttribute('data-hyphae', String(sum));
})();
/*]]>*/`;
