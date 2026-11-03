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
v, vsr = sf.read(os.path.join(HERE, 'voice', 'voz_limpa.wav'))
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

def kalimba(f, dur=1.4):
    t = np.arange(int(dur * SR)) / SR      # glockenspiel de brinquedo
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 9) + 0.2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 22)
    return s * np.exp(-t * 3.6) * np.minimum(1, t * 1200)

def pizz(f, dur=0.5):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 9) * np.minimum(1, t * 600)

# (tempo, nota midi, ganho, pan)
M = [(0.9, 72, .5, -.2), (2.6, 76, .4, .1), (4.3, 79, .4, .2), (6.0, 74, .35, -.1), (7.7, 76, .35, .1),
     (9.4, 69, .45, -.2), (10.2, 72, .4, 0), (11.0, 76, .4, .2), (12.6, 77, .4, -.1), (13.4, 72, .4, .1), (14.2, 76, .4, .2),
     (15.0, 79, .4, -.2), (15.8, 76, .35, 0),
     (17.6, 74, .9, 0),                                                    # primeira nota depois do silencio
     (18.4, 79, .5, .1), (19.0, 76, .4, -.1),
     (19.8, 72, .5, -.1), (20.5, 76, .5, 0), (21.2, 79, .5, .1), (21.9, 84, .5, .2),
     (22.6, 79, .55, -.1), (23.3, 76, .5, 0), (24.0, 79, .55, .1), (24.7, 84, .6, .2), (25.4, 88, .5, 0)]
for t0, n, gn, pn in M: place(music, kalimba(midi(n)), t0, gn * 0.5, pn)
for (a, b, notes) in chords:
    r = notes[0]; tt = a
    while tt < min(b, DUR - 0.3):
        place(music, pizz(midi(r)), tt, 0.16, 0.0); tt += 0.833 * 2

# silencio entre 16,55 e 17,55 (a musica some)
dip = 1 - 0.97 * np.clip(np.minimum((T - 16.35) / 0.3, (17.6 - T) / 0.08), 0, 1)
dip = np.where((T > 16.35) & (T < 17.6), dip, 1.0)
duck = 1 - 0.5 * smooth(venv, 0.12)
music *= (duck * dip)[:, None]

# ---------- foley ----------
fol = np.zeros((N, 2))
def res(x, f, q=18):
    sos = signal.butter(2, [f * 0.93, f * 1.07], btype='band', fs=SR, output='sos'); return signal.sosfilt(sos, x)
for e in ev['ev']:
    t0, ty, gn = e['t'], e['type'], e.get('gain', 0.5)
    if ty == 'snap':
        n = int(0.06 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 380)
        click = bandpass(x, 1500, 7000) * 0.8 + res(x, 2900) * 1.5 + res(x, 4600) * 1.0
        low = np.sin(2 * np.pi * 180 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 120) * 0.4
        place(fol, click + low, t0, 0.12 * gn, rng.uniform(-0.3, 0.3))
    elif ty == 'clack':
        n = int(0.09 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 140)
        place(fol, bandpass(x, 700, 5500) + res(x, 1500) * 1.2, t0, 0.2 * gn, rng.uniform(-0.8, -0.2))
    elif ty == 'crash':
        n = int(0.9 * SR); x = lowpass(rng.standard_normal(n), 380) * np.exp(-np.arange(n) / SR * 4.5)
        place(fol, x, t0, 0.25, -0.3)
    elif ty == 'step':
        n = int(0.04 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 260)
        place(fol, bandpass(x, 900, 3500), t0, 0.1 * gn, 0.0)
    elif ty == 'ding':
        n = int(1.4 * SR); tt = np.arange(n) / SR
        place(fol, (np.sin(2 * np.pi * 1568 * tt) + 0.4 * np.sin(2 * np.pi * 3136 * tt)) * np.exp(-tt * 3.2) * np.minimum(1, tt * 900), t0, 0.07, 0.0)
fol *= ((1 - 0.3 * venv) * np.where((T > 16.45) & (T < 17.6), 0.0, 1.0))[:, None]
room = lowpass(rng.standard_normal(N), 350) * 0.007 * np.where((T > 16.45) & (T < 17.6), 0.6, 1.0)
fol[:, 0] += room; fol[:, 1] += room

# ---------- soma ----------
mix = np.zeros((N, 2)); mix[:, 0] = voice; mix[:, 1] = voice
mix += music * 1.0 + fol
pk = np.abs(mix).max(); mix = mix / pk * 0.85 if pk > 0.85 else mix
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR, subtype='PCM_24')
print(f'mix.wav {DUR:.1f}s  pico {np.abs(mix).max():.2f}')
