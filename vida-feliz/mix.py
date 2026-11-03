"""Mixagem: voz do autor + trilha sintetizada (pad e kalimba) + foley de pincel. Saida: out/mix.wav (48 kHz estereo)."""
import json, os
import numpy as np, soundfile as sf
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']
N = int(DUR * SR)
rng = np.random.default_rng(7)
T = np.arange(N) / SR

def place(buf, snd, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    snd = snd[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(snd), 0] += snd * gain * l
    buf[i:i + len(snd), 1] += snd * gain * r

def bandpass(x, lo, hi):
    sos = signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos'); return signal.sosfilt(sos, x)

def lowpass(x, f):
    sos = signal.butter(2, f, btype='low', fs=SR, output='sos'); return signal.sosfilt(sos, x)

def smooth(x, sec):
    k = max(1, int(sec * SR)); w = np.hanning(k * 2 + 1); w /= w.sum(); return np.convolve(x, w, mode='same')

# ---------- voz ----------
v, vsr = sf.read(os.path.join(HERE, 'voice', 'voz_limpa.wav' if os.path.exists(os.path.join(HERE, 'voice', 'voz_limpa.wav')) else 'voz.wav'))
if v.ndim > 1: v = v.mean(1)
assert vsr == SR
voice = np.zeros(N); voice[: min(N, len(v))] = v[:N]
voice = np.tanh(voice * 2.2) / np.tanh(2.2)           # limita os picos
voice *= 0.2 / (np.sqrt(np.mean(voice[voice != 0] ** 2)) + 1e-9)   # RMS ~ -14 dB
venv = smooth(np.abs(voice), 0.08); venv = np.clip(venv / (venv.max() + 1e-9) * 6, 0, 1)

# ---------- trilha ----------
midi = lambda n: 440 * 2 ** ((n - 69) / 12)
music = np.zeros((N, 2))
chords = [(0, 8.6, [45, 52, 60, 64]), (8.6, 13.0, [41, 48, 57, 60]), (13.0, 17.4, [48, 55, 60, 64]),
          (17.4, 19.6, [45, 52, 59, 64]), (19.6, DUR + 1, [48, 55, 64, 67, 72])]
pad = np.zeros(N)
for a, b, notes in chords:
    for n in notes:
        f = midi(n); seg = np.zeros(N)
        for det in (-0.12, 0.0, 0.12):
            seg += np.sin(2 * np.pi * f * (1 + det / 100) * T + rng.uniform(0, 6.28))
        seg += 0.25 * np.sin(2 * np.pi * 2 * f * T)
        e = np.clip((T - a + 1.2) / 2.0, 0, 1) * np.clip((b + 1.2 - T) / 2.0, 0, 1)
        pad += seg * e * (0.012 if n >= 48 else 0.02)
pad = lowpass(pad, 2200)
music[:, 0] += pad; music[:, 1] += pad

def kalimba(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 14) + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 30)
    return s * np.exp(-t * 3.2) * np.minimum(1, t * 800)

# (tempo, nota midi, ganho, pan)
M = [(0.9, 72, .5, -.2), (2.6, 76, .4, .1), (4.3, 79, .4, .2), (6.0, 74, .35, -.1), (7.7, 76, .35, .1),
     (9.4, 69, .45, -.2), (10.2, 72, .4, 0), (11.0, 76, .4, .2), (12.6, 77, .4, -.1), (13.4, 72, .4, .1), (14.2, 76, .4, .2),
     (15.0, 79, .4, -.2), (15.8, 76, .35, 0),
     (17.6, 74, .9, 0),                                                    # primeira nota depois do silencio
     (18.4, 79, .5, .1), (19.0, 76, .4, -.1),
     (19.8, 72, .5, -.1), (20.5, 76, .5, 0), (21.2, 79, .5, .1), (21.9, 84, .5, .2),
     (22.6, 79, .55, -.1), (23.3, 76, .5, 0), (24.0, 79, .55, .1), (24.7, 84, .6, .2), (25.4, 88, .5, 0)]
for t0, n, gn, pn in M: place(music, kalimba(midi(n)), t0, gn * 0.5, pn)

# silencio entre 16,55 e 17,55 (a musica some)
dip = 1 - 0.97 * np.clip(np.minimum((T - 16.35) / 0.3, (17.6 - T) / 0.08), 0, 1)
dip = np.where((T > 16.35) & (T < 17.6), dip, 1.0)
duck = 1 - 0.5 * smooth(venv, 0.12)
music *= (duck * dip)[:, None]

# ---------- foley ----------
fol = np.zeros((N, 2))
for e in ev['ev']:
    t0, d, gn, pn = e['t'], e.get('dur', 1.0), e.get('gain', 0.8), e.get('pan', 0.0)
    n = int(d * SR); tt = np.arange(n) / SR
    if e['type'] == 'brush':
        x = bandpass(rng.standard_normal(n), 900, 4200)
        env = np.clip(tt / 0.15, 0, 1) * np.clip((d - tt) / 0.25, 0, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * rng.uniform(3, 6) * tt) ** 2)
        place(fol, x * env, t0, 0.055 * gn, pn)
    elif e['type'] == 'note':
        x = bandpass(rng.standard_normal(n), 2500, 7000)
        env = (np.sin(2 * np.pi * 9 * tt) > 0.2) * np.clip(tt / 0.05, 0, 1) * np.clip((d - tt) / 0.1, 0, 1) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.2 * tt) ** 2)
        place(fol, x * smooth(env.astype(float), 0.004), t0, 0.04, 0.0)
    elif e['type'] == 'mist':
        x = lowpass(rng.standard_normal(n), 1800) + 0.5 * bandpass(rng.standard_normal(n), 300, 900)
        env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
        sw = np.linspace(0.8, -0.8, n)
        l, r = np.cos((sw + 1) * np.pi / 4), np.sin((sw + 1) * np.pi / 4)
        i = int(t0 * SR); fol[i:i + n, 0] += (x * env * 0.1 * l)[: N - i]; fol[i:i + n, 1] += (x * env * 0.1 * r)[: N - i]
    elif e['type'] == 'ring':
        x = np.sin(2 * np.pi * 392 * tt) * np.exp(-tt * 3) * 0.05 + np.sin(2 * np.pi * 784 * tt) * np.exp(-tt * 5) * 0.02
        place(fol, x, t0, 1.0, 0.0)
fol *= ((1 - 0.35 * venv) * np.where((T > 16.45) & (T < 17.6), 0.0, 1.0))[:, None]
wind = lowpass(rng.standard_normal(N), 500) * (0.012 + 0.008 * np.sin(2 * np.pi * 0.11 * T)) * np.where((T > 16.45) & (T < 17.6), 0.3, 1.0)
fol[:, 0] += wind; fol[:, 1] += wind[::-1] * 0 + wind

# ---------- soma ----------
mix = np.zeros((N, 2)); mix[:, 0] = voice; mix[:, 1] = voice
mix += music * 1.0 + fol
pk = np.abs(mix).max(); mix = mix / pk * 0.85 if pk > 0.85 else mix
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR, subtype='PCM_24')
print(f'mix.wav {DUR:.1f}s  pico {np.abs(mix).max():.2f}')
