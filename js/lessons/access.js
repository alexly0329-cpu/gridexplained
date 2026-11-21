import { panel } from './solar.js';
import { turbine } from './wind.js';
import { house, pylon } from './common.js';
import { list, table } from './cards.js';

// Source: the "Renewable Energy Futures" notes (energy access: scale of the gap, off-grid solar, five case studies, financing models).
// Figures such as 2026 access counts and 2025 kit sales are as cited in those notes.
export default {
  id: 'access', group: 'transition', title: 'Energy Access & Off-Grid', icon: 'house', time: 10, level: 'Beginner',
  tagline: 'Hundreds of millions of people have no grid. How cheap solar, batteries and small wind let villages skip the wires.',
  stats: [
    { id: 'gap', label: 'Without power', icon: 'house' }, { id: 'pv', label: 'Solar cost drop', icon: 'sun' },
    { id: 'kits', label: 'Kits sold in 2025', icon: 'zap' }, { id: 'cook', label: 'Without clean cooking', icon: 'flame' },
  ],
  legend: [['#e8a33a', 'DC power'], ['#7c63d0', 'village grid'], ['#2f86ce', 'water']],
  learn: [
    { t: 'How big the access gap is and where', at: 0 }, { t: 'The ladder from lantern to mini-grid', at: 1 },
    { t: 'What a little electricity changes', at: 2 }, { t: 'Five real off-grid systems', at: 3 },
    { t: 'Why productive loads and diesel displacement matter', at: 4 }, { t: 'How off-grid solar is paid for', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'dirt');
    s.raw('sun', panel(0.6, 0.8, 1.8, 1.4), { k: 6 });
    s.label('sun:l', 1.5, 1.5, 1.2, { t: 'solar panels', icon: 'sun' }, {});
    s.box('bat', 3.0, 1.2, 0, 1.2, 1.0, 0.8, 'green', { label: { t: 'battery', icon: 'battery' } });
    s.raw('pyl', pylon(5.2, 1.7, 2.4) + pylon(5.2, 4.0, 2.4), { from: 1, k: 10 });
    house(s, 'h1', 5.9, 0.6, { label: { t: 'home', icon: 'house' } });
    house(s, 'h2', 5.9, 3.2);
    s.box('pump', 3.0, 4.6, 0, 1.0, 1.0, 0.7, 'steel', { from: 2, label: { t: 'water pump', icon: 'cog' } });
    s.cyl('tank', 1.4, 5.4, 0, 0.7, 1.8, 'blue', { from: 2, k: 18, label: { t: 'water tank', icon: 'droplet' } });
    s.box('school', 7.2, 6.0, 0, 1.8, 1.4, 1.0, 'cream', { from: 3, label: { t: 'school', icon: 'bulb' } });
    turbine(s, { x: 8.8, y: 2.6, sc: 0.45, suf: 'M', from: 3 });
    s.box('dsl', 7.6, 0.6, 0, 1.2, 1.0, 0.8, 'black', { from: 4, until: 4, label: { t: 'diesel generator', icon: 'factory' } });
    s.flow('f-pv', [[2.4, 1.5, 0.3], [3.0, 1.7, 0.05]], 'dc', {});
    s.flow('f-line', [[4.2, 1.7, 0.05], [5.2, 1.7, 0.05], [5.2, 4.0, 0.05], [5.2, 6.6, 0.05], [7.2, 6.6, 0.05]], 'ac', { from: 1, cls: 'slow' });
    s.flow('f-pump', [[3.6, 2.2, 0.05], [3.6, 4.6, 0.05]], 'dc', { from: 2, until: 2 });
    s.flow('f-tank', [[3.0, 5.1, 0.3], [2.1, 5.4, 0.3]], 'water', { pipe: true, from: 2, until: 2 });
    s.card('gap', 'THE ACCESS GAP', list([['About 800 million people', 'in the course baseline'], ['655–720 million in 2026', 'cited by IEA and UN tracking'], ['About 80% in Sub-Saharan Africa', 'mostly rural, spread thin'], ['Grid lines are slow', 'long, costly runs to few customers']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('ladder', 'THE ACCESS LADDER', list([['Solar lantern', 'lighting and phone charging'], ['Solar home system', 'lights, fans, a TV, a radio'], ['Village mini-grid', 'motors, pumps, refrigeration']], { gap: 36 }), { w: 300, h: 150, from: 1, until: 1 });
    s.card('good', 'WHAT A LITTLE POWER CHANGES', list([['Light', 'replaces kerosene, lets children study'], ['Clean air', 'less smoke from indoor fires'], ['Time', 'less gathering of firewood'], ['Work', 'motors for milling, pumping, cooling']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
        s.card('cases', 'FIVE REAL SYSTEMS', table(['Place', 'System', 'Gives'], [['Micronesia hub', 'solar lanterns', 'evening light'], ['Refugee camp', 'PV and pump', 'clean water'], ['Island school', 'PV, battery', 'fans, computers'], ['Mali villages', '4 MW solar', 'lights, pumping'], ['Mauritania', '1 MW wind', 'ice, fresh water']], { cols: [12, 100, 184], rowH: 22 }), { w: 300, h: 172, from: 3, until: 3 });
    s.card('anchor', 'MAKE THE POWER EARN', list([['Anchor loads', 'pumps, ice and mills use the daytime'], ['Steady revenue', 'it pays the loan on the plant'], ['Diesel displaced', 'no fuel trucks, price swings or noise'], ['Local technicians', 'batteries and inverters need upkeep']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('pay', 'HOW IT GETS PAID FOR', list([['Pay as you go', 'small mobile-money payments unlock it'], ['Bundle earning tools', 'a pump or mill lowers default risk'], ['Patient loans', 'use grows slowly over 5–10 years'], ['Subsidy still needed', 'for the very poorest households']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'The gap', tag: 'PROBLEM', title: 'Where the wires do not reach',
      body: ['Roughly 800 million people lived without electricity in the course data. Recent tracking puts it near 655–720 million in 2026, about 80% of them in Sub-Saharan Africa.',
        'Pushing high-voltage lines to small, spread-out villages is slow and costs more than customers can repay.'],
      callout: { k: 'key', t: 'Nearly 2 billion people also lack clean cooking, a gap even larger than electricity.' },
      focus: ['h1', 'h2'], flows: [], stats: { gap: '655–720 M', cook: '≈ 2 billion' },
    },
    {
      short: 'Leapfrog', tag: 'CONCEPT', title: 'Skipping the grid, like skipping landlines',
      body: ['Solar panel costs fell about 80% in a decade, and batteries got lighter and longer-lived. That made small, modular systems cheap enough to bypass the grid, as mobile phones bypassed copper telephone lines.',
        'Service comes in steps: a solar lantern, then a home system that runs lights and appliances, then a village mini-grid for motors and refrigeration.'],
      callout: { k: 'know', t: 'A lantern gives only a few watt-hours a day. It is a first step, not full electrification.' },
      focus: ['sun', 'bat', 'pyl', 'h1', 'h2'], flows: ['f-pv', 'f-line'], stats: { pv: '≈ −80%' },
    },
    {
      short: 'Benefits', tag: 'CONCEPT', title: 'A few watts change a day',
      body: ['Electric light replaces kerosene and lets children read after dark. Cutting indoor smoke from open fires protects health: such smoke is linked to about 3 million early deaths a year worldwide.',
        'Small motors multiply work. A pump fills a tank in the refugee camp or the village instead of hours of hand pumping, and mills and fridges anchor small businesses.'],
      callout: { k: 'key', t: 'Tiny amounts of power bring outsized returns in time, health and income.' },
      focus: ['sun', 'bat', 'pump', 'tank'], flows: ['f-pv', 'f-pump', 'f-tank'],
    },
    {
      short: 'Five cases', tag: 'CONCEPT', title: 'Five systems, five rungs',
      body: ['In Micronesia a central panel charges rugged lanterns by day for borrowing at night, and a rooftop array with battery runs a school’s lights, fans and computers. In a desert refugee camp, solar powers a pump that fills elevated tanks.',
        'In Mali, 4 MW of solar mini-grids serves 32 villages, built on a development loan. In Mauritania, 1 MW of small 18 kW wind turbines runs four fishing villages and makes ice and drinking water.'],
      callout: { k: 'know', t: 'Off-grid does not mean solar only. Coastal wind is a strong match where the resource is good.' },
      focus: ['school', 'sun', 'bat', 'pyl', 'pump', 'tank', 'towerM', 'nacelleM', 'rotorM'], flows: ['f-line'],
    },
    {
      short: 'Earning', tag: 'METHOD', title: 'Power that pays for itself',
      body: ['In Mauritania, ice keeps the catch fresh long enough to sell inland instead of only on the day, and that income pays for the energy system. Pumps, mills and cold stores do the same in other places.',
        'Daytime anchor loads steady a mini-grid’s revenue. Replacing diesel is first a survival and cost matter: no fuel convoys, no price spikes, no noise.'],
      callout: { k: 'warn', t: 'Plan for batteries and inverters wearing out. Trained local technicians prevent early failure.' },
      focus: ['dsl', 'pump', 'tank', 'bat'], flows: ['f-pv', 'f-pump', 'f-tank'],
    },
    {
      short: 'Paying', tag: 'METHOD', title: 'Pay a little, often',
      body: ['Rural families seldom have cash for a home system, so pay-as-you-go plans take small mobile payments and the phone unlocks the battery. Bundling a pump or grain mill raises income and cuts defaults.',
        'Mini-grids need patient, low-rate loans because use starts small and grows over 5–10 years. The poorest households still need subsidies and relief from import duties. Off-grid solar sales hit a record 10.2 million kits in 2025.'],
      callout: { k: 'key', t: 'Cheap solar turned aid into a market, but affordability still depends on smart finance.' },
      focus: ['h1', 'h2', 'sun', 'bat'], flows: ['f-pv', 'f-line'], stats: { kits: '10.2 million' },
    },
  ],
};
