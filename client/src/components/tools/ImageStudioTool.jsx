import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Pipette } from 'lucide-react';
import Button from '../common/Button.jsx';
import { canvasToBlob, downloadBlob } from '../../utils/browserFiles.js';

const MAX_DIMENSION = 4096;
const CROP_WORK_MAX = 1600;
const COLORBLIND_MAX = 2048;

const ASPECTS = { free: null, '1:1': [1, 1], '4:3': [4, 3], '16:9': [16, 9] };

const CONVERTERS = {
  'pic-to-png': { label: 'PNG', ext: 'png', mime: 'image/png', flatten: false },
  'pic-to-jpg': { label: 'JPG', ext: 'jpg', mime: 'image/jpeg', flatten: true },
  'pic-to-webp': { label: 'WebP', ext: 'webp', mime: 'image/webp', flatten: true },
  'pic-to-ico': { label: 'ICO', ext: 'ico' },
  'pic-to-bmp': { label: 'BMP', ext: 'bmp' },
  'pic-to-gif': { label: 'GIF', ext: 'gif' },
};

const COLORBLIND_MATRICES = {
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
};

const CODE_THEMES = {
  dark: { background: '#0d1117', border: '#30363d', text: '#e6edf3', number: '#6e7681', comment: '#7ee787', dots: ['#ff5f57', '#febc2e', '#28c840'] },
  light: { background: '#ffffff', border: '#d8dee6', text: '#1f2430', number: '#9aa4b2', comment: '#0a7f4f', dots: ['#ff5f57', '#febc2e', '#28c840'] },
};

const DEFAULT_CODE = [
  '// Free online tools — private by design',
  'function greet(name) {',
  '  /* Builds a friendly welcome message */',
  "  return 'Hello, ' + name + '!';",
  '}',
  '',
  "console.log(greet('world'));",
].join('\n');

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = src;
  });
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
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}

function baseName(file) {
  return (file?.name || 'image').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_') || 'image';
}

function cappedSize(width, height, cap) {
  if (Math.max(width, height) <= cap) return { width, height, scaled: false };
  const scale = cap / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), scaled: true };
}

function drawCanvas(image, cap = MAX_DIMENSION, maxWidth = 0, flatten = true) {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;
  if (maxWidth && targetWidth > maxWidth) {
    targetHeight = Math.max(1, Math.round(targetHeight * (maxWidth / targetWidth)));
    targetWidth = maxWidth;
  }
  const capped = cappedSize(targetWidth, targetHeight, cap);
  const canvas = document.createElement('canvas');
  canvas.width = capped.width;
  canvas.height = capped.height;
  const context = canvas.getContext('2d');
  if (flatten) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function buildIco(pngBytes, width, height) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, 1, true); // image count
  view.setUint8(6, width >= 256 ? 0 : width); // 0 means 256
  view.setUint8(7, height >= 256 ? 0 : height);
  view.setUint8(8, 0); // color palette
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, pngBytes.length, true); // payload size
  view.setUint32(18, 22, true); // payload offset
  const output = new Uint8Array(22 + pngBytes.length);
  output.set(header, 0);
  output.set(pngBytes, 22);
  return output;
}

function encodeBmp24(imageData) {
  const { width, height, data } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const bytes = new Uint8Array(54 + pixelArraySize);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0x42; bytes[1] = 0x4d; // 'BM'
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, 54, true); // pixel data offset
  view.setUint32(14, 40, true); // BITMAPINFOHEADER size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up rows
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // compression: BI_RGB
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // ~72 DPI
  view.setInt32(42, 2835, true);
  for (let row = 0; row < height; row += 1) {
    const sourceRow = (height - 1 - row) * width;
    const targetRow = 54 + row * rowSize;
    for (let column = 0; column < width; column += 1) {
      const source = (sourceRow + column) * 4;
      const target = targetRow + column * 3;
      bytes[target] = data[source + 2]; // B
      bytes[target + 1] = data[source + 1]; // G
      bytes[target + 2] = data[source]; // R
    }
  }
  return bytes; // row padding bytes stay zero
}

function applyColorMatrix(imageData, matrix) {
  const data = imageData.data;
  const [rRow, gRow, bRow] = matrix;
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    data[index] = r * rRow[0] + g * rRow[1] + b * rRow[2];
    data[index + 1] = r * gRow[0] + g * gRow[1] + b * gRow[2];
    data[index + 2] = r * bRow[0] + g * bRow[1] + b * bRow[2];
  }
  return imageData;
}

function parseHexColor(input) {
  let value = input.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(value)) value = [...value].map((digit) => digit + digit).join('');
  if (!/^[\da-f]{6}$/i.test(value)) return null;
  const number = Number.parseInt(value, 16);
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255, hex: `#${value.toUpperCase()}` };
}

function rgbToHslText({ r, g, b }) {
  const rn = r / 255; const gn = g / 255; const bn = b / 255;
  const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn);
  let h = 0; let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === rn) h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function mixChannel(channel, target, amount) {
  return Math.round(channel + (target - channel) * amount);
}

function mixHex(rgb, target, amount) {
  return `#${[mixChannel(rgb.r, target, amount), mixChannel(rgb.g, target, amount), mixChannel(rgb.b, target, amount)].map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function useSourceImage() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [loadNote, setLoadNote] = useState('');

  useEffect(() => {
    if (!file) { setImage(null); setLoadNote(''); return undefined; }
    const objectUrl = URL.createObjectURL(file);
    let cancelled = false;
    loadImage(objectUrl).then((loaded) => {
      if (cancelled) return;
      setImage(loaded);
      const capped = cappedSize(loaded.naturalWidth, loaded.naturalHeight, MAX_DIMENSION);
      setLoadNote(capped.scaled
        ? `This image is larger than ${MAX_DIMENSION}px, so it is processed at ${capped.width} × ${capped.height}px.`
        : `${loaded.naturalWidth} × ${loaded.naturalHeight}px image ready.`);
    }).catch(() => {
      if (cancelled) return;
      setImage(null);
      setLoadNote('The selected file could not be opened as an image.');
    });
    return () => { cancelled = true; URL.revokeObjectURL(objectUrl); };
  }, [file]);

  return { file, setFile, image, loadNote };
}

function ImageField({ id, label, fileName, onFile }) {
  return (
    <label className="calculator-field" htmlFor={id}>
      <span>{fileName ? `${label} — ${fileName}` : label}</span>
      <input
        id={id}
        className="tool-value-input"
        type="file"
        accept="image/*"
        onChange={(event) => { onFile(event.target.files?.[0] ?? null); event.target.value = ''; }}
      />
    </label>
  );
}

function LocalNote({ children }) {
  return <p className="tool-inline-status">{children} All processing happens locally in your browser with the Canvas API — your image is never uploaded and no network request is made.</p>;
}

async function copyText(text, setStatus, label) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${label} copied to clipboard.`);
  } catch {
    setStatus('Clipboard access is unavailable in this browser.');
  }
}

/* ---------------------------------- mode 1: image-compressor ---------------------------------- */

function ImageCompressor({ tool }) {
  const source = useSourceImage();
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState('image/jpeg');
  const [maxWidth, setMaxWidth] = useState('original');
  const [result, setResult] = useState(null); // { blob, width, height, stamp }
  const [status, setStatus] = useState('Choose an image, then tune the quality and max width — it re-encodes live.');
  const outputRef = useRef(null);
  const workCanvasRef = useRef(null);

  useEffect(() => {
    if (!source.image) { setResult(null); workCanvasRef.current = null; return undefined; }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const limit = maxWidth === 'original' ? 0 : Number(maxWidth);
        const canvas = drawCanvas(source.image, MAX_DIMENSION, limit, true);
        const blob = await canvasToBlob(canvas, format, quality);
        if (cancelled) return;
        workCanvasRef.current = canvas;
        setResult({ blob, width: canvas.width, height: canvas.height, stamp: Date.now() });
        setStatus(`Re-encoded at ${Math.round(quality * 100)}% quality · ${canvas.width} × ${canvas.height}px.`);
      } catch {
        if (!cancelled) setStatus('This browser could not re-encode the image with the chosen settings.');
      }
    }, 150);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [source.image, quality, format, maxWidth]);

  useEffect(() => {
    const output = outputRef.current;
    const work = workCanvasRef.current;
    if (!result || !output || !work) return;
    output.width = work.width;
    output.height = work.height;
    output.getContext('2d').clearRect(0, 0, output.width, output.height);
    output.getContext('2d').drawImage(work, 0, 0);
  }, [result]);

  const ext = format === 'image/webp' ? 'webp' : 'jpg';
  const saved = result && source.file ? source.file.size - result.blob.size : 0;
  const pct = result && source.file && source.file.size ? Math.round((saved / source.file.size) * 100) : 0;

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Image and settings</h2>
        <div className="calculator-input-grid">
          <ImageField id="is-compress-file" label="Image file" fileName={source.file?.name} onFile={source.setFile} />
          <label className="calculator-field" htmlFor="is-compress-format">
            <span>Output format</span>
            <select id="is-compress-format" className="tool-value-input" value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="image/jpeg">JPEG (.jpg)</option>
              <option value="image/webp">WebP (.webp)</option>
            </select>
          </label>
          <label className="calculator-field" htmlFor="is-compress-maxwidth">
            <span>Max width</span>
            <select id="is-compress-maxwidth" className="tool-value-input" value={maxWidth} onChange={(event) => setMaxWidth(event.target.value)}>
              <option value="original">Original size</option>
              <option value="1920">1920 px</option>
              <option value="1280">1280 px</option>
              <option value="800">800 px</option>
            </select>
          </label>
          <div className="calculator-field">
            <div className="tool-editor-label"><label htmlFor="is-compress-quality">Quality</label><span>{Math.round(quality * 100)}%</span></div>
            <input id="is-compress-quality" type="range" min="0.05" max="0.95" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
          </div>
        </div>
        {source.loadNote && <p className="tool-inline-status" aria-live="polite">{source.loadNote}</p>}
      </section>
      {result && source.file && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Result</h2>
          <div className="financial-results">
            <div className="financial-result"><span>Original size</span><strong>{formatBytes(source.file.size)}</strong></div>
            <div className="financial-result"><span>New size ({ext.toUpperCase()})</span><strong>{formatBytes(result.blob.size)}</strong></div>
            <div className="financial-result"><span>{saved >= 0 ? 'Saved' : 'Increase'}</span><strong>{saved >= 0 ? `${formatBytes(saved)} (${pct}%)` : formatBytes(-saved)}</strong></div>
          </div>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <canvas ref={outputRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} aria-label={`Compressed image preview at ${Math.round(quality * 100)}% quality`} role="img" />
          </div>
          <div className="tool-actions">
            <Button variant="primary" size="small" type="button" onClick={() => { downloadBlob(result.blob, `${baseName(source.file)}-compressed.${ext}`); setStatus(`Downloading ${ext.toUpperCase()} (${formatBytes(result.blob.size)}).`); }}>
              <Download size={14} aria-hidden="true" /> Download {ext.toUpperCase()}
            </Button>
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} re-encodes your image locally; JPEG and WebP flatten transparent areas onto white.</LocalNote>
    </div>
  );
}

/* ---------------------------------- mode 2: image-cropper ---------------------------------- */

function ImageCropper({ tool }) {
  const source = useSourceImage();
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [aspect, setAspect] = useState('free');
  const [status, setStatus] = useState('Upload an image, then drag on it to draw a crop selection.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source.image) { setRect(null); return; }
    const capped = cappedSize(source.image.naturalWidth, source.image.naturalHeight, CROP_WORK_MAX);
    canvas.width = capped.width;
    canvas.height = capped.height;
    setRect(null);
  }, [source.image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source.image) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source.image, 0, 0, canvas.width, canvas.height);
    if (rect && rect.w >= 2 && rect.h >= 2) {
      context.fillStyle = 'rgba(8, 13, 23, 0.5)';
      context.beginPath();
      context.rect(0, 0, canvas.width, rect.y);
      context.rect(0, rect.y, rect.x, rect.h);
      context.rect(rect.x + rect.w, rect.y, canvas.width - rect.x - rect.w, rect.h);
      context.rect(0, rect.y + rect.h, canvas.width, canvas.height - rect.y - rect.h);
      context.fill();
      context.strokeStyle = '#8b5cf6';
      context.lineWidth = 2;
      context.setLineDash([6, 4]);
      context.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
      context.setLineDash([]);
    }
  }, [source.image, rect]);

  useEffect(() => {
    const preview = previewRef.current;
    const canvas = canvasRef.current;
    if (!preview || !canvas || !source.image || !rect || rect.w < 2 || rect.h < 2) {
      if (preview) { preview.width = 0; preview.height = 0; }
      return;
    }
    const scaleX = source.image.naturalWidth / canvas.width;
    const scaleY = source.image.naturalHeight / canvas.height;
    const sx = Math.round(rect.x * scaleX);
    const sy = Math.round(rect.y * scaleY);
    const sw = Math.max(1, Math.round(rect.w * scaleX));
    const sh = Math.max(1, Math.round(rect.h * scaleY));
    const capped = cappedSize(sw, sh, 360);
    preview.width = capped.width;
    preview.height = capped.height;
    preview.getContext('2d').drawImage(source.image, sx, sy, sw, sh, 0, 0, capped.width, capped.height);
  }, [source.image, rect]);

  function eventPoint(event) {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    return {
      x: Math.min(Math.max(0, (clientX - bounds.left) * (canvas.width / bounds.width)), canvas.width),
      y: Math.min(Math.max(0, (clientY - bounds.top) * (canvas.height / bounds.height)), canvas.height),
    };
  }

  function rectFromPoints(start, current) {
    const canvas = canvasRef.current;
    let w = Math.abs(current.x - start.x);
    let h = Math.abs(current.y - start.y);
    const ratio = ASPECTS[aspect];
    if (ratio) {
      const r = ratio[0] / ratio[1];
      if (h * r > w) w = h * r; else h = w / r;
    }
    w = Math.min(w, canvas.width);
    h = Math.min(h, canvas.height);
    const x = Math.min(Math.max(0, current.x >= start.x ? start.x : start.x - w), canvas.width - w);
    const y = Math.min(Math.max(0, current.y >= start.y ? start.y : start.y - h), canvas.height - h);
    return { x, y, w, h };
  }

  function beginDrag(event) {
    if (!source.image) return;
    const point = eventPoint(event);
    dragRef.current = { start: point };
    setRect({ x: point.x, y: point.y, w: 0, h: 0 });
  }

  function moveDrag(event) {
    if (!dragRef.current) return;
    setRect(rectFromPoints(dragRef.current.start, eventPoint(event)));
  }

  function endDrag() {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (rect && rect.w >= 4 && rect.h >= 4) {
      setStatus(`Selection: ${Math.round(rect.w)} × ${Math.round(rect.h)}px on the working canvas — download it as a PNG.`);
    } else {
      setRect(null);
      setStatus('Selection cleared — drag on the image to draw a new one.');
    }
  }

  function changeAspect(value) {
    setAspect(value);
    setRect((current) => {
      if (!current || value === 'free') return current;
      const [aw, ah] = value.split(':').map(Number);
      const canvas = canvasRef.current;
      const h = Math.min(Math.round((current.w * ah) / aw), canvas ? canvas.height : current.h);
      const y = canvas ? Math.min(current.y, Math.max(0, canvas.height - h)) : current.y;
      return { ...current, y, h };
    });
  }

  async function downloadCrop() {
    const canvas = canvasRef.current;
    if (!canvas || !source.image || !rect) return;
    try {
      const scaleX = source.image.naturalWidth / canvas.width;
      const scaleY = source.image.naturalHeight / canvas.height;
      const sx = Math.round(rect.x * scaleX);
      const sy = Math.round(rect.y * scaleY);
      const sw = Math.max(1, Math.round(rect.w * scaleX));
      const sh = Math.max(1, Math.round(rect.h * scaleY));
      const capped = cappedSize(sw, sh, MAX_DIMENSION);
      const output = document.createElement('canvas');
      output.width = capped.width;
      output.height = capped.height;
      output.getContext('2d').drawImage(source.image, sx, sy, sw, sh, 0, 0, capped.width, capped.height);
      const blob = await canvasToBlob(output);
      downloadBlob(blob, `${baseName(source.file)}-crop.png`);
      setStatus(`Downloading crop as PNG (${output.width} × ${output.height}px).`);
    } catch {
      setStatus('The crop could not be exported.');
    }
  }

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Source image</h2>
        <div className="calculator-input-grid">
          <ImageField id="is-crop-file" label="Image file" fileName={source.file?.name} onFile={source.setFile} />
          <label className="calculator-field" htmlFor="is-crop-aspect">
            <span>Aspect ratio</span>
            <select id="is-crop-aspect" className="tool-value-input" value={aspect} onChange={(event) => changeAspect(event.target.value)}>
              <option value="free">Free</option>
              <option value="1:1">1:1 (square)</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
            </select>
          </label>
        </div>
        {source.loadNote && <p className="tool-inline-status" aria-live="polite">{source.loadNote}</p>}
      </section>
      {source.image && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Draw your selection</h2>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Image — drag with mouse or touch to draw a crop selection"
              style={{ maxWidth: '100%', height: 'auto', display: 'block', touchAction: 'none', cursor: 'crosshair' }}
              onMouseDown={beginDrag}
              onMouseMove={moveDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={beginDrag}
              onTouchMove={moveDrag}
              onTouchEnd={endDrag}
            />
          </div>
        </section>
      )}
      {rect && rect.w >= 2 && rect.h >= 2 && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Crop preview</h2>
          <div style={{ maxWidth: 260, margin: '0 auto' }}>
            <canvas ref={previewRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} aria-label="Live crop preview" role="img" />
          </div>
          <div className="tool-actions">
            <button className="case-action" type="button" onClick={() => { setRect(null); setStatus('Selection cleared.'); }}>Clear selection</button>
            <Button variant="primary" size="small" type="button" onClick={downloadCrop}><Download size={14} aria-hidden="true" /> Download crop PNG</Button>
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} cuts pixels locally on your device and exports a PNG.</LocalNote>
    </div>
  );
}

/* ---------------------------------- modes 3–8: format converters ---------------------------------- */

function FormatConverter({ tool, slug }) {
  const source = useSourceImage();
  const config = CONVERTERS[slug];
  const isGif = slug === 'pic-to-gif';
  const [result, setResult] = useState(null); // { blob, stamp }
  const [gifOptions, setGifOptions] = useState(null); // { pngBlob, webpBlob, stamp }
  const [status, setStatus] = useState(isGif
    ? 'Choose an image — since browsers cannot encode GIF locally, PNG and WebP downloads are offered instead.'
    : `Choose an image to convert it to ${config.label}.`);
  const outputRef = useRef(null);
  const workCanvasRef = useRef(null);

  useEffect(() => {
    if (!source.image) { setResult(null); setGifOptions(null); workCanvasRef.current = null; return undefined; }
    let cancelled = false;
    (async () => {
      try {
        if (isGif) {
          const canvas = drawCanvas(source.image, MAX_DIMENSION, 0, false);
          const [pngBlob, webpBlob] = await Promise.all([
            canvasToBlob(canvas, 'image/png'),
            canvasToBlob(drawCanvas(source.image, MAX_DIMENSION, 0, true), 'image/webp', 0.92),
          ]);
          if (cancelled) return;
          workCanvasRef.current = canvas;
          setGifOptions({ pngBlob, webpBlob, stamp: Date.now() });
          setStatus(`PNG and WebP versions are ready (${formatBytes(pngBlob.size)} and ${formatBytes(webpBlob.size)}).`);
          return;
        }
        let blob;
        if (slug === 'pic-to-ico') {
          const canvas = drawCanvas(source.image, 256, 0, true);
          const pngBytes = new Uint8Array(await (await canvasToBlob(canvas, 'image/png')).arrayBuffer());
          blob = new Blob([buildIco(pngBytes, canvas.width, canvas.height)], { type: 'image/x-icon' });
          workCanvasRef.current = canvas;
        } else if (slug === 'pic-to-bmp') {
          const canvas = drawCanvas(source.image, MAX_DIMENSION, 0, true);
          const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
          blob = new Blob([encodeBmp24(imageData)], { type: 'image/bmp' });
          workCanvasRef.current = canvas;
        } else {
          const canvas = drawCanvas(source.image, MAX_DIMENSION, 0, config.flatten);
          blob = await canvasToBlob(canvas, config.mime, config.mime === 'image/png' ? undefined : 0.92);
          workCanvasRef.current = canvas;
        }
        if (cancelled) return;
        setResult({ blob, stamp: Date.now() });
        setStatus(`Converted to ${config.label} — ${formatBytes(source.file.size)} → ${formatBytes(blob.size)}.`);
      } catch {
        if (!cancelled) setStatus('This image could not be converted in your browser.');
      }
    })();
    return () => { cancelled = true; };
  }, [source.image, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const output = outputRef.current;
    const work = workCanvasRef.current;
    if ((!result && !gifOptions) || !output || !work) return;
    output.width = work.width;
    output.height = work.height;
    output.getContext('2d').clearRect(0, 0, output.width, output.height);
    output.getContext('2d').drawImage(work, 0, 0);
  }, [result, gifOptions]);

  function sizeCards(entries) {
    if (!source.file) return null;
    return (
      <div className="financial-results">
        <div className="financial-result"><span>Original size</span><strong>{formatBytes(source.file.size)}</strong></div>
        {entries.map(([label, size]) => (
          <div className="financial-result" key={label}>
            <span>{label}</span>
            <strong>{size >= source.file.size ? `${formatBytes(size)} (+${formatBytes(size - source.file.size)})` : `${formatBytes(size)} (−${formatBytes(source.file.size - size)})`}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Source image</h2>
        <ImageField id="is-convert-file" label="Image file" fileName={source.file?.name} onFile={source.setFile} />
        {source.loadNote && <p className="tool-inline-status" aria-live="polite">{source.loadNote}</p>}
      </section>
      {isGif && source.image && gifOptions && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Result</h2>
          <p className="tool-inline-status status-warning" aria-live="polite">Browsers can&apos;t encode GIF images locally — here is a PNG of your image instead, plus a WebP option.</p>
          {sizeCards([['PNG size', gifOptions.pngBlob.size], ['WebP size', gifOptions.webpBlob.size]])}
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <canvas ref={outputRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} aria-label="PNG preview of your image" role="img" />
          </div>
          <div className="tool-actions">
            <Button variant="primary" size="small" type="button" onClick={() => downloadBlob(gifOptions.pngBlob, `${baseName(source.file)}.png`)}><Download size={14} aria-hidden="true" /> Download PNG</Button>
            <Button variant="secondary" size="small" type="button" onClick={() => downloadBlob(gifOptions.webpBlob, `${baseName(source.file)}.webp`)}><Download size={14} aria-hidden="true" /> Download WebP</Button>
          </div>
        </section>
      )}
      {!isGif && result && source.file && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Result</h2>
          {sizeCards([[`${config.label} size`, result.blob.size]])}
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <canvas ref={outputRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} aria-label={`Converted ${config.label} preview`} role="img" />
          </div>
          <div className="tool-actions">
            <Button variant="primary" size="small" type="button" onClick={() => { downloadBlob(result.blob, `${baseName(source.file)}.${config.ext}`); setStatus(`Downloading ${config.label} file (${formatBytes(result.blob.size)}).`); }}>
              <Download size={14} aria-hidden="true" /> Download {config.label}
            </Button>
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      {slug === 'pic-to-ico' && <LocalNote>{tool.name} wraps a PNG (max 256px) in a real ICO container — the PNG-in-ICO format that modern Windows and favicons accept.</LocalNote>}
      {slug === 'pic-to-bmp' && <LocalNote>{tool.name} writes a classic 24-bit BMP (rows bottom-up); transparency is flattened onto white.</LocalNote>}
      {['pic-to-png', 'pic-to-jpg', 'pic-to-webp'].includes(slug) && <LocalNote>{tool.name} converts pixels locally with the Canvas API.</LocalNote>}
      {isGif && <LocalNote>{tool.name} still runs locally; the GIF limitation is a browser encoding limitation, not an upload.</LocalNote>}
    </div>
  );
}

/* ---------------------------------- mode 9: pic-to-svg ---------------------------------- */

function PicToSvg({ tool }) {
  const source = useSourceImage();
  const [svg, setSvg] = useState('');
  const [status, setStatus] = useState('Upload an image to wrap it in a downloadable SVG file.');

  useEffect(() => {
    if (!source.image) { setSvg(''); return; }
    const canvas = drawCanvas(source.image, MAX_DIMENSION, 0, false);
    const dataUrl = canvas.toDataURL('image/png');
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>\n</svg>`;
    setSvg(markup);
    setStatus(`SVG wrapper ready — it embeds a ${canvas.width} × ${canvas.height}px PNG bitmap inside the SVG file.`);
  }, [source.image]);

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Source image</h2>
        <ImageField id="is-svg-file" label="Image file" fileName={source.file?.name} onFile={source.setFile} />
        {source.loadNote && <p className="tool-inline-status" aria-live="polite">{source.loadNote}</p>}
      </section>
      {svg && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">SVG output</h2>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt="Preview of the generated SVG wrapping your image" style={{ width: '100%', display: 'block' }} />
          </div>
          <div className="tool-editor-label">
            <label htmlFor="is-svg-markup">SVG markup</label>
            <button className="case-action" type="button" onClick={() => copyText(svg, setStatus, 'SVG markup')}><Copy size={13} aria-hidden="true" />Copy</button>
          </div>
          <textarea id="is-svg-markup" className="tool-textarea" readOnly value={svg} />
          <div className="tool-actions">
            <Button variant="primary" size="small" type="button" onClick={() => { downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${baseName(source.file)}.svg`); setStatus('Downloading the SVG file.'); }}>
              <Download size={14} aria-hidden="true" /> Download SVG
            </Button>
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} embeds the bitmap inside the SVG — it is not a vector trace, so it will not scale beyond the embedded resolution.</LocalNote>
    </div>
  );
}

/* ---------------------------------- mode 10: code-to-image ---------------------------------- */

function CodeToImage({ tool }) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(18);
  const [status, setStatus] = useState('Type or paste code — the image renders live, then download it as a PNG.');
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const palette = CODE_THEMES[theme];
    const lines = code.replace(/\r\n?/g, '\n').split('\n').slice(0, 120).map((line) => line.slice(0, 220));
    const font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = font;
    const numberGutter = String(lines.length).length * fontSize * 0.72 + fontSize * 1.1;
    const padding = Math.round(fontSize * 1.5);
    const lineHeight = Math.round(fontSize * 1.6);
    const contentWidth = Math.max(fontSize * 8, ...lines.map((line) => Math.ceil(measure.measureText(line).width)));
    const titleSpace = lineHeight * 1.9;
    canvas.width = Math.ceil(padding * 2 + numberGutter + contentWidth);
    canvas.height = Math.ceil(padding * 2 + titleSpace + lines.length * lineHeight);
    const context = canvas.getContext('2d');

    const traceRoundedRect = (x, y, width, height, radius) => {
      context.beginPath();
      if (typeof context.roundRect === 'function') context.roundRect(x, y, width, height, radius);
      else context.rect(x, y, width, height);
    };

    traceRoundedRect(0, 0, canvas.width, canvas.height, Math.round(fontSize * 0.9));
    context.fillStyle = palette.background;
    context.fill();
    context.strokeStyle = palette.border;
    context.lineWidth = 1;
    context.stroke();

    palette.dots.forEach((color, index) => {
      context.beginPath();
      context.arc(padding + fontSize * 0.45 + index * fontSize * 1.25, padding + fontSize * 0.55, Math.max(3, fontSize * 0.3), 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });

    context.font = font;
    context.textBaseline = 'alphabetic';
    let inBlockComment = false;
    lines.forEach((line, index) => {
      const baseline = padding + titleSpace + index * lineHeight + lineHeight * 0.78;
      context.fillStyle = palette.number;
      context.textAlign = 'right';
      context.fillText(String(index + 1), padding + numberGutter - fontSize * 0.7, baseline);
      context.textAlign = 'left';
      let cursor = padding + numberGutter;
      const drawSegment = (text, tinted) => {
        if (!text) return;
        context.fillStyle = tinted ? palette.comment : palette.text;
        context.fillText(text, cursor, baseline);
        cursor += measure.measureText(text).width;
      };
      let remainder = line;
      let mode = inBlockComment ? 'block' : 'code'; // code | line-comment | block-comment
      while (remainder.length > 0) {
        if (mode === 'code') {
          const blockAt = remainder.indexOf('/*');
          const lineAt = remainder.indexOf('//');
          const cut = blockAt < 0 ? lineAt : (lineAt < 0 ? blockAt : Math.min(blockAt, lineAt));
          if (cut < 0) {
            drawSegment(remainder, false);
            remainder = '';
          } else {
            drawSegment(remainder.slice(0, cut), false);
            remainder = remainder.slice(cut);
            mode = remainder.startsWith('//') ? 'line' : 'block';
          }
        } else if (mode === 'line') {
          drawSegment(remainder, true); // rest of the line is a // comment
          remainder = '';
        } else {
          const end = remainder.indexOf('*/');
          if (end === -1) {
            drawSegment(remainder, true); // block comment continues on the next line
            remainder = '';
            inBlockComment = true;
          } else {
            drawSegment(remainder.slice(0, end + 2), true);
            remainder = remainder.slice(end + 2);
            mode = 'code';
          }
        }
      }
    });
    setStatus(`Rendered ${lines.length} line${lines.length === 1 ? '' : 's'} at ${canvas.width} × ${canvas.height}px — download it as a PNG.`);
  }, [code, theme, fontSize]);

  async function download() {
    try {
      const blob = await canvasToBlob(canvasRef.current, 'image/png');
      downloadBlob(blob, 'code-snippet.png');
      setStatus('Downloading code-snippet.png.');
    } catch {
      setStatus('The code image could not be exported.');
    }
  }

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Code</h2>
        <div className="tool-editor-label"><label htmlFor="is-code-input">Your code</label><span>{code.length} characters</span></div>
        <textarea id="is-code-input" className="tool-textarea" value={code} onChange={(event) => setCode(event.target.value)} maxLength={8000} spellCheck={false} placeholder="Paste or type your code here…" />
        <div className="calculator-input-grid">
          <label className="calculator-field" htmlFor="is-code-theme">
            <span>Theme</span>
            <select id="is-code-theme" className="tool-value-input" value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label className="calculator-field" htmlFor="is-code-fontsize">
            <span>Font size</span>
            <select id="is-code-fontsize" className="tool-value-input" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))}>
              <option value="14">14 px</option>
              <option value="18">18 px</option>
              <option value="24">24 px</option>
            </select>
          </label>
        </div>
      </section>
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Image preview</h2>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} aria-label="Rendered code snippet image" role="img" />
        </div>
        <div className="tool-actions">
          <Button variant="primary" size="small" type="button" disabled={!code.trim()} onClick={download}><Download size={14} aria-hidden="true" /> Download PNG</Button>
        </div>
      </section>
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} draws your text onto a canvas locally; comments are tinted, and no code is sent anywhere.</LocalNote>
    </div>
  );
}

/* ---------------------------------- mode 11: color-picker ---------------------------------- */

function ColorPicker({ tool }) {
  const [hex, setHex] = useState('#4f46e5');
  const [status, setStatus] = useState('Choose a color, type a HEX value, or pick a color from your screen.');
  const parsed = parseHexColor(hex);
  const rgbText = parsed ? `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})` : '';
  const hslText = parsed ? rgbToHslText(parsed) : '';
  const amounts = [0.85, 0.7, 0.55, 0.4, 0.25];
  const tints = parsed ? amounts.map((amount) => mixHex(parsed, 255, amount)) : [];
  const shades = parsed ? amounts.map((amount) => mixHex(parsed, 0, amount)) : [];

  async function pickFromScreen() {
    if (!('EyeDropper' in window)) {
      setStatus('The EyeDropper API is not supported by this browser — use the color field or type a HEX value instead.');
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setHex(result.sRGBHex.toUpperCase());
      setStatus(`Picked ${result.sRGBHex.toUpperCase()} from the screen.`);
    } catch {
      setStatus('Screen picking was cancelled.');
    }
  }

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Choose a color</h2>
        <div className="calculator-input-grid">
          <label className="calculator-field" htmlFor="is-color-well">
            <span>Color</span>
            <input id="is-color-well" className="tool-value-input" type="color" value={parsed?.hex ?? '#000000'} onChange={(event) => setHex(event.target.value.toUpperCase())} />
          </label>
          <label className="calculator-field" htmlFor="is-color-hex">
            <span>HEX value</span>
            <input id="is-color-hex" className="tool-value-input" value={hex} onChange={(event) => setHex(event.target.value)} placeholder="#4F46E5" spellCheck={false} />
          </label>
        </div>
        <div className="tool-actions">
          <button className="case-action" type="button" onClick={pickFromScreen}><Pipette size={13} aria-hidden="true" />Pick from screen</button>
        </div>
        {!parsed && <p className="tool-inline-status status-warning" aria-live="polite">Enter a valid 3 or 6 digit HEX color.</p>}
      </section>
      {parsed && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Color values</h2>
          <div className="financial-results">
            <div className="financial-result">
              <span>HEX</span>
              <strong>{parsed.hex}</strong>
              <button className="case-action" type="button" onClick={() => copyText(parsed.hex, setStatus, 'HEX')}><Copy size={13} aria-hidden="true" />Copy HEX</button>
            </div>
            <div className="financial-result">
              <span>RGB</span>
              <strong>{rgbText}</strong>
              <button className="case-action" type="button" onClick={() => copyText(rgbText, setStatus, 'RGB')}><Copy size={13} aria-hidden="true" />Copy RGB</button>
            </div>
            <div className="financial-result">
              <span>HSL</span>
              <strong>{hslText}</strong>
              <button className="case-action" type="button" onClick={() => copyText(hslText, setStatus, 'HSL')}><Copy size={13} aria-hidden="true" />Copy HSL</button>
            </div>
          </div>
        </section>
      )}
      {parsed && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Tints and shades</h2>
          <p className="tool-inline-status">Click any swatch to copy its HEX value.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(44px, 1fr))', gap: 6 }}>
            {tints.map((color) => (
              <button key={color} type="button" title={color} aria-label={`Copy tint ${color}`} onClick={() => copyText(color, setStatus, color)}
                style={{ backgroundColor: color, minHeight: 38, border: '1px solid var(--line)', borderRadius: 9, cursor: 'pointer' }} />
            ))}
            <button type="button" title={`${parsed.hex} (base color)`} aria-label={`Copy base color ${parsed.hex}`} onClick={() => copyText(parsed.hex, setStatus, parsed.hex)}
              style={{ backgroundColor: parsed.hex, minHeight: 38, border: '2px solid var(--ink)', borderRadius: 9, cursor: 'pointer' }} />
            {shades.map((color) => (
              <button key={color} type="button" title={color} aria-label={`Copy shade ${color}`} onClick={() => copyText(color, setStatus, color)}
                style={{ backgroundColor: color, minHeight: 38, border: '1px solid var(--line)', borderRadius: 9, cursor: 'pointer' }} />
            ))}
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} reads and mixes colors on your device; screen picking uses the browser&apos;s EyeDropper API and also stays local.</LocalNote>
    </div>
  );
}

/* ---------------------------------- mode 12: colorblind-simulator ---------------------------------- */

function ColorblindSimulator({ tool }) {
  const source = useSourceImage();
  const [status, setStatus] = useState('Upload an image to see it simulated for common color-vision deficiencies.');
  const canvasRefs = useRef([]);

  useEffect(() => {
    if (!source.image) return undefined;
    const capped = cappedSize(source.image.naturalWidth, source.image.naturalHeight, COLORBLIND_MAX);
    const note = capped.scaled ? `Large image scaled to ${capped.width} × ${capped.height}px so the simulation stays responsive.` : '';
    const cells = canvasRefs.current.filter(Boolean);
    cells.forEach((canvas) => {
      canvas.width = capped.width;
      canvas.height = capped.height;
      const context = canvas.getContext('2d');
      context.drawImage(source.image, 0, 0, capped.width, capped.height);
    });
    ['protanopia', 'deuteranopia', 'tritanopia'].forEach((key, index) => {
      const canvas = cells[index + 1];
      if (!canvas) return;
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      canvas.getContext('2d').putImageData(applyColorMatrix(imageData, COLORBLIND_MATRICES[key]), 0, 0);
    });
    setStatus(note ? `Simulations ready. ${note}` : 'Simulations ready — compare each panel below.');
    return undefined;
  }, [source.image]);

  async function downloadCanvas(canvas, label) {
    if (!canvas || !canvas.width) return;
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, `${baseName(source.file)}-${label}.png`);
      setStatus(`Downloading ${label} simulation as PNG.`);
    } catch {
      setStatus('The simulation could not be exported.');
    }
  }

  const panels = [
    { key: 'original', label: 'Original' },
    { key: 'protanopia', label: 'Protanopia' },
    { key: 'deuteranopia', label: 'Deuteranopia' },
    { key: 'tritanopia', label: 'Tritanopia' },
  ];

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Source image</h2>
        <ImageField id="is-cb-file" label="Image file" fileName={source.file?.name} onFile={source.setFile} />
        {source.loadNote && <p className="tool-inline-status" aria-live="polite">{source.loadNote}</p>}
      </section>
      {source.image && (
        <section className="tool-form-section">
          <h2 className="calculator-section-title">Simulations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {panels.map((panel, index) => (
              <div className="tool-form-section" key={panel.key}>
                <p className="tool-inline-status"><strong>{panel.label}</strong></p>
                <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                  <canvas
                    ref={(node) => { canvasRefs.current[index] = node; }}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    aria-label={`${panel.label} view of your image`}
                    role="img"
                  />
                </div>
                <div className="tool-actions">
                  <Button variant="primary" size="small" type="button" onClick={() => downloadCanvas(canvasRefs.current[index], panel.key)}>
                    <Download size={14} aria-hidden="true" /> Download PNG
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="tool-inline-status" aria-live="polite">{status}</p>
      <LocalNote>{tool.name} applies standard linear-RGB simulation matrices (Machado/Brettel style) per pixel — this is a design-check approximation, not a medical test.</LocalNote>
    </div>
  );
}

/* ---------------------------------- entry ---------------------------------- */

export default function ImageStudioTool({ tool }) {
  switch (tool.slug) {
    case 'image-compressor':
      return <ImageCompressor tool={tool} />;
    case 'image-cropper':
      return <ImageCropper tool={tool} />;
    case 'pic-to-png':
    case 'pic-to-jpg':
    case 'pic-to-webp':
    case 'pic-to-gif':
    case 'pic-to-ico':
    case 'pic-to-bmp':
      return <FormatConverter tool={tool} slug={tool.slug} />;
    case 'pic-to-svg':
      return <PicToSvg tool={tool} />;
    case 'code-to-image':
      return <CodeToImage tool={tool} />;
    case 'color-picker':
      return <ColorPicker tool={tool} />;
    case 'colorblind-simulator':
      return <ColorblindSimulator tool={tool} />;
    default:
      return (
        <div className="tool-editor tool-form-stack">
          <p className="tool-inline-status status-warning" aria-live="polite">This image studio mode is not available.</p>
        </div>
      );
  }
}
