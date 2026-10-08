// Reproducible runtime profiling against the production preview build.
// Usage: npm run build && npm run profile [-- --seconds=180 --cycles=5]
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const arg = (name, fallback) => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const SECONDS = arg('seconds', 180);
const CYCLES = arg('cycles', 5);
const PORT = 4173;
const URL = `http://localhost:${PORT}/`;

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* retry */ }
  await sleep(200);
}

const browser = await chromium.launch({ headless: process.env.PROFILE_HEADED !== '1', args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

async function heapMB() {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const { usedSize } = await cdp.send('Runtime.getHeapUsage');
  await cdp.detach();
  return +(usedSize / 1048576).toFixed(2);
}

// ---- Part 1: full match, frame interval sampling ----
await page.goto(URL);
await page.getByRole('button', { name: 'Start Battle' }).click();
await page.waitForFunction(() => window.__SIMULATION__?.isRunning);
await page.evaluate((seconds) => {
  const sim = window.__SIMULATION__;
  sim.sessionTime = seconds;
  sim.player.health = sim.player.maxHealth = 1e9; // keep the match alive for the whole window
  window.__perf = { intervals: [], peakEnemies: 0, peakProjectiles: 0 };
  let last = performance.now();
  const tick = now => {
    const p = window.__perf, s = window.__SIMULATION__;
    p.intervals.push(now - last);
    last = now;
    if (s) {
      p.peakEnemies = Math.max(p.peakEnemies, s.enemies.length);
      p.peakProjectiles = Math.max(p.peakProjectiles, s.projectiles.length);
    }
    if (!p.done) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, SECONDS);

await page.keyboard.down('ArrowUp');
const end = Date.now() + SECONDS * 1000;
let toggle = 0;
while (Date.now() < end) {
  const turn = ['ArrowLeft', 'ArrowRight'][toggle++ % 2];
  await page.keyboard.down(turn);
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('KeyE');
  await sleep(400);
  await page.keyboard.up(turn);
}
await page.keyboard.up('ArrowUp');

const perf = await page.evaluate(() => { window.__perf.done = true; return window.__perf; });
const iv = perf.intervals.slice(5).sort((a, b) => a - b);
const mean = iv.reduce((a, b) => a + b, 0) / iv.length;
const q = p => iv[Math.min(iv.length - 1, Math.floor(iv.length * p))];

// ---- Part 2: memory across repeated start/exit cycles ----
const reset = async () => {
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(URL);
};
await reset();
const heaps = [await heapMB()];
for (let i = 0; i < CYCLES; i++) {
  await page.getByRole('button', { name: 'Start Battle' }).click();
  await page.waitForFunction(() => window.__SIMULATION__?.isRunning);
  await page.keyboard.down('ArrowUp');
  await sleep(5000);
  await page.keyboard.up('ArrowUp');
  await reset();
  heaps.push(await heapMB());
}

const result = {
  date: new Date().toISOString(),
  environment: {
    os: `${os.type()} ${os.release()}`,
    cpu: os.cpus()[0]?.model,
    cores: os.cpus().length,
    memoryGB: +(os.totalmem() / 2 ** 30).toFixed(1),
    browser: `Chromium ${browser.version()} (${process.env.PROFILE_HEADED === '1' ? 'headed' : 'headless'})`,
    viewport: '1280x720',
    deviceScaleFactor: 1,
  },
  matchSeconds: SECONDS,
  frames: iv.length,
  avgFps: +(1000 / mean).toFixed(1),
  frameIntervalMs: { mean: +mean.toFixed(2), p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), p99: +q(0.99).toFixed(2), max: +iv[iv.length - 1].toFixed(2) },
  peakEnemies: perf.peakEnemies,
  peakProjectiles: perf.peakProjectiles,
  heapMBAfterEachCycle: heaps,
  consoleErrors: errors,
};
mkdirSync('perf-results', { recursive: true });
writeFileSync('perf-results/latest.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

await browser.close();
server.kill();
