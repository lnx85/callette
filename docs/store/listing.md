# Scheda per gli store

Testi pronti da incollare per **Chrome Web Store** (vale anche per **Edge Add-ons**) e **addons.mozilla.org** (AMO).
Prima la versione inglese (lingua predefinita), poi quella italiana da aggiungere come traduzione.

Pacchetti da caricare (`./build.py`, oppure dalla release GitHub; il link Ko-fi è incluso):

| Store | File |
|---|---|
| Chrome Web Store, Edge Add-ons | `dist/callette-<ver>-chrome-store.zip` (senza `key`: l'ID lo assegna lo store; senza YouTube) |
| AMO | `dist/callette-<ver>-firefox-store.xpi` (senza YouTube) |

Le versioni store escludono YouTube (obbligatorio per il Chrome Web Store, prudente per AMO); la versione pubblicata
su GitHub permette di registrare anche i video di YouTube.

**Lingue**: l'estensione è in inglese (predefinita) e italiano; nome e descrizione del manifest vengono presi da
`_locales/`. In entrambi gli store scegliere **inglese come lingua predefinita** e aggiungere l'italiano, ognuno con
la sua descrizione e i suoi screenshot (`images/en/`, `images/it/`).

**Donazioni (Ko-fi)**: consentite da entrambi gli store se spontanee e non legate a funzioni.
- AMO ha un campo apposito, *Contributions URL*, che accetta Ko-fi: compare come pulsante "Support this developer".
- Chrome Web Store non ha un campo: il link va in fondo alla descrizione (riga già predisposta sotto) e
  nell'estensione (link "Sostieni Callette" nelle impostazioni, attivo se la build ha `DONATE_URL`).
- Pagina Ko-fi: https://ko-fi.com/lnx85 (già inserita nei testi).

---

## English

**Name**: Callette – Video & Call Recorder

**Summary** (CWS max 132 characters, AMO max 250):
> Record video calls, WebRTC live streams and any video on a page with one click. Save as MKV, MP4 or WebM. All local.

**Description**:

```
Press REC on any video.

Callette records the video you pick on a web page: a video call, a WebRTC live stream, a webinar, a player. Open
the popup, press "Record a video", click the video you want and hit Record. When you stop, you choose where to save
the file.

• One click to pick: every video on the page lights up, inside frames too.
• Every voice on one tape: in a call each participant plays from a different element; Callette can mix all their
  audio into the recording.
• A small panel on the page shows time and size; stop from the page or from the popup.
• Keeps recording in fullscreen.
• MKV, MP4 or WebM. On stop the recording gets duration and index, so every player can seek through it.
  MP4 uses H.264 + AAC: it plays on phones, TVs and video editors.
• Didn't save it? The recording waits in the popup until you save or discard it.

All on your computer
Recording and conversion happen inside the browser. No account, no servers, no tracking: nothing is uploaded.

What Callette doesn't do
• It doesn't record DRM-protected players (Netflix, Prime Video…): the browser doesn't expose their stream.
• It doesn't work on YouTube.
• It doesn't touch a page until you press "Record a video".

Only record content you have the right to record, and ask the people in a call for their consent where the law
requires it.

Callette is free and open source (GPL-3.0). If you find it useful, you can buy me a coffee: https://ko-fi.com/lnx85
```

---

## Italiano

**Nome**: Callette – Registratore di video e chiamate

**Riepilogo** (CWS max 132 caratteri, AMO max 250):
> Registra videochiamate, dirette WebRTC e qualsiasi video della pagina con un clic. Salva in MKV, MP4 o WebM. Tutto in locale.

**Descrizione**:

```
Premi REC su qualsiasi video.

Callette registra il video che scegli in una pagina web: una videochiamata, una diretta WebRTC, un webinar, un
player. Apri il popup, premi "Registra un video", clicca il video che ti interessa e premi Registra. Allo stop
scegli dove salvare il file.

• Un clic per scegliere: tutti i video della pagina si illuminano, anche dentro i riquadri.
• Tutte le voci su un nastro: in una chiamata ogni partecipante suona da un elemento diverso; Callette può mescolare
  tutto il loro audio nella registrazione.
• Un piccolo pannello nella pagina mostra tempo e dimensione; stop dalla pagina o dal popup.
• Continua a registrare anche a schermo intero.
• MKV, MP4 o WebM. Allo stop la registrazione riceve durata e indici, così ogni player può scorrerla.
  L'MP4 usa H.264 + AAC: si apre su telefoni, TV ed editor video.
• Non l'hai salvata? La registrazione ti aspetta nel popup finché non la salvi o la scarti.

Tutto sul tuo computer
Registrazione e conversione avvengono dentro il browser. Nessun account, nessun server, nessun tracciamento: nulla
viene caricato.

Cosa Callette non fa
• Non registra i player protetti da DRM (Netflix, Prime Video…): il browser non ne espone il flusso.
• Non funziona su YouTube.
• Non tocca una pagina finché non premi "Registra un video".

Registra solo contenuti che hai il diritto di registrare e chiedi il consenso dei partecipanti a una chiamata dove la
legge lo richiede.

Callette è gratuito e open source (GPL-3.0). Se ti è utile, puoi offrirmi un caffè: https://ko-fi.com/lnx85
```

---

## Chrome Web Store — campi della dashboard

**Categoria**: Strumenti (Tools) · **Lingua predefinita**: Inglese (+ Italiano)

**Scopo unico** (Single purpose):
> Callette records a video element the user picks on the current web page (e.g. a video call) and saves the
> recording as a local video file.

**Giustificazione dei permessi**:

| Permesso | Giustificazione (da incollare) |
|---|---|
| `scripting` | Only when the user presses "Record a video": injects the picker and the recording panel into the tab, so the user can click the video to record and start/stop the recording. |
| `host_permissions: <all_urls>` | The video to record can be on any site and inside cross-origin frames (video-call apps embed their players in iframes); the picker must be injected in all the tab's frames when the user asks for it. Nothing runs on a page before that. |
| `offscreen` | Receives the recorded chunks and converts the recording in an offscreen document, because the service worker may be stopped during a long recording. |
| `downloads` | Hands the finished recording to the download manager with a "Save as" dialog. |
| `unlimitedStorage` | Recordings are written to the extension's private storage (OPFS) while recording; an hour of video takes several GB. |
| `storage` | Keeps the settings (format, conversion) and the list of recordings of the session. |

**Codice remoto**: No, nessun codice remoto (tutto il JavaScript è nel pacchetto; Mediabunny è incluso).

**Pratiche sulla privacy (Data usage)**:
- Dati raccolti: **nessuno**. Se richiesto in modo conservativo, *Website content* viene **usato solo localmente**
  (il video scelto dall'utente viene registrato sul suo computer) e non viene mai trasmesso allo sviluppatore né a
  terzi.
- Certificazioni: non venduti a terzi · non usati per scopi estranei alla funzione · non usati per affidabilità
  creditizia.
- URL informativa privacy: https://github.com/lnx85/callette/blob/main/docs/PRIVACY.md

**Requisiti di policy rispettati**: niente YouTube (escluso nella build store), niente aggiramento di DRM, nessuna
raccolta dati, permessi limitati alla funzione, l'estensione non agisce sulla pagina senza un'azione dell'utente.

---

## AMO — campi del Developer Hub

**Categorie**: Photos, Music & Videos · Social & Communication
**Contributions URL**: `https://ko-fi.com/lnx85` (Ko-fi è tra i servizi accettati)
**Licenza**: GNU General Public License v3.0 (GPL-3.0-or-later, con termini aggiuntivi in `ADDITIONAL-TERMS.md`:
su AMO scegliere "GNU General Public License v3.0"). Codice sorgente: https://github.com/lnx85/callette
**Informativa privacy**: il testo di `docs/PRIVACY.md`.

**Note per i revisori** (Notes to reviewer):

```
No build step: the uploaded package is a plain copy of the extension/ folder (build.py only adapts manifest.json
for Firefox and writes build-flags.js). All code is readable source except one third-party library:

- engine/mediabunny.min.mjs — Mediabunny 1.66.0 (MPL-2.0), official unmodified ESM bundle:
  https://www.npmjs.com/package/mediabunny/v/1.66.0  (file: dist/bundles/mediabunny.min.mjs)
  https://github.com/Vanilagy/mediabunny
  SHA-256 c26f218c23c3d2e97574c9399a75dccb91ceddcac3a6fd4593e9a390320b494a (identical to the npm tarball)

recorder/page.js is injected in the page's MAIN world only after the user presses "Record a video": Firefox content
scripts can't pass the page's MediaStreams to MediaRecorder. It builds its UI with DOM APIs in a closed shadow root
(no innerHTML) and talks to recorder/bridge.js through window.postMessage; each video the user picks allows a single
recording, so the page can't start one by itself.

Test: open https://webrtc.github.io/samples/src/content/peerconnection/pc1/ , press Start and Call, open the popup,
press "Record a video", click the remote video, press "Record", then "Stop" after a few seconds and save the file
(the UI follows the browser language: English or Italian).
```

---

## Immagini

Ogni immagine esiste in `images/en/` e `images/it/`:

| File | Formato | Uso |
|---|---|---|
| `screenshot-1-pick.png` | 1280×800 | CWS/AMO: scelta del video in una videochiamata |
| `screenshot-2-recording.png` | 1280×800 | CWS/AMO: registrazione in corso con il pannello |
| `screenshot-3-formats.png` | 1280×800 | CWS/AMO: MKV, MP4, WebM (le tre cassette) |
| `screenshot-4-how-it-works.png` | 1280×800 | CWS/AMO: come funziona in 3 passi |
| `screenshot-5-popup.png` | 1280×800 | CWS/AMO: popup con le registrazioni, privacy |
| `promo-small-440x280.png` | 440×280 | CWS: piccolo riquadro promozionale (obbligatorio) |
| `promo-marquee-1400x560.png` | 1400×560 | CWS: riquadro grande (facoltativo) |
| `social-preview-1280x640.png` | 1280×640 | GitHub: anteprima dei link (Settings → Social preview) |
| `icons/icon128.png` (nell'estensione) | 128×128 | Icona dello store |

I sorgenti HTML sono in `docs/store/src/` (testi in `src/strings.js`, cassette e partecipanti disegnati da
`src/common.js`); si rigenerano con `node docs/store/render.mjs` (serve Chrome, Brave o Chromium).
Le icone dell'estensione si rigenerano da `extension/icons/icon.svg` con `node docs/store/render.mjs icons`.

---

## Prima di pubblicare

- [ ] Account sviluppatore: Chrome Web Store (5 $ una tantum), AMO (gratis), Edge (gratis).
- [ ] Repository pubblico https://github.com/lnx85/callette (informativa privacy raggiungibile dal link sopra).
- [x] Licenza del progetto: GPL-3.0-or-later + termini aggiuntivi (con l'attribuzione a Fluxy).
- [ ] Account Ko-fi https://ko-fi.com/lnx85 attivo (link nel popup, nelle schede e nel pulsante Sponsor di GitHub).
- [ ] GitHub → Settings → Social preview: caricare `images/en/social-preview-1280x640.png`.
- [ ] Caricare `callette-<ver>-chrome-store.zip` / `callette-<ver>-firefox-store.xpi`, testi, immagini, giustificazioni.
