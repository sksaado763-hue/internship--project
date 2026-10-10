import { useState } from 'react';
import { ArrowRight, BookOpen, Code2, Cpu, FileText, Image, LockKeyhole, Search, Sparkles, Star, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge.jsx';
import { blogPosts, blogTopics } from '../data/blogPosts.js';

const topicIcons = {
  'All Topics': BookOpen,
  'AI & Tools': Sparkles,
  Productivity: WandSparkles,
  Writing: FileText,
  Privacy: LockKeyhole,
  Developer: Code2,
  'Images & PDFs': Image,
};

export default function BlogPage() {
  const [topic, setTopic] = useState('All Topics');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const matches = blogPosts.filter((post) => {
    const matchesTopic = topic === 'All Topics' || post.category === topic;
    const matchesQuery = !query || `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(query);
    return matchesTopic && matchesQuery;
  });
  const featured = matches.find((post) => post.featured);
  const articles = matches.filter((post) => post !== featured);
  const relatedPosts = (matches.filter((post) => post !== featured).length >= 3
    ? matches.filter((post) => post !== featured)
    : blogPosts.filter((post) => post !== featured)).slice(0, 3);
  const technologyPosts = matches.filter((post) => ['AI & Tools', 'Developer', 'Images & PDFs'].includes(post.category)).slice(0, 3);
  const remainingArticles = topic === 'All Topics' && !query
    ? articles.filter((post) => !technologyPosts.includes(post))
    : articles;

  return (
    <div className="blog-page">
      <section className="blog-hero" aria-labelledby="blog-title">
        <div className="blog-hero-dots" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <Badge tone="brand"><BookOpen size={14} aria-hidden="true" /> HAVITGROWTH INSIGHTS · PRACTICAL GUIDES</Badge>
        <h1 id="blog-title">Discover useful ideas,<br /><span>tools &amp; smarter workflows</span></h1>
        <p>Clear guides for writing, productivity, privacy, development, and getting more from everyday tools.</p>
        <label className="blog-search" htmlFor="blog-search-input">
          <Search size={22} aria-hidden="true" />
          <span className="visually-hidden">Search articles</span>
          <input id="blog-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles across AI, writing, privacy, developer tools…" />
        </label>
        <div className="blog-topics" role="group" aria-label="Filter articles by topic">
          {blogTopics.map((name) => {
            const Icon = topicIcons[name] ?? BookOpen;
            const count = name === 'All Topics' ? blogPosts.length : blogPosts.filter((post) => post.category === name).length;
            return <button key={name} type="button" className={`blog-topic ${topic === name ? 'is-active' : ''}`} aria-pressed={topic === name} onClick={() => setTopic(name)}><Icon size={16} aria-hidden="true" /><span>{name}</span>{name === 'All Topics' && <small>{count}</small>}</button>;
          })}
        </div>
      </section>

      <section className="blog-content page-container" aria-label="Articles">
        {featured && (
          <div className="blog-featured-block">
            <Badge tone="brand"><Star size={13} fill="currentColor" aria-hidden="true" /> FEATURED</Badge>
            <div className="blog-featured-layout">
              <Link className="blog-featured-card" to={`/blog/${featured.slug}`}>
                <div className="blog-featured-art" aria-hidden="true">
                  <svg className="blog-featured-chart" viewBox="0 0 900 480" preserveAspectRatio="xMidYMid slice">
                    <defs><linearGradient id="featured-chart-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#06151b" /><stop offset=".55" stopColor="#06232d" /><stop offset="1" stopColor="#07131e" /></linearGradient><linearGradient id="featured-chart-line" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#1689a8" /><stop offset="1" stopColor="#87eaff" /></linearGradient></defs>
                    <rect width="900" height="480" fill="url(#featured-chart-bg)" />
                    <g fill="#17a3c5" opacity=".25"><rect x="20" y="320" width="44" height="160" /><rect x="110" y="350" width="44" height="130" /><rect x="205" y="278" width="44" height="202" /><rect x="300" y="310" width="44" height="170" /><rect x="397" y="226" width="44" height="254" /><rect x="493" y="250" width="44" height="230" /><rect x="588" y="181" width="44" height="299" /><rect x="684" y="205" width="44" height="275" /><rect x="780" y="135" width="44" height="345" /></g>
                    <path d="M0 410 L110 376 L205 399 L300 330 L397 311 L493 286 L588 250 L684 224 L780 160 L900 93" fill="none" stroke="url(#featured-chart-line)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 425 L110 380 L205 450 L300 315 L397 355 L493 252 L588 338 L684 205 L780 270 L900 125" fill="none" stroke="#a8f1ff" strokeWidth="2" opacity=".82" />
                    <g fill="#d9fbff"><circle cx="205" cy="450" r="5" /><circle cx="493" cy="252" r="5" /><circle cx="588" cy="338" r="5" /><circle cx="780" cy="270" r="5" /><circle cx="900" cy="125" r="5" /></g>
                  </svg>
                  <span className="blog-featured-category">{featured.category}</span>
                  <span className="blog-art-tag">HavitGrowth guide</span>
                </div>
                <div className="blog-featured-copy"><h2>{featured.title}</h2><p>{featured.excerpt}</p><span className="blog-read-link">Read featured guide <ArrowRight size={16} aria-hidden="true" /></span><small>{featured.readTime}</small></div>
              </Link>
              <aside className="blog-related" aria-label="Related stories">
                <h2>Related stories</h2>
                <div className="blog-related-list">{relatedPosts.map((post, index) => <Link className="blog-related-item" to={`/blog/${post.slug}`} key={post.slug}>
                  <span className={`blog-related-thumb blog-related-thumb--${index % 3}`} aria-hidden="true">{post.category === 'Developer' ? <Code2 size={24} /> : post.category === 'Privacy' ? <LockKeyhole size={24} /> : post.category === 'Images & PDFs' ? <Image size={24} /> : post.category === 'Writing' ? <FileText size={24} /> : <Sparkles size={24} />}</span>
                  <span className="blog-related-copy"><span className="blog-related-category">{post.category}</span><strong>{post.title}</strong></span>
                </Link>)}</div>
              </aside>
            </div>
          </div>
        )}

        {technologyPosts.length > 0 && topic === 'All Topics' && !query && (
          <section className="blog-topic-section" aria-labelledby="blog-technology-title">
            <div className="blog-topic-heading">
              <h2 id="blog-technology-title"><span><Cpu size={20} aria-hidden="true" /></span>Technology</h2>
              <a href="#all-guides" className="blog-view-all">View all <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
            <div className="blog-technology-grid">
              {technologyPosts.map((post, index) => <Link className="blog-article-card blog-technology-card" to={`/blog/${post.slug}`} key={post.slug}>
                <span className={`blog-card-art blog-technology-art blog-technology-art--${index}`} aria-hidden="true">
                  <span>{post.category === 'Developer' ? <Code2 size={34} /> : post.category === 'Images & PDFs' ? <Image size={34} /> : <Sparkles size={34} />}</span>
                  <small>Technology</small>
                </span>
                <div className="blog-article-copy"><h3>{post.title}</h3><p>{post.excerpt}</p><span className="blog-card-footer"><small>{post.readTime}</small><span className="blog-read-link">Read article <ArrowRight size={15} aria-hidden="true" /></span></span></div>
              </Link>)}
            </div>
          </section>
        )}

        <div className="blog-list-heading" id="all-guides"><div><h2>{topic === 'All Topics' ? 'Latest guides' : `${topic} guides`}</h2><p>{matches.length} {matches.length === 1 ? 'article' : 'articles'} to explore</p></div></div>
        {remainingArticles.length ? <div className="blog-article-grid">{remainingArticles.map((post, index) => <Link className="blog-article-card" to={`/blog/${post.slug}`} key={post.slug}><span className={`blog-card-art blog-card-art--${index % 4}`} aria-hidden="true"><span>{post.category === 'Developer' ? <Code2 size={29} /> : post.category === 'Privacy' ? <LockKeyhole size={29} /> : post.category === 'Images & PDFs' ? <Image size={29} /> : post.category === 'Writing' ? <FileText size={29} /> : <Sparkles size={29} />}</span></span><div className="blog-article-copy"><span className="blog-post-category">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="blog-read-link">Read article <ArrowRight size={15} aria-hidden="true" /></span><small>{post.readTime}</small></div></Link>)}</div> : !featured && <div className="blog-empty" role="status"><Search size={25} aria-hidden="true" /><h2>No articles found</h2><p>Try another search or choose a different topic.</p><button type="button" className="blog-reset" onClick={() => { setSearch(''); setTopic('All Topics'); }}>Clear filters</button></div>}
      </section>
    </div>
  );
}
