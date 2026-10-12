import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button.jsx';

const defaults = {
  'scientific-calculator': { expression: '', angleMode: 'deg' },
  'fraction-calculator': { n1: '1', d1: '2', n2: '3', d2: '4', operation: '+', sn: '6', sd: '8' },
  'gpa-calculator': {
    courses: [
      { id: 1, name: '', credits: '', grade: 'A' },
      { id: 2, name: '', credits: '', grade: 'A' },
      { id: 3, name: '', credits: '', grade: 'A' },
      { id: 4, name: '', credits: '', grade: 'A' },
    ],
  },
  'grade-calculator': {
    categories: [
      { id: 1, name: 'Homework', weight: '40', grade: '88' },
      { id: 2, name: 'Midterm', weight: '30', grade: '82' },
      { id: 3, name: 'Participation', weight: '10', grade: '95' },
      { id: 4, name: 'Projects', weight: '20', grade: '90' },
    ],
    current: '85',
    finalWeight: '40',
    target: '90',
  },
  'standard-deviation-calculator': { data: '' },
  'triangle-calculator': { mode: 'sss', a: '5', b: '6', c: '7', legA: '3', legB: '4' },
};

const number = (value) => value === '' ? NaN : Number(value);
const pretty = (value, digits = 2) => Number.isFinite(value)
  ? new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value)
  : '—';
const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) { [x, y] = [y, x % y]; } return x || 1; };

const simplifyFraction = (numerator, denominator) => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  const divisor = gcd(numerator, denominator);
  let n = numerator / divisor;
  let d = denominator / divisor;
  if (d < 0) { n = -n; d = -d; }
  return { numerator: n, denominator: d };
};
const fractionText = (fraction) => !fraction ? '—' : fraction.denominator === 1 ? `${fraction.numerator}` : `${fraction.numerator}/${fraction.denominator}`;

const gpaScale = [['A+', 4.0], ['A', 4.0], ['A-', 3.7], ['B+', 3.3], ['B', 3.0], ['B-', 2.7], ['C+', 2.3], ['C', 2.0], ['C-', 1.7], ['D+', 1.3], ['D', 1.0], ['D-', 0.7], ['F', 0.0]];
const gpaPoints = Object.fromEntries(gpaScale);
const gradeOptions = gpaScale.map(([value]) => ({ value, label: `${value} · ${gpaPoints[value].toFixed(1)}` }));

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
  const [values, setValues] = useState(() => defaults[tool.slug] ?? {});
  useEffect(() => setValues(defaults[tool.slug] ?? {}), [tool.slug]);
  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));
  return [values, set];
}

const nextRowId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

/* ---------- Safe expression evaluator: tokenizer -> shunting-yard -> RPN ---------- */

const operatorPrecedence = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '^': 4, pct: 5 };
const isRightAssociative = (op) => op === '^' || op === 'neg';

function tokenizeExpression(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) { index += 1; continue; }
    if (/[0-9.]/.test(char)) {
      let text = '';
      while (index < source.length && /[0-9.]/.test(source[index])) text += source[index++];
      if ((text.match(/\./g) || []).length > 1 || !Number.isFinite(Number(text))) throw new Error(`"${text}" is not a valid number.`);
      tokens.push({ type: 'number', value: Number(text) });
      continue;
    }
    const fnMatch = /^(sin|cos|tan|log|ln|sqrt)/.exec(source.slice(index));
    if (fnMatch) { tokens.push({ type: 'function', name: fnMatch[1] }); index += fnMatch[1].length; continue; }
    if (char === '√') { tokens.push({ type: 'function', name: 'sqrt' }); index += 1; continue; }
    if (char === 'π') { tokens.push({ type: 'number', value: Math.PI }); index += 1; continue; }
    if (char === 'e') { tokens.push({ type: 'number', value: Math.E }); index += 1; continue; }
    if (char === '+' || char === '-' || char === '−') { tokens.push({ type: 'operator', op: char === '+' ? '+' : '-' }); index += 1; continue; }
    if (char === '*' || char === '×') { tokens.push({ type: 'operator', op: '*' }); index += 1; continue; }
    if (char === '/' || char === '÷') { tokens.push({ type: 'operator', op: '/' }); index += 1; continue; }
    if (char === '^') { tokens.push({ type: 'operator', op: '^' }); index += 1; continue; }
    if (char === '%') { tokens.push({ type: 'postfix', op: 'pct' }); index += 1; continue; }
    if (char === '(') { tokens.push({ type: 'lparen' }); index += 1; continue; }
    if (char === ')') { tokens.push({ type: 'rparen' }); index += 1; continue; }
    throw new Error(`Unsupported character "${char}".`);
  }
  return tokens;
}

function normalizeTokens(tokens) {
  const output = [];
  const endsWithValue = (token) => token && (token.type === 'number' || token.type === 'rparen' || token.type === 'postfix');
  const startsWithValue = (token) => token && (token.type === 'number' || token.type === 'function' || token.type === 'lparen');
  for (const token of tokens) {
    const previous = output[output.length - 1];
    if (token.type === 'operator' && token.op === '-') {
      const unary = !previous || previous.type === 'operator' || previous.type === 'lparen' || previous.type === 'function';
      if (unary) { output.push({ type: 'operator', op: 'neg' }); continue; }
    }
    if (endsWithValue(previous) && startsWithValue(token)) output.push({ type: 'operator', op: '*' });
    output.push(token);
  }
  return output;
}

function toRpn(tokens) {
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (token.type === 'number') { output.push(token); continue; }
    if (token.type === 'function') { stack.push(token); continue; }
    if (token.type === 'operator' || token.type === 'postfix') {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'function') {
          if (token.op === 'neg') break;
          output.push(stack.pop());
          continue;
        }
        if (top.type !== 'operator' && top.type !== 'postfix') break;
        const incoming = operatorPrecedence[token.op];
        const existing = operatorPrecedence[top.op];
        // Unary minus binds looser than ^ on its left (-2^2 = -(2^2)) but tighter inside an exponent (2^-3 = 2^(-3)),
        // and postfix % applies before a leading minus (-50% = -(50%)); none of those may pop the waiting neg.
        if (top.op === 'neg' && (token.op === '^' || token.op === 'neg' || token.op === 'pct')) break;
        if (token.op === 'neg' && top.op === '^') break;
        if (isRightAssociative(token.op) ? incoming >= existing : incoming > existing) break;
        output.push(stack.pop());
      }
      stack.push(token);
      continue;
    }
    if (token.type === 'lparen') { stack.push(token); continue; }
    if (token.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') output.push(stack.pop());
      if (!stack.length) throw new Error('Parentheses are not balanced.');
      stack.pop();
      if (stack.length && stack[stack.length - 1].type === 'function') output.push(stack.pop());
    }
  }
  while (stack.length) {
    const top = stack.pop();
    if (top.type === 'lparen') throw new Error('Parentheses are not balanced.');
    output.push(top);
  }
  return output;
}

function evaluateRpn(tokens, angleMode) {
  const stack = [];
  const toRadians = (value) => angleMode === 'deg' ? (value * Math.PI) / 180 : value;
  for (const token of tokens) {
    if (token.type === 'number') { stack.push(token.value); continue; }
    if (token.type === 'postfix') {
      if (stack.length < 1) throw new Error('Invalid expression.');
      stack.push(stack.pop() / 100);
      continue;
    }
    if (token.type === 'function') {
      if (stack.length < 1) throw new Error('Invalid expression.');
      const value = stack.pop();
      if ((token.name === 'log' || token.name === 'ln') && value <= 0) throw new Error(`${token.name === 'log' ? 'Logarithm' : 'Natural logarithm'} needs a positive number.`);
      if (token.name === 'sqrt' && value < 0) throw new Error('Square root of a negative number is not a real number.');
      if (token.name === 'sin') stack.push(Math.sin(toRadians(value)));
      else if (token.name === 'cos') stack.push(Math.cos(toRadians(value)));
      else if (token.name === 'tan') stack.push(Math.tan(toRadians(value)));
      else if (token.name === 'log') stack.push(Math.log10(value));
      else if (token.name === 'ln') stack.push(Math.log(value));
      else stack.push(Math.sqrt(value));
      continue;
    }
    if (token.op === 'neg') {
      if (stack.length < 1) throw new Error('Invalid expression.');
      stack.push(-stack.pop());
      continue;
    }
    if (stack.length < 2) throw new Error('Invalid expression.');
    const b = stack.pop();
    const a = stack.pop();
    if (token.op === '+') stack.push(a + b);
    else if (token.op === '-') stack.push(a - b);
    else if (token.op === '*') stack.push(a * b);
    else if (token.op === '/') {
      if (b === 0) throw new Error('Cannot divide by zero.');
      stack.push(a / b);
    } else stack.push(a ** b);
  }
  if (stack.length !== 1) throw new Error('Invalid expression.');
  const value = stack[0];
  if (!Number.isFinite(value)) throw new Error('The result is out of range.');
  return value;
}

const evaluateExpression = (source, angleMode) => evaluateRpn(toRpn(normalizeTokens(tokenizeExpression(source))), angleMode);

const formatScientific = (value) => {
  if (!Number.isFinite(value)) return 'Out of range';
  const rounded = Number(value.toPrecision(12));
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 10, useGrouping: false }).format(rounded);
};

const padButtons = ['AC', '⌫', '(', ')', '^', 'sin', 'cos', 'tan', 'log', 'ln', '√', 'π', 'e', '%', '÷', '7', '8', '9', '×', '−', '4', '5', '6', '+', '±', '1', '2', '3', '0', '.', '='];

const looksIncomplete = (expression) => /[+−×÷^(]$/.test(expression.trim());

const toggleSign = (expression) => {
  const match = /(\d+\.?\d*|\.\d+|π|e)$/.exec(expression);
  if (!match) return expression;
  return `${expression.slice(0, match.index)}(-${match[0]})`;
};

function ScientificCalculator({ values, set }) {
  const evaluation = useMemo(() => {
    if (!values.expression.trim()) return { value: null, error: null };
    try { return { value: evaluateExpression(values.expression, values.angleMode), error: null }; }
    catch (error) { return { value: null, error: error.message }; }
  }, [values.expression, values.angleMode]);
  const press = (symbol) => {
    if (symbol === 'AC') { set('expression')(''); return; }
    if (symbol === '⌫') { set('expression')(values.expression.slice(0, -1)); return; }
    if (symbol === '±') { set('expression')(toggleSign(values.expression)); return; }
    if (symbol === '=') {
      if (evaluation.value === null || evaluation.error) return;
      set('expression')(formatScientific(evaluation.value));
      return;
    }
    set('expression')(values.expression + symbol);
  };
  return <>
    <div className="calculator-input-grid">
      <Field id="sci-expression" label="Expression" type="text" value={values.expression} onChange={set('expression')} />
      <Field id="sci-angle-mode" label="Angle unit" value={values.angleMode} onChange={set('angleMode')} options={[{ value: 'deg', label: 'Degrees' }, { value: 'rad', label: 'Radians' }]} />
    </div>
    <p className="calculator-result" aria-live="polite"><span>Result</span><strong>{evaluation.value === null || evaluation.error ? '—' : formatScientific(evaluation.value)}</strong></p>
    {evaluation.error && !looksIncomplete(values.expression) && <p className="tool-inline-status status-warning">{evaluation.error}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
      {padButtons.map((symbol) => <button key={symbol} type="button" className="case-action" onClick={() => press(symbol)}>{symbol}</button>)}
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </div>
    <p className="tool-inline-status">Trigonometric functions follow the selected angle unit. Results use floating-point arithmetic, so very long expressions can accumulate small rounding error.</p>
  </>;
}

function FractionCalculator({ values, set }) {
  const n1 = number(values.n1); const d1 = number(values.d1);
  const n2 = number(values.n2); const d2 = number(values.d2);
  const computed = useMemo(() => {
    if (![n1, d1, n2, d2].every(Number.isFinite)) return { error: 'Enter numbers for both fractions.' };
    if (d1 === 0 || d2 === 0) return { error: 'Denominators cannot be zero.' };
    let numerator; let denominator;
    if (values.operation === '+') { numerator = n1 * d2 + n2 * d1; denominator = d1 * d2; }
    else if (values.operation === '−') { numerator = n1 * d2 - n2 * d1; denominator = d1 * d2; }
    else if (values.operation === '×') { numerator = n1 * n2; denominator = d1 * d2; }
    else {
      if (n2 === 0) return { error: 'Cannot divide by a fraction whose numerator is zero.' };
      numerator = n1 * d2; denominator = d1 * n2;
    }
    return { fraction: simplifyFraction(numerator, denominator), decimal: numerator / denominator };
  }, [n1, d1, n2, d2, values.operation]);
  const sn = number(values.sn); const sd = number(values.sd);
  const simplifiedInput = useMemo(() => {
    if (![sn, sd].every(Number.isFinite)) return null;
    if (sd === 0) return { error: true };
    return { fraction: simplifyFraction(sn, sd), decimal: sn / sd };
  }, [sn, sd]);
  return <>
    <div className="calculator-input-grid">
      <Field id="frac-n1" label="First numerator" value={values.n1} onChange={set('n1')} />
      <Field id="frac-d1" label="First denominator" value={values.d1} onChange={set('d1')} />
      <Field id="frac-operation" label="Operation" value={values.operation} onChange={set('operation')} options={[{ value: '+', label: 'Add · +' }, { value: '−', label: 'Subtract · −' }, { value: '×', label: 'Multiply · ×' }, { value: '÷', label: 'Divide · ÷' }]} />
      <Field id="frac-n2" label="Second numerator" value={values.n2} onChange={set('n2')} />
      <Field id="frac-d2" label="Second denominator" value={values.d2} onChange={set('d2')} />
    </div>
    {computed.error
      ? <p className="tool-inline-status status-warning">{computed.error}</p>
      : <ResultCards items={[['Result fraction', fractionText(computed.fraction)], ['Decimal equivalent', pretty(computed.decimal, 6)]]} />}
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Simplify a fraction</h2>
      <div className="calculator-input-grid">
        <Field id="frac-sn" label="Numerator" value={values.sn} onChange={set('sn')} />
        <Field id="frac-sd" label="Denominator" value={values.sd} onChange={set('sd')} />
      </div>
      {simplifiedInput && (simplifiedInput.error
        ? <p className="tool-inline-status status-warning">The denominator cannot be zero.</p>
        : <ResultCards items={[['Simplified fraction', fractionText(simplifiedInput.fraction)], ['Decimal equivalent', pretty(simplifiedInput.decimal, 6)]]} />)}
    </section>
    <p className="tool-inline-status">Results are exact for whole-number inputs and are reduced by their greatest common divisor.</p>
  </>;
}

function GpaCalculator({ values, set }) {
  const courses = values.courses ?? [];
  const updateCourse = (id, key) => (value) => set('courses')(courses.map((course) => (course.id === id ? { ...course, [key]: value } : course)));
  const addCourse = () => set('courses')([...courses, { id: nextRowId(courses), name: '', credits: '', grade: 'A' }]);
  const removeCourse = (id) => {
    if (courses.length <= 1) return;
    set('courses')(courses.filter((course) => course.id !== id));
  };
  const summary = useMemo(() => {
    let points = 0; let credits = 0; let count = 0;
    for (const course of courses) {
      const credit = number(course.credits);
      if (!Number.isFinite(credit) || credit <= 0) continue;
      points += credit * gpaPoints[course.grade];
      credits += credit;
      count += 1;
    }
    return { gpa: credits > 0 ? points / credits : NaN, credits, count };
  }, [courses]);
  return <>
    {courses.map((course, position) => <div className="calculator-input-grid" key={course.id}>
      <Field id={`gpa-course-${course.id}-name`} label={`Course ${position + 1} · name (optional)`} type="text" value={course.name} onChange={updateCourse(course.id, 'name')} />
      <Field id={`gpa-course-${course.id}-credits`} label="Credits" value={course.credits} onChange={updateCourse(course.id, 'credits')} min="0" suffix="credits" />
      <Field id={`gpa-course-${course.id}-grade`} label="Grade" value={course.grade} onChange={updateCourse(course.id, 'grade')} options={gradeOptions} />
      <div className="tool-actions"><Button variant="secondary" size="small" type="button" onClick={() => removeCourse(course.id)} disabled={courses.length <= 1}>Remove</Button></div>
    </div>)}
    <div className="tool-action-row">
      <p className="tool-inline-status">Rows with credits above zero count toward the GPA. The A+/A−…F map uses a 4.0 scale where A and A+ are both 4.0.</p>
      <div className="tool-actions"><Button variant="primary" size="small" type="button" onClick={addCourse}>Add course</Button></div>
    </div>
    {summary.count > 0
      ? <ResultCards items={[['Cumulative GPA', pretty(summary.gpa, 2)], ['Total credits', pretty(summary.credits, 1)], ['Courses counted', pretty(summary.count, 0)]]} />
      : <p className="tool-inline-status status-warning">Add at least one course with credits above zero and pick a grade to compute your GPA.</p>}
    <p className="tool-inline-status">GPA policies differ between schools; this uses one common 4.0 letter-grade map and is for planning only.</p>
  </>;
}

function GradeCalculator({ values, set }) {
  const categories = values.categories ?? [];
  const updateCategory = (id, key) => (value) => set('categories')(categories.map((category) => (category.id === id ? { ...category, [key]: value } : category)));
  const addCategory = () => set('categories')([...categories, { id: nextRowId(categories), name: '', weight: '', grade: '' }]);
  const removeCategory = (id) => {
    if (categories.length <= 1) return;
    set('categories')(categories.filter((category) => category.id !== id));
  };
  const weighted = useMemo(() => {
    let totalWeight = 0; let weightedSum = 0;
    for (const category of categories) {
      const weight = number(category.weight); const grade = number(category.grade);
      if (!Number.isFinite(weight) || !Number.isFinite(grade)) continue;
      totalWeight += weight;
      weightedSum += weight * grade;
    }
    return { totalWeight, average: totalWeight > 0 ? weightedSum / totalWeight : NaN };
  }, [categories]);
  const current = number(values.current); const finalWeight = number(values.finalWeight); const target = number(values.target);
  const required = useMemo(() => {
    if (![current, finalWeight, target].every(Number.isFinite) || finalWeight <= 0 || finalWeight > 100) return null;
    return (target - (current * (100 - finalWeight)) / 100) / (finalWeight / 100);
  }, [current, finalWeight, target]);
  return <>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">Weighted average so far</h2>
      {categories.map((category, position) => <div className="calculator-input-grid" key={category.id}>
        <Field id={`grade-cat-${category.id}-name`} label={`Category ${position + 1} · name`} type="text" value={category.name} onChange={updateCategory(category.id, 'name')} />
        <Field id={`grade-cat-${category.id}-weight`} label="Weight" value={category.weight} onChange={updateCategory(category.id, 'weight')} min="0" max="100" suffix="%" />
        <Field id={`grade-cat-${category.id}-grade`} label="Current grade" value={category.grade} onChange={updateCategory(category.id, 'grade')} min="0" max="100" suffix="%" />
        <div className="tool-actions"><Button variant="secondary" size="small" type="button" onClick={() => removeCategory(category.id)} disabled={categories.length <= 1}>Remove</Button></div>
      </div>)}
      <div className="tool-action-row">
        <p className="tool-inline-status">Weights should describe how your class is graded (for example 40% homework + 60% exams).</p>
        <div className="tool-actions"><Button variant="primary" size="small" type="button" onClick={addCategory}>Add category</Button></div>
      </div>
      {weighted.totalWeight > 0
        ? <ResultCards items={[['Current weighted average', `${pretty(weighted.average)}%`], ['Total weight entered', `${pretty(weighted.totalWeight)}%`]]} />
        : <p className="tool-inline-status status-warning">Enter at least one category with a weight and a current grade.</p>}
      {weighted.totalWeight > 0 && Number.isFinite(weighted.average) && Math.abs(weighted.totalWeight - 100) > 0.001 && <p className="tool-inline-status status-warning">Your weights add to {pretty(weighted.totalWeight)}%, not 100% — adjust them so the average reflects your full class.</p>}
    </section>
    <section className="tool-form-section">
      <h2 className="calculator-section-title">What do I need on the final?</h2>
      <div className="calculator-input-grid">
        <Field id="grade-current" label="Current grade" value={values.current} onChange={set('current')} min="0" max="100" suffix="%" />
        <Field id="grade-final-weight" label="Final exam weight" value={values.finalWeight} onChange={set('finalWeight')} min="0" max="100" suffix="%" />
        <Field id="grade-target" label="Target grade" value={values.target} onChange={set('target')} min="0" max="100" suffix="%" />
      </div>
      {required === null
        ? <p className="tool-inline-status status-warning">Enter your current grade, a final weight above 0 and at most 100, and a target grade.</p>
        : required > 100 ? <>
          <p className="calculator-result" aria-live="polite"><span>Required final grade</span><strong>Not reachable with this weight</strong></p>
          <p className="tool-inline-status status-warning">Even a 100% on the final would leave you below the target. Check your current standing or adjust the target.</p>
        </>
          : <p className="calculator-result" aria-live="polite"><span>Required final grade</span><strong>{`${pretty(Math.max(0, required))}%`}</strong></p>}
      {required !== null && required <= 0 && <p className="tool-inline-status">Your current grade already meets or exceeds the target — the final can only raise it.</p>}
    </section>
    <p className="tool-inline-status">Averages assume each category keeps a constant weight; real courses may drop scores or curve grades.</p>
  </>;
}

function StandardDeviationCalculator({ values, set }) {
  const parsed = useMemo(() => {
    const tokens = values.data.split(/[\s,;]+/).filter(Boolean);
    const numbers = []; const invalid = [];
    for (const token of tokens) {
      const value = Number(token);
      if (Number.isFinite(value)) numbers.push(value);
      else invalid.push(token);
    }
    return { numbers, invalid };
  }, [values.data]);
  const stats = useMemo(() => {
    const { numbers } = parsed;
    if (!numbers.length) return null;
    const count = numbers.length;
    const sum = numbers.reduce((total, value) => total + value, 0);
    const mean = sum / count;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = count % 2 === 1 ? sorted[(count - 1) / 2] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    const squared = numbers.reduce((total, value) => total + (value - mean) ** 2, 0);
    const populationVariance = squared / count;
    const sampleVariance = count > 1 ? squared / (count - 1) : NaN;
    return {
      count, sum, mean, median,
      min: sorted[0], max: sorted[count - 1],
      populationVariance, populationStd: Math.sqrt(populationVariance),
      sampleVariance, sampleStd: Number.isFinite(sampleVariance) ? Math.sqrt(sampleVariance) : NaN,
    };
  }, [parsed]);
  return <>
    <label className="calculator-field" htmlFor="std-data">
      <span>Numbers · separated by spaces, commas, or new lines</span>
      <textarea id="std-data" className="tool-textarea" rows={5} value={values.data} onChange={(event) => set('data')(event.target.value)} placeholder={'For example:\n12, 15.5, 9 20\n31'} />
    </label>
    {parsed.invalid.length > 0 && <p className="tool-inline-status status-warning">Ignored non-numeric values: {parsed.invalid.slice(0, 5).join(', ')}{parsed.invalid.length > 5 ? '…' : ''}.</p>}
    {stats ? <ResultCards items={[
      ['Count', pretty(stats.count, 0)],
      ['Sum', pretty(stats.sum, 4)],
      ['Mean', pretty(stats.mean, 4)],
      ['Median', pretty(stats.median, 4)],
      ['Minimum', pretty(stats.min, 4)],
      ['Maximum', pretty(stats.max, 4)],
      ['Population variance', pretty(stats.populationVariance, 4)],
      ['Population std. deviation', pretty(stats.populationStd, 4)],
      ['Sample variance', pretty(stats.sampleVariance, 4)],
      ['Sample std. deviation', pretty(stats.sampleStd, 4)],
    ]} /> : <p className="tool-inline-status status-warning">Paste at least one number to see statistics.</p>}
    {stats && stats.count < 2 && <p className="tool-inline-status">Sample variance and sample deviation need at least two numbers.</p>}
    <p className="tool-inline-status">Population statistics describe exactly this list; sample statistics estimate the larger group it was drawn from.</p>
  </>;
}

const clampCos = (value) => Math.max(-1, Math.min(1, value));
const toDegrees = (radians) => (radians * 180) / Math.PI;

function TriangleCalculator({ values, set }) {
  const a = number(values.a); const b = number(values.b); const c = number(values.c);
  const sss = useMemo(() => {
    if (![a, b, c].every((value) => Number.isFinite(value) && value > 0)) return null;
    if (a + b <= c || a + c <= b || b + c <= a) return { error: true };
    const angleA = toDegrees(Math.acos(clampCos((b * b + c * c - a * a) / (2 * b * c))));
    const angleB = toDegrees(Math.acos(clampCos((a * a + c * c - b * b) / (2 * a * c))));
    const angleC = 180 - angleA - angleB;
    const semiperimeter = (a + b + c) / 2;
    const area = Math.sqrt(semiperimeter * (semiperimeter - a) * (semiperimeter - b) * (semiperimeter - c));
    return { angleA, angleB, angleC, area, perimeter: a + b + c };
  }, [a, b, c]);
  const legA = number(values.legA); const legB = number(values.legB);
  const right = useMemo(() => {
    if (![legA, legB].every((value) => Number.isFinite(value) && value > 0)) return null;
    const hypotenuse = Math.hypot(legA, legB);
    const angleA = toDegrees(Math.atan2(legA, legB));
    const angleB = 90 - angleA;
    return { hypotenuse, angleA, angleB, area: (legA * legB) / 2, perimeter: legA + legB + hypotenuse };
  }, [legA, legB]);
  return <>
    <div className="calculator-input-grid">
      <Field id="tri-mode" label="Triangle type" value={values.mode} onChange={set('mode')} options={[{ value: 'sss', label: 'SSS · three known sides' }, { value: 'right', label: 'Right triangle · two known legs' }]} />
    </div>
    {values.mode === 'sss' ? <>
      <div className="calculator-input-grid">
        <Field id="tri-a" label="Side a" value={values.a} onChange={set('a')} min="0" />
        <Field id="tri-b" label="Side b" value={values.b} onChange={set('b')} min="0" />
        <Field id="tri-c" label="Side c" value={values.c} onChange={set('c')} min="0" />
      </div>
      {sss && !sss.error && <ResultCards items={[
        ['Angle A (opposite side a)', `${pretty(sss.angleA, 1)}°`],
        ['Angle B (opposite side b)', `${pretty(sss.angleB, 1)}°`],
        ['Angle C (opposite side c)', `${pretty(sss.angleC, 1)}°`],
        ['Area', pretty(sss.area, 3)],
        ['Perimeter', pretty(sss.perimeter, 3)],
      ]} />}
      {sss?.error && <p className="tool-inline-status status-warning">These sides cannot form a triangle: each side must be shorter than the sum of the other two (triangle inequality).</p>}
      {sss === null && <p className="tool-inline-status status-warning">Enter three positive side lengths.</p>}
    </> : <>
      <div className="calculator-input-grid">
        <Field id="tri-leg-a" label="Leg a" value={values.legA} onChange={set('legA')} min="0" />
        <Field id="tri-leg-b" label="Leg b" value={values.legB} onChange={set('legB')} min="0" />
      </div>
      {right ? <ResultCards items={[
        ['Hypotenuse', pretty(right.hypotenuse, 3)],
        ['Angle opposite leg a', `${pretty(right.angleA, 1)}°`],
        ['Angle opposite leg b', `${pretty(right.angleB, 1)}°`],
        ['Area', pretty(right.area, 3)],
        ['Perimeter', pretty(right.perimeter, 3)],
      ]} /> : <p className="tool-inline-status status-warning">Enter positive lengths for both legs.</p>}
    </>}
    <p className="tool-inline-status">Angles come from the law of cosines (or arctangent for right triangles) and are rounded to one decimal place.</p>
  </>;
}

export default function EducationCalculatorTool({ tool }) {
  const [values, set] = useForm(tool);
  let content;
  switch (tool.slug) {
    case 'scientific-calculator': content = <ScientificCalculator values={values} set={set} />; break;
    case 'fraction-calculator': content = <FractionCalculator values={values} set={set} />; break;
    case 'gpa-calculator': content = <GpaCalculator values={values} set={set} />; break;
    case 'grade-calculator': content = <GradeCalculator values={values} set={set} />; break;
    case 'standard-deviation-calculator': content = <StandardDeviationCalculator values={values} set={set} />; break;
    case 'triangle-calculator': content = <TriangleCalculator values={values} set={set} />; break;
    default: content = <p className="tool-inline-status">This calculator is not available.</p>;
  }
  return <div className="tool-editor tool-form-stack">{content}<p className="tool-inline-status">Every calculation runs instantly in your browser; nothing you enter is sent anywhere.</p></div>;
}
