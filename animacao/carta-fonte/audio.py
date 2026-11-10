# audio.py: trilha sintetizada (sem amostras externas) para "A carta que cruza o mapa".
# Voz original + base musical (violão sintético e pad) + efeitos amarrados às batidas visuais da cena + ambiente de mar e vento.
import subprocess, sys, wave
import numpy as np

SR = 48000
DUR = 65.4
N = int(SR * DUR)
rng = np.random.default_rng(7)
VOICE_SRC = sys.argv[1]
OUT = sys.argv[2]

def tt(d): return np.arange(int(d * SR)) / SR
def place(buf, x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= buf.shape[1]: return
    j = min(buf.shape[1], i + len(x)); x = x[: j - i]
    buf[0, i:j] += x * gain * (1 - max(0, pan))
    buf[1, i:j] += x * gain * (1 + min(0, pan))
def env_ad(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    nd = max(1, int(d * SR)); e[-nd:] *= np.linspace(1, 0, nd) ** 1.5 if nd <= n else 1
    return e
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lowpass_sweep(x, f0, f1):
    n = len(x); fc = np.linspace(f0, f1, n); a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(n): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def bandpass(x, lo, hi): return lowpass(x, hi) - lowpass(x, lo)

# ---------- sons ----------
def noise(d): return rng.standard_normal(int(d * SR))
def whoosh(d, f0, f1, amp=.3):
    x = lowpass_sweep(noise(d), f0, f1); n = len(x); e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * e * amp * 6
def swish(d, amp=.25):   # pincelada molhada
    x = bandpass(noise(d), 600, 3500); n = len(x); e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return x * e * amp * 5
def scratch(d, amp=.2):  # grafite no papel
    x = noise(d); x = x - lowpass(x, 1500); x = lowpass(x, 7000)
    m = np.abs(np.sin(2 * np.pi * (6 + 3 * rng.random()) * tt(d) + rng.random() * 6)) ** .7 * (.55 + .45 * rng.random(len(x)))
    return x * m * amp * 4 * env_ad(len(x), .02, .05)
def thump(f0=120, f1=45, d=.32, amp=.8):
    t = tt(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 11); c = lowpass(noise(.03), 3000) * np.exp(-tt(.03) * 140)
    x[: len(c)] += c * .8
    return x * amp
def pluck_tone(f, d=.25, amp=.3):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 14) * amp
def blip(f0, f1, d=.12, amp=.25):
    t = tt(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 18) * amp * env_ad(len(t), .004, .02)
def clink(f, amp=.22):
    t = tt(.45); return (np.sin(2 * np.pi * f * t) + .55 * np.sin(2 * np.pi * f * 2.76 * t) + .3 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 11) * amp
def bell(f, d=1.6, amp=.2):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.01 * t) + .25 * np.sin(2 * np.pi * f * 3.02 * t)) * np.exp(-t * 2.6) * amp
def boing(f0=260, f1=620, d=.24, amp=.22):
    t = tt(d); f = f0 + (f1 - f0) * np.sin(np.linspace(0, np.pi, len(t))); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * amp
def flutter(d=.55, amp=.22):  # folha de calendário virando
    x = bandpass(noise(d), 800, 4500); n = len(x); t = tt(d)
    return x * (np.abs(np.sin(2 * np.pi * 18 * t)) * .6 + .4) * np.sin(np.linspace(0, np.pi, n)) * amp * 5
def ks(f, d=1.4, amp=.3, decay=.996):
    Np = int(SR / f); L = int(d * SR); b = np.zeros(L + Np * 2)
    init = lowpass(rng.uniform(-1, 1, Np), 4500); b[:Np] = init
    for k in range(1, L // Np + 2):
        a, z = (k - 1) * Np, k * Np
        if z + Np > len(b): break
        prev = b[a:z]; prev1 = np.concatenate(([b[a - 1] if a > 0 else 0.0], prev[:-1]))
        b[z:z + Np] = decay * .5 * (prev + prev1)
    x = b[:L]; return x * amp * env_ad(L, .002, .12)

# ---------- voz ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE_SRC, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64)
voice = voice - lowpass(voice, 70)                                  # tira o ronco grave
voice *= .16 / (np.sqrt(np.mean(voice ** 2)) + 1e-9)                # nível constante, RMS ~ -16 dB
voice = np.tanh(voice * 1.6) / 1.6
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
V = np.zeros((2, N)); place(V, voice, 0.0, 1.0)

# envelope da voz, para abaixar a música quando se fala
win = int(SR * .05); ve = np.convolve(np.abs(voice), np.ones(win) / win, 'same')
ve = lowpass(ve, 6); ve = np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
duck = 1 - .62 * ve

# ---------- música: 84 bpm, C - G - Am - F ----------
M = np.zeros((2, N)); BPM = 84; beat = 60 / BPM; bar = beat * 4
chords = [[48, 55, 64, 67], [43, 55, 62, 67], [45, 57, 64, 69], [41, 57, 60, 65]]   # baixo + 3 notas
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
nb = int(DUR / bar) + 1
for b in range(nb):
    ch = chords[b % 4]; t0 = b * bar
    if t0 >= 62.4: ch = chords[0]
    # pad
    for m in ch[1:]:
        x = (np.sin(2 * np.pi * mf(m) * tt(bar + .5)) + np.sin(2 * np.pi * mf(m) * 1.003 * tt(bar + .5))) * .028
        place(M, x * env_ad(len(x), .5, .6), t0, 1.0, pan=rng.uniform(-.3, .3))
    # baixo
    for k in (0, 2):
        tb = tt(beat * 1.9); xb = np.sin(2 * np.pi * mf(ch[0]) * tb) * np.exp(-tb * 1.8) * .12
        place(M, xb, t0 + k * beat, 1.0)
    # arpejo no violão, colcheias
    pat = [1, 2, 3, 2, 1, 3, 2, 3]
    for i, p in enumerate(pat):
        m = ch[p] + (12 if i % 4 == 3 else 0)
        place(M, ks(mf(m), 1.1, .2), t0 + i * beat / 2, 1.0, pan=.15 if i % 2 else -.15)
final = 62.5
M[:, int(final * SR):] *= np.linspace(1, 0, N - int(final * SR)) ** 1.2   # fecha a música no final
# uma cadência suave bem no fim
place(M, bell(mf(84), 2.6, .12), 62.8); place(M, bell(mf(76), 2.6, .1), 62.8)
M *= duck[None, :] * .85

# ---------- efeitos amarrados à imagem ----------
S = np.zeros((2, N))
def sfx(x, t, g=1.0, pan=0.0): place(S, x, t, g, pan)

for t in (.2, .65, 1.1, 1.6): sfx(swish(.5, .22), t)                         # a terra é pintada
sfx(scratch(.6, .12), 1.0); sfx(blip(420, 940, .13, .3), 1.7)               # o envelope aparece
sfx(blip(420, 660, .16, .28), 4.95); sfx(blip(520, 760, .12, .18), 5.1)      # "?"
sfx(whoosh(.8, 500, 3500, .22), 10.65); sfx(thump(110, 42, .38, 1.0), 11.46); sfx(swish(.25, .2), 11.5)  # carimbo
sfx(boing(300, 520, .18, .16), 13.0)                                         # braço levantado
sfx(whoosh(.45, 700, 2600, .14), 13.9); sfx(clink(2200, .3), 14.36); sfx(clink(2600, .22), 14.5); sfx(blip(500, 800, .1, .18), 14.4)
for a in (14.7, 26.6, 36.9): sfx(boing(250, 560, .3, .22), a)                # saltos
for a in (16.0, 27.7, 38.0): sfx(thump(150, 70, .2, .55), a)
for i in range(8): sfx(clink(1700 + 90 * i, .22), 17.9 + i * .5 + .06, pan=-.35)   # moedas da pilha de 20%
for i in range(2): sfx(clink(1500, .22), 23.05 + i * .5 + .06, pan=.35)             # e da de 11%
sfx(scratch(.7, .16), 17.6); sfx(scratch(.7, .16), 22.8)                      # números a lápis
sfx(clink(2900, .1), 20.5); sfx(clink(3300, .12), 21.6)                       # as linhas de mínimo e teto
sfx(blip(500, 900, .12, .2), 26.7); sfx(blip(560, 980, .12, .2), 27.4)
sfx(scratch(.75, .2), 29.4); sfx(blip(220, 110, .3, .4), 30.1)                # X no relógio
sfx(blip(600, 1100, .14, .22), 31.7); sfx(bell(mf(88), 1.2, .16), 31.9)       # o bolo acende
sfx(blip(950, 480, .1, .16), 34.0)                                            # gota de suor
sfx(flutter(.45, .16), 37.35); sfx(scratch(1.0, .16), 38.7)
sfx(whoosh(.7, 500, 3000, .22), 39.2); sfx(thump(100, 38, .42, 1.1), 39.9); sfx(swish(.3, .22), 39.95)    # carimbo no dia 15
sfx(flutter(.6, .3), 40.5)                                                    # a folha vira
sfx(blip(420, 640, .16, .26), 42.15); sfx(blip(400, 600, .16, .26), 43.15)    # "vale a pena?" "depende"
sfx(whoosh(1.8, 400, 3800, .3), 45.1); sfx(whoosh(.9, 300, 2600, .2), 48.0); sfx(blip(300, 900, .5, .12), 48.0)   # voo
t = 55.66
while t < 61.8: sfx(pluck_tone(330, .12, .28), t); t += .683                   # seta quicando
sfx(whoosh(.4, 600, 2500, .2), 60.7); sfx(thump(130, 60, .3, .9), 61.0)       # envelope entra na caixa
sfx(boing(500, 900, .2, .2), 61.35)                                           # a bandeirinha sobe
for i, m in enumerate((84, 88, 91, 96)): sfx(bell(mf(m), 1.4, .13), 61.15 + i * .1, pan=(i - 1.5) * .25)
for i in range(6): sfx(blip(900 + 60 * i, 1300, .08, .1), 61.3 + i * .09)

# ---------- ambiente: mar e vento ----------
A = np.zeros((2, N))
sea = lowpass(noise(DUR), 900) * (.5 + .5 * np.sin(2 * np.pi * .11 * tt(DUR) + 1))
for c in (0, 1): A[c] = sea * .035 * np.sin(np.linspace(0, np.pi, N)) ** .5
wind = lowpass(noise(DUR), 420) * np.clip((tt(DUR) - 45) / 3, 0, 1) * np.clip((62 - tt(DUR)) / 3, 0, 1)
for c in (0, 1): A[c] += wind * .07 * (.6 + .4 * np.sin(2 * np.pi * .3 * tt(DUR) + c))

mix = V + M + S * .85 + A
peak = np.max(np.abs(mix)); mix = np.tanh(mix * 1.1) * (.89 / np.tanh(peak * 1.1 + 1e-9) if peak > .9 else 1.0)
pcm = (np.clip(mix, -1, 1) * 32000).astype('<i2')
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.T.copy().tobytes())
print('ok', OUT, 'peak', round(float(np.max(np.abs(mix))), 3))
