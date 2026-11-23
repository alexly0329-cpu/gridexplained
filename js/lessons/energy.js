import { panel } from './solar.js';
import { turbine } from './wind.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (energy forms, where Earth's energy comes from, the six pathways, thermodynamics and conversion efficiency, SI units).
// The chained-loss chart is an illustration computed here from stated stage efficiencies.
const STAGES = [['boiler', 0.9], ['turbine', 0.4], ['generator', 0.98]];
const CHAIN = STAGES.reduce((a, [n, e]) => [...a, { label: `after ${n} ${e * 100}%`, value: +(a[a.length - 1].value * e).toFixed(1) }], [{ label: 'fuel energy in', value: 100 }]);
const END = CHAIN[CHAIN.length - 1].value;
const PRIMARY = 500, LOST = 290, USEFUL = PRIMARY - LOST;   // exajoules a year, global

export default {
  id: 'energy', group: 'foundations', title: 'Energy, Efficiency & Units', icon: 'gauge', time: 12, level: 'Beginner',
  tagline: 'Where energy comes from, why every conversion loses some, how much the world wastes, and the units used to count it.',
  stats: [
    { id: 'hy', label: 'Hydro dam', icon: 'droplet' }, { id: 'th', label: 'Thermal plant', icon: 'flame' },
    { id: 'pv', label: 'Solar PV cell', icon: 'sun' }, { id: 'glob', label: 'Lost worldwide', icon: 'chart' },
  ],
  legend: [['#2f86ce', 'water'], ['#d0683a', 'waste heat'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'How energy changes form without being lost', at: 0 }, { t: 'Why every conversion wastes some as heat', at: 1 },
    { t: 'How losses compound along a chain', at: 2 }, { t: 'How much of the world’s energy is wasted', at: 3 },
    { t: 'Where Earth’s new energy actually comes from', at: 4 }, { t: 'The six pathways to electricity', at: 5 },
    { t: 'Reading kilo, mega and giga', at: 6 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('hill', 0.6, 0.8, 0, 2.2, 2.0, 1.4, 'rock', { shadow: false });
    s.water('hw', 0.8, 1.0, 1.4, 1.8, 1.6, 0.2, { k: 6, label: { t: 'reservoir', icon: 'droplet' } });
    s.box('ht', 3.4, 1.2, 0, 1.1, 1.0, 0.8, 'steel', { label: { t: 'turbine', icon: 'cog' } });
    s.box('hg', 4.9, 1.2, 0, 1.0, 1.0, 0.8, 'white', { label: { t: 'generator', icon: 'zap' } });
    s.box('grid', 7.6, 3.0, 0, 0.9, 0.9, 0.8, 'concrete', { label: { t: 'grid', icon: 'tower' } });
    s.box('boil', 0.8, 5.2, 0, 1.6, 1.4, 1.2, 'flame', { label: { t: 'burner', icon: 'flame' } });
    s.box('tt', 2.9, 5.4, 0, 1.1, 1.0, 0.8, 'steel');
    s.box('tg', 4.4, 5.4, 0, 1.0, 1.0, 0.8, 'white');
    s.cooling('ct', 3.2, 8.4, 0, 0.8, 1.8, 'white', { k: 22, label: { t: 'waste heat', icon: 'thermo' } });
    s.raw('pv', panel(6.2, 5.8, 1.8, 1.4), { k: 14 });
    turbine(s, { x: 8.9, y: 5.4, sc: 0.5, suf: 'W' });
    s.flow('f-water', [[2.8, 1.8, 0.3], [3.4, 1.7, 0.3]], 'water', { pipe: true });
    s.flow('f-hel', [[6.0, 1.7, 0.05], [7.9, 1.7, 0.05], [7.9, 3.0, 0.05]], 'electric', {});
    s.flow('f-fuel', [[2.4, 5.8, 0.3], [2.9, 5.8, 0.3]], 'heat', { pipe: true, from: 1 });
    s.flow('f-tel', [[5.5, 5.9, 0.05], [5.8, 5.9, 0.05], [7.9, 5.9, 0.05], [7.9, 3.9, 0.05]], 'electric', { from: 1 });
    s.flow('f-waste', [[3.5, 6.4, 0.3], [3.2, 7.6, 0.3]], 'heat', { pipe: true, from: 1, cls: 'slow' });
    s.flow('f-up', [[3.2, 8.4, 2.0], [3.2, 8.4, 3.4]], 'heat', { from: 1, cls: 'slow' });
    s.card('chain', 'ONE DAM, FIVE FORMS OF ENERGY', list([['Gravitational potential', 'water held high behind the dam'], ['Kinetic', 'water falling through the pipe'], ['Mechanical', 'the turbine spins'], ['Electromagnetic', 'magnets and coils in the generator'], ['Electrical', 'current in the wires']], { gap: 28 }), { w: 300, h: 178, from: 0, until: 0 });
    s.card('eff', 'WHAT REAL MACHINES CAPTURE', bars([{ label: 'Hydro dam', value: 90, t: 'up to 90%', color: '#9fcdf0' }, { label: 'Wind turbine', value: 40, t: '30–50%', color: '#a6d38b' }, { label: 'Thermal plant', value: 33, t: 'about 33%', color: '#f6d77e' }, { label: 'Car engine', value: 22, t: '20–25%', color: '#f1b3a3' }, { label: 'Solar PV cell', value: 22, t: '20–25%', color: '#fcdcbd' }], { w: 300, labelW: 92, max: 100, fmt: (v, r) => r.t, y0: 36, h: 14, gap: 10, note: 'useful energy out ÷ energy in; wind is capped at 59.3%' }), { w: 300, h: 176, from: 1, until: 1 });
    s.card('chainloss', 'ILLUSTRATION: LOSSES COMPOUND', bars(CHAIN.map((r, i) => ({ ...r, color: i ? '#f0c08f' : '#a6d38b' })), { w: 300, labelW: 128, max: 100, fmt: (v) => `${v}`, y0: 38, h: 16, gap: 11, note: 'units of energy left; every stage takes its cut' }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('ledger', 'THE WORLD ENERGY LEDGER', bars([{ label: 'Primary energy', value: PRIMARY, color: '#cfc0e8' }, { label: 'Lost as waste heat', value: LOST, color: '#f1b3a3' }, { label: 'Useful services', value: USEFUL, color: '#a6d38b' }], { w: 300, labelW: 124, max: PRIMARY, fmt: (v) => `${v} EJ`, y0: 42, h: 20, gap: 14, note: 'exajoules a year, about 58% lost' }), { w: 300, h: 162, from: 3, until: 3 });
    s.card('budget', 'WHERE EARTH’S NEW ENERGY GOES', bars([{ label: 'Heats air, land, sea', value: 47, color: '#f6d77e' }, { label: 'Reflected to space', value: 30, color: '#d9d1c4' }, { label: 'Water cycle (hydro)', value: 23, color: '#9fcdf0' }, { label: 'Wind and waves', value: 0.2, color: '#a6d38b' }], { w: 300, labelW: 134, max: 50, fmt: (v) => `${v}%`, y0: 38, h: 16, gap: 10, note: 'share of sunlight; geothermal 0.02%, tides 0.002%' }), { w: 300, h: 164, from: 4, until: 4 });
    s.card('paths', 'SIX PATHWAYS TO ELECTRICITY', list([['Moving mass', 'wind, currents, run-of-river'], ['Heat', 'geothermal, concentrated solar'], ['Tidal pull', 'gravity of the moon and sun'], ['Elevated water', 'reservoir hydro'], ['Light', 'solar photovoltaic cells'], ['Chemistry', 'batteries and fuel cells']], { gap: 28 }), { w: 300, h: 206, from: 5, until: 5 });
    s.card('units', 'READING THE PREFIXES', table(['Prefix', 'Factor', 'A typical thing'], [['kilo (k)', '10³', 'rooftop solar, 5 kW'], ['mega (M)', '10⁶', 'a wind turbine, 3 MW'], ['giga (G)', '10⁹', 'a big plant, 1 GW'], ['tera (T)', '10¹²', 'a country’s year, TWh']], { cols: [12, 80, 130], rowH: 26 }), { w: 300, h: 160, from: 6, until: 6 });
  },
  steps: [
    {
      short: 'Chain', tag: 'CONCEPT', title: 'Energy changes form, it is never lost',
      body: ['Energy is the capacity to do work, and it comes in two states: kinetic (in motion) and potential (stored). Total energy is conserved. It only moves between forms.',
        'A hydro dam shows the whole chain: stored water, falling water, a spinning turbine, then induced current in the generator.'],
      callout: { k: 'key', t: 'Almost every kind of energy people use is electromagnetic in origin. Nuclear and gravity are the big exceptions.' },
      focus: ['hill', 'hw', 'ht', 'hg', 'grid'], flows: ['f-water', 'f-hel'], stats: { hy: 'up to 90%' },
    },
    {
      short: 'Heat tax', tag: 'CONCEPT', title: 'Every conversion pays a heat tax',
      body: ['The second law of thermodynamics says each conversion turns some useful energy into waste heat through friction, exhaust and turbulence. No machine reaches 100%.',
        'Skipping combustion helps. Water turbines capture up to 90%. A burner-and-steam plant manages about a third, and the rest goes up the cooling tower.'],
      callout: { k: 'know', t: 'Plants that dump two thirds of their input as heat need cooling water or towers. That shapes where they can be built.' },
      focus: ['boil', 'tt', 'tg', 'ct', 'hill', 'ht'], flows: ['f-fuel', 'f-waste', 'f-up', 'f-tel', 'f-water', 'f-hel'], stats: { hy: 'up to 90%', th: '≈ 33%' },
    },
    {
      short: 'Compounding', tag: 'NUMBERS', title: 'Losses multiply along the chain',
      body: [`Take 100 units of fuel. A 90% boiler leaves ${CHAIN[1].value}. A 40% turbine leaves ${CHAIN[2].value}. A 98% generator leaves ${END}. Each stage looks fine on its own, but the product is about a third.`,
        'Fewer stages means less waste. This is why direct routes, such as water through a turbine or sunlight into a cell, avoid the heat penalty.'],
      callout: { k: 'warn', t: 'Compare fuels and sources fairly: a free-fuel machine can be inefficient and still cheap. Efficiency and cost are different questions.' },
      focus: ['boil', 'tt', 'tg', 'ct'], flows: ['f-fuel', 'f-waste', 'f-up', 'f-tel'], stats: { th: `${END}% left` },
    },
    {
      short: 'World ledger', tag: 'NUMBERS', title: 'Most of the world’s energy is waste heat',
      body: [`The world draws roughly ${PRIMARY} exajoules of primary energy a year. About ${LOST} of those, around 58%, is lost as heat in conversion. Only about ${USEFUL} reach us as light, heat, motion and computing.`,
        'Electric motors, heat pumps and electric cars convert far better than combustion engines, so electrifying shrinks the primary energy needed for the same service.'],
      callout: { k: 'key', t: 'Energy has no value on its own. People want light, warmth and travel, and efficiency is the cheapest way to supply them.' },
      focus: ['boil', 'ct', 'tg'], flows: ['f-waste', 'f-up'], stats: { glob: '≈ 58%' },
    },
    {
      short: 'Earth’s budget', tag: 'CONCEPT', title: 'Almost all new energy is sunlight',
      body: ['Over 99.9% of the new energy reaching Earth each year is solar radiation. Of that, 47% warms air, land and sea, 30% reflects back to space, and 23% drives evaporation, clouds and rain: the source of hydro.',
        'Wind and waves take about 0.2%. Earth’s own heat adds 0.02%, and tides just 0.002%.'],
      callout: { k: 'know', t: 'Fossil fuels are ancient sunlight stored by plants and plankton. They are a savings account, not income.' },
      focus: ['hill', 'hw', 'pv', 'towerW', 'nacelleW', 'rotorW'], flows: ['f-water'],
    },
    {
      short: 'Six pathways', tag: 'CONCEPT', title: 'Six ways to make renewable power',
      body: ['Moving mass, heat, tidal pull, elevated water, light and chemistry. Nearly all of them spin a turbine that turns a generator.',
        'The exceptions are photovoltaic cells, which turn light directly into current, and batteries or fuel cells, which release electrons from chemical bonds.'],
      callout: { k: 'key', t: 'Only solar and wind have a resource big enough to supply the whole world. The others fill important but smaller roles.' },
      focus: ['hill', 'hw', 'pv', 'towerW', 'nacelleW', 'rotorW', 'boil', 'ct'], flows: ['f-water', 'f-hel'],
    },
    {
      short: 'Units', tag: 'CONCEPT', title: 'Kilo, mega and giga',
      body: ['Nearly everyone uses the metric SI system: metres, kilograms, seconds, amperes, joules for energy, watts for power. Prefixes jump by factors of a thousand.',
        'A rooftop system is kilowatts, a turbine megawatts, a large plant gigawatts. Beware of regional naming: a US “billion” is 10⁹ but older European usage meant 10¹².'],
      callout: { k: 'warn', t: 'Power is a rate (kW); energy is power over time (kWh). Mixing them up is the commonest mistake in energy talk.' },
      focus: ['pv', 'towerW', 'nacelleW', 'rotorW', 'grid'], flows: ['f-hel'],
    },
  ],
};
