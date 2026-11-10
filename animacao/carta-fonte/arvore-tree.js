// tree.js: uma árvore desenhada a lápis (grafite), balançando ao vento. Sem texto, sem cor, só risco no papel.
(() => {
  const GR = '#48474D', GRL = '#8C8B91', GRD = '#2E2D33';
  const GX = 960, GY = 905;
  const ENV = [[0, 0], [3.7, .05], [4.5, .35], [5.6, 1], [6.9, .75], [8.0, .18], [9.5, .04]];
  const env = t => kf(t, ENV, ease);
  const sway = (t, d) => { const tt = t - d * .1; return env(tt) * (.6 + .4 * Math.sin(tt * 5.2 - d * .5)) + .022 * Math.sin(t * 1.4 + d * .8); };

  // ---- estrutura fixa da árvore ----
  const NODES = [];
  (function build(depth, len, w, rel, parent) {
    const id = NODES.length, n = { id, depth, len, w, rel, parent }; NODES.push(n);
    if (depth >= 5) return;
    const h = k => hash(id * 7.3 + k);
    const rels = depth === 0 ? [-.6, .52, .05] : depth === 1 ? [-.68, .6, .03] : [-.42 - .3 * h(1), .42 + .3 * h(2)];
    rels.forEach((r, i) => {
      const cont = Math.abs(r) < .1;
      build(depth + 1, len * (cont ? .9 : .66 + .16 * h(i + 3)), w * (cont ? .8 : .58), r + (cont ? .0 : .1 * (h(i + 9) - .5)), id);
    });
  })(0, 205, 62, 0, -1);
  const TIPS = NODES.filter(n => n.depth === 5).map(n => n.id);
  const SHADE = NODES.filter(n => n.depth === 3 && n.id % 2 === 0).map(n => n.id);

  function layout(t) {
    const P = [];
    for (const n of NODES) {
      const par = n.parent < 0 ? null : P[n.parent];
      const x0 = par ? par.x1 : GX, y0 = par ? par.y1 : GY;
      const a = (par ? par.a : 0) + n.rel + sway(t, n.depth) * (.05 + .02 * n.depth);
      const g = ease(seg(t, .3 + n.depth * .3, .3 + n.depth * .3 + .6)), L = n.len * g;
      P.push({ x0, y0, a, g, x1: x0 + Math.sin(a) * L, y1: y0 - Math.cos(a) * L });
    }
    return P;
  }

  // ---- peças ----
  function ground(t) {
    boilSeed('ground');
    const k = ease(seg(t, .05, 1.1));
    for (let i = 0; i < 6; i++) {
      const y = GY + 4 + i * 7 + 4 * hash(i), xa = 250 + 90 * hash(i + 3), xb = lerp(xa, 1670 - 80 * hash(i + 6), k);
      if (xb - xa < 30) continue;
      const P = []; for (let s = 0; s <= 6; s++) P.push([lerp(xa, xb, s / 6), y + jit(2.2)]);
      inkLine(P, i ? .5 : .8, i ? GRL : GR, '2B', .5);
    }
    boilSeed('shadow');
    const sh = ease(seg(t, .8, 2.2));
    if (sh > .05) paint(ellPts(GX + 40, GY + 20, 300 * sh, 26 * sh, 22, 3), { hatch: { d: 11, a: 4, o: { rand: .25 }, b: '2B', c: GRL, w: .45 }, ink: null });
  }
  function grass(t) {
    for (let i = 0; i < 46; i++) {
      boilSeed('g' + i);
      const x = 260 + hash(i + 50) * 1400, y = GY + 14 + 26 * hash(i + 80), gr = ease(seg(t, .6 + 1.2 * hash(i), 1.5 + 1.2 * hash(i)));
      if (gr < .05) continue;
      const lean = env(t + .45) * (26 + 20 * hash(i + 3)) * (.6 + .4 * Math.sin(t * 6 + i)) + 3 * Math.sin(t * 1.5 + i);
      for (const s of [-1, 0, 1]) {
        const h = (20 + 18 * hash(i * 3 + s + 20)) * gr, bx = x + s * 6;
        inkLine([[bx, y], [bx + lean * .35 + s * 3, y - h * .55], [bx + lean + s * 6, y - h]], .6, GR, '2B', .5);
      }
    }
  }
  function branch(n, p, t) {
    if (p.g < .03) return;
    boilSeed('b' + n.id);
    const w0 = n.w * (.4 + .6 * p.g), w1 = w0 * .62, dx = p.x1 - p.x0, dy = p.y1 - p.y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const mx = p.x0 + dx / 2 + nx * 3 * (hash(n.id) - .5), my = p.y0 + dy / 2 + ny * 3 * (hash(n.id) - .5);
    const edge = (o, wa, wb, sw, col) => inkLine([[p.x0 + nx * wa * o, p.y0 + ny * wa * o], [mx + nx * (wa + wb) / 2 * o, my + ny * (wa + wb) / 2 * o], [p.x1 + nx * wb * o, p.y1 + ny * wb * o]], sw, col, '2B', .5);
    if (n.depth <= 3) {
      const sw = [1.5, 1.3, 1.05, .85][n.depth];
      edge(.5, w0, w1, sw, GR); edge(-.5, w0, w1, sw, GR);
      if (n.depth <= 2) { boilSeed('bk' + n.id); for (const o of [-.22, .08, .3]) edge(o, w0, w1 * .9, .5, GRL); }   // riscos da casca
      if (n.depth <= 1) edge(.38, w0 * .95, w1 * .95, .85, GRD);                                                 // lado da sombra mais escuro
    } else {
      inkLine([[p.x0, p.y0], [mx, my], [p.x1, p.y1]], n.depth === 4 ? .85 : .65, GR, '2B', .4);
    }
  }
  function cluster(x, y, r, id, prog, col = GR) {
    const N = Math.round(34 * prog); if (N < 4 || r < 4) return;
    boilSeed('c' + id);
    const P = [], ph = hash(id) * 6;
    for (let i = 0; i < N; i++) { const a = ph + i * .92, rad = r * (.28 + .72 * ((i % 11) / 10)) * (.8 + .4 * hash(id * 3 + i)); P.push([x + Math.cos(a) * rad * 1.1 + jit(2), y + Math.sin(a) * rad * .85 + jit(2)]); }
    inkLine(P, .62, col, '2B', .6);
  }
  function leaf(x, y, rot, s, id) {
    boilSeed('l' + id);
    push(); translate(x, y); rotate(rot);
    paint([[-s, 0], [-s * .4, -s * .4], [s * .45, -s * .36], [s, 0], [s * .45, s * .36], [-s * .4, s * .4]], { wash: '#E6DECD', ink: GR, br: '2B', sw: .8, curv: .5 });
    inkLine([[-s * .85, 0], [0, -s * .04], [s * .8, 0]], .45, GRL, '2B', .4);
    pop();
  }
  const NFALL = 18;
  const fall = k => {
    const i = TIPS[Math.floor(hash(k * 5.3 + 1) * TIPS.length)], tr = 4.9 + 2.9 * hash(k + 40) * hash(k + 41) * 1.6 + .1 * k;
    return { i, tr: Math.min(tr, 7.6), yg: GY + 20 + 70 * hash(k + 9) };
  };
  const leafAt = (a, L, k, P0) => {
    const ax = a, x = P0.x1 + 120 * ax * Math.min(1, ax * 1.3) + 38 * Math.sin(ax * 3.4 + k), y = P0.y1 + 150 * ax + 34 * ax * ax;
    return [x, y];
  };

  function shotTree(t, lt, dur) {
    const cam = [960 + 12 * Math.sin(t * .35), 540 + 5 * Math.sin(t * .27)];
    camBegin(cam[0], cam[1], 1 + .008 * t);
    const P = layout(t);
    ground(t); grass(t);
    // sombra a hachura sob a copa
    const sh = ease(seg(t, 2.1, 3.6));
    if (sh > .02) for (const id of SHADE) { boilSeed('s' + id); const p = P[id]; paint(ellPts(p.x1 + 8, p.y1 + 14, 95 * sh, 70 * sh, 14, 5), { hatch: { d: 11, a: -38, o: { rand: .25 }, b: 'HB', c: GRL, w: .6 }, ink: null }); }
    for (const n of NODES) branch(n, P[n.id], t);
    // copa rabiscada
    const gone = new Set(), F = [];
    for (let k = 0; k < NFALL; k++) { const f = fall(k); F.push(f); }
    for (const id of TIPS) {
      const p = P[id], pr = ease(seg(t, 2.0 + 1.5 * hash(id), 2.9 + 1.5 * hash(id)));
      let r = 54 * (1 + .1 * Math.sin(t * 3 + id));
      const f = F.find(f => f.i === id); if (f) r *= 1 - .45 * ease(seg(t, f.tr, f.tr + .25));
      cluster(p.x1, p.y1 - 6, r, id, pr);
    }
    // folhas que caem
    for (let k = 0; k < NFALL; k++) {
      const f = F[k], a = t - f.tr; if (a < 0) continue;
      const P0 = layout(f.tr)[f.i]; let al = 6, pos;
      for (let s = 0; s < 300; s++) { const q = leafAt(s * .02, f, k, P0); if (q[1] >= f.yg) { al = s * .02; break; } }
      pos = leafAt(Math.min(a, al), f, k, P0);
      const fl = a < al ? Math.sin(a * 5 + k) * 1.0 : 0, rest = (hash(k + 17) - .5) * 2.4;
      leaf(pos[0], pos[1], a < al ? fl + a * .5 : rest, 20 + 5 * hash(k + 5), k);
    }
    camEnd();
    // entra e sai do papel em branco
    boilSeed('fade');
    if (lt < .3) paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.paper, washOp: 255 * (1 - ease(lt / .3)), ink: null });
    if (lt > dur - .8) paint(rectPts(-60, -60, W + 120, H + 120), { wash: PAL.paper, washOp: 255 * ease((lt - (dur - .8)) / .75), ink: null });
  }
  shots([[0, shotTree]]);
})();
