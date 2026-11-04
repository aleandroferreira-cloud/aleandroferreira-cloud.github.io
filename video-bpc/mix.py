"""Mixagem do vídeo curto: voz limpa + giz/apagador/carimbo + trilha suave. Saídas em out/: mix-com-musica.wav e mix-sem-musica.wav"""
import json, os
import numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; N = int(DUR * SR)
rng = np.random.default_rng(5)
bp = lambda x, lo, hi: signal.sosfilt(signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
lp = lambda x, f: signal.sosfilt(signal.butter(2, f, btype='low', fs=SR, output='sos'), x)
def smooth(x, sec):
    k = max(1, int(sec * SR)); w = np.hanning(2 * k + 1); w /= w.sum(); return np.convolve(x, w, mode='same')
def place(buf, snd, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= buf.shape[0]: return
    snd = snd[: buf.shape[0] - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(snd), 0] += snd * gain * l; buf[i:i + len(snd), 1] += snd * gain * r
midi = lambda n: 440 * 2 ** ((n - 69) / 12)
v, sr = sf.read(os.path.join(HERE, 'work', 'limpa.wav')); v = v if v.ndim == 1 else v.mean(1); assert sr == SR
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
venv = smooth(np.abs(voice), 0.06); venv = np.clip(venv / (np.percentile(venv, 99) + 1e-9), 0, 1)
# trilha: pad Am-F-C-G + pluck suave
T = np.arange(N) / SR; music = np.zeros((N, 2)); BAR = 60 / 84 * 4
for b, (root, tri) in enumerate([(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])] * 4):
    t0 = b * BAR
    if t0 >= DUR: break
    for n in tri:
        seg = np.zeros(int(BAR * 1.05 * SR)); tt = np.arange(len(seg)) / SR
        for dt in (-0.2, 0.2): seg += np.sin(2 * np.pi * midi(n) * (1 + dt / 100) * tt)
        e = np.minimum(1, tt / 0.5) * np.minimum(1, (len(seg) - np.arange(len(seg))) / SR / 0.6); place(music, lp(seg, 1800) * e * 0.05, t0, 1.0, rng.uniform(-0.4, 0.4))
    for k in range(8):
        f = midi(tri[k % 3] + 12); tt = np.arange(int(0.5 * SR)) / SR; place(music, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7) * np.minimum(1, tt * 700) * 0.1, t0 + k * BAR / 8, 1.0, 0.3 if k % 2 else -0.3)
music *= np.minimum(1, (DUR - T) / 1.5)[:, None] * (1 - 0.65 * smooth(venv, 0.2))[:, None]
# efeitos: giz, apagador, carimbo
sfx = np.zeros((N, 2))
for e in EV['ev']:
    t0, d = e['t'], max(0.06, e.get('d', 0.3)); n = int(d * SR); tt = np.arange(n) / SR
    if e['type'] == 'chalk':
        x = bp(rng.standard_normal(n), 1800 if not e.get('acc') else 1300, 7500 if not e.get('acc') else 5200)
        gr = np.convolve((rng.random(n) < 0.0045).astype(float), np.hanning(60), mode='same'); env = np.minimum(1, tt / 0.02) * np.minimum(1, (d - tt) / 0.04) * (0.55 + 0.45 * np.sin(2 * np.pi * rng.uniform(5, 9) * tt) ** 2)
        place(sfx, x * (0.35 + 6 * smooth(gr, 0.002)) * env, t0, 0.05 * (0.55 + min(1, e.get('len', 100) / 500)), rng.uniform(-0.4, 0.4))
    elif e['type'] == 'wipe':
        x = lp(rng.standard_normal(n), 1400) + 0.6 * bp(rng.standard_normal(n), 200, 700); place(sfx, x * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.1 * (0.7 + 0.3 * np.sin(2 * np.pi * 3.2 * tt)) * 0.16, t0, 1.0, 0.0)
    elif e['type'] == 'stamp':
        n2 = int(0.35 * SR); t2 = np.arange(n2) / SR; place(sfx, np.sin(2 * np.pi * 85 * t2) * np.exp(-t2 * 14) * 0.7 + bp(rng.standard_normal(n2), 600, 4000) * np.exp(-t2 * 45) * 0.5, t0, 0.8)
sfx *= (1 - 0.3 * venv)[:, None]
vst = np.stack([voice, voice], 1)
for name, m in (('mix-sem-musica', vst + sfx), ('mix-com-musica', vst + sfx + music)):
    pk = np.abs(m).max(); m = m * (0.89 / pk) if pk > 0.89 else m; sf.write(os.path.join(HERE, 'out', name + '.wav'), m, SR, subtype='PCM_24')
print('ok', round(DUR, 1), 's')
