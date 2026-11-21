// Reusable inner-SVG builders for s.card(): bars, numbered lists, tables. Card inner width ≈ w; text sits at x = 12.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export function bars(rows, { w = 290, labelW = 96, max, y0 = 34, h = 16, gap = 9, fmt = (v) => v, note } = {}) {
  const m = max ?? Math.max(...rows.map((r) => Math.abs(r.value)));
  const span = w - labelW - 54;
  let out = '';
  rows.forEach((r, i) => {
    const y = y0 + i * (h + gap), len = Math.max(2, (Math.abs(r.value) / m) * span);
    out += `<text x="12" y="${y + h - 4}" style="font-size:9.5px;fill:var(--ink)">${esc(r.label)}</text><rect x="${labelW}" y="${y}" width="${len.toFixed(1)}" height="${h}" fill="${r.color || '#a6d38b'}" stroke="var(--obj-edge)" stroke-width="1.5"/><text x="${(labelW + len + 6).toFixed(1)}" y="${y + h - 4}" style="font-size:10px;font-weight:700;fill:var(--ink)">${esc(fmt(r.value, r))}</text>`;
  });
  if (note) out += `<text x="12" y="${y0 + rows.length * (h + gap) + 6}" style="font-size:8.5px">${esc(note)}</text>`;
  return out;
}
export function list(rows, { y0 = 32, gap = 28, fills = [] } = {}) {
  return rows.map((r, i) => {
    const [t, s] = Array.isArray(r) ? r : [r], y = y0 + i * gap;
    return `<rect x="12" y="${y}" width="16" height="16" fill="${fills[i] || '#e9fc82'}" stroke="var(--obj-edge)" stroke-width="1.5"/><text x="20" y="${y + 12}" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:#172720">${i + 1}</text><text x="36" y="${y + 8}" style="font-size:10px;font-weight:700;fill:var(--ink)">${esc(t)}</text>${s ? `<text x="36" y="${y + 19}" style="font-size:8.5px">${esc(s)}</text>` : ''}`;
  }).join('');
}
export function table(head, rows, { cols, y0 = 32, rowH = 20, hl, W = 276 } = {}) {
  let out = head.map((h, i) => `<text x="${cols[i]}" y="${y0}" style="font-size:8px;font-weight:700;letter-spacing:.06em;fill:var(--muted)">${esc(h.toUpperCase())}</text>`).join('') + `<path d="M12,${y0 + 6}H${W}" stroke="var(--obj-edge)" stroke-width="1"/>`;
  rows.forEach((r, j) => {
    const y = y0 + 22 + j * rowH;
    if (hl === j) out += `<rect x="8" y="${y - 12}" width="${W - 4}" height="${rowH - 2}" fill="#e9fc82" opacity=".55"/>`;
    out += r.map((c, i) => `<text x="${cols[i]}" y="${y}" style="font-size:9.5px;fill:var(--ink);${i === 0 ? 'font-weight:700' : ''}">${esc(c)}</text>`).join('');
  });
  return out;
}
// Monospace lines for query/formula cards (≈54 characters fit a 300 px card).
export function code(lines, { y0 = 34, gap = 12 } = {}) {
  return lines.map((t, i) => `<text x="12" y="${y0 + i * gap}" style="font-family:var(--mono);font-size:8.5px;fill:var(--ink)">${esc(t)}</text>`).join('');
}
// Vertical columns with a label under each: rows = [{label, value, color}].
export function cols(rows, { w = 300, y0 = 36, h = 96, max, fmt } = {}) {
  const m = max ?? Math.max(...rows.map((r) => r.value)), n = rows.length, step = (w - 28) / n, bw = step * 0.66;
  return `<path class="ax" d="M12,${y0 + h}H${w - 12}"/>` + rows.map((r, i) => {
    const bh = Math.max(2, (r.value / m) * h), x = 14 + i * step + (step - bw) / 2, y = y0 + h - bh;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${r.color || '#a6d38b'}" stroke="var(--obj-edge)" stroke-width="1.4"/>`
      + (fmt ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--ink)">${esc(fmt(r.value))}</text>` : '')
      + `<text x="${(x + bw / 2).toFixed(1)}" y="${y0 + h + 11}" text-anchor="middle" style="font-size:8px">${esc(r.label)}</text>`;
  }).join('');
}
