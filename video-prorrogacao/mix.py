"""Trilha de reportagem (sintetizada), efeitos sonoros e mixagens.
Saidas em out/: musica-reportagem.wav (arquivo separado, duracao do video), mix-sem-trilha.wav, mix-com-trilha.wav"""
import json, os
import numpy as np, soundfile as sf
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
C = TL['cues']; DUR = C['dur']; N = int(DUR * SR) + SR
rng = np.random.default_rng(11)
T = np.arange(N) / SR

def sos_f(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')
bp = lambda x, lo, hi: signal.sosfilt(sos_f('band', [lo, hi]), x)
lp = lambda x, f, o=2: signal.sosfilt(sos_f('low', f, o), x)
hp = lambda x, f, o=2: signal.sosfilt(sos_f('high', f, o), x)
def smooth(x, sec):
    k = max(1, int(sec * SR)); w = np.hanning(2 * k + 1); w /= w.sum(); return np.convolve(x, w, mode='same')
def place(buf, snd, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= buf.shape[0]: return
    snd = snd[: buf.shape[0] - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(snd), 0] += snd * gain * l; buf[i:i + len(snd), 1] += snd * gain * r
midi = lambda n: 440 * 2 ** ((n - 69) / 12)

# ---------------- sons ----------------
def kick(d=0.4):
    t = np.arange(int(d * SR)) / SR; f = 45 + 95 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 9) + 0.25 * np.sin(2 * ph) * np.exp(-t * 20)) * np.minimum(1, t * 800)
def snare(d=0.28):
    t = np.arange(int(d * SR)) / SR; n = bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 17); return n + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28)
def hat(d=0.06, o=False):
    t = np.arange(int(d * (4 if o else 1) * SR)) / SR; return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if o else 70))
def saw(f, d, nh=18):
    t = np.arange(int(d * SR)) / SR; s = np.zeros(len(t))
    for k in range(1, nh + 1):
        if f * k > 9000: break
        s += np.sin(2 * np.pi * f * k * t) / k
    return s
def pluck(f, d=0.5, cut=3200):
    s = saw(f, d, 14); t = np.arange(len(s)) / SR; return lp(s, cut) * np.exp(-t * 7) * np.minimum(1, t * 600)
def bell(f, d=1.8):
    t = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t * 2) + 0.3 * np.sin(2 * np.pi * 3.9 * f * t) * np.exp(-t * 4)) * np.exp(-t * 2.4) * np.minimum(1, t * 900)
def boom(d=2.2):
    t = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * 52 * t) * np.exp(-t * 1.6) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 3) * 0.7) * np.minimum(1, t * 400)
def riser(d):
    t = np.arange(int(d * SR)) / SR; n = rng.standard_normal(len(t)); sw = np.linspace(300, 9000, len(t)); out = np.zeros(len(t)); step = 2048
    for i in range(0, len(t), step):
        f = sw[i]; seg = n[i:i + step + 1024]; out[i:i + step] = bp(seg, f * 0.7, min(f * 1.4, 20000))[:min(step, len(t) - i)]
    return out * (t / d) ** 2 * 0.9

# ---------------- trilha ----------------
BPM = 104; BEAT = 60 / BPM
music = np.zeros((N, 2))
t_a0, t_a1 = C['t_audio'], C['t_audio_end']
def level(t):  # curva de energia (0 a 1) ao longo do filme
    pts = [(0, .25), (C['t_sting'] - 0.1, .45), (C['t_sting'], .9), (t_a0, .55), (t_a0 + 20, .7), (C['a_hoje'], .85), (C['a_prova'], .85), (C['a_valor'] + 4, 1.0), (C['a_entao'], .75), (t_a1, .55), (C['t_v2'], .7), (C['t_end'] - 1, .7), (C['t_end'], .5), (DUR, .25)]
    xs, ys = zip(*pts); return np.interp(t, xs, ys)
CHORDS = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]   # Am - F - C - G
BAR = BEAT * 4
t = 0.0; bar = 0
while t < DUR - 0.2:
    root, tri = CHORDS[(bar // 2) % 4]; lv = float(level(t))
    in_drive = (t >= 3.0)
    # baixo pulsante em colcheias
    for k in range(8):
        tt = t + k * BEAT / 2
        if tt >= DUR: break
        note = root + (12 if k % 4 == 3 else 0); place(music, lp(saw(midi(note), BEAT * 0.46, 10), 520 + 700 * lv) * 0.55, tt, 0.55 * (0.5 + 0.5 * lv) * (1 if in_drive else 0.7), -0.05)
    # pad (acorde sustentado)
    for n in tri:
        d = BAR * 1.02; s = sum(saw(midi(n) * (1 + dt / 100), d, 8) for dt in (-0.2, 0.2)); e = np.minimum(1, np.arange(len(s)) / SR / 0.5) * np.minimum(1, (len(s) - np.arange(len(s))) / SR / 0.6)
        place(music, lp(s, 1800) * e * 0.05 * (0.4 + 0.6 * lv), t, 1.0, rng.uniform(-0.5, 0.5))
    # arpejo suave (semicolcheias) so em energia alta
    if lv > 0.6:
        for k in range(16):
            tt = t + k * BEAT / 4
            if tt < DUR and k % 2 == 0: place(music, pluck(midi(tri[k // 2 % 3] + 12), 0.25, 2600) * 0.12 * lv, tt, 1.0, 0.35 if k % 4 else -0.35)
    # percussao
    if in_drive and lv > 0.5:
        for b in range(4):
            tt = t + b * BEAT
            if tt >= DUR: break
            if b in (0, 2): place(music, kick() * 0.7, tt, 0.8 * lv)
            if b in (1, 3): place(music, snare() * 0.35, tt, 0.6 * lv)
        for k in range(8):
            tt = t + k * BEAT / 2
            if tt < DUR: place(music, hat(0.06, k % 4 == 3) * 0.12, tt, 0.6 * lv, 0.25)
    else:
        if t < DUR: place(music, kick() * 0.5, t, 0.5)
    # motivo de sino a cada 4 compassos
    if bar % 4 == 1 and lv > 0.5:
        for j, n in enumerate([76, 72, 69]):
            place(music, bell(midi(n), 1.4) * 0.09, t + 0.0 + j * BEAT, lv, 0.2)
    t += BAR; bar += 1
# abertura e fecho: bombo de entrada, riser e acorde final
place(music, boom() * 0.55, C['t_sting'] + 0.15, 1.0)
place(music, riser(2.2) * 0.25, C['t_sting'] - 2.0, 1.0)
for n in (57, 60, 64, 69): place(music, bell(midi(n), 3.2) * 0.12, C['t_sting'] + 0.15, 1.0, (n - 62) / 20)
place(music, boom() * 0.5, C['t_end'] + 0.15, 1.0)
for n in (45, 57, 64, 69, 72, 76): place(music, bell(midi(n), 6.0) * 0.1, C['t_end'] + 0.15, 1.0, (n - 62) / 30)
# o pulso aquece a cada capitulo novo e cai com a entrada da voz do video
music = music[:int(DUR * SR) + 0]
end_fade = np.clip((DUR - T[:len(music)]) / 1.5, 0, 1); music *= end_fade[:, None]
music = np.tanh(music * 1.3) / 1.3
# equilibrio espectral: menos grave e miolo (abrem espaco para a voz), mais brilho
low = np.stack([lp(music[:, c], 250, 2) for c in (0, 1)], 1); hi = np.stack([hp(music[:, c], 2800, 2) for c in (0, 1)], 1)
music = hp(0.42 * low + (music - low) + 2.6 * hi, 40, 2) if False else np.stack([hp((0.42 * low + (music - low) + 2.6 * hi)[:, c], 40, 2) for c in (0, 1)], 1)
# normaliza o arquivo de musica separado para -16 LUFS aproximado
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
music *= 10 ** ((-22 - rms_db(music)) / 20)
pk = np.abs(music).max(); music *= min(1.0, 0.89 / pk)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'musica-reportagem.wav'), music, SR, subtype='PCM_24')

# ---------------- efeitos ----------------
sfx = np.zeros((len(music), 2))
for e in TL['ev']:
    ty, t0 = e['type'], e['t']
    if ty == 'whoosh':
        d = 0.75; tt = np.arange(int(d * SR)) / SR; n = rng.standard_normal(len(tt)); out = np.zeros(len(tt)); step = 1024
        for i in range(0, len(tt), step):
            f = 400 + 5200 * (i / len(tt)) ** 1.5; out[i:i + step] = bp(n[i:i + step + 512], f * 0.6, f * 1.5)[:min(step, len(tt) - i)]
        place(sfx, out * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.6 * 0.5, t0, 0.5, 0)
    elif ty == 'hit': place(sfx, boom(1.6) * 0.4, t0, 0.7)
    elif ty == 'shine':
        d = 1.0; tt = np.arange(int(d * SR)) / SR; f = 1800 + 3600 * tt; place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2 * 0.06, t0, 1.0, 0.2)
    elif ty == 'stamp':
        tt = np.arange(int(0.35 * SR)) / SR; place(sfx, np.sin(2 * np.pi * 85 * tt) * np.exp(-tt * 14) * 0.7 + bp(rng.standard_normal(len(tt)), 600, 4000) * np.exp(-tt * 45) * 0.5, t0, 0.8)
    elif ty == 'ding': place(sfx, bell(1760, 1.5) * 0.12, t0, 1.0, 0.1)
    elif ty == 'coin':
        place(sfx, bell(2637, 0.9) * 0.09, t0, 1.0, 0.2); place(sfx, bell(3322, 1.0) * 0.09, t0 + 0.11, 1.0, 0.25)
    elif ty == 'tick':
        tt = np.arange(int(0.05 * SR)) / SR; place(sfx, bp(rng.standard_normal(len(tt)), 2500, 7000) * np.exp(-tt * 110) * 0.35, t0, 0.5, rng.uniform(-0.3, 0.3))
sfx = sfx[:len(music)]

# ---------------- mixagens ----------------
voice, vsr = sf.read(os.path.join(HERE, 'work', 'voz-final.wav')); assert vsr == SR
voice = np.pad(voice, (0, max(0, len(music) - len(voice))))[:len(music)]
venv = smooth(np.abs(voice), 0.06); venv = np.clip(venv / (np.percentile(venv, 99) + 1e-9), 0, 1)
duck = 1 - 0.62 * smooth(venv, 0.18)
vst = np.stack([voice, voice], 1)
dry = vst + sfx
wet = vst + sfx + music * duck[:, None] * 0.8
for name, m in (('mix-sem-trilha', dry), ('mix-com-trilha', wet)):
    pk = np.abs(m).max(); m = m * (0.89 / pk) if pk > 0.89 else m
    sf.write(os.path.join(HERE, 'out', name + '.wav'), m, SR, subtype='PCM_24')
print('ok', round(DUR, 1), 's')
