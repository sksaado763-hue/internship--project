import { useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';
import Button from '../common/Button.jsx';
import useCopyText from '../../hooks/useCopyText.js';

export default function UuidGeneratorTool() {
  const [uuid, setUuid] = useState('');
  const [error, setError] = useState('');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function generate() {
    if (!window.crypto?.randomUUID) {
      setError('UUID generation requires a browser with secure random support.');
      setUuid('');
      return;
    }
    setUuid(window.crypto.randomUUID());
    setError('');
    clearCopyMessage();
  }

  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor="uuid-result">Generated UUID v4</label><span>Random identifier</span></div>
      <input id="uuid-result" className="tool-value-input" value={uuid} readOnly placeholder="Click Generate UUID to create an identifier…" aria-live="polite" />
      <div className="tool-action-row">
        <p className={`tool-inline-status ${error ? 'status-warning' : ''}`} aria-live="polite">{copyMessage || error || 'Generated with the browser’s cryptographic random number generator.'}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={generate}><RefreshCw size={14} aria-hidden="true" /> Generate UUID</Button>
          <Button variant="primary" size="small" type="button" disabled={!uuid} onClick={() => copyText(uuid, 'UUID')}><Clipboard size={14} aria-hidden="true" /> Copy UUID</Button>
        </div>
      </div>
    </div>
  );
}
