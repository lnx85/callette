// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// SVG helpers for the store images: audio cassettes and video-call tiles.

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function reel(cx, cy, r, ink) {
  const teeth = Array.from({ length: 6 }, (_, i) => `<rect x="${cx - 2}" y="${cy - r + 3}" width="4" height="6" rx="1" fill="${ink}" transform="rotate(${i * 60} ${cx} ${cy})"/>`).join('');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff1dc"/><circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${ink}"/>${teeth}`;
}

// Audio cassette: color of the shell, handwritten label, small side text, amount of tape on each reel (0..1).
function cassette({ color = '#ff6a3d', label = '', side = 'A', note = '', left = 0.5 } = {}) {
  const ink = '#241a2e';
  const dark = shade(color, -0.22);
  const id = Math.random().toString(36).slice(2, 8);
  const tl = 12 + 14 * left, tr = 12 + 14 * (1 - left);
  return `<svg viewBox="0 0 300 190" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(color, 0.12)}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs>
  <rect x="0" y="0" width="300" height="190" rx="14" fill="url(#s${id})"/>
  <rect x="0.5" y="0.5" width="299" height="189" rx="14" fill="none" stroke="#ffffff30"/>
  ${[[12, 12], [288, 12], [12, 178], [288, 178]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${dark}"/><path d="M${x - 2.5} ${y}h5" stroke="${shade(color, -0.45)}" stroke-width="1.4"/>`).join('')}
  <rect x="22" y="18" width="256" height="112" rx="8" fill="#fff1dc"/>
  <rect x="22" y="18" width="256" height="16" rx="6" fill="${shade(color, 0.55)}"/>
  <rect x="22" y="112" width="256" height="18" fill="${shade(color, 0.55)}"/>
  <text x="34" y="30" font-family="Inter" font-weight="800" font-size="11" fill="${dark}" letter-spacing="1.5">CALLETTE · C-90</text>
  <text x="266" y="30" text-anchor="end" font-family="Inter" font-weight="900" font-size="12" fill="${dark}">${side}</text>
  <text x="34" y="60" font-family="Caveat" font-weight="700" font-size="30" fill="${ink}">${label}</text>
  <line x1="34" y1="66" x2="266" y2="66" stroke="#d9c7b0" stroke-width="1"/>
  <rect x="78" y="72" width="144" height="36" rx="18" fill="${ink}"/>
  <rect x="104" y="78" width="92" height="24" fill="#4a2c22"/>
  <circle cx="104" cy="90" r="${tl}" fill="#4a2c22"/><circle cx="196" cy="90" r="${tr}" fill="#4a2c22"/>
  ${reel(104, 90, 11, ink)}${reel(196, 90, 11, ink)}
  <text x="150" y="125" text-anchor="middle" font-family="Inter" font-weight="600" font-size="10" fill="${dark}">${note}</text>
  <path d="M62 190 L76 152 H224 L238 190 Z" fill="${dark}"/>
  <circle cx="110" cy="174" r="5" fill="${ink}"/><circle cx="190" cy="174" r="5" fill="${ink}"/>
  <rect x="140" y="166" width="20" height="12" rx="2" fill="${ink}"/>
</svg>`;
}

// A participant of a video call: abstract silhouette on a colored room.
function person({ bg = '#3b2f52', skin = '#e9b48f', shirt = '#4fd1c5', hair = '#2b1d16' } = {}) {
  const id = Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="r${id}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${shade(bg, 0.25)}"/><stop offset="1" stop-color="${shade(bg, -0.35)}"/></radialGradient></defs>
  <rect width="320" height="200" fill="url(#r${id})"/>
  <rect x="22" y="26" width="58" height="74" rx="4" fill="${shade(bg, 0.12)}" opacity=".6"/>
  <rect x="246" y="40" width="44" height="110" rx="4" fill="${shade(bg, -0.2)}" opacity=".6"/>
  <path d="M86 200 C92 150 122 132 160 132 C198 132 228 150 234 200 Z" fill="${shirt}"/>
  <rect x="148" y="112" width="24" height="26" rx="8" fill="${shade(skin, -0.12)}"/>
  <ellipse cx="160" cy="92" rx="30" ry="35" fill="${skin}"/>
  <path d="M129 88 C128 58 146 52 160 52 C178 52 194 60 191 90 C186 74 176 68 160 68 C146 68 134 74 129 88 Z" fill="${hair}"/>
</svg>`;
}

// "@key" values are looked up in strings.js (when loaded).
const tr = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' && v.startsWith('@') && typeof T === 'function' ? T(v.slice(1)) : v]));

function mount() {
  for (const e of document.querySelectorAll('[data-cassette]')) e.innerHTML = cassette(tr(JSON.parse(e.dataset.cassette || '{}')));
  for (const e of document.querySelectorAll('[data-person]')) e.insertAdjacentHTML('afterbegin', person(JSON.parse(e.dataset.person || '{}')));
}
mount();
