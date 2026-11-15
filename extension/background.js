// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Callette — background (service worker on Chromium, event page on Firefox)
// Injects the video picker on request, keeps the list of recordings and saves
// the finished files with the downloads API. Recordings are received and
// converted by engine/runner.js: offscreen document (Chromium) or this page (Firefox).

import { DEFAULT_SETTINGS, isBlockedUrl } from './shared.js';
import { m, tableFor } from './engine/i18n.js';
import { ENGINE_KEYS, PAGE_KEYS } from './engine/i18n-keys.js';

// Firefox exposes `browser` and has no offscreen documents.
const IS_FIREFOX = typeof browser !== 'undefined' && !!browser.runtime?.getBrowserInfo;
const REC_PORT = 'callette-rec:';
const ACTIVE_STATES = ['running', 'saving', 'unsaved'];

// ----------------------------------------------------------------- jobs ---
let jobsLock = Promise.resolve();

async function getJobs() {
  return (await chrome.storage.session.get('jobs')).jobs || {};
}

function mutateJobs(fn) {
  jobsLock = jobsLock.then(async () => {
    const jobs = await getJobs();
    fn(jobs);
    await chrome.storage.session.set({ jobs });
  }).catch((e) => console.error('[callette] jobs op failed', e));
  return jobsLock;
}

function updateJob(jobId, msg) {
  return mutateJobs((jobs) => {
    const j = jobs[jobId];
    if (!j) return;
    for (const k of ['state', 'recording', 'progress', 'stage', 'output', 'error', 'size', 'elapsed', 'container', 'note']) {
      if (msg[k] !== undefined) j[k] = msg[k];
    }
    if (msg.state && msg.state !== 'running' && msg.state !== 'saving') j.finishedAt = Date.now();
  });
}

function failActiveJobs(err) {
  return mutateJobs((jobs) => {
    for (const j of Object.values(jobs)) {
      if (ACTIVE_STATES.includes(j.state)) Object.assign(j, { state: 'error', recording: false, error: err, stage: m('stageError'), finishedAt: Date.now() });
    }
  });
}

async function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(await chrome.storage.local.get('settings')).settings };
}

// Firefox: a new event page means the previous one (and its recordings) is gone.
if (IS_FIREFOX) failActiveJobs(m('errSuspended'));

// --------------------------------------------------------------- engine ---
// Chromium: offscreen document (the worker may be stopped mid-recording).
// Firefox: no offscreen API, the event page itself runs the engine.
const engine = IS_FIREFOX ? localEngine() : offscreenEngine();

function localEngine() {
  let runner = null;
  let mod = null;
  const load = () => (runner ||= import('./engine/runner.js').then((r) => (mod = r)));
  const bridge = { emit: (jobId, fields) => onEngineEvent(jobId, fields) };
  return {
    ready: load,
    // listeners must be attached synchronously, or the first port messages are lost
    accept: (port) => { keepAlive(); if (mod) mod.acceptRecording(port, bridge); else load().then((r) => r.acceptRecording(port, bridge)); },
    cancel: async (jobId) => (await load()).cancelJob(jobId),
    cleanup: async (jobId) => (await load()).cleanupJob(jobId),
  };
}

function offscreenEngine() {
  let creating = null;
  const ensure = async () => {
    if (await chrome.offscreen.hasDocument()) return;
    creating ||= chrome.offscreen.createDocument({
      url: 'offscreen.html', reasons: ['BLOBS', 'WORKERS'],
      justification: 'Receives the recording of the video the user picked and converts it to the chosen format',
    }).then(() => failActiveJobs(m('errEngineRestarted')))
      .finally(() => { creating = null; });
    await creating;
  };
  const send = async (type, extra) => {
    await ensure();
    for (let i = 0; ; i++) {
      try { return await chrome.runtime.sendMessage({ target: 'offscreen', type, ...extra }); }
      catch (e) { if (i > 10) throw e; await new Promise((r) => setTimeout(r, 100)); }
    }
  };
  return {
    ready: () => send('ping', { strings: tableFor(ENGINE_KEYS) }),
    cancel: (jobId) => send('cancel', { jobId }),
    cleanup: async (jobId) => { if (await chrome.offscreen.hasDocument()) await send('cleanup', { jobId }); },
  };
}

// Firefox suspends an idle event page after ~30 s even while recording:
// calling an extension API resets its idle timer.
let keepAliveTimer = null;
function keepAlive() {
  if (!IS_FIREFOX || keepAliveTimer) return;
  keepAliveTimer = setInterval(async () => {
    const jobs = await getJobs();
    if (!Object.values(jobs).some((j) => ACTIVE_STATES.includes(j.state))) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }, 10_000);
}

// Firefox: recordings are received by this background page.
if (IS_FIREFOX) {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name.startsWith(REC_PORT)) engine.accept(port);
  });
}

async function onEngineEvent(jobId, fields) {
  const { files, ...rest } = fields;
  await updateJob(jobId, rest);
  if (rest.state === 'saving') saveFile(jobId, files).catch((e) => saveFailed(jobId, e));
}

async function saveFailed(jobId, e) {
  await updateJob(jobId, { state: 'error', stage: m('stageError'), error: m('errSaveFailed', e.message) });
  engine.cleanup(jobId);
}

// ----------------------------------------------------------------- save ---
const safeName = (n) => (n || 'recording').replace(/[\x00-\x1f/\\:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '').slice(0, 180) || 'recording';

async function downloadFilename(id) {
  for (let i = 0; i < 50; i++) {
    const [item] = await chrome.downloads.search({ id });
    if (item?.filename) return item.filename;
    await new Promise((r) => setTimeout(r, 100));
  }
  return '';
}

/** Hands the finished recording to the download manager: the user picks the destination ("Save as"). */
async function saveFile(jobId, files) {
  const j = (await getJobs())[jobId];
  if (!j || j.state !== 'saving') return;
  // kept so the user can retry if they dismiss the dialog
  await mutateJobs((jobs) => { if (jobs[jobId]) jobs[jobId].files = files; });
  const main = files.find((f) => f.main);
  let id;
  try {
    id = await chrome.downloads.download({ url: main.url, filename: `${safeName(j.filename)}.${main.ext}`, conflictAction: 'uniquify', saveAs: true });
  } catch (e) {
    if (/cancel/i.test(e.message)) return markUnsaved(jobId);   // Firefox: dialog dismissed
    throw e;
  }
  await mutateJobs((jobs) => { if (jobs[jobId]) jobs[jobId].downloadId = id; });
  // The download may have finished before its id was recorded.
  const [item] = await chrome.downloads.search({ id });
  if (item && item.state !== 'in_progress') onDownloadChanged({ id, state: { current: item.state }, error: item.error && { current: item.error } });
}

function markUnsaved(jobId) {
  return mutateJobs((jobs) => {
    const j = jobs[jobId];
    if (j?.state === 'saving') Object.assign(j, { state: 'unsaved', stage: m('stageUnsaved'), progress: 0, downloadId: null, finishedAt: Date.now() });
  });
}

const settledDownloads = new Set();
async function onDownloadChanged(delta) {
  const st = delta.state?.current;
  if (!st || st === 'in_progress' || settledDownloads.has(delta.id)) return;
  const j = Object.values(await getJobs()).find((x) => x.downloadId === delta.id);
  if (!j) return;
  settledDownloads.add(delta.id);
  if (st === 'complete') {
    const output = await downloadFilename(delta.id);
    await mutateJobs((jobs) => {
      const x = jobs[j.id];
      if (x?.state === 'saving') Object.assign(x, { state: 'done', progress: 1, stage: m('stageSaved'), output, finishedAt: Date.now() });
    });
    engine.cleanup(j.id);
  } else if (delta.error?.current === 'USER_CANCELED') {
    await markUnsaved(j.id);   // "Save as" dismissed or download cancelled: the recording is kept
  } else {
    await updateJob(j.id, { state: 'error', stage: m('stageError'), error: m('errSaveFailedCode', delta.error?.current || m('interrupted')) });
    engine.cleanup(j.id);
  }
}
chrome.downloads.onChanged.addListener(onDownloadChanged);

// ------------------------------------------------------------ recorder ---
// Popup → recPick: injects recorder/bridge.js (isolated) and recorder/page.js
// (MAIN world) in every frame and starts the video picker. page.js records with
// MediaRecorder; bridge.js asks for a job (recStart) and streams the chunks on a
// port straight to the engine (runner.js acceptRecording).
const restrictedPage = (e) => /cannot access|cannot be scripted|missing host permission|extensions gallery|webstore/i.test(e.message || '');

async function recPick(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (isBlockedUrl(tab?.url)) throw new Error(m('youtubeUnsupported'));
  const target = { tabId, allFrames: true };
  let res;
  try {
    await chrome.scripting.executeScript({ target, files: ['recorder/bridge.js'] });
    await chrome.scripting.executeScript({ target, func: () => globalThis.__calletteBridge?.arm() });
    await chrome.scripting.executeScript({ target, files: ['recorder/page.js'], world: 'MAIN' });
    res = await chrome.scripting.executeScript({
      target, world: 'MAIN',
      func: (strings) => window[Symbol.for('callette-recorder')]?.pick(strings) || { usable: 0, total: 0 },
      args: [tableFor(PAGE_KEYS)],
    });
  } catch (e) {
    throw new Error(restrictedPage(e) ? m('errNoAccess') : e.message);
  }
  const usable = res.reduce((a, r) => a + (r.result?.usable || 0), 0);
  const total = res.reduce((a, r) => a + (r.result?.total || 0), 0);
  if (!usable) {
    chrome.tabs.sendMessage(tabId, { callette: 'pickEnd' }).catch(() => {});
    throw new Error(m(total ? 'errNotPlaying' : 'errNoVideos'));
  }
  return { usable };
}

async function recStart({ title, describe }, sender) {
  const tabId = sender.tab?.id;
  if (tabId == null) throw new Error(m('errUnknownTab'));
  const settings = await getSettings();
  const target = settings.recConvert ? (settings.container === 'mp4' ? 'mp4' : 'mkv') : 'webm';
  await engine.ready();
  const jobId = crypto.randomUUID().slice(0, 12);
  await mutateJobs((jobs) => {
    jobs[jobId] = {
      id: jobId, filename: title || 'recording', container: target, describe,
      state: 'running', recording: true, progress: 0, stage: m('eng_stageRecording'), size: 0, elapsed: 0, startedAt: Date.now(),
      tabId, frameId: sender.frameId ?? 0,
    };
  });
  keepAlive();
  return { jobId, target };
}

async function recStop(jobId) {
  const j = (await getJobs())[jobId];
  if (j?.state !== 'running') return;
  // if the tab is gone its port is already closed and the recording is being saved
  await chrome.tabs.sendMessage(j.tabId, { callette: 'stop', jobId }, { frameId: j.frameId }).catch(() => {});
}

async function recSave(jobId) {
  const j = (await getJobs())[jobId];
  if (j?.state !== 'unsaved' || !j.files) return;
  await updateJob(jobId, { state: 'saving', stage: m('eng_stageChooseDest'), progress: 0.99 });
  await saveFile(jobId, j.files).catch((e) => saveFailed(jobId, e));
}

async function cancelJob(jobId) {
  const j = (await getJobs())[jobId];
  if (!j) return;
  if (j.state === 'saving' || j.state === 'unsaved') {
    await updateJob(jobId, { state: 'cancelled', stage: m('stageCancelled') });
    if (j.downloadId != null) await chrome.downloads.cancel(j.downloadId).catch(() => {});
    engine.cleanup(jobId);
  } else await engine.cancel(jobId);
}

// ------------------------------------------------------ popup messages ---
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.target === 'offscreen') return false;   // for the offscreen document
  (async () => {
    switch (msg.type) {
      case 'engineEvent': await onEngineEvent(msg.jobId, msg.fields); return {};
      case 'cancel': await cancelJob(msg.jobId); return {};
      case 'reveal': {
        const j = (await getJobs())[msg.jobId];
        if (j?.downloadId != null) chrome.downloads.show(j.downloadId);
        return {};
      }
      case 'removeJob': {
        const j = (await getJobs())[msg.jobId];
        if (j?.state === 'unsaved') engine.cleanup(msg.jobId);
        await mutateJobs((jobs) => { delete jobs[msg.jobId]; });
        return {};
      }
      case 'clearFinished':
        await mutateJobs((jobs) => { for (const [k, j] of Object.entries(jobs)) if (!ACTIVE_STATES.includes(j.state)) delete jobs[k]; });
        return {};
      case 'recPick': return await recPick(msg.tabId);
      case 'recPickDone': if (sender.tab) chrome.tabs.sendMessage(sender.tab.id, { callette: 'pickEnd' }).catch(() => {}); return {};
      case 'recStart': return await recStart(msg, sender);
      case 'recStop': await recStop(msg.jobId); return {};
      case 'recSave': await recSave(msg.jobId); return {};
      default: return { error: 'unknown' };
    }
  })().then((r) => reply(r), (e) => reply({ error: e.message }));
  return true;
});
