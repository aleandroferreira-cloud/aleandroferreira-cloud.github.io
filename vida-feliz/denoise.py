"""Limpa a gravacao da voz: filtro de graves, reducao de ruido espectral, EQ e compressao leve. Uso: python denoise.py voz.wav voz_limpa.wav"""
import sys, numpy as np, soundfile as sf, noisereduce as nr
from scipy import signal
x, sr = sf.read(sys.argv[1]); x = x.mean(1) if x.ndim > 1 else x
sos = signal.butter(4, 95, 'hp', fs=sr, output='sos'); x = signal.sosfilt(sos, x)
noise = x[int(0.15 * sr):int(1.45 * sr)]                     # trecho antes da fala = perfil do ruido
y = nr.reduce_noise(y=x, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.92, n_fft=2048, freq_mask_smooth_hz=300, time_mask_smooth_ms=60)
sf.write(sys.argv[2], y, sr, subtype='PCM_24')
