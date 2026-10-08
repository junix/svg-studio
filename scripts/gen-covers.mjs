/**
 * Thumbnail covers for the static gallery.
 *
 * Reuses the capture pipeline in scripts/capture.mjs: vite preview of dist/,
 * playwright-core, `/?scene=<id>&export=1`, `window.__VIS_READY__`, and a clip
 * of the 1400×900 `#stage`. Each transparent stage is flattened onto an opaque
 * plate — ink `#101820` or warm paper `#f4f0e6`, whichever keeps more edge
 * detail in the thumbnail — and scaled to a 640px-wide WebP. Full-size renders
 * stay in gitignored `out/` and are not written here.
 *
 *   just covers
 *   SCENES=botanical,metro node scripts/gen-covers.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const COVER_WIDTH = 640;
const COVER_HEIGHT = Math.round(COVER_WIDTH * 900 / 1400);
const PLATES = [
  { name: 'ink', hex: '#101820' },
  { name: 'paper', hex: '#f4f0e6' },
];
const COVER_DIR = join(root, 'gallery', 'covers');
const QUALITIES = [0.66, 0.52, 0.4];
const MAX_BYTES = 160 * 1024;

const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
if (!Array.isArray(catalog) || !catalog.length) throw new Error('catalog.json is empty');
const known = new Map(catalog.map(item => [item.id, item]));
const selection = process.env.SCENES;
const scenes = selection
  ? (selection.trim().startsWith('[') ? JSON.parse(selection) : selection.split(',').map(id => id.trim()).filter(Boolean))
  : catalog.map(item => item.id);
if (!Array.isArray(scenes) || !scenes.length || new Set(scenes).size !== scenes.length) {
  throw new Error('SCENES must be a nonempty list of unique scene IDs');
}
for (const scene of scenes) {
  if (!known.has(scene)) throw new Error(`unknown scene ${scene}`);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(scene)) throw new Error(`unsafe scene id ${scene}`);
}
if (!existsSync(join(root, 'dist', 'index.html'))) {
  throw new Error('dist/ is missing. Run `just build` or `npm run build` before generating covers.');
}

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
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += chunk.toString(); });
server.stderr.on('data', chunk => { serverLog += chunk.toString(); });
const stop = () => { if (!server.killed) server.kill('SIGTERM'); };
process.on('exit', stop);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Vite startup timeout\n${serverLog}`)), 60000);
  server.stdout.on('data', chunk => {
    if (chunk.toString().includes(`http://127.0.0.1:${port}`)) { clearTimeout(timer); resolve(); }
  });
  server.on('exit', code => reject(new Error(`Vite exited ${code}\n${serverLog}`)));
});

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.CHROME_PATH ?? (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined);
const browser = await chromium.launch({ headless: true, executablePath, args: ['--force-color-profile=srgb'] });

const encodeCover = async (page, png) => page.evaluate(async ({ pngBase64, width, height, plates, qualities, maxBytes }) => {
  const parse = hex => hex.slice(1).match(/../g).map(part => Number.parseInt(part, 16));
  const img = new Image();
  img.src = `data:image/png;base64,${pngBase64}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const alpha = ctx.getImageData(0, 0, width, height).data;
  const lum = (data, x, y) => {
    const i = (y * width + x) * 4;
    return data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
  };
  const energyOf = data => {
    let total = 0;
    let count = 0;
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const here = alpha[(y * width + x) * 4 + 3];
        const near = alpha[(y * width + x + 1) * 4 + 3] + alpha[(y * width + x - 1) * 4 + 3]
          + alpha[((y - 1) * width + x) * 4 + 3] + alpha[((y + 1) * width + x) * 4 + 3];
        if (here < 12 && near < 48) continue;
        const gx = lum(data, x + 1, y) - lum(data, x - 1, y);
        const gy = lum(data, x, y + 1) - lum(data, x, y - 1);
        total += Math.hypot(gx, gy);
        count += 1;
      }
    }
    return count ? total / count : 0;
  };
  const scored = plates.map(plate => {
    ctx.fillStyle = plate.hex;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;
    return { ...plate, rgb: parse(plate.hex), energy: energyOf(data) };
  });
  const ink = scored.find(plate => plate.name === 'ink');
  const paper = scored.find(plate => plate.name === 'paper');
  // Paper has to reveal clearly more structure (dark ink on a light sheet).
  const plate = paper.energy > ink.energy * 1.12 ? paper : ink;
  ctx.fillStyle = plate.hex;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let different = 0;
  let sum = 0;
  let sum2 = 0;
  let n = 0;
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    sum += y;
    sum2 += y * y;
    n += 1;
    if (Math.abs(r - plate.rgb[0]) + Math.abs(g - plate.rgb[1]) + Math.abs(b - plate.rgb[2]) > 18) different += 1;
  }
  const variance = sum2 / n - (sum / n) ** 2;
  const coverage = different / n;
  if (variance < 25 || coverage < 0.015) {
    throw new Error(`blank cover variance=${variance.toFixed(1)} coverage=${(coverage * 100).toFixed(1)}% plate=${plate.name}`);
  }
  let chosen = null;
  for (const quality of qualities) {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('webp encode failed')), 'image/webp', quality);
    });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    chosen = { quality, bytes: Array.from(bytes) };
    if (bytes.length <= maxBytes) break;
  }
  return { ...chosen, variance, coverage, plate: plate.name, inkEnergy: ink.energy, paperEnergy: paper.energy };
}, {
  pngBase64: png.toString('base64'),
  width: COVER_WIDTH,
  height: COVER_HEIGHT,
  plates: PLATES,
  qualities: QUALITIES,
  maxBytes: MAX_BYTES,
});

const captureScene = async scene => {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  try {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol === 'data:' ? route.continue() : route.abort();
    });
    await page.goto(`http://127.0.0.1:${port}/?scene=${encodeURIComponent(scene)}&export=1`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => window.__VIS_READY__ === true, null, { timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const box = await page.locator('#stage').boundingBox();
    if (!box || Math.round(box.width) !== 1400 || Math.round(box.height) !== 900) {
      throw new Error(`invalid stage dimensions ${JSON.stringify(box)}`);
    }
    const png = await page.screenshot({
      clip: { x: box.x, y: box.y, width: box.width, height: box.height },
      omitBackground: true,
      type: 'png',
      timeout: 60000,
    });
    const encoded = await encodeCover(page, png);
    const webp = Buffer.from(encoded.bytes);
    if (webp.length < 12 || webp.toString('ascii', 0, 4) !== 'RIFF' || webp.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error('encoder did not return a WebP');
    }
    await writeFile(join(COVER_DIR, `${scene}.webp`), webp);
    console.log(`${scene}: ${COVER_WIDTH}x${COVER_HEIGHT} ${encoded.plate} q=${encoded.quality} ${(webp.length / 1024).toFixed(1)}KB inkE=${encoded.inkEnergy.toFixed(1)} paperE=${encoded.paperEnergy.toFixed(1)}${errors.length ? ` pageerrors=${errors.length}` : ''}`);
    return { scene, bytes: webp.length };
  } finally {
    await page.close();
  }
};

const failures = [];
const results = [];
try {
  await mkdir(COVER_DIR, { recursive: true });
  const queue = [...scenes];
  const workers = Array.from({ length: Math.min(2, queue.length) }, async () => {
    while (queue.length) {
      const scene = queue.shift();
      try {
        results.push(await captureScene(scene));
      } catch (error) {
        failures.push({ scene, error: error instanceof Error ? error.message : String(error) });
        console.error(`${scene}: FAIL ${error instanceof Error ? error.message : error}`);
      }
    }
  });
  await Promise.all(workers);
  if (!selection) {
    const keep = new Set(scenes.map(scene => `${scene}.webp`));
    for (const name of await readdir(COVER_DIR)) {
      if (name.endsWith('.webp') && !keep.has(name)) {
        await rm(join(COVER_DIR, name));
        console.log(`removed stale cover ${name}`);
      }
    }
  }
} finally {
  await browser.close();
  stop();
}

const total = results.reduce((sum, item) => sum + item.bytes, 0);
console.log(`Covers ${results.length}/${scenes.length}, ${(total / 1024 / 1024).toFixed(2)}MB in ${COVER_DIR}`);
if (failures.length) {
  throw new Error(`${failures.length} scene(s) failed: ${failures.map(item => item.scene).join(', ')}`);
}
