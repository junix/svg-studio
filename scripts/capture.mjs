import { checkCoverage, validatePlan, verifyCoverageGate } from './coverage.mjs';
import { checkAcceptance } from './acceptance.mjs';
import { checkPixels } from './pixels.mjs';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
if (!Array.isArray(catalog) || catalog.length < 15) throw new Error('reference library requires at least 15 cataloged scenes');
const arrowLibrary = JSON.parse(await readFile(new URL('../arrow-library.json', import.meta.url), 'utf8'));
if (!Array.isArray(arrowLibrary.templates) || arrowLibrary.templates.length !== 18) throw new Error('arrow library requires exactly 18 indexed templates');
const indexedArrowIds = arrowLibrary.templates.map(item => item.id);
if (new Set(indexedArrowIds).size !== indexedArrowIds.length) throw new Error('arrow library template ids must be unique');
const iconLibrary = JSON.parse(await readFile(new URL('../icon-library.json', import.meta.url), 'utf8'));
if (!Array.isArray(iconLibrary.templates) || iconLibrary.templates.length !== 24) throw new Error('icon library requires exactly 24 indexed templates');
const indexedIconIds = iconLibrary.templates.map(item => item.id);
if (new Set(indexedIconIds).size !== indexedIconIds.length) throw new Error('icon library template ids must be unique');
const arrowComponents = JSON.parse(await readFile(new URL('../arrow-components.json', import.meta.url), 'utf8'));
if (!Array.isArray(arrowComponents.templates) || arrowComponents.templates.length !== 16) throw new Error('arrow component library requires exactly 16 indexed templates');
const indexedComponentIds = arrowComponents.templates.map(item => item.id);
if (new Set(indexedComponentIds).size !== indexedComponentIds.length) throw new Error('arrow component template ids must be unique');
const componentSystemCounts = Object.groupBy(arrowComponents.templates, item => item.system);
if (componentSystemCounts.stroke?.length !== 8 || componentSystemCounts.segment?.length !== 8) throw new Error('arrow component index requires eight stroke and eight segment templates');
const plan = JSON.parse(await readFile(new URL('../docs/svg-feature-demos.json', import.meta.url), 'utf8'));
validatePlan(plan, catalog);
const svgDemoIds = plan.demos.map(item => item.id);
const coreFeaturesByDemo = Object.fromEntries(svgDemoIds.map(id => [id, plan.features.filter(feature => feature.tier === 'core' && feature.demos.includes(id)).map(feature => feature.key)]));
const selection = process.env.SCENES;
const scenes = selection ? (selection.trim().startsWith('[') ? JSON.parse(selection) : selection.split(',').map(id => id.trim()).filter(Boolean)) : catalog.map(item => item.id);
if (!Array.isArray(scenes) || !scenes.length || new Set(scenes).size !== scenes.length) throw new Error('SCENES must be a nonempty list of unique scene IDs');
const results = [];
const failures = [];
for (const scene of scenes) if (!catalog.some(item => item.id === scene) && !svgDemoIds.includes(scene)) throw new Error(`unknown scene ${scene}`);


const findAvailablePort = () => new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    if (!address || typeof address === 'string') return reject(new Error('could not allocate a local test port'));
    probe.close(error => error ? reject(error) : resolve(address.port));
  });
});
const port = process.env.PORT ? Number(process.env.PORT) : await findAvailablePort();
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort'], {stdio:'pipe'});
const stop = () => server.kill('SIGTERM');
process.on('exit', stop);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Vite startup timeout')), 60000);
  server.stdout.on('data', chunk => { if (chunk.toString().includes(`http://127.0.0.1:${port}`)) { clearTimeout(timer); resolve(); } });
  server.on('exit', code => reject(new Error(`Vite exited ${code}`)));
});

await mkdir('out', {recursive:true});
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.CHROME_PATH ?? (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined); // undefined → Playwright's bundled Chromium
// These scenes use Canvas 2D and SVG. Forcing SwiftShader makes nested SVG filters
// take tens of seconds on macOS; let Chrome select its supported raster backend.
const browser = await chromium.launch({headless:true, executablePath, args:['--force-color-profile=srgb']});
const browserVersion = browser.version();
let coverageGate;
try {
  coverageGate = await verifyCoverageGate(browser);
  for (const scene of scenes) {
    const page = await browser.newPage({viewport:{width:1400,height:900}, deviceScaleFactor:1});
    try {
    const errors = [];
    let coverage;
    let acceptance;
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['127.0.0.1','localhost'].includes(url.hostname) || url.protocol === 'data:' ? route.continue() : route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}/?scene=${scene}&export=1`, {waitUntil:'networkidle'});
    await page.waitForFunction(() => window.__VIS_READY__ === true, null, {timeout:45000});
    const stage = page.locator('#stage');
    if (scene === 'arrow-library') {
      const structure = await page.evaluate(() => {
        const stage = document.querySelector('#stage');
        const specimens = [...document.querySelectorAll('.specimen')];
        return {
          nativeSvg: stage instanceof SVGSVGElement,
          ids: specimens.map(item => item.getAttribute('data-id')),
          labelModes: new Set(specimens.map(item => item.getAttribute('data-label-mode'))).size,
          textPaths: document.querySelectorAll('textPath').length,
          markers: document.querySelectorAll('marker').length,
          markerReferences: document.querySelectorAll('[marker-start], [marker-end]').length,
          brokenReferences: [...document.querySelectorAll('[marker-start], [marker-end], textPath')].flatMap(item => {
            const values = [item.getAttribute('marker-start'), item.getAttribute('marker-end'), item.getAttribute('href')].filter(Boolean);
            return values.filter(value => {
              const id = value.startsWith('url(#') && value.endsWith(')') ? value.slice(5, -1) : value.startsWith('#') ? value.slice(1) : null;
              return id && !document.getElementById(id);
            });
          }),
          titledSpecimens: specimens.filter(item => item.querySelector(':scope > title') && item.querySelector(':scope > desc')).length,
          apiIds: window.__ARROW_LIBRARY__?.ids ?? [],
          selected: window.__ARROW_LIBRARY__?.selected,
          templateAvailable: Boolean(window.__ARROW_LIBRARY__?.getTemplate('B02')),
        };
      });
      const expectedIds = JSON.stringify(indexedArrowIds);
      if (!structure.nativeSvg || JSON.stringify(structure.ids) !== expectedIds || JSON.stringify(structure.apiIds) !== expectedIds) throw new Error(`arrow-library: SVG/JSON id mismatch ${JSON.stringify(structure)}`);
      if (structure.labelModes < 8 || structure.textPaths < 5 || structure.markers < 10 || structure.markerReferences < 18 || structure.brokenReferences.length || structure.titledSpecimens !== 18 || structure.selected !== 'A01' || !structure.templateAvailable) throw new Error(`arrow-library: incomplete native SVG structure ${JSON.stringify(structure)}`);
      console.log(`arrow-library: specimens=${structure.ids.length}, labelModes=${structure.labelModes}, textPaths=${structure.textPaths}, markers=${structure.markers}`);
    }
    if (scene === 'icon-library') {
      const structure = await page.evaluate(() => {
        const stage = document.querySelector('#stage');
        const specimens = [...document.querySelectorAll('.icon-specimen')];
        const localReferences = [...document.querySelectorAll('[fill^="url(#"], [stroke^="url(#"], [filter^="url(#"], [mask^="url(#"], [clip-path^="url(#"], use')];
        return {
          nativeSvg: stage instanceof SVGSVGElement,
          ids: specimens.map(item => item.getAttribute('data-id')),
          styles: new Set(specimens.map(item => item.getAttribute('data-style'))).size,
          gradients: document.querySelectorAll('linearGradient, radialGradient').length,
          masks: document.querySelectorAll('mask').length,
          clipPaths: document.querySelectorAll('clipPath').length,
          symbols: document.querySelectorAll('symbol').length,
          uses: document.querySelectorAll('use').length,
          primitiveKinds: ['path','rect','circle','ellipse','line'].filter(tag => document.querySelector(tag)).length,
          brokenReferences: localReferences.flatMap(item => {
            const values = ['fill','stroke','filter','mask','clip-path','href'].map(name => item.getAttribute(name)).filter(Boolean);
            return values.filter(value => {
              const id = value.startsWith('url(#') && value.endsWith(')') ? value.slice(5, -1) : value === item.getAttribute('href') && value.startsWith('#') ? value.slice(1) : null;
              return id && !document.getElementById(id);
            });
          }),
          titledSpecimens: specimens.filter(item => item.querySelector(':scope > title') && item.querySelector(':scope > desc')).length,
          apiIds: window.__ICON_LIBRARY__?.ids ?? [],
          selected: window.__ICON_LIBRARY__?.selected,
          templateAvailable: Boolean(window.__ICON_LIBRARY__?.getTemplate('E04')),
        };
      });
      const expectedIds = JSON.stringify(indexedIconIds);
      if (!structure.nativeSvg || JSON.stringify(structure.ids) !== expectedIds || JSON.stringify(structure.apiIds) !== expectedIds) throw new Error(`icon-library: SVG/JSON id mismatch ${JSON.stringify(structure)}`);
      if (structure.styles < 8 || structure.gradients < 6 || structure.masks < 1 || structure.clipPaths < 1 || structure.symbols < 1 || structure.uses < 4 || structure.primitiveKinds < 5 || structure.brokenReferences.length || structure.titledSpecimens !== 24 || structure.selected !== 'O01' || !structure.templateAvailable) throw new Error(`icon-library: incomplete native SVG structure ${JSON.stringify(structure)}`);
      console.log(`icon-library: specimens=${structure.ids.length}, styles=${structure.styles}, gradients=${structure.gradients}, uses=${structure.uses}`);
    }
    if (scene === 'arrow-components') {
      const structure = await page.evaluate(() => {
        const stage = document.querySelector('#stage');
        const specimens = [...document.querySelectorAll('.arrow-component')];
        const localReferences = [...document.querySelectorAll('[marker-start], [marker-end], textPath, [fill^="url(#"], [clip-path^="url(#"]')];
        return {
          nativeSvg: stage instanceof SVGSVGElement,
          ids: specimens.map(item => item.getAttribute('data-id')),
          systems: new Set(specimens.map(item => item.getAttribute('data-system'))).size,
          systemCounts: Object.groupBy(specimens, item => item.getAttribute('data-system')),
          primitiveContracts: new Set(specimens.map(item => item.getAttribute('data-primitive'))).size,
          primitiveKinds: ['line','polyline','path','rect','polygon'].filter(tag => stage?.querySelector(tag)).length,
          markers: stage?.querySelectorAll('marker').length ?? 0,
          markerReferences: stage?.querySelectorAll('[marker-start], [marker-end]').length ?? 0,
          textPaths: stage?.querySelectorAll('textPath').length ?? 0,
          gradients: stage?.querySelectorAll('linearGradient').length ?? 0,
          clipPaths: stage?.querySelectorAll('clipPath').length ?? 0,
          loopArcSegments: (stage?.querySelector('#component-S06 path.arrow')?.getAttribute('d')?.split('A').length ?? 1) - 1,
          roundedRouteCommands: (stage?.querySelector('#component-S02 path.arrow')?.getAttribute('d')?.split('Q').length ?? 1) - 1,
          curvedConnectorCommands: (stage?.querySelector('#component-P05 path')?.getAttribute('d')?.split('C').length ?? 1) - 1,
          chevronBand: (() => {
            const specimen = stage?.querySelector('#component-P03');
            const connector = specimen?.querySelector('path');
            const segmentFills = [...(specimen?.querySelectorAll('rect:not(.card)') ?? [])].map(item => item.getAttribute('fill'));
            const connectorFill = connector?.getAttribute('fill');
            return {
              closed: connector?.getAttribute('d')?.endsWith('Z') ?? false,
              distinct: Boolean(connectorFill && !segmentFills.includes(connectorFill)),
              hasInnerAndOuterTips: (connector?.getAttribute('d')?.match(/L/g) ?? []).length >= 4,
            };
          })(),
          clippedSegmentStrips: specimens.filter(item => item.getAttribute('data-system') === 'segment' && item.querySelector('[clip-path]')).length,
          brokenReferences: localReferences.flatMap(item => {
            const values = ['marker-start','marker-end','href','fill','clip-path'].map(name => item.getAttribute(name)).filter(Boolean);
            return values.filter(value => {
              const id = value.startsWith('url(#') && value.endsWith(')') ? value.slice(5, -1) : value.startsWith('#') ? value.slice(1) : null;
              return id && !document.getElementById(id);
            });
          }),
          titledSpecimens: specimens.filter(item => item.querySelector(':scope > title') && item.querySelector(':scope > desc')).length,
          strokeWithMarker: specimens.filter(item => item.getAttribute('data-system') === 'stroke' && item.querySelector('[marker-end]')).length,
          segmentWithSolidGeometry: specimens.filter(item => item.getAttribute('data-system') === 'segment' && item.querySelector('rect:not(.card), path, polygon')).length,
          apiIds: window.__ARROW_COMPONENTS__?.ids ?? [],
          selected: window.__ARROW_COMPONENTS__?.selected,
          templateAvailable: Boolean(window.__ARROW_COMPONENTS__?.getTemplate('S06')),
        };
      });
      const expectedIds = JSON.stringify(indexedComponentIds);
      if (!structure.nativeSvg || JSON.stringify(structure.ids) !== expectedIds || JSON.stringify(structure.apiIds) !== expectedIds) throw new Error(`arrow-components: SVG/JSON id mismatch ${JSON.stringify(structure)}`);
      if (structure.systems !== 2 || structure.systemCounts.stroke?.length !== 8 || structure.systemCounts.segment?.length !== 8 || structure.primitiveContracts !== 16 || structure.primitiveKinds < 5 || structure.markers < 4 || structure.markerReferences < 9 || structure.textPaths < 1 || structure.gradients < 1 || structure.clipPaths < 1 || structure.loopArcSegments < 2 || structure.roundedRouteCommands < 2 || structure.curvedConnectorCommands < 1 || !structure.chevronBand.closed || !structure.chevronBand.distinct || !structure.chevronBand.hasInnerAndOuterTips || structure.clippedSegmentStrips < 6 || structure.brokenReferences.length || structure.titledSpecimens !== 16 || structure.strokeWithMarker !== 8 || structure.segmentWithSolidGeometry !== 8 || structure.selected !== 'S01' || !structure.templateAvailable) throw new Error(`arrow-components: incomplete native SVG structure ${JSON.stringify(structure)}`);
      console.log(`arrow-components: specimens=${structure.ids.length}, systems=${structure.systems}, markers=${structure.markers}, primitives=${structure.primitiveKinds}, clippedStrips=${structure.clippedSegmentStrips}`);
    }
    if (svgDemoIds.includes(scene)) {
      const structure = await page.evaluate(() => {
        const stage = document.querySelector('#stage');
        const all = [...stage.querySelectorAll('*')];
        const hrefIds = all.filter(node => !['a', 'image'].includes(node.localName)).flatMap(node => ['href', 'xlink:href'].map(name => node.getAttribute(name)).filter(Boolean)).map(value => value.startsWith('#') ? value.slice(1) : null);
        const paintIds = all.flatMap(node => ['fill', 'stroke', 'filter', 'mask', 'clip-path', 'marker-start', 'marker-mid', 'marker-end'].map(name => node.getAttribute(name)).filter(Boolean)).map(value => value.startsWith('url(#') ? value.slice(5, value.indexOf(')')) : null);
        const broken = [...hrefIds, ...paintIds].filter(id => id && !/^svgView\(|^xpointer\(/.test(id) && !document.getElementById(id) && !stage.querySelector(`[id="${id}"]`));
        return { nativeSvg: stage instanceof SVGSVGElement, elements: all.length, titled: Boolean(stage.querySelector(':scope > title')), broken: [...new Set(broken)] };
      });
      if (!structure.nativeSvg || structure.elements < 40 || !structure.titled) throw new Error(`${scene}: native SVG demo lacks structure ${JSON.stringify(structure)}`);
      const expectedBroken = scene === 'core-sample-stratigraphy' ? ['missing-core', 'nope'] : [];
      if (structure.broken.some(id => !expectedBroken.includes(id))) throw new Error(`${scene}: broken local references ${structure.broken.join(', ')}`);
      coverage = await page.evaluate(checkCoverage, coreFeaturesByDemo[scene]);
      if (coverage.missing.length) {
        const report = `${scene}: ${coverage.missing.length}/${coverage.checked} core features not observable in DOM:\n  ${coverage.missing.join('\n  ')}`;
        if (process.env.COVERAGE === 'warn') console.warn(report); else throw new Error(report); // COVERAGE=warn keeps iterating on a partial demo
      }
      console.log(`${scene}: elements=${structure.elements}, core features observable=${coverage.checked - coverage.missing.length}/${coverage.checked} (declared marks=${coverage.marked})`);
    }
    const captureBox = await stage.boundingBox();
    if (!captureBox || captureBox.width !== 1400 || captureBox.height !== 900) throw new Error(`${scene}: invalid stage dimensions`);
    // The stage owns a fixed viewport. Capture its exact box without locator auto-scroll, which can
    // wait indefinitely on SVG subdocuments even after their SMIL clocks and geometry have settled.
    const captureStarted = performance.now();
    await page.screenshot({path:`out/${scene}-transparent.png`, clip:captureBox, omitBackground:true, timeout:60000});
    const captureMs = Math.round(performance.now() - captureStarted);
    const before = await page.evaluate(() => window.__INTERACTION_COUNT__ ?? 0);
    const box = await stage.boundingBox();
    if (!box) throw new Error(`${scene}: stage has no layout box`);
    await page.mouse.move(box.x + box.width * .48, box.y + box.height * .52);
    await page.mouse.move(box.x + box.width * .54, box.y + box.height * .46);
    if (scene === 'arrow-library') {
      await page.locator('#spec-C06').click();
      const clicked = await page.evaluate(() => window.__ARROW_LIBRARY__?.selected);
      await page.locator('#spec-B02').focus();
      await page.keyboard.press('Enter');
      const keyed = await page.evaluate(() => window.__ARROW_LIBRARY__?.selected);
      if (clicked !== 'C06' || keyed !== 'B02') throw new Error(`arrow-library: selection contract failed (click=${clicked}, keyboard=${keyed})`);
    }
    if (scene === 'icon-library') {
      await page.locator('#icon-E06').click();
      const clicked = await page.evaluate(() => window.__ICON_LIBRARY__?.selected);
      await page.locator('#icon-O02').focus();
      await page.keyboard.press('Enter');
      const keyed = await page.evaluate(() => window.__ICON_LIBRARY__?.selected);
      if (clicked !== 'E06' || keyed !== 'O02') throw new Error(`icon-library: selection contract failed (click=${clicked}, keyboard=${keyed})`);
    }
    if (scene === 'arrow-components') {
      await page.locator('#component-P08').click();
      const clicked = await page.evaluate(() => window.__ARROW_COMPONENTS__?.selected);
      await page.locator('#component-S02').focus();
      await page.keyboard.press('Enter');
      const keyed = await page.evaluate(() => window.__ARROW_COMPONENTS__?.selected);
      if (clicked !== 'P08' || keyed !== 'S02') throw new Error(`arrow-components: selection contract failed (click=${clicked}, keyboard=${keyed})`);
    }
    if (svgDemoIds.includes(scene)) acceptance = await checkAcceptance(page, scene);
    const after = await page.evaluate(() => window.__INTERACTION_COUNT__ ?? 0);
    if (after <= before) throw new Error(`${scene}: interaction contract did not fire`);
    // Demos that deliberately show malformed markup (e.g. path-data error tolerance) declare the expected console
    // error substrings in #stage[data-expected-errors] (separated by ' | '); only unexpected errors fail the run.
    const expectedErrors = (await page.evaluate(() => document.querySelector('#stage')?.getAttribute('data-expected-errors') ?? '')).split(' | ').filter(Boolean);
    const unexpected = errors.filter(message => !expectedErrors.some(pattern => message.includes(pattern)));
    if (unexpected.length) throw new Error(`${scene}: browser errors: ${unexpected.join(' | ')}`);
    const png = PNG.sync.read(await readFile(`out/${scene}-transparent.png`));
    let transparent = 0, visible = 0, colorful = 0;
    for (let i=0; i<png.data.length; i+=4) {
      const [r,g,b,a] = png.data.subarray(i,i+4);
      if (a === 0) transparent++;
      if (a > 20) visible++;
      if (a > 20 && Math.max(r,g,b)-Math.min(r,g,b) > 24) colorful++;
    }
    const pixels = png.width * png.height;
    if (transparent < pixels * 0.08 || visible < pixels * 0.035 || colorful < 2500) throw new Error(`${scene}: weak RGBA content t=${transparent} v=${visible} c=${colorful}`);
    console.log(`${scene}: ${png.width}x${png.height}, transparent=${(transparent/pixels*100).toFixed(1)}%, visible=${(visible/pixels*100).toFixed(1)}%, colorful=${colorful}`);
    const pixelChecks = await checkPixels(page, scene, png);
    results.push({ scene, width:png.width, height:png.height, transparent, visible, colorful, captureMs, coverage, acceptance, pixelChecks });
    } catch (error) { failures.push({scene,error:error.message}); console.error(`${scene}: FAIL ${error.message}`); }
    finally { await page.close(); }
  }
} finally {
  await browser.close();
  stop();
}

await writeFile('out/verification.json', JSON.stringify({ browser:browserVersion, coverageGate, scenes:results, failures }, null, 2) + '\n');
if (failures.length) throw new Error(`${failures.length} scene(s) failed: ${failures.map(f => f.scene).join(', ')}`);
console.log(`Verified ${results.length} scenes; ${results.filter(r => r.coverage).length} native feature demos.`);
