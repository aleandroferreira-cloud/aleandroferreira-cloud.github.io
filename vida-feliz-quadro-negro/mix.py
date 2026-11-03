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

def kalimba(f, dur=1.2):
    t = np.arange(int(dur * SR)) / SR      # marimba suave
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 18) + 0.12 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t * 40)
    return s * np.exp(-t * 5.5) * np.minimum(1, t * 900)

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
    t0, d = e['t'], max(0.05, e.get('d', 0.5)); n = int(d * SR); tt = np.arange(n) / SR
    if e['type'] == 'chalk':
        gain = 0.035 * (0.5 + min(1.0, e.get('len', 100) / 500)) * (0.7 if e.get('acc') else 1.0)
        x = bandpass(rng.standard_normal(n), 1800 if not e.get('acc') else 1200, 7500 if not e.get('acc') else 5000)
        pulses = (rng.random(n) < 0.0045).astype(float); gr = np.convolve(pulses, np.hanning(60), mode='same')
        env = np.clip(tt / 0.02, 0, 1) * np.clip((d - tt) / 0.04, 0, 1) * (0.55 + 0.45 * np.sin(2 * np.pi * rng.uniform(5, 9) * tt) ** 2)
        place(fol, x * (0.35 + 6 * smooth(gr, 0.002)) * env, t0, gain, rng.uniform(-0.4, 0.4))
        if e.get('big'):                                      # toque leve no pouso
            tap = bandpass(rng.standard_normal(int(0.05 * SR)), 300, 2500) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90)
            place(fol, tap, t0 + d, 0.05, 0.0)
    elif e['type'] == 'wipe':
        x = lowpass(rng.standard_normal(n), 1400) + 0.6 * bandpass(rng.standard_normal(n), 200, 700)
        env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.2 * (0.7 + 0.3 * np.sin(2 * np.pi * 3.2 * tt))
        sw = np.sign(np.sin(2 * np.pi * tt / 0.72)) * 0.5
        i = int(t0 * SR); fol[i:i + n, 0] += (x * env * 0.12 * (0.5 - sw * 0.5 + 0.3))[: N - i]; fol[i:i + n, 1] += (x * env * 0.12 * (0.5 + sw * 0.5 + 0.3))[: N - i]
fol *= ((1 - 0.35 * venv) * np.where((T > 16.45) & (T < 17.6), 0.0, 1.0))[:, None]
room = lowpass(rng.standard_normal(N), 400) * 0.006
fol[:, 0] += room; fol[:, 1] += room

# ---------- soma ----------
mix = np.zeros((N, 2)); mix[:, 0] = voice; mix[:, 1] = voice
mix += music * 1.0 + fol
pk = np.abs(mix).max(); mix = mix / pk * 0.85 if pk > 0.85 else mix
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR, subtype='PCM_24')
print(f'mix.wav {DUR:.1f}s  pico {np.abs(mix).max():.2f}')
