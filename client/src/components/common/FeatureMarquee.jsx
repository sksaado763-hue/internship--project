import { Code2, FileText, Heart, Image, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const featureRows = [
  {
    direction: 'left',
    items: [
      { label: 'Browser-first tools', icon: Zap, accent: '#ffd85e' },
      { label: 'Text stays on your device', icon: ShieldCheck, accent: '#51e3bd' },
      { label: 'Free core tools', icon: Heart, accent: '#ff8db8' },
      { label: 'Made for everyday work', icon: Sparkles, accent: '#d8a8ff' },
      { label: 'Developer-ready helpers', icon: Code2, accent: '#5de1f1' },
    ],
  },
  {
    direction: 'right',
    items: [
      { label: 'Search tools in one place', icon: Search, accent: '#7ce9f2' },
      { label: 'Format and convert text', icon: FileText, accent: '#ffd85e' },
      { label: 'Image and PDF utilities', icon: Image, accent: '#ff8db8' },
      { label: 'Quick browser processing', icon: Zap, accent: '#51e3bd' },
      { label: 'A growing library of tools', icon: Sparkles, accent: '#d8a8ff' },
    ],
  },
];

function FeatureRow({ direction, items }) {
  return (
    <div className={`feature-marquee-row feature-marquee-row--${direction}`} aria-hidden="true">
      <div className="feature-marquee-track">
        {[0, 1].map((copy) => (
          <div className="feature-marquee-group" key={copy}>
            {items.map(({ label, icon: Icon, accent }) => (
              <span className="feature-marquee-pill" key={label} style={{ '--feature-accent': accent }}>
                <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeatureMarquee() {
  return (
    <section className="feature-marquee" aria-label="HavitGrowth highlights">
      <p className="visually-hidden">Browser-first tools, free core tools, text processed on your device, and useful helpers for everyday work.</p>
      <div className="feature-marquee-rows" aria-hidden="true">
        {featureRows.map((row) => <FeatureRow key={row.direction} {...row} />)}
      </div>
    </section>
  );
}
