// Helpers shared by the "grid" lessons (the source lessons keep their own small copies).
import { P } from '../iso.js';

export const q = (p) => P(...p).map((n) => n.toFixed(1)).join(',');
export const pylon = (x, y, h = 3.3) => `<path class="ln" d="M${q([x - 0.2, y - 0.2, 0])}L${q([x, y, h])}L${q([x + 0.2, y + 0.2, 0])}M${q([x - 0.2, y + 0.2, 0])}L${q([x, y, h])}L${q([x + 0.2, y - 0.2, 0])}M${q([x, y - 0.6, h - 0.3])}L${q([x, y + 0.6, h - 0.3])}M${q([x, y - 0.45, h - 1])}L${q([x, y + 0.45, h - 1])}"/>`;

// A small house with a gable roof, as extra svg for s.box().
export function house(s, id, x, y, o = {}) {
  const w = 1.5, d = 1.3, h = 0.9;
  s.box(id, x, y, 0, w, d, h, 'cream', {
    ...o,
    extra: `<polygon class="o" fill="#e4d6c4" points="${[[x + w, y, h], [x + w, y + d, h], [x + w, y + d / 2, h + 0.6]].map(q).join(' ')}"/><polygon class="o" fill="#e5534b" points="${[[x - 0.12, y + d + 0.12, h - 0.05], [x + w + 0.12, y + d + 0.12, h - 0.05], [x + w + 0.12, y + d / 2, h + 0.62], [x - 0.12, y + d / 2, h + 0.62]].map(q).join(' ')}"/><polygon class="o" fill="#8dc0e8" points="${[[x + 0.25, y + d, 0.3], [x + 0.65, y + d, 0.3], [x + 0.65, y + d, 0.7], [x + 0.25, y + d, 0.7]].map(q).join(' ')}"/>`,
  });
}

// Spinning rotor seen from above, drawn flat on the iso ground plane. spin = CSS duration or var().
export function flywheel(x, y, z, r, spin) {
  const [px, py] = P(x, y, z), R = r * 30 * 1.22;
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) scale(1 .577)"><circle class="o" r="${R.toFixed(1)}" fill="#c9ccd1"/><g class="spin" style="--spin:${spin}"><circle r="${(R * 0.7).toFixed(1)}" fill="none" stroke="#2b2722" stroke-width="3" stroke-dasharray="${(R * 0.7 * 0.5).toFixed(1)} ${(R * 0.7 * 0.5).toFixed(1)}"/><path d="M0,${-R}V${R}M${-R},0H${R}" stroke="#2b2722" stroke-width="3.5" stroke-linecap="round"/><circle r="5" fill="#e9fc82" stroke="#2b2722" stroke-width="2"/></g></g>`;
}

// Catmull-Rom → cubic Bézier through points [[x,y],…] for smooth chart lines.
export function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
