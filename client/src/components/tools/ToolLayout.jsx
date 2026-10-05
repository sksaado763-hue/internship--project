import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import ToolCard from '../common/ToolCard.jsx';
import { tools } from '../../data/tools.js';

export default function ToolLayout({ tool, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const relatedTools = tools.filter((item) => item.slug !== tool.slug).slice(0, 2);

  function goBack() {
    navigate(location.key === 'default' ? '/tools' : -1);
  }

  return (
    <div className="tool-page page-container">
      <div className="tool-page-topbar">
        <Button variant="secondary" size="small" type="button" onClick={goBack}><ArrowLeft size={15} aria-hidden="true" /> Go back</Button>
        <nav className="tool-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/tools">All tools</Link><span aria-hidden="true">/</span><span aria-current="page">{tool.name}</span>
        </nav>
      </div>
      <header className="tool-page-header">
        <Badge tone="brand">{tool.category.toUpperCase()} TOOL</Badge>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
      </header>
      <section className="tool-workspace" aria-label={`${tool.name} workspace`}>
        {children}
        <div className="tool-privacy-note"><LockKeyhole size={14} aria-hidden="true" /><span>Your text is processed in this browser and is never uploaded.</span></div>
      </section>
      <section className="related-tools" aria-labelledby="related-title">
        <div className="related-tools-heading"><div><span className="eyebrow">KEEP YOUR FLOW</span><h2 id="related-title">Related tools</h2></div><Link className="text-link" to="/tools">All tools <ArrowRight size={15} aria-hidden="true" /></Link></div>
        <div className="tool-grid">{relatedTools.map((item) => <ToolCard key={item.id} tool={item} />)}</div>
      </section>
      <div className="tool-back-link"><Link to="/tools"><ArrowLeft size={15} aria-hidden="true" /> Back to all tools</Link></div>
    </div>
  );
}
