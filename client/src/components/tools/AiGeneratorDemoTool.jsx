import { useEffect, useRef, useState } from 'react';
import { Copy, Mic, MicOff, Volume2 } from 'lucide-react';

const API_REFERENCES = {
  'ai-background-remover': ['remove.bg API documentation', 'https://www.remove.bg/a/api-docs'],
  'ai-content-detector': ['GPTZero detection API', 'https://gptzero.me/developers'],
  'ai-email-writer': ['OpenAI text generation API', 'https://platform.openai.com/docs/guides/text'],
  'ai-text-humanizer': ['OpenAI text generation API', 'https://platform.openai.com/docs/guides/text'],
  'ai-image-generator': ['OpenAI image generation API', 'https://platform.openai.com/docs/guides/image-generation'],
  'ai-voiceover-studio': ['ElevenLabs text-to-speech API', 'https://elevenlabs.io/docs/api-reference/text-to-speech/convert'],
  'ai-video-caption-generator': ['OpenAI audio transcription API', 'https://platform.openai.com/docs/guides/speech-to-text'],
  'qr-code-generator': ['QR Server API documentation', 'https://goqr.me/api/'],
  'voice-changer': ['ElevenLabs API reference', 'https://elevenlabs.io/docs/api-reference/introduction'],
};

const titleCase = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());
const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function makeOutput(tool, source) {
  const topic = source.trim();
  const tags = topic.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2).slice(0, 8);
  switch (tool.slug) {
    case 'ai-email-writer':
      return `Subject: Following up on ${topic.slice(0, 55)}\n\nHello,\n\nI’m reaching out about ${topic}. I’d be glad to share more details and discuss the next steps at a time that works for you.\n\nPlease let me know if you have any questions.\n\nBest,\n[Your name]`;
    case 'ai-text-humanizer':
      return topic.replace(/\butilize\b/gi, 'use').replace(/\bin order to\b/gi, 'to').replace(/\badditionally\b/gi, 'also').replace(/\bmoreover\b/gi, 'also');
    case 'instagram-caption-generator':
      return `${topic}\n\nA little more about ${topic.toLowerCase()}—save this for later and share it with someone who would enjoy it.\n\n${tags.slice(0, 5).map((tag) => `#${tag}`).join(' ')}`;
    case 'youtube-name-generator':
      return [`${titleCase(topic)} Studio`, `The ${titleCase(topic)} Edit`, `${titleCase(topic)} Explained`, `Simply ${titleCase(topic)}`, `${titleCase(topic)} Lab`].join('\n');
    case 'youtube-title-generator':
      return [`A practical guide to ${topic}`, `What I learned about ${topic}`, `${titleCase(topic)}: the basics explained`, `5 things to know about ${topic}`, `Is ${topic} worth it?`].join('\n');
    case 'youtube-hashtag-generator':
      return [...new Set([slugify(topic).replaceAll('-', ''), ...tags, 'youtube', 'creator'])].map((tag) => tool.slug === 'youtube-hashtag-generator' ? `#${tag}` : tag).join(tool.slug === 'youtube-tags-generator' ? ', ' : ' ');
    case 'youtube-hook-generator':
      return [`“Before you try ${topic}, there are a few things you should know.”`, `“Here’s the part about ${topic} that most people miss.”`, `“I spent time looking into ${topic}; this is what stood out.”`].join('\n\n');
    case 'youtube-script-generator':
      return `HOOK\nIntroduce a question or surprising fact about ${topic}.\n\nINTRO\nExplain who this video is for and what viewers will learn.\n\nMAIN POINTS\n1. Define the topic and give useful context.\n2. Share a clear example or demonstration.\n3. Summarize practical takeaways.\n\nCLOSE\nRecap the key idea and invite viewers to comment.`;
    case 'seo-meta-generator': {
      const description = `Learn about ${topic} with this practical overview and useful resources.`;
      return `<title>${titleCase(topic).slice(0, 60)}</title>\n<meta name="description" content="${description.slice(0, 155)}">\n<meta property="og:title" content="${titleCase(topic).slice(0, 60)}">\n<meta property="og:description" content="${description.slice(0, 155)}">`;
    }
    case 'sitemap-generator':
      return topic.split(/\s+/).filter(Boolean).map((url) => `  <url><loc>${url.startsWith('http') ? url : `https://${url}`}</loc></url>`).join('\n');
    case 'svg-shape-generator':
      return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  <path fill="#8b5cf6" d="M60 160 C40 65 140 35 205 65 C290 20 365 105 330 175 C355 245 260 280 190 245 C105 280 45 235 60 160Z"/>\n</svg>`;
    case 'favicon-generator':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#7c3aed"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">${[...topic][0] || 'A'}</text></svg>`;
    case 'glassmorphism-generator':
      return `background: rgba(255, 255, 255, 0.18);\nbackdrop-filter: blur(16px);\n-webkit-backdrop-filter: blur(16px);\nborder: 1px solid rgba(255, 255, 255, 0.3);\nborder-radius: 20px;\nbox-shadow: 0 8px 32px rgba(31, 38, 135, 0.18);`;
    case 'random-number-generator': {
      const [minText, maxText, countText] = topic.split(/[\s,]+/);
      const min = Number(minText) || 1;
      const max = Number(maxText) || 100;
      const count = Math.min(50, Math.max(1, Number(countText) || 10));
      if (max < min) return 'Maximum must be greater than or equal to minimum.';
      return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min).join(', ');
    }
    case 'unicode-font-generator': {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return [...topic].map((letter) => {
        const index = alphabet.indexOf(letter);
        if (index < 0) return letter;
        const code = letter === letter.toUpperCase() ? 0x1d400 + index : 0x1d41a + index;
        return String.fromCodePoint(code);
      }).join('');
    }
    case 'meme-generator':
      return 'Meme preview created locally. Download the PNG below.';
    case 'ai-content-detector':
      return 'This local demo cannot reliably identify AI-written text. AI detectors can produce false positives and should not be treated as proof of authorship. Connect a provider API to request a model-based estimate.';
    case 'ai-background-remover':
    case 'ai-image-generator':
    case 'ai-voiceover-studio':
    case 'ai-video-caption-generator':
    case 'voice-changer':
      return `${tool.name} needs a model or media-processing service for this operation. The local demo does not upload or transform your media. See the API reference below to connect a provider.`;
    default:
      return `# ${titleCase(topic)}\n\nAdd your content here, refine it, and connect an API provider when you need model-generated results.`;
  }
}

export default function AiGeneratorDemoTool({ tool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [memeDownloadUrl, setMemeDownloadUrl] = useState('');
  const memeCanvas = useRef(null);
  const api = API_REFERENCES[tool.slug];
  const qrUrl = tool.slug === 'qr-code-generator' && output && input.trim() ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(input.trim())}` : '';
  const outputFileUrl = output && ['favicon-generator', 'svg-shape-generator'].includes(tool.slug)
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`
    : '';
  useEffect(() => {
    if (tool.slug !== 'meme-generator' || !output || !memeCanvas.current) return;
    const canvas = memeCanvas.current;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6641cb');
    gradient.addColorStop(1, '#e26a9a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '800 36px Arial';
    context.lineWidth = 4;
    context.strokeStyle = '#292039';
    context.fillStyle = '#fff';
    context.strokeText(input.toUpperCase(), canvas.width / 2, canvas.height / 2, 460);
    context.fillText(input.toUpperCase(), canvas.width / 2, canvas.height / 2, 460);
    setMemeDownloadUrl(canvas.toDataURL('image/png'));
  }, [input, output, tool.slug]);

  function generate(event) {
    event.preventDefault();
    if (!input.trim()) { setMessage('Add a topic or text first.'); return; }
    setOutput(makeOutput(tool, input));
    setMessage('Created locally with a simple template. This is not an AI model response.');
  }

  async function copyOutput() {
    try { await navigator.clipboard.writeText(output); setMessage('Copied to clipboard.'); }
    catch { setMessage('Clipboard access is unavailable in this browser.'); }
  }

  function speak() {
    if (!('speechSynthesis' in window)) { setMessage('Speech synthesis is not available in this browser.'); return; }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(input));
    setMessage('Playing a browser-generated voice preview.');
  }

  function dictate() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setMessage('Speech recognition is not supported by this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.onresult = (event) => setInput((current) => `${current}${current ? ' ' : ''}${[...event.results].map((result) => result[0].transcript).join(' ')}`);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setMessage('Speech recognition could not start.'); };
    recognition.start();
    setListening(true);
    setMessage('Listening…');
  }

  return <div className="tool-editor tool-form-stack">
    <div className="ai-demo-notice"><strong>Local demo</strong><span>Template-based features run in your browser. Real AI generation is not connected.</span></div>
    <form className="tool-form-stack" onSubmit={generate}>
      <section className="tool-form-section">
        <div className="tool-editor-label"><label htmlFor="ai-demo-input">{tool.slug === 'sitemap-generator' ? 'Website URLs (one per line)' : tool.slug.includes('youtube') || tool.slug.includes('generator') ? 'Topic or content' : 'Text or topic'}</label><span>{input.length} characters</span></div>
        <textarea id="ai-demo-input" className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter a topic or paste your text…" maxLength={6000} />
      </section>
      <div className="tool-action-row"><p className="tool-inline-status" aria-live="polite">{message || 'Your input stays in this browser unless you choose an API provider.'}</p><div className="tool-actions">
        {tool.slug === 'ai-voice-typing' && <button className="case-action" type="button" onClick={dictate}>{listening ? <MicOff size={14} /> : <Mic size={14} />}{listening ? 'Listening…' : 'Start dictation'}</button>}
        {tool.slug === 'ai-voiceover-studio' && <button className="case-action" type="button" disabled={!input.trim()} onClick={speak}><Volume2 size={14} />Preview voice</button>}
        {!['ai-voice-typing', 'ai-voiceover-studio'].includes(tool.slug) && <button className="case-action" type="submit">{['random-number-generator', 'glassmorphism-generator', 'favicon-generator', 'svg-shape-generator', 'seo-meta-generator', 'sitemap-generator', 'unicode-font-generator'].includes(tool.slug) ? 'Create locally' : 'Generate demo'}</button>}
      </div></div>
    </form>
    {output && <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="ai-demo-output">Demo result</label><button className="case-action" type="button" onClick={copyOutput}><Copy size={14} />Copy</button></div><textarea id="ai-demo-output" className="tool-textarea ai-demo-output" readOnly value={output} /></section>}
    {outputFileUrl && <div className="tool-action-row"><p className="tool-inline-status">SVG icon file created from your input.</p><a className="button button--primary button--small" href={outputFileUrl} download={tool.slug === 'favicon-generator' ? 'favicon.svg' : 'shape.svg'}>Download SVG</a></div>}
    {tool.slug === 'meme-generator' && output && <div className="meme-demo-result"><canvas ref={memeCanvas} width="500" height="300" aria-label="Generated meme preview" /><a className="button button--primary button--small" href={memeDownloadUrl} download="meme.png">Download meme PNG</a></div>}
    {tool.slug === 'glassmorphism-generator' && output && <div className="glass-demo-preview"><div style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.45)', borderRadius: 20, padding: 26, boxShadow: '0 8px 32px rgba(31,38,135,.2)' }}>Glass card preview<br /><small>Adjust the copied CSS to customize</small></div></div>}
    {qrUrl && <section className="qr-demo-result"><p>This free preview uses an external QR service; the text you enter is sent to QR Server.</p><img src={qrUrl} width="260" height="260" alt="QR code preview for the entered text" /><a href={qrUrl} target="_blank" rel="noreferrer">Open QR image</a></section>}
    {tool.slug === 'ai-voice-typing' && <p className="tool-inline-status">Browser speech recognition availability and data handling vary by browser. Check its privacy behavior before dictating sensitive information.</p>}
    {api && <aside className="ai-api-reference"><strong>{tool.slug === 'qr-code-generator' ? 'QR image service' : 'Provider connection'}</strong><p>{tool.slug === 'qr-code-generator' ? 'QR creation is handled by the linked free API, which receives the text above.' : 'This cloned tool needs an external model API for the advertised AI/media result. Some providers charge for usage. No API key is included and no request is sent from this demo.'}</p><a href={api[1]} target="_blank" rel="noreferrer">{api[0]} <span aria-hidden="true">↗</span></a></aside>}
  </div>;
}
