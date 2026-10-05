import { useMemo, useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';
import Button from '../common/Button.jsx';
import useCopyText from '../../hooks/useCopyText.js';

const groups = [
  { key: 'lowercase', label: 'Lowercase letters', chars: 'abcdefghijklmnopqrstuvwxyz' },
  { key: 'uppercase', label: 'Uppercase letters', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { key: 'numbers', label: 'Numbers', chars: '0123456789' },
  { key: 'symbols', label: 'Symbols', chars: '!@#$%^&*()-_=+[]{};:,.?' },
];

function secureRandomIndex(max) {
  const bytes = new Uint8Array(1);
  const limit = Math.floor(256 / max) * max;
  do {
    window.crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return bytes[0] % max;
}

function createPassword(length, enabledGroups) {
  const characters = enabledGroups.map((group) => group.chars).join('');
  const password = enabledGroups.map((group) => group.chars[secureRandomIndex(group.chars.length)]);
  while (password.length < length) password.push(characters[secureRandomIndex(characters.length)]);
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }
  return password.join('');
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [enabled, setEnabled] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const activeGroups = useMemo(() => groups.filter((group) => enabled[group.key]), [enabled]);
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function toggleGroup(key) {
    setEnabled((current) => ({ ...current, [key]: !current[key] }));
    setPassword('');
    setError('');
    clearCopyMessage();
  }

  function generate() {
    if (!activeGroups.length) {
      setError('Choose at least one character type.');
      setPassword('');
      return;
    }
    try {
      setPassword(createPassword(length, activeGroups));
      setError('');
      clearCopyMessage();
    } catch {
      setError('Secure random generation is unavailable in this browser context.');
      setPassword('');
    }
  }

  return (
    <div className="tool-editor">
      <div className="tool-editor-label"><label htmlFor="password-length">Password length</label><span>{length} characters</span></div>
      <input id="password-length" type="range" min="8" max="64" value={length} onChange={(event) => { setLength(Number(event.target.value)); setPassword(''); clearCopyMessage(); }} />
      <div className="metric-grid">
        {groups.map((group) => <label className="password-option" key={group.key}>
          <input type="checkbox" checked={enabled[group.key]} onChange={() => toggleGroup(group.key)} />
          <span>{group.label}</span>
        </label>)}
      </div>
      <div className="case-result-heading"><label htmlFor="password-result">Generated password</label></div>
      <input id="password-result" className="tool-value-input" value={password} readOnly placeholder="Generate a password to see it here…" aria-live="polite" />
      <div className="tool-action-row">
        <p className={`tool-inline-status ${error ? 'status-warning' : ''}`} aria-live="polite">{copyMessage || error || 'Created locally using your browser’s cryptographic random generator.'}</p>
        <div className="tool-actions">
          <Button variant="secondary" size="small" type="button" onClick={generate}><RefreshCw size={14} aria-hidden="true" /> Generate</Button>
          <Button variant="primary" size="small" type="button" disabled={!password} onClick={() => copyText(password, 'Password')}><Clipboard size={14} aria-hidden="true" /> Copy password</Button>
        </div>
      </div>
    </div>
  );
}
