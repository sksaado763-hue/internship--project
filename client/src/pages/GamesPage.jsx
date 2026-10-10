import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Brain, Boxes, Bot, BrainCircuit, Gamepad2, Keyboard,
  Lightbulb, Puzzle, RotateCcw, ShieldCheck, Sparkles,
  Swords, Triangle, Zap,
} from 'lucide-react';

const GAMES = [
  { slug: 'rubiks-cube', title: "3D Rubik's Cube", tag: '3D WEBGL', categories: ['3D Games'], description: 'Explore a colorful 3D cube. Drag to rotate it and inspect each face.', action: 'Play 3D Cube', icon: Boxes, tone: 'cyan' },
  { slug: 'cyber-pong', title: '3D Cyber Pong', tag: '3D ARCADE', categories: ['3D Games', 'Retro Arcade'], description: 'Keep the neon ball in play against a tracking paddle bot.', action: 'Play 3D Pong', icon: Swords, tone: 'violet' },
  { slug: 'memory-flip', title: '3D Memory Flip', tag: 'BRAIN TEST', categories: ['3D Games', 'Puzzle & Brain'], description: 'Test your visual brain memory with 3D card flip animations.', action: 'Match Cards', icon: Brain, tone: 'pink' },
  { slug: 'reflex-test', title: 'Reflex Speed Test', tag: 'REFLEX TEST', categories: ['Puzzle & Brain'], description: 'Test your millisecond reaction time speed when screen turns green!', action: 'Test Reflexes', icon: Zap, tone: 'rose' },
  { slug: 'color-matrix', title: 'Color Matrix', tag: 'COLOR MEMORY', categories: ['Puzzle & Brain'], description: 'Simon Says color pattern challenge! Memorize & repeat color flashing.', action: 'Play Color Matrix', icon: ShapesIcon, tone: 'orange' },
  { slug: 'wordle', title: 'Wordle AI Daily', tag: '#1 US/UK VIRAL', categories: ['Viral Hits', 'Puzzle & Brain'], description: 'The #1 daily word puzzle challenge! Guess 5-letter hidden words in 6 tries.', action: 'Play Wordle', icon: LetterIcon, tone: 'orange' },
  { slug: '2048', title: '2048 Cyber Puzzle', tag: 'PUZZLE HIT', categories: ['Puzzle & Brain'], description: 'Famous tile merging number game! Merge 2+2=4 up to 2048 tile.', action: 'Merge 2048', icon: FlameIcon, tone: 'cyan' },
  { slug: 'tic-tac-toe', title: 'AI Tic-Tac-Toe', tag: 'MINIMAX AI', categories: ['Puzzle & Brain'], description: 'Play vs Unbeatable Minimax AI bot or local 2 Player Mode.', action: 'Play Tic-Tac-Toe', icon: Bot, tone: 'rose' },
  { slug: 'snake', title: 'Cyber Snake Arcade', tag: 'RETRO ARCADE', categories: ['Retro Arcade'], description: 'Retro synthwave classic snake arcade! Eat apples & beat high scores.', action: 'Play Snake', icon: Gamepad2, tone: 'green' },
  { slug: 'typing-race', title: 'Speed Typing Race', tag: 'WPM SPEED', categories: ['Viral Hits'], description: 'Test typing speed in Words Per Minute (WPM) with live accuracy charts.', action: 'Test WPM Speed', icon: Keyboard, tone: 'orange' },
];

function ShapesIcon(props) { return <Triangle {...props} />; }
function LetterIcon(props) { return <span className="games-letter-icon" {...props}>A</span>; }
function FlameIcon(props) { return <Sparkles {...props} />; }

function freshCards() {
  const cards = ['🍋', '🍋', '🍇', '🍇', '🍒', '🍒', '🥝', '🥝', '🍉', '🍉', '🍊', '🍊'];
  return cards.sort(() => Math.random() - 0.5);
}

function MemoryGame() {
  const [cards, setCards] = useState(freshCards);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    if (open.length !== 2) return undefined;
    const timer = window.setTimeout(() => {
      if (cards[open[0]] === cards[open[1]]) setMatched((value) => [...value, ...open]);
      setOpen([]);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [open, cards]);
  const restart = () => { setCards(freshCards()); setOpen([]); setMatched([]); setMoves(0); };
  return <>
    <div className="game-stats"><span>Moves <b>{moves}</b></span><span>Pairs <b>{matched.length / 2}/6</b></span><button className="game-reset" onClick={restart}><RotateCcw size={15} /> Restart</button></div>
    <div className="memory-board">{cards.map((card, i) => <button key={i} className={`memory-card ${open.includes(i) || matched.includes(i) ? 'is-flipped' : ''}`} onClick={() => { if (open.length < 2 && !open.includes(i) && !matched.includes(i)) { setOpen((value) => [...value, i]); if (open.length === 1) setMoves((value) => value + 1); } }} aria-label={open.includes(i) || matched.includes(i) ? card : 'Hidden card'}>{open.includes(i) || matched.includes(i) ? card : '?'}</button>)}</div>
    {matched.length === cards.length && <p className="game-success">All pairs matched! Great memory.</p>}
  </>;
}

function ReflexGame() {
  const [phase, setPhase] = useState('ready');
  const [result, setResult] = useState(null);
  const [startedAt, setStartedAt] = useState(0);
  const start = () => { setResult(null); setPhase('wait'); window.setTimeout(() => { setStartedAt(Date.now()); setPhase((current) => current === 'wait' ? 'go' : current); }, 1200 + Math.random() * 2600); };
  return <button className={`reflex-zone reflex-zone--${phase}`} onClick={() => { if (phase === 'ready' || phase === 'done' || phase === 'early') start(); else if (phase === 'wait') { setPhase('early'); setResult(null); } else { setResult(Date.now() - startedAt); setPhase('done'); } }}><Zap size={30} /><strong>{phase === 'ready' ? 'Tap to start' : phase === 'wait' ? 'Wait for green…' : phase === 'go' ? 'TAP NOW!' : phase === 'early' ? 'Too soon — tap to try again' : `${result} ms · tap to retry`}</strong></button>;
}

const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6'];
function ColorGame() {
  const [sequence, setSequence] = useState([]);
  const [turn, setTurn] = useState([]);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('Start a pattern');
  const showSequence = useCallback(async (next) => {
    setPlaying(true); setTurn([]); setMessage('Watch carefully…');
    for (let i = 0; i < next.length; i += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 480)); setActive(next[i]);
      await new Promise((resolve) => window.setTimeout(resolve, 350)); setActive(-1);
    }
    setPlaying(false); setMessage('Your turn');
  }, []);
  const start = () => { const next = [Math.floor(Math.random() * 4)]; setSequence(next); showSequence(next); };
  const press = (color) => {
    if (playing || !sequence.length) return;
    const next = [...turn, color]; setTurn(next);
    if (sequence[next.length - 1] !== color) { setMessage('Not quite — start a new game'); setSequence([]); return; }
    if (next.length === sequence.length) { const longer = [...sequence, Math.floor(Math.random() * 4)]; setSequence(longer); window.setTimeout(() => showSequence(longer), 550); }
  };
  return <><div className="game-stats"><span>{message}</span><span>Level <b>{sequence.length}</b></span></div><div className="color-board">{COLORS.map((color, i) => <button key={color} aria-label={`Color ${i + 1}`} style={{ '--tile-color': color }} className={active === i ? 'is-lit' : ''} onClick={() => press(i)} />)}</div><button className="button button--secondary color-start" onClick={start}>Start pattern</button></>;
}

const WORDS = ['CRANE', 'PLANT', 'BRICK', 'SHINE', 'GHOST', 'FRAME', 'CLOUD', 'GRAPE'];
function WordleGame() {
  const answer = useMemo(() => { const now = new Date(); const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000); return WORDS[day % WORDS.length]; }, []);
  const [guess, setGuess] = useState(''); const [rows, setRows] = useState([]); const [message, setMessage] = useState('');
  const submit = (event) => { event.preventDefault(); if (guess.length !== 5) { setMessage('Enter a 5-letter word.'); return; } const next = [...rows, guess.toUpperCase()]; setRows(next); setGuess(''); setMessage(next.at(-1) === answer ? 'You got it!' : next.length === 6 ? `The word was ${answer}.` : ''); };
  return <><div className="wordle-grid">{Array.from({ length: 6 }, (_, row) => <div className="wordle-row" key={row}>{Array.from({ length: 5 }, (_, col) => { const value = rows[row]?.[col] ?? (row === rows.length ? guess.toUpperCase()[col] : ''); const state = rows[row] ? (answer[col] === value ? 'correct' : answer.includes(value) ? 'present' : 'absent') : ''; return <span className={`wordle-cell ${state}`} key={col}>{value || ''}</span>; })}</div>)}</div><form className="wordle-form" onSubmit={submit}><input aria-label="Your five-letter guess" value={guess} onChange={(e) => setGuess(e.target.value.replace(/[^a-z]/gi, '').slice(0, 5))} maxLength={5} placeholder="Your guess" disabled={rows.length >= 6 || rows.includes(answer)} /><button className="button button--primary" disabled={rows.length >= 6 || rows.includes(answer)}>Guess</button></form><p className="game-message" aria-live="polite">{message || `${6 - rows.length} guesses remaining`}</p></>;
}

const make2048 = () => { const board = Array(16).fill(0); board[Math.floor(Math.random() * 16)] = 2; return board; };
function PuzzleGame() {
  const [board, setBoard] = useState(make2048); const [score, setScore] = useState(0);
  const move = useCallback((direction) => { setBoard((current) => { const next = [...current]; const lines = Array.from({ length: 4 }, (_, i) => direction === 'left' || direction === 'right' ? [0, 1, 2, 3].map((j) => i * 4 + j) : [0, 1, 2, 3].map((j) => j * 4 + i)); let gained = 0; for (const line of lines) { let values = line.map((i) => current[i]).filter(Boolean); if (direction === 'right' || direction === 'down') values.reverse(); for (let j = 0; j < values.length - 1; j += 1) if (values[j] === values[j + 1]) { values[j] *= 2; gained += values[j]; values.splice(j + 1, 1); } while (values.length < 4) values.push(0); if (direction === 'right' || direction === 'down') values.reverse(); line.forEach((index, j) => { next[index] = values[j]; }); } const empty = next.map((v, i) => v ? -1 : i).filter((i) => i >= 0); if (empty.length) next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < .1 ? 4 : 2; setScore((v) => v + gained); return next; }); }, []);
  useEffect(() => { const key = (e) => { const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }; if (map[e.key]) { e.preventDefault(); move(map[e.key]); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [move]);
  return <><div className="game-stats"><span>Use arrow keys to merge tiles</span><span>Score <b>{score}</b></span><button className="game-reset" onClick={() => { setBoard(make2048()); setScore(0); }}>New game</button></div><div className="puzzle-board">{board.map((n, i) => <div className={`puzzle-cell ${n ? `tile-${Math.min(n, 2048)}` : ''}`} key={i}>{n || ''}</div>)}</div><div className="puzzle-controls">{['←', '↑', '↓', '→'].map((arrow, i) => <button key={arrow} onClick={() => move(['left', 'up', 'down', 'right'][i])}>{arrow}</button>)}</div></>;
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill('')); const [turn, setTurn] = useState('X'); const [mode, setMode] = useState('ai');
  const winner = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].find(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  const finish = winner || board.every(Boolean); const play = (i) => { if (board[i] || finish) return; const next = [...board]; next[i] = turn; setBoard(next); setTurn(turn === 'X' ? 'O' : 'X'); };
  const resultOf = (cells) => [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].find(([a,b,c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
  const bestMove = (cells, player) => {
    const result = resultOf(cells);
    if (result) return { score: cells[result[0]] === 'O' ? 10 : -10 };
    const options = cells.map((cell, index) => cell ? null : index).filter((index) => index !== null);
    if (!options.length) return { score: 0 };
    const choices = options.map((index) => { const next = [...cells]; next[index] = player; return { index, score: bestMove(next, player === 'O' ? 'X' : 'O').score }; });
    return choices.reduce((best, item) => player === 'O' ? item.score > best.score ? item : best : item.score < best.score ? item : best, { score: player === 'O' ? -Infinity : Infinity });
  };
  useEffect(() => {
    if (mode !== 'ai' || turn !== 'O' || finish) return;
    const timer = window.setTimeout(() => { const choice = bestMove(board, 'O'); if (choice.index !== undefined) { setBoard((cells) => { const next = [...cells]; if (!next[choice.index]) next[choice.index] = 'O'; return next; }); setTurn('X'); } }, 350);
    return () => window.clearTimeout(timer);
  }, [board, finish, mode, turn]);
  const reset = () => { setBoard(Array(9).fill('')); setTurn('X'); };
  return <><div className="game-stats"><span>{winner ? `${board[winner[0]]} wins!` : finish ? 'It’s a draw.' : mode === 'ai' && turn === 'O' ? 'AI is thinking…' : mode === 'ai' ? 'Your turn (X)' : `Player ${turn}'s turn`}</span><button className="game-reset" onClick={() => setMode((value) => value === 'ai' ? 'local' : 'ai')}>{mode === 'ai' ? 'Play local' : 'Play AI'}</button><button className="game-reset" onClick={reset}>Reset</button></div><div className="tic-board">{board.map((cell, i) => <button key={i} className={cell ? `mark-${cell.toLowerCase()}` : ''} onClick={() => play(i)} disabled={mode === 'ai' && turn === 'O'} aria-label={`Square ${i + 1}${cell ? `, ${cell}` : ''}`}>{cell}</button>)}</div></>;
}

function SnakeGame() {
  const [snake, setSnake] = useState([42, 41, 40]); const [food, setFood] = useState(22); const [running, setRunning] = useState(false); const [direction, setDirection] = useState('right'); const [score, setScore] = useState(0);
  useEffect(() => { const key = (e) => { const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }; if (keys[e.key]) { e.preventDefault(); setDirection(keys[e.key]); setRunning(true); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, []);
  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => { setSnake((current) => { const head = current[0]; const next = head + (direction === 'right' ? 1 : direction === 'left' ? -1 : direction === 'down' ? 10 : -10); if (next < 0 || next >= 100 || (direction === 'right' && head % 10 === 9) || (direction === 'left' && head % 10 === 0) || current.includes(next)) { setRunning(false); return current; } if (next === food) { setFood(Math.floor(Math.random() * 100)); setScore((v) => v + 1); return [next, ...current]; } return [next, ...current.slice(0, -1)]; }); }, 180); return () => window.clearInterval(timer); }, [direction, food, running]);
  return <><div className="game-stats"><span>Arrow keys to move</span><span>Apples <b>{score}</b></span><button className="game-reset" onClick={() => { setSnake([42,41,40]); setFood(22); setScore(0); setDirection('right'); setRunning(true); }}>Start / reset</button></div><div className="snake-board" role="img" aria-label={`Snake game board, ${score} apples eaten`}>{Array.from({ length: 100 }, (_, i) => <span key={i} className={snake.includes(i) ? 'snake-part' : i === food ? 'snake-food' : ''}>{i === food ? '●' : ''}</span>)}</div>{!running && <p className="game-message">{score ? 'Game over! Start again to play.' : 'Press Start / reset or an arrow key.'}</p>}</>;
}

const TYPING_TEXT = 'Small steps every day lead to remarkable journeys.';
function TypingGame() {
  const [value, setValue] = useState(''); const [started, setStarted] = useState(0); const [done, setDone] = useState(false);
  const update = (text) => { if (!started) setStarted(Date.now()); setValue(text); if (text === TYPING_TEXT) setDone(true); };
  const elapsed = started ? Math.max(1, (Date.now() - started) / 60000) : 1;
  return <><p className="typing-prompt">{TYPING_TEXT.split('').map((char, i) => <span className={i < value.length ? value[i] === char ? 'typed-correct' : 'typed-wrong' : ''} key={`${char}-${i}`}>{char}</span>)}</p><textarea className="typing-input" aria-label="Type the sentence above" value={value} onChange={(e) => update(e.target.value.slice(0, TYPING_TEXT.length))} placeholder="Start typing here…" disabled={done} rows={3} /><div className="game-stats"><span>{done ? 'Finished!' : 'Words per minute'} <b>{done ? Math.round(value.trim().split(/\s+/).length / elapsed) : Math.round(value.length / 5 / elapsed)}</b></span><span>Accuracy <b>{value ? `${Math.round(value.split('').filter((c, i) => c === TYPING_TEXT[i]).length / value.length * 100)}%` : '100%'}</b></span><button className="game-reset" onClick={() => { setValue(''); setStarted(0); setDone(false); }}>Restart</button></div></>;
}

function CubeGame() {
  const [turn, setTurn] = useState(0);
  return <><p className="game-instructions">Drag the cube to rotate it, or use the buttons to turn each face.</p><div className="cube-stage" onPointerDown={(e) => { e.currentTarget.dataset.x = e.clientX; }} onPointerUp={(e) => { if (e.currentTarget.dataset.x) setTurn((v) => v + (e.clientX > Number(e.currentTarget.dataset.x) ? 1 : -1) * 18); }}><div className="cube" style={{ transform: `rotateX(${-22 + turn}deg) rotateY(${-35 + turn * 1.4}deg)` }}>{['front','back','right','left','top','bottom'].map((face, i) => <div className={`cube-face cube-${face}`} key={face}>{Array.from({ length: 9 }, (_, n) => <span key={n} style={{ '--cube-color': ['#16b9d3','#a855f7','#fb7185','#f59e0b','#22c55e','#3b82f6'][(i + Math.floor(n / 3)) % 6] }} />)}</div>)}</div></div><div className="game-actions"><button className="button button--secondary" onClick={() => setTurn((v) => v + 90)}>Rotate cube</button><button className="button button--primary" onClick={() => setTurn(0)}>Reset view</button></div></>;
}

function PongGame() {
  const [player, setPlayer] = useState(50); const [ball, setBall] = useState({ x: 50, y: 50 }); const [score, setScore] = useState(0); const [running, setRunning] = useState(false);
  useEffect(() => { const key = (event) => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); setPlayer((value) => Math.max(12, Math.min(88, value + (event.key === 'ArrowUp' ? -6 : 6)))); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, []);
  useEffect(() => { if (!running) return undefined; const id = window.setInterval(() => { setBall((v) => { const x = v.x + (v.x > 50 ? -2 : 2); const y = v.y + (Math.random() - .5) * 8; if (x <= 12) { if (Math.abs(player - y) < 17) setScore((s) => s + 1); else setRunning(false); return { x: 88, y: 50 }; } return { x, y: Math.max(5, Math.min(95, y)) }; }); }, 120); return () => window.clearInterval(id); }, [player, running]);
  return <><p className="game-instructions">Move your paddle with the mouse or ↑ and ↓ keys. Keep the ball in play!</p><div className="pong-arena" onPointerMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPlayer(Math.max(12, Math.min(88, (e.clientY - rect.top) / rect.height * 100))); }} onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPlayer(Math.max(12, Math.min(88, (e.clientY - rect.top) / rect.height * 100))); }}><span className="pong-divider" /><span className="pong-paddle pong-left" style={{ top: `${player}%` }} /><span className="pong-paddle pong-right" style={{ top: `${ball.y}%` }} /><span className="pong-ball" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} /><span className="pong-score">{score}</span>{!running && <button className="pong-start" onClick={() => { setBall({ x: 50, y: 50 }); setRunning(true); }}>Start game</button>}</div></>;
}

const GAME_COMPONENTS = { 'rubiks-cube': CubeGame, 'cyber-pong': PongGame, 'memory-flip': MemoryGame, 'reflex-test': ReflexGame, 'color-matrix': ColorGame, wordle: WordleGame, '2048': PuzzleGame, 'tic-tac-toe': TicTacToe, snake: SnakeGame, 'typing-race': TypingGame };

export default function GamesPage() {
  const { slug } = useParams(); const navigate = useNavigate();
  const [category, setCategory] = useState('All 10 Games');
  const selected = GAMES.find((game) => game.slug === slug);
  const categories = [
    { label: 'All 10 Games', icon: null },
    { label: '3D Games', icon: Boxes },
    { label: 'Viral Hits', icon: FlameIcon },
    { label: 'Puzzle & Brain', icon: Puzzle },
    { label: 'Retro Arcade', icon: Gamepad2 },
  ];
  const visibleGames = category === 'All 10 Games' ? GAMES : GAMES.filter((game) => game.categories.includes(category));
  const Playable = selected && GAME_COMPONENTS[selected.slug];
  if (slug && !selected) return <section className="games-page page-container"><h1>Game not found</h1><Link className="button button--secondary" to="/games">Back to games</Link></section>;
  return <section className="games-page page-container" aria-labelledby="games-title">
    {selected ? <><button className="games-back" onClick={() => navigate('/games')}><ArrowLeft size={17} /> All games</button><header className="game-detail-heading"><div className={`game-icon game-icon--${selected.tone}`}><selected.icon size={26} /></div><div><span className={`game-tag game-tag--${selected.tone}`}>{selected.tag}</span><h1 id="games-title">{selected.title}</h1><p>{selected.description}</p></div></header><div className="game-play-area"><Playable /></div></> : <><header className="games-heading"><span className="games-eyebrow"><Gamepad2 size={16} /> US &amp; UK BROWSER GAMES</span><h1 id="games-title">HavitGrowth Arcade <span>&amp; Mini Games</span></h1><p>Play quick browser games: memory and word challenges, retro arcade classics, and AI strategy puzzles—all free, with no downloads or account required.</p><nav className="games-categories" aria-label="Filter games by category">{categories.map(({ label, icon: Icon }) => <button type="button" key={label} className={`games-category ${category === label ? 'is-active' : ''}`} aria-pressed={category === label} onClick={() => setCategory(label)}>{Icon && <Icon size={17} aria-hidden="true" />}{label}</button>)}</nav></header><div className="games-grid">{visibleGames.map((game) => <Link to={`/games/${game.slug}`} className={`game-card game-card--${game.tone}`} key={game.slug}><div className="game-card-top"><span className={`game-icon game-icon--${game.tone}`}><game.icon size={25} /></span><span className={`game-tag game-tag--${game.tone}`}>{game.tag}</span></div><h2>{game.title}</h2><p>{game.description}</p><div className="game-card-footer"><span>{game.action}</span><ArrowRight size={19} /></div></Link>)}</div><div className="games-note"><BrainCircuit size={17} /><span>Showing {visibleGames.length} of 10 games. Choose one to play.</span><Lightbulb size={17} /></div><section className="games-benefits" aria-labelledby="games-benefits-title"><h2 id="games-benefits-title">Why Play Games on HavitGrowth?</h2><p className="games-benefits-intro">Take a quick break with free games that launch instantly in your browser. Challenge your memory, sharpen your reflexes, or relax with a classic puzzle—no downloads or account needed.</p><div className="games-benefit-grid"><article className="games-benefit-card games-benefit-card--orange"><Zap size={27} aria-hidden="true" /><h3>Zero Installation</h3><p>Play on mobile or desktop without downloading plugins, apps, or extra software.</p></article><article className="games-benefit-card games-benefit-card--cyan"><Boxes size={27} aria-hidden="true" /><h3>Interactive Games</h3><p>Enjoy colorful browser games with smooth controls and responsive layouts.</p></article><article className="games-benefit-card games-benefit-card--green"><ShieldCheck size={27} aria-hidden="true" /><h3>Free &amp; Private</h3><p>No account required. Your game progress stays in your browser while you play.</p></article></div></section></>}
  </section>;
}
