import { useMemo, useState } from 'react';
import { Clipboard } from 'lucide-react';
import Button from '../common/Button.jsx';
import useCopyText from '../../hooks/useCopyText.js';

export default function GradientGeneratorTool() {
  const [start, setStart] = useState('#6366F1');
  const [end, setEnd] = useState('#EC4899');
  const [angle, setAngle] = useState(135);
  const css = useMemo(() => `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`, [angle, start, end]);
  const { copyMessage, copyText } = useCopyText();

  return (
    <div className="tool-editor tool-form-stack">
      <div className="gradient-preview" style={{ backgroundImage: css }} aria-label="Gradient preview" />
      <div className="gradient-controls">
        <label className="gradient-color-control">Start color<input type="color" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="gradient-color-control">End color<input type="color" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label className="gradient-angle-control" htmlFor="gradient-angle">Angle <span>{angle}°</span><input id="gradient-angle" type="range" min="0" max="360" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
      </div>
      <div className="tool-editor-label"><label htmlFor="gradient-css">CSS background</label><span>Ready to paste</span></div>
      <textarea id="gradient-css" className="tool-textarea case-output" value={`background: ${css};`} readOnly />
      <div className="tool-action-row"><p className="tool-inline-status" aria-live="polite">{copyMessage || 'Adjust the colors and angle to customize your gradient.'}</p><Button variant="primary" size="small" type="button" onClick={() => copyText(`background: ${css};`, 'CSS gradient')}><Clipboard size={14} aria-hidden="true" /> Copy CSS</Button></div>
    </div>
  );
}
