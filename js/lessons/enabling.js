import { panel } from './solar.js';
import { turbine } from './wind.js';
import { house, pylon } from './common.js';
import { list, table } from './cards.js';

// Source: the "Renewable Energy Futures" notes (enabling technologies: batteries, EV smart charging, hydrogen).
const charging = table(['Charging style', 'Peak-load effect'], [['Uncontrolled', '+9% to +20%'], ['Smart (V1G, V2G)', '−7% to +5%']], { cols: [12, 150], rowH: 28 })
  + list([['V1G', 'one-way, software picks the time'], ['V2G', 'the car feeds the grid back'], ['V2H / V2B', 'the car powers a home or building']], { y0: 98, gap: 27 });

export default {
  id: 'enabling', group: 'transition', title: 'Batteries, EVs & Hydrogen', icon: 'battery', time: 11, level: 'Intermediate',
  tagline: 'Three technologies that make high shares of wind and solar workable: batteries, electric cars as flexible loads, and hydrogen for the hard parts.',
  stats: [
    { id: 'ev', label: 'EV fleet by 2050', icon: 'zap' }, { id: 'peak', label: 'Uncontrolled charging', icon: 'chart' },
    { id: 'smart', label: 'Smart charging', icon: 'gauge' }, { id: 'h2', label: 'Low-emission hydrogen', icon: 'droplet' },
  ],
  legend: [['#e8a33a', 'electricity'], ['#2a9d8f', 'hydrogen']],
  learn: [
    { t: 'Why these are called enabling technologies', at: 0 }, { t: 'How batteries ride a cost-reduction loop', at: 1 },
    { t: 'Why EV charging is a peak problem, not an energy problem', at: 2 }, { t: 'V1G, V2G and V2H', at: 3 },
    { t: 'What the hydrogen “colours” mean', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.raw('solar', panel(0.6, 1.0, 1.8, 1.4) + panel(2.6, 1.0, 1.8, 1.4), { k: 6 });
    house(s, 'home', 1.0, 5.2, { label: { t: 'home', icon: 'house' } });
    s.box('ev', 2.8, 7.4, 0, 1.4, 0.8, 0.5, 'blue', { label: { t: 'electric car', icon: 'zap' } });
    s.box('batt', 3.6, 4.8, 0, 1.2, 1.0, 0.8, 'green', { label: { t: 'battery', icon: 'battery' } });
    s.raw('pylon', pylon(4.8, 1.6, 2.6), { k: 9 });
    s.label('grid:l', 4.8, 1.6, 2.8, { t: 'grid', icon: 'tower' }, {});
    turbine(s, { x: 8.6, y: 2.0, sc: 0.55, suf: 'W' });
    s.box('elyz', 6.2, 2.4, 0, 1.4, 1.2, 1.0, 'white', { label: { t: 'electrolyser', icon: 'droplet' } });
    s.cyl('tank', 6.4, 5.6, 0, 0.7, 1.4, 'steel', { label: { t: 'hydrogen tank', icon: 'flame' } });
    s.box('truck', 8.0, 7.0, 0, 1.6, 0.8, 0.8, 'cream', { label: { t: 'fuel-cell truck', icon: 'factory' } });
    s.flow('f-sun', [[2.4, 2.6, 0.05], [2.4, 5.2, 0.05]], 'electric', {});
    s.flow('f-grid', [[4.8, 1.8, 0.05], [4.8, 4.8, 0.05]], 'ac', {});
    s.flow('f-ev', [[3.0, 6.2, 0.05], [3.4, 7.4, 0.05]], 'electric', {});
    s.flow('f-batt', [[3.4, 5.4, 0.05], [3.6, 5.4, 0.05]], 'electric', { cls: 'fast' });
    s.flow('f-wind', [[8.6, 2.4, 0.05], [7.6, 3.0, 0.05]], 'electric', {});
    s.flow('f-h2', [[6.9, 3.6, 0.4], [6.4, 4.9, 0.4]], 'gas', { pipe: true });
    s.flow('f-h2b', [[7.0, 6.2, 0.4], [8.0, 7.4, 0.4]], 'gas', { pipe: true });
    s.card('loop', 'THE BATTERY COST LOOP', list([['New applications', 'firming, shifting, grid support'], ['Capital and R&D follow', 'new materials, bigger factories'], ['Costs fall', '~70% in three years; >50% more possible'], ['More deployment', 'and the loop repeats']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('ev', 'EVS: SMART VS UNCONTROLLED', charging, { w: 300, h: 190, from: 3, until: 3 });
    s.card('colors', 'HYDROGEN “COLOURS”', list([['Gray', 'fossil gas or coal; nearly all supply'], ['Blue', 'fossil plus carbon capture; dearer than gray'], ['Green', 'electrolysis with wind or solar; proven but early']], { gap: 38 }), { w: 300, h: 160, from: 4, until: 4 });
    s.card('trap', 'THE CHICKEN-AND-EGG TRAP', list([['Electric cars', 'could plug into existing sockets'], ['Hydrogen cars', 'need pumps, pipes and electrolysers first'], ['What unlocks it', 'mandates for steel, shipping and trucking']], { gap: 38 }), { w: 300, h: 160, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Enablers', tag: 'CONCEPT', title: 'Technologies that make others possible',
      body: ['Enabling technologies do not generate clean power themselves. They make it usable. Batteries help the grid, electric vehicles electrify transport, and hydrogen could clean up what electricity cannot reach.',
        'Meeting climate targets needs more than wind and solar. Studies also call for stationary storage, EVs as distributed storage, and low-cost green hydrogen.'],
      callout: { k: 'key', t: 'A grid with over 60% wind and solar needs these tools. Without them, the last tens of percent get expensive.' },
      focus: ['batt', 'ev', 'elyz', 'tank'], flows: ['f-sun', 'f-grid', 'f-wind'],
    },
    {
      short: 'Batteries', tag: 'METHOD', title: 'A Swiss Army knife with a cost curve',
      body: ['A grid battery system is more than cells: inverters, cooling, switchgear and transformers make an integrated plant. Its cost fell about 70% in three years, and component engineering could cut it by more than half again.',
        'Batteries can firm solar, reduce curtailment, shift midday power into the evening and shave customer peaks. Whether that is profitable depends on market rules for an asset that is both supply and demand.'],
      callout: { k: 'know', t: 'Each new use attracts investment, which lowers cost, which opens the next use. It is the same loop that cut the cost of wind and solar.' },
      focus: ['batt', 'home'], flows: ['f-batt', 'f-sun', 'f-grid'],
    },
    {
      short: 'EV load', tag: 'NUMBERS', title: 'The EV problem is the peak',
      body: ['Forecasts made around 2019 took the global EV fleet from about 8 million to over 600 million by 2050 on current plans, and over a billion for climate stabilisation. By the end of 2025 the fleet was already near 80 million, per IEA data.',
        'Electrifying all light vehicles adds only about 10–40% to annual electricity use. The risk is timing: if everyone plugs in at 6–7 p.m. as solar fades, peak demand rises by 9–20%.'],
      callout: { k: 'warn', t: 'Total energy is manageable. Instantaneous power at the evening peak is what strains the grid.' },
      focus: ['ev', 'home'], flows: ['f-ev', 'f-grid'], stats: { ev: '600 M – 1 B', peak: '+9% to +20%' },
    },
    {
      short: 'Smart charging', tag: 'METHOD', title: 'Turning a peak into a resource',
      body: ['Smart charging comes in three tiers. V1G is one-way: software shifts charging to cheap overnight hours. V2G is two-way: the car can send power back during shortfalls. V2H and V2B power a home or building directly.',
        'With smart charging, the peak-load effect falls from +9–20% to between a 7% cut and a 5% rise, and owners can earn from flexibility.'],
      callout: { k: 'key', t: 'A parked car is a battery with wheels. The grid just needs to be allowed to use it politely.' },
      focus: ['ev', 'batt', 'home'], flows: ['f-ev', 'f-batt', 'f-grid'], stats: { smart: '−7% to +5%' },
    },
    {
      short: 'Hydrogen', tag: 'CONCEPT', title: 'Hydrogen and its colours',
      body: ['Today’s hydrogen is almost all “gray”: made from natural gas or coal for refining and fertiliser, releasing CO₂. Blue adds carbon capture. Green uses renewable electricity to split water in an electrolyser.',
        'Hydrogen can store energy for months, limited only by tank or cavern size, and can become ammonia or methanol for ships, trucks and industry.'],
      callout: { k: 'know', t: 'Low-emission hydrogen is still about 1% of production. Green hydrogen is proven, but early and costly.' },
      focus: ['elyz', 'tank', 'towerW', 'nacelleW', 'rotorW'], flows: ['f-wind', 'f-h2'], stats: { h2: '≈ 1%' },
    },
    {
      short: 'The trap', tag: 'TRADE-OFF', title: 'Why hydrogen has not taken off',
      body: ['Battery cars scaled step by step because early owners could plug into home sockets. Hydrogen has no such backbone: it needs electrolysers, pipelines, stations, ammonia terminals and new end-use equipment together.',
        'Fuel-cell cars prove the physics, yet sales and stations have struggled. The way out is policy: net-zero mandates and heavy-transport rules that give steel, shipping and trucking guaranteed demand.'],
      callout: { k: 'key', t: 'Hydrogen is a system that has to arrive all at once. That is why it waits on policy signals, not on a single invention.' },
      focus: ['tank', 'truck', 'elyz'], flows: ['f-h2', 'f-h2b', 'f-wind'],
    },
  ],
};
