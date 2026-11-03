"""Monta a linha do tempo final: cortes, legendas por palavra, marcos para os graficos e a voz final. Saida: timeline.json, work/voz-final.wav"""
import json, re, numpy as np, soundfile as sf
D = '.'
SR = 48000
wv = json.load(open(f'{D}/work/words-video.json')); wa = json.load(open(f'{D}/work/words-audio.json'))
norm = lambda s: re.sub(r'[^\wÀ-ú]', '', s.lower())
# ---- cortes (tempos de origem) ----
V1 = (0.30, 16.70)      # abertura do video: da pergunta ate "nao e bem assim"
A = (0.80, 184.30)      # audio: da primeira frase ate "...no seu bolso na justica" (a frase final cortada fica de fora)
V2 = (79.10, 95.28)     # fecho do video: "Voce passou por isso?" ate "Abraco"
STING, GAP, ENDC = 4.0, 0.7, 8.0
T_V1 = 0.0; L1 = V1[1] - V1[0]
T_S = L1; T_A = T_S + STING; LA = A[1] - A[0]
T_V2 = T_A + LA + GAP; L2 = V2[1] - V2[0]; T_E = T_V2 + L2; DUR = T_E + ENDC
# ---- correcoes de texto (palavras que o reconhecimento errou) ----
def fix(W):
    out = []
    for i, (w, a, b) in enumerate(W):
        n = norm(w)
        if n == 'nss': w = 'INSS' + re.sub(r'[\wÀ-ú]', '', w)
        if n == 'sam': continue
        if n == 'obrigado': w = 'obrigada'
        if n == 'e' and i + 1 < len(W) and norm(W[i + 1][0]) == 'recebo': w = 'eu'
        out.append([w, a, b])
    return out
wv, wa = fix(wv), fix(wa)
for i, (w, a, b) in enumerate(wv):
    if norm(w) == 'voltei' and norm(wv[i + 1][0]) == 'doente': wv[i][0] = '“voltei'; wv[i + 1][0] = 'doente”'
def find(W, seq, after=0.0):
    k = [norm(s) for s in seq]
    for i in range(len(W) - len(k) + 1):
        if W[i][1] >= after and all(norm(W[i + j][0]) == k[j] for j in range(len(k))): return W[i][1]
    raise SystemExit('nao achei: ' + ' '.join(seq))
tv = lambda s: T_V1 + (s - V1[0])
ta = lambda s: T_A + (s - A[0])
tv2 = lambda s: T_V2 + (s - V2[0])
C = {}; SA = {}
for name, seq in dict(negou=['negou', 'a', 'minha'], voltar=['voltar', 'a', 'trabalhar'], justica=['Se', 'eu', 'entrar'], sim=['sim'], direito=['você', 'pode', 'ter', 'direito'], muita=['Muita', 'gente'], assim=['não', 'é', 'bem', 'assim']).items():
    C['v1_' + name] = tv(find(wv, seq, V1[0]))
for name, seq in dict(nega=['Quando', 'o', 'INSS'], mas=['mas', 'e', 'se'], firma=['volta', 'pra', 'firma'], forcado=['retorno', 'forçado'], comer=['necessidade', 'de', 'comer'],
                      antigamente=['Antigamente'], hoje=['hoje', 'o', 'STF'], tema=['tema', '1125'], detalhe=['Só', 'que', 'tem', 'um', 'detalhe'],
                      separa=['A', 'justiça', 'separa'], primeira=['primeira'], segunda=['Segunda'], recebe=['você', 'recebe', 'sim'],
                      prova=['como', 'que', 'você', 'prova'], um=['Um'], dois=['Dois'], tres=['Três'], ouro=['vale', 'ouro'], exemplo=['Exemplo'],
                      coisa=['tem', 'mais', 'uma', 'coisa'], bico=['bico'], oito=['oito', 'meses'], valor=['15', 'mil'],
                      entao=['Então', 'se', 'você', 'foi', 'negado'], guarda=['Guarda', 'tudo'], atestado=['atestado'], receita=['receita'], exame=['exame'], print_=['print'], dinheiro=['pode', 'virar', 'dinheiro']).items():
    after = {'um': SA.get('prova', A[0]), 'dois': SA.get('um', A[0]), 'tres': SA.get('dois', A[0]), 'exemplo': SA.get('dois', A[0]), 'ouro': SA.get('dois', A[0]), 'segunda': SA.get('primeira', A[0]), 'recebe': SA.get('segunda', A[0]), 'atestado': SA.get('guarda', A[0]), 'receita': SA.get('guarda', A[0]), 'exame': SA.get('guarda', A[0]), 'print_': SA.get('guarda', A[0]), 'dinheiro': SA.get('guarda', A[0])}.get(name, A[0])
    SA[name] = find(wa, seq, after); C['a_' + name] = ta(SA[name])
for name, seq in dict(passou=['Você', 'passou'], escreve=['Escreve', 'aqui'], segue=['segue', 'aqui'], abraco=['Abraço']).items():
    C['v2_' + name] = tv2(find(wv, seq, V2[0]))
C['a_print'] = C.pop('a_print_')
C.update(t_v1=T_V1, t_sting=T_S, t_audio=T_A, t_v2=T_V2, t_end=T_E, dur=DUR, t_audio_end=T_A + LA)
# ---- legendas: palavras agrupadas em frases curtas, com tempo de cada palavra ----
def chunks(W, lo, hi, tmap, tend_pad=0.45):
    ws = [(w, tmap(a), tmap(max(b, a + 0.12))) for w, a, b in W if lo - 0.05 <= a <= hi - 0.02]
    out, cur = [], []
    def flush():
        if cur: out.append(list(cur)); cur.clear()
    for i, x in enumerate(ws):
        cur.append(x); txt = ' '.join(c[0] for c in cur); nxt = ws[i + 1] if i + 1 < len(ws) else None
        gap = (nxt[1] - x[2]) if nxt else 9
        if x[0].endswith(('.', '?', '!')) or gap > 0.45 or len(txt) > 44 or (x[0].endswith(',') and len(txt) > 24): flush()
    flush(); return out
subs = []
for W, lo, hi, tmap in ((wv, V1[0], V1[1], tv), (wa, A[0], A[1], ta), (wv, V2[0], V2[1], tv2)):
    ch = chunks(W, lo, hi, tmap)
    for k, c in enumerate(ch):
        ws = []
        for j, (w, a, b) in enumerate(c):
            nxt = c[j + 1][1] if j + 1 < len(c) else b
            ws.append({'w': w, 'a': round(a, 3), 'b': round(max(b, min(nxt, b + 0.4)) if j + 1 == len(c) else nxt, 3)})
        t0 = c[0][1] - 0.12; t1 = ws[-1]['b'] + 0.5
        nxt0 = (ch[k + 1][0][1] - 0.14) if k + 1 < len(ch) else 1e9
        subs.append({'t0': round(t0, 3), 't1': round(min(max(t1, t0 + 1.4), nxt0), 3), 'words': ws})
# ---- efeitos sonoros (lidos pelo mix.py) ----
EV = [{'t': T_S + 0.15, 'type': 'hit'}, {'t': T_S + 0.9, 'type': 'shine'}, {'t': C['v1_negou'] + 0.5, 'type': 'stamp'}, {'t': C['a_nega'] + 0.9, 'type': 'stamp'}, {'t': C['v1_sim'], 'type': 'ding'},
      {'t': C['a_ouro'], 'type': 'ding'}, {'t': C['a_recebe'], 'type': 'ding'}, {'t': C['a_dinheiro'] - 0.2, 'type': 'coin'}, {'t': T_E + 0.15, 'type': 'hit'}]
bounds = [T_S, T_A, C['a_antigamente'] - 0.3, C['a_detalhe'] - 0.3, C['a_prova'] - 0.3, C['a_coisa'] - 0.3, C['a_entao'] - 0.3, T_A + LA, T_V2, T_E]
EV += [{'t': b - 0.35, 'type': 'whoosh'} for b in bounds[1:]]
EV += [{'t': C[k] - 0.3, 'type': 'tick'} for k in ('a_antigamente', 'a_hoje', 'a_primeira', 'a_segunda', 'a_um', 'a_dois', 'a_tres', 'a_bico', 'a_oito', 'a_valor', 'a_atestado', 'a_receita', 'a_exame', 'a_print', 'v1_voltar', 'v1_justica', 'v1_muita', 'v1_assim', 'v2_passou', 'v2_segue')]
# ---- voz final ----
def load(p):
    x, sr = sf.read(p); assert sr == SR; return x if x.ndim == 1 else x.mean(1)
vv, va = load(f'{D}/work/voz-video-limpa.wav'), load(f'{D}/work/voz-audio-limpa.wav')
out = np.zeros(int(DUR * SR) + SR)
def put(x, s0, s1, t0):
    seg = x[int(s0 * SR):int(s1 * SR)].copy(); f = int(0.03 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f); i = int(t0 * SR); out[i:i + len(seg)] += seg
put(vv, V1[0], V1[1], T_V1); put(va, A[0], A[1], T_A); put(vv, V2[0], V2[1], T_V2)
sf.write(f'{D}/work/voz-final.wav', out[:int(DUR * SR)], SR, subtype='PCM_24')
json.dump({'ev': sorted(EV, key=lambda e: e['t']), 'cues': {k: round(v, 3) for k, v in C.items()}, 'subs': subs, 'cuts': {'V1': V1, 'A': A, 'V2': V2}}, open(f'{D}/timeline.json', 'w'), ensure_ascii=False, indent=1)
print('duracao', round(DUR, 1), 's;', len(subs), 'frases')
for k, v in C.items(): print(f'{k:14s} {v:7.2f}')
