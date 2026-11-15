// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Helpers shared by the background worker and the popup.

import { STORE_BUILD } from './build-flags.js';

export const DEFAULT_SETTINGS = {
  container: 'mkv',   // 'mkv' | 'mp4': target of the conversion at stop
  recConvert: true,   // false keeps MediaRecorder's WebM as recorded
};

// Store builds leave out YouTube (saving its videos is forbidden by the Chrome Web Store policy).
const BLOCKED_HOST_RE = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|googlevideo\.com|ytimg\.com)$/i;

export function isBlockedUrl(u) {
  if (!STORE_BUILD) return false;
  try { return BLOCKED_HOST_RE.test(new URL(u).hostname); } catch { return false; }
}
