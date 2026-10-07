import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';

const actions = [{ id: 'convert', label: 'Convert to JSON' }];

function parseCsv(source) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"' && cell === '') quoted = true;
    else if (character === ',') { row.push(cell); cell = ''; }
    else if (character === '\n' || character === '\r') {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += character;
  }
  if (quoted) throw new Error('A quoted field is missing its closing quote.');
  if (cell || row.length || source.endsWith(',')) { row.push(cell); rows.push(row); }

  const meaningfulRows = rows.filter((cells) => cells.some((value) => value.trim() !== ''));
  if (meaningfulRows.length < 2) throw new Error('Add a header row and at least one data row.');
  const headers = meaningfulRows[0].map((value) => value.trim());
  if (headers.some((header) => !header)) throw new Error('Every column needs a non-empty header.');
  if (new Set(headers).size !== headers.length) throw new Error('Column headers must be unique.');

  return meaningfulRows.slice(1).map((cells, rowIndex) => {
    if (cells.length > headers.length) throw new Error(`Row ${rowIndex + 2} has more fields than the header row.`);
    return Object.fromEntries(headers.map((header, columnIndex) => [header, cells[columnIndex] ?? '']));
  });
}

export default function CsvToJsonTool() {
  const [input, setInput] = useState('name,role\nAda Lovelace,Engineer\nGrace Hopper,Admiral');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('The first row becomes the JSON object keys.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function convert() {
    try {
      setResult(JSON.stringify(parseCsv(input), null, 2));
      setStatus('CSV converted to a JSON array.');
      setTone('success');
    } catch (error) {
      setResult('');
      setStatus(error.message);
      setTone('error');
    }
    clearCopyMessage();
  }

  function updateInput(value) { setInput(value); setResult(''); setStatus('The first row becomes the JSON object keys.'); setTone('neutral'); clearCopyMessage(); }
  function clear() { updateInput(''); }

  return <TextTransformWorkspace id="csv-to-json" input={input} onInputChange={updateInput}
    inputLabel="CSV input" inputPlaceholder={'name,role\nAda Lovelace,Engineer'} outputLabel="JSON output"
    outputPlaceholder="Converted JSON will appear here…" result={result} actions={actions} onAction={convert}
    onClear={clear} onReset={clear} onCopy={() => copyText(result, 'JSON result')} status={status}
    copyMessage={copyMessage} tone={tone} />;
}
