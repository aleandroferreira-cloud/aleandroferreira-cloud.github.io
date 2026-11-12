// corte.js: "Corte de benefício", vídeo de lápis com a voz do Aleandro. Lê o roteiro (script.js) e a fala (words.js).
(() => {
  const PAPER = '#F3EBDC';
  const sceneAt = t => { for (let i = SCRIPT.length - 1; i >= 0; i--) if (t >= SCRIPT[i][0]) return SCRIPT[i]; return SCRIPT[0]; };

  // ---------- legenda ----------
  let mctx = null;
  const SZ = 44, GAP = 14, subFont = s => `600 ${s}px Inter, "DejaVu Sans", sans-serif`;
  const textW = (txt, s = SZ) => { mctx = mctx || document.createElement('canvas').getContext('2d'); mctx.font = subFont(s); return mctx.measureText(txt).width; };
  const CHUNKS = (() => {
    const out = []; let cur = [], w = 0;
    for (let i = 0; i < WORDS.length; i++) {
      const wd = WORDS[i], tw = textW(wd[2]);
      if (cur.length && (w + GAP + tw > 1120 || cur.length >= 6)) { out.push(cur); cur = []; w = 0; }
      cur.push(wd); w += (cur.length > 1 ? GAP : 0) + tw;
      const nx = WORDS[i + 1];
      if (/[.?!]$/.test(wd[2]) || (/,$/.test(wd[2]) && cur.length >= 3) || (nx && nx[0] - wd[1] > .5)) { out.push(cur); cur = []; w = 0; }
    }
    if (cur.length) out.push(cur);
    return out;
  })();
  function subtitles(t) {
    let ch = null;
    for (let i = 0; i < CHUNKS.length; i++) { const c = CHUNKS[i], a = c[0][0] - .05, nx = CHUNKS[i + 1], b = Math.min(c[c.length - 1][1] + .35, nx ? nx[0][0] - .02 : 1e9); if (t >= a && t < b) { ch = c; break; } }
    if (!ch) return;
    const ws = ch.map(w => textW(w[2])), total = ws.reduce((a, b) => a + b, 0) + GAP * (ch.length - 1), y = 648;
    let x = W / 2 - total / 2;
    for (let i = 0; i < ch.length; i++) {
      const w = ch[i], act = t >= w[0] && t < w[1] + .08;
      letter(w[2], x + ws[i] / 2, y, SZ, GR, { font: subFont(SZ), stroke: PAPER, ink: false, screen: true });
      if (act) { boilSeed('ul'); const q = seg(t, w[0], w[0] + Math.max(.15, w[1] - w[0] - .05)); inkLine([[x, y + 26], [x + ws[i] * .5 * q, y + 28 + jit(1)], [x + ws[i] * q, y + 26 + jit(1)]], 1.5, RED, '2B', .4); }
      x += ws[i] + GAP;
    }
  }

  // ---------- cena ----------
  function corte(t, lt0, dur) {
    const sc = sceneAt(t), [t0, t1, items] = sc, lt = t - t0;
    for (const [name, x, y, s, at, o = {}] of items) {
      const d = o.dur ?? (name === 'person' ? 1.5 : 1.0), p = ease(seg(lt, at, at + d));
      if (p <= 0) continue;
      let yy = y, rot = o.rot || 0, oo = o.o ? { ...o.o } : {};
      if (name === 'person') yy = y - .5 * s;
      if (o.dyn === 'sway' && p >= 1) rot += .12 * Math.sin((lt - at) * 9) * Math.exp(-(lt - at - d) * .35);
      if (o.dyn === 'scissors') oo.open = .12 + .22 * (.5 + .5 * Math.sin((lt - at) * 7));
      if (o.dyn === 'bounce' && p >= 1) yy += 16 * Math.abs(Math.sin((lt - at) * 5));
      drawDoodle(name, x, yy, s * 1.12, p, { o: oo, rot, flip: o.flip });
    }
    subtitles(t);
    // virada de página: o papel "passa" rapidinho entre as cenas
    boilSeed('fade');
    const f1 = 1 - ease(lt / .22), f2 = ease((lt - (t1 - t0 - .2)) / .2);
    const a = Math.max(t0 < .1 ? 0 : f1, f2);
    if (a > .01) { push(); noStroke(); fill(243, 235, 220, 255 * a); rect(0, 0, W, H); pop(); }
    if (t < .5) { push(); noStroke(); fill(243, 235, 220, 255 * (1 - ease(t / .5))); rect(0, 0, W, H); pop(); }
    if (t > DUR - .9) { push(); noStroke(); fill(243, 235, 220, 255 * ease((t - (DUR - .9)) / .85)); rect(0, 0, W, H); pop(); }
  }
  shots([[0, corte]]);
})();
