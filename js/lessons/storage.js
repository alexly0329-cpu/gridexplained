import { house, pylon } from './common.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Power and Electricity Systems" notes (storage for deferral, utility-scale and behind-the-meter batteries, pumped hydro, power vs energy).
const seg = (y, label, base, add, cap, note) => {
  const k = 2.0;                                         // px per MW
  return `<text x="12" y="${y - 5}" style="font-size:9px;font-weight:700;fill:var(--ink)">${label}</text>
    <rect x="12" y="${y}" width="${base * k}" height="18" fill="#c9ccd1" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${12 + base * k / 2}" y="${y + 13}" text-anchor="middle" style="font-size:9px;fill:#172720">${cap}</text>
    <rect x="${12 + base * k}" y="${y}" width="${add * k}" height="18" fill="#a6d38b" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${12 + base * k + add * k / 2}" y="${y + 13}" text-anchor="middle" style="font-size:9px;font-weight:700;fill:#172720">+${add}</text>
    <text x="12" y="${y + 32}" style="font-size:8.5px">${note}</text>`;
};
const defer = seg(46, 'Supply side: battery beside the plant', 100, 20, '100 MW plant', 'charge at night, then both cover the peak')
  + seg(108, 'Load side: battery beside the town', 100, 20, '100 MW line (the limit)', 'line stays at 100 MW; battery adds 20');

const peak = bars([{ label: 'Without battery', value: 1000, color: '#f1b3a3' }, { label: 'With 500 kW battery', value: 500, color: '#a6d38b' }], { w: 300, labelW: 130, max: 1000, fmt: (v) => `${v} kW`, y0: 42, h: 20, gap: 14, note: 'billed peak; demand charges ≈ half a bill' });

export default {
  id: 'storage', group: 'systems', title: 'What Storage Is Worth', icon: 'battery', time: 11, level: 'Intermediate',
  tagline: 'The same battery can defer a power plant, defer a power line, flatten the duck curve, or cut one customer’s bill.',
  stats: [
    { id: 'peak', label: 'Town peak', icon: 'house' }, { id: 'line', label: 'Plant or line', icon: 'tower' },
    { id: 'batt', label: 'Battery', icon: 'battery' }, { id: 'psh', label: 'Pumped hydro share', icon: 'waves' },
  ],
  legend: [['#e8a33a', 'power flow'], ['#2f86ce', 'water']],
  learn: [
    { t: 'Power (MW) versus energy (MWh): the bucket', at: 0 }, { t: 'How a battery defers a power plant', at: 1 },
    { t: 'How a battery defers a power line', at: 2 }, { t: 'The four utility-scale value streams', at: 3 },
    { t: 'Peak shaving and time-of-use shifting at the customer', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('plant', 0.8, 1.0, 0, 2.0, 1.6, 1.2, 'steel', { label: { t: '100 MW plant', icon: 'factory' } });
    s.cyl('plant', 1.4, 1.4, 1.2, 0.25, 1.6, 'concrete', { k: 14, shadow: false });
    s.box('batt1', 0.8, 3.4, 0, 1.4, 1.1, 0.8, 'green', { from: 1, until: 1, label: { t: 'battery 20 MW', icon: 'battery' } });
    for (const x of [3.8, 5.4, 7.0]) s.raw('line', pylon(x, 2.0, 2.6), { k: x + 5 });
    s.box('batt2', 6.6, 4.0, 0, 1.4, 1.1, 0.8, 'green', { from: 2, until: 3, label: { t: 'battery 20 MW', icon: 'battery' } });
    house(s, 'town', 7.8, 6.2, { label: { t: 'town', icon: 'house' } }); house(s, 'town', 6.0, 6.8);
    s.box('biz', 3.4, 6.0, 0, 1.8, 1.6, 1.3, 'cream', { from: 4, label: { t: 'business', icon: 'factory' } });
    s.box('bizbatt', 3.4, 7.8, 0, 1.2, 1.0, 0.7, 'green', { from: 4, label: { t: '500 kW battery', icon: 'battery' }, lopt: { dy: 24 } });
    s.box('psh', 0.4, 6.0, 0, 1.8, 1.8, 1.2, 'rock', { from: 5, shadow: false });
    s.water('psh', 0.5, 6.1, 1.2, 1.6, 1.6, 0.25, { from: 5, k: 16 });
    s.water('psh2', 0.8, 8.2, 0, 2.0, 1.5, 0.15, { from: 5, k: 14, label: { t: 'pumped hydro', icon: 'waves' } });
    s.flow('f-gen', [[2.8, 1.8, 0.05], [3.8, 2.0, 0.05]], 'electric', {});
    s.flow('f-line', [[3.8, 2.0, 2.6], [7.0, 2.0, 2.6], [8.0, 6.2, 0.9]], 'hv', {});
    s.flow('f-b1', [[2.2, 3.6, 0.05], [2.8, 2.6, 0.05]], 'electric', { from: 1, until: 1, cls: 'fast' });
    s.flow('f-b2', [[7.0, 4.0, 0.05], [7.8, 6.2, 0.05]], 'electric', { from: 2, until: 3, cls: 'fast' });
    s.flow('f-pumped', [[1.4, 8.2, 0.3], [1.4, 7.8, 1.2]], 'water', { pipe: true, from: 5 });
    s.card('bucket', 'POWER IS THE SPRINT, ENERGY IS THE BUCKET', list([['Power (MW)', 'how much it can deliver at once; priced per MW'], ['Energy (MWh)', 'how long it can keep going; priced per MWh'], ['Both together', '20 MW for 4 hours = an 80 MWh bucket']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('defer', 'DEFERRING A NEW PLANT OR A NEW WIRE', defer, { w: 300, h: 170, from: 1, until: 2 });
    s.card('value', 'FOUR UTILITY-SCALE VALUE STREAMS', list([['Arbitrage & congestion', 'store when cheap or blocked, sell at the peak'], ['Firming renewables', 'smooth lulls into steady supply'], ['Grid quality', 'instant frequency and voltage support'], ['Deferring investment', 'near plant or near load']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('btm', 'PEAK SHAVING BEHIND THE METER', peak, { w: 300, h: 142, from: 4, until: 4 });
    s.card('psh', 'THE STORAGE LANDSCAPE', list([['Pumped hydro', 'over 90% of grid storage worldwide'], ['US vs EU vs China', '20–22 GW, 40+ GW, fast growth'], ['Cabin Creek, Colorado', '324 MW, about 75% round trip (1967)'], ['Lithium-ion', '1.6 GW in 2016, now dominant in new builds']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Bucket', tag: 'CONCEPT', title: 'Two numbers describe every battery',
      body: ['Storage sits between supply and demand, so it needs two ratings. Power (MW) is how hard it can push at once. Energy (MWh) is how long it can keep pushing: the size of the bucket.',
        'High power for a long time needs a big bucket, which costs more. A 20 MW battery with an 80 MWh bucket can run for four hours at full output.'],
      callout: { k: 'key', t: 'Ask both questions: how fast, and for how long. A battery good for frequency control may be useless for evening peaks.' },
      focus: ['plant', 'town'], flows: ['f-gen', 'f-line'], stats: { batt: '20 MW × 4 h' },
    },
    {
      short: 'Defer a plant', tag: 'METHOD', title: 'A battery instead of a new peaker',
      body: ['A town’s peak grows from 100 MW to 120 MW on summer afternoons. Building a 20 MW peaking plant is slow and costly.',
        'A 20 MW battery beside the existing 100 MW plant solves it: the plant charges the battery overnight, when town demand is 80 MW, then plant plus battery together supply 120 MW at the peak.'],
      callout: { k: 'know', t: 'The plant runs flatter and fuller. The battery adds capacity exactly where and when it is short.' },
      focus: ['plant', 'batt1', 'line'], flows: ['f-gen', 'f-line', 'f-b1'], stats: { peak: '120 MW', line: '100 MW plant' },
    },
    {
      short: 'Defer a wire', tag: 'METHOD', title: 'A battery instead of a bigger line',
      body: ['Now suppose generation is fine but the transmission line to town can carry only 100 MW. Rebuilding the line is expensive.',
        'Place the 20 MW battery at the receiving end, near the town’s substation. The line still carries 100 MW, and the battery discharges the last 20 MW locally.'],
      callout: { k: 'key', t: 'Location changes the value. Beside the plant a battery avoids a power station; beside the load it avoids a wire.' },
      focus: ['batt2', 'town', 'line'], flows: ['f-line', 'f-b2'], stats: { line: '100 MW line' },
    },
    {
      short: 'Utility scale', tag: 'CONCEPT', title: 'One battery, four jobs',
      body: ['Utility-scale batteries, typically 50–100 MW and up, can earn from several roles at once: arbitrage and congestion relief, firming a wind or solar farm, ultra-fast grid support, and deferring investment.',
        'On a duck-curve grid they soak up surplus midday solar, “filling the duck’s belly”, then discharge into the steep evening ramp.'],
      callout: { k: 'know', t: 'Stacking value streams is how batteries become profitable. Any single one often falls short.' },
      focus: ['batt2', 'town'], flows: ['f-line', 'f-b2'],
    },
    {
      short: 'Behind the meter', tag: 'METHOD', title: 'A battery at the customer',
      body: ['A business whose peak is 1 MW can add a 500 kW battery and draw only 500 kW from the grid at its peak. Demand charges, set by the single highest draw in the billing period, often make up around half of a commercial bill.',
        'At home, a battery stores midday rooftop solar and releases it in the evening, shifting the household’s load from expensive peak to cheap off-peak hours.'],
      callout: { k: 'know', t: 'Homes and businesses have two different engines: homes chase time-of-use prices and solar self-use; businesses chase demand charges.' },
      focus: ['biz', 'bizbatt', 'town'], flows: [], stats: { peak: '1 MW → 500 kW' },
    },
    {
      short: 'Pumped hydro', tag: 'CONCEPT', title: 'The giant already here',
      body: ['Despite the headlines about batteries, pumped hydro makes up over 90% of grid-scale storage. It is a reversible hydro plant: pump up when power is cheap, release when it is dear.',
        'Colorado’s 1967 Cabin Creek plant is rated 324 MW at about 75% round trip; modern plants reach 80% or more. New builds in the West have stalled over cost and terrain, while China expands fast.'],
      callout: { k: 'key', t: 'Pumped hydro offers huge volume and decades of life, but needs hills and water. Batteries are quick to site, which is why most new storage is lithium-ion.' },
      focus: ['psh', 'psh2'], flows: ['f-pumped'], stats: { psh: '> 90%' },
    },
  ],
};
