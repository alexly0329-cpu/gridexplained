import { P } from '../iso.js';
import { pylon } from './common.js';
import { list, bars } from './cards.js';
import { annuity, money } from './fin.js';
import { smooth } from './common.js';

// Source: the "Renewable Energy Projects" notes (cost buckets, revenue pillars, marginal / average / levelized cost).
// Worked example from the notes: 35 MW parabolic-trough CSP plant with molten-salt storage.
const CAPEX = 60e6, FIXED = 1e6, VAR = 2e6, MWH = 100000, YEARS = 20, RATE = 0.10;
const MARGINAL = VAR / MWH;                                                    // $/MWh, short-run
const AVERAGE = (CAPEX + (FIXED + VAR) * YEARS) / (MWH * YEARS);               // $/MWh, undiscounted lifetime
const A = annuity(RATE, YEARS);
const PV_COST = CAPEX + (FIXED + VAR) * A, PV_MWH = MWH * A;
const LCOE = PV_COST / PV_MWH;                                                 // $/MWh, discounted costs ÷ discounted energy
const fmt = (v) => `$${v.toFixed(v < 100 ? 0 : 1)}/MWh`;
const row = (label, value, color) => ({ label, value, color });
const cmp = (n) => bars([row('Marginal', MARGINAL, '#9fcdf0'), row('Average', AVERAGE, '#f6d77e'), row('LCOE', LCOE, '#f7a35c')].slice(0, n), { w: 300, labelW: 62, max: 135, fmt, y0: 40, h: 20, gap: 14 });

// when power is delivered: a spring-day price, PV output, and CSP with storage (illustrative)
const PR = [[0, 22], [5, 12], [8, 30], [12, 6], [15, 14], [18, 70], [20, 95], [22, 45], [24, 25]];
const HX = (h) => 20 + h * 10.6, PY = (p) => 150 - p * 1.05;
const bell = (c, w, a) => Array.from({ length: 25 }, (_, h) => a * Math.exp(-0.5 * ((h - c) / w) ** 2));
const area = (v) => `${HX(0)},150 ` + v.map((y, h) => `${HX(h).toFixed(1)},${(150 - y).toFixed(1)}`).join(' ') + ` ${HX(24)},150`;
const when = `<path class="ax" d="M20,150H278M20,150V42"/>
  <polygon points="${area(bell(12, 2.6, 60))}" fill="#f6d77e" opacity=".85" stroke="var(--obj-edge)" stroke-width=".8"/>
  <polygon points="${area(bell(16.5, 4.6, 46))}" fill="#f7a35c" opacity=".6" stroke="var(--obj-edge)" stroke-width=".8"/>
  <path d="${smooth(PR.map(([h, p]) => [HX(h), PY(p)]))}" fill="none" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round"/>
  <text x="20" y="164">0h</text><text x="${HX(12) - 10}" y="164">noon</text><text x="${HX(24) - 14}" y="164">24h</text>
  <text x="${HX(16.6)}" y="${PY(95) - 6}" style="font-size:8.5px;font-weight:700;fill:#c0392b">evening price</text>
  <text x="12" y="180" style="font-size:8.5px"><tspan fill="#d9a21e" font-weight="700">■</tspan> solar PV   <tspan fill="#e8834d" font-weight="700">■</tspan> CSP + storage   <tspan fill="#c0392b" font-weight="700">━</tspan> price</text>`;

const trough = (id, y) => `<polygon class="o" fill="#d6e5f6" points="${[[0.9, y + 0.5, 0.74], [6.1, y + 0.5, 0.74], [6.1, y + 0.05, 0.74], [0.9, y + 0.05, 0.74]].map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ')}"/>`;

export default {
  id: 'lcoe', group: 'projects', title: 'Cost of Energy (LCOE)', icon: 'zap', time: 10, level: 'Intermediate',
  tagline: 'Marginal, average and levelized cost for one solar thermal plant: three answers to “what does a megawatt-hour cost?”',
  stats: [
    { id: 'capex', label: 'Up-front cost', icon: 'factory' }, { id: 'marg', label: 'Marginal cost', icon: 'gauge' },
    { id: 'avg', label: 'Average cost', icon: 'chart' }, { id: 'lcoe', label: 'LCOE at 10%', icon: 'zap' },
  ],
  legend: [['#e8834d', 'heat'], ['#9aa3ad', 'steam'], ['#e8a33a', 'electricity'], ['#2a9d8f', 'gas']],
  learn: [
    { t: 'Six buckets of project cost', at: 0 }, { t: 'Four ways a project earns money', at: 1 },
    { t: 'What marginal cost leaves out', at: 2 }, { t: 'Why average cost ignores timing', at: 3 },
    { t: 'How LCOE discounts both money and energy', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    const rays = Array.from({ length: 12 }, (_, i) => `<line class="ln" x1="36" y1="0" x2="${i % 2 ? 44 : 50}" y2="0" transform="rotate(${i * 30})"/>`).join('');
    s.screen('sun', `<g transform="translate(110,92)"><g class="spin slow">${rays}</g><circle class="o" r="27" fill="#fde3a7"/></g>`);
    [1.0, 2.1, 3.2, 4.3].forEach((y, i) => s.box('field', 0.9, y, 0, 5.2, 0.5, 0.7, 'steel', { k: 6 + i, shadow: false, extra: trough('t', y), ...(i === 1 ? { label: { t: 'mirror troughs', icon: 'sun' } } : {}) }));
    s.cyl('tank', 7.6, 2.2, 0, 0.9, 1.7, 'steel', { label: { t: 'molten-salt tank', icon: 'thermo' } });
    s.box('block', 7.2, 4.6, 0, 1.9, 1.6, 1.1, 'white', { label: { t: 'power block', icon: 'zap' } });
    s.box('gas', 3.4, 6.2, 0, 1.2, 1.0, 0.7, 'flame', { label: { t: 'gas backup', icon: 'flame' }, lopt: { dy: 30 } });
    s.raw('pylon', pylon(9.5, 7.6), { k: 20 });
    s.flow('heat', [[6.1, 2.6, 0.4], [6.8, 2.6, 0.4]], 'heat', { pipe: true });
    s.flow('steam', [[8.0, 3.1, 0.4], [8.0, 4.6, 0.7]], 'steam', { pipe: true });
    s.flow('fuel', [[4.6, 6.7, 0.35], [7.0, 6.7, 0.35], [7.0, 3.2, 0.35]], 'gas', { pipe: true });
    s.flow('power', [[9.1, 6.3, 0.05], [9.5, 7.4, 0.05]], 'electric', {});
    ['sunA', 'sunB', 'sunC'].forEach((id, i) => s.flowS(id, [[150, 105 + i * 8], P(2.5 + i * 1.4, 2.4, 0.9)], 'light', {}));
    s.card('costs', 'SIX COST BUCKETS', list([['Generating equipment', 'CAPEX: mirrors, tank, turbine'], ['Balance of system', 'CAPEX: wiring, controls, connection'], ['Construction & permits', 'CAPEX: civil works, labour, fees'], ['Operations & maintenance', 'OPEX: crews, cleaning, repairs'], ['Financial & tax', 'OPEX: debt service, leases, taxes'], ['General & admin', 'OPEX: corporate overhead']], { gap: 28 }), { w: 300, h: 206, from: 0, until: 0 });
    s.card('earn', 'FOUR WAYS TO EARN', list([['Avoided energy cost', 'self-use instead of buying power'], ['Power purchase agreement', 'a 10–20 year contract to sell'], ['Tax incentives', 'upfront credit, per-MWh credit, depreciation'], ['Energy certificates', 'one per MWh of renewable power']], { gap: 32 }), { w: 300, h: 168, from: 1, until: 1 });
    s.card('c2', 'MARGINAL COST', cmp(1), { w: 300, h: 100, from: 2, until: 2 });
    s.card('c3', 'ADD AVERAGE COST', cmp(2), { w: 300, h: 130, from: 3, until: 3 });
    s.card('c4', 'ADD LEVELIZED COST', cmp(3), { w: 300, h: 160, from: 4, until: 4 });
    s.card('when', 'WHEN POWER ARRIVES MATTERS', when, { w: 290, h: 190, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Cost buckets', tag: 'CONCEPT', title: 'Count every dollar, not just the panels',
      body: ['A project’s budget has six buckets. Three are up-front capital: generating equipment, balance of system (inverters, wiring, controls, grid connection), and construction, civil works and permitting.',
        'Three recur every year: operations and maintenance, financial and tax costs, and general overhead. The example is a 35 MW solar-thermal plant that costs $60 million to build.'],
      callout: { k: 'key', t: 'Renewable plants are front-loaded: most of the lifetime cost is paid before the first kilowatt-hour is sold.' },
      focus: ['field', 'tank', 'block'], flows: ['sunA', 'sunB', 'sunC', 'heat', 'steam', 'power'], stats: { capex: '$60M' },
    },
    {
      short: 'Revenue', tag: 'CONCEPT', title: 'Four ways a project earns',
      body: ['Projects stack income: avoided energy cost when power is used on site, a long-term power purchase agreement (PPA), tax incentives, and tradable certificates for each MWh of renewable power.',
        'Tax incentives come as an upfront credit on investment, a yearly credit per MWh produced, or accelerated depreciation that cuts the tax bill early.'],
      callout: { k: 'know', t: 'Which stack is available depends on the country and the year. Policy can be a large part of a project’s return.' },
      focus: ['block', 'pylon'], flows: ['power'],
    },
    {
      short: 'Marginal', tag: 'NUMBERS', title: 'Marginal cost: the next megawatt-hour',
      body: [`Marginal cost counts only what rises with output. This plant burns gas to keep its salt from freezing: ${money(VAR)} a year over ${MWH.toLocaleString('en-US')} MWh, or ${fmt(MARGINAL)}.`,
        'Sunk capital and fixed upkeep are excluded. For wind and solar, with free fuel, marginal cost is close to zero.'],
      callout: { k: 'warn', t: 'A low marginal cost says a plant is cheap to run, not cheap to build. The market uses it to decide who dispatches first.' },
      focus: ['gas', 'tank'], flows: ['fuel'], stats: { marg: fmt(MARGINAL) },
    },
    {
      short: 'Average', tag: 'NUMBERS', title: 'Average cost: everything divided by output',
      body: [`Add the build cost, ${YEARS} years of fixed upkeep and ${YEARS} years of fuel: ${money(CAPEX + (FIXED + VAR) * YEARS)}. Divide by ${(MWH * YEARS).toLocaleString('en-US')} MWh over the plant’s life: ${fmt(AVERAGE)}.`,
        'It is simple and useful, but it treats a dollar spent today the same as one spent in year 20, and it ignores the cost of borrowing.'],
      callout: { k: 'key', t: 'Average cost flatters capital-intensive plants because it pretends money has no time value.' },
      focus: ['field', 'tank', 'block', 'gas'], flows: ['sunA', 'sunB', 'sunC', 'heat', 'steam', 'power'], stats: { avg: fmt(AVERAGE) },
    },
    {
      short: 'LCOE', tag: 'NUMBERS', title: 'Levelized cost: discount both sides',
      body: [`LCOE discounts every future cost and every future megawatt-hour to today at the project’s rate, here ${RATE * 100}%. Costs come to ${money(PV_COST)}; energy to ${Math.round(PV_MWH).toLocaleString('en-US')} MWh-equivalents.`,
        `Cost divided by energy is ${fmt(LCOE)}: far above the average, because the heavy up-front spend is not softened by waiting.`],
      callout: { k: 'know', t: 'Discounting energy sounds odd, but electricity delivered in year 20 is worth less than electricity delivered now, for the same reason future cash is.' },
      focus: ['field', 'tank', 'block', 'gas'], flows: ['sunA', 'sunB', 'sunC', 'heat', 'steam', 'power', 'fuel'], stats: { lcoe: fmt(LCOE) },
    },
    {
      short: 'Not value', tag: 'TRADE-OFF', title: 'Cheap per MWh is not the same as valuable',
      body: ['LCOE is a good yardstick for comparing technologies, but it ignores when power is delivered. A cheap solar kilowatt-hour at noon can sell for less than a dearer one in the evening peak.',
        'This plant stores heat in molten salt, so it can generate after sunset when prices are high, and that earns more per MWh than the same energy at midday.'],
      callout: { k: 'key', t: 'Compare LCOE to know what a technology costs. Compare hourly value to know what it is worth. Good decisions use both.' },
      focus: ['tank', 'block'], flows: ['heat', 'steam', 'power'],
    },
  ],
};
