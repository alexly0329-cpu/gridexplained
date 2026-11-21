// Small finance toolkit used by the project lessons. All figures in the text are computed from these, not typed in.
export const fv = (p, r, n) => p * (1 + r) ** n;
export const pv = (f, r, n) => f / (1 + r) ** n;
export const annuity = (r, n) => (1 - (1 + r) ** -n) / r;            // PV of $1 a year for n years
export const npv = (r, cf) => cf.reduce((a, c, t) => a + c / (1 + r) ** t, 0);
export const pmt = (rate, n, loan) => (loan * rate) / (1 - (1 + rate) ** -n);
export function irr(cf) {                                           // bisection on NPV(r) = 0
  let lo = -0.5, hi = 2;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (npv(m, cf) > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
export function payback(cf) { let c = 0; for (let t = 0; t < cf.length; t++) { c += cf[t]; if (c >= 0 && t > 0) return t; } return null; }

// The running example: a $10,000 rooftop PV system, $1,000/yr savings, $500 upkeep in years 5/10/15, $1,000 salvage in year 20.
export const SOLAR_CF = Array.from({ length: 21 }, (_, t) => (t === 0 ? -10000 : 1000 - ([5, 10, 15].includes(t) ? 500 : 0) + (t === 20 ? 1000 : 0)));
export const DEBT = { down: 2000, loan: 8000, rate: 0.06, months: 120 };
export const debtPay = pmt(DEBT.rate / 12, DEBT.months, DEBT.loan) * 12;       // per year, for 10 years
export const SOLAR_DEBT_CF = SOLAR_CF.map((c, t) => (t === 0 ? -DEBT.down : t <= 10 ? c - debtPay : c));
export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const money = (n, d = 0) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
export const pct = (x, d = 1) => (x * 100).toFixed(d) + '%';
