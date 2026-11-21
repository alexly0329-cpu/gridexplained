import { house, pylon } from './common.js';
import { list, table, bars } from './cards.js';

// Trader track. General market knowledge, not from the course notes. All prices are illustrative numbers in $/MWh.
const A = { e: 38, c: 0, l: 2 }, B = { e: 38, c: 14, l: 3 };           // location A: no congestion; location B behind a constrained line
const lmp = (n) => n.e + n.c + n.l;
const PA = lmp(A), PB = lmp(B);

export default {
  id: 'wholesale', group: 'grid', track: 'trader', title: 'Wholesale Markets & ISOs', icon: 'chart', time: 12, level: 'Intermediate',
  tagline: 'Who runs the wholesale market, how day-ahead and real-time prices work, and why the price differs from place to place.',
  stats: [
    { id: 'da', label: 'Day-ahead', icon: 'clock' }, { id: 'rt', label: 'Real-time', icon: 'zap' },
    { id: 'cong', label: 'Congestion', icon: 'tower' }, { id: 'basis', label: 'Hub to zone', icon: 'gauge' },
  ],
  legend: [['#e8a33a', 'power flow'], ['#d0683a', 'congested line']],
  learn: [
    { t: 'What an ISO or RTO does and which one covers Ohio', at: 0 }, { t: 'How day-ahead and real-time markets fit together', at: 1 },
    { t: 'What the three parts of a locational price are', at: 2 }, { t: 'Why congestion splits prices by location', at: 3 },
    { t: 'The difference between a hub, a zone and a node', at: 4 }, { t: 'How capacity and ancillary services are paid for', at: 5 },
    { t: 'How a congestion hedge works', at: 6 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('gA', 0.6, 1.0, 0, 1.8, 1.6, 1.2, 'steel', { label: { t: 'cheap plant', icon: 'factory' } });
    s.box('gB', 0.6, 6.4, 0, 1.4, 1.2, 0.9, 'flame', { label: { t: 'peaker', icon: 'flame' } });
    s.box('iso', 4.0, 0.4, 0, 1.6, 1.3, 1.0, 'white', { label: { t: 'ISO control room', icon: 'gauge' } });
    s.raw('pyl', pylon(3.6, 4.0, 2.6) + pylon(4.8, 4.0, 2.6) + pylon(6.0, 4.0, 2.6), { k: 9 });
    house(s, 'city', 7.4, 3.4, { label: { t: 'city load', icon: 'house' } }); house(s, 'city', 8.2, 5.0);
    s.label('pA:l', 1.5, 1.8, 1.9, { t: `A  $${PA}` }, { from: 2, dy: -12 });
    s.label('pB:l', 8.0, 4.2, 1.7, { t: `B  $${PB}` }, { from: 2, dy: -16 });
    s.flow('f-line', [[2.4, 2.2, 0.05], [3.4, 4.0, 0.05], [3.6, 4.0, 2.5], [6.0, 4.0, 2.5], [6.9, 4.0, 0.05], [7.4, 4.0, 0.05]], 'hv', {});
    s.flow('f-peak', [[2.0, 6.8, 0.05], [7.8, 6.8, 0.05], [8.6, 6.4, 0.05]], 'electric', { from: 3, cls: 'slow' });
    s.flow('f-iso', [[4.8, 1.7, 0.05], [4.8, 3.6, 0.05]], 'light', { cls: 'slow' });
    s.card('isos', 'THE ISOs AND RTOs', list([['PJM', '13 states and DC, including Ohio'], ['MISO and SPP', 'Midwest and central plains'], ['ERCOT', 'Texas, mostly its own grid'], ['NYISO, ISO-NE, CAISO', 'New York, New England, California']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('twoset', 'TWO SETTLEMENTS', table(['', 'Day-ahead', 'Real-time'], [['Prices', 'hourly, day before', 'every 5 minutes'], ['Binding', 'a commitment', 'settles gaps'], ['Role', 'lock in a price', 'balance surprises']], { cols: [12, 76, 192], rowH: 26 }), { w: 300, h: 134, from: 1, until: 1 });
    s.card('lmp', 'LOCATIONAL PRICE, TWO PLACES', bars([{ label: 'A: no congestion', value: PA, color: '#a6d38b' }, { label: 'B: behind the line', value: PB, color: '#f1b3a3' }], { w: 300, labelW: 126, max: 70, fmt: (v) => `$${v}`, y0: 42, h: 20, gap: 14, note: `energy $${A.e} + congestion + losses; B adds $${B.c} and $${B.l}` }), { w: 300, h: 140, from: 2, until: 2 });
    s.card('cong', 'WHY THE PRICES SPLIT', list([['The line is full', 'cheap power cannot all get through'], ['Local plant runs instead', 'the peaker sets the price at B'], ['Price gap = cost of the limit', `$${PB - PA} between B and A`]], { gap: 36 }), { w: 300, h: 150, from: 3, until: 3 });
    s.card('hub', 'WHERE PRICES ARE QUOTED', list([['Node', 'one point on the grid'], ['Hub', 'a basket of nodes, used for trading'], ['Zone', 'an area; retail load is settled here'], ['Basis', 'zone price minus hub price']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('other', 'BEYOND ENERGY', list([['Capacity', 'paid to be available, bought years ahead'], ['Regulation and reserves', 'fast backup and frequency control'], ['Both pass to suppliers', 'as costs on every MWh served']], { gap: 36 }), { w: 300, h: 150, from: 5, until: 5 });
    s.card('ftr', 'A CONGESTION HEDGE', list([['Right between two points', 'pays the price difference'], ['Bought at auction', 'before the month or year starts'], ['Offsets the basis cost', 'when load sits behind a constraint']], { gap: 36 }), { w: 300, h: 150, from: 6, until: 6 });
  },
  steps: [
    {
      short: 'The ISO', tag: 'CONCEPT', title: 'A neutral operator runs the market',
      body: ['In most of North America an independent system operator, or regional transmission organisation, runs the grid and the wholesale market for its region. It dispatches plants, publishes prices and settles the money.',
        'Ohio sits inside PJM. Texas has ERCOT, New York has NYISO, and so on. A supplier that serves customers in a region has to deal with that region’s rules.'],
      callout: { k: 'key', t: 'The ISO owns neither plants nor wires. It is the referee that matches supply and demand every few minutes.' },
      focus: ['iso', 'gA', 'gB'], flows: ['f-iso'],
    },
    {
      short: 'Two markets', tag: 'CONCEPT', title: 'Day-ahead and real-time',
      body: ['In the day-ahead market, generators and buyers submit offers and bids for each hour of tomorrow. The ISO clears them and the result is a firm, financial schedule.',
        'In real time, actual conditions differ from the plan, so the ISO re-dispatches every five minutes. Any gap between your day-ahead position and what actually happens is settled at the real-time price.'],
      callout: { k: 'know', t: 'Day-ahead is where most volume is priced. Real-time is where surprises cost or earn money.' },
      focus: ['iso', 'gA', 'city'], flows: ['f-line', 'f-iso'], stats: { da: 'hourly, firm', rt: '5-minute' },
    },
    {
      short: 'Price parts', tag: 'NUMBERS', title: 'A price made of three parts',
      body: [`A locational marginal price, or LMP, is the cost of one more MWh at one place. It has three parts: an energy component that is the same system-wide, a congestion component, and a loss component for the power lost on the way.`,
        `Take illustrative numbers. At A the energy part is $${A.e}, congestion is $${A.c} and losses are $${A.l}, so $${PA}. At B, behind a constrained line, congestion adds $${B.c} and losses $${B.l}, so $${PB}.`],
      callout: { k: 'key', t: 'The energy part is common. All the local differences live in congestion and losses.' },
      focus: ['gA', 'city', 'pA', 'pB'], flows: ['f-line'], stats: { cong: `$${B.c} at B` },
    },
    {
      short: 'Congestion', tag: 'CONCEPT', title: 'When the line is full',
      body: ['Transmission lines have limits. When the cheapest plant is on the far side of a full line, the ISO must run a dearer plant near the load instead. The price near the load rises, and the price near the cheap plant stays low.',
        `That is congestion. The gap of $${PB - PA} here is what the limit costs, hour by hour, and it changes with weather and outages.`],
      callout: { k: 'warn', t: 'A supplier buying at a hub and selling at a zone behind a constraint can lose money on the gap even if the hub price is flat.' },
      focus: ['gA', 'gB', 'pylon', 'pyl', 'city', 'pA', 'pB'], flows: ['f-line', 'f-peak'], stats: { cong: `$${PB - PA} gap` },
    },
    {
      short: 'Hubs & zones', tag: 'CONCEPT', title: 'Node, hub, zone',
      body: ['A node is a single point. A hub averages many nodes into a liquid trading price, and forward deals are usually written at a hub, such as the Western Hub in PJM. A zone covers a utility area, and retail load is settled at the zone price.',
        'The zone price minus the hub price is the basis. A supplier that hedges at the hub keeps the basis risk unless it also hedges the zone.'],
      callout: { k: 'know', t: 'Always check which point a price refers to before comparing two numbers.' },
      focus: ['city', 'iso'], flows: ['f-line'], stats: { basis: 'zone − hub' },
    },
    {
      short: 'Capacity', tag: 'CONCEPT', title: 'Paying to be available',
      body: ['Energy markets pay for megawatt-hours. Capacity markets pay generators and demand resources for being ready when the system needs them, and PJM buys capacity years in advance. Ancillary services, such as regulation and reserves, pay for fast, flexible response.',
        'Suppliers do not choose to buy these. They arrive as charges on the load they serve and become a cost in every contract.'],
      callout: { k: 'key', t: 'Capacity and ancillary costs are set by rules and auctions. Price them into a quote, do not forget them.' },
      focus: ['iso', 'gA', 'gB'], flows: ['f-iso'],
    },
    {
      short: 'Hedging', tag: 'METHOD', title: 'Hedging the gap between places',
      body: ['A financial transmission right pays its holder the price difference between two points. If you serve load at B but buy at A, a right from A to B pays you when congestion widens the gap.',
        'The rights are sold in auctions before the period begins, so the hedge has a price too, and it only protects against the part of the gap the auction priced.'],
      callout: { k: 'know', t: 'Hedging congestion is one more layer on top of hedging the hub price. The forward curves lesson covers the hub.' },
      focus: ['gA', 'city', 'pyl', 'pA', 'pB'], flows: ['f-line'],
    },
  ],
};
