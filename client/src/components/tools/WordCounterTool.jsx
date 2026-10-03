import { useMemo, useState } from 'react';
import { Clipboard, RotateCcw } from 'lucide-react';
import Button from '../common/Button.jsx';
import { getWordCounterStats } from '../../utils/tools/wordCounter.js';
import useCopyText from '../../hooks/useCopyText.js';

const metrics = [
  ['words', 'Words'],
  ['characters', 'Characters'],
  ['charactersWithoutSpaces', 'Characters without spaces'],
  ['sentences', 'Sentences'],
  ['paragraphs', 'Paragraphs'],
  ['readingTime', 'Reading time (min)'],
];

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const stats = useMemo(() => getWordCounterStats(text), [text]);
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function reset() {
    setText('');
    clearCopyMessage();
  }

  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor="word-counter-input">Paste or type your text</label><span>{stats.words.toLocaleString()} words</span></div>
      <textarea id="word-counter-input" className="tool-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder="Start writing or paste your text here…" spellCheck="true" />
      <div className="tool-action-row">
        <p className="tool-inline-status" aria-live="polite">{copyMessage || 'Counts update instantly as you type.'}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" /> Reset</Button>
          <Button variant="primary" size="small" type="button" onClick={() => copyText(text)}><Clipboard size={14} aria-hidden="true" /> Copy text</Button>
        </div>
      </div>
      <div className="metric-grid" aria-live="polite">
        {metrics.map(([key, label]) => <div className="metric-card" key={key}><span>{label}</span><strong>{stats[key].toLocaleString()}</strong></div>)}
      </div>
    </div>
  );
}
