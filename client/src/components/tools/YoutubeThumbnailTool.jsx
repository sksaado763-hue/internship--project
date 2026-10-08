import { useState } from 'react';
import { Download, ExternalLink, Youtube } from 'lucide-react';

function getVideoId(value) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (!['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) return '';
    if (url.pathname === '/watch') return url.searchParams.get('v') || '';
    const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
    return match?.[1] || '';
  } catch { return ''; }
}

export default function YoutubeThumbnailTool() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [quality, setQuality] = useState('maxresdefault');
  const [error, setError] = useState('');
  function extract(event) {
    event.preventDefault();
    const id = getVideoId(url);
    setVideoId(id);
    setError(id ? '' : 'Enter a valid YouTube video URL.');
  }
  const imageUrl = videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/${quality}.jpg` : '';

  return <div className="tool-editor tool-form-stack">
    <form className="tool-form-section" onSubmit={extract}>
      <div className="tool-editor-label"><label htmlFor="youtube-url">YouTube video URL</label><span>Video or Shorts link</span></div>
      <div className="input-with-action"><input id="youtube-url" className="tool-value-input" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=…" required /><button className="case-action" type="submit"><Youtube size={15} aria-hidden="true" /> Get thumbnail</button></div>
      {error && <p className="tool-inline-status status-warning" role="alert">{error}</p>}
    </form>
    {videoId && <>
      <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="thumbnail-quality">Thumbnail size</label></div><select id="thumbnail-quality" className="tool-value-input" value={quality} onChange={(event) => setQuality(event.target.value)}><option value="maxresdefault">Maximum resolution</option><option value="sddefault">Standard definition</option><option value="hqdefault">High quality</option><option value="mqdefault">Medium quality</option></select></section>
      <img className="youtube-thumbnail-preview" src={imageUrl} alt="YouTube thumbnail preview" onError={(event) => { if (event.currentTarget.dataset.fallback !== 'true') { event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`; } }} />
      <div className="tool-action-row"><p className="tool-inline-status">Thumbnail availability and resolution depend on the video.</p><div className="tool-actions"><a className="button button--secondary button--small" href={imageUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true" /> Open image</a><a className="button button--primary button--small" href={imageUrl} download={`youtube-${videoId}.jpg`}><Download size={14} aria-hidden="true" /> Download</a></div></div>
    </>}
  </div>;
}
