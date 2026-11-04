// Cenas do vídeo "BPC/LOAS tem 13°?" na lousa (1080x1080). Tempos vêm de work/words.json (via WORDS).
window.WIPE_PATH = [[80, 150], [1000, 150], [1000, 370], [80, 370], [80, 590], [1000, 590], [1000, 740]];
window.WIPE_W = 240; window.HAND_SCALE = 0.62; window.HAND_OFF = [1500, 1300];
function buildBPC(WORDS) {
  const norm = s => s.toLowerCase().replace(/[^\wà-ú]/g, '');
  const find = (seq, after = 0) => { const k = seq.map(norm); for (let i = 0; i + k.length <= WORDS.length; i++) if (WORDS[i][1] >= after && k.every((x, j) => norm(WORDS[i + j][0]) === x)) return WORDS[i][1]; throw new Error('nao achei ' + seq.join(' ')); };
  const A = {}; A.inf = find(['Infelizmente']); A.ano = find(['o', 'ano', 'todo']); A.dez = find(['dezembro']); A.pq = find(['Por', 'quê']); A.bpc = find(['Porque', 'o', 'BPC']); A.apos = find(['aposentadoria']); A.ben = find(['é', 'um', 'benefício']); A.lei = find(['lei', 'diz']);
  A.dec = find(['décimo', 'terceiro'], A.lei); A.pens = find(['pensão', 'por', 'morte']); A.entao = find(['Então']); A.sal = find(['um', 'salário']); A.meses = find(['12', 'meses']); A.acabou = find(['acabou']); A.nao = find(['Não', 'tem'], A.acabou); A.segue = find(['Me', 'segue']);
  window.ANCH = A;
  const ch = newChapter(0, 29.44), p = new Pen(ch, 0);
  const C = 540;
  // ---- capa: a pergunta já escrita no quadro desde o primeiro quadro (não passa pela mão) ----
  p.at(-9).txt('O BPC', C, 215, 150, 'cream', { align: 'center', dur: 0.5, nohand: 1 }).txt('TEM 13°?', C, 440, 175, 'gold', { align: 'center', dur: 0.5, nohand: 1 }).txt('décimo terceiro', C, 560, 66, 'pale', { align: 'center', dur: 0.5, nohand: 1 });
  p.s(circP(150, 650, 52, -1.9, 6.5, 20), 7, 'gold', { dur: 0.3, nohand: 1 }).txt('R$', 128, 672, 52, 'gold', { dur: 0.2, nohand: 1 }).s(circP(930, 650, 52, -1.9, 6.5, 20), 7, 'gold', { dur: 0.3, nohand: 1 }).txt('R$', 908, 672, 52, 'gold', { dur: 0.2, nohand: 1 });
  p.fig(figure(C, 770, 0.78, 'talk'), 'cream', { nohand: 1, dur: 0.05 }).txt('?', 395, 700, 96, 'gold', { dur: 0.1, nohand: 1 }).txt('?', 640, 690, 96, 'gold', { dur: 0.1, nohand: 1 });
  // a mão circula o "13°?" (0,5 a 1,6 s) e sublinha (1,7 a 2,3 s)
  p.at(1.0).s(circP(C, 345, 420, -2.6, 6.6, 36).map(([x, y]) => [x, 365 + (y - 345) * 0.3]), 8, 'gold', { dur: 0.9 });
  p.at(2.2).s(dens([[330, 585], [750, 579]]), 7, 'cream', { dur: 0.5 }).s(dens([[360, 603], [720, 599]]), 5, 'gold', { dur: 0.4 });
  // ---- "infelizmente não." ----
  p.at(A.inf - 0.1).txt('NÃO', C, 700, 170, 'red', { align: 'center', dur: 0.7, rot: -0.1 }).s(dens([[300, 725], [780, 700]]), 8, 'red', { dur: 0.35 });
  p.at(A.inf + 0.25).fig(figure(910, 770, 0.8, 'hurt', -1), 'cream', { dur: 0.045 });
  // ---- apaga e mostra o ano todo, menos dezembro ----
  p.at(5.15).wipe(0.9);
  p.at(6.1).txt('recebe o ano todo', C, 130, 90, 'cream', { align: 'center', dur: 1.1 });
  const cell = (i) => { const r = Math.floor(i / 6), c = i % 6, x = 100 + c * 150, y = 190 + r * 150; return { x, y }; };
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  for (let i = 0; i < 12; i++) { const { x, y } = cell(i); p.at(A.ano - 0.2 + i * 0.06).s(rectP(x, y, 130, 120), 6, i === 11 ? 'red' : 'cream', { dur: 0.16, gap: 0.0 }); }
  for (let i = 0; i < 11; i++) { const { x, y } = cell(i); p.at(A.ano + 0.45 + i * 0.1).txt(meses[i], x + 18, y + 48, 40, 'pale', { dur: 0.1, gap: 0 }).s(checkP(x + 66, y + 88, 34), 7, 'gold', { dur: 0.11, gap: 0 }); }
  p.at(A.dez - 0.1).txt('dez', cell(11).x + 22, cell(11).y + 50, 44, 'red', { dur: 0.25 }); const xx = crossP(cell(11).x + 65, cell(11).y + 88, 30); p.s(xx[0], 9, 'red', { dur: 0.2 }).s(xx[1], 9, 'red', { dur: 0.2 });
  p.at(A.dez + 0.9).txt('em dezembro: nada', C, 615, 96, 'red', { align: 'center', dur: 1.3 });
  p.at(A.pq - 0.05).txt('Por quê?', C, 735, 110, 'gold', { align: 'center', dur: 0.55 });
  // ---- porque o BPC não é aposentadoria ----
  p.at(A.bpc - 0.1).wipe(0.7);
  p.at(A.bpc + 0.65).txt('BPC', C, 195, 150, 'gold', { align: 'center', dur: 0.45 }); p.s(dens([[490, 235], [590, 235]]), 8, 'cream', { dur: 0.12 }).s(dens([[490, 268], [590, 268]]), 8, 'cream', { dur: 0.12 }).s(dens([[525, 290], [555, 215]]), 8, 'red', { dur: 0.12 });
  p.at(A.bpc + 1.0).txt('aposentadoria', C, 390, 100, 'pale', { align: 'center', dur: 0.9 }); p.at(A.apos + 0.9).s(dens([[250, 360], [830, 352]]), 9, 'red', { dur: 0.35 });
  p.at(A.ben - 0.25).txt('é um benefício', C, 520, 90, 'cream', { align: 'center', dur: 0.85 }).txt('assistencial', C, 655, 135, 'gold', { align: 'center', dur: 1.0 }).s(dens([[260, 685], [820, 678]]), 6, 'cream', { dur: 0.35 });
  p.s(catP([[880, 640], [840, 600], [855, 565], [885, 578], [915, 565], [940, 600], [930, 625], [880, 660]]), 8, 'red', { dur: 0.4 });
  // ---- a lei diz: sem 13° e sem pensão por morte ----
  p.at(A.lei - 0.15).wipe(0.65);
  p.at(A.lei + 0.5).txt('a lei diz:', 190, 165, 100, 'gold', { dur: 0.7 });
  const ox = -130; p.s(lineP(780 + ox, 85, 780 + ox, 215), 8, 'gold', { dur: 0.2 }).s(lineP(700 + ox, 105, 860 + ox, 105), 8, 'gold', { dur: 0.2 }).s(lineP(700 + ox, 105, 685 + ox, 165), 5, 'gold', { dur: 0.12 }).s(lineP(700 + ox, 105, 725 + ox, 165), 5, 'gold', { dur: 0.12 }).s(lineP(860 + ox, 105, 835 + ox, 165), 5, 'gold', { dur: 0.12 }).s(lineP(860 + ox, 105, 885 + ox, 165), 5, 'gold', { dur: 0.12 }).s(arcP(700 + ox, 165, 24, 0, Math.PI), 5, 'gold', { dur: 0.15 }).s(arcP(860 + ox, 165, 24, 0, Math.PI), 5, 'gold', { dur: 0.15 });
  p.at(A.dec - 0.3).txt('13°', 270, 450, 190, 'cream', { align: 'center', dur: 0.55 }); const x1 = crossP(270, 395, 90); p.at(A.dec + 0.7).s(x1[0], 12, 'red', { dur: 0.25 }).s(x1[1], 12, 'red', { dur: 0.25 });
  p.at(A.pens - 0.45).txt('pensão', 760, 400, 100, 'cream', { align: 'center', dur: 0.55 }).txt('por morte', 760, 505, 100, 'cream', { align: 'center', dur: 0.6 }); const x2 = crossP(760, 440, 120); p.at(A.pens + 0.85).s(x2[0], 12, 'red', { dur: 0.25 }).s(x2[1], 12, 'red', { dur: 0.25 });
  p.at(A.pens + 1.2).txt('benefício assistencial', C, 680, 70, 'gold', { align: 'center', dur: 1.0 });
  // ---- um salário por mês, 12 meses, e acabou ----
  p.at(A.entao - 0.3).wipe(0.7);
  p.at(A.sal - 0.55).txt('1 salário', C, 205, 130, 'gold', { align: 'center', dur: 0.65 }).s(circP(140, 180, 46, -1.9, 6.5, 18), 7, 'gold', { dur: 0.25 }).txt('R$', 122, 200, 44, 'gold', { dur: 0.18 });
  p.at(A.sal + 0.45).txt('por mês', C, 315, 95, 'cream', { align: 'center', dur: 0.55 });
  p.at(A.meses - 0.3).txt('× 12 meses', C, 450, 120, 'cream', { align: 'center', dur: 0.75 });
  p.at(A.acabou - 0.3).txt('= acabou', C, 585, 150, 'gold', { align: 'center', dur: 0.7 }).s(dens([[270, 610], [810, 603]]), 8, 'cream', { dur: 0.35 });
  p.at(A.nao).s(rectP(240, 650, 600, 110), 9, 'red', { dur: 0.35 }).txt('SEM 13°', C, 738, 105, 'red', { align: 'center', dur: 0.55 });
  // ---- convite para seguir ----
  p.at(A.segue - 0.55).wipe(0.65);
  p.at(A.segue + 0.45).txt('me segue!', C, 590, 150, 'gold', { align: 'center', dur: 0.75 }).s(dens([[330, 625], [750, 618]]), 8, 'cream', { dur: 0.3 });
  p.at(A.segue + 1.5).s(catP([[540, 740], [500, 705], [512, 678], [540, 690], [568, 678], [580, 705], [540, 745]]), 7, 'red', { dur: 0.35 });
  finishLousa();
  window.EV.push({ t: A.inf + 0.1, type: 'stamp' }, { t: A.nao + 0.4, type: 'stamp' });
  return A;
}
