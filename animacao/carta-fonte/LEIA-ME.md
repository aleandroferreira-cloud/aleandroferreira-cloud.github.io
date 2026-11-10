Fonte do vídeo "A carta que cruza o mapa" (9:16, 65 s).
Roda sobre o kit ClaudeAnimationBase (MIT): troque W,H por 1080,1920 em src/core.js, ponha words.js em src/ e carta.js em src/scenes/.
Áudio: python3 audio.py <voz.m4a> <saida.wav>. Render: node render.mjs --soft-gl --frames --workers=3, depois ffmpeg.
Dica: não use `fill:` (aquarela) no paint() sem GPU, cada preenchimento custa ~5 s por quadro.
