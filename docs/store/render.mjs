#!/usr/bin/env node
// Renders images with a headless Chromium browser (DevTools protocol).
//   node docs/store/render.mjs [name-filter]   docs/store/src/*.html -> docs/store/images/{en,it}/*.png
//                                               size from the file name (…-WxH.html), default 1280×800
//   node docs/store/render.mjs icons           extension/icons/icon.svg -> icon16/32/48/128.png (transparent)
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const which = (c) => { try { return execSync(`command -v ${c}`, { shell: '/bin/sh' }).toString().trim(); } catch { return null; } };
const MAC = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
const browser = process.env.BROWSER || ['brave-origin', 'brave', 'chromium', 'google-chrome'].map(which).find(Boolean) || MAC.find((p) => fs.existsSync(p));
if (!browser) throw new Error('Chromium-based browser not found (set BROWSER)');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'callette-render-'));
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(browser, ['--headless=new', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ver;
for (let i = 0; i < 50 && !ver; i++) { await sleep(200); ver = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json()).catch(() => null); }
const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise((r) => { ws.onopen = r; });
let id = 0; const wait = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
const call = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; wait.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });

async function shoot(url, width, height, out, transparent = false) {
  const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
  const sid = (await call('Target.attachToTarget', { targetId, flatten: true })).sessionId;
  await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sid);
  if (transparent) await call('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, sid);
  await call('Page.enable', {}, sid);
  await call('Page.navigate', { url }, sid);
  await call('Runtime.evaluate', { expression: 'new Promise(r => (document.readyState === "complete" ? r() : addEventListener("load", r))).then(() => document.fonts.ready).then(() => new Promise(r => setTimeout(r, 400)))', awaitPromise: true }, sid);
  const shot = await call('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } }, sid);
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  await call('Target.closeTarget', { targetId });
  console.log(`✓ ${path.relative(root, out)} (${width}×${height})`);
}

try {
  if (process.argv[2] === 'icons') {
    const svg = fs.readFileSync(path.join(root, 'extension/icons/icon.svg'), 'utf8');
    for (const s of [16, 32, 48, 128]) {
      const html = `<html><body style="margin:0"><img style="display:block;width:${s}px;height:${s}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`;
      await shoot(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, s, s, path.join(root, `extension/icons/icon${s}.png`), true);
    }
  } else {
    const files = fs.readdirSync(path.join(here, 'src')).filter((f) => f.endsWith('.html') && f.includes(process.argv[2] || ''));
    for (const f of files.sort()) {
      const name = f.replace(/\.html$/, '');
      const m = name.match(/-(\d+)x(\d+)$/);
      const [width, height] = m ? [+m[1], +m[2]] : [1280, 800];
      for (const lang of ['en', 'it']) {
        fs.mkdirSync(path.join(here, 'images', lang), { recursive: true });
        await shoot(`file://${path.join(here, 'src', f)}?lang=${lang}`, width, height, path.join(here, 'images', lang, `${name}.png`));
      }
    }
  }
} finally {
  ws.close(); proc.kill(); await sleep(300); fs.rmSync(profile, { recursive: true, force: true });
}
