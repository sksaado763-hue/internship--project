import { useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/common/Badge.jsx';
import ToolCard from '../components/common/ToolCard.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { tools } from '../data/tools.js';

export default function ToolsPage({ onSearchTermChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const query = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'All tools';
  const popularOnly = searchParams.get('popular') === 'true';
  const newOnly = searchParams.get('new') === 'true';
  const availableCategories = ['All tools', ...new Set(tools.map((tool) => tool.category)), 'Favorites'];

  useEffect(() => {
    onSearchTermChange?.(query);
  }, [onSearchTermChange, query]);

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return tools.filter((tool) => {
      const matchesSearch = !normalizedQuery || [tool.name, tool.description, tool.category, ...tool.tags]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesCategory = category === 'All tools' || (category === 'Favorites'
        ? favorites.includes(tool.slug)
        : tool.category.toLocaleLowerCase() === category.toLocaleLowerCase());
      return matchesSearch && matchesCategory && (!popularOnly || tool.isPopular) && (!newOnly || tool.isNew);
    });
  }, [category, favorites, newOnly, popularOnly, query]);

  function updateSearch(value) {
    onSearchTermChange?.(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  }

  function selectCategory(value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'All tools') next.delete('category');
    else next.set('category', value);
    setSearchParams(next, { replace: true });
  }

  return (
    <section className="directory-page page-container" id="tool-directory" aria-labelledby="directory-title">
      <header className="directory-header">
        <Badge tone="brand"><Sparkles size={13} aria-hidden="true" /> YOUR TOOLBOX, IN ONE PLACE</Badge>
        <h1 id="directory-title">Find the right tool.<br /><span>Get back to your work.</span></h1>
        <p>Quick, private tools for everyday writing and text tasks. Everything runs directly in your browser.</p>
      </header>
      <div className="directory-controls">
        <label className="directory-search" htmlFor="directory-search-input"><Search size={18} aria-hidden="true" /><span className="visually-hidden">Search tools</span><input id="directory-search-input" type="search" value={query} onChange={(event) => updateSearch(event.target.value)} placeholder="Search by tool, task, or keyword" autoComplete="off" /></label>
        <span className="directory-result-count" aria-live="polite">{visibleTools.length} {visibleTools.length === 1 ? 'tool' : 'tools'}</span>
      </div>
      <div className="directory-filters" aria-label="Filter tools by category">
        <span className="filter-icon"><SlidersHorizontal size={15} aria-hidden="true" /> Filter</span>
        {availableCategories.map((item) => <button type="button" key={item} className={`filter-chip ${category === item ? 'is-active' : ''}`} aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
      </div>
      {visibleTools.length ? <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div> : (
        <div className="directory-empty" role="status"><Search size={22} aria-hidden="true" /><h2>No tools found</h2><p>Try another search, or switch the category filter.</p><button className="text-link" type="button" onClick={() => { setSearchParams({}, { replace: true }); }}>Clear filters</button></div>
      )}
    </section>
  );
}
