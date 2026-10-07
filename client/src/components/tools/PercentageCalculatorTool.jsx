import { useMemo, useState } from 'react';

function format(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(value);
}

export default function PercentageCalculatorTool() {
  const [percent, setPercent] = useState('15');
  const [amount, setAmount] = useState('200');
  const [original, setOriginal] = useState('80');
  const [current, setCurrent] = useState('100');

  const amountResult = useMemo(() => {
    const percentage = Number(percent);
    const value = Number(amount);
    return Number.isFinite(percentage) && Number.isFinite(value) && percent !== '' && amount !== ''
      ? format((percentage / 100) * value) : 'Enter valid numbers';
  }, [percent, amount]);

  const changeResult = useMemo(() => {
    const before = Number(original);
    const after = Number(current);
    if (original === '' || current === '' || !Number.isFinite(before) || !Number.isFinite(after)) return 'Enter valid numbers';
    if (before === 0) return 'Change from zero is undefined';
    const change = ((after - before) / Math.abs(before)) * 100;
    return `${change > 0 ? '+' : ''}${format(change)}%`;
  }, [original, current]);

  return <div className="tool-editor tool-form-stack">
    <section className="tool-form-section">
      <h2 className="calculator-section-title">What is X% of Y?</h2>
      <div className="calculator-input-grid">
        <label className="tool-form-section"><span className="tool-editor-label">Percentage</span><input className="tool-value-input" type="number" value={percent} onChange={(event) => setPercent(event.target.value)} aria-label="Percentage" /></label>
        <label className="tool-form-section"><span className="tool-editor-label">Value</span><input className="tool-value-input" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} aria-label="Value" /></label>
      </div>
      <p className="calculator-result" aria-live="polite"><span>Result</span><strong>{amountResult}</strong></p>
    </section>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Percentage change</h2>
      <div className="calculator-input-grid">
        <label className="tool-form-section"><span className="tool-editor-label">Original value</span><input className="tool-value-input" type="number" value={original} onChange={(event) => setOriginal(event.target.value)} aria-label="Original value" /></label>
        <label className="tool-form-section"><span className="tool-editor-label">New value</span><input className="tool-value-input" type="number" value={current} onChange={(event) => setCurrent(event.target.value)} aria-label="New value" /></label>
      </div>
      <p className="calculator-result" aria-live="polite"><span>Change</span><strong>{changeResult}</strong></p>
    </section>
    <p className="tool-inline-status">Calculated locally in your browser.</p>
  </div>;
}
