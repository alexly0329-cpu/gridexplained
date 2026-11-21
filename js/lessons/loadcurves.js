import { house, smooth } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Power and Electricity Systems" notes (load curves, regional shocks, thermal inertia, the baseload/peaking model).
// Curve shapes are illustrative, drawn to match the patterns the notes describe.
const HX = (h) => 22 + h * 10.8, VY = (v) => 156 - v * 1.1;
const NE = [[0, 52], [3, 45], [6, 60], [8, 82], [12, 84], [16, 86], [18, 96], [21, 82], [24, 55]];     // New England: ramp to 8am, flat day, 6pm peak
const CA = [[0, 52], [3, 46], [6, 62], [8, 88], [11, 62], [14, 48], [17, 78], [19, 100], [22, 72], [24, 55]]; // California 10 Feb 2020: 8am peak, 2pm trough, 6-7pm peak
const line = (pts, col, dash) => `<path d="${smooth(pts.map(([h, v]) => [HX(h), VY(v)]))}" fill="none" stroke="${col}" stroke-width="2.6" ${dash ? 'stroke-dasharray="5 3"' : ''} stroke-linecap="round"/>`;
const curves = `<path class="ax" d="M22,156H284M22,156V40"/>
  ${line(NE, '#2f86ce')}${line(CA, '#d0683a')}
  <text x="22" y="170">0h</text><text x="${HX(12) - 10}" y="170">noon</text><text x="${HX(24) - 14}" y="170">24h</text>
  <text x="${HX(18.4) - 6}" y="${VY(96) - 10}" style="font-size:8.5px;font-weight:700;fill:#1f63a0">NE 6 pm</text>
  <text x="${HX(11.5)}" y="${VY(46) + 14}" style="font-size:8.5px;font-weight:700;fill:#a5470f">CA 2 pm trough</text>
  <text x="12" y="184" style="font-size:8.5px"><tspan fill="#2f86ce" font-weight="700">━</tspan> New England   <tspan fill="#d0683a" font-weight="700">━</tspan> California, 10 Feb 2020</text>`;

const week = bars([{ label: 'Monday', value: 100 }, { label: 'Wednesday', value: 99 }, { label: 'Friday', value: 97 }, { label: 'Saturday', value: 85, color: '#f6d77e' }, { label: 'Sunday', value: 79, color: '#f6d77e' }], { w: 300, labelW: 84, max: 100, fmt: () => '', note: 'Great Britain, relative load (illustrative)' });

export default {
  id: 'loadcurves', group: 'systems', title: 'Load Curves & Dispatch', icon: 'chart', time: 10, level: 'Beginner',
  tagline: 'Demand moves by the hour, the week and the season. Slow steam plants and fast turbines each cover a different part of it.',
  stats: [
    { id: 'match', label: 'Supply vs demand', icon: 'gauge' }, { id: 'lig', label: 'Lignite ramp', icon: 'chart' },
    { id: 'hot', label: 'Lignite hot start', icon: 'clock' }, { id: 'ct', label: 'Simple-cycle turbine', icon: 'flame' },
  ],
  legend: [['#e8a33a', 'power to the city']],
  learn: [
    { t: 'Why supply must track demand continuously', at: 0 }, { t: 'What daily load-curve shapes look like', at: 1 },
    { t: 'How week and season change demand', at: 2 }, { t: 'Why one town’s quirks shape its grid', at: 3 },
    { t: 'Why steam plants are slow and turbines fast', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.dome('nuke', 1.2, 2.8, 0, 0.8, 1.2, 0.5, 'concrete', { label: { t: 'nuclear', icon: 'atom' } });
    s.box('coal', 2.8, 2.0, 0, 1.8, 1.6, 1.1, 'steel', { label: { t: 'coal steam', icon: 'factory' } });
    s.cyl('coal', 3.4, 2.4, 1.1, 0.25, 1.7, 'concrete', { k: 14, shadow: false });
    s.box('hydro', 5.2, 2.0, 0, 1.6, 1.4, 1.0, 'concrete', { label: { t: 'hydro', icon: 'droplet' } });
    s.box('ccgt', 2.8, 4.4, 0, 1.8, 1.4, 1.0, 'steel', { label: { t: 'combined cycle', icon: 'flame' } });
    s.box('ct', 5.4, 4.4, 0, 1.2, 1.0, 0.8, 'flame', { label: { t: 'peaker', icon: 'zap' } });
    house(s, 'city', 7.2, 6.4, { label: { t: 'demand', icon: 'house' } }); house(s, 'city', 8.6, 7.8);
    const hub = [7.0, 6.6, 0.05];
    s.flow('f-nuke', [[2.0, 3.6, 0.05], [2.0, 6.6, 0.05], hub], 'electric', {});
    s.flow('f-coal', [[3.7, 3.8, 0.05], [3.7, 6.2, 0.05], [5.5, 6.2, 0.05], hub], 'electric', {});
    s.flow('f-hydro', [[6.0, 3.6, 0.05], [6.0, 5.6, 0.05], hub], 'electric', {});
    s.flow('f-ccgt', [[3.7, 5.8, 0.05], [3.7, 6.2, 0.05]], 'electric', {});
    s.flow('f-ct', [[6.0, 5.4, 0.05], [6.0, 5.8, 0.05], hub], 'electric', {});
    s.card('curves', 'TWO DAILY LOAD CURVES', curves, { w: 300, h: 194, from: 1, until: 1 });
    s.card('week', 'ONE WEEK, ONE GRID', week, { w: 300, h: 170, from: 2, until: 2 });
    s.card('local', 'LOCAL SHOCKS', list([['Florida', 'cold 5–10 °C mornings spike electric heaters'], ['New South Wales', 'timed water heaters peak after midnight'], ['New York, March 2020', 'lockdown cut demand by about 1 GW'], ['France', 'electric heating makes winter very sensitive']], { gap: 32 }), { w: 300, h: 168, from: 3, until: 3 });
    s.card('ramp', 'SLOW VERSUS FAST', table(['Plant', 'Ramp / start'], [['Lignite coal', '~1%/min, 6 h hot start'], ['Hard coal', '2–3 h hot start'], ['Combined cycle', 'faster than coal'], ['Simple-cycle turbine', '0→100% in minutes'], ['Nuclear', 'no load following'], ['Hydro', 'near instant']], { cols: [12, 134], rowH: 23 }), { w: 300, h: 196, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Match it', tag: 'CONCEPT', title: 'Supply tracks demand, always',
      body: ['Large-scale electricity storage is limited, so operators must match supply to demand within about 0.1%, every second of every day. When a customer switches something on, generation somewhere has to rise at once.',
        'A load curve plots demand over time. It is the grid operator’s daily problem set.'],
      callout: { k: 'key', t: 'Demand is not a number, it is a shape. Everything that follows is about which plants fit which part of the shape.' },
      focus: ['city'], flows: ['f-nuke', 'f-coal', 'f-hydro', 'f-ccgt', 'f-ct'], stats: { match: '99.9%' },
    },
    {
      short: 'One day', tag: 'CONCEPT', title: 'The shape of a day',
      body: ['The usual pattern is a minimum around 3–4 a.m., a steep morning ramp to about 8 a.m., a daytime plateau, and an evening peak. New England follows it, peaking near 6 p.m. when people get home.',
        'California on 10 February 2020 looks different: a morning peak, a deep trough near 2 p.m. as rooftop solar covers demand, then a sharp peak at 6–7 p.m. That is the duck curve.'],
      callout: { k: 'know', t: 'The trough is not a fall in demand. It is demand met by solar the grid operator never sees, before the evening return.' },
      focus: ['city'], flows: ['f-nuke', 'f-coal', 'f-hydro'],
    },
    {
      short: 'Week & season', tag: 'CONCEPT', title: 'Weekdays, weekends, summer, winter',
      body: ['In Great Britain the daily shape is similar Monday to Friday, then drops on Saturday and Sunday as offices and factories close.',
        'Season depends on climate. Where air conditioning is common, as in much of the United States, summer peaks, then winter, with spring lowest. Britain in 2011, with little air conditioning, peaked in winter for heating and lighting.'],
      callout: { k: 'key', t: 'The same grid needs different plants at different times of year. A summer afternoon and a winter morning are two separate problems.' },
      focus: ['city'], flows: [],
    },
    {
      short: 'Local quirks', tag: 'CONCEPT', title: 'What people own shapes the curve',
      body: ['The stock of appliances sets weather sensitivity. In Florida, a rare cold morning triggers a sharp spike because homes use electric resistance heaters, not gas furnaces.',
        'Tariffs shape load too. In New South Wales, timed water heaters switched on after midnight created an unplanned overnight peak. And in March 2020, New York City’s demand fell by roughly 1 GW within weeks of lockdown.'],
      callout: { k: 'know', t: 'A grid planner needs end-use knowledge, not just totals. Heaters, air conditioners and tariffs each leave a fingerprint on the curve.' },
      focus: ['city'], flows: [],
    },
    {
      short: 'Baseload & peak', tag: 'METHOD', title: 'Flat plants and fast plants',
      body: ['In the 20th-century model, coal and nuclear ran flat out as baseload, combined-cycle gas and hydro covered the middle, and simple-cycle gas turbines handled peaks.',
        'The split comes from physics. Coal, nuclear, geothermal and most biomass all boil water for a steam turbine. Boilers and turbines have huge thermal inertia, so they change output slowly.'],
      callout: { k: 'know', t: 'Colorado’s Fort St. Vrain was converted from nuclear to gas but kept its steam turbine, a reminder that the turbine, not the fuel, sets the speed.' },
      focus: ['nuke', 'coal', 'hydro', 'ccgt', 'ct'], flows: ['f-nuke', 'f-coal', 'f-hydro', 'f-ccgt', 'f-ct'],
    },
    {
      short: 'Slow vs fast', tag: 'NUMBERS', title: 'How slow is slow?',
      body: ['A German lignite plant ramps about 1% of its output per minute and takes around 6 hours for a hot start, 10 for a cold start. Hard coal needs 2–3 hours for a hot start.',
        'A simple-cycle gas turbine, derived from a jet engine, goes from 0 to 100% in minutes. Hydro can ramp nearly instantly, but water rules often limit it. Nuclear barely follows load at all.'],
      callout: { k: 'key', t: 'This 20th-century stack worked while only demand moved. Variable wind and solar break it, which is the next lesson.' },
      focus: ['coal', 'ct', 'hydro', 'nuke'], flows: ['f-coal', 'f-ct', 'f-hydro', 'f-nuke'], stats: { lig: '≈ 1%/min', hot: '6 h', ct: '0→100% in minutes' },
    },
  ],
};
