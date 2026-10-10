import { ArrowDown, ArrowRight, ArrowUpRight, Calculator, Clapperboard, Code2, FileText, Image, LockKeyhole, Sparkles, TrendingUp, WandSparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import SearchField from '../components/common/SearchField.jsx';
import FeatureMarquee from '../components/common/FeatureMarquee.jsx';
import { platformStats, toolCategories } from '../data/siteContent.js';
import ToolCard from '../components/common/ToolCard.jsx';
import { tools } from '../data/tools.js';

const categoryIcons = {
  Text: FileText,
  Developer: Code2,
  SEO: TrendingUp,
  Image,
  PDF: FileText,
  'Calculators & Financial Tools': Calculator,
  'Social Media & Video Tools': Clapperboard,
  'AI & Smart Generators': WandSparkles,
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
          <div className="dashboard-window">
            <div className="dashboard-window-header">
              <span className="dashboard-window-controls"><i /><i /><i /></span>
              <span className="dashboard-brand-label">HavitGrowth workspace</span>
              <span className="dashboard-status"><span /> READY</span>
            </div>
            <div className="dashboard-stat-grid">
              <div className="dashboard-stat dashboard-stat--violet"><span>Speed</span><strong>Instant</strong><small>Runs in your browser</small></div>
              <div className="dashboard-stat dashboard-stat--blue"><span>Useful tools</span><strong>17</strong><small>Ready for your workflow</small></div>
              <div className="dashboard-stat dashboard-stat--green"><span>Privacy</span><strong>Local</strong><small>Your text stays yours</small></div>
            </div>
            <div className="dashboard-activity">
              <div className="dashboard-activity-heading"><span><Sparkles size={14} aria-hidden="true" /> Your workspace</span><span className="dashboard-live">PRIVATE BY DESIGN</span></div>
              <div className="dashboard-chart" aria-hidden="true">
                {[34, 55, 42, 71, 49, 84, 61, 45, 74, 52, 91, 63, 47, 77, 57, 68].map((height, index) => <span className="dashboard-chart-bar" style={{ '--bar-height': `${height}%` }} key={`${height}-${index}`} />)}
              </div>
              <div className="dashboard-chart-labels"><span>Write</span><span>Format</span><span>Convert</span><span>Keep moving</span></div>
            </div>
          </div>
          <div className="hero-float hero-float--developer"><span className="hero-float-icon hero-float-icon--violet"><Code2 size={17} /></span><span><small>DEVELOPER TOOLS</small><strong>Clear, useful helpers</strong></span></div>
          <div className="hero-float hero-float--private"><span className="hero-float-icon hero-float-icon--green"><LockKeyhole size={16} /></span><span><small>YOUR CONTENT</small><strong>Stays on your device</strong></span></div>
          <div className="hero-float hero-float--seo"><span className="hero-float-icon hero-float-icon--blue"><TrendingUp size={16} /></span><span><small>TEXT WORKFLOW</small><strong>Less busywork</strong></span></div>
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

      <FeatureMarquee />

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
            const Icon = categoryIcons[category.name] ?? FileText;
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
          <p>Small jobs deserve tools that are quick to understand and easy to trust. HavitGrowth keeps the experience focused from the first click.</p>
        </div>
        <div className="principle-list">
          <article className="principle-item"><span className="principle-index">01</span><div><h3>Made for the task</h3><p>Clear interfaces that get out of your way.</p></div><Zap size={17} aria-hidden="true" /></article>
          <article className="principle-item"><span className="principle-index">02</span><div><h3>Private by default</h3><p>Browser-first processing for everyday text tools.</p></div><LockKeyhole size={17} aria-hidden="true" /></article>
          <article className="principle-item"><span className="principle-index">03</span><div><h3>Built to keep growing</h3><p>A tidy library, easy to come back to.</p></div><Sparkles size={17} aria-hidden="true" /></article>
        </div>
      </section>

      <section className="journal-section page-container" id="blog" aria-labelledby="journal-title">
        <Link className="journal-card" to="/blog">
          <div className="journal-mark" aria-hidden="true"><span>m</span></div>
          <div><Badge tone="neutral">HAVITGROWTH GUIDES</Badge><h2 id="journal-title">Ideas for getting good work done.</h2><p>Short reads on useful workflows, thoughtful tools, and making room for focus.</p></div>
          <span className="journal-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </Link>
      </section>
    </>
  );
}
