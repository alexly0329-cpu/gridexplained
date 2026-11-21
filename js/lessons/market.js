import { P } from '../iso.js';
import { smooth } from './common.js';

// Merit order: [id, label, GW, $/MWh marginal cost, colour]. Width of a block ∝ GW, height ∝ cost.
const PLANTS = [
  ['rw', 'wind + solar', 30, 0, 'green'], ['nuc', 'nuclear', 20, 10, 'violet'], ['hyd', 'hydro', 8, 20, 'blue'],
  ['cc', 'gas (combined cycle)', 40, 40, 'orange'], ['pk', 'gas peakers', 25, 120, 'red'],
];
const GW = 0.08, X0 = 0.1;                       // iso units per GW; where the staircase starts
const mv = (d) => ({ '--mx': `${(d * GW * 25.98).toFixed(1)}px`, '--my': `${(d * GW * 15).toFixed(1)}px` }); // slide the demand plane along iso x

// Illustrative spring-day price: negative at midday when sun and wind exceed demand.
const PR = [[0, 15], [4, 10], [7, 30], [10, 8], [12, -4], [14, 2], [17, 35], [19, 120], [21, 60], [24, 20]];
const HX = (h) => 22 + h * 10.2, PY = (p) => 128 - p * 0.7;
const price = `<path class="ax" d="M22,${PY(0)}H270M22,${PY(130)}V${PY(-15)}"/>
  <path d="${smooth(PR.map(([h, p]) => [HX(h), PY(p)]))}" fill="none" stroke="#d0683a" stroke-width="2.6" stroke-linecap="round"/>
  <text x="4" y="${PY(0) + 3}">$0</text><text x="2" y="${PY(100) + 3}">$100</text>
  <text x="22" y="${PY(-15) + 18}">0h</text><text x="${HX(12) - 10}" y="${PY(-15) + 18}">noon</text><text x="${HX(24) - 14}" y="${PY(-15) + 18}">24h</text>
  <circle cx="${HX(12)}" cy="${PY(-4)}" r="4" fill="#4caf50" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${HX(7.8)}" y="${PY(-4) + 13}" style="font-size:8.5px;font-weight:700;fill:#2f6b22">below zero</text>
  <circle cx="${HX(19)}" cy="${PY(120)}" r="4" fill="#e5534b" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${HX(11.4)}" y="${PY(120) + 4}" style="font-size:8.5px;font-weight:700;fill:#c0392b">evening scarcity</text>`;

export default {
  id: 'market', group: 'grid', title: 'Markets & Dispatch', icon: 'chart', time: 9, level: 'Intermediate',
  tagline: 'Who gets switched on first, who sets the price, and why the same hour can cost $0 or $120.',
  stats: [
    { id: 'dem', label: 'Demand', icon: 'house' }, { id: 'set', label: 'Sets the price', icon: 'cog' },
    { id: 'price', label: 'Price per MWh', icon: 'chart' }, { id: 'margin', label: 'Nuclear margin', icon: 'gauge' },
  ],
  legend: [['#a6d38b', 'wind + solar'], ['#cfc0e8', 'nuclear'], ['#7fb9e3', 'hydro'], ['#f0c08f', 'gas'], ['#e5534b', 'peakers']],
  learn: [
    { t: 'What the merit order is', at: 0 }, { t: 'Why the last plant needed sets the price', at: 1 },
    { t: 'Why every plant is paid the same price', at: 2 }, { t: 'Why a few hours pay for a lot of plants', at: 3 },
    { t: 'How negative prices happen', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    let x = X0;
    for (const [id, name, gw, p, col] of PLANTS) {
      const w = gw * GW, h = 0.25 + p * 0.02;
      s.box(id, x, 3.4, 0, w, 3.0, h, col, { label: { t: `${name} · $${p}` }, lopt: { dy: -16 } });
      x += w;
    }
    // demand plane slides along the staircase
    const pl = [[X0, 2.8, 0], [X0, 7.0, 0], [X0, 7.0, 3.3], [X0, 2.8, 3.3]].map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ');
    s.raw('demand', `<g style="transform:translate(var(--mx,0px),var(--my,0px));transition:transform 1.1s cubic-bezier(.4,0,.2,1)"><polygon points="${pl}" fill="#e9fc82" fill-opacity=".38" stroke="#2b2722" stroke-width="2.2" stroke-dasharray="6 4"/></g>`, { from: 1, k: 60 });
    s.labelS('demand:l', P(X0, 4.9, 3.3)[0], P(X0, 4.9, 3.3)[1], { t: 'demand', icon: 'house' }, { from: 1, dy: -4 });
    s.card('price', 'PRICE OVER A SPRING DAY', price, { w: 290, h: 160, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'Merit order', tag: 'CONCEPT', title: 'Line the plants up by cost',
      body: ['Each plant offers power at its marginal cost: what one more megawatt-hour costs to make, mostly fuel. Wind and solar have free fuel; gas turbines burn expensive fuel.',
        'Lined up cheapest first, with width showing capacity and height showing cost, the plants form a staircase called the merit order.'],
      callout: { k: 'key', t: 'Marginal cost is not build cost. A nuclear plant is expensive to build but cheap to run, so it sits low on the staircase.' },
      focus: ['rw', 'nuc', 'hyd', 'cc', 'pk'],
    },
    {
      short: 'Demand picks', tag: 'CONCEPT', title: 'The last plant needed sets the price',
      body: ['Operators switch plants on from the cheapest up until supply meets demand. At 45 GW the grid uses all wind and solar and part of the nuclear fleet.',
        'The most expensive plant still needed is the marginal one, and in most wholesale markets its offer sets the price for everyone.'],
      callout: { k: 'know', t: 'A more expensive plant can only run if demand reaches it. That is why it sets the price: it is the one that would stop if demand fell a little.' },
      focus: ['rw', 'nuc'], vars: mv(45), stats: { dem: '45 GW', set: 'Nuclear', price: '$10' },
    },
    {
      short: 'Same price', tag: 'NUMBERS', title: 'Everyone gets the clearing price',
      body: ['At an evening peak of 95 GW the staircase reaches the combined-cycle gas plants, which set the price at $40/MWh.',
        'Every plant that runs is paid that same $40. Nuclear costs $10 to run, so it keeps a $30/MWh margin, which helps pay for the plant itself.'],
      callout: { k: 'key', t: 'Cheap plants earn most when expensive plants set the price. That margin is what repays their construction cost.' },
      focus: ['rw', 'nuc', 'hyd', 'cc'], vars: mv(95), stats: { dem: '95 GW', set: 'Gas (CC)', price: '$40', margin: '$30' },
    },
    {
      short: 'Scarcity', tag: 'PROBLEM', title: 'A heatwave reaches the peakers',
      body: ['On the hottest evening demand hits 110 GW, deep into the peaker plants. These simple gas turbines cost a lot to run and may operate only a few dozen hours a year.',
        'The price jumps to $120/MWh. Those few hours carry much of the revenue that keeps peakers available at all.'],
      callout: { k: 'warn', t: 'High prices in scarce hours are a feature, not a glitch: they pay for capacity that sits idle the rest of the year. Price caps and consumer protections try to limit the pain.' },
      focus: ['rw', 'nuc', 'hyd', 'cc', 'pk'], vars: mv(110), stats: { dem: '110 GW', set: 'Gas peakers', price: '$120', margin: '$110' },
    },
    {
      short: 'Negative', tag: 'TRADE-OFF', title: 'Too much clean power: below zero',
      body: ['On a sunny, windy spring afternoon demand can fall to 25 GW while wind and solar could make 30 GW. Zero-fuel generators now set the price, and it can fall to zero or below.',
        'A negative price means producers pay to deliver, or switch off. Some wind farms keep running because tax credits pay per MWh made.'],
      callout: { k: 'key', t: 'Negative prices are a signal: store this power, use it, or move it somewhere. They are what pays storage to charge.' },
      focus: ['rw'], vars: mv(25), stats: { dem: '25 GW', set: 'Wind + solar', price: '−$5', margin: '$0' },
    },
    {
      short: 'Beyond energy', tag: 'CONCEPT', title: 'Paying for what the energy price misses',
      body: ['Energy prices alone do not always pay for reliability. Many grids add capacity payments (for being available), long-term contracts, and markets for services such as reserves and fast frequency response, the layers from the previous lesson.',
        'Storage fits the whole picture: it buys at the low prices and sells at the high ones, and the gap between them is its income.'],
      callout: { k: 'key', t: 'Dispatch, balance, frequency and wires are one system. Prices are how the system tells investors what it needs next.' },
      focus: ['pk', 'cc', 'rw'], vars: mv(95), stats: { dem: '95 GW', set: 'Gas (CC)', price: '$40' },
    },
  ],
};
