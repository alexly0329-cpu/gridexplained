import { list, table, code } from './cards.js';

// Trader track. A small worked data set, not from the course notes. Every result shown is computed from DEALS and BASIS below.
const DEALS = [
  { id: 1, hub: 'West', m: 'Jul', mwh: 10000, p: 48 }, { id: 2, hub: 'West', m: 'Jul', mwh: 5000, p: 52 },
  { id: 3, hub: 'West', m: 'Aug', mwh: 12000, p: 50 }, { id: 4, hub: 'AD', m: 'Aug', mwh: 4000, p: 44 },
  { id: 5, hub: 'West', m: 'Aug', mwh: 6000, p: 53 }, { id: 6, hub: 'AD', m: 'Jul', mwh: 8000, p: 41 },
];
const BASIS = { West: 1.0, AD: -0.5 };
const fmt = (n) => n.toLocaleString('en-US');
const wavg = (rows) => rows.reduce((a, r) => a + r.mwh * r.p, 0) / rows.reduce((a, r) => a + r.mwh, 0);
const HUBS = ['West', 'AD'].map((h) => { const r = DEALS.filter((d) => d.hub === h); return { h, mwh: r.reduce((a, d) => a + d.mwh, 0), w: wavg(r), simple: r.reduce((a, d) => a + d.p, 0) / r.length }; });
const WEST = DEALS.filter((d) => d.hub === 'West');
const ALL = wavg(DEALS);

export default {
  id: 'sqldrills', group: 'trader', track: 'trader', title: 'Excel & SQL Drills', icon: 'layers', time: 12, level: 'Intermediate',
  tagline: 'Six small drills on a deals table: filter, group, weighted average, join, the Excel equivalents, and checks.',
  stats: [
    { id: 'rows', label: 'Deals', icon: 'layers' }, { id: 'w', label: 'West, weighted avg', icon: 'chart' },
    { id: 'avg', label: 'West, simple avg', icon: 'gauge' }, { id: 'tot', label: 'All deals, weighted', icon: 'zap' },
  ],
  legend: [['#7c63d0', 'data']],
  learn: [
    { t: 'How to read a deals table', at: 0 }, { t: 'How SELECT, WHERE and ORDER BY work, and a text-sort trap', at: 1 },
    { t: 'Why a weighted average beats a simple one', at: 2 }, { t: 'How a JOIN adds a second table', at: 3 },
    { t: 'The Excel formulas that do the same jobs', at: 4 }, { t: 'Checks to run before trusting a total', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.cyl('db', 1.8, 2.2, 0, 0.9, 1.3, 'violet', { k: 12, label: { t: 'database', icon: 'layers' } });
    s.box('sheet', 0.6, 5.4, 0, 2.0, 1.4, 0.7, 'green', { label: { t: 'spreadsheet', icon: 'chart' } });
    s.box('rep', 6.2, 5.4, 0, 1.8, 1.4, 1.0, 'cream', { label: { t: 'report', icon: 'clock' } });
    s.box('bas', 4.2, 1.2, 0, 1.3, 1.1, 0.8, 'blue', { from: 3, label: { t: 'basis table', icon: 'chart' } });
    s.flow('f-q', [[2.8, 2.6, 0.05], [4.2, 4.4, 0.05], [6.2, 5.6, 0.05]], 'ac', { from: 1 });
    s.flow('f-x', [[2.6, 6.0, 0.05], [6.2, 6.2, 0.05]], 'ac', { from: 4 });
    s.flow('f-j', [[4.9, 2.4, 0.05], [4.9, 3.6, 0.05], [3.0, 2.8, 0.05]], 'ac', { from: 3, until: 3 });
    s.card('tbl', 'THE deals TABLE', table(['id', 'hub', 'month', 'MWh', '$/MWh'], DEALS.map((d) => [`${d.id}`, d.hub, d.m, fmt(d.mwh), `${d.p}`]), { cols: [12, 46, 96, 150, 226], y0: 32, rowH: 20 }), { w: 300, h: 180, from: 0, until: 0 });
    s.card('sel', 'FILTER AND SORT', code([`SELECT id, mwh, price`, `FROM deals`, `WHERE hub = 'West'`, `ORDER BY month;`, ``, `-- returns ${WEST.length} rows: ids ${WEST.map((d) => d.id).join(', ')}`, `-- month sorts as text: Aug before Jul`], { y0: 38, gap: 14 }), { w: 300, h: 146, from: 1, until: 1 });
    s.card('grp', 'GROUP AND WEIGHT', code([`SELECT hub, SUM(mwh) AS mwh,`, `  SUM(mwh*price)/SUM(mwh) AS wavg`, `FROM deals GROUP BY hub;`, ``, ...HUBS.map((r) => `${r.h.padEnd(5)} ${fmt(r.mwh).padStart(7)}  wavg ${r.w.toFixed(2)}  (AVG ${r.simple.toFixed(2)})`)], { y0: 38, gap: 14 }), { w: 300, h: 144, from: 2, until: 2 });
    s.card('join', 'ADD A SECOND TABLE', code([`SELECT d.id, d.price + b.basis AS zone`, `FROM deals d`, `JOIN basis b ON b.hub = d.hub;`, ``, ...DEALS.slice(0, 3).map((d) => `id ${d.id}  ${d.hub.padEnd(4)} ${d.p} + ${BASIS[d.hub].toFixed(1)} = ${(d.p + BASIS[d.hub]).toFixed(1)}`), `-- basis: West +1.0, AD -0.5`], { y0: 38, gap: 13 }), { w: 300, h: 156, from: 3, until: 3 });
    s.card('xl', 'THE SAME JOBS IN EXCEL', code([`weighted avg:`, `=SUMPRODUCT(D2:D7,E2:E7)/SUM(D2:D7)`, `  = ${ALL.toFixed(2)}`, `volume for one hub:`, `=SUMIFS(D2:D7,B2:B7,"West")`, `  = ${fmt(HUBS[0].mwh)}`, `look up a basis:`, `=XLOOKUP(B2,basis[hub],basis[adder])`], { y0: 36, gap: 12 }), { w: 300, h: 150, from: 4, until: 4 });
    s.card('chk', 'CHECKS BEFORE YOU TRUST IT', list([['Duplicates', 'GROUP BY id HAVING COUNT(*) > 1'], ['Blanks', 'WHERE price IS NULL'], ['Totals tie out', 'sum equals the position report'], ['Units and dates', 'MW vs MWh, month ranges']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'The table', tag: 'CONCEPT', title: 'Start with one clean table',
      body: [`Here is a small deals table with ${DEALS.length} rows: an id, a hub, a delivery month, a volume in MWh and a price in $/MWh. Real tables hold thousands of rows, but the questions are the same.`,
        'Always begin by asking what one row means. Here it is one deal for one month at one hub.'],
      callout: { k: 'key', t: 'Know the grain of a table before you total it. Mixing grains is the commonest cause of wrong numbers.' },
      focus: ['db'], flows: [], stats: { rows: `${DEALS.length}` },
    },
    {
      short: 'Filter', tag: 'METHOD', title: 'SELECT, WHERE, ORDER BY',
      body: [`SELECT picks columns, FROM names the table, WHERE keeps matching rows and ORDER BY sorts. Asking for the West hub returns ${WEST.length} rows: ids ${WEST.map((d) => d.id).join(', ')}.`,
        'Beware of sorting a month stored as text: “Aug” sorts before “Jul”, and “Dec” before “Jan”. Store a real date, such as 2026-07-01, to sort correctly.'],
      callout: { k: 'warn', t: 'A sort that looks right on one sample can be wrong on the full data. Check the order on months and dates.' },
      focus: ['db', 'rep'], flows: ['f-q'],
    },
    {
      short: 'Weighted', tag: 'NUMBERS', title: 'Weight by volume, not by row',
      body: [`GROUP BY collapses rows into one per hub. For price, weight by volume: SUM(mwh × price) ÷ SUM(mwh). West comes to $${HUBS[0].w.toFixed(2)}, and AD to $${HUBS[1].w.toFixed(2)}.`,
        `A plain AVG(price) treats a 5,000 MWh deal like a 12,000 MWh deal and gives West $${HUBS[0].simple.toFixed(2)}, which is wrong.`],
      callout: { k: 'key', t: 'Any price, rate or hedge level over several rows needs a volume weight.' },
      focus: ['db', 'rep'], flows: ['f-q'], stats: { w: `$${HUBS[0].w.toFixed(2)}`, avg: `$${HUBS[0].simple.toFixed(2)}` },
    },
    {
      short: 'Join', tag: 'METHOD', title: 'Bring in a second table',
      body: ['A JOIN matches rows from two tables on a shared column. Here each deal is joined to a basis table by hub, so a hub price can be turned into a zone price: price plus basis.',
        'A join can duplicate or drop rows if the key is not unique or has gaps, so compare row counts before and after.'],
      callout: { k: 'know', t: 'If the joined result has more rows than the deals table, the basis table has a duplicate hub.' },
      focus: ['db', 'bas'], flows: ['f-j'],
    },
    {
      short: 'Excel', tag: 'METHOD', title: 'The same jobs in a spreadsheet',
      body: [`SUMPRODUCT multiplies two columns and adds the results, so dividing by SUM gives the weighted average for all deals: $${ALL.toFixed(2)}. SUMIFS totals one hub’s volume: ${fmt(HUBS[0].mwh)} MWh for West. XLOOKUP fetches the basis for each deal.`,
        'A pivot table does the grouping with a drag and drop, and it recalculates when the data change.'],
      callout: { k: 'know', t: 'Use SQL for large or repeated pulls and Excel for fast checks and presentation. Know both.' },
      focus: ['sheet', 'rep'], flows: ['f-x'], stats: { tot: `$${ALL.toFixed(2)}` },
    },
    {
      short: 'Checks', tag: 'METHOD', title: 'Check before you report',
      body: ['Look for duplicates with GROUP BY and HAVING COUNT(*) > 1, blanks with IS NULL, and impossible values such as a negative volume or a price of zero.',
        'Then tie the total back to another source, such as the position report. If the two disagree, the difference is the first thing to explain.'],
      callout: { k: 'key', t: 'A number you cannot reconcile is a risk, not a result.' },
      focus: ['db', 'sheet', 'rep'], flows: ['f-q', 'f-x'],
    },
  ],
};
