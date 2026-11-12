import json,wave,numpy as np,re
SR=48000
W=json.load(open('../corte/words_fix.json'))
a=wave.open('../corte/voz_pronta.wav'); d=np.frombuffer(a.readframes(a.getnframes()),np.int16).astype(float)/32768
def rms(t0,t1):
    x=d[int(t0*SR):int(t1*SR)]; return 20*np.log10(np.sqrt(np.mean(x**2))+1e-9) if len(x) else -99
def minpoint(t,span=.12):
    best=(1e9,t)
    for k in np.arange(t-span,t+span,.01):
        r=rms(k,k+.02)
        if r<best[0]: best=(r,k)
    return best[1]
# (cena, tempo aproximado de início, tempo aproximado de fim)
norm=lambda t:re.sub(r'[^\wà-ÿ$%-]','',t.lower())
# (cena, início aproximado da 1ª palavra, última palavra)
SEL=[('hook',42.9,'PIX'),('naocorta',47.4,'ninguém'),('pergunta',60.2,'INSS'),('bloq',66.4,'bloqueado'),('explicar',82.6,'explicar'),
     ('defesa',316.6,'responder'),('aviso',326.2,'corte'),('perde',333.8,'passar'),
     ('p1',358.8,'depois'),('p2',378.0,'motivo'),('p3',400.0,'perde'),('p4',437.9,'desatualizado'),('p5',458.4,'protocolo'),
     ('resumo',619.2,'resposta'),('cta',658.2,'embaixo')]
def lo_min(t0,t1):
    best=(1e9,t1)
    for k in np.arange(t0,t1,.01):
        r=rms(k,k+.02)
        if r<best[0]: best=(r,k)
    return best[1]
segs=[];cur=0.0;GAP=.16;voice=[]
for name,a_,last in SEL:
    i0=min(range(len(W)),key=lambda i:abs(W[i][0]-a_))
    i1=next(i for i in range(i0,len(W)) if norm(W[i][2])==norm(last))
    s=lo_min(max(0,W[i0][0]-.18),W[i0][0]-.01)
    nxt=W[i1+1][0] if i1+1<len(W) else W[i1][1]+.3
    e=lo_min(W[i1][1],max(W[i1][1]+.02,min(W[i1][1]+.2,nxt-.02)))
    x=d[int(s*SR):int(e*SR)].copy(); f=int(.012*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f)
    voice.append(x); voice.append(np.zeros(int(GAP*SR)))
    words=[[round(w[0]-s+cur,3),round(w[1]-s+cur,3),w[2]] for w in W[i0:i1+1]]
    segs.append(dict(k=name,src=[round(float(s),2),round(float(e),2)],a=round(cur,3),b=round(cur+(e-s),3),words=words))
    cur+=len(x)/SR+GAP
y=np.concatenate(voice)
with wave.open('voz_resumo_src.wav','wb') as o: o.setnchannels(1);o.setsampwidth(2);o.setframerate(SR);o.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
json.dump(dict(segs=segs,total=len(y)/SR),open('segs_src.json','w'),ensure_ascii=False)
for s in segs: print(s['k'],s['src'],round(s['b']-s['a'],1),' '.join(w[2] for w in s['words']))
print('total fonte',round(len(y)/SR,1),'s -> a 1,2x',round(len(y)/SR/1.2,1),'s')
