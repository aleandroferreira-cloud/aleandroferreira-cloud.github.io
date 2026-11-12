import subprocess,sys,numpy as np,wave
SR=48000
src,out_raw=sys.argv[1],sys.argv[2]
raw=subprocess.run(['ffmpeg','-v','error','-i',src,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
a=np.frombuffer(raw,np.float32).astype(np.float64)
# pausas longas: mantém no máximo ~0,6 s
fr=int(SR*.02); n=len(a)//fr
rms=np.array([np.sqrt(np.mean(a[i*fr:(i+1)*fr]**2)+1e-12) for i in range(n)]); db=20*np.log10(rms)
sil=db<-47
keep=[];i=0;cut=0
while i<n:
    if not sil[i]: keep.append((i*fr,(i+1)*fr)); i+=1; continue
    j=i
    while j<n and sil[j]: j+=1
    L=(j-i)*fr
    if L>SR*1.0:
        h=int(SR*.3); keep.append((i*fr,i*fr+h)); keep.append((j*fr-h,j*fr)); cut+=L-2*h
    else: keep.append((i*fr,j*fr))
    i=j
# junta trechos contíguos e emenda com micro-fade
segs=[];
for s,e in keep:
    if segs and s==segs[-1][1]: segs[-1][1]=e
    else: segs.append([s,e])
parts=[]; fd=int(SR*.02)
for s,e in segs:
    x=a[s:e].copy()
    if len(x)>2*fd: x[:fd]*=np.linspace(0,1,fd); x[-fd:]*=np.linspace(1,0,fd)
    parts.append(x)
y=np.concatenate(parts)
print('duração',round(len(a)/SR,1),'->',round(len(y)/SR,1),'s; pausas removidas',round(cut/SR,1),'s')
pcm=(np.clip(y,-1,1)*32767).astype('<i2')
with wave.open(out_raw,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
