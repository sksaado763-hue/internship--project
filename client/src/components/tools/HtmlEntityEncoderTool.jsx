import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';

const actions = [
  { id: 'encode', label: 'Encode entities' },
  { id: 'decode', label: 'Decode entities' },
];

function encodeEntities(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function decodeEntities(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

export default function HtmlEntityEncoderTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Encode HTML special characters or decode an entity string.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function changeInput(value) {
    setInput(value); setResult(''); setStatus('Choose whether to encode or decode entities.'); setTone('neutral'); clearCopyMessage();
  }
  function transform(action) {
    setResult(action === 'encode' ? encodeEntities(input) : decodeEntities(input));
    setStatus(action === 'encode' ? 'Special characters encoded as HTML entities.' : 'HTML entities decoded.');
    setTone('success'); clearCopyMessage();
  }
  function clear() { setInput(''); setResult(''); setStatus('Encode HTML special characters or decode an entity string.'); setTone('neutral'); clearCopyMessage(); }

  return <TextTransformWorkspace id="html-entity-encoder" input={input} onInputChange={changeInput}
    inputLabel="Text or HTML entities" inputPlaceholder={'Try: Tom & Jerry <hello> "world"'}
    outputLabel="Converted text" outputPlaceholder="Your encoded or decoded text will appear here…"
    result={result} actions={actions} onAction={transform} onClear={clear} onReset={clear}
    onCopy={() => copyText(result, 'HTML entity result')} status={status} copyMessage={copyMessage} tone={tone} />;
}
