"""Transcreve com tempo por palavra. Uso: python transcribe.py voz.wav saida.json [modelo]"""
import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else 'medium', device='cpu', compute_type='int8')
segs, info = m.transcribe(sys.argv[1], language='pt', word_timestamps=True, initial_prompt='INSS, prorrogação, STF, tema 1125, atestado, benefício por incapacidade, retorno forçado ao trabalho.', vad_filter=False)
W = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s in segs for w in s.words]
json.dump(W, open(sys.argv[2], 'w'), ensure_ascii=False); print(sys.argv[2], len(W), 'palavras', round(info.duration, 1), 's')
