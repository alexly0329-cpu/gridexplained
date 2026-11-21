import { house } from './common.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (energy services, the negawatt principle, cost curves, barriers) and conversion efficiencies from the energy lesson.
// The electric-car comparison is an illustration computed here; it assumes 85% from plug to wheels.
const SAVED = 100 - 15, KWH_PER_1000H = SAVED;                       // watts saved by a 15 W LED replacing a 100 W bulb; kWh per 1,000 hours
const DRIVE = 0.85;
const CAR = [['Petrol car', 22], ['EV on gas plant', Math.round(58 * DRIVE)], ['EV on hydro', Math.round(90 * DRIVE)]];

export default {
  id: 'efficiency', group: 'transition', title: 'Efficiency & Negawatts', icon: 'bulb', time: 9, level: 'Beginner',
  tagline: 'The cheapest power plant is the one you never build: how doing the same with less changes what the grid has to supply.',
  stats: [
    { id: 'w', label: 'Watts saved', icon: 'bulb' }, { id: 'kwh', label: 'Saved per 1,000 h', icon: 'zap' },
    { id: 'ev', label: 'EV vs petrol', icon: 'gauge' }, { id: 'cut', label: 'Clean power avoided', icon: 'chart' },
  ],
  legend: [['#7c63d0', 'power from the grid']],
  learn: [
    { t: 'Why people want services, not energy', at: 0 }, { t: 'What a negawatt is and why saving beats generating', at: 1 },
    { t: 'Where efficiency gains are found', at: 2 }, { t: 'How efficiency measures are ranked by cost', at: 3 },
    { t: 'Why electrification saves primary energy', at: 4 }, { t: 'Why efficiency is hard to deliver', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('plant', 0.8, 0.8, 0, 2.0, 1.6, 1.1, 'steel', { label: { t: 'power plant', icon: 'factory' } });
    s.cooling('ct', 3.6, 1.6, 0, 0.7, 1.6, 'white', { k: 10 });
    s.box('ghost', 0.8, 4.0, 0, 2.0, 1.6, 1.1, 'white', { from: 1, until: 3, label: { t: 'plant not needed', icon: 'factory' } });
    house(s, 'home', 6.2, 1.0, { label: { t: 'home', icon: 'house' } });
    s.dome('oldb', 4.6, 5.0, 0, 0.5, 0.3, 0.55, 'yellow', { from: 1, until: 1, k: 14, label: { t: '100 W bulb', icon: 'bulb' } });
    s.dome('led', 6.8, 5.4, 0, 0.3, 0.2, 0.3, 'green', { from: 1, until: 1, k: 15, label: { t: '15 W LED', icon: 'bulb' } });
    s.box('fac', 5.4, 5.4, 0, 1.8, 1.4, 1.0, 'cream', { from: 2, until: 3, label: { t: 'factory', icon: 'factory' } });
    s.box('car', 1.0, 7.4, 0, 1.4, 0.8, 0.5, 'teal', { from: 4, label: { t: 'electric car', icon: 'zap' } });
    s.flow('f-home', [[2.8, 1.6, 0.05], [6.2, 1.6, 0.05]], 'ac', {});
    s.flow('f-fac', [[4.4, 2.6, 0.05], [4.4, 6.0, 0.05], [5.4, 6.0, 0.05]], 'ac', { from: 2, until: 3 });
    s.flow('f-car', [[2.2, 2.4, 0.05], [2.2, 7.6, 0.05], [2.4, 7.8, 0.05]], 'ac', { from: 4, until: 4, cls: 'slow' });
    s.card('svc', 'WHAT PEOPLE REALLY WANT', list([['Light', 'to see and read'], ['Heat and cooling', 'comfort and food safety'], ['Motion', 'moving people and goods'], ['Computing', 'data, devices, communication']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('led', 'SAME LIGHT, LESS POWER', bars([{ label: 'Old bulb', value: 100, color: '#f1b3a3' }, { label: 'LED', value: 15, color: '#a6d38b' }], { w: 300, labelW: 70, max: 100, fmt: (v) => `${v} W`, y0: 42, h: 20, gap: 14, note: `${SAVED} W saved: ${KWH_PER_1000H} kWh per 1,000 hours` }), { w: 300, h: 140, from: 1, until: 1 });
    s.card('where', 'FOUR PLACES TO LOOK', list([['Industry', 'heat recovery, efficient motors'], ['Transport', 'lighter, electric, shared'], ['Homes', 'insulation, sealing, heat pumps'], ['Offices and shops', 'LED lighting and controls']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('curve', 'RANKED BY COST', list([['Industrial energy management', 'low cost, big savings, fast payback'], ['Home building envelope', 'duct sealing, basement insulation'], ['Office lighting upgrades', 'LED lamps and occupancy sensors']], { gap: 36 }), { w: 300, h: 150, from: 3, until: 3 });
    s.card('ev', 'ENERGY TO MOVE A CAR (ILLUSTRATION)', bars(CAR.map(([label, value], i) => ({ label, value, color: ['#f1b3a3', '#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 110, max: 100, fmt: (v) => `${v}%`, y0: 40, h: 20, gap: 14, note: 'at the wheels, assuming 85% plug to wheels' }), { w: 300, h: 160, from: 4, until: 4 });
    s.card('hard', 'WHY IT IS HARD TO DELIVER', list([['Up-front cost', 'savings arrive in small yearly amounts'], ['Hard to prove', 'saved energy is a number never used'], ['Scattered', 'millions of buildings and machines'], ['Needs standards', 'agreed ways to measure savings']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Services', tag: 'CONCEPT', title: 'People want light, warmth and motion',
      body: ['Energy has no value of its own. What matters is the service: light, heat or cooling, mechanical motion, computing.',
        'Efficiency delivers the same services using less energy.'],
      callout: { k: 'key', t: 'Cutting waste on the demand side shrinks everything upstream: fuel, plants, wires and emissions.' },
      focus: ['plant', 'ct', 'home'], flows: ['f-home'],
    },
    {
      short: 'Negawatts', tag: 'NUMBERS', title: 'A saved watt is a watt not generated',
      body: [`Swap a 100 W bulb for a 15 W LED and the room is just as bright. You free ${SAVED} W, or ${KWH_PER_1000H} kWh over 1,000 hours of use. Such saved power is a negawatt.`,
        'Because of line losses, each kilowatt-hour saved at the meter avoids more than a kilowatt-hour at the plant.'],
      callout: { k: 'know', t: 'Enough negawatts and a plant is never built. That plant would otherwise cost money, burn fuel and emit carbon.' },
      focus: ['oldb', 'led', 'ghost', 'plant', 'home'], flows: ['f-home'], stats: { w: `${SAVED} W`, kwh: `${KWH_PER_1000H} kWh` },
    },
    {
      short: 'Where', tag: 'CONCEPT', title: 'Four sectors, four toolkits',
      body: ['Industry, transport, homes and commercial buildings each need their own fix: heat recovery and efficient motors in factories, lighter or electric vehicles on the road, insulation and heat pumps in homes, LEDs and controls in shops and offices.',
        'There is no single silver-bullet technology, which is why efficiency is easy to underrate.'],
      callout: { k: 'know', t: 'Industry and transport use the most energy, and both have relied on dense fossil fuels.' },
      focus: ['fac', 'home', 'plant'], flows: ['f-home', 'f-fac'],
    },
    {
      short: 'Cost curve', tag: 'METHOD', title: 'Rank the options by what they cost',
      body: ['A marginal abatement cost curve lines up measures from cheapest to dearest. Column width is the energy saved and column height is the net cost.',
        'Industrial energy management sits at the cheap end, with large savings and quick payback. Home sealing and insulation come next. Commercial lighting is a well-known easy win.'],
      callout: { k: 'key', t: 'Many measures have a negative net cost: they pay for themselves, so doing them first leaves less to build.' },
      focus: ['fac', 'home', 'ghost'], flows: ['f-fac'],
    },
    {
      short: 'Electrify', tag: 'NUMBERS', title: 'Electric motors waste less',
      body: [`Only about 22% of a petrol car’s fuel energy reaches the wheels. An electric car running on a combined-cycle gas plant at about 58% gets roughly ${CAR[1][1]}% from the same fuel. On a hydro plant at about 90% it reaches about ${CAR[2][1]}%.`,
        'So replacing combustion engines with electric motors can cut the primary energy for the same trip even before any clean power is added.'],
      callout: { k: 'warn', t: 'This is a simple illustration. Real numbers vary with batteries, charging losses and driving conditions.' },
      focus: ['car', 'plant', 'ct'], flows: ['f-car'], stats: { ev: `${CAR[1][1]}–${CAR[2][1]}% vs 22%` },
    },
    {
      short: 'Barriers', tag: 'TRADE-OFF', title: 'Why it is hard to capture',
      body: ['Efficiency costs money up front and pays back in small yearly savings. Proving what you saved means proving what would have happened otherwise. And 500 MW of negawatts means thousands of retrofits, not one big plant.',
        'It matters anyway: efficiency could cut the clean energy needed by 2050 by up to 40%, and it is the fastest way to ease grid strain as cars, heat pumps and data centres add load.'],
      callout: { k: 'key', t: 'Renewable supply and efficiency carry roughly equal weight in 2050 climate plans. One without the other costs far more.' },
      focus: ['plant', 'ct', 'home', 'fac'], flows: ['f-home'], stats: { cut: 'up to 40%' },
    },
  ],
};
