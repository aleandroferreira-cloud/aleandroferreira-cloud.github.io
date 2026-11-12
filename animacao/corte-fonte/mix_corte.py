# Mix discreto: voz limpa + trilha suave bem baixa + poucos efeitos delicados (todos abaixam quando a voz fala).
import sys,json,wave,numpy as np
SR=48000; DUR=687.8; N=int(SR*DUR)
rng=np.random.default_rng(11)
voz_path,cues_path,out_path=sys.argv[1:4]
w=wave.open(voz_path); assert w.getframerate()==SR
v=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float64)/32768
v=np.pad(v,(0,max(0,N-len(v))))[:N]
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
win=int(SR*.06); ve=np.convolve(np.abs(v),np.ones(win)/win,'same'); ve=lp(ve[::24],8); ve=np.repeat(ve,24)[:N]
ve=np.pad(ve,(0,N-len(ve)),mode='edge'); ve=np.clip(ve/(np.percentile(ve,95)+1e-9),0,1)
duck_m=1-.55*ve; duck_s=1-.4*ve
def tt(d): return np.arange(int(d*SR))/SR
def ks(f,d,amp,decay=.996):
    Np=int(SR/f); L=int(d*SR); b=np.zeros(L+Np*2); b[:Np]=rng.uniform(-1,1,Np)
    # suaviza a excitação (som de nylon, sem brilho)
    k=np.ones(5)/5; b[:Np]=np.convolve(b[:Np],k,'same')
    for j in range(1,L//Np+2):
        a,z=(j-1)*Np,j*Np
        if z+Np>len(b): break
        pv=b[a:z]; pv1=np.concatenate(([b[a-1] if a>0 else 0.0],pv[:-1])); b[z:z+Np]=decay*.5*(pv+pv1)
    x=b[:L]; e=np.ones(L); na=int(.004*SR); e[:na]=np.linspace(0,1,na); nd=int(.25*SR); e[-nd:]*=np.linspace(1,0,nd)
    return x*e*amp
# ---- música ----
M=np.zeros(N); BPM=66; beat=60/BPM; bar=beat*4
mf=lambda m:440*2**((m-69)/12)
prog=[[48,55,64,67],[45,57,64,69],[41,57,60,65],[43,55,62,67]]
pos=0.0;b=0
while pos<DUR:
    ch=prog[b%4]; t0=pos
    # pad bem baixinho
    for m in ch[1:]:
        d=bar+.8; x=(np.sin(2*np.pi*mf(m)*tt(d))+np.sin(2*np.pi*mf(m)*1.004*tt(d)))*.010
        e=np.ones(len(x)); na=int(.9*SR); e[:na]=np.linspace(0,1,na); e[-na:]*=np.linspace(1,0,na); i=int(t0*SR)
        if i<N: j=min(N,i+len(x)); M[i:j]+=(x*e)[:j-i]
    # baixo suave, só no primeiro tempo
    d=beat*2.6; xb=np.sin(2*np.pi*mf(ch[0])*tt(d))*np.exp(-tt(d)*1.6)*.035; i=int(t0*SR)
    if i<N: j=min(N,i+len(xb)); M[i:j]+=xb[:j-i]
    # arpejo esparso (nem toda colcheia toca)
    for k in range(8):
        if rng.random()<.62:
            m=ch[[1,2,3,2,1,3,2,3][k]]+(12 if k%4==3 else 0)
            i=int((t0+k*beat/2)*SR)
            if i>=N: continue
            x=ks(mf(m),1.3,.05+.02*rng.random()); j=min(N,i+len(x)); M[i:j]+=x[:j-i]
    pos+=bar; b+=1
fi=int(4*SR); M[:fi]*=np.linspace(0,1,fi); fo=int(6*SR); M[-fo:]*=np.linspace(1,0,fo)
M*=duck_m
# ---- efeitos delicados ----
S=np.zeros(N)
def put(x,t,g=1.0):
    i=int(t*SR); 
    if i<0 or i>=N: return
    j=min(N,i+len(x)); S[i:j]+=(x*g)[:j-i]
def page(): 
    n=rng.standard_normal(int(.20*SR)); x=lp(n,4500)-lp(n,1200); return x*np.sin(np.linspace(0,np.pi,len(x)))**2*.12
def tick():
    t=tt(.05); x=np.sin(2*np.pi*1150*t)*np.exp(-t*90)*.5; n=rng.standard_normal(len(t)); x+= (lp(n,5000)-lp(n,1500))*np.exp(-t*140)*.4; return x*.10
def bell():
    t=tt(1.2); f=1318; return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.4*t)+.2*np.sin(2*np.pi*f*4.1*t))*np.exp(-t*4.2)*.045
def stamp():
    t=tt(.22); f=np.linspace(95,55,len(t)); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*16); n=rng.standard_normal(len(t)); x+=lp(n,900)*np.exp(-t*50)*.4; return x*.12
mk={'page':page,'tick':tick,'bell':bell,'stamp':stamp}
for kind,t in json.load(open(cues_path)):
    put(mk[kind](),t+.02,1.0)
S*=duck_s
mix=v+M+S
pk=np.max(np.abs(mix)); 
if pk>.84: mix*=.84/pk
pcm=(np.clip(mix,-1,1)*32000).astype('<i2')
with wave.open(out_path,'wb') as o: o.setnchannels(1);o.setsampwidth(2);o.setframerate(SR);o.writeframes(pcm.tobytes())
rms=lambda x:round(20*np.log10(np.sqrt(np.mean(x**2))+1e-9),1)
print('RMS dB  voz',rms(v),' música',rms(M),' efeitos',rms(S[np.abs(S)>1e-5]) if np.any(np.abs(S)>1e-5) else None,' pico mix',round(20*np.log10(np.max(np.abs(mix))),1))
