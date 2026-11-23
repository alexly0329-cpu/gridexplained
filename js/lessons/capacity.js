import { list, bars, code } from './cards.js';

// Trader track. The method is general PJM practice; the price level is illustrative. The three auction prices come from the reader's interview game plan and should be checked at PJM before use.
// Capacity cost per MWh = PLC × price × 365 ÷ annual MWh. PJM's zonal scaling and reserve factors raise the obligation slightly and are ignored here.
const PRICE = 330;                                                    // $/MW-day, illustrative
const cust = (name, peakMW, lf, plc) => { const mwh = peakMW * 8760 * lf; const cost = plc * PRICE * 365; return { name, plc, lf, mwh, cost, perMWh: cost / mwh }; };
const A = cust('65% load factor', 1, 0.65, 0.9), B = cust('90% load factor', 1, 0.9, 0.95), C = cust('65%, peak shaved', 1, 0.65, 0.6);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const AUCTIONS = [['2026/27', 329.17], ['2027/28', 333.44], ['2028/29', 325]];

export default {
  id: 'capacity', group: 'trader', track: 'trader', title: 'Capacity Costs', icon: 'gauge', time: 11, level: 'Intermediate',
  tagline: 'How a customer’s peak load turns into a capacity charge, how to convert it to $/MWh, and why load factor and peak shaving change it.',
  stats: [
    { id: 'plc', label: 'Peak load share', icon: 'gauge' }, { id: 'cost', label: 'Capacity cost', icon: 'chart' },
    { id: 'mwh', label: 'Per MWh', icon: 'zap' }, { id: 'cent', label: 'Per kWh', icon: 'zap' },
  ],
  legend: [['#e8a33a', 'power'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'Why capacity is a separate charge', at: 0 }, { t: 'What a peak load contribution is', at: 1 },
    { t: 'How to convert $/MW-day into $/MWh', at: 2 }, { t: 'Why a steadier customer pays less per MWh', at: 3 },
    { t: 'How peak shaving cuts the charge', at: 4 }, { t: 'What the last three PJM auctions cleared at', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('fac', 0.8, 1.0, 0, 1.8, 1.5, 1.2, 'steel', { label: { t: 'customer', icon: 'factory' } });
    s.box('meter', 3.4, 1.4, 0, 0.8, 0.8, 0.7, 'white', { label: { t: 'peak meter', icon: 'gauge' } });
    s.box('sup', 4.2, 5.2, 0, 1.8, 1.5, 1.0, 'green', { label: { t: 'supplier', icon: 'factory' } });
    s.box('iso', 0.8, 6.2, 0, 1.8, 1.5, 1.0, 'white', { label: { t: 'capacity auction', icon: 'chart' } });
    s.flow('f-peak', [[2.6, 1.8, 0.05], [3.4, 1.8, 0.05]], 'electric', { cls: 'fast' });
    s.flow('f-pay', [[2.0, 2.6, 0.05], [4.4, 5.2, 0.05]], 'cash', { from: 2, cls: 'slow' });
    s.flow('f-iso', [[4.2, 6.0, 0.05], [2.6, 6.8, 0.05]], 'cash', { cls: 'slow' });
    s.card('why', 'PAID TO BE READY', list([['Energy', 'pays for megawatt-hours used'], ['Capacity', 'pays for megawatts held ready'], ['Bought years ahead', 'PJM auctions set the price'], ['Billed to load', 'by each customer’s share']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('plc', 'WHAT SETS THE SHARE', list([['Peak load contribution', 'the customer’s load at system peaks'], ['A few summer hours', 'when the whole zone is highest'], ['Fixed for the year', 'set once, billed each day'], ['Their use, not average', 'a spike at the peak costs a lot']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('conv', 'FROM $/MW-DAY TO $/MWh', code([`cost = PLC × price × 365`, `     = ${A.plc} × $${PRICE} × 365 = $${fmt(A.cost)}`, `energy = 1 MW × 8,760 × ${A.lf * 100}% = ${fmt(A.mwh)} MWh`, ``, `$/MWh = ${fmt(A.cost)} ÷ ${fmt(A.mwh)} = $${A.perMWh.toFixed(2)}`, `¢/kWh = $${A.perMWh.toFixed(2)} ÷ 10 = ${(A.perMWh / 10).toFixed(2)}¢`], { y0: 38, gap: 14 }), { w: 300, h: 134, from: 2, until: 2 });
    s.card('lf', 'SAME PEAK, DIFFERENT USE ($/MWh)', bars([A, B].map((c, i) => ({ label: c.name, value: +c.perMWh.toFixed(2), color: ['#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 108, max: 24, fmt: (v) => `$${v}`, y0: 42, h: 20, gap: 14, note: 'both 1 MW at peak; the charge is spread over more MWh' }), { w: 300, h: 140, from: 3, until: 3 });
    s.card('shave', 'PEAK SHAVING ($/MWh)', bars([A, C].map((c, i) => ({ label: c.name, value: +c.perMWh.toFixed(2), color: ['#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 120, max: 24, fmt: (v) => `$${v}`, y0: 42, h: 20, gap: 14, note: `share ${A.plc} to ${C.plc} MW saves $${fmt(A.cost - C.cost)} a year` }), { w: 300, h: 140, from: 4, until: 4 });
    s.card('auc', 'LAST THREE PJM AUCTIONS ($/MW-DAY)', bars(AUCTIONS.map(([label, value], i) => ({ label, value, color: ['#f6d77e', '#f1b3a3', '#cfc0e8'][i] })), { w: 300, labelW: 62, max: 400, fmt: (v) => `$${v}`, y0: 40, h: 20, gap: 14, note: 'from your game plan: check at PJM before quoting' }), { w: 300, h: 160, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Why', tag: 'CONCEPT', title: 'Energy and capacity are two bills',
      body: ['Energy markets pay for megawatt-hours. Capacity markets pay for megawatts kept ready. PJM buys capacity through an auction run years before the delivery year, and the cost reaches suppliers, who pass it to customers as a charge on each customer’s share.',
        'For a retail price, capacity is a large piece of the stack, so it must be forecast for each customer.'],
      callout: { k: 'key', t: 'A fixed-price quote that leaves out capacity, or uses the wrong peak share, can be wrong by dollars per MWh.' },
      focus: ['sup', 'iso', 'fac'], flows: ['f-iso'],
    },
    {
      short: 'PLC', tag: 'CONCEPT', title: 'A share set by your load at the peak',
      body: ['A customer’s share is called its peak load contribution, or PLC. It is based on the customer’s own demand during the few hours when the whole zone is at its highest, usually in summer.',
        'Once set, the share is used all year. A customer that is quiet on those peak days is billed less than a similar customer that is busy.'],
      callout: { k: 'know', t: 'The PLC depends on timing as well as size. Two plants of equal size can have very different shares.' },
      focus: ['fac', 'meter'], flows: ['f-peak'], stats: { plc: `${A.plc} MW of 1 MW` },
    },
    {
      short: 'Convert', tag: 'NUMBERS', title: 'Turn a $/MW-day price into $/MWh',
      body: [`Capacity cost is the peak share times the price times 365 days. At an illustrative $${PRICE} per MW-day, a ${A.plc} MW share costs ${A.plc} × ${PRICE} × 365 = $${fmt(A.cost)} a year.`,
        `Divide by the MWh the customer uses to get a price per MWh. A 1 MW customer at ${A.lf * 100}% load factor uses ${fmt(A.mwh)} MWh, so capacity adds $${A.perMWh.toFixed(2)} per MWh, or ${(A.perMWh / 10).toFixed(2)}¢ per kWh. PJM’s scaling factors raise the obligation a little, and are ignored here.`],
      callout: { k: 'key', t: 'The same dollars per MW-day become a bigger or smaller price per MWh depending on how steadily the customer uses power.' },
      focus: ['fac', 'sup', 'iso'], flows: ['f-pay', 'f-iso'], stats: { cost: `$${fmt(A.cost)} a year`, mwh: `$${A.perMWh.toFixed(2)}`, cent: `${(A.perMWh / 10).toFixed(2)}¢` },
    },
    {
      short: 'Load factor', tag: 'NUMBERS', title: 'A steadier customer pays less per MWh',
      body: [`Load factor is average load divided by peak load. A second customer, also 1 MW at peak but running at ${B.lf * 100}% load factor, uses ${fmt(B.mwh)} MWh. Its peak share is ${B.plc} MW, so capacity costs $${fmt(B.cost)}, or $${B.perMWh.toFixed(2)} per MWh.`,
        'The charge is similar in dollars, but spread over more MWh. High-load-factor customers are cheaper to serve per MWh.'],
      callout: { k: 'know', t: 'This is why a 65% load-factor customer cannot be priced like a 90% one, even in the same zone.' },
      focus: ['fac', 'sup'], flows: ['f-pay'],
    },
    {
      short: 'Peak shaving', tag: 'METHOD', title: 'Cutting load at the peak',
      body: [`If the customer cuts its load during the zone’s peak hours, for instance by running backup generation or pausing a process, its peak share falls. Cut from ${A.plc} MW to ${C.plc} MW and the annual charge falls from $${fmt(A.cost)} to $${fmt(C.cost)}, or $${C.perMWh.toFixed(2)} per MWh.`,
        'Customers and suppliers use alerts about likely peak days to decide when to curtail. Getting the call wrong costs a whole year of savings.'],
      callout: { k: 'warn', t: 'A customer that promises to shave must really do it. Price a deal on the share it will actually carry.' },
      focus: ['fac', 'meter'], flows: ['f-peak'], stats: { plc: `${C.plc} MW after shaving` },
    },
    {
      short: 'Auctions', tag: 'NUMBERS', title: 'Know the last three clearing prices',
      body: [`PJM’s auctions for the 2026/27, 2027/28 and 2028/29 delivery years cleared at $${AUCTIONS[0][1]}, $${AUCTIONS[1][1]} and $${AUCTIONS[2][1]} per MW-day. The last two were at the market’s price cap. These figures come from your interview game plan, so confirm them at PJM before quoting them.`,
        'Part of the pressure comes from forecast demand growth, including data centres, against a tight supply.'],
      callout: { k: 'key', t: 'Quote the three prices and their trend, and be able to convert any of them into $/MWh for a given customer.' },
      focus: ['iso', 'sup'], flows: ['f-iso'],
    },
  ],
};
