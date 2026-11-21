import { P } from '../iso.js';

const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
const pylon = (x, y) => `<path class="ln" d="M${q([x - 0.2, y - 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y + 0.2, 0])}M${q([x - 0.2, y + 0.2, 0])}L${q([x, y, 3.3])}L${q([x + 0.2, y - 0.2, 0])}M${q([x, y - 0.6, 3.0])}L${q([x, y + 0.6, 3.0])}M${q([x, y - 0.45, 2.3])}L${q([x, y + 0.45, 2.3])}"/>`;
const puffs = (x, y, z, r = 10) => { const [px, py] = P(x, y, z); return [0, 1, 2].map((i) => `<circle class="rise" cx="${px + (i - 1) * 5}" cy="${py}" r="${r}" fill="#fff" stroke="var(--obj-edge)" stroke-width="1.6" style="animation-delay:${i * -1}s"/>`).join(''); };

// Reactor-core inset: fuel rods, water, control rods that slide in (--rod), neutrons bouncing through.
const fuelX = [28, 58, 88, 118, 148, 178], ctlX = [47, 107, 165];
const core = `
  <defs><clipPath id="coreclip"><rect x="14" y="30" width="176" height="112"/></clipPath></defs>
  <rect x="14" y="30" width="176" height="112" fill="#cfe4f6" stroke="var(--obj-edge)" stroke-width="2"/>
  <g clip-path="url(#coreclip)">
    ${fuelX.map((x) => `<rect x="${x}" y="42" width="12" height="94" rx="2" fill="#e3ec8f" stroke="var(--obj-edge)" stroke-width="1.6"/>`).join('')}
    <circle class="glow" cx="64" cy="92" r="13" fill="#f7a35c" opacity=".7"/><circle class="glow" cx="124" cy="70" r="13" fill="#f7a35c" opacity=".7" style="animation-delay:-.9s"/><circle class="glow" cx="94" cy="112" r="13" fill="#f7a35c" opacity=".7" style="animation-delay:-.4s"/>
    <g style="transform:translateY(var(--rod,-75px));transition:transform 1s cubic-bezier(.3,.8,.3,1)">${ctlX.map((x) => `<rect x="${x}" y="34" width="8" height="94" rx="2" fill="#4a4743" stroke="var(--obj-edge)" stroke-width="1.6"/>`).join('')}<rect x="20" y="28" width="164" height="7" fill="#8b9098" stroke="var(--obj-edge)" stroke-width="1.6"/></g>
    ${[0, 1, 2].map((i) => `<g class="travel" style="offset-path:path('M16,${78 + i * 12}C52,${52 + i * 20} 90,${112 - i * 10} 130,${72 + i * 14}S176,${96 - i * 12} 188,${70 + i * 6}');--t:${2.6 + i * 0.5}s;animation-delay:-${i * 0.9}s"><circle r="3.4" fill="#fff" stroke="var(--obj-edge)" stroke-width="1.5"/></g>`).join('')}
  </g>
  <text x="14" y="153" style="font-size:8.5px"><tspan fill="#8a8f1a" font-weight="700">▮</tspan> fuel  <tspan fill="#35322f" font-weight="700">▮</tspan> control rods  ○ neutron</text>
  <text x="14" y="165" style="font-size:8.5px">water slows neutrons and carries heat</text>`;

export default {
  id: 'nuclear', title: 'Nuclear Power', icon: 'atom', time: 11, level: 'Intermediate',
  tagline: 'Split atoms to boil water: the chain reaction, the two loops, and the layers that keep it safe.',
  stats: [
    { id: 'heat', label: 'Reactor heat', icon: 'thermo' }, { id: 'elec', label: 'Electric', icon: 'zap' },
    { id: 'eff', label: 'Efficiency', icon: 'gauge' }, { id: 'cf', label: 'Capacity factor', icon: 'clock' },
  ],
  legend: [['#d0683a', 'hot primary water'], ['#9aa3ad', 'steam'], ['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'What fission is and why it releases so much heat', at: 0 }, { t: 'How a chain reaction is held steady', at: 1 },
    { t: 'What control rods do (and decay heat)', at: 2 }, { t: 'Why there are two water loops', at: 4 },
    { t: 'Where the layers of safety come from', at: 6 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    // reactor island (pressurised-water reactor)
    s.dome('vessel', 1.6, 3.4, 0, 0.75, 2.2, 0.5, 'steel', { label: { t: 'reactor vessel', icon: 'atom' }, lopt: { dx: -40, dy: -24 },
      extra: `<ellipse class="glow" cx="${P(1.6, 4.15, 0.9)[0]}" cy="${P(1.6, 4.15, 0.9)[1]}" rx="14" ry="10" fill="#f7a35c" opacity=".8"/>` });
    s.cyl('pressurizer', 2.6, 2.0, 0, 0.35, 2.6, 'steel', { k: 8, label: { t: 'pressurizer', icon: 'gauge' }, lopt: { dx: 20, dy: -50 }, from: 3 });
    s.dome('sg', 3.7, 3.4, 0, 0.7, 2.6, 0.5, 'steel', { label: { t: 'steam generator', icon: 'cog' }, lopt: { dx: 50, dy: -24 } });
    s.cyl('pump', 2.6, 4.7, 0, 0.3, 0.7, 'blue', { k: 14, label: { t: 'pump' }, lopt: { dy: 28 } });
    s.dome('containment', 2.6, 3.3, 0, 2.15, 2.8, 1.5, 'concrete', { from: 6, cls: 'ghost', k: 30, label: { t: 'containment', icon: 'shield' }, lopt: { dy: 18 } });
    // turbine hall
    s.box('turbine', 6.2, 2.7, 0, 1.8, 1.4, 1.2, 'steel', { label: { t: 'steam turbine', icon: 'cog' } });
    s.box('gen', 8.0, 2.8, 0, 1.1, 1.2, 1.0, 'violet', { label: { t: 'generator', icon: 'zap' }, lopt: { dy: -24 } });
    s.box('condenser', 6.2, 5.0, 0, 1.8, 1.2, 0.8, 'blue', { label: { t: 'condenser', icon: 'droplet' }, lopt: { dy: 30 } });
    s.cooling('tower', 8.6, 7.3, 0, 0.9, 2.8, 'white', { label: { t: 'cooling tower' } });
    s.raw('tower', puffs(8.6, 7.3, 3.0), { k: 17 });
    s.box('tf', 8.3, 4.3, 0, 0.9, 0.9, 0.9, 'concrete', { k: 14, label: { t: 'transformer', icon: 'cog' }, lopt: { dy: 20 } });
    s.raw('pylon', pylon(9.7, 4.75), { k: 15 });

    s.flow('hot', [[2.3, 3.4, 1.9], [3.05, 3.4, 1.9], [3.05, 3.4, 0.8]], 'heat', { pipe: true, from: 3 });
    s.flow('surge', [[2.65, 3.4, 1.9], [2.65, 2.35, 1.9]], 'heat', { pipe: true, from: 3, cls: 'slow' });
    s.flow('cold', [[3.7, 4.1, 0.4], [3.7, 4.7, 0.4], [1.6, 4.7, 0.4], [1.6, 4.15, 0.4]], 'water', { pipe: true, from: 3 });
    s.flow('steam', [[3.7, 3.4, 3.2], [3.7, 3.4, 3.9], [7.1, 3.4, 3.9], [7.1, 3.4, 1.2]], 'steam', { pipe: true, from: 4 });
    s.flow('exhaust', [[7.1, 4.1, 0.5], [7.1, 5.0, 0.5]], 'steam', { pipe: true, from: 5 });
    s.flow('feed', [[6.2, 5.6, 0.3], [4.5, 5.6, 0.3], [4.5, 3.4, 0.3]], 'water', { pipe: true, from: 4 });
    s.flow('cool', [[8.0, 5.6, 0.4], [8.6, 5.6, 0.4], [8.6, 6.4, 0.4]], 'water', { pipe: true, from: 5 });
    s.flow('elec1', [[8.55, 4.0, 0.05], [8.55, 4.3, 0.05]], 'electric', { from: 5 });
    s.flow('elec2', [[9.2, 4.75, 0.05], [9.7, 4.75, 0.05]], 'hv', { from: 5 });
    s.flow('hv', [[9.7, 4.75, 0.05], [9.7, 4.75, 3.3], [9.7, -5, 3.3]], 'hv', { from: 5 });
    s.card('core', 'INSIDE THE REACTOR CORE', core, { w: 205, h: 174, from: 1, until: 2 });
  },
  steps: [
    {
      short: 'Fission', tag: 'CONCEPT', title: 'Splitting atoms releases heat',
      body: ['When a uranium-235 nucleus absorbs a neutron it splits (fission) into two lighter nuclei, releases two or three more neutrons, and gives off about 200 MeV of energy, mostly as heat.',
        'A fuel pellet the size of a fingertip holds about as much energy as a tonne of coal. This reactor makes 3,000 MW of heat.'],
      callout: { k: 'key', t: 'A nuclear plant is a very hot kettle. The reactor replaces the boiler; everything after that is a normal steam power station.' },
      focus: ['vessel'], stats: { heat: '3,000 MW' },
    },
    {
      short: 'Chain reaction', tag: 'CONCEPT', title: 'Neutrons keep it going',
      body: ['Neutrons from one fission can split other nuclei. If, on average, exactly one neutron per fission causes another fission, the reaction is steady: the reactor is “critical”.',
        'Water between the fuel rods slows the neutrons down, which makes them far more likely to split uranium-235. It also carries the heat away.'],
      callout: { k: 'know', t: 'About 0.65% of neutrons are “delayed”: they appear seconds after fission. That slight lag is what gives machines and operators time to control the reaction.' },
      focus: ['vessel'], vars: { '--rod': '-30px' },
    },
    {
      short: 'Control rods', tag: 'METHOD', title: 'Steering with neutron absorbers',
      body: ['Control rods of neutron-absorbing material slide between the fuel rods. Push them in and fewer neutrons remain, so power falls. Pull them out and power rises.',
        'In an emergency they drop in at once (a “scram”) and stop the chain reaction within seconds.'],
      callout: { k: 'warn', t: 'Stopping fission does not stop heat. Radioactive decay in the fuel still gives about 6–7% of full power at the moment of shutdown, fading over days, so cooling must continue.' },
      focus: ['vessel'], vars: { '--rod': '8px' },
    },
    {
      short: 'Primary loop', tag: 'METHOD', title: 'Hot water under pressure',
      body: ['Water flows through the core at around 155 bar, so it stays liquid at about 320 °C (at normal pressure it would boil at 100 °C). A pressurizer holds that pressure. Pumps push the hot water to the steam generator and back.',
        'This is the primary loop.'],
      callout: { k: 'key', t: 'The primary water touches the fuel, so it can become radioactive. That is why it stays in a sealed loop and never goes near the turbine.' },
      focus: ['vessel', 'pressurizer', 'pump'], flows: ['hot', 'cold', 'surge'], vars: { '--rod': '8px' },
    },
    {
      short: 'Steam generator', tag: 'METHOD', title: 'Two loops that never mix',
      body: ['In the steam generator, thousands of U-shaped tubes carry hot primary water past a separate supply of clean water. Heat crosses the tube walls and boils that secondary water into steam at around 70 bar.',
        'The steam leaves containment. The radioactive water does not.'],
      callout: { k: 'know', t: 'The secondary loop is the same steam cycle used in a coal or gas plant. Only the heat source is different.' },
      focus: ['sg', 'vessel'], flows: ['hot', 'cold', 'steam', 'feed', 'surge'], vars: { '--rod': '8px' },
    },
    {
      short: 'Turbine', tag: 'NUMBERS', title: 'Steam makes electricity',
      body: ['The steam drives a turbine and generator: about 1,000 MW of electricity from 3,000 MW of heat. Exhaust steam is condensed back to water and returned to the steam generator.',
        'Because nuclear steam is cooler than a gas turbine’s hot gas, efficiency is only about 33%. Two thirds of the heat goes out the cooling tower.'],
      callout: { k: 'key', t: 'This is the Carnot limit again: a lower hot temperature means a lower possible efficiency. Nuclear makes up for it with fuel that is a small share of the cost.' },
      focus: ['turbine', 'gen', 'condenser', 'tower', 'tf', 'pylon'], flows: ['hot', 'cold', 'steam', 'exhaust', 'feed', 'cool', 'elec1', 'elec2', 'hv'], vars: { '--rod': '8px' }, stats: { elec: '1,000 MW', eff: '33%' },
    },
    {
      short: 'Safety', tag: 'TRADE-OFF', title: 'Layers of protection, and waste',
      body: ['The design relies on defence in depth: ceramic fuel pellets, sealed metal cladding, a steel pressure vessel, then a thick steel-lined concrete containment building. Redundant cooling systems and backup power sit behind them.',
        'Used fuel is solid and small in volume. It cools in pools, then in dry casks. Permanent deep disposal is the unfinished part in most countries; Finland’s Onkalo is the most advanced.'],
      callout: { k: 'warn', t: 'Past accidents (Three Mile Island, Chernobyl, Fukushima) shaped today’s designs and rules. Risk per unit of electricity is low compared with fossil fuels, but the consequences are concentrated and long-lived.' },
      focus: ['containment', 'vessel'], flows: ['hot', 'cold', 'steam', 'feed', 'surge'], vars: { '--rod': '8px' },
    },
    {
      short: 'Always on', tag: 'CONCEPT', title: 'Built to run flat out',
      body: ['Nuclear plants have high up-front cost, very low running cost and long refuelling cycles (typically 12–24 months). They are run continuously as “baseload”.',
        'Plants in the US run at over 90% of their rated power across a year, the highest capacity factor of any source.'],
      callout: { k: 'key', t: 'Great for steady, carbon-free supply. Less suited to following fast swings in demand, which is why it pairs with hydro, storage and gas.' },
      focus: ['gen', 'tf', 'pylon'], flows: ['hot', 'cold', 'steam', 'exhaust', 'feed', 'cool', 'elec1', 'elec2', 'hv', 'surge'], vars: { '--rod': '8px' }, stats: { cf: '> 90%' },
    },
  ],
};
