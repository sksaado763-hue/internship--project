import { useEffect, useState } from 'react';
import { Download, ImagePlus, Upload } from 'lucide-react';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export default function ImageUpscalerTool() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('Choose an image to enlarge it in your browser.');

  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    setResult('');
    if (!selected) return;
    if (!selected.type.startsWith('image/')) { setFile(null); setMessage('Choose a supported image file.'); return; }
    if (selected.size > MAX_FILE_SIZE) { setFile(null); setMessage('Choose an image smaller than 15 MB.'); return; }
    setFile(selected);
    setMessage(`${selected.name} is ready to enlarge.`);
  }

  async function upscale() {
    if (!file) return;
    setMessage('Resizing image…');
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not create the enlarged image.');
      setResult(URL.createObjectURL(blob));
      setMessage(`Ready: ${canvas.width} × ${canvas.height} pixels. Browser resizing can’t restore details missing from the original.`);
    } catch (error) { setMessage(error.message || 'This image could not be enlarged.'); }
  }

  useEffect(() => () => { if (result) URL.revokeObjectURL(result); }, [result]);

  return <div className="tool-editor tool-form-stack">
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="upscale-file">Image file</label><span>Up to 15 MB</span></div>
      <label className="media-upload" htmlFor="upscale-file"><ImagePlus size={22} aria-hidden="true" /><span>{file ? file.name : 'Choose an image to enlarge'}</span><span className="media-upload-button"><Upload size={14} aria-hidden="true" /> Browse</span></label>
      <input className="visually-hidden" id="upscale-file" type="file" accept="image/*" onChange={chooseFile} />
    </section>
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="upscale-factor">Enlargement</label><span>{scale}×</span></div>
      <select id="upscale-factor" className="tool-value-input" value={scale} onChange={(event) => { setScale(Number(event.target.value)); setResult(''); }}><option value="2">2× size</option><option value="4">4× size</option></select>
    </section>
    {preview && <img className="image-tool-preview" src={preview} alt="Selected image preview" />}
    <div className="tool-action-row"><p className="tool-inline-status" aria-live="polite">{message}</p><div className="tool-actions"><button className="case-action" type="button" disabled={!file} onClick={upscale}>Enlarge image</button>{result && <a className="button button--primary button--small" href={result} download={`upscaled-${file.name.replace(/\.[^.]+$/, '')}.png`}><Download size={14} aria-hidden="true" /> Download PNG</a>}</div></div>
    <aside className="ai-api-reference"><strong>AI upscaling API</strong><p>This clone only resizes pixels in your browser. Neural upscaling needs an external model API; no key is configured here.</p><a href="https://replicate.com/docs/reference/http" target="_blank" rel="noreferrer">Replicate API reference ↗</a></aside>
  </div>;
}
