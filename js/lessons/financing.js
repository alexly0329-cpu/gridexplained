import { panel } from './solar.js';
import { house, pylon } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Projects" notes (financing by scale, structuring models, residential/C&I/utility-scale finance, PPAs, bankability).
const STRIKE = 40, PRICE = [32, 28, 30, 35, 41, 48, 55, 52, 44, 38, 33, 31];
const MX = (i) => 28 + i * 21, MY = (p) => 150 - (p - 20) * 1.9;
const vppa = `<path class="ax" d="M24,150H284M24,150V40"/>
  ${PRICE.map((p, i) => `<rect x="${MX(i)}" y="${Math.min(MY(p), MY(STRIKE))}" width="17" height="${Math.abs(MY(p) - MY(STRIKE)).toFixed(1)}" fill="${p > STRIKE ? '#f1b3a3' : '#a6d38b'}" stroke="var(--obj-edge)" stroke-width="1"/>`).join('')}
  <path d="M24,${MY(STRIKE)}H284" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="5 3"/><text x="${MX(0)}" y="${MY(STRIKE) - 4}" style="font-size:8.5px;font-weight:700;fill:var(--ink)">strike $${STRIKE}</text>
  <polyline points="${PRICE.map((p, i) => `${MX(i) + 8.5},${MY(p).toFixed(1)}`).join(' ')}" fill="none" stroke="#2f86ce" stroke-width="2.4" stroke-linejoin="round"/>
  <text x="24" y="164">Jan</text><text x="${MX(5.5)}" y="164">Jun</text><text x="${MX(11) - 4}" y="164">Dec</text>
  <text x="12" y="180" style="font-size:8.5px"><tspan fill="#2f86ce" font-weight="700">━</tspan> wholesale price   <tspan fill="#d0683a" font-weight="700">■</tspan> generator pays buyer   <tspan fill="#6f9a3c" font-weight="700">■</tspan> buyer pays</text>`;

const flip = (y, label, tax, spons) => `<text x="12" y="${y}" style="font-size:9px;font-weight:700;fill:var(--ink)">${label}</text><rect x="12" y="${y + 6}" width="${tax * 2.6}" height="20" fill="#f6d77e" stroke="var(--obj-edge)" stroke-width="1.6"/><rect x="${12 + tax * 2.6}" y="${y + 6}" width="${spons * 2.6}" height="20" fill="#cfc0e8" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${16}" y="${y + 20}" style="font-size:9px;font-weight:700;fill:#172720">${tax >= 12 ? `tax investor ${tax}%` : ''}</text><text x="${16 + tax * 2.6}" y="${y + 20}" style="font-size:9px;font-weight:700;fill:#172720">${spons >= 12 ? `sponsor ${spons}%` : ''}</text>`;
const flipCard = flip(42, 'Years 1–6: tax benefits go to…', 95, 5) + flip(92, 'After the flip (year 7 on)', 8, 92) + `<text x="12" y="148" style="font-size:8.5px">illustrative split; the contract sets the real shares</text>`;

export default {
  id: 'financing', group: 'projects', title: 'Who Pays for It?', icon: 'battery', time: 11, level: 'Advanced',
  tagline: 'The same solar panel is financed very differently on a house, a factory roof, and a 200 MW field: loans, leases, SPVs and tax equity.',
  stats: [
    { id: 'tier', label: 'Scale', icon: 'layers' }, { id: 'how', label: 'Typical structure', icon: 'cog' },
    { id: 'flip', label: 'Tax flip after', icon: 'clock' }, { id: 'dscr', label: 'Lender test', icon: 'shield' },
  ],
  legend: [['#6f9a3c', 'money'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why scale decides the financing model', at: 0 }, { t: 'Five ways a homeowner can pay', at: 1 },
    { t: 'How a business matches structure to taxes', at: 2 }, { t: 'What an SPV and non-recourse debt are', at: 3 },
    { t: 'How tax equity “flips”', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.raw('field', panel(4.2, 0.8, 1.8, 1.4) + panel(6.2, 0.8, 1.8, 1.4), { k: 5 });
    s.label('field:l', 6.1, 1.5, 1.9, { t: 'solar field', icon: 'sun' }, {});
    s.box('lender', 0.7, 2.4, 0, 1.4, 1.4, 2.0, 'steel', { label: { t: 'lender', icon: 'lock' } });
    s.box('taxinv', 0.7, 6.4, 0, 1.4, 1.4, 1.4, 'yellow', { label: { t: 'tax investor', icon: 'shield' } });
    s.box('sponsor', 4.8, 7.8, 0, 1.2, 1.2, 1.0, 'green', { label: { t: 'developer equity', icon: 'factory' } });
    s.box('spv', 4.2, 4.4, 0, 1.6, 1.6, 1.1, 'violet', { k: 14, label: { t: 'project company (SPV)', icon: 'layers' } });
    s.box('utility', 8.2, 4.4, 0, 1.4, 1.4, 1.2, 'concrete', { label: { t: 'utility off-taker', icon: 'tower' } });
    house(s, 'home', 6.6, 8.0, { label: { t: 'home', icon: 'house' } });
    s.box('biz', 8.2, 7.4, 0, 1.4, 1.4, 1.3, 'cream', { label: { t: 'business roof', icon: 'factory' } });
    s.flow('debt', [[2.1, 3.1, 0.05], [4.6, 3.1, 0.05], [4.6, 4.4, 0.05]], 'cash', {});
    s.flow('taxcap', [[2.1, 7.1, 0.05], [4.6, 7.1, 0.05], [4.6, 6.0, 0.05]], 'cash', {});
    s.flow('equity', [[5.4, 7.8, 0.05], [5.4, 6.0, 0.05]], 'cash', {});
    s.flow('ppa', [[8.2, 5.4, 0.05], [5.8, 5.4, 0.05]], 'cash', {});
    s.flow('power', [[5.8, 4.8, 0.05], [8.2, 4.8, 0.05]], 'electric', {});
    s.flow('tofirst', [[4.2, 5.2, 0.05], [2.1, 5.2, 0.05], [2.1, 6.4, 0.05]], 'cash', {});
    s.flow('tolater', [[5.0, 6.0, 0.05], [5.0, 7.5, 0.05], [5.1, 7.8, 0.05]], 'cash', {});
    s.flow('hres', [[6.6, 8.5, 0.05], [5.9, 8.5, 0.05]], 'cash', {});
    s.flow('hbiz', [[8.2, 8.1, 0.05], [7.0, 7.3, 0.05]], 'cash', { from: 2 });
    s.card('tiers', 'THREE SCALES', list([['Residential', '1–50 kW: cash, loans, leases, grants'], ['Commercial & industrial', '50 kW–50 MW: loans, leases, PPAs'], ['Utility scale', '100 MW to GW: SPV, project debt, tax equity']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('resi', 'RELATIVE 20-YEAR SAVINGS', bars([{ label: 'Cash purchase', value: 100, color: '#a6d38b' }, { label: 'Solar loan', value: 86, color: '#cfe3b2' }, { label: 'Third-party PPA', value: 62, color: '#f6d77e' }, { label: 'Third-party lease', value: 50, color: '#f6d77e' }, { label: 'Community solar', value: 40, color: '#f1b3a3' }], { w: 300, labelW: 114, max: 100, fmt: () => '', note: 'more savings, but more cash and upkeep risk on you' }), { w: 300, h: 190, from: 1, until: 1 });
    s.card('ci', 'MATCH THE OFF-TAKER', table(['Segment', 'Often prefers'], [['Factory', 'own it, or PPA'], ['School, hospital', 'PPA or lease'], ['Landlord', 'PPA or lease']], { cols: [12, 130], rowH: 26 }) + `<text x="12" y="124" style="font-size:8.5px">tax-exempt owners can’t use credits: a taxpayer owns it</text>`, { w: 300, h: 140, from: 2, until: 2 });
    s.card('why', 'WHY AN SPV', list([['Ring-fenced liability', 'project trouble stays in the project'], ['Non-recourse debt', 'repaid only from the project’s PPA income'], ['Pooled equity', 'utilities, funds, developers share it']], { gap: 36 }), { w: 300, h: 150, from: 3, until: 3 });
    s.card('flip', 'THE TAX FLIP', flipCard, { w: 300, h: 160, from: 4, until: 4 });
    s.card('vppa', 'A VIRTUAL PPA SETTLES THE GAP', vppa, { w: 300, h: 194, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Three scales', tag: 'CONCEPT', title: 'Size decides the financing',
      body: ['Residential systems (1–50 kW) use consumer tools: cash, loans, leases. Commercial and industrial systems (50 kW–50 MW) use balance sheets, leases and third-party PPAs. Utility-scale plants (hundreds of MW) use special companies, project debt and tax equity.',
        'You cannot use a utility-scale structure on a 10 kW roof: legal fees would exceed the whole build cost.'],
      callout: { k: 'key', t: 'Financing is not one lump sum. A plan has to fund early development, expensive construction, and decades of operation.' },
      focus: ['home', 'biz', 'spv', 'utility'], stats: { tier: '1 kW → GW' },
    },
    {
      short: 'At home', tag: 'METHOD', title: 'Five ways a homeowner can pay',
      body: ['Cash or a solar loan means you own the system and keep every saving and tax benefit. A third-party PPA or lease means a provider owns, insures and maintains it for 15–25 years.',
        'The trade-off is direct: owning gives the most savings over twenty years; third-party ownership needs no up-front cash and no upkeep, but the provider keeps the tax benefits and a margin.'],
      callout: { k: 'know', t: 'A loan must be paid off when the home is sold. A PPA or lease transfers to the buyer or is bought out.' },
      focus: ['home'], flows: ['hres'], stats: { how: 'Cash / loan / PPA / lease' },
    },
    {
      short: 'Business roofs', tag: 'METHOD', title: 'Match structure to the taxpayer',
      body: ['A factory owner with taxable profit can use credits and depreciation directly, so buying makes sense; or it can use a PPA to keep debt off its balance sheet.',
        'Schools, hospitals and non-profits pay no tax, so they cannot use tax credits. A third-party owner claims them and passes savings on. Landlords face “split incentives”: they own the roof, tenants pay the power bill.'],
      callout: { k: 'key', t: 'Whoever can actually use the tax benefit should own the system. Structure is how the benefit gets to the right person.' },
      focus: ['biz'], flows: ['hbiz'], stats: { how: 'Own or PPA / lease' },
    },
    {
      short: 'The SPV', tag: 'METHOD', title: 'A company built for one project',
      body: ['At utility scale, sponsors form a stand-alone limited company, a special purpose company (SPC or SPV), to own the plant. Lenders then provide non-recourse debt: repaid only from the project’s own income, mainly its PPA.',
        'If the project fails, lenders cannot claim the parents’ other assets. That ring-fence is why large projects can be financed without a giant balance sheet.'],
      callout: { k: 'warn', t: 'Without a signed PPA, there is no cash flow for the debt to rest on. Lenders usually want the off-taker contract before they commit.' },
      focus: ['spv', 'lender', 'sponsor', 'taxinv', 'utility', 'field'], flows: ['debt', 'taxcap', 'equity', 'ppa', 'power'], stats: { tier: '100 MW+', how: 'SPV + project debt' },
    },
    {
      short: 'Tax flip', tag: 'METHOD', title: 'Borrowing someone else’s tax bill',
      body: ['A developer often cannot use all the tax credits and depreciation a project earns. A tax-equity investor, a profitable company with a big tax bill, can, so it joins the SPV.',
        'The tax investor gets almost all tax benefits and some cash for the first five to seven years. Then the deal flips: most of the cash and ownership return to the developer.'],
      callout: { k: 'know', t: 'Without tax equity, a developer with no taxable income could waste a large part of the incentive value.' },
      focus: ['spv', 'taxinv', 'sponsor'], flows: ['tofirst', 'tolater'], stats: { flip: '5–7 yrs' },
    },
    {
      short: 'Bankable', tag: 'CONCEPT', title: 'What lenders need to see',
      body: ['A signed PPA makes revenue bankable. A physical PPA delivers real power. A virtual PPA is a contract for differences: the generator sells to the market, and the two sides settle the gap against a fixed strike price.',
        'When the market price is above the strike the generator pays the buyer the difference; below it, the buyer pays. Lenders also test whether cash flow covers debt payments, the debt service coverage ratio (DSCR), with room to spare.'],
      callout: { k: 'key', t: 'A virtual PPA lets a company anywhere back a wind or solar farm in a high-resource region and fix its net price, without any physical delivery.' },
      focus: ['spv', 'utility', 'lender'], flows: ['ppa', 'power', 'debt'], stats: { dscr: 'DSCR > 1' },
    },
  ],
};
