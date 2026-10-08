import { useMemo, useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';
import { formatJson, minifyJson, validateJson } from '../../utils/tools/jsonFormatter.js';

const actions = [
  { id: 'format', label: 'Format JSON' },
  { id: 'minify', label: 'Minify JSON' },
];

export default function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const validation = useMemo(() => validateJson(input), [input]);
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function changeInput(value) {
    setInput(value);
    setResult('');
    clearCopyMessage();
  }

  function transform(action) {
    try {
      setResult(action === 'format' ? formatJson(input) : minifyJson(input));
    } catch {
      setResult('');
    }
    clearCopyMessage();
  }

  function clear() {
    setInput('');
    clearCopyMessage();
  }

  function reset() {
    clear();
    setResult('');
  }

  return <TextTransformWorkspace
    id="json-formatter"
    input={input}
    onInputChange={changeInput}
    inputLabel="JSON input"
    inputPlaceholder={'Paste JSON here…\n{ "name": "HavitGrowth", "tools": [] }'}
    outputLabel="Formatted output"
    outputPlaceholder="Formatted JSON will appear here…"
    result={result}
    actions={actions}
    onAction={transform}
    onClear={clear}
    onReset={reset}
    onCopy={() => copyText(result, 'JSON result')}
    status={validation.message}
    copyMessage={copyMessage}
    tone={input.trim() && !validation.valid ? 'error' : 'neutral'}
  />;
}
