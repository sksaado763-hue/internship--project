import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';

const actions = [{ id: 'convert', label: 'Convert to CSV' }];

function csvCell(value) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function convertJsonToCsv(source) {
  let data;
  try { data = JSON.parse(source); }
  catch { throw new Error('Enter valid JSON before converting.'); }
  if (!Array.isArray(data) || data.length === 0 || data.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw new Error('Provide a non-empty JSON array of objects.');
  }

  const headers = [...new Set(data.flatMap((item) => Object.keys(item)))];
  if (!headers.length) throw new Error('Add at least one property to the JSON objects.');
  return [headers, ...data.map((item) => headers.map((header) => item[header] ?? ''))]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}

export default function JsonToCsvTool() {
  const [input, setInput] = useState('[\n  {"name":"Ada Lovelace","role":"Engineer"},\n  {"name":"Grace Hopper","role":"Admiral"}\n]');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Each object becomes a row; all object keys become columns.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function convert() {
    try {
      setResult(convertJsonToCsv(input));
      setStatus('JSON converted to CSV.');
      setTone('success');
    } catch (error) {
      setResult('');
      setStatus(error.message);
      setTone('error');
    }
    clearCopyMessage();
  }

  function updateInput(value) {
    setInput(value);
    setResult('');
    setStatus('Each object becomes a row; all object keys become columns.');
    setTone('neutral');
    clearCopyMessage();
  }

  function clear() { updateInput(''); }

  return <TextTransformWorkspace id="json-to-csv" input={input} onInputChange={updateInput}
    inputLabel="JSON input" inputPlaceholder={'[{"name":"Ada","role":"Engineer"}]'} outputLabel="CSV output"
    outputPlaceholder="Converted CSV will appear here…" result={result} actions={actions} onAction={convert}
    onClear={clear} onReset={clear} onCopy={() => copyText(result, 'CSV result')} status={status}
    copyMessage={copyMessage} tone={tone} />;
}
