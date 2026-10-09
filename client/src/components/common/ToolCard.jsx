import { ArrowRight, ArrowUpRight, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';

export default function ToolCard({ tool, variant = 'default' }) {
  const { favorites, toggleFavorite } = useFavorites();
  const Icon = tool.icon;
  const isFavorite = favorites.includes(tool.slug);
  const isDirectoryCard = variant === 'directory';
  const favoriteButton = (
    <button
      className={`icon-button favorite-toggle ${isFavorite ? 'is-favorite' : ''}`}
      type="button"
      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${tool.name} ${isFavorite ? 'from' : 'to'} favorites`}
      aria-pressed={isFavorite}
      onClick={(event) => { event.stopPropagation(); toggleFavorite(tool.slug); }}
    >
      <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );

  return (
    <article className={`tool-card ${isDirectoryCard ? 'tool-card--directory' : ''}`}>
      <Link className="tool-card-hit-area" to={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`} />
      <div className="tool-card-topline">
        <span className="tool-card-icon"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
        {isDirectoryCard ? <div className="tool-card-meta"><span className="tool-card-category-pill">{tool.category === 'AI & Smart Generators' ? 'AI powered' : tool.category}</span>{favoriteButton}</div> : favoriteButton}
      </div>
      <div className="tool-card-heading">
        <h3>{tool.name}</h3>
        {!isDirectoryCard && tool.isPopular && <span className="tool-card-popular">POPULAR</span>}
      </div>
      <p>{tool.description}</p>
      <div className="tool-card-footer">
        {isDirectoryCard ? <span className="tool-card-free"><Zap size={14} fill="currentColor" aria-hidden="true" /> Free tool</span> : <span className="tool-card-category">{tool.category} tools</span>}
        <span className={`tool-card-open ${isDirectoryCard ? 'tool-card-open--circle' : ''}`} aria-hidden="true">
          {isDirectoryCard ? <ArrowRight size={17} aria-hidden="true" /> : <>Open tool <ArrowUpRight size={15} aria-hidden="true" /></>}
        </span>
      </div>
    </article>
  );
}
