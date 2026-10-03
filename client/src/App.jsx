import { ArrowRight, Boxes, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <main className="welcome-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Meridian Tools home">
          <span className="brand-mark"><Boxes size={19} strokeWidth={2.2} /></span>
          <span>meridian<span className="brand-light">.tools</span></span>
        </a>
        <span className="status"><span className="status-dot" /> Platform foundation</span>
      </nav>

      <section className="hero" aria-labelledby="welcome-title">
        <div className="eyebrow"><Sparkles size={14} /> BUILT FOR YOUR EVERYDAY WORK</div>
        <h1 id="welcome-title">Useful tools.<br /><span>Clear thinking.</span></h1>
        <p className="intro">A calmer home for the small tasks that keep your work moving. The foundation is in place; the first tools are next.</p>
        <a className="primary-link" href="#foundation">Explore the foundation <ArrowRight size={17} /></a>
      </section>

      <section id="foundation" className="foundation" aria-label="Platform foundation">
        <article className="foundation-card">
          <span className="card-icon"><Boxes size={20} /></span>
          <h2>One home for tools</h2>
          <p>A React app ready to grow from a few focused tools into a useful platform.</p>
          <span className="card-meta">REACT · VITE</span>
        </article>
        <article className="foundation-card">
          <span className="card-icon"><ShieldCheck size={20} /></span>
          <h2>Private by default</h2>
          <p>The first text tools will process in your browser, without sending your text to the API.</p>
          <span className="card-meta">CLIENT-SIDE PROCESSING</span>
        </article>
        <article className="foundation-card api-card">
          <span className="card-icon"><Sparkles size={20} /></span>
          <h2>A ready API layer</h2>
          <p>An Express service and MongoDB connection point provide a base for future catalog data.</p>
          <span className="card-meta">EXPRESS · MONGODB</span>
        </article>
      </section>

      <footer className="page-footer">
        <span>Thoughtful tools for work in motion.</span>
        <span>MERIDIAN TOOLS <span className="footer-dot">·</span> DAY 1</span>
      </footer>
    </main>
  );
}
