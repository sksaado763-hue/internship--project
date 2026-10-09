import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../components/common/Badge.jsx';
import { blogPosts } from '../data/blogPosts.js';

export default function BlogArticlePage() {
  const { slug } = useParams();
  const post = blogPosts.find((article) => article.slug === slug);

  if (!post) return <section className="blog-article-not-found page-container"><h1>Article not found</h1><Link to="/blog"><ArrowLeft size={15} aria-hidden="true" /> Back to the blog</Link></section>;

  return (
    <article className="blog-reading-page page-container">
      <Link className="blog-back-link" to="/blog"><ArrowLeft size={15} aria-hidden="true" /> All articles</Link>
      <header className="blog-reading-header"><Badge tone="brand"><BookOpen size={13} aria-hidden="true" /> {post.category}</Badge><h1>{post.title}</h1><p>{post.excerpt}</p><span>{post.readTime} · HavitGrowth Guides</span></header>
      <div className="blog-reading-art" aria-hidden="true"><BookOpen size={48} /></div>
      <div className="blog-reading-body">{post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <Link className="blog-back-link blog-back-link--bottom" to="/blog"><ArrowLeft size={15} aria-hidden="true" /> Back to all articles <ArrowRight size={15} aria-hidden="true" /></Link>
    </article>
  );
}
