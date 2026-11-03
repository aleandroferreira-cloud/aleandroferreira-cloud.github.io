// Legenda com palavra em destaque (canvas 2D). words = [{w, a, b}] com tempos em segundos; t = tempo atual.
// maxW = largura máxima da linha; size = tamanho da fonte; cy = base da legenda.
function drawKaraoke(g, t, words, W, H, S) {
  const size = Math.round(88 * S), maxW = W - 250 * S; g.font = `600 ${size}px Fredoka, sans-serif`;
  const sp = g.measureText(' ').width, items = words.map(x => ({ ...x, w2: g.measureText(x.w).width }));
  const lines = [[]]; let cur = 0;
  items.forEach(it => { if (cur + it.w2 > maxW && lines[lines.length - 1].length) { lines.push([]); cur = 0; } lines[lines.length - 1].push(it); cur += it.w2 + sp; });
  const lh = size * 1.32; let y = H - 300 * S - lines.length * lh;
  lines.forEach(l => {
    const lw = l.reduce((s, x) => s + x.w2, 0) + sp * (l.length - 1); let x = (W - lw) / 2;
    l.forEach(it => {
      const atual = t >= it.a && t < it.b, dita = t >= it.b;
      if (atual) { const k = Math.min(1, (t - it.a) / 0.14), s2 = 1 + 0.045 * Math.sin(Math.PI * k);
        g.save(); g.translate(x + it.w2 / 2, y); g.scale(s2, s2); g.translate(-(x + it.w2 / 2), -y);
        g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(x - 14 * S, y - size * 0.92, it.w2 + 28 * S, size * 1.16, 16 * S); g.fill();
        g.fillStyle = '#1b2a34'; g.fillText(it.w, x, y + size * 0.2); g.restore(); }
      else { g.fillStyle = dita ? '#fff' : 'rgba(255,255,255,0.5)'; g.fillText(it.w, x, y + size * 0.2); }
      x += it.w2 + sp; });
    y += lh; });
}
