import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Brain, Boxes, Bot, BrainCircuit, Gamepad2, Keyboard,
  Lightbulb, Puzzle, ShieldCheck, Sparkles, Swords, Triangle, Zap,
} from 'lucide-react';
import {
  ColorGame, MemoryGame, PuzzleGame, ReflexGame, SnakeGame, TicTacToe,
  TypingGame, WordleGame,
} from '../components/games/ArcadeGames.jsx';
import { Pong, RubiksCube } from '../components/games/PhysicsGames.jsx';
import { gameGuides } from '../data/gameGuides.js';

const GAMES = [
  { slug: 'rubiks-cube', title: "3D Rubik's Cube", tag: '3D CUBE', categories: ['3D Games', 'Puzzle & Brain'], description: 'Turn each face, scramble the stickers, and work your way back to a solved cube.', action: 'Play cube', icon: Boxes, tone: 'cyan', component: RubiksCube, controls: 'Drag to orbit · face buttons or U R F D L B to turn' },
  { slug: 'cyber-pong', title: 'Cyber Pong', tag: 'ARCADE', categories: ['3D Games', 'Retro Arcade'], description: 'Serve against an adaptive paddle bot. First to seven points wins the match.', action: 'Start match', icon: Swords, tone: 'violet', component: Pong, controls: 'Mouse, touch, ↑ / ↓, or W / S · Space pauses' },
  { slug: 'memory-flip', title: 'Memory Flip', tag: 'BRAIN TEST', categories: ['3D Games', 'Puzzle & Brain'], description: 'Find every matching pair in as few moves as you can. Choose your board size.', action: 'Match cards', icon: Brain, tone: 'pink', component: MemoryGame, controls: 'Tap or click two cards to find a matching pair' },
  { slug: 'reflex-test', title: 'Reflex Speed Test', tag: 'REFLEX TEST', categories: ['Viral Hits', 'Puzzle & Brain'], description: 'Wait for the signal, then react. Five rounds reveal your average response time.', action: 'Test reflexes', icon: Zap, tone: 'rose', component: ReflexGame, controls: 'Wait for the green signal · early taps restart the round' },
  { slug: 'color-matrix', title: 'Color Matrix', tag: 'COLOR MEMORY', categories: ['Puzzle & Brain'], description: 'Watch the lights, repeat the sequence, and see how far your memory can go.', action: 'Play pattern', icon: Triangle, tone: 'orange', component: ColorGame, controls: 'Remember the pattern and tap each color in order' },
  { slug: 'wordle', title: 'Wordle Daily', tag: 'DAILY WORD', categories: ['Viral Hits', 'Puzzle & Brain'], description: 'A fresh five-letter word every day. Solve it in six guesses and share your result.', action: 'Guess the word', icon: LetterIcon, tone: 'orange', component: WordleGame, controls: 'Type on your keyboard or use the on-screen keys' },
  { slug: '2048', title: '2048 Puzzle', tag: 'PUZZLE HIT', categories: ['Puzzle & Brain'], description: 'Slide matching tiles together, build your score, and reach the 2048 tile.', action: 'Play 2048', icon: Sparkles, tone: 'cyan', component: PuzzleGame, controls: 'Arrow keys or WASD · swipe or use controls on mobile' },
  { slug: 'tic-tac-toe', title: 'AI Tic-Tac-Toe', tag: 'MINIMAX AI', categories: ['Puzzle & Brain'], description: 'Take on an unbeatable AI or switch to local two-player mode for a quick match.', action: 'Play Tic-Tac-Toe', icon: Bot, tone: 'rose', component: TicTacToe, controls: 'Choose a square · switch between AI and local play' },
  { slug: 'snake', title: 'Cyber Snake', tag: 'RETRO ARCADE', categories: ['Retro Arcade'], description: 'Collect glowing fruit, grow your snake, and avoid walls and your own tail.', action: 'Play Snake', icon: Gamepad2, tone: 'green', component: SnakeGame, controls: 'Arrows / WASD · swipe or use the direction pad · Space pauses' },
  { slug: 'typing-race', title: 'Speed Typing Race', tag: 'WPM SPEED', categories: ['Viral Hits'], description: 'Take a timed typing sprint and track live speed, accuracy, and your personal best.', action: 'Start typing', icon: Keyboard, tone: 'orange', component: TypingGame, controls: 'Pick a time, start the test, and type the passage as shown' },
];

const FILTERS = [
  { label: 'All 10 Games', icon: null },
  { label: '3D Games', icon: Boxes },
  { label: 'Viral Hits', icon: Sparkles },
  { label: 'Puzzle & Brain', icon: Puzzle },
  { label: 'Retro Arcade', icon: Gamepad2 },
];

function LetterIcon({ size = 24 }) { return <span className="games-letter-icon" style={{ width: size, height: size }}>A</span>; }

export default function GamesPage() {
  const { slug } = useParams(); const navigate = useNavigate(); const [category, setCategory] = useState('All 10 Games');
  const selected = GAMES.find((game) => game.slug === slug); const Playable = selected?.component;
  const guide = selected ? gameGuides[selected.slug] : null;
  const visibleGames = category === 'All 10 Games' ? GAMES : GAMES.filter((game) => game.categories.includes(category));
  if (slug && !selected) return <section className="games-page page-container"><h1>Game not found</h1><Link className="arcade-button arcade-button--primary" to="/games">Back to games</Link></section>;
  return <section className={`games-page page-container ${selected ? 'games-page--detail' : ''}`} aria-labelledby="games-title">
    {selected ? <>
      <div className="game-detail-nav"><button className="games-back" onClick={() => navigate('/games')}><ArrowLeft size={17} /> All games</button><span>{selected.tag}<span className="game-nav-dot">•</span> {selected.controls}</span></div>
      <header className="game-detail-heading"><div className={`game-icon game-icon--${selected.tone}`}><selected.icon size={27} /></div><div className="game-detail-copy"><span className={`game-tag game-tag--${selected.tone}`}>{selected.categories[0]}</span><h1 id="games-title">{selected.title}</h1><p>{selected.description}</p></div></header>
      <div className="game-play-area"><Playable /></div>
      {guide && <article className="game-guide" aria-labelledby="game-guide-title">
        <h2 id="game-guide-title">{guide.title}</h2>
        <p className="game-guide-intro">{guide.intro}</p>
        {guide.sections.map((section) => <section className="game-guide-section" key={section.title}>
          <h3>{section.title}</h3>
          {section.paragraphs.map((paragraph, index) => <p key={`${section.title}-${index}`}>{paragraph}</p>)}
        </section>)}
      </article>}
      <div className="game-detail-next"><span><BrainCircuit size={16} /> Take a quick break. Your progress saves in this browser.</span><button onClick={() => navigate('/games')}>Browse all games <ArrowRight size={15} /></button></div>
    </> : <>
      <header className="games-heading"><span className="games-eyebrow"><Gamepad2 size={18} /> BROWSER ARCADE · FREE TO PLAY</span><h1 id="games-title">HavitGrowth Arcade <span>&amp; Mini Games</span></h1><p>Quick brain breaks, word challenges, retro arcade classics, and strategy games—all free to play, with no downloads or account required.</p><nav className="games-categories" aria-label="Filter games by category">{FILTERS.map(({ label, icon: Icon }) => <button type="button" key={label} className={`games-category ${category === label ? 'is-active' : ''}`} aria-pressed={category === label} onClick={() => setCategory(label)}>{Icon && <Icon size={17} aria-hidden="true" />}{label}</button>)}</nav></header>
      <div className="games-grid">{visibleGames.map((game) => { const Icon = game.icon; return <Link to={`/games/${game.slug}`} className={`game-card game-card--${game.tone}`} key={game.slug}><div className="game-card-top"><span className={`game-icon game-icon--${game.tone}`}><Icon size={25} /></span><span className={`game-tag game-tag--${game.tone}`}>{game.tag}</span></div><h2>{game.title}</h2><p>{game.description}</p><div className="game-card-footer"><span>{game.action}</span><ArrowRight size={19} /></div></Link>; })}</div>
      <div className="games-note"><BrainCircuit size={17} /><span>Showing {visibleGames.length} of 10 games · Choose a card to play</span><Lightbulb size={17} /></div>
      <section className="games-benefits" aria-labelledby="games-benefits-title"><h2 id="games-benefits-title">Why Play Games on HavitGrowth?</h2><p className="games-benefits-intro">Take a quick break with free games that launch instantly in your browser. Challenge your memory, sharpen your reflexes, or relax with a classic puzzle—no downloads or account needed.</p><div className="games-benefit-grid"><article className="games-benefit-card games-benefit-card--orange"><Zap size={27} aria-hidden="true" /><h3>Zero Installation</h3><p>Play on mobile or desktop without downloading plugins, apps, or extra software.</p></article><article className="games-benefit-card games-benefit-card--cyan"><Boxes size={27} aria-hidden="true" /><h3>Interactive Games</h3><p>Enjoy colorful browser games with smooth controls and responsive layouts.</p></article><article className="games-benefit-card games-benefit-card--green"><ShieldCheck size={27} aria-hidden="true" /><h3>Free &amp; Private</h3><p>No account required. Your game progress stays in your browser while you play.</p></article></div></section>
    </>}
  </section>;
}
