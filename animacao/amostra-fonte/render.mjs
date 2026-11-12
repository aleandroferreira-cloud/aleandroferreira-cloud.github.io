import puppeteer from 'puppeteer-core';
import {pathToFileURL} from 'url';import {mkdirSync,writeFileSync} from 'fs';
const mode=process.argv[2];const b=await puppeteer.launch({executablePath:'/opt/pw-browsers/chromium',headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(pathToFileURL('amostra.html').href);await new Promise(r=>setTimeout(r,500));
const dur=await p.evaluate('DURO');
if(mode==='sheet'){const ts=process.argv[3].split(',').map(Number);mkdirSync('chk',{recursive:true});for(const t of ts){const u=await p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',.9)},t);writeFileSync(`chk/s_${String(t).replace('.','_')}.jpg`,Buffer.from(u.split(',')[1],'base64'))}}
else{mkdirSync('frames',{recursive:true});const fps=30,n=Math.floor(dur*fps);for(let i=0;i<n;i++){const u=await p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},i/fps);writeFileSync(`frames/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(u.split(',')[1],'base64'))}console.log('frames',n,'dur',dur)}
await b.close();
