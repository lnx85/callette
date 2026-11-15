// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Texts of the store images. Each page shows ?lang=en|it (default en):
// [data-t] gets the string as HTML; in data-cassette JSON, values starting with "@" are keys of this table.
const STRINGS = {
  tagline: ['Press REC on any video.', 'Premi REC su qualsiasi video.'],
  url: ['meet.example.com/weekly-sync', 'meet.esempio.it/riunione-settimanale'],
  // people of the made-up call
  n1: ['Giulia', 'Giulia'], n2: ['Marco', 'Marco'], n3: ['Sara', 'Sara'], n4: ['You', 'Tu'],
  // overlay (same texts as the extension)
  labelStream: ['● Record this video', '● Registra questo video'],
  banner: ['Callette: click the video to record', 'Callette: clicca il video da registrare'],
  cancel: ['Cancel', 'Annulla'],
  discard: ['cancel', 'annulla'],
  stop: ['■ Stop', '■ Stop'],
  record: ['● Record', '● Registra'],
  saveHint: ['On stop you choose where to save the file.', 'Allo stop scegli dove salvare il file.'],
  otherAudio: ["Add the audio of the page's other elements (3)", "Aggiungi l'audio degli altri elementi della pagina (3)"],
  panelInfo: ['Video 1280×720 · with audio', 'Video 1280×720 · con audio'],
  // screenshot 1 — pick
  s1_h1: ['Click the video.<br><em>Press REC.</em>', 'Clicca il video.<br><em>Premi REC.</em>'],
  s1_lead: ['Callette highlights every video on the page — inside frames too. Pick the one you want and record just that.',
    'Callette evidenzia ogni video della pagina, anche dentro i riquadri. Scegli quello che vuoi e registra solo quello.'],
  s1_c1: ['Video calls', 'Videochiamate'],
  s1_c2: ['WebRTC live streams', 'Dirette WebRTC'],
  s1_c3: ['Page videos', 'Video della pagina'],
  // screenshot 2 — recording
  s2_h1: ['Every voice<br>on <em>one tape</em>.', 'Tutte le voci<br>su <em>un nastro</em>.'],
  s2_lead: ["In a call each participant plays from their own element: Callette mixes their audio into the recording, so nobody is left out.",
    'In una chiamata ogni partecipante suona da un elemento diverso: Callette mescola il loro audio nella registrazione, senza lasciare fuori nessuno.'],
  s2_b1: ['Live timer and size', 'Tempo e dimensione in diretta'],
  s2_b2: ['Stop from the page or from the popup', 'Stop dalla pagina o dal popup'],
  s2_b3: ['Keeps recording in fullscreen', 'Continua anche a schermo intero'],
  // screenshot 3 — formats
  s3_h1: ['Pick your <em>tape</em>.', 'Scegli il tuo <em>nastro</em>.'],
  s3_lead: ['On stop the recording is rewritten with duration and index, so every player can seek through it.',
    'Allo stop la registrazione viene riscritta con durata e indici, così ogni player può scorrerla.'],
  c_mkv: ['Weekly sync', 'Riunione lunedì'],
  c_mp4: ['Live concert', 'Concerto live'],
  c_webm: ['Webinar', 'Webinar'],
  f_mkv: ['<b>MKV</b> · default<br>Same tracks as recorded, no re-encoding.', '<b>MKV</b> · predefinito<br>Stesse tracce registrate, senza ricodifica.'],
  f_mp4: ['<b>MP4</b><br>H.264 + AAC: plays on phones, TVs and editors.', '<b>MP4</b><br>H.264 + AAC: si apre su telefoni, TV ed editor.'],
  f_webm: ['<b>WebM</b><br>Exactly what the browser recorded.', '<b>WebM</b><br>Esattamente ciò che ha registrato il browser.'],
  // screenshot 4 — how it works
  s4_h1: ['Three steps, <em>side A</em>.', 'Tre passi, <em>lato A</em>.'],
  s4_lead: ['Callette only touches the page when you ask, and only the video you choose.', 'Callette tocca la pagina solo quando glielo chiedi, e solo il video che scegli.'],
  s4_t1: ['Record a video', 'Registra un video'],
  s4_p1: ['Open the popup and press <b>● Record a video</b>: the page\'s videos light up.', 'Apri il popup e premi <b>● Registra un video</b>: i video della pagina si illuminano.'],
  s4_t2: ['Click and REC', 'Clicca e REC'],
  s4_p2: ['Click the video, then <b>● Record</b>. A small panel shows time and size.', 'Clicca il video, poi <b>● Registra</b>. Un piccolo pannello mostra tempo e dimensione.'],
  s4_t3: ['Stop and save', 'Stop e salva'],
  s4_p3: ['Press <b>■ Stop</b> and choose where to save it. Changed your mind? It waits in the popup.', 'Premi <b>■ Stop</b> e scegli dove salvarla. Ci ripensi? Ti aspetta nel popup.'],
  // screenshot 5 — popup and privacy
  s5_h1: ['Stays on <em>your computer</em>.', 'Resta sul <em>tuo computer</em>.'],
  s5_lead: ['Recording and conversion happen inside the browser. No account, no servers, no tracking.',
    'Registrazione e conversione avvengono dentro il browser. Nessun account, nessun server, nessun tracciamento.'],
  s5_b1: ['Nothing uploaded, ever', 'Niente viene caricato, mai'],
  s5_b2: ['Open source, GPL-3.0', 'Open source, GPL-3.0'],
  s5_b3: ['Chrome, Edge, Brave and Firefox', 'Chrome, Edge, Brave e Firefox'],
  p_hero: ['Video calls, live streams and page videos', 'Videochiamate, dirette e video della pagina'],
  p_heroHelp: ['Press the button, then click the video to record.', 'Premi il pulsante, poi clicca il video da registrare.'],
  p_btn: ['● Record a video', '● Registra un video'],
  p_recordings: ['Recordings', 'Registrazioni'],
  p_stopSave: ['stop and save', 'stop e salva'],
  p_cancel: ['cancel', 'annulla'],
  p_show: ['show file', 'mostra file'],
  p_remove: ['remove', 'rimuovi'],
  p_save: ['save…', 'salva…'],
  p_discard: ['discard', 'scarta'],
  p_j1: ['Weekly sync 2026-11-16 10.02.mkv', 'Riunione settimanale 2026-11-16 10.02.mkv'],
  p_j1i: ['● REC 24:17 — 720p · 3 audio', '● REC 24:17 — 720p · 3 audio'],
  p_j2: ['Live concert 2026-11-14 21.30.mp4', 'Concerto live 2026-11-14 21.30.mp4'],
  p_j2i: ['Saved — 1080p · 1 audio', 'Salvata — 1080p · 1 audio'],
  p_j3: ['Webinar 2026-11-12 18.00.mkv', 'Webinar 2026-11-12 18.00.mkv'],
  p_j3i: ['Not saved — 720p · 2 audio', 'Non salvata — 720p · 2 audio'],
  // promo tiles
  promo_sub: ['Record video calls and any video on the page. Save as MKV, MP4 or WebM.',
    'Registra videochiamate e qualsiasi video della pagina. Salva in MKV, MP4 o WebM.'],
  promo_small: ['Press REC<br>on any video.', 'Premi REC<br>su ogni video.'],
  social_sub: ['Browser extension for Chrome, Edge, Brave and Firefox · free and open source',
    'Estensione per Chrome, Edge, Brave e Firefox · gratuita e open source'],
};

const LANG = new URLSearchParams(location.search).get('lang') === 'it' ? 1 : 0;
const T = (k) => STRINGS[k]?.[LANG] ?? k;
document.documentElement.lang = LANG ? 'it' : 'en';
for (const e of document.querySelectorAll('[data-t]')) e.innerHTML = T(e.dataset.t);
