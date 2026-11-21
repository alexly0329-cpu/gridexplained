import { list, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (concentrating solar power designs, thermal storage, costs and limits).
const FALL = Math.round((1 - 120 / 400) * 100);   // LCOE drop since 2010, from $400 to $120 per MWh

export default {
  id: 'csp', group: 'sources', title: 'Concentrating Solar Power', icon: 'sun', time: 9, level: 'Intermediate',
  tagline: 'Mirrors focus sunlight into heat, heat makes steam, and a tank of molten salt keeps the turbine running after dark.',
  stats: [
    { id: 'cf', label: 'Capacity factor', icon: 'gauge' }, { id: 'capex', label: 'Installed cost', icon: 'chart' },
    { id: 'lcoe', label: 'Cost per MWh', icon: 'zap' }, { id: 'dni', label: 'Sunlight needed', icon: 'sun' },
  ],
  legend: [['#d0683a', 'heat'], ['#f1b83a', 'sunlight'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'How mirrors turn sunlight into steam', at: 0 }, { t: 'The four collector designs', at: 1 },
    { t: 'How a power tower and heliostats work', at: 2 }, { t: 'Why molten-salt storage is the main advantage', at: 3 },
    { t: 'How much CSP costs have fallen', at: 4 }, { t: 'Why PV overtook it in most places', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'dirt');
    for (const [i, y] of [[1, 1.0], [2, 2.2], [3, 3.4]]) s.box('tr' + i, 0.6, y, 0, 4.4, 0.5, 0.35, 'blue', { k: 3 + i, label: i === 2 ? { t: 'trough mirrors', icon: 'sun' } : undefined });
    s.box('tb', 6.4, 1.0, 0, 2.0, 1.6, 1.1, 'steel', { label: { t: 'steam turbine', icon: 'cog' } });
    s.box('grid', 8.4, 4.0, 0, 0.9, 0.9, 0.8, 'concrete', { label: { t: 'grid', icon: 'tower' } });
    s.cyl('tower', 7.4, 7.2, 0, 0.32, 3.0, 'concrete', { from: 2, k: 24, label: { t: 'receiver tower', icon: 'flame' } });
    for (const [i, [x, y]] of [[5.4, 6.0], [5.4, 7.2], [6.2, 8.2], [6.4, 5.4], [8.4, 8.4], [8.4, 6.0]].entries()) s.box('hs' + i, x, y, 0, 0.5, 0.5, 0.3, 'blue', { from: 2, k: x + y });
    s.cyl('hot', 3.2, 7.4, 0, 0.8, 1.6, 'flame', { from: 3, k: 20, label: { t: 'hot salt', icon: 'thermo' } });
    s.cyl('cold', 1.4, 7.8, 0, 0.8, 1.6, 'blue', { from: 3, k: 21, label: { t: 'cold salt', icon: 'droplet' } });
    s.flow('f-sun', [[-0.2, 0.2, 4.2], [1.6, 2.0, 0.5]], 'light', { cls: 'slow' });
    s.flow('f-oil', [[5.0, 1.25, 0.3], [6.4, 1.8, 0.3]], 'heat', { pipe: true });
    s.flow('f-salt', [[7.4, 7.2, 3.2], [7.4, 7.2, 0.3], [4.0, 7.4, 0.3]], 'heat', { pipe: true, from: 2, cls: 'slow' });
    s.flow('f-store', [[3.2, 6.6, 0.3], [3.2, 4.8, 0.3], [6.6, 2.6, 0.3]], 'heat', { pipe: true, from: 3, cls: 'slow' });
    s.flow('f-el', [[8.4, 2.0, 0.05], [8.9, 2.0, 0.05], [8.9, 4.0, 0.05]], 'electric', {});
    s.card('what', 'FOCUS, HEAT, STEAM', list([['Mirrors track the sun', 'they aim direct sunlight at one spot'], ['A fluid absorbs heat', 'synthetic oil or molten salt'], ['Heat boils water', 'a normal steam turbine makes power']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('types', 'FOUR COLLECTOR DESIGNS', list([['Parabolic trough', 'curved mirror, oil tube, most common'], ['Linear Fresnel', 'flat strips: cheaper, less intense'], ['Power tower', 'many mirrors aim at a tower top'], ['Dish and Stirling', 'modular, many moving parts']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('tower', 'THE POWER TOWER', list([['Heliostats', 'flat mirrors on two-axis trackers'], ['Receiver on top', 'heats molten salt to a high temperature'], ['Salt flows down', 'to a ground-level steam generator']], { gap: 36 }), { w: 300, h: 150, from: 2, until: 2 });
    s.card('cf', 'CAPACITY FACTOR', bars([{ label: 'CSP, no storage', value: 40, t: '≈ 40%', color: '#f6d77e' }, { label: 'CSP, big salt tank', value: 58, t: '50–65%+', color: '#f1b3a3' }], { w: 300, labelW: 126, max: 70, fmt: (v, r) => r.t, y0: 42, h: 20, gap: 14, note: 'storage lets the turbine run after sunset' }), { w: 300, h: 140, from: 3, until: 3 });
    s.card('cost', 'COST PER MWh, THEN AND NOW', bars([{ label: 'Around 2010', value: 400, color: '#f1b3a3' }, { label: 'Today', value: 120, color: '#a6d38b' }], { w: 300, labelW: 92, max: 400, fmt: (v) => `$${v}`, y0: 42, h: 20, gap: 14, note: `down ${FALL}%; installed cost also fell by half` }), { w: 300, h: 140, from: 4, until: 4 });
    s.card('limits', 'WHY IT STAYED A NICHE', list([['Needs direct sunlight', 'cloud and haze stop it'], ['Big flat land and capital', 'about $6,000 per kW'], ['Tricky to run', 'towers and dishes need upkeep'], ['Bright flux near towers', 'a hazard for passing birds']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Concentrate', tag: 'CONCEPT', title: 'Mirrors make heat, heat makes steam',
      body: ['Concentrating solar power uses mirrors to focus direct sunlight onto a receiver. A fluid in the receiver gets hot enough to boil water, and the steam spins an ordinary turbine and generator.',
        'It makes power the way a thermal plant does, with the sun as the burner.'],
      callout: { k: 'key', t: 'CSP is a heat technology. That is its weakness (it needs clear sky) and its strength (heat is easy to store).' },
      focus: ['tr1', 'tr2', 'tr3', 'tb', 'grid'], flows: ['f-sun', 'f-oil', 'f-el'], stats: { dni: 'direct only' },
    },
    {
      short: 'Designs', tag: 'CONCEPT', title: 'Four ways to concentrate',
      body: ['Parabolic troughs dominate: curved mirrors on a north-south axis follow the sun east to west and focus on an oil-filled tube. Linear Fresnel uses flat mirror strips, cheaper and less windy but a little less efficient.',
        'Power towers use hundreds of tracking mirrors and a central receiver. Dishes put a Stirling engine at the focus: modular, but complex.'],
      callout: { k: 'know', t: 'Troughs and linear Fresnel lead new spending. Towers and dishes cost more to run.' },
      focus: ['tr1', 'tr2', 'tr3', 'tb'], flows: ['f-sun', 'f-oil'],
    },
    {
      short: 'Tower', tag: 'METHOD', title: 'A field of mirrors around a tower',
      body: ['Heliostats are flat mirrors on two-axis trackers. Each aims at a receiver on top of a tall tower, which heats molten salt. The salt runs down to a ground-level steam generator.',
        'Molten salt can run hotter than oil and can be kept in tanks, which sets up the next step.'],
      callout: { k: 'know', t: 'The point of intense light on a tower is both the efficiency and the safety problem.' },
      focus: ['tower', 'hs0', 'hs1', 'hs2', 'hs3', 'hs4', 'hs5'], flows: ['f-salt'],
    },
    {
      short: 'Storage', tag: 'CONCEPT', title: 'A battery made of salt',
      body: ['Hot salt can be kept in an insulated tank and used later. A plant with oversized mirrors and a large tank fills the tank by day and runs the turbine well into the night.',
        'That lifts capacity factor from about 40% to 50–65% or more, and heat storage is much cheaper per kWh than early batteries.'],
      callout: { k: 'key', t: 'Storage is CSP’s moat. It sells evening power that PV alone cannot.' },
      focus: ['hot', 'cold', 'tb', 'tower', 'grid'], flows: ['f-salt', 'f-store', 'f-el'], stats: { cf: '40% → 50–65%+' },
    },
    {
      short: 'Cost', tag: 'NUMBERS', title: 'Much cheaper, still dear',
      body: [`Since 2010, installed cost has more than halved to about $6,000 per kW, and the cost of power has fallen from about $400 to about $120 per MWh, a ${FALL}% drop.`,
        'It remains well above utility-scale solar PV, which fell even faster in the same years.'],
      callout: { k: 'warn', t: 'CSP competes on firm evening power, not on the lowest cost per megawatt-hour.' },
      focus: ['tb', 'grid', 'tr1', 'tr2', 'tr3'], flows: ['f-oil', 'f-el'], stats: { capex: '$6,000/kW', lcoe: '≈ $120' },
    },
    {
      short: 'Limits', tag: 'TRADE-OFF', title: 'Why PV took the lead',
      body: ['CSP needs direct sunlight, so mist and cloud hurt it badly, and it wants large flat desert sites with big up-front capital. Towers and dishes add maintenance. Intense light near a tower can harm birds.',
        'Cheap PV plus batteries now beats it in most places. CSP’s role is where long heat storage and steam turbines have value.'],
      callout: { k: 'know', t: 'A niche for now, with new capacity spending forecast mostly in troughs and linear Fresnel.' },
      focus: ['tower', 'hot', 'cold'], flows: [],
    },
  ],
};
