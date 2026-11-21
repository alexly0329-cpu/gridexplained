import { P } from '../iso.js';

const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
const pylon = (x, y) => `<path class="ln" d="M${q([x - 0.2, y - 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y + 0.2, 0])}M${q([x - 0.2, y + 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y - 0.2, 0])}M${q([x, y - 0.6, 3.0])}L${q([x, y + 0.6, 3.0])}M${q([x, y - 0.45, 2.3])}L${q([x, y + 0.45, 2.3])}"/>`;
const pipe = (d, k = 'water') => `<g class="flow on k-${k} pipe"><path class="track" d="${d}"/><path class="fill" d="${d}"/><path class="dash" d="${d}"/></g>`;
const blades = Array.from({ length: 8 }, (_, i) => `<path d="M6,0L17,0" transform="rotate(${i * 45})" stroke="var(--obj-edge)" stroke-width="3.5" stroke-linecap="round"/>`).join('');

const inside = `
  <rect x="72" y="30" width="68" height="30" rx="5" fill="#e7ddf5" stroke="var(--obj-edge)" stroke-width="2"/>
  <path d="M84,36v18M96,36v18M108,36v18M120,36v18M130,36v18" stroke="#8c7ac0" stroke-width="2.5"/>
  <rect x="102" y="60" width="8" height="38" fill="#a9adb4" stroke="var(--obj-edge)" stroke-width="2"/>
  ${pipe('M10,110H80')}
  <circle cx="106" cy="110" r="27" fill="#e4d6c4" stroke="var(--obj-edge)" stroke-width="2"/>
  <circle cx="106" cy="110" r="20" fill="#fcdcbd" stroke="var(--obj-edge)" stroke-width="2"/>
  <g transform="translate(106,110)"><g class="spin" style="--spin:1.4s">${blades}<circle r="5" fill="#a9adb4" stroke="var(--obj-edge)" stroke-width="2"/></g></g>
  ${pipe('M106,138V156H170')}
  <text x="146" y="48">generator</text><text x="116" y="84">shaft</text><text x="12" y="104">water in</text>
  <text x="134" y="128">runner</text><text x="120" y="152" style="font-size:8.5px"> </text><text x="124" y="170">water out</text>`;

export default {
  id: 'hydro', title: 'Hydroelectric', icon: 'droplet', time: 8, level: 'Beginner',
  tagline: 'Let a river fall through a turbine: stored height becomes electricity on demand.',
  stats: [
    { id: 'head', label: 'Head', icon: 'mountain' }, { id: 'flow', label: 'Flow', icon: 'waves' },
    { id: 'mw', label: 'Power', icon: 'zap' }, { id: 'cf', label: 'Capacity factor', icon: 'gauge' },
  ],
  legend: [['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why height stores energy', at: 0 }, { t: 'What a penstock and turbine do', at: 2 },
    { t: 'The power equation: P = η ρ g Q H', at: 3 }, { t: 'Where the water goes afterwards', at: 4 },
    { t: 'Why hydro can follow demand', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    // valley walls + reservoir + dam
    s.box('rock1', 0, 0, 0, 4, 0.8, 3.6, 'rock', { shadow: false });
    s.box('rock2', 0, 0.8, 0, 0.6, 7.2, 3.2, 'rock', { shadow: false });
    s.water('reservoir', 0.6, 0.8, 0, 3.4, 7.2, 2.5, { label: { t: 'reservoir', icon: 'waves' }, lopt: { dx: -40, dy: 14 } });
    s.box('rock3', 0.6, 8, 0, 4.4, 2, 3.3, 'rock', { shadow: false });
    s.box('dam', 4, 1, 0, 1, 7, 3, 'concrete', { label: { t: 'dam', icon: 'layers' }, lopt: { dx: 20, dy: -34 } });
    s.box('gate', 4.1, 4.2, 3, 0.8, 0.8, 0.6, 'steel', { k: 13.2, from: 1, label: { t: 'intake gate', icon: 'lock' } });
    s.box('spillway', 4.1, 1.6, 3, 0.8, 1.6, 0.4, 'steel', { k: 13.2, from: 4, label: { t: 'spillway' } });
    // powerhouse, river, transformer, pylon
    s.water('river', 6.6, 5.8, 0, 3.4, 1.6, 0.18, { color: 'water', shadow: false, k: 13.5 });
    s.box('powerhouse', 5.1, 3.4, 0, 1.9, 2.0, 1.3, 'white', { k: 14, from: 1, label: { t: 'powerhouse', icon: 'factory' } });
    s.box('tf', 7.5, 3.7, 0, 1.0, 1.0, 0.9, 'concrete', { k: 15, from: 5, label: { t: 'transformer', icon: 'cog' } });
    s.raw('pylon', pylon(9.3, 2.2), { from: 5, k: 16 });
    s.label('grid:l', 9.3, 2.2, 3.4, { t: 'to the grid', icon: 'tower' }, { from: 5 });

    s.flow('penstock', [[4.5, 4.6, 2.8], [5.05, 4.6, 2.8], [5.05, 4.6, 1.4], [5.9, 4.6, 1.4]], 'water', { pipe: true, from: 1 });
    s.label('penstock:l', 5.05, 4.6, 2.3, { t: 'penstock' }, { from: 1, dx: -62, dy: -6 });
    s.flow('tail', [[6.2, 5.4, 0.2], [6.2, 6.6, 0.2], [10.6, 6.6, 0.2]], 'water', { from: 4 });
    for (const [i, y] of [1.9, 2.6, 3.0].entries()) s.flow('spill' + i, [[5.05, y, 3.0], [5.05, y, 0.1]], 'water', { from: 4, cls: 'fast' });
    s.flow('elec1', [[7.0, 4.2, 0.05], [7.5, 4.2, 0.05]], 'electric', { from: 5 });
    s.flow('elec2', [[8.5, 4.2, 0.05], [9.3, 4.2, 0.05], [9.3, 2.2, 0.05]], 'electric', { from: 5 });
    s.flow('hv', [[9.3, 2.2, 0.05], [9.3, 2.2, 3.3], [9.3, -5, 3.3]], 'hv', { from: 5 });
    s.card('inside', 'INSIDE THE POWERHOUSE', inside, { w: 205, h: 182, from: 2, until: 2 });
  },
  steps: [
    {
      short: 'Height', tag: 'CONCEPT', title: 'Water on a hill is stored energy',
      body: ['Lifting a mass stores energy in it: `E = m × g × h`. A tonne of water falling 100 m releases about 1 MJ, roughly 0.27 kWh.',
        'A dam raises the river’s level behind a wall, creating a reservoir that holds enormous amounts of water at height.'],
      callout: { k: 'key', t: 'The vertical drop is called the head. More head and more water mean more power. Gravity does the work for free.' },
      focus: ['reservoir', 'dam'], stats: { head: '100 m' },
    },
    {
      short: 'Penstock', tag: 'METHOD', title: 'Gate and penstock',
      body: ['Opening the intake gate lets water enter a large pipe called the penstock. The pipe drops steeply, so the water arrives at the bottom fast and at high pressure.',
        'The gate is the throttle: more water through it means more power at the other end.'],
      callout: { k: 'know', t: 'Penstocks can be tunnels bored through rock or steel pipes several metres wide. This plant passes about 80 cubic metres of water every second.' },
      focus: ['gate', 'penstock', 'powerhouse', 'dam'], flows: ['penstock'], stats: { flow: '80 m³/s' },
    },
    {
      short: 'Turbine', tag: 'METHOD', title: 'Water spins a turbine',
      body: ['Pressurised water rushes through a spiral casing onto the blades of a turbine runner and spins it. A vertical shaft links the runner to a generator above it.',
        'Different heads call for different turbines: Pelton wheels for very high heads, Francis for medium, Kaplan for low heads and big flows.'],
      callout: { k: 'key', t: 'Same trick as wind and gas: a shaft spinning magnets past coils of wire. Here the thing turning the shaft is falling water.' },
      focus: ['powerhouse', 'penstock'], flows: ['penstock'],
    },
    {
      short: 'The equation', tag: 'NUMBERS', title: 'Power = η · ρ · g · Q · H',
      body: ['Hydraulic power is efficiency × water density (1,000 kg/m³) × gravity (9.81) × flow (Q) × head (H).',
        'With 100 m of head, 80 m³/s and 90% efficiency: `0.9 × 1000 × 9.81 × 80 × 100 ≈ 70 MW`.'],
      callout: { k: 'know', t: 'Modern hydro turbines convert 90% or more of the water’s energy to shaft power, the highest efficiency of any large generator.' },
      focus: ['powerhouse', 'reservoir', 'dam'], flows: ['penstock'], stats: { mw: '70 MW' },
    },
    {
      short: 'Tailrace', tag: 'CONCEPT', title: 'The water carries on',
      body: ['After the turbine the water leaves through the tailrace and rejoins the river. It is not used up: only its energy was taken.',
        'When the reservoir is too full, spillway gates release the excess down the face of the dam.'],
      callout: { k: 'warn', t: 'Dams reshape rivers: they trap sediment, block fish and flood the valley behind them. Fish ladders and minimum-flow rules reduce these effects but do not remove them.' },
      focus: ['river', 'spillway', 'dam', 'powerhouse'], flows: ['penstock', 'tail', 'spill0', 'spill1', 'spill2'],
    },
    {
      short: 'On demand', tag: 'CONCEPT', title: 'Dispatchable and fast',
      body: ['A hydro plant can go from stopped to full power in minutes, and change output within seconds, just by moving the gates. The reservoir is a battery that already exists.',
        'Hydro supplies roughly 15% of the world’s electricity. Over a year a plant averages around 40% of its rated power, depending on rainfall and how it is run.'],
      callout: { k: 'key', t: 'In a dry year the reservoir runs low and output falls. Hydro depends on rain and snowmelt, so water is managed like a budget.' },
      flows: ['penstock', 'tail', 'elec1', 'elec2', 'hv'], stats: { cf: '≈ 40%' },
    },
  ],
};
