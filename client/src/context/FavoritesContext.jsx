import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesContext = createContext(null);
const FAVORITES_KEY = 'meridian-favorite-tools';

function readFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((slug) => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Favorites still work for the current session when storage is unavailable.
    }
  }, [favorites]);

  const toggleFavorite = useCallback((slug) => {
    setFavorites((current) => current.includes(slug)
      ? current.filter((favorite) => favorite !== slug)
      : [...current, slug]);
  }, []);

  const value = useMemo(() => ({ favorites, toggleFavorite }), [favorites, toggleFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
