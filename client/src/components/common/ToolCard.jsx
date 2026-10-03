import { ArrowUpRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';

export default function ToolCard({ tool }) {
  const { favorites, toggleFavorite } = useFavorites();
  const Icon = tool.icon;
  const isFavorite = favorites.includes(tool.slug);

  return (
    <article className="tool-card">
      <div className="tool-card-topline">
        <span className="tool-card-icon"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
        <button
          className={`icon-button favorite-toggle ${isFavorite ? 'is-favorite' : ''}`}
          type="button"
          aria-label={`${isFavorite ? 'Remove' : 'Add'} ${tool.name} ${isFavorite ? 'from' : 'to'} favorites`}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(tool.slug)}
        >
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="tool-card-heading">
        <h3><Link to={`/tools/${tool.slug}`}>{tool.name}</Link></h3>
        {tool.isPopular && <span className="tool-card-popular">POPULAR</span>}
      </div>
      <p>{tool.description}</p>
      <div className="tool-card-footer">
        <span className="tool-card-category">{tool.category} tools</span>
        <Link className="tool-card-open" to={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`}>
          Open tool <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
