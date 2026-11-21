import { panel } from './solar.js';
import { pylon } from './common.js';
import { list, bars } from './cards.js';
import { annuity } from './fin.js';

// Source: the "Renewable Energy Futures" notes (capital intensity, cost-structure inversion, flat dollars vs rising gigawatts, zero-marginal-cost pricing, the telecom analogy).
// The cost split below is computed here from stated, illustrative inputs so the notes' ~90% vs 30–50% capex shares can be reproduced and varied.
const YEARS = 25;
const SOLAR = { capex: 1000, cf: 0.25, om: 10, var: 0 };            // $/kW, share, $/kW-yr, $/MWh
const GAS = { capex: 1000, cf: 0.55, om: 15, var: 35 };
const kwhPerKw = (p) => 8760 * p.cf;
const parts = (p, wacc) => { const crf = 1 / annuity(wacc, YEARS), mwh = kwhPerKw(p) / 1000; const cap = (p.capex * crf) / mwh, om = p.om / mwh, v = p.var; return { cap, om, v, total: cap + om + v }; };
const lcoe = (p, w) => parts(p, w).total;
const W = 0.07, S = parts(SOLAR, W), G = parts(GAS, W);
const share = (x, t) => Math.round((x / t) * 100);

const stack = (y, label, p) => {
  const k = 2.2, a = p.cap * 1, tot = p.total;
  const wcap = (p.cap / tot) * 250, wom = (p.om / tot) * 250, wv = (p.v / tot) * 250;
  return `<text x="12" y="${y - 5}" style="font-size:9px;font-weight:700;fill:var(--ink)">${label}</text><rect x="12" y="${y}" width="${wcap}" height="20" fill="#9fcdf0" stroke="var(--obj-edge)" stroke-width="1.6"/><rect x="${12 + wcap}" y="${y}" width="${wom}" height="20" fill="#c9ccd1" stroke="var(--obj-edge)" stroke-width="1.6"/><rect x="${12 + wcap + wom}" y="${y}" width="${wv}" height="20" fill="#f7a35c" stroke="var(--obj-edge)" stroke-width="1.6"/>`
    + `<text x="16" y="${y + 14}" style="font-size:9px;font-weight:700;fill:#172720">${share(p.cap, tot)}% capital</text>${p.v ? `<text x="${14 + wcap + wom}" y="${y + 14}" style="font-size:9px;font-weight:700;fill:#172720">${share(p.v, tot)}% fuel</text>` : ''}`;
};
const split = stack(48, 'Utility solar PV', S) + stack(100, 'Gas combined cycle', G) + `<text x="12" y="146" style="font-size:8.5px"><tspan fill="#5f9ccb" font-weight="700">■</tspan> capital  <tspan fill="#8b9098" font-weight="700">■</tspan> upkeep  <tspan fill="#e8834d" font-weight="700">■</tspan> fuel (illustrative inputs)</text>`;

const wacc = bars([[0.04, '4%'], [0.07, '7%'], [0.1, '10%']].flatMap(([w, l]) => [{ label: `Solar @ ${l}`, value: lcoe(SOLAR, w), color: '#f6d77e' }, { label: `Gas @ ${l}`, value: lcoe(GAS, w), color: '#f0c08f' }]), { w: 300, labelW: 74, max: 80, fmt: (v) => `$${Math.round(v)}`, y0: 36, h: 13, gap: 7, note: '$/MWh at different costs of capital' });

// illustrative: dollars flat, megawatts rising
const FX = (i) => 28 + i * 50, FY = (v) => 160 - (v - 80) * 0.7;
const INV = [100, 92, 108, 98, 104, 101], CAP = [100, 118, 140, 158, 178, 196];
const lineOf = (a, c) => `<polyline points="${a.map((v, i) => `${FX(i)},${FY(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>`;
const flat = `<path class="ax" d="M28,160H284M28,160V40"/>${lineOf(INV, '#2f86ce')}${lineOf(CAP, '#6f9a3c')}<text x="28" y="174">2013</text><text x="${FX(5) - 12}" y="174">2018</text>
  <text x="12" y="188" style="font-size:8.5px"><tspan fill="#2f86ce" font-weight="700">━</tspan> dollars invested  <tspan fill="#6f9a3c" font-weight="700">━</tspan> megawatts added (illustrative)</text>`;

export default {
  id: 'zerocost', group: 'transition', title: 'Zero Marginal Cost & Capital', icon: 'zap', time: 11, level: 'Advanced',
  tagline: 'When the fuel is free, almost all the cost is capital: why interest rates decide the transition, and why pricing may move from kWh to subscriptions.',
  stats: [
    { id: 'wacc', label: 'Cost of capital', icon: 'gauge' }, { id: 'sc', label: 'Solar: capital share', icon: 'sun' },
    { id: 'gc', label: 'Gas: capital share', icon: 'flame' }, { id: 'mc', label: 'Solar marginal cost', icon: 'zap' },
  ],
  legend: [['#5f9ccb', 'capital'], ['#8b9098', 'upkeep'], ['#e8834d', 'fuel']],
  learn: [
    { t: 'Why energy infrastructure is capital-intensive', at: 0 }, { t: 'How wind and solar invert the fossil cost structure', at: 1 },
    { t: 'How flat dollars bought rising gigawatts', at: 2 }, { t: 'What “zero marginal cost” means', at: 3 },
    { t: 'The telecom analogy for pricing', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.raw('solar', panel(0.6, 1.0, 1.8, 1.5) + panel(2.6, 1.0, 1.8, 1.5) + panel(0.6, 2.8, 1.8, 1.5) + panel(2.6, 2.8, 1.8, 1.5), { k: 7 });
    s.label('solar:l', 2.5, 2.6, 1.9, { t: 'solar farm', icon: 'sun' }, {});
    s.box('gas', 6.0, 1.2, 0, 2.2, 1.6, 1.1, 'steel', { label: { t: 'gas plant', icon: 'flame' } });
    s.cyl('gas', 6.6, 1.6, 1.1, 0.25, 1.6, 'concrete', { k: 14, shadow: false });
    s.raw('pylon', pylon(9.4, 4.0, 2.6), { k: 10 });
    // cost pillars: height of each segment proportional to its share of lifetime cost
    const Hh = 2.6, seg = (id, x, y, a, b, c, labels) => [[a, 'blue'], [b, 'steel'], [c, 'flame']].reduce((z, [share, col], i) => { if (share > 0) s.box(id, x, y, z, 1.1, 1.1, Math.max(0.05, share * Hh), col, { from: 1, shadow: i === 0, ...(i === 0 ? { label: { t: labels }, lopt: { dy: -4 } } : {}) }); return z + share * Hh; }, 0);
    seg('pillarS', 1.4, 5.4, S.cap / S.total, S.om / S.total, 0, `solar: ${share(S.cap, S.total)}% capital`);
    seg('pillarG', 6.6, 5.4, G.cap / G.total, G.om / G.total, G.v / G.total, `gas: ${share(G.cap, G.total)}% capital`);
    s.label('meter:l', 2.5, 2.6, 1.9, { t: 'next kWh: about $0', icon: 'zap' }, { from: 3, until: 3, dy: -50 });
    s.card('wacc', 'CAPITAL COST HITS SOLAR HARDEST', wacc, { w: 300, h: 172, from: 0, until: 0 });
    s.card('split', 'WHERE THE MONEY GOES', split, { w: 300, h: 160, from: 1, until: 1 });
    s.card('flat', 'FLAT DOLLARS, RISING GIGAWATTS', flat, { w: 300, h: 200, from: 2, until: 2 });
    s.card('tele', 'WHEN THE NEXT UNIT IS FREE', list([['Home internet', 'per-gigabyte metering became flat plans'], ['Long-distance calls', 'per-minute billing became unlimited'], ['Email', 'per-stamp postage became near zero']], { gap: 36 }), { w: 300, h: 150, from: 4, until: 4 });
    s.card('end', 'WHAT CHANGES IN PRICING', list([['Subscriptions', 'flat monthly or capacity-tiered plans'], ['Connection charges', 'pay for peak kW, not only kWh'], ['Surplus hours', 'wasting midday power is cheap'], ['Efficiency', 'matters most at peaks']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Capital', tag: 'CONCEPT', title: 'Energy is a capital business',
      body: ['Power plants, high-voltage lines and fuel infrastructure all need huge up-front capital, so the cost and availability of capital, usually measured as a weighted average cost of capital, largely decide project economics.',
        'The transition needs more capital in total, and a different mix: less to fossil extraction and thermal plants, more to clean power, grids, storage and electrification.'],
      callout: { k: 'key', t: `In this illustration, raising the cost of capital from 4% to 10% lifts solar from $${Math.round(lcoe(SOLAR, 0.04))} to $${Math.round(lcoe(SOLAR, 0.1))} per MWh, but gas only from $${Math.round(lcoe(GAS, 0.04))} to $${Math.round(lcoe(GAS, 0.1))}.` },
      focus: ['solar', 'gas'], stats: { wacc: '4% / 7% / 10%' },
    },
    {
      short: 'Inversion', tag: 'NUMBERS', title: 'Wind and solar flip the cost structure',
      body: [`Fossil plants cost less to build but burn expensive fuel every hour. Solar and wind cost more to build and have no fuel. At a 7% cost of capital and the inputs shown, utility solar is about ${share(S.cap, S.total)}% capital, against about ${share(G.cap, G.total)}% for a gas plant, which spends most of its life cost on fuel.`,
        'The notes put solar near 90% capital and gas at 30–50%.'],
      callout: { k: 'know', t: 'The inputs are illustrative. Change the capital cost, capacity factor or gas price and the shares move, but the shape stays.' },
      focus: ['pillarS', 'pillarG'], stats: { sc: `${share(S.cap, S.total)}%`, gc: `${share(G.cap, G.total)}%`, wacc: '7%' },
    },
    {
      short: 'More per dollar', tag: 'NUMBERS', title: 'Flat dollars, rising gigawatts',
      body: ['In the 2010s the world invested roughly $300–350 billion a year in renewables, mostly solar and wind, with no steep upward trend through 2018. Yet capacity added each year climbed steadily.',
        'Falling costs meant each billion dollars bought far more megawatts. The notes add that clean-energy investment then jumped after 2020, to over $2 trillion a year by 2025–26.'],
      callout: { k: 'key', t: 'Headline investment can stay flat while the physical build-out accelerates. Cost per megawatt is the hidden driver.' },
      focus: ['solar'],
    },
    {
      short: 'Zero marginal', tag: 'CONCEPT', title: 'The next kilowatt-hour is free',
      body: ['A solar farm’s upkeep, about $10 per kW per year in the notes’ benchmark, is a fixed cost tied to capacity and time, not output. Whether the farm makes 1 MWh or 2,000, the cost of making the next kilowatt-hour is about zero.',
        'Gas plants are different: fuel is $30–80 or more per MWh depending on the gas price.'],
      callout: { k: 'warn', t: 'When almost all cost is fixed capital, billing per kWh no longer matches cost. Revenue and cost have drifted apart.' },
      focus: ['solar', 'meter'], stats: { mc: '≈ $0' },
    },
    {
      short: 'Telecom', tag: 'CONCEPT', title: 'Pricing follows the cost',
      body: ['Industries whose extra unit became nearly free moved away from per-unit billing. Home internet went from per-gigabyte metering to flat plans, long-distance calls from per-minute rates to unlimited, and email replaced per-stamp postage.',
        'Electricity may follow: more charges for peak connection capacity (kW) and flat or tiered subscriptions, fewer for raw kWh.'],
      callout: { k: 'know', t: 'The analogy is not exact: electricity must balance every second and wires have limits. But the direction of pricing is the same.' },
      focus: ['solar', 'gas'],
    },
    {
      short: 'Surplus', tag: 'TRADE-OFF', title: 'A grid with a free marginal kWh',
      body: ['If the marginal kWh costs nothing, saving energy matters mostly at the peaks, where capacity is scarce. Wasting surplus midday power costs little, so the aim shifts to using it: storage, flexible demand and electrification.',
        'This is also why “missing money” bites: markets that pay only for energy cannot repay capital that earns when energy is scarce.'],
      callout: { k: 'key', t: 'The endgame is a system priced on capacity and flexibility, not on fuel, with an abundant surplus to put to use.' },
      focus: ['solar', 'gas', 'pylon'],
    },
  ],
};
