import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Boxes, Heart, Menu, Moon, Search, Sun, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import SearchField from '../common/SearchField.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { mainNavigation } from '../../data/siteContent.js';

export default function Navbar({ searchTerm, onSearchTermChange, onSearchSubmit, onLogin }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(`${window.location.pathname}${window.location.hash || '#home'}`);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setActiveHash(`${location.pathname}${location.hash || '#home'}`);
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  function handleSearchSubmit(value) {
    setSearchOpen(false);
    setMenuOpen(false);
    onSearchSubmit(value);
  }

  function renderNavigation(className, onNavigate) {
    return (
      <nav className={className} aria-label={className.includes('mobile') ? 'Mobile navigation' : 'Main navigation'}>
        {mainNavigation.map((item) => {
          const isActive = item.href === '/tools'
            ? location.pathname.startsWith('/tools')
            : item.href === '/blog'
              ? location.pathname.startsWith('/blog')
              : item.href === '/about'
                ? location.pathname === '/about'
                : activeHash === item.href || (activeHash === '' && item.href === '/#home');
          const isExternal = item.href.startsWith('mailto:');
          const NavigationLink = isExternal ? 'a' : Link;
          return (
            <NavigationLink
              key={item.label}
              className={`nav-link ${isActive ? 'is-active' : ''}`}
              {...(isExternal ? { href: item.href } : { to: item.href })}
              aria-current={isActive ? 'page' : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </NavigationLink>
          );
        })}
      </nav>
    );
  }

  return (
    <header className="site-header">
      <div className="nav-shell page-container">
        <Link className="brand" to="/#home" aria-label="HavitGrowth home">
          <span className="brand-mark"><Boxes size={49} strokeWidth={2.2} aria-hidden="true" /></span>
          <span>Havit<span className="brand-light">Growth</span></span>
        </Link>

        {renderNavigation('desktop-nav')}

        <div className="nav-actions">
          <Link className="icon-button nav-favorites-toggle" to="/tools?category=Favorites" aria-label="View favorite tools" title="Favorite tools">
            <Heart size={19} aria-hidden="true" />
          </Link>
          <button className="icon-button nav-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
          <button
            className={`icon-button nav-search-toggle ${searchOpen ? 'is-selected' : ''}`}
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search tools'}
            aria-expanded={searchOpen}
            aria-controls="header-search"
            onClick={() => setSearchOpen((isOpen) => !isOpen)}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <div className={`header-search-panel ${searchOpen ? 'is-open' : ''}`} id="header-search" aria-hidden={!searchOpen} inert={!searchOpen}>
          <SearchField
            id="header-tool-search"
            value={searchTerm}
            onChange={onSearchTermChange}
            onSubmit={handleSearchSubmit}
            placeholder="Find a tool or category"
            compact
          />
          <span className="search-hint">Press Enter to search</span>
        </div>

        <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!menuOpen} inert={!menuOpen}>
          {renderNavigation('mobile-nav', () => setMenuOpen(false))}
          <div className="mobile-menu-actions">
            <button className="mobile-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
              {theme === 'light' ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
              {theme === 'light' ? 'Dark theme' : 'Light theme'}
            </button>
            <button className="login-link" type="button" onClick={() => { setMenuOpen(false); onLogin(); }}>Log in</button>
            <Button as="a" href="/tools" variant="primary" onClick={() => setMenuOpen(false)}>Get started</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
