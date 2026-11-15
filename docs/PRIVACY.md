# Callette – Privacy policy

*Last updated: 15 November 2026*

**In short: Callette does not collect, store or send anyone personal data or data about your browsing.**

## What Callette does with data

- **Picking a video.** Only when you press "Record a video", Callette adds a temporary overlay to the current tab
  that highlights the page's videos, so you can click the one to record. Before that it doesn't run anything on the
  page.
- **Recording.** It records the stream of the video you chose (and, if you tick the option, the audio of the page's
  other elements, e.g. the other participants of a call) with the browser's own `MediaRecorder`. The recording is
  written to the extension's private storage (OPFS) on your computer.
- **Saving.** When you stop, the recording is converted to the format you chose inside the browser and handed to the
  browser's download manager, which asks you where to save it. The temporary copy is then deleted.
- **Local storage.** The list of recordings lives in the browser's session storage and is cleared when the browser
  closes. Settings (format, conversion) stay in the extension's local storage.

## What Callette doesn't do

- It sends no data to the developer or to third parties: there are no Callette servers, analytics, ads or tracking.
- It doesn't read page content (other than locating the videos when you ask it to) and doesn't record your browsing
  history.
- It doesn't sell or share any data.

You are responsible for recording only content you have the right to record, and for getting the consent of the
people you record where the law requires it.

## Contact

Questions: open an issue at <https://github.com/lnx85/callette/issues>.

---

# Callette – Informativa sulla privacy

*Ultimo aggiornamento: 15 novembre 2026*

**In breve: Callette non raccoglie, non conserva e non invia a nessuno dati personali o sulla tua navigazione.**

- **Scelta del video.** Solo quando premi "Registra un video", Callette aggiunge alla scheda un riquadro temporaneo
  che evidenzia i video della pagina, per cliccare quello da registrare. Prima di allora non esegue nulla nella pagina.
- **Registrazione.** Registra lo stream del video scelto (e, se spunti l'opzione, l'audio degli altri elementi della
  pagina, ad esempio gli altri partecipanti di una chiamata) con il `MediaRecorder` del browser. La registrazione
  viene scritta nello spazio privato dell'estensione (OPFS) sul tuo computer.
- **Salvataggio.** Allo stop la registrazione viene convertita nel formato scelto dentro il browser e passata al
  gestore download del browser, che ti chiede dove salvarla. La copia temporanea viene poi cancellata.
- **Archiviazione locale.** L'elenco delle registrazioni resta nella memoria di sessione del browser e viene
  cancellato alla chiusura. Le impostazioni (formato, conversione) restano nella memoria locale dell'estensione.
- Callette non ha server, statistiche d'uso, pubblicità o tracciamento; non legge il contenuto delle pagine (a parte
  individuare i video quando glielo chiedi), non registra la cronologia, non vende né condivide dati.

Sei responsabile di registrare solo contenuti che hai il diritto di registrare e di ottenere il consenso delle persone
registrate dove la legge lo richiede.

Contatti: apri una segnalazione su <https://github.com/lnx85/callette/issues>.
