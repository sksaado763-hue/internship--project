import { useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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
        <h1 id="directory-title">Explore All <span>{tools.length} Tools</span></h1>
        <p>Filter tools by category or search by keyword below.</p>
      </header>
      <div className="directory-controls">
        <label className="directory-search" htmlFor="directory-search-input"><Search size={21} aria-hidden="true" /><span className="visually-hidden">Search tools</span><input id="directory-search-input" type="search" value={query} onChange={(event) => updateSearch(event.target.value)} placeholder={`Search ${tools.length} tools by name or keyword`} autoComplete="off" /></label>
        <span className="directory-result-count" aria-live="polite">Showing {visibleTools.length} of {tools.length} tools</span>
      </div>
      <div className="directory-filters" role="group" aria-label="Filter tools by category">
        {availableCategories.map((item) => <button type="button" key={item} className={`filter-chip ${category === item ? 'is-active' : ''}`} aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
      </div>
      {visibleTools.length ? <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} variant="directory" />)}</div> : (
        <div className="directory-empty" role="status"><Search size={22} aria-hidden="true" /><h2>No tools found</h2><p>Try another search, or switch the category filter.</p><button className="text-link" type="button" onClick={() => { setSearchParams({}, { replace: true }); }}>Clear filters</button></div>
      )}
    </section>
  );
}
