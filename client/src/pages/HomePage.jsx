import { ArrowDown, ArrowRight, ArrowUpRight, Calculator, Code2, FileText, Image, LockKeyhole, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import SearchField from '../components/common/SearchField.jsx';
import { platformStats, toolCategories } from '../data/siteContent.js';
import ToolCard from '../components/common/ToolCard.jsx';
import { tools } from '../data/tools.js';

const categoryIcons = {
  Text: FileText,
  Developer: Code2,
  SEO: TrendingUp,
  Image,
  PDF: FileText,
  Calculators: Calculator,
};

export default function HomePage({ searchTerm, onSearchTermChange, onSearchSubmit }) {
  return (
    <>
      <section className="home-hero page-container" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Badge tone="brand"><Sparkles size={13} aria-hidden="true" /> YOUR WORK, WITHOUT THE FRICTION</Badge>
          <h1 id="hero-title">Powerful Tools.<br /><span>One Simple Platform.</span></h1>
          <p className="hero-description">Fast, reliable online tools for developers, creators, students, marketers, and everyday tasks.</p>

          <div className="hero-actions">
            <Button as="a" href="/tools" variant="primary">Explore tools <ArrowRight size={16} aria-hidden="true" /></Button>
            <Button as="a" href="/tools?popular=true" variant="secondary">Popular tools <ArrowDown size={15} aria-hidden="true" /></Button>
          </div>

          <div className="hero-search-block">
            <SearchField
              id="home-tool-search"
              value={searchTerm}
              onChange={onSearchTermChange}
              onSubmit={onSearchSubmit}
              placeholder="What would you like to do?"
            />
            <p className="search-assist" aria-live="polite">Search across simple tools for your everyday work.</p>
          </div>

          <div className="hero-proof">
            <span className="proof-icon"><LockKeyhole size={14} aria-hidden="true" /></span>
            <span>Your text stays in your browser</span>
            <span className="proof-divider" aria-hidden="true" />
            <span>Free to use</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit visual-orbit--outer" />
          <div className="visual-orbit visual-orbit--inner" />
          <div className="visual-glow" />
          <div className="visual-panel visual-panel--back">
            <span className="visual-line visual-line--short" />
            <span className="visual-line" />
            <span className="visual-line visual-line--medium" />
            <div className="visual-spark"><Sparkles size={15} /></div>
          </div>
          <div className="visual-panel visual-panel--front">
            <div className="visual-topline"><span /><span /><span /></div>
            <div className="visual-panel-heading">Made for the moment</div>
            <span className="visual-line visual-line--long" />
            <span className="visual-line visual-line--medium" />
            <div className="visual-progress"><span /></div>
            <div className="visual-caption"><Zap size={12} /> QUICK · PRIVATE · FREE</div>
          </div>
          <div className="visual-float visual-float--one"><span className="float-icon float-icon--blue"><FileText size={16} /></span><span>Simple by design</span></div>
          <div className="visual-float visual-float--two"><span className="float-icon float-icon--green"><LockKeyhole size={15} /></span><span>Private by default</span></div>
          <div className="visual-stamp"><span>TOOLS<br />FOR GOOD<br />WORK</span><ArrowUpRight size={15} /></div>
        </div>
      </section>

      <section className="stats-section page-container" aria-label="Platform highlights">
        <div className="stats-grid">
          {platformStats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="category-section page-container" id="categories" aria-labelledby="category-title">
        <div className="section-heading">
          <div>
            <Badge tone="neutral">A LITTLE BIT OF EVERYTHING</Badge>
            <h2 id="category-title">Find your kind of useful.</h2>
            <p>Focused collections for the different things you do every day.</p>
          </div>
          <a className="text-link" href="#tools">Explore the platform <ArrowRight size={15} aria-hidden="true" /></a>
        </div>

        <div className="category-grid">
          {toolCategories.map((category, index) => {
            const Icon = categoryIcons[category.name];
            return (
              <a className={`category-card category-card--${category.color}`} href={`/tools?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span className="category-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="category-copy"><strong>{category.name}</strong><small>{category.detail}</small></span>
                <span className="category-number">0{index + 1}</span>
                <ArrowUpRight className="category-arrow" size={16} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>

      <section className="tool-preview-section" id="tools" aria-labelledby="tools-title">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <Badge tone="brand">READY WHEN YOU ARE</Badge>
              <h2 id="tools-title">Useful tools, ready to use.</h2>
              <p>Pick a tool and get a fast result without sending your text anywhere.</p>
            </div>
            <a className="text-link" href="/tools">Browse all tools <ArrowRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="tool-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </div>
      </section>

      <section className="principles-section page-container" id="about" aria-labelledby="principles-title">
        <div className="principles-copy">
          <Badge tone="neutral">A MORE THOUGHTFUL TOOLBOX</Badge>
          <h2 id="principles-title">Useful should feel simple.</h2>
          <p>Small jobs deserve tools that are quick to understand and easy to trust. Meridian keeps the experience focused from the first click.</p>
        </div>
        <div className="principle-list">
          <article className="principle-item"><span className="principle-index">01</span><div><h3>Made for the task</h3><p>Clear interfaces that get out of your way.</p></div><Zap size={17} aria-hidden="true" /></article>
          <article className="principle-item"><span className="principle-index">02</span><div><h3>Private by default</h3><p>Browser-first processing for everyday text tools.</p></div><LockKeyhole size={17} aria-hidden="true" /></article>
          <article className="principle-item"><span className="principle-index">03</span><div><h3>Built to keep growing</h3><p>A tidy library, easy to come back to.</p></div><Sparkles size={17} aria-hidden="true" /></article>
        </div>
      </section>

      <section className="journal-section page-container" id="blog" aria-labelledby="journal-title">
        <div className="journal-card">
          <div className="journal-mark" aria-hidden="true"><span>m</span></div>
          <div><Badge tone="neutral">FIELD NOTES · COMING SOON</Badge><h2 id="journal-title">Ideas for getting good work done.</h2><p>Short reads on useful workflows, thoughtful tools, and making room for focus.</p></div>
          <span className="journal-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </div>
      </section>
    </>
  );
}
