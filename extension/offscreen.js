// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Chromium: the service worker can be stopped at any time, so recordings are
// received and converted in this offscreen document. It only has
// chrome.runtime: progress goes to the worker as messages.

import { cancelJob, cleanupJob, cleanupOrphans, acceptRecording, isRecordingPort } from './engine/runner.js';
import { setStrings } from './engine/i18n.js';

const bridge = {
  emit: (jobId, fields) => chrome.runtime.sendMessage({ type: 'engineEvent', jobId, fields }).catch(() => {}),
};

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.target !== 'offscreen') return;   // messages for the worker
  switch (msg.type) {
    case 'cancel': cancelJob(msg.jobId); break;
    case 'cleanup': cleanupJob(msg.jobId); break;
    case 'ping': setStrings(msg.strings); break;
  }
  reply({ ok: true });
});

// The content script streams the recorded chunks straight here.
chrome.runtime.onConnect.addListener((port) => {
  if (isRecordingPort(port)) acceptRecording(port, bridge);
});

cleanupOrphans().catch(() => {});
