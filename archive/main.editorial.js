import { makeScene, spriteHTML, ic } from './iso.js';
import solar from './lessons/solar.js';
import wind from './lessons/wind.js';
import gas from './lessons/gas.js';
import hydro from './lessons/hydro.js';
import pumped from './lessons/pumped.js';
import nuclear from './lessons/nuclear.js';
import balance from './lessons/balance.js';
import frequency from './lessons/frequency.js';
import transmission from './lessons/transmission.js';
import market from './lessons/market.js';

// Add a lesson = import it above and list it here, plus a row in META.
const SOURCES = [solar, wind, gas, hydro, pumped, nuclear];
const GRID_LESSONS = [balance, frequency, transmission, market]; // intertwined concepts: they mix several sources in one scene
const LESSONS = [...SOURCES, ...GRID_LESSONS];
const BRAND = 'GRID / EXPLAINED';
const META = {
  solar: { kind: 'Variable', big: '≈ 25%', label: 'typical capacity factor', fuel: 'Sunlight' },
  wind: { kind: 'Variable', big: '≈ 35%', label: 'onshore capacity factor', fuel: 'Moving air' },
  gas: { kind: 'Dispatchable', big: '58%', label: 'combined-cycle efficiency', fuel: 'Natural gas' },
  hydro: { kind: 'Dispatchable', big: '≈ 40%', label: 'typical capacity factor', fuel: 'Falling water' },
  pumped: { kind: 'Storage', big: '≈ 78%', label: 'round-trip efficiency', fuel: 'Water, twice' },
  nuclear: { kind: 'Baseload', big: '> 90%', label: 'capacity factor', fuel: 'Uranium-235' },
  balance: { kind: 'Balance', big: '1 : 1', label: 'supply to demand, every second' },
  frequency: { kind: 'Stability', big: '60 Hz', label: 'the grid’s shared heartbeat' },
  transmission: { kind: 'Delivery', big: '≈ 5%', label: 'of electricity lost on the way' },
  market: { kind: 'Economics', big: '$0–120', label: 'per MWh, within one day' },
};
// Hero map: [lesson id, x, y] in a 1000×800 viewBox; all lines converge on the grid node.
const NODES = [['solar', 440, 200], ['wind', 700, 160], ['gas', 810, 380], ['hydro', 520, 340], ['pumped', 600, 540], ['nuclear', 790, 590]];
const GRID = [650, 410];
const SHORT = { solar: 'Solar', wind: 'Wind', gas: 'Gas', hydro: 'Hydro', pumped: 'Pumped', nuclear: 'Nuclear', balance: 'Balance', frequency: 'Frequency', transmission: 'Wires', market: 'Markets' };
const COMPARE = [
  ['solar', 'Solar PV', 25, 'No', '≈ 48'], ['wind', 'Wind', 35, 'No', '≈ 11'], ['gas', 'Natural gas (CC)', 55, 'Yes', '≈ 490'],
  ['hydro', 'Hydro', 40, 'Yes, with a reservoir', '≈ 24'], ['pumped', 'Pumped storage', 0, 'Yes (it is storage)', '—'], ['nuclear', 'Nuclear', 90, 'Slowly', '≈ 12'],
];
const NEXT = [
  ['Batteries vs pumped storage', 'Power, energy and duration: which storage fits which job, and what each costs.'],
  ['Demand response', 'Making demand flexible: smart thermostats, EV charging and industrial load shifting.'],
  ['Grid-forming inverters', 'How solar, wind and batteries can hold the grid’s frequency without a spinning shaft.'],
  ['Whole-grid sandbox', 'Drag the mix of sources, pick a day, and watch the balance, the price and the carbon change.'],
];

const $ = (s, r = document) => r.querySelector(s);
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const md = (t) => t.replace(/`([^`]+)`/g, '<code>$1</code>');
const pad = (n) => String(n).padStart(2, '0');
const totalSteps = LESSONS.reduce((a, l) => a + l.steps.length, 0), totalMin = LESSONS.reduce((a, l) => a + l.time, 0);

// ---------- hero: a node map of the six sources feeding one grid ----------
function heroSVG() {
  let rings = '';
  for (let i = 0; i < 16; i++) {
    const rx = 90 + i * 62, ry = 60 + i * 44, pts = [];
    for (let a = 0; a < 72; a++) {
      const t = (a / 72) * Math.PI * 2, w = 1 + 0.07 * Math.sin(t * 3 + i) + 0.04 * Math.sin(t * 5 - i * 2);
      pts.push(`${(560 + Math.cos(t) * rx * w).toFixed(1)},${(400 + Math.sin(t) * ry * w).toFixed(1)}`);
    }
    rings += `<polygon points="${pts.join(' ')}" fill="none" stroke="#f4f2e9" stroke-opacity="${0.035 + (i % 4 === 0 ? 0.04 : 0)}"/>`;
  }
  const links = NODES.map(([, x, y]) => `M${x},${y}Q${(x + GRID[0]) / 2 + (y - GRID[1]) * 0.18},${(y + GRID[1]) / 2 - (x - GRID[0]) * 0.18} ${GRID[0]},${GRID[1]}`);
  const nodes = NODES.map(([id, x, y]) => `<g class="node" data-go="${id}" tabindex="0" role="link" aria-label="Open ${id} lesson"><circle class="ring" cx="${x}" cy="${y}" r="13" fill="#e9fc8200" stroke="#f4f2e9" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="3.5" fill="#e9fc82"/><text x="${x + 22}" y="${y - 2}" font-size="17">${SHORT[id].toUpperCase()}</text><text x="${x + 22}" y="${y + 16}" font-size="11" opacity=".7">${META[id].kind.toUpperCase()}</text></g>`).join('');
  return `<svg viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Six power sources connected to one grid">
    <defs><radialGradient id="hg" cx="62%" cy="48%" r="75%"><stop offset="0" stop-color="#2d4a3f"/><stop offset="1" stop-color="#14261f"/></radialGradient></defs>
    <rect width="1000" height="800" fill="url(#hg)"/>${rings}
    ${links.map((d) => `<path class="link" d="${d}"/>`).join('')}${links.map((d) => `<path class="pulse" d="${d}"/>`).join('')}
    ${nodes}
    <g><circle cx="${GRID[0]}" cy="${GRID[1]}" r="26" fill="none" stroke="#e9fc82" stroke-width="1.6"/><circle cx="${GRID[0]}" cy="${GRID[1]}" r="6" fill="#e9fc82"/><text x="${GRID[0] + 36}" y="${GRID[1] + 5}" font-size="19">THE GRID</text></g></svg>`;
}

// ---------- page shell ----------
document.getElementById('app').innerHTML = `${spriteHTML()}
<a class="skip" href="#explore">Skip to the lessons</a>
<header class="top"><a class="brand" href="#">${BRAND}</a><span>Independent energy explainer</span></header>
<div class="header-actions"><button id="menu" aria-expanded="false" aria-controls="navigation">Explore <b>＋</b></button><button id="theme" type="button" aria-label="Toggle dark mode"><span id="ticon" aria-hidden="true">◐</span><span id="tlabel">Dark mode</span></button></div>
<nav id="navigation" hidden></nav>
<main>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-map">${heroSVG()}</div>
    <div class="map-label mono">6 SOURCES / 1 GRID<br>INTERACTIVE EXPLAINER</div>
    <div class="hero-copy"><p class="eyebrow">Electricity / a visual guide</p><h1 id="hero-title">Six ways to make power.<br>One grid to carry it.</h1><button class="button" data-scroll="sources">Explore the sources <span>↗</span></button></div>
    <div class="hero-note">Each idea is a diagram you step through.<br>Figures are typical, not forecasts.</div>
    <p class="hero-credit mono">Diagrams drawn in code · no photographs</p>
  </section>
  <div class="intro-strip"><span><b>${SOURCES.length}</b> energy sources</span><span><b>${GRID_LESSONS.length}</b> grid concepts</span><span><b>${totalSteps}</b> animated steps</span><span><b>${totalMin} min</b> to read them all</span><button class="button" data-go="solar">Start with solar <span>↗</span></button></div>

  <section id="sources" class="section"><p class="eyebrow">01 / The sources</p>
    <div class="section-heading"><h2>Six machines.<br>One job.</h2><p>Each source turns sunlight, air, fuel, water or atoms into a spinning shaft or a flow of electrons. Pick one and watch it work.</p></div>
    <div class="sources">${LESSONS.map((l, i) => `<button class="src" data-go="${l.id}"><span class="mono">${pad(i + 1)} / ${META[l.id].kind}</span><h3>${l.title}</h3><strong>${META[l.id].big}</strong><small>${META[l.id].label}</small><span class="go" aria-hidden="true">↗</span></button>`).join('')}</div>
  </section>

  <section id="explore" class="section lab"><p class="eyebrow">02 / The lessons</p>
    <div class="section-heading lab-head"><h2 id="lt"></h2><p id="lp"></p></div>
    <div class="tabs" id="tabs" role="tablist"></div>
    <div class="module" id="module"></div>
  </section>

  <section id="connect" class="section"><p class="eyebrow">03 / How they connect</p>
    <div class="section-heading"><h2>Sources are<br>only half of it.</h2><p>These lessons put several sources in one picture: balancing a day, holding the frequency, moving power over distance, and deciding who runs.</p></div>
    <div class="sources two">${GRID_LESSONS.map((l, i) => `<button class="src" data-go="${l.id}"><span class="mono">${pad(SOURCES.length + i + 1)} / ${META[l.id].kind}</span><h3>${l.title}</h3><strong>${META[l.id].big}</strong><small>${META[l.id].label}</small><span class="go" aria-hidden="true">↗</span></button>`).join('')}</div>
  </section>

  <section id="compare" class="section dark"><p class="eyebrow">04 / Side by side</p>
    <div class="section-heading"><h2>Same grid.<br>Different trade-offs.</h2><p>No source wins everywhere. The differences below decide what each one is good for.</p></div>
    <div class="table-scroll"><table><thead><tr><th>Source</th><th style="text-align:left">Typical capacity factor</th><th>Output on demand</th><th>Lifecycle CO₂ (g/kWh)</th></tr></thead><tbody>
      ${COMPARE.map(([id, name, cf, disp, co2]) => `<tr><td><button data-go="${id}" style="all:unset;cursor:pointer;border-bottom:1px solid #ffffff55">${name}</button></td><td class="cf">${cf ? `<i style="width:${cf * 1.4}px"></i>${cf >= 90 ? '> 90' : '≈ ' + cf}%` : 'n/a: it stores'}</td><td>${disp}</td><td>${co2}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="fine">Capacity factors are typical annual averages and vary by site and year. Lifecycle emissions are IPCC AR5 median values in grams of CO₂-equivalent per kWh; pumped storage depends on the electricity used to refill it.</p>
  </section>

  <section id="next" class="section"><p class="eyebrow">05 / Coming next</p>
    <div class="section-heading"><h2>What we<br>build next.</h2><p>More concepts that tie the sources together. Tell me which one you want first.</p></div>
    <div class="next-list">${NEXT.map(([t, d], i) => `<div><span>${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </section>
</main>
<footer><p>${BRAND} is an independent educational project. Diagrams are simplified; numbers are typical values for illustration and are not engineering or investment advice.</p><button class="button" data-scroll="explore">Back to the lessons <span>↑</span></button></footer>`;

let L, step = 0, vars = [], paused = false;
const done = new Set(store.get('grid-done', []));

// ---------- theme + menu ----------
const root = document.documentElement;
const setTheme = (t) => { root.dataset.theme = t; store.set('grid-theme', t); $('#tlabel').textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; $('#ticon').textContent = t === 'dark' ? '○' : '◐'; };
setTheme(root.dataset.theme || 'light');
$('#theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
const nav = $('#navigation'), menu = $('#menu');
function drawNav() {
  nav.innerHTML = [['sources', '01 / The sources'], ['explore', '02 / The lessons']].map(([id, t]) => `<button data-scroll="${id}">${t}</button>`).join('')
    + LESSONS.map((l) => `<button class="sub ${L && L.id === l.id ? 'cur' : ''}" data-go="${l.id}">${l.title}</button>`).join('')
    + [['connect', '03 / How they connect'], ['compare', '04 / Side by side'], ['next', '05 / Coming next']].map(([id, t]) => `<button data-scroll="${id}">${t}</button>`).join('');
}
const toggleNav = (v) => { nav.hidden = !v; menu.setAttribute('aria-expanded', v); $('b', menu).textContent = v ? '×' : '＋'; };
menu.onclick = () => toggleNav(nav.hidden);
const scrollTo = (id) => $('#' + id).scrollIntoView({ behavior: 'smooth' });
function goLesson(id) { location.hash = `#/${id}/1`; scrollTo('explore'); }
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'), s = e.target.closest('[data-scroll]');
  if (g) { goLesson(g.dataset.go); toggleNav(false); } else if (s) { scrollTo(s.dataset.scroll); toggleNav(false); }
  else if (!e.target.closest('#navigation, #menu')) toggleNav(false);
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.node')) { e.preventDefault(); goLesson(e.target.dataset.go); } });

// ---------- lesson module ----------
function mount(l) {
  L = l; const idx = LESSONS.indexOf(l);
  const s = makeScene(); l.build(s);
  $('#lt').textContent = l.title; $('#lp').textContent = l.tagline;
  $('#tabs').innerHTML = LESSONS.map((x, i) => `${i === SOURCES.length ? '<span class="tabsep"></span>' : ''}<button class="tab ${x === l ? 'cur' : ''} ${done.has(x.id) ? 'done' : ''}" role="tab" aria-selected="${x === l}" data-go="${x.id}">${pad(i + 1)} ${SHORT[x.id]}</button>`).join('');
  $('#module').innerHTML = `
  <div class="stage-col">
    <p class="lesson-meta"><span>Lesson ${idx + 1} / ${LESSONS.length}</span><span>${l.time} min</span><span>${l.level}</span><span>${l.steps.length} steps</span></p>
    <div class="stats">${l.stats.map((x) => `<div class="stat" data-stat="${x.id}"><small>${x.label}</small><b>—</b></div>`).join('')}</div>
    <div class="stage">
      <svg class="scene" id="scene" viewBox="${s.vb.join(' ')}" role="img" aria-label="${l.title} diagram">${s.render()}</svg>
      <div class="stagefoot"><div class="legend">${l.legend.map((x) => `<span><i style="background:${x[0]}"></i>${x[1]}</span>`).join('')}</div>
        <div class="ctrls"><button id="replay" aria-label="Replay step">${ic('replay')}</button><button id="pause" aria-label="Pause animation">${ic('pause')}</button></div></div>
    </div>
    <div class="stepper"><div class="stepper-head"><span>In this lesson</span><span id="sc"></span></div><div class="dots" id="dots">${l.steps.map((st, i) => `<button class="dot" data-i="${i}" aria-label="Step ${i + 1}: ${st.short}"><i>${pad(i + 1)}</i><span>${st.short}</span></button>`).join('')}</div></div>
  </div>
  <aside class="panel">
    <div class="step-top"><span id="stn"></span><span class="tag" id="tag"></span></div><h3 id="tt"></h3><div class="step-body" id="bd"></div>
    <div class="navrow"><button class="button ghost back" id="bk">← Back</button><button class="button next" id="nx"></button></div>
    <div class="hint"><span><kbd>←</kbd><kbd>→</kbd> step</span><span><kbd>R</kbd> replay</span><span><kbd>Space</kbd> pause</span></div>
    <div class="learn"><h4>You’ll learn</h4><ul id="learn">${l.learn.map((x) => `<li><i></i>${x.t}</li>`).join('')}</ul></div>
  </aside>`;
  document.title = `${l.title} — ${BRAND}`;
  $('#bk').onclick = () => go(step - 1); $('#nx').onclick = next;
  $('#dots').onclick = (e) => { const b = e.target.closest('.dot'); if (b) go(+b.dataset.i); };
  $('#replay').onclick = replay; $('#pause').onclick = togglePause;
  drawNav();
}

function apply() {
  const st = L.steps[step], svg = $('#scene');
  svg.dataset.state = st.state || '';
  vars.forEach((k) => svg.style.removeProperty(k)); vars = [];
  for (const [k, v] of Object.entries(st.vars || {})) { svg.style.setProperty(k, v); vars.push(k); }
  svg.querySelectorAll('.el').forEach((el) => {
    const id = el.dataset.id, hidden = step < +el.dataset.from || step > +el.dataset.until;
    el.classList.toggle('hide', hidden);
    if (el.classList.contains('flowel')) el.classList.toggle('on', !hidden && (st.flows || []).includes(id));
    else if (id.endsWith(':l')) el.classList.toggle('dim', !(st.focus ? st.focus.includes(id.slice(0, -2)) : +el.dataset.from === step)); // labels: only for what this step talks about
    else el.classList.toggle('dim', !hidden && !!st.focus && !el.dataset.always && !st.focus.includes(id));
  });
  // stats accumulate: each shows the latest value set at or before this step
  L.stats.forEach((x) => {
    let v = null; for (let j = 0; j <= step; j++) if (L.steps[j].stats?.[x.id] != null) v = L.steps[j].stats[x.id];
    const el = $(`[data-stat=${x.id}]`), b = $('b', el);
    el.classList.toggle('set', v != null);
    if (b.textContent !== (v ?? '—')) { b.textContent = v ?? '—'; el.classList.remove('pulse'); void el.offsetWidth; if (v != null) el.classList.add('pulse'); }
  });
  $('#stn').textContent = `STEP ${pad(step + 1)} / ${pad(L.steps.length)}`;
  $('#tag').textContent = st.tag; $('#tag').className = `tag ${st.tag}`;
  $('#tt').textContent = st.title;
  const c = st.callout;
  $('#bd').innerHTML = st.body.map((p) => `<p>${md(p)}</p>`).join('') + (c ? `<div class="callout ${c.k}"><small>${{ key: 'Key idea', know: 'Good to know', warn: 'Watch out' }[c.k]}</small>${md(c.t)}</div>` : '');
  $('#bd').scrollTop = 0;
  const last = step === L.steps.length - 1, nxt = LESSONS[LESSONS.indexOf(L) + 1];
  $('#bk').disabled = step === 0;
  $('#nx').disabled = last && !nxt;
  $('#nx').innerHTML = last ? (nxt ? `Next lesson: ${SHORT[nxt.id]} <span>→</span>` : 'You made it <span>✓</span>') : `Next: ${L.steps[step + 1].short} <span>→</span>`;
  $('#sc').textContent = `${pad(step + 1)} of ${pad(L.steps.length)}`;
  document.querySelectorAll('.dot').forEach((d, i) => { d.classList.toggle('done', i < step); d.classList.toggle('cur', i === step); });
  document.querySelectorAll('#learn li').forEach((li, i) => li.classList.toggle('got', step >= L.learn[i].at));
  declutter();
  if (last && !done.has(L.id)) { done.add(L.id); store.set('grid-done', [...done]); const t = document.querySelector(`.tab[data-go=${L.id}]`); if (t) t.classList.add('done'); }
}
// Push overlapping visible pills apart (the lower one moves down) so labels never stack.
function declutter() {
  const pills = [...$('#scene').querySelectorAll('.el[data-id$=":l"]:not(.hide):not(.dim) .pill')].map((p) => {
    if (!p.dataset.t) p.dataset.t = p.getAttribute('transform').match(/-?[\d.]+/g).join(',');
    const [x, y] = p.dataset.t.split(',').map(Number);
    return { p, x, y, w: p.getBBox().width, ny: y };
  }).sort((a, b) => a.y - b.y);
  for (let i = 0; i < pills.length; i++) for (let j = 0; j < i; j++) {
    const A = pills[j], B = pills[i];
    if (Math.abs(A.x - B.x) < (A.w + B.w) / 2 + 2 && Math.abs(A.ny - B.ny) < 27) B.ny = A.ny + 27;
  }
  pills.forEach((l) => l.p.setAttribute('transform', `translate(${l.x},${l.ny})`));
}
function go(i) { i = Math.max(0, Math.min(L.steps.length - 1, i)); location.hash = `#/${L.id}/${i + 1}`; }
function next() { if (step < L.steps.length - 1) go(step + 1); else { const n = LESSONS[LESSONS.indexOf(L) + 1]; if (n) goLesson(n.id); } }
function replay() {
  const svg = $('#scene');
  svg.querySelectorAll('.el').forEach((el) => { if (+el.dataset.from === step || el.classList.contains('on')) { el.classList.add('hide'); el.classList.remove('on'); } });
  void svg.getBoundingClientRect(); requestAnimationFrame(apply);
}
function togglePause() { paused = !paused; $('#scene').classList.toggle('paused', paused); $('#pause').innerHTML = ic(paused ? 'play' : 'pause'); }

function route(first) {
  const m = location.hash.match(/^#\/([a-z]+)\/(\d+)/);
  if (!m && !first) return; // plain anchors (#sources …) are not lesson routes
  const l = (m && LESSONS.find((x) => x.id === m[1])) || L || LESSONS[0];
  if (l !== L) { mount(l); paused = false; }
  step = Math.max(0, Math.min(l.steps.length - 1, m ? parseInt(m[2], 10) - 1 : 0));
  apply();
}
window.addEventListener('hashchange', () => route(false));
const inView = () => { const r = $('#explore').getBoundingClientRect(); return r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return toggleNav(false);
  if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || !inView()) return;
  if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') go(step - 1);
  else if (e.key.toLowerCase() === 'r') replay(); else if (e.key === ' ' && !e.target.closest('button, a, .node')) { e.preventDefault(); togglePause(); }
});
new IntersectionObserver(([e]) => document.body.classList.toggle('in-lab', e.isIntersecting), { threshold: 0.08 }).observe($('#explore'));
route(true);
if (/^#\/[a-z]+\/\d+/.test(location.hash)) requestAnimationFrame(() => $('#explore').scrollIntoView());
