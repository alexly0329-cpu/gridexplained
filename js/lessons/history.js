import { P } from '../iso.js';
import { panel } from './solar.js';
import { list, table, bars } from './cards.js';
import { smooth } from './common.js';

// Source: the "Renewable Energy Futures" notes (historic energy transitions, decoupling, forecasting frameworks, IEA WEO and EIA AEO scenarios, the gap to <2 °C).
const X0 = 0.6, STEP = 1.9;
const cx = (i) => X0 + i * STEP + 0.8;
const mv = (i) => ({ '--mx': `${((cx(i) - 0.3) * 25.98).toFixed(1)}px`, '--my': `${((cx(i) - 0.3) * 15).toFixed(1)}px` });

// Illustrative index curves (1960 = 100): economies can grow while emissions flatten.
const YX = (y) => 24 + ((y - 1960) / 60) * 256, IY = (v) => 156 - (v - 60) * 0.22;
const gdp = Array.from({ length: 7 }, (_, i) => [1960 + i * 10, 100 * 1.034 ** (i * 10)]);
const energy = Array.from({ length: 7 }, (_, i) => [1960 + i * 10, 100 * 1.021 ** (i * 10)]);
const co2 = [[1960, 100], [1970, 128], [1980, 150], [1990, 168], [2000, 178], [2010, 192], [2020, 188]];
const lineOf = (pts, col, dash) => `<path d="${smooth(pts.map(([y, v]) => [YX(y), IY(Math.min(v, 330))]))}" fill="none" stroke="${col}" stroke-width="2.6" ${dash ? 'stroke-dasharray="5 3"' : ''} stroke-linecap="round"/>`;
const decouple = `<path class="ax" d="M24,156H284M24,156V40"/>${lineOf(gdp, '#2f86ce')}${lineOf(energy, '#e8a33a')}${lineOf(co2, '#d0683a')}
  <text x="24" y="170">1960</text><text x="${YX(2020) - 22}" y="170">2020</text>
  <text x="12" y="184" style="font-size:8.5px"><tspan fill="#2f86ce" font-weight="700">━</tspan> GDP  <tspan fill="#e8a33a" font-weight="700">━</tspan> energy use  <tspan fill="#d0683a" font-weight="700">━</tspan> CO₂ (illustrative)</text>`;

const gap = table(['Metric', 'Now', 'Planned', 'Needed'], [
  ['CO₂ per year', '34 Gt', 'small dip', '9.5 Gt'], ['Renewable energy', '> 10%', '25%', '66%'], ['Wind + solar power', '~ 10%', '> 33%', '61%'],
  ['Solar capacity', '~ 500 GW', '> 4,000', '~ 9,000'], ['Wind capacity', '~ 600 GW', '~ 2,400', '> 6,000'],
], { cols: [12, 124, 184, 240], rowH: 22, W: 290 });

export default {
  id: 'history', group: 'transition', title: 'Energy Transitions & Forecasts', icon: 'chart', time: 10, level: 'Beginner',
  tagline: 'From wood to coal to oil and gas, and why forecasts of the next transition keep missing: scenarios, targets and the gap to climate goals.',
  stats: [
    { id: 'en', label: 'Renewables, all energy', icon: 'layers' }, { id: 'el', label: 'Renewables, power', icon: 'zap' },
    { id: 'co2', label: 'CO₂ per year', icon: 'flame' }, { id: 'gap', label: 'Extra renewables needed', icon: 'gauge' },
  ],
  legend: [['#d9c4a0', 'biomass'], ['#4a4743', 'coal'], ['#8b9098', 'oil & gas'], ['#a6d38b', 'modern renewables']],
  learn: [
    { t: 'Why fuels win: density and convenience, not scarcity', at: 1 }, { t: 'What “decoupling” means', at: 3 },
    { t: 'Three kinds of forecast and what each answers', at: 4 }, { t: 'How far current plans fall short', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    const y = 4.6;
    // 1: biomass, 2: coal, 3: oil + gas, 4: modern renewables
    s.box('wood', X0, y, 0, 1.6, 1.6, 0.7, 'dirt', { label: { t: 'wood & biomass' }, lopt: { dy: -8 } });
    s.box('wood', X0 + 0.15, y + 0.15, 0.7, 1.3, 1.3, 0.35, 'dirt', { k: 20 });
    s.box('coal', X0 + STEP, y, 0, 1.6, 1.6, 0.9, 'black', { label: { t: 'coal' }, lopt: { dy: -8 } });
    s.cyl('oil', X0 + 2 * STEP + 0.4, y + 0.5, 0, 0.35, 0.9, 'dark', { label: { t: 'oil' }, lopt: { dy: -8 } });
    s.cyl('oil', X0 + 2 * STEP + 1.1, y + 0.9, 0, 0.35, 0.9, 'dark', { k: 21 });
    s.cyl('gas', X0 + 3 * STEP + 0.8, y + 0.8, 0, 0.75, 1.1, 'white', { label: { t: 'natural gas' }, lopt: { dy: -8 } });
    s.raw('ren', panel(X0 + 4 * STEP, y + 0.1, 1.5, 1.2), { k: 24 });
    s.label('ren:l', X0 + 4 * STEP + 0.8, y + 0.9, 1.9, { t: 'wind & solar', icon: 'wind' }, {});
    const pl = [[0.3, 4.2, 0], [0.3, 6.6, 0], [0.3, 6.6, 2.6], [0.3, 4.2, 2.6]].map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ');
    s.raw('marker', `<g style="transform:translate(var(--mx,0px),var(--my,0px));transition:transform 1.1s cubic-bezier(.4,0,.2,1)"><polygon points="${pl}" fill="#e9fc82" fill-opacity=".4" stroke="#2b2722" stroke-width="2.2" stroke-dasharray="6 4"/></g>`, { k: 60 });
    s.card('share', 'TODAY’S SHARE OF RENEWABLES (2018)', bars([{ label: 'All energy', value: 18, color: '#a6d38b' }, { label: 'Electricity', value: 25, color: '#a6d38b' }, { label: 'of which hydro', value: 17, color: '#9fcdf0' }], { w: 300, labelW: 96, max: 30, fmt: (v) => (v === 17 ? '≈ 2/3 of it' : `≈ ${v}%`), note: 'hydro is about two thirds of renewable electricity' }), { w: 300, h: 130, from: 0, until: 0 });
    s.card('decouple', 'GROWTH WITHOUT MORE CARBON?', decouple, { w: 300, h: 194, from: 3, until: 3 });
    s.card('fw', 'THREE KINDS OF FORECAST', list([['Business as usual', 'if we keep walking this way, where do we end up?'], ['Aspirational (backcast)', 'start at the goal, map the road back'], ['Scenarios', 'policy paths, e.g. IEA STEPS vs SDS']], { gap: 40 }), { w: 300, h: 166, from: 4, until: 4 });
    s.card('gap', 'THE GAP: PLANNED VS NEEDED BY 2050', gap, { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Wood', tag: 'CONCEPT', title: 'Two centuries of one fuel after another',
      body: ['In 1800 the world burned mostly wood, crop waste and other traditional biomass. Burned in open fires, the absolute amount has hardly changed in 200 years, even as everything else grew around it.',
        'Today renewables supply about 18% of all energy once traditional biomass is counted, and about a quarter of electricity. Hydropower is roughly two thirds of that renewable electricity.'],
      callout: { k: 'key', t: 'Counting traditional biomass changes the story. “Modern” renewables (hydro, wind, solar, modern bioenergy) are a smaller slice, and the fast-growing one.' },
      focus: ['wood'], vars: mv(0), stats: { en: '≈ 18%', el: '≈ 25%' },
    },
    {
      short: 'Coal', tag: 'CONCEPT', title: 'Fuels win by working better',
      body: ['In the United States wood gave way to coal in the mid-to-late 1800s. Forests had not run out. A lump of coal burns hotter and longer than the same weight of wood and is easier to move.',
        'Oil and natural gas followed in the 20th century, again on performance and convenience, with price shocks in the 1970s along the way.'],
      callout: { k: 'know', t: 'Transitions happen because new fuels are better, not because old ones run out. Renewables have to win the same way: on cost and convenience.' },
      focus: ['coal'], vars: mv(1),
    },
    {
      short: 'Oil & gas', tag: 'CONCEPT', title: 'Fossil dominance, then “exotics”',
      body: ['Coal grew until 2000 while oil and natural gas surged. After 1950 nuclear and modern renewables, called exotics in the notes, appeared.',
        'Their share rose visibly after 2000 and accelerated after 2010, the point where wind and solar costs began to fall steeply.'],
      callout: { k: 'key', t: 'Energy growth and the burning of fossil fuels moved in lockstep for two centuries. The next step asks whether they have to.' },
      focus: ['oil', 'gas'], vars: mv(2.5),
    },
    {
      short: 'Decoupling', tag: 'CONCEPT', title: 'Growth without growing emissions',
      body: ['Economic growth, energy use and CO₂ rose together for most of history, but they are not permanently bound. Efficiency gains and cheap renewables let economies expand while emissions flatten or fall.',
        'The lines in the chart are illustrative: output keeps rising, energy use rises more slowly, and carbon emissions level off.'],
      callout: { k: 'warn', t: 'Decoupling is happening in some regions, not yet fast enough globally. It is a direction, not a finished fact.' },
      focus: ['ren'], vars: mv(4),
    },
    {
      short: 'Forecasting', tag: 'METHOD', title: 'Three ways to look ahead',
      body: ['Forecasting energy is hard: forecasters missed the collapse of coal in the US and UK and the steep fall in solar costs. Physical constants are predictable. Prices and adoption curves are not.',
        'So analysts use three frameworks: business as usual, aspirational backcasting from a goal, and scenarios that explore policy paths, each answering a different question.'],
      callout: { k: 'key', t: 'A scenario is not a prediction. The IEA says plainly that its Outlook does not predict what will happen.' },
      focus: ['ren'], vars: mv(4),
    },
    {
      short: 'The gap', tag: 'NUMBERS', title: 'Plans versus the climate target',
      body: ['The IEA’s Stated Policies Scenario assumes governments meet their current plans. Its Sustainable Development Scenario is the path needed for roughly 1.5–2 °C. The second needs about 50% more renewable electricity than the first, and renewables win most new capacity in both.',
        'The US EIA, assuming no new policy, sees coal fall from 24% to 13% of US electricity and nuclear from 19% to 12% by 2050, with solar becoming nearly half of renewable generation.'],
      callout: { k: 'know', t: 'Every major study agrees on direction: wind and solar grow hugely. The difference is whether it is enough, and whether storage, EVs and green hydrogen scale with it.' },
      focus: ['ren'], vars: mv(4), stats: { co2: '34 Gt', gap: '≈ +50%' },
    },
  ],
};
