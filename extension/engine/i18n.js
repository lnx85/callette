// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Localised strings. Uses chrome.i18n where available (background, popup, content
// script); the Chromium offscreen document only has chrome.runtime and the page's
// MAIN world has nothing, so they get a table of strings (setStrings / tableFor).

let table = null;
export function setStrings(t) { if (t) table = t; }

export function m(key, ...subs) {
  const api = globalThis.chrome?.i18n;
  if (!table && api?.getMessage) {
    const s = api.getMessage(key, subs.map(String));
    if (s) return s;
  }
  let s = table?.[key] ?? key;
  subs.forEach((v, i) => { s = s.split(`$${i + 1}`).join(String(v)); });
  return s;
}

/** The given strings with literal $1, $2… (for setStrings in another context). */
export function tableFor(keys) {
  return Object.fromEntries(keys.map((k) => [k, chrome.i18n.getMessage(k, ['$1', '$2', '$3'])]));
}
