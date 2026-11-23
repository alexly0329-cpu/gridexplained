import { list, table, bars, code, cols } from './cards.js';
import { bucketHours } from './buckets.js';

// Trader track. General market knowledge, not from the course notes. Prices and sizes are illustrative.
const MONTHLY = [62, 58, 48, 42, 40, 50, 62, 60, 46, 42, 48, 58];
const MN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const PEAK = 55, OFF = 38, H_PEAK = 80, H_OFF = 168 - 80;                              // 5×16 is 80 hours a week; every other hour is off-peak
const ATC = +((PEAK * H_PEAK + OFF * H_OFF) / 168).toFixed(1);
const POWER = 48, GAS = 3.2, HR_PLANT = 7.0;
const IMPL = +(POWER / GAS).toFixed(1), SPARK = +(POWER - HR_PLANT * GAS).toFixed(1);
const LOAD = 100, HOURS = 730, MOVE = 20;                                            // MW, hours in a month, $/MWh price rise
const JAN = bucketHours(2027, 1, [1]);                                                  // January 2027; New Year's Day is a NERC holiday
const CURVE_Y = 62, CURVE_T = +(CURVE_Y * 1.2).toFixed(1);                          // a 20% one-day jump in January on-peak
const LOSS = (h) => Math.round(((1 - h) * LOAD * HOURS * MOVE) / 1000);              // unhedged loss in $ thousand

export default {
  id: 'forwards', group: 'projects', track: 'trader', title: 'Forward Curves & Hedging', icon: 'chart', time: 13, level: 'Intermediate',
  tagline: 'How a power price curve is built, what on-peak and off-peak mean, and how a supplier sizes a hedge.',
  stats: [
    { id: 'atc', label: 'Flat (ATC) price', icon: 'chart' }, { id: 'spark', label: 'Spark spread', icon: 'flame' },
    { id: 'hedge', label: 'Hedge ratio', icon: 'shield' }, { id: 'loss', label: 'Loss if +$20, unhedged', icon: 'gauge' },
  ],
  legend: [['#2a9d8f', 'gas'], ['#e8a33a', 'power'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'What a forward price and a forward curve are', at: 0 }, { t: 'How on-peak and off-peak blocks make a flat price', at: 1 }, { t: 'How many hours each block has in a month', at: 2 },
    { t: 'How gas sets power prices: heat rate and spark spread', at: 3 }, { t: 'How a curve is built', at: 4 }, { t: 'The seven checks before a curve is published', at: 5 },
    { t: 'The main hedging tools', at: 6 }, { t: 'How hedge size changes the loss', at: 7 },
    { t: 'What mark-to-market and value-at-risk tell you', at: 8 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('plant', 0.6, 1.0, 0, 2.0, 1.6, 1.2, 'steel', { label: { t: 'gas plant', icon: 'flame' } });
    s.cyl('store', 1.3, 5.0, 0, 0.7, 1.3, 'teal', { k: 14, label: { t: 'gas supply', icon: 'flame' } });
    s.box('hub', 4.4, 3.4, 0, 1.2, 1.2, 0.8, 'concrete', { label: { t: 'trading hub', icon: 'chart' } });
    s.box('desk', 4.2, 6.6, 0, 1.8, 1.4, 1.0, 'white', { label: { t: 'trading desk', icon: 'gauge' } });
    s.box('fac', 7.4, 1.6, 0, 1.8, 1.4, 1.0, 'cream', { label: { t: 'customer', icon: 'factory' } });
    s.flow('f-gas', [[1.7, 4.6, 0.3], [1.6, 2.6, 0.3]], 'gas', { pipe: true });
    s.flow('f-pow', [[2.6, 2.0, 0.05], [4.4, 3.9, 0.05]], 'electric', {});
    s.flow('f-hedge', [[5.0, 6.6, 0.05], [5.0, 4.6, 0.05]], 'cash', { cls: 'slow' });
    s.flow('f-sale', [[7.4, 3.0, 0.05], [5.6, 4.0, 0.05]], 'cash', { cls: 'slow' });
    s.card('curve', 'A FORWARD CURVE (ILLUSTRATION, $/MWh)', cols(MONTHLY.map((v, i) => ({ label: MN[i], value: v, color: v >= 55 ? '#f6d77e' : '#a6d38b' })), { w: 300, y0: 40, h: 90, max: 70, fmt: (v) => `${v}` }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('blocks', 'THE STANDARD BLOCKS', table(['Block', 'Covers', 'Hours a week'], [['5×16', 'weekday days', `${H_PEAK}`], ['7×8', 'every night', '56'], ['2×16', 'weekend days', '32']], { cols: [12, 70, 206], rowH: 26 }), { w: 300, h: 134, from: 1, until: 1 });
    s.card('spark', 'HEAT RATE AND SPARK SPREAD', code([`implied heat rate = power ÷ gas`, `  = $${POWER} ÷ $${GAS.toFixed(2)} = ${IMPL} MMBtu/MWh`, ``, `spark spread = power − plant HR × gas`, `  = ${POWER} − ${HR_PLANT.toFixed(1)} × ${GAS.toFixed(2)} = $${SPARK}/MWh`, ``, `power in $/MWh, gas in $/MMBtu`], { y0: 38, gap: 13 }), { w: 300, h: 140, from: 3, until: 3 });
    s.card('hours', 'HOURS IN JANUARY 2027', table(['Block', 'Days', 'Hours'], [['5×16 on-peak', `${JAN.onDays}`, `${JAN.onPeak}`], ['2×16 weekend, holiday', `${JAN.offDays}`, `${JAN.offDayHours}`], ['7×8 nights', `${JAN.days}`, `${JAN.nights}`], ['Month total', '', `${JAN.total}`]], { cols: [12, 148, 214], rowH: 26, hl: 3 }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('valid', 'SEVEN CHECKS BEFORE PUBLISHING', list([['Against yesterday', 'a move above 10% needs a reason'], ['Against broker marks', 'inside the bid and offer'], ['On-peak to off-peak', 'on-peak should sit above, by season'], ['Seasonal shape', 'winter and summer humps'], ['Basis sign', 'zone against hub, as usual'], ['Missing months', 'every month has a price'], ['Units', '$/MWh, not $/kWh or $/MMBtu']], { gap: 26 }), { w: 300, h: 214, from: 5, until: 5 });
    s.card('build', 'BUILDING A CURVE', list([['Start from traded hub prices', 'brokers, exchanges, quotes'], ['Add basis and shape', 'zone, month and hour patterns'], ['Check against traded strips', 'months must average to the year'], ['Publish every day', 'pricing models read it']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('tools', 'HEDGING TOOLS', table(['Tool', 'Does', 'Where'], [['Swap or forward', 'fixes a price', 'private'], ['Future', 'fixes a price', 'exchange'], ['Option', 'caps a price', 'premium'], ['Physical block', 'delivers power', 'bilateral']], { cols: [12, 112, 216], rowH: 26 }), { w: 300, h: 160, from: 6, until: 6 });
    s.card('ratio', `LOSS IF PRICE RISES $${MOVE} FOR A MONTH`, bars([0, 0.5, 0.8, 1].map((h, i) => ({ label: `${h * 100}% hedged`, value: LOSS(h), color: ['#f1b3a3', '#f6d77e', '#cfe3b2', '#a6d38b'][i] })), { w: 300, labelW: 86, max: LOSS(0), fmt: (v) => `$${v.toLocaleString('en-US')}k`, y0: 38, h: 16, gap: 10, note: `${LOAD} MW flat, ${HOURS} hours` }), { w: 300, h: 176, from: 7, until: 7 });
    s.card('risk', 'RISK MEASURES', list([['Mark to market', 'value of positions at today’s curve'], ['Value at risk', 'a loss not exceeded on most days'], ['Stress tests', 'a cold snap, a gas spike'], ['Limits', 'size caps the desk must respect']], { gap: 33 }), { w: 300, h: 170, from: 8, until: 8 });
  },
  steps: [
    {
      short: 'Forward price', tag: 'CONCEPT', title: 'Prices for later, quoted today',
      body: ['A forward price is what you can lock in today for power delivered in a future period. Put prices for each month in a row and you have a forward curve.',
        'Curves are usually higher in summer and winter, when demand is high, and lower in spring and autumn.'],
      callout: { k: 'key', t: 'The curve is the central tool of a supply desk. Pricing, hedging and risk numbers all read it.' },
      focus: ['hub', 'desk', 'fac'], flows: ['f-hedge', 'f-sale'],
    },
    {
      short: 'Blocks', tag: 'NUMBERS', title: 'On-peak, off-peak and flat',
      body: [`The week has 168 hours. On-peak is the 5×16 block: weekday days, ${H_PEAK} hours. The other ${H_OFF} hours, weekday nights plus weekends, are off-peak. A flat, or around-the-clock, price is an average of both.`,
        `With illustrative prices of $${PEAK} on-peak and $${OFF} off-peak, the flat price is (${H_PEAK} × ${PEAK} + ${H_OFF} × ${OFF}) ÷ 168 = $${ATC}.`],
      callout: { k: 'warn', t: 'A flat hedge fits a flat load. A business open on weekdays needs more on-peak power.' },
      focus: ['hub', 'desk'], flows: [], stats: { atc: `$${ATC}` },
    },
    {
      short: 'Hours', tag: 'NUMBERS', title: 'How many hours in each block',
      body: [`Count hours, not just days. January 2027 has ${JAN.days} days. New Year’s Day is a NERC holiday, so it counts as a weekend-style day, leaving ${JAN.onDays} on-peak days × 16 = ${JAN.onPeak} on-peak hours. The ${JAN.offDays} weekend and holiday days give ${JAN.offDayHours} hours of 2×16, and ${JAN.days} nights give ${JAN.nights} hours of 7×8.`,
        `Together that is ${JAN.total} hours, a useful check on any bucket table. The six NERC holidays are New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving and Christmas, and a holiday that falls on a Sunday is normally observed on the Monday.`],
      callout: { k: 'warn', t: 'A wrong hour count shifts every weighted price and every hedge size built on the bucket.' },
      focus: ['hub', 'desk'], flows: [], stats: { atc: `${JAN.onPeak} on-peak h` },
    },
    {
      short: 'Gas link', tag: 'NUMBERS', title: 'Gas sets the price, mostly',
      body: [`Gas plants are often the marginal supply, so power prices follow gas. Divide the power price by the gas price to get the implied heat rate: $${POWER} ÷ $${GAS.toFixed(2)} gives ${IMPL}.`,
        `A plant that burns ${HR_PLANT.toFixed(1)} MMBtu per MWh earns the spark spread: $${POWER} − ${HR_PLANT.toFixed(1)} × $${GAS.toFixed(2)} = $${SPARK} per MWh before other costs.`],
      callout: { k: 'know', t: 'Traders watch the implied heat rate for a quick read on whether power is cheap or dear against gas.' },
      focus: ['plant', 'store', 'hub'], flows: ['f-gas', 'f-pow'], stats: { spark: `$${SPARK}` },
    },
    {
      short: 'Build it', tag: 'METHOD', title: 'How a curve gets made',
      body: ['Start from liquid prices at a trading hub. Add the basis to reach the zone where load is settled, then shape the monthly numbers into the hours and block patterns customers need.',
        'Then validate: the months must average to the quoted year, no month should jump for no reason, and the result should match the market the desk can actually trade.'],
      callout: { k: 'key', t: 'A curve that is wrong, or stale, will mis-price every sale built on it.' },
      focus: ['hub', 'desk'], flows: ['f-hedge'],
    },
    {
      short: 'Validate', tag: 'METHOD', title: 'Seven checks before it goes out',
      body: [`Say January on-peak was $${CURVE_Y} yesterday and is $${CURVE_T} this morning, up 20%. Before publishing, run the checks: compare with yesterday, compare with broker marks, test the on-peak to off-peak ratio, look at the seasonal shape, check the basis sign, look for missing months and check units.`,
        'In a spreadsheet, conditional formatting can flag every month whose move exceeds 10%, so only real exceptions need a reason. Possible causes are a data error, a stale or wrong broker mark, a gas move, a weather change, a basis change or a unit slip.'],
      callout: { k: 'key', t: 'Never publish a surprising number you cannot explain. A flag is a question to answer, not an error to hide.' },
      focus: ['desk', 'hub'], flows: ['f-hedge'],
    },
    {
      short: 'Tools', tag: 'CONCEPT', title: 'How to hedge',
      body: ['A swap or forward fixes a price in a private deal. A future does it on an exchange, with daily margin payments. An option caps a price in return for an up-front premium. A physical block delivers actual power under a bilateral contract.',
        'Each costs something: a premium, collateral or counterparty credit.'],
      callout: { k: 'know', t: 'Fixing a price protects against rises and gives up gains. An option keeps gains but costs a premium.' },
      focus: ['desk', 'hub'], flows: ['f-hedge'],
    },
    {
      short: 'Hedge size', tag: 'NUMBERS', title: 'How much to hedge',
      body: [`Suppose ${LOAD} MW of flat sales is open and the price rises $${MOVE} for a ${HOURS}-hour month. Unhedged, the loss is $${LOSS(0).toLocaleString('en-US')}k. At 50% hedged it is $${LOSS(0.5)}k, at 80% hedged it is $${LOSS(0.8)}k.`,
        'Desks rarely hedge 100%, because the load itself is uncertain. Over-hedging costs money if the customer uses less and the price falls, so hedges are built in layers as the sale date and the delivery date get closer.'],
      callout: { k: 'warn', t: 'A hedge is sized to expected volume, which is itself a forecast.' },
      focus: ['desk', 'hub', 'fac'], flows: ['f-hedge', 'f-sale'], stats: { hedge: '50–100%', loss: `$${LOSS(0).toLocaleString('en-US')}k` },
    },
    {
      short: 'Risk', tag: 'CONCEPT', title: 'Measuring what could go wrong',
      body: ['Mark-to-market revalues every open position at today’s curve, so a gain or loss shows up daily. Value at risk estimates a loss that should not be exceeded on most days, based on position size and price volatility.',
        'Stress tests ask about extremes. Limits cap the size of the open position so one bad week cannot threaten the business.'],
      callout: { k: 'key', t: 'The daily position report feeds these numbers, so its accuracy matters. That is the next lesson in this track.' },
      focus: ['desk', 'hub'], flows: [],
    },
  ],
};
