import { P } from '../iso.js';

const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// One tilted panel: low edge faces the viewer. Returns svg for legs + glass + cell grid.
export function panel(x, y, w, d) {
  const A = [x, y + d, 0.4], B = [x + w, y + d, 0.4], C = [x + w, y, 1.7], D = [x, y, 1.7];
  let g = '';
  for (let i = 1; i < 4; i++) g += `M${q(lerp(A, B, i / 4))}L${q(lerp(D, C, i / 4))}`;
  for (let j = 1; j < 3; j++) g += `M${q(lerp(A, D, j / 3))}L${q(lerp(B, C, j / 3))}`;
  return `<path class="ln" d="M${q(A)}L${q([x, y + d, 0])}M${q(B)}L${q([x + w, y + d, 0])}"/>` +
    `<polygon class="o" fill="#4f74b0" points="${[A, B, C, D].map(q).join(' ')}"/>` +
    `<path d="${g}" fill="none" stroke="#a9c3e8" stroke-width="1.1" opacity=".85"/>` +
    `<path d="M${q(D)}L${q(C)}" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>`;
}

// Hourly demand vs solar → "duck curve" chart for the inset card.
const DEM = [[0, 38], [5, 30], [8, 52], [12, 52], [16, 54], [19, 80], [22, 56], [24, 40]];
const dem = (h) => { for (let i = 1; i < DEM.length; i++) if (h <= DEM[i][0]) { const [a, b] = [DEM[i - 1], DEM[i]]; return a[1] + ((h - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); } return 40; };
const sol = (h) => (Math.abs(h - 12) > 6.5 ? 0 : 40 * Math.exp(-0.5 * ((h - 12) / 3.2) ** 2));
const X = (h) => 16 + h * 7.2, Y = (v) => 142 - v;
const pl = (fn) => Array.from({ length: 25 }, (_, h) => `${X(h).toFixed(1)},${Y(fn(h)).toFixed(1)}`).join(' ');
function duck(flat) {
  const net = (h) => Math.max(dem(h) - sol(h), 4);
  const flatNet = (h) => { const n = net(h); return n + (h >= 9 && h <= 15 ? Math.min(14, sol(h) * 0.5) : 0) - (h >= 17 && h <= 21 ? 14 : 0); };
  const area = `${X(6)},${Y(0)} ` + Array.from({ length: 13 }, (_, i) => `${X(6 + i).toFixed(1)},${Y(sol(6 + i)).toFixed(1)}`).join(' ') + ` ${X(18)},${Y(0)}`;
  return `<path class="ax" d="M16,142H190M16,142V32"/>
   <polygon points="${area}" fill="#f1b83a" opacity=".55"/>
   <polyline points="${pl(dem)}" fill="none" stroke="#8b847a" stroke-width="1.6" stroke-dasharray="4 3"/>
   <polyline points="${pl(flat ? flatNet : net)}" fill="none" stroke="#d0683a" stroke-width="2.6" stroke-linejoin="round"/>
   <text x="${X(9.2)}" y="${Y(8)}" style="font-size:8.5px">midday glut</text>
   <text x="${X(14.2)}" y="${Y(98)}" style="font-size:8.5px;fill:#d0683a;font-weight:700">${flat ? 'flattened' : 'evening ramp'}</text>
   <text x="16" y="156">0h</text><text x="${X(12) - 8}" y="156">noon</text><text x="${X(24) - 12}" y="156">24h</text>
   <text x="16" y="170" style="font-size:8.5px">- - demand   <tspan fill="#d0683a" font-weight="700">━ net demand</tspan></text>`;
}

const cell = `
  <rect x="24" y="76" width="116" height="26" fill="#9fcdf0" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="24" y="102" width="116" height="34" fill="#f2a79b" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="24" y="136" width="116" height="6" fill="#8b9098" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="38" y="70" width="14" height="6" fill="#35322f"/><rect x="104" y="70" width="14" height="6" fill="#35322f"/>
  <path d="M45,70V56H170V139H140" fill="none" stroke="var(--obj-edge)" stroke-width="2"/>
  <circle cx="170" cy="98" r="8" fill="#fde3a7" stroke="var(--obj-edge)" stroke-width="2"/>
  <path d="M24,102H140" stroke="var(--obj-edge)" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="30" y="93">n-type</text><text x="30" y="124">p-type</text><text x="144" y="106" style="font-size:8px">junction</text>
  <path class="flow on k-light" d="M80,26L80,70" style="--fc:#f1b83a"/>
  <path d="M80,26C74,34 86,40 80,48S74,62 80,70" fill="none" stroke="#f1b83a" stroke-width="3" stroke-linecap="round"/>
  <path d="M74,66l6,8 6-8" fill="none" stroke="#f1b83a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="90" y="40">photon</text>
  <g class="travel" style="offset-path:path('M80,104L45,76V56H170V139H140');--t:3.2s"><circle r="4" fill="#7c63d0" stroke="#fff" stroke-width="1.5"/></g>
  <g class="travel" style="offset-path:path('M80,104L45,76V56H170V139H140');--t:3.2s;animation-delay:-1.6s"><circle r="4" fill="#7c63d0" stroke="#fff" stroke-width="1.5"/></g>
  <text x="104" y="52" style="font-size:8.5px;fill:#7c63d0;font-weight:700">e⁻ flow</text>`;

export default {
  id: 'solar', title: 'Solar Power', icon: 'sun', time: 8, level: 'Beginner',
  tagline: 'Follow sunlight from a photon in a silicon cell all the way to your wall socket.',
  stats: [
    { id: 'irr', label: 'Sunlight', icon: 'sun' }, { id: 'dc', label: 'DC power', icon: 'zap' },
    { id: 'ac', label: 'AC power', icon: 'zap' }, { id: 'cf', label: 'Capacity factor', icon: 'gauge' },
  ],
  legend: [['#f1b83a', 'sunlight'], ['#e8a33a', 'DC current'], ['#7c63d0', 'AC current']],
  learn: [
    { t: 'What a photon does inside a cell', at: 1 }, { t: 'Why panels make DC but the grid runs on AC', at: 3 },
    { t: 'Where the power goes: home first, grid next', at: 4 }, { t: 'Why output follows the sun (and the duck curve)', at: 5 },
    { t: 'How a battery shifts midday power to evening', at: 6 },
  ],
  build(s) {
    const rays = Array.from({ length: 12 }, (_, i) => `<line class="ln" x1="36" y1="0" x2="${i % 2 ? 44 : 50}" y2="0" transform="rotate(${i * 30})"/>`).join('');
    s.floor(10, 10, 'grass');
    s.screen('sun', `<g transform="translate(120,92)"><g class="spin slow">${rays}</g><circle class="o" r="27" fill="#fde3a7"/><circle r="27" fill="none" stroke="#f1b83a" stroke-width="3" opacity=".5" transform="scale(.8)"/></g>`);
    s.labelS('sun:l', 120, 140, { t: 'sun', icon: 'sun' });

    // solar array: two rows of three panels
    let arr = '';
    for (const y of [1, 3.4]) for (const x of [0.8, 3, 5.2]) arr += panel(x, y, 2, 1.6);
    s.raw('panels', arr, { k: 12.2 });
    s.label('panels:l', 4, 4.2, 2.1, { t: 'solar array', icon: 'sun' });

    // inverter, transformer, house, battery, pylons — revealed step by step
    s.box('inverter', 7.6, 2.2, 0, 1.4, 1.2, 1.5, 'white', {
      from: 2, label: { t: 'inverter', icon: 'zap' },
      extra: `<polygon class="o" fill="#35322f" points="${[[7.8, 3.4, 0.85], [8.6, 3.4, 0.85], [8.6, 3.4, 1.3], [7.8, 3.4, 1.3]].map(q).join(' ')}"/><path d="M${q([7.9, 3.4, 1.07])}L${q([8.5, 3.4, 1.07])}" stroke="#7fc278" stroke-width="2.5"/>`,
    });
    s.box('transformer', 7.7, 5, 0, 1.3, 1.3, 1.1, 'concrete', { from: 4, label: { t: 'transformer', icon: 'cog' } });
    for (const [x, y] of [[8.0, 5.3], [8.5, 5.3], [8.0, 5.8], [8.5, 5.8]].slice(0, 2)) s.cyl('transformer', x, y, 1.1, 0.14, 0.45, 'white', { from: 4, k: 15.4, shadow: false });

    // house
    s.box('house', 3, 6.9, 0, 2.4, 2.3, 1.5, 'cream', {
      from: 4, label: { t: 'your home', icon: 'house' }, lopt: { dy: -50 },
      extra: `<polygon class="o" fill="#8dc0e8" points="${[[3.4, 9.2, 0.7], [4.0, 9.2, 0.7], [4.0, 9.2, 1.2], [3.4, 9.2, 1.2]].map(q).join(' ')}"/><polygon class="o" fill="#a8977e" points="${[[4.5, 9.2, 0], [5, 9.2, 0], [5, 9.2, 1.05], [4.5, 9.2, 1.05]].map(q).join(' ')}"/>
        <polygon class="o" fill="#e4d6c4" points="${[[5.4, 6.9, 1.5], [5.4, 9.2, 1.5], [5.4, 8.05, 2.45]].map(q).join(' ')}"/>
        <polygon class="o" fill="#e5534b" points="${[[2.8, 9.45, 1.4], [5.6, 9.45, 1.4], [5.6, 8.05, 2.55], [2.8, 8.05, 2.55]].map(q).join(' ')}"/>`,
    });
    // pylons carry the surplus away
    for (const y of [8.2, 3.6]) {
      s.raw('pylon', `<path class="ln" d="M${q([9.0, y - 0.2, 0])}L${q([9.2, y, 3.3])}L${q([9.4, y + 0.2, 0])}M${q([9.0, y + 0.2, 0])}L${q([9.2, y, 3.3])}L${q([9.4, y - 0.2, 0])}M${q([9.2, y - 0.6, 3.0])}L${q([9.2, y + 0.6, 3.0])}M${q([9.2, y - 0.45, 2.3])}L${q([9.2, y + 0.45, 2.3])}"/>`, { from: 4, k: 17 + (8 - y) * -0.1 });
    }
    s.label('grid:l', 9.2, 3.6, 3.4, { t: 'to the grid', icon: 'tower' }, { from: 4 });
    s.box('battery', 8, 0.4, 0, 1.4, 1.2, 1.2, 'green', { from: 6, label: { t: 'battery', icon: 'battery' }, lopt: { dy: -46 } });

    // energy flows
    s.flowS('sunlight', [[148, 108], P(1.9, 1.8, 1.1)], 'light');
    s.flowS('sunlight2', [[150, 100], P(4, 1.8, 1.1)], 'light');
    s.flowS('sunlight3', [[152, 94], P(6.3, 1.8, 1.1)], 'light');
    s.flowS('sunlight4', [[146, 114], P(2.5, 4.4, 1.1)], 'light');
    s.flowS('sunlight5', [[149, 105], P(4.8, 4.4, 1.1)], 'light');
    s.flow('dc', [[1, 3, 0.05], [7.5, 3, 0.05]], 'dc', { from: 2 });
    s.flow('ac1', [[8.3, 3.4, 0.05], [8.3, 5, 0.05]], 'ac', { from: 3 });
    s.flow('ac2', [[8.3, 6.3, 0.05], [8.3, 8.2, 0.05], [9.2, 8.2, 0.05]], 'ac', { from: 4 });
    s.flow('ac3', [[8.3, 7.6, 0.05], [5.4, 7.6, 0.05]], 'ac', { from: 4 });
    s.flow('hv', [[9.2, 8.2, 0.05], [9.2, 8.2, 3.3], [9.2, 3.6, 3.3], [9.2, -5, 3.3]], 'hv', { from: 4 });
    s.flow('batt', [[8.7, 2.2, 0.05], [8.7, 1.6, 0.05]], 'dc', { from: 6, cls: 'fast' });

    // insets
    s.card('cell', 'INSIDE A SOLAR CELL', cell, { w: 205, h: 156, from: 1, until: 1 });
    s.card('duck', 'THE DUCK CURVE', duck(false), { w: 205, h: 180, from: 5, until: 5 });
    s.card('duck2', 'WITH A BATTERY', duck(true), { w: 205, h: 180, from: 6, until: 6 });
  },
  steps: [
    {
      short: 'Sunlight', tag: 'CONCEPT', title: 'A free, enormous power source',
      body: ['Sunlight reaching the top of the atmosphere carries about 1,360 watts per square metre. After the air takes its share, roughly 1,000 W/m² reaches the ground at noon on a clear day.',
        'A typical panel turns about a fifth of that into electricity, so one square metre gives around 200 W in full sun.'],
      callout: { k: 'key', t: 'Solar has no fuel, no flame and almost no moving parts. Light goes in, electricity comes out.' },
      focus: ['panels'], flows: ['sunlight', 'sunlight2', 'sunlight3', 'sunlight4', 'sunlight5'], stats: { irr: '1,000 W/m²' },
    },
    {
      short: 'Photons → electrons', tag: 'CONCEPT', title: 'How light becomes current',
      body: ['A solar cell is a thin sandwich of two silicon layers. Where they meet, a built-in electric field forms: the `junction`.',
        'When a photon with enough energy hits the silicon it knocks an electron loose. The field pushes that electron toward the front contact, out through the circuit, and back to the other side. That flow is the current.'],
      callout: { k: 'know', t: 'One cell makes only about 0.5 V, so a panel wires 60–72 cells in series. Single-junction silicon can never pass ≈33% efficiency (the Shockley–Queisser limit); real panels reach about 20–23%.' },
      focus: ['panels'], flows: ['sunlight', 'sunlight2', 'sunlight3', 'sunlight4', 'sunlight5'],
    },
    {
      short: 'Strings & DC', tag: 'METHOD', title: 'Panels join into strings',
      body: ['Wired in series, panel voltages add. Wired in parallel, their currents add. Either way the output is direct current (DC): electrons flowing one way.',
        'This example is six 400 W panels, so up to 2.4 kW in perfect sun.'],
      callout: { k: 'key', t: 'Output is not steady. Power follows the light on the glass, so it changes with every passing cloud.' },
      focus: ['panels', 'inverter'], flows: ['dc', 'sunlight', 'sunlight2', 'sunlight3', 'sunlight4', 'sunlight5'], stats: { dc: '2.4 kW' },
    },
    {
      short: 'Inverter', tag: 'METHOD', title: 'The inverter makes AC',
      body: ['Homes and the grid use alternating current (AC), which reverses direction 50 or 60 times a second. The inverter converts DC to AC and locks its timing to the grid’s.',
        'It also hunts for the voltage where the panels give the most power, called maximum power point tracking, as light and temperature change.'],
      callout: { k: 'warn', t: 'Grid-tied inverters shut off when the grid goes down, to protect line workers. A rooftop array alone won’t keep your lights on in an outage; that takes a battery with islanding gear.' },
      focus: ['inverter', 'panels'], flows: ['dc', 'ac1'], stats: { ac: '2.3 kW' },
    },
    {
      short: 'Use or share', tag: 'CONCEPT', title: 'Use it, share it, or waste it',
      body: ['A transformer matches the voltage to the local lines. Your home takes what it needs first; the surplus flows onto the wires and to your neighbours.',
        'Every solar kilowatt-hour that is used displaces one that another power station would have had to produce.'],
      callout: { k: 'key', t: 'Electricity must be used the instant it is made. The grid holds almost no stock, so balancing supply and demand every second is the central job of grid operators.' },
      focus: ['transformer', 'house', 'pylon', 'grid'], flows: ['ac1', 'ac2', 'ac3', 'hv'],
    },
    {
      short: 'Duck curve', tag: 'TRADE-OFF', title: 'The sun clocks out',
      body: ['Solar rises with the sun, peaks near noon and falls to zero at night. Clouds can cut it within minutes.',
        'Capacity factor is the share of a plant’s maximum output it delivers over a year. Good solar sites reach about 25%.',
        'Midday solar floods the grid, then fades just as people come home. Subtract it from demand and the curve looks like a duck.'],
      callout: { k: 'key', t: 'Net demand = demand minus solar. The steep evening climb must be met by something that can ramp fast: gas, hydro or storage.' },
      focus: ['panels'], flows: ['sunlight', 'sunlight2', 'sunlight3', 'sunlight4', 'sunlight5', 'dc', 'ac1', 'ac2', 'hv'], stats: { cf: '≈ 25%' },
    },
    {
      short: 'Battery', tag: 'METHOD', title: 'Move midday power into the evening',
      body: ['A battery soaks up the surplus around noon and releases it at the evening peak, flattening the duck. Lithium-ion batteries return roughly 85–95% of the energy put in.',
        'Cheap panels created the midday glut; cheap batteries now turn that glut into evening supply.'],
      callout: { k: 'know', t: 'Solar electricity costs fell by roughly 85% over the 2010s, according to IRENA. That is why solar is now among the cheapest new sources in many places.' },
      focus: ['battery', 'inverter'], flows: ['batt', 'dc', 'ac1'],
    },
  ],
};
