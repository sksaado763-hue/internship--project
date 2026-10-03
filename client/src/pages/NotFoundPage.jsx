import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="not-found page-container" aria-labelledby="not-found-title">
      <span className="not-found-icon"><Compass size={26} aria-hidden="true" /></span>
      <p className="not-found-code">404 · PAGE NOT FOUND</p>
      <h1 id="not-found-title">Looks like a wrong turn.</h1>
      <p>The page you’re looking for isn’t here yet. Head back to the home page to find your way.</p>
      <Link className="button button--primary button--medium" to="/"><ArrowLeft size={15} aria-hidden="true" /> Back home</Link>
    </section>
  );
}
