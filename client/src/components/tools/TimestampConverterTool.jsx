import { useMemo, useState } from 'react';

function parseTimestamp(value) {
  if (!value.trim() || !/^-?\d+(\.\d+)?$/.test(value.trim())) return null;
  const numeric = Number(value);
  const milliseconds = Math.abs(numeric) < 1e11 ? numeric * 1000 : numeric;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date;
}

function localInputValue(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function TimestampConverterTool() {
  const [timestamp, setTimestamp] = useState('');
  const [dateValue, setDateValue] = useState('');
  const parsedDate = useMemo(() => parseTimestamp(timestamp), [timestamp]);
  const dateFromInput = dateValue ? new Date(dateValue) : null;
  const validDateInput = dateFromInput && !Number.isNaN(dateFromInput.getTime());

  function useNow() {
    const now = new Date();
    setTimestamp(String(Math.floor(now.getTime() / 1000)));
    setDateValue(localInputValue(now));
  }

  return (
    <div className="tool-editor tool-form-stack">
      <section className="tool-form-section">
        <div className="tool-editor-label"><label htmlFor="timestamp-value">Unix timestamp</label><span>Seconds or milliseconds</span></div>
        <input id="timestamp-value" className="tool-value-input" inputMode="decimal" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} placeholder="e.g. 1735689600" />
        {timestamp && (parsedDate ? <div className="conversion-result"><strong>Local time</strong><span>{parsedDate.toLocaleString()}</span><strong>UTC</strong><span>{parsedDate.toISOString()}</span></div> : <p className="tool-inline-status status-warning">Enter a valid Unix timestamp.</p>)}
      </section>
      <section className="tool-form-section">
        <div className="tool-editor-label"><label htmlFor="timestamp-date">Date and time</label><span>Your local timezone</span></div>
        <input id="timestamp-date" className="tool-value-input" type="datetime-local" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
        {validDateInput && <div className="conversion-result"><strong>Seconds</strong><span>{Math.floor(dateFromInput.getTime() / 1000)}</span><strong>Milliseconds</strong><span>{dateFromInput.getTime()}</span></div>}
      </section>
      <div className="tool-action-row"><p className="tool-inline-status">Conversions happen locally in your browser.</p><button className="case-action" type="button" onClick={useNow}>Use current time</button></div>
    </div>
  );
}
