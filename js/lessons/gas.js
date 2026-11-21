import { P } from '../iso.js';

const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
const puffs = (x, y, z, r = 8, n = 3) => { const [px, py] = P(x, y, z); return Array.from({ length: n }, (_, i) => `<circle class="rise" cx="${px + (i - 1) * 4}" cy="${py}" r="${r}" fill="#fff" stroke="var(--obj-edge)" stroke-width="1.6" style="animation-delay:${i * -1}s"/>`).join(''); };
const pylon = (x, y) => `<path class="ln" d="M${q([x - 0.2, y - 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y + 0.2, 0])}M${q([x - 0.2, y + 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y - 0.2, 0])}M${q([x, y - 0.6, 3.0])}L${q([x, y + 0.6, 3.0])}M${q([x, y - 0.45, 2.3])}L${q([x, y + 0.45, 2.3])}"/>`;

const eff = `
  <path class="ax" d="M20,126H190"/>
  <rect x="34" y="${126 - 38 * 1.35}" width="48" height="${38 * 1.35}" fill="#f7a35c" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="112" y="${126 - 58 * 1.35}" width="48" height="${58 * 1.35}" fill="#cfe3b2" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="112" y="${126 - 58 * 1.35}" width="48" height="${20 * 1.35}" fill="#e7ddf5" stroke="var(--obj-edge)" stroke-width="2"/>
  <text x="46" y="${126 - 38 * 1.35 - 5}" style="font-size:12px;font-weight:700;fill:var(--ink)">38%</text>
  <text x="124" y="${126 - 58 * 1.35 - 5}" style="font-size:12px;font-weight:700;fill:var(--ink)">58%</text>
  <text x="136" y="${126 - 49 * 1.35 + 4}" text-anchor="middle" style="font-size:7.5px;fill:#4b3a78">+20 steam</text>
  <text x="26" y="139">gas turbine</text><text x="124" y="139">combined</text>
  <text x="14" y="152" style="font-size:8.5px">share of fuel heat → electricity</text>`;

export default {
  id: 'gas', title: 'Natural Gas', icon: 'flame', time: 9, level: 'Intermediate',
  tagline: 'A combined-cycle plant: burn gas, spin a turbine, then squeeze the exhaust for more.',
  stats: [
    { id: 'heat', label: 'Fuel heat', icon: 'flame' }, { id: 'gt', label: 'Gas turbine', icon: 'zap' },
    { id: 'st', label: 'Steam turbine', icon: 'zap' }, { id: 'eff', label: 'Efficiency', icon: 'gauge' },
  ],
  legend: [['#2a9d8f', 'gas'], ['#d0683a', 'hot exhaust'], ['#9aa3ad', 'steam'], ['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why gas is “dispatchable”', at: 0 }, { t: 'Compress → burn → expand (the gas turbine)', at: 1 },
    { t: 'Why a simple cycle wastes most of its heat', at: 2 }, { t: 'How a second steam cycle lifts efficiency', at: 4 },
    { t: 'Why every thermal plant needs cooling', at: 5 },
  ],
  build(s) {
    s.view(40, 100, 680, 400);
    s.floor(10, 10, 'concrete');
    // gas turbine train: compressor → combustor → turbine → generator
    s.box('compressor', 0.8, 6.4, 0, 1.6, 1.5, 1.2, 'steel', { label: { t: 'compressor' }, lopt: { dy: -22 } });
    s.box('combustor', 2.4, 6.6, 0, 0.9, 1.1, 1.0, 'flame', {
      label: { t: 'combustor', icon: 'flame' }, lopt: { dy: 58 },
      extra: `<g class="flicker" style="transform-box:fill-box;transform-origin:50% 100%"><path d="M${q([2.85, 7.7, 1.0])}c-8,-6 -8,-16 0,-24c8,8 8,18 0,24z" fill="#fde3a7" stroke="var(--obj-edge)" stroke-width="1.6"/></g>`,
    });
    s.box('turbine', 3.3, 6.4, 0, 1.5, 1.5, 1.2, 'steel', { label: { t: 'gas turbine', icon: 'cog' }, lopt: { dy: -22 } });
    s.box('gen1', 4.8, 6.5, 0, 1.2, 1.3, 1.0, 'violet', { label: { t: 'generator', icon: 'zap' }, lopt: { dy: 54 } });
    // heat-recovery steam generator + stack
    s.box('hrsg', 3.6, 1.8, 0, 2.6, 2.0, 2.0, 'steel', {
      label: { t: 'heat recovery boiler', icon: 'thermo' },
      extra: [0.5, 1.0, 1.5].map((z) => `<path class="thin" d="M${q([3.6, 3.8, z])}L${q([6.2, 3.8, z])}"/>`).join('') + `<path class="thin" d="M${q([6.2, 1.8, 0.2])}L${q([6.2, 3.8, 0.2])}M${q([6.2, 1.8, 1.8])}L${q([6.2, 3.8, 1.8])}"/>`,
    });
    s.cyl('stack', 5.6, 2.3, 0, 0.32, 3.3, 'concrete', { k: 8.5, label: { t: 'stack' } });
    s.raw('stack', puffs(5.6, 2.3, 3.4), { k: 8.6 });
    // steam train
    s.box('st', 7.0, 2.0, 0, 1.5, 1.4, 1.2, 'steel', { label: { t: 'steam turbine', icon: 'cog' } });
    s.box('gen2', 8.5, 2.1, 0, 1.1, 1.2, 1.0, 'violet', { label: { t: 'generator', icon: 'zap' } });
    s.box('condenser', 7.0, 4.2, 0, 1.6, 1.2, 0.8, 'blue', { label: { t: 'condenser', icon: 'droplet' } });
    s.cooling('tower', 8.6, 6.9, 0, 0.9, 2.8, 'white', { label: { t: 'cooling tower' } });
    s.raw('tower', puffs(8.6, 6.9, 3.0, 9), { k: 15.5 });
    s.box('tf', 5.6, 8.4, 0, 1.2, 1.1, 0.9, 'concrete', { label: { t: 'transformer', icon: 'cog' } });
    s.raw('pylon', pylon(9.5, 9.3), { k: 19 });
    s.label('grid:l', 9.5, 5, 3.4, { t: 'to the grid', icon: 'tower' }, { from: 6 });

    s.flow('gasline', [[2.85, 11.2, 0.5], [2.85, 7.7, 0.5]], 'gas', { pipe: true, from: 0 });
    s.label('gasline:l', 2.85, 10.3, 0.6, { t: 'gas pipeline', icon: 'flame' }, { from: 0, dy: -4 });
    s.flow('air', [[-0.6, 7.2, 0.7], [0.8, 7.2, 0.7]], 'wind', { from: 1 });
    s.flow('heat', [[4.05, 6.4, 0.6], [4.05, 3.8, 0.6]], 'heat', { pipe: true, from: 2 });
    s.flow('steam1', [[6.2, 2.8, 0.9], [7.0, 2.8, 0.9]], 'steam', { pipe: true, from: 4 });
    s.flow('steam2', [[7.8, 3.4, 0.4], [7.8, 4.2, 0.4]], 'steam', { pipe: true, from: 5 });
    s.flow('water1', [[8.6, 4.8, 0.4], [8.9, 4.8, 0.4], [8.9, 6.0, 0.4]], 'water', { pipe: true, from: 5 });
    s.flow('water2', [[7.0, 4.8, 0.3], [5.0, 4.8, 0.3], [5.0, 3.8, 0.3]], 'water', { pipe: true, from: 5 });
    s.flow('elec1', [[5.7, 7.8, 0.05], [5.7, 8.4, 0.05]], 'electric', { from: 3 });
    s.flow('elec2', [[8.9, 3.3, 0.05], [8.9, 5.7, 0.05], [6.5, 5.7, 0.05], [6.5, 8.4, 0.05]], 'electric', { from: 4 });
    s.flow('elec3', [[6.8, 8.95, 0.05], [9.5, 8.95, 0.05]], 'hv', { from: 6 });
    s.flow('hv', [[9.5, 9.3, 0.05], [9.5, 9.3, 3.3], [9.5, 4, 3.3], [9.5, -5, 3.3]], 'hv', { from: 6 });
    s.card('eff', 'WHY COMBINE TWO CYCLES?', eff, { w: 205, h: 160, x: 14, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'Fuel', tag: 'CONCEPT', title: 'Energy stored as fuel',
      body: ['Natural gas is mostly methane (`CH₄`), delivered by pipeline under pressure. Burning it releases heat: `CH₄ + 2 O₂ → CO₂ + 2 H₂O + heat`.',
        'This plant burns enough gas to release 500 MW of heat. The question is how much of that becomes electricity.'],
      callout: { k: 'key', t: 'Fuel can be stored, so gas plants can run at any hour. That makes them “dispatchable”: operators raise or lower output on command.' },
      focus: ['gasline'], flows: ['gasline'], stats: { heat: '500 MW' },
    },
    {
      short: 'Gas turbine', tag: 'METHOD', title: 'Compress, burn, expand',
      body: ['A gas turbine is a jet engine bolted to a generator. The compressor squeezes air to roughly 15–20 times atmospheric pressure. Gas is sprayed into the combustor and burns, and the hot gas expands through the turbine blades at over 1,300 °C, spinning the shaft.',
        'Roughly half of the turbine’s work only drives the compressor. The rest turns the generator: here about 190 MW.'],
      callout: { k: 'know', t: 'Compressing the air first is what makes the burn so effective. Squeezed gas holds more energy to give back when it expands.' },
      focus: ['compressor', 'combustor', 'turbine', 'gen1'], flows: ['air', 'gasline'], stats: { gt: '190 MW' },
    },
    {
      short: 'Waste heat', tag: 'PROBLEM', title: 'Most of the heat just leaves',
      body: ['On its own, a gas turbine converts only about 35–40% of the fuel’s heat into electricity. The rest leaves as exhaust at roughly 600 °C.',
        'That is a simple-cycle “peaker” plant. It can start in minutes and cover demand spikes, but it throws away most of what it burns.'],
      callout: { k: 'warn', t: '600 °C exhaust is still a great heat source. Venting it is the single biggest loss in the plant.' },
      focus: ['turbine', 'stack'], flows: ['heat', 'air', 'gasline'], stats: { eff: '38%' },
    },
    {
      short: 'Heat recovery', tag: 'METHOD', title: 'Boil water with the exhaust',
      body: ['The exhaust passes through a heat-recovery steam generator: a box packed with tubes of water. The hot gas boils the water into high-pressure steam, and leaves the stack at about 100 °C.',
        'No extra fuel is burned. The steam is made from heat that would have been wasted.'],
      callout: { k: 'key', t: 'Combined cycle = a gas turbine on top, a steam turbine below, fed by the first one’s exhaust.' },
      focus: ['hrsg', 'turbine', 'stack', 'tf'], flows: ['heat', 'elec1', 'gasline', 'air'],
    },
    {
      short: 'Steam turbine', tag: 'METHOD', title: 'A second engine for free',
      body: ['The steam drives a second turbine and generator. That adds about 100 MW without burning another cubic metre of gas.',
        'Together the plant turns 290 of every 500 MW of heat into electricity: about 58%. The best modern plants are at 60% or a little above.'],
      callout: { k: 'know', t: 'Coal and nuclear plants only have a steam cycle, so they top out around 33–40%. Gas combined cycle beats them because the gas turbine works at a much hotter temperature.' },
      focus: ['st', 'gen2', 'hrsg'], flows: ['heat', 'steam1', 'elec1', 'elec2', 'gasline', 'air'], stats: { st: '100 MW', eff: '58%' },
    },
    {
      short: 'Cooling', tag: 'CONCEPT', title: 'Every thermal plant must dump heat',
      body: ['Steam leaving the turbine is condensed back into water so it can be pumped round again. Condensing drops the pressure, which lets the turbine pull harder.',
        'The condenser’s heat goes to a cooling tower, where some water evaporates. That white plume is steam, not smoke.'],
      callout: { k: 'key', t: 'The bigger the temperature gap between hot steam and cold water, the more work you can extract (the Carnot limit). Heat has to flow to a cold place for the engine to run.' },
      focus: ['condenser', 'tower', 'st'], flows: ['steam1', 'steam2', 'water1', 'water2', 'heat', 'gasline', 'air', 'elec1', 'elec2'],
    },
    {
      short: 'Trade-offs', tag: 'TRADE-OFF', title: 'Flexible, but it emits CO₂',
      body: ['Gas plants ramp up when the wind drops or the sun sets. In many regions that makes gas the grid’s main balancing tool.',
        'A modern combined-cycle plant emits about 0.4 kg of CO₂ per kWh at the stack, roughly half of coal. Methane leaks along the supply chain add to the climate impact.'],
      callout: { k: 'warn', t: 'Fuel is a gas plant’s biggest running cost, so electricity prices can follow the gas price.' },
      focus: ['turbine', 'stack', 'gen1', 'gen2', 'tf', 'pylon'],
      flows: ['gasline', 'air', 'heat', 'steam1', 'steam2', 'water1', 'water2', 'elec1', 'elec2', 'elec3', 'hv'],
    },
  ],
};
