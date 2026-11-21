import { panel } from './solar.js';
import { house, pylon } from './common.js';
import { list, bars } from './cards.js';

// Source: the "Renewable Energy Futures" notes (utility death spiral, counterweights and new business models, merit-order effect, missing money).
// The spiral numbers below are an illustration computed here: a fixed grid bill spread over a shrinking sales base.
const FIXED = 100, SALES0 = 1000, LOSS = 0.10;                          // $M a year, GWh, share of remaining sales lost each round
const ROUNDS = Array.from({ length: 5 }, (_, n) => { const sales = SALES0 * (1 - LOSS) ** n; return { n, sales, rate: (FIXED * 1e6) / (sales * 1e6) * 100 }; }); // ¢/kWh
const rate = (n) => ROUNDS[n].rate;

// Merit-order effect: same demand, with and without 30 GW of zero-cost wind. Plants: [name, GW, $/MWh].
const STACK = [['wind', 30, 0], ['nuclear', 20, 10], ['hydro', 8, 20], ['gas CC', 40, 40], ['peakers', 25, 120]];
const priceAt = (demand, withWind) => { let c = 0; for (const [n, gw, p] of STACK) { if (n === 'wind' && !withWind) continue; c += gw; if (c >= demand) return p; } return STACK[STACK.length - 1][2]; };
const DEMAND = 95, P_NO = priceAt(DEMAND, false), P_WIND = priceAt(DEMAND, true);

export default {
  id: 'spiral', group: 'transition', title: 'Who Pays for the Grid?', icon: 'tower', time: 11, level: 'Advanced',
  tagline: 'Rooftop solar, efficiency and cheap wind squeeze the old utility business model: the death-spiral loop, what stops it, and the “missing money”.',
  stats: [
    { id: 'rate0', label: 'Rate at start', icon: 'zap' }, { id: 'rate4', label: 'Rate after 4 rounds', icon: 'chart' },
    { id: 'pno', label: 'Price, no wind', icon: 'gauge' }, { id: 'pwind', label: 'Price, with wind', icon: 'wind' },
  ],
  legend: [['#e8a33a', 'power'], ['#6f9a3c', 'bills']],
  learn: [
    { t: 'The four steps of the death-spiral loop', at: 0 }, { t: 'Why fixed costs raise rates for everyone else', at: 1 },
    { t: 'Why full grid defection is rare', at: 2 }, { t: 'New tariffs and business models', at: 3 },
    { t: 'The merit-order effect and “missing money”', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('grid', 0.8, 0.8, 0, 2.2, 1.6, 1.2, 'steel', { label: { t: 'plants & wires: fixed cost', icon: 'factory' } });
    s.raw('pylon', pylon(3.8, 1.4, 2.6), { k: 8 });
    const spots = [[4.6, 3.6], [6.6, 3.6], [8.2, 3.6], [4.6, 6.0], [6.6, 6.0], [8.2, 6.0]];
    spots.forEach(([x, y], i) => { house(s, 'homes', x, y, i === 1 ? { label: { t: 'customers', icon: 'house' } } : {}); if (i < 4) s.raw('solar' + i, panel(x + 0.2, y + 1.7, 1.2, 0.8), { from: i < 2 ? 1 : i < 3 ? 2 : 3, k: x + y + 3 }); });
    ROUNDS.slice(0, 4).forEach((r, i) => s.box('rate', 0.8 + i * 1.3, 6.2, 0, 0.9, 0.9, 0.2 + r.rate * 0.12, i ? 'orange' : 'green', { from: 1, until: 1, label: { t: `${r.rate.toFixed(1)}¢` }, lopt: { dy: -10 } }));
    s.flow('f-grid', [[3.0, 1.8, 0.05], [3.8, 1.6, 0.05], [6.0, 3.0, 0.05]], 'ac', {});
    s.flow('f-bill', [[6.0, 3.4, 0.05], [3.2, 2.2, 0.05]], 'cash', { cls: 'slow' });
    s.card('loop', 'THE FEEDBACK LOOP', list([['Solar and efficiency get cheaper', 'self-supply beats the retail price'], ['Customers buy less', 'the sales base shrinks'], ['Fixed costs stay', 'plants, wires and debt are paid anyway'], ['Rates rise', 'which pushes more people to self-supply']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('num', 'ILLUSTRATION: A $100M FIXED BILL', bars(ROUNDS.map((r) => ({ label: r.n ? `round ${r.n}` : 'start', value: r.rate, color: r.n ? '#f0c08f' : '#a6d38b' })), { w: 300, labelW: 62, max: 20, fmt: (v) => `${v.toFixed(1)}¢`, y0: 36, h: 14, gap: 9, note: `−10% of sales a round, from ${SALES0.toLocaleString('en-US')} GWh` }), { w: 300, h: 164, from: 1, until: 1 });
    s.card('stop', 'WHY IT DOES NOT COLLAPSE', list([['Off-grid is dear', 'multi-day cloudy spells need huge batteries'], ['Scale still wins', '100+ MW farms stay cheaper per kWh'], ['The grid does more', 'voltage, frequency, inertia, backup'], ['Utilities adapt', 'efficiency, own solar, new tariffs']], { gap: 33 }), { w: 300, h: 170, from: 2, until: 2 });
    s.card('tariff', 'NEW WAYS TO PAY', list([['Grid as insurance', 'a fixed monthly charge for availability'], ['Energy as a service', 'sell comfort or compressed air, not kWh'], ['Utility-owned solar', 'rate-based rooftops and batteries']], { gap: 36 }), { w: 300, h: 150, from: 3, until: 3 });
    s.card('merit', 'SAME DEMAND, WITH AND WITHOUT WIND', bars([{ label: 'No wind', value: P_NO, color: '#f1b3a3' }, { label: '+30 GW wind', value: P_WIND, color: '#a6d38b' }], { w: 300, labelW: 92, max: 130, fmt: (v) => `$${v}/MWh`, y0: 42, h: 20, gap: 14, note: `at ${DEMAND} GW demand; the last plant needed sets the price` }), { w: 300, h: 140, from: 4, until: 4 });
    s.card('fix', 'THREE MARKET FAILURES, THREE FIXES', list([['Backup plants displaced', 'pay for reliability separately'], ['“Missing money”', 'zero-cost prices cannot repay fixed costs'], ['Storage in the cracks', 'rules that treat it as supply and demand'], ['Fix', 'ancillary markets, demand bids, flexibility pay']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'The loop', tag: 'PROBLEM', title: 'A loop that feeds itself',
      body: ['Utilities have long repaid power plants and wires through a charge per kilowatt-hour. That works only if sales stay steady.',
        'Cheap rooftop solar and efficiency shrink sales. The fixed costs remain, so the rate for everyone still buying goes up, which makes self-supply more attractive: the “death spiral”.'],
      callout: { k: 'key', t: 'It is a rate-design problem, not a technology problem. The wires are still needed; the way of paying for them is what breaks.' },
      focus: ['grid', 'pylon', 'homes'], flows: ['f-grid', 'f-bill'], stats: {},
    },
    {
      short: 'The numbers', tag: 'NUMBERS', title: 'Spreading a fixed bill thinner',
      body: [`Take a $${FIXED} million a year grid bill and ${SALES0.toLocaleString('en-US')} GWh of sales: ${rate(0).toFixed(1)}¢ per kWh. If 10% of the remaining sales disappear each round, the rate climbs to ${rate(1).toFixed(1)}¢, ${rate(2).toFixed(1)}¢, ${rate(3).toFixed(1)}¢ and ${rate(4).toFixed(1)}¢ after four rounds.`,
        'The cost did not change. Only the number of kilowatt-hours it is divided by did.'],
      callout: { k: 'warn', t: 'Those who cannot install solar, often renters and lower-income households, carry the growing share. That is the fairness problem.' },
      focus: ['homes', 'rate'], flows: ['f-grid', 'f-bill'], stats: { rate0: `${rate(0).toFixed(1)}¢`, rate4: `${rate(4).toFixed(1)}¢` },
    },
    {
      short: 'What limits it', tag: 'CONCEPT', title: 'Why the grid does not just vanish',
      body: ['Going fully off-grid means batteries big enough for several cloudy days, which costs far more than treating the grid as a backup battery. Big solar and wind farms also keep a per-kWh cost advantage over rooftops.',
        'And the grid does things rooftops cannot: voltage control, frequency, inertia and emergency backup. Complete defection stays rare and uneconomic.'],
      callout: { k: 'know', t: 'The real risk is recovering all fixed costs through a per-kWh charge while kWh shrink, not the end of the grid.' },
      focus: ['grid', 'pylon'], flows: ['f-grid'],
    },
    {
      short: 'New models', tag: 'METHOD', title: 'Charging for what the grid actually does',
      body: ['Fixed or standby charges treat the grid as insurance: pay monthly for availability on cloudy weeks and evening peaks, whatever your net kWh. Energy as a service sells outcomes, such as heating or compressed air, instead of kilowatt-hours.',
        'Utilities can also invest in efficiency and own rooftop solar and batteries themselves, moving away from pure volume sales.'],
      callout: { k: 'key', t: 'Billing should follow cost: fixed grid costs through fixed charges, energy through energy charges.' },
      focus: ['grid', 'homes'], flows: ['f-grid', 'f-bill'],
    },
    {
      short: 'Merit order', tag: 'CONCEPT', title: 'Zero-cost power pushes prices down',
      body: ['In a competitive market, wind and solar enter the stack at nearly $0. They push the most expensive plants out of dispatch and lower the clearing price.',
        `At ${DEMAND} GW of demand, without wind the peakers set a price of $${P_NO}/MWh. With 30 GW of free wind the last plant needed is a combined-cycle gas plant and the price falls to $${P_WIND}.`],
      callout: { k: 'know', t: 'Good for customers in the short run. But the plants pushed out run fewer hours and earn less.' },
      focus: ['grid', 'homes'], flows: ['f-grid'], stats: { pno: `$${P_NO}/MWh`, pwind: `$${P_WIND}/MWh` },
    },
    {
      short: 'Missing money', tag: 'TRADE-OFF', title: 'When the market cannot repay the plants',
      body: ['Three failures follow. Backup plants are displaced but still needed on windless nights. Zero-price hours leave a “missing money” gap for capital-heavy generators, renewables included. And storage falls between rules built for pure supply or pure demand.',
        'Fixes now being used: pay for reliability in ancillary-service markets, let demand response bid as “negawatts”, and reward flexibility in thermal and renewable plants.'],
      callout: { k: 'key', t: 'Technology got ahead of the market. Redesigning the rules, not the machines, is the work now.' },
      focus: ['grid', 'pylon'], flows: ['f-grid', 'f-bill'],
    },
  ],
};
