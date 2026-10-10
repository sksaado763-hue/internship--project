import { useMemo, useState } from 'react';
import { Download, ExternalLink, Link2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import { downloadBlob } from '../../utils/browserFiles.js';

const mediaExtensions = /\.(?:mp4|m4v|mov|webm|jpg|jpeg|png|webp|gif)$/i;

export default function SocialMediaDownloaderTool({ tool }) {
  const platform = tool.slug === 'tiktok-downloader' ? 'TikTok' : 'Instagram';
  const [url, setUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [sourceFallback, setSourceFallback] = useState(false);
  const [status, setStatus] = useState('Paste a direct link to an image or video file you own or have permission to save.');
  const parsed = useMemo(() => {
    try {
      const candidate = new URL(url.trim());
      if (candidate.protocol !== 'https:' || candidate.username || candidate.password) return null;
      return candidate;
    } catch { return null; }
  }, [url]);
  const isPlatformPost = parsed && (platform === 'Instagram'
    ? /(^|\.)instagram\.com$/i.test(parsed.hostname) && /\/(?:p|reel|reels|stories)\//i.test(parsed.pathname)
    : /(^|\.)tiktok\.com$/i.test(parsed.hostname) && /\/video\//i.test(parsed.pathname));
  const isDirectMedia = parsed && (mediaExtensions.test(parsed.pathname) || /(?:cdninstagram\.com|fbcdn\.net|tiktokcdn\.com|tiktokv\.com|byteoversea\.net)$/i.test(parsed.hostname));
  const isVideo = parsed && /\.(?:mp4|m4v|mov|webm)$/i.test(parsed.pathname);
  const isImage = parsed && /\.(?:jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname);

  function preview() {
    if (!isDirectMedia) { setStatus(isPlatformPost ? 'Platform post pages are not scraped. Paste a direct media-file URL instead.' : 'Enter a valid HTTPS link to a direct media file.'); return; }
    setPreviewUrl(parsed.href);
    setStatus('Preview loaded when the media host allows browser access.');
  }

  async function download() {
    if (!isDirectMedia || busy) return;
    setSourceFallback(false);
    setBusy(true); setStatus('Getting the media file…');
    try {
      const response = await fetch(parsed.href, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`The media host returned ${response.status}.`);
      const contentLength = Number(response.headers.get('content-length'));
      if (Number.isFinite(contentLength) && contentLength > 250 * 1024 * 1024) throw new Error('This file is larger than the 250 MB browser download limit.');
      const blob = await response.blob();
      if (!blob.size) throw new Error('The direct link returned an empty file.');
      if (blob.size > 250 * 1024 * 1024) throw new Error('This file is larger than the 250 MB browser download limit.');
      if (blob.type && !/^(?:image\/|video\/|application\/octet-stream)/i.test(blob.type)) throw new Error('The direct link did not return an image or video file.');
      const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || `${platform.toLowerCase()}-media`)
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120);
      downloadBlob(blob, name.includes('.') ? name : `${name}.media`);
      setStatus(`Download started · ${new Intl.NumberFormat().format(blob.size)} bytes.`);
    } catch (error) {
      if (!(error instanceof TypeError)) { setStatus(error.message || 'The file could not be downloaded.'); return; }
      setSourceFallback(true);
      setStatus('This host blocks direct browser downloads. Open the source media to use the host’s own Save option.');
    } finally { setBusy(false); }
  }

  return <div className="tool-editor tool-form-stack social-media-editor">
    <label className="calculator-field" htmlFor={`${platform.toLowerCase()}-media-url`}><span>Direct media URL</span><div className="calculator-field-control"><input id={`${platform.toLowerCase()}-media-url`} className="tool-value-input" type="url" value={url} onChange={(event) => { setUrl(event.target.value); setPreviewUrl(''); setSourceFallback(false); setStatus('Paste a direct link to an image or video file you own or have permission to save.'); }} placeholder="https://…/video.mp4" autoComplete="url" /></div></label>
    <div className="tool-actions"><Button variant="secondary" type="button" disabled={!isDirectMedia} onClick={preview}><ExternalLink size={15} aria-hidden="true" />Preview media</Button><Button variant="primary" type="button" disabled={!isDirectMedia || busy} onClick={download}><Download size={15} aria-hidden="true" />{busy ? 'Preparing…' : 'Download file'}</Button></div>
    {sourceFallback && isDirectMedia && <a className="button button--secondary button--small social-source-link" href={parsed.href} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} aria-hidden="true" />Open source media</a>}
    {previewUrl && <div className="social-media-preview">{isVideo ? <video src={previewUrl} controls playsInline /> : isImage ? <img src={previewUrl} alt={`${platform} media preview`} /> : <div className="social-media-fallback"><Link2 size={20} /><span>Media preview depends on the file host.</span></div>}</div>}
    <p className="tool-inline-status" aria-live="polite">{status}</p>
    <p className="tool-inline-status">This browser tool does not scrape platform pages, bypass login or privacy settings, or remove watermarks. Direct-link downloads depend on the media host’s CORS and access rules.</p>
  </div>;
}
