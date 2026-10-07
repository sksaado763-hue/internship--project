import { useMemo, useState } from 'react';

const bases = [
  { id: 'binary', label: 'Binary', radix: 2, prefix: '0b' },
  { id: 'octal', label: 'Octal', radix: 8, prefix: '0o' },
  { id: 'decimal', label: 'Decimal', radix: 10, prefix: '' },
  { id: 'hex', label: 'Hexadecimal', radix: 16, prefix: '0x' },
];

function parseInteger(value, radix) {
  const cleaned = value.trim().replaceAll('_', '');
  if (!cleaned) return null;
  const sign = cleaned.startsWith('-') ? -1n : 1n;
  let unsigned = cleaned.replace(/^[+-]/, '');
  const prefix = { 2: /^0b/i, 8: /^0o/i, 16: /^0x/i }[radix];
  if (prefix) unsigned = unsigned.replace(prefix, '');
  if (!unsigned || !/^[0-9a-f]+$/i.test(unsigned)) {
    throw new Error(`Enter a whole number using base ${radix} digits.`);
  }
  let result = 0n;
  for (const character of unsigned.toLowerCase()) {
    const digit = parseInt(character, 36);
    if (digit >= radix) throw new Error(`Digit “${character}” is not valid in base ${radix}.`);
    result = result * BigInt(radix) + BigInt(digit);
  }
  return result * sign;
}

export default function NumberBaseConverterTool() {
  const [value, setValue] = useState('255');
  const [sourceBase, setSourceBase] = useState('decimal');
  const result = useMemo(() => {
    try {
      const base = bases.find((item) => item.id === sourceBase);
      const number = parseInteger(value, base.radix);
      if (number === null) return { values: [], error: '' };
      return { values: bases.map((item) => ({ ...item, value: `${number < 0n ? '-' : ''}${item.prefix}${(number < 0n ? -number : number).toString(item.radix).toUpperCase()}` })), error: '' };
    } catch (error) { return { values: [], error: error.message }; }
  }, [sourceBase, value]);

  return <div className="tool-editor tool-form-stack">
    <section className="tool-form-section">
      <div className="tool-editor-label"><label htmlFor="base-value">Whole number</label><span>Use underscores to group digits</span></div>
      <input id="base-value" className="tool-value-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter a number…" spellCheck={false} />
      <div className="tool-editor-label"><label htmlFor="base-select">Input base</label><span>Choose how to read the value</span></div>
      <select id="base-select" className="tool-value-input" value={sourceBase} onChange={(event) => setSourceBase(event.target.value)}>
        {bases.map((base) => <option key={base.id} value={base.id}>{base.label} (base {base.radix})</option>)}
      </select>
    </section>
    <section className="tool-form-section" aria-live="polite">
      <div className="tool-editor-label"><strong>Conversions</strong><span>{result.error ? 'Check your input' : 'Prefixes included where useful'}</span></div>
      {result.error ? <p className="tool-inline-status status-warning">{result.error}</p> : result.values.length ? <div className="base-result-grid">
        {result.values.map((item) => <label className="base-result" key={item.id}><span>{item.label} · base {item.radix}</span><input className="tool-value-input" value={item.value} readOnly aria-label={`${item.label} result`} /></label>)}
      </div> : <p className="tool-inline-status">Enter a number to see its equivalent in each base.</p>}
    </section>
    <p className="tool-inline-status">Supports large whole numbers using browser BigInt.</p>
  </div>;
}
