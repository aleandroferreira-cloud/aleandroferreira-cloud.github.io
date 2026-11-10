// carta.js: "A carta que cruza o mapa", 65 s, 9:16. Um envelope com carinha viaja do exterior até o Brasil
// enquanto a locução explica a contribuição facultativa ao INSS. Cada cena é amarrada ao tempo da fala (WORDS).
(() => {
  const SEA = '#CFE3DF', SEA2 = '#A9CDCB', WAVE = '#6E9E9E', LAND1 = '#C9D493', LAND2 = '#A9C47E', CREAM = '#FFF5E2';
  const CLAY = '#D97757', CLAYDK = '#A84D33', OCH = '#E8AA38', GOLD = '#F4C95D', ROSE = '#E27A92', PINK = '#F2B5C0';
  const INK = PAL.ink, CX = W / 2;
  const FA = 800, FC = 1660, FD = 2520, FE = 3290, FEND = 4470;   // onde o envelope pisa em cada cena
  const smooth = (t, a, b) => ease(seg(t, a, b));
  const U = 32;

  // ---------------- câmera ----------------
  const CAMK = [[0, 700], [7.5, 700], [9.5, 770], [14.4, 770], [16.2, 1560], [26.4, 1560], [27.8, 2420], [37.0, 2420], [38.0, 3140], [45.0, 3140]];
  const ZK = [[0, 1], [7.9, 1], [10.5, 1.2], [12.6, 1.2], [14.6, 1], [41.4, 1], [43, 1.07], [44.8, 1.07], [46, 1], [59.6, 1], [61.2, 1.1], [62.6, 1.1], [63.6, 1.1]];
  function camY(t) {
    if (t <= 45) return kf(t, CAMK);
    const f = Math.min(envPose(t).y + 120, 4380);
    return lerp(3140, f, smooth(t, 45, 46.6));
  }

  // ---------------- envelope: onde está e o que faz ----------------
  const LANDS = [2.15, 11.46, 14.35, 16.0, 27.7, 38.0];   // pousos e batidas que fazem o corpo sacudir
  const HOPS = [[14.7, 16.0, FA, FC], [26.6, 27.7, FC, FD], [36.9, 38.0, FD, FE]];
  const FLY = [45.2, 60.9];
  const flyP = t => kf(t, [[45.2, 0], [46.6, .06], [52, .55], [58.4, .93], [60.9, 1]], x => x);
  function envPose(t) {
    let x = CX, y = FA, rot = 0, sq = 0, s = backOut(seg(t, 1.55, 2.15)), walk = 0;
    for (const [a, b, y0, y1] of HOPS) {
      if (t < a) { if (y === FA && a !== 14.7) { } break; }
      const p = seg(t, a, b);
      y = lerp(y0, y1, ease(p)) - 130 * Math.sin(Math.PI * p);
      if (t >= b) y = y1;
      if (p > 0 && p < 1) { rot = .18 * Math.sin(p * TAU); sq -= .12 * Math.sin(Math.PI * p); walk = p * 2; }
    }
    for (const [a] of HOPS) if (t > a - .14 && t < a) sq += .2 * ease(seg(t, a - .14, a));
    if (t < 14.7) y = FA; else if (t >= 14.7 && t < 26.6 && t >= 16) y = FC; else if (t >= 27.7 && t < 36.9) y = FD; else if (t >= 38) y = FE;
    for (const e of LANDS) sq += .26 * spring(t, e, 7, 22);
    sq += .035 * Math.sin(t * 3.1);
    if (t >= FLY[0]) {
      const p = flyP(t), dx = Math.cos(p * TAU * 1.25) * 250 * (1 - p) * TAU * 1.25 * .3;
      x = CX + 250 * Math.sin(p * TAU * 1.25) * (1 - p);
      y = lerp(FE, FEND, p);
      rot = .5 * Math.atan2(dx, 300) + TAU * smooth(t, 48, 49.3) * 1;
      sq = -.05 + .05 * Math.sin(t * 9);
      if (t > 59.6) rot *= 1 - smooth(t, 59.6, 60.8);
      if (t > 60.95) { s = 1 - smooth(t, 60.95, 61.3); y += 36 * smooth(t, 60.95, 61.3); }
    }
    return { x, y, rot, sq, s, walk };
  }
  const LOOK = [[0, 0], [3, .4], [4.5, -.4], [5, 0], [16, 0], [17.3, -.9], [22.3, -.9], [22.9, .9], [26.2, .9], [26.8, 0], [32.7, 0], [33.3, .9], [34, -.9], [34.8, .9], [35.6, -.9], [36.4, 0], [45, 0], [48, .4], [52, -.3], [58, .3], [60, 0]];
  function mood(t) {
    let m = 'n';
    if (t >= 4.9 && t < 7.9) m = 'w';
    if (t >= 11.5 && t < 12.7) m = 'h';
    if (t >= 14.3 && t < 15.6) m = 'h';
    if (t >= 29.2 && t < 31.6) m = 'w';
    if (t >= 32.8 && t < 36.9) m = 'w';
    if (t >= 40.2 && t < 41.6) m = 'h';
    if (t >= 41.8 && t < 45) m = 'w';
    if (t >= 45) m = 'h';
    return m;
  }
  function arms(t) {
    let aL = -.3 + .1 * Math.sin(t * 2.2), aR = -.3 + .1 * Math.sin(t * 2.2 + 1.4);
    if (t >= 12.7 && t < 14.8) { aL = -.2; aR = lerp(-.3, 1.0, smooth(t, 12.7, 13.2)) + .15 * Math.sin(t * 8); }   // "por conta própria": um braço levantado
    if (t >= 41.8 && t < 45) { const a = smooth(t, 41.8, 42.3); aL = lerp(aL, 1.05 + .18 * Math.sin(t * 9), a); aR = lerp(aR, 1.05 + .18 * Math.sin(t * 9 + 2), a); }
    if (t >= 45) { aL = .9 + .3 * Math.sin(t * 7); aR = .9 + .3 * Math.sin(t * 7 + 1.7); }
    if (t >= 61.3) { aL = 1.2; aR = 1.2; }
    return [aL, aR];
  }

  // ---------------- peças desenhadas ----------------
  function blob(cx, cy, rx, ry, seed, n = 40, k = 1) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, r = (1 + .13 * Math.sin(3 * a + seed) + .08 * Math.sin(5 * a + seed * 2) + .05 * Math.sin(9 * a + seed * 3)) * k;
      p.push([cx + Math.cos(a) * rx * r + jit(1.5), cy + Math.sin(a) * ry * r + jit(1.5)]);
    }
    return p;
  }
  function cakeIcon(x, y, s, flame, id) {
    boilSeed('cake' + id);
    paint(rrPts(x - s * .5, y - s * .45, s, s * .45, s * .06, s * .01), { wash: PINK, ink: INK, sw: s / 60 });
    paint(rrPts(x - s * .36, y - s * .8, s * .72, s * .35, s * .06, s * .01), { wash: CREAM, ink: INK, sw: s / 60 });
    inkLine([[x - s * .36, y - s * .62], [x - s * .1, y - s * .55], [x + s * .16, y - s * .62], [x + s * .36, y - s * .56]], s / 90, ROSE, 'inkfine', .5);
    inkLine([[x, y - s * .8], [x, y - s * 1]], s / 55, INK, 'ink', 0);
    if (flame > 0) paint(ellPts(x, y - s * 1.1, s * .08 * flame, s * .14 * flame, 8, 0), { wash: '#FFC857', ink: INK, sw: s / 90 });
  }
  function clockIcon(x, y, s, t, id) {
    boilSeed('clk' + id);
    paint(ellPts(x, y, s * .5, s * .5, 26, s * .01), { wash: CREAM, ink: INK, sw: s / 50 });
    const a = t * .5;
    inkLine([[x, y], [x + Math.sin(a) * s * .3, y - Math.cos(a) * s * .3]], s / 40, INK, 'ink', 0);
    inkLine([[x, y], [x + Math.sin(a * 12) * s * .2, y - Math.cos(a * 12) * s * .2]], s / 55, INK, 'ink', 0);
    for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2; inkLine([[x + Math.sin(b) * s * .4, y - Math.cos(b) * s * .4], [x + Math.sin(b) * s * .46, y - Math.cos(b) * s * .46]], s / 70, INK, 'ink', 0); }
  }
  function envelope(x, y, u, o = {}) {
    if (o.s <= .02) return;
    const sw = u / 24, m = o.mood || 'n', look = o.look || 0;
    boilSeed('env');
    push(); translate(x, y); rotate(o.rot || 0); scale((o.s ?? 1) * (1 + (o.sq || 0) * .5), (o.s ?? 1) * (1 - (o.sq || 0)));
    for (const sd of [-1, 1]) { const sp = Math.sin((o.walk || 0) * TAU + (sd > 0 ? Math.PI : 0)) * u * .5; inkLine([[sd * 2 * u, -2.3 * u], [sd * 2 * u + sp * .3, -1.1 * u], [sd * 2 * u + sp, 0]], sw * 1.5, INK, 'ink', .4); paint(ellPts(sd * 2 * u + sp, 0, .75 * u, .3 * u, 10, 0), { wash: CLAYDK, ink: INK, sw: sw * .7 }); }
    const [aL, aR] = o.arms || [-.3, -.3];
    for (const [sd, a] of [[-1, aL], [1, aR]]) { const bx = sd * 5 * u, by = -5.6 * u; inkLine([[bx, by], [bx + sd * Math.cos(a) * 1.2 * u, by - Math.sin(a) * 1.2 * u + .2 * u], [bx + sd * Math.cos(a) * 2.4 * u, by - Math.sin(a) * 2.4 * u]], sw * 1.5, INK, 'ink', .5); }
    paint(rrPts(-5 * u, -9.6 * u, 10 * u, 7.5 * u, .7 * u, u * .05), { wash: CREAM, ink: INK, sw: sw * 1.15 });
    inkLine([[-5 * u, -9.4 * u], [-2.5 * u, -7.4 * u], [0, -5.7 * u], [2.5 * u, -7.4 * u], [5 * u, -9.4 * u]], sw, INK, 'inkfine', .3);
    inkLine([[-4.9 * u, -2.3 * u], [-1.9 * u, -5 * u]], sw * .6, '#8C8B91', 'inkfine', .3);
    inkLine([[4.9 * u, -2.3 * u], [1.9 * u, -5 * u]], sw * .6, '#8C8B91', 'inkfine', .3);
    if (o.stamp) {
      paint(rectPts(2.4 * u, -9.2 * u, 2.2 * u, 2.5 * u, u * .04), { wash: o.stamp === 'blank' ? ROSE : CREAM, ink: INK, sw: sw * .8 });
      if (o.stamp === 'blank') paint(ellPts(3.5 * u, -7.95 * u, .6 * u, .6 * u, 12, 0), { wash: OCH, ink: null });
      else { cakeIcon(3.5 * u, -7.2 * u, 1.6 * u, 0, 'es'); }
    }
    const ey = -4.1 * u, blink = m === 'n' && ((t => t - Math.floor(t))(T * .43 + 3)) < .04;
    for (const sd of [-1, 1]) {
      const ex = sd * 1.8 * u;
      if (m === 'h') inkLine([[ex - .55 * u, ey + .1 * u], [ex, ey - .42 * u], [ex + .55 * u, ey + .1 * u]], sw * 1.4, INK, 'ink', .6);
      else if (blink) inkLine([[ex - .5 * u, ey], [ex + .5 * u, ey]], sw * 1.2, INK, 'ink', 0);
      else {
        paint(ellPts(ex, ey, .55 * u, .75 * u, 12, 0), { wash: CREAM, ink: INK, sw: sw });
        paint(ellPts(ex + look * .22 * u, ey + (o.lookY || 0) * .2 * u, .27 * u, .34 * u, 10, 0), { wash: INK, ink: null });
      }
      if (m === 'w') inkLine([[ex - sd * .7 * u, ey - 1.15 * u + sd * .0], [ex + sd * .7 * u, ey - 1.45 * u]], sw * 1.2, INK, 'ink', 0);
    }
    if (m === 'h') inkLine([[-.8 * u, -3 * u], [0, -2.45 * u], [.8 * u, -3 * u]], sw * 1.2, INK, 'ink', .6);
    else if (m === 'w') inkLine([[-.7 * u, -2.55 * u], [0, -2.9 * u], [.7 * u, -2.55 * u]], sw * 1.1, INK, 'ink', .6);
    else inkLine([[-.5 * u, -2.8 * u], [.5 * u, -2.8 * u]], sw * 1.0, INK, 'ink', .3);
    pop();
  }
  function coin(x, y, r, k, id) {
    if (k <= .02) return;
    boilSeed('coin' + id); const rr = r * k, th = r * .5;
    paint(rrPts(x - rr, y - th, rr * 2, th, rr * .18, .6), { wash: mixCol(OCH, CLAYDK, .3), ink: INK, sw: .7 });
    paint(ellPts(x, y - th, rr, rr * .34, 18, .6), { wash: GOLD, ink: INK, sw: .8 });
    inkLine([[x - rr * .45, y - th], [x, y - th - rr * .16], [x + rr * .45, y - th]], .4, CLAYDK, 'inkfine', .5);
  }
  // números desenhados a lápis, sem fonte
  const GL = {
    '0': (() => { const p = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU; p.push([.5 + Math.cos(a) * .42, .8 + Math.sin(a) * .78]); } return [p]; })(),
    '1': [[[.2, .35], [.6, 0], [.6, 1.6]]],
    '2': [[[.08, .38], [.25, .08], [.62, 0], [.88, .3], [.75, .7], [.1, 1.55], [.92, 1.55]]],
    '5': [[[.85, .05], [.18, .05], [.12, .75], [.55, .62], [.9, .95], [.82, 1.4], [.5, 1.58], [.1, 1.45]]],
    '%': [[[.1, 1.55], [.5, .8], [.9, .05]], (() => { const p = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU; p.push([.2 + Math.cos(a) * .17, .3 + Math.sin(a) * .17]); } return p; })(), (() => { const p = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU; p.push([.8 + Math.cos(a) * .17, 1.3 + Math.sin(a) * .17]); } return p; })()]
  };
  function digits(str, cx, y, h, col, sw, prog, id) {
    const k = h / 1.6, adv = 1.05 * k, x0 = cx - adv * str.length / 2;
    let n = 0, total = 0; for (const ch of str) total += GL[ch].length;
    for (let i = 0; i < str.length; i++) for (const pl of GL[str[i]]) {
      const q = clamp(prog * total - n); n++;
      if (q <= 0) continue;
      const m = Math.max(2, Math.ceil(pl.length * q)), P = pl.slice(0, m).map(([a, b]) => [x0 + i * adv + a * k + jit(1.2), y + b * k + jit(1.2)]);
      if (P.length < 2) continue;
      boilSeed('dg' + id + i + n);
      inkLine(P, sw, col, 'ink', .5);
    }
  }
  function sparkle(x, y, r, k) { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .6), .25, 4, k * 2), { wash: CREAM, washOp: 255 * (1 - k * k), ink: null }); }
  function stampTool(x, y, rot, id) {   // (x, y) = base da carimbadeira
    boilSeed('stp' + id); push(); translate(x, y); rotate(rot);
    paint(rrPts(-70, -34, 140, 34, 10, 1), { wash: CLAYDK, ink: INK, sw: 1 });
    paint(rrPts(-26, -128, 52, 96, 20, 1), { wash: CLAY, ink: INK, sw: 1 });
    paint(ellPts(0, -148, 36, 28, 16, 1), { wash: CLAYDK, ink: INK, sw: 1 });
    pop();
  }
  function burst(x, y, k, n = 9, r = 70) { if (k <= 0 || k >= 1) return; for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, d = r * easeOut(k); inkLine([[x + Math.cos(a) * d * .55, y + Math.sin(a) * d * .55], [x + Math.cos(a) * d, y + Math.sin(a) * d]], 1.2 * (1 - k), INK, 'ink', 0); } }

  // ---------------- cenário ----------------
  function sea(t, cy) {
    // fundo do mar com p5 puro (barato); o resto do desenho usa o pincel
    push(); noStroke(); fill(207, 227, 223, 215); rect(-300, cy - 1300, W + 600, 2600);
    const bi = Math.round(cy / 520);
    for (let i = -2; i <= 2; i++) { const yy = (bi + i) * 520 + 140 * hash(bi + i + 7), xx = 180 + 700 * hash(bi + i + 3); fill(169, 205, 203, 38); ellipse(xx, yy, 760, 300); ellipse(xx + 90, yy + 30, 460, 180); }
    pop();
    for (let i = 0; i < 130; i++) {
      const wx = 50 + hash(i) * (W - 100), wy = 150 + hash(i + 500) * 4900;
      if (Math.abs(wy - cy) > 1000) continue;
      const ph = Math.sin(t * 1.6 + i) * 3; boilSeed('w' + i);
      inkLine([[wx - 18, wy + ph], [wx - 6, wy - 7 + ph], [wx + 6, wy + ph], [wx + 18, wy - 7 + ph]], .45, WAVE, 'inkfine', .6);
    }
  }
  function lands(t, cy) {
    if (cy < 1700) {   // terra do exterior, pintada no começo
      const k = ease(seg(t, .15, 2.4));
      if (k > .02) {
        boilSeed('land1');
        paint(blob(CX, 700, 450 * k, 250 * k, 1.3, 44), { wash: LAND1, ink: INK, sw: 1.1, curv: .5 });
        boilSeed('land1b'); paint(blob(CX + 40, 725, 340 * k, 170 * k, 2.2, 36), { wash: LAND2, washOp: 110, ink: null });
        if (k > .6) {
          for (let i = 0; i < 5; i++) {   // casinhas e árvores
            const hx = 280 + i * 115 + 30 * hash(i), hy = 640 + 70 * hash(i + 4), q = ease(seg(k, .6 + i * .06, 1));
            boilSeed('hs' + i);
            if (i % 2) { paint(rectPts(hx - 28, hy - 44 * q, 56, 44 * q, 1), { wash: CREAM, ink: INK, sw: .8 }); paint([[hx - 36, hy - 44 * q], [hx, hy - 78 * q], [hx + 36, hy - 44 * q]], { wash: CLAY, ink: INK, sw: .8 }); }
            else { inkLine([[hx, hy], [hx, hy - 40 * q]], 1.4, CLAYDK, 'ink', 0); paint(ellPts(hx, hy - 56 * q, 30 * q, 28 * q, 12, 2), { wash: '#8FB36B', ink: INK, sw: .7 }); }
          }
        }
      }
    }
    if (cy > 3500) {   // Brasil, com a prédio e a caixa de correio
      boilSeed('land2');
      paint(blob(CX, 4730, 600, 400, 4.1, 44), { wash: LAND2, ink: INK, sw: 1.1, curv: .5 });
      boilSeed('land2b'); paint(blob(CX - 50, 4790, 440, 270, 5.2, 36), { wash: LAND1, washOp: 110, ink: null });
      boilSeed('bld');
      paint(rectPts(200, 4640, 680, 20, 1), { wash: '#E4D6B4', ink: INK, sw: .9 });
      paint(rectPts(240, 4620, 600, 20, 1), { wash: '#EADCB8', ink: INK, sw: .9 });
      paint(rectPts(250, 4430, 580, 30, 1), { wash: '#EADCB8', ink: INK, sw: .9 });
      paint([[230, 4430], [540, 4318], [850, 4430]], { wash: '#EFE3C4', ink: INK, sw: 1 });
      paint(ellPts(540, 4395, 24, 24, 16, 0), { wash: CREAM, ink: INK, sw: .7 });
      for (const [i, cx2] of [330, 450, 630, 750].entries()) { boilSeed('col' + i); paint(rectPts(cx2 - 20, 4460, 40, 160, 1), { wash: '#F3EAD0', ink: INK, sw: .9 }); }
      paint(rrPts(505, 4530, 70, 90, 30, 1), { wash: '#6B5A4E', ink: INK, sw: .9 });
    }
  }
  function mailbox(t) {
    boilSeed('mbx');
    paint(rectPts(526, 4640, 28, 68, 1), { wash: '#7B6A5C', ink: INK, sw: .9 });
    const fl = -1.5 * backOut(seg(t, 61.35, 61.75));
    push(); translate(604, 4545); rotate(fl); paint(rectPts(0, -70, 12, 74, .6), { wash: ROSE, ink: INK, sw: .8 }); paint(rectPts(-4, -86, 34, 22, .6), { wash: ROSE, ink: INK, sw: .8 }); pop();
    paint(rrPts(470, 4520, 130, 120, 48, 1), { wash: CLAY, ink: INK, sw: 1.1 });
    inkLine([[495, 4540], [575, 4540]], 1.6, INK, 'ink', 0);
    inkLine([[490, 4585], [540, 4575], [585, 4585]], .6, CLAYDK, 'inkfine', .4);
  }
  function route(t) {
    // pontilhado que aparece por onde o envelope já passou
    const stops = [[FA, FC, 14.7, 16.0], [FC, FD, 26.6, 27.7], [FD, FE, 36.9, 38.0]];
    for (const [y0, y1, a, b] of stops) {
      const q = seg(t, a, b); if (q <= 0) continue;
      for (let i = 0; i < 18; i++) { const f = i / 17; if (f > q) break; const y = lerp(y0 + 10, y1, f); boilSeed('rt' + y0 + i); paint(ellPts(CX + 38 * Math.sin(f * 7) * (1 - f * .5), y, 4, 4, 6, 0), { wash: '#6E5D80', ink: null, washOp: 170 }); }
    }
  }

  // ---------------- cenas ----------------
  function sceneCoins(t) {
    if (t < 14.8 || t > 28.5) return;
    const base = 1770, th = 17, r = 62, xl = 250, xr = 830;
    boilSeed('ground1');
    for (const x of [xl, xr]) paint(ellPts(x, base + 4, 100, 20, 20, 2), { wash: '#C9BFA3', washOp: 140, ink: null });
    const kLine = (y, a, id) => { const q = ease(seg(t, a, a + .5)); if (q <= 0) return; boilSeed(id); const P = []; for (let i = 0; i <= 10; i++) if (i / 10 <= q) P.push([lerp(60, 1020, i / 10), y + jit(1.2)]); if (P.length > 2) for (let i = 0; i < P.length - 1; i += 2) inkLine([P[i], P[i + 1]], .6, '#6E5D80', 'inkfine', 0); };
    kLine(base - 2 * th - 6, 20.5, 'lnmin'); kLine(base - 8 * th - 10, 21.6, 'lntop');
    for (let i = 0; i < 8; i++) { const a = 17.9 + i * .5, k = backOut(seg(t, a, a + .18)); coin(xl, base - i * th, r, k, 'L' + i); }
    for (let i = 0; i < 2; i++) { const a = 23.05 + i * .5, k = backOut(seg(t, a, a + .18)); coin(xr, base - i * th, r, k, 'R' + i); }
    digits('20%', xl, base - 8 * th - 150, 100, CLAYDK, 3.2, seg(t, 17.6, 18.3), 'a');
    digits('11%', xr, base - 2 * th - 150, 100, CLAYDK, 3.2, seg(t, 22.8, 23.5), 'b');
    // a moeda que cai no envelope ("por conta própria")
    const ep = envPose(t);
  }
  function sceneFork(t) {
    if (t < 26.5 || t > 38.8) return;
    const padY = 2700, xl = 235, xr = 845, e = envPose(t);
    const k0 = backOut(seg(t, 26.7, 27.3)), k1 = backOut(seg(t, 27.4, 28));
    for (const [x, kk, id] of [[xl, k0, 'fl'], [xr, k1, 'fr']]) {   // trilhas pontilhadas até cada destino
      for (let i = 1; i < 9; i++) { const f = i / 9 * kk; boilSeed('ft' + id + i); paint(ellPts(lerp(CX, x, f), lerp(2560, padY - 90, f), 4, 4, 6, 0), { wash: '#6E5D80', ink: null, washOp: 170 }); }
    }
    if (k0 > .05) { boilSeed('padL'); paint(ellPts(xl, padY + 20, 150 * k0, 40 * k0, 20, 2), { wash: '#E4D6B4', ink: INK, sw: .8 }); clockIcon(xl - 62, padY - 20, 104 * k0, t, 'L'); cakeIcon(xl + 66, padY + 12, 92 * k0, 1 + .2 * Math.sin(t * 11), 'L'); }
    if (k1 > .05) {
      boilSeed('padR'); paint(ellPts(xr, padY + 20, 150 * k1, 40 * k1, 20, 2), { wash: '#E4D6B4', ink: INK, sw: .8 });
      const ghost = 1 - ease(seg(t, 29.3, 29.6));
      boilSeed('ghostclk');
      if (t < 29.9) { for (let i = 0; i < 22; i += 2) { const a1 = i / 22 * TAU, a2 = (i + 1) / 22 * TAU, cx2 = xr - 62, cy2 = padY - 20; inkLine([[cx2 + Math.cos(a1) * 52, cy2 + Math.sin(a1) * 52], [cx2 + Math.cos(a2) * 52, cy2 + Math.sin(a2) * 52]], .8, '#8C8B91', 'inkfine', 0); } inkLine([[xr - 62, padY - 20], [xr - 62, padY - 52]], .8, '#8C8B91', 'inkfine', 0); }
      const q = seg(t, 29.4, 30.1);
      if (q > 0) { boilSeed('xx'); const cx2 = xr - 62, cy2 = padY - 20, m = q < .5 ? q * 2 : 1; inkLine([[cx2 - 54, cy2 - 54], [lerp(cx2 - 54, cx2 + 54, m), lerp(cy2 - 54, cy2 + 54, m)]], 3.4, CLAYDK, 'ink', 0); if (q > .5) inkLine([[cx2 + 54, cy2 - 54], [lerp(cx2 + 54, cx2 - 54, (q - .5) * 2), lerp(cy2 - 54, cy2 + 54, (q - .5) * 2)]], 3.4, CLAYDK, 'ink', 0); }
      const ck = backOut(seg(t, 31.7, 32.1)); if (ck > .02) cakeIcon(xr + 66, padY + 12, 92 * ck, ck, 'R');
    }
  }
  function sceneCalendar(t) {
    if (t < 37.2 || t > 46) return;
    const cx = CX, cy = 2690, w = 560, h = 560, popk = backOut(seg(t, 37.3, 37.9));
    const page = (ox, oy, hdr, big, id, prog) => {
      boilSeed('cal' + id);
      paint(rrPts(ox - w / 2, oy - h / 2, w, h, 24, 2), { wash: CREAM, ink: INK, sw: 1.2 });
      paint(rrPts(ox - w / 2, oy - h / 2, w, 90, 24, 1), { wash: hdr, ink: INK, sw: 1.1 });
      for (const sx of [-1, 1]) paint(ellPts(ox + sx * 120, oy - h / 2 + 2, 11, 16, 10, 0), { wash: INK, ink: null });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const gx = ox - 200 + c * 100, gy = oy - h / 2 + 150 + r * 100; if (big && r === 1 && c === 2) continue; inkLine([[gx - 14, gy], [gx + 14, gy + jit(1)]], 1.2, '#8C8B91', 'inkfine', 0); }
      if (big) { digits('15', ox, oy - 40, 120, CLAYDK, 3.6, prog, 'cal'); }
    };
    push(); translate(cx, cy); scale(popk); translate(-cx, -cy);
    page(cx, cy + 6, OCH, false, 'n', 0);
    const flip = smooth(t, 40.5, 41.1), gone = t > 41.2;
    if (!gone) {
      push(); translate(cx - w / 2, cy - h / 2 + 8); rotate(-1.35 * flip); translate(-(cx - w / 2), -(cy - h / 2 + 8));
      push(); translate(0, 160 * flip * flip); page(cx, cy, CLAY, true, 'm', seg(t, 38.7, 39.8)); pop(); pop();
    }
    pop();
    // o carimbo que bate no dia 15
    if (t > 39.0 && t < 40.9) {
      const lift = t < 39.9 ? 300 * (1 - easeOut(seg(t, 39.2, 39.9))) : 320 * smooth(t, 40.1, 40.7), hit = t >= 39.9 && t < 40.5;
      if (t < 40.5) { stampTool(cx - 8, cy - 40 - lift, 0, 'cal'); }
      if (hit) { boilSeed('ring'); paint(ellPts(cx, cy - 45, 108, 80, 24, 2), { ink: CLAYDK, sw: 2.4, br: 'ink' }); burst(cx, cy - 45, seg(t, 39.9, 40.4), 10, 150); }
    }
  }
  function sceneStampEnvelope(t, e) {
    if (t < 10.5 || t > 12.6) return;
    const spot = [e.x + 3.5 * U, e.y - 7.9 * U], lift = t < 11.46 ? 320 * (1 - easeIn(seg(t, 10.6, 11.46))) : 320 * smooth(t, 11.75, 12.45);
    stampTool(spot[0], spot[1] - lift, 0, 'env');
    burst(spot[0], spot[1], seg(t, 11.46, 11.9), 9, 80);
  }
  function emoteAt(kind, t, a, dur, x, y, s) {
    const k = backOut(seg(t, a, a + .25)) * (1 - seg(t, a + dur - .3, a + dur));
    if (t >= a && t < a + dur && k > .02) emote(kind, x, y, s, k, t - a);
  }

  // ---------------- legenda palavra por palavra ----------------
  let mctx = null;
  const SUBSIZE = 84, SUBGAP = 24, subFont = sz => `800 ${sz}px Inter, "DejaVu Sans", sans-serif`;
  const textW = (txt, sz = SUBSIZE) => { mctx = mctx || document.createElement('canvas').getContext('2d'); mctx.font = subFont(sz); return mctx.measureText(txt).width; };
  const CHUNKS = (() => {
    const out = []; let cur = [], wsum = 0;
    for (let i = 0; i < WORDS.length; i++) {
      const w = WORDS[i], tw = textW(w[2]);
      if (cur.length && (wsum + SUBGAP + tw > 900 || cur.length >= 3)) { out.push(cur); cur = []; wsum = 0; }
      cur.push(w); wsum += (cur.length > 1 ? SUBGAP : 0) + tw;
      const nxt = WORDS[i + 1];
      if (/[.?,]$/.test(w[2]) || (nxt && nxt[0] - w[1] > .45)) { out.push(cur); cur = []; wsum = 0; }
    }
    if (cur.length) out.push(cur);
    return out;
  })();
  function subtitles(t) {
    let ch = null;
    for (let i = 0; i < CHUNKS.length; i++) { const c = CHUNKS[i], a = c[0][0] - .04, nxt = CHUNKS[i + 1], b = Math.min(c[c.length - 1][1] + .28, nxt ? nxt[0][0] - .02 : 1e9); if (t >= a && t < b) { ch = c; break; } }
    if (!ch) return;
    const ws = ch.map(w => textW(w[2])), total = ws.reduce((a, b) => a + b, 0) + SUBGAP * (ch.length - 1), y = 1500;
    let x = CX - total / 2;
    const popk = backOut(seg(t, ch[0][0] - .04, ch[0][0] + .14));
    for (let i = 0; i < ch.length; i++) {
      const w = ch[i], act = t >= w[0] && t < w[1] + .06, sc = act ? 1.07 : 1;
      letter(w[2], x + ws[i] / 2, y + (1 - popk) * 24, SUBSIZE * sc, act ? '#FFD66B' : CREAM, { font: subFont(SUBSIZE * sc), stroke: INK, ink: false, screen: true, rot: act ? -.02 : 0 });
      x += ws[i] + SUBGAP;
    }
  }

  // ---------------- o quadro ----------------
  function carta(t, lt, dur) {
    const sh = [0, 0].map((_, i) => 0);
    let shake = [0, 0];
    for (const [a, amt] of [[11.46, 9], [39.9, 12], [61.0, 8]]) if (t > a && t < a + .5) { const s = shakeXY(t, amt * Math.exp(-(t - a) * 9)); shake = [shake[0] + s[0], shake[1] + s[1]]; }
    const cy = camY(t), z = lerp(1, 1, 0) * kf(t, ZK);
    camBegin(CX + shake[0], cy + shake[1], z);
    const K = window.__skip || {};
    if (!K.sea) sea(t, cy); if (!K.lands) lands(t, cy); if (!K.route) route(t);
    const e = envPose(t), u = U;
    if (!K.scenes) { sceneCoins(t); sceneFork(t); sceneCalendar(t); }
    // moeda que cai dentro do envelope
    if (t > 13.9 && t < 14.5) { const k = seg(t, 13.95, 14.35), p = arcPt([e.x - 220, e.y - 520], [e.x, e.y - 9 * u], 120, easeIn(k)); coin(p[0], p[1], 40 * (1 - smooth(t, 14.33, 14.46)), 1, 'drop'); }
    if (t >= 1.55) {
      // rastro de papel durante o voo
      if (t >= FLY[0] && t < 60.9) { const P = []; for (let k = 8; k >= 0; k--) { const q = envPose(Math.max(FLY[0], t - k * .07)); P.push([q.x, q.y - 5 * u]); } if (Math.hypot(P[0][0] - P[8][0], P[0][1] - P[8][1]) > 10) { boilSeed('trail'); paint(ribbon(P, 4, 40), { wash: CREAM, washOp: 150, ink: null }); } }
      const mo = mood(t), lk = kf(t, LOOK) + .2 * Math.sin(t * 1.3);
      const stamp = t < 11.7 ? null : t < 26.4 ? 'blank' : t < 27.7 ? 'blank' : (t < 32 ? 'cake' : 'cake');
      if (!K.env) envelope(e.x, e.y, u, { rot: e.rot, sq: e.sq, s: e.s, walk: e.walk, mood: mo, look: lk, arms: arms(t), stamp: t >= 11.6 ? 'blank' : null });
    }
    sceneStampEnvelope(t, e);
    if (t > 44) mailbox(t);
    // marcas de emoção por cima
    emoteAt('?', t, 4.95, 1.5, e.x + 1.2 * u, e.y - 11 * u, 40);
    emoteAt('sweat', t, 34.0, 1.6, e.x + 4.6 * u, e.y - 8 * u, 32);
    emoteAt('?', t, 42.15, 1.1, e.x - 3.5 * u, e.y - 12 * u, 40);
    emoteAt('?', t, 43.15, 1.4, e.x + 3.5 * u, e.y - 12.5 * u, 44);
    emoteAt('dots', t, 36.0, 1, e.x + 3 * u, e.y - 11 * u, 30);
    if (t > 61.3) { emote('hearts', 540 - 40, 4440, 54, backOut(seg(t, 61.3, 61.7)) * (1 - seg(t, 64, 65)), t - 61.3); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .4, q = seg(t, 61.05 + i * .02, 61.9); sparkle(540 + Math.cos(a) * 300 * easeOut(q), 4480 + Math.sin(a) * 240 * easeOut(q), 26, q); } }
    camEnd();
    // seta que aponta pro link
    if (t > 55.66 && t < 62.5) {
      const k = backOut(seg(t, 55.66, 56.1)) * (1 - seg(t, 61.8, 62.4)), by = 1772 + 28 * Math.abs(Math.sin((t - 55.66) * 4.6));
      boilSeed('arrow');
      inkLine([[CX, by - 120 * k], [CX + 3, by - 60 * k], [CX, by]], 6, CLAYDK, 'ink', .4);
      inkLine([[CX - 52 * k, by - 52 * k], [CX, by], [CX + 52 * k, by - 52 * k]], 6, CLAYDK, 'ink', .3);
    }
    if (!K.subs) subtitles(t);
    boilSeed('fade');
    if (lt < .45) paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.paper, washOp: 255 * (1 - ease(lt / .45)), ink: null });
    if (lt > dur - 1.5) paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.paper, washOp: 255 * ease((lt - (dur - 1.5)) / 1.4), ink: null });
  }
  shots([[0, carta]]);
})();
