import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';
import { base64Actions, decodeBase64, encodeBase64 } from '../../utils/tools/base64Codec.js';

export default function Base64CodecTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Encode UTF-8 text or decode standard and URL-safe Base64.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function changeInput(value) {
    setInput(value);
    setResult('');
    setStatus('Choose encode or decode to convert this text.');
    setTone('neutral');
    clearCopyMessage();
  }

  function transform(action) {
    try {
      setResult(action === 'encode' ? encodeBase64(input) : decodeBase64(input));
      setStatus(action === 'encode' ? 'Text encoded to Base64.' : 'Base64 decoded as UTF-8 text.');
      setTone('success');
    } catch {
      setResult('');
      setStatus(action === 'decode' ? 'Could not decode this value. Check that it is valid Base64 text.' : 'This text could not be encoded in this browser.');
      setTone('error');
    }
    clearCopyMessage();
  }

  function clear() {
    setInput('');
    setStatus('Encode UTF-8 text or decode standard and URL-safe Base64.');
    setTone('neutral');
    clearCopyMessage();
  }

  function reset() {
    clear();
    setResult('');
  }

  return <TextTransformWorkspace
    id="base64-codec"
    input={input}
    onInputChange={changeInput}
    inputLabel="Text or Base64 value"
    inputPlaceholder="Paste text or a Base64 value…"
    outputLabel="Converted result"
    outputPlaceholder="Your Base64 result or decoded text will appear here…"
    result={result}
    actions={base64Actions}
    onAction={transform}
    onClear={clear}
    onReset={reset}
    onCopy={() => copyText(result, 'Base64 result')}
    status={status}
    copyMessage={copyMessage}
    tone={tone}
  />;
}
