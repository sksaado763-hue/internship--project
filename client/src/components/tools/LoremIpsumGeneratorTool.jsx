import { useMemo, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import useCopyText from '../../hooks/useCopyText.js';

const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur'.split(' ');

function makeParagraph(seed, sentenceCount) {
  let cursor = seed;
  const nextWord = () => { const word = words[cursor % words.length]; cursor += 1; return word; };
  return Array.from({ length: sentenceCount }, (_, sentenceIndex) => {
    const length = 8 + ((seed + sentenceIndex * 7) % 10);
    const sentence = Array.from({ length }, nextWord).join(' ');
    return `${sentence[0].toUpperCase()}${sentence.slice(1)}.`;
  }).join(' ');
}

export default function LoremIpsumGeneratorTool() {
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);
  const { copyMessage, copyText } = useCopyText();
  const paragraphs = useMemo(() => Array.from({ length: count }, (_, index) => makeParagraph(seed + index * 13, 3 + ((index + seed) % 2))), [count, seed]);
  const output = paragraphs.join('\n\n');

  return <div className="tool-editor tool-form-stack">
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="lorem-count">Paragraphs</label><span>{count} {count === 1 ? 'paragraph' : 'paragraphs'}</span></div>
      <input id="lorem-count" className="tool-value-input" type="number" min="1" max="10" value={count} onChange={(event) => setCount(Math.max(1, Math.min(10, Number(event.target.value) || 1)))} />
    </section>
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="lorem-output">Placeholder text</label><span>{output.split(/\s+/).filter(Boolean).length} words</span></div>
      <textarea id="lorem-output" className="tool-textarea" value={output} readOnly aria-live="polite" />
    </section>
    <div className="tool-action-row"><p className="tool-inline-status" aria-live="polite">{copyMessage || 'Generated instantly in your browser.'}</p><div className="tool-actions">
      <button className="button button--secondary" type="button" onClick={() => setSeed((current) => current + 5)}><RefreshCw size={14} /> Regenerate</button>
      <button className="button button--primary" type="button" onClick={() => copyText(output, 'Placeholder text')}><Copy size={14} /> Copy text</button>
    </div></div>
  </div>;
}
