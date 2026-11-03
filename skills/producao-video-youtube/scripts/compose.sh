#!/bin/sh
# Junta os graficos (graphics.mp4) com o video estabilizado nas janelas de abertura e fecho. Uso: sh compose.sh graphics.mp4 saida.mp4
set -e
D=$(cd "$(dirname "$0")" && pwd); IN=$1; OUT=$2
read V1S V1L V2S V2L T2 <<EOF
$(python3 -c "import json;T=json.load(open('$D/timeline.json'));c=T['cuts'];print(c['V1'][0],round(c['V1'][1]-c['V1'][0],3),c['V2'][0],round(c['V2'][1]-c['V2'][0],3),T['cues']['t_v2'])")
EOF
ffmpeg -y -loglevel error -i "$IN" -i "$D/work/video-estab.mp4" -filter_complex "
[1:v]split=2[a][b];
[a]trim=start=$V1S:duration=$V1L,setpts=PTS-STARTPTS,scale=494:880:flags=lanczos,format=yuva420p,fade=t=in:st=0.05:d=0.45:alpha=1,fade=t=out:st=$(python3 -c "print($V1L-0.4)"):d=0.4:alpha=1[v1];
[b]trim=start=$V2S:duration=$V2L,setpts=PTS-STARTPTS,scale=494:880:flags=lanczos,format=yuva420p,fade=t=in:st=0.05:d=0.45:alpha=1,fade=t=out:st=$(python3 -c "print($V2L-0.4)"):d=0.4:alpha=1,setpts=PTS+$T2/TB[v2];
[0:v][v1]overlay=130:100:eof_action=pass[o1];[o1][v2]overlay=130:100:eof_action=pass,format=yuv420p[out]" -map "[out]" -c:v libx264 -crf 15 -preset medium -pix_fmt yuv420p -r 30 "$OUT"
