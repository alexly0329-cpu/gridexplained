import { house } from './common.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Power and Electricity Systems" notes (market models: Colorado IOU, Abu Dhabi single buyer, France EDF hybrid, ISOs/RTOs, market friction with renewables).
const LAYERS = [['gen', 'generation', 0.8], ['trans', 'transmission', 3.2], ['dist', 'distribution', 5.6], ['retail', 'retail', 8.0]];
// Who owns each layer in each model: [owner text, colour] per layer, per step index.
const OWN = {
  0: [['Xcel Energy', 'violet'], ['Xcel Energy', 'violet'], ['Xcel Energy', 'violet'], ['Xcel Energy', 'violet']],
  1: [['private + state joint ventures', 'green'], ['state', 'blue'], ['state', 'blue'], ['state']].map((o) => [o[0], o[1] || 'blue']),
  2: [['≈ 80% EDF', 'yellow'], ['RTE, 100%', 'blue'], ['mostly EDF’s Enedis', 'yellow'], ['many suppliers', 'green']],
};

export default {
  id: 'models', group: 'systems', title: 'Market Models & ISOs', icon: 'layers', time: 11, level: 'Advanced',
  tagline: 'Who owns the plants, the wires and the bill? Four ways to organise a power system, and how operators run markets.',
  stats: [
    { id: 'who', label: 'Owns generation', icon: 'factory' }, { id: 'buy', label: 'Buyer', icon: 'zap' },
    { id: 'ic', label: 'US interconnections', icon: 'tower' }, { id: 'energy', label: 'Energy share of cost', icon: 'chart' },
  ],
  legend: [['#cfc0e8', 'vertically integrated'], ['#a6d38b', 'private or competitive'], ['#9fcdf0', 'state'], ['#f6d77e', 'state champion']],
  learn: [
    { t: 'Vertically integrated utilities and the regulatory compact', at: 0 }, { t: 'The single-buyer model', at: 1 },
    { t: 'A hybrid: unbundled but concentrated', at: 2 }, { t: 'The two jobs of an ISO or RTO', at: 3 },
    { t: 'Why wind, solar and storage strain market rules', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('gen', 0.8, 3.6, 0, 1.6, 1.6, 1.1, 'steel', { label: { t: 'generation', icon: 'factory' } });
    s.box('trans', 3.2, 3.6, 0, 1.6, 1.6, 0.9, 'concrete', { label: { t: 'transmission', icon: 'tower' } });
    s.box('dist', 5.6, 3.6, 0, 1.6, 1.6, 0.9, 'concrete', { label: { t: 'distribution', icon: 'cog' } });
    house(s, 'retail', 8.0, 3.8, { label: { t: 'retail', icon: 'house' } });
    // ownership strips: one set per model step, so the colours change as the lesson moves
    [0, 1, 2].forEach((st) => LAYERS.forEach(([id, , x], i) => {
      const [owner, col] = OWN[st][i];
      s.box(id, x, 6.0, 0, 1.6, 0.5, 0.12, col, { from: st, until: st, shadow: false, k: 40 + i, label: { t: owner }, lopt: { dy: 28 } });
    }));
    s.box('ipp', 0.8, 7.6, 0, 1.4, 1.2, 0.8, 'green', { from: 0, until: 0, label: { t: 'independent producers', icon: 'sun' } });
    s.box('iso', 3.6, 0.6, 0, 2.6, 1.6, 1.2, 'white', { from: 3, label: { t: 'ISO / RTO', icon: 'cog' } });
    s.flow('f-gen', [[2.4, 4.4, 0.05], [3.2, 4.4, 0.05]], 'electric', {});
    s.flow('f-trans', [[4.8, 4.4, 0.05], [5.6, 4.4, 0.05]], 'electric', {});
    s.flow('f-dist', [[7.2, 4.4, 0.05], [8.0, 4.4, 0.05]], 'ac', {});
    s.flow('f-ppa', [[1.5, 7.6, 0.05], [1.5, 5.2, 0.05]], 'cash', { from: 0, until: 0 });
    ['gen', 'trans', 'dist'].forEach((id, i) => s.flow('sig-' + id, [[4.9, 2.2, 0.05], [1.6 + i * 2.4, 3.6, 0.05]], 'ac', { from: 3, cls: 'slow' }));
    s.card('compact', 'THE REGULATORY COMPACT', list([['One company', 'owns plants, wires and the bill'], ['A regulator', 'sets rates, e.g. Colorado’s PUC'], ['Bilateral PPAs', 'buys extra power from private producers'], ['Three grids', 'East, West and Texas, linked by small DC ties']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('ad', 'ABU DHABI’S SINGLE BUYER', list([['1996–98 reform', 'sector unbundled by Law No. 2 of 1998'], ['One state buyer', 'ADWEC, later EWEC, buys all output'], ['Joint ventures', 'private capital builds water and power plants'], ['Long contracts', 'power and water purchase agreements'], ['New supply', 'record-low solar bids; four-unit Barakah nuclear']], { gap: 28 }), { w: 300, h: 188, from: 1, until: 1 });
    s.card('fr', 'FRANCE: UNBUNDLED, STILL ANCHORED', list([['Nuclear heavy', '65–70% of power, 56 reactors'], ['Generation', 'about 80% of capacity is EDF’s'], ['Transmission', 'all of it run by RTE'], ['Retail choice', 'real, but EDF still dominates']], { gap: 33 }), { w: 300, h: 168, from: 2, until: 2 });
    s.card('products', 'FOUR ISO MARKET PRODUCTS', list([['Day-ahead', 'hourly schedules cleared a day early'], ['Real-time', '5–15 minute fixes just before delivery'], ['Capacity', 'pays for being available years ahead'], ['Ancillary services', 'frequency, reserves, black start']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('split', 'WHAT PJM CUSTOMERS PAY FOR', bars([{ label: 'Energy', value: 67, color: '#f6d77e' }, { label: 'Everything else', value: 33, color: '#cfc0e8' }], { w: 300, labelW: 100, max: 70, fmt: (v) => `~${v}%`, y0: 42, h: 20, gap: 14, note: 'the rest: capacity, transmission and ancillary services' }), { w: 300, h: 138, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Integrated', tag: 'CONCEPT', title: 'One company owns it all',
      body: ['In a classic vertically integrated system, one regulated utility owns generation, transmission, distribution and billing. In Colorado that is Xcel Energy, an investor-owned company answering to the state regulator.',
        'The “regulatory compact” trades a monopoly for rate regulation. Xcel buys some extra power from independent producers by two-party contracts, not an open hourly market.'],
      callout: { k: 'key', t: 'There is no price to discover here: the regulator sets rates and the utility plans its own plants.' },
      stats: { who: 'Xcel Energy', buy: 'the utility itself', ic: '3' },
    },
    {
      short: 'Single buyer', tag: 'CONCEPT', title: 'Many builders, one buyer',
      body: ['Abu Dhabi unbundled in 1996–98. Transmission, distribution and purchasing stayed with the state through a single buyer. Generation, and desalination, opened to private capital as joint ventures under long contracts.',
        'The single buyer pools demand and risk, so projects can be financed. It is an intermediate step between a state utility and a full wholesale market.'],
      callout: { k: 'know', t: 'This model produced some of the world’s lowest solar bids: a creditworthy buyer and a long contract make capital cheap.' },
      stats: { who: 'state + joint ventures', buy: 'single state buyer' },
    },
    {
      short: 'Hybrid', tag: 'CONCEPT', title: 'Unbundled on paper, anchored in practice',
      body: ['France legally separates generation, transmission, distribution and retail, and allows retail choice. Yet the state-owned EDF still holds about 80% of generation capacity, including 56 nuclear reactors, and its ring-fenced units anchor other layers.',
        'Transmission is entirely RTE’s. The structure shows that legal separation and real competition are different things.'],
      callout: { k: 'know', t: 'A nuclear-heavy mix of about 65–70% makes French demand very temperature-sensitive: electric heating drives sharp winter peaks.' },
      stats: { who: '≈ 80% EDF', buy: 'many suppliers' },
    },
    {
      short: 'ISO job one', tag: 'METHOD', title: 'The ISO keeps the lights on',
      body: ['In competitive regions such as PJM and California, a neutral non-profit ISO or RTO runs the wholesale system. Job one is operations: balance supply and demand around the clock, dispatch plants and storage, watch the high-voltage lines, and forecast constraints.',
        'It works upstream only. A car hitting a neighbourhood pole is the local distribution utility’s problem, not the ISO’s.'],
      callout: { k: 'key', t: 'Wholesale is between generators and resellers. Retail, the bill to your home, is a separate market downstream.' },
      focus: ['iso', 'gen', 'trans', 'dist'], flows: ['sig-gen', 'sig-trans', 'sig-dist', 'f-gen', 'f-trans'], stats: { buy: 'resellers via the ISO' },
    },
    {
      short: 'ISO job two', tag: 'METHOD', title: 'The ISO runs the exchange',
      body: ['Job two is a market, much like an electronic exchange: buyers and sellers trade through the ISO, not with it. It runs sequential markets, day-ahead, real-time, capacity and ancillary services, and stacks bids from lowest to highest cost until forecast demand is met.',
        'It also polices the market. Withholding power to push prices up was a key lesson of California’s 2000–2001 crisis.'],
      callout: { k: 'know', t: 'This security-constrained economic dispatch is the merit order from the earlier lesson, with the physics of the wires added.' },
      focus: ['iso'], flows: ['sig-gen', 'sig-trans', 'sig-dist'],
    },
    {
      short: 'Friction', tag: 'TRADE-OFF', title: 'Rules built for fuel-burning plants',
      body: ['About two thirds of PJM’s wholesale cost is energy; the rest is capacity, transmission and ancillary services. These markets were designed for fossil plants with fuel costs.',
        'Two frictions follow. Batteries last only 2–4 hours, so they do not fit auctions that expect sustained output. And zero-fuel wind and solar bid very low, depressing prices and leaving a “missing money” gap for the plants that recover costs only in scarce hours.'],
      callout: { k: 'warn', t: 'Cheap clean energy lowers prices, which is good for customers, but can make both renewables and backup plants struggle to cover fixed costs.' },
      focus: ['iso', 'gen'], flows: ['f-gen', 'f-trans', 'f-dist'], stats: { energy: '≈ 2/3' },
    },
  ],
};
