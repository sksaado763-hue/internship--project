import { useEffect, useRef, useState } from 'react';
import { Download, Film, Scissors } from 'lucide-react';
import Button from '../common/Button.jsx';
import { downloadBlob } from '../../utils/browserFiles.js';

function waitForSeek(video, time) {
  if (Math.abs(video.currentTime - time) < 0.04) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error('The video could not seek to that trim point.')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', failed); };
    video.addEventListener('seeked', done, { once: true }); video.addEventListener('error', failed, { once: true });
    video.currentTime = time;
  });
}

export default function VideoEditingStudioTool() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const streamRef = useRef(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('');
  const [rotation, setRotation] = useState('0');
  const [aspect, setAspect] = useState('original');
  const [fit, setFit] = useState('contain');
  const [overlay, setOverlay] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Choose a video. Trim and style it, then export an edited WebM clip.');

  useEffect(() => {
    if (!file) { setUrl(''); return undefined; }
    const nextUrl = URL.createObjectURL(file); setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function exportVideo() {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas || !file || busy) return;
    const trimStart = Number(start); const trimEnd = Number(end || duration);
    if (!Number.isFinite(trimStart) || !Number.isFinite(trimEnd) || trimStart < 0 || trimEnd <= trimStart || trimEnd > duration) {
      setStatus('Set a valid trim range within the video duration.'); return;
    }
    if (!window.MediaRecorder || !canvas.captureStream || !(video.captureStream || video.mozCaptureStream)) {
      setStatus('This browser does not support local video export. Try a recent version of Chrome, Edge, or Firefox.'); return;
    }
    setBusy(true); setStatus('Preparing the local video export…');
    let sourceStream;
    try {
      const sourceWidth = video.videoWidth; const sourceHeight = video.videoHeight;
      if (!sourceWidth || !sourceHeight) throw new Error('Wait for the video preview to finish loading.');
      const degrees = Number(rotation); const radians = degrees * Math.PI / 180;
      if (aspect === 'portrait') { canvas.width = 720; canvas.height = 1280; }
      else if (aspect === 'square') { canvas.width = 1080; canvas.height = 1080; }
      else {
        const rotatedWidth = degrees % 180 ? sourceHeight : sourceWidth;
        const rotatedHeight = degrees % 180 ? sourceWidth : sourceHeight;
        const sizeScale = Math.min(1, 1280 / Math.max(rotatedWidth, rotatedHeight));
        canvas.width = Math.max(2, Math.round(rotatedWidth * sizeScale)); canvas.height = Math.max(2, Math.round(rotatedHeight * sizeScale));
      }
      const context = canvas.getContext('2d');
      const rotatedWidth = degrees % 180 ? sourceHeight : sourceWidth;
      const rotatedHeight = degrees % 180 ? sourceWidth : sourceHeight;
      const scale = fit === 'cover' ? Math.max(canvas.width / rotatedWidth, canvas.height / rotatedHeight) : Math.min(canvas.width / rotatedWidth, canvas.height / rotatedHeight);
      const drawWidth = sourceWidth * scale; const drawHeight = sourceHeight * scale;
      function drawFrame() {
        context.fillStyle = '#080b13'; context.fillRect(0, 0, canvas.width, canvas.height);
        context.save(); context.translate(canvas.width / 2, canvas.height / 2); context.rotate(radians);
        context.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight); context.restore();
        if (overlay.trim()) {
          const bandHeight = Math.max(74, canvas.height * 0.13);
          const fontSize = Math.max(24, Math.min(56, canvas.width * 0.047));
          context.fillStyle = '#05070bb8'; context.fillRect(0, canvas.height - bandHeight, canvas.width, bandHeight);
          context.fillStyle = '#fff'; context.font = `700 ${fontSize}px system-ui, sans-serif`; context.textAlign = 'center'; context.textBaseline = 'middle';
          let text = overlay.trim(); const maxWidth = canvas.width * 0.88;
          while (text.length > 1 && context.measureText(text).width > maxWidth) text = `${text.slice(0, -2)}…`;
          context.fillText(text, canvas.width / 2, canvas.height - bandHeight / 2, maxWidth);
        }
      }
      await waitForSeek(video, trimStart);
      drawFrame();
      const canvasStream = canvas.captureStream(30);
      sourceStream = (video.captureStream ?? video.mozCaptureStream).call(video);
      const outputStream = new MediaStream([...canvasStream.getVideoTracks(), ...sourceStream.getAudioTracks()]);
      streamRef.current = outputStream;
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(outputStream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => { setBusy(false); setStatus('The browser stopped while exporting. Try a shorter clip or a smaller source video.'); };
      recorder.onstop = () => {
        cancelAnimationFrame(frameRef.current);
        sourceStream?.getTracks().forEach((track) => track.stop());
        outputStream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        if (blob.size) {
          const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 70) || 'clip';
          downloadBlob(blob, `${baseName}-edited.webm`);
          setStatus(`Edited clip downloaded · ${new Intl.NumberFormat().format(blob.size)} bytes.`);
        } else setStatus('No video frames were recorded. Try a different file or browser.');
        setBusy(false);
      };
      recorder.start(250);
      await video.play();
      const render = () => {
        drawFrame();
        if (video.currentTime >= trimEnd || video.ended) { video.pause(); if (recorder.state !== 'inactive') recorder.stop(); return; }
        frameRef.current = requestAnimationFrame(render);
      };
      render();
      setStatus('Recording the edited clip locally. Keep this tab open until the download starts.');
    } catch (error) {
      sourceStream?.getTracks().forEach((track) => track.stop());
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null; setBusy(false); setStatus(error.message || 'The video could not be exported.');
    }
  }

  function onVideoReady() {
    const seconds = videoRef.current?.duration ?? 0;
    setDuration(seconds); setStart('0'); setEnd(String(seconds));
    setStatus(`Video loaded · ${seconds.toFixed(1)} seconds. Set a trim range and edit options.`);
  }

  return <div className="tool-editor tool-form-stack social-media-editor">
    <label className="media-upload" htmlFor="video-source"><Film size={21} aria-hidden="true" /><span>{file ? file.name : 'Choose a video file · up to 500 MB'}</span><span className="media-upload-button">Browse</span></label><input className="visually-hidden" id="video-source" type="file" accept="video/*" onChange={(event) => { const next = event.target.files?.[0] ?? null; if (next?.size > 500 * 1024 * 1024) { setFile(null); setStatus('Choose a video file smaller than 500 MB.'); } else { setFile(next); setStatus(next ? 'Loading video preview…' : 'Choose a video file to begin.'); } event.target.value = ''; }} />
    {url && <video ref={videoRef} className="video-studio-preview" src={url} controls playsInline onLoadedMetadata={onVideoReady} onError={() => setStatus('This file format could not be previewed by your browser. Try MP4 or WebM.')} />}
    {url && <>
      <div className="calculator-input-grid">
        <label className="calculator-field" htmlFor="video-trim-start"><span>Trim start · seconds</span><input id="video-trim-start" className="tool-value-input" type="number" min="0" max={duration} step="0.1" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="video-trim-end"><span>Trim end · seconds</span><input id="video-trim-end" className="tool-value-input" type="number" min="0" max={duration} step="0.1" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="video-rotation"><span>Rotate</span><select id="video-rotation" className="tool-value-input" value={rotation} onChange={(event) => setRotation(event.target.value)}>{[0, 90, 180, 270].map((value) => <option value={value} key={value}>{value}°</option>)}</select></label>
        <label className="calculator-field" htmlFor="video-aspect"><span>Export frame</span><select id="video-aspect" className="tool-value-input" value={aspect} onChange={(event) => setAspect(event.target.value)}><option value="original">Original aspect</option><option value="portrait">Portrait · 9:16</option><option value="square">Square · 1:1</option></select></label>
        <label className="calculator-field" htmlFor="video-fit"><span>Fit to frame</span><select id="video-fit" className="tool-value-input" value={fit} onChange={(event) => setFit(event.target.value)}><option value="contain">Fit · show the whole frame</option><option value="cover">Fill · crop to the frame</option></select></label>
        <label className="calculator-field" htmlFor="video-overlay"><span>Text overlay or watermark</span><input id="video-overlay" className="tool-value-input" value={overlay} onChange={(event) => setOverlay(event.target.value)} maxLength={80} placeholder="Optional creator name or short title" /></label>
      </div>
      <div className="tool-actions"><Button variant="primary" type="button" disabled={busy || !duration} onClick={exportVideo}><Scissors size={15} aria-hidden="true" />{busy ? 'Exporting clip…' : 'Export edited WebM'}</Button></div>
    </>}
    <p className="tool-inline-status" aria-live="polite">{status}</p>
    <p className="tool-inline-status">Video processing stays on this device. Export uses browser-supported WebM encoding; original audio is kept when the browser exposes it.</p>
    <canvas ref={canvasRef} className="video-studio-canvas" aria-hidden="true" />
  </div>;
}
