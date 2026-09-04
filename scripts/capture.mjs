import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
if (!Array.isArray(catalog) || catalog.length < 13) throw new Error('reference library requires at least 13 cataloged scenes');
const arrowLibrary = JSON.parse(await readFile(new URL('../arrow-library.json', import.meta.url), 'utf8'));
if (!Array.isArray(arrowLibrary.templates) || arrowLibrary.templates.length !== 18) throw new Error('arrow library requires exactly 18 indexed templates');
const indexedArrowIds = arrowLibrary.templates.map(item => item.id);
if (new Set(indexedArrowIds).size !== indexedArrowIds.length) throw new Error('arrow library template ids must be unique');
const scenes = JSON.parse(process.env.SCENES ?? JSON.stringify(catalog.map(item => item.id)));
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
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'], {stdio:'pipe'});
const stop = () => server.kill('SIGTERM');
process.on('exit', stop);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Vite startup timeout')), 15000);
  server.stdout.on('data', chunk => { if (chunk.toString().includes(`http://127.0.0.1:${port}`)) { clearTimeout(timer); resolve(); } });
  server.on('exit', code => reject(new Error(`Vite exited ${code}`)));
});

await mkdir('out', {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
try {
  for (const scene of scenes) {
    const page = await browser.newPage({viewport:{width:1400,height:900}, deviceScaleFactor:1});
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['127.0.0.1','localhost'].includes(url.hostname) || url.protocol === 'data:' ? route.continue() : route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}/?scene=${scene}&export=1`, {waitUntil:'networkidle'});
    await page.waitForFunction(() => window.__VIS_READY__ === true, null, {timeout:15000});
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
    await stage.screenshot({path:`out/${scene}-transparent.png`, omitBackground:true});
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
    const after = await page.evaluate(() => window.__INTERACTION_COUNT__ ?? 0);
    if (after <= before) throw new Error(`${scene}: interaction contract did not fire`);
    if (errors.length) throw new Error(`${scene}: browser errors: ${errors.join(' | ')}`);
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
    await page.close();
  }
} finally {
  await browser.close();
  stop();
}
