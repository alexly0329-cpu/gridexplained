import { list, table, bars } from './cards.js';

// Trader track. General knowledge of US power regulation, not from the course notes. Rules vary by state and change; the renewable-credit example uses a made-up 10% rule.
const SALES = 120000, RPS = 0.10, REC = 6;
const RECS = SALES * RPS, RECCOST = RECS * REC, PERMWH = +(RECCOST / SALES).toFixed(2);
const fmt = (n) => n.toLocaleString('en-US');

export default {
  id: 'regulation', group: 'trader', track: 'trader', title: 'Regulation & Contracts', icon: 'lock', time: 10, level: 'Intermediate',
  tagline: 'Who regulates wholesale and retail power, how renewable credits and master agreements work, and the conduct rules traders live by.',
  stats: [
    { id: 'rec', label: 'Credits needed', icon: 'check' }, { id: 'cost', label: 'Credit cost', icon: 'chart' },
    { id: 'per', label: 'Per MWh sold', icon: 'zap' }, { id: 'docs', label: 'Contract layers', icon: 'layers' },
  ],
  legend: [['#7c63d0', 'rules'], ['#6f9a3c', 'money']],
  learn: [
    { t: 'Which body regulates which part of the market', at: 0 }, { t: 'How retail choice works and what it requires', at: 1 },
    { t: 'How renewable credits become a cost per MWh', at: 2 }, { t: 'What a master agreement and a confirmation are', at: 3 },
    { t: 'What counts as market manipulation', at: 4 }, { t: 'Habits that keep a trader compliant', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('ferc', 0.6, 0.8, 0, 1.8, 1.5, 1.4, 'navy', { label: { t: 'federal rules', icon: 'lock' } });
    s.box('state', 4.0, 0.8, 0, 1.6, 1.4, 1.0, 'steel', { label: { t: 'state commission', icon: 'shield' } });
    s.box('iso', 7.2, 3.0, 0, 1.4, 1.2, 0.9, 'white', { label: { t: 'ISO market rules', icon: 'gauge' } });
    s.box('sup', 3.8, 5.8, 0, 1.8, 1.5, 1.0, 'green', { label: { t: 'supplier', icon: 'factory' } });
    s.box('cp', 0.6, 6.0, 0, 1.4, 1.2, 0.9, 'blue', { from: 3, label: { t: 'trading partner', icon: 'chart' } });
    s.flow('f-fed', [[1.6, 2.4, 0.05], [3.8, 6.0, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-st', [[4.8, 2.3, 0.05], [4.6, 5.8, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-iso', [[7.4, 4.2, 0.05], [5.6, 6.4, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-ma', [[3.8, 6.8, 0.05], [2.0, 6.6, 0.05]], 'cash', { from: 3, cls: 'slow' });
    s.card('who', 'WHO REGULATES WHAT', table(['Body', 'Covers'], [['FERC', 'wholesale power, interstate lines'], ['State commission', 'retail sales, customers'], ['NERC', 'grid reliability standards'], ['CFTC', 'futures and swaps']], { cols: [12, 108], rowH: 26 }), { w: 300, h: 160, from: 0, until: 0 });
    s.card('choice', 'RETAIL CHOICE', list([['Customers may pick a supplier', 'or stay on utility default'], ['Suppliers are certified', 'and file with the state'], ['Contract rules differ', 'homes are protected more than firms']], { gap: 36 }), { w: 300, h: 150, from: 1, until: 1 });
    s.card('rec', 'A RENEWABLE-CREDIT EXAMPLE', bars([{ label: 'Sales (MWh)', value: SALES, t: fmt(SALES), color: '#cfc0e8' }, { label: 'Credits owed', value: RECS, t: fmt(RECS), color: '#a6d38b' }, { label: `Cost at $${REC}`, value: RECCOST, t: `$${fmt(RECCOST)}`, color: '#f6d77e', sc: 1 }], { w: 300, labelW: 92, max: SALES, fmt: (v, r) => r.t, y0: 40, h: 20, gap: 14, note: `a made-up ${RPS * 100}% rule: $${PERMWH} per MWh sold` }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('ma', 'LAYERS OF A TRADE', list([['Master agreement', 'standard terms, signed once'], ['Confirmation', 'the price, volume and dates of one deal'], ['Credit annex', 'limits and collateral rules'], ['Netting', 'one balance across all deals']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('conduct', 'WHAT IS OFF LIMITS', list([['False or misleading statements', 'in trades or reports'], ['Fake trades and wash trades', 'to move a price or show volume'], ['Using non-public information', 'about plants, lines or customers'], ['Hiding a trade', 'records must be kept and complete']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('habit', 'COMPLIANCE HABITS', list([['Write it down', 'every deal has a record'], ['Stay inside limits', 'size, tenor, counterparty'], ['Say what you do not know', 'and ask before acting'], ['Keep the trail', 'emails and chats are records']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Who', tag: 'CONCEPT', title: 'Different rulers for different layers',
      body: ['In the US, the Federal Energy Regulatory Commission oversees wholesale power and interstate transmission, including ISO rules. State commissions, such as the Public Utilities Commission of Ohio, oversee retail sales and customer protection. NERC sets reliability standards and the CFTC covers futures and swaps.',
        'A supplier answers to several of them at once.'],
      callout: { k: 'key', t: 'When a rule matters, first ask which layer it belongs to: wholesale, retail, reliability or financial.' },
      focus: ['ferc', 'state', 'iso', 'sup'], flows: ['f-fed', 'f-st', 'f-iso'],
    },
    {
      short: 'Retail choice', tag: 'CONCEPT', title: 'Why suppliers exist',
      body: ['Some states opened retail sales to competition. Customers there can choose a supplier, or stay with the utility’s default service. Suppliers must be certified, file with the state and follow its rules on contracts, notices and billing.',
        'Rules for homes are stricter than for large businesses, which can negotiate their own terms.'],
      callout: { k: 'know', t: 'The same energy product can sit under different consumer rules in different states. Check before pricing.' },
      focus: ['state', 'sup'], flows: ['f-st'],
    },
    {
      short: 'Credits', tag: 'NUMBERS', title: 'Renewable credits as a cost',
      body: [`Some states require suppliers to deliver a share of renewable power, proven with renewable energy credits, one per MWh of renewable generation. Take a made-up 10% rule: on ${fmt(SALES)} MWh of sales a supplier needs ${fmt(RECS)} credits.`,
        `At $${REC} each that is $${fmt(RECCOST)}, or $${PERMWH} per MWh sold. Credit prices move like any commodity, so the cost must be forecast and often hedged.`],
      callout: { k: 'warn', t: 'Rules and credit prices differ widely by state. Never reuse one state’s numbers for another.' },
      focus: ['state', 'sup'], flows: ['f-st'], stats: { rec: fmt(RECS), cost: `$${fmt(RECCOST)}`, per: `$${PERMWH}` },
    },
    {
      short: 'Agreements', tag: 'CONCEPT', title: 'The paper behind a trade',
      body: ['Two trading partners sign a master agreement once. It sets standard terms for delivery, payment, default, and what happens if a party fails. Each trade then needs only a short confirmation: price, volume, dates and delivery point.',
        'A credit annex adds limits and collateral, and netting lets all deals under the agreement be offset into one balance.'],
      callout: { k: 'know', t: 'Common forms exist for power and gas, so negotiators change a few terms rather than writing from scratch.' },
      focus: ['sup', 'cp'], flows: ['f-ma'], stats: { docs: '3' },
    },
    {
      short: 'Conduct', tag: 'PROBLEM', title: 'What traders must not do',
      body: ['Federal rules forbid fraud and manipulation in wholesale power markets: false statements, sham trades meant to move a price, and trading on illegal inside information. Regulators and ISOs watch for patterns in the data.',
        'Records must be kept and complete. Do not assume that a message is private or temporary.'],
      callout: { k: 'warn', t: 'Intent matters, but so does appearance. If a trade would be hard to explain, ask first.' },
      focus: ['ferc', 'iso', 'sup'], flows: ['f-fed', 'f-iso'],
    },
    {
      short: 'Habits', tag: 'METHOD', title: 'Simple habits that keep you safe',
      body: ['Keep a written record of each deal, stay within size, tenor and counterparty limits, and ask before acting when something is unclear. Treat emails and chats as records that may be read later.',
        'These habits are also the basis for being credible, which the role asks for.'],
      callout: { k: 'key', t: 'This lesson is general background, not legal advice. Follow your firm’s compliance policy.' },
      focus: ['sup', 'state', 'ferc'], flows: ['f-fed', 'f-st'],
    },
  ],
};
