import { list, table, code } from './cards.js';

// Trader track. A small worked data set, not from the course notes. Every result shown is computed from DEALS, HEDGES and CONTRACTS below.
const DEALS = [
  { id: 1, hub: 'West', m: 'Jul', mwh: 10000, p: 48 }, { id: 2, hub: 'West', m: 'Jul', mwh: 5000, p: 52 },
  { id: 3, hub: 'West', m: 'Aug', mwh: 12000, p: 50 }, { id: 4, hub: 'AD', m: 'Aug', mwh: 4000, p: 44 },
  { id: 5, hub: 'West', m: 'Aug', mwh: 6000, p: 53 }, { id: 6, hub: 'AD', m: 'Jul', mwh: 8000, p: 41 },
];
const BASIS = { West: 1.0, AD: -0.5 };
const HEDGES = [['Jul', 3000], ['Aug', 2000], ['Sep', 1500], ['Oct', 1000]];
const RUN = HEDGES.reduce((a, [m, v]) => [...a, [m, v, (a.length ? a[a.length - 1][2] : 0) + v]], []);
// Contracts with planted errors; the checks below find them by rule.
const CONTRACTS = [
  { id: 7, cust: 'A', zone: 'AEP', start: '2027-01', end: '2027-12' }, { id: 8, cust: 'B', zone: 'DAY', start: '2027-03', end: '2026-12' },
  { id: 9, cust: 'C', zone: 'AEP', start: '2027-01', end: '2027-06' }, { id: 10, cust: 'C', zone: 'AEP', start: '2027-05', end: '2027-12' },
  { id: 11, cust: 'D', zone: '', start: '2027-01', end: '2027-12' },
];
const FLAGS = CONTRACTS.map((c) => {
  const f = [];
  if (!c.zone) f.push('no zone');
  if (c.end < c.start) f.push('end<start');
  CONTRACTS.forEach((o) => { if (o.id !== c.id && o.cust === c.cust && o.zone === c.zone && c.start <= o.end && o.start <= c.end) f.push(`overlap ${o.id}`); });
  return f.join(', ');
});
const fmt = (n) => n.toLocaleString('en-US');
const wavg = (rows) => rows.reduce((a, r) => a + r.mwh * r.p, 0) / rows.reduce((a, r) => a + r.mwh, 0);
const HUBS = ['West', 'AD'].map((h) => { const r = DEALS.filter((d) => d.hub === h); return { h, mwh: r.reduce((a, d) => a + d.mwh, 0), w: wavg(r), simple: r.reduce((a, d) => a + d.p, 0) / r.length }; });
const WEST = DEALS.filter((d) => d.hub === 'West');
const BAD = CONTRACTS.filter((c, i) => FLAGS[i]).map((c) => c.id);

export default {
  id: 'sqldrills', group: 'trader', track: 'trader', title: 'SQL Drills', icon: 'layers', time: 13, level: 'Intermediate',
  tagline: 'Drills on a deals table: filter, group, weighted average, join, load into SQLite, running totals, and data-quality checks.',
  stats: [
    { id: 'rows', label: 'Deals', icon: 'layers' }, { id: 'w', label: 'West, weighted avg', icon: 'chart' },
    { id: 'avg', label: 'West, simple avg', icon: 'gauge' }, { id: 'run', label: 'Hedged by Oct', icon: 'zap' },
  ],
  legend: [['#7c63d0', 'data']],
  learn: [
    { t: 'How to read a deals table', at: 0 }, { t: 'How SELECT, WHERE and ORDER BY work, and a text-sort trap', at: 1 },
    { t: 'Why a weighted average beats a simple one', at: 2 }, { t: 'How a JOIN adds a second table', at: 3 },
    { t: 'How to load rows into SQLite from Python', at: 4 }, { t: 'What a window function does for a running total', at: 5 },
    { t: 'Basic checks before trusting a total', at: 6 }, { t: 'Queries that catch bad contract rows', at: 7 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.cyl('db', 1.8, 2.2, 0, 0.9, 1.3, 'violet', { k: 12, label: { t: 'database', icon: 'layers' } });
    s.box('py', 0.6, 5.4, 0, 2.0, 1.4, 0.7, 'green', { from: 4, until: 4, label: { t: 'Python script', icon: 'cog' } });
    s.box('rep', 6.2, 5.4, 0, 1.8, 1.4, 1.0, 'cream', { label: { t: 'report', icon: 'clock' } });
    s.box('bas', 4.2, 1.2, 0, 1.3, 1.1, 0.8, 'blue', { from: 3, until: 3, label: { t: 'basis table', icon: 'chart' } });
    s.flow('f-q', [[2.8, 2.6, 0.05], [4.2, 4.4, 0.05], [6.2, 5.6, 0.05]], 'ac', { from: 1 });
    s.flow('f-j', [[4.9, 2.4, 0.05], [4.9, 3.6, 0.05], [3.0, 2.8, 0.05]], 'ac', { from: 3, until: 3 });
    s.flow('f-load', [[2.6, 6.0, 0.05], [2.6, 3.4, 0.05]], 'ac', { from: 4, until: 4 });
    s.card('tbl', 'THE deals TABLE', table(['id', 'hub', 'month', 'MWh', '$/MWh'], DEALS.map((d) => [`${d.id}`, d.hub, d.m, fmt(d.mwh), `${d.p}`]), { cols: [12, 46, 96, 150, 226], y0: 32, rowH: 20 }), { w: 300, h: 180, from: 0, until: 0 });
    s.card('sel', 'FILTER AND SORT', code([`SELECT id, mwh, price`, `FROM deals`, `WHERE hub = 'West'`, `ORDER BY month;`, ``, `-- returns ${WEST.length} rows: ids ${WEST.map((d) => d.id).join(', ')}`, `-- month sorts as text: Aug before Jul`], { y0: 38, gap: 14 }), { w: 300, h: 146, from: 1, until: 1 });
    s.card('grp', 'GROUP AND WEIGHT', code([`SELECT hub, SUM(mwh) AS mwh,`, `  SUM(mwh*price)/SUM(mwh) AS wavg`, `FROM deals GROUP BY hub;`, ``, ...HUBS.map((r) => `${r.h} ${fmt(r.mwh)} wavg ${r.w.toFixed(2)} (AVG ${r.simple.toFixed(2)})`)], { y0: 38, gap: 14 }), { w: 300, h: 144, from: 2, until: 2 });
    s.card('join', 'ADD A SECOND TABLE', code([`SELECT d.id, d.price + b.basis AS zone`, `FROM deals d`, `JOIN basis b ON b.hub = d.hub;`, ``, ...DEALS.slice(0, 3).map((d) => `id ${d.id} ${d.hub} ${d.p} + ${BASIS[d.hub].toFixed(1)} = ${(d.p + BASIS[d.hub]).toFixed(1)}`), `-- basis: West +1.0, AD -0.5`], { y0: 38, gap: 13 }), { w: 300, h: 156, from: 3, until: 3 });
    s.card('load', 'LOAD THE ROWS (PYTHON)', code([`import sqlite3`, `db = sqlite3.connect(":memory:")`, `db.execute("CREATE TABLE deals (`, `  id, zone, start, end, mwh)")`, `db.executemany("INSERT INTO deals`, `  VALUES (?,?,?,?,?)", rows)`, `db.execute("SELECT COUNT(*)`, `  FROM deals").fetchone()`], { y0: 38, gap: 14 }), { w: 300, h: 156, from: 4, until: 4 });
    s.card('run', 'RUNNING HEDGE TOTAL', code([`SELECT month, mwh,`, `  SUM(mwh) OVER (ORDER BY month)`, `    AS running`, `FROM hedges;`, ``, ...RUN.map(([m, v, r]) => `${m}  ${fmt(v)}  running ${fmt(r)}`)], { y0: 38, gap: 14 }), { w: 300, h: 170, from: 5, until: 5 });
    s.card('chk', 'CHECKS BEFORE YOU TRUST IT', list([['Duplicates', 'GROUP BY id HAVING COUNT(*) > 1'], ['Blanks', 'WHERE price IS NULL'], ['Totals tie out', 'sum equals the position report'], ['Units and dates', 'MW vs MWh, month ranges']], { gap: 33 }), { w: 300, h: 170, from: 6, until: 6 });
    s.card('dq', 'THREE QUALITY QUERIES', code([`-- end before start`, `SELECT id FROM deals WHERE end < start;`, `-- missing zone`, `SELECT id FROM deals WHERE zone IS NULL;`, `-- overlapping terms, same customer`, `SELECT a.id, b.id FROM deals a JOIN deals b`, `  ON a.cust = b.cust AND a.zone = b.zone`, `  AND a.id < b.id`, `  AND a.start <= b.end AND b.start <= a.end;`], { y0: 38, gap: 14 }), { w: 300, h: 176, from: 7, until: 7 });
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
      short: 'Load', tag: 'METHOD', title: 'Load rows into SQLite from Python',
      body: ['SQLite needs no server: it is a file, or memory, that Python can open in one line. Create the table, insert the rows with executemany, then run a quick count to confirm every row arrived.',
        'This is a fast way to practise queries on a copy of the data, away from the live system.'],
      callout: { k: 'know', t: 'Always compare the row count with the source. A silent drop of rows is a deal-flow error.' },
      focus: ['py', 'db'], flows: ['f-load'],
    },
    {
      short: 'Running total', tag: 'NUMBERS', title: 'A window function keeps the rows',
      body: [`A window function adds a calculation across related rows without collapsing them. SUM(mwh) OVER (ORDER BY month) gives a running total: ${RUN.map(([m, , r]) => `${m} ${fmt(r)}`).join(', ')} MWh.`,
        'GROUP BY returns one row per group. A window function returns every row, with the extra column alongside, which suits cumulative hedge totals and moving averages.'],
      callout: { k: 'key', t: 'Order matters. Sort the key column properly, such as a real date, or the total builds in the wrong sequence.' },
      focus: ['db', 'rep'], flows: ['f-q'], stats: { run: `${fmt(RUN[RUN.length - 1][2])} MWh` },
    },
    {
      short: 'Checks', tag: 'METHOD', title: 'Check before you report',
      body: ['Look for duplicates with GROUP BY and HAVING COUNT(*) > 1, blanks with IS NULL, and impossible values such as a negative volume or a price of zero.',
        'Then tie the total back to another source, such as the position report. If the two disagree, the difference is the first thing to explain.'],
      callout: { k: 'key', t: 'A number you cannot reconcile is a risk, not a result.' },
      focus: ['db', 'rep'], flows: ['f-q'],
    },
    {
      short: 'Bad rows', tag: 'METHOD', title: 'Queries that catch bad contracts',
      body: [`Three rules catch most contract errors: an end date before the start date, a missing zone, and overlapping terms for the same customer and zone. In the sample contracts these flag ids ${BAD.join(', ')}: ${CONTRACTS.map((c, i) => FLAGS[i] && `${c.id} (${FLAGS[i]})`).filter(Boolean).join('; ')}.`,
        'The overlap test is a self-join: two terms overlap when each starts before the other ends.'],
      callout: { k: 'know', t: 'Save these queries and run them on every new batch of deals. They are cheap and they find the errors that move a position.' },
      focus: ['db', 'rep'], flows: ['f-q'],
    },
  ],
};
