import { ArrowRight, LockKeyhole, Sparkles, WandSparkles } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import { tools } from '../data/tools.js';

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-network" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <Badge tone="brand"><WandSparkles size={14} aria-hidden="true" /> ABOUT HAVITGROWTH</Badge>
        <h1 id="about-title">Free, Simple Online Tools for Everyone</h1>
        <p>{tools.length} practical tools for writers, developers, creators, and everyday tasks — all in one place.</p>
      </section>

      <section className="about-story page-container" aria-labelledby="about-story-title">
        <h2 id="about-story-title">What is HavitGrowth?</h2>
        <p><strong>HavitGrowth</strong> is a growing collection of useful online tools built to make everyday work easier. It brings together writing helpers, developer utilities, image and PDF tools, calculators, and creative demos in one simple place, with no account required.</p>
        <p>Many tools process your work directly in your browser. When a tool relies on an external service, it explains what gets sent before you use it. AI features are currently demos; connecting a real AI provider requires its own API and may involve usage costs.</p>
        <div className="about-points">
          <article><span><Sparkles size={18} aria-hidden="true" /></span><div><h3>Made to be straightforward</h3><p>Open a tool, add what you need, and get to the result without a complicated setup.</p></div></article>
          <article><span><LockKeyhole size={18} aria-hidden="true" /></span><div><h3>Clear about your data</h3><p>Browser-based tools keep processing on your device; connected services are identified in the tool.</p></div></article>
        </div>
        <Button as="a" href="/tools" variant="primary" className="about-cta">Explore all tools <ArrowRight size={16} aria-hidden="true" /></Button>
      </section>
    </div>
  );
}
