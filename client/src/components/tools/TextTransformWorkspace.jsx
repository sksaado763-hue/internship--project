import { Clipboard, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function TextTransformWorkspace({
  id,
  input,
  onInputChange,
  inputLabel = 'Input text',
  inputPlaceholder = 'Paste or type your text…',
  outputLabel = 'Result',
  outputPlaceholder = 'Your result will appear here…',
  result,
  actions,
  onAction,
  onClear,
  onReset,
  onCopy,
  status,
  copyMessage,
  tone = 'neutral',
}) {
  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor={`${id}-input`}>{inputLabel}</label><span>{Array.from(input).length.toLocaleString()} characters</span></div>
      <textarea id={`${id}-input`} className="tool-textarea case-input" value={input} onChange={(event) => onInputChange(event.target.value)} placeholder={inputPlaceholder} spellCheck={false} />
      <div className="case-action-heading"><h2>Choose an action</h2><span>Runs privately in your browser</span></div>
      <div className={`case-action-grid case-action-grid--${actions.length}`}>
        {actions.map((action) => <button className="case-action" type="button" key={action.id} disabled={!input} onClick={() => onAction(action.id)}>{action.label}</button>)}
      </div>
      <div className="case-result-heading"><label htmlFor={`${id}-result`}>{outputLabel}</label></div>
      <textarea id={`${id}-result`} className="tool-textarea case-output" value={result} placeholder={outputPlaceholder} readOnly aria-live="polite" />
      <div className="tool-action-row">
        <p className={`tool-inline-status ${tone === 'error' ? 'status-warning' : ''} ${tone === 'success' ? 'status-success' : ''}`} aria-live="polite">{copyMessage || status}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={onClear}><Trash2 size={14} aria-hidden="true" /> Clear</Button>
          <Button variant="secondary" size="small" type="button" onClick={onReset}><RotateCcw size={14} aria-hidden="true" /> Reset</Button>
          <Button variant="primary" size="small" type="button" disabled={!result} onClick={onCopy}><Clipboard size={14} aria-hidden="true" /> Copy result</Button>
        </div>
      </div>
    </div>
  );
}
