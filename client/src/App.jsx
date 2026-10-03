import { lazy, Suspense, useCallback, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteFallback() {
  return <div className="route-fallback" role="status">Loading Meridian Tools…</div>;
}

export default function App() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const submitSearch = useCallback((term) => {
    const cleanedTerm = term.trim();
    setSearchMessage(cleanedTerm
      ? `“${cleanedTerm}” will be searchable when the tool directory arrives in the next build.`
      : 'The tool directory search is coming in the next build.');
    navigate('/#tools');
    window.requestAnimationFrame(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [navigate]);

  return (
    <ThemeProvider>
      <SiteLayout searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearchSubmit={submitSearch}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onSearchSubmit={submitSearch} searchMessage={searchMessage} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </SiteLayout>
    </ThemeProvider>
  );
}
