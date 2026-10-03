import { useMemo, useState } from 'react';
import { Clipboard, RotateCcw } from 'lucide-react';
import Button from '../common/Button.jsx';
import { getCharacterCounterStats } from '../../utils/tools/characterCounter.js';
import useCopyText from '../../hooks/useCopyText.js';

const metrics = [
  ['characters', 'Characters'],
  ['charactersWithoutSpaces', 'Characters without spaces'],
  ['words', 'Words'],
  ['lines', 'Lines'],
  ['spaces', 'Whitespace characters'],
];

export default function CharacterCounterTool() {
  const [text, setText] = useState('');
  const [limitEnabled, setLimitEnabled] = useState(true);
  const [limit, setLimit] = useState(280);
  const stats = useMemo(() => getCharacterCounterStats(text), [text]);
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 0;
  const overLimit = safeLimit > 0 && stats.characters > safeLimit;
  const progressValue = safeLimit > 0 ? Math.min(stats.characters, safeLimit) : 0;

  function reset() {
    setText('');
    setLimitEnabled(true);
    setLimit(280);
    clearCopyMessage();
  }

  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor="character-counter-input">Your text</label><span>{stats.characters.toLocaleString()} characters</span></div>
      <textarea id="character-counter-input" className="tool-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type or paste text to count its characters…" />
      <div className={`character-limit-panel ${overLimit ? 'is-over-limit' : ''}`}>
        <div className="limit-controls">
          <label className="limit-toggle"><input type="checkbox" checked={limitEnabled} onChange={(event) => setLimitEnabled(event.target.checked)} /><span>Set a character limit</span></label>
          {limitEnabled && <label className="limit-number-label" htmlFor="character-limit">Limit <input id="character-limit" type="number" min="1" max="100000" value={limit} onChange={(event) => setLimit(Math.max(1, Math.min(100000, Number(event.target.value) || 1)))} /></label>}
        </div>
        {limitEnabled && safeLimit > 0 && <>
          <div className="limit-progress-copy"><span>{stats.characters.toLocaleString()} / {safeLimit.toLocaleString()}</span><span>{overLimit ? `${(stats.characters - safeLimit).toLocaleString()} over the limit` : `${(safeLimit - stats.characters).toLocaleString()} remaining`}</span></div>
          <progress className="character-progress" value={progressValue} max={safeLimit} aria-label={`${stats.characters} of ${safeLimit} characters`} />
        </>}
      </div>
      <div className="tool-action-row">
        <p className={`tool-inline-status ${overLimit ? 'status-warning' : ''}`} aria-live="polite">{copyMessage || (overLimit ? 'This text is over your character limit.' : 'Counts update instantly as you type.')}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" /> Reset</Button>
          <Button variant="primary" size="small" type="button" onClick={() => copyText(text)}><Clipboard size={14} aria-hidden="true" /> Copy text</Button>
        </div>
      </div>
      <div className="metric-grid metric-grid--five" aria-live="polite">
        {metrics.map(([key, label]) => <div className="metric-card" key={key}><span>{label}</span><strong>{stats[key].toLocaleString()}</strong></div>)}
      </div>
    </div>
  );
}
