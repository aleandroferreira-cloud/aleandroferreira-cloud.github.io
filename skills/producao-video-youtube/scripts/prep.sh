#!/bin/sh
# Prepara as midias: estabiliza o video (30 fps, com nitidez) e limpa as duas vozes.
set -e
D=$(cd "$(dirname "$0")" && pwd); cd "$D/work"
# 1) estabilizar (vidstab em duas passagens) + denoise leve + nitidez, 30 fps constante
ffmpeg -y -loglevel error -i ../src/video-original.mp4 -an -vf "fps=30,vidstabdetect=shakiness=6:accuracy=15:result=trf.trf" -f null -
ffmpeg -y -loglevel error -i ../src/video-original.mp4 -an -vf "fps=30,vidstabtransform=input=trf.trf:smoothing=30:zoom=2:optzoom=1:interpol=bicubic,hqdn3d=2:1.5:3:3,scale=1.12*iw:-2:flags=lanczos,unsharp=5:5:0.7:5:5:0.0,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p video-estab.mp4
# 2) vozes: limpar ruido (perfil automatico do trecho mais quieto), EQ e compressao
ffmpeg -y -loglevel error -i ../src/video-original.mp4 -vn -ar 48000 -ac 1 voz-video-bruta.wav
ffmpeg -y -loglevel error -i ../src/audio-original.m4a -ar 48000 -ac 1 voz-audio-bruta.wav
PY=${NRPY:-python3}
for n in video audio; do $PY ../denoise.py voz-$n-bruta.wav voz-$n-nr.wav; done
for n in video audio; do
  ffmpeg -y -loglevel error -i voz-$n-nr.wav -af "highpass=f=80,equalizer=f=220:t=q:w=1.1:g=-2.5,equalizer=f=3200:t=q:w=1:g=2.5,equalizer=f=9500:t=h:w=0.7:g=1.8,acompressor=threshold=-24dB:ratio=3:attack=6:release=140:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9" -ar 48000 voz-$n-limpa.wav
done
ls -la
