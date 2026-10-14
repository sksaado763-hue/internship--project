import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Eraser, FileImage, FileText, ImagePlus, Lock, Minimize2, PenLine, Plus, Printer, Receipt, RotateCw, Scissors, Trash2, Type } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import Button from '../common/Button.jsx';
import { canvasToBlob, createZip, downloadBlob } from '../../utils/browserFiles.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/* shared helpers ------------------------------------------------------------ */

// The npm build of pdf-lib (1.17.x) predates the encrypt() API that only exists
// on the unreleased master branch, so encryption is detected at runtime.
const SUPPORTS_ENCRYPTION = typeof PDFDocument.prototype.encrypt === 'function';

const baseName = (file) => (file?.name || 'document').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_') || 'document';
const formatKb = (bytes) => `${(bytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB`;
const toPdfBlob = (bytes) => new Blob([bytes], { type: 'application/pdf' });
const readBytes = (file) => file.arrayBuffer().then((buffer) => new Uint8Array(buffer));

const FILE_ROW_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, border: '1px solid var(--line)', borderRadius: 11, padding: '9px 12px', background: 'var(--surface-soft)' };

let fileSeq = 0;
const nextId = () => { fileSeq += 1; return `pdf-${Date.now()}-${fileSeq}`; };

function PdfFileField({ id, label, hint, multiple = false, onFiles }) {
  return (
    <label className="calculator-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="tool-value-input"
        type="file"
        accept="application/pdf"
        multiple={multiple}
        onChange={(event) => { onFiles([...event.target.files]); event.target.value = ''; }}
      />
      {hint && <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 500 }}>{hint}</span>}
    </label>
  );
}

function ImageFileField({ id, label, multiple = false, onFiles }) {
  return (
    <label className="calculator-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="tool-value-input"
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => { onFiles([...event.target.files]); event.target.value = ''; }}
      />
    </label>
  );
}

function FileList({ entries, onRemove, emptyText }) {
  if (!entries.length) return <p className="tool-inline-status" aria-live="polite">{emptyText}</p>;
  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {entries.map((entry, index) => (
        <div key={entry.id} style={FILE_ROW_STYLE}>
          <span style={{ fontSize: 11, overflowWrap: 'anywhere' }}>{index + 1}. {entry.file.name} · {formatKb(entry.file.size)}</span>
          <Button variant="secondary" size="small" type="button" onClick={() => onRemove(entry.id)}><Trash2 size={13} aria-hidden="true" /> Remove</Button>
        </div>
      ))}
    </div>
  );
}

function parsePageRanges(input, pageCount) {
  const pages = [];
  for (const part of input.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const from = Number(rangeMatch[1]);
      const to = Number(rangeMatch[2]);
      if (from < 1 || to > pageCount || from > to) return { error: `Range "${trimmed}" is outside this document (it has ${pageCount} page${pageCount === 1 ? '' : 's'}).` };
      for (let page = from; page <= to; page += 1) pages.push(page);
    } else if (/^\d+$/.test(trimmed)) {
      const page = Number(trimmed);
      if (page < 1 || page > pageCount) return { error: `Page ${page} is outside this document (it has ${pageCount} page${pageCount === 1 ? '' : 's'}).` };
      pages.push(page);
    } else {
      return { error: `Could not understand "${trimmed}" — use numbers and dashes like 1-3, 5, 8-9.` };
    }
  }
  if (!pages.length) return { error: 'Enter at least one page or range, e.g. 1-3, 5.' };
  return { pages: [...new Set(pages)] };
}

/* 1 · merge-pdf ------- */

function PdfMergeTool() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('Add two or more PDF files, then merge them in the order shown.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  function addFiles(files) {
    const pdfs = files.filter((file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
    if (!pdfs.length) { setIsError(true); setStatus('Only PDF files can be added to the merge list.'); return; }
    setEntries((current) => [...current, ...pdfs.map((file) => ({ id: nextId(), file }))]);
    setIsError(false);
    setStatus(`Added ${pdfs.length} file${pdfs.length === 1 ? '' : 's'} — they will be merged top to bottom.`);
  }

  async function merge() {
    if (entries.length < 2) { setIsError(true); setStatus('Add at least two PDF files first.'); return; }
    setBusy(true); setIsError(false); setStatus('Merging — copying every page into one document…');
    try {
      const output = await PDFDocument.create();
      let pageTotal = 0;
      for (const entry of entries) {
        const source = await PDFDocument.load(await readBytes(entry.file));
        const copied = await output.copyPages(source, source.getPageIndices());
        copied.forEach((page) => output.addPage(page));
        pageTotal += copied.length;
      }
      const bytes = await output.save();
      downloadBlob(toPdfBlob(bytes), 'merged.pdf');
      setIsError(false);
      setStatus(`Merged ${entries.length} files into one ${pageTotal}-page PDF — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'One of the files could not be read as a PDF, so the merge was aborted. Password-protected PDFs cannot be opened here.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Files to merge (top to bottom)</h2>
      <PdfFileField id="pdf-merge-files" label="Add PDF files" multiple onFiles={addFiles} hint="Tip: re-open the picker to append more files to the list." />
      <FileList entries={entries} onRemove={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))} emptyText="No files added yet — use the picker above to select several PDFs at once, then remove or reorder them with the buttons." />
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || entries.length < 2} onClick={merge}><FileText size={14} aria-hidden="true" /> {busy ? 'Merging…' : 'Merge PDFs'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Every file is read and merged locally in your browser with pdf-lib — your documents are never uploaded anywhere.</p>
  </>;
}

/* 2 · split-pdf ------- */

function PdfSplitTool() {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState('');
  const [status, setStatus] = useState('Choose a PDF, then either extract a page range or split every page into its own file.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function extractRange() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    if (!ranges.trim()) { setIsError(true); setStatus('Enter a page range first, e.g. 1-3, 5, 8-9.'); return; }
    setBusy(true); setIsError(false); setStatus('Extracting the chosen pages…');
    try {
      const source = await PDFDocument.load(await readBytes(file));
      const parsed = parsePageRanges(ranges, source.getPageCount());
      if (parsed.error) { setIsError(true); setStatus(parsed.error); return; }
      const output = await PDFDocument.create();
      const copied = await output.copyPages(source, parsed.pages.map((page) => page - 1));
      copied.forEach((page) => output.addPage(page));
      const bytes = await output.save();
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-pages.pdf`);
      setIsError(false);
      setStatus(`Extracted ${parsed.pages.length} page${parsed.pages.length === 1 ? '' : 's'} into a new PDF — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  async function splitEveryPage() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    setBusy(true); setIsError(false);
    try {
      const source = await PDFDocument.load(await readBytes(file));
      const count = source.getPageCount();
      const parts = [];
      for (let index = 0; index < count; index += 1) {
        setStatus(`Building single-page file ${index + 1} of ${count}…`);
        const single = await PDFDocument.create();
        const [copied] = await single.copyPages(source, [index]);
        single.addPage(copied);
        parts.push({ name: `${baseName(file)}-page-${index + 1}.pdf`, blob: toPdfBlob(await single.save()) });
      }
      const zip = await createZip(parts);
      downloadBlob(zip, `${baseName(file)}-split.zip`);
      setIsError(false);
      setStatus(`Split ${count} page${count === 1 ? '' : 's'} into single-page PDFs zipped together — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF and page ranges</h2>
      <div className="calculator-input-grid">
        <PdfFileField id="pdf-split-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready (${formatKb(files[0].size)}).` : 'Choose a PDF, then either extract a page range or split every page into its own file.'); }} />
        <label className="calculator-field" htmlFor="pdf-split-ranges">
          <span>Pages to extract (1-based)</span>
          <input id="pdf-split-ranges" className="tool-value-input" value={ranges} onChange={(event) => setRanges(event.target.value)} placeholder="1-3, 5, 8-9" />
        </label>
      </div>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" disabled={busy || !file} onClick={splitEveryPage}><Scissors size={14} aria-hidden="true" /> Split every page</Button>
        <Button variant="primary" size="small" type="button" disabled={busy || !file} onClick={extractRange}><Download size={14} aria-hidden="true" /> Extract range</Button>
      </div>
    </div>
    <p className="tool-inline-status">Page numbers are 1-based and refer to the document order. Splitting and extracting run entirely locally in your browser — the file never leaves your device.</p>
  </>;
}

/* 3 · rotate-pdf ------- */

function PdfRotateTool() {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState('90');
  const [status, setStatus] = useState('Choose a PDF and a rotation angle — every page is turned the same way.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function rotate() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    setBusy(true); setIsError(false); setStatus(`Rotating all pages by ${angle}°…`);
    try {
      const doc = await PDFDocument.load(await readBytes(file));
      const turn = Number(angle);
      doc.getPages().forEach((page) => {
        page.setRotation(degrees((page.getRotation().angle + turn) % 360));
      });
      const bytes = await doc.save();
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-rotated.pdf`);
      setIsError(false);
      setStatus(`Rotated ${doc.getPageCount()} page${doc.getPageCount() === 1 ? '' : 's'} by ${turn}° — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF and rotation</h2>
      <div className="calculator-input-grid">
        <PdfFileField id="pdf-rotate-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready.` : 'Choose a PDF and a rotation angle — every page is turned the same way.'); }} />
        <label className="calculator-field" htmlFor="pdf-rotate-angle">
          <span>Rotate all pages</span>
          <select id="pdf-rotate-angle" className="tool-value-input" value={angle} onChange={(event) => setAngle(event.target.value)}>
            <option value="90">90° clockwise</option>
            <option value="180">180° (upside down)</option>
            <option value="270">270° clockwise (90° counter-clockwise)</option>
          </select>
        </label>
      </div>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file} onClick={rotate}><RotateCw size={14} aria-hidden="true" /> {busy ? 'Rotating…' : 'Rotate PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Rotation is written into each page’s rotation flag, so every PDF viewer shows the pages turned. Processed locally in your browser — nothing is uploaded.</p>
  </>;
}

/* 4 · compress-pdf ------- */

function PdfCompressTool() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('Choose a PDF — it is rewritten with compressed object streams and you can compare the sizes.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function compress() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    setBusy(true); setIsError(false); setStatus('Rewriting the PDF with compressed object streams…');
    try {
      const original = await readBytes(file);
      const doc = await PDFDocument.load(original);
      const bytes = await doc.save({ useObjectStreams: true });
      const originalKb = original.byteLength / 1024;
      const newKb = bytes.length / 1024;
      const pct = originalKb > 0 ? Math.round(((originalKb - newKb) / originalKb) * 100) : 0;
      setResult({ originalBytes: original.byteLength, newBytes: bytes.length, pct });
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-compressed.pdf`);
      setIsError(false);
      setStatus(`Compressed copy downloaded — ${formatKb(original.byteLength)} became ${formatKb(bytes.length)} (${pct >= 0 ? pct : 0}% smaller).`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF file</h2>
      <PdfFileField id="pdf-compress-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setResult(null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready (${formatKb(files[0].size)}).` : 'Choose a PDF — it is rewritten with compressed object streams and you can compare the sizes.'); }} />
      {result && <div className="financial-results">
        <div className="financial-result"><span>Original size</span><strong>{formatKb(result.originalBytes)}</strong></div>
        <div className="financial-result"><span>New size</span><strong>{formatKb(result.newBytes)}</strong></div>
        <div className="financial-result"><span>Space saved</span><strong>{result.pct >= 0 ? `${result.pct}%` : `+${Math.abs(result.pct)}% (grew)`}</strong></div>
      </div>}
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file} onClick={compress}><Minimize2 size={14} aria-hidden="true" /> {busy ? 'Compressing…' : 'Compress PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Honest limitation: a browser can only restructure and lightly compress a PDF’s internal object streams — it cannot re-encode the embedded images the way desktop tools (Acrobat, Ghostscript) do, so savings here are usually modest and the file can even grow slightly. Everything runs locally in your browser.</p>
  </>;
}

/* 5 · protect-pdf ------- */

function PdfProtectTool() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState('Choose a PDF and set a password of at least 4 characters.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const passwordsMatch = password.length >= 4 && password === confirmText;

  async function protect() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    if (password.length < 4) { setIsError(true); setStatus('The password must be at least 4 characters long.'); return; }
    if (password !== confirmText) { setIsError(true); setStatus('The two passwords do not match.'); return; }
    if (!SUPPORTS_ENCRYPTION) {
      setIsError(true);
      setStatus('The bundled pdf-lib build does not ship encryption support, so this browser build cannot set a password honestly. Use a desktop tool (PDF24, Acrobat) or print the PDF to a new PDF from your OS viewer instead.');
      return;
    }
    setBusy(true); setIsError(false); setStatus('Encrypting the document…');
    try {
      const doc = await PDFDocument.load(await readBytes(file));
      doc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: 'highResolution', modifying: false, copying: false },
      });
      const bytes = await doc.save({ useObjectStreams: false });
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-protected.pdf`);
      setIsError(false);
      setStatus('Encrypted copy downloaded — opening it will ask for the password; printing stays allowed, editing and copying are blocked.');
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be encrypted.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF and password</h2>
      <div className="calculator-input-grid">
        <PdfFileField id="pdf-protect-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready.` : 'Choose a PDF and set a password of at least 4 characters.'); }} />
        <label className="calculator-field" htmlFor="pdf-protect-pass">
          <span>Password (min 4 characters)</span>
          <input id="pdf-protect-pass" className="tool-value-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label className="calculator-field" htmlFor="pdf-protect-confirm">
          <span>Repeat password</span>
          <input id="pdf-protect-confirm" className="tool-value-input" type="password" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} autoComplete="new-password" />
        </label>
      </div>
      {!SUPPORTS_ENCRYPTION && <p className="tool-inline-status status-warning" aria-live="polite">The pdf-lib version bundled on this site predates its encryption feature, so password protection cannot run in the browser here and this tool will not fake it. Use a desktop tool (PDF24 Creator, Adobe Acrobat) or your OS print-to-PDF to produce a protected copy instead.</p>}
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file || !passwordsMatch} onClick={protect}><Lock size={14} aria-hidden="true" /> {busy ? 'Protecting…' : 'Protect PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Encryption would run locally in your browser — the password never leaves your device. There is no password recovery: if you forget it, the copy is unreadable.</p>
  </>;
}

/* 6 · watermark-pdf ------- */

function PdfWatermarkTool() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [status, setStatus] = useState('Choose a PDF, type the watermark text, and pick a color — it is stamped diagonally on every page.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function applyWatermark() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    if (!text.trim()) { setIsError(true); setStatus('Type the watermark text first.'); return; }
    setBusy(true); setIsError(false); setStatus('Stamping the watermark on every page…');
    try {
      const doc = await PDFDocument.load(await readBytes(file));
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const hex = color.replace('#', '');
      const ink = rgb(parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255);
      const theta = (-45 * Math.PI) / 180;
      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const size = Math.max(24, Math.min(72, width / 9));
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: width / 2 - (textWidth / 2) * Math.cos(theta),
          y: height / 2 - (textWidth / 2) * Math.sin(theta),
          size,
          font,
          color: ink,
          opacity: 0.25,
          rotate: degrees(-45),
        });
      });
      const bytes = await doc.save();
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-watermarked.pdf`);
      setIsError(false);
      setStatus(`Watermarked ${doc.getPageCount()} page${doc.getPageCount() === 1 ? '' : 's'} — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF and watermark</h2>
      <div className="calculator-input-grid">
        <PdfFileField id="pdf-watermark-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready.` : 'Choose a PDF, type the watermark text, and pick a color — it is stamped diagonally on every page.'); }} />
        <label className="calculator-field" htmlFor="pdf-watermark-text">
          <span>Watermark text</span>
          <input id="pdf-watermark-text" className="tool-value-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="CONFIDENTIAL" />
        </label>
        <label className="calculator-field" htmlFor="pdf-watermark-color">
          <span>Color</span>
          <input id="pdf-watermark-color" className="tool-value-input" type="color" value={color} onChange={(event) => setColor(event.target.value)} style={{ padding: 6, minHeight: 44 }} />
        </label>
      </div>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file || !text.trim()} onClick={applyWatermark}><Type size={14} aria-hidden="true" /> {busy ? 'Stamping…' : 'Add watermark'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">The watermark is drawn as diagonal Helvetica Bold text at 25% opacity, centered on every page. Long text is drawn on one line, so keep it short. Processed locally in your browser.</p>
  </>;
}

/* 7 · sign-pdf ------- */

function PdfSignTool() {
  const [file, setFile] = useState(null);
  const [pageNumber, setPageNumber] = useState('1');
  const [status, setStatus] = useState('Draw your signature in the pad, choose a page, then place it at the bottom-right corner.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const dirtyRef = useRef(false);

  function pointerPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startStroke(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    drawingRef.current = true;
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    const point = pointerPosition(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = '#1f2937';
    context.lineWidth = Math.max(2, canvas.width / 320);
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }

  function moveStroke(event) {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext('2d');
    const point = pointerPosition(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    dirtyRef.current = true;
  }

  function endStroke() {
    drawingRef.current = false;
  }

  function clearPad() {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    dirtyRef.current = false;
    setIsError(false);
    setStatus('Pad cleared — draw your signature again.');
  }

  async function applySignature() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    if (!dirtyRef.current) { setIsError(true); setStatus('Draw your signature in the pad first (mouse or touch).'); return; }
    setBusy(true); setIsError(false); setStatus('Embedding the signature image into the PDF…');
    try {
      const doc = await PDFDocument.load(await readBytes(file));
      const target = Math.floor(Number(pageNumber));
      if (!Number.isInteger(target) || target < 1 || target > doc.getPageCount()) {
        setIsError(true);
        setStatus(`Enter a page number between 1 and ${doc.getPageCount()}.`);
        return;
      }
      const canvas = canvasRef.current;
      const blob = await canvasToBlob(canvas, 'image/png');
      const png = await doc.embedPng(await blob.arrayBuffer());
      const page = doc.getPage(target - 1);
      const { width, height } = page.getSize();
      const sigWidth = Math.min(180, width / 3);
      const sigHeight = (canvas.height / canvas.width) * sigWidth;
      page.drawImage(png, { x: width - sigWidth - 36, y: 36, width: sigWidth, height: sigHeight });
      const bytes = await doc.save();
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-signed.pdf`);
      setIsError(false);
      setStatus(`Signature placed on page ${target} — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'The signature could not be embedded.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Signature pad</h2>
      <canvas
        ref={canvasRef}
        width={860}
        height={160}
        onPointerDown={startStroke}
        onPointerMove={moveStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        aria-label="Signature drawing pad"
        role="img"
        style={{ width: '100%', height: 160, border: '1px solid var(--line)', borderRadius: 12, background: '#ffffff', touchAction: 'none', display: 'block' }}
      />
      <div className="calculator-input-grid">
        <PdfFileField id="pdf-sign-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready.` : 'Draw your signature in the pad, choose a page, then place it at the bottom-right corner.'); }} />
        <label className="calculator-field" htmlFor="pdf-sign-page">
          <span>Place on page</span>
          <input id="pdf-sign-page" className="tool-value-input" type="number" min="1" value={pageNumber} onChange={(event) => setPageNumber(event.target.value)} />
        </label>
      </div>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" onClick={clearPad}><Eraser size={14} aria-hidden="true" /> Clear</Button>
        <Button variant="primary" size="small" type="button" disabled={busy || !file} onClick={applySignature}><PenLine size={14} aria-hidden="true" /> {busy ? 'Placing…' : 'Sign PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">This draws your signature as an image overlay at the bottom-right of the chosen page — it is not a cryptographic digital signature and does not prove identity. The file is processed locally in your browser.</p>
  </>;
}

/* 8 · pdf-editor ------- */

function PdfEditorTool() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [status, setStatus] = useState('Choose a PDF to see its pages — then delete, rotate, or reorder them before saving.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) { setPages([]); return undefined; }
    let cancelled = false;
    (async () => {
      try {
        setBusy(true); setIsError(false); setStatus('Rendering page thumbnails…');
        const pdf = await pdfjsLib.getDocument({ data: await readBytes(file) }).promise;
        const thumbs = [];
        for (let index = 1; index <= pdf.numPages; index += 1) {
          setStatus(`Rendering thumbnail ${index} of ${pdf.numPages}…`);
          const page = await pdf.getPage(index);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          thumbs.push({ id: nextId(), thumb: canvas.toDataURL('image/png'), rotation: 0, removed: false });
          page.cleanup();
        }
        if (!cancelled) {
          setPages(thumbs);
          setIsError(false);
          setStatus(`Loaded ${thumbs.length} page${thumbs.length === 1 ? '' : 's'} — a basic page organizer, not a full editor.`);
        }
      } catch (error) {
        if (!cancelled) {
          setPages([]);
          setIsError(true);
          setStatus(error?.message || 'That file could not be read as a PDF.');
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  function rotatePage(index) {
    setPages((current) => current.map((page, i) => (i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page)));
  }

  function toggleRemoved(index) {
    setPages((current) => current.map((page, i) => (i === index ? { ...page, removed: !page.removed } : page)));
  }

  function movePage(index, direction) {
    setPages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function savePdf() {
    const kept = pages.filter((page) => !page.removed);
    if (!file || !kept.length) { setIsError(true); setStatus('There are no pages left to save — restore at least one page.'); return; }
    setBusy(true); setIsError(false); setStatus('Rebuilding the PDF with your changes…');
    try {
      const source = await PDFDocument.load(await readBytes(file));
      const keptEntries = pages.map((page, index) => ({ page, index })).filter(({ page }) => !page.removed);
      const output = await PDFDocument.create();
      const copied = await output.copyPages(source, keptEntries.map(({ index }) => index));
      copied.forEach((page, i) => {
        const rotation = keptEntries[i].page.rotation;
        if (rotation) page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
        output.addPage(page);
      });
      const bytes = await output.save();
      downloadBlob(toPdfBlob(bytes), `${baseName(file)}-edited.pdf`);
      setIsError(false);
      setStatus(`Saved a new ${kept.length}-page PDF (deleted pages are not included) — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'The PDF could not be rebuilt.');
    } finally {
      setBusy(false);
    }
  }

  const keptCount = pages.filter((page) => !page.removed).length;

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Pages</h2>
      <PdfFileField id="pdf-editor-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} selected…` : 'Choose a PDF to see its pages — then delete, rotate, or reorder them before saving.'); }} />
      {pages.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {pages.map((page, index) => (
          <div key={page.id} style={{ display: 'grid', gap: 6, alignContent: 'start', border: '1px solid var(--line)', borderRadius: 11, padding: 8, background: page.removed ? 'transparent' : 'var(--surface-soft)', opacity: page.removed ? 0.55 : 1 }}>
            <img src={page.thumb} alt={`Page ${index + 1} thumbnail`} style={{ width: '100%', height: 'auto', border: '1px solid var(--line)', transform: `rotate(${page.rotation}deg)` }} />
            <span style={{ fontSize: 9, color: 'var(--muted)' }}>Page {index + 1}{page.rotation ? ` · turned ${page.rotation}°` : ''}{page.removed ? ' · deleted' : ''}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <button className="case-action" type="button" onClick={() => toggleRemoved(index)}>{page.removed ? 'Restore' : 'Delete'}</button>
              <button className="case-action" type="button" onClick={() => rotatePage(index)}>Rotate 90</button>
              <button className="case-action" type="button" disabled={index === 0} onClick={() => movePage(index, -1)}><ArrowLeft size={11} aria-hidden="true" /> Left</button>
              <button className="case-action" type="button" disabled={index === pages.length - 1} onClick={() => movePage(index, 1)}>Right <ArrowRight size={11} aria-hidden="true" /></button>
            </div>
          </div>
        ))}
      </div>}
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file || !keptCount} onClick={savePdf}><Download size={14} aria-hidden="true" /> {busy ? 'Working…' : 'Save PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">A basic page organizer: it deletes, rotates, and reorders whole pages, but cannot edit text or images inside a page. Thumbnails render and the rebuild runs locally in your browser.</p>
  </>;
}

/* 9 · image-to-pdf ------- */

function ImageToPdfTool() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('Add one or more images — each becomes one A4 page, fitted without enlargement.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  function addFiles(files) {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (!images.length) { setIsError(true); setStatus('Only image files can be added.'); return; }
    setEntries((current) => [...current, ...images.map((file) => ({ id: nextId(), file }))]);
    setIsError(false);
    setStatus(`Added ${images.length} image${images.length === 1 ? '' : 's'}.`);
  }

  async function buildPdf() {
    if (!entries.length) { setIsError(true); setStatus('Add at least one image first.'); return; }
    setBusy(true); setIsError(false);
    try {
      const doc = await PDFDocument.create();
      const A4W = 595.28; const A4H = 841.89; const MARGIN = 28;
      let used = 0;
      const skipped = [];
      for (const entry of entries) {
        setStatus(`Placing image ${used + skipped.length + 1} of ${entries.length}…`);
        try {
          let image;
          if (entry.file.type === 'image/png') {
            image = await doc.embedPng(await readBytes(entry.file));
          } else if (entry.file.type === 'image/jpeg') {
            image = await doc.embedJpg(await readBytes(entry.file));
          } else {
            const bitmap = await createImageBitmap(entry.file);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext('2d').drawImage(bitmap, 0, 0);
            bitmap.close();
            image = await doc.embedPng(await (await canvasToBlob(canvas, 'image/png')).arrayBuffer());
          }
          const page = doc.addPage([A4W, A4H]);
          const scale = Math.min((A4W - MARGIN * 2) / image.width, (A4H - MARGIN * 2) / image.height, 1);
          const width = image.width * scale;
          const height = image.height * scale;
          page.drawImage(image, { x: (A4W - width) / 2, y: (A4H - height) / 2, width, height });
          used += 1;
        } catch {
          skipped.push(entry.file.name);
        }
      }
      if (!used) throw new Error('None of the selected images could be read.');
      const bytes = await doc.save();
      downloadBlob(toPdfBlob(bytes), 'images.pdf');
      setIsError(false);
      setStatus(`Created images.pdf with ${used} page${used === 1 ? '' : 's'}${skipped.length ? ` — skipped: ${skipped.join(', ')}` : ''} — download started.`);
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'The PDF could not be built from those images.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Images (one A4 page each)</h2>
      <ImageFileField id="pdf-img2pdf-files" label="Add images" multiple onFiles={addFiles} />
      <FileList entries={entries} onRemove={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))} emptyText="No images added yet — pick one or more images with the file input above." />
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !entries.length} onClick={buildPdf}><ImagePlus size={14} aria-hidden="true" /> {busy ? 'Building…' : 'Create PDF'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">PNG and JPEG bytes are embedded directly; other image formats (WebP, GIF, BMP…) are drawn through a canvas first. Everything is assembled locally in your browser.</p>
  </>;
}

/* 10 · pdf-to-image ------- */

function PdfToImageTool() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Choose a PDF — every page is rendered to a PNG at 1.6× zoom.');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function convert() {
    if (!file) { setIsError(true); setStatus('Choose a PDF file first.'); return; }
    setBusy(true); setIsError(false);
    try {
      const pdf = await pdfjsLib.getDocument({ data: await readBytes(file) }).promise;
      const parts = [];
      for (let index = 1; index <= pdf.numPages; index += 1) {
        setStatus(`Rendering page ${index} of ${pdf.numPages}…`);
        const page = await pdf.getPage(index);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const blob = await canvasToBlob(canvas, 'image/png');
        parts.push({ name: `${baseName(file)}-page-${index}.png`, blob });
        page.cleanup();
      }
      if (parts.length === 1) {
        downloadBlob(parts[0].blob, parts[0].name);
        setIsError(false);
        setStatus('Rendered 1 page as a PNG — download started.');
      } else {
        const zip = await createZip(parts);
        downloadBlob(zip, `${baseName(file)}-pages.zip`);
        setIsError(false);
        setStatus(`Rendered ${parts.length} pages as PNGs zipped together — download started.`);
      }
    } catch (error) {
      setIsError(true);
      setStatus(error?.message || 'That file could not be read as a PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">PDF file</h2>
      <PdfFileField id="pdf-pdf2img-file" label="PDF file" onFiles={(files) => { setFile(files[0] ?? null); setIsError(false); setStatus(files[0] ? `${files[0].name} ready.` : 'Choose a PDF — every page is rendered to a PNG at 1.6× zoom.'); }} />
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" disabled={busy || !file} onClick={convert}><FileImage size={14} aria-hidden="true" /> {busy ? 'Rendering…' : 'Convert to PNG'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Pages are rasterized with pdf.js at 1.6× zoom (~115 DPI) and exported as PNG — quality is lower than a desktop converter. A one-page PDF downloads a single PNG; multi-page PDFs download a zip. Rendered locally in your browser.</p>
  </>;
}

/* 11 · invoice-generator ------- */

const INVOICE_CURRENCIES = ['$', '€', '£', '₹'];
const MAX_ITEMS = 8;
let invoiceItemSeq = 1;
const newItem = () => ({ id: `inv-item-${invoiceItemSeq++}`, description: '', quantity: '1', price: '0' });

function buildInvoicePdf(data) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = 595.28; const M = 48; const RIGHT = W - M;
  const money = (value) => `${data.currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  let y = M + 8;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor(24, 24, 27);
  doc.text(data.businessName || 'Your business name', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 106, 120);
  if (data.contact.trim()) { y += 15; doc.text(data.contact.trim(), M, y); }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(24, 24, 27);
  doc.text(`Invoice ${data.invoiceNumber || '—'}`, RIGHT, M + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 106, 120);
  const issued = data.issueDate ? new Date(`${data.issueDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set';
  doc.text(`Issued: ${issued}`, RIGHT, M + 24, { align: 'right' });

  y += 32;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(24, 24, 27);
  doc.text('Bill to', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 66, 80);
  y += 14;
  doc.text(data.clientName.trim() || '—', M, y);

  y += 24;
  const xQty = 330; const xUnit = 430; const xAmount = RIGHT - 6;
  doc.setFillColor(244, 245, 247);
  doc.rect(M, y - 11, W - M * 2, 18, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 106, 120);
  doc.text('DESCRIPTION', M + 6, y + 2);
  doc.text('QTY', xQty, y + 2, { align: 'right' });
  doc.text('UNIT PRICE', xUnit, y + 2, { align: 'right' });
  doc.text('AMOUNT', xAmount, y + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(40, 46, 60);
  data.rows.forEach((row) => {
    if (!row.description.trim() && row.qty === 0 && row.unit === 0) return;
    if (y > 760) { doc.addPage(); y = M; }
    y += 15;
    const lines = doc.splitTextToSize(row.description.trim() || 'Item', 250).slice(0, 2);
    doc.text(lines, M + 6, y);
    doc.text(String(row.qty), xQty, y, { align: 'right' });
    doc.text(money(row.unit), xUnit, y, { align: 'right' });
    doc.text(money(row.qty * row.unit), xAmount, y, { align: 'right' });
    y += (lines.length - 1) * 11;
  });

  y += 12;
  doc.setDrawColor(210, 214, 222);
  doc.line(xQty - 20, y, RIGHT, y);
  y += 15;
  doc.setFontSize(9.5); doc.setTextColor(100, 106, 120);
  doc.text('Subtotal', xQty, y, { align: 'right' });
  doc.text(money(data.subtotal), xAmount, y, { align: 'right' });
  y += 14;
  doc.text(`Tax (${data.rate}%)`, xQty, y, { align: 'right' });
  doc.text(money(data.tax), xAmount, y, { align: 'right' });
  y += 17;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(24, 24, 27);
  doc.text('Total', xQty, y, { align: 'right' });
  doc.text(money(data.total), xAmount, y, { align: 'right' });

  if (data.notes.trim()) {
    y += 34;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(24, 24, 27);
    doc.text('Notes', M, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 86, 100);
    doc.text(doc.splitTextToSize(data.notes.trim(), W - M * 2), M, y + 13);
  }
  return doc;
}

function InvoiceGeneratorTool() {
  const [businessName, setBusinessName] = useState('');
  const [contact, setContact] = useState('');
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState('$');
  const [items, setItems] = useState(() => [newItem()]);
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Fill in the details — the preview and the PDF update from the same fields.');
  const [isError, setIsError] = useState(false);

  const totals = useMemo(() => {
    const rows = items.map((item) => ({
      description: item.description,
      qty: Math.max(0, Number(item.quantity) || 0),
      unit: Math.max(0, Number(item.price) || 0),
    }));
    const subtotal = rows.reduce((sum, row) => sum + row.qty * row.unit, 0);
    const rate = Math.max(0, Number(taxRate) || 0);
    const tax = (subtotal * rate) / 100;
    return { rows, subtotal, rate, tax, total: subtotal + tax };
  }, [items, taxRate]);

  const money = (value) => `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function updateItem(id, field, value) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((current) => (current.length >= MAX_ITEMS ? current : [...current, newItem()]));
  }

  function removeItem(id) {
    setItems((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)));
  }

  function downloadPdf() {
    if (!businessName.trim()) { setIsError(true); setStatus('Add your business name first — it appears in the invoice header.'); return; }
    if (!clientName.trim()) { setIsError(true); setStatus('Add the client name — the bill-to block cannot be empty.'); return; }
    const doc = buildInvoicePdf({
      businessName, contact, clientName, invoiceNumber, issueDate, currency,
      rows: totals.rows, subtotal: totals.subtotal, rate: totals.rate, tax: totals.tax, total: totals.total, notes,
    });
    downloadBlob(doc.output('blob'), `invoice-${(invoiceNumber.trim() || '001').replace(/[^\w.-]+/g, '_')}.pdf`);
    setIsError(false);
    setStatus(`Invoice ${invoiceNumber.trim() || '—'} downloaded as a PDF.`);
  }

  function printInvoice() {
    window.print();
    setIsError(false);
    setStatus('Opened the browser print dialog — choose “Save as PDF” as the destination to keep a copy.');
  }

  const shownRows = totals.rows.filter((row) => row.description.trim() || row.qty !== 0 || row.unit !== 0);

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Invoice details</h2>
      <div className="calculator-input-grid">
        <label className="calculator-field" htmlFor="inv-business"><span>Your business name</span><input id="inv-business" className="tool-value-input" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Acme Studio" /></label>
        <label className="calculator-field" htmlFor="inv-contact"><span>Your email / phone (optional)</span><input id="inv-contact" className="tool-value-input" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="billing@acme.co · +1 555 010 2244" /></label>
        <label className="calculator-field" htmlFor="inv-client"><span>Client name</span><input id="inv-client" className="tool-value-input" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Globex Ltd." /></label>
        <label className="calculator-field" htmlFor="inv-number"><span>Invoice number</span><input id="inv-number" className="tool-value-input" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="INV-001" /></label>
        <label className="calculator-field" htmlFor="inv-date"><span>Issue date</span><input id="inv-date" className="tool-value-input" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="inv-currency"><span>Currency</span>
          <select id="inv-currency" className="tool-value-input" value={currency} onChange={(event) => setCurrency(event.target.value)}>
            {INVOICE_CURRENCIES.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
          </select>
        </label>
      </div>
    </section>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Line items (up to {MAX_ITEMS})</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((item, index) => (
          <div key={item.id} className="calculator-input-grid" style={{ gridTemplateColumns: '2fr 0.7fr 1fr auto', alignItems: 'end' }}>
            <label className="calculator-field" htmlFor={`${item.id}-desc`}><span>Description {index + 1}</span><input id={`${item.id}-desc`} className="tool-value-input" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Design work — March" /></label>
            <label className="calculator-field" htmlFor={`${item.id}-qty`}><span>Qty</span><input id={`${item.id}-qty`} className="tool-value-input" type="number" min="0" step="any" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} /></label>
            <label className="calculator-field" htmlFor={`${item.id}-price`}><span>Unit price</span><input id={`${item.id}-price`} className="tool-value-input" type="number" min="0" step="any" value={item.price} onChange={(event) => updateItem(item.id, 'price', event.target.value)} /></label>
            <Button variant="secondary" size="small" type="button" disabled={items.length <= 1} onClick={() => removeItem(item.id)}><Trash2 size={13} aria-hidden="true" /></Button>
          </div>
        ))}
      </div>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" disabled={items.length >= MAX_ITEMS} onClick={addItem}><Plus size={14} aria-hidden="true" /> Add item</Button>
      </div>
      <div className="calculator-input-grid">
        <label className="calculator-field" htmlFor="inv-tax"><span>Tax rate (%)</span><input id="inv-tax" className="tool-value-input" type="number" min="0" step="any" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} /></label>
        <label className="calculator-field" htmlFor="inv-notes"><span>Notes (optional)</span><input id="inv-notes" className="tool-value-input" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Payment due within 14 days." /></label>
      </div>
    </section>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Live preview</h2>
      <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 20, background: '#ffffff', color: '#111827', display: 'grid', gap: 14, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{businessName.trim() || 'Your business name'}</div>
            {contact.trim() && <div style={{ color: '#5b6472', fontSize: 11, marginTop: 3 }}>{contact.trim()}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>Invoice {invoiceNumber.trim() || '—'}</div>
            <div style={{ color: '#5b6472', fontSize: 11, marginTop: 3 }}>Issued: {issueDate ? new Date(`${issueDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#5b6472' }}>BILL TO</div>
          <div style={{ marginTop: 2 }}>{clientName.trim() || '—'}</div>
        </div>
        {shownRows.length > 0 && <div className="financial-table-wrap">
          <table className="financial-table">
            <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
            <tbody>{shownRows.map((row, index) => <tr key={index}><td>{row.description.trim() || 'Item'}</td><td>{row.qty}</td><td>{money(row.unit)}</td><td>{money(row.qty * row.unit)}</td></tr>)}</tbody>
          </table>
        </div>}
        <div style={{ display: 'grid', gap: 4, justifyItems: 'end', fontSize: 11 }}>
          <span>Subtotal: <strong>{money(totals.subtotal)}</strong></span>
          <span>Tax ({totals.rate}%): <strong>{money(totals.tax)}</strong></span>
          <span style={{ fontSize: 14 }}>Total: <strong>{money(totals.total)}</strong></span>
        </div>
        {notes.trim() && <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#5b6472' }}>NOTES</div>
          <div style={{ marginTop: 2, color: '#3c4250' }}>{notes.trim()}</div>
        </div>}
      </div>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{status}</p>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" onClick={printInvoice}><Printer size={14} aria-hidden="true" /> Print</Button>
        <Button variant="primary" size="small" type="button" onClick={downloadPdf}><Receipt size={14} aria-hidden="true" /> Download PDF</Button>
      </div>
    </div>
    <p className="tool-inline-status">The PDF is drawn field-by-field on A4 with jsPDF and everything runs locally in your browser — no invoice data is sent anywhere. Print uses the standard browser print dialog.</p>
  </>;
}

/* 12 · Office ↔ PDF honest fallback ------- */

function OfficeFormatNotice({ from, to }) {
  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Honest answer: {from} to {to} cannot run in a browser</h2>
      <p className="tool-inline-status">Faithful Office ↔ PDF conversion needs a real document engine (such as LibreOffice) that understands the layout rules of Word, Excel, or PowerPoint files, and that engine cannot run inside a browser tab. This tool does not fake it with a partial converter that would mangle your document.</p>
      <p className="tool-inline-status">The reliable route is already built into the apps: Microsoft Office and Google Docs both offer “Export as PDF” / “Save as PDF”, and Word, Excel, and PowerPoint can open a PDF and save it back to their own format with best-effort reflow.</p>
      <p className="tool-inline-status">For batch or offline conversion, use a free desktop converter such as LibreOffice — the same engine most server-side converters run anyway.</p>
    </section>
    <p className="tool-inline-status status-warning" aria-live="polite">Nothing was converted and nothing was uploaded — this page only explains the limitation. Every working tool on HavitGrowth runs fully client-side in your browser.</p>
  </>;
}

/* switch -------------------------------------------------------------------- */

export default function PdfStudioTool({ tool }) {
  let content;
  switch (tool.slug) {
    case 'merge-pdf':
    case 'pdf-merger':
      content = <PdfMergeTool />;
      break;
    case 'split-pdf':
    case 'pdf-splitter':
      content = <PdfSplitTool />;
      break;
    case 'rotate-pdf':
    case 'pdf-rotator':
      content = <PdfRotateTool />;
      break;
    case 'compress-pdf':
    case 'pdf-compressor':
      content = <PdfCompressTool />;
      break;
    case 'protect-pdf':
      content = <PdfProtectTool />;
      break;
    case 'watermark-pdf':
      content = <PdfWatermarkTool />;
      break;
    case 'sign-pdf':
    case 'pdf-signature':
      content = <PdfSignTool />;
      break;
    case 'pdf-editor':
      content = <PdfEditorTool />;
      break;
    case 'image-to-pdf':
    case 'jpg-to-pdf':
    case 'pic-to-pdf':
      content = <ImageToPdfTool />;
      break;
    case 'pdf-to-image':
    case 'pdf-to-jpg':
      content = <PdfToImageTool />;
      break;
    case 'invoice-generator':
      content = <InvoiceGeneratorTool />;
      break;
    case 'docx-to-pdf':
    case 'word-to-pdf':
      content = <OfficeFormatNotice from="Word (.docx)" to="PDF" />;
      break;
    case 'pdf-to-docx':
    case 'pdf-to-word':
      content = <OfficeFormatNotice from="PDF" to="Word (.docx)" />;
      break;
    case 'pdf-to-excel':
    case 'pdf-to-xlsx':
      content = <OfficeFormatNotice from="PDF" to="Excel (.xlsx)" />;
      break;
    case 'pdf-to-powerpoint':
    case 'pdf-to-pptx':
      content = <OfficeFormatNotice from="PDF" to="PowerPoint (.pptx)" />;
      break;
    default:
      content = <p className="tool-inline-status">This tool is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack">{content}</div>;
}
