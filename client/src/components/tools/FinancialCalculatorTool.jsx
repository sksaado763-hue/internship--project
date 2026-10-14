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
  'mortgage-calculator': { price: '350000', down: '70000', apr: '6.5', years: '30', tax: '4200', insurance: '1800' },
  'compound-interest-calculator': { principal: '10000', contribution: '200', apr: '7', years: '30', compounds: '12' },
  'loan-calculator': { amount: '20000', apr: '8', years: '5' },
  'interest-calculator': { principal: '5000', rate: '4.5', years: '10' },
  'interest-rate-calculator': { present: '10000', future: '20000', years: '10', compounds: '12' },
  'investment-calculator': { initial: '10000', contribution: '300', rate: '7', years: '25' },
  'retirement-calculator': { age: '30', retireAge: '65', savings: '25000', contribution: '500', rate: '7' },
  'inflation-calculator': { amount: '1000', years: '10', rate: '3' },
  'sales-tax-calculator': { price: '100', rate: '7', total: '107' },
  'salary-calculator': { salary: '60000', hours: '40', weeks: '52' },
  'conversion-calculator': { category: 'length', value: '1', from: 'km', to: 'mi' },
  'finance-calculator': { income: '4000', needs: '50', wants: '30', savings: '20' },
  'payment-calculator': { amount: '20000', apr: '8', term: '60', extra: '100' },
  'income-tax-calculator': { income: '60000', deductions: '14600' },
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

const compoundPeriodOptions = [
  { value: '1', label: 'Yearly · 1' },
  { value: '2', label: 'Semi-annually · 2' },
  { value: '4', label: 'Quarterly · 4' },
  { value: '12', label: 'Monthly · 12' },
];

function MortgageCalculator({ values, set }) {
  const price = number(values.price); const down = number(values.down); const apr = number(values.apr); const years = number(values.years); const tax = number(values.tax); const insurance = number(values.insurance);
  const result = useMemo(() => {
    if (!validPositive(price, years) || ![down, apr, tax, insurance].every(Number.isFinite) || [down, apr, tax, insurance].some((value) => value < 0)) return null;
    const loan = Math.max(0, price - down);
    const pi = loan > 0 ? paymentFor(loan, apr, years * 12) : 0;
    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;
    return { loan, pi, monthlyTax, monthlyInsurance, monthlyPayment: pi + monthlyTax + monthlyInsurance, totalInterest: pi * years * 12 - loan };
  }, [price, down, apr, years, tax, insurance]);
  return <>
    <div className="calculator-input-grid">
      <Field id="mort-price" label="Home price" value={values.price} onChange={set('price')} min="1" />
      <Field id="mort-down" label="Down payment" value={values.down} onChange={set('down')} min="0" />
      <Field id="mort-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="mort-years" label="Loan term" value={values.years} onChange={set('years')} min="1" max="50" suffix="years" />
      <Field id="mort-tax" label="Property tax / year" value={values.tax} onChange={set('tax')} min="0" />
      <Field id="mort-insurance" label="Homeowner insurance / year" value={values.insurance} onChange={set('insurance')} min="0" />
    </div>
    {result ? <ResultCards items={[["Loan amount", pretty(result.loan)], ['Principal & interest / month', pretty(result.pi)], ['Property tax / month', pretty(result.monthlyTax)], ['Home insurance / month', pretty(result.monthlyInsurance)], ['Total monthly payment (PITI)', pretty(result.monthlyPayment)], ['Total interest over the loan', pretty(result.totalInterest)]]} /> : <p className="tool-inline-status status-warning">Enter a positive home price and term. Down payment, rate, tax, and insurance must be zero or more.</p>}
    <p className="tool-inline-status">Estimates a fixed-rate loan with level monthly payments. Closing costs, mortgage insurance, HOA dues, and rate changes are not included.</p>
  </>;
}

function CompoundInterestCalculator({ values, set }) {
  const principal = number(values.principal); const contribution = number(values.contribution); const apr = number(values.apr); const years = number(values.years); const n = number(values.compounds);
  const result = useMemo(() => {
    if (!validPositive(years) || ![principal, contribution, apr].every(Number.isFinite) || [principal, contribution, apr].some((value) => value < 0) || !(n > 0)) return null;
    const months = years * 12;
    const periodRate = apr / 100 / n;
    const monthlyRate = (1 + periodRate) ** (n / 12) - 1;
    const balanceAt = (monthsElapsed) => principal * (1 + periodRate) ** (n * monthsElapsed / 12)
      + (monthlyRate === 0 ? contribution * monthsElapsed : contribution * ((1 + monthlyRate) ** monthsElapsed - 1) / monthlyRate);
    const futureValue = balanceAt(months);
    const totalContributed = principal + contribution * months;
    const tableYears = Math.min(Math.floor(years), 60);
    const rows = [];
    for (let year = 1; year <= tableYears; year += 1) {
      const balance = balanceAt(year * 12);
      const contributed = contribution * 12;
      const prior = rows.length ? rows[rows.length - 1].balance : principal;
      rows.push({ year, contributed, interest: balance - prior - contributed, balance });
    }
    return { futureValue, totalContributed, interest: futureValue - totalContributed, rows };
  }, [principal, contribution, apr, years, n]);
  return <>
    <div className="calculator-input-grid">
      <Field id="ci-principal" label="Starting principal" value={values.principal} onChange={set('principal')} min="0" />
      <Field id="ci-contribution" label="Monthly contribution" value={values.contribution} onChange={set('contribution')} min="0" suffix="amount / month" />
      <Field id="ci-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="ci-years" label="Years" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
      <Field id="ci-compounds" label="Compounds per year" value={values.compounds} onChange={set('compounds')} options={compoundPeriodOptions} />
    </div>
    {result ? <>
      <ResultCards items={[["Future value", pretty(result.futureValue)], ['Total contributed', pretty(result.totalContributed)], ['Interest earned', pretty(result.interest)]]} />
      <CompoundTable rows={result.rows} />
    </> : <p className="tool-inline-status status-warning">Enter a positive number of years. Principal, contribution, and rate must be zero or more.</p>}
    <p className="tool-inline-status">Assumes a constant rate and contributions at month end, with no taxes or fees. Actual returns vary and are not guaranteed.</p>
  </>;
}

function CompoundTable({ rows }) {
  if (!rows.length) return null;
  return <div className="financial-table-wrap"><table className="financial-table"><caption>Year-by-year growth</caption><thead><tr><th>Year</th><th>Contributions</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{rows.map((row) => <tr key={row.year}><td>{row.year}</td><td>{pretty(row.contributed)}</td><td>{pretty(row.interest)}</td><td>{pretty(row.balance)}</td></tr>)}</tbody></table></div>;
}

function LoanCalculator({ values, set }) {
  const amount = number(values.amount); const apr = number(values.apr); const years = number(values.years);
  const result = useMemo(() => {
    if (!validPositive(amount, years) || !Number.isFinite(apr) || apr < 0) return null;
    const payment = paymentFor(amount, apr, years * 12);
    return { payment, totalPaid: payment * years * 12, totalInterest: payment * years * 12 - amount };
  }, [amount, apr, years]);
  return <>
    <div className="calculator-input-grid">
      <Field id="loan-amount" label="Loan amount" value={values.amount} onChange={set('amount')} min="1" />
      <Field id="loan-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="loan-years" label="Loan term" value={values.years} onChange={set('years')} min="1" max="50" suffix="years" />
    </div>
    {result ? <ResultCards items={[["Monthly payment", pretty(result.payment)], ['Total paid', pretty(result.totalPaid)], ['Total interest', pretty(result.totalInterest)]]} /> : <p className="tool-inline-status status-warning">Enter a positive loan amount and term, and a non-negative interest rate.</p>}
    <p className="tool-inline-status">Estimates a fixed-rate installment loan with equal monthly payments. Fees and rate changes are not included.</p>
  </>;
}

function InterestCalculator({ values, set }) {
  const principal = number(values.principal); const rate = number(values.rate); const years = number(values.years);
  const result = useMemo(() => {
    if (!validPositive(principal, years) || !Number.isFinite(rate) || rate < 0) return null;
    const simpleInterest = principal * rate / 100 * years;
    const compounded = principal * (1 + rate / 100) ** years;
    return { simpleInterest, simpleTotal: principal + simpleInterest, compounded, compoundedInterest: compounded - principal };
  }, [principal, rate, years]);
  return <>
    <div className="calculator-input-grid">
      <Field id="si-principal" label="Principal" value={values.principal} onChange={set('principal')} min="1" />
      <Field id="si-rate" label="Annual interest rate" value={values.rate} onChange={set('rate')} min="0" max="100" suffix="% APR" />
      <Field id="si-years" label="Time" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
    </div>
    {result ? <>
      <ResultCards items={[["Simple interest earned", pretty(result.simpleInterest)], ['Total value · simple interest', pretty(result.simpleTotal)]]} />
      <ResultCards items={[["Interest · compounded annually", pretty(result.compoundedInterest)], ['Total value · compounded annually', pretty(result.compounded)]]} />
    </> : <p className="tool-inline-status status-warning">Enter a positive principal and time, and a non-negative interest rate.</p>}
    <p className="tool-inline-status">Simple interest does not compound; the second figure shows the same inputs with interest reinvested once a year.</p>
  </>;
}

function InterestRateCalculator({ values, set }) {
  const present = number(values.present); const future = number(values.future); const years = number(values.years); const n = number(values.compounds);
  const result = useMemo(() => {
    if (!validPositive(present, future, years) || !(n > 0)) return null;
    const rate = n * ((future / present) ** (1 / (n * years)) - 1);
    return { rate: rate * 100, growth: (future / present - 1) * 100 };
  }, [present, future, years, n]);
  return <>
    <div className="calculator-input-grid">
      <Field id="ir-present" label="Present value" value={values.present} onChange={set('present')} min="1" />
      <Field id="ir-future" label="Future value" value={values.future} onChange={set('future')} min="1" />
      <Field id="ir-years" label="Years" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
      <Field id="ir-compounds" label="Compounds per year" value={values.compounds} onChange={set('compounds')} options={compoundPeriodOptions} />
    </div>
    {result ? <ResultCards items={[["Required nominal annual rate", `${pretty(result.rate)}%`], ['Total growth over the period', `${pretty(result.growth)}%`]]} /> : <p className="tool-inline-status status-warning">Enter positive present value, future value, and number of years.</p>}
    <p className="tool-inline-status">Solves for one constant nominal rate. Real investments rarely grow at a steady rate, so treat this as a comparison figure.</p>
  </>;
}

function InvestmentCalculator({ values, set }) {
  const initial = number(values.initial); const contribution = number(values.contribution); const rate = number(values.rate); const years = number(values.years);
  const result = useMemo(() => {
    if (!validPositive(years) || ![initial, contribution, rate].every(Number.isFinite) || [initial, contribution, rate].some((value) => value < 0)) return null;
    const months = years * 12;
    const monthlyRate = rate / 1200;
    const futureValue = initial * (1 + monthlyRate) ** months
      + (monthlyRate === 0 ? contribution * months : contribution * ((1 + monthlyRate) ** months - 1) / monthlyRate);
    const totalContributed = initial + contribution * months;
    return { futureValue, totalContributed, growth: futureValue - totalContributed, realValue: futureValue / 1.03 ** years };
  }, [initial, contribution, rate, years]);
  return <>
    <div className="calculator-input-grid">
      <Field id="inv-initial" label="Initial amount" value={values.initial} onChange={set('initial')} min="0" />
      <Field id="inv-contribution" label="Monthly contribution" value={values.contribution} onChange={set('contribution')} min="0" suffix="amount / month" />
      <Field id="inv-rate" label="Expected annual return" value={values.rate} onChange={set('rate')} min="0" max="100" suffix="% APR" />
      <Field id="inv-years" label="Years" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
    </div>
    {result ? <ResultCards items={[["Future value", pretty(result.futureValue)], ['Total contributed', pretty(result.totalContributed)], ['Growth earned', pretty(result.growth)], ['Real value · after 3% yearly inflation', pretty(result.realValue)]]} /> : <p className="tool-inline-status status-warning">Enter a positive number of years. Amount, contribution, and return must be zero or more.</p>}
    <p className="tool-inline-status">Assumes monthly compounding, contributions at month end, and a steady return. The real value figure uses a fixed 3% inflation estimate; actual inflation and returns vary.</p>
  </>;
}

function RetirementCalculator({ values, set }) {
  const age = number(values.age); const retireAge = number(values.retireAge); const savings = number(values.savings); const contribution = number(values.contribution); const rate = number(values.rate);
  const result = useMemo(() => {
    if (![age, retireAge, savings, contribution, rate].every(Number.isFinite) || [age, retireAge].some((value) => value <= 0) || [savings, contribution, rate].some((value) => value < 0) || retireAge <= age) return null;
    const months = (retireAge - age) * 12;
    const monthlyRate = rate / 1200;
    const projected = savings * (1 + monthlyRate) ** months
      + (monthlyRate === 0 ? contribution * months : contribution * ((1 + monthlyRate) ** months - 1) / monthlyRate);
    const totalContributions = savings + contribution * months;
    return { projected, totalContributions, growth: projected - totalContributions, withdrawal: projected * 0.04, years: retireAge - age };
  }, [age, retireAge, savings, contribution, rate]);
  return <>
    <div className="calculator-input-grid">
      <Field id="ret-age" label="Current age" value={values.age} onChange={set('age')} min="1" max="120" suffix="years" />
      <Field id="ret-retire-age" label="Retirement age" value={values.retireAge} onChange={set('retireAge')} min="1" max="120" suffix="years" />
      <Field id="ret-savings" label="Current savings" value={values.savings} onChange={set('savings')} min="0" />
      <Field id="ret-contribution" label="Monthly contribution" value={values.contribution} onChange={set('contribution')} min="0" suffix="amount / month" />
      <Field id="ret-rate" label="Annual return" value={values.rate} onChange={set('rate')} min="0" max="100" suffix="% APR" />
    </div>
    {result ? <ResultCards items={[["Projected savings at retirement", pretty(result.projected)], ['Total contributions', pretty(result.totalContributions)], ['Growth earned', pretty(result.growth)], ['Estimated yearly withdrawal · 4% rule', pretty(result.withdrawal)]]} /> : <p className="tool-inline-status status-warning">Retirement age must be greater than current age, with valid savings, contribution, and return values.</p>}
    <p className="tool-inline-status">Projects a constant return with monthly contributions until retirement. The 4% withdrawal figure is a common rule of thumb, not a guarantee.</p>
  </>;
}

function InflationCalculator({ values, set }) {
  const amount = number(values.amount); const years = number(values.years); const rate = number(values.rate);
  const result = useMemo(() => {
    if (!validPositive(amount, years) || !Number.isFinite(rate) || rate < 0) return null;
    const factor = (1 + rate / 100) ** years;
    return { future: amount * factor, past: amount / factor };
  }, [amount, years, rate]);
  return <>
    <div className="calculator-input-grid">
      <Field id="infl-amount" label="Amount" value={values.amount} onChange={set('amount')} min="1" />
      <Field id="infl-years" label="Years" value={values.years} onChange={set('years')} min="1" max="100" suffix="years" />
      <Field id="infl-rate" label="Yearly inflation rate" value={values.rate} onChange={set('rate')} min="0" max="100" suffix="%" />
    </div>
    {result ? <ResultCards items={[[`Cost in ${pretty(years, 0)} years`, pretty(result.future)], [`Buying power ${pretty(years, 0)} years ago`, pretty(result.past)]]} /> : <p className="tool-inline-status status-warning">Enter a positive amount and number of years, and a non-negative inflation rate.</p>}
    <p className="tool-inline-status">Assumes a constant yearly inflation rate. Actual inflation varies from year to year.</p>
  </>;
}

function SalesTaxCalculator({ values, set }) {
  const price = number(values.price); const rate = number(values.rate); const total = number(values.total);
  const forward = useMemo(() => validPositive(price) && Number.isFinite(rate) && rate >= 0
    ? { tax: price * rate / 100, total: price * (1 + rate / 100) } : null, [price, rate]);
  const backward = useMemo(() => validPositive(total) && Number.isFinite(rate) && rate >= 0
    ? { preTax: total / (1 + rate / 100) } : null, [total, rate]);
  return <>
    <div className="calculator-input-grid">
      <Field id="stx-price" label="Pre-tax price" value={values.price} onChange={set('price')} min="1" />
      <Field id="stx-rate" label="Tax rate" value={values.rate} onChange={set('rate')} min="0" max="100" suffix="%" />
      <Field id="stx-total" label="Total price with tax" value={values.total} onChange={set('total')} min="1" />
    </div>
    {forward ? <ResultCards items={[["Tax amount", pretty(forward.tax)], ['Total price with tax', pretty(forward.total)]]} /> : <p className="tool-inline-status status-warning">Enter a positive pre-tax price and a non-negative tax rate.</p>}
    {backward ? <ResultCards items={[["Pre-tax price inside the total", pretty(backward.preTax)], ['Tax amount inside the total', pretty(total - backward.preTax)]]} /> : <p className="tool-inline-status status-warning">Enter a positive total price to work the tax back out.</p>}
    <p className="tool-inline-status">Uses one flat tax rate. Real receipts may combine state, local, and special district taxes differently.</p>
  </>;
}

function SalaryCalculator({ values, set }) {
  const salary = number(values.salary); const hours = number(values.hours); const weeks = number(values.weeks);
  const result = useMemo(() => {
    if (!validPositive(salary, hours, weeks)) return null;
    const hourly = salary / (hours * weeks);
    return { hourly, daily: hourly * hours, weekly: salary / weeks, biWeekly: salary / weeks * 2, monthly: salary / 12, annual: salary };
  }, [salary, hours, weeks]);
  return <>
    <div className="calculator-input-grid">
      <Field id="sal-salary" label="Annual salary" value={values.salary} onChange={set('salary')} min="1" />
      <Field id="sal-hours" label="Hours per week" value={values.hours} onChange={set('hours')} min="1" max="168" suffix="hours" />
      <Field id="sal-weeks" label="Weeks per year" value={values.weeks} onChange={set('weeks')} min="1" max="52" suffix="weeks" />
    </div>
    {result ? <ResultCards items={[["Hourly", pretty(result.hourly)], ['Daily', pretty(result.daily)], ['Weekly', pretty(result.weekly)], ['Bi-weekly', pretty(result.biWeekly)], ['Monthly', pretty(result.monthly)], ['Annual gross', pretty(result.annual)]]} /> : <p className="tool-inline-status status-warning">Enter a positive salary, hours per week, and weeks per year.</p>}
    <p className="tool-inline-status">Shows gross pay only; taxes, benefits, and deductions are not included. Monthly uses salary ÷ 12.</p>
  </>;
}

const conversionGroups = {
  length: { label: 'Length', units: { mm: ['Millimeters', 0.001], cm: ['Centimeters', 0.01], m: ['Meters', 1], km: ['Kilometers', 1000], in: ['Inches', 0.0254], ft: ['Feet', 0.3048], yd: ['Yards', 0.9144], mi: ['Miles', 1609.344] } },
  mass: { label: 'Mass', units: { mg: ['Milligrams', 0.000001], g: ['Grams', 0.001], kg: ['Kilograms', 1], t: ['Metric tons', 1000], oz: ['Ounces', 0.028349523125], lb: ['Pounds', 0.45359237] } },
  temperature: { label: 'Temperature', units: { c: ['Celsius (°C)'], f: ['Fahrenheit (°F)'], k: ['Kelvin (K)'] } },
  data: { label: 'Data · decimal units', units: { b: ['Bytes', 1], kb: ['Kilobytes · 1000 B', 1000], mb: ['Megabytes', 1000000], gb: ['Gigabytes', 1000000000], tb: ['Terabytes', 1000000000000] } },
};

function ConversionCalculator({ values, set }) {
  const group = conversionGroups[values.category] ?? conversionGroups.length;
  const unitOptions = Object.entries(group.units).map(([value, [label]]) => ({ value, label }));
  const from = group.units[values.from] ? values.from : Object.keys(group.units)[0];
  const to = group.units[values.to] ? values.to : Object.keys(group.units)[1] ?? from;
  const value = number(values.value);
  let converted = NaN;
  if (Number.isFinite(value)) converted = values.category === 'temperature'
    ? convertTemperature(value, from, to)
    : value * group.units[from][1] / group.units[to][1];
  const changeCategory = (next) => {
    const keys = Object.keys(conversionGroups[next].units);
    set('category')(next);
    set('from')(keys[0]);
    set('to')(keys[1] ?? keys[0]);
  };
  return <>
    <div className="calculator-input-grid">
      <Field id="conv-category" label="Category" value={values.category} onChange={changeCategory} options={Object.entries(conversionGroups).map(([value, item]) => ({ value, label: item.label }))} />
      <Field id="conv-value" label="Value" value={values.value} onChange={set('value')} />
      <Field id="conv-from" label="From" value={from} onChange={set('from')} options={unitOptions} />
      <Field id="conv-to" label="To" value={to} onChange={set('to')} options={unitOptions} />
    </div>
    <ResultCards items={[[`${group.units[from][0]} in ${group.units[to][0]}`, Number.isFinite(converted) ? pretty(converted, 6) : '—']]} />
    <p className="tool-inline-status">Conversions use standard factors, computed locally. Data units are decimal (1 KB = 1000 bytes), and temperature conversions include the offset between scales.</p>
  </>;
}

function FinanceCalculator({ values, set }) {
  const income = number(values.income); const needs = number(values.needs); const wants = number(values.wants); const savings = number(values.savings);
  const parts = [needs, wants, savings];
  const total = parts.reduce((sum, value) => sum + value, 0);
  const balanced = Number.isFinite(income) && income > 0 && parts.every((value) => Number.isFinite(value) && value >= 0) && Math.abs(total - 100) < 0.01;
  return <>
    <div className="calculator-input-grid">
      <Field id="fin-income" label="Monthly income after tax" value={values.income} onChange={set('income')} min="0" />
      <Field id="fin-needs" label="Needs · essentials" value={values.needs} onChange={set('needs')} min="0" max="100" suffix="%" />
      <Field id="fin-wants" label="Wants · lifestyle" value={values.wants} onChange={set('wants')} min="0" max="100" suffix="%" />
      <Field id="fin-savings" label="Savings & debt payoff" value={values.savings} onChange={set('savings')} min="0" max="100" suffix="%" />
    </div>
    {!balanced && <p className="tool-inline-status status-warning" aria-live="polite">The three percentages currently add to {Number.isFinite(total) ? pretty(total) : '—'}% — they must total exactly 100% for the split to be shown.</p>}
    {balanced && <ResultCards items={[
      ['Needs · essentials', pretty(income * needs / 100)],
      ['Wants · lifestyle', pretty(income * wants / 100)],
      ['Savings & debt payoff', pretty(income * savings / 100)],
      ['Total allocated', pretty(income)],
    ]} />}
    <p className="tool-inline-status">Splits income by the 50/30/20 budgeting rule: about 50% for needs, 30% for wants, and 20% for savings or extra debt payments. The percentages are adjustable — the rule is a starting point, not a law.</p>
  </>;
}

function PaymentCalculator({ values, set }) {
  const amount = number(values.amount); const apr = number(values.apr); const term = number(values.term); const extra = number(values.extra);
  const result = useMemo(() => {
    if (!validPositive(amount, term) || !Number.isFinite(apr) || apr < 0 || !Number.isFinite(extra) || extra < 0) return null;
    const standard = amortize(amount, apr, term);
    const accelerated = extra > 0 ? amortize(amount, apr, term, extra) : standard;
    if (!standard || !accelerated) return null;
    return {
      payment: standard.basePayment,
      months: accelerated.months,
      standardMonths: standard.months,
      interestSaved: standard.totalInterest - accelerated.totalInterest,
      totalInterest: accelerated.totalInterest,
      extraApplied: extra > 0,
    };
  }, [amount, apr, term, extra]);
  return <>
    <div className="calculator-input-grid">
      <Field id="pay-amount" label="Loan amount" value={values.amount} onChange={set('amount')} min="1" />
      <Field id="pay-apr" label="Annual interest rate" value={values.apr} onChange={set('apr')} min="0" max="100" suffix="% APR" />
      <Field id="pay-term" label="Loan term" value={values.term} onChange={set('term')} min="1" max="1200" suffix="months" />
      <Field id="pay-extra" label="Extra monthly payment" value={values.extra} onChange={set('extra')} min="0" suffix="amount / month" />
    </div>
    {result ? <>
      <ResultCards items={[
        ['Standard monthly payment', pretty(result.payment)],
        ['Payoff time with extra', `${Math.floor(result.months / 12)}y ${result.months % 12}m · ${result.months} months`],
        ['Original term', `${Math.floor(result.standardMonths / 12)}y ${result.standardMonths % 12}m · ${result.standardMonths} months`],
        ['Interest saved', pretty(result.interestSaved)],
        ['Total interest · with extra', pretty(result.totalInterest)],
      ]} />
      {result.extraApplied && <p className="tool-inline-status">Paying {pretty(extra)} extra per month clears this loan in about {Math.floor(result.months / 12)}y {result.months % 12}m instead of {Math.floor(result.standardMonths / 12)}y {result.standardMonths % 12}m, saving roughly {pretty(result.interestSaved)} in interest.</p>}
    </> : <p className="tool-inline-status status-warning">Enter a positive loan amount and term in months, a non-negative interest rate, and an extra payment of zero or more. (A very low payment can also fail to cover monthly interest.)</p>}
    <p className="tool-inline-status">Fixed-rate amortization with monthly payments, computed locally. Lender fees, prepayment penalties, and rate changes are not included; the payoff loop is capped at 1200 months.</p>
  </>;
}

const US_SINGLE_BRACKETS = [
  [0, 0.10], [11600, 0.12], [47150, 0.22], [100525, 0.24],
  [191950, 0.32], [243725, 0.35], [609350, 0.37],
];

function bracketTax(taxable) {
  let tax = 0;
  for (let i = 0; i < US_SINGLE_BRACKETS.length; i += 1) {
    const [floor, rate] = US_SINGLE_BRACKETS[i];
    const ceiling = i + 1 < US_SINGLE_BRACKETS.length ? US_SINGLE_BRACKETS[i + 1][0] : Infinity;
    if (taxable > floor) tax += (Math.min(taxable, ceiling) - floor) * rate;
  }
  return tax;
}

function IncomeTaxCalculator({ values, set }) {
  const income = number(values.income); const deductions = number(values.deductions);
  const valid = Number.isFinite(income) && income >= 0 && Number.isFinite(deductions) && deductions >= 0;
  const taxable = valid ? Math.max(0, income - deductions) : 0;
  const tax = valid ? bracketTax(taxable) : 0;
  return <>
    <div className="calculator-input-grid">
      <Field id="tax-income" label="Annual gross income" value={values.income} onChange={set('income')} min="0" />
      <Field id="tax-deductions" label="Deductions (standard or itemized)" value={values.deductions} onChange={set('deductions')} min="0" />
    </div>
    {valid && <>
      <ResultCards items={[
        ['Taxable income', pretty(taxable)],
        ['Estimated federal tax', pretty(tax)],
        ['Effective tax rate', income > 0 ? `${pretty(tax / income * 100, 2)}%` : '—'],
        ['Take-home after tax', pretty(income - tax)],
        ['Monthly take-home', pretty((income - tax) / 12)],
      ]} />
    </>}
    {!valid && <p className="tool-inline-status status-warning">Enter a non-negative annual income and deductions to see the estimate.</p>}
    <p className="tool-inline-status">Uses the 2024 US federal income tax brackets for a single filer, computed locally. State tax, payroll tax (FICA), credits, and filing status are not included — treat this as a rough estimate, not tax advice.</p>
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
    case 'mortgage-calculator': content = <MortgageCalculator values={values} set={set} />; break;
    case 'compound-interest-calculator': content = <CompoundInterestCalculator values={values} set={set} />; break;
    case 'loan-calculator': content = <LoanCalculator values={values} set={set} />; break;
    case 'interest-calculator': content = <InterestCalculator values={values} set={set} />; break;
    case 'interest-rate-calculator': content = <InterestRateCalculator values={values} set={set} />; break;
    case 'investment-calculator': content = <InvestmentCalculator values={values} set={set} />; break;
    case 'retirement-calculator': content = <RetirementCalculator values={values} set={set} />; break;
    case 'inflation-calculator': content = <InflationCalculator values={values} set={set} />; break;
    case 'sales-tax-calculator': content = <SalesTaxCalculator values={values} set={set} />; break;
    case 'salary-calculator': content = <SalaryCalculator values={values} set={set} />; break;
    case 'conversion-calculator': content = <ConversionCalculator values={values} set={set} />; break;
    case 'finance-calculator': content = <FinanceCalculator values={values} set={set} />; break;
    case 'payment-calculator': content = <PaymentCalculator values={values} set={set} />; break;
    case 'income-tax-calculator': content = <IncomeTaxCalculator values={values} set={set} />; break;
    default: content = <p className="tool-inline-status">This calculator is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack financial-calculator">{content}<p className="tool-inline-status">Calculations update instantly in your browser.</p></div>;
}
