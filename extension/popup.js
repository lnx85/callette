// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy

import { DEFAULT_SETTINGS, isBlockedUrl } from './shared.js';
import { DONATE_URL } from './build-flags.js';

const $ = (sel, root = document) => root.querySelector(sel);
const send = (msg) => chrome.runtime.sendMessage(msg);
const t = (key, ...subs) => chrome.i18n.getMessage(key, subs.map(String)) || key;
const ACTIVE_STATES = ['running', 'saving', 'unsaved'];

let tabId = null;
let settings = { ...DEFAULT_SETTINGS };

// Fills data-i18n / data-i18n-title / data-i18n-aria attributes.
function localise(root = document) {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  for (const n of root.querySelectorAll('[data-i18n]')) n.textContent = t(n.dataset.i18n);
  for (const n of root.querySelectorAll('[data-i18n-title]')) n.title = t(n.dataset.i18nTitle);
  for (const n of root.querySelectorAll('[data-i18n-aria]')) n.setAttribute('aria-label', t(n.dataset.i18nAria));
}

// ------------------------------------------------------------ formatting ---
function fmtSize(b) {
  if (!b) return '0 MB';
  const s = b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GB` : `${(b / 1048576).toFixed(1)} MB`;
  return chrome.i18n.getUILanguage().startsWith('en') ? s : s.replace('.', ',');
}

function fmtClock(sec) {
  sec = Math.floor(sec || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// Builds a DOM node: el('div', {class, onclick, ...}, ...children)
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== 'string') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : String(c));
  return e;
}

// ---------------------------------------------------------------- render ---
function renderJobs(jobs) {
  const list = Object.values(jobs || {}).sort((a, b) => b.startedAt - a.startedAt);
  $('#empty').hidden = list.length > 0;
  $('#btn-clear-jobs').hidden = !list.some((j) => !ACTIVE_STATES.includes(j.state));
  $('#jobs').replaceChildren(...list.map((j) => {
    const pct = Math.round((j.progress || 0) * 100);
    const active = j.state === 'running' || j.state === 'saving';
    // while recording: elapsed time and size instead of a percentage
    const recording = j.state === 'running' && j.recording;
    const right = recording ? fmtSize(j.size) : active ? `${pct}%` : j.size ? fmtSize(j.size) : '';
    const link = (key, type, cls = 'link') => el('button', { class: cls, onclick: () => send({ type, jobId: j.id }) }, t(key));
    const buttons = [];
    if (recording) buttons.push(link('stopAndSave', 'recStop', 'link stop-rec'));
    if (active) buttons.push(link('cancel', 'cancel'));
    if (j.state === 'unsaved') buttons.push(link('saveAs', 'recSave'));
    if (j.state === 'done') buttons.push(link('showFile', 'reveal'));
    if (!active) buttons.push(link(j.state === 'unsaved' ? 'discard' : 'remove', 'removeJob'));
    const stage = recording ? t('recClock', fmtClock(j.elapsed)) : j.stage || '';
    return el('div', { class: `job ${j.state}${recording ? ' recording' : ''}` },
      el('div', { class: 'job-top' },
        el('span', { class: 'job-name', title: j.output || '' }, `${j.filename}.${j.container}`),
        ...buttons),
      el('div', { class: 'bar' }, el('i', { style: `width:${j.state === 'done' || recording ? 100 : pct}%` })),
      el('div', { class: 'job-info' },
        el('span', {}, j.state === 'error' ? el('span', { class: 'err' }, j.error || t('stageError')) : `${stage}${j.describe ? ' — ' + j.describe : ''}`),
        el('span', {}, right)),
      j.note ? el('div', { class: 'muted job-note' }, j.note) : null,
    );
  }));
}

// -------------------------------------------------------------- settings ---
function saveSettings() {
  settings = { container: $('#set-container').value, recConvert: $('#set-rec-convert').checked };
  chrome.storage.local.set({ settings });
}

function bindSettings() {
  $('#set-container').value = settings.container;
  $('#set-rec-convert').checked = !!settings.recConvert;
  for (const id of ['#set-container', '#set-rec-convert']) $(id).addEventListener('change', saveSettings);
  $('#btn-settings').addEventListener('click', () => { $('#settings').hidden = !$('#settings').hidden; });
  if (DONATE_URL) { $('#donate').href = DONATE_URL; $('#donate').hidden = false; }
  $('#credits').textContent = t('credits', `v${chrome.runtime.getManifest().version}`);
}

// ------------------------------------------------------------------ init ---
async function init() {
  localise();
  // ?tab=<id> lets the popup be opened as a normal page for debugging
  const forced = parseInt(new URLSearchParams(location.search).get('tab'), 10);
  const [tab] = Number.isInteger(forced)
    ? [await chrome.tabs.get(forced)]
    : await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id ?? -1;
  settings = { ...DEFAULT_SETTINGS, ...(await chrome.storage.local.get('settings')).settings };
  bindSettings();

  renderJobs((await chrome.storage.session.get('jobs')).jobs);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'session' && changes.jobs) renderJobs(changes.jobs.newValue);
  });

  const btn = $('#btn-rec');
  const error = $('#rec-error');
  if (isBlockedUrl(tab?.url)) {
    btn.disabled = true;
    error.hidden = false;
    error.textContent = t('youtubeUnsupported');
  }
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const r = await send({ type: 'recPick', tabId });
    btn.disabled = false;
    error.hidden = !r?.error;
    error.textContent = r?.error || '';
    if (!r?.error) window.close();   // the picker is on the page now
  });
  $('#btn-clear-jobs').addEventListener('click', () => send({ type: 'clearFinished' }));
}

init();
