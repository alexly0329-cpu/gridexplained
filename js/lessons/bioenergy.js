import { list, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (biomass feedstocks and pathways, economics, carbon accounting).
export default {
  id: 'bioenergy', group: 'sources', title: 'Bioenergy & Biomass', icon: 'flame', time: 9, level: 'Beginner',
  tagline: 'Burn or ferment plant and waste matter for steady power: which feedstocks work, why distance matters, and what happens to the carbon.',
  stats: [
    { id: 'cf', label: 'Capacity factor', icon: 'gauge' }, { id: 'capex', label: 'Installed cost', icon: 'chart' },
    { id: 'lcoe', label: 'Cost per MWh', icon: 'zap' }, { id: 'gw', label: 'World capacity', icon: 'layers' },
  ],
  legend: [['#2a9d8f', 'biogas'], ['#d0683a', 'solid fuel'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'The five modern biomass pathways', at: 0 }, { t: 'Why transport distance decides the economics', at: 1 },
    { t: 'How waste and landfill gas make power', at: 2 }, { t: 'How a farm digester works', at: 3 },
    { t: 'What biomass costs compared with other steady sources', at: 4 }, { t: 'Why the carbon story is not simple', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.cyl('tree1', 0.9, 1.2, 0, 0.4, 1.2, 'green', { k: 4 }); s.cyl('tree2', 1.9, 1.5, 0, 0.4, 1.2, 'green', { k: 6 }); s.cyl('tree3', 1.2, 2.5, 0, 0.4, 1.2, 'green', { k: 7 });
    s.box('mill', 3.2, 3.0, 0, 1.6, 1.4, 1.0, 'cream', { k: 8, label: { t: 'sawmill', icon: 'factory' } });
    s.box('lf', 0.6, 5.6, 0, 2.2, 1.8, 0.7, 'dirt', { label: { t: 'landfill', icon: 'layers' } });
    s.dome('dig', 4.2, 7.8, 0, 0.9, 0.8, 0.7, 'green', { k: 22, label: { t: 'digester', icon: 'droplet' } });
    s.box('boil', 6.0, 3.2, 0, 1.8, 1.5, 1.2, 'flame', { label: { t: 'steam plant', icon: 'flame' } });
    s.cyl('stack', 8.5, 3.5, 0, 0.3, 2.2, 'grey', { k: 16 });
    s.box('grid', 8.0, 0.8, 0, 0.9, 0.9, 0.8, 'concrete', { label: { t: 'grid', icon: 'tower' } });
    s.flow('f-res', [[4.8, 3.7, 0.3], [6.0, 3.7, 0.3]], 'heat', { pipe: true });
    s.flow('f-gas', [[2.8, 6.5, 0.3], [5.0, 6.5, 0.3], [6.4, 4.7, 0.3]], 'gas', { pipe: true, from: 2 });
    s.flow('f-dig', [[5.1, 8.0, 0.3], [6.9, 8.0, 0.3], [6.9, 4.7, 0.3]], 'gas', { pipe: true, from: 3 });
    s.flow('f-el', [[7.8, 3.5, 0.05], [8.4, 2.2, 0.05]], 'electric', {});
    s.card('feed', 'FIVE MODERN PATHWAYS', list([['Forest and farm residues', 'sawdust, trimmings, bagasse'], ['Wood pellets', 'co-fired in coal boilers'], ['Municipal waste', 'sorted trash burned for steam'], ['Landfill gas', 'trapped methane runs engines'], ['Farm digesters', 'manure into biogas and fertiliser']], { gap: 28 }), { w: 300, h: 178, from: 0, until: 0 });
    s.card('local', 'WHY DISTANCE KILLS IT', list([['Bulky and light', 'little energy per truckload'], ['Seasonal supply', 'harvests come in bursts'], ['Waste beside the plant', 'a mill or farm has fuel already'], ['Fuel is a risk', 'needs take-or-pay supply contracts']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('waste', 'TRASH AND LANDFILL GAS', list([['Sorted waste', 'metals and glass removed, then burned'], ['Same steam cycle as coal', 'only the fuel handling differs'], ['Landfill cap traps methane', 'burned into weaker CO₂'], ['Also heat and cooling', 'district steam from the plant']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('digc', 'ANAEROBIC DIGESTION', list([['Manure into a sealed tank', 'dairy, cattle, hog or poultry'], ['Bacteria make methane', 'no oxygen allowed in'], ['Biogas fuels an engine', 'power and heat on site'], ['Solids become fertiliser', 'nutrient-rich digestate']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('cost', 'INSTALLED COST PER kW', bars([{ label: 'Biomass', value: 2750, color: '#a6d38b' }, { label: 'Geothermal', value: 4500, color: '#f1b3a3' }, { label: 'Solar thermal', value: 6000, color: '#f6d77e' }], { w: 300, labelW: 94, max: 6000, fmt: (v) => `$${v.toLocaleString('en-US')}`, y0: 40, h: 20, gap: 14, note: 'biomass is mature: costs stable since 2010' }), { w: 300, h: 160, from: 4, until: 4 });
    s.card('carbon', 'THE CARBON QUESTION', list([['Burning releases CO₂ now', 'regrowth takes decades'], ['Pellets add shipping fuel', 'not offset by regrowth'], ['Smoke has pollutants', 'NOₓ, particles, VOCs'], ['Methane capture is best', 'methane traps far more heat']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Feedstocks', tag: 'CONCEPT', title: 'Plant matter that becomes power',
      body: ['Biomass is organic matter burned directly or turned into biogas or liquid fuel. Traditional uses are firewood, charcoal and dried dung for cooking and heating.',
        'Modern power uses five routes: forestry and farm residues, wood pellets, municipal waste, landfill gas and farm digesters. Each one fuels a plant that can run any hour of the day.'],
      callout: { k: 'key', t: 'Biomass is dispatchable: stored fuel can be burned on demand, which wind and sun cannot do.' },
      focus: ['tree1', 'tree2', 'tree3', 'mill', 'lf', 'dig', 'boil', 'stack', 'grid'], flows: ['f-res', 'f-el'],
    },
    {
      short: 'Keep it close', tag: 'CONCEPT', title: 'Burn it where it is made',
      body: ['Wood chips, sawdust and crop waste are bulky for the energy they hold, and supply swings with the seasons. Hauling them far eats the profit.',
        'So the best plants sit beside the source: a sawmill, a sugar mill, a farm. Pellets are denser and are shipped across the Atlantic to co-fire in coal boilers, but long supply chains add cost and emissions.'],
      callout: { k: 'warn', t: 'Unlike wind or sun, fuel is not free forever. Plants need multi-year supply contracts to be financeable.' },
      focus: ['tree1', 'tree2', 'tree3', 'mill', 'boil', 'stack'], flows: ['f-res'],
    },
    {
      short: 'Waste', tag: 'CONCEPT', title: 'Power from trash and landfill gas',
      body: ['Sorted municipal waste burns in a steam plant that is the same as a coal plant apart from the fuel handling. Many also send district steam or chilling to nearby buildings.',
        'A landfill capped with a membrane traps the methane that rotting waste makes. Burning it turns a strong greenhouse gas into the weaker CO₂, and makes power too.'],
      callout: { k: 'know', t: 'These plants use ordinary steam turbines, so they add rotating inertia and steady output to the grid.' },
      focus: ['lf', 'boil', 'stack', 'grid'], flows: ['f-gas', 'f-el'],
    },
    {
      short: 'Digesters', tag: 'METHOD', title: 'Biogas from manure',
      body: ['In a sealed, oxygen-free tank, bacteria digest livestock manure and release methane. The biogas runs an engine for power and heat on the farm.',
        'What is left is a nutrient-rich solid that works as fertiliser, and covering the manure also stops methane escaping and nutrients running off.'],
      callout: { k: 'key', t: 'Biogas can also be cleaned into renewable natural gas and fed into existing gas pipelines.' },
      focus: ['dig', 'boil', 'stack', 'grid'], flows: ['f-dig', 'f-el'],
    },
    {
      short: 'Numbers', tag: 'NUMBERS', title: 'Steady, mature and mid-priced',
      body: ['Biomass plants run at about 75% capacity factor and make power for about $60–70 per MWh where fuel is cheap. Installed cost averages about $2,750 per kW, flat since 2010 because the technology is mature.',
        'World capacity nearly doubled in a decade, from about 65 GW to over 120 GW, yet it stays a modest share of the long-term mix.'],
      callout: { k: 'know', t: 'Cheaper per kW than geothermal or solar thermal, but the fuel bill never disappears.' },
      focus: ['boil', 'stack', 'grid'], flows: ['f-res', 'f-el'], stats: { cf: '≈ 75%', capex: '$2,750/kW', lcoe: '$60–70', gw: '120+ GW' },
    },
    {
      short: 'Carbon', tag: 'TRADE-OFF', title: 'Is it really carbon-neutral?',
      body: ['Burning wood releases CO₂ at once, while the forest takes decades to regrow. Harvesting, pelleting and shipping burn fossil fuel that regrowth never offsets. Combustion also gives off NOₓ, soot and other pollutants.',
        'The clearest wins are waste streams. Capturing landfill and farm methane destroys a gas that traps many times more heat than CO₂.'],
      callout: { k: 'key', t: 'Judge each biomass route on its own feedstock and distance. Waste-based routes are the strongest case.' },
      focus: ['lf', 'dig', 'tree1', 'tree2', 'tree3', 'boil'], flows: ['f-gas', 'f-dig', 'f-res'],
    },
  ],
};
