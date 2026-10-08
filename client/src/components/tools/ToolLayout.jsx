import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, Maximize2, Minimize2, Share2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import ToolCard from '../common/ToolCard.jsx';
import { tools } from '../../data/tools.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';

const RECENT_TOOLS_KEY = 'meridian-recent-tools';

function readRecentTools() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_TOOLS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((slug) => typeof slug === 'string' && tools.some((tool) => tool.slug === slug)) : [];
  } catch {
    return [];
  }
}

export default function ToolLayout({ tool, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceRef = useRef(null);
  const [focusMode, setFocusMode] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [recentTools, setRecentTools] = useState(readRecentTools);
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(tool.slug);
  const relatedTools = [...tools.filter((item) => item.slug !== tool.slug && item.category === tool.category), ...tools.filter((item) => item.slug !== tool.slug && item.category !== tool.category)].slice(0, 2);
  const recent = recentTools.filter((slug) => slug !== tool.slug).slice(0, 4).map((slug) => tools.find((item) => item.slug === slug)).filter(Boolean);

  useEffect(() => {
    const next = [tool.slug, ...readRecentTools().filter((slug) => slug !== tool.slug)].slice(0, 6);
    setRecentTools(next);
    try { window.localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next)); } catch { /* Recent tools still work for this page view. */ }
  }, [tool.slug]);

  useEffect(() => {
    if (!focusMode) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setFocusMode(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusMode]);

  useEffect(() => {
    function onShortcut(event) {
      if (!(event.ctrlKey || event.metaKey) || !workspaceRef.current) return;
      if (event.key === 'Enter') {
        const buttons = [...workspaceRef.current.querySelectorAll('.case-action:not(:disabled), .tool-actions button:not(:disabled)')];
        const action = buttons.find((button) => /generate|compare|format|convert|encode|decode|create|run|copy/i.test(button.textContent))
          ?? buttons.find((button) => !/clear|reset/i.test(button.textContent));
        if (action) { event.preventDefault(); action.click(); }
      }
      if (event.shiftKey && event.key.toLowerCase() === 'c') {
        const copy = workspaceRef.current.querySelector('.tool-actions .button--primary:not(:disabled), .tool-actions button:not(:disabled)[aria-label*="Copy"]');
        if (copy) { event.preventDefault(); copy.click(); }
      }
    }
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  async function shareTool() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: tool.name, text: `Try ${tool.name} on HavitGrowth`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShareMessage('Link copied');
        window.setTimeout(() => setShareMessage(''), 2200);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Could not share this link');
    }
  }

  function goBack() {
    navigate(location.key === 'default' ? '/tools' : -1);
  }

  return (
    <div className="tool-page page-container">
      <div className="tool-page-topbar">
        <Button variant="secondary" size="small" type="button" onClick={goBack}><ArrowLeft size={15} aria-hidden="true" /> Go back</Button>
        <nav className="tool-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/tools">All tools</Link><span aria-hidden="true">/</span><span aria-current="page">{tool.name}</span>
        </nav>
      </div>
      <header className="tool-page-header">
        <Badge tone="brand">{tool.category.toUpperCase()} TOOL</Badge>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
        <div className="tool-page-actions">
          <Button variant="secondary" size="small" type="button" aria-pressed={isFavorite} onClick={() => toggleFavorite(tool.slug)}><Heart size={15} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />{isFavorite ? 'Saved to favorites' : 'Add to favorites'}</Button>
          <Button variant="secondary" size="small" type="button" onClick={shareTool}><Share2 size={15} aria-hidden="true" />{shareMessage || 'Share tool'}</Button>
          <Button variant="secondary" size="small" type="button" aria-pressed={focusMode} onClick={() => setFocusMode((active) => !active)}>{focusMode ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}{focusMode ? 'Exit focus mode' : 'Focus mode'}</Button>
        </div>
      </header>
      {focusMode && <button className="focus-mode-backdrop" type="button" aria-label="Exit focus mode" onClick={() => setFocusMode(false)} />}
      <section ref={workspaceRef} className={`tool-workspace ${focusMode ? 'is-focused' : ''}`} aria-label={`${tool.name} workspace`}>
        {focusMode && <div className="focus-mode-bar"><span>{tool.name} · Focus mode</span><Button variant="secondary" size="small" type="button" onClick={() => setFocusMode(false)}><Minimize2 size={14} aria-hidden="true" /> Exit <kbd>Esc</kbd></Button></div>}
        {children}
        <div className="tool-privacy-note"><LockKeyhole size={14} aria-hidden="true" /><span>Your text is processed in this browser and is never uploaded.</span><span className="tool-shortcut-hints"><kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> run&nbsp; · &nbsp;<kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> copy</span></div>
      </section>
      {recent.length > 0 && <nav className="recent-tool-strip" aria-label="Recently used tools"><span>Recent</span>{recent.map((item) => <Link key={item.slug} to={`/tools/${item.slug}`}>{item.name}</Link>)}</nav>}
      <section className="related-tools" aria-labelledby="related-title">
        <div className="related-tools-heading"><div><span className="eyebrow">KEEP YOUR FLOW</span><h2 id="related-title">Related tools</h2></div><Link className="text-link" to="/tools">All tools <ArrowRight size={15} aria-hidden="true" /></Link></div>
        <div className="tool-grid">{relatedTools.map((item) => <ToolCard key={item.id} tool={item} />)}</div>
      </section>
      <div className="tool-back-link"><Link to="/tools"><ArrowLeft size={15} aria-hidden="true" /> Back to all tools</Link></div>
    </div>
  );
}
