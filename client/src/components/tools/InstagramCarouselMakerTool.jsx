import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Images } from 'lucide-react';
import Button from '../common/Button.jsx';
import { canvasToBlob, createZip, downloadBlob } from '../../utils/browserFiles.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('One of the selected images could not be opened.'));
    image.src = src;
  });
}

export default function InstagramCarouselMakerTool() {
  const [slides, setSlides] = useState([]);
  const [urls, setUrls] = useState([]);
  const [index, setIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('Select 2–10 images to build a square carousel.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const nextUrls = slides.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);
    return () => nextUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [slides]);

  async function makeSlide(position) {
    const image = await loadImage(urls[position]);
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1080;
    const context = canvas.getContext('2d');
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
    context.drawImage(image, (1080 - width) / 2, (1080 - height) / 2, width, height);
    if (caption.trim()) {
      const gradient = context.createLinearGradient(0, 860, 0, 1080);
      gradient.addColorStop(0, 'transparent'); gradient.addColorStop(1, '#0d1024dd');
      context.fillStyle = gradient; context.fillRect(0, 820, 1080, 260);
      context.fillStyle = '#ffffff'; context.font = '700 46px Arial'; context.textAlign = 'left';
      const words = caption.trim().split(/\s+/); const lines = []; let line = '';
      for (const word of words) { const next = line ? `${line} ${word}` : word; if (context.measureText(next).width > 930 && line) { lines.push(line); line = word; } else line = next; }
      if (line) lines.push(line);
      lines.slice(0, 3).forEach((text, row) => context.fillText(text, 72, 1000 - (Math.min(lines.length, 3) - row - 1) * 56));
      context.font = '600 22px Arial'; context.textAlign = 'right'; context.fillText(`${position + 1} / ${slides.length}`, 1010, 1040);
    }
    return canvasToBlob(canvas);
  }

  async function downloadCurrent() {
    if (!urls.length || busy) return;
    setBusy(true); setStatus('Preparing the slide…');
    try {
      const blob = await makeSlide(index);
      downloadBlob(blob, `instagram-carousel-slide-${String(index + 1).padStart(2, '0')}.png`);
      setStatus(`Slide ${index + 1} downloaded as a 1080 × 1080 PNG.`);
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }

  async function downloadAll() {
    if (!urls.length || busy) return;
    setBusy(true); setStatus('Preparing all carousel slides…');
    try {
      const files = [];
      for (let slide = 0; slide < urls.length; slide += 1) {
        files.push({ name: `slide-${String(slide + 1).padStart(2, '0')}.png`, blob: await makeSlide(slide) });
      }
      downloadBlob(await createZip(files), 'instagram-carousel.zip');
      setStatus(`${slides.length} square slides are ready in the ZIP download.`);
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }

  function chooseFiles(event) {
    const selected = [...event.target.files].filter((file) => file.type.startsWith('image/'));
    const files = selected.slice(0, 10);
    setSlides(files); setIndex(0);
    setStatus(selected.length > 10 ? 'Only the first 10 images were selected.' : files.length < 2 ? 'Select at least 2 images to build a carousel.' : `${files.length} images ready. Arrange and export your slides.`);
    event.target.value = '';
  }

  return <div className="tool-editor tool-form-stack social-media-editor">
    <label className="media-upload" htmlFor="carousel-images"><Images size={21} aria-hidden="true" /><span>{slides.length ? `${slides.length} images selected` : 'Choose 2–10 image files'}</span><span className="media-upload-button">Browse</span></label><input className="visually-hidden" id="carousel-images" type="file" accept="image/*" multiple onChange={chooseFiles} />
    {urls.length > 0 && <>
      <div className="social-image-preview"><img src={urls[index]} alt={`Carousel slide ${index + 1} preview`} /><div className="social-image-counter">{index + 1} / {slides.length}</div></div>
      <div className="social-preview-controls"><Button variant="secondary" size="small" type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}><ArrowLeft size={14} aria-hidden="true" />Previous slide</Button><span>Use images in the order selected</span><Button variant="secondary" size="small" type="button" disabled={index >= slides.length - 1} onClick={() => setIndex((current) => Math.min(slides.length - 1, current + 1))}>Next slide<ArrowRight size={14} aria-hidden="true" /></Button></div>
      <label className="calculator-field" htmlFor="carousel-caption"><span>Optional text overlay · applied to every slide</span><textarea id="carousel-caption" className="tool-textarea" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={100} placeholder="Add a short title or series label" /></label>
      <div className="tool-actions"><Button variant="secondary" type="button" disabled={busy} onClick={downloadCurrent}><Download size={15} aria-hidden="true" />Download this slide</Button><Button variant="primary" type="button" disabled={slides.length < 2 || busy} onClick={downloadAll}><Download size={15} aria-hidden="true" />{busy ? 'Preparing…' : 'Download all slides'}</Button></div>
    </>}
    <p className="tool-inline-status" aria-live="polite">{status}</p>
    <p className="tool-inline-status">Images remain on your device. Exports are square PNGs sized for a standard Instagram carousel post.</p>
  </div>;
}
