import { useEffect, useMemo, useState } from 'react';
import { Copy, Gauge, Play, Search } from 'lucide-react';
import Button from '../common/Button.jsx';
import { downloadBlob } from '../../utils/browserFiles.js';

function ResultCards({ items }) {
  return <div className="financial-results" aria-live="polite">{items.map(([label, value]) => <div className="financial-result" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function TextField({ id, label, value, onChange, placeholder, readOnly = false }) {
  return <section className="tool-form-section">
    <div className="tool-editor-label"><label htmlFor={id}>{label}</label><span>{value.length} characters</span></div>
    <textarea id={id} className="tool-textarea" value={value} onChange={readOnly ? undefined : onChange} readOnly={readOnly} placeholder={placeholder} spellCheck="false" />
  </section>;
}

/* 1 · JWT debugger ------------------------------------------------------- */

function decodeBase64Url(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

const formatEpoch = (seconds) => new Date(seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' });

function JwtDebugger() {
  const [token, setToken] = useState('');
  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return { state: 'empty' };
    const parts = trimmed.split('.');
    if (parts.length !== 3 || parts.some((part) => part === '')) return { state: 'invalid', reason: 'A JWT has three parts separated by dots: header.payload.signature.' };
    try {
      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      return { state: 'ok', header, payload };
    } catch {
      return { state: 'invalid', reason: 'The header or payload is not valid base64url-encoded JSON.' };
    }
  }, [token]);

  const expired = decoded.state === 'ok' && typeof decoded.payload.exp === 'number' && decoded.payload.exp * 1000 < Date.now();

  return <>
    <TextField id="jwt-input" label="Paste a JWT" value={token} onChange={setToken} placeholder="eyJhbGciOi… .eyJzdWIiOi… .SflKxw…" />
    {decoded.state === 'invalid' && <p className="tool-inline-status status-warning" aria-live="polite">{decoded.reason}</p>}
    {decoded.state === 'ok' && <>
      <p className="tool-inline-status" aria-live="polite">Decoded header and payload below — the signature section was not read.</p>
      <TextField id="jwt-header" label="Header (decoded JSON)" value={JSON.stringify(decoded.header, null, 2)} onChange={() => {}} readOnly />
      <TextField id="jwt-payload" label="Payload (decoded JSON)" value={JSON.stringify(decoded.payload, null, 2)} onChange={() => {}} readOnly />
      <ResultCards items={[
        ['Algorithm (alg)', String(decoded.header.alg ?? 'Not present')],
        ['Issuer (iss)', String(decoded.payload.iss ?? 'Not present')],
        ['Subject (sub)', String(decoded.payload.sub ?? 'Not present')],
        ['Issued at (iat)', typeof decoded.payload.iat === 'number' ? formatEpoch(decoded.payload.iat) : 'Not present'],
        ['Expires at (exp)', typeof decoded.payload.exp === 'number' ? formatEpoch(decoded.payload.exp) : 'Not present'],
      ]} />
      {expired && <p className="tool-inline-status status-warning" aria-live="polite">This token’s exp time is in the past, so it is expired (assuming the issuer enforces it).</p>}
    </>}
    <p className="tool-inline-status">Decoded locally in your browser. The signature is NOT verified — this tool only decodes the header and payload, so a forged token looks identical to a valid one.</p>
  </>;
}

/* 2 · Text ↔ binary converter -------------------------------------------- */

function BinaryConverter() {
  const [text, setText] = useState('');
  const [binary, setBinary] = useState('');
  const [message, setMessage] = useState('Convert in either direction — binary is shown as 8-bit groups separated by spaces.');
  const [isError, setIsError] = useState(false);

  function toBinary() {
    if (!text) { setIsError(true); setMessage('Type or paste some text first.'); return; }
    const bytes = new TextEncoder().encode(text);
    setBinary([...bytes].map((byte) => byte.toString(2).padStart(8, '0')).join(' '));
    setIsError(false);
    setMessage(`Converted ${bytes.length} UTF-8 byte${bytes.length === 1 ? '' : 's'} to binary.`);
  }

  function toText() {
    const cleaned = binary.trim();
    if (!cleaned) { setIsError(true); setMessage('Paste some binary first.'); return; }
    if (!/^[01\s]+$/.test(cleaned)) { setIsError(true); setMessage('Binary input can only contain 0, 1, and spaces.'); return; }
    const bits = cleaned.replace(/\s+/g, '');
    if (bits.length % 8 !== 0) { setIsError(true); setMessage(`Binary length must be a multiple of 8 bits (you entered ${bits.length} bits).`); return; }
    const bytes = new Uint8Array(bits.length / 8);
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = parseInt(bits.slice(index * 8, index * 8 + 8), 2);
    try {
      const decodedValue = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      setText(decodedValue);
      setIsError(false);
      setMessage(`Converted ${bytes.length} byte${bytes.length === 1 ? '' : 's'} to text.`);
    } catch {
      setIsError(true);
      setMessage('Those bytes do not form valid UTF-8 text.');
    }
  }

  return <>
    <TextField id="bin-text" label="Text (UTF-8)" value={text} onChange={setText} placeholder="Type or paste text…" />
    <TextField id="bin-binary" label="Binary · 8-bit groups separated by spaces" value={binary} onChange={setBinary} placeholder="01001000 01101001 …" />
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{message}</p>
      <div className="tool-actions">
        <Button variant="primary" size="small" type="button" onClick={toBinary}>To binary</Button>
        <Button variant="secondary" size="small" type="button" onClick={toText}>To text</Button>
      </div>
    </div>
    <p className="tool-inline-status">Conversion uses your browser’s TextEncoder/TextDecoder, so multi-byte characters round-trip as UTF-8.</p>
  </>;
}

/* 3 · IP subnet calculator ------------------------------------------------ */

const toDotted = (value) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');

function IpSubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.10');
  const [prefix, setPrefix] = useState('24');

  const result = useMemo(() => {
    const match = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!match) return { ok: false, reason: 'Enter a valid IPv4 address in dotted-quad form (four numbers 0–255 separated by dots).' };
    const octets = match.slice(1).map(Number);
    if (octets.some((octet) => octet > 255)) return { ok: false, reason: 'Each octet must be between 0 and 255.' };
    if (prefix.trim() === '') return { ok: false, reason: 'Enter a CIDR prefix between 0 and 32.' };
    const prefixNumber = Number(prefix);
    if (!Number.isInteger(prefixNumber) || prefixNumber < 0 || prefixNumber > 32) return { ok: false, reason: 'CIDR prefix must be a whole number between 0 and 32.' };
    const ipNumber = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const mask = prefixNumber === 0 ? 0 : (0xffffffff << (32 - prefixNumber)) >>> 0;
    const wildcard = (~mask) >>> 0;
    const network = (ipNumber & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    let firstHost = network; let lastHost = broadcast; let usable;
    if (prefixNumber <= 30) {
      firstHost = (network + 1) >>> 0;
      lastHost = (broadcast - 1) >>> 0;
      usable = (2 ** (32 - prefixNumber) - 2).toLocaleString(undefined);
    } else if (prefixNumber === 31) {
      usable = '2 (point-to-point link per RFC 3021, no standard host range)';
    } else {
      firstHost = network; lastHost = network;
      usable = '1 (single host route)';
    }
    return { ok: true, network: toDotted(network), broadcast: toDotted(broadcast), mask: toDotted(mask), wildcard: toDotted(wildcard), firstHost: toDotted(firstHost), lastHost: toDotted(lastHost), usable, prefixNumber };
  }, [ip, prefix]);

  return <>
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="subnet-ip"><span>IPv4 address</span><input id="subnet-ip" className="tool-value-input" value={ip} onChange={(event) => setIp(event.target.value)} placeholder="192.168.1.10" /></label>
      <label className="calculator-field" htmlFor="subnet-prefix"><span>CIDR prefix</span><input id="subnet-prefix" className="tool-value-input" type="number" min="0" max="32" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label>
    </div>
    {result.ok ? <ResultCards items={[
      ['Network address', result.network],
      ['Broadcast address', result.broadcast],
      ['Subnet mask', result.mask],
      ['Wildcard mask', result.wildcard],
      ['First host', result.firstHost],
      ['Last host', result.lastHost],
      ['Usable host addresses', result.usable],
    ]} /> : <p className="tool-inline-status status-warning" aria-live="polite">{result.reason}</p>}
    <p className="tool-inline-status">Calculated locally with 32-bit subnet math. /31 networks have no traditional host range (they are usually point-to-point links) and /32 identifies a single host, so the usual “2ⁿ − 2” count does not apply to them.</p>
  </>;
}

/* 4 · What’s my IP --------------------------------------------------------- */

function WhatsMyIp() {
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  async function showIp() {
    setLoading(true); setError(''); setNote(''); setLocation('');
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) throw new Error('Unexpected response');
      const data = await response.json();
      if (!data.ip) throw new Error('Missing ip field');
      setIp(data.ip);
      try {
        const geoResponse = await fetch('https://ipapi.co/json/');
        if (geoResponse.ok) {
          const geo = await geoResponse.json();
          const place = [geo.city, geo.region, geo.country_name].filter(Boolean).join(', ');
          setLocation(place);
        }
      } catch {
        setLocation('');
      }
    } catch {
      setIp('');
      setError('Could not reach api.ipify.org. Check your connection or any ad/script blocker, then try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyIp() {
    try { await navigator.clipboard.writeText(ip); setNote('Copied to clipboard.'); }
    catch { setNote('Clipboard access is unavailable in this browser.'); }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Your public IP address</h2>
      {error && <p className="tool-inline-status status-warning" aria-live="polite">{error}</p>}
      {!error && <p className="calculator-result" aria-live="polite"><span>{ip ? 'Your IP address' : 'Press the button to look up'}</span><strong>{ip || 'Not fetched yet'}</strong></p>}
      {location && <p className="calculator-result" aria-live="polite"><span>Best-effort location (ipapi.co)</span><strong>{location}</strong></p>}
    </section>
    <div className="tool-action-row">
      <p className="tool-inline-status" aria-live="polite">{note || 'The lookup is only sent when you press the button.'}</p>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" disabled={!ip} onClick={copyIp}><Copy size={14} aria-hidden="true" /> Copy</Button>
        <Button variant="primary" size="small" type="button" disabled={loading} onClick={showIp}>{loading ? 'Looking up…' : 'Show my IP'}</Button>
      </div>
    </div>
    <p className="tool-inline-status">Your request contacts api.ipify.org to look up the address; nothing else is sent. If shown, the location line is a separate best-effort call to ipapi.co and only appears when it succeeds.</p>
  </>;
}

/* 5 · Keyword density ------------------------------------------------------ */

const STOPWORDS = new Set(('a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with you your yours yourself yourselves').split(' '));

function KeywordDensity() {
  const [text, setText] = useState('');
  const analysis = useMemo(() => {
    const rawTokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    const tokens = rawTokens.filter((word) => word.length >= 2 && !STOPWORDS.has(word));
    const frequencies = new Map();
    tokens.forEach((word) => frequencies.set(word, (frequencies.get(word) || 0) + 1));
    const top = [...frequencies.entries()].sort((first, second) => second[1] - first[1]).slice(0, 15);
    return { rawCount: rawTokens.length, total: tokens.length, unique: frequencies.size, top };
  }, [text]);

  return <>
    <TextField id="density-text" label="Paste your article or page text" value={text} onChange={setText} placeholder="Paste the text you want to analyze…" />
    {analysis.total > 0 && <>
      <ResultCards items={[
        ['Total words', analysis.rawCount.toLocaleString()],
        ['Words analyzed (stopwords removed)', analysis.total.toLocaleString()],
        ['Unique words', analysis.unique.toLocaleString()],
      ]} />
      <div className="financial-table-wrap">
        <table className="financial-table">
          <caption>Top {analysis.top.length} words by frequency</caption>
          <thead><tr><th>Word</th><th>Count</th><th>Density</th></tr></thead>
          <tbody>{analysis.top.map(([word, count]) => <tr key={word}><td>{word}</td><td>{count}</td><td>{((count / analysis.total) * 100).toFixed(2)}%</td></tr>)}</tbody>
        </table>
      </div>
    </>}
    {text.trim() && analysis.total === 0 && <p className="tool-inline-status status-warning" aria-live="polite">No analyzable words found — the text may be only punctuation, single letters, or stopwords.</p>}
    <p className="tool-inline-status">Counted locally in your browser. A built-in list of common English stopwords and one-letter tokens is excluded, so density is measured against the analyzed words, not the raw word count.</p>
  </>;
}

/* 6 · Meta tag checker ----------------------------------------------------- */

function MetaTagChecker() {
  const [html, setHtml] = useState('');
  const report = useMemo(() => {
    if (!html.trim()) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const metaContent = (name) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
    const ogContent = (property) => doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content')?.trim() || '';
    const title = doc.querySelector('title')?.textContent?.trim() || '';
    const robots = metaContent('robots') || metaContent('googlebot');
    return {
      title,
      description: metaContent('description'),
      keywords: metaContent('keywords'),
      viewport: metaContent('viewport'),
      robots,
      blocksIndexing: /noindex/i.test(robots),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || '',
      openGraph: { title: ogContent('og:title'), description: ogContent('og:description'), image: ogContent('og:image') },
      twitter: { card: metaContent('twitter:card'), title: metaContent('twitter:title'), description: metaContent('twitter:description'), image: metaContent('twitter:image') },
    };
  }, [html]);

  return <>
    <TextField id="meta-html" label="Paste raw HTML (a full document or a fragment)" value={html} onChange={setHtml} placeholder="<!doctype html>… or a snippet of head markup…" />
    {report && <>
      {report.blocksIndexing && <p className="tool-inline-status status-warning" aria-live="polite">The robots meta tag contains noindex — search engines are asked not to index this page.</p>}
      <ResultCards items={[
        ['Title', report.title || 'Missing'],
        ['Title length', `${report.title.length} characters`],
        ['Meta description', report.description || 'Missing'],
        ['Description length', `${report.description.length} characters`],
        ['Meta keywords', report.keywords || 'Not present'],
        ['Open Graph title', report.openGraph.title || 'Not set'],
        ['Open Graph description', report.openGraph.description || 'Not set'],
        ['Open Graph image', report.openGraph.image || 'Not set'],
        ['Twitter card', report.twitter.card || 'Not set'],
        ['Twitter title', report.twitter.title || 'Not set'],
        ['Twitter description', report.twitter.description || 'Not set'],
        ['Twitter image', report.twitter.image || 'Not set'],
        ['Canonical URL', report.canonical || 'Not set'],
        ['Viewport', report.viewport || 'Not set'],
        ['Robots meta', report.robots ? (report.blocksIndexing ? `${report.robots} · blocks indexing` : report.robots) : 'Not set'],
      ]} />
      <p className="tool-inline-status">SERP snippets commonly target roughly 50–60 characters for titles and 150–160 for meta descriptions; the counts above measure the visible characters in your markup.</p>
    </>}
    <p className="tool-inline-status">Analysis runs locally on the pasted markup with your browser’s DOM parser; nothing is uploaded.</p>
  </>;
}

/* 7 · Grammar checker (local heuristics) ----------------------------------- */

const CONFUSABLES = [
  { name: 'its', regex: /\bits\b/g, hint: '“its” is possessive, “it’s” means “it is” — verify which one is intended.' },
  { name: 'it’s', regex: /\bit’s\b/gi, hint: '“it’s” means “it is”, “its” is possessive — verify which one is intended.' },
  { name: 'your', regex: /\byour\b/gi, hint: '“your” is possessive, “you’re” means “you are” — verify usage.' },
  { name: 'you’re', regex: /\byou’re\b/gi, hint: '“you’re” means “you are”, “your” is possessive — verify usage.' },
  { name: 'their', regex: /\btheir\b/gi, hint: '“their” is possessive; “there” is a place; “they’re” means “they are” — verify usage.' },
  { name: 'there', regex: /\bthere\b/gi, hint: '“there” is a place; “their” is possessive; “they’re” means “they are” — verify usage.' },
  { name: 'they’re', regex: /\bthey’re\b/gi, hint: '“they’re” means “they are”; “their” / “there” are different words — verify usage.' },
  { name: 'then', regex: /\bthen\b/gi, hint: '“then” refers to time, “than” is used for comparisons — verify usage.' },
  { name: 'than', regex: /\bthan\b/gi, hint: '“than” is used for comparisons, “then” refers to time — verify usage.' },
  { name: 'affect', regex: /\baffect\b/gi, hint: '“affect” is usually a verb, “effect” usually a noun — verify usage.' },
  { name: 'effect', regex: /\beffect\b/gi, hint: '“effect” is usually a noun, “affect” usually a verb — verify usage.' },
];

const makeExcerpt = (source, index) => `…${source.slice(Math.max(0, index - 24), index + 40).replace(/\s+/g, ' ').trim()}…`;
const lineOf = (source, index) => source.slice(0, index).split('\n').length;

function runGrammarChecks(source) {
  const findings = [];
  for (const match of source.matchAll(/\b([A-Za-z’']+)\s+\1\b/gi)) {
    findings.push({ check: 'Repeated word', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: `Remove the duplicated “${match[1]}”.` });
  }
  for (const match of source.matchAll(/ {2,}/g)) {
    findings.push({ check: 'Double space', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: 'Use a single space.' });
  }
  for (const match of source.matchAll(/\s+[,.!?;:]/g)) {
    findings.push({ check: 'Space before punctuation', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: 'Remove the space before the punctuation mark.' });
  }
  for (const match of source.matchAll(/[.!?]\s+([a-z])/g)) {
    findings.push({ check: 'Lowercase after sentence end', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: `Capitalize “${match[1]}” to start the sentence.` });
  }
  for (const match of source.matchAll(/^[ \t]*([a-z])/gm)) {
    findings.push({ check: 'Lowercase line start', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: `Capitalize “${match[1]}” or join the line to the previous sentence.` });
  }
  for (const confusable of CONFUSABLES) {
    const matches = [...source.matchAll(confusable.regex)];
    if (matches.length) {
      findings.push({ check: `Confusable · “${confusable.name}” × ${matches.length}`, where: `First use, line ${lineOf(source, matches[0].index)}: ${makeExcerpt(source, matches[0].index)}`, suggestion: confusable.hint });
    }
  }
  for (const match of source.matchAll(/[^.!?]+[.!?]+/g)) {
    const words = match[0].trim().split(/\s+/).filter(Boolean);
    if (words.length > 40) {
      findings.push({ check: 'Overlong sentence', where: `Line ${lineOf(source, match.index)}: ${makeExcerpt(source, match.index)}`, suggestion: `This sentence has ${words.length} words — consider splitting it for readability.` });
    }
  }
  findings.sort((first, second) => first.check.localeCompare(second.check));
  return findings;
}

function GrammarChecker() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('Paste your text, then run the checks.');

  function check() {
    if (!text.trim()) { setResult(null); setMessage('Paste some text first.'); return; }
    const findings = runGrammarChecks(text);
    setResult(findings);
    setMessage(findings.length ? `${findings.length} potential issue${findings.length === 1 ? '' : 's'} flagged — review each one; heuristics can be wrong.` : 'No issues found.');
  }

  return <>
    <TextField id="grammar-text" label="Paste your text" value={text} onChange={setText} placeholder="Paste the text you want checked…" />
    <div className="tool-action-row">
      <p className="tool-inline-status" aria-live="polite">{message}</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" onClick={check}>Check text</Button></div>
    </div>
    {result && result.length > 0 && <div className="financial-table-wrap">
      <table className="financial-table">
        <caption>{result.length} potential issue{result.length === 1 ? '' : 's'}</caption>
        <thead><tr><th>Check</th><th>Where</th><th>Suggestion</th></tr></thead>
        <tbody>{result.map((finding, index) => <tr key={`${finding.check}-${index}`}><td>{finding.check}</td><td>{finding.where}</td><td>{finding.suggestion}</td></tr>)}</tbody>
      </table>
    </div>}
    {result && result.length === 0 && <p className="tool-inline-status" aria-live="polite">No issues found by these local checks — that does not guarantee the text is error-free.</p>}
    <p className="tool-inline-status">Local rule-based checks only — repeated words, spacing, capitalization, simple confusable patterns, and very long sentences. This is not a full grammar model, so it can miss real mistakes and flag correct text.</p>
  </>;
}

/* 8 · Plagiarism-style similarity check ------------------------------------ */

function wordShingles(text, size = 8) {
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  if (!tokens.length) return new Set();
  if (tokens.length <= size) return new Set([tokens.join(' ')]);
  const set = new Set();
  for (let index = 0; index + size <= tokens.length; index += 1) set.add(tokens.slice(index, index + size).join(' '));
  return set;
}

function PlagiarismChecker() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('Paste both texts, then compare them.');

  function compare() {
    if (!textA.trim() || !textB.trim()) { setResult(null); setMessage('Paste text into both fields first.'); return; }
    const a = wordShingles(textA);
    const b = wordShingles(textB);
    const shared = [...a].filter((shingle) => b.has(shingle)).length;
    const union = new Set([...a, ...b]).size;
    setResult({
      countA: a.size,
      countB: b.size,
      shared,
      jaccard: union ? (shared / union) * 100 : 0,
      coverage: a.size ? (shared / a.size) * 100 : 0,
    });
    setMessage('Comparison complete.');
  }

  return <>
    <TextField id="plag-text-a" label="Text A" value={textA} onChange={setTextA} placeholder="Paste the first text…" />
    <TextField id="plag-text-b" label="Text B" value={textB} onChange={setTextB} placeholder="Paste the second text…" />
    <div className="tool-action-row">
      <p className="tool-inline-status" aria-live="polite">{message}</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" onClick={compare}>Compare texts</Button></div>
    </div>
    {result && <ResultCards items={[
      ['Shingles in Text A', result.countA.toLocaleString()],
      ['Shingles in Text B', result.countB.toLocaleString()],
      ['Shared shingles', result.shared.toLocaleString()],
      ['Jaccard similarity', `${result.jaccard.toFixed(1)}%`],
      ['Text A’s shingles found in B', `${result.coverage.toFixed(1)}%`],
    ]} />}
    <p className="tool-inline-status">Local comparison between the two pasted texts only — this tool cannot search the internet and is not proof of originality. Similarity uses word 8-gram (shingle) overlap, a crude lexical measure that ignores meaning.</p>
  </>;
}

/* 9 · HTML → PDF via print ------------------------------------------------- */

const PRINT_BASE_STYLE = 'body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:24px;color:#111827;line-height:1.55}img{max-width:100%;height:auto}table{border-collapse:collapse}th,td{border:1px solid #9ca3af;padding:4px 8px}a{color:#111827}h1,h2,h3{line-height:1.25}';

function HtmlToPdf() {
  const [html, setHtml] = useState('');
  const [message, setMessage] = useState('Paste HTML, then print or download it.');
  const [isError, setIsError] = useState(false);

  function openPrintPreview() {
    if (!html.trim()) { setIsError(true); setMessage('Paste some HTML first.'); return; }
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '-10000px';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    document.body.append(iframe);
    const previewDocument = iframe.contentWindow.document;
    previewDocument.open();
    previewDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print preview</title><style>${PRINT_BASE_STYLE}</style></head><body>`);
    previewDocument.write(html);
    previewDocument.write('</body></html>');
    previewDocument.close();
    const cleanup = () => iframe.remove();
    iframe.contentWindow.addEventListener('afterprint', cleanup);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    window.setTimeout(cleanup, 60000);
    setIsError(false);
    setMessage('Opening the browser print dialog — choose “Save as PDF” as the destination to export. Scripts in the pasted HTML stay disabled inside the sandboxed frame.');
  }

  function downloadHtml() {
    if (!html.trim()) { setIsError(true); setMessage('Paste some HTML first.'); return; }
    downloadBlob(new Blob([html], { type: 'text/html' }), 'document.html');
    setIsError(false);
    setMessage('Downloaded as document.html.');
  }

  return <>
    <TextField id="html-source" label="Paste HTML to print or save" value={html} onChange={setHtml} placeholder="<h1>Hello</h1>…" />
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{message}</p>
      <div className="tool-actions">
        <Button variant="secondary" size="small" type="button" onClick={downloadHtml}>Download HTML</Button>
        <Button variant="primary" size="small" type="button" onClick={openPrintPreview}>Open print preview</Button>
      </div>
    </div>
    <p className="tool-inline-status">Uses the browser’s print dialog with no server rendering; the markup is rendered in a hidden sandboxed frame (scripts blocked) and printed from there.</p>
  </>;
}

/* 10 · World clock ---------------------------------------------------------- */

const WORLD_ZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
  'Africa/Cairo', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata',
  'Asia/Dhaka', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
];

const cityOf = (zone) => zone.split('/').pop().replace(/_/g, ' ');

function WorldClock() {
  const [zones, setZones] = useState(['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney']);
  const [selected, setSelected] = useState('Europe/Berlin');
  const [now, setNow] = useState(() => new Date());
  const [message, setMessage] = useState('Pick a timezone and add it to the grid.');

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const formatTime = (zone) => {
    try {
      return new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
    } catch {
      return '—';
    }
  };

  function addZone() {
    if (zones.includes(selected)) { setMessage(`${cityOf(selected)} is already on the grid.`); return; }
    setZones((current) => [...current, selected]);
    setMessage(`Added ${cityOf(selected)} to the grid.`);
  }

  function removeZone(zone) {
    setZones((current) => current.filter((item) => item !== zone));
    setMessage(`Removed ${cityOf(zone)} from the grid.`);
  }

  return <>
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="clock-zone"><span>Timezone</span>
        <select id="clock-zone" className="tool-value-input" value={selected} onChange={(event) => setSelected(event.target.value)}>
          {WORLD_ZONES.map((zone) => <option key={zone} value={zone}>{cityOf(zone)} · {zone}</option>)}
        </select>
      </label>
      <div className="calculator-field"><span>&nbsp;</span><Button variant="primary" size="small" type="button" onClick={addZone}>Add clock</Button></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '9px' }}>
      {zones.map((zone) => <div key={zone} style={{ display: 'grid', gap: '8px', alignContent: 'space-between', border: '1px solid var(--line)', borderRadius: '11px', padding: '12px', background: 'var(--surface-soft)' }}>
        <span style={{ color: 'var(--muted)', fontSize: '10px' }}>{cityOf(zone)}<br /><span>{zone}</span></span>
        <strong style={{ color: 'var(--brand-strong)', fontSize: '16px', fontVariantNumeric: 'tabular-nums' }}>{formatTime(zone)}</strong>
        <button className="case-action" type="button" onClick={() => removeZone(zone)}>Remove</button>
      </div>)}
    </div>
    <div className="tool-action-row">
      <p className="tool-inline-status" aria-live="polite">{message} Times tick every second from your device clock via the Intl API.</p>
    </div>
    <p className="tool-inline-status">Clocks are computed locally with fixed IANA timezone names; no network request is made and no time server is consulted.</p>
  </>;
}

/* 11 · Domain age ----------------------------------------------------------- */

const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

const ageFrom = (from, to) => {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days };
};

function DomainAge() {
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('Enter a domain name, then press the button to look up its registration record.');
  const [isError, setIsError] = useState(false);

  async function check() {
    const name = domain.trim().toLowerCase();
    if (!domainPattern.test(name)) {
      setIsError(true); setResult(null);
      setMessage('Enter a valid domain name such as example.com — letters, numbers and hyphens, with at least one dot.');
      return;
    }
    setBusy(true); setIsError(false); setResult(null);
    setMessage(`Asking rdap.org for the ${name} record…`);
    try {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(name)}`);
      if (response.status === 404) {
        setIsError(true);
        setMessage('No RDAP record found — the TLD may not support RDAP, or the domain may be unregistered.');
        return;
      }
      if (!response.ok) {
        setIsError(true);
        setMessage(`rdap.org answered with HTTP ${response.status}; try again in a moment.`);
        return;
      }
      const data = await response.json();
      const event = (Array.isArray(data.events) ? data.events : []).find((item) => typeof item.eventAction === 'string' && /^registration$/i.test(item.eventAction) && item.eventDate);
      if (!event) {
        setIsError(true);
        setMessage('The RDAP record does not include a registration date, so the age cannot be computed from it. RDAP coverage varies by TLD and registry.');
        return;
      }
      const registered = new Date(event.eventDate);
      if (!Number.isFinite(registered.getTime())) {
        setIsError(true);
        setMessage('The RDAP record’s registration date could not be parsed.');
        return;
      }
      const registrarEntity = (Array.isArray(data.entities) ? data.entities : []).find((item) => Array.isArray(item.roles) && item.roles.includes('registrar'));
      let registrar = '';
      if (registrarEntity) {
        const fn = Array.isArray(registrarEntity.vcardArray) && Array.isArray(registrarEntity.vcardArray[1])
          ? registrarEntity.vcardArray[1].find((entry) => Array.isArray(entry) && entry[0] === 'fn')
          : null;
        registrar = (Array.isArray(fn) && fn[3] ? String(fn[3]) : '') || registrarEntity.handle || '';
      }
      setResult({ name, registered, age: ageFrom(registered, new Date()), registrar });
      setMessage('RDAP record found.');
    } catch {
      setIsError(true); setResult(null);
      setMessage('Could not reach rdap.org. Check your connection or any ad/script blocker, then try again.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="domain-age-input"><span>Domain name</span>
        <div className="calculator-field-control"><input id="domain-age-input" className="tool-value-input" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" autoCapitalize="none" autoCorrect="off" spellCheck="false" /></div>
      </label>
    </div>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${isError ? 'status-warning' : ''}`} aria-live="polite">{message}</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" disabled={busy} onClick={check}><Search size={14} aria-hidden="true" />{busy ? 'Looking up…' : 'Check domain age'}</Button></div>
    </div>
    {result && <ResultCards items={[
      ['Domain', result.name],
      ['Registered on', result.registered.toLocaleDateString(undefined, { dateStyle: 'long' })],
      ['Age', `${result.age.years} years, ${result.age.months} months, ${result.age.days} days`],
      ['Registrar', result.registrar || 'Not listed in the RDAP record'],
    ]} />}
    <p className="tool-inline-status">This check sends the domain you type to rdap.org, a public RDAP bootstrap service that needs no key, to find the registration record. The request goes out only when you press the button. RDAP coverage varies by TLD: some registries publish no record or no registration date, in which case the age cannot be shown.</p>
  </>;
}

/* 12 · SSL certificate checker (honest browser limit) ------------------------ */

function SslChecker() {
  return <section className="tool-form-section">
    <h2 className="calculator-section-title">Why this check cannot run in your browser</h2>
    <p className="tool-inline-status status-warning">A web page has no JavaScript API to read another host’s TLS certificate, and this site is 100% client-side with no server to proxy a real scan through — so a “certificate check” here could only print invented data. We would rather say that plainly than fake a result.</p>
    <p className="tool-inline-status">For a site you are visiting, click the padlock icon in the browser address bar — “Connection is secure” → “Certificate is valid” shows the issuer, validity dates and chain. For a terminal check, run <code>openssl s_client -connect example.com:443 -servername example.com</code> and read the certificate chain it prints.</p>
  </section>;
}

/* 13 · Backlink checker (honest browser limit) ------------------------------- */

function BacklinkChecker() {
  return <section className="tool-form-section">
    <h2 className="calculator-section-title">Why this check cannot run in your browser</h2>
    <p className="tool-inline-status status-warning">Counting backlinks means querying a search engine’s crawl or a commercial link index (Moz, Ahrefs, Majestic…). Those APIs require a secret key, and a key shipped to the browser is a key leaked to everyone — this free, keyless, client-side site deliberately never does that, so any backlink number shown here would be made up rather than measured.</p>
    <p className="tool-inline-status">A free, accurate alternative is Google Search Console: its Links report shows external links to your site, top linking sites, and your most-linked pages, taken straight from Google’s own index. Bing Webmaster Tools publishes a similar inbound-links report.</p>
  </section>;
}

/* 14 · Connection speed estimate --------------------------------------------- */

function SpeedTest() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function runTest() {
    setRunning(true); setError(''); setResult(null);
    try {
      const samples = [];
      for (let index = 0; index < 5; index += 1) {
        const started = performance.now();
        await fetch('https://speed.cloudflare.com/__down?bytes=1000', { cache: 'no-store' });
        samples.push(performance.now() - started);
      }
      samples.sort((first, second) => first - second);
      const median = samples[Math.floor(samples.length / 2)];
      const startedAt = performance.now();
      const response = await fetch('https://speed.cloudflare.com/__down?bytes=5000000', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Unexpected HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const seconds = (performance.now() - startedAt) / 1000;
      if (seconds <= 0 || !buffer.byteLength) throw new Error('The download did not complete.');
      const mbps = (buffer.byteLength * 8) / seconds / 1000000;
      setResult({ median: Math.round(median), mbps });
    } catch {
      setError('The speed test could not reach speed.cloudflare.com. Check your connection or any ad/script blocker, then try again.');
    } finally {
      setRunning(false);
    }
  }

  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Rough connection estimate</h2>
      <p className="tool-inline-status">Latency is the median of five small requests; download speed is timed from one 5 MB file. Both are fetched from Cloudflare’s public speed-test endpoint.</p>
    </section>
    <div className="tool-action-row">
      <p className={`tool-inline-status ${error ? 'status-warning' : ''}`} aria-live="polite">{error || (running ? 'Running… first the latency samples, then the 5 MB download.' : result ? 'Test complete — treat this as an estimate, not a lab measurement.' : 'Press Run test to measure. Your browser contacts speed.cloudflare.com directly.')}</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" disabled={running} onClick={runTest}><Gauge size={14} aria-hidden="true" />{running ? 'Running…' : 'Run test'}</Button></div>
    </div>
    {result && <ResultCards items={[
      ['Median latency', `${result.median} ms`],
      ['Estimated download speed', `${result.mbps.toFixed(1)} Mbps`],
    ]} />}
    <p className="tool-inline-status">This is an estimate, not a lab measurement: the result depends on your Wi-Fi, device load and the test host. The test endpoint is speed.cloudflare.com, Cloudflare’s public speed test — the requests are only sent when you press the button, and nothing else is transmitted.</p>
  </>;
}

/* 15 · JavaScript playground -------------------------------------------------- */

const DEFAULT_PLAYGROUND_CODE = 'const greeting = \'Hello, playground!\';\nconsole.log(greeting);\nfor (let index = 1; index <= 3; index += 1) {\n  console.log(\'Iteration \' + index);\n}\nconsole.log({ ok: true, answer: 42 });';

const formatLogArg = (arg) => {
  if (typeof arg === 'string') return arg;
  try { return JSON.stringify(arg) ?? String(arg); } catch { return String(arg); }
};

function CodePlayground() {
  const [code, setCode] = useState(DEFAULT_PLAYGROUND_CODE);
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('Write JavaScript, then press Run.');

  function run() {
    if (!code.trim()) { setOutput(''); setMessage('Type some JavaScript first.'); return; }
    const lines = [];
    const capturedConsole = ['log', 'info', 'warn', 'error'].reduce((accumulator, method) => {
      accumulator[method] = (...args) => lines.push(`[${method}] ${args.map(formatLogArg).join(' ')}`);
      return accumulator;
    }, {});
    try {
      const fn = new Function('console', '"use strict";\n' + code);
      fn(capturedConsole);
      lines.push('— Finished without errors —');
    } catch (error) {
      lines.push(`— ${error.name}: ${error.message} —`);
    }
    setOutput(lines.join('\n'));
    setMessage('Ran inside this page; everything the captured console recorded is shown below.');
  }

  return <>
    <TextField id="playground-code" label="JavaScript source" value={code} onChange={setCode} placeholder="console.log('Hello');" />
    <div className="tool-action-row">
      <p className="tool-inline-status" aria-live="polite">{message}</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" onClick={run}><Play size={14} aria-hidden="true" />Run</Button></div>
    </div>
    <TextField id="playground-output" label="Console output" value={output} onChange={() => {}} readOnly placeholder="Output appears here…" />
    <p className="tool-inline-status">Code runs synchronously inside this page with a captured console — an infinite loop will freeze the tab until the browser offers to stop it. Only JavaScript runs here: compiling Python, Java, C++ and friends needs a server-side compiler API (e.g. Piston), which this free, keyless, client-only site does not ship.</p>
  </>;
}

/* Switch -------------------------------------------------------------------- */

export default function WebUtilityTool({ tool }) {
  let content;
  switch (tool.slug) {
    case 'jwt-debugger': content = <JwtDebugger />; break;
    case 'binary-converter': content = <BinaryConverter />; break;
    case 'ip-subnet-calculator': content = <IpSubnetCalculator />; break;
    case 'whats-my-ip': content = <WhatsMyIp />; break;
    case 'keyword-density': content = <KeywordDensity />; break;
    case 'meta-tag-checker': content = <MetaTagChecker />; break;
    case 'grammar-checker': content = <GrammarChecker />; break;
    case 'plagiarism-checker': content = <PlagiarismChecker />; break;
    case 'html-to-pdf': content = <HtmlToPdf />; break;
    case 'world-clock': content = <WorldClock />; break;
    case 'domain-age': content = <DomainAge />; break;
    case 'ssl-checker': content = <SslChecker />; break;
    case 'backlink-checker': content = <BacklinkChecker />; break;
    case 'speed-test': content = <SpeedTest />; break;
    case 'code-compiler': content = <CodePlayground />; break;
    default: content = <p className="tool-inline-status">This tool is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack">{content}</div>;
}
