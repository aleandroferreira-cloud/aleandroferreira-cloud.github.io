// Lousa marrom e dourada: giz que desenha traço a traço, mão estilizada com giz/apagador e bonequinhos de palito.
// Usa as variáveis globais de index.html (g, S, W, H, CU, TL, P, eo, eio, back, goldG, rnd, mulberry, load, IMG, inssLogo, logo, wmark).
const CK = { cream: '#f3ead2', gold: '#f2c85b', red: '#e8674c', pale: '#cdbb97' };
const BX0 = 50, BY0 = 40, BX1 = 1030, BY1 = 790;
let BOARD = null, LA = null, LB = null, la = null, lb = null, GTILE = null, LCH = [];
const _mb = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const LR = _mb(777), lrnd = (a = 0, b = 1) => a + (b - a) * LR();

function bakeBoard() {
  BOARD = document.createElement('canvas'); BOARD.width = W; BOARD.height = H; const b = BOARD.getContext('2d'); b.scale(S, S);
  b.shadowColor = 'rgba(0,0,0,0.6)'; b.shadowBlur = 40; b.shadowOffsetY = 16; b.fillStyle = '#3d2813'; b.fillRect(BX0 - 30, BY0 - 30, BX1 - BX0 + 60, BY1 - BY0 + 60); b.shadowColor = 'transparent';
  const wg = b.createLinearGradient(0, BY0 - 30, 0, BY1 + 30); wg.addColorStop(0, '#8a5a2e'); wg.addColorStop(0.5, '#6b4423'); wg.addColorStop(1, '#4e3016'); b.fillStyle = wg; b.fillRect(BX0 - 30, BY0 - 30, BX1 - BX0 + 60, BY1 - BY0 + 60);
  for (let i = 0; i < 160; i++) { b.strokeStyle = `rgba(35,20,8,${lrnd(0.05, 0.16)})`; b.lineWidth = lrnd(0.6, 2); const y = lrnd(BY0 - 30, BY1 + 30); b.beginPath(); b.moveTo(BX0 - 30, y); b.lineTo(BX1 + 30, y + lrnd(-3, 3)); b.stroke(); }
  const sg = b.createLinearGradient(BX0, BY0, BX1, BY1); sg.addColorStop(0, '#34230f'); sg.addColorStop(0.5, '#2a1b0b'); sg.addColorStop(1, '#241709'); b.fillStyle = sg; b.fillRect(BX0, BY0, BX1 - BX0, BY1 - BY0);
  for (const [w, h, a] of [[12, 6, 0.16], [40, 20, 0.1], [140, 70, 0.05]]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const cc = c.getContext('2d'), id = cc.createImageData(w, h); for (let i = 0; i < w * h; i++) { id.data[i * 4] = 190; id.data[i * 4 + 1] = 150; id.data[i * 4 + 2] = 90; id.data[i * 4 + 3] = lrnd(0, 1) * a * 255; } cc.putImageData(id, 0, 0); b.imageSmoothingEnabled = true; b.drawImage(c, BX0, BY0, BX1 - BX0, BY1 - BY0); }
  for (let i = 0; i < 16; i++) { const x = lrnd(BX0, BX1), y = lrnd(BY0, BY1); const rg = b.createRadialGradient(x, y, 0, x, y, lrnd(60, 200)); rg.addColorStop(0, 'rgba(240,225,190,0.035)'); rg.addColorStop(1, 'rgba(240,225,190,0)'); b.fillStyle = rg; b.fillRect(x - 220, y - 220, 440, 440); }
  b.strokeStyle = 'rgba(0,0,0,0.5)'; b.lineWidth = 8; b.strokeRect(BX0, BY0, BX1 - BX0, BY1 - BY0);
  const gg = b.createLinearGradient(BX0, BY0, BX1, BY1); [[0, '#fff3c0'], [0.3, '#f5d268'], [0.55, '#c8922a'], [0.8, '#8a5a14'], [1, '#e9c25a']].forEach(([o, c]) => gg.addColorStop(o, c)); b.strokeStyle = gg; b.lineWidth = 3; b.strokeRect(BX0 - 12, BY0 - 12, BX1 - BX0 + 24, BY1 - BY0 + 24);
  b.fillStyle = '#4e3016'; b.fillRect(BX0 - 30, BY1 + 8, BX1 - BX0 + 60, 30); b.fillStyle = '#7a4f28'; b.fillRect(BX0 - 30, BY1 + 8, BX1 - BX0 + 60, 8);   // bandeja do giz
  [['#f3ead2', 150], ['#f2c85b', 230], ['#e8674c', 310]].forEach(([c, x]) => { b.fillStyle = c; b.beginPath(); b.roundRect(x, BY1 + 2, 70, 14, 5); b.fill(); });
  b.fillStyle = '#d8cdb5'; b.fillRect(800, BY1 - 6, 130, 22); b.fillStyle = '#8a5a30'; b.fillRect(800, BY1 - 24, 130, 18);
  GTILE = document.createElement('canvas'); GTILE.width = GTILE.height = 256; const t = GTILE.getContext('2d'), id = t.createImageData(256, 256);
  for (let i = 0; i < 65536; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = lrnd(0, 1) < 0.8 ? 175 + lrnd(0, 80) : lrnd(0, 90); } t.putImageData(id, 0, 0);
  LA = document.createElement('canvas'); LB = document.createElement('canvas'); LA.width = LB.width = W; LA.height = LB.height = H; la = LA.getContext('2d'); lb = LB.getContext('2d');
}

// ---------- formas desenhadas à mão ----------
const dens = (pts, step = 6) => { const o = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) o.push([lerp(a[0], b[0], k / n) + lrnd(-0.7, 0.7), lerp(a[1], b[1], k / n) + lrnd(-0.7, 0.7)]); } o.push(pts[pts.length - 1]); return o; };
const circP = (cx, cy, r, a0 = -1.9, sw = 6.55, n = 22) => Array.from({ length: n }, (_, i) => { const a = a0 + sw * i / (n - 1); return [cx + Math.cos(a) * r * (1 + 0.03 * Math.sin(a * 3 + cx)), cy + Math.sin(a) * r * (1 + 0.03 * Math.cos(a * 2 + cy))]; });
const rectP = (x, y, w, h) => dens([[x, y], [x + w, y + lrnd(-2, 2)], [x + w + lrnd(-2, 2), y + h], [x + lrnd(-2, 2), y + h], [x - 1, y - 1]]);
const lineP = (x0, y0, x1, y1) => dens([[x0, y0], [x1, y1]]);
const arcP = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n }, (_, i) => { const a = lerp(a0, a1, i / (n - 1)); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const checkP = (x, y, s) => dens([[x - s * 0.5, y], [x - s * 0.12, y + s * 0.42], [x + s * 0.6, y - s * 0.5]]);
const crossP = (x, y, s) => [dens([[x - s, y - s], [x + s, y + s]]), dens([[x + s, y - s], [x - s, y + s]])];
function catP(c, step = 6) { const out = [], P2 = [c[0], ...c, c[c.length - 1]]; for (let i = 1; i < P2.length - 2; i++) { const p0 = P2[i - 1], p1 = P2[i], p2 = P2[i + 1], p3 = P2[i + 2], n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step)); for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t, f = (a, b, c2, d) => 0.5 * ((2 * b) + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3); out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); } } out.push(c[c.length - 1]); return out; }

// bonequinho de palito (pés em X,Y). dir=-1 espelha.
const POSES = {
  idle: { arms: [[-16, 36, -24, 72], [16, 36, 24, 72]], legs: [[-10, 40, -16, 80], [10, 40, 16, 80]], lean: 0 },
  happy: { arms: [[-30, -18, -54, -60], [30, -18, 54, -60]], legs: [[-18, 40, -32, 80], [18, 40, 32, 80]], lean: 0, mood: 'smile' },
  hurt: { arms: [[8, 32, 22, 64], [-10, 24, -34, 6]], legs: [[-6, 40, -30, 78], [14, 38, 30, 80]], lean: 24, mood: 'sad', drops: 1 },
  walk: { arms: [[-14, 32, -30, 62], [20, 28, 40, 52]], legs: [[-6, 40, -34, 78], [14, 38, 30, 80]], lean: 4 },
  talk: { arms: [[-16, 36, -24, 72], [34, -6, 66, -22]], legs: [[-10, 40, -16, 80], [10, 40, 16, 80]], lean: 0, mood: 'flat' },
  judge: { arms: [[-16, 36, -28, 70], [30, -22, 52, -70]], legs: [[-10, 40, -16, 80], [10, 40, 16, 80]], lean: 0, mood: 'flat', robe: 1, gavel: 1 },
  carry: { arms: [[22, 26, 52, 24], [14, 34, 46, 34]], legs: [[-8, 40, -22, 80], [10, 40, 24, 80]], lean: 6, mood: 'smile', box: 1 },
  broom: { arms: [[16, 30, 40, 40], [26, 24, 52, 14]], legs: [[-8, 40, -18, 80], [10, 40, 20, 80]], lean: 4, mood: 'smile', broom: 1 },
  dig: { arms: [[18, 24, 46, 30], [28, 18, 60, 6]], legs: [[-10, 40, -22, 80], [12, 40, 24, 80]], lean: 8, mood: 'smile', bucket: 1 },
};
function figure(X, Y, s, pose, dir = 1) {
  const p = POSES[pose], L = p.lean, M = (x, y) => [X + x * dir * s, Y + y * s], out = [], shoulder = [L, -138], hip = [0, -80], head = [L * 1.25, -172];
  out.push({ pts: circP(...M(head[0], head[1]), 22 * s), w: 7 });
  out.push({ pts: catP([M(L, -148), M(L * 0.5, -112), M(0, -80)]), w: 8 });
  p.arms.forEach(a => out.push({ pts: catP([M(shoulder[0], shoulder[1]), M(shoulder[0] + a[0], shoulder[1] + a[1]), M(shoulder[0] + a[2], shoulder[1] + a[3])]), w: 7 }));
  p.legs.forEach(l => out.push({ pts: catP([M(0, -80), M(l[0], -80 + l[1]), M(l[2], -80 + l[3] - 0)]), w: 8 }));
  if (p.robe) { out.push({ pts: dens([M(-26, -140), M(-44, -6), M(44, -6), M(26, -140)]), w: 6 }); }
  if (p.gavel) { const hx = shoulder[0] + p.arms[1][2], hy = shoulder[1] + p.arms[1][3]; out.push({ pts: dens([M(hx - 8, hy - 18), M(hx + 6, hy + 8)]), w: 6 }); out.push({ pts: rectP(...M(hx - 26, hy - 36), 48 * s * dir, 22 * s), w: 7 }); }
  if (p.box) out.push({ pts: rectP(...M(36, -112), 60 * s * dir, 52 * s), w: 7 });
  if (p.broom) { const hx = shoulder[0] + p.arms[1][2], hy = shoulder[1] + p.arms[1][3]; out.push({ pts: dens([M(hx, hy - 80), M(hx + 14, 0)]), w: 6 }); out.push({ pts: dens([M(hx + 14, 0), M(hx - 12, 14), M(hx + 14, 0), M(hx + 4, 16), M(hx + 14, 0), M(hx + 28, 14), M(hx + 14, 0), M(hx + 38, 12)]), w: 5 }); }
  if (p.bucket) { const hx = shoulder[0] + p.arms[0][2], hy = shoulder[1] + p.arms[0][3]; out.push({ pts: dens([M(hx - 18, hy + 8), M(hx - 12, hy + 52), M(hx + 20, hy + 52), M(hx + 26, hy + 8), M(hx - 18, hy + 8)]), w: 6 }); }
  const e1 = M(head[0] - 8, head[1] - 4), e2 = M(head[0] + 8, head[1] - 4), mo = M(head[0], head[1] + 10);
  out.push({ pts: lineP(e1[0], e1[1], e1[0] + 0.5, e1[1] + 3), w: 6 }); out.push({ pts: lineP(e2[0], e2[1], e2[0] + 0.5, e2[1] + 3), w: 6 });
  if (p.mood === 'smile' || pose === 'happy') out.push({ pts: arcP(mo[0], mo[1] - 4 * s, 9 * s, 0.25, 2.9, 8), w: 5 });
  else if (p.mood === 'sad') { out.push({ pts: arcP(mo[0], mo[1] + 8 * s, 9 * s, 3.5, 5.9, 8), w: 5 }); out.push({ pts: lineP(e1[0] - 6, e1[1] - 9 * s, e1[0] + 6, e1[1] - 13 * s), w: 4 }); out.push({ pts: lineP(e2[0] + 6, e2[1] - 9 * s, e2[0] - 6, e2[1] - 13 * s), w: 4 }); }
  else out.push({ pts: lineP(mo[0] - 6, mo[1], mo[0] + 6, mo[1]), w: 5 });
  if (p.drops) { const dx = M(head[0] + 28, head[1] - 8); [0, 1].forEach(i => out.push({ pts: catP([[dx[0] + i * 14, dx[1] + i * 22], [dx[0] + i * 14 - 4, dx[1] + i * 22 + 10], [dx[0] + i * 14, dx[1] + i * 22 + 16]]), w: 5, col: 'pale' })); const zz = M(-30, -120); out.push({ pts: dens([[zz[0], zz[1]], [zz[0] - 14, zz[1] + 8], [zz[0], zz[1] + 16], [zz[0] - 14, zz[1] + 24]]), w: 5, col: 'red' }); }
  return out;
}
const bubbleP = (x, y, w, h, tx, ty) => dens([[x + 18, y], [x + w - 18, y], [x + w, y + 18], [x + w, y + h - 18], [x + w - 18, y + h], [tx + 30, y + h], [tx, ty], [tx - 10, y + h], [x + 18, y + h], [x, y + h - 18], [x, y + 18], [x + 18, y]]);

// ---------- caneta (agenda o desenho) ----------
class Pen {
  constructor(ch, t) { this.ch = ch; this.t = t; }
  at(t) { this.t = t; return this; }
  wait(d) { this.t += d; return this; }
  s(pts, w = 7, col = 'cream', o = {}) { w *= 1.3; const pp = o.raw ? dens(pts) : pts; let len = 0; for (let i = 1; i < pp.length; i++) len += Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); const dur = o.dur || Math.max(0.16, len / (o.speed || 900)); const it = { k: 's', pts: pp, w, col, t0: this.t, t1: this.t + dur, len, keep: o.keep }; (o.keep ? this.ch.keep : this.ch.items).push(it); if (!o.nohand) this.ch.pen.push(it); this.t += dur + (o.gap ?? 0.05); return this; }
  txt(str, x, y, size, col = 'cream', o = {}) { size = Math.round(size * 1.12); g.save(); g.font = `${size}px Caveat, cursive`; const tw = g.measureText(str).width; g.restore(); const dur = o.dur || Math.max(0.45, str.length * 0.062 * (size / 60) + 0.15); const it = { k: 't', str, x, y, size, col, t0: this.t, t1: this.t + dur, tw, align: o.align || 'left', rot: o.rot || 0, keep: o.keep }; (o.keep ? this.ch.keep : this.ch.items).push(it); if (!o.nohand) this.ch.pen.push(it); this.t += dur + (o.gap ?? 0.1); return this; }
  fig(list, col = 'cream', o = {}) { list.forEach(f => this.s(f.pts, f.w, f.col || col, { speed: o.speed || 1500, gap: 0.03, nohand: o.nohand, dur: o.dur })); return this; }
  wipe(dur = 1.5) { const path = window.WIPE_PATH; const pts = dens(path, 10); const it = { k: 'w', pts, t0: this.t, t1: this.t + dur, w: window.WIPE_W || 250 }; this.ch.wipes.push(it); this.ch.pen.push(it); this.t += dur + 0.1; return this; }
}

// ---------- capítulo único (curto) ----------
function newChapter(t0, t1) { LCH = [{ n: '01', t0, t1, items: [], keep: [], pen: [], wipes: [], stickers: [] }]; return LCH[0]; }
function finishLousa() {
  LCH.forEach(ch => ch.pen.sort((a, b) => a.t0 - b.t0));
  window.EV = LCH.flatMap(ch => ch.pen.map(it => it.k === 'w' ? { t: it.t0, type: 'wipe', d: it.t1 - it.t0 } : { t: it.t0, type: 'chalk', d: it.t1 - it.t0, len: it.k === 's' ? it.len : it.str.length * it.size * 0.3, big: (it.w || 0) > 9 || (it.size || 0) > 100 ? 1 : 0, acc: it.col === 'gold' || it.col === 'red' ? 1 : 0 }));
}

// ---------- desenho do giz, mão e apagador ----------
function drawItems(ctx, items, t, wipe) {
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  items.forEach(it => {
    const p = clamp((t - it.t0) / (it.t1 - it.t0)); if (p <= 0) return; ctx.strokeStyle = ctx.fillStyle = CK[it.col] || CK.cream;
    if (it.k === 's') { const m = Math.max(2, Math.ceil(p * it.pts.length)); ctx.lineWidth = it.w; ctx.beginPath(); it.pts.slice(0, m).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    else { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot); ctx.font = `${it.size}px Caveat, cursive`; const x0 = it.align === 'center' ? -it.tw / 2 : 0; ctx.beginPath(); ctx.rect(x0 - 30, -it.size * 1.15, (it.tw + 80) * p, it.size * 1.7); ctx.clip(); ctx.fillText(it.str, x0, 0); ctx.globalAlpha = 0.5; ctx.fillText(it.str, x0 + 0.9, 0.7); ctx.restore(); }
  });
}
function grainMask(ctx) { const pat = ctx.createPattern(GTILE, 'repeat'); pat.setTransform(new DOMMatrix([0.5 * S, 0, 0, 0.5 * S, 0, 0])); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
function wipePath(ctx, it, p) { const m = Math.max(2, Math.ceil(p * it.pts.length)); ctx.beginPath(); it.pts.slice(0, m).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineWidth = it.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
function tipOf(it, t) {
  if (it.k === 's') { const p = clamp((t - it.t0) / (it.t1 - it.t0)), idx = Math.min(it.pts.length - 1, Math.floor(p * (it.pts.length - 1))); return it.pts[idx]; }
  if (it.k === 't') { const p = clamp((t - it.t0) / (it.t1 - it.t0)), x0 = it.align === 'center' ? it.x - it.tw / 2 : it.x; return [x0 + it.tw * p, it.y - it.size * 0.12 + Math.sin(t * 22) * 3]; }
  const p = clamp((t - it.t0) / (it.t1 - it.t0)), idx = Math.min(it.pts.length - 1, Math.floor(p * (it.pts.length - 1))); return it.pts[idx];
}
const startOf = it => it.k === 's' ? it.pts[0] : it.k === 't' ? [it.align === 'center' ? it.x - it.tw / 2 : it.x, it.y] : it.pts[0];
const endOf = it => it.k === 's' ? it.pts[it.pts.length - 1] : it.k === 't' ? [it.align === 'center' ? it.x + it.tw / 2 : it.x + it.tw, it.y] : it.pts[it.pts.length - 1];
function handState(ch, t) {
  const pen = ch.pen; if (!pen.length) return null; const first = pen[0], last = pen[pen.length - 1], OFF = window.HAND_OFF || [2050, 1250];
  const lastEnd = Math.max(...pen.map(i => i.t1));
  if (t < first.t0 - 1.0 || t > lastEnd + 1.6) return null;
  if (t < first.t0) { const q = eio((t - (first.t0 - 1.0)) / 1.0), s = startOf(first); return { x: lerp(OFF[0], s[0], q), y: lerp(OFF[1], s[1], q), tool: first.k === 'w' ? 'eraser' : 'chalk', writing: false }; }
  if (t > lastEnd + 0.5) { const q = eio((t - (lastEnd + 0.5)) / 1.1), e = endOf(last); return { x: lerp(e[0], OFF[0], q), y: lerp(e[1], OFF[1], q), tool: 'chalk', writing: false }; }
  let act = null; for (const it of pen) if (t >= it.t0 && t < it.t1) act = it;
  if (act) { const tp = tipOf(act, t); return { x: tp[0], y: tp[1], tool: act.k === 'w' ? 'eraser' : 'chalk', writing: true }; }
  let prev = null, next = null; for (const it of pen) { if (it.t1 <= t) prev = it; else if (it.t0 > t && !next) next = it; }
  if (!prev) return null; const a = endOf(prev); if (!next) return { x: a[0], y: a[1] - 6, tool: 'chalk', writing: false };
  const b = startOf(next), gap = next.t0 - prev.t1, mv = Math.min(gap, 0.35), q = eio((t - (next.t0 - mv)) / mv);
  return { x: lerp(a[0], b[0], clamp(q)), y: lerp(a[1], b[1], clamp(q)) - Math.sin(Math.PI * clamp(q)) * 22 - 6, tool: next.k === 'w' ? 'eraser' : 'chalk', writing: false };
}
function drawHand(h, t) {
  const SKIN = '#e8b98f', EDGE = '#a9744a', ang = 0.62 + (h.writing ? 0.035 * Math.sin(t * 17) : 0);
  g.save(); g.setTransform(S, 0, 0, S, 0, 0); g.translate(h.x, h.y); g.rotate(ang); g.scale(window.HAND_SCALE || 0.8, window.HAND_SCALE || 0.8);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 26; g.shadowOffsetX = 14; g.shadowOffsetY = 18;
  g.fillStyle = '#4a2e16'; g.beginPath(); g.moveTo(330, -66); g.lineTo(1300, -120); g.lineTo(1300, 150); g.lineTo(330, 84); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = goldG(300, -70, 340, 90); g.beginPath(); g.moveTo(318, -70); g.lineTo(350, -72); g.lineTo(350, 90); g.lineTo(318, 86); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.moveTo(350, -72); g.lineTo(1300, -120); g.lineTo(1300, -60); g.lineTo(350, -20); g.closePath(); g.fill();
  const tool = h.tool;
  if (tool === 'chalk') { g.fillStyle = '#f3ead2'; g.beginPath(); g.roundRect(-2, -9, 128, 18, 8); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(8, 2, 118, 7); }
  else { g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fillStyle = '#d8cdb5'; g.beginPath(); g.roundRect(-30, -22, 170, 62, 10); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = '#8a5a30'; g.beginPath(); g.roundRect(-30, -50, 170, 36, 8); g.fill(); }
  const ox = tool === 'chalk' ? 0 : 20, stroke = (pts, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + ox, y) : g.moveTo(x + ox, y)); g.stroke(); };
  [[222, 30], [246, 48], [262, 66]].forEach(([x, y]) => { g.fillStyle = EDGE; g.beginPath(); g.arc(x + ox, y, 27, 0, 7); g.fill(); g.fillStyle = SKIN; g.beginPath(); g.arc(x + ox, y, 23, 0, 7); g.fill(); });
  g.fillStyle = EDGE; g.beginPath(); g.ellipse(272 + ox, 6, 92, 70, 0.2, 0, 7); g.fill(); g.fillStyle = SKIN; g.beginPath(); g.ellipse(272 + ox, 6, 86, 64, 0.2, 0, 7); g.fill();
  stroke([[62, 22], [120, 38], [190, 18]], 42, EDGE); stroke([[62, 22], [120, 38], [190, 18]], 35, SKIN);
  stroke([[74, -22], [146, -36], [222, -8]], 42, EDGE); stroke([[74, -22], [146, -36], [222, -8]], 35, SKIN);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(112 + ox, -40, 18, 7, -0.1, 0, 7); g.fill();
  g.restore();
}
function lousaDraw(n, t) {
  const ch = LCH[parseInt(n, 10) - 1]; if (!ch) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BOARD, 0, 0, W, H); g.restore();
  const WS = ch.wipes, segOf = tt => { let k = 0; while (k < WS.length && tt >= WS[k].t1) k++; return k; };
  // adesivos (logo do INSS colado na lousa): somem junto com o apagador do seu trecho
  ch.stickers.forEach(s => { const q = back(P(t, s.t0, 0.45)); if (q <= 0) return; const w = WS[segOf(s.t0)]; if (w && t > w.t0 + 0.2) return; g.save(); g.setTransform(S, 0, 0, S, 0, 0); g.translate(s.x, s.y); g.rotate(s.rot); g.scale(lerp(1.5, 1, q), lerp(1.5, 1, q)); g.globalAlpha *= clamp(q * 1.6); inssLogo(0, 0, s.w, 1); g.fillStyle = 'rgba(242,200,91,0.7)'; g.fillRect(-s.w / 2 - 20, -s.w * 0.17, 70, 22); g.fillRect(s.w / 2 - 50, s.w * 0.12, 70, 22); g.restore(); });
  la.setTransform(1, 0, 0, 1, 0, 0); la.clearRect(0, 0, W, H);
  for (let k = 0; k <= WS.length; k++) {
    const w = WS[k], lo = k ? WS[k - 1].t1 : -1e9, items = ch.items.filter(i => i.t0 >= lo && (!w || i.t0 < w.t1));
    if (w && t > w.t1) continue; drawItems(la, items, t);
    if (w) { const wp = clamp((t - w.t0) / (w.t1 - w.t0)); if (wp > 0) { la.setTransform(S, 0, 0, S, 0, 0); la.globalCompositeOperation = 'destination-out'; la.shadowColor = '#000'; la.shadowBlur = 24; wipePath(la, w, eio(wp)); la.strokeStyle = '#000'; la.stroke(); la.shadowBlur = 0; la.globalCompositeOperation = 'source-over'; } }
  }
  grainMask(la);
  lb.setTransform(1, 0, 0, 1, 0, 0); lb.clearRect(0, 0, W, H); drawItems(lb, ch.keep, t); grainMask(lb);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(LA, 0, 0); g.drawImage(LB, 0, 0); g.restore();
  const h = handState(ch, t); if (h) drawHand(h, t);
}
