// Coverage gate: every core feature key assigned to a native SVG demo must be observable in that demo's DOM.
// el:/at:/av:/pr:/pv: keys are derived from the live tree; api:/concept:/css: keys are declared by the demo via
// `mark(stage, key)` (→ #stage[data-features]) because they describe behaviour rather than markup.
export const checkCoverage = (keys) => {
  const stage = document.querySelector('#stage');
  const all = [stage, ...stage.querySelectorAll('*')];
  const marks = new Set((stage.dataset.features ?? '').split(/\s+/).filter(Boolean));
  const styleText = all.filter(node => node.localName === 'style').map(node => node.textContent).join('\n');
  const inlineStyles = all.map(node => node.getAttribute('style') ?? '').filter(Boolean).join(';\n');
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const valueMatches = (actual, expected) => {
    if (actual === null || actual === undefined) return false;
    const norm = actual.trim();
    if (norm.toLowerCase() === expected.toLowerCase()) return true;
    if (expected === 'rotate-cx-cy') return /rotate\(\s*[-+.\deE]+[\s,]+[-+.\deE]+[\s,]+[-+.\deE]+\s*\)/.test(norm);
    if (['matrix','rotate','scale','skewX','skewY','translate'].includes(expected)) return norm.includes(expected + '(');
    if (expected === 'angle') return /^[-+]?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?$/.test(norm);
    if (expected === 'two-values') return /^[-+.\deE]+[\s,]+[-+.\deE]+$/.test(norm);
    if (expected === '#element') return norm.startsWith('#') && Boolean(document.getElementById(norm.slice(1)));
    if (expected === 'event') return /(?:^|;)\s*[\w-]+\.(?:click|mouseover|focusin|pointerdown)/.test(norm);
    if (expected === 'syncbase') return /(?:^|;)\s*[\w-]+\.(?:begin|end)/.test(norm);
    if (norm.split(/[\s,]+/).includes(expected)) return true;
    if (norm.replace(/[\s,]+/g, '-') === expected) return true;
    if (expected.endsWith('()') && norm.includes(expected.slice(0, -1))) return true;
    return false;
  };
  const propertyPresent = (prop, expected) => {
    const propRe = new RegExp(`(^|[^-\\w])${escape(prop)}\\s*:\\s*([^;}]*)`, 'g');
    const scan = source => { for (const match of source.matchAll(propRe)) { if (expected === undefined || valueMatches(match[2], expected)) return true; } return false; };
    if (all.some(node => node.hasAttribute(prop) && (expected === undefined || valueMatches(node.getAttribute(prop), expected)))) return true;
    return scan(styleText) || scan(inlineStyles);
  };
  const missing = [];
  for (const key of keys) {
    const colon = key.indexOf(':');
    const kind = key.slice(0, colon), rest = key.slice(colon + 1);
    let ok = false;
    if (kind === 'el') ok = all.some(node => node.localName === rest);
    else if (kind === 'at') { const dot = rest.indexOf('.'); const tag = rest.slice(0, dot), attr = rest.slice(dot + 1); ok = all.some(node => node.localName === tag && (node.hasAttribute(attr) || (tag === 'switch' && attr === 'systemLanguage' && node.querySelector(':scope > [systemLanguage]')))); }
    else if (kind === 'av') {
      const dot = rest.indexOf('.'), eq = rest.indexOf('=');
      const tag = rest.slice(0, dot), attr = rest.slice(dot + 1, eq), expected = rest.slice(eq + 1);
      if (attr === 'd' || attr === 'points') ok = all.some(node => node.localName === tag && new RegExp(`(^|[^A-Za-z])${escape(expected)}([^A-Za-z]|$)`).test(node.getAttribute(attr) ?? ''));
      else ok = all.some(node => node.localName === tag && valueMatches(node.getAttribute(attr) ?? node.style?.getPropertyValue(attr), expected));
    }
    else if (kind === 'pr') ok = propertyPresent(rest);
    else if (kind === 'pv') { const eq = rest.indexOf('='); ok = propertyPresent(rest.slice(0, eq), rest.slice(eq + 1)); }
    else ok = marks.has(key);
    if (!ok) missing.push(key);
  }
  return { checked: keys.length, missing, declared: keys.filter(key => /^(api|concept|css):/.test(key) && marks.has(key)).length, marked: marks.size, elements: all.length };
};


/** Cross-file contract: no missing scene, orphan feature, duplicate key, or metadata drift. */
export function validatePlan(plan, catalog) {
  const fail = message => { throw new Error(`SVG plan: ${message}`); };
  const ids = plan.demos.map(d => d.id), keys = plan.features.map(f => f.key);
  if (ids.length !== 16 || new Set(ids).size !== 16) fail('expected 16 unique demos');
  if (new Set(keys).size !== keys.length) fail('duplicate feature key');
  const core = plan.features.filter(f => f.tier === 'core');
  if (core.length !== 519) fail('expected 519 core feature keys');
  for (const f of core) {
    if (!f.demos.length || f.demos.some(id => !ids.includes(id))) fail(`unassigned core feature ${f.key}`);
    if (new Set(f.demos).size !== f.demos.length) fail(`duplicate assignment ${f.key}`);
  }
  for (const d of plan.demos) {
    const entries = catalog.filter(c => c.id === d.id);
    if (entries.length !== 1) fail(`catalog must contain ${d.id} exactly once`);
    for (const field of ['use','family','question','complexity','tags']) {
      if (JSON.stringify(entries[0][field]) !== JSON.stringify(d[field])) fail(`${d.id}.${field} differs from catalog`);
    }
  }
  if (plan.uncovered.length) fail('uncovered features must be resolved or explicitly excluded');
  return { core:core.length, demos:ids.length, assignments:core.reduce((n,f) => n+f.demos.length,0) };
}

/** Deliberately break real SVG markup while retaining every declaration. The gate must notice. */
export async function verifyCoverageGate(browser) {
  const page = await browser.newPage();
  const keys = ['el:path', 'at:path.d', 'av:path.fill=red', 'pr:stroke', 'pv:stroke=blue'];
  try {
    await page.setContent(`<svg id="stage" xmlns="http://www.w3.org/2000/svg" data-features="${keys.join(' ')}"><style>path {stroke:blue}</style><path d="M0 0L10 10" fill="red"/></svg>`);
    if ((await page.evaluate(checkCoverage, keys)).missing.length) throw new Error('coverage positive control failed');
    await page.evaluate(() => document.querySelector('path').setAttribute('fill', 'green'));
    if (!(await page.evaluate(checkCoverage, keys)).missing.includes('av:path.fill=red')) throw new Error('coverage declaration hid a changed attribute value');
    await page.evaluate(() => document.querySelector('path').removeAttribute('d'));
    if (!(await page.evaluate(checkCoverage, keys)).missing.includes('at:path.d')) throw new Error('coverage declaration hid a removed attribute');
    await page.evaluate(() => document.querySelector('style').remove());
    const styles = (await page.evaluate(checkCoverage, keys)).missing;
    if (!styles.includes('pr:stroke') || !styles.includes('pv:stroke=blue')) throw new Error('coverage declaration hid removed styles');
    await page.evaluate(() => document.querySelector('path').remove());
    if (!(await page.evaluate(checkCoverage, keys)).missing.includes('el:path')) throw new Error('coverage declaration hid a removed element');
    return { positive:1, mutations:4, passed:true };
  } finally { await page.close(); }
}
