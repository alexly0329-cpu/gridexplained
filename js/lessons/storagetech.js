import { flywheel } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (storage categories, metrics, pumped hydro, batteries, thermal, hydrogen, mechanical storage, economics).
// Discharge hours and "electricity bought per MWh sold" are computed here from the stated ratings and efficiencies.
const UNITS = [{ name: 'Flywheel', mw: 18, mwh: 14.4 }, { name: 'Li-ion block', mw: 100, mwh: 400 }, { name: 'Pumped hydro', mw: 500, mwh: 20000 }].map((u) => ({ ...u, h: u.mwh / u.mw }));
const BUY = (eff) => +(1 / eff).toFixed(2);

export default {
  id: 'storagetech', group: 'deep', title: 'Storage Technologies Compared', icon: 'battery', time: 14, level: 'Intermediate',
  tagline: 'Five families of storage, the four numbers that compare them, and where batteries, heat, hydrogen and spinning metal each fit.',
  stats: [
    { id: 'dur', label: 'Discharge time', icon: 'clock' }, { id: 'rt', label: 'Round trip', icon: 'gauge' },
    { id: 'cap', label: 'Typical size', icon: 'layers' }, { id: 'cost', label: 'Cost per MWh', icon: 'chart' },
  ],
  legend: [['#e8a33a', 'power to the grid'], ['#d0683a', 'heat store']],
  learn: [
    { t: 'The five families of storage', at: 0 }, { t: 'Why discharge time is MWh ÷ MW', at: 1 },
    { t: 'How round-trip efficiency changes the cost of charging', at: 2 }, { t: 'What separates lithium-ion, sodium-sulfur and flow batteries', at: 3 },
    { t: 'Why hydrogen is hard to store', at: 4 }, { t: 'How heat is stored cheaply', at: 5 },
    { t: 'Where flywheels, compressed air and liquid air fit', at: 6 }, { t: 'How storage cost is compared', at: 7 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('hill', 0.5, 0.6, 0, 2.2, 2.0, 1.4, 'rock', { shadow: false });
    s.water('hw', 0.7, 0.8, 1.4, 1.8, 1.6, 0.2, { k: 6, label: { t: 'pumped hydro', icon: 'waves' } });
    s.box('batt', 6.4, 0.8, 0, 2.0, 1.2, 1.0, 'green', { label: { t: 'batteries', icon: 'battery' } });
    s.box('fw', 0.6, 6.4, 0, 1.6, 1.6, 0.9, 'steel', { label: { t: 'flywheel', icon: 'cog' } });
    s.raw('fwr', flywheel(1.4, 7.2, 0.9, 0.6, '1.1s'), { k: 14 });
    s.cyl('h2a', 7.8, 5.4, 0, 0.45, 1.4, 'white', { k: 15, label: { t: 'hydrogen', icon: 'atom' } });
    s.cyl('h2b', 8.8, 5.4, 0, 0.45, 1.4, 'white', { k: 16 });
    s.cyl('h2c', 8.3, 6.6, 0, 0.45, 1.4, 'white', { k: 18 });
    s.cyl('tes', 3.8, 8.2, 0, 0.8, 1.4, 'flame', { k: 20, label: { t: 'heat store', icon: 'thermo' } });
    s.box('hub', 4.2, 4.2, 0, 0.9, 0.9, 0.8, 'concrete', { k: 10, label: { t: 'grid', icon: 'tower' } });
    s.flow('f-psh', [[2.7, 2.2, 0.05], [4.65, 4.65, 0.05]], 'electric', {});
    s.flow('f-batt', [[6.4, 1.8, 0.05], [4.65, 4.65, 0.05]], 'electric', { cls: 'fast' });
    s.flow('f-fw', [[2.2, 6.8, 0.05], [4.65, 4.65, 0.05]], 'electric', { cls: 'fast' });
    s.flow('f-h2', [[7.5, 5.8, 0.05], [4.65, 4.65, 0.05]], 'electric', { cls: 'slow' });
    s.flow('f-tes', [[4.2, 7.4, 0.05], [4.65, 4.65, 0.05]], 'heat', { cls: 'slow' });
    s.card('fam', 'FIVE FAMILIES OF STORAGE', list([['Mechanical', 'pumped hydro, flywheels, compressed air'], ['Electrochemical', 'batteries and fuel cells'], ['Thermal', 'sensible, latent and thermochemical heat'], ['Hydrogen', 'electrolysis, tanks, caverns, ammonia'], ['Electrical', 'supercapacitors, superconducting coils']], { gap: 28 }), { w: 300, h: 178, from: 0, until: 0 });
    s.card('dur', 'DISCHARGE TIME = MWh ÷ MW', bars(UNITS.map((u, i) => ({ label: `${u.name}, ${u.mw} MW`, value: u.h, color: ['#cfc0e8', '#a6d38b', '#9fcdf0'][i] })), { w: 300, labelW: 136, max: 40, fmt: (v) => `${+v.toFixed(1)} h`, y0: 40, h: 20, gap: 14, note: 'ratings in MWh: 14.4, 400 and 20,000' }), { w: 300, h: 160, from: 1, until: 1 });
    s.card('rt', 'ROUND-TRIP EFFICIENCY', bars([{ label: 'Lithium-ion', value: 88, t: '85–90%', color: '#a6d38b' }, { label: 'Pumped hydro', value: 80, t: 'low 80s', color: '#9fcdf0' }, { label: 'Hydrogen', value: 38, t: '35–40%', color: '#f1b3a3' }], { w: 300, labelW: 92, max: 100, fmt: (v, r) => r.t, y0: 40, h: 20, gap: 14, note: 'energy out ÷ energy in, grid to grid' }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('bat', 'THREE BATTERY CHEMISTRIES', table(['Type', 'Cycles', 'Niche'], [['Lithium-ion', '3,000+', 'compact, fast'], ['Sodium-sulfur', '4,500+', '8 h, 325 °C'], ['Vanadium flow', '15,000+', 'tanks, long life']], { cols: [12, 112, 176], rowH: 26 }), { w: 300, h: 134, from: 3, until: 3 });
    s.card('h2', 'THE HYDROGEN CHAIN', list([['Make it', 'reforming ~65% (CO₂), electrolysis ~80%'], ['Squeeze it', '700 bar costs ~15% of its energy'], ['Cave it', 'salt caverns hold bulk cheaply'], ['Carry it', 'ammonia suits seasonal storage'], ['Burn it', 'power to H₂ to power: 35–40%']], { gap: 28 }), { w: 300, h: 178, from: 4, until: 4 });
    s.card('heat', 'THREE WAYS TO STORE HEAT', list([['Sensible', 'warm sand, salt or concrete: simple'], ['Latent', 'melt a material at steady temperature'], ['Thermochemical', 'reversible reactions: dense, early stage']], { gap: 36 }), { w: 300, h: 150, from: 5, until: 5 });
    s.card('mech', 'SPINNING, SQUEEZING, COOLING', table(['Type', 'Job', 'Round trip'], [['Flywheel', 'seconds to minutes', '50–80%'], ['Compressed air', 'hours, in caverns', '25–75%'], ['Liquid air', 'hours, in tanks', '40–60%']], { cols: [12, 102, 214], rowH: 26 }), { w: 300, h: 134, from: 6, until: 6 });
    s.card('lcos', 'COST PER MWh DISCHARGED', bars([{ label: 'Pumped, CAES, flow', value: 140, t: '$100–180', color: '#9fcdf0' }, { label: 'Li-ion, 4 hour', value: 251, t: '$210–292', color: '#a6d38b' }, { label: 'Li-ion, 2 hour', value: 315, t: '$215–414', color: '#f6d77e' }, { label: 'Home Li-ion', value: 604, t: '$547–660', color: '#f1b3a3' }], { w: 300, labelW: 124, max: 660, fmt: (v, r) => r.t, y0: 36, h: 16, gap: 10, note: 'levelised cost of storage, mid-points' }), { w: 300, h: 170, from: 7, until: 7 });
  },
  steps: [
    {
      short: 'Families', tag: 'CONCEPT', title: 'Five families of storage',
      body: ['Storage decouples when power is made from when it is used. It comes in five physical families: mechanical, electrochemical, thermal, hydrogen and chemical fuel, and electrical.',
        'They trade off response speed against how long they can hold energy. Pumped hydro still holds about 95% of historical capacity, while batteries lead new growth.'],
      callout: { k: 'key', t: 'No single technology wins on every measure. The grid needs a mix, matched to each job.' },
      focus: ['hill', 'hw', 'batt', 'fw', 'fwr', 'h2a', 'h2b', 'h2c', 'tes', 'hub'], flows: ['f-psh', 'f-batt', 'f-fw', 'f-h2', 'f-tes'],
    },
    {
      short: 'Duration', tag: 'NUMBERS', title: 'Power and energy are different ratings',
      body: [`Divide the energy capacity (MWh) by the power rating (MW) and you get how long it can discharge. A ${UNITS[0].mw} MW, ${UNITS[0].mwh} MWh flywheel lasts under an hour. A ${UNITS[1].mw} MW, ${UNITS[1].mwh} MWh battery lasts ${UNITS[1].h} hours. A ${UNITS[2].mw} MW pumped hydro plant with ${UNITS[2].mwh.toLocaleString('en-US')} MWh lasts ${UNITS[2].h} hours.`,
        'That ratio, not size alone, decides what a store is good for.'],
      callout: { k: 'know', t: 'Short stores smooth the next seconds or minutes. Long stores move whole days of energy.' },
      focus: ['fw', 'fwr', 'batt', 'hill', 'hw'], flows: ['f-fw', 'f-batt', 'f-psh'], stats: { dur: '0.8 h – 40 h', cap: '14 – 20,000 MWh' },
    },
    {
      short: 'Efficiency', tag: 'NUMBERS', title: 'Round trip is a tax on every charge',
      body: [`Round-trip efficiency is the energy you get out divided by the energy you put in. A lithium-ion system at 88% must buy ${BUY(0.88)} MWh to sell 1 MWh. A hydrogen chain at 40% must buy ${BUY(0.4)} MWh.`,
        'Every step wastes some as heat or friction. Hydrogen loses twice: once making the gas, once turning it back into power.'],
      callout: { k: 'warn', t: 'Low efficiency is fine only if charging power is nearly free, which is the case in hours of surplus wind or sun.' },
      focus: ['batt', 'hill', 'hw', 'h2a', 'h2b', 'h2c'], flows: ['f-batt', 'f-psh', 'f-h2'], stats: { rt: '38% – 88%' },
    },
    {
      short: 'Batteries', tag: 'CONCEPT', title: 'Batteries are getting cheap fast',
      body: ['Installed battery costs fell from over $1,500 per kWh to under $200, about 18% a year, and yearly capacity added rose from near zero in 2014 to over 160 GWh in 2024 and about 300 GWh in 2025 (BloombergNEF).',
        'Lithium-ion leads on efficiency and compactness but needs battery management to avoid fire. Sodium-sulfur runs molten at 325 °C and suits 8-hour shifts. Vanadium flow cells keep liquid in tanks and last 15,000+ cycles.'],
      callout: { k: 'know', t: 'Flow batteries let you buy power and energy separately: bigger tanks mean longer duration without more stacks.' },
      focus: ['batt', 'hub'], flows: ['f-batt'],
    },
    {
      short: 'Hydrogen', tag: 'PROBLEM', title: 'Light, but bulky',
      body: ['Hydrogen carries a lot of energy per kilogram but very little per litre. Making it useful means squeezing it to 700 bar, which alone eats about 15% of its energy, or cooling it, or locking it into a chemical such as ammonia.',
        'Salt caverns can store huge volumes cheaply where the geology exists. Round trip from power to hydrogen and back is only 35–40%.'],
      callout: { k: 'key', t: 'Hydrogen shines for long, seasonal storage where cheaper options are absent, not for daily cycling.' },
      focus: ['h2a', 'h2b', 'h2c', 'hub'], flows: ['f-h2'], stats: { rt: '35–40%' },
    },
    {
      short: 'Heat', tag: 'CONCEPT', title: 'Storing heat is cheap',
      body: ['Heat is stored in abundant, harmless materials. Sensible storage warms sand, salt or concrete; a sand battery in Finland holds up to 100 MWh at 400 °C for district heating. Latent storage melts a material at constant temperature. Thermochemical storage uses reversible reactions.',
        'Thermal storage suits multi-day or seasonal holds, and the market is forecast to grow about 7% a year.'],
      callout: { k: 'know', t: 'Heat stores work best when heat is the end use or the plant is thermal, because turning heat back into power loses a lot.' },
      focus: ['tes', 'hub'], flows: ['f-tes'],
    },
    {
      short: 'Mechanical', tag: 'CONCEPT', title: 'Spinning, squeezing and cooling',
      body: ['Flywheels spin carbon rotors in vacuum at 20,000–50,000 rpm and give huge power for minutes. Compressed air stores energy in caverns at about 70 bar, but heat made while squeezing is wasted unless it is saved. Liquid air shrinks 700 litres of gas into 1 litre of liquid and needs only tanks.',
        'Stacked concrete blocks lifted by cranes and supercapacitors are newer entrants for gravity and fast-power niches.'],
      callout: { k: 'key', t: 'Compressed and liquid air aim to offer bulk storage without mountains or scarce minerals.' },
      focus: ['fw', 'fwr', 'hub'], flows: ['f-fw'],
    },
    {
      short: 'Cost', tag: 'NUMBERS', title: 'What storage costs per MWh',
      body: ['Levelised cost of storage spreads all lifetime costs over the energy discharged. Pumped hydro, compressed air and flow batteries sit lowest, around $100–180 per MWh, because capacity is cheap to add.',
        'Utility lithium-ion costs more, and a 2-hour system costs more per MWh than a 4-hour one. Home batteries lose economies of scale and cost the most. Capital cost is most of the bill, and lithium-ion is expected to take about 85% of new non-hydro capacity.'],
      callout: { k: 'know', t: 'Cost depends on duration. Cheap bulk storage wins for long shifts, batteries for short, flexible ones.' },
      focus: ['batt', 'hill', 'hw', 'fw', 'fwr', 'h2a', 'h2b', 'h2c'], flows: ['f-batt', 'f-psh'], stats: { cost: '$100 – $660' },
    },
  ],
};
