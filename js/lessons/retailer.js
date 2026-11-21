import { house, pylon } from './common.js';
import { list, table, bars } from './cards.js';

// Trader track. General market knowledge, not from the course notes. All figures are an illustrative $/MWh price build-up.
const STACK = [['Energy', 42], ['Capacity', 12], ['Transmission', 9], ['Fees and ISO', 3], ['Renewable credits', 2], ['Line losses', 3]];
const COST = STACK.reduce((a, [, v]) => a + v, 0), NONENERGY = COST - 42, MARGIN = 4, PRICE = COST + MARGIN;
const margin = (energy) => PRICE - (NONENERGY + energy);

export default {
  id: 'retailer', group: 'projects', track: 'trader', title: 'How a Retail Supplier Earns', icon: 'chart', time: 11, level: 'Intermediate',
  tagline: 'A supplier buys at wholesale and sells at a fixed price: what is in the price, where the risk sits, and where the margin leaks.',
  stats: [
    { id: 'price', label: 'Sale price', icon: 'chart' }, { id: 'cost', label: 'Cost to serve', icon: 'zap' },
    { id: 'margin', label: 'Margin', icon: 'gauge' }, { id: 'risk', label: 'Price risk', icon: 'flame' },
  ],
  legend: [['#e8a33a', 'power'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'Where a retail supplier sits between market and customer', at: 0 }, { t: 'The parts of a retail price', at: 1 },
    { t: 'How a fixed price turns into a bet', at: 2 }, { t: 'How fixed, index and block contracts split the risk', at: 3 },
    { t: 'Why volume is a second risk', at: 4 }, { t: 'Where margin quietly disappears', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('mkt', 0.6, 0.8, 0, 1.8, 1.5, 1.1, 'white', { label: { t: 'market', icon: 'chart' } });
    s.box('sup', 0.6, 4.6, 0, 1.6, 1.4, 1.0, 'green', { label: { t: 'supplier', icon: 'factory' } });
    s.raw('pyl', pylon(4.6, 1.6, 2.6) + pylon(4.6, 3.4, 2.6), { k: 9 });
    s.box('util', 4.0, 5.0, 0, 1.4, 1.2, 0.9, 'steel', { label: { t: 'utility wires', icon: 'tower' } });
    s.box('fac', 7.0, 1.4, 0, 1.8, 1.4, 1.0, 'cream', { label: { t: 'factory', icon: 'factory' } });
    house(s, 'home', 7.4, 5.4, { label: { t: 'customers', icon: 'house' } });
    s.flow('f-power', [[2.4, 1.5, 0.05], [4.6, 1.6, 0.05], [4.6, 3.4, 0.05], [7.0, 2.4, 0.05]], 'electric', {});
    s.flow('f-sell', [[7.4, 5.6, 0.05], [2.2, 5.4, 0.05]], 'cash', { cls: 'slow' });
    s.flow('f-buy', [[1.4, 4.6, 0.05], [1.4, 2.3, 0.05]], 'cash', { cls: 'slow' });
    s.card('who', 'WHO DOES WHAT', list([['Market', 'sells the power at wholesale'], ['Supplier', 'buys it, prices it, sells to customers'], ['Utility', 'owns the wires and delivers it'], ['Customer', 'picks a supplier or stays on default']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('stack', 'BUILDING A PRICE (ILLUSTRATION, $/MWh)', bars([...STACK.map(([label, value], i) => ({ label, value, color: i ? '#cfc0e8' : '#f6d77e' })), { label: 'Margin', value: MARGIN, color: '#a6d38b' }], { w: 300, labelW: 120, max: 42, fmt: (v) => `${v}`, y0: 32, h: 13, gap: 8, note: `cost $${COST} plus margin $${MARGIN} gives a $${PRICE} offer` }), { w: 300, h: 196, from: 1, until: 1 });
    s.card('bet', 'FIXED PRICE, MOVING COST', bars([32, 42, 62].map((e, i) => ({ label: `Energy at $${e}`, value: Math.abs(margin(e)), v: margin(e), color: margin(e) < 0 ? '#f1b3a3' : '#a6d38b' })), { w: 300, labelW: 92, max: 20, fmt: (v, r) => `${r.v > 0 ? '+' : r.v < 0 ? '−' : ''}$${Math.abs(r.v)}`, y0: 40, h: 20, gap: 14, note: `margin per MWh when sold at $${PRICE} and not hedged` }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('types', 'WHO CARRIES THE PRICE RISK', table(['Contract', 'Energy price risk'], [['Fixed price', 'the supplier'], ['Index', 'the customer'], ['Block and index', 'shared']], { cols: [12, 120], rowH: 26 }), { w: 300, h: 134, from: 3, until: 3 });
    s.card('vol', 'THE SECOND RISK: VOLUME', list([['Customers use more or less', 'weather and business swings'], ['Purchases are in blocks', 'usage is a shape'], ['Gaps settle at spot', 'price risk lands on the gap']], { gap: 36 }), { w: 300, h: 150, from: 4, until: 4 });
    s.card('leak', 'WHERE MARGIN LEAKS', list([['Bad debt', 'customers who do not pay'], ['Forecast error', 'buying the wrong shape'], ['Churn', 'losing a customer mid-hedge'], ['Slow data', 'meter and billing delays']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Middleman', tag: 'CONCEPT', title: 'Buy at wholesale, sell at retail',
      body: ['A retail supplier does not own plants or wires. It buys power in the wholesale market, usually through hedges bought ahead of time, and sells it to homes and businesses. The local utility still delivers the power and keeps the grid running.',
        'In states with customer choice, such as Ohio, customers can pick a supplier. Those who do not stay on the utility’s default service.'],
      callout: { k: 'key', t: 'The supplier’s product is a price and a promise. The power itself is the same as everyone’s.' },
      focus: ['mkt', 'sup', 'util', 'fac', 'home', 'pyl'], flows: ['f-power', 'f-sell', 'f-buy'],
    },
    {
      short: 'The stack', tag: 'NUMBERS', title: 'What goes into a price',
      body: [`A retail price is more than energy. Illustrative numbers: energy $42 per MWh, then capacity, transmission, ISO fees, renewable credits and line losses add $${NONENERGY}, for a cost of $${COST}. Add a $${MARGIN} margin and the offer is $${PRICE}.`,
        'Energy is the biggest and the most volatile part. The others are set by rules, auctions and tariffs, but they still have to be forecast.'],
      callout: { k: 'know', t: 'Two quotes can differ because of what they include, not only what they charge. Compare the stack.' },
      focus: ['sup', 'util', 'fac'], flows: ['f-sell'], stats: { price: `$${PRICE}`, cost: `$${COST}`, margin: `$${MARGIN}` },
    },
    {
      short: 'The bet', tag: 'PROBLEM', title: 'A fixed price is a bet on the market',
      body: [`Say the customer locks in $${PRICE} for a year. If the supplier waits to buy and energy later costs $62 instead of $42, the margin turns from +$${margin(42)} to −$${-margin(62)} per MWh. If it falls to $32, the margin grows to $${margin(32)}.`,
        'Buying forward fixes the cost at the moment of sale, which turns the bet into a locked margin.'],
      callout: { k: 'warn', t: 'Selling first and buying later is speculation. Hedging is what makes the margin real.' },
      focus: ['mkt', 'sup', 'fac'], flows: ['f-buy', 'f-sell'], stats: { risk: 'supplier' },
    },
    {
      short: 'Contracts', tag: 'CONCEPT', title: 'Fixed, index and block',
      body: ['In a fixed-price contract the supplier carries energy price risk, and charges a premium for it. In an index contract the customer pays the market price plus an adder, so the supplier’s risk is small and so is the premium.',
        'A block-and-index deal fixes a set volume, the block, and prices the rest at the index. Large customers often choose it to share risk.'],
      callout: { k: 'key', t: 'A buyer is choosing how much risk to keep. A supplier is choosing how much to be paid to take it.' },
      focus: ['sup', 'fac', 'home'], flows: ['f-sell'],
    },
    {
      short: 'Volume', tag: 'PROBLEM', title: 'Price is only half the risk',
      body: ['A fixed price per MWh leaves the number of MWh open. A hot week or a busy factory raises usage, and a plant closure lowers it. Suppliers buy fixed blocks, so any gap is bought or sold at the spot price.',
        'Gaps are worst when usage and price move together, such as in a cold snap, which is why load and weather forecasting matter.'],
      callout: { k: 'know', t: 'The load and weather lesson shows how that forecast is built.' },
      focus: ['fac', 'home', 'sup'], flows: ['f-power', 'f-buy'],
    },
    {
      short: 'Leaks', tag: 'TRADE-OFF', title: 'How a good margin goes bad',
      body: ['Even a well-hedged book loses margin quietly: customers who do not pay, shape errors in what was bought, customers who leave mid-hedge and leave the supplier holding an unwanted position, and slow meter data that delays the bill.',
        'This is why the daily position report and the data behind it matter as much as the trade itself.'],
      callout: { k: 'key', t: 'Margin is made at the sale, kept by the hedge, and lost in the details.' },
      focus: ['sup', 'util', 'fac', 'home'], flows: ['f-sell', 'f-buy'],
    },
  ],
};
