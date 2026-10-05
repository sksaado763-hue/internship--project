import { useState } from 'react';
import TextTransformWorkspace from './TextTransformWorkspace.jsx';
import useCopyText from '../../hooks/useCopyText.js';

function toSlug(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SlugGeneratorTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const { copyMessage, copyText, clearCopyMessage } = useCopyText();

  function changeInput(value) {
    setInput(value);
    setResult('');
    clearCopyMessage();
  }

  function clear() {
    setInput('');
    setResult('');
    clearCopyMessage();
  }

  return <TextTransformWorkspace
    id="slug-generator"
    input={input}
    onInputChange={changeInput}
    inputLabel="Title or phrase"
    inputPlaceholder="For example: A Guide to Better Writing!"
    outputLabel="URL slug"
    outputPlaceholder="your-url-slug-will-appear-here"
    result={result}
    actions={[{ id: 'generate', label: 'Generate slug' }]}
    onAction={() => { setResult(toSlug(input)); clearCopyMessage(); }}
    onClear={clear}
    onReset={clear}
    onCopy={() => copyText(result, 'URL slug')}
    status={copyMessage || 'Accents are normalized and spaces or punctuation become hyphens.'}
  />;
}
