import { house } from './common.js';
import { P } from '../iso.js';
import { list, bars, table } from './cards.js';
import { money } from './fin.js';

// Source: the "Renewable Power and Electricity Systems" notes (energy carriers, kW vs kWh, capacity factor, flexibility metrics, ancillary services).
const PLANT_MW = 186, HOURS = 24;
const FULL = PLANT_MW * HOURS, HALF = (PLANT_MW / 2) * HOURS;                    // MWh per day at 100%, 50%
const BILL_KWH = 563, RATE = 0.095, BILL = BILL_KWH * RATE;
const WIND_MWH = 1 * 8760, WIND_CF = 0.242, WIND_OUT = WIND_MWH * WIND_CF;
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const puffs = (x, y, z, n) => { const [px, py] = P(x, y, z); return Array.from({ length: n }, (_, i) => `<circle class="rise" cx="${px + (i - 1) * 4}" cy="${py}" r="8" fill="#fff" stroke="var(--obj-edge)" stroke-width="1.6" style="animation-delay:${i * -1}s"/>`).join(''); };

const prefixes = list([['kWh', 'your monthly bill'], ['MWh', 'wholesale prices, utility batteries'], ['GWh', 'one power plant’s year'], ['TWh', 'a whole country’s demand']], { gap: 33 })
  + `<text x="12" y="172" style="font-size:8.5px">each step up is × 1,000</text>`;
const cf = bars([{ label: 'Nuclear', value: 93, color: '#cfc0e8' }, { label: 'Coal', value: 54, color: '#b8b3ab' }, { label: 'Hydro', value: 42, color: '#9fcdf0' }, { label: 'New onshore wind', value: 41, color: '#a9d6c9' }, { label: 'Gas peakers', value: 12, color: '#f7a35c' }], { w: 300, labelW: 116, max: 100, fmt: (v) => `${v}%`, note: 'US fleet averages; good new wind sites exceed 40%' });
const flex = table(['Attribute', 'Old → new'], [['Gas turbine, min load', '40–50% → 20%'], ['Hard coal, ramp rate', '1.5–4% → 3–6%/min'], ['10 MW gas, firm at peak', 'about 10 MW'], ['1 MW solar, firm at peak', 'under 1 MW']], { cols: [12, 150], rowH: 26 }) + `<text x="12" y="150" style="font-size:8.5px">ramp = how fast output can change per minute</text>`;

export default {
  id: 'metrics', group: 'systems', title: 'Power, Energy & Capacity Factor', icon: 'gauge', time: 10, level: 'Beginner',
  tagline: 'The vocabulary of every power plant: kilowatts versus kilowatt-hours, capacity factor, and the flexibility grids actually buy.',
  stats: [
    { id: 'bill', label: 'Monthly bill', icon: 'house' }, { id: 'cap', label: 'Plant rating', icon: 'factory' },
    { id: 'day', label: 'Output per day', icon: 'chart' }, { id: 'cf', label: 'Capacity factor', icon: 'gauge' },
  ],
  legend: [['#d0683a', 'fuel heat'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why electricity is a carrier, not a fuel', at: 0 }, { t: 'Power (kW) versus energy (kWh)', at: 1 },
    { t: 'How capacity factor is calculated', at: 2 }, { t: 'Minimum load, ramp rate and capacity value', at: 3 },
    { t: 'The services a grid buys besides energy', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    const plant = (id, x, from) => {
      s.box(id, x, 4.0, 0, 2.2, 1.9, 1.2, 'steel', { from, label: { t: `${PLANT_MW} MW`, icon: 'factory' } });
      s.cyl(id, x + 0.6, 4.4, 1.2, 0.26, 1.7, 'concrete', { from, k: 16 + x, shadow: false });
    };
    plant('p1', 0.5, 0); plant('p2', 3.5, 1); plant('p3', 6.5, 1);
    s.raw('p1', puffs(1.1, 4.4, 3.1, 3), { k: 30 });
    s.raw('p2', puffs(4.1, 4.4, 3.1, 1), { from: 1, k: 31 });
    [['p1', 0.5, FULL, '100%'], ['p2', 3.5, HALF, '50%'], ['p3', 6.5, 0, 'off']].forEach(([id, x, mwh, lvl]) => s.label(id + ':l', x + 1.1, 5.9, 0, { t: `${lvl}: ${fmt(mwh)} MWh` }, { dy: 16, from: 1, until: 1 }));
    house(s, 'homes', 8.3, 7.6, { from: 0, until: 0, label: { t: 'homes', icon: 'house' } });
    s.flow('fuel', [[-0.4, 5.0, 0.5], [0.5, 5.0, 0.5]], 'heat', { pipe: true, from: 0, until: 0 });
    s.flow('elec', [[2.7, 6.0, 0.05], [8.5, 6.0, 0.05], [8.5, 7.6, 0.05]], 'electric', { from: 0, until: 0 });
    s.labelS('out1:l', P(5.6, 6.0, 0)[0], P(5.6, 6.0, 0)[1], { t: 'about 1/3 becomes electricity' }, { from: 0, until: 0, dy: -4 });
    s.card('prefix', 'UNITS OF ENERGY', prefixes, { w: 280, h: 184, from: 0, until: 0 });
    s.card('cf', 'CAPACITY FACTOR, US FLEET', cf, { w: 300, h: 184, from: 2, until: 2 });
    s.card('flex', 'FLEXIBILITY ATTRIBUTES', flex, { w: 300, h: 164, from: 3, until: 3 });
    s.card('anc', 'FOUR ANCILLARY SERVICES', list([['Frequency control', 'hold 60 Hz; 59.9 or 60.1 is a warning'], ['Load following', 'track demand minute to minute'], ['Operating reserves', 'standby for trips and surges'], ['Black start', 'restart the grid from a blackout']], { gap: 32 }), { w: 300, h: 168, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'A carrier', tag: 'CONCEPT', title: 'Electricity carries energy, it is not a fuel',
      body: ['Electricity is not found in nature. It is made from coal, falling water or sunlight and moves that energy through wires, the way gasoline carries energy from crude oil to a car engine.',
        `A steam plant turns only about a third of its fuel into electricity. The rest is waste heat. A home using ${BILL_KWH} kWh a month at ${(RATE * 100).toFixed(1)}¢ pays ${money(BILL, 2)}.`],
      callout: { k: 'key', t: 'Because two thirds of fuel energy is lost at a thermal plant, using electricity directly, for example in heat pumps and EVs, can cut total energy waste.' },
      focus: ['p1', 'homes'], flows: ['fuel', 'elec'], stats: { bill: money(BILL, 2) },
    },
    {
      short: 'kW vs kWh', tag: 'CONCEPT', title: 'The rating is a ceiling, not the output',
      body: [`A ${PLANT_MW} MW coal plant running flat out for ${HOURS} hours makes ${fmt(FULL)} MWh. At half power it makes ${fmt(HALF)} MWh. Switched off it makes nothing. It is a ${PLANT_MW} MW plant in all three cases.`,
        'Power is a rate, like a car engine’s 149 kW (200 horsepower), which is the same parked or climbing a hill. Energy is power multiplied by time and by how much it is actually used.'],
      callout: { k: 'know', t: 'A 1 MW wind turbine on a calm day produces 0 kWh. The nameplate tells you what it could do, never what it did.' },
      focus: ['p1', 'p2', 'p3'], flows: [], stats: { cap: `${PLANT_MW} MW`, day: `${fmt(FULL)} / ${fmt(HALF)} / 0 MWh` },
    },
    {
      short: 'Capacity factor', tag: 'NUMBERS', title: 'Capacity factor: actual over possible',
      body: [`Capacity factor = actual output ÷ (rated power × 8,760 hours). A 1 MW turbine could make ${fmt(WIND_MWH)} MWh in a year. At a ${(WIND_CF * 100).toFixed(1)}% capacity factor it made about ${fmt(WIND_OUT)} MWh.`,
        'Fleet averages tell each plant’s role. Nuclear runs almost continuously. Gas peakers run only on the highest-priced afternoons.'],
      callout: { k: 'key', t: 'Capacity factor is a role, not a grade. Solar cannot pass about 50% because of night, and a peaker at 12% is doing exactly its job.' },
      focus: ['p1'], stats: { cf: `${(WIND_CF * 100).toFixed(1)}% (1 MW wind)` },
    },
    {
      short: 'Flexibility', tag: 'METHOD', title: 'Three ways a plant can be useful',
      body: ['Minimum load is the lowest stable output before a plant must shut off. Ramp rate is how fast output can change, in megawatts or percent per minute. Capacity value is the share of the rating the grid can count on at peak.',
        'Newer designs do better than reputation: modern gas turbines hold stable at 20% load, and newer hard-coal units ramp at 3–6% per minute.'],
      callout: { k: 'know', t: 'A 10 MW gas turbine has capacity value close to 10 MW. A 1 MW solar plant has noticeably less, because clouds and evenings cannot be scheduled.' },
      focus: ['p2', 'p3'], flows: [],
    },
    {
      short: 'Services', tag: 'CONCEPT', title: 'Energy is not the only thing a grid buys',
      body: ['Four services keep supply and demand balanced second by second: frequency control, load following, operating reserves, and black-start capability to restart the grid from a total blackout.',
        'Each is bought and paid for separately. Black-start plants are grid-wide insurance.'],
      callout: { k: 'key', t: 'These services are why a plant that rarely generates can still be valuable: it earns for being ready, not only for running.' },
      focus: ['p1', 'p2', 'p3'],
    },
    {
      short: 'Rising stakes', tag: 'TRADE-OFF', title: 'More wind and solar make flexibility pricier',
      body: ['Wind and solar fluctuate with the weather and carry no rotating mass of their own. The more of them a grid has, the more it needs plants that start fast, throttle low and ramp quickly.',
        'The value shifts from raw megawatt-hours toward flexibility and availability, the attributes in this lesson.'],
      callout: { k: 'warn', t: 'A plant’s capacity factor can fall while its value to the grid rises, if it supplies exactly the flexibility the system is short of.' },
      focus: ['p2', 'p3'],
    },
  ],
};
