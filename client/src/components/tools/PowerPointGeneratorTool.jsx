import { useEffect, useMemo, useState } from 'react';
import { Download, Presentation, RefreshCw } from 'lucide-react';

function createSlides(topic, count) {
  const title = topic.trim();
  return [
    { title, bullets: [`Why ${title} matters`, 'The audience and the opportunity', 'What this presentation will cover'] },
    { title: 'The current landscape', bullets: ['Where things stand today', 'Key challenges and constraints', 'What the evidence tells us'] },
    { title: 'A practical approach', bullets: ['Start with the most important need', 'Build a focused plan', 'Measure progress and adapt'] },
    { title: 'Expected impact', bullets: ['Benefits for the audience', 'Risks to plan for', 'How success will be measured'] },
    { title: 'Next steps', bullets: ['Agree on the desired outcome', 'Assign owners and milestones', 'Review progress together'] },
  ].slice(0, count);
}

export default function PowerPointGeneratorTool() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [slides, setSlides] = useState([]);
  function generate(event) { event.preventDefault(); setSlides(createSlides(topic, count)); }
  function updateSlide(index, key, value) { setSlides((current) => current.map((slide, slideIndex) => slideIndex === index ? { ...slide, [key]: value } : slide)); }
  const outline = useMemo(() => slides.map((slide, index) => `SLIDE ${index + 1}: ${slide.title}\n${slide.bullets.map((bullet) => `• ${bullet}`).join('\n')}`).join('\n\n'), [slides]);
  const downloadUrl = useMemo(() => slides.length ? URL.createObjectURL(new Blob([outline], { type: 'text/plain' })) : '', [outline, slides.length]);
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);
  return <div className="tool-editor tool-form-stack">
    <form className="tool-form-grid" onSubmit={generate}>
      <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="presentation-topic">Presentation topic</label></div><input id="presentation-topic" className="tool-value-input" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={100} placeholder="e.g. Sustainable urban transport" required /></section>
      <section className="tool-form-section"><div className="tool-editor-label"><label htmlFor="slide-count">Number of slides</label></div><select id="slide-count" className="tool-value-input" value={count} onChange={(event) => setCount(Number(event.target.value))}><option value={3}>3 slides</option><option value={4}>4 slides</option><option value={5}>5 slides</option></select></section>
      <button className="case-action" type="submit"><Presentation size={15} aria-hidden="true" /> Generate outline</button>
    </form>
    <p className="tool-inline-status">Creates an editable starter outline from a template. No AI service is connected.</p>
    {slides.length > 0 && <>
      <div className="slide-outline">{slides.map((slide, index) => <article className="slide-card" key={index}><div className="tool-editor-label"><span>SLIDE {index + 1}</span><button className="icon-button" type="button" aria-label={`Regenerate slide ${index + 1}`} onClick={() => setSlides((current) => current.map((item, slideIndex) => slideIndex === index ? createSlides(topic, 5)[index] : item))}><RefreshCw size={14} aria-hidden="true" /></button></div><label className="visually-hidden" htmlFor={`slide-title-${index}`}>Slide title</label><input id={`slide-title-${index}`} className="tool-value-input" value={slide.title} onChange={(event) => updateSlide(index, 'title', event.target.value)} />{slide.bullets.map((bullet, bulletIndex) => <label className="slide-bullet-edit" key={bulletIndex}><span aria-hidden="true">•</span><input className="tool-value-input" aria-label={`Slide ${index + 1} bullet ${bulletIndex + 1}`} value={bullet} onChange={(event) => updateSlide(index, 'bullets', slide.bullets.map((item, itemIndex) => itemIndex === bulletIndex ? event.target.value : item))} /></label>)}</article>)}</div>
      <div className="tool-action-row"><p className="tool-inline-status">Edit the titles and bullets, then download the outline.</p><a className="button button--primary button--small" href={downloadUrl} download="presentation-outline.txt"><Download size={14} aria-hidden="true" /> Download outline</a></div>
    </>}
  </div>;
}
