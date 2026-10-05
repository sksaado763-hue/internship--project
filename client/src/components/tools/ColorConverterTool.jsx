import { useMemo, useState } from 'react';

function parseHex(input) {
  let hex = input.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex)) hex = [...hex].map((digit) => digit + digit).join('');
  if (!/^[\da-f]{6}$/i.test(hex)) return null;
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const rn = r / 255; const gn = g / 255; const bn = b / 255;
  const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn);
  let h = 0; let s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === rn) h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h /= 6;
  }
  return { hex: `#${hex.toUpperCase()}`, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` };
}

export default function ColorConverterTool() {
  const [input, setInput] = useState('#4F46E5');
  const color = useMemo(() => parseHex(input), [input]);
  return (
    <div className="tool-editor tool-form-stack">
      <div className="tool-editor-label"><label htmlFor="color-hex">HEX color</label><span>3 or 6 digit HEX</span></div>
      <div className="color-input-row"><input id="color-picker" aria-label="Choose a color" type="color" value={color?.hex ?? '#000000'} onChange={(event) => setInput(event.target.value)} /><input id="color-hex" className="tool-value-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="#4F46E5" spellCheck={false} /></div>
      {color ? <>
        <div className="color-preview" style={{ backgroundColor: color.hex }} aria-label={`Preview of ${color.hex}`} />
        <div className="conversion-result"><strong>HEX</strong><span>{color.hex}</span><strong>RGB</strong><span>{color.rgb}</span><strong>HSL</strong><span>{color.hsl}</span></div>
      </> : <p className="tool-inline-status status-warning">Enter a valid 3 or 6 digit HEX color.</p>}
    </div>
  );
}
