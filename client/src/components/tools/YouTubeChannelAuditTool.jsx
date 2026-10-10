import { useMemo, useState } from 'react';
import { Check, CircleHelp, SearchCheck } from 'lucide-react';

const initial = { name: '', niche: '', description: '', subscribers: '', averageViews: '', uploads: '2', titles: '' };

function auditChannel(values) {
  const titleList = values.titles.split(/\r?\n/).map((title) => title.trim()).filter(Boolean);
  const subscribers = Number(values.subscribers);
  const views = Number(values.averageViews);
  const uploads = Number(values.uploads);
  const description = values.description.trim();
  const checks = [
    { title: 'Clear channel identity', score: values.name.trim().length >= 3 && values.niche.trim().length >= 3 ? 20 : values.name.trim() || values.niche.trim() ? 10 : 0, detail: values.name.trim() && values.niche.trim() ? 'Channel name and topic are provided.' : 'Add a recognizable name and a specific audience or topic.' },
    { title: 'Channel description', score: description.length >= 250 ? 20 : description.length >= 100 ? 14 : description.length >= 40 ? 8 : 0, detail: description.length >= 250 ? 'Description has enough room to explain the channel.' : 'Add a fuller description that explains what viewers can expect.' },
    { title: 'Calls to action', score: /subscribe|watch|follow|contact|newsletter|link/i.test(description) ? 10 : 0, detail: /subscribe|watch|follow|contact|newsletter|link/i.test(description) ? 'Description includes a next step for viewers.' : 'Consider adding one useful next step or channel link.' },
    { title: 'Publishing cadence', score: Number.isFinite(uploads) && uploads >= 4 ? 20 : Number.isFinite(uploads) && uploads >= 1 ? 14 : Number.isFinite(uploads) && uploads > 0 ? 8 : 0, detail: uploads >= 4 ? 'Your entered cadence is at least weekly.' : 'A consistent, sustainable schedule helps viewers know when to return.' },
    { title: 'Video title samples', score: titleList.length >= 5 ? 20 : titleList.length >= 3 ? 15 : titleList.length > 0 ? 8 : 0, detail: titleList.length >= 3 ? `${titleList.length} recent titles are available to review.` : 'Add at least three recent video titles to assess packaging consistency.' },
    { title: 'Views compared with subscribers', score: subscribers > 0 && views / subscribers >= 0.25 ? 10 : subscribers > 0 && views / subscribers >= 0.05 ? 7 : subscribers > 0 && views >= 0 ? 4 : 0, detail: subscribers > 0 ? `Entered average view ratio: ${(views / subscribers * 100).toFixed(1)}%. Compare it over time, not as a standalone grade.` : 'Enter subscribers and average views for this rough engagement signal.' },
  ];
  const score = checks.reduce((sum, check) => sum + check.score, 0);
  return { checks, score, sampleTitles: titleList };
}

export default function YouTubeChannelAuditTool() {
  const [values, setValues] = useState(initial);
  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const audit = useMemo(() => auditChannel(values), [values]);

  return <div className="tool-editor tool-form-stack social-media-editor">
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="channel-name"><span>Channel name</span><input id="channel-name" className="tool-value-input" value={values.name} onChange={update('name')} placeholder="Your channel name" /></label>
      <label className="calculator-field" htmlFor="channel-topic"><span>Audience or topic</span><input id="channel-topic" className="tool-value-input" value={values.niche} onChange={update('niche')} placeholder="What the channel is about" /></label>
      <label className="calculator-field" htmlFor="channel-subscribers"><span>Subscribers</span><input id="channel-subscribers" className="tool-value-input" type="number" min="0" value={values.subscribers} onChange={update('subscribers')} placeholder="e.g. 12500" /></label>
      <label className="calculator-field" htmlFor="channel-views"><span>Average views per video</span><input id="channel-views" className="tool-value-input" type="number" min="0" value={values.averageViews} onChange={update('averageViews')} placeholder="e.g. 2400" /></label>
      <label className="calculator-field" htmlFor="channel-uploads"><span>Uploads per month</span><input id="channel-uploads" className="tool-value-input" type="number" min="0" max="100" step="0.5" value={values.uploads} onChange={update('uploads')} /></label>
    </div>
    <label className="calculator-field" htmlFor="channel-description"><span>Channel description</span><textarea id="channel-description" className="tool-textarea" value={values.description} onChange={update('description')} maxLength={1000} placeholder="Paste your current channel description" /><span className="social-character-count">{values.description.length} / 1,000 characters</span></label>
    <label className="calculator-field" htmlFor="channel-titles"><span>Recent video titles · one per line</span><textarea id="channel-titles" className="tool-textarea social-comments-input" value={values.titles} onChange={update('titles')} placeholder={'How to…\n5 mistakes to avoid…\nI tested…'} /></label>
    <div className="social-audit-score"><span>Local checklist score</span><strong>{audit.score}<small> / 100</small></strong></div>
    <div className="social-audit-checks">{audit.checks.map((check) => <article className="social-audit-check" key={check.title}><span className={check.score >= 14 ? 'is-ready' : 'is-review'}>{check.score >= 14 ? <Check size={15} /> : <CircleHelp size={15} />}</span><div><strong>{check.title}</strong><p>{check.detail}</p></div><b>{check.score}</b></article>)}</div>
    <p className="tool-inline-status"><SearchCheck size={15} aria-hidden="true" /> This transparent checklist analyzes only the information you enter. It does not connect to YouTube, fetch private analytics, or predict channel growth.</p>
  </div>;
}
