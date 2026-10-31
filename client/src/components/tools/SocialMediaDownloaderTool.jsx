import { useState, useEffect } from 'react';
import { Download, Play, Film, CheckCircle, AlertCircle, RefreshCw, Sparkles, Music, Terminal } from 'lucide-react';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { downloadBlob } from '../../utils/browserFiles.js';

const platformConfig = {
  'youtube-video-downloader': {
    name: 'YouTube',
    placeholder: 'https://www.youtube.com/watch?v=... or https://youtu.be/...',
    sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#ff0000',
  },
  'instagram-downloader': {
    name: 'Instagram',
    placeholder: 'https://www.instagram.com/reel/... or https://www.instagram.com/p/...',
    sample: 'https://www.instagram.com/reel/Cx0SampleVideo/',
    color: '#e1306c',
  },
  'tiktok-downloader': {
    name: 'TikTok',
    placeholder: 'https://www.tiktok.com/@user/video/...',
    sample: 'https://www.tiktok.com/@nature/video/7234567890123456789',
    color: '#00f2fe',
  },
  'facebook-downloader': {
    name: 'Facebook',
    placeholder: 'https://www.facebook.com/watch/?v=... or reels',
    sample: 'https://www.facebook.com/watch/?v=123456789',
    color: '#1877f2',
  },
  'twitter-downloader': {
    name: 'Twitter / X',
    placeholder: 'https://x.com/user/status/... or twitter.com/...',
    sample: 'https://x.com/NASA/status/1789123456789012345',
    color: '#1da1f2',
  },
  'pinterest-downloader': {
    name: 'Pinterest',
    placeholder: 'https://www.pinterest.com/pin/...',
    sample: 'https://www.pinterest.com/pin/123456789012345678/',
    color: '#bd081c',
  },
};

const formatOptions = [
  { id: 'best[height<=1080]', label: '1080p (Full HD)', ext: 'mp4' },
  { id: 'best[height<=720]', label: '720p (HD)', ext: 'mp4' },
  { id: 'best[height<=480]', label: '480p (SD)', ext: 'mp4' },
  { id: 'best[height<=360]', label: '360p (Fast)', ext: 'mp4' },
  { id: 'bestaudio/best', label: 'Audio Only (MP3)', ext: 'mp3' },
];

export default function SocialMediaDownloaderTool({ tool }) {
  const config = platformConfig[tool.slug] ?? {
    name: 'Social Media',
    placeholder: 'https://... video URL',
    sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#6366f1',
  };

  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('best[height<=720]');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'warning' | 'error'
  const [apiOnline, setApiOnline] = useState(null);
  const [isSampleMode, setIsSampleMode] = useState(false);

  // Poll API backend health every 3 seconds
  useEffect(() => {
    let mounted = true;
    const checkApi = () => {
      fetch('/api/video/', { method: 'GET' })
        .then((res) => res.json())
        .then((data) => {
          if (mounted) setApiOnline(data?.status === 'online');
        })
        .catch(() => {
          if (mounted) setApiOnline(false);
        });
    };

    checkApi();
    const interval = setInterval(checkApi, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function handleSetSample() {
    setUrl(config.sample);
    setIsSampleMode(true);
    setVideoInfo({
      title: `${config.name} Sample Video (Test Demo)`,
      uploader: `@Sample_${config.name}`,
      duration: 120,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      samplePreview: true,
    });
    setStatus(`Sample ${config.name} URL loaded. Click Download Video to test the UI flow.`);
    setStatusType('success');
  }

  async function fetchVideoInfo() {
    if (!url.trim()) {
      setStatus('Please enter a valid video URL first.');
      setStatusType('warning');
      return;
    }

    setLoadingInfo(true);
    setStatus('Analyzing video URL and fetching quality streams…');
    setStatusType('info');

    try {
      const response = await fetch(`/api/video/info?url=${encodeURIComponent(url.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setVideoInfo(data);
        setIsSampleMode(false);
        setStatus(`Video detected: "${data.title || 'Video'}"`);
        setStatusType('success');
        setApiOnline(true);
      } else {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.detail || `API error (${response.status})`);
      }
    } catch (err) {
      if (apiOnline === false) {
        setStatus('⚠️ Downloader service is offline (:8000). Run "npm run dev" or "npm run dev:downloader" in your terminal to enable real video downloads.');
        setStatusType('warning');
        setVideoInfo(null);
      } else {
        setStatus(`Could not inspect video: ${err.message}. Please check that the URL is public.`);
        setStatusType('error');
        setVideoInfo(null);
      }
    } finally {
      setLoadingInfo(false);
    }
  }

  async function handleDownload() {
    if (!url.trim()) {
      setStatus('Please enter a video URL.');
      setStatusType('warning');
      return;
    }

    setDownloading(true);
    setStatus('Extracting and preparing your video file… This may take a few moments for high quality streams.');
    setStatusType('info');

    try {
      const apiUrl = `/api/video/download?url=${encodeURIComponent(url.trim())}&format=${encodeURIComponent(selectedFormat)}`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition');
        let filename = `${config.name.toLowerCase()}-video.mp4`;

        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match?.[1]) filename = match[1];
        }

        downloadBlob(blob, filename);
        setStatus(`✅ Download complete! Saved "${filename}" (${(blob.size / (1024 * 1024)).toFixed(2)} MB).`);
        setStatusType('success');
        setApiOnline(true);
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Downloader service returned ${response.status}`);
      }
    } catch (err) {
      // If sample mode was explicitly requested by user
      if (isSampleMode) {
        generatePlayableSample();
        return;
      }

      // If user provided their own real URL, do NOT give fake media - inform them accurately!
      setStatusType('error');
      if (apiOnline === false) {
        setStatus('⚠️ Downloader backend (:8000) is not running. To download this video, run "npm run dev" in your terminal to start all services.');
      } else {
        setStatus(`Download failed: ${err.message}. Check that the video is public and accessible.`);
      }
    } finally {
      setDownloading(false);
    }
  }

  async function generatePlayableSample() {
    const isAudio = selectedFormat.includes('audio');
    const ext = isAudio ? 'mp3' : 'webm';
    const filename = `${config.name.toLowerCase()}-sample.${ext}`;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(25);
      const mimeType = isAudio ? 'audio/webm' : (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm');
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };

      await new Promise((resolve) => {
        recorder.onstop = () => {
          const playableBlob = new Blob(chunks, { type: mimeType });
          downloadBlob(playableBlob, filename);
          resolve();
        };
        recorder.start();

        let count = 0;
        const interval = setInterval(() => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 640, 360);
          ctx.fillStyle = '#6366f1';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${config.name} Video Sample`, 320, 150);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '18px sans-serif';
          ctx.fillText(`Playable Test Stream · Quality: ${selectedFormat.split('[')[0]}`, 320, 195);
          count++;
          if (count >= 25) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 40);
      });

      setStatus(`Playable test sample "${filename}" downloaded.`);
      setStatusType('success');
    } catch {
      setStatus('Could not generate sample video.');
      setStatusType('error');
    }
  }

  return (
    <div className="tool-editor tool-form-stack social-media-editor">
      {/* API Status Badge & Platform Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge tone="brand">
            <Film size={13} style={{ marginRight: '4px' }} /> {config.name} Downloader
          </Badge>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Direct Video &amp; Audio Stream</span>
        </div>

        <div>
          {apiOnline === true ? (
            <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', background: '#10b98118', padding: '4px 10px', borderRadius: '12px', border: '1px solid #10b98140', fontWeight: 600 }}>
              <CheckCircle size={13} /> Downloader API Active (:8000)
            </span>
          ) : (
            <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', background: '#f59e0b18', padding: '4px 10px', borderRadius: '12px', border: '1px solid #f59e0b40', fontWeight: 600 }}>
              <AlertCircle size={13} /> Downloader Service Offline (:8000)
            </span>
          )}
        </div>
      </div>

      {/* Offline Instructions Alert if API is down */}
      {apiOnline === false && (
        <div style={{ background: '#f59e0b12', border: '1px solid #f59e0b35', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '3px' }}>
            <Terminal size={14} /> To download real videos, start the downloader backend:
          </div>
          <code>npm run dev</code> or in a new terminal: <code>npm run dev:downloader</code>
        </div>
      )}

      {/* URL Input Field */}
      <label className="calculator-field" htmlFor={`${tool.slug}-url`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Enter {config.name} URL</span>
          <button
            type="button"
            onClick={handleSetSample}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--brand)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 4px',
            }}
          >
            <Sparkles size={12} /> Try sample link
          </button>
        </div>
        <div className="calculator-field-control" style={{ marginTop: '6px' }}>
          <input
            id={`${tool.slug}-url`}
            className="tool-value-input"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsSampleMode(false);
              setStatus('');
            }}
            placeholder={config.placeholder}
            autoComplete="url"
            style={{ width: '100%' }}
          />
        </div>
      </label>

      {/* Quality & Format Selection */}
      <div className="calculator-field">
        <span>Select Video Resolution &amp; Format</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
          {formatOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-chip ${selectedFormat === opt.id ? 'is-active' : ''}`}
              style={{
                padding: '8px 12px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              onClick={() => setSelectedFormat(opt.id)}
            >
              {opt.ext === 'mp3' ? <Music size={13} /> : <Film size={13} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="tool-actions" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <Button
          variant="secondary"
          type="button"
          disabled={!url.trim() || loadingInfo}
          onClick={fetchVideoInfo}
        >
          {loadingInfo ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
          {loadingInfo ? 'Inspecting...' : 'Inspect Video Info'}
        </Button>

        <Button
          variant="primary"
          type="button"
          disabled={!url.trim() || downloading}
          onClick={handleDownload}
        >
          {downloading ? <RefreshCw size={14} className="spin" /> : <Download size={14} />}
          {downloading ? 'Downloading...' : 'Download Video'}
        </Button>
      </div>

      {/* Video Preview Card */}
      {videoInfo && (
        <div
          style={{
            background: 'var(--surface-soft)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          {videoInfo.thumbnail && (
            <div style={{ width: '130px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
              <img
                src={videoInfo.thumbnail}
                alt="Video preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>{videoInfo.title}</h4>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              {videoInfo.uploader && <span>👤 {videoInfo.uploader}</span>}
              {videoInfo.duration && <span>⏱️ {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>}
              <span style={{ color: config.color, fontWeight: 600 }}>● {config.name}</span>
            </div>
          </div>
          <Button variant="secondary" type="button" onClick={handleDownload} disabled={downloading}>
            <Download size={13} /> Save Now
          </Button>
        </div>
      )}

      {/* Status Alert Banner */}
      {status && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusType === 'success' ? '#10b98114' : statusType === 'warning' ? '#f59e0b14' : statusType === 'error' ? '#ef444414' : 'var(--surface-soft)',
            border: `1px solid ${statusType === 'success' ? '#10b98140' : statusType === 'warning' ? '#f59e0b40' : statusType === 'error' ? '#ef444440' : 'var(--line)'}`,
            color: statusType === 'success' ? '#10b981' : statusType === 'warning' ? '#f59e0b' : statusType === 'error' ? '#ef4444' : 'inherit',
          }}
        >
          {statusType === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{status}</span>
        </div>
      )}

      {/* Info Notice */}
      <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
        💡 <strong>How it works:</strong> Paste any public video link from {config.name}, choose your preferred resolution or MP3 audio, and click Download.
      </p>
    </div>
  );
}
