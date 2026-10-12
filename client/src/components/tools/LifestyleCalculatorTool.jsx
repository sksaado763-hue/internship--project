import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';

const MS_PER_DAY = 86400000;

const localDateValue = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const now = new Date();
const defaultLmp = localDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 70));
const defaultDue = localDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 140));

const defaults = {
  'ideal-weight-calculator': { units: 'metric', height: '170', feet: '5', inches: '7', sex: 'average' },
  'pace-calculator': { units: 'km', distance: '10', hours: '0', minutes: '50', seconds: '0' },
  'concrete-calculator': { units: 'metric', length: '4', width: '3', depth: '0.1', price: '' },
  'due-date-calculator': { lmp: defaultLmp },
  'pregnancy-conception-calculator': { mode: 'lmp', lmp: defaultLmp, due: defaultDue },
};

const number = (value) => value === '' ? NaN : Number(value);
const pretty = (value, digits = 2) => Number.isFinite(value)
  ? new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value)
  : '—';
const validPositive = (...values) => values.every((value) => Number.isFinite(value) && value > 0);

const parseDate = (value) => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return Number.isFinite(date.getTime()) ? date : null;
};
const shiftDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfToday = () => new Date(now.getFullYear(), now.getMonth(), now.getDate());
const formatLong = (date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const formatClock = (totalSeconds) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—';
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(rest).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
};

function Field({ id, label, value, onChange, type = 'number', min, max, step = 'any', options, suffix }) {
  return <label className="calculator-field" htmlFor={id}>
    <span>{label}</span>
    {options ? <select id={id} className="tool-value-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select> : <div className="calculator-field-control"><input id={id} className="tool-value-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} min={min} max={max} step={step} /><span>{suffix}</span></div>}
  </label>;
}

function ResultCards({ items }) {
  return <div className="financial-results" aria-live="polite">{items.map(([label, value]) => <div className="financial-result" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function useForm(tool) {
  const [values, setValues] = useState(() => defaults[tool.slug]);
  useEffect(() => setValues(defaults[tool.slug]), [tool.slug]);
  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));
  const reset = () => setValues(defaults[tool.slug]);
  return [values, set, reset];
}

const toPounds = (kg) => kg * 2.2046226218;

function IdealWeightCalculator({ values, set }) {
  const metric = values.units === 'metric';
  const changeUnits = (next) => {
    if (next === values.units) return;
    if (next === 'imperial') {
      const totalInches = number(values.height) / 2.54;
      if (Number.isFinite(totalInches)) {
        set('feet')(String(Math.floor(totalInches / 12)));
        set('inches')(String(Number((totalInches % 12).toFixed(1))));
      }
    } else {
      const height = (number(values.feet) * 12 + number(values.inches)) * 2.54;
      if (Number.isFinite(height)) set('height')(String(Number(height.toFixed(1))));
    }
    set('units')(next);
  };
  const result = useMemo(() => {
    const heightCm = metric ? number(values.height) : (number(values.feet) * 12 + number(values.inches)) * 2.54;
    if (!validPositive(heightCm)) return null;
    const meters = heightCm / 100;
    const totalInches = heightCm / 2.54;
    const minKg = 18.5 * meters * meters;
    const maxKg = 24.9 * meters * meters;
    const base = values.sex === 'male' ? 50 : values.sex === 'female' ? 45.5 : 48;
    const idealKg = Math.max(0, base + 2.3 * (totalInches - 60));
    return { minKg, maxKg, idealKg };
  }, [values.height, values.feet, values.inches, values.sex, metric]);
  return <>
    <div className="calculator-input-grid">
      <Field id="iw-units" label="Units" value={values.units} onChange={changeUnits} options={[{ value: 'metric', label: 'Metric · centimeters' }, { value: 'imperial', label: 'US customary · feet and inches' }]} />
      {metric
        ? <Field id="iw-height" label="Height" value={values.height} onChange={set('height')} min="1" suffix="cm" />
        : <><Field id="iw-feet" label="Height · feet" value={values.feet} onChange={set('feet')} min="0" suffix="ft" /><Field id="iw-inches" label="Height · inches" value={values.inches} onChange={set('inches')} min="0" max="11.9" suffix="in" /></>}
      <Field id="iw-sex" label="Formula (optional)" value={values.sex} onChange={set('sex')} options={[{ value: 'average', label: 'Average of both formulas' }, { value: 'male', label: 'Male · Devine 50 kg base' }, { value: 'female', label: 'Female · Devine 45.5 kg base' }]} />
    </div>
    {result ? <ResultCards items={[
      ['Healthy weight range (BMI 18.5–24.9)', `${pretty(result.minKg, 1)}–${pretty(result.maxKg, 1)} kg`],
      ['Healthy range in pounds', `${pretty(toPounds(result.minKg), 0)}–${pretty(toPounds(result.maxKg), 0)} lb`],
      ['Ideal body weight (Devine)', `${pretty(result.idealKg, 1)} kg`],
      ['Ideal weight in pounds', `${pretty(toPounds(result.idealKg), 0)} lb`],
    ]} /> : <p className="tool-inline-status status-warning">Enter a height above zero to see the estimates.</p>}
    <p className="tool-inline-status">These are rough population-level estimates, not medical advice. A healthy weight also depends on body composition, age, muscle mass, and health conditions.</p>
  </>;
}

const races = [
  { name: '5K', km: 5 },
  { name: '10K', km: 10 },
  { name: 'Half marathon', km: 21.0975 },
  { name: 'Marathon', km: 42.195 },
];

function PaceCalculator({ values, set }) {
  const result = useMemo(() => {
    const distance = number(values.distance);
    const hours = number(values.hours); const minutes = number(values.minutes); const seconds = number(values.seconds);
    if (!validPositive(distance) || ![hours, minutes, seconds].every(Number.isFinite)) return null;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return null;
    const km = values.units === 'km' ? distance : distance * 1.609344;
    const miles = km / 1.609344;
    return {
      paceKm: totalSeconds / km,
      paceMile: totalSeconds / miles,
      kmh: km / (totalSeconds / 3600),
      mph: miles / (totalSeconds / 3600),
      predictions: races.map((race) => [race.name, totalSeconds * ((race.km / km) ** 1.06)]),
    };
  }, [values.distance, values.units, values.hours, values.minutes, values.seconds]);
  return <>
    <div className="calculator-input-grid">
      <Field id="pace-units" label="Distance units" value={values.units} onChange={set('units')} options={[{ value: 'km', label: 'Kilometers' }, { value: 'mi', label: 'Miles' }]} />
      <Field id="pace-distance" label="Distance" value={values.distance} onChange={set('distance')} min="0.1" suffix={values.units === 'km' ? 'km' : 'mi'} />
      <Field id="pace-hours" label="Time · hours" value={values.hours} onChange={set('hours')} min="0" suffix="h" />
      <Field id="pace-minutes" label="Time · minutes" value={values.minutes} onChange={set('minutes')} min="0" max="59" suffix="min" />
      <Field id="pace-seconds" label="Time · seconds" value={values.seconds} onChange={set('seconds')} min="0" max="59" suffix="s" />
    </div>
    {result ? <>
      <ResultCards items={[
        ['Pace per kilometer', formatClock(result.paceKm)],
        ['Pace per mile', formatClock(result.paceMile)],
        ['Average speed', `${pretty(result.kmh)} km/h`],
        ['Average speed', `${pretty(result.mph)} mph`],
      ]} />
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Race time predictions</h2>
        <div className="financial-table-wrap" aria-live="polite">
          <table className="financial-table">
            <caption>Predicted finish times from your entered performance (Riegel formula)</caption>
            <thead><tr><th>Race</th><th>Predicted time</th></tr></thead>
            <tbody>{result.predictions.map(([name, predicted]) => <tr key={name}><td>{name}</td><td>{formatClock(predicted)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </> : <p className="tool-inline-status status-warning">Enter a distance and a total time greater than zero.</p>}
    <p className="tool-inline-status">Race predictions use the Riegel formula and assume race conditions similar to your entered run — treat them as a rough guide, not a guarantee.</p>
  </>;
}

function ConcreteCalculator({ values, set }) {
  const metric = values.units === 'metric';
  const changeUnits = (next) => {
    if (next === values.units) return;
    if (next === 'us') {
      const length = number(values.length) * 3.280839895;
      const width = number(values.width) * 3.280839895;
      const depth = number(values.depth) * 39.3700787;
      if (Number.isFinite(length)) set('length')(String(Number(length.toFixed(2))));
      if (Number.isFinite(width)) set('width')(String(Number(width.toFixed(2))));
      if (Number.isFinite(depth)) set('depth')(String(Number(depth.toFixed(1))));
    } else {
      const length = number(values.length) * 0.3048;
      const width = number(values.width) * 0.3048;
      const depth = number(values.depth) * 0.0254;
      if (Number.isFinite(length)) set('length')(String(Number(length.toFixed(2))));
      if (Number.isFinite(width)) set('width')(String(Number(width.toFixed(2))));
      if (Number.isFinite(depth)) set('depth')(String(Number(depth.toFixed(2))));
    }
    set('units')(next);
  };
  const result = useMemo(() => {
    const length = number(values.length); const width = number(values.width); const depth = number(values.depth);
    const price = values.price === '' ? 0 : number(values.price);
    if (!validPositive(length, width, depth) || !Number.isFinite(price) || price < 0) return null;
    if (metric) {
      const m3 = length * width * depth;
      return {
        volumeLabel: `${pretty(m3, 2)} m³`,
        waterLiters: m3 * 200,
        bags: [['20 kg premix bags · ≈0.01 m³ each', Math.ceil(m3 / 0.01)], ['25 kg premix bags · ≈0.0125 m³ each', Math.ceil(m3 / 0.0125)]],
        cost: price > 0 ? m3 * price : null,
      };
    }
    const ft3 = length * width * (depth / 12);
    const yd3 = ft3 / 27;
    return {
      volumeLabel: `${pretty(yd3, 2)} cubic yards (${pretty(ft3, 1)} ft³)`,
      bags: [['60 lb bags · 0.45 ft³ each', Math.ceil(ft3 / 0.45)], ['80 lb bags · 0.6 ft³ each', Math.ceil(ft3 / 0.6)]],
      cost: price > 0 ? yd3 * price : null,
    };
  }, [values.length, values.width, values.depth, values.price, metric]);
  const items = result ? [['Slab volume', result.volumeLabel]] : [];
  if (result?.waterLiters != null) items.push(['Approx. mixing water', `≈ ${pretty(result.waterLiters, 0)} liters`]);
  if (result) result.bags.forEach(([label, count]) => items.push([label, `${pretty(count, 0)} bags`]));
  if (result && result.cost !== null) items.push(['Estimated material cost', pretty(result.cost)]);
  return <>
    <div className="calculator-input-grid">
      <Field id="concrete-units" label="Units" value={values.units} onChange={changeUnits} options={[{ value: 'metric', label: 'Metric · meters' }, { value: 'us', label: 'US customary · ft, in, cubic yards' }]} />
      <Field id="concrete-length" label="Slab length" value={values.length} onChange={set('length')} min="0.1" suffix={metric ? 'm' : 'ft'} />
      <Field id="concrete-width" label="Slab width" value={values.width} onChange={set('width')} min="0.1" suffix={metric ? 'm' : 'ft'} />
      <Field id="concrete-depth" label="Slab depth" value={values.depth} onChange={set('depth')} min="0.1" suffix={metric ? 'm' : 'in'} />
      <Field id="concrete-price" label="Price (optional)" value={values.price} onChange={set('price')} min="0" suffix={metric ? 'per m³' : 'per cubic yard'} />
    </div>
    {result ? <ResultCards items={items} /> : <p className="tool-inline-status status-warning">Enter a length, width, and depth greater than zero, and a price of zero or more.</p>}
    <p className="tool-inline-status">Add 5–10% to your order for waste, spillage, and uneven ground. Bag counts use standard yields and are rounded up to whole bags.</p>
  </>;
}

function DueDateCalculator({ values, set }) {
  const result = useMemo(() => {
    const lmp = parseDate(values.lmp);
    if (!lmp) return null;
    const days = Math.round((startOfToday() - lmp) / MS_PER_DAY);
    if (days < 0) return null;
    return {
      dueDate: shiftDays(lmp, 280),
      weeks: Math.floor(days / 7),
      rest: days % 7,
      trimester: days < 98 ? 'First trimester' : days < 196 ? 'Second trimester' : 'Third trimester',
      timeline: [
        ['First', 'Weeks 1–13', shiftDays(lmp, 97)],
        ['Second', 'Weeks 14–27', shiftDays(lmp, 195)],
        ['Third', 'Weeks 28–40', shiftDays(lmp, 280)],
      ],
    };
  }, [values.lmp]);
  return <>
    <div className="calculator-input-grid">
      <Field id="due-lmp" label="First day of last menstrual period" type="date" value={values.lmp} onChange={set('lmp')} />
    </div>
    {result ? <>
      <ResultCards items={[
        ['Estimated due date', formatLong(result.dueDate)],
        ['Progress as of today', `${result.weeks} weeks, ${result.rest} days pregnant`],
        ['Current trimester', result.trimester],
      ]} />
      <section className="tool-form-section">
        <h2 className="calculator-section-title">Trimester timeline</h2>
        <div className="financial-table-wrap" aria-live="polite">
          <table className="financial-table">
            <caption>Each trimester ends on the date shown</caption>
            <thead><tr><th>Trimester</th><th>Weeks</th><th>Ends</th></tr></thead>
            <tbody>{result.timeline.map(([name, weeks, end]) => <tr key={name}><td>{name}</td><td>{weeks}</td><td>{formatLong(end)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </> : <p className="tool-inline-status status-warning">Enter a valid last menstrual period date that is not in the future.</p>}
    <p className="tool-inline-status">A due date is only an estimate — roughly 5% of babies arrive on their exact due date. Confirm dating and prenatal care with a healthcare provider.</p>
  </>;
}

function ConceptionCalculator({ values, set }) {
  const basedOnLmp = values.mode === 'lmp';
  const result = useMemo(() => {
    const anchor = parseDate(basedOnLmp ? values.lmp : values.due);
    if (!anchor) return null;
    if (basedOnLmp) {
      return {
        conception: shiftDays(anchor, 14),
        fertileStart: shiftDays(anchor, 10),
        fertileEnd: shiftDays(anchor, 16),
      };
    }
    const conception = shiftDays(anchor, -266);
    return { conception, fertileStart: shiftDays(conception, -3), fertileEnd: shiftDays(conception, 3) };
  }, [values.mode, values.lmp, values.due]);
  return <>
    <div className="calculator-input-grid">
      <label className="calculator-field" htmlFor="conceive-mode-lmp"><span>From last period</span><input id="conceive-mode-lmp" type="radio" name="conceive-basis" checked={basedOnLmp} onChange={() => set('mode')('lmp')} /></label>
      <label className="calculator-field" htmlFor="conceive-mode-due"><span>From due date</span><input id="conceive-mode-due" type="radio" name="conceive-basis" checked={!basedOnLmp} onChange={() => set('mode')('due')} /></label>
    </div>
    <div className="calculator-input-grid">
      {basedOnLmp
        ? <Field id="conceive-lmp" label="First day of last period" type="date" value={values.lmp} onChange={set('lmp')} />
        : <Field id="conceive-due" label="Estimated due date" type="date" value={values.due} onChange={set('due')} />}
    </div>
    {result ? <ResultCards items={[
      ['Estimated ovulation / conception day', formatLong(result.conception)],
      ['Estimated fertile window', `${formatLong(result.fertileStart)} – ${formatLong(result.fertileEnd)}`],
    ]} /> : <p className="tool-inline-status status-warning">Choose a valid date to see the estimate.</p>}
    <p className="tool-inline-status">Estimates assume a 28-day cycle; real ovulation timing varies person to person and month to month. This is not medical advice — see a healthcare provider for fertility or pregnancy questions.</p>
  </>;
}

export default function LifestyleCalculatorTool({ tool }) {
  const [values, set, reset] = useForm(tool);
  let content;
  switch (tool.slug) {
    case 'ideal-weight-calculator': content = <IdealWeightCalculator values={values} set={set} />; break;
    case 'pace-calculator': content = <PaceCalculator values={values} set={set} />; break;
    case 'concrete-calculator': content = <ConcreteCalculator values={values} set={set} />; break;
    case 'due-date-calculator': content = <DueDateCalculator values={values} set={set} />; break;
    case 'pregnancy-conception-calculator': content = <ConceptionCalculator values={values} set={set} />; break;
    default: content = <p className="tool-inline-status">This calculator is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack">
    {content}
    <div className="tool-action-row">
      <p className="tool-inline-status">Calculations update instantly in your browser.</p>
      <div className="tool-actions"><Button variant="secondary" size="small" type="button" onClick={reset}>Reset defaults</Button></div>
    </div>
  </div>;
}
