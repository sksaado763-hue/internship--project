import { ArrowRight, Search } from 'lucide-react';

export default function SearchField({
  id,
  value,
  onChange,
  onSubmit,
  placeholder = 'Search tools…',
  compact = false,
  className = '',
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form className={`search-field ${compact ? 'search-field--compact' : ''} ${className}`.trim()} onSubmit={handleSubmit} role="search">
      <label className="visually-hidden" htmlFor={id}>Search HavitGrowth</label>
      <Search size={19} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <button className="search-submit" type="submit" aria-label="Search tools">
        {compact ? <ArrowRight size={17} aria-hidden="true" /> : <span>Search</span>}
      </button>
    </form>
  );
}
