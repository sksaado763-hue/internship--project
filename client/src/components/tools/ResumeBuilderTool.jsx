import { useState } from 'react';
import { Printer } from 'lucide-react';

const initial = { name: '', role: '', email: '', phone: '', location: '', summary: '', skills: '', experience: '', education: '' };
const fields = [
  ['name', 'Full name'], ['role', 'Target role'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'],
  ['summary', 'Professional summary'], ['skills', 'Skills (separate with commas)'], ['experience', 'Experience (one role per paragraph)'], ['education', 'Education'],
];

export default function ResumeBuilderTool() {
  const [resume, setResume] = useState(initial);
  function update(event) { setResume((current) => ({ ...current, [event.target.name]: event.target.value })); }
  return <div className="resume-builder tool-form-stack">
    <div className="resume-form tool-form-stack">
      {fields.map(([name, label]) => <label className="tool-form-section" htmlFor={`resume-${name}`} key={name}><span className="tool-editor-label">{label}</span>{['summary', 'experience', 'education'].includes(name) ? <textarea id={`resume-${name}`} className="tool-textarea" rows={name === 'experience' ? 5 : 3} name={name} value={resume[name]} onChange={update} placeholder={`Add your ${label.toLowerCase()}…`} /> : <input id={`resume-${name}`} className="tool-value-input" name={name} value={resume[name]} onChange={update} placeholder={label} />}</label>)}
      <div className="tool-action-row"><p className="tool-inline-status">Your resume stays in this browser. Use print to save it as PDF.</p><button className="case-action" type="button" onClick={() => window.print()}><Printer size={15} aria-hidden="true" /> Print / Save PDF</button></div>
    </div>
    <article className="resume-preview" aria-label="Resume preview">
      <header><h2>{resume.name || 'Your Name'}</h2><p className="resume-role">{resume.role || 'Professional Title'}</p><p>{[resume.email, resume.phone, resume.location].filter(Boolean).join(' · ') || 'Email · Phone · Location'}</p></header>
      {resume.summary && <section><h3>Profile</h3><p>{resume.summary}</p></section>}
      {resume.skills && <section><h3>Skills</h3><p>{resume.skills.split(',').map((skill) => skill.trim()).filter(Boolean).join(' · ')}</p></section>}
      {resume.experience && <section><h3>Experience</h3>{resume.experience.split(/\n\s*\n/).filter(Boolean).map((entry, index) => <p key={index}>{entry}</p>)}</section>}
      {resume.education && <section><h3>Education</h3><p>{resume.education}</p></section>}
    </article>
  </div>;
}
