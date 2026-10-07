import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';

function toMarkdownTable(value) {
  const rows = value.split(/\r?\n/).filter((line) => line.trim()).map((line) => line.split('\t').map((cell) => cell.trim().replaceAll('|', '\\|')));
  if (!rows.length) throw new Error('Add tab-separated rows to create a table.');
  const width = Math.max(...rows.map((row) => row.length));
  const padded = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
  const header = padded[0];
  const separator = header.map(() => '---');
  return [header, separator, ...padded.slice(1)].map((row) => `| ${row.join(' | ')} |`).join('\n');
}

export default function MarkdownTableGeneratorTool() {
  const [input, setInput] = useState('Name\tRole\nAda Lovelace\tEngineer\nGrace Hopper\tAdmiral');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Separate columns with tabs. The first row is used as the table header.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function convert() {
    try { setResult(toMarkdownTable(input)); setStatus('Markdown table generated.'); setTone('success'); }
    catch (error) { setResult(''); setStatus(error.message); setTone('error'); }
    clearCopyMessage();
  }
  function updateInput(value) { setInput(value); setResult(''); setStatus('Separate columns with tabs. The first row is used as the table header.'); setTone('neutral'); clearCopyMessage(); }
  function clear() { updateInput(''); }

  return <TextTransformWorkspace id="markdown-table" input={input} onInputChange={updateInput}
    inputLabel="Tab-separated rows" inputPlaceholder={'Name\tRole\nAda Lovelace\tEngineer'} outputLabel="Markdown table"
    outputPlaceholder="Generated Markdown will appear here…" result={result}
    actions={[{ id: 'convert', label: 'Generate table' }]} onAction={convert} onClear={clear} onReset={clear}
    onCopy={() => copyText(result, 'Markdown table')} status={status} copyMessage={copyMessage} tone={tone} />;
}
