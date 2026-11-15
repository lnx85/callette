#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
# Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
"""Source of the UI strings: writes extension/_locales/{en,it}/messages.json and
extension/engine/i18n-keys.js (the keys other contexts need as a table).

Edit the table below, then run ./build.py (or this script). "$1".."$9" are
positional substitutions; they become named placeholders, which both Chrome and
Firefox support.

Key prefixes: eng_ = recording engine (offscreen document, no chrome.i18n there),
p_ = recorder panel inside the page (MAIN world, no chrome.i18n either).
"""
import json
import re
from pathlib import Path

M = {
    # manifest
    "extName": ("Callette – Video & Call Recorder", "Callette – Registratore di video e chiamate"),
    "extDescription": ("Record the video you pick on a page — video calls and WebRTC live streams too — and save it as MKV, MP4 or WebM.",
                       "Registra il video che scegli in una pagina, anche videochiamate e dirette WebRTC, e lo salva in MKV, MP4 o WebM."),
    # popup: static
    "settings": ("Settings", "Impostazioni"),
    "recFormat": ("Recording format", "Formato delle registrazioni"),
    "recConvert": ("Convert to this format on stop", "Converti in questo formato allo stop"),
    "recConvertHelp": ("MKV: same tracks as the recorded WebM, no re-encoding. MP4: H.264 + AAC, recorded straight in H.264 where the browser allows it, otherwise converted on stop. When off, the WebM recorded by the browser is saved as is.",
                       "MKV: stesse tracce del WebM registrato, senza ricodifica. MP4: H.264 + AAC, registrato direttamente in H.264 dove il browser lo permette, altrimenti convertito allo stop. Se disattivo, salva il WebM registrato dal browser."),
    "recHero": ("Video calls, live streams and page videos", "Videochiamate, dirette e video della pagina"),
    "recHeroHelp": ("Press the button, then click the video to record.", "Premi il pulsante, poi clicca il video da registrare."),
    "recButton": ("● Record a video", "● Registra un video"),
    "recordings": ("Recordings", "Registrazioni"),
    "clearFinished": ("clear finished", "rimuovi completate"),
    "noRecordings": ("No recordings yet. Recordings in progress and those waiting to be saved show up here.",
                     "Nessuna registrazione. Le registrazioni in corso e quelle da salvare compaiono qui."),
    "donate": ("Support Callette ♥", "Sostieni Callette ♥"),
    "credits": ("Callette $1 — by lnx85 · GPL-3.0 license", "Callette $1 — di lnx85 · licenza GPL-3.0"),
    # popup: dynamic
    "youtubeUnsupported": ("YouTube videos are not supported.", "I video di YouTube non sono supportati."),
    "stopAndSave": ("stop and save", "stop e salva"),
    "cancel": ("cancel", "annulla"),
    "saveAs": ("save…", "salva…"),
    "showFile": ("show file", "mostra file"),
    "discard": ("discard", "scarta"),
    "remove": ("remove", "rimuovi"),
    "recClock": ("● REC $1", "● REC $1"),
    # background
    "stageSaved": ("Saved", "Salvata"),
    "stageUnsaved": ("Not saved", "Non salvata"),
    "stageCancelled": ("Cancelled", "Annullata"),
    "stageError": ("Error", "Errore"),
    "errSuspended": ("Interrupted: the browser suspended the extension", "Interrotta: il browser ha sospeso l'estensione"),
    "errEngineRestarted": ("Interrupted: the recording engine was restarted", "Interrotta: il motore di registrazione è stato riavviato"),
    "errSaveFailed": ("Saving failed: $1", "Salvataggio non riuscito: $1"),
    "errSaveFailedCode": ("Saving failed ($1)", "Salvataggio non riuscito ($1)"),
    "interrupted": ("interrupted", "interrotto"),
    "errNoAccess": ("The browser doesn't let extensions access this page.", "Il browser non permette alle estensioni di accedere a questa pagina."),
    "errNotPlaying": ("The page's videos can't be recorded: start playback and try again.",
                      "I video della pagina non si possono registrare: avvia la riproduzione e riprova."),
    "errNoVideos": ("No video found on this page.", "Nessun video trovato in questa pagina."),
    "errUnknownTab": ("Unknown tab", "Scheda sconosciuta"),
    # content script (bridge.js)
    "recPickAgain": ("Pick the video again from the extension button.", "Scegli di nuovo il video dal pulsante dell'estensione."),
    "recNoResponse": ("The extension is not responding", "L'estensione non risponde"),
    # engine (runner.js / engine.js)
    "eng_stageRecording": ("Recording", "Registrazione"),
    "eng_stagePreparing": ("Preparing the file", "Preparo il file"),
    "eng_stageConverting": ("Converting to $1", "Converto in $1"),
    "eng_stageChooseDest": ("Choose where to save", "Scegli dove salvare"),
    "eng_cancelled": ("Cancelled", "Annullata"),
    "eng_error": ("Error", "Errore"),
    "eng_noData": ("Nothing was recorded", "Nessun dato registrato"),
    "eng_writeFailed": ("Write failed: $1", "Scrittura non riuscita: $1"),
    "eng_convertImpossible": ("Conversion to $1 not possible: $2", "Conversione in $1 non possibile: $2"),
    "eng_convertFailed": ("Conversion failed, saved as $1: $2", "Conversione non riuscita, salvato come $1: $2"),
    # recorder panel in the page (page.js)
    "p_labelStream": ("● Record this video", "● Registra questo video"),
    "p_labelCapture": ("● Record (capture from the player)", "● Registra (cattura dal player)"),
    "p_labelOff": ("Can't be recorded", "Non registrabile"),
    "p_offTitle": ("The video hasn't started yet or doesn't expose its stream", "Il video non è ancora partito o non espone il suo flusso"),
    "p_banner": ("Callette: click the video to record", "Callette: clicca il video da registrare"),
    "p_cancel": ("Cancel", "Annulla"),
    "p_close": ("Close", "Chiudi"),
    "p_video": ("Video", "Video"),
    "p_withAudio": ("with audio", "con audio"),
    "p_noAudio": ("no audio", "senza audio"),
    "p_capture": ("captured from the player", "cattura dal player"),
    "p_otherAudio": ("Add the audio of the page's other elements ($1)", "Aggiungi l'audio degli altri elementi della pagina ($1)"),
    "p_saveHint": ("On stop you choose where to save the file.", "Allo stop scegli dove salvare il file."),
    "p_starting": ("Starting…", "Avvio…"),
    "p_record": ("● Record", "● Registra"),
    "p_discard": ("cancel", "annulla"),
    "p_stop": ("■ Stop", "■ Stop"),
    "p_stopping": ("Closing the recording…", "Chiudo la registrazione…"),
    "p_stopped": ("Recording finished: choose where to save the file.", "Registrazione terminata: scegli dove salvare il file."),
    "p_aborted": ("Recording cancelled.", "Registrazione annullata."),
    "p_error": ("Error", "Errore"),
    "p_cantRecord": ("Can't record this video: $1", "Impossibile registrare questo video: $1"),
    "p_cantStart": ("Can't start the recording: $1", "Impossibile avviare la registrazione: $1"),
    "p_noTracks": ("the video has no active tracks", "il video non ha tracce attive"),
    "p_recorderError": ("recorder error", "errore del registratore"),
    "p_untitled": ("recording", "registrazione"),
    "p_audioCount": ("$1 audio", "$1 audio"),
}


def entry(text: str) -> dict:
    nums = sorted(set(re.findall(r"\$(\d)", text)))
    if not nums:
        return {"message": text}
    msg = re.sub(r"\$(\d)", r"$p\1$", text)
    return {"message": msg, "placeholders": {f"p{n}": {"content": f"${n}"} for n in nums}}


def write(ext_dir: Path):
    for i, lang in enumerate(("en", "it")):
        d = ext_dir / "_locales" / lang
        d.mkdir(parents=True, exist_ok=True)
        data = {k: entry(v[i]) for k, v in M.items()}
        (d / "messages.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    keys = {
        "ENGINE_KEYS": [k for k in M if k.startswith("eng_")],
        "PAGE_KEYS": [k for k in M if k.startswith("p_")],
    }
    js = "// SPDX-License-Identifier: GPL-3.0-or-later\n// Generated by tools/messages.py: do not edit.\n"
    js += "".join(f"export const {name} = {json.dumps(v)};\n" for name, v in keys.items())
    (ext_dir / "engine" / "i18n-keys.js").write_text(js, encoding="utf-8")


if __name__ == "__main__":
    write(Path(__file__).resolve().parent.parent / "extension")
    print("✓ extension/_locales/{en,it}/messages.json, extension/engine/i18n-keys.js")
