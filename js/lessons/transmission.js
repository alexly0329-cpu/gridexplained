import { P } from '../iso.js';
import { turbine } from './wind.js';
import { house, pylon } from './common.js';

// Loss at equal power ∝ 1/V² (I = P/V, loss = I²R). Bars on a log scale relative to 11 kV.
const bar = (y, label, loss, col) => {
  const len = 12 + (Math.log10(loss) + 1) * 45;
  return `<text x="14" y="${y + 11}">${label}</text><rect x="62" y="${y}" width="${len.toFixed(1)}" height="16" fill="${col}" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${(62 + len + 6).toFixed(1)}" y="${y + 12}" style="font-size:10px;font-weight:700;fill:var(--ink)">${loss}%</text>`;
};
const loss = `${bar(44, '11 kV', 100, '#f1b3a3')}${bar(70, '110 kV', 1, '#f6d77e')}${bar(96, '345 kV', 0.1, '#a6d38b')}
  <text x="14" y="130" style="font-size:9px">same power moved, same wire</text>
  <text x="14" y="146" style="font-size:9px;font-weight:700;fill:var(--ink)">loss = I² × R   and   I = P ÷ V</text>
  <text x="14" y="162" style="font-size:8.5px">10× the volts → 1/100 the loss</text>`;

export default {
  id: 'transmission', group: 'grid', title: 'Transmission & Losses', icon: 'tower', time: 9, level: 'Intermediate',
  tagline: 'Why power travels at hundreds of thousands of volts, and what happens between the dam and your wall socket.',
  stats: [
    { id: 'dist', label: 'Distance', icon: 'mountain' }, { id: 'v', label: 'Voltage', icon: 'zap' },
    { id: 'loss', label: 'Grid losses', icon: 'gauge' }, { id: 'build', label: 'New line takes', icon: 'clock' },
  ],
  legend: [['#e8a33a', 'high-voltage line'], ['#7c63d0', 'distribution & service']],
  learn: [
    { t: 'Why power is made far from where it is used', at: 0 }, { t: 'Why higher voltage means lower loss (I²R)', at: 1 },
    { t: 'What a transformer does, and where HVDC fits', at: 2 }, { t: 'How voltage steps down to your street', at: 4 },
    { t: 'Why new lines are a bottleneck', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('plant', 0.4, 0.5, 0, 1.4, 2.4, 1.6, 'concrete', { label: { t: 'hydro plant', icon: 'droplet' } });
    s.water('plant', 0.4, 3.0, 0, 1.4, 1.5, 0.5, { k: 5 });
    turbine(s, { x: 1.3, y: 6.2, sc: 0.62, suf: 'W' });
    s.box('stepup', 2.5, 1.5, 0, 1.0, 1.0, 0.9, 'concrete', { label: { t: 'step-up transformer', icon: 'cog' }, lopt: { dy: -20 } });
    for (const x of [4.2, 5.8, 7.4]) s.raw('pylon', pylon(x, 2.0), { k: x + 5, });
    s.box('substation', 8.4, 3.1, 0, 1.4, 1.2, 0.9, 'concrete', { k: 14, label: { t: 'substation', icon: 'zap' } });
    s.cyl('pole', 6.2, 5.2, 0, 0.25, 1.4, 'concrete', { k: 12, label: { t: 'street transformer', icon: 'cog' }, lopt: { dy: -4 } });
    house(s, 'homes', 5.0, 6.3); house(s, 'homes', 7.2, 6.3, { label: { t: 'homes', icon: 'house' } });

    s.flow('f-gen', [[1.8, 1.7, 0.05], [2.5, 1.9, 0.05]], 'ac', {});
    s.flow('f-hv', [[3.5, 2.0, 0.9], [4.2, 2.0, 3.3], [7.4, 2.0, 3.3], [8.9, 3.1, 0.95]], 'hv', {});
    s.flow('f-dist', [[9.1, 4.3, 0.05], [9.1, 5.5, 0.05], [6.3, 5.5, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-svc', [[6.2, 5.5, 0.05], [6.2, 6.4, 0.05], [5.9, 6.4, 0.05]], 'ac', {});
    s.flow('f-svc2', [[6.2, 5.9, 0.05], [7.9, 5.9, 0.05], [7.9, 6.3, 0.05]], 'ac', {});
    s.flowS('f-far', [P(1.3, 6.2, 0.5), P(3.0, 3.0, 0.05)], 'electric', { cls: 'slow' });
    s.card('loss', 'SAME POWER, LESS LOSS', loss, { w: 270, h: 176, from: 1, until: 1 });
  },
  steps: [
    {
      short: 'Far away', tag: 'CONCEPT', title: 'Power is made where the resource is',
      body: ['Dams, wind farms and big power stations are built where there is water, wind, space or cooling, often hundreds of kilometres from the cities that use their output.',
        'So the first job of a grid is simply to carry power a long way without wasting it.'],
      callout: { k: 'key', t: 'Generation can be moved by building a plant somewhere else. Demand mostly cannot. The wires connect the two.' },
      focus: ['plant', 'towerW', 'nacelleW', 'rotorW'], flows: ['f-far'], stats: { dist: '≈ 300 km', v: '20 kV' },
    },
    {
      short: 'Why high volts', tag: 'METHOD', title: 'Trade amps for volts',
      body: ['Power is volts × amps. You can move a given amount of power as high voltage and low current, or low voltage and high current. The wire heats in proportion to current squared: `loss = I² × R`.',
        'So raise the voltage tenfold and the current drops tenfold, and losses drop a hundredfold.'],
      callout: { k: 'know', t: 'This is why long lines run at 115–765 kV, while the wires in your wall run at 120 or 240 V.' },
      focus: ['stepup', 'pylon'], flows: ['f-gen'],
    },
    {
      short: 'Transformers', tag: 'METHOD', title: 'A transformer, no moving parts',
      body: ['A step-up transformer raises the generator’s 20 kV to 345 kV. It works only on alternating current: a changing current in one coil induces a voltage in another with a different number of turns.',
        'For very long lines (roughly 600 km or more overland, or undersea) high-voltage direct current (HVDC) can lose less, but it needs converter stations at both ends.'],
      callout: { k: 'know', t: 'Alternating current won the early “war of the currents” largely because transformers made long-distance AC practical.' },
      focus: ['stepup', 'plant'], flows: ['f-gen', 'f-hv'], stats: { v: '345 kV' },
    },
    {
      short: 'The long haul', tag: 'NUMBERS', title: 'Hundreds of kilometres of wire',
      body: ['Transmission lines run at 115–765 kV. The higher the voltage, the more power one line can carry: a 765 kV line can carry on the order of 2 GW or more, several times what a 345 kV line can.',
        'Across the whole system, transmission plus distribution, about 5% of electricity is lost as heat in the United States.'],
      callout: { k: 'key', t: '5% sounds small, but at national scale it is the output of dozens of power stations. Every extra kilometre has a cost.' },
      focus: ['pylon', 'stepup', 'substation'], flows: ['f-hv'], stats: { loss: '≈ 5%' },
    },
    {
      short: 'Down to you', tag: 'METHOD', title: 'Stepping down in stages',
      body: ['At a substation the voltage drops to about 12 kV for local distribution lines. A transformer on a pole or pad near your home then drops it again, to 240/120 V in North America.',
        'Each stage uses the same device in reverse: fewer turns on the output coil, lower voltage out.'],
      callout: { k: 'know', t: 'Most outages start on the distribution network, such as a tree on a local line, not in the big power stations or transmission grid.' },
      focus: ['substation', 'pole', 'homes'], flows: ['f-hv', 'f-dist', 'f-svc', 'f-svc2'], stats: { v: '12 kV → 240 V' },
    },
    {
      short: 'Bottleneck', tag: 'TRADE-OFF', title: 'Wires are a limit too',
      body: ['A line can carry only so much before it overheats or sags. When cheap wind or solar in one region cannot reach demand in another, it is turned off (curtailed) while expensive local plants run.',
        'New high-voltage lines take years to plan, permit and build, often longer than the power plants that need them.'],
      callout: { k: 'warn', t: 'Adding generation without adding wires can strand clean power. Grid expansion is as important as the sources themselves.' },
      focus: ['pylon', 'plant', 'towerW', 'nacelleW', 'rotorW'], flows: ['f-hv', 'f-far', 'f-gen'], stats: { build: '5–10 yrs' },
    },
  ],
};
