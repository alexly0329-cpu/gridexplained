import { house } from './common.js';
import { list } from './cards.js';

// Trader track. Five practice cases with model answers, not from the course notes. All figures are illustrative and computed from the inputs below.
const HOT = { mw: 100, over: 0.12, days: 3, spot: 140, hedge: 55 };
const HOT_MWH = HOT.mw * HOT.over * 24 * HOT.days, HOT_COST = HOT_MWH * (HOT.spot - HOT.hedge);
const GAS = { was: 3.2, now: +(3.2 * 1.3).toFixed(2), hr: 15, vol: 12000 };
const PWR_WAS = GAS.was * GAS.hr, PWR_NOW = +(GAS.now * GAS.hr).toFixed(1), QUOTE_HIT = (PWR_NOW - PWR_WAS) * GAS.vol;
const JAN = { was: 62, now: +(62 * 1.2).toFixed(1) };
const SHORT = { mw: 5, hours: 744 }, SHORT_MWH = SHORT.mw * SHORT.hours;
const BID = [['Energy', 46], ['Shape and swing', 3], ['Capacity and wires', 21], ['Margin', 3]], BID_TOTAL = BID.reduce((a, [, v]) => a + v, 0);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

const FRAME = ['What happened', 'What it does to the position', 'What I check', 'What I do'];
const ans = (rows) => list(rows.map((r, i) => [FRAME[i], r]), { gap: 33 });

export default {
  id: 'cases', group: 'trader', track: 'trader', title: 'Practice Cases', icon: 'sparkle', time: 14, level: 'Advanced',
  tagline: 'Five desk scenarios with a two-minute answer outline: hot load, a gas jump, a curve flag, a deal-flow error and an auction bid.',
  stats: [
    { id: 'case', label: 'Case', icon: 'layers' }, { id: 'num', label: 'Key number', icon: 'chart' },
    { id: 'time', label: 'Answer time', icon: 'clock' }, { id: 'parts', label: 'Parts', icon: 'check' },
  ],
  legend: [['#e8a33a', 'power'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'The four-part answer frame', at: 0 }, { t: 'What load running hot does to a hedged book', at: 1 },
    { t: 'What a gas jump does to a quote already sent', at: 2 }, { t: 'What to check when a curve flag appears', at: 3 },
    { t: 'How to trace a new short position', at: 4 }, { t: 'What goes into an aggregation bid', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('desk', 0.8, 1.0, 0, 1.8, 1.5, 1.0, 'white', { label: { t: 'trading desk', icon: 'gauge' } });
    s.box('hub', 4.0, 3.4, 0, 1.2, 1.2, 0.8, 'concrete', { label: { t: 'market', icon: 'chart' } });
    s.box('sales', 0.8, 5.8, 0, 1.8, 1.4, 1.0, 'green', { label: { t: 'sales team', icon: 'factory' } });
    house(s, 'cust', 6.6, 6.0, { label: { t: 'customer', icon: 'house' } }); house(s, 'cust', 7.8, 4.6);
    s.flow('f-m', [[2.6, 1.8, 0.05], [4.2, 3.6, 0.05]], 'ac', {});
    s.flow('f-s', [[1.8, 5.8, 0.05], [1.8, 2.6, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-c', [[6.6, 6.4, 0.05], [2.6, 6.4, 0.05]], 'cash', { cls: 'slow' });
    s.card('frame', 'THE FOUR-PART ANSWER', list(FRAME.map((t, i) => [t, ['the facts, in a sentence', 'long or short, by how much, when', 'the inputs and data you would test', 'the next step and who you tell'][i]]), { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('c1', 'CASE 1: LOAD RUNS HOT', ans(['load 12% over forecast for three days', `${fmt(HOT_MWH)} MWh short, bought at spot`, 'weather, meter data, hedge shape', 'tell sales and the desk; rehedge']), { w: 300, h: 170, from: 1, until: 1 });
    s.card('c2', 'CASE 2: GAS UP 30% OVERNIGHT', ans(['a quote went out at yesterday’s price', 'unsigned: a price risk, not a position yet', 'implied heat rate, curve move, quote age', 'hedge on signing; reprice or expire']), { w: 300, h: 170, from: 2, until: 2 });
    s.card('c3', 'CASE 3: A CURVE FLAG', ans(['January on-peak up 20% in a day', 'sales quotes and marks read this curve', 'seven checks: data, brokers, gas, units', 'hold it, explain it, then publish']), { w: 300, h: 170, from: 3, until: 3 });
    s.card('c4', 'CASE 4: A NEW 5 MW SHORT', ans(['AEP zone shows a short that was not there', `${fmt(SHORT_MWH)} MWh open over January`, 'new deals, edits, dropped hedges, zone', 'find the cause, correct, rerun']), { w: 300, h: 170, from: 4, until: 4 });
    s.card('c5', 'CASE 5: AN AGGREGATION BID', ans(['municipal RFP due Friday', 'a new fixed-price load if it is won', 'curve, load shape, credit, legal terms', 'build the price, review, then submit']), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'The frame', tag: 'METHOD', title: 'A two-minute answer in four parts',
      body: ['Answer each case in the same four parts. What happened: the facts in a sentence. What it does to the position: long or short, how much, and when. What you check: the inputs and data you would test. What you do: the next step and who you tell.',
        'A fixed frame stops you rambling and shows you think in positions, risk and data.'],
      callout: { k: 'key', t: 'Say a number early. “About 860 MWh short” is better than “quite a lot of exposure”.' },
      focus: ['desk', 'sales', 'hub'], flows: ['f-m', 'f-s'], stats: { time: '2 minutes', parts: '4' },
    },
    {
      short: 'Hot load', tag: 'NUMBERS', title: 'Load comes in 12% over forecast',
      body: [`A January cold snap lifts a ${HOT.mw} MW customer base ${HOT.over * 100}% above forecast for ${HOT.days} days, and you hedged to forecast. The extra ${HOT.mw * HOT.over} MW over ${HOT.days * 24} hours is ${fmt(HOT_MWH)} MWh short, bought at spot.`,
        `At $${HOT.spot} spot against a $${HOT.hedge} hedge that is ${fmt(HOT_MWH)} × $${HOT.spot - HOT.hedge} = $${fmt(HOT_COST)} extra cost. Check the weather, the meter data and whether the hedges were the right shape. Tell sales the risk and the desk whether to rehedge the following days.`],
      callout: { k: 'know', t: 'Link the cost to the cause, which is load against forecast, and say what you would change in the forecast.' },
      focus: ['desk', 'hub', 'cust'], flows: ['f-m'], stats: { case: '1 of 5', num: `$${fmt(HOT_COST)}` },
    },
    {
      short: 'Gas jump', tag: 'NUMBERS', title: 'Gas jumps 30% overnight',
      body: [`Gas goes from $${GAS.was} to $${GAS.now}. With an implied heat rate near ${GAS.hr}, power moves from about $${PWR_WAS.toFixed(0)} to $${PWR_NOW} per MWh. A quote sent yesterday at the old price now costs $${(PWR_NOW - PWR_WAS).toFixed(1)} more per MWh to cover.`,
        `On ${fmt(GAS.vol)} MWh that is about $${fmt(QUOTE_HIT)} of lost margin if the customer signs at the old price and you hedge today. It is a price risk, not yet a position. Hedge when the customer signs, or at quote for a large deal, and shorten or reprice quotes that stay open in a fast market.`],
      callout: { k: 'warn', t: 'An open quote is a free option for the customer. Give it an expiry and know how much it is worth.' },
      focus: ['desk', 'hub', 'sales'], flows: ['f-m', 'f-s'], stats: { case: '2 of 5', num: `$${fmt(QUOTE_HIT)}` },
    },
    {
      short: 'Curve flag', tag: 'METHOD', title: 'The curve jumps 20% in a day',
      body: [`This morning’s Western Hub January on-peak is $${JAN.now} against $${JAN.was} yesterday. Before publishing, check for a data error, broker marks, a gas move, a weather change, a basis change and units.`,
        'If the cause is real, say so in the note and move on. If it is a mistake, fix it first, because sales quotes and mark-to-market both read this curve.'],
      callout: { k: 'key', t: 'Name the checks in order, from cheapest to most involved. Data and units before market stories.' },
      focus: ['desk', 'hub'], flows: ['f-m'], stats: { case: '3 of 5', num: `${JAN.was} to ${JAN.now}` },
    },
    {
      short: 'Deal error', tag: 'METHOD', title: 'A 5 MW short appears in AEP',
      body: [`The position report shows a ${SHORT.mw} MW short in the AEP zone that was not there yesterday. Over January’s ${SHORT.hours} hours that is ${fmt(SHORT_MWH)} MWh open.`,
        'Start with what changed: compare yesterday’s and today’s deal lists. Look for new customer deals, edited dates or zones, a hedge that was cancelled or dropped, and a unit slip. Fix the cause, rerun the report, and note what you learned.'],
      callout: { k: 'know', t: 'Work backwards from the difference, not forwards from the whole book. A diff of two lists finds it fast.' },
      focus: ['desk', 'sales'], flows: ['f-s'], stats: { case: '4 of 5', num: `${fmt(SHORT_MWH)} MWh` },
    },
    {
      short: 'Auction bid', tag: 'METHOD', title: 'A municipal RFP due Friday',
      body: ['Sales wants to bid on a municipal aggregation RFP. From supply you need the curve, a load shape for the group and a hedge plan. From credit you need limits and collateral needs. From legal you need the contract terms and the filings.',
        `The price builds up like this, with illustrative numbers: ${BID.map(([n, v]) => `${n.toLowerCase()} $${v}`).join(', ')}, for a total of $${BID_TOTAL} per MWh. Have a second person review the model before it goes out.`],
      callout: { k: 'key', t: 'Say what you need from each team, by when, and what could make you pull the bid.' },
      focus: ['desk', 'sales', 'cust'], flows: ['f-c', 'f-s'], stats: { case: '5 of 5', num: `$${BID_TOTAL}` },
    },
  ],
};
