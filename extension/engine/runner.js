// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Receives <video> recordings and turns them into a file ready to be saved.
// Lives in the offscreen document (Chromium) or in the background page (Firefox).
// `bridge` is how it talks to the background: emit(jobId, fields).

import { convertRecording } from './engine.js';
import { m } from './i18n.js';

const JOB_PREFIX = 'callette-job-';
const REC_PORT = 'callette-rec:';
const jobs = new Map();   // jobId -> {ctrl, dir, urls: [], port}

async function opfsRoot() { return navigator.storage.getDirectory(); }

/** Removes staging folders left by jobs that are no longer running (crash, browser closed...). */
export async function cleanupOrphans() {
  const root = await opfsRoot();
  for await (const [name] of root.entries()) {
    if (name.startsWith(JOB_PREFIX) && !jobs.has(name.slice(JOB_PREFIX.length))) {
      await root.removeEntry(name, { recursive: true }).catch(() => {});
    }
  }
}

export function cancelJob(jobId) { jobs.get(jobId)?.ctrl.abort(); }

export async function cleanupJob(jobId) {
  const job = jobs.get(jobId);
  jobs.delete(jobId);
  try { job?.port?.disconnect(); } catch {}
  for (const u of job?.urls || []) URL.revokeObjectURL(u);
  const root = await opfsRoot();
  await root.removeEntry(JOB_PREFIX + jobId, { recursive: true }).catch(() => {});
}

export const isRecordingPort = (port) => port.name.startsWith(REC_PORT);

function fromB64(s) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(s);
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

/** Container of a MediaRecorder file: WebM or (Chromium, H.264) fragmented MP4. */
async function sniffExt(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return String.fromCharCode(...b.subarray(4, 8)) === 'ftyp' ? 'mp4' : 'webm';
}

/**
 * A <video> recording from recorder/page.js. Port name: callette-rec:<jobId>:<container>.
 * MediaRecorder chunks arrive on the port (base64) and are appended to OPFS; at the
 * end the file is rewritten into the chosen container (MediaRecorder leaves out
 * duration and cues, so players can't seek) — or saved as recorded if that fails.
 * If the tab goes away mid-recording, what was received so far is still saved.
 */
export function acceptRecording(port, bridge) {
  const [jobId, target = 'webm'] = port.name.slice(REC_PORT.length).split(':');
  const ctrl = new AbortController();
  const signal = ctrl.signal;
  const job = { ctrl, dir: null, urls: [], port };
  jobs.set(jobId, job);
  const emit = (f) => bridge.emit(jobId, f);
  const t0 = Date.now();
  let bytes = 0, lastEmit = 0, ended = false, writable = null;

  let chain = (async () => {
    await cleanupOrphans().catch(() => {});
    job.dir = await (await opfsRoot()).getDirectoryHandle(JOB_PREFIX + jobId, { create: true });
    writable = await (await job.dir.getFileHandle('rec.raw', { create: true })).createWritable();
  })();

  const fail = async (e) => {
    if (signal.aborted) return;
    console.error('[callette] recording failed', e);
    try { port.postMessage({ type: 'error', error: e.message || String(e) }); } catch {}
    emit({ state: 'error', stage: m('eng_error'), recording: false, error: e.message || String(e) });
    await writable?.abort?.().catch(() => {});
    await cleanupJob(jobId);
  };

  port.onMessage.addListener((msg) => {
    if (ended) return;
    if (msg?.type === 'chunk') {
      chain = chain.then(async () => {
        const data = fromB64(msg.data);
        await writable.write(data);
        bytes += data.length;
        const now = Date.now();
        if (now - lastEmit >= 1000) {
          lastEmit = now;
          emit({ state: 'running', recording: true, stage: m('eng_stageRecording'), size: bytes, elapsed: (now - t0) / 1000 });
        }
      }).catch((e) => { if (!ended) { ended = true; fail(new Error(m('eng_writeFailed', e.message))); } throw e; });
    } else if (msg?.type === 'end') finish();
  });
  port.onDisconnect.addListener(() => {
    job.port = null;
    if (!ended && !signal.aborted) finish();
  });
  signal.addEventListener('abort', () => {
    ended = true;
    try { port.disconnect(); } catch {}
    chain.catch(() => {}).then(async () => {
      await writable?.abort?.().catch(() => {});
      emit({ state: 'cancelled', stage: m('eng_cancelled'), recording: false });
      await cleanupJob(jobId);
    });
  });

  function finish() {
    ended = true;
    const elapsed = (Date.now() - t0) / 1000;
    chain.then(async () => {
      await writable.close();
      if (!bytes) throw new Error(m('eng_noData'));
      emit({ state: 'running', recording: false, progress: 0, stage: m('eng_stagePreparing'), size: bytes, elapsed });
      const raw = await (await job.dir.getFileHandle('rec.raw')).getFile();
      let file = raw;
      let ext = target;
      let note;
      try {
        const out = await job.dir.getFileHandle(`out.${target}`, { create: true });
        file = await convertRecording({
          file: raw, container: target, outHandle: out, signal,
          onStage: (stage) => emit({ state: 'running', stage }),
          onProgress: (f) => emit({ state: 'running', progress: 0.98 * f }),
        });
        await job.dir.removeEntry('rec.raw').catch(() => {});
      } catch (e) {
        if (signal.aborted) throw e;
        console.warn('[callette] conversion failed, saving the recording as is', e);
        file = raw;
        ext = await sniffExt(raw);
        note = m('eng_convertFailed', ext.toUpperCase(), e.message);
        await job.dir.removeEntry(`out.${target}`).catch(() => {});
      }
      const url = URL.createObjectURL(file);
      job.urls = [url];
      try { port.disconnect(); } catch {}
      emit({
        state: 'saving', progress: 0.99, stage: m('eng_stageChooseDest'), size: file.size, container: ext, note,
        files: [{ url, ext, size: file.size, main: true }],
      });
    }).catch((e) => fail(e));
  }
}
