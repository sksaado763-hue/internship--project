import { lazy, Suspense, useCallback, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';


const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ToolsPage = lazy(() => import('./pages/ToolsPage.jsx'));
const ToolPage = lazy(() => import('./pages/ToolPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteFallback() {
  return <div className="route-fallback" role="status">Loading HavitGrowth…</div>;
}

export default function App() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const submitSearch = useCallback((term) => {
    const cleanedTerm = term.trim();
    setSearchTerm(cleanedTerm);
    const query = new URLSearchParams();
    if (cleanedTerm) query.set('search', cleanedTerm);
    navigate(`/tools${query.size ? `?${query.toString()}` : ''}`);
  }, [navigate]);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <SiteLayout searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearchSubmit={submitSearch}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearchSubmit={submitSearch} />} />
              <Route path="/tools" element={<ToolsPage onSearchTermChange={setSearchTerm} />} />
              <Route path="/all-tools" element={<ToolsPage defaultCategory="AI & Smart Generators" onSearchTermChange={setSearchTerm} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/tools/:slug" element={<ToolPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </SiteLayout>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
