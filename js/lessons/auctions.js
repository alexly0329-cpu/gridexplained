import { list, bars } from './cards.js';

// Trader track. General market knowledge, not from the course notes. The bid build-up and collateral example use illustrative figures.
const BID = [['Energy', 46], ['Shape and swing risk', 3], ['Capacity and wires', 21], ['Margin', 3]];
const PRICE = BID.reduce((a, [, v]) => a + v, 0);
const EXPOSURE = 1.6, THRESHOLD = 1.0, CALL = +(EXPOSURE - THRESHOLD).toFixed(1);   // $ million

export default {
  id: 'auctions', group: 'trader', track: 'trader', title: 'Auctions, RFPs & Credit', icon: 'shield', time: 10, level: 'Intermediate',
  tagline: 'How suppliers win business through auctions and bids, what qualifying takes, and how credit and collateral work.',
  stats: [
    { id: 'bid', label: 'Bid price', icon: 'chart' }, { id: 'exp', label: 'Exposure', icon: 'gauge' },
    { id: 'thr', label: 'Unsecured limit', icon: 'shield' }, { id: 'call', label: 'Collateral call', icon: 'zap' },
  ],
  legend: [['#6f9a3c', 'money'], ['#7c63d0', 'paperwork']],
  learn: [
    { t: 'How auctions and RFPs create supply deals', at: 0 }, { t: 'What a supplier must show to qualify', at: 1 },
    { t: 'How a bid price is built', at: 2 }, { t: 'What the winner’s curse is', at: 3 },
    { t: 'How exposure becomes a collateral call', at: 4 }, { t: 'Which counterparties to watch', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('buyer', 0.6, 1.0, 0, 1.8, 1.5, 1.2, 'steel', { label: { t: 'buyer', icon: 'factory' } });
    s.box('sup', 4.2, 4.6, 0, 1.8, 1.5, 1.0, 'green', { label: { t: 'supplier', icon: 'factory' } });
    s.box('bank', 7.0, 6.6, 0, 1.5, 1.3, 1.0, 'blue', { from: 4, label: { t: 'credit support', icon: 'shield' } });
    s.box('rules', 7.0, 1.2, 0, 1.4, 1.2, 0.8, 'white', { from: 1, until: 1, label: { t: 'qualification', icon: 'check' } });
    s.flow('f-bid', [[4.2, 5.0, 0.05], [2.0, 5.0, 0.05], [2.0, 2.6, 0.05]], 'ac', {});
    s.flow('f-award', [[2.4, 2.0, 0.05], [4.6, 4.6, 0.05]], 'cash', { from: 3, cls: 'slow' });
    s.flow('f-doc', [[6.0, 5.0, 0.05], [7.6, 2.4, 0.05]], 'ac', { from: 1, until: 1, cls: 'slow' });
    s.flow('f-coll', [[6.0, 5.6, 0.05], [7.4, 6.8, 0.05]], 'cash', { from: 4, cls: 'slow' });
    s.card('why', 'HOW SUPPLY IS BOUGHT', list([['Default-service auctions', 'utilities buy for customers who do not shop'], ['Municipal and group deals', 'a town or group seeks one supplier'], ['Large-customer RFPs', 'a company asks suppliers for quotes']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('qual', 'WHAT QUALIFYING TAKES', list([['Licence', 'certified by the state commission'], ['Market access', 'registered with the ISO'], ['Financial strength', 'credit rating or posted collateral'], ['Operations', 'able to schedule, settle and bill']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('bid', 'BUILDING A BID ($/MWh, ILLUSTRATION)', bars(BID.map(([label, value], i) => ({ label, value, color: ['#f6d77e', '#cfc0e8', '#9fcdf0', '#a6d38b'][i] })), { w: 300, labelW: 128, max: 46, fmt: (v) => `${v}`, y0: 36, h: 16, gap: 10, note: `total bid $${PRICE}` }), { w: 300, h: 172, from: 2, until: 2 });
    s.card('curse', 'THE WINNER’S CURSE', list([['Lowest price wins', 'so the bid sits near cost'], ['A low bid hides a mistake', 'in curve, load or margin'], ['Winning locks it in', 'for the whole term'], ['Defend with checks', 'a second pair of eyes on the model']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('coll', 'WHEN EXPOSURE PASSES THE LIMIT', bars([{ label: 'Exposure', value: EXPOSURE, color: '#f1b3a3' }, { label: 'Unsecured limit', value: THRESHOLD, color: '#cfe3b2' }, { label: 'Collateral call', value: CALL, color: '#f6d77e' }], { w: 300, labelW: 108, max: 2, fmt: (v) => `$${v}M`, y0: 40, h: 20, gap: 14, note: 'what the other party owes you, over the limit' }), { w: 300, h: 160, from: 4, until: 4 });
    s.card('cp', 'WHO CAN FAIL TO PAY', list([['Customers', 'bad debt and bankruptcy'], ['Trading counterparties', 'owe you if prices move your way'], ['Suppliers of power', 'may fail to deliver'], ['Net them', 'one master agreement offsets both ways']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Why bid', tag: 'CONCEPT', title: 'Big supply deals are won by bidding',
      body: ['Many states let utilities buy default supply through auctions, where suppliers bid prices and the lowest qualified bids win. Towns and groups of customers run similar solicitations, and large companies send out requests for proposals.',
        'For a supplier these are major sources of volume, and each needs a priced, hedged, documented bid by a deadline.'],
      callout: { k: 'key', t: 'A bid is a quote that the supplier can be held to. Speed matters, but accuracy matters more.' },
      focus: ['buyer', 'sup'], flows: ['f-bid'],
    },
    {
      short: 'Qualify', tag: 'METHOD', title: 'Prove you can deliver first',
      body: ['Before bidding a supplier usually has to show a state licence, registration with the ISO, enough financial strength through a credit rating or posted collateral, and the operations to schedule power, settle with the ISO and bill customers.',
        'Qualification packages ask for references, financial statements and forms with firm deadlines.'],
      callout: { k: 'know', t: 'Qualification is part of the analyst’s job: gathering, checking and filing the documents on time.' },
      focus: ['rules', 'sup', 'buyer'], flows: ['f-doc', 'f-bid'],
    },
    {
      short: 'Price it', tag: 'NUMBERS', title: 'Turning the curve into a bid',
      body: [`Illustrative bid: energy from the forward curve at $${BID[0][1]}, $${BID[1][1]} for the cost of load shape and swings, $${BID[2][1]} for capacity and transmission charges, and a $${BID[3][1]} margin. The total is $${PRICE} per MWh.`,
        'The curve, the load forecast and the pass-through charges all have to be current. An out-of-date input becomes a bad price for years.'],
      callout: { k: 'warn', t: 'In a competitive auction, every dollar of margin is a chance to lose.' },
      focus: ['sup', 'buyer'], flows: ['f-bid'], stats: { bid: `$${PRICE}` },
    },
    {
      short: 'Curse', tag: 'PROBLEM', title: 'The winner’s curse',
      body: ['When the lowest bid wins, the winner is often the bidder who most underestimated its cost. A wrong curve, a missed charge or an over-optimistic load forecast can win the deal and lose money on it.',
        'The defence is process: check inputs, compare with prior auctions, and have the bid reviewed before it is submitted.'],
      callout: { k: 'key', t: 'Winning is not success. Winning at the right price is.' },
      focus: ['sup', 'buyer'], flows: ['f-bid', 'f-award'],
    },
    {
      short: 'Collateral', tag: 'NUMBERS', title: 'Exposure and collateral',
      body: [`Exposure is what the other party owes you if the trade were closed today. Contracts set an unsecured limit. In this example exposure is $${EXPOSURE} million against a $${THRESHOLD} million limit, so a collateral call of $${CALL} million applies.`,
        'Exchanges work the same way daily through margin. Collateral ties up cash and credit lines, so hedging has a funding cost.'],
      callout: { k: 'know', t: 'A big price move can cause a large collateral call within a day. Liquidity planning is part of risk management.' },
      focus: ['sup', 'bank'], flows: ['f-coll'], stats: { exp: `$${EXPOSURE}M`, thr: `$${THRESHOLD}M`, call: `$${CALL}M` },
    },
    {
      short: 'Counterparties', tag: 'CONCEPT', title: 'Who can fail to pay',
      body: ['Credit risk runs in both directions: customers may not pay, trading partners may owe you when prices move your way, and power sellers may fail to deliver.',
        'A master agreement lets the parties net what they owe each other, so only the difference is at risk.'],
      callout: { k: 'key', t: 'Watch credit as closely as price. A hedge is worth only as much as the party behind it.' },
      focus: ['sup', 'bank', 'buyer'], flows: ['f-coll', 'f-award'],
    },
  ],
};
