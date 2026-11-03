"""Tira o fundo dos logos. AF: extrai o dourado do fundo escuro. INSS: remove o branco externo (preserva o branco interno)."""
import numpy as np, sys
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
D = sys.argv[1]
# ---- AF (dourado sobre marrom escuro) ----
im = np.asarray(Image.open(f'{D}/src/logo-af-original.jpg').convert('RGB'))[:575, 20:-20].astype(float)   # corta a barra preta da borda do print
L = im.max(2)
mask0 = L > 95                                          # onde certamente ha dourado
m = ndi.binary_dilation(mask0, iterations=6)
w = (~m).astype(float)
bg = np.stack([ndi.gaussian_filter(im[..., c] * w, 40) / np.maximum(ndi.gaussian_filter(w, 40), 1e-3) for c in range(3)], 2)   # fundo estimado
diff = np.sqrt(((im - bg) ** 2).sum(2))
a = np.clip((diff - 22) / 70, 0, 1)                     # transparencia a partir da diferenca para o fundo
a = ndi.gaussian_filter(a, 0.6)
col = np.clip((im - bg * (1 - a[..., None])) / np.maximum(a[..., None], 0.08), 0, 255)   # cor sem o fundo
col = np.where(a[..., None] < 0.06, 0, col)
out = np.dstack([col, a * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA'); bb = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
img = img.crop((bb[0] - 12, bb[1] - 12, bb[2] + 12, bb[3] + 12)); img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
img.save(f'{D}/assets/logo-af.png'); print('AF', img.size)
# ---- INSS (branco externo) ----
src = Image.open(f'{D}/src/logo-inss-original.png').convert('RGB'); src = src.resize((src.width * 4, src.height * 4), Image.LANCZOS)
x = np.asarray(src).astype(float); near = (x.min(2) > 238)
lab, n = ndi.label(near); border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
outside = np.isin(lab, list(border))
soft = ndi.gaussian_filter(outside.astype(float), 1.6)           # borda suave
alpha = 1 - soft; alpha[outside & (soft > 0.98)] = 0
alpha = np.clip((alpha - 0.35) / 0.4, 0, 1)                      # apara os pontinhos de ruido da borda
lab2, n2 = ndi.label(alpha > 0.3); sizes = ndi.sum(np.ones_like(alpha), lab2, range(1, n2 + 1)); keep = np.isin(lab2, [i + 1 for i, sz in enumerate(sizes) if sz > 150]); alpha = alpha * ndi.binary_dilation(keep, iterations=2)
# cor-para-alfa na borda para nao deixar halo branco
a2 = np.clip(alpha, 0.0, 1.0); col = x.copy()
edge = (a2 > 0) & (a2 < 1); col[edge] = np.clip((x[edge] - 255 * (1 - a2[edge, None])) / np.maximum(a2[edge, None], 0.15), 0, 255)
img2 = Image.fromarray(np.dstack([col, a2 * 255]).astype(np.uint8), 'RGBA'); bb = img2.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox(); img2 = img2.crop(bb)
img2.save(f'{D}/assets/logo-inss.png'); print('INSS', img2.size)
# previas sobre fundo escuro e claro
for name in ('logo-af', 'logo-inss'):
    lg = Image.open(f'{D}/assets/{name}.png')
    for tag, c in (('escuro', (20, 14, 8)), ('claro', (230, 230, 230))):
        bgim = Image.new('RGB', (lg.width + 60, lg.height + 60), c); bgim.paste(lg, (30, 30), lg); bgim.thumbnail((900, 600)); bgim.save(f'{D}/work/prev-{name}-{tag}.jpg')
