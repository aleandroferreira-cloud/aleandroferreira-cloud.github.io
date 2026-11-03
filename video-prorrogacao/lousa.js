// Lousa marrom e dourada: giz que desenha traço a traço, mão estilizada com giz/apagador e bonequinhos de palito.
// Usa as variáveis globais de index.html (g, S, W, H, CU, TL, P, eo, eio, back, goldG, rnd, mulberry, load, IMG, inssLogo, logo, wmark).
const CK = { cream: '#f3ead2', gold: '#f2c85b', red: '#e8674c', pale: '#cdbb97' };
const BX0 = 100, BY0 = 80, BX1 = 1820, BY1 = 885;
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
  [['#f3ead2', 300], ['#f2c85b', 380], ['#e8674c', 460]].forEach(([c, x]) => { b.fillStyle = c; b.beginPath(); b.roundRect(x, BY1 + 2, 70, 14, 5); b.fill(); });
  b.fillStyle = '#d8cdb5'; b.fillRect(1500, BY1 - 6, 130, 22); b.fillStyle = '#8a5a30'; b.fillRect(1500, BY1 - 24, 130, 18);
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
  s(pts, w = 7, col = 'cream', o = {}) { w *= 1.3; const pp = o.raw ? dens(pts) : pts; let len = 0; for (let i = 1; i < pp.length; i++) len += Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); const dur = o.dur || Math.max(0.16, len / (o.speed || 900)); const it = { k: 's', pts: pp, w, col, t0: this.t, t1: this.t + dur, len, keep: o.keep }; (o.keep ? this.ch.keep : this.ch.items).push(it); this.ch.pen.push(it); this.t += dur + (o.gap ?? 0.05); return this; }
  txt(str, x, y, size, col = 'cream', o = {}) { size = Math.round(size * 1.12); g.save(); g.font = `${size}px Caveat, cursive`; const tw = g.measureText(str).width; g.restore(); const dur = o.dur || Math.max(0.45, str.length * 0.062 * (size / 60) + 0.15); const it = { k: 't', str, x, y, size, col, t0: this.t, t1: this.t + dur, tw, align: o.align || 'left', rot: o.rot || 0, keep: o.keep }; (o.keep ? this.ch.keep : this.ch.items).push(it); this.ch.pen.push(it); this.t += dur + (o.gap ?? 0.1); return this; }
  fig(list, col = 'cream', o = {}) { list.forEach(f => this.s(f.pts, f.w, f.col || col, { speed: o.speed || 1500, gap: 0.03 })); return this; }
  wipe(dur = 1.5) { const path = [[BX0 + 40, 330], [BX1 - 40, 330], [BX1 - 40, 530], [BX0 + 40, 530], [BX0 + 40, 730], [BX1 - 40, 730]]; const pts = dens(path, 10); const it = { k: 'w', pts, t0: this.t, t1: this.t + dur, w: 250 }; this.ch.wipes.push(it); this.ch.pen.push(it); this.t += dur + 0.1; return this; }
}

// ---------- capítulos ----------
function buildLousa() {
  LCH = CH.map(c => ({ n: c.n, t0: c.t0, t1: c.t1, items: [], keep: [], pen: [], wipes: [], stickers: [] }));
  const C = CU, T = (i) => new Pen(LCH[i], LCH[i].t0 + 0.35), title = (p, s) => p.txt(s, 150, 190, 86, 'cream', { keep: 1, dur: 1.5 }).s(dens([[150, 214], [150 + Math.min(1300, s.length * 40), 218]]), 5, 'gold', { keep: 1, dur: 0.6 });
  // 1. retorno forçado
  { let p = title(T(0), 'Prorrogação negada'); const ch = LCH[0];
    p.at(LCH[0].t0 + 3.0).txt('muita gente perde dinheiro', 960, 440, 100, 'gold', { align: 'center', dur: 1.5 }).s(circP(960, 600, 70, -1.9, 6.5, 20), 9, 'cream', { dur: 0.45 }).txt('R$', 925, 625, 74, 'gold', { dur: 0.3 }).s(lineP(1070, 560, 1160, 700), 6, 'pale', { dur: 0.25 }).s(lineP(1050, 600, 1140, 740), 6, 'pale', { dur: 0.25 }).txt('sem saber', 960, 800, 90, 'cream', { align: 'center', dur: 0.8 }); p.wipe(1.2);
    ch.stickers.push({ t0: Math.max(C.a_nega + 0.3, ch.wipes[0].t1 + 0.1), x: 340, y: 470, w: 400, rot: -0.07 });
    p.at(C.a_nega + 1.3).txt('NEGADO', 190, 700, 120, 'red', { rot: -0.18, dur: 0.7 }).s(rectP(150, 590, 380, 140), 8, 'red', { dur: 0.5 });
    p.at(C.a_nega + 3.0).s(rectP(640, 300, 330, 430), 7, 'cream', { dur: 0.7 }); [380, 440, 500].forEach(y => p.s(lineP(680, y, 930, y), 5, 'pale', { dur: 0.3 })); p.txt('APTA', 700, 640, 90, 'gold', { dur: 0.7 }).s(checkP(900, 600, 50), 9, 'gold', { dur: 0.4 }); p.txt('no papel: apta pra trabalhar', 620, 790, 46, 'cream', { dur: 1.4 });
    p.at(C.a_mas - 0.2).txt('e se você', 1080, 330, 92, 'gold', { dur: 0.8 }).txt('não está?', 1080, 440, 100, 'gold', { dur: 0.9 });
    p.at(C.a_firma - 0.4).fig(figure(1280, 850, 1.45, 'hurt'), 'cream'); p.s(rectP(1560, 600, 200, 250), 7, 'cream', { dur: 0.5 }); [[1590, 640], [1660, 640], [1590, 700], [1660, 700]].forEach(([x, y]) => p.s(rectP(x, y, 40, 36), 5, 'pale', { dur: 0.2, gap: 0.02 })); p.s(rectP(1636, 790, 48, 60), 6, 'cream', { dur: 0.3 }); p.txt('volta pra firma morrendo de dor', 1100, 560, 42, 'red', { dur: 1.7 });
    p.at(C.a_forcado - 1.1).wipe(1.4); p.at(C.a_forcado + 0.4).txt('retorno forçado', 960, 420, 150, 'gold', { align: 'center', dur: 1.3 }).txt('ao trabalho', 960, 580, 150, 'gold', { align: 'center', dur: 1.1 }).s(dens([[560, 620], [1360, 612]]), 7, 'cream', { dur: 0.5 });
    p.at(C.a_comer - 0.3).s(circP(430, 770, 62), 7, 'cream', { dur: 0.5 }).s(circP(430, 770, 38, -1.9, 6.5, 16), 5, 'pale', { dur: 0.3 }).s(lineP(540, 720, 540, 820), 6, 'cream', { dur: 0.3 }).s(lineP(340 - 150, 720, 340 - 150, 820), 6, 'cream', { dur: 0.3 }).txt('necessidade de comer não apaga a doença', 620, 790, 54, 'cream', { dur: 2.2 }); }
  // 2. STF
  { let p = title(T(1), 'STF · Tema 1125'); const ch = LCH[1];
    p.at(C.a_antigamente).txt('antigamente', 170, 300, 50, 'pale', { dur: 0.8 }); p.fig(figure(300, 820, 1.35, 'judge'), 'cream');
    p.at(C.a_antigamente + 2.2).s(bubbleP(470, 330, 410, 240, 400, 520), 6, 'cream', { dur: 0.8 }); ['voltou a trabalhar?', 'então tá capaz.', 'não vou pagar.'].forEach((s, i) => p.txt(s, 495, 400 + i * 62, 42, 'cream', { dur: 1.0, gap: 0.3 }));
    p.at(C.a_hoje - 1.4).s(crossP(675, 450, 150)[0], 11, 'red', { dur: 0.35 }).s(crossP(675, 450, 150)[1], 11, 'red', { dur: 0.35 }).txt('superado', 560, 640, 62, 'red', { rot: -0.1, dur: 0.7 });
    p.at(C.a_hoje).txt('hoje · STF', 1010, 300, 56, 'gold', { dur: 0.9 }); p.s(lineP(1110, 400, 1110, 640), 8, 'gold', { dur: 0.35 }).s(lineP(1010, 420, 1210, 420), 8, 'gold', { dur: 0.3 }).s(lineP(1010, 420, 990, 500), 5, 'gold', { dur: 0.15 }).s(lineP(1010, 420, 1040, 500), 5, 'gold', { dur: 0.15 }).s(lineP(1210, 420, 1180, 500), 5, 'gold', { dur: 0.15 }).s(lineP(1210, 420, 1240, 500), 5, 'gold', { dur: 0.15 }).s(arcP(1010, 500, 30, 0, Math.PI), 6, 'gold', { dur: 0.2 }).s(arcP(1210, 500, 30, 0, Math.PI), 6, 'gold', { dur: 0.2 }).s(lineP(1050, 640, 1170, 640), 8, 'gold', { dur: 0.3 });
    p.at(C.a_tema - 0.3).txt('Tema 1125', 1190, 490, 104, 'gold', { dur: 1.2 }).s(dens([[1190, 520], [1760, 514]]), 7, 'cream', { dur: 0.45 }).s(dens([[1210, 540], [1700, 536]]), 5, 'gold', { dur: 0.35 }); p.at(C.a_tema + 1.0).txt('mesmo doente,', 1230, 650, 56, 'cream', { dur: 1.0 }).txt('o INSS paga', 1230, 715, 56, 'cream', { dur: 0.9 }).txt('aquele período', 1230, 780, 56, 'gold', { dur: 1.1 }); p.at(C.a_detalhe - 3.8).txt('trabalhou por necessidade, não porque ficou boa', 960, 860, 44, 'gold', { align: 'center', dur: 2.6 }); }
  // 3. duas situações
  { let p = title(T(2), 'O que decide se você ganha ou perde');
    p.at(C.a_detalhe + 2.4).txt('um detalhe', 960, 560, 150, 'gold', { align: 'center', dur: 1.2 }).s(dens([[560, 600], [1360, 594]]), 7, 'cream', { dur: 0.5 }); p.wipe(1.2);
    p.at(C.a_separa + 0.2).s(lineP(960, 270, 960, 850), 5, 'gold', { dur: 0.7 });
    p.at(C.a_primeira - 0.4).txt('1ª situação', 170, 320, 46, 'pale', { dur: 0.8 }).txt('voltou porque quis', 170, 400, 64, 'cream', { dur: 1.3 }); p.fig(figure(340, 800, 1.3, 'happy'), 'cream'); p.txt('se sentiu bem', 560, 560, 46, 'cream', { dur: 1.0 }).txt('melhorou', 560, 620, 46, 'cream', { dur: 0.8 }); p.at(C.a_primeira + 4.4).txt('NÃO RECEBE', 400, 750, 62, 'red', { dur: 1.1 }); const x1 = crossP(830, 715, 36); p.s(x1[0], 10, 'red', { dur: 0.25 }).s(x1[1], 10, 'red', { dur: 0.25 });
    p.at(C.a_segunda - 0.4).txt('2ª situação', 1010, 320, 46, 'pale', { dur: 0.8 }).txt('voltou forçado', 1010, 400, 64, 'gold', { dur: 1.2 }); p.fig(figure(1190, 800, 1.3, 'hurt'), 'cream'); ['com dor', 'remédio escondido', 'banheiro toda hora', '(por causa da coluna)'].forEach((s, i) => p.txt(s, 1390, 520 + i * 52, i === 3 ? 36 : 42, 'cream', { dur: 1.1, gap: 0.5 })); p.at(C.a_recebe - 0.1).txt('RECEBE', 1380, 780, 80, 'gold', { dur: 0.9 }).s(checkP(1700, 750, 56), 11, 'gold', { dur: 0.4 }).s(circP(1560, 755, 130, -2, 6.6, 26), 5, 'gold', { dur: 0.6 }); }
  // 4. três provas
  { let p = title(T(3), '3 provas que o juiz mais aceita'); const xs = [380, 960, 1540];
    p.at(C.a_prova + 0.3).txt('como provar', 960, 440, 120, 'gold', { align: 'center', dur: 1.1 }).txt('que foi forçado?', 960, 590, 120, 'cream', { align: 'center', dur: 1.2 }).s(dens([[560, 640], [1360, 634]]), 7, 'gold', { dur: 0.5 }); p.at(C.a_um - 2.7).wipe(1.2);
    [C.a_um, C.a_dois, C.a_tres].forEach((tt, i) => p.at(tt - 0.3).s(circP(xs[i] - 150, 340, 36, -1.6, 6.5, 14), 6, 'gold', { dur: 0.35 }).txt(String(i + 1), xs[i] - 164, 356, 54, 'gold', { dur: 0.25 }));
    p.at(C.a_um + 0.2).s(rectP(xs[0] - 90, 400, 180, 230), 7, 'cream', { dur: 0.6 }); [450, 495, 540].forEach(y => p.s(lineP(xs[0] - 60, y, xs[0] + 60, y), 5, 'pale', { dur: 0.25 })); p.s(lineP(xs[0] + 20, 575, xs[0] + 60, 575), 6, 'red', { dur: 0.15 }).s(lineP(xs[0] + 40, 555, xs[0] + 40, 595), 6, 'red', { dur: 0.15 }).txt('atestados e receitas', xs[0], 720, 50, 'gold', { align: 'center', dur: 1.5 }).txt('do mesmo período', xs[0], 775, 40, 'cream', { align: 'center', dur: 1.1 });
    p.at(C.a_dois + 0.2).s(rectP(xs[1] - 60, 450, 120, 210), 7, 'cream', { dur: 0.5 }).s(lineP(xs[1] - 24, 640, xs[1] + 24, 640), 5, 'pale', { dur: 0.15 }); p.s(bubbleP(xs[1] - 275, 330, 550, 100, xs[1] - 30, 455), 5, 'cream', { dur: 0.7 }).txt('tô com muita dor, mas preciso trabalhar', xs[1] - 255, 392, 32, 'cream', { dur: 1.8 }).txt('aviso ao patrão', xs[1], 740, 50, 'gold', { align: 'center', dur: 1.3 }).txt('mensagem de WhatsApp', xs[1], 795, 38, 'cream', { align: 'center', dur: 1.3 });
    p.at(C.a_ouro - 0.2).s(circP(xs[1] + 170, 560, 78, -2, 6.6, 20), 6, 'gold', { dur: 0.5 }).txt('vale', xs[1] + 128, 552, 44, 'gold', { dur: 0.4 }).txt('ouro', xs[1] + 128, 596, 44, 'gold', { dur: 0.4 }); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; p.s(lineP(xs[1] + 170 + Math.cos(a) * 92, 560 + Math.sin(a) * 92, xs[1] + 170 + Math.cos(a) * 118, 560 + Math.sin(a) * 118), 5, 'gold', { dur: 0.08, gap: 0.01 }); }
    p.at(C.a_tres + 0.2).fig(figure(xs[2] - 30, 700, 1.15, 'talk'), 'cream'); p.s(bubbleP(xs[2] - 250, 330, 440, 100, xs[2] - 60, 480), 5, 'cream', { dur: 0.7 }).txt('vi ela chorando de dor', xs[2] - 232, 392, 32, 'cream', { dur: 1.5 }).txt('testemunha', xs[2], 770, 50, 'gold', { align: 'center', dur: 1.1 }).txt('colega de trabalho', xs[2], 820, 38, 'cream', { align: 'center', dur: 1.1 }); }
  // 5. sem carteira
  { let p = title(T(4), 'Não precisa de carteira assinada');
    p.at(C.a_bico - 0.4); const cx = [380, 960, 1540];
    p.fig(figure(cx[0], 640, 1.35, 'carry'), 'cream').txt('bico', cx[0], 760, 66, 'gold', { align: 'center', dur: 0.6 });
    p.at(C.a_bico + 0.8).fig(figure(cx[1], 640, 1.35, 'dig'), 'cream').txt('diária', cx[1], 760, 66, 'gold', { align: 'center', dur: 0.7 });
    p.at(C.a_bico + 1.9).fig(figure(cx[2] - 20, 640, 1.35, 'broom'), 'cream').txt('faxina', cx[2], 760, 66, 'gold', { align: 'center', dur: 0.7 });
    p.at(C.a_bico + 3.2).txt('= o mesmo direito', 960, 850, 62, 'cream', { align: 'center', dur: 1.6 });
    p.at(C.a_oito - 1.9).wipe(1.4);
    p.at(C.a_oito - 0.2).s(rectP(250, 380, 330, 270), 7, 'cream', { dur: 0.6 }).s(lineP(250, 440, 580, 440), 6, 'cream', { dur: 0.3 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) if (r * 4 + c < 8) p.s(checkP(290 + c * 76, 500 + r * 52, 18), 4, 'gold', { dur: 0.1, gap: 0.02 }); p.txt('8 meses doente', 230, 740, 66, 'cream', { dur: 1.4 });
    p.at(C.a_valor - 1.1).s(dens([[620, 520], [860, 520]]), 9, 'gold', { dur: 0.35 }).s(dens([[820, 480], [866, 520], [820, 560]]), 9, 'gold', { dur: 0.25 });
    p.at(C.a_valor - 0.6).s(catP([[1010, 480], [960, 560], [980, 650], [1090, 680], [1200, 650], [1220, 560], [1170, 480]]), 8, 'cream', { dur: 0.8 }).s(catP([[1010, 480], [1090, 450], [1170, 480]]), 7, 'cream', { dur: 0.3 }).txt('R$', 1060, 600, 80, 'gold', { dur: 0.5 });
    p.at(C.a_valor).txt('R$ 15.000+', 1260, 560, 130, 'gold', { dur: 1.3 }).txt('de atrasados,', 1270, 670, 54, 'cream', { dur: 1.0 }).txt('de uma vez só, com correção', 1270, 735, 46, 'cream', { dur: 1.7 }); }
  // 6. guarde tudo
  { let p = title(T(5), 'Guarde tudo'); const rows = [['atestado', C.a_atestado], ['receita', C.a_receita], ['exame', C.a_exame], ['print de conversa', C.a_print]];
    p.at(C.a_entao + 0.3).fig(figure(330, 800, 1.3, 'hurt'), 'cream').txt('negado na prorrogação,', 560, 470, 58, 'cream', { dur: 1.4 }).txt('e voltou doente', 560, 540, 64, 'gold', { dur: 1.1 }); p.at(C.a_entao + 5.2).s(rectP(1250, 560, 150, 190), 7, 'cream', { dur: 0.5 }).s(lineP(1230, 560, 1420, 560), 7, 'cream', { dur: 0.3 }).s(lineP(1300, 540, 1350, 540), 7, 'cream', { dur: 0.15 }); [1290, 1325, 1360].forEach(x => p.s(lineP(x, 590, x, 720), 4, 'pale', { dur: 0.15, gap: 0.02 })); const xx = crossP(1325, 655, 110); p.s(xx[0], 11, 'red', { dur: 0.3 }).s(xx[1], 11, 'red', { dur: 0.3 }).txt('não jogue esse tempo fora', 960, 830, 64, 'gold', { align: 'center', dur: 1.6 }); p.at(C.a_guarda - 1.5).wipe(1.2);
    rows.forEach(([s, tt], i) => { const y = 400 + i * 120; p.at(tt - 0.55).s(rectP(160, y - 52, 62, 62), 7, 'cream', { dur: 0.35 }).txt(s, 260, y, 72, 'cream', { dur: 0.8 }).s(checkP(190, y - 22, 40), 11, 'gold', { dur: 0.3 }); });
    p.at(C.a_dinheiro - 0.7).s(catP([[1230, 470], [1170, 570], [1190, 690], [1340, 740], [1490, 690], [1510, 570], [1450, 470]]), 9, 'cream', { dur: 1.0 }).s(catP([[1230, 470], [1340, 420], [1450, 470]]), 8, 'cream', { dur: 0.4 }).s(lineP(1280, 445, 1400, 445), 7, 'cream', { dur: 0.2 }).txt('R$', 1280, 640, 110, 'gold', { dur: 0.7 });
    p.at(C.a_dinheiro + 0.2).txt('esse tempo pode virar', 1380, 800, 48, 'cream', { align: 'center', dur: 1.2 }).txt('dinheiro no seu bolso', 1380, 860, 56, 'gold', { align: 'center', dur: 1.4 }); }
  LCH.forEach(ch => { ch.pen.sort((a, b) => a.t0 - b.t0); });
  window.EV = LCH.flatMap(ch => ch.pen.map(it => it.k === 'w' ? { t: it.t0, type: 'wipe', d: it.t1 - it.t0 } : { t: it.t0, type: 'chalk', d: it.t1 - it.t0, len: it.k === 's' ? it.len : it.str.length * it.size * 0.3, big: (it.w || 0) > 9 || (it.size || 0) > 100 ? 1 : 0, acc: it.col === 'gold' || it.col === 'red' ? 1 : 0 }));
  LCH.forEach(ch => ch.stickers.forEach(s => window.EV.push({ t: s.t0 + 0.35, type: 'stamp' })));
}

// ---------- desenho do giz, mão e apagador ----------
function drawItems(ctx, items, t, wipe) {
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  items.forEach(it => {
    const p = clamp((t - it.t0) / (it.t1 - it.t0)); if (p <= 0) return; ctx.strokeStyle = ctx.fillStyle = CK[it.col] || CK.cream;
    if (it.k === 's') { const m = Math.max(2, Math.ceil(p * it.pts.length)); ctx.lineWidth = it.w; ctx.beginPath(); it.pts.slice(0, m).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    else { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot); ctx.font = `${it.size}px Caveat, cursive`; const x0 = it.align === 'center' ? -it.tw / 2 : 0; ctx.beginPath(); ctx.rect(x0 - 12, -it.size * 1.1, (it.tw + 24) * p, it.size * 1.6); ctx.clip(); ctx.fillText(it.str, x0, 0); ctx.globalAlpha = 0.5; ctx.fillText(it.str, x0 + 0.9, 0.7); ctx.restore(); }
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
  const pen = ch.pen; if (!pen.length) return null; const first = pen[0], last = pen[pen.length - 1], OFF = [2050, 1250];
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
  g.save(); g.setTransform(S, 0, 0, S, 0, 0); g.translate(h.x, h.y); g.rotate(ang); g.scale(0.8, 0.8);
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
    const w = WS[k], lo = k ? WS[k - 1].t1 : -1, items = ch.items.filter(i => i.t0 >= lo && (!w || i.t0 < w.t1));
    if (w && t > w.t1) continue; drawItems(la, items, t);
    if (w) { const wp = clamp((t - w.t0) / (w.t1 - w.t0)); if (wp > 0) { la.setTransform(S, 0, 0, S, 0, 0); la.globalCompositeOperation = 'destination-out'; la.shadowColor = '#000'; la.shadowBlur = 24; wipePath(la, w, eio(wp)); la.strokeStyle = '#000'; la.stroke(); la.shadowBlur = 0; la.globalCompositeOperation = 'source-over'; } }
  }
  grainMask(la);
  lb.setTransform(1, 0, 0, 1, 0, 0); lb.clearRect(0, 0, W, H); drawItems(lb, ch.keep, t); grainMask(lb);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(LA, 0, 0); g.drawImage(LB, 0, 0); g.restore();
  const h = handState(ch, t); if (h) drawHand(h, t);
}
