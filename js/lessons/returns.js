import { panel } from './solar.js';
import { house } from './common.js';
import { list, table } from './cards.js';
import { fv, pv, annuity, npv, irr, payback, SOLAR_CF, SOLAR_DEBT_CF, debtPay, sum, money, pct } from './fin.js';

// Source: the "Renewable Energy Projects" notes (time value of money, discount rates, NPV/IRR, loans). Every number below is computed in fin.js.
const R = 0.05;
const NPV = npv(R, SOLAR_CF), IRR = irr(SOLAR_CF), NET = sum(SOLAR_CF), PB = payback(SOLAR_CF);
const NPV_D = npv(R, SOLAR_DEBT_CF), IRR_D = irr(SOLAR_DEBT_CF), NET_D = sum(SOLAR_DEBT_CF), PB_D = payback(SOLAR_DEBT_CF);
const ROI = NET / 10000, ROI_D = NET_D / 2000;
const FV10 = fv(1000, 0.1, 10), PV10 = pv(20000, 0.1, 10), PERP = 1000 / R, ANN = 1000 * annuity(R, 20);

// cumulative cash flow, with and without discounting
const cum = (f) => { let c = 0; return SOLAR_CF.map((x, t) => (c += f(x, t))); };
const CUM = cum((x) => x), CUMD = cum((x, t) => x / (1 + R) ** t);
const CX = (t) => 24 + t * 12.2, CY = (v) => 150 - ((v + 10000) / 19500) * 110;
const pts = (a) => a.map((v, t) => `${CX(t).toFixed(1)},${CY(v).toFixed(1)}`).join(' ');
const chart = `<path class="ax" d="M24,${CY(0)}H268M24,40V150"/>
  <polyline points="${pts(CUM)}" fill="none" stroke="#6f9a3c" stroke-width="2.4" stroke-linejoin="round"/>
  <polyline points="${pts(CUMD)}" fill="none" stroke="#d0683a" stroke-width="2.4" stroke-dasharray="5 3" stroke-linejoin="round"/>
  <circle cx="${CX(PB)}" cy="${CY(0)}" r="4.5" fill="#e9fc82" stroke="var(--obj-edge)" stroke-width="1.8"/><text x="${CX(PB) - 22}" y="${CY(0) - 9}" style="font-size:8.5px;font-weight:700;fill:var(--ink)">payback yr ${PB}</text>
  <text x="${CX(12)}" y="${CY(CUM[20]) - 6}" style="font-size:9px;font-weight:700;fill:#2f6b22">${money(CUM[20])}</text>
  <text x="${CX(12)}" y="${CY(CUMD[20]) + 14}" style="font-size:9px;font-weight:700;fill:#a5470f">${money(CUMD[20])} at ${pct(R, 0)}</text>
  <text x="26" y="${CY(-10000) - 4}" style="font-size:8.5px">−$10,000</text>
  <text x="24" y="166">0</text><text x="${CX(10) - 4}" y="166">10</text><text x="${CX(20) - 12}" y="166">20 yrs</text>
  <text x="12" y="182" style="font-size:8.5px"><tspan fill="#6f9a3c" font-weight="700">━</tspan> total   <tspan fill="#d0683a" font-weight="700">┅</tspan> discounted</text>`;

const loanTable = table(['Metric', 'All cash', 'With loan'], [
  ['Net profit', money(NET), money(NET_D)], ['NPV at 5%', money(NPV), money(NPV_D)], ['IRR', pct(IRR), pct(IRR_D)],
  ['ROI', pct(ROI, 0), pct(ROI_D, 0)], ['Payback', `${PB} yrs`, `${PB_D} yrs`],
], { cols: [12, 120, 205], rowH: 21 }) + `<text x="12" y="172" style="font-size:8.5px">$2k down + $8k at 6%, 10 yrs = ${money(debtPay / 12, 2)}/mo</text>`;

const metrics = table(['Metric', 'What it answers', 'Here'], [
  ['Net profit', 'total surplus, no timing', money(NET)], ['Payback', 'how soon is capital back', `${PB} yrs`], ['ROI', 'profit ÷ money in', pct(ROI, 0)],
  ['NPV', 'value above the hurdle', money(NPV)], ['IRR', 'the project’s own yield', pct(IRR)],
], { cols: [12, 82, 238], rowH: 21, hl: 4 }) + `<text x="12" y="172" style="font-size:8.5px">NPV &gt; 0 exactly when IRR &gt; discount rate</text>`;

export default {
  id: 'returns', group: 'projects', title: 'Time Value & Returns', icon: 'chart', time: 11, level: 'Intermediate',
  tagline: 'Why a dollar next year is worth less than a dollar now, and how NPV and IRR judge a solar panel over twenty years.',
  stats: [
    { id: 'rate', label: 'Discount rate', icon: 'gauge' }, { id: 'npv', label: 'NPV', icon: 'chart' },
    { id: 'irr', label: 'IRR', icon: 'zap' }, { id: 'pb', label: 'Payback', icon: 'clock' },
  ],
  legend: [['#f1c96f', 'money'], ['#a6d38b', 'the solar project']],
  learn: [
    { t: 'Compounding and discounting: FV and PV', at: 0 }, { t: 'Annuities and perpetuities as shortcuts', at: 1 },
    { t: 'How to choose a discount rate', at: 2 }, { t: 'NPV, IRR and payback on one cash-flow table', at: 3 },
    { t: 'What a loan does to returns', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    house(s, 'home', 4.6, 6.0, { label: { t: 'home, $10,000 solar', icon: 'house' } });
    s.raw('panels', panel(6.5, 6.4, 1.6, 1.4) + panel(6.5, 8.0, 1.6, 1.4), { k: 18 });
    const stack = (id, x, y, h, text, o) => s.cyl(id, x, y, 0, 0.6, h, 'yellow', { ...o, label: { t: text }, lopt: { dy: -12 } });
    const H = (v) => 0.12 + (v / 20000) * 2.2;
    stack('fv', 0.9, 1.4, H(1000), '$1,000 today', { from: 0, until: 0 });
    stack('fv', 2.5, 1.4, H(1100), `${money(fv(1000, 0.1, 1))} in 1 yr`, { from: 0, until: 0 });
    stack('fv', 4.1, 1.4, H(FV10), `${money(FV10)} in 10 yrs`, { from: 0, until: 0 });
    stack('pv', 1.0, 1.8, H(PERP), `forever: ${money(PERP)}`, { from: 1, until: 1 });
    stack('pv', 3.0, 1.8, H(ANN), `20 years: ${money(ANN)}`, { from: 1, until: 1 });
    stack('loan', 1.0, 2.4, H(8000), '$8,000 loan', { from: 4, until: 4 });
    stack('loan', 3.0, 2.4, H(2000), '$2,000 down', { from: 4, until: 4 });
    s.card('rates', 'WHICH DISCOUNT RATE?', list([['Cost of debt', 'loan interest plus fees'], ['Opportunity cost', 'the next-best use of the money'], ['Cost of equity', 'owners share the upside, so it costs more'], ['WACC', '50% savings at 3% + 50% loan at 7% = 5%'], ['Risk-adjusted', 'riskier projects use 12–18% or more']], { gap: 29 }), { w: 300, h: 186, from: 2, until: 2 });
    s.card('cash', 'CUMULATIVE CASH, 20 YEARS', chart, { w: 290, h: 192, from: 3, until: 3 });
    s.card('loan', 'ALL CASH VS A LOAN', loanTable, { w: 290, h: 182, from: 4, until: 4 });
    s.card('metrics', 'FIVE METRICS', metrics, { w: 290, h: 182, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Today vs later', tag: 'CONCEPT', title: 'A dollar now beats a dollar later',
      body: [`Money today can be invested, so waiting forfeits a return. At 10% a year, ${money(1000)} grows to ${money(fv(1000, 0.1, 1))} after one year and ${money(FV10)} after ten.`,
        `Run it backwards: ${money(20000)} due in ten years is worth only ${money(PV10)} today. That backwards step is discounting.`],
      callout: { k: 'key', t: 'Future cash is discounted for opportunity cost, not only for waiting. The higher the rate, the less distant income is worth.' },
      focus: ['fv'], stats: { rate: '10%' },
    },
    {
      short: 'Streams', tag: 'METHOD', title: 'Valuing a stream of savings',
      body: [`A rooftop system saving $1,000 a year forever would be worth $1,000 ÷ 0.05 = ${money(PERP)} at 5%. That is a perpetuity.`,
        `Cut it off after 20 years and you get an annuity: ${money(ANN)}. Twenty years still captures ${pct(ANN / PERP, 0)} of the perpetual value, because later years are discounted so heavily.`],
      callout: { k: 'know', t: 'Loan repayments are an annuity too. The same formula that values future savings sizes the payments owed to a lender.' },
      focus: ['pv'], stats: { rate: '5%' },
    },
    {
      short: 'The rate', tag: 'METHOD', title: 'Choosing the discount rate',
      body: ['A real project mixes funding: savings, a loan and outside equity, each with a different cost. Blend them by weight, and you get the weighted average cost of capital (WACC).',
        'Half savings at 3% and half a loan at 7% gives 5%. Riskier or less proven projects add a margin, so rates of 12–18% or more are common for uncertain revenue or technology.'],
      callout: { k: 'warn', t: 'The discount rate is a judgement about risk. Move it a few points and a good-looking project can turn bad.' },
      focus: ['home', 'panels'], stats: { rate: '5%' },
    },
    {
      short: 'Cash-flow model', tag: 'NUMBERS', title: 'One system, twenty years',
      body: [`The example: ${money(10000)} up front, $1,000 saved each year, $500 of upkeep in years 5, 10 and 15, and $1,000 of salvage in year 20.`,
        `Added up it makes ${money(NET)}, but discounted at 5% it is worth ${money(NPV)} more than the money would have earned elsewhere (NPV). Its IRR, the discount rate where NPV is zero, is ${pct(IRR)}. Payback comes in year ${PB}.`],
      callout: { k: 'key', t: `Raw profit overstates value. The same project that “makes ${money(NET)}” creates ${money(NPV)} of value once time is counted.` },
      focus: ['home', 'panels'], stats: { npv: money(NPV), irr: pct(IRR), pb: `${PB} yrs` },
    },
    {
      short: 'A loan', tag: 'METHOD', title: 'Borrowing changes the picture',
      body: [`Put $2,000 down and borrow $8,000 at 6% over ten years: ${money(debtPay / 12, 2)} a month. The loan costs interest, so total profit falls to ${money(NET_D)}.`,
        `But less of your own money is at risk: IRR rises to ${pct(IRR_D)} and ROI to ${pct(ROI_D, 0)}, while payback stretches to ${PB_D} years.`],
      callout: { k: 'warn', t: 'Leverage raises the return on your own money and the risk with it. If savings fall short, the loan payment is still due.' },
      focus: ['loan'], stats: { npv: money(NPV_D), irr: pct(IRR_D), pb: `${PB_D} yrs` },
    },
    {
      short: 'Verdict', tag: 'CONCEPT', title: 'Five numbers, one decision',
      body: ['Net profit, payback, ROI, NPV and IRR each answer a different question. The decision rule is simple: accept when NPV is above zero, which is the same as IRR above the discount rate.',
        `A ${pct(ROI, 0)} ROI sounds huge, yet the IRR is ${pct(IRR)}. Undiscounted figures flatter long projects.`],
      callout: { k: 'know', t: 'IRR assumes each year’s cash is reinvested at the IRR itself. Analysts often check a modified IRR (MIRR) that uses a realistic reinvestment rate.' },
      focus: ['home', 'panels'], stats: { npv: money(NPV), irr: pct(IRR), pb: `${PB} yrs` },
    },
  ],
};
