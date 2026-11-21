import { P } from '../iso.js';
import { panel } from './solar.js';
import { house, pylon, smooth } from './common.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Power and Electricity Systems" notes (demand response, Hawaii water-heater VPP, thermostats, US DR scale, OG&E SmartHours, demand flexibility).
const HX = (h) => 22 + h * 10.8, LY = (v) => 156 - v * 1.1;
const base = [[0, 40], [5, 34], [9, 52], [13, 62], [17, 84], [19, 80], [22, 52], [24, 42]];
const withDr = [[0, 40], [5, 34], [9, 52], [13, 60], [15, 52], [17, 56], [19, 58], [21, 66], [23, 54], [24, 42]];
const ln = (pts, col, dash) => `<path d="${smooth(pts.map(([h, v]) => [HX(h), LY(v)]))}" fill="none" stroke="${col}" stroke-width="2.6" ${dash ? 'stroke-dasharray="5 3"' : ''} stroke-linecap="round"/>`;
const event = `<path class="ax" d="M22,156H284M22,156V40"/>
  <rect x="${HX(14)}" y="40" width="${HX(19) - HX(14)}" height="116" fill="#e9fc82" opacity=".45"/><text x="${HX(14) + 2}" y="50" style="font-size:8px;font-weight:700">call event</text>
  ${ln(base, '#8b847a', true)}${ln(withDr, '#d0683a')}
  <text x="22" y="170">0h</text><text x="${HX(12) - 10}" y="170">noon</text><text x="${HX(24) - 14}" y="170">24h</text>
  <text x="${HX(20.4)}" y="${LY(66) - 8}" style="font-size:8.5px;font-weight:700;fill:#a5470f">rebound</text>
  <text x="12" y="184" style="font-size:8.5px"><tspan fill="#8b847a" font-weight="700">┅</tspan> normal   <tspan fill="#d0683a" font-weight="700">━</tspan> with demand response</text>`;

const TX = (h) => 28 + (h - 10) * 25, TY = (c) => 156 - (c - 20) * 28;
const therm = `<path class="ax" d="M28,156H284M28,156V40"/>
  <rect x="${TX(14)}" y="40" width="${TX(16) - TX(14)}" height="116" fill="#e9fc82" opacity=".5"/><text x="${TX(14) + 1}" y="50" style="font-size:8px;font-weight:700">peak 2–4 pm</text>
  <path d="M28,${TY(22)}H284" stroke="#8b847a" stroke-dasharray="4 3" stroke-width="1.4"/>
  <path d="${smooth([[10, 22], [12, 22], [14, 21], [16, 23], [17, 22], [20, 22]].map(([h, c]) => [TX(h), TY(c)]))}" fill="none" stroke="#2f86ce" stroke-width="2.8" stroke-linecap="round"/>
  <text x="${TX(12.1)}" y="${TY(21) + 14}" style="font-size:8.5px;font-weight:700;fill:#1f63a0">pre-cool 1 °C</text><text x="${TX(14.5)}" y="${TY(23) - 7}" style="font-size:8.5px;font-weight:700;fill:#a5470f">drift +1 °C</text>
  <text x="28" y="170">10 am</text><text x="${TX(15) - 8}" y="170">3 pm</text><text x="${TX(20) - 14}" y="170">8 pm</text><text x="8" y="${TY(22) + 3}">22°</text>
  <text x="12" y="184" style="font-size:8.5px">air conditioner stays off through the peak</text>`;

const scale = bars([{ label: 'US capacity', value: 1050, color: '#c9ccd1' }, { label: 'US demand resp.', value: 20, color: '#a6d38b' }], { w: 300, labelW: 112, max: 1500, fmt: (v) => `${v >= 1000 ? '≈ 1,050' : '≈ 20'} GW`, y0: 40, h: 20, gap: 14, note: 'about 1.5–2% of capacity, far cheaper than peakers' });

export default {
  id: 'demand', group: 'systems', title: 'Demand Response & Flexibility', icon: 'house', time: 10, level: 'Intermediate',
  tagline: 'The cheapest power plant is often a megawatt you did not need to use: how homes, water heaters and thermostats help balance the grid.',
  stats: [
    { id: 'hi', label: 'Hawaii water heaters', icon: 'droplet' }, { id: 'us', label: 'US demand response', icon: 'chart' },
    { id: 'band', label: 'Thermostat drift', icon: 'thermo' }, { id: 'price', label: 'OG&E peak price', icon: 'zap' },
  ],
  legend: [['#e8a33a', 'power'], ['#7c63d0', 'grid signal']],
  learn: [
    { t: 'What a “negawatt” is', at: 0 }, { t: 'Load shifting versus curtailing, and the rebound', at: 1 },
    { t: 'How water heaters become a virtual power plant', at: 2 }, { t: 'How a thermostat stores cooling', at: 3 },
    { t: 'Why demand flexibility replaces emergency demand response', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.raw('solar', panel(0.5, 1.0, 1.8, 1.4) + panel(2.5, 1.0, 1.8, 1.4), { k: 6 });
    s.box('control', 7.0, 1.0, 0, 1.6, 1.4, 1.2, 'white', { label: { t: 'utility control room', icon: 'tower' } });
    s.raw('pylon', pylon(9.4, 2.2, 2.6), { k: 7 });
    house(s, 'home', 1.0, 5.4, { label: { t: 'home, smart thermostat', icon: 'house' } });
    s.cyl('heater', 3.0, 5.9, 0, 0.35, 1.2, 'steel', { label: { t: 'water heater', icon: 'thermo' } });
    s.box('ev', 4.4, 7.4, 0, 1.4, 0.8, 0.5, 'blue', { label: { t: 'electric car', icon: 'zap' } });
    s.box('factory', 6.6, 5.2, 0, 1.8, 1.6, 1.3, 'cream', { label: { t: 'factory', icon: 'factory' } });
    s.flow('f-sol', [[2.4, 2.8, 0.05], [2.4, 5.4, 0.05]], 'electric', {});
    ['home', 'heater', 'ev', 'factory'].forEach((id, i) => s.flowS('sig-' + id, [P(7.8, 2.4, 0.6), [[P(2.0, 5.6, 0.8), P(3.0, 5.9, 0.9), P(5.0, 7.6, 0.4), P(7.4, 5.8, 0.8)][i]][0]], 'ac', { cls: 'slow' }));
    s.card('event', 'A DEMAND RESPONSE CALL EVENT', event, { w: 300, h: 194, from: 1, until: 1 });
    s.card('hawaii', 'HAWAII’S THERMAL BATTERIES', list([['Load build, midday', 'pre-heat tanks with surplus solar'], ['Load shed, evening', 'hold heaters off up to an hour'], ['Hot water unaffected', 'the tank is already full'], ['Together', 'about 15 MW of virtual power plant']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('therm', 'A THERMOSTAT AS A FLYWHEEL', therm, { w: 300, h: 194, from: 3, until: 3 });
    s.card('scale', 'HOW BIG IS IT ALREADY?', scale + list([['OG&E SmartHours', '120,000 homes; peak $0.10 → $1.00 per kWh'], ['Savings', 'about $200–300 per household a summer']], { y0: 130, gap: 30 }), { w: 300, h: 196, from: 4, until: 4 });
    s.card('flex', 'FROM EMERGENCY TO EVERYDAY', list([['Legacy demand response', '10–20 calls a year, to dodge peakers'], ['Demand flexibility', 'daily price or carbon signals'], ['Automated devices', 'thermostats, heaters, chargers, batteries'], ['The hurdle', 'getting customers to enrol at the point of sale']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Negawatts', tag: 'CONCEPT', title: 'A megawatt saved is a megawatt generated',
      body: ['Instead of treating demand as fixed, a grid can reshape it. Using less at a scarce moment, a “negawatt”, has the same effect on the grid as generating that power.',
        'Three levers: time-varying prices that rise in scarce hours, automated smart controls that react to price or grid stress, and payments for agreeing to cut use when called.'],
      callout: { k: 'key', t: 'Demand response can also run the other way: use more when wind or hydro is in surplus, so clean power is not wasted.' },
      focus: ['control', 'home', 'heater', 'ev', 'factory'], flows: ['sig-home', 'sig-heater', 'sig-ev', 'sig-factory'],
    },
    {
      short: 'Call event', tag: 'METHOD', title: 'Shift it, do not just cut it',
      body: ['In a demand response call event, a utility signals customers to cut use during the afternoon peak. A factory may stop production then and run it late in the evening instead.',
        'That moves load rather than removing it, and creates a rebound later at night, when system demand is low and the extra is harmless.'],
      callout: { k: 'know', t: 'The rebound is planned. Good programs place it where the grid has room, not at the next peak.' },
      focus: ['factory', 'control'], flows: ['sig-factory'],
    },
    {
      short: 'Hawaii', tag: 'CONCEPT', title: 'Hot-water tanks as batteries',
      body: ['Hawaii’s island grids are isolated and run on imported oil, so it built wind and solar to 30–50% of power. That leaves midday surplus and an evening shortage.',
        'Hawaiian Electric fitted thousands of home water heaters with control boxes. At midday they pre-heat slightly, storing solar as heat. In the evening peak they hold off for up to an hour while people keep using hot water. Together they act as a roughly 15 MW virtual power plant.'],
      callout: { k: 'key', t: 'A tank of hot water is already an energy store. A control box turns it into grid storage for almost no extra hardware.' },
      focus: ['heater', 'control', 'solar'], flows: ['f-sol', 'sig-heater'], stats: { hi: '≈ 15 MW' },
    },
    {
      short: 'Thermostats', tag: 'METHOD', title: 'Pre-cool, then coast',
      body: ['Before an expected 2–4 p.m. grid peak, an opted-in thermostat cools the home 1 °C below the usual setting starting at noon. At 2 p.m. it lets the temperature drift up to 1 °C above.',
        'That 2 °C band keeps the air conditioner off through the whole peak, with manual override always available.'],
      callout: { k: 'know', t: 'The house itself is the thermal flywheel: walls and air store the cooling, so comfort is barely affected.' },
      focus: ['home', 'control'], flows: ['sig-home'], stats: { band: '±1 °C' },
    },
    {
      short: 'How big', tag: 'NUMBERS', title: 'Already about 20 GW in the US',
      body: ['US demand response programmes can cut roughly 20 GW of peak load, about 1.5–2% of the country’s 1,000-plus GW of generating capacity, and much cheaper than building peaking plants for a few hot afternoons.',
        'Oklahoma Gas & Electric’s SmartHours has about 120,000 homes. When supply is tight, peak prices jump from around $0.10 to as much as $1.00 per kWh, thermostats cut back, and households save about $200–300 a summer.'],
      callout: { k: 'warn', t: 'Programmes work because customers keep control and are paid. Heavy-handed ones lose enrolment fast.' },
      focus: ['control', 'home', 'factory', 'ev'], flows: ['sig-home', 'sig-ev', 'sig-factory'], stats: { us: '≈ 20 GW', price: '$0.10 → $1.00' },
    },
    {
      short: 'Flexibility', tag: 'CONCEPT', title: 'From emergency tool to daily habit',
      body: ['Old demand response was an emergency lever pulled 10 to 20 times a year to avoid peaker plants. With lots of wind and solar, the same loads can be shifted every day toward clean, low-priced hours.',
        'Automated price or carbon signals drive thermostats, heaters, chargers and home batteries by API. The bottleneck is getting customers enrolled, best done when the device is sold.'],
      callout: { k: 'key', t: 'Using existing loads is far cheaper than building grid batteries, but it needs automation, not asking people to remember.' },
      focus: ['control', 'home', 'heater', 'ev', 'factory', 'solar'], flows: ['sig-home', 'sig-heater', 'sig-ev', 'sig-factory', 'f-sol'],
    },
  ],
};
