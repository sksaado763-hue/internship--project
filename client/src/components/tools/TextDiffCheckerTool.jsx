import { useState } from 'react';
import { Clipboard, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import useCopyText from '../../hooks/useCopyText.js';

function compareLines(original, updated) {
  const before = original.split(/\r?\n/);
  const after = updated.split(/\r?\n/);
  const columns = after.length + 1;
  const cellCount = (before.length + 1) * columns;

  if (cellCount > 1_000_000) {
    throw new Error('These text blocks are too large to compare at once. Try comparing fewer lines.');
  }

  const common = new Uint32Array(cellCount);
  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      const index = i * columns + j;
      common[index] = before[i] === after[j]
        ? common[(i + 1) * columns + j + 1] + 1
        : Math.max(common[(i + 1) * columns + j], common[index + 1]);
    }
  }

  const changes = [];
  let i = 0;
  let j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      changes.push({ type: 'same', text: before[i] });
      i += 1;
      j += 1;
    } else if (i < before.length && (j === after.length || common[(i + 1) * columns + j] >= common[i * columns + j + 1])) {
      changes.push({ type: 'removed', text: before[i] });
      i += 1;
    } else {
      changes.push({ type: 'added', text: after[j] });
      j += 1;
    }
  }
  return changes;
}

export default function TextDiffCheckerTool() {
  const [original, setOriginal] = useState('');
  const [updated, setUpdated] = useState('');
  const [changes, setChanges] = useState(null);
  const [status, setStatus] = useState('Paste the original and updated text, then compare them.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function compare() {
    try {
      const result = compareLines(original, updated);
      setChanges(result);
      const added = result.filter((line) => line.type === 'added').length;
      const removed = result.filter((line) => line.type === 'removed').length;
      setStatus(added || removed ? `${added} added and ${removed} removed ${added + removed === 1 ? 'line' : 'lines'}.` : 'The text blocks are identical.');
      setTone('success');
    } catch (error) {
      setChanges(null);
      setStatus(error.message);
      setTone('error');
    }
    clearCopyMessage();
  }

  function clear() {
    setOriginal('');
    setUpdated('');
    setChanges(null);
    setStatus('Paste the original and updated text, then compare them.');
    setTone('neutral');
    clearCopyMessage();
  }

  const diffText = changes?.map(({ type, text }) => `${type === 'added' ? '+' : type === 'removed' ? '-' : ' '} ${text}`).join('\n') ?? '';

  return (
    <div className="tool-editor">
      <div className="diff-input-grid">
        <div className="tool-editor-label"><label htmlFor="diff-original">Original text</label><span>{original.split(/\r?\n/).length} lines</span></div>
        <div className="tool-editor-label"><label htmlFor="diff-updated">Updated text</label><span>{updated.split(/\r?\n/).length} lines</span></div>
        <textarea id="diff-original" className="tool-textarea diff-textarea" value={original} onChange={(event) => { setOriginal(event.target.value); setChanges(null); clearCopyMessage(); }} placeholder="Paste the original version…" spellCheck={false} />
        <textarea id="diff-updated" className="tool-textarea diff-textarea" value={updated} onChange={(event) => { setUpdated(event.target.value); setChanges(null); clearCopyMessage(); }} placeholder="Paste the updated version…" spellCheck={false} />
      </div>
      <div className="case-action-heading"><h2>Compare versions</h2><span>Processed privately in your browser</span></div>
      <div className="diff-legend" aria-label="Diff legend"><span className="diff-legend-added">+ Added</span><span className="diff-legend-removed">− Removed</span><span>Unchanged</span></div>
      <div className="tool-action-row diff-controls">
        <p className={`tool-inline-status ${tone === 'error' ? 'status-warning' : ''} ${tone === 'success' ? 'status-success' : ''}`} aria-live="polite">{copyMessage || status}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={clear}><Trash2 size={14} aria-hidden="true" /> Clear</Button>
          <Button variant="secondary" size="small" type="button" onClick={clear}><RotateCcw size={14} aria-hidden="true" /> Reset</Button>
          <Button variant="primary" size="small" type="button" disabled={!original && !updated} onClick={compare}>Compare</Button>
        </div>
      </div>
      {changes && <div className="diff-result" aria-label="Comparison result" aria-live="polite">
        {changes.map((line, index) => <div className={`diff-line diff-line--${line.type}`} key={`${index}-${line.type}`}><span className="diff-marker" aria-hidden="true">{line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}</span><code>{line.text || ' '}</code></div>)}
        {!changes.length && <p className="diff-empty">No lines to compare.</p>}
      </div>}
      {changes && <div className="tool-actions diff-copy"><Button variant="secondary" size="small" type="button" disabled={!diffText} onClick={() => copyText(diffText, 'Diff result')}><Clipboard size={14} aria-hidden="true" /> Copy diff</Button></div>}
    </div>
  );
}
