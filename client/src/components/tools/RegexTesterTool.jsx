import { useMemo, useState } from 'react';
import { Braces, Search } from 'lucide-react';
import useCopyText from '../../hooks/useCopyText.js';

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('\\b\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('Try a pattern against this sample text.\nEach match will be listed below.');
  const { copyMessage, copyText } = useCopyText();
  const result = useMemo(() => {
    if (!pattern) return { matches: [], error: '' };
    try {
      const regex = new RegExp(pattern, [...new Set(`g${flags}`)].join(''));
      const matches = [...sample.matchAll(regex)].slice(0, 200).map((match) => ({
        value: match[0], index: match.index, groups: match.slice(1),
      }));
      return { matches, error: '' };
    } catch (error) {
      return { matches: [], error: error.message };
    }
  }, [flags, pattern, sample]);

  return <div className="tool-editor tool-form-stack">
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="regex-pattern">Regular expression</label><span>JavaScript syntax</span></div>
      <input id="regex-pattern" className="tool-value-input" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="Enter a pattern, e.g. \\b\w+\\b" spellCheck={false} />
      <div className="tool-editor-label"><label htmlFor="regex-flags">Flags</label><span>g, i, m, s, u, y, d</span></div>
      <input id="regex-flags" className="tool-value-input" value={flags} onChange={(event) => setFlags(event.target.value)} maxLength={7} aria-describedby="regex-help" />
      <p id="regex-help" className="tool-inline-status">Global and case-insensitive flags are enabled by default. Results are limited to 200 matches.</p>
    </section>
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="regex-sample">Test text</label><span>{sample.length.toLocaleString()} characters</span></div>
      <textarea id="regex-sample" className="tool-textarea" value={sample} onChange={(event) => setSample(event.target.value)} placeholder="Enter text to test…" spellCheck={false} />
    </section>
    <section className="tool-form-section" aria-live="polite">
      <div className="tool-editor-label"><strong><Search size={14} aria-hidden="true" /> Matches</strong><span>{result.error ? 'Invalid pattern' : `${result.matches.length} found`}</span></div>
      {result.error ? <p className="tool-inline-status status-warning">{result.error}</p> : result.matches.length ? <div className="regex-match-list">
        {result.matches.map((match, index) => <div className="regex-match" key={`${match.index}-${index}`}><code>{match.value || '(empty match)'}</code><span>Position {match.index}</span>{match.groups.length > 0 && <small>Groups: {match.groups.map((group) => group ?? '—').join(', ')}</small>}</div>)}
      </div> : <p className="tool-inline-status">{pattern ? 'No matches found for this pattern.' : 'Enter a pattern to see matches.'}</p>}
    </section>
    <div className="tool-action-row"><p className="tool-inline-status" aria-live="polite">{copyMessage || 'Runs locally in your browser.'}</p><div className="tool-actions"><button className="button button--secondary" type="button" disabled={!result.matches.length} onClick={() => copyText(result.matches.map((match) => match.value).join('\n'), 'Matches')}><Braces size={14} /> Copy matches</button></div></div>
  </div>;
}
