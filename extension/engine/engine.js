// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
// Based on Fluxy by lorisilbagnino — https://github.com/lorisilbagnino/fluxy
// Callette — recording conversion with Mediabunny (WebCodecs when re-encoding is needed).

import {
  Input, Output, BlobSource, StreamTarget, ALL_FORMATS,
  MkvOutputFormat, Mp4OutputFormat, WebMOutputFormat,
  Conversion, QUALITY_HIGH, getFirstEncodableVideoCodec, getFirstEncodableAudioCodec,
} from './mediabunny.min.mjs';
import { m } from './i18n.js';

export class CancelledError extends Error {
  constructor() { super(m('eng_cancelled')); this.name = 'CancelledError'; }
}

function outputFormat(container) {
  if (container === 'mp4') return new Mp4OutputFormat();
  return container === 'webm' ? new WebMOutputFormat() : new MkvOutputFormat();
}

/**
 * Rewrites a MediaRecorder file into `container` (webm | mkv | mp4). Packets are
 * copied whenever the codec fits; MP4 gets H.264 + AAC for every player, so VP8/VP9
 * (Firefox records nothing else) is re-encoded with WebCodecs, and Opus is kept only
 * if the browser can't encode AAC. Also adds the duration and cues MediaRecorder omits.
 */
export async function convertRecording({ file, container, outHandle, signal, onProgress, onStage }) {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const opts = {};
    if (container === 'mp4') {
      const v = await input.getPrimaryVideoTrack();
      const a = await input.getPrimaryAudioTrack();
      if (v && v.codec !== 'avc' && await getFirstEncodableVideoCodec(['avc'], { width: v.codedWidth, height: v.codedHeight })) {
        opts.video = { codec: 'avc', bitrate: QUALITY_HIGH };
      }
      if (a && a.codec !== 'aac' && await getFirstEncodableAudioCodec(['aac'])) opts.audio = { codec: 'aac', bitrate: 160e3 };
    }
    onStage?.(opts.video || opts.audio ? m('eng_stageConverting', container.toUpperCase()) : m('eng_stagePreparing'));
    const writable = await outHandle.createWritable();
    const output = new Output({ format: outputFormat(container), target: new StreamTarget(writable, { chunked: true }) });
    const conversion = await Conversion.init({ input, output, ...opts });
    if (!conversion.isValid) {
      await writable.abort?.().catch(() => {});
      const why = conversion.discardedTracks.map((d) => `${d.track.type} ${d.track.codec || ''} (${d.reason})`).join(', ');
      throw new Error(m('eng_convertImpossible', container.toUpperCase(), why));
    }
    conversion.onProgress = (p) => onProgress?.(p);
    const cancel = () => conversion.cancel().catch(() => {});
    signal?.addEventListener('abort', cancel);
    try { await conversion.execute(); }
    finally { signal?.removeEventListener('abort', cancel); }
    if (signal?.aborted) throw new CancelledError();
    return outHandle.getFile();
  } finally {
    input.dispose?.();
  }
}
