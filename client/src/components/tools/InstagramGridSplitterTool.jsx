import { useEffect, useState } from 'react';
import { Download, Grid2X2, ImagePlus } from 'lucide-react';
import Button from '../common/Button.jsx';
import { canvasToBlob, createZip, downloadBlob } from '../../utils/browserFiles.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = src;
  });
}

export default function InstagramGridSplitterTool() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [rows, setRows] = useState('3');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Upload a wide image, choose a grid height, and export the tiles.');

  useEffect(() => {
    if (!file) { setUrl(''); return undefined; }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  async function makeTiles() {
    const image = await loadImage(url);
    const columns = 3; const rowCount = Number(rows); const tiles = [];
    for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const left = Math.floor(column * image.naturalWidth / columns);
        const top = Math.floor(row * image.naturalHeight / rowCount);
        const right = Math.floor((column + 1) * image.naturalWidth / columns);
        const bottom = Math.floor((row + 1) * image.naturalHeight / rowCount);
        const canvas = document.createElement('canvas');
        canvas.width = right - left; canvas.height = bottom - top;
        canvas.getContext('2d').drawImage(image, left, top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        tiles.push({ name: `tile-${String(row + 1).padStart(2, '0')}-${String(column + 1).padStart(2, '0')}.png`, blob: await canvasToBlob(canvas) });
      }
    }
    return tiles;
  }

  async function downloadTiles() {
    if (!file || busy) return;
    setBusy(true); setStatus('Cropping your image into tiles…');
    try {
      const tiles = await makeTiles();
      downloadBlob(await createZip(tiles), `instagram-grid-3x${rows}.zip`);
      setStatus(`${tiles.length} PNG tiles are ready in left-to-right, top-to-bottom order.`);
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }

  return <div className="tool-editor tool-form-stack social-media-editor">
    <label className="media-upload" htmlFor="grid-source"><ImagePlus size={21} aria-hidden="true" /><span>{file ? file.name : 'Choose a grid image'}</span><span className="media-upload-button">Browse</span></label><input className="visually-hidden" id="grid-source" type="file" accept="image/*" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setStatus('Image loaded. Choose the grid height and export.'); event.target.value = ''; }} />
    {url && <div className="grid-split-preview">
      <img src={url} alt="Preview of the image with a three-column grid overlay" />
      <div className="grid-split-lines" style={{ backgroundSize: `${100 / 3}% ${100 / Number(rows)}%` }} aria-hidden="true" />
    </div>}
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="grid-height"><span>Grid layout</span><select id="grid-height" className="tool-value-input" value={rows} onChange={(event) => setRows(event.target.value)}>{[1, 2, 3, 4].map((count) => <option value={count} key={count}>3 × {count} · {count * 3} tiles</option>)}</select></label>
      <div className="social-grid-note"><Grid2X2 size={17} aria-hidden="true" /><span>Post tiles in reverse reading order if your profile grid should appear left-to-right.</span></div>
    </div>
    <div className="tool-actions"><Button variant="primary" type="button" disabled={!file || busy} onClick={downloadTiles}><Download size={15} aria-hidden="true" />{busy ? 'Preparing ZIP…' : `Download ${Number(rows) * 3} tiles`}</Button></div>
    <p className="tool-inline-status" aria-live="polite">{status}</p>
    <p className="tool-inline-status">The image is split locally in your browser. Tile PNGs are bundled into one ZIP file.</p>
  </div>;
}
