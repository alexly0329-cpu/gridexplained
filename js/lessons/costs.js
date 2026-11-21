import { panel } from './solar.js';
import { turbine } from './wind.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Energy Futures" notes (wind and solar cost trajectories, market bifurcation, soft costs, CSP and biofuels).
const WIND = { from: 8.6, to: 5.3 }, SOLAR = { from: 38, to: 6.8 };
const drop = (a) => Math.round(((a.from - a.to) / a.from) * 100);
const H = (c) => 0.15 + c * 0.055;                                   // pillar height for a cost in ¢/kWh

const bif = (name, y, util, roof) => `<text x="12" y="${y - 6}" style="font-size:9px;font-weight:700;fill:var(--ink)">${name}</text><rect x="12" y="${y}" width="${util * 11}" height="20" fill="#9fcdf0" stroke="var(--obj-edge)" stroke-width="1.6"/><rect x="${12 + util * 11}" y="${y}" width="${roof * 11}" height="20" fill="#f6d77e" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${12 + (util + roof) * 11 + 6}" y="${y + 14}" style="font-size:10px;font-weight:700;fill:var(--ink)">${util + roof}%</text>`;
const bifCard = bif('California, solar share of power', 50, 13, 7) + bif('Hawaii, solar share of power', 104, 2.5, 10.5)
  + `<text x="12" y="152" style="font-size:8.5px"><tspan fill="#5f9ccb" font-weight="700">■</tspan> utility-scale   <tspan fill="#dfb04e" font-weight="700">■</tspan> rooftop (2019)</text>`;

export default {
  id: 'costs', group: 'transition', title: 'Wind & Solar Cost Curves', icon: 'wind', time: 10, level: 'Beginner',
  tagline: 'How wind and solar became the cheapest new power in many places, why rooftop prices still differ by country, and which technologies stalled.',
  stats: [
    { id: 'wind', label: 'Wind share of power', icon: 'wind' }, { id: 'wcost', label: 'Onshore wind cost', icon: 'chart' },
    { id: 'scost', label: 'Solar PV cost', icon: 'sun' }, { id: 'csp', label: 'CSP cost', icon: 'thermo' },
  ],
  legend: [['#e8a33a', 'cost per kWh, 2010 vs 2019']],
  learn: [
    { t: 'How fast wind grew and why it got cheaper', at: 1 }, { t: 'The solar cost collapse and the gas crossover', at: 2 },
    { t: 'Utility-scale versus rooftop markets', at: 3 }, { t: 'Why identical panels cost different amounts', at: 4 },
    { t: 'What a stalled technology looks like', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('w10', 0.8, 1.2, 0, 1.0, 1.0, H(WIND.from), 'blue', { from: 1, label: { t: `wind 2010: ${WIND.from}¢` }, lopt: { dy: -10 } });
    s.box('w19', 2.2, 1.2, 0, 1.0, 1.0, H(WIND.to), 'green', { from: 1, label: { t: `wind 2019: ${WIND.to}¢` }, lopt: { dy: -10 } });
    s.box('s10', 3.8, 1.2, 0, 1.0, 1.0, H(SOLAR.from), 'yellow', { from: 2, label: { t: `solar 2010: ${SOLAR.from}¢` }, lopt: { dy: -10 } });
    s.box('s19', 5.2, 1.2, 0, 1.0, 1.0, H(SOLAR.to), 'green', { from: 2, label: { t: `solar 2019: ${SOLAR.to}¢` }, lopt: { dy: -10 } });
    turbine(s, { x: 1.8, y: 6.4, sc: 0.7, suf: 'W' });
    s.raw('solar', panel(4.6, 5.4, 1.8, 1.5) + panel(6.7, 5.4, 1.8, 1.5), { k: 16 });
    s.label('solar:l', 6.4, 6.2, 1.9, { t: 'solar PV', icon: 'sun' }, {});
    s.box('csp', 7.6, 1.2, 0, 1.6, 1.4, 1.2, 'steel', { from: 5, label: { t: 'CSP plant', icon: 'thermo' } });
    s.card('bif', 'TWO KINDS OF SOLAR MARKET', bifCard, { w: 300, h: 164, from: 3, until: 3 });
    s.card('soft', 'SAME PANELS, DIFFERENT PRICES', bars([{ label: 'Australia', value: 1, color: '#a6d38b' }, { label: 'Germany', value: 1.5, color: '#f6d77e' }, { label: 'United States', value: 3, color: '#f1b3a3' }], { w: 300, labelW: 92, max: 3, fmt: (v) => `${v}×`, note: 'rooftop cost; sales $0.50/W vs $0.08/W' }), { w: 300, h: 150, from: 4, until: 4 });
    s.card('stall', 'WHEN GROWTH STALLS', list([['Concentrating solar', '~6 GW worldwide; 15–35¢/kWh'], ['Why it lost', 'PV plus batteries got cheaper first'], ['Corn ethanol', 'about 33% lower carbon than gasoline'], ['Sugarcane ethanol', 'about 50% lower, with land-use limits']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Wind grows', tag: 'CONCEPT', title: 'From a rounding error to one in seventeen kWh',
      body: ['Wind produced under 1% of the world’s electricity in 2000 and 5.9% in 2019. About 60 GW is now installed each year, and more than 13 countries make over 10% of their power from it.',
        'The notes then compare five technologies: wind and solar PV, which dominate new capacity, and concentrating solar, ocean energy and biofuels, which have been slower for different reasons.'],
      callout: { k: 'key', t: 'The common thread in the fast technologies is cost. Each one fell fast enough to compete without special help.' },
      focus: ['towerW', 'nacelleW', 'rotorW'], stats: { wind: '5.9% (2019)' },
    },
    {
      short: 'Wind costs', tag: 'NUMBERS', title: 'A 38% price drop in nine years',
      body: [`From 2010 to 2019 onshore wind’s installed cost fell about 25% while its capacity factor rose from 27% to 36%, thanks to taller towers and bigger rotors. Together they cut the cost per kWh from ${WIND.from}¢ to ${WIND.to}¢, a ${drop(WIND)}% fall.`,
        'That made onshore wind competitive with gas, coal and nuclear on wholesale markets. The notes project another 25% off onshore and over 50% off offshore costs by 2030.'],
      callout: { k: 'know', t: 'A bigger rotor on a taller tower catches more wind per dollar. Cost fell through engineering, not a single breakthrough.' },
      focus: ['w10', 'w19', 'towerW', 'nacelleW', 'rotorW'], stats: { wcost: `${WIND.from}¢ → ${WIND.to}¢` },
    },
    {
      short: 'Solar collapse', tag: 'NUMBERS', title: 'The steepest price fall in power',
      body: [`Solar PV’s average cost fell from ${SOLAR.from}¢ per kWh in 2010 to about ${SOLAR.to}¢ in 2019, a drop of ${drop(SOLAR)}%. Installed capacity grew about 30-fold to over 600 GW, around 3% of world electricity.`,
        'Around 2017–2018, new solar contracts in sunny places went below the fuel-only cost of running existing natural gas plants.'],
      callout: { k: 'key', t: 'When new power is cheaper than the fuel for old plants, replacement becomes an economic decision, not a policy one.' },
      focus: ['s10', 's19', 'solar'], stats: { scost: `${SOLAR.from}¢ → ${SOLAR.to}¢` },
    },
    {
      short: 'Two markets', tag: 'CONCEPT', title: 'Utility farms or rooftops',
      body: ['Solar splits into two businesses. California got about 20% of its power from solar in 2019: roughly 13 points from utility-scale plants and 7 from rooftops.',
        'Hawaii is flipped. About 13% came from solar, but only 2–2.5 points from utility-scale and over 10 from rooftops, driven by high retail prices and scarce land.'],
      callout: { k: 'know', t: 'The mix follows local economics. Where retail power is dear and land is tight, rooftops win; where land is cheap, big farms do.' },
      focus: ['solar'], stats: { scost: 'varies by market' },
    },
    {
      short: 'Soft costs', tag: 'TRADE-OFF', title: 'Same panel, three times the price',
      body: ['Modules are a global commodity with near-identical prices, yet US rooftop solar costs about 2× Germany and 3× Australia. The difference is soft costs: permitting, planning, financing and finding customers.',
        'Customer acquisition alone is cited at about $0.50 per watt in the US versus about $0.08 in Australia. Closing the gap would cut US rooftop costs by nearly two thirds.'],
      callout: { k: 'warn', t: 'Hardware is not the bottleneck any more. Paperwork, sales and time are.' },
      focus: ['solar'],
    },
    {
      short: 'Stalls', tag: 'CONCEPT', title: 'Technologies that did not follow',
      body: ['Concentrating solar power (mirrors, heat, and a steam turbine) reached about 6 GW and stalled. Costs stayed at 15–35¢ per kWh, plants underperformed, and solar PV with batteries got cheaper first.',
        'First-generation biofuels have their own limits: corn ethanol cuts lifecycle carbon by only about a third, sugarcane ethanol about half, and both compete with food and land.'],
      callout: { k: 'key', t: 'Crossing the lab is not enough. A technology also has to cross the “valley of death” to scale at a competitive price before the alternatives improve.' },
      focus: ['csp'], stats: { csp: '15–35¢' },
    },
  ],
};
