## Packages

| File | For | How to install |
|---|---|---|
| `callette-<ver>-chromium.zip` | Brave, Chrome, Chromium, Edge, Vivaldi | Extract the zip → `chrome://extensions` → *Developer mode* → *Load unpacked* → the extracted folder |
| `callette-<ver>-firefox.xpi` | Firefox, LibreWolf, Waterfox (GitHub build, separate from the AMO listing) | If signed: drag it into a Firefox window. If unsigned: Firefox Developer Edition/Nightly with `xpinstall.signatures.required = false`, or `about:debugging` → *Load Temporary Add-on* |
| `callette-<ver>-chrome-store.zip` | Chrome Web Store, Edge Add-ons | Store uploads only (no `key`, no YouTube) |
| `callette-<ver>-firefox-store.xpi` | addons.mozilla.org | Store uploads only (no YouTube) |

Chromium doesn't install `.crx` extensions from outside the Web Store: that's why the package is a zip to load in
developer mode.

---

## Pacchetti

| File | Per | Come si installa |
|---|---|---|
| `callette-<ver>-chromium.zip` | Brave, Chrome, Chromium, Edge, Vivaldi | Estrai lo zip → `chrome://extensions` → *Modalità sviluppatore* → *Carica estensione non pacchettizzata* → cartella estratta |
| `callette-<ver>-firefox.xpi` | Firefox, LibreWolf, Waterfox | Se firmato: trascinalo in una finestra di Firefox. Se non firmato: Firefox Developer Edition/Nightly con `xpinstall.signatures.required = false`, oppure `about:debugging` → *Carica componente aggiuntivo temporaneo* |
| `callette-<ver>-chrome-store.zip` | Chrome Web Store, Edge Add-ons | Solo per il caricamento negli store (senza `key`, senza YouTube) |
| `callette-<ver>-firefox-store.xpi` | addons.mozilla.org | Solo per il caricamento negli store (senza YouTube) |

Novità e dettagli: vedi il README del repository.
