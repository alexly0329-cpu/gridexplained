import { list, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (geothermal resource, hydrothermal and enhanced systems, economics and risks).
// Plant-size cost is computed here from the stated $4,500 per kW.
const CAPEX = 4500, MW = 50, TOTAL = (CAPEX * MW * 1000) / 1e6;   // $M for a 50 MW plant

export default {
  id: 'geothermal', group: 'sources', title: 'Geothermal Power', icon: 'thermo', time: 9, level: 'Beginner',
  tagline: 'Tap Earth’s own heat for steady, round-the-clock power: how wells and steam turbines work, and why drilling is the risk.',
  stats: [
    { id: 'cf', label: 'Capacity factor', icon: 'gauge' }, { id: 'capex', label: 'Installed cost', icon: 'chart' },
    { id: 'lcoe', label: 'Cost per MWh', icon: 'zap' }, { id: 'gw', label: 'World capacity', icon: 'layers' },
  ],
  legend: [['#9aa3ad', 'steam'], ['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Where the heat comes from and where it is close to the surface', at: 0 }, { t: 'How wells, steam and reinjection form a loop', at: 1 },
    { t: 'How hot dry rock is turned into a reservoir', at: 2 }, { t: 'Why capacity factor is so high', at: 3 },
    { t: 'What makes geothermal risky and limited', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'dirt');
    s.poly('hot', [[4.6, 1.0, 0.02], [9.2, 1.0, 0.02], [9.2, 5.2, 0.02], [4.6, 5.2, 0.02]], 'red', { k: -5 });
    s.label('hot:l', 6.9, 3.1, 0.1, { t: 'hot rock below', icon: 'flame' }, { dy: -4 });
    s.box('wp', 5.3, 3.0, 0, 0.35, 0.35, 1.2, 'dark', { k: 9, label: { t: 'production well', icon: 'thermo' }, lopt: { dy: -10 } });
    s.box('wi', 8.2, 3.0, 0, 0.35, 0.35, 1.2, 'navy', { k: 9, label: { t: 'injection well', icon: 'droplet' }, lopt: { dy: -10 } });
    s.box('hall', 0.6, 5.8, 0, 2.2, 1.6, 1.1, 'steel', { label: { t: 'steam turbine', icon: 'cog' } });
    s.cooling('ct', 4.4, 7.6, 0, 0.8, 1.8, 'white', { k: 24 });
    s.box('grid', 0.6, 2.6, 0, 0.9, 0.9, 0.8, 'concrete', { label: { t: 'grid', icon: 'tower' } });
    s.line('frac', [[5.6, 3.3, 0.06], [6.2, 2.3, 0.06], [6.8, 4.1, 0.06], [7.4, 2.5, 0.06], [8.0, 3.3, 0.06]], { from: 2, until: 2, k: -4 });
    s.flow('f-prod', [[5.45, 3.15, 0.1], [5.45, 3.15, 1.3], [2.6, 5.8, 1.3]], 'steam', { pipe: true, from: 1 });
    s.flow('f-inj', [[3.0, 7.0, 1.3], [8.4, 7.0, 1.3], [8.4, 3.15, 1.3], [8.4, 3.15, 0.1]], 'water', { pipe: true, from: 1, cls: 'slow' });
    s.flow('f-el', [[1.5, 5.8, 0.05], [1.5, 3.5, 0.05]], 'electric', { from: 1 });
    s.card('where', 'WHERE THE HEAT IS NEAR', list([['Ring of Fire', 'East Asia, Indonesia, the Americas’ west coast'], ['Mid-Atlantic Ridge', 'Iceland and the ocean floor'], ['East African Rift', 'Kenya and neighbours'], ['Surface hints', 'hot springs, geysers, steam vents']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('loop', 'THE STEAM LOOP', list([['Drill a production well', 'into hot water or steam'], ['Steam spins the turbine', 'hot brine flashes at the surface'], ['Cool, then reinject', 'keeps the reservoir pressured'], ['Repeat all day', 'no fuel to burn']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('egs', 'ENHANCED GEOTHERMAL (EGS)', list([['Drill into hot dry rock', 'it has heat but no water path'], ['Pump water in at pressure', 'cracks open a fracture network'], ['Water heats as it circulates', 'then flashes to steam above']], { gap: 36 }), { w: 300, h: 150, from: 2, until: 2 });
    s.card('cf', 'CAPACITY FACTOR', bars([{ label: 'Geothermal', value: 85, color: '#f1b3a3' }, { label: 'Biomass', value: 75, color: '#a6d38b' }, { label: 'Onshore wind', value: 42, color: '#9fcdf0' }, { label: 'Solar thermal', value: 40, color: '#f6d77e' }], { w: 300, labelW: 94, max: 100, fmt: (v) => `${v}%`, y0: 36, h: 16, gap: 10, note: 'share of the year at full output, typical' }), { w: 300, h: 164, from: 3, until: 3 });
    s.card('risk', 'WHAT CAN GO WRONG', list([['Dry holes', 'drilling before the resource is proven'], ['Geography', 'hydrothermal needs the right geology'], ['Small tremors', 'from injecting or fracturing'], ['Gases and depletion', 'H₂S to clean; reservoirs can cool']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'Earth’s heat', tag: 'CONCEPT', title: 'Heat conducted up from the core',
      body: ['Earth’s interior is hot, and heat flows steadily outward. Near tectonic plate edges it comes close to the surface: around the Pacific Ring of Fire, along the Mid-Atlantic Ridge, in the Mediterranean and in the East African Rift.',
        'Hot springs, geysers and steam vents show where. Power plants drill to the same heat.'],
      callout: { k: 'know', t: 'This heat is separate from sunlight. It is only about 0.02% of Earth’s new energy, so geothermal is a local resource, not a world-sized one.' },
      focus: ['hot', 'grid'], flows: [], stats: { gw: '15.6 GW' },
    },
    {
      short: 'Wells & steam', tag: 'METHOD', title: 'A loop of wells and a steam turbine',
      body: ['A production well taps hot water or steam trapped in rock. At the surface the pressure drops, the water flashes to steam, and the steam spins a turbine and generator just as in a gas or nuclear plant.',
        'The cooled water goes back down an injection well, keeping the reservoir topped up and under pressure.'],
      callout: { k: 'key', t: 'The hardware is a standard steam-turbine cycle. What is special is the fuel: heat that is already there.' },
      focus: ['wp', 'wi', 'hall', 'ct', 'grid', 'hot'], flows: ['f-prod', 'f-inj', 'f-el'],
    },
    {
      short: 'Hot dry rock', tag: 'METHOD', title: 'Making a reservoir where there is none',
      body: ['Many places have hot rock but no natural steam. Enhanced geothermal systems drill deep into hot, dry rock and inject water at high pressure to crack it into a network of fractures.',
        'Water then circulates through the cracks, heats up, and returns as steam. The method is pushing geothermal beyond plate boundaries.'],
      callout: { k: 'know', t: 'It borrows drilling techniques from oil and gas, which is also where its cost and risk come from.' },
      focus: ['wp', 'wi', 'hot'], flows: ['f-prod', 'f-inj'],
    },
    {
      short: 'Numbers', tag: 'NUMBERS', title: 'The most steady renewable',
      body: [`Geothermal plants run at about 85% capacity factor, the highest of any renewable and close to nuclear and combined-cycle gas. With no fuel to buy, the average cost is about $60 per MWh.`,
        `The catch is the up-front cost, around $${CAPEX.toLocaleString('en-US')} per kW, which is largely drilling. A ${MW} MW plant at that price costs about $${TOTAL.toFixed(0)} million. World capacity is near 15.6 GW, led by Indonesia, the United States, Kenya and Germany.`],
      callout: { k: 'key', t: 'High capital cost spread over very many hours is what keeps the price per MWh low.' },
      focus: ['hall', 'ct', 'grid'], flows: ['f-prod', 'f-inj', 'f-el'], stats: { cf: '≈ 85%', capex: `$${CAPEX.toLocaleString('en-US')}/kW`, lcoe: '≈ $60' },
    },
    {
      short: 'Risks', tag: 'TRADE-OFF', title: 'Why it is not everywhere',
      body: ['Developers must drill before they know what is down there, and a dry hole is a large cost. Conventional plants need the right geology. Injecting and fracturing can cause small tremors.',
        'Fluids carry dissolved gases such as hydrogen sulfide that must be scrubbed, and a reservoir can cool if reinjection is badly managed.'],
      callout: { k: 'warn', t: 'Geothermal gives 24/7 power with a small land footprint, but only where the geology, and the drilling money, line up.' },
      focus: ['wp', 'wi', 'hot'], flows: [],
    },
  ],
};
