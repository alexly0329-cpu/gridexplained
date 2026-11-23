import { list, table, bars, cols } from './cards.js';
import { bucketHours } from './buckets.js';

// Trader track. General market knowledge, not from the course notes. Volumes and prices are illustrative; open volume, percent hedged and mark-to-market are computed.
const BOOK = [['Jul', 50000, 40000], ['Aug', 52000, 39000], ['Sep', 41000, 34000], ['Oct', 38000, 36000]].map(([m, sold, bought]) => ({ m, sold, bought, open: sold - bought, pct: Math.round((bought / sold) * 100) }));
const fmt = (n) => n.toLocaleString('en-US');
// A yearly customer deal spread by a monthly load shape, then split into on-peak and off-peak hours for July 2026 (computed).
const DEAL = 12000, SHAPE = [10, 9, 8, 7, 7, 8, 10, 10, 8, 7, 7, 9], MN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const JUL_DEAL = (DEAL * SHAPE[6]) / 100, JH = bucketHours(2026, 7, []);
const JUL_ON = Math.round((JUL_DEAL * JH.onPeak) / JH.total), JUL_OFF = JUL_DEAL - JUL_ON;
const PORT = 10;                                                    // ten similar deals make the portfolio
const SOLD = [JUL_ON * PORT, JUL_OFF * PORT];
const OFFH = JH.total - JH.onPeak;
const BOUGHT = [15 * JH.onPeak, 8 * OFFH];                         // a 15 MW on-peak block and an 8 MW off-peak block
const NET = SOLD.map((v, i) => ({ sold: v, bought: BOUGHT[i], open: v - BOUGHT[i], pct: Math.round((BOUGHT[i] / v) * 100) }));
const MOVE = 3, MTM = BOOK[0].open * MOVE;                         // $ change for a $3 curve move on July’s open volume

export default {
  id: 'position', group: 'projects', track: 'trader', title: 'The Daily Position Report', icon: 'layers', time: 11, level: 'Intermediate',
  tagline: 'What a power position is, how to read the daily report, and how to keep its numbers right.',
  stats: [
    { id: 'open', label: 'Open, July', icon: 'gauge' }, { id: 'pct', label: 'Hedged, July', icon: 'shield' },
    { id: 'mtm', label: 'Move on a $3 shift', icon: 'chart' }, { id: 'chk', label: 'Daily checks', icon: 'check' },
  ],
  legend: [['#7c63d0', 'data'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'What it means to be long or short', at: 0 }, { t: 'What feeds a position report', at: 1 },
    { t: 'How a yearly deal becomes monthly and bucket volumes', at: 2 }, { t: 'How to read a month-by-month position', at: 3 },
    { t: 'How hedges give the net open position', at: 4 }, { t: 'How to validate new deals', at: 5 },
    { t: 'What a daily reconciliation covers', at: 6 }, { t: 'How a position turns into profit and loss', at: 7 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('sales', 0.6, 0.8, 0, 1.6, 1.4, 1.0, 'green', { label: { t: 'sales', icon: 'house' } });
    s.box('trades', 0.6, 4.6, 0, 1.6, 1.4, 1.0, 'blue', { label: { t: 'purchases', icon: 'chart' } });
    s.cyl('db', 4.0, 3.6, 0, 0.8, 1.2, 'violet', { k: 12, label: { t: 'deal system', icon: 'layers' } });
    s.box('iso', 7.2, 1.0, 0, 1.6, 1.3, 1.0, 'white', { label: { t: 'ISO data', icon: 'gauge' } });
    s.box('rep', 3.6, 6.6, 0, 1.8, 1.4, 1.0, 'cream', { label: { t: 'position report', icon: 'clock' } });
    s.box('desk', 7.2, 5.8, 0, 1.6, 1.4, 1.0, 'steel', { label: { t: 'trading desk', icon: 'factory' } });
    s.flow('f-s', [[2.2, 1.6, 0.05], [3.6, 3.4, 0.05]], 'ac', {});
    s.flow('f-t', [[2.2, 5.2, 0.05], [3.8, 4.2, 0.05]], 'ac', {});
    s.flow('f-i', [[7.2, 2.0, 0.05], [4.9, 3.6, 0.05]], 'ac', { from: 6 });
    s.flow('f-r', [[4.1, 4.5, 0.05], [4.4, 6.6, 0.05]], 'ac', {});
    s.flow('f-d', [[5.4, 7.2, 0.05], [7.2, 6.4, 0.05]], 'cash', { cls: 'slow' });
    s.card('ls', 'LONG, SHORT OR FLAT', list([['Short', 'sold more than bought: hurt if prices rise'], ['Long', 'bought more than sold: hurt if prices fall'], ['Flat', 'bought what was sold']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('in', 'WHAT FEEDS THE REPORT', list([['Customer sales', 'contract volumes by month and hour'], ['Purchases', 'forwards, futures, ISO buys'], ['Load forecast', 'expected use, not just contracts'], ['Market curve', 'to value what is open']], { gap: 33 }), { w: 300, h: 170, from: 1, until: 1 });
    s.card('book', 'A POSITION BY MONTH (MWh)', table(['Month', 'Sold', 'Bought', 'Open', 'Hedged'], BOOK.map((r) => [r.m, fmt(r.sold), fmt(r.bought), fmt(r.open), `${r.pct}%`]), { cols: [12, 56, 112, 172, 228], rowH: 26 }), { w: 300, h: 160, from: 3, until: 3 });
    s.card('vol', 'ONE 12,000 MWh DEAL, BY MONTH', cols(SHAPE.map((v, i) => ({ label: MN[i], value: v, color: i === 6 ? '#f6d77e' : '#a6d38b' })), { w: 300, y0: 44, h: 70, max: 12 }) + `<text x="12" y="146" style="font-size:8.5px">July: ${fmt(JUL_DEAL)} MWh = ${fmt(JUL_ON)} on-peak + ${fmt(JUL_OFF)} off-peak</text><text x="12" y="158" style="font-size:8.5px">${JH.onDays} on-peak days × 16 = ${JH.onPeak} of ${JH.total} hours</text>`, { w: 300, h: 166, from: 2, until: 2 });
    s.card('net', 'JULY NET POSITION BY BLOCK (MWh)', table(['Block', 'Sold', 'Bought', 'Open', 'Hedged'], [['On-peak', fmt(NET[0].sold), fmt(NET[0].bought), fmt(NET[0].open), `${NET[0].pct}%`], ['Off-peak', fmt(NET[1].sold), fmt(NET[1].bought), fmt(NET[1].open), `${NET[1].pct}%`]], { cols: [12, 70, 124, 180, 232], rowH: 26 }) + `<text x="12" y="112" style="font-size:8.5px">bought: 15 MW × ${JH.onPeak} h on-peak, 8 MW × ${OFFH} h off-peak</text><text x="12" y="124" style="font-size:8.5px">off-peak is the under-hedged block</text>`, { w: 300, h: 138, from: 4, until: 4 });
    s.card('chk', 'CHECKS ON NEW DEALS', list([['Counted once', 'no duplicates, none missing'], ['Right dates', 'start, end and delivery month'], ['Right point', 'the correct hub or zone'], ['Right units', 'MW and MWh are not the same'], ['Drops removed', 'customers who left come out']], { gap: 28 }), { w: 300, h: 178, from: 5, until: 5 });
    s.card('rec', 'THE DAILY RECONCILIATION', list([['Deal system to the report', 'every deal appears once'], ['Report to ISO data', 'actual use against forecast'], ['Invoices to deals', 'what was billed matches'], ['Explain every break', 'write down why numbers differ']], { gap: 33 }), { w: 300, h: 170, from: 6, until: 6 });
    s.card('pnl', 'VALUE OF JULY’S OPEN VOLUME', bars([{ label: `Curve up $${MOVE}`, value: MTM, v: -MTM, color: '#f1b3a3' }, { label: `Curve down $${MOVE}`, value: MTM, v: MTM, color: '#a6d38b' }], { w: 300, labelW: 100, max: MTM * 1.5, fmt: (v, r) => `${r.v < 0 ? '−' : '+'}$${fmt(Math.abs(r.v))}`, y0: 42, h: 20, gap: 14, note: `${fmt(BOOK[0].open)} MWh short` }), { w: 300, h: 140, from: 7, until: 7 });
  },
  steps: [
    {
      short: 'Position', tag: 'CONCEPT', title: 'Long, short or flat',
      body: ['A position is the difference between what a supplier has sold and what it has bought, for each hour or month. A supplier that has sold more than it bought is short: it gains if prices fall and loses if they rise. The reverse is long.',
        'Most suppliers are naturally short, since they sell to customers first and buy power afterwards.'],
      callout: { k: 'key', t: 'The position report is the one page that says how exposed the business is today.' },
      focus: ['sales', 'trades', 'db', 'rep'], flows: ['f-s', 'f-t', 'f-r'],
    },
    {
      short: 'Inputs', tag: 'CONCEPT', title: 'Where the numbers come from',
      body: ['Customer sales give contract volumes. Purchases give hedges already bought. A load forecast turns contracted volumes into what customers will actually use. The market curve values whatever is left open.',
        'Each comes from a different team or system, so keeping them in step takes care.'],
      callout: { k: 'know', t: 'The report is only a view. The records behind it need to be right first.' },
      focus: ['sales', 'trades', 'db', 'rep'], flows: ['f-s', 'f-t', 'f-r'],
    },
    {
      short: 'Volumes', tag: 'METHOD', title: 'From a yearly deal to hourly buckets',
      body: [`A customer deal is usually written as a yearly volume, such as ${fmt(DEAL)} MWh, but hedges are bought by month and block. Spread the year over months with a load shape: July takes ${SHAPE[6]}%, so ${fmt(JUL_DEAL)} MWh.`,
        `Then split it by hours. July 2026 has ${JH.onDays} on-peak days, so ${JH.onPeak} of ${JH.total} hours are on-peak. A flat load puts ${fmt(JUL_ON)} MWh on-peak and ${fmt(JUL_OFF)} off-peak.`],
      callout: { k: 'know', t: 'The shape is an assumption. A customer who runs more at night moves volume from on-peak to off-peak.' },
      focus: ['sales', 'db', 'rep'], flows: ['f-s', 'f-r'],
    },
    {
      short: 'Reading it', tag: 'NUMBERS', title: 'A position by month',
      body: [`In this illustration July has ${fmt(BOOK[0].sold)} MWh sold and ${fmt(BOOK[0].bought)} bought, leaving ${fmt(BOOK[0].open)} MWh open, or ${BOOK[0].pct}% hedged. August is ${BOOK[1].pct}% hedged, September ${BOOK[2].pct}% and October ${BOOK[3].pct}%.`,
        'Months nearer delivery are usually more fully hedged. Months further out are open, and that is intended, since hedges are built in layers.'],
      callout: { k: 'warn', t: 'Compare each month with the desk’s target hedge level, not with a fixed number.' },
      focus: ['rep', 'db'], flows: ['f-r'], stats: { open: `${fmt(BOOK[0].open)} MWh`, pct: `${BOOK[0].pct}%` },
    },
    {
      short: 'Hedges', tag: 'NUMBERS', title: 'Subtract the hedges to see what is open',
      body: [`Take ten such deals, so July has ${fmt(SOLD[0])} MWh on-peak and ${fmt(SOLD[1])} off-peak sold. A 15 MW on-peak block covers 15 × ${JH.onPeak} = ${fmt(BOUGHT[0])} MWh, leaving ${fmt(NET[0].open)} open, or ${NET[0].pct}% hedged. An 8 MW off-peak block covers 8 × ${OFFH} = ${fmt(BOUGHT[1])} MWh, leaving ${fmt(NET[1].open)} open, or ${NET[1].pct}%.`,
        'A block hedge is a fixed MW for set hours. Load-following hedges move with usage but cost more. Blocks leave shape risk, because load does not follow a flat block, and volume risk, because usage can differ from the forecast. Long tenors are often under-hedged because volumes are least certain.'],
      callout: { k: 'warn', t: 'Open volume and percent hedged tell you different things. Check both for each block.' },
      focus: ['rep', 'trades', 'sales'], flows: ['f-t', 'f-r'],
    },
    {
      short: 'Validate', tag: 'METHOD', title: 'Get every deal in once, correctly',
      body: ['New customer deals and new trades flow into the system all day. Check each for duplicates, missing entries, correct start and end dates, the right hub or zone, and the right units.',
        'A single deal entered as MWh instead of MW, or in the wrong month, can shift the position by thousands of MWh.'],
      callout: { k: 'key', t: 'Accuracy of deal flow is the job. A tidy report built on wrong inputs is worse than no report.' },
      focus: ['sales', 'trades', 'db'], flows: ['f-s', 'f-t'], stats: { chk: '4 per deal' },
    },
    {
      short: 'Reconcile', tag: 'METHOD', title: 'Compare, then explain the differences',
      body: ['Compare the deal system with the report, the report with ISO data, and invoices with deals. Where numbers differ, find out why: a late deal, a rounding rule, a mismatched date, a billing correction.',
        'Settlement can be revised for weeks after the fact, so true-ups are normal. Write down every difference and its cause.'],
      callout: { k: 'know', t: 'A clean reconciliation is evidence that the position the desk trades on is the real one.' },
      focus: ['db', 'iso', 'rep'], flows: ['f-i', 'f-r'],
    },
    {
      short: 'P&L', tag: 'NUMBERS', title: 'From position to profit and loss',
      body: [`Value the open volume at today’s curve. If July’s ${fmt(BOOK[0].open)} MWh short is open and the curve rises $${MOVE}, the book loses ${fmt(BOOK[0].open)} × $${MOVE} = $${fmt(MTM)}. If the curve falls $${MOVE}, it gains the same.`,
        'That daily change is mark-to-market. It tells the desk whether to hedge more, wait, or review a limit.'],
      callout: { k: 'key', t: 'Open volume times price move is the simplest risk number. Everything else refines it.' },
      focus: ['rep', 'desk'], flows: ['f-d'], stats: { mtm: `±$${fmt(MTM)}` },
    },
  ],
};
