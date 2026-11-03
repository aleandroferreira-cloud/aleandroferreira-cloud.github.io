"""Reducao de ruido espectral com perfil automatico (janela mais quieta do arquivo). Uso: python denoise.py entrada.wav saida.wav"""
import sys, numpy as np, soundfile as sf, noisereduce as nr
from scipy import signal
x, sr = sf.read(sys.argv[1]); x = x.mean(1) if x.ndim > 1 else x
x = signal.sosfilt(signal.butter(4, 85, 'hp', fs=sr, output='sos'), x)
win = int(0.5 * sr); hop = int(0.1 * sr); e = [(np.sqrt(np.mean(x[i:i + win] ** 2)), i) for i in range(0, len(x) - win, hop)]
_, i0 = min(e); noise = x[i0:i0 + win]                      # trecho mais silencioso = perfil do ruido
y = nr.reduce_noise(y=x, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.9, n_fft=2048, freq_mask_smooth_hz=300, time_mask_smooth_ms=60)
sf.write(sys.argv[2], y, sr, subtype='PCM_24'); print(sys.argv[1], 'perfil de ruido em', round(i0 / sr, 2), 's')
