import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Clapperboard, Download, MonitorUp, Play, Scissors, Square } from 'lucide-react';
import heic2any from 'heic2any';
import Button from '../common/Button.jsx';
import { downloadBlob } from '../../utils/browserFiles.js';

/* helpers ------------------------------------------------------------------ */

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(1)} ${unit}`;
}

function pickRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['video/webm', 'video/mp4'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function ResultRows({ items }) {
  return <div className="financial-results" aria-live="polite">{items.map(([label, value]) => <div className="financial-result" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

/* 1 · audio-cutter ---------------------------------------------------------- */

function encodeWav(audioBuffer, startSec, endSec) {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.min(audioBuffer.length, Math.max(0, Math.round(startSec * sampleRate)));
  const endSample = Math.min(audioBuffer.length, Math.max(startSample, Math.round(endSec * sampleRate)));
  const frames = endSample - startSample;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frames * blockAlign;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);
  const writeText = (offset, text) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);
  const channelData = [];
  for (let channel = 0; channel < channels; channel += 1) channelData.push(audioBuffer.getChannelData(channel));
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][startSample + frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

function AudioCutter() {
  const [file, setFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('Choose an audio file to see its duration and set the trim range.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const audioSupported = !!(window.AudioContext || window.webkitAudioContext);

  const duration = buffer ? buffer.duration : 0;

  const range = useMemo(() => {
    if (!buffer) return { ok: false, reason: '' };
    const startNum = Number(start);
    const endNum = Number(end);
    if (!Number.isFinite(startNum) || !Number.isFinite(endNum)) return { ok: false, reason: 'Start and end must be numbers in seconds.' };
    if (startNum < 0) return { ok: false, reason: 'Start must be 0 seconds or more.' };
    if (endNum > duration) return { ok: false, reason: `End cannot be past the ${formatTime(duration)} duration of this file.` };
    if (startNum >= endNum) return { ok: false, reason: 'Start must be earlier than end.' };
    return { ok: true, startNum, endNum };
  }, [buffer, start, end, duration]);

  async function handleFile(selected) {
    setFile(selected);
    setBuffer(null);
    setStart('0');
    setEnd('');
    if (!selected) { setIsError(false); setStatus('Choose an audio file to see its duration and set the trim range.'); return; }
    if (!audioSupported) { setIsError(true); setStatus('This browser does not expose the Web Audio API, so audio files cannot be decoded here.'); return; }
    setBusy(true);
    setIsError(false);
    setStatus('Decoding audio locally…');
    try {
      const bytes = await selected.arrayBuffer();
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const decoded = await context.decodeAudioData(bytes);
      await context.close().catch(() => {});
      setBuffer(decoded);
      setEnd(decoded.duration.toFixed(2));
      setIsError(false);
      setStatus(`Decoded “${selected.name}” — ${formatTime(decoded.duration)} total.`);
    } catch {
      setIsError(true);
      setStatus('This file could not be decoded as audio. Some formats or DRM-protected files are not supported by browsers.');
    } finally {
      setBusy(false);
    }
  }

  function trim() {
    if (!buffer || !range.ok) return;
    try {
      const blob = encodeWav(buffer, range.startNum, range.endNum);
      downloadBlob(blob, 'trimmed.wav');
      setIsError(false);
      setStatus(`Trimmed ${formatTime(range.endNum - range.startNum)} of audio and downloaded trimmed.wav (${formatBytes(blob.size)}).`);
    } catch {
      setIsError(true);
      setStatus('The WAV export failed — the selection may be too large for this browser tab’s memory.');
    }
  }

  return <>
    {!audioSupported && <p className="tool-inline-status status-warning">This browser does not support the Web Audio API, so audio trimming is unavailable here.</p>}
    <label className="calculator-field" htmlFor="audio-file">
      <span>{file ? `Audio file — ${file.name}` : 'Audio file'}</span>
      <input id="audio-file" className="tool-value-input" type="file" accept="audio/*" onChange={(event) => { handleFile(event.target.files?.[0] ?? null); event.target.value = ''; }} />
    </label>
    {buffer && <>
      <ResultRows items={[
        ['Duration', `${formatTime(duration)} (${duration.toFixed(2)} s)`],
        ['Channels / sample rate', `${buffer.numberOfChannels} ch · ${buffer.sampleRate} Hz`],
        ['Selection', range.ok ? `${formatTime(range.endNum - range.startNum)} (${(range.endNum - range.startNum).toFixed(2)} s)` : 'Set a valid range below'],
      ]} />
      <section className="tool-form-section">
        <div className="tool-editor-label"><span>Trim range (seconds)</span><span>{range.ok ? `${formatTime(range.endNum - range.startNum)} selected` : '0 ≤ start &lt; end ≤ duration'}</span></div>
        <label className="calculator-field" htmlFor="audio-start"><span>Start</span><input id="audio-start" className="tool-value-input" type="number" min="0" step="0.01" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="audio-end"><span>End</span><input id="audio-end" className="tool-value-input" type="number" min="0" step="0.01" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
      </section>
      {range.reason && <p className="tool-inline-status status-warning" aria-live="polite">{range.reason}</p>}
    </>}
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <Button variant="primary" size="small" type="button" disabled={!buffer || !range.ok || busy} onClick={trim}><Scissors size={14} aria-hidden="true" />Trim & download WAV</Button>
    </div>
    <p className="tool-inline-status">Decoded and trimmed entirely in your browser with the Web Audio API — the file never leaves this device. Browsers cannot re-encode MP3/AAC, so the export is uncompressed WAV; convert it to MP3 afterwards if you need a smaller file.</p>
  </>;
}

/* 2 · video-cutter ---------------------------------------------------------- */

function VideoCutter() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('Choose a video file, preview it, then set the cut range.');
  const [isError, setIsError] = useState(false);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const urlRef = useRef('');
  const captureSupported = typeof MediaRecorder !== 'undefined' && !!(HTMLVideoElement.prototype.captureStream || HTMLVideoElement.prototype.mozCaptureStream);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const range = useMemo(() => {
    if (!videoUrl || !Number.isFinite(duration) || duration <= 0) return { ok: false, reason: '' };
    const startNum = Number(start);
    const endNum = Number(end);
    if (!Number.isFinite(startNum) || !Number.isFinite(endNum)) return { ok: false, reason: 'Start and end must be numbers in seconds.' };
    if (startNum < 0) return { ok: false, reason: 'Start must be 0 seconds or more.' };
    if (endNum > duration) return { ok: false, reason: `End cannot be past the ${formatTime(duration)} length of this video.` };
    if (startNum >= endNum) return { ok: false, reason: 'Start must be earlier than end.' };
    return { ok: true, startNum, endNum };
  }, [videoUrl, duration, start, end]);

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorderRef.current = null;
  }

  function handleFile(selected) {
    stopRecording();
    setFile(selected);
    setDuration(0);
    setStart('0');
    setEnd('');
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = ''; }
    if (!selected) { setVideoUrl(''); setIsError(false); setStatus('Choose a video file, preview it, then set the cut range.'); return; }
    const url = URL.createObjectURL(selected);
    urlRef.current = url;
    setVideoUrl(url);
    setIsError(false);
    setStatus('Loading preview…');
  }

  function onLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setEnd(Number.isFinite(video.duration) ? video.duration.toFixed(2) : '');
    setIsError(false);
    setStatus(`Preview ready — ${formatTime(video.duration)} total. Set the range, then cut.`);
  }

  function onVideoError() {
    if (!file) return;
    setIsError(true);
    setStatus('This browser cannot play the selected file. Videos recorded on iPhones (MOV/HEVC) and some other codecs are not supported in every browser — if the preview is blank, the cut cannot work either.');
  }

  function cut() {
    const video = videoRef.current;
    if (!video || !range.ok || recording) return;
    const capture = video.captureStream || video.mozCaptureStream;
    if (!capture) { setIsError(true); setStatus('This browser cannot capture a playing video (captureStream is missing), so cutting is unavailable here.'); return; }
    const endTarget = range.endNum;
    const mimeType = pickRecorderMimeType();
    let stream;
    let recorder;
    try {
      stream = capture.call(video);
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      setIsError(true);
      setStatus('Could not start the recorder for this video — the codec may not be captureable in this browser.');
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const extension = mimeType === 'video/mp4' ? 'mp4' : 'webm';
      downloadBlob(blob, `trimmed.${extension}`);
      setIsError(false);
      setStatus(`Cut finished — downloaded trimmed.${extension} (${formatBytes(blob.size)}).`);
    };
    let stopped = false;
    const finish = () => {
      if (stopped) return;
      stopped = true;
      video.pause();
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', finish);
      if (recorder.state !== 'inactive') recorder.stop();
    };
    const onTime = () => { if (video.currentTime >= endTarget) finish(); };
    recorderRef.current = recorder;
    setRecording(true);
    setIsError(false);
    setStatus('Cutting — the preview now plays from start to end while it is re-recorded. Keep this tab visible.');
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', finish);
    video.currentTime = range.startNum;
    video.play().catch(() => {
      setRecording(false);
      setIsError(true);
      setStatus('The browser blocked playback, so the cut could not start.');
    });
  }

  return <>
    {!captureSupported && <p className="tool-inline-status status-warning">This browser lacks MediaRecorder or video capture support, so cutting is unavailable here. Recent Chrome, Edge or Firefox recommended.</p>}
    <label className="calculator-field" htmlFor="video-file">
      <span>{file ? `Video file — ${file.name}` : 'Video file'}</span>
      <input id="video-file" className="tool-value-input" type="file" accept="video/*" onChange={(event) => { handleFile(event.target.files?.[0] ?? null); event.target.value = ''; }} />
    </label>
    {videoUrl && <video key={videoUrl} ref={videoRef} src={videoUrl} controls playsInline onLoadedMetadata={onLoadedMetadata} onError={onVideoError} style={{ width: '100%', borderRadius: '8px', background: '#000' }} />}
    {videoUrl && Number.isFinite(duration) && duration > 0 && <>
      <section className="tool-form-section">
        <div className="tool-editor-label"><span>Cut range (seconds)</span><span>{range.ok ? `${formatTime(range.endNum - range.startNum)} selected` : '0 ≤ start &lt; end ≤ duration'}</span></div>
        <label className="calculator-field" htmlFor="video-start"><span>Start</span><input id="video-start" className="tool-value-input" type="number" min="0" step="0.01" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="video-end"><span>End</span><input id="video-end" className="tool-value-input" type="number" min="0" step="0.01" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
      </section>
      {range.reason && <p className="tool-inline-status status-warning" aria-live="polite">{range.reason}</p>}
    </>}
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      {recording
        ? <Button variant="secondary" size="small" type="button" onClick={stopRecording}><Square size={14} aria-hidden="true" />Stop cut</Button>
        : <Button variant="primary" size="small" type="button" disabled={!videoUrl || !range.ok || !captureSupported} onClick={cut}><Clapperboard size={14} aria-hidden="true" />Cut & download</Button>}
    </div>
    <p className="tool-inline-status">The cut runs entirely in your browser — the file never leaves this device. The output is a re-encoded WebM (or MP4 where the browser only records that), not a copy of the original file, and the quality is lossy. Some codecs, e.g. MOV files from iPhones, may not play in the browser at all.</p>
  </>;
}

/* 3 · screen-recorder ------------------------------------------------------- */

function ScreenRecorder() {
  const [source, setSource] = useState('screen');
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('Pick a source, allow the permission prompt, then record — the capture never leaves this device.');
  const [isError, setIsError] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices && !!(navigator.mediaDevices.getDisplayMedia || navigator.mediaDevices.getUserMedia);

  useEffect(() => () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  function releaseTracks() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }

  async function startSource() {
    releaseTracks();
    setIsError(false);
    if (source === 'screen') {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setIsError(true);
        setStatus('Screen capture is not supported in this browser — recent Chrome, Edge or Firefox support it.');
        return;
      }
      try {
        const media = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        streamRef.current = media;
        setStream(media);
        setStatus('Screen source active. The browser picker lets you choose a tab/window and, in Chrome, whether to share tab audio. The live preview is muted to avoid feedback.');
      } catch {
        setIsError(true);
        setStatus('Screen sharing was cancelled or denied — nothing was captured.');
      }
    } else if (!navigator.mediaDevices?.getUserMedia) {
      setIsError(true);
      setStatus('Camera access is not supported in this browser.');
    } else {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = media;
        setStream(media);
        setStatus('Webcam source active — the live preview is muted to avoid feedback. Start recording when ready.');
      } catch {
        setIsError(true);
        setStatus('Camera/microphone permission was denied — nothing was captured.');
      }
    }
  }

  function startRecording() {
    const media = streamRef.current;
    if (!media || typeof MediaRecorder === 'undefined') return;
    const mimeType = pickRecorderMimeType();
    let recorder;
    try {
      recorder = mimeType ? new MediaRecorder(media, { mimeType }) : new MediaRecorder(media);
    } catch {
      setIsError(true);
      setStatus('Could not start the recorder for this stream.');
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const extension = mimeType === 'video/mp4' ? 'mp4' : 'webm';
      downloadBlob(blob, `recording.${extension}`);
      setIsError(false);
      setStatus(`Recording downloaded as recording.${extension} (${formatBytes(blob.size)}). The source is still live — record again or release it.`);
    };
    recorder.start(250);
    recorderRef.current = recorder;
    setRecording(true);
    setIsError(false);
    setStatus('Recording… press Stop to finish and download.');
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorderRef.current = null;
  }

  function releaseSource() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorderRef.current = null;
    releaseTracks();
    setRecording(false);
    setStatus('Source released and all camera/mic/screen tracks stopped. Pick a source again to record more.');
  }

  return <>
    {!supported && <p className="tool-inline-status status-warning">Media capture is not supported in this browser — screen and webcam recording need getDisplayMedia/getUserMedia plus MediaRecorder (recent Chrome, Edge or Firefox).</p>}
    <label className="calculator-field" htmlFor="recorder-source">
      <span>Source</span>
      <select id="recorder-source" className="tool-value-input" value={source} onChange={(event) => setSource(event.target.value)}>
        <option value="screen">Screen (getDisplayMedia)</option>
        <option value="webcam">Webcam (getUserMedia)</option>
      </select>
    </label>
    {stream
      ? <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: '8px', background: '#000' }} />
      : <p className="tool-inline-status">No source active yet — pick Screen or Webcam and press “Start source”. The browser will ask for permission first.</p>}
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <Button variant="secondary" size="small" type="button" disabled={!supported || !stream || recording} onClick={startSource}><MonitorUp size={14} aria-hidden="true" />Start source</Button>
      {recording
        ? <Button variant="secondary" size="small" type="button" onClick={stopRecording}><Square size={14} aria-hidden="true" />Stop</Button>
        : <Button variant="primary" size="small" type="button" disabled={!supported || !stream} onClick={startRecording}><Play size={14} aria-hidden="true" />Record</Button>}
      <Button variant="secondary" size="small" type="button" disabled={!stream} onClick={releaseSource}><Square size={14} aria-hidden="true" />Release source</Button>
    </div>
    <p className="tool-inline-status">Recording happens locally and the file is downloaded by your browser — nothing is uploaded. The browser will always ask for permission first. System or tab audio capture depends on the OS and browser: Chrome can include tab audio when you enable it in the picker, while other browsers may capture the microphone only.</p>
  </>;
}

/* 4 · heic-converter -------------------------------------------------------- */

function HeicConverter() {
  const [files, setFiles] = useState([]);
  const [outputType, setOutputType] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [status, setStatus] = useState('Choose one or more .heic / .heif files — conversion runs fully on this device.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function convert() {
    if (!files.length || busy) return;
    setBusy(true);
    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    let done = 0;
    let failed = 0;
    for (const file of files) {
      setIsError(false);
      setStatus(`Converting ${done + failed + 1} of ${files.length}: ${file.name}…`);
      try {
        const result = await heic2any({ blob: file, toType: outputType, quality });
        const blobs = Array.isArray(result) ? result : [result];
        blobs.forEach((blob, index) => {
          const base = file.name.replace(/\.(?:heic|heif)$/i, '') || 'photo';
          const name = blobs.length > 1 ? `${base}-${index + 1}.${extension}` : `${base}.${extension}`;
          downloadBlob(blob, name);
        });
        done += 1;
      } catch {
        failed += 1;
      }
    }
    setBusy(false);
    if (failed > 0 && done === 0) {
      setIsError(true);
      setStatus(`${failed} file${failed === 1 ? '' : 's'} could not be converted — are they really HEIC/HEIF photos?`);
    } else {
      setIsError(false);
      setStatus(failed > 0
        ? `Converted ${done} file${done === 1 ? '' : 's'} to .${extension}; ${failed} failed.`
        : `All ${done} file${done === 1 ? '' : 's'} converted and downloaded as .${extension}.`);
    }
  }

  return <>
    <label className="calculator-field" htmlFor="heic-files">
      <span>{files.length ? `HEIC/HEIF files — ${files.length} selected` : 'HEIC/HEIF files'}</span>
      <input id="heic-files" className="tool-value-input" type="file" accept=".heic,.heif,image/heic,image/heif" multiple onChange={(event) => { setFiles(Array.from(event.target.files || [])); event.target.value = ''; }} />
    </label>
    {files.length > 0 && <ResultRows items={[
      ['Files selected', String(files.length)],
      ['Total size', formatBytes(files.reduce((sum, file) => sum + file.size, 0))],
    ]} />}
    <section className="tool-form-section">
      <div className="tool-editor-label"><span>Output options</span><span>{outputType === 'image/jpeg' ? `JPEG · ${Math.round(quality * 100)}% quality` : 'PNG · lossless'}</span></div>
      <label className="calculator-field" htmlFor="heic-output-type">
        <span>Output format</span>
        <select id="heic-output-type" className="tool-value-input" value={outputType} onChange={(event) => setOutputType(event.target.value)}>
          <option value="image/jpeg">JPG (smaller files)</option>
          <option value="image/png">PNG (lossless)</option>
        </select>
      </label>
      <label className="calculator-field" htmlFor="heic-quality">
        <span>JPEG quality — {Math.round(quality * 100)}%</span>
        <input id="heic-quality" className="tool-value-input" type="range" min="0" max="1" step="0.01" value={quality} disabled={outputType !== 'image/jpeg'} onChange={(event) => setQuality(Number(event.target.value))} />
      </label>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <Button variant="primary" size="small" type="button" disabled={!files.length || busy} onClick={convert}><Download size={14} aria-hidden="true" />{busy ? 'Converting…' : 'Convert & download'}</Button>
    </div>
    <p className="tool-inline-status">Conversion runs fully locally in your browser with heic2any — your photos are never uploaded. iPhone photos often use HEIC, which many apps and websites cannot open; the first conversion can take a few seconds while the decoder initializes.</p>
  </>;
}

/* 5 · currency-converter ----------------------------------------------------- */

function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('USD');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.frankfurter.app/latest')
      .then((response) => {
        if (!response.ok) throw new Error('Unexpected response');
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        if (!payload || !payload.rates) throw new Error('Missing rates');
        setData(payload);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not load exchange rates. Check your connection or any ad/script blocker, then reload the page.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const currencies = useMemo(() => (data ? [...Object.keys(data.rates), data.base].sort() : []), [data]);

  const result = useMemo(() => {
    if (!data) return null;
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return { ok: false, reason: 'Enter a non-negative amount.' };
    let rate;
    if (from === to) rate = 1;
    else if (from === data.base) rate = data.rates[to];
    else if (to === data.base) rate = 1 / data.rates[from];
    else rate = data.rates[to] / data.rates[from];
    if (!Number.isFinite(rate)) return { ok: false, reason: 'Pick the currencies to convert between.' };
    return { ok: true, value, rate, converted: value * rate };
  }, [amount, from, to, data]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return <>
    {loading && <p className="tool-inline-status" aria-live="polite">Loading exchange rates…</p>}
    {error && <p className="tool-inline-status status-warning" aria-live="polite">{error}</p>}
    {!loading && !error && <>
      <label className="calculator-field" htmlFor="currency-amount">
        <span>Amount</span>
        <input id="currency-amount" className="tool-value-input" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>
      <label className="calculator-field" htmlFor="currency-from">
        <span>From</span>
        <select id="currency-from" className="tool-value-input" value={from} onChange={(event) => setFrom(event.target.value)}>
          {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      </label>
      <label className="calculator-field" htmlFor="currency-to">
        <span>To</span>
        <select id="currency-to" className="tool-value-input" value={to} onChange={(event) => setTo(event.target.value)}>
          {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      </label>
      <div className="tool-action-row">
        <p className={`tool-inline-status ${result && !result.ok ? 'status-warning' : ''}`} aria-live="polite">{result && !result.ok ? result.reason : `Rates published ${data.date} · mid-market reference values.`}</p>
        <Button variant="secondary" size="small" type="button" onClick={swap}><ArrowRightLeft size={14} aria-hidden="true" />Swap</Button>
      </div>
      {result?.ok && <ResultRows items={[
        ['Amount', `${result.value} ${from}`],
        ['Rate', `1 ${from} = ${result.rate.toFixed(4)} ${to}`],
        ['Converted', `${result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`],
        ['Rates date', data.date],
      ]} />}
    </>}
    <p className="tool-inline-status">This is the only sub-tool here that makes a network request: a single keyless fetch to api.frankfurter.app when the tool loads. Rates come from the European Central Bank, are published once per business day, and are for reference only — no API key and no account needed.</p>
  </>;
}

/* Switch -------------------------------------------------------------------- */

export default function MediaStudioTool({ tool }) {
  let content;
  switch (tool.slug) {
    case 'audio-cutter': content = <AudioCutter />; break;
    case 'video-cutter': content = <VideoCutter />; break;
    case 'screen-recorder': content = <ScreenRecorder />; break;
    case 'heic-converter': content = <HeicConverter />; break;
    case 'currency-converter': content = <CurrencyConverter />; break;
    default: content = <p className="tool-inline-status">This tool is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack">{content}</div>;
}
