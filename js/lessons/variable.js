import { P } from '../iso.js';
import { panel } from './solar.js';
import { turbine } from './wind.js';
import { house, pylon } from './common.js';
import { list } from './cards.js';

// Source: the "Renewable Power and Electricity Systems" notes (variable renewable integration, spatial smoothing, forecasting, flexibility pillars, case studies).
// Chart curves are synthetic but built to show the effect the notes describe: smoothing by aggregation and better forecasts at short horizons.
const N = 90;
const TX = (i) => 22 + (i / (N - 1)) * 262, VY = (v) => 156 - v * 1.1;
const raw = (k) => (i) => 50 + 22 * Math.sin(i * 0.35 + k * 1.7) + 17 * Math.sin(i * 0.9 + k * 3.1) + 9 * Math.sin(i * 1.7 + k * 0.4);
const mean = (ks) => (i) => ks.reduce((a, k) => a + raw(k)(i), 0) / ks.length;
const path = (f, col, w = 2.2) => `<polyline points="${Array.from({ length: N }, (_, i) => `${TX(i).toFixed(1)},${VY(f(i)).toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`;
const axes = `<path class="ax" d="M22,156H284M22,156V40"/>`;
const smooth = axes + path(raw(0), '#d0683a', 1.6) + path(mean([0, 1, 2]), '#e8a33a', 2) + path(mean([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), '#2f86ce', 3)
  + `<text x="12" y="176" style="font-size:8.5px"><tspan fill="#d0683a" font-weight="700">━</tspan> one turbine  <tspan fill="#e8a33a" font-weight="700">━</tspan> one wind farm  <tspan fill="#2f86ce" font-weight="700">━</tspan> a region</text>`;
const actual = (i) => 50 + 26 * Math.sin(i * 0.12) + 9 * Math.sin(i * 0.31);
const forecast = axes + path((i) => actual(i) + 12 * Math.sin(i * 0.09 + 1), '#8b847a', 1.6).replace('/>', ' stroke-dasharray="5 3"/>') + path((i) => actual(i) + 2.5 * Math.sin(i * 0.6), '#4caf50', 2) + path(actual, '#172720', 2.6)
  + `<text x="12" y="176" style="font-size:8.5px"><tspan fill="#172720" font-weight="700">━</tspan> actual  <tspan fill="#8b847a" font-weight="700">┅</tspan> day-ahead  <tspan fill="#4caf50" font-weight="700">━</tspan> 2 hours ahead</text>`;

export default {
  id: 'variable', group: 'systems', title: 'Integrating Wind & Solar', icon: 'wind', time: 11, level: 'Intermediate',
  tagline: 'When supply varies too, the grid needs new tools: wider footprints, better forecasts, flexible plants, storage and flexible demand.',
  stats: [
    { id: 'dk', label: 'Denmark, wind', icon: 'wind' }, { id: 'ca', label: 'California, solar', icon: 'sun' },
    { id: 'ct', label: 'Gas turbine min load', icon: 'flame' }, { id: 'coal', label: 'New coal ramp', icon: 'chart' },
  ],
  legend: [['#e8a33a', 'power to the hub'], ['#7c63d0', 'trade with neighbours']],
  learn: [
    { t: 'Why variable supply makes a two-sided problem', at: 0 }, { t: 'What net demand is and why it distorts the day', at: 1 },
    { t: 'How aggregation smooths wind and solar', at: 2 }, { t: 'Why short-horizon forecasts are so good', at: 3 },
    { t: 'The six pillars of flexibility, cheapest first', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    turbine(s, { x: 1.2, y: 3.0, sc: 0.55, suf: 'A' }); turbine(s, { x: 2.8, y: 3.0, sc: 0.55, suf: 'B' }); turbine(s, { x: 4.4, y: 3.0, sc: 0.55, suf: 'C' });
    s.labelS('towerA:l', P(2.8, 3.0, 0)[0], P(2.8, 3.0, 0)[1] - 132 * 0.55 - 52, { t: 'wind farm', icon: 'wind' }, { dy: 0 });
    s.raw('solar', panel(0.6, 5.4, 1.8, 1.4) + panel(2.6, 5.4, 1.8, 1.4), { k: 14 });
    s.label('solar:l', 2.5, 6.1, 1.9, { t: 'solar', icon: 'sun' }, {});
    s.box('gas', 5.6, 5.4, 0, 1.6, 1.3, 1.0, 'steel', { label: { t: 'flexible gas', icon: 'flame' } });
    s.box('hub', 5.2, 3.6, 0, 0.9, 0.9, 0.8, 'concrete', { k: 12, label: { t: 'the grid', icon: 'tower' } });
    house(s, 'city', 7.2, 7.4, { label: { t: 'demand', icon: 'house' } }); house(s, 'city', 8.6, 6.2);
    s.box('norway', 8.4, 0.6, 0, 1.4, 1.4, 1.0, 'blue', { label: { t: 'hydro next door', icon: 'droplet' } });
    s.raw('pylon', pylon(7.4, 1.8, 2.6), { k: 9 });
    const hub = [5.6, 4.0, 0.05];
    s.flow('f-wind', [[3.6, 3.4, 0.05], [3.6, 4.0, 0.05], hub], 'electric', {});
    s.flow('f-solar', [[2.4, 6.6, 0.05], [4.8, 6.6, 0.05], [4.8, 4.0, 0.05], hub], 'electric', {});
    s.flow('f-gas', [[5.8, 5.4, 0.05], [5.8, 4.6, 0.05]], 'electric', {});
    s.flow('f-city', [[6.2, 4.4, 0.05], [7.0, 4.4, 0.05], [7.0, 7.4, 0.05], [7.4, 7.9, 0.05]], 'ac', {});
    s.flow('f-trade', [[6.2, 3.9, 0.05], [8.4, 2.1, 0.05]], 'hv', { cls: 'slow' });
    s.card('two', 'WHERE VARIABLE POWER IS ALREADY BIG', list([['Denmark', 'wind near 50% of power (2019)'], ['Ireland', 'wind above 30%'], ['Portugal, Germany, UK, Spain', 'wind above 20%'], ['California', 'solar about 20%, more than any country'], ['Honduras', 'solar 15%, the national leader']], { gap: 28 }), { w: 300, h: 180, from: 0, until: 0 });
    s.card('smooth', 'SMOOTHING BY AGGREGATION', smooth, { w: 300, h: 190, from: 2, until: 2 });
    s.card('fore', 'FORECASTS GET BETTER NEARER THE HOUR', forecast, { w: 300, h: 190, from: 3, until: 3 });
    s.card('pillars', 'SIX FLEXIBILITY PILLARS, CHEAPEST FIRST', list([['System & market operations', 'forecasting, scheduling, curtailment'], ['Transmission', 'a wider footprint'], ['Demand response', 'shift use to windy, sunny hours'], ['Flexible plants', 'lower minimum load, faster ramps'], ['Storage', 'batteries and pumped hydro'], ['Sector coupling', 'EVs and green hydrogen']], { gap: 28 }), { w: 300, h: 206, from: 4, until: 4 });
    s.card('cases', 'FOUR REAL STRATEGIES', list([['Denmark', 'links to Norway’s hydro, plus forecasting'], ['Ireland', 'one island grid, subsea DC links'], ['Texas', 'new lines; wind bids into the market'], ['California', 'batteries and market reform']], { gap: 32 }), { w: 300, h: 168, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Two-sided', tag: 'PROBLEM', title: 'Now supply varies too',
      body: ['The old grid had one moving part: demand. Wind and solar add a second. Their output follows weather and the sun, not the clock, so supply and demand can drift apart in both directions.',
        'This is no longer a rounding error. Denmark got nearly half its electricity from wind in 2019, and California about a fifth from solar.'],
      callout: { k: 'key', t: 'Wind and solar have near-zero running cost, so operators take their output first. Everything else has to bend around it.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB', 'towerC', 'nacelleC', 'rotorC', 'solar'], flows: ['f-wind', 'f-solar'], stats: { dk: '≈ 50%', ca: '≈ 20%' },
    },
    {
      short: 'Net demand', tag: 'PROBLEM', title: 'Two problems for the operator',
      body: ['First, shape. Subtract must-run wind and solar from demand and what is left, net demand, has a deep midday dip and a steep late-afternoon climb.',
        'Second, speed. On an otherwise sunny day a cloud front can drop solar by hundreds of megawatts within minutes, and conventional plants must respond.'],
      callout: { k: 'warn', t: 'The slow, big plants cannot follow either change. The answer is not one fix but a toolbox.' },
      focus: ['solar', 'gas', 'hub', 'city'], flows: ['f-solar', 'f-gas', 'f-city'],
    },
    {
      short: 'Smoothing', tag: 'METHOD', title: 'A bigger area is a calmer area',
      body: ['One turbine’s output jumps up and down. Twenty to fifty turbines already smooth much of it, because gusts and lulls cancel. Across a whole region, most of the fast jitter disappears.',
        'The same holds for solar: a cloud shades one area while another stays sunny, so statewide output follows a smooth bell curve.'],
      callout: { k: 'know', t: 'The challenge at the grid level is much smaller than the volatility seen at a single turbine or panel.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB', 'towerC', 'nacelleC', 'rotorC'], flows: ['f-wind', 'f-solar'],
    },
    {
      short: 'Forecasts', tag: 'METHOD', title: 'Seeing it coming',
      body: ['Day-ahead wind forecasts catch the trend but miss by some distance. Forecasts four hours and two hours ahead track actual output closely, giving control rooms time to schedule reserves.',
        'Turbine makers also redesign pitch controls and power electronics so each machine ramps more smoothly, and so renewables themselves can help hold the grid steady.'],
      callout: { k: 'key', t: 'Uncertainty shrinks as the hour approaches. Markets that schedule close to real time use that, and the forecasts, to cut how much reserve they hold.' },
      focus: ['hub'], flows: [],
    },
    {
      short: 'Toolbox', tag: 'CONCEPT', title: 'Six pillars, cheapest first',
      body: ['Flexibility comes in a cost order: better operations and markets, more transmission, demand response, flexible plants, then storage and sector coupling (EVs and hydrogen) for the highest shares.',
        'Existing plants are more flexible than assumed. Older gas turbines throttled down only to 40–50% load; modern ones run stably down to 20%. Older hard-coal plants ramp 1.5–4% per minute; newer ones 3–6%.'],
      callout: { k: 'know', t: 'Using the flexibility already in the system is far cheaper than building batteries. The expensive tools matter most once the cheap ones are used up.' },
      focus: ['gas', 'hub', 'norway'], flows: ['f-gas', 'f-trade'], stats: { ct: '20%', coal: '3–6%/min' },
    },
    {
      short: 'Real grids', tag: 'CONCEPT', title: 'No two grids use the same mix',
      body: ['Denmark sells surplus wind to Norway and buys flexible Norwegian hydro in calm spells. Ireland merged two grids into one and added subsea direct-current links. Texas built lines to move West Texas wind east and let wind farms bid into the market.',
        'California leans on batteries and market reform. Each region mixes the same tools differently, set by its geography.'],
      callout: { k: 'key', t: 'High shares of wind and solar are operationally manageable when market rules and physical infrastructure change together.' },
      focus: ['norway', 'pylon', 'hub', 'gas'], flows: ['f-trade', 'f-gas', 'f-city'],
    },
  ],
};
