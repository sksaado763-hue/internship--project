import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Boxes, ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import SearchField from '../common/SearchField.jsx';
import { mainNavigation } from '../../data/siteContent.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Navbar({ searchTerm, onSearchTermChange, onSearchSubmit, onLogin }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
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
            : activeHash === item.href || (activeHash === '' && item.href === '/#home');
          return (
            <Link
              key={item.label}
              className={`nav-link ${isActive ? 'is-active' : ''}`}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={onNavigate}
            >
              {item.label}
              {item.label === 'Categories' && <ChevronDown className="nav-chevron" size={13} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <header className="site-header">
      <div className="nav-shell page-container">
        <Link className="brand" to="/#home" aria-label="Meridian Tools home">
          <span className="brand-mark"><Boxes size={31} strokeWidth={2.2} aria-hidden="true" /></span>
          <span>meridian<span className="brand-light">.tools</span></span>
        </Link>

        {renderNavigation('desktop-nav')}

        <div className="nav-actions">
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
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
          <button className="login-link" type="button" onClick={onLogin}>Log in</button>
          <Button as="a" href="/tools" variant="primary" size="small" className="nav-cta">Get started</Button>
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
            <button className="login-link" type="button" onClick={() => { setMenuOpen(false); onLogin(); }}>Log in</button>
            <Button as="a" href="/tools" variant="primary" onClick={() => setMenuOpen(false)}>Get started</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
