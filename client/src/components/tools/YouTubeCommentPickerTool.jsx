import { useMemo, useState } from 'react';
import { Dices, RotateCcw, Trophy } from 'lucide-react';
import Button from '../common/Button.jsx';

function secureIndex(max) {
  if (max <= 1) return 0;
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    const ceiling = Math.floor(0x100000000 / max) * max;
    do { globalThis.crypto.getRandomValues(values); } while (values[0] >= ceiling);
    return values[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export default function YouTubeCommentPickerTool() {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [winnerCount, setWinnerCount] = useState('1');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [winners, setWinners] = useState([]);
  const [status, setStatus] = useState('Paste one comment per line. Names and comments can both be included.');
  const comments = useMemo(() => {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const seen = new Set();
    return lines.filter((line) => {
      if (keyword.trim() && !line.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase())) return false;
      const normalized = line.toLocaleLowerCase().replace(/\s+/g, ' ');
      if (removeDuplicates && seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }, [keyword, removeDuplicates, text]);

  function drawWinners() {
    const pool = [...comments];
    const count = Math.min(Number(winnerCount), pool.length);
    if (!count) { setWinners([]); setStatus('Add eligible comments before drawing a winner.'); return; }
    const selected = [];
    for (let i = 0; i < count; i += 1) selected.push(pool.splice(secureIndex(pool.length), 1)[0]);
    setWinners(selected);
    setStatus(`Selected ${selected.length} winner${selected.length === 1 ? '' : 's'} from ${comments.length} eligible comments.`);
  }

  function resetDraw() { setWinners([]); setStatus(`${comments.length} eligible comments are ready for a new draw.`); }

  return <div className="tool-editor tool-form-stack social-media-editor">
    <label className="calculator-field" htmlFor="youtube-comment-list"><span>Comments · one per line</span><textarea id="youtube-comment-list" className="tool-textarea social-comments-input" value={text} onChange={(event) => { setText(event.target.value); setWinners([]); }} placeholder={'@creator1: This is brilliant!\n@creator2: I would love to win'} /></label>
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="comment-keyword"><span>Optional keyword filter</span><input id="comment-keyword" className="tool-value-input" value={keyword} onChange={(event) => { setKeyword(event.target.value); setWinners([]); }} placeholder="Only include comments containing…" /></label>
      <label className="calculator-field" htmlFor="comment-winner-count"><span>Number of winners</span><select id="comment-winner-count" className="tool-value-input" value={winnerCount} onChange={(event) => setWinnerCount(event.target.value)}>{[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count} winner{count === 1 ? '' : 's'}</option>)}</select></label>
    </div>
    <label className="social-checkbox"><input type="checkbox" checked={removeDuplicates} onChange={(event) => { setRemoveDuplicates(event.target.checked); setWinners([]); }} /><span>Remove duplicate comments</span></label>
    <div className="social-comment-summary"><strong>{comments.length}</strong><span>eligible unique comments</span></div>
    <div className="tool-actions"><Button variant="primary" type="button" disabled={!comments.length} onClick={drawWinners}><Dices size={15} aria-hidden="true" />Draw winner{Number(winnerCount) === 1 ? '' : 's'}</Button><Button variant="secondary" type="button" disabled={!winners.length} onClick={resetDraw}><RotateCcw size={15} aria-hidden="true" />New draw</Button></div>
    {winners.length > 0 && <ol className="social-winner-list" aria-label="Selected winners">{winners.map((winner, index) => <li key={`${winner}-${index}`}><Trophy size={16} aria-hidden="true" /><span>{winner}</span></li>)}</ol>}
    <p className="tool-inline-status" aria-live="polite">{status}</p>
    <p className="tool-inline-status">Paste comments you are authorized to use. This tool does not access YouTube or verify giveaway rules; the draw runs locally from the list you provide.</p>
  </div>;
}
