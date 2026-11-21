import { panel } from './solar.js';
import { house } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (solar radiation, PV science, cell types, scaling, system components, applications, yield engineering).
// The worked yield figures are computed here from the stated sun hours, derate factor and degradation rates.
const KW = 5, SUN = 5, DER = 0.76;
const DAILY = KW * SUN, REAL = +(DAILY * DER).toFixed(1), YEAR = Math.round(REAL * 365);
const Y25 = (d) => +(((1 - d) ** 24) * 100).toFixed(1);
const MOD = [60, 72].map((n) => ({ n, v: Math.round(n * 0.58) }));

const pn = `<g stroke="#e8a33a" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M56,26q4,6 0,12t0,12"/><path d="M90,26q4,6 0,12t0,12"/><path d="M124,26q4,6 0,12t0,12"/></g>
  <text x="142" y="40" style="font-size:8.5px">light</text>
  <rect x="40" y="56" width="140" height="20" fill="#9fcdf0" stroke="var(--obj-edge)" stroke-width="1.8"/><text x="46" y="70" style="font-size:8.5px;fill:#172720">n-type: extra electrons</text>
  <rect x="40" y="76" width="140" height="38" fill="#fcdcbd" stroke="var(--obj-edge)" stroke-width="1.8"/><text x="46" y="98" style="font-size:8.5px;fill:#172720">p-type: electron holes</text>
  <path d="M180,66H236V108H180" fill="none" stroke="#e8a33a" stroke-width="2.4"/><circle cx="236" cy="87" r="9" fill="#fde3a7" stroke="var(--obj-edge)" stroke-width="1.8"/>
  <text x="196" y="60" style="font-size:8.5px">current</text>
  <text x="12" y="134" style="font-size:8.5px">0.5–0.6 V per cell; light beyond 1,100 nm passes through</text>`;

export default {
  id: 'pveng', group: 'deep', title: 'Solar PV Engineering', icon: 'sun', time: 13, level: 'Intermediate',
  tagline: 'How a cell turns light into current, how cells become power stations, and why panels deliver less than their label.',
  stats: [
    { id: 'ins', label: 'Sunlight', icon: 'sun' }, { id: 'eff', label: 'Cell efficiency', icon: 'gauge' },
    { id: 'der', label: 'Derate', icon: 'chart' }, { id: 'kwh', label: 'Yearly output', icon: 'zap' },
  ],
  legend: [['#e8a33a', 'DC'], ['#7c63d0', 'AC']],
  learn: [
    { t: 'What “peak sun hours” measures', at: 0 }, { t: 'How a p-n junction makes current', at: 1 },
    { t: 'How the three cell types compare', at: 2 }, { t: 'How series and parallel wiring scale cells up', at: 3 },
    { t: 'The three system layouts', at: 4 }, { t: 'Why trackers help and shade hurts', at: 5 },
    { t: 'Why a panel delivers about 76% of its label', at: 6 }, { t: 'How far PV scales, and what it costs to run', at: 7 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.raw('array', panel(0.6, 0.6, 1.8, 1.4) + panel(2.7, 0.6, 1.8, 1.4) + panel(4.8, 0.6, 1.8, 1.4), { k: 8 });
    s.label('array:l', 1.6, 1.4, 1.8, { t: 'array', icon: 'sun' }, {});
    s.box('inv', 3.3, 3.4, 0, 0.9, 0.9, 0.7, 'white', { label: { t: 'inverter', icon: 'zap' } });
    house(s, 'home', 6.6, 4.8, { label: { t: 'home', icon: 'house' } });
    s.box('grid', 8.2, 2.4, 0, 0.9, 0.9, 0.8, 'concrete', { from: 4, label: { t: 'grid', icon: 'tower' } });
    s.box('bat', 0.8, 4.6, 0, 1.4, 1.0, 0.8, 'green', { from: 4, label: { t: 'battery', icon: 'battery' } });
    s.flow('f-dc', [[3.7, 2.0, 0.3], [3.75, 3.4, 0.05]], 'dc', {});
    s.flow('f-ac', [[4.2, 3.9, 0.05], [7.2, 3.9, 0.05], [7.2, 4.8, 0.05]], 'ac', {});
    s.flow('f-grid', [[7.2, 3.9, 0.05], [8.65, 3.9, 0.05], [8.65, 3.3, 0.05]], 'ac', { from: 4, cls: 'slow' });
    s.flow('f-bat', [[2.2, 5.1, 0.05], [3.75, 5.1, 0.05], [3.75, 4.3, 0.05]], 'dc', { from: 4, cls: 'slow' });
    s.card('sun', 'SUNLIGHT PER DAY (kWh/m²)', bars([{ label: 'Polar regions', value: 1, color: '#d9d1c4' }, { label: 'Mild climates', value: 4, color: '#f6d77e' }, { label: 'Desert belts', value: 7, color: '#fcdcbd' }], { w: 300, labelW: 98, max: 8, fmt: (v) => `${v}`, y0: 40, h: 20, gap: 14, note: 'about 30% is reflected before it reaches the ground' }), { w: 300, h: 160, from: 0, until: 0 });
    s.card('pn', 'INSIDE A SILICON CELL', pn, { w: 300, h: 146, from: 1, until: 1 });
    s.card('types', 'THREE CELL TYPES', bars([{ label: 'Monocrystalline', value: 22.5, t: '20–25%', color: '#a6d38b' }, { label: 'Polycrystalline', value: 17.5, t: '15–20%', color: '#f6d77e' }, { label: 'Thin film', value: 12.5, t: '10–15%', color: '#fcdcbd' }], { w: 300, labelW: 104, max: 25, fmt: (v, r) => r.t, y0: 40, h: 20, gap: 14, note: 'commercial module efficiency' }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('scale', 'FROM ONE CELL TO A STATION', table(['Level', 'Typical size'], [['Cell', '0.58 V, a few watts'], ['Module', `${MOD[0].n} cells ≈ ${MOD[0].v} V, 300–400 W`], ['Array', '10–40 modules, 2–10 kW'], ['Station', 'tens to hundreds of MW']], { cols: [12, 80], rowH: 26 }), { w: 300, h: 160, from: 3, until: 3 });
    s.card('sys', 'THREE SYSTEM LAYOUTS', list([['Grid-tied', 'the grid is a virtual battery'], ['Off-grid', 'charge controller, batteries, inverter'], ['Hybrid', 'solar fills the battery, then exports']], { gap: 36 }), { w: 300, h: 150, from: 4, until: 4 });
    s.card('track', 'POINTING AND SHADING', list([['Fixed tilt', 'face the equator, tilt near latitude'], ['Single-axis tracker', '+20–40% yield, the utility standard'], ['Dual-axis tracker', 'a little more, with more to break'], ['Shade on one cell', 'cuts the whole string: use diodes']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
    s.card('yield', `WHAT A ${KW} kW ARRAY DELIVERS`, bars([{ label: 'Nameplate × sun', value: DAILY, color: '#cfc0e8' }, { label: 'After 76% derate', value: REAL, color: '#a6d38b' }], { w: 300, labelW: 112, max: DAILY * 1.4, fmt: (v) => `${v} kWh/day`, y0: 42, h: 20, gap: 14, note: `${SUN} sun hours a day; about ${YEAR.toLocaleString('en-US')} kWh a year` }), { w: 300, h: 140, from: 6, until: 6 });
    s.card('range', 'NINE ORDERS OF SIZE', list([['Milliwatts', 'calculators and watches'], ['Kilowatts', 'rooftops, pumps, remote huts'], ['Megawatts', 'factories and campuses'], ['Gigawatts', 'Bhadla, India: 2.2 GW']], { gap: 33 }), { w: 300, h: 170, from: 7, until: 7 });
  },
  steps: [
    {
      short: 'Sunlight', tag: 'CONCEPT', title: 'Counting sunshine',
      body: ['About 70% of incoming sunlight reaches the surface. Engineers measure it as insolation: kilowatt-hours per square metre per day, or “peak sun hours”.',
        'It runs from about 1 near the poles to about 7 in desert belts. Latitude, season, altitude, clouds and nearby hills all change it.'],
      callout: { k: 'know', t: 'Note the spelling: insolation, not insulation. It is the energy that arrives, not a barrier against heat.' },
      focus: ['array'], flows: ['f-dc'], stats: { ins: '1 – 7 kWh/m²' },
    },
    {
      short: 'The cell', tag: 'CONCEPT', title: 'A junction that pushes electrons',
      body: ['A silicon cell joins n-type silicon (doped with phosphorus, extra electrons) to p-type (doped with boron, electron holes). Where they meet, an electric field forms.',
        'A photon with enough energy knocks an electron free, and the field drives it round the outside circuit. No moving parts. Light with wavelengths beyond about 1,100 nm lacks the energy and passes through as heat.'],
      callout: { k: 'key', t: 'A cell makes DC at roughly 0.58 V and a few watts. Real panels join many cells.' },
      focus: ['array', 'inv'], flows: ['f-dc'], stats: { eff: '10–25%' },
    },
    {
      short: 'Cell types', tag: 'CONCEPT', title: 'Crystal, cast or coated',
      body: ['Monocrystalline cells are cut from one crystal: the most efficient (20–25%) and uniformly dark. Polycrystalline cells come from a cast block of many crystals: cheaper, 15–20%, and speckled blue.',
        'Thin film is vapour-deposited on glass or plastic, about 20 times thinner than a silicon wafer: lowest cost, 10–15% for older types, with cadmium telluride modules now near 18–19%.'],
      callout: { k: 'know', t: 'Over fifty years, efficiency of every type has crept up, and costs have fallen at the same time.' },
      focus: ['array'], flows: ['f-dc'], stats: { eff: '12–25%' },
    },
    {
      short: 'Scaling', tag: 'METHOD', title: 'Series adds volts, parallel adds amps',
      body: [`Wire cells in series and their voltages add: a ${MOD[0].n}-cell home module reaches about ${MOD[0].v} V, a ${MOD[1].n}-cell commercial one about ${MOD[1].v} V. Wire strings in parallel and their currents add.`,
        'A module is cells under tempered glass in an aluminium frame. Ten to forty modules make a 2–10 kW home array. Hundreds of MW make a utility station using exactly the same parts.'],
      callout: { k: 'key', t: 'Unlike a turbine or reactor, PV needs no redesign to grow. Add modules.' },
      focus: ['array', 'inv'], flows: ['f-dc', 'f-ac'],
    },
    {
      short: 'Systems', tag: 'CONCEPT', title: 'Grid-tied, off-grid or hybrid',
      body: ['Every system has modules, switches, an inverter that makes grid-ready AC, and a meter. A grid-tied system sends surplus to the utility and draws at night. Off-grid adds a charge controller and batteries sized for cloudy days.',
        'A hybrid charges the battery first, powers the home, exports when the battery is full, and falls back on the grid if the battery runs out.'],
      callout: { k: 'know', t: 'The inverter is one of the costliest and most critical parts. Panels often outlast it.' },
      focus: ['array', 'inv', 'bat', 'grid', 'home'], flows: ['f-dc', 'f-ac', 'f-grid', 'f-bat'],
    },
    {
      short: 'Tracking', tag: 'METHOD', title: 'Aim well, avoid shade',
      body: ['Fixed panels face the equator at a tilt close to the site’s latitude. A single-axis tracker follows the sun east to west and adds 20–40%. Dual-axis adds only a little more, with more moving parts to fail, so single-axis is the utility standard.',
        'Cells in a string are in series, so shade on one cell throttles the whole string. Row spacing, bypass diodes and microinverters limit the damage.'],
      callout: { k: 'warn', t: 'Heat hurts too: output falls about 1% for every 2 °C of cell warming, so racks need airflow.' },
      focus: ['array'], flows: ['f-dc'],
    },
    {
      short: 'Real yield', tag: 'NUMBERS', title: 'Nameplate watts are not delivered watts',
      body: [`Panels are rated at 25 °C and 1,000 W/m². After inverter losses, wiring, dust and mismatch, a typical system keeps about 76%. A ${KW} kW array with ${SUN} sun hours gives ${DAILY} kWh a day on paper and ${REAL} in practice, about ${YEAR.toLocaleString('en-US')} kWh a year.`,
        `Output also fades. Monocrystalline silicon loses about 0.36% a year, leaving ${Y25(0.0036)}% by year 25. Thin-film types lose up to 1% a year, leaving ${Y25(0.01)}%.`],
      callout: { k: 'key', t: 'Lenders size loans on the derated, degraded figure, not the label.' },
      focus: ['array', 'inv', 'home'], flows: ['f-dc', 'f-ac'], stats: { der: '≈ 76%', kwh: `${YEAR.toLocaleString('en-US')} kWh` },
    },
    {
      short: 'Any size', tag: 'CONCEPT', title: 'From watches to gigawatts',
      body: ['Solar PV began in 1839 with Becquerel, became a practical silicon cell at Bell Labs in 1954, and first paid its way powering satellites. Because it has no fuel and no moving parts, it works at every scale, from calculators to multi-gigawatt parks.',
        'Running costs are small: about 0.5–1% of the up-front cost a year for washing, inspection and keeping weeds off the lowest cells. Design life is 25 years or more.'],
      callout: { k: 'know', t: 'The same cell serves a remote research hut and a 2.2 GW desert park. That scalability is why solar grew so fast.' },
      focus: ['array', 'inv', 'home', 'grid'], flows: ['f-dc', 'f-ac', 'f-grid'],
    },
  ],
};
