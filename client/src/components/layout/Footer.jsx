import { Github, Linkedin, Mail, MoveUpRight } from 'lucide-react';
import { footerSections } from '../../data/siteContent.js';

const socialLinks = [
  { label: 'GitHub', icon: Github },
  { label: 'LinkedIn', icon: Linkedin },
  { label: 'Email', icon: Mail },
];

export default function Footer({ onComingSoon }) {
  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-main">
          <div className="footer-brand-column" id="about">
            <a className="brand" href="/#home" aria-label="HavitGrowth home">
              <span className="brand-mark"><span aria-hidden="true">H</span></span>
              <span>Havit<span className="brand-light">Growth</span></span>
            </a>
            <p>Thoughtful online tools that make everyday work feel a little lighter.</p>
            <div className="social-links" aria-label="Social links">
              {socialLinks.map(({ label, icon: Icon }) => (
                <button key={label} type="button" className="icon-button social-link" aria-label={`${label} — coming soon`} onClick={() => onComingSoon(label)}>
                  <Icon size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div className="footer-column" key={section.title}>
              <h2>{section.title}</h2>
              <ul>
                {section.links.map((link) => {
                  const isPlaceholder = ['/#privacy', '/#terms', '/#cookies'].includes(link.href);
                  return (
                    <li key={link.label}>
                      {isPlaceholder ? (
                        <button type="button" className="footer-link" onClick={() => onComingSoon(link.label)}>{link.label}</button>
                      ) : (
                        <a className="footer-link" href={link.href}>{link.label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HavitGrowth. Made for useful work.</span>
          <a className="back-to-top" href="/#home">Back to top <MoveUpRight size={13} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
