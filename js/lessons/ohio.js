import { house, pylon } from './common.js';
import { list, table } from './cards.js';

// Trader track. General knowledge of Ohio retail power, not from the course notes. The 10.19¢ price to compare is quoted from the reader's interview game plan and should be checked; the offer price and auction rounds are illustrative.
const PTC = 10.19, OFFER = 9.6, USE = 900;                                   // ¢/kWh default price, ¢/kWh supplier offer, kWh a month
const SAVE = +(((PTC - OFFER) / 100) * USE).toFixed(2);
const NEED = 10, ROUNDS = [[70, 14], [66, 13], [62, 12], [59, 11], [57, 10]];   // price $/MWh, tranches offered; needs fall to the 10 tranches wanted
const CLEAR = ROUNDS[ROUNDS.length - 1];

export default {
  id: 'ohio', group: 'trader', track: 'trader', title: 'Ohio Retail & Default Service', icon: 'house', time: 12, level: 'Intermediate',
  tagline: 'Who sells power in Ohio, what the price to compare is, how default-service auctions work, and which PJM zones and hubs matter.',
  stats: [
    { id: 'ptc', label: 'Price to compare', icon: 'chart' }, { id: 'save', label: 'Saving a month', icon: 'zap' },
    { id: 'tr', label: 'Tranches needed', icon: 'layers' }, { id: 'clr', label: 'Clearing price', icon: 'gauge' },
  ],
  legend: [['#e8a33a', 'power'], ['#6f9a3c', 'money'], ['#7c63d0', 'rules']],
  learn: [
    { t: 'The difference between a CRES supplier and default service', at: 0 }, { t: 'What the price to compare is and how to use it', at: 1 },
    { t: 'How a descending-clock auction finds a price', at: 2 }, { t: 'What a full-requirements tranche means for the winner', at: 3 },
    { t: 'The PJM zones and hubs for Ohio', at: 4 }, { t: 'How municipal aggregation works', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('util', 0.8, 1.0, 0, 1.8, 1.5, 1.1, 'steel', { label: { t: 'utility wires', icon: 'tower' } });
    s.box('sup', 0.8, 5.4, 0, 1.8, 1.5, 1.0, 'green', { label: { t: 'supplier', icon: 'factory' } });
    s.box('auc', 4.0, 6.8, 0, 1.6, 1.4, 1.0, 'white', { from: 2, until: 3, label: { t: 'auction', icon: 'chart' } });
    s.raw('pyl', pylon(3.4, 2.0, 2.4) + pylon(5.0, 2.0, 2.4), { k: 9 });
    house(s, 'homes', 6.6, 1.2, { label: { t: 'homes', icon: 'house' } }); house(s, 'homes', 7.6, 3.0);
    s.box('city', 7.0, 5.6, 0, 1.6, 1.4, 0.9, 'cream', { from: 5, label: { t: 'town vote', icon: 'check' } });
    s.box('zone', 4.4, 3.6, 0, 1.0, 1.0, 0.7, 'blue', { from: 4, until: 4, label: { t: 'zone', icon: 'tower' } });
    s.flow('f-wire', [[2.6, 1.8, 0.05], [3.4, 2.0, 0.05], [5.0, 2.0, 2.3], [6.4, 2.0, 0.05], [6.6, 1.8, 0.05]], 'ac', {});
    s.flow('f-sup', [[2.6, 6.2, 0.05], [3.2, 2.4, 0.05]], 'electric', { cls: 'slow' });
    s.flow('f-pay', [[7.0, 3.6, 0.05], [2.6, 5.9, 0.05]], 'cash', { from: 1, cls: 'slow' });
    s.flow('f-bid', [[2.6, 6.8, 0.05], [4.0, 7.4, 0.05]], 'ac', { from: 2, until: 3, cls: 'slow' });
    s.card('who', 'WHO SELLS POWER IN OHIO', list([['Utility default (SSO)', 'the standard service offer'], ['Competitive suppliers (CRES)', 'sell fixed or variable offers'], ['Utility wires', 'deliver either way'], ['Customers choose', 'or stay on default']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('ptc', 'PRICE TO COMPARE (¢/kWh)', table(['', 'Price', ''], [['Utility default', `${PTC}`, 'game plan figure'], ['A supplier offer', `${OFFER}`, 'illustration'], ['Gap', `${(PTC - OFFER).toFixed(2)}`, `$${SAVE} a month`]], { cols: [12, 112, 168], rowH: 26, hl: 2 }), { w: 300, h: 134, from: 1, until: 1 });
    s.card('clock', 'A DESCENDING-CLOCK AUCTION', table(['Round', 'Price $/MWh', 'Tranches offered'], ROUNDS.map(([p, t], i) => [`${i + 1}`, `${p}`, `${t}`]), { cols: [12, 70, 174], rowH: 22 }) + `<text x="12" y="${32 + 22 + ROUNDS.length * 22 + 8}" style="font-size:8.5px">${NEED} wanted: clears in round ${ROUNDS.length} at $${CLEAR[0]}</text>`, { w: 300, h: 190, from: 2, until: 2 });
    s.card('tranche', 'A FULL-REQUIREMENTS TRANCHE', list([['A fixed share of the load', 'one slice of all default customers'], ['The winner supplies it all', 'energy, capacity, ancillaries, credits'], ['Paid one price per MWh', 'the clearing price, any volume'], ['Takes volume and weather risk', 'if load runs high, cost rises']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('zones', 'OHIO ZONES AND HUBS', table(['Zone', 'Area'], [['AEP', 'AEP Ohio'], ['DAY', 'Dayton'], ['DEOK', 'Duke Energy Ohio'], ['ATSI', 'FirstEnergy Ohio']], { cols: [12, 74], rowH: 26 }) + `<text x="12" y="${32 + 22 + 4 * 26 + 10}" style="font-size:8.5px">hubs to trade: PJM Western Hub, AEP-Dayton Hub</text>`, { w: 300, h: 184, from: 4, until: 4 });
    s.card('muni', 'MUNICIPAL AGGREGATION', list([['Voters approve it', 'the town buys for its residents'], ['A supplier wins an RFP', 'one price for the whole group'], ['Residents are enrolled', 'they may opt out'], ['Compared with the default', 'the price to compare is the bar']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Who sells', tag: 'CONCEPT', title: 'Default service and competitive suppliers',
      body: ['Ohio lets customers choose their supplier. Competitive retail electric service suppliers, called CRES providers, sell fixed or variable offers. Customers who do not choose stay on the utility’s default service, the standard service offer, or SSO.',
        'Either way the local utility delivers the power and owns the wires.'],
      callout: { k: 'key', t: 'The utility keeps the wires and the default. Suppliers compete for the energy part of the bill.' },
      focus: ['util', 'sup', 'homes', 'pyl'], flows: ['f-wire', 'f-sup'],
    },
    {
      short: 'Price to compare', tag: 'NUMBERS', title: 'The number every offer is measured against',
      body: [`The price to compare is the utility’s default price per kWh. Your game plan quotes AEP Ohio’s residential figure at ${PTC}¢ for October 1 to December 31, 2026. Confirm the current number before using it.`,
        `A supplier offer of ${OFFER}¢ would be ${(PTC - OFFER).toFixed(2)}¢ lower. At ${USE} kWh a month that is $${SAVE}. Customers look at this first, so a supplier’s margin must live inside the gap.`],
      callout: { k: 'know', t: 'The default price changes with each auction and quarter, so a fixed offer can look good or bad later.' },
      focus: ['homes', 'sup', 'util'], flows: ['f-pay'], stats: { ptc: `${PTC}¢`, save: `$${SAVE}` },
    },
    {
      short: 'Auction', tag: 'METHOD', title: 'How the default price is found',
      body: [`The utility buys default supply through a descending-clock auction. The price starts high, and in each round bidders say how many tranches they would supply at that price. The price falls until offered tranches equal the ${NEED} needed.`,
        `In the example, ${ROUNDS[0][1]} tranches are offered at $${ROUNDS[0][0]}, and the price falls to $${CLEAR[0]}, where ${CLEAR[1]} are offered. All winners receive that final price. AEP Ohio’s auctions are run by NERA Economic Consulting, and PUCO approves the results.`],
      callout: { k: 'key', t: 'A bidder decides in each round when to stop. Drop out too soon and you lose a good deal; stay too long and you win a bad one.' },
      focus: ['auc', 'sup', 'util'], flows: ['f-bid'], stats: { tr: `${NEED}`, clr: `$${CLEAR[0]}` },
    },
    {
      short: 'Tranche', tag: 'CONCEPT', title: 'What winning a tranche means',
      body: ['A tranche is a fixed share of the utility’s whole default load. A full-requirements winner supplies everything for that share: energy, capacity, ancillary services and renewable credits, whatever the customers use.',
        'That makes the winner responsible for volume and weather risk. The bid price must cover the shape of load, not just the average.'],
      callout: { k: 'warn', t: 'The price is the same whether the customers use a lot or a little. The supplier is short in a cold snap.' },
      focus: ['auc', 'sup', 'homes'], flows: ['f-bid', 'f-sup'],
    },
    {
      short: 'Zones', tag: 'CONCEPT', title: 'The PJM zones Ohio sits in',
      body: ['Ohio’s utilities map to PJM zones. AEP is AEP Ohio, DAY is Dayton, DEOK is Duke Energy Ohio and ATSI is the FirstEnergy Ohio utilities. Retail load is settled at the zone price.',
        'Forward deals are usually done at a hub. The Western Hub and the AEP-Dayton Hub are the two to know, and the gap between a zone and a hub is the basis.'],
      callout: { k: 'know', t: 'A supplier buying at a hub and serving a zone carries basis risk between the two points.' },
      focus: ['zone', 'util', 'homes'], flows: ['f-wire'],
    },
    {
      short: 'Aggregation', tag: 'CONCEPT', title: 'A town buys for its residents',
      body: ['In municipal aggregation, voters approve letting their town buy power for residents as a group. The town issues a request for proposals, and a supplier wins by offering a price and terms.',
        'Residents are enrolled automatically and can opt out. The price to compare is the bar, so a bid must beat it with margin to spare.'],
      callout: { k: 'key', t: 'An aggregation bid is a pricing and operations test at once: curve, load shape, credit and customer service.' },
      focus: ['city', 'homes', 'sup'], flows: ['f-pay', 'f-sup'],
    },
  ],
};
