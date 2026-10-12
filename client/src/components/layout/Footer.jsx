import { useState } from 'react';
import { ArrowRight, ChevronRight, Cpu, Facebook, Instagram, MoveUpRight, Music2, Star, Twitter } from 'lucide-react';
import { footerSections } from '../../data/siteContent.js';
import robotMascot from '../../assets/robot-mascot.png';

const socialLinks = [
  { label: 'Facebook', icon: Facebook },
  { label: 'Twitter', icon: Twitter },
  { label: 'Instagram', icon: Instagram },
  { label: 'TikTok', icon: Music2 },
];

export default function Footer({ onComingSoon }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (event) => {
    event.preventDefault();
    setEmail('');
    onComingSoon('Newsletter');
  };

  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-main">
          <div className="footer-brand-column" id="about">
            <a className="brand footer-brand" href="/#home" aria-label="HavitGrowth home">
              <span className="brand-mark"><span aria-hidden="true">H</span></span>
              <span className="footer-brand-text">
                <span className="footer-brand-name">Havit<span className="brand-light">Growth</span></span>
                <small>Next-gen web suite</small>
              </span>
            </a>
            <p className="footer-tagline">High-performance, secure, and free online utilities for writers, webmasters, and developer workflows.</p>
            <span className="footer-engine-badge"><Cpu size={14} aria-hidden="true" /> WebAssembly CPU/GPU Engine</span>
            <h2 className="footer-connect-title">Connect with us</h2>
            <div className="social-links" aria-label="Social links">
              {socialLinks.map(({ label, icon: Icon }) => (
                <button key={label} type="button" className="icon-button social-link" aria-label={`${label} — coming soon`} onClick={() => onComingSoon(label)}>
                  <Icon size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {footerSections.map(({ title, icon: Icon, links }) => (
            <div className="footer-column" key={title}>
              <h2><Icon size={15} aria-hidden="true" /> {title}</h2>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    <a className="footer-link" href={link.href}>
                      {link.highlight
                        ? <Star size={11} fill="currentColor" aria-hidden="true" />
                        : <ChevronRight size={12} aria-hidden="true" />}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="footer-newsletter" aria-label="Newsletter">
          <div className="footer-newsletter-copy">
            <h2>Stay updated</h2>
            <p>Subscribe to our newsletter for SEO optimization tips and developer utilities releases.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" aria-label="Email address" />
            <button className="footer-subscribe" type="submit">Subscribe <ArrowRight size={15} aria-hidden="true" /></button>
          </form>
          <img className="footer-mascot" src={robotMascot} alt="" aria-hidden="true" />
        </section>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HavitGrowth. Made for useful work.</span>
          <div className="footer-legal">
            <button type="button" className="footer-link" onClick={() => onComingSoon('Privacy policy')}><ChevronRight size={12} aria-hidden="true" />Privacy</button>
            <button type="button" className="footer-link" onClick={() => onComingSoon('Terms')}><ChevronRight size={12} aria-hidden="true" />Terms</button>
            <button type="button" className="footer-link" onClick={() => onComingSoon('Cookie policy')}><ChevronRight size={12} aria-hidden="true" />Cookies</button>
          </div>
          <a className="back-to-top" href="/#home">Back to top <MoveUpRight size={13} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
