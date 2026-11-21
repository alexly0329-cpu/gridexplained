import { house } from './common.js';
import { list, table, bars } from './cards.js';

// Trader track. General market knowledge, not from the course notes. Load curves are synthetic shapes; the regression and error costs are computed from stated illustrative inputs.
const HDD = (t) => Math.max(0, 65 - t), CDD = (t) => Math.max(0, t - 65);
const BASE = 100, PER_HDD = 0.8, LOAD_AT = (hdd) => +(BASE + PER_HDD * hdd).toFixed(0);
const MW = 100, DAY_H = 24, RT = 120, HEDGE = 50;                       // $/MWh spot vs hedged
const MISS = (p) => Math.round(p * MW * DAY_H * (RT - HEDGE));
const g = (h, c, w) => Math.exp(-0.5 * ((h - c) / w) ** 2);
const SHAPES = [
  ['#d0683a', (h) => 22 + 14 * g(h, 7, 1.6) + 42 * g(h, 19, 2.6)],     // homes: morning bump, evening peak
  ['#2f86ce', (h) => 16 + 56 * g(h, 13, 4.2)],                        // shops and offices: daytime
  ['#6f9a3c', () => 58],                                              // industry: flat
];
const X = (h) => 22 + (h / 24) * 262, Y = (v) => 150 - v * 1.15;
const shapes = `<path class="ax" d="M22,150H284M22,150V40"/>${SHAPES.map(([c, f]) => `<polyline fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" points="${Array.from({ length: 25 }, (_, h) => `${X(h).toFixed(1)},${Y(f(h)).toFixed(1)}`).join(' ')}"/>`).join('')}
  <text x="12" y="176" style="font-size:8.5px"><tspan fill="#d0683a" font-weight="700">━</tspan> homes  <tspan fill="#2f86ce" font-weight="700">━</tspan> offices and shops  <tspan fill="#6f9a3c" font-weight="700">━</tspan> factories</text>
  <text x="22" y="160" style="font-size:8px">0h</text><text x="142" y="160" style="font-size:8px">12h</text><text x="262" y="160" style="font-size:8px">24h</text>`;

export default {
  id: 'loadweather', group: 'systems', track: 'trader', title: 'Load & Weather Risk', icon: 'thermo', time: 11, level: 'Intermediate',
  tagline: 'How customer load follows the clock and the weather, how a forecast is made, and what a missed forecast costs.',
  stats: [
    { id: 'hdd', label: 'Heating degree days', icon: 'thermo' }, { id: 'load', label: 'Forecast load', icon: 'zap' },
    { id: 'err', label: 'Forecast miss', icon: 'gauge' }, { id: 'cost', label: 'Cost of a 5% miss', icon: 'chart' },
  ],
  legend: [['#e8a33a', 'power'], ['#5b9bd5', 'cold air']],
  learn: [
    { t: 'How load differs by customer type', at: 0 }, { t: 'What heating and cooling degree days measure', at: 1 },
    { t: 'How a weather-based load forecast works', at: 2 }, { t: 'What a missed forecast costs', at: 3 },
    { t: 'Why a cold snap hits twice', at: 4 }, { t: 'What a daily forecast routine looks like', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.poly('cold', [[0.4, 4.2, 0.03], [4.6, 4.2, 0.03], [4.6, 9.4, 0.03], [0.4, 9.4, 0.03]], 'blue', { from: 1, k: -5 });
    s.label('cold:l', 2.5, 6.8, 0.1, { t: 'cold front', icon: 'thermo' }, { from: 1 });
    s.box('fc', 0.8, 1.0, 0, 1.6, 1.4, 1.0, 'white', { label: { t: 'forecast desk', icon: 'gauge' } });
    s.box('grid', 3.0, 1.2, 0, 0.9, 0.9, 0.8, 'concrete', { label: { t: 'grid', icon: 'tower' } });
    house(s, 'homes', 6.0, 1.0, { label: { t: 'homes', icon: 'house' } }); house(s, 'homes', 7.6, 2.4);
    s.box('shop', 6.0, 4.4, 0, 1.6, 1.3, 0.9, 'cream', { label: { t: 'offices, shops', icon: 'house' } });
    s.box('fac', 6.4, 6.6, 0, 1.8, 1.4, 1.0, 'steel', { label: { t: 'factory', icon: 'factory' } });
    s.flow('f-home', [[3.9, 1.7, 0.05], [6.0, 1.7, 0.05]], 'ac', {});
    s.flow('f-biz', [[4.4, 1.7, 0.05], [4.4, 5.0, 0.05], [6.0, 5.0, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-fac', [[4.4, 5.0, 0.05], [4.4, 7.3, 0.05], [6.4, 7.3, 0.05]], 'ac', { cls: 'slow' });
    s.card('shape', 'LOAD SHAPES (ILLUSTRATION)', shapes, { w: 300, h: 186, from: 0, until: 0 });
    s.card('deg', 'DEGREE DAYS (BASE 65 °F)', table(['Average °F', 'Heating', 'Cooling'], [25, 45, 65, 85].map((t) => [`${t} °F`, `${HDD(t)}`, `${CDD(t)}`]), { cols: [12, 100, 200], rowH: 26 }), { w: 300, h: 160, from: 1, until: 1 });
    s.card('reg', 'LOAD FROM TEMPERATURE (ILLUSTRATION)', bars([0, 20, 40].map((h, i) => ({ label: `${h} heating days`, value: LOAD_AT(h), color: ['#a6d38b', '#f6d77e', '#f1b3a3'][i] })), { w: 300, labelW: 98, max: 140, fmt: (v) => `${v} MW`, y0: 40, h: 20, gap: 14, note: `${BASE} MW base + ${PER_HDD} MW per heating degree day` }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('miss', 'COST OF ONE MISSED DAY', bars([0.02, 0.05, 0.1].map((p, i) => ({ label: `${p * 100}% miss`, value: MISS(p), color: ['#cfe3b2', '#f6d77e', '#f1b3a3'][i] })), { w: 300, labelW: 62, max: MISS(0.1), fmt: (v) => `$${v.toLocaleString('en-US')}`, y0: 40, h: 20, gap: 14, note: `${MW} MW load; gap bought at $${RT}, hedged at $${HEDGE}` }), { w: 300, h: 160, from: 3, until: 3 });
    s.card('snap', 'THE COLD SNAP DOUBLE HIT', list([['Load jumps', 'heating demand rises together'], ['Prices jump too', 'gas gets tight, peakers run'], ['The gap is bought dear', 'short exactly when it hurts'], ['Hedges help only so far', 'if sized to the normal forecast']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('daily', 'A DAILY ROUTINE', list([['Pull the new weather runs', 'compare to yesterday’s'], ['Re-run the load forecast', 'by customer class and zone'], ['Update the position', 'see where it is now open'], ['Tell the team', 'before the market moves']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Load shapes', tag: 'CONCEPT', title: 'Every customer type has a shape',
      body: ['Homes peak in the evening, with a smaller bump at breakfast. Offices and shops peak in the daytime. Factories running in shifts are almost flat.',
        'A supplier’s total load is the sum of these shapes, so its mix of customers decides what hours it must buy.'],
      callout: { k: 'key', t: 'Price risk depends on shape. A flat factory and a home need different hedges even at the same annual usage.' },
      focus: ['homes', 'shop', 'fac'], flows: ['f-home', 'f-biz', 'f-fac'],
    },
    {
      short: 'Degree days', tag: 'NUMBERS', title: 'Temperature turned into a number',
      body: [`Heating degree days measure how far a day’s average temperature falls below 65 °F: ${HDD(25)} at 25 °F, ${HDD(45)} at 45 °F. Cooling degree days measure how far it rises above: ${CDD(85)} at 85 °F.`,
        'They are the standard way to link weather to energy use, because people turn on heating or cooling roughly in proportion.'],
      callout: { k: 'know', t: 'Mild spring and autumn days score zero on both. That is when load is lowest.' },
      focus: ['cold', 'fc', 'homes'], flows: [], stats: { hdd: `${HDD(25)} at 25 °F` },
    },
    {
      short: 'Forecast', tag: 'METHOD', title: 'Forecasting load from weather',
      body: [`Fit past load against degree days for each customer class and zone. In this illustration a zone uses ${BASE} MW with no heating need and gains ${PER_HDD} MW per heating degree day, so ${LOAD_AT(20)} MW at 20 and ${LOAD_AT(40)} MW at 40.`,
        'Add calendar effects, such as weekdays, holidays and daylight, then feed in the weather forecast for each hour to get the load forecast.'],
      callout: { k: 'know', t: 'The forecast is only as good as the weather forecast behind it, which is why short-term weather risk is its own job.' },
      focus: ['fc', 'grid', 'homes', 'shop', 'fac'], flows: ['f-home'], stats: { load: `${LOAD_AT(40)} MW at 40` },
    },
    {
      short: 'Cost of a miss', tag: 'NUMBERS', title: 'What a forecast error costs',
      body: [`A ${MW} MW portfolio hedged at $${HEDGE} that turns out 5% short for a day must buy ${0.05 * MW * DAY_H} MWh at the spot price of $${RT}: ${0.05 * MW * DAY_H} × $${RT - HEDGE} = $${MISS(0.05).toLocaleString('en-US')} extra. A 10% miss costs twice that.`,
        'Errors in the other direction mean selling surplus power cheap. The cost is real either way.'],
      callout: { k: 'warn', t: 'Small percentage errors are small money only when spot is close to the hedge price. They are not in a cold snap.' },
      focus: ['fc', 'grid'], flows: ['f-home'], stats: { err: '5%', cost: `$${MISS(0.05).toLocaleString('en-US')}` },
    },
    {
      short: 'Cold snap', tag: 'PROBLEM', title: 'Load and price rise together',
      body: ['A cold front raises heating load and tightens gas supplies at once, so prices rise as the portfolio needs more power. A supplier that is even slightly short buys the gap at the worst moment.',
        'Weather products such as heating-degree-day swaps and options can hedge part of this, though they cover temperature, not price directly.'],
      callout: { k: 'key', t: 'Load and price are correlated in extremes. A forecast that is right on average can still be badly wrong when it matters most.' },
      focus: ['cold', 'homes', 'shop', 'fac', 'grid'], flows: ['f-home', 'f-biz', 'f-fac'],
    },
    {
      short: 'Routine', tag: 'METHOD', title: 'A forecast is a daily habit',
      body: ['Each day: read the new weather model runs and note what changed, rerun the load forecast, update the position report to see what is open, and tell the sales and trading teams if the market is about to move.',
        'Keep a record of forecast against actual, by class and zone. That is how a model improves.'],
      callout: { k: 'know', t: 'The position report lesson shows how the forecast feeds the numbers the desk acts on.' },
      focus: ['fc', 'grid'], flows: ['f-home'],
    },
  ],
};
