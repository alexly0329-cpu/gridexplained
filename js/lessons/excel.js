import { list, table, code } from './cards.js';

// Trader track. Practice recipes on small made-up tables, not from the course notes. Every figure shown is computed from SHEET, CURVE and MOVES below.
const SHEET = [
  { id: 1, zone: 'AEP', m: 'Jul', b: 'On', mwh: 5200, p: 48 }, { id: 2, zone: 'AEP', m: 'Jul', b: 'Off', mwh: 4800, p: 38 },
  { id: 3, zone: 'DAY', m: 'Jul', b: 'On', mwh: 3100, p: 50 }, { id: 4, zone: 'DAY', m: 'Jul', b: 'Off', mwh: 2900, p: 39 },
  { id: 5, zone: 'AEP', m: 'Aug', b: 'On', mwh: 5500, p: 52 }, { id: 6, zone: 'AEP', m: 'Aug', b: 'Off', mwh: 5000, p: 40 },
  { id: 7, zone: 'DEOK', m: 'Jul', b: 'On', mwh: 2000, p: 49 }, { id: 8, zone: 'DEOK', m: 'Jul', b: 'Off', mwh: 1700, p: 38 },
];
const CURVE = [['Jul-27', 52.4], ['Aug-27', 51.1], ['Sep-27', 46.3]];
const MOVES = [['Jan-27', 74.4, 62.0], ['Feb-27', 66.4, 63.8], ['Mar-27', 54.0, 52.9], ['Apr-27', 46.1, 45.7]].map(([m, t, y]) => ({ m, t, y, mv: (t - y) / y }));
const fmt = (n) => n.toLocaleString('en-US');
const sumif = (f) => SHEET.filter(f).reduce((a, r) => a + r.mwh, 0);
const AEP_JUL = sumif((r) => r.zone === 'AEP' && r.m === 'Jul');
const WAVG = SHEET.reduce((a, r) => a + r.mwh * r.p, 0) / SHEET.reduce((a, r) => a + r.mwh, 0);
const PIV = ['AEP', 'DAY', 'DEOK'].map((z) => [z, sumif((r) => r.zone === z && r.b === 'On'), sumif((r) => r.zone === z && r.b === 'Off')]);
const FIXED = 62, VOL = 1000, RATE = 0.08 / 12;
let PV = 0; for (let k = 1; k <= 24; k++) PV += ((FIXED - (56 + 0.4 * k)) * VOL) / (1 + RATE) ** k;
const FLAGGED = MOVES.filter((r) => Math.abs(r.mv) > 0.1);

export default {
  id: 'excel', group: 'trader', track: 'trader', title: 'Excel Drills', icon: 'chart', time: 12, level: 'Intermediate',
  tagline: 'Six spreadsheet recipes for a supply desk: lookups, SUMIFS, pivots, weighted averages, NPV, data validation and flags.',
  stats: [
    { id: 'aep', label: 'AEP July MWh', icon: 'zap' }, { id: 'w', label: 'Weighted price', icon: 'chart' },
    { id: 'pv', label: 'PV of gap', icon: 'gauge' }, { id: 'flag', label: 'Curve flags', icon: 'check' },
  ],
  legend: [['#7c63d0', 'data']],
  learn: [
    { t: 'How XLOOKUP and INDEX-MATCH find a curve price', at: 0 }, { t: 'How SUMIFS totals by several conditions', at: 1 },
    { t: 'How a pivot table summarises the position', at: 2 }, { t: 'How SUMPRODUCT and NPV give a weighted price and a deal value', at: 3 },
    { t: 'How data validation stops bad entries', at: 4 }, { t: 'How conditional formatting flags big curve moves', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('sheet', 0.8, 1.0, 0, 2.2, 1.6, 0.7, 'green', { label: { t: 'deals sheet', icon: 'chart' } });
    s.box('curve', 4.0, 1.2, 0, 1.6, 1.3, 0.7, 'blue', { from: 0, until: 0, label: { t: 'curve table', icon: 'chart' } });
    s.box('piv', 0.8, 5.4, 0, 2.0, 1.5, 0.9, 'cream', { from: 2, until: 2, label: { t: 'pivot', icon: 'layers' } });
    s.box('rep', 6.0, 5.4, 0, 1.8, 1.4, 1.0, 'white', { label: { t: 'report', icon: 'clock' } });
    s.flow('f-a', [[3.0, 1.8, 0.05], [4.0, 1.8, 0.05]], 'ac', { from: 0, until: 0 });
    s.flow('f-b', [[2.0, 2.8, 0.05], [2.0, 5.4, 0.05]], 'ac', { from: 2, until: 2 });
    s.flow('f-c', [[3.2, 2.4, 0.05], [6.0, 5.8, 0.05]], 'ac', { from: 1 });
    s.card('look', 'TWO LOOKUPS, SAME ANSWER', code([`=XLOOKUP(B2, curve[month], curve[price])`, `=INDEX(curve[price],`, `   MATCH(B2, curve[month], 0))`, ``, ...CURVE.map(([m, p]) => `${m}   ${p.toFixed(2)}`), ``, `B2 = Jul-27  ->  ${CURVE[0][1].toFixed(2)}`], { y0: 36, gap: 13 }), { w: 300, h: 164, from: 0, until: 0 });
    s.card('sif', 'SUMIFS: ONE ZONE, ONE MONTH', code([`=SUMIFS(D:D, B:B, "AEP", C:C, "Jul")`, ``, `D = MWh   B = zone   C = month`, ``, `AEP Jul on-peak  ${fmt(SHEET[0].mwh)}`, `AEP Jul off-peak ${fmt(SHEET[1].mwh)}`, `result  ${fmt(AEP_JUL)} MWh`], { y0: 36, gap: 14 }), { w: 300, h: 140, from: 1, until: 1 });
    s.card('pvt', 'PIVOT: ZONE BY BLOCK (MWh)', table(['Zone', 'On-peak', 'Off-peak'], PIV.map(([z, on, off]) => [z, fmt(on), fmt(off)]), { cols: [12, 90, 190], rowH: 26 }) + `<text x="12" y="${32 + 22 + 3 * 26 + 10}" style="font-size:8.5px">rows = zone, columns = block, values = sum of MWh</text>`, { w: 300, h: 168, from: 2, until: 2 });
    s.card('npv', 'WEIGHTED PRICE AND NPV', code([`weighted price:`, `=SUMPRODUCT(D2:D9, E2:E9) / SUM(D2:D9)`, `  = $${WAVG.toFixed(2)}`, ``, `24-month fixed vs index (gap in col F):`, `=NPV(0.08/12, F2:F25)`, `  = $${fmt(PV)}`, `fixed $${FIXED}, 1,000 MWh a month`], { y0: 36, gap: 13 }), { w: 300, h: 156, from: 3, until: 3 });
    s.card('val', 'DATA VALIDATION RULES', list([['Zone: a list', 'AEP, DAY, DEOK, ATSI only'], ['MWh: a number', 'zero or more, no text'], ['Month: a date', 'not typed text'], ['Reject, do not warn', 'bad rows never get in']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('cf', 'FLAG MOVES ABOVE 10%', table(['Month', 'Today', 'Yday', 'Move'], MOVES.map((r) => [r.m, r.t.toFixed(1), r.y.toFixed(1), `${(r.mv * 100).toFixed(1)}%${Math.abs(r.mv) > 0.1 ? ' *' : ''}`]), { cols: [12, 88, 144, 200], rowH: 26 }) + `<text x="12" y="${32 + 22 + 4 * 26 + 10}" style="font-size:8.5px">rule: =ABS(D2)>0.10 paints the row  (* flagged)</text>`, { w: 300, h: 186, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Lookups', tag: 'METHOD', title: 'Fetch a curve price for a deal',
      body: [`Each deal needs the curve price for its month. XLOOKUP takes the lookup value, the column to search and the column to return. INDEX-MATCH does the same in two parts: MATCH finds the row, and INDEX returns the price from it. Both return ${CURVE[0][1].toFixed(2)} for Jul-27.`,
        'INDEX-MATCH also works in older Excel versions and when the return column is to the left of the search column.'],
      callout: { k: 'key', t: 'Use an exact match. An approximate match on a month label can return the wrong row without an error.' },
      focus: ['sheet', 'curve'], flows: ['f-a'],
    },
    {
      short: 'SUMIFS', tag: 'METHOD', title: 'Total by several conditions',
      body: [`SUMIFS adds the cells that meet every condition you give. To total MWh for the AEP zone in July, use the MWh column as the sum range and the zone and month columns as criteria. In the sample it adds ${fmt(SHEET[0].mwh)} on-peak and ${fmt(SHEET[1].mwh)} off-peak, for ${fmt(AEP_JUL)} MWh.`,
        'Add a bucket column and a third condition to total on-peak only. Each added condition narrows the result.'],
      callout: { k: 'warn', t: 'Criteria must match exactly, including spaces. A trailing space in “AEP ” silently drops the row.' },
      focus: ['sheet', 'rep'], flows: ['f-c'], stats: { aep: `${fmt(AEP_JUL)} MWh` },
    },
    {
      short: 'Pivot', tag: 'METHOD', title: 'A pivot table for the position',
      body: [`A pivot table sums the sheet without formulas. Put the zone in rows, the block in columns and the sum of MWh as values, and you get each zone’s on-peak and off-peak totals: AEP ${fmt(PIV[0][1])} and ${fmt(PIV[0][2])} MWh in the sample.`,
        'Refresh the pivot after the data change. It does not update by itself in every version.'],
      callout: { k: 'know', t: 'Check the grand total against a plain SUM of the source column. A pivot can miss rows outside its range.' },
      focus: ['sheet', 'piv', 'rep'], flows: ['f-b', 'f-c'],
    },
    {
      short: 'Weighted & NPV', tag: 'NUMBERS', title: 'A weighted price and a deal value',
      body: [`SUMPRODUCT multiplies two columns row by row and adds the results. Divide it by the sum of volumes and you have the volume-weighted price: $${WAVG.toFixed(2)} across the sample.`,
        `NPV discounts a stream of monthly amounts. Put the monthly gap between a $${FIXED} fixed price and an index forecast in a column, then =NPV(rate ÷ 12, range). For 24 months at 8% a year with 1,000 MWh a month, the present value of the gap is $${fmt(PV)}.`],
      callout: { k: 'key', t: 'NPV treats the first cell as one period away. Add a month-zero amount separately if there is one.' },
      focus: ['sheet', 'rep'], flows: ['f-c'], stats: { w: `$${WAVG.toFixed(2)}`, pv: `$${fmt(PV)}` },
    },
    {
      short: 'Validation', tag: 'METHOD', title: 'Stop bad data at the door',
      body: ['Data validation limits what a cell accepts. Set the zone column to a list of valid zones, the MWh column to a number of zero or more, and the month column to a date. Choose reject, not warn, so a typo cannot be saved.',
        'This is cheaper than finding the error later in the position report, and it works hand in hand with the SQL checks.'],
      callout: { k: 'know', t: 'Validation does not fix pasted data. Pasting over a cell removes the rule, so check the source too.' },
      focus: ['sheet', 'rep'], flows: ['f-c'],
    },
    {
      short: 'Flags', tag: 'METHOD', title: 'Highlight the moves that need a reason',
      body: [`Compare today’s curve with yesterday’s, then use conditional formatting with a formula such as =ABS(D2)>0.10 to paint rows whose move is above 10%. In the sample, ${FLAGGED.map((r) => `${r.m} (${(r.mv * 100).toFixed(0)}%)`).join(' and ')} ${FLAGGED.length === 1 ? 'is' : 'are'} flagged.`,
        'A flag does not say the number is wrong. It says someone must be able to explain it before the curve goes out.'],
      callout: { k: 'key', t: 'Test the rule on a day you know has a big move, so you trust it on a day you do not.' },
      focus: ['sheet', 'rep'], flows: ['f-c'], stats: { flag: `${FLAGGED.length} of ${MOVES.length}` },
    },
  ],
};
