import { makeScene, spriteHTML, ic } from './iso.js';
import electricity from './lessons/electricity.js';
import energy from './lessons/energy.js';
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
import feasibility from './lessons/feasibility.js';
import siting from './lessons/siting.js';
import returns from './lessons/returns.js';
import lcoe from './lessons/lcoe.js';
import financing from './lessons/financing.js';
import build from './lessons/build.js';
import metrics from './lessons/metrics.js';
import loadcurves from './lessons/loadcurves.js';
import variable from './lessons/variable.js';
import storage from './lessons/storage.js';
import demand from './lessons/demand.js';
import models from './lessons/models.js';
import history from './lessons/history.js';
import costs from './lessons/costs.js';
import enabling from './lessons/enabling.js';
import der from './lessons/der.js';
import spiral from './lessons/spiral.js';
import zerocost from './lessons/zerocost.js';
import bvp from './lessons/bvp.js';
import inverters from './lessons/inverters.js';
import windeng from './lessons/windeng.js';
import pveng from './lessons/pveng.js';
import storagetech from './lessons/storagetech.js';
import geothermal from './lessons/geothermal.js';
import bioenergy from './lessons/bioenergy.js';
import csp from './lessons/csp.js';
import efficiency from './lessons/efficiency.js';
import access from './lessons/access.js';
import wholesale from './lessons/wholesale.js';
import retailer from './lessons/retailer.js';
import forwards from './lessons/forwards.js';
import position from './lessons/position.js';
import loadweather from './lessons/loadweather.js';
import sqldrills from './lessons/sqldrills.js';
import auctions from './lessons/auctions.js';
import regulation from './lessons/regulation.js';
import fundamentals from './lessons/fundamentals.js';
import sandbox from './lessons/sandbox.js';

// Add a lesson = import it above and list it in SOURCES or GRID_LESSONS.
const FOUNDATION_LESSONS = [electricity, energy]; // from the Renewable Energy Technology Fundamentals notes: electricity and energy basics
const SOURCES = [solar, wind, gas, hydro, pumped, nuclear, geothermal, bioenergy, csp];
const GRID_LESSONS = [balance, frequency, transmission, market, wholesale]; // intertwined concepts: they mix several sources in one scene
const PROJECT_LESSONS = [feasibility, siting, returns, lcoe, financing, build, retailer, forwards, position]; // from the Renewable Energy Projects notes: site to financing to operation
const SYSTEM_LESSONS = [metrics, loadcurves, loadweather, variable, storage, demand, models]; // from the Renewable Power and Electricity Systems notes
const TRANSITION_LESSONS = [history, costs, efficiency, enabling, der, spiral, zerocost, access]; // from the Renewable Energy Futures notes
const TOOL_LESSONS = [windeng, pveng, storagetech, bvp, inverters, sandbox]; // deep dives and an interactive model
const TRADER_LESSONS = [sqldrills, auctions, regulation, fundamentals]; // add-on track for power-trading roles; every lesson carries track: 'trader'
const LESSONS = [...FOUNDATION_LESSONS, ...SOURCES, ...GRID_LESSONS, ...PROJECT_LESSONS, ...SYSTEM_LESSONS, ...TRANSITION_LESSONS, ...TOOL_LESSONS, ...TRADER_LESSONS];
const BRAND = 'GRID / EXPLAINED';
const GROUPS = [['01', 'Foundations', FOUNDATION_LESSONS], ['02', 'Sources', SOURCES], ['03', 'The grid', GRID_LESSONS], ['04', 'Projects & finance', PROJECT_LESSONS], ['05', 'Electricity systems', SYSTEM_LESSONS], ['06', 'The energy transition', TRANSITION_LESSONS], ['07', 'Deep dives & sandbox', TOOL_LESSONS], ['08', 'Trader desk', TRADER_LESSONS]];
const SOON = [];

const $ = (s, r = document) => r.querySelector(s);
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const md = (t) => t.replace(/`([^`]+)`/g, '<code>$1</code>');
const pad = (n) => String(n).padStart(2, '0');

document.getElementById('app').innerHTML = `${spriteHTML()}
<header class="topbar">
  <button class="iconbtn" id="menu" aria-label="Lessons">${ic('menu')}</button>
  <div class="brand"><i></i><span>${BRAND}</span></div>
  <button class="search" id="search">${ic('search')}<span>Search lessons &amp; concepts…</span><kbd>⌘K</kbd></button>
  <button class="iconbtn" id="theme" aria-label="Toggle theme"></button>
</header>
<div class="layout" id="page"></div>
<div class="scrim" id="scrim"></div>
<nav class="drawer" id="drawer" aria-label="Lessons"></nav>
<div class="zoomwrap" id="zoom" role="dialog" aria-label="Chart" aria-hidden="true"><div class="zoombox" id="zb"></div></div>
<div class="modal" id="modal"><input id="q" placeholder="Search lessons…" autocomplete="off" aria-label="Search lessons"/><div id="results"></div></div>`;

let L, step = 0, vars = [], paused = false, playing = false, timer = null, speed = 1;
const done = new Set(store.get('grid-done', []));

// ---------- theme ----------
const root = document.documentElement;
const setTheme = (t) => { root.dataset.theme = t; store.set('grid-theme', t); $('#theme').innerHTML = ic(t === 'dark' ? 'sunmode' : 'moon'); $('meta[name=theme-color]').content = t === 'dark' ? '#0d1915' : '#172c26'; };
setTheme(root.dataset.theme || 'light');
$('#theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

// ---------- drawer & search ----------
const open = (el, v) => { el.classList.toggle('open', v); $('#scrim').classList.toggle('open', v); };
// phones: tap a chart card to read it at a legible size
const zoomEl = () => $('#zoom');
const closeZoom = () => { zoomEl().classList.remove('open'); zoomEl().setAttribute('aria-hidden', 'true'); };
document.addEventListener('click', (e) => {
  const card = e.target.closest('#scene .chartcard');
  if (card && matchMedia('(max-width:1000px)').matches) {
    const g = card.cloneNode(true); g.removeAttribute('transform');
    const bg = g.querySelectorAll('rect.bg')[1], w = +bg.getAttribute('width') + 6, h = +bg.getAttribute('height') + 6;
    $('#zb').innerHTML = `<button class="zoomx" aria-label="Close chart">Close ×</button><svg class="scene" viewBox="-2 -2 ${w} ${h}">${g.outerHTML}</svg>`;
    zoomEl().classList.add('open'); zoomEl().setAttribute('aria-hidden', 'false'); return;
  }
  if (e.target.closest('.zoomx') || e.target === zoomEl()) closeZoom();
  if (!e.target.closest('.speedbox')) closeSpeed();
});
const closeAll = () => { closeZoom(); $('#drawer').classList.remove('open'); $('#modal').classList.remove('open'); $('#scrim').classList.remove('open'); };
$('#scrim').onclick = closeAll;
$('#menu').onclick = () => { drawNav(); open($('#drawer'), true); };
const openSearch = () => { $('#modal').classList.add('open'); $('#scrim').classList.add('open'); $('#q').value = ''; results(''); $('#q').focus(); };
$('#search').onclick = openSearch;
const link = (l, i) => `<button class="lesson-link ${L && l.id === L.id ? 'cur' : ''}" data-go="${l.id}"><span class="n">${done.has(l.id) ? '✓' : pad(i + 1)}</span><span><span class="t">${l.title}</span><small>${l.tagline}</small></span>${l.track === 'trader' ? '<i class="bd">TRADER</i>' : ''}</button>`;
// Drawer: one accordion per lesson group, listed one under another.
const openGroups = new Set();
let navFilter = store.get('grid-filter', 'all'); // all | core | trader
const showIn = (l) => navFilter === 'all' || (navFilter === 'trader') === (l.track === 'trader');
function drawNav() {
  const cur = L && GROUPS.find((g) => g[2].includes(L)); if (cur) openGroups.add(cur[0]); else if (!openGroups.size) openGroups.add(GROUPS[0][0]);
  const inner = GROUPS.map(([n, name, list]) => [n, name, list, list.filter(showIn)]).filter((g) => g[3].length)
    .map(([n, name, list, shown]) => `<details class="acc inner" data-g="${n}" ${openGroups.has(n) ? 'open' : ''}><summary><span class="gn">${n}</span><span class="gt">${name}</span><em>${shown.length}</em></summary>${shown.map((l) => link(l, list.indexOf(l))).join('')}</details>`).join('');
  const seg = `<div class="seg" role="group" aria-label="Filter lessons">${[['all', 'All'], ['core', 'Core'], ['trader', 'Trader']].map(([k, t]) => `<button type="button" data-f="${k}" aria-pressed="${navFilter === k}">${t}</button>`).join('')}</div>`;
  $('#drawer').innerHTML = `<div class="brand"><i></i><span>${BRAND}</span></div>${seg}<div class="accs">${inner}</div>`
    + (SOON.length ? `<h4>Coming soon</h4>${SOON.map((t) => `<div class="lesson-link soon"><span class="n">–</span><span><span class="t">${t}</span></span></div>`).join('')}` : '');
  $('#drawer .seg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; navFilter = b.dataset.f; store.set('grid-filter', navFilter); drawNav(); };
}
document.addEventListener('toggle', (e) => {
  const d = e.target; if (!d.matches?.('#drawer details.acc')) return;
  if (d.open) openGroups.add(d.dataset.g); else openGroups.delete(d.dataset.g);
}, true);
function results(q) {
  const m = LESSONS.filter((l) => (l.title + l.tagline + (l.steps || []).map((s) => s.title + s.body.join(' ')).join(' ')).toLowerCase().includes(q.toLowerCase()));
  $('#results').innerHTML = m.map((l) => link(l, LESSONS.indexOf(l))).join('') || '<p style="color:var(--muted)">No match.</p>';
}
$('#q').oninput = (e) => results(e.target.value);
$('#q').onkeydown = (e) => { if (e.key === 'Enter') { const b = $('#results [data-go]'); if (b) b.click(); } };
document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { location.hash = `#/${b.dataset.go}/1`; closeAll(); } });

// ---------- lesson page ----------
const controls = () => `<div class="ctrls" role="group" aria-label="Playback">
  <div class="speedbox"><button class="cbtn c-spd" type="button" aria-haspopup="menu" aria-expanded="false" title="Playback speed"><span class="c-spl">${speed}×</span><svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="speedmenu c-spm" role="menu" aria-label="Playback speed" hidden>${[0.5, 1, 1.5, 2].map((v) => `<button type="button" role="menuitemradio" data-speed="${v}" aria-checked="${v === speed}"><i>${ic('check')}</i>${v}×</button>`).join('')}</div></div>
  <button class="cbtn c-prev" type="button" aria-label="Previous step" title="Previous step">${ic('back')}</button>
  <button class="cbtn play c-play" type="button" aria-label="Play or pause (Space)" title="Play / pause (Space)"></button>
  <button class="cbtn c-stp" type="button" title="Next step">Step</button>
  <button class="cbtn c-rst" type="button" title="Back to step 1">${ic('replay')} Reset</button></div>`;
function mount(l) {
  stopPlay();
  L = l;
  const [gn, gname, glist] = GROUPS.find((g) => g[2].includes(l));
  if (l.sandbox) { // interactive model: it mounts its own controls instead of steps
    $('#page').innerHTML = `<section class="card stage-card"><div class="crumb">${gn}. ${gname} <span style="opacity:.5">/</span> <b>Lesson ${glist.indexOf(l) + 1} of ${glist.length}</b></div><div class="titlerow"><h1>${l.title}</h1><span class="chip">${ic('clock')} ${l.time} min</span><span class="chip s">${ic('layers')} interactive</span></div><p class="tagline">${l.tagline}</p><div id="sbx-main"></div></section><aside class="side" id="sbx-side"></aside>`;
    document.title = `${l.title} — ${BRAND}`; l.mount($('#sbx-main'), $('#sbx-side'));
    if (!done.has(l.id)) { done.add(l.id); store.set('grid-done', [...done]); }
    drawNav(); return;
  }
  const s = makeScene(); l.build(s);
  $('#page').innerHTML = `
  <section class="card stage-card">
    <div class="crumb">${gn}. ${gname} <span style="opacity:.5">/</span> <b>Lesson ${glist.indexOf(l) + 1} of ${glist.length}</b></div>
    <div class="titlerow"><h1>${l.title}</h1><span class="chip">${ic('clock')} ${l.time} min</span><span class="chip">${ic('gauge')} ${l.level}</span><span class="chip s">${ic('layers')} ${l.steps.length} steps</span>${l.track === 'trader' ? '<span class="chip t">TRADER</span>' : ''}</div>
    <p class="tagline">${l.tagline}</p>
    <div class="stage">
      <div class="stats">${l.stats.map((x) => `<div class="stat" data-stat="${x.id}"><small>${ic(x.icon)} ${x.label}</small><b>—</b></div>`).join('')}</div>
      <svg class="scene" id="scene" viewBox="${s.vb.join(' ')}" role="img" aria-label="${l.title} diagram">${s.render()}</svg>
      <div class="stagefoot"><div class="legend">${l.legend.map((x) => `<span><i style="background:${x[0]}"></i>${x[1]}</span>`).join('')}</div><span class="zoomhint">tap a chart to enlarge</span>
        ${controls()}</div>
      <div class="pbar" aria-hidden="true"><i class="pfill"></i></div>
    </div>
    <div class="stepper"><div class="stepper-head"><b>In this lesson</b><span id="sc"></span></div><div class="dots" id="dots">${l.steps.map((st, i) => `<button class="dot" data-i="${i}" aria-label="Step ${i + 1}: ${st.short}"><i>${i + 1}</i><span>${st.short}</span></button>`).join('')}</div></div>
  </section>
  <aside class="side">
    <div class="card playcard"><span class="mono">Playback</span>${controls()}<div class="pbar" aria-hidden="true"><i class="pfill"></i></div></div>
    <div class="card step"><div class="step-top"><span id="stn"></span><span class="tag" id="tag"></span></div><h2 id="tt"></h2><div class="step-body" id="bd"></div>
      <div class="navrow"><button class="btn" id="bk">${ic('back')} Back</button><button class="btn primary" id="nx"></button></div>
      <div class="hint"><span><kbd>←</kbd><kbd>→</kbd> step</span><span><kbd>Space</kbd> play / pause</span><span><kbd>R</kbd> replay step</span></div></div>
    <div class="card learn"><h3>Knowledge Check</h3><ul id="learn">${l.learn.map((x) => `<li><i></i>${x.t}</li>`).join('')}</ul></div>
  </aside>`;
  document.title = `${l.title} — ${BRAND}`;
  $('#bk').onclick = () => go(step - 1); $('#nx').onclick = next;
  $('#dots').onclick = (e) => { const b = e.target.closest('.dot'); if (b) go(+b.dataset.i); };
  stopPlay(); updatePlayUI();
  document.querySelectorAll('.c-play').forEach((x) => { x.onclick = togglePlay; });
  document.querySelectorAll('.c-stp').forEach((x) => { x.onclick = () => next(false); });
  document.querySelectorAll('.c-prev').forEach((x) => { x.onclick = () => go(step - 1); });
  document.querySelectorAll('.c-rst').forEach((x) => { x.onclick = () => { stopPlay(); go(0); replay(); }; });
  document.querySelectorAll('.c-spd').forEach((x) => { x.onclick = (e) => { e.stopPropagation(); const menu = x.parentNode.querySelector('.c-spm'), open = menu.hidden; closeSpeed(); menu.hidden = !open; x.setAttribute('aria-expanded', open);
    if (open) { menu.classList.remove('down'); const hb = $('.topbar').getBoundingClientRect().bottom; if (menu.getBoundingClientRect().top < hb + 8) menu.classList.add('down'); } }; }); // menu opens upward; flips below the button when the header is in the way
  document.querySelectorAll('.c-spm').forEach((menu) => { menu.onclick = (e) => { const b = e.target.closest('[data-speed]'); if (!b) return; speed = +b.dataset.speed; document.querySelectorAll('.c-spl').forEach((s) => { s.textContent = `${speed}×`; }); document.querySelectorAll('.c-spm [data-speed]').forEach((x) => x.setAttribute('aria-checked', +x.dataset.speed === speed)); closeSpeed(); if (playing) schedule(); }; });
}

function apply() {
  if (L.sandbox) return;
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
  $('#bd').scrollTop = 0; fitLayout(); fitText();
  const last = step === L.steps.length - 1, nxt = LESSONS[LESSONS.indexOf(L) + 1];
  $('#bk').disabled = step === 0;
  $('#nx').disabled = last && !nxt;
  $('#nx').innerHTML = last ? (nxt ? `Next lesson: ${nxt.title.split(' ')[0]} <span>→</span>` : 'You made it <span>✓</span>') : `Next: ${L.steps[step + 1].short} <span>→</span>`;
  $('#sc').textContent = `${pad(step + 1)} of ${pad(L.steps.length)}`;
  document.querySelectorAll('.dot').forEach((d, i) => { d.classList.toggle('done', i < step); d.classList.toggle('cur', i === step); });
  document.querySelectorAll('#learn li').forEach((li, i) => li.classList.toggle('got', step >= L.learn[i].at));
  $('.learn h3').dataset.n = `${L.learn.filter((x) => step >= x.at).length}/${L.learn.length}`;
  declutter();
  if (playing) schedule(); else setBar(0);
  if (last && !done.has(L.id)) { done.add(L.id); store.set('grid-done', [...done]); drawNav(); }
}
// One-screen mode: grow the step text as large as fits (21px down to 14px) so the card never needs a scroll bar.
const fitText = () => {
  const bd = $('#bd'); if (!bd) return;
  bd.style.fontSize = '';
  const phone = matchMedia('(max-width:1000px) and (min-height:560px)').matches;
  if (!phone && !matchMedia('(min-width:1001px) and (min-height:540px)').matches) return;
  let f = phone ? 16 : 21; const min = phone ? 13 : 14; bd.style.fontSize = f + 'px';
  while (f > min && bd.scrollHeight > bd.clientHeight + 1) bd.style.fontSize = (f -= 0.5) + 'px';
};
// One-screen mode: size the left column to the diagram's aspect so the diagram fills it and the text column gets the rest.
const fitZoom = () => { // scale the one-screen layout (designed at 1280×720) to the window, so big screens get big text
  const on = matchMedia('(min-width:1001px) and (min-height:540px)').matches;
  root.style.setProperty('--z', on ? Math.max(0.75, Math.min(2.5, innerWidth / 1280, innerHeight / 720)).toFixed(3) : 1);
};
fitZoom();
const fitLayout = () => {
  const pg = $('#page'), sc = $('#scene'); if (!pg) return;
  pg.style.gridTemplateColumns = '';
  if (!sc || !matchMedia('(min-width:1001px) and (min-height:540px)').matches) return;
  const st = $('.stage'), h = st.clientHeight - $('.stats').offsetHeight - $('.stagefoot').offsetHeight, vb = sc.viewBox.baseVal;
  const W = pg.clientWidth - 32, want = h * vb.width / vb.height + 34 + 2;
  pg.style.gridTemplateColumns = `${Math.round(Math.max(W * 0.4, Math.min(W * 0.6, want)))}px minmax(0,1fr)`;
};
addEventListener('resize', () => { fitZoom(); fitLayout(); fitText(); }); document.fonts?.ready.then(() => { fitZoom(); fitLayout(); fitText(); });
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
function next(cross = true) { if (step < L.steps.length - 1) go(step + 1); else if (cross) { const n = LESSONS[LESSONS.indexOf(L) + 1]; if (n) location.hash = `#/${n.id}/1`; } }
// ---------- playback: Play runs steps 1…n on a timer sized to the step's text ----------
const DWELL = (st) => 3500 + (st.body.join('').length + (st.callout?.t.length || 0)) * 9;   // ms at 1×
function setBar(ms) { document.querySelectorAll('.pfill').forEach((f) => { f.style.transition = 'none'; f.style.width = '0'; if (ms) { void f.offsetWidth; f.style.transition = `width ${ms}ms linear`; f.style.width = '100%'; } }); }
function updatePlayUI() { document.querySelectorAll('.c-play').forEach((b) => { b.innerHTML = playing ? `${ic('pause')} Pause` : `${ic('play')} Play`; b.setAttribute('aria-pressed', playing); b.classList.toggle('on', playing); }); }
function closeSpeed() { document.querySelectorAll('.c-spm').forEach((x) => { x.hidden = true; }); document.querySelectorAll('.c-spd').forEach((x) => x.setAttribute('aria-expanded', 'false')); }
function stopPlay() { playing = false; clearTimeout(timer); setBar(0); updatePlayUI(); }
function schedule() {
  clearTimeout(timer); if (!playing || !L || L.sandbox) return;
  const d = DWELL(L.steps[step]) / speed; setBar(d);
  timer = setTimeout(() => { if (step < L.steps.length - 1) go(step + 1); else stopPlay(); }, d);
}
function togglePlay() {
  if (playing) return stopPlay();
  playing = true; updatePlayUI();
  if (step === L.steps.length - 1) go(0); else schedule();                  // finished lesson: Play restarts from step 1
}
function replay() {
  const svg = $('#scene');
  svg.querySelectorAll('.el').forEach((el) => { if (+el.dataset.from === step || el.classList.contains('on')) { el.classList.add('hide'); el.classList.remove('on'); } });
  void svg.getBoundingClientRect(); requestAnimationFrame(apply);
}
function togglePause() { paused = !paused; $('#scene').classList.toggle('paused', paused); $('#pause').innerHTML = ic(paused ? 'play' : 'pause'); }

function route() {
  const m = location.hash.match(/^#\/([a-z]+)\/(\d+)/);
  const l = (m && LESSONS.find((x) => x.id === m[1])) || L || LESSONS[0];
  if (l !== L) { mount(l); paused = false; }
  step = l.sandbox ? 0 : Math.max(0, Math.min(l.steps.length - 1, m ? parseInt(m[2], 10) - 1 : 0));
  apply();
}
window.addEventListener('hashchange', route);
document.addEventListener('click', (e) => { const h = e.target.closest('.learn h3'); if (h) h.parentNode.classList.toggle('open'); else if (!e.target.closest('.learn')) $('.learn')?.classList.remove('open'); }); // phone: Knowledge Check sheet
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape') return closeAll();
  if (e.target.tagName === 'INPUT' || L.sandbox) return;
  if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') go(step - 1);
  else if (e.key.toLowerCase() === 'r') replay(); else if (e.key === ' ' && !e.target.closest('button, a')) { e.preventDefault(); togglePlay(); }
});
route();
