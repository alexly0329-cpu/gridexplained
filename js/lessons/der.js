import { panel } from './solar.js';
import { house, pylon } from './common.js';
import { list, table } from './cards.js';
import { money } from './fin.js';

// Source: the "Renewable Energy Futures" notes (distributed energy, net metering vs net billing, community solar, aggregators and VPPs, building electrification).
const RETAIL = 0.10, WHOLESALE = 0.04;                 // $/kWh; 10¢ retail is the notes' illustration, 4¢ is an illustrative avoided cost
const IMPORT = 300, EXPORT = 200;                      // kWh in a month
const bill = (credit) => IMPORT * RETAIL - EXPORT * credit;
const compare = table(['Export credited at', 'Monthly bill'], [['Full retail (10¢)', money(bill(RETAIL), 2)], ['Wholesale (4¢, illustrative)', money(bill(WHOLESALE), 2)], ['Time-varying value', 'between the two']], { cols: [12, 190], rowH: 26 })
  + `<text x="12" y="132" style="font-size:8.5px">300 kWh imported at 10¢, 200 kWh exported</text>`;

export default {
  id: 'der', group: 'transition', title: 'Distributed Energy & Prosumers', icon: 'house', time: 11, level: 'Intermediate',
  tagline: 'From one-way power to a mesh: homes that generate, batteries that bid, and the fight over what exported solar is worth.',
  stats: [
    { id: 'import', label: 'Import price', icon: 'zap' }, { id: 'nm', label: 'Bill, retail credit', icon: 'house' },
    { id: 'nb', label: 'Bill, wholesale credit', icon: 'chart' }, { id: 'ca', label: 'California export credit', icon: 'sun' },
  ],
  legend: [['#e8a33a', 'power out'], ['#7c63d0', 'power in'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'What a prosumer and a DER are', at: 0 }, { t: 'Net metering and its three valuation methods', at: 1 },
    { t: 'Why retail net metering stops working', at: 2 }, { t: 'What community solar offers renters', at: 3 },
    { t: 'How an aggregator builds a virtual power plant', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('plant', 0.6, 0.8, 0, 2.0, 1.6, 1.2, 'steel', { label: { t: 'central plant', icon: 'factory' } });
    s.cyl('plant', 1.2, 1.2, 1.2, 0.25, 1.6, 'concrete', { k: 6, shadow: false });
    s.raw('pylon', pylon(4.0, 2.0, 2.6), { k: 8 });
    house(s, 'home', 5.8, 5.4, { label: { t: 'prosumer home', icon: 'house' } });
    s.raw('rooftop', panel(7.6, 5.0, 1.4, 1.2) + panel(7.6, 6.4, 1.4, 1.2), { k: 14 });
    s.box('batt', 5.6, 7.2, 0, 1.2, 1.0, 0.8, 'green', { label: { t: 'home battery', icon: 'battery' } });
    s.raw('community', panel(0.6, 4.4, 1.6, 1.3) + panel(2.4, 4.4, 1.6, 1.3) + panel(0.6, 6.0, 1.6, 1.3) + panel(2.4, 6.0, 1.6, 1.3), { from: 3, k: 12 });
    s.label('community:l', 2.0, 5.2, 1.9, { t: 'community solar', icon: 'sun' }, { from: 3 });
    s.box('agg', 3.6, 8.2, 0, 1.6, 1.2, 1.0, 'white', { from: 4, label: { t: 'aggregator (cloud)', icon: 'layers' }, lopt: { dx: -100, dy: 12 } });
    s.flow('f-in', [[4.0, 2.0, 0.05], [4.0, 5.8, 0.05], [5.8, 5.8, 0.05]], 'ac', {});
    s.flow('f-out', [[5.8, 6.2, 0.05], [4.4, 6.2, 0.05], [4.4, 2.0, 0.05]], 'electric', {});
    s.flow('f-cash', [[4.2, 2.2, 0.05], [4.2, 5.6, 0.05], [5.8, 5.6, 0.05]], 'cash', { cls: 'slow' });
    s.flow('f-comm', [[2.2, 5.1, 0.05], [3.9, 5.1, 0.05]], 'electric', { from: 3 });
    s.flow('f-vpp', [[5.2, 7.4, 0.05], [5.2, 8.6, 0.05], [5.2, 8.8, 0.05]], 'ac', { from: 4, cls: 'slow' });
    s.card('net', 'SAME HOUSE, TWO CREDITS', compare, { w: 300, h: 150, from: 1, until: 1 });
    s.card('limit', 'WHEN RETAIL CREDIT BREAKS', list([['Under ~2% solar', 'a small, easy subsidy'], ['10–20% and up', 'non-solar customers carry the grid costs'], ['California', 'net billing cut midday credits ~75%'], ['Elsewhere', 'Thailand pays ~half of retail; Mexico a schedule']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('size', 'WHERE COMMUNITY SOLAR FITS', list([['Rooftop', '1–10 kW; highest cost per watt'], ['Community', '100 kW–10 MW; shared by subscribers'], ['Utility-scale', '100+ MW; lowest cost per watt']], { gap: 36 }), { w: 300, h: 150, from: 3, until: 3 });
    s.card('vpp', 'AN AGGREGATOR’S JOB', list([['Bundle', 'thousands of 5 kW roofs and 13 kWh batteries'], ['Control', 'cloud software times charging and discharging'], ['Bid', 'act as one dispatchable plant in the market'], ['Share', 'revenue goes back to the homeowners']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
  },
  steps: [
    {
      short: 'The mesh', tag: 'CONCEPT', title: 'From one-way flow to a mesh',
      body: ['The century-old grid sends power one way, from big plants to passive customers, while money flows the other way through monthly bills.',
        'Distributed energy resources (DERs) change that: rooftop solar, batteries, EVs, demand response and heat storage. Customers who also generate become “prosumers”, and electrons, money and data flow both ways.'],
      callout: { k: 'key', t: 'Four forces drive it: an ~80% decade-long drop in solar cost, corporate and city climate targets, new flexibility income, and cheap internet control.' },
      focus: ['home', 'rooftop', 'batt', 'plant', 'pylon'], flows: ['f-in', 'f-out'],
    },
    {
      short: 'Net metering', tag: 'METHOD', title: 'What is exported power worth?',
      body: ['A two-way meter records imports from the grid and exports of surplus solar. Imports pay the retail tariff, 10¢ per kWh in the notes’ example. Exports can be credited at full retail, at a wholesale or avoided-cost rate, or at a value that varies by hour and season.',
        `Take a month with ${IMPORT} kWh imported and ${EXPORT} kWh exported. Full retail credit gives a bill of ${money(bill(RETAIL), 2)}; a 4¢ credit gives ${money(bill(WHOLESALE), 2)}.`],
      callout: { k: 'warn', t: 'Full-retail credit uses the grid as a free, perfect battery, even though retail rates include wires the home still uses.' },
      focus: ['home', 'rooftop', 'pylon'], flows: ['f-in', 'f-out', 'f-cash'], stats: { import: '10¢/kWh', nm: money(bill(RETAIL), 2), nb: money(bill(WHOLESALE), 2) },
    },
    {
      short: 'Net billing', tag: 'TRADE-OFF', title: 'Why the rules change as solar grows',
      body: ['When under about 2% of customers have rooftop solar, crediting at full retail is an easy subsidy. At 10–20% or more, it shifts fixed grid costs onto customers without solar.',
        'Regulators then move to avoided-cost net billing. California’s switch cut average midday export credits by roughly 75%, to about 3.7–4.6¢ against 35¢ or more for imports, per the notes.'],
      callout: { k: 'know', t: 'Under net billing it pays to use your own solar at home or store it for the evening, which is why home batteries become more attractive.' },
      focus: ['home', 'rooftop', 'batt'], flows: ['f-in', 'f-out', 'f-cash'], stats: { ca: '≈ −75%' },
    },
    {
      short: 'Community', tag: 'CONCEPT', title: 'Solar for people without roofs',
      body: ['Community solar sits between a 1–10 kW rooftop and a 100 MW farm: typically 100 kW to 10 MW, sometimes up to about 20 MW. Renters, apartment residents and owners of shaded roofs subscribe to or co-own a shared array.',
        'It stays connected to the grid, so it exports in the day and relies on the utility at night. It costs a little more per watt than a giant farm, but adds local jobs, a hedge on gas prices and faster local build-out.'],
      callout: { k: 'key', t: 'Roughly half of households and businesses cannot host their own panels. Community solar opens the market to them.' },
      focus: ['community'], flows: ['f-comm'],
    },
    {
      short: 'Aggregators', tag: 'METHOD', title: 'Thousands of homes as one power plant',
      body: ['A single 5 kW roof or 13 kWh battery is too small to trade in wholesale markets. An aggregator owns no plants: it uses cloud software and contracts to bundle thousands of them, controlling when batteries and EVs charge and discharge.',
        'The bundle bids as one virtual power plant, earns market revenue, and shares it with the homeowners.'],
      callout: { k: 'know', t: 'Central plants will not vanish: scale still matters. The grid heads toward a hybrid, and wholesale market rules set how fast.' },
      focus: ['agg', 'batt', 'home', 'rooftop'], flows: ['f-vpp', 'f-in', 'f-out'],
    },
    {
      short: 'Heat pumps', tag: 'CONCEPT', title: 'Electrify the building, not just the roof',
      body: ['In buildings, lighting, cooling and appliances are already electric. Heat pumps are the next step: air-source units now work well below freezing and are 3–5 times more efficient than gas boilers.',
        'Industry is harder. Coal, gas and oil are also chemical feedstocks, for steel, fertiliser and plastics, and cement releases CO₂ from the rock itself, so clean molecules like hydrogen join selective electrification.'],
      callout: { k: 'warn', t: 'Some cities have banned gas hookups in new buildings, and met strong political and legal pushback. Technology is proven, politics is not.' },
      focus: ['home', 'batt'], flows: ['f-in'],
    },
  ],
};
