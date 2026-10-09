import { useState } from 'react';
import { ArrowRight, BookOpen, Code2, FileText, Image, LockKeyhole, Search, Sparkles, Star, WandSparkles } from 'lucide-react';
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
            const Icon = topicIcons[name];
            const count = name === 'All Topics' ? blogPosts.length : blogPosts.filter((post) => post.category === name).length;
            return <button key={name} type="button" className={`blog-topic ${topic === name ? 'is-active' : ''}`} aria-pressed={topic === name} onClick={() => setTopic(name)}><Icon size={16} aria-hidden="true" /><span>{name}</span>{name === 'All Topics' && <small>{count}</small>}</button>;
          })}
        </div>
      </section>

      <section className="blog-content page-container" aria-label="Articles">
        {featured && (
          <div className="blog-featured-block">
            <Badge tone="brand"><Star size={13} fill="currentColor" aria-hidden="true" /> FEATURED</Badge>
            <Link className="blog-featured-card" to={`/blog/${featured.slug}`}>
              <div className="blog-featured-art" aria-hidden="true"><div className="blog-art-orbit blog-art-orbit--one" /><div className="blog-art-orbit blog-art-orbit--two" /><span className="blog-art-icon"><WandSparkles size={46} /></span><span className="blog-art-tag">HavitGrowth guide</span></div>
              <div className="blog-featured-copy"><span className="blog-post-category">{featured.category}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><span className="blog-read-link">Read featured guide <ArrowRight size={16} aria-hidden="true" /></span><small>{featured.readTime}</small></div>
            </Link>
          </div>
        )}

        <div className="blog-list-heading"><div><h2>{topic === 'All Topics' ? 'Latest guides' : `${topic} guides`}</h2><p>{matches.length} {matches.length === 1 ? 'article' : 'articles'} to explore</p></div></div>
        {articles.length ? <div className="blog-article-grid">{articles.map((post, index) => <Link className="blog-article-card" to={`/blog/${post.slug}`} key={post.slug}><span className={`blog-card-art blog-card-art--${index % 4}`} aria-hidden="true"><span>{post.category === 'Developer' ? <Code2 size={29} /> : post.category === 'Privacy' ? <LockKeyhole size={29} /> : post.category === 'Images & PDFs' ? <Image size={29} /> : post.category === 'Writing' ? <FileText size={29} /> : <Sparkles size={29} />}</span></span><div className="blog-article-copy"><span className="blog-post-category">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="blog-read-link">Read article <ArrowRight size={15} aria-hidden="true" /></span><small>{post.readTime}</small></div></Link>)}</div> : !featured && <div className="blog-empty" role="status"><Search size={25} aria-hidden="true" /><h2>No articles found</h2><p>Try another search or choose a different topic.</p><button type="button" className="blog-reset" onClick={() => { setSearch(''); setTopic('All Topics'); }}>Clear filters</button></div>}
      </section>
    </div>
  );
}
