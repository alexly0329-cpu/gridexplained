import { panel } from './solar.js';
import { house, pylon } from './common.js';
import { list, bars, code } from './cards.js';

// Trader track. General market knowledge, not from the course notes. The gas-storage figures and the sample note are made up for practice.
const NOW = 3100, AVG = 3300, GAP = +(((NOW - AVG) / AVG) * 100).toFixed(1);   // Bcf in storage, and the gap to the five-year average

export default {
  id: 'fundamentals', group: 'trader', track: 'trader', title: 'Writing a Market Note', icon: 'bulb', time: 10, level: 'Beginner',
  tagline: 'The fundamentals that move power prices, and how to turn them into a short note a sales team can use.',
  stats: [
    { id: 'gas', label: 'Gas storage vs average', icon: 'flame' }, { id: 'sup', label: 'Supply watch', icon: 'factory' },
    { id: 'dem', label: 'Demand watch', icon: 'house' }, { id: 'len', label: 'Length', icon: 'clock' },
  ],
  legend: [['#2a9d8f', 'gas'], ['#e8a33a', 'power']],
  learn: [
    { t: 'Why a market note exists and who reads it', at: 0 }, { t: 'How gas storage and weather move prices', at: 1 },
    { t: 'What on the supply side to track', at: 2 }, { t: 'What on the demand side to track', at: 3 },
    { t: 'Why wires and constraints matter', at: 4 }, { t: 'How to write the note in four lines', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.cyl('gas', 1.6, 1.6, 0, 0.9, 1.3, 'teal', { k: 8, label: { t: 'gas storage', icon: 'flame' } });
    s.box('plant', 0.6, 4.6, 0, 2.0, 1.6, 1.1, 'steel', { label: { t: 'power plant', icon: 'factory' } });
    s.raw('sun', panel(4.4, 7.2, 1.8, 1.4), { k: 16 });
    s.label('sun:l', 5.3, 7.9, 1.2, { t: 'new solar', icon: 'sun' }, {});
    s.raw('pyl', pylon(4.6, 3.6, 2.6) + pylon(6.0, 3.6, 2.6), { k: 10 });
    s.box('dc', 7.0, 1.0, 0, 1.8, 1.5, 1.2, 'dark', { label: { t: 'data centre', icon: 'layers' } });
    house(s, 'city', 7.4, 5.2, { label: { t: 'homes', icon: 'house' } });
    s.flow('f-gas', [[2.4, 2.0, 0.3], [2.4, 4.6, 0.3]], 'gas', { pipe: true });
    s.flow('f-line', [[2.6, 5.4, 0.05], [4.4, 3.6, 0.05], [4.6, 3.6, 2.5], [6.0, 3.6, 2.5], [6.9, 3.6, 0.05], [7.2, 3.0, 0.05]], 'hv', {});
    s.flow('f-city', [[6.9, 3.6, 0.05], [7.6, 4.8, 0.05]], 'ac', { from: 3 });
    s.card('why', 'WHO READS THE NOTE', list([['Sales team', 'explains price moves to customers'], ['Pricing team', 'knows what changed in the curve'], ['Customers', 'want a plain reason, not jargon']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('gasc', 'GAS IN STORAGE (MADE UP, Bcf)', bars([{ label: 'This week', value: NOW, color: '#f1b3a3' }, { label: 'Five-year average', value: AVG, color: '#cfe3b2' }], { w: 300, labelW: 108, max: 4400, fmt: (v) => `${v.toLocaleString('en-US')}`, y0: 42, h: 20, gap: 14, note: `${GAP}% against average: supports higher gas prices` }), { w: 300, h: 140, from: 1, until: 1 });
    s.card('sup', 'SUPPLY SIDE', list([['Retirements', 'old coal and gas plants closing'], ['New builds', 'solar, batteries and gas arriving'], ['Outages', 'planned and forced, by plant'], ['Waiting lines', 'projects stuck in the connection queue']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('dem', 'DEMAND SIDE', list([['Data centres', 'large, steady new load'], ['Electrification', 'cars and heat pumps add use'], ['Weather', 'cold and heat swing demand'], ['Efficiency', 'pulls load down']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('wire', 'WIRES AND LIMITS', list([['Constraints', 'cut cheap power off from load'], ['New lines', 'take years, ease price gaps'], ['Outages', 'a line out can spike one zone'], ['Basis', 'tracks the congestion picture']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('note', 'A SAMPLE NOTE (MADE UP)', code([`Headline: West forwards rose 6% this week.`, `Why: colder outlook, gas storage below`, `  average, one large unit offline.`, `So what: Q1 fixed offers may go up;`, `  customers could lock in now.`, `Watch: Thursday gas storage report.`], { y0: 38, gap: 15 }), { w: 300, h: 138, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Why a note', tag: 'CONCEPT', title: 'Turn market moves into plain words',
      body: ['Sales teams talk to customers every day, and customers ask why prices moved. A short note, daily, weekly or on demand, gives them the reason, in terms a non-specialist can repeat.',
        'The work is not predicting the market. It is explaining what changed and why it matters.'],
      callout: { k: 'key', t: 'Fundamentals are the physical reasons behind price: fuel, weather, supply, demand and wires.' },
      focus: ['plant', 'city', 'dc', 'gas'], flows: ['f-gas', 'f-line'],
    },
    {
      short: 'Gas & weather', tag: 'NUMBERS', title: 'Gas storage and the forecast',
      body: [`Gas sets the marginal power price in many hours, so gas news travels to power. A common check is gas in storage against the five-year average. In this made-up example storage is ${NOW.toLocaleString('en-US')} Bcf against ${AVG.toLocaleString('en-US')}, a ${GAP}% gap, which points to firmer prices.`,
        'Weather forecasts act the same way. A colder winter outlook raises both heating demand and gas demand.'],
      callout: { k: 'know', t: 'Track the direction of changes, not only levels. A gap that is growing matters more than one that is stable.' },
      focus: ['gas', 'plant'], flows: ['f-gas'], stats: { gas: `${GAP}%` },
    },
    {
      short: 'Supply', tag: 'CONCEPT', title: 'Who is supplying, and who is leaving',
      body: ['Older plants retire, new solar, batteries and gas plants come on, and individual units go offline for planned or forced outages. Projects can wait years in connection queues.',
        'Each change shifts the supply stack. Tracking announced retirements and additions tells you where prices are headed.'],
      callout: { k: 'key', t: 'A single large outage can move a regional price for days. Check outage reports daily.' },
      focus: ['plant', 'sun', 'gas'], flows: ['f-gas', 'f-line'], stats: { sup: 'retirements, queue' },
    },
    {
      short: 'Demand', tag: 'CONCEPT', title: 'What is pulling load up or down',
      body: ['Data centres add large, steady loads. Electric cars and heat pumps add use that was once fuel. Weather swings load, and efficiency pulls it down.',
        'In some regions the rise in forecast demand has pushed capacity prices up sharply, which reaches retail prices through the cost of capacity.'],
      callout: { k: 'know', t: 'Demand growth that is real, firm and local matters more than a headline number.' },
      focus: ['dc', 'city', 'pyl'], flows: ['f-line', 'f-city'], stats: { dem: 'data centres' },
    },
    {
      short: 'Wires', tag: 'CONCEPT', title: 'The limits between supply and demand',
      body: ['Power can only move as far as the wires allow. A constraint can trap cheap power on one side of a line and push prices up on the other. New lines take years to build, and a line outage can raise one zone’s price quickly.',
        'Zone-to-hub basis is the market’s read on how tight the wires are.'],
      callout: { k: 'warn', t: 'Two places in the same ISO can see quite different prices on the same day.' },
      focus: ['pyl', 'plant', 'city'], flows: ['f-line'],
    },
    {
      short: 'The note', tag: 'METHOD', title: 'Four lines are enough',
      body: ['A good note has a headline with the move, a why, a so-what for customers and a thing to watch next. Keep it to a screen. Use one chart if it helps and plain words everywhere.',
        'State what you know, what you are guessing and what would change your view. Credibility is what makes people read the next one.'],
      callout: { k: 'key', t: 'If a sales rep cannot repeat it to a customer in two sentences, rewrite it.' },
      focus: ['plant', 'dc', 'city'], flows: ['f-line'], stats: { len: 'one screen' },
    },
  ],
};
