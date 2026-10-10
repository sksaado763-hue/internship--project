import { useEffect, useMemo, useState } from 'react';

const activities = [
  { value: 1.2, label: 'Mostly sitting · little exercise' },
  { value: 1.375, label: 'Light activity · 1–3 days/week' },
  { value: 1.55, label: 'Moderate activity · 3–5 days/week' },
  { value: 1.725, label: 'High activity · 6–7 days/week' },
  { value: 1.9, label: 'Very high activity · physical job or training' },
];

const unitGroups = {
  length: { label: 'Length', units: { m: ['Meters', 1], km: ['Kilometers', 1000], cm: ['Centimeters', 0.01], mm: ['Millimeters', 0.001], mi: ['Miles', 1609.344], yd: ['Yards', 0.9144], ft: ['Feet', 0.3048], in: ['Inches', 0.0254] } },
  weight: { label: 'Weight / mass', units: { kg: ['Kilograms', 1], g: ['Grams', 0.001], mg: ['Milligrams', 0.000001], lb: ['Pounds', 0.45359237], oz: ['Ounces', 0.028349523125] } },
  temperature: { label: 'Temperature', units: { c: ['Celsius', 1], f: ['Fahrenheit', 1], k: ['Kelvin', 1] } },
  volume: { label: 'Volume', units: { l: ['Liters', 1], ml: ['Milliliters', 0.001], m3: ['Cubic meters', 1000], gal: ['US gallons', 3.785411784], cup: ['US cups', 0.2365882365], floz: ['US fluid ounces', 0.0295735296] } },
  area: { label: 'Area', units: { m2: ['Square meters', 1], km2: ['Square kilometers', 1000000], ft2: ['Square feet', 0.09290304], yd2: ['Square yards', 0.83612736], acre: ['Acres', 4046.8564224], ha: ['Hectares', 10000] } },
};

const localDateValue = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const today = localDateValue(new Date());
const defaults = {
  'age-calculator': { birthDate: '1995-06-15', asOf: today },
  'amortization-calculator': { principal: '250000', apr: '6.5', years: '30', extra: '0' },
  'auto-loan-calculator': { price: '32000', down: '5000', trade: '0', tax: '6', fees: '800', apr: '6.9', years: '5' },
  'unit-converter': { category: 'length', value: '1', from: 'm', to: 'ft' },
  'bmi-calculator': { units: 'metric', height: '170', weight: '70', feet: '5', inches: '7', pounds: '154' },
  'bmr-calculator': { sex: 'female', age: '30', height: '170', weight: '65', activity: '1.2' },
  'body-fat-calculator': { sex: 'male', units: 'metric', height: '178', waist: '86', neck: '38', hip: '96' },
  'calorie-calculator': { sex: 'female', age: '30', height: '165', weight: '65', activity: '1.55', goal: 'maintain' },
};

const number = (value) => value === '' ? NaN : Number(value);
const pretty = (value, digits = 2) => Number.isFinite(value)
  ? new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value)
  : '—';
const validPositive = (...values) => values.every((value) => Number.isFinite(value) && value > 0);
const paymentFor = (principal, annualRate, months) => {
  if (!validPositive(principal, months) || !Number.isFinite(annualRate) || annualRate < 0) return NaN;
  const rate = annualRate / 1200;
  return rate === 0 ? principal / months : principal * rate / (1 - (1 + rate) ** -months);
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
  return [values, set];
}

function AgeCalculator({ values, set }) {
  const result = useMemo(() => {
    if (!values.birthDate || !values.asOf) return null;
    const born = new Date(`${values.birthDate}T00:00:00`);
    const asOf = new Date(`${values.asOf}T00:00:00`);
    if (!Number.isFinite(born.getTime()) || !Number.isFinite(asOf.getTime()) || born > asOf) return null;
    let years = asOf.getFullYear() - born.getFullYear();
    let months = asOf.getMonth() - born.getMonth();
    let days = asOf.getDate() - born.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
    }
    if (months < 0) { years -= 1; months += 12; }
    const totalDays = Math.floor((asOf - born) / 86400000);
    let nextBirthday = new Date(asOf.getFullYear(), born.getMonth(), born.getDate());
    if (nextBirthday <= asOf) nextBirthday = new Date(asOf.getFullYear() + 1, born.getMonth(), born.getDate());
    return { years, months, days, totalDays, daysToBirthday: Math.ceil((nextBirthday - asOf) / 86400000) };
  }, [values.asOf, values.birthDate]);
  return <>
    <div className="calculator-input-grid"><Field id="age-birth-date" label="Date of birth" type="date" value={values.birthDate} onChange={set('birthDate')} /><Field id="age-as-of" label="Calculate age on" type="date" value={values.asOf} onChange={set('asOf')} /></div>
    {result ? <ResultCards items={[["Exact age", `${result.years} years, ${result.months} months, ${result.days} days`], ['Total days lived', pretty(result.totalDays, 0)], ['Days until next birthday', pretty(result.daysToBirthday, 0)]]} /> : <p className="tool-inline-status status-warning">Choose valid dates. The birth date must not be after the calculation date.</p>}
  </>;
}

function amortize(principal, annualRate, baseMonths, extra = 0) {
  const basePayment = paymentFor(principal, annualRate, baseMonths);
  if (!Number.isFinite(basePayment) || !Number.isFinite(extra) || extra < 0) return null;
  const monthlyRate = annualRate / 1200;
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const schedule = [];
  while (balance > 0.005 && month < 1200) {
    month += 1;
    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, basePayment + extra);
    const principalPaid = payment - interest;
    if (principalPaid <= 0) return null;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    if (schedule.length < 12 || balance === 0) schedule.push({ month, payment, principal: principalPaid, interest, balance });
  }
  return { basePayment, monthlyPayment: basePayment + extra, months: month, totalInterest, totalPaid: principal + totalInterest, schedule };
}

function AmortizationCalculator({ values, set }) {
  const principal = number(values.principal); const apr = number(values.apr); const years = number(values.years); const extra = number(values.extra);
  const result = useMemo(() => validPositive(principal, years) && Number.isFinite(apr) && apr >= 0 && Number.isFinite(extra) && extra >= 0
    ? amortize(principal, apr, years * 12, extra) : null, [principal, apr, years, extra]);
  return <>
    <div className="calculator-input-grid">
      <Field id="amort-principal" label="Loan amount" value={values.principal} onChange={set('principal')} min="1" suffix="amount" />
      <Field id="amort-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="amort-years" label="Loan term" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
      <Field id="amort-extra" label="Extra monthly payment" value={values.extra} onChange={set('extra')} min="0" suffix="amount / month" />
    </div>
    {result ? <>
      <ResultCards items={[["Scheduled payment / month", pretty(result.basePayment)], ['With extra payment', pretty(result.monthlyPayment)], ['Payoff time', `${Math.floor(result.months / 12)}y ${result.months % 12}m`], ['Total interest', pretty(result.totalInterest)], ['Total paid', pretty(result.totalPaid)]]} />
      <ScheduleTable rows={result.schedule} />
    </> : <p className="tool-inline-status status-warning">Enter a positive loan amount and term, a non-negative APR, and an extra payment of zero or more.</p>}
    <p className="tool-inline-status">Estimates use a fixed rate and monthly payments. Lender fees and rate changes are not included.</p>
  </>;
}

function ScheduleTable({ rows }) {
  return <div className="financial-table-wrap"><table className="financial-table"><caption>Amortization schedule · first 12 payments and final payment</caption><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{rows.map((row) => <tr key={row.month}><td>{row.month}</td><td>{pretty(row.payment)}</td><td>{pretty(row.principal)}</td><td>{pretty(row.interest)}</td><td>{pretty(row.balance)}</td></tr>)}</tbody></table></div>;
}

function AutoLoanCalculator({ values, set }) {
  const price = number(values.price); const down = number(values.down); const trade = number(values.trade); const tax = number(values.tax); const fees = number(values.fees); const apr = number(values.apr); const years = number(values.years);
  const result = useMemo(() => {
    if (!validPositive(price, years) || ![down, trade, tax, fees, apr].every(Number.isFinite) || [down, trade, tax, fees, apr].some((value) => value < 0)) return null;
    const taxes = price * tax / 100;
    const financed = Math.max(0, price + taxes + fees - down - trade);
    if (!financed) return { taxes, financed, payment: 0, totalInterest: 0, totalPaid: 0 };
    const payment = paymentFor(financed, apr, years * 12);
    return { taxes, financed, payment, totalInterest: payment * years * 12 - financed, totalPaid: payment * years * 12 };
  }, [price, years, down, trade, tax, fees, apr]);
  return <>
    <div className="calculator-input-grid">
      <Field id="auto-price" label="Vehicle price" value={values.price} onChange={set('price')} min="1" />
      <Field id="auto-down" label="Down payment" value={values.down} onChange={set('down')} min="0" />
      <Field id="auto-trade" label="Trade-in value" value={values.trade} onChange={set('trade')} min="0" />
      <Field id="auto-tax" label="Sales tax" value={values.tax} onChange={set('tax')} min="0" max="100" suffix="%" />
      <Field id="auto-fees" label="Fees" value={values.fees} onChange={set('fees')} min="0" />
      <Field id="auto-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="auto-years" label="Loan term" value={values.years} onChange={set('years')} min="1" max="15" suffix="years" />
    </div>
    {result ? <ResultCards items={[["Estimated monthly payment", pretty(result.payment)], ['Amount financed', pretty(result.financed)], ['Estimated sales tax', pretty(result.taxes)], ['Total interest', pretty(result.totalInterest)], ['Total of payments', pretty(result.totalPaid)]]} /> : <p className="tool-inline-status status-warning">Enter a vehicle price and loan term. Other amounts and rates must be zero or more.</p>}
    <p className="tool-inline-status">Sales tax is estimated on vehicle price. Registration, insurance, and lender-specific charges may change the actual quote.</p>
  </>;
}

function convertTemperature(value, from, to) {
  const celsius = from === 'f' ? (value - 32) * 5 / 9 : from === 'k' ? value - 273.15 : value;
  return to === 'f' ? celsius * 9 / 5 + 32 : to === 'k' ? celsius + 273.15 : celsius;
}

function UnitConverter({ values, set }) {
  const group = unitGroups[values.category];
  const unitOptions = Object.entries(group.units).map(([value, [label]]) => ({ value, label }));
  const from = group.units[values.from] ? values.from : Object.keys(group.units)[0];
  const to = group.units[values.to] ? values.to : Object.keys(group.units)[1] ?? from;
  const value = number(values.value);
  let converted = NaN;
  if (Number.isFinite(value)) converted = values.category === 'temperature'
    ? convertTemperature(value, from, to)
    : value * group.units[from][1] / group.units[to][1];
  const changeCategory = (next) => {
    const keys = Object.keys(unitGroups[next].units);
    set('category')(next);
    set('from')(keys[0]);
    set('to')(keys[1] ?? keys[0]);
  };
  return <>
    <div className="calculator-input-grid">
      <Field id="unit-category" label="Measurement" value={values.category} onChange={changeCategory} options={Object.entries(unitGroups).map(([value, item]) => ({ value, label: item.label }))} />
      <Field id="unit-value" label="Value" value={values.value} onChange={set('value')} />
      <Field id="unit-from" label="From" value={from} onChange={set('from')} options={unitOptions} />
      <Field id="unit-to" label="To" value={to} onChange={set('to')} options={unitOptions} />
    </div>
    <ResultCards items={[[`${group.units[from][0]} in ${group.units[to][0]}`, pretty(converted, 6)]]} />
    <p className="tool-inline-status">Conversions use standard unit factors. Temperature conversions include the offset between scales.</p>
  </>;
}

function BmiCalculator({ values, set }) {
  const metric = values.units === 'metric';
  const changeUnits = (next) => {
    if (next === values.units) return;
    if (next === 'imperial') {
      const totalInches = number(values.height) / 2.54;
      const pounds = number(values.weight) * 2.2046226218;
      if (Number.isFinite(totalInches)) {
        set('feet')(String(Math.floor(totalInches / 12)));
        set('inches')(String(Number((totalInches % 12).toFixed(1))));
      }
      if (Number.isFinite(pounds)) set('pounds')(String(Number(pounds.toFixed(1))));
    } else {
      const height = (number(values.feet) * 12 + number(values.inches)) * 2.54;
      const weight = number(values.pounds) / 2.2046226218;
      if (Number.isFinite(height)) set('height')(String(Number(height.toFixed(1))));
      if (Number.isFinite(weight)) set('weight')(String(Number(weight.toFixed(1))));
    }
    set('units')(next);
  };
  const heightCm = metric ? number(values.height) : (number(values.feet) * 12 + number(values.inches)) * 2.54;
  const weightKg = metric ? number(values.weight) : number(values.pounds) * 0.45359237;
  const bmi = validPositive(heightCm, weightKg) ? weightKg / ((heightCm / 100) ** 2) : NaN;
  const label = !Number.isFinite(bmi) ? 'Enter valid height and weight' : bmi < 18.5 ? 'Below the standard adult range' : bmi < 25 ? 'Within the standard adult range' : bmi < 30 ? 'Above the standard adult range' : 'In the high adult range';
  return <>
    <div className="calculator-input-grid"><Field id="bmi-units" label="Units" value={values.units} onChange={changeUnits} options={[{ value: 'metric', label: 'Metric · cm and kg' }, { value: 'imperial', label: 'US customary · ft, in and lb' }]} />
      {metric ? <><Field id="bmi-height" label="Height" value={values.height} onChange={set('height')} min="1" suffix="cm" /><Field id="bmi-weight" label="Weight" value={values.weight} onChange={set('weight')} min="1" suffix="kg" /></>
        : <><Field id="bmi-feet" label="Height · feet" value={values.feet} onChange={set('feet')} min="0" suffix="ft" /><Field id="bmi-inches" label="Height · inches" value={values.inches} onChange={set('inches')} min="0" max="11.9" suffix="in" /><Field id="bmi-pounds" label="Weight" value={values.pounds} onChange={set('pounds')} min="1" suffix="lb" /></>}
    </div>
    <ResultCards items={[['Body mass index', Number.isFinite(bmi) ? pretty(bmi) : '—'], ['Reference band', label]]} />
    <p className="tool-inline-status">BMI is a screening estimate for adults and does not measure body composition or replace medical advice.</p>
  </>;
}

function MetabolicCalculator({ values, set, calories = false }) {
  const age = number(values.age); const height = number(values.height); const weight = number(values.weight);
  const activity = number(values.activity);
  const bmr = validPositive(age, height, weight) && age < 130
    ? 10 * weight + 6.25 * height - 5 * age + (values.sex === 'male' ? 5 : -161) : NaN;
  const tdee = bmr * activity;
  const goalFactor = values.goal === 'lose' ? 0.8 : values.goal === 'gain' ? 1.1 : 1;
  const resultCalories = tdee * goalFactor;
  return <>
    <div className="calculator-input-grid">
      <Field id={`${calories ? 'calorie' : 'bmr'}-sex`} label="Equation profile" value={values.sex} onChange={set('sex')} options={[{ value: 'female', label: 'Female equation' }, { value: 'male', label: 'Male equation' }]} />
      <Field id={`${calories ? 'calorie' : 'bmr'}-age`} label="Age" value={values.age} onChange={set('age')} min="1" max="129" suffix="years" />
      <Field id={`${calories ? 'calorie' : 'bmr'}-height`} label="Height" value={values.height} onChange={set('height')} min="1" suffix="cm" />
      <Field id={`${calories ? 'calorie' : 'bmr'}-weight`} label="Weight" value={values.weight} onChange={set('weight')} min="1" suffix="kg" />
      <Field id={`${calories ? 'calorie' : 'bmr'}-activity`} label="Activity level" value={values.activity} onChange={set('activity')} options={activities} />
      {calories && <Field id="calorie-goal" label="Goal estimate" value={values.goal} onChange={set('goal')} options={[{ value: 'lose', label: 'Gradual weight loss · −20%' }, { value: 'maintain', label: 'Maintain current weight' }, { value: 'gain', label: 'Gradual weight gain · +10%' }]} />}
    </div>
    {Number.isFinite(bmr) ? <ResultCards items={calories
      ? [['Estimated resting calories / day', `${pretty(bmr)} kcal`], ['Estimated maintenance / day', `${pretty(tdee)} kcal`], ['Goal-based daily estimate', `${pretty(resultCalories)} kcal`]]
      : [['Estimated BMR / day', `${pretty(bmr)} kcal`], ['Estimated daily needs (TDEE)', `${pretty(tdee)} kcal`]]} /> : <p className="tool-inline-status status-warning">Enter a valid age, height, and weight above zero.</p>}
    <p className="tool-inline-status">Uses the Mifflin–St Jeor equation and an activity multiplier. Results are estimates; individual needs vary.</p>
  </>;
}

function BodyFatCalculator({ values, set }) {
  const metric = values.units === 'metric';
  const changeUnits = (next) => {
    if (next === values.units) return;
    const factor = next === 'imperial' ? 1 / 2.54 : 2.54;
    ['height', 'waist', 'neck', 'hip'].forEach((key) => {
      const converted = number(values[key]) * factor;
      if (Number.isFinite(converted)) set(key)(String(Number(converted.toFixed(1))));
    });
    set('units')(next);
  };
  const height = number(values.height) / (metric ? 2.54 : 1);
  const waist = number(values.waist) / (metric ? 2.54 : 1);
  const neck = number(values.neck) / (metric ? 2.54 : 1);
  const hip = number(values.hip) / (metric ? 2.54 : 1);
  const termsValid = values.sex === 'male' ? validPositive(height, waist - neck) : validPositive(height, waist + hip - neck);
  const percent = termsValid ? values.sex === 'male'
    ? 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
    : 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387 : NaN;
  return <>
    <div className="calculator-input-grid">
      <Field id="fat-sex" label="Equation profile" value={values.sex} onChange={set('sex')} options={[{ value: 'male', label: 'Male · waist and neck' }, { value: 'female', label: 'Female · waist, neck and hip' }]} />
      <Field id="fat-units" label="Units" value={values.units} onChange={changeUnits} options={[{ value: 'metric', label: 'Metric · centimeters' }, { value: 'imperial', label: 'US customary · inches' }]} />
      <Field id="fat-height" label="Height" value={values.height} onChange={set('height')} min="1" suffix={metric ? 'cm' : 'in'} />
      <Field id="fat-waist" label="Waist circumference" value={values.waist} onChange={set('waist')} min="1" suffix={metric ? 'cm' : 'in'} />
      <Field id="fat-neck" label="Neck circumference" value={values.neck} onChange={set('neck')} min="1" suffix={metric ? 'cm' : 'in'} />
      {values.sex === 'female' && <Field id="fat-hip" label="Hip circumference" value={values.hip} onChange={set('hip')} min="1" suffix={metric ? 'cm' : 'in'} />}
    </div>
    <ResultCards items={[['Estimated body fat', Number.isFinite(percent) ? `${pretty(percent)}%` : 'Enter valid measurements']]} />
    <p className="tool-inline-status">Uses the U.S. Navy circumference formula as a rough estimate. Measurement technique affects the result.</p>
  </>;
}

export default function FinancialCalculatorTool({ tool }) {
  const [values, set] = useForm(tool);
  let content;
  switch (tool.slug) {
    case 'age-calculator': content = <AgeCalculator values={values} set={set} />; break;
    case 'amortization-calculator': content = <AmortizationCalculator values={values} set={set} />; break;
    case 'auto-loan-calculator': content = <AutoLoanCalculator values={values} set={set} />; break;
    case 'unit-converter': content = <UnitConverter values={values} set={set} />; break;
    case 'bmi-calculator': content = <BmiCalculator values={values} set={set} />; break;
    case 'bmr-calculator': content = <MetabolicCalculator values={values} set={set} />; break;
    case 'body-fat-calculator': content = <BodyFatCalculator values={values} set={set} />; break;
    case 'calorie-calculator': content = <MetabolicCalculator values={values} set={set} calories />; break;
    default: content = <p className="tool-inline-status">This calculator is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack financial-calculator">{content}<p className="tool-inline-status">Calculations update instantly in your browser.</p></div>;
}
