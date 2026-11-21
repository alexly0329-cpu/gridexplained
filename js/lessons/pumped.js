import { P } from '../iso.js';

const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
const pylon = (x, y) => `<path class="ln" d="M${q([x - 0.2, y - 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y + 0.2, 0])}M${q([x - 0.2, y + 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y - 0.2, 0])}M${q([x, y - 0.6, 3.0])}L${q([x, y + 0.6, 3.0])}M${q([x, y - 0.45, 2.3])}L${q([x, y + 0.45, 2.3])}"/>`;

const PEN = [[4.6, 2.65, 3.25], [5.05, 2.65, 3.25], [5.05, 2.65, 1.25], [5.6, 2.65, 1.25]];
const TAIL = [[6.1, 3.5, 0.3], [6.1, 5.3, 0.3]];
const ELEC = [[7.1, 2.65, 0.05], [7.7, 2.65, 0.05]];
const ELEC2 = [[8.7, 2.65, 0.05], [9.4, 2.65, 0.05], [9.4, 2.65, 0.05]];
const HV = [[9.4, 2.65, 0.05], [9.4, 2.65, 3.3], [9.4, -5, 3.3]];
const rev = (a) => a.slice().reverse();

const rt = `
  <path class="ax" d="M20,132H190"/>
  <rect x="34" y="62" width="50" height="70" fill="#cfe4f6" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="116" y="77.4" width="50" height="54.6" fill="#cfe3b2" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="116" y="62" width="50" height="15.4" fill="#f6cfc7" stroke="var(--obj-edge)" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="59" y="102" text-anchor="middle" style="font-size:13px;font-weight:700;fill:#172720">100</text>
  <text x="141" y="110" text-anchor="middle" style="font-size:13px;font-weight:700;fill:#172720">≈ 78</text>
  <text x="141" y="73" text-anchor="middle" style="font-size:8px;fill:#7d241d">lost ≈ 22</text>
  <text x="34" y="146">pumped in</text><text x="112" y="146">sent back</text>
  <text x="14" y="160" style="font-size:8.5px">relative energy per cycle</text>`;

export default {
  id: 'pumped', title: 'Pumped Storage', icon: 'battery', time: 8, level: 'Intermediate',
  tagline: 'The world’s biggest battery is two lakes and a hill: pump up when power is cheap, release when it is scarce.',
  stats: [
    { id: 'mode', label: 'Mode', icon: 'cog' }, { id: 'mw', label: 'Power', icon: 'zap' },
    { id: 'gwh', label: 'Stored', icon: 'battery' }, { id: 'rt', label: 'Round trip', icon: 'gauge' },
  ],
  legend: [['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'How two reservoirs act as a battery', at: 0 }, { t: 'Pump mode vs generate mode', at: 3 },
    { t: 'How much energy a mountain lake holds', at: 2 }, { t: 'Round-trip efficiency', at: 4 },
    { t: 'What storage does for a grid full of wind and solar', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('plateau', 0.3, 0.3, 0, 4.7, 4.7, 3, 'rock', { shadow: false });
    // upper reservoir: three crossfaded levels
    s.water('upper', 0.7, 0.7, 3, 3.9, 3.9, 0.6, { from: 1, until: 2, shadow: false, k: 10.5 });
    s.water('upper', 0.7, 0.7, 3, 3.9, 3.9, 0.35, { from: 0, until: 0, shadow: false, k: 10.5 });
    s.water('upper', 0.7, 0.7, 3, 3.9, 3.9, 0.35, { from: 4, until: 9, shadow: false, k: 10.5 });
    s.water('upper', 0.7, 0.7, 3, 3.9, 3.9, 0.1, { from: 3, until: 3, shadow: false, k: 10.5 });
    s.label('upper:l', 2.65, 2.65, 3.4, { t: 'upper reservoir', icon: 'mountain' }, {});
    // lower reservoir
    s.water('lower', 5.4, 5.4, 0, 4.3, 4.3, 0.1, { from: 1, until: 2, shadow: false, k: 10 });
    s.water('lower', 5.4, 5.4, 0, 4.3, 4.3, 0.3, { from: 0, until: 0, shadow: false, k: 10 });
    s.water('lower', 5.4, 5.4, 0, 4.3, 4.3, 0.3, { from: 4, until: 9, shadow: false, k: 10 });
    s.water('lower', 5.4, 5.4, 0, 4.3, 4.3, 0.55, { from: 3, until: 3, shadow: false, k: 10 });
    s.label('lower:l', 7.55, 7.55, 0.6, { t: 'lower reservoir', icon: 'waves' }, {});
    s.box('powerhouse', 5.3, 1.8, 0, 1.8, 1.7, 1.2, 'white', { k: 12, label: { t: 'pump-turbine', icon: 'cog' }, lopt: { dx: -34, dy: -34 } });
    s.box('tf', 7.7, 2.15, 0, 1.0, 1.0, 0.9, 'concrete', { k: 13, from: 5, label: { t: 'transformer', icon: 'cog' } });
    s.raw('pylon', pylon(9.4, 2.65), { from: 5, k: 14 });
    s.label('grid:l', 9.4, 2.65, 3.4, { t: 'grid', icon: 'tower' }, { from: 1 });

    // pump mode: water + power go uphill; generate mode: both come down
    s.flow('penUp', rev(PEN), 'water', { pipe: true, from: 1, until: 2 });
    s.flow('penDown', PEN, 'water', { pipe: true, from: 3 });
    s.flow('tailUp', rev(TAIL), 'water', { pipe: true, from: 1, until: 2 });
    s.flow('tailDown', TAIL, 'water', { pipe: true, from: 3 });
    s.flow('elecIn', rev(ELEC), 'electric', { from: 1, until: 2 }); s.flow('elecIn2', rev(ELEC2), 'electric', { from: 1, until: 2 });
    s.flow('hvIn', rev(HV), 'hv', { from: 1, until: 2 });
    s.flow('elecOut', ELEC, 'electric', { from: 3 }); s.flow('elecOut2', ELEC2, 'electric', { from: 3 });
    s.flow('hvOut', HV, 'hv', { from: 3 });
    s.card('rt', 'ROUND-TRIP EFFICIENCY', rt, { w: 205, h: 164, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'Two lakes', tag: 'CONCEPT', title: 'A giant water battery',
      body: ['Pumped storage uses two reservoirs at different heights. When the grid has too much electricity, water is pumped uphill. When it needs more, the water runs back down through a turbine.',
        'It stores energy as height, the same energy that makes hydro work, but you can refill it.'],
      callout: { k: 'key', t: 'Nothing is generated here. The plant moves electricity through time: from when it is plentiful to when it is scarce.' },
      focus: ['upper', 'lower', 'plateau'], stats: { mode: 'Idle' },
    },
    {
      short: 'Pump', tag: 'METHOD', title: 'Surplus power lifts water',
      body: ['On a windy night or a sunny midday there is more power than the grid needs, and prices fall. The same machine that generates now runs as a motor and pump, lifting water into the upper reservoir.',
        'Electricity goes in from the grid; water level rises on the hill.'],
      callout: { k: 'know', t: 'Many plants use a single reversible pump-turbine, so one machine does both jobs by spinning in opposite directions.' },
      focus: ['powerhouse', 'upper', 'lower'], flows: ['penUp', 'tailUp', 'elecIn', 'elecIn2', 'hvIn'], stats: { mode: 'Pumping', mw: '−300 MW' },
    },
    {
      short: 'Energy held', tag: 'NUMBERS', title: 'Height × volume',
      body: ['Stored energy is `m × g × h`. Take 5 million m³ of water (5×10⁹ kg) sitting 300 m above the turbines: `5×10⁹ × 9.81 × 300 ≈ 1.5×10¹³ J`, about 4 GWh.',
        'At 1,000 MW, that would run for roughly four hours.'],
      callout: { k: 'key', t: 'Power and capacity are independent. Bigger pipes and machines give more megawatts; a bigger reservoir or higher hill gives more hours.' },
      focus: ['upper', 'plateau'], stats: { gwh: '≈ 4 GWh' },
    },
    {
      short: 'Generate', tag: 'METHOD', title: 'Peak demand: release the water',
      body: ['In the evening demand peaks and prices rise. Gates open, water falls through the pump-turbine, and the machine runs the other way as a turbine and generator.',
        'Output can rise from standby to full power within minutes.'],
      callout: { k: 'know', t: 'Same pipes, same machine, opposite direction. Compare this with a river dam, which can only generate when water is flowing down.' },
      focus: ['powerhouse', 'upper', 'lower'], flows: ['penDown', 'tailDown', 'elecOut', 'elecOut2', 'hvOut'], stats: { mode: 'Generating', mw: '+300 MW' },
    },
    {
      short: 'Round trip', tag: 'TRADE-OFF', title: 'You get back less than you put in',
      body: ['Friction, turbulence and machine losses happen on both the way up and the way down. A good plant returns roughly 75–80% of the electricity it consumed.',
        'It earns its keep by buying cheap surplus power and selling at the evening peak.'],
      callout: { k: 'warn', t: 'A storage plant is a net consumer of energy. It only pays off when the price gap between peak and off-peak is bigger than the loss.' },
      stats: { mode: 'Idle', mw: '—', rt: '≈ 78%' },
    },
    {
      short: 'On the grid', tag: 'CONCEPT', title: 'What it does for the grid',
      body: ['It soaks up surplus wind and solar, supplies power at peaks, and its big spinning machines help hold the grid’s frequency steady.',
        'The catch is geography and time: it needs a hill, water and a second site, and a plant takes years to build.'],
      callout: { k: 'key', t: 'It is the grid’s oldest and biggest battery, but it needs mountains and a decade of planning. Chemical batteries are the quick-to-build answer.' },
      focus: ['powerhouse', 'tf', 'pylon', 'grid'], flows: [],
    },
  ],
};
