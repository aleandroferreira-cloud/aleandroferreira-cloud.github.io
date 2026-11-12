import json,wave,numpy as np
SR=48000
segs=json.load(open('segs_src.json'))['segs']
w=wave.open('voz_resumo_src.wav'); v=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
DUR=len(v)/SR+1.0; N=int(DUR*SR); v=np.pad(v,(0,N-len(v)))
rng=np.random.default_rng(5)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
win=int(SR*.06); ve=np.convolve(np.abs(v),np.ones(win)/win,'same'); ve=np.repeat(lp(ve[::24],8),24)[:N]; ve=np.pad(ve,(0,N-len(ve)),mode='edge'); ve=np.clip(ve/(np.percentile(ve,95)+1e-9),0,1)
def tt(d): return np.arange(int(d*SR))/SR
def ks(f,d,amp,decay=.996):
    Np=int(SR/f); L=int(d*SR); b=np.zeros(L+Np*2); b[:Np]=np.convolve(rng.uniform(-1,1,Np),np.ones(5)/5,'same')
    for j in range(1,L//Np+2):
        a,z=(j-1)*Np,j*Np
        if z+Np>len(b): break
        pv=b[a:z]; pv1=np.concatenate(([b[a-1] if a>0 else 0.0],pv[:-1])); b[z:z+Np]=decay*.5*(pv+pv1)
    x=b[:L]; e=np.ones(L); na=int(.004*SR); e[:na]=np.linspace(0,1,na); nd=int(.25*SR); e[-nd:]*=np.linspace(1,0,nd); return x*e*amp
mf=lambda m:440*2**((m-69)/12)
M=np.zeros(N); beat=60/78; bar=beat*4; prog=[[48,55,64,67],[45,57,64,69],[41,57,60,65],[43,55,62,67]]
pos=0.0;b=0
while pos<DUR:
    ch=prog[b%4]
    for m in ch[1:]:
        d=bar+.8; x=(np.sin(2*np.pi*mf(m)*tt(d))+np.sin(2*np.pi*mf(m)*1.004*tt(d)))*.010; e=np.ones(len(x)); na=int(.7*SR); e[:na]=np.linspace(0,1,na); e[-na:]*=np.linspace(1,0,na); i=int(pos*SR)
        if i<N: j=min(N,i+len(x)); M[i:j]+=(x*e)[:j-i]
    for k in range(8):
        if rng.random()<.7:
            i=int((pos+k*beat/2)*SR)
            if i>=N: continue
            x=ks(mf(ch[[1,2,3,2,1,3,2,3][k]]+(12 if k%4==3 else 0)),1.2,.055); j=min(N,i+len(x)); M[i:j]+=x[:j-i]
    pos+=bar;b+=1
M[:int(1.5*SR)]*=np.linspace(0,1,int(1.5*SR)); fo=int(3*SR); M[-fo:]*=np.linspace(1,0,fo); M*=1-.55*ve
S=np.zeros(N)
def put(x,t):
    i=int(t*SR)
    if 0<=i<N: j=min(N,i+len(x)); S[i:j]+=x[:j-i]
def page():
    n=rng.standard_normal(int(.18*SR)); x=lp(n,4500)-lp(n,1200); return x*np.sin(np.linspace(0,np.pi,len(x)))**2*.10
def tick():
    t=tt(.05); x=np.sin(2*np.pi*1150*t)*np.exp(-t*90)*.5; return x*.09
for s in segs:
    put(page(),s['a']+.0)
    if s['k'] in ('p1','p2','p3','p4','p5'): put(tick(),s['a']+.35)
S*=1-.4*ve
mix=v+M+S; pk=np.max(np.abs(mix)); mix*=min(1,.84/pk)
with wave.open('mix_resumo_src.wav','wb') as o: o.setnchannels(1);o.setsampwidth(2);o.setframerate(SR);o.writeframes((np.clip(mix,-1,1)*32000).astype('<i2').tobytes())
r=lambda x:round(20*np.log10(np.sqrt(np.mean(x**2))+1e-9),1)
print('RMS voz',r(v),'música',r(M),'efeitos',r(S[np.abs(S)>1e-5]),'dur',round(DUR,1))
