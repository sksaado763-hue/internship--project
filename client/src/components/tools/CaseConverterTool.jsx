import { useState } from 'react';
import { Check, Clipboard, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import { caseActions, convertCase } from '../../utils/tools/caseConverter.js';
import useCopyText from '../../hooks/useCopyText.js';

export default function CaseConverterTool() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [activeMode, setActiveMode] = useState('');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function convert(mode) {
    setActiveMode(mode);
    setResult(convertCase(text, mode));
    clearCopyMessage();
  }

  function clear() {
    setText('');
    clearCopyMessage();
  }

  function reset() {
    clear();
    setActiveMode('');
  }

  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor="case-converter-input">Text to convert</label><span>{Array.from(text).length.toLocaleString()} characters</span></div>
      <textarea id="case-converter-input" className="tool-textarea case-input" value={text} onChange={(event) => { setText(event.target.value); if (activeMode) setResult(convertCase(event.target.value, activeMode)); }} placeholder="Paste or type the text you want to transform…" />
      <div className="case-action-heading"><h2>Choose a format</h2><span>Conversion stays on this device</span></div>
      <div className="case-action-grid">
        {caseActions.map((action) => <button className={`case-action ${activeMode === action.id ? 'is-active' : ''}`} type="button" key={action.id} aria-pressed={activeMode === action.id} disabled={!text} onClick={() => convert(action.id)}>{activeMode === action.id && <Check size={13} aria-hidden="true" />}{action.label}</button>)}
      </div>
      <div className="case-result-heading"><label htmlFor="case-converter-result">Converted text</label>{activeMode && <span>{caseActions.find((action) => action.id === activeMode)?.label}</span>}</div>
      <textarea id="case-converter-result" className="tool-textarea case-output" value={result} onChange={(event) => setResult(event.target.value)} placeholder="Choose a format above to see the result…" aria-live="polite" />
      <div className="tool-action-row">
        <p className="tool-inline-status" aria-live="polite">{copyMessage || (result ? 'You can edit the converted text before copying.' : 'Choose any format to convert your text.')}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" aria-label="Clear source text" onClick={clear}><Trash2 size={14} aria-hidden="true" /> Clear</Button>
          <Button variant="secondary" size="small" type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" /> Reset</Button>
          <Button variant="primary" size="small" type="button" disabled={!result} onClick={() => copyText(result, 'Converted text')}><Clipboard size={14} aria-hidden="true" /> Copy</Button>
        </div>
      </div>
    </div>
  );
}
