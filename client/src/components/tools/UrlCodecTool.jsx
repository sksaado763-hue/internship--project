import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';
import { convertUrl, urlActions } from '../../utils/tools/urlCodec.js';

export default function UrlCodecTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('Encode reserved characters for URL parameters, or decode percent-encoded text.');
  const [tone, setTone] = useState('neutral');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function changeInput(value) {
    setInput(value);
    setResult('');
    setStatus('Choose whether to encode or decode a component or full URL.');
    setTone('neutral');
    clearCopyMessage();
  }

  function transform(action) {
    try {
      setResult(convertUrl(input, action));
      setStatus(`${urlActions.find((item) => item.id === action)?.label} complete.`);
      setTone('success');
    } catch {
      setResult('');
      setStatus('Could not decode this value. Check that its percent-encoding is complete.');
      setTone('error');
    }
    clearCopyMessage();
  }

  function clear() {
    setInput('');
    setStatus('Encode reserved characters for URL parameters, or decode percent-encoded text.');
    setTone('neutral');
    clearCopyMessage();
  }

  function reset() {
    clear();
    setResult('');
  }

  return <TextTransformWorkspace
    id="url-codec"
    input={input}
    onInputChange={changeInput}
    inputLabel="URL or text"
    inputPlaceholder="Paste a URL or a URL-encoded value…"
    outputLabel="Converted result"
    outputPlaceholder="Your encoded or decoded result will appear here…"
    result={result}
    actions={urlActions}
    onAction={transform}
    onClear={clear}
    onReset={reset}
    onCopy={() => copyText(result, 'URL result')}
    status={status}
    copyMessage={copyMessage}
    tone={tone}
  />;
}
