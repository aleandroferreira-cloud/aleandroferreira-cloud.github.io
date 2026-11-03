# Lições aprendidas (produção de vídeo em código, ambiente na nuvem)

- Caminho da biblioteca muito longo quebra o Kokoro/espeak (limite ~160 bytes): use `/root/lemo-opuscar`.
- ffmpeg da distro é 6.x; use um binário estático 7+ (BtbN) para loudnorm correto. Precisa de `vidstabdetect/vidstabtransform`.
- `sleep` encadeado é bloqueado: rode comandos longos com `run_in_background` e espere a notificação.
- Whisper `medium` baixa ~1,5 GB na 1ª vez e funciona na nuvem; rode em primeiro plano se o background falhar em silêncio.
- GitHub raw pode dar 403 no ambiente; fontes OFL vêm do npm (`@fontsource/*`, arquivos `*-latin-<peso>-normal.woff2`).
- WebGL/3D é por software (SwiftShader): ~2–3 s por quadro em 1080×1920 (Lego levou ~24 min). 2D em canvas leva ~0,06 s por quadro.
- `mergeGeometries` do three.js falha misturando geometrias indexadas e não indexadas: converta com `toNonIndexed()`.
- Scripts clássicos: um `const` de outro `<script>` não existe ainda no topo do arquivo; use funções chamadas depois do carregamento.
- Escala de legenda: letra grande, 2 linhas no máximo, chunks de 3–8 palavras; destaque na palavra falada com pop pequeno (≤5%) para não encostar nas vizinhas.
- Conteúdo da tela não pode ficar sob a legenda: lousa/cartões terminam em y≈885 de 1080; legenda a partir de y≈945.
- Lousa nunca fica parada: preencha lacunas entre cues com desenhos (apagador entre blocos).
- Hora de gravar a mixagem: música com muito grave suja a voz; equalize e ducke ~60% sob a voz.
- Voz do vídeo vinda de WhatsApp: loudness bruto ~−10 LUFS, nivele por loudnorm antes de misturar.
- Stop hook pode exigir commit: ignore mídia pesada, commite só código e textos.
