export type Track = 'lead'|'bass'|'arp'|'drums';
export type Wave = 'square'|'pulse'|'triangle'|'noise';
export type Scale = 'major'|'minor'|'pentatonic';
export type Step = {on:boolean;degree:number};
export type SoundControl={volume:number;length:number;crunch:number};
export const DEFAULT_CONTROLS:SoundControl[]=[0,1,2,3].map(()=>({volume:80,length:70,crunch:0}));
export type Project = {version:2;bpm:number;root:number;scale:Scale;tracks:Step[][];waves:Wave[];controls?:SoundControl[]};
export function getControls(p:Project,t:number):SoundControl{return p.controls?.[t]??DEFAULT_CONTROLS[t];}
export const TRACK_NAMES:Track[]=['lead','bass','arp','drums'];
export const SCALE_INTERVALS:Record<Scale,number[]>={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],pentatonic:[0,3,5,7,10]};
const defaults=[ [0,0,2,4,0,0,2,4,7,4,2,0,4,2,0,0], [0,0,0,0,3,3,3,3,4,4,4,4,0,0,0,0], [0,2,4,2,0,2,4,5,4,2,0,2,4,5,4,2], Array(16).fill(0) ];
const hits=[[0,3,6,8,11,13],[0,4,8,12],Array.from({length:16},(_,i)=>i),[0,2,4,6,8,10,12,14]];
export function makeProject():Project{return {version:2,bpm:120,root:0,scale:'minor',waves:['square','pulse','triangle','noise'],controls:DEFAULT_CONTROLS.map(c=>({...c})),tracks:defaults.map((notes,t)=>notes.map((degree,i)=>({degree,on:hits[t].includes(i)})))};}
export function isProject(value:unknown):value is Project {
 if(!value||typeof value!=='object')return false;
 const p=value as Partial<Project>;
 return p.version===2&&typeof p.bpm==='number'&&Number.isFinite(p.bpm)&&p.bpm>=60&&p.bpm<=200&&typeof p.root==='number'&&Number.isInteger(p.root)&&p.root>=0&&p.root<=11&&!!p.scale&&Object.keys(SCALE_INTERVALS).includes(p.scale)&&Array.isArray(p.waves)&&p.waves.length===4&&p.waves.every(w=>['square','pulse','triangle','noise'].includes(w))&&(p.controls===undefined||(Array.isArray(p.controls)&&p.controls.length===4&&p.controls.every(c=>c&&Number.isInteger(c.volume)&&c.volume>=0&&c.volume<=100&&Number.isInteger(c.length)&&c.length>=10&&c.length<=100&&Number.isInteger(c.crunch)&&c.crunch>=0&&c.crunch<=100)))&&Array.isArray(p.tracks)&&p.tracks.length===4&&p.tracks.every(row=>Array.isArray(row)&&row.length===16&&row.every(s=>s&&typeof s.on==='boolean'&&Number.isInteger(s.degree)&&s.degree>=0&&s.degree<=13));
}
export function randomizeTrack(p:Project,t:number):Project {
 const next=structuredClone(p);
 const degrees=SCALE_INTERVALS[p.scale].length;
 next.tracks[t]=next.tracks[t].map((_,i)=>({on:t===3?(i%4===0||Math.random()<0.38):t===2?(Math.random()<0.72):(i%4===0||Math.random()<0.32),degree:t===3?Math.floor(Math.random()*3):Math.floor(Math.random()*(degrees+1))}));
 return next;
}
export function midiFor(p:Project,track:number,degree:number){
 const intervals=SCALE_INTERVALS[p.scale];
 const octave=Math.floor(degree/intervals.length);
 const base=[72,48,79,48][track];
 return base+p.root+12*octave+intervals[degree%intervals.length];
}
export class ChipEngine {
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private timer:number|null=null;
 private visualTimers=new Set<number>();
 private nextTime=0;
 private step=0;
 private active=new Set<OscillatorNode|AudioBufferSourceNode>();
 private onStep:(step:number)=>void=()=>{};
 private project:Project=makeProject();
 setProject(p:Project){this.project=p;}
 async start(onStep:(step:number)=>void){
  if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=0.19;this.master.connect(this.ctx.destination);}
  await this.ctx.resume();
  if(this.timer!==null)return;
  this.onStep=onStep;this.step=0;this.nextTime=this.ctx.currentTime+0.06;
  this.timer=window.setInterval(()=>this.tick(),25);this.tick();
 }
 stop(){
  if(this.timer!==null)clearInterval(this.timer);this.timer=null;
  this.visualTimers.forEach(clearTimeout);this.visualTimers.clear();
  this.active.forEach(source=>{try{source.stop()}catch{}});this.active.clear();this.onStep(-1);
 }
 private tick(){
  if(!this.ctx||this.timer===null)return;
  while(this.nextTime<this.ctx.currentTime+0.12){
   const index=this.step;const at=this.nextTime;
   for(let t=0;t<4;t++)if(this.project.tracks[t][index].on)this.play(t,index,at);
   const id=window.setTimeout(()=>{this.visualTimers.delete(id);if(this.timer!==null)this.onStep(index)},Math.max(0,(at-this.ctx.currentTime)*1000));
   this.visualTimers.add(id);
   this.nextTime+=60/this.project.bpm/4;this.step=(this.step+1)%16;
  }
 }
 private play(track:number,step:number,at:number){
  if(!this.ctx||!this.master)return;
  const ctx=this.ctx;
  const control=getControls(this.project,track);
  const duration=Math.max(0.025,(60/this.project.bpm/4)*control.length/100);
  if(control.volume===0)return;
  const gain=ctx.createGain();
  gain.gain.setValueAtTime(0.0001,at);
  gain.gain.exponentialRampToValueAtTime((track===3?0.35:track===1?0.42:0.27)*control.volume/80,at+0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);
  const shaper=ctx.createWaveShaper();
  if(control.crunch>0){const curve=new Float32Array(256);const drive=1+control.crunch/9;for(let i=0;i<curve.length;i++){const x=i/127.5-1;curve[i]=Math.tanh(x*drive)/Math.tanh(drive);}shaper.curve=curve;gain.connect(shaper).connect(this.master);}else gain.connect(this.master);
  if(track===3){
   const length=Math.ceil(ctx.sampleRate*duration);
   const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
   const data=buffer.getChannelData(0);
   const drum=this.project.tracks[3][step].degree%3;
   for(let i=0;i<length;i++){
    const time=i/ctx.sampleRate;
    const envelope=Math.exp(-time*(drum===0?24:drum===1?45:75));
    data[i]=(drum===0?Math.sin(2*Math.PI*(120-75*time)*time)*0.85+(Math.random()*2-1)*0.15:drum===1?(Math.random()*2-1)*0.9:(Math.random()*2-1))*envelope;
   }
   const src=ctx.createBufferSource();src.buffer=buffer;src.connect(gain);src.start(at);src.stop(at+duration);
   this.active.add(src);src.onended=()=>{this.active.delete(src);src.disconnect();gain.disconnect();shaper.disconnect()};
  }else{
   const osc=ctx.createOscillator();
   osc.frequency.setValueAtTime(440*Math.pow(2,(midiFor(this.project,track,this.project.tracks[track][step].degree)-69)/12),at);
   const wave=this.project.waves[track];
   if(wave==='pulse'){
    const real=new Float32Array(33),imag=new Float32Array(33);
    for(let n=1;n<=32;n++){real[n]=2*Math.sin(2*Math.PI*n*0.25)/(Math.PI*n);imag[n]=2*(1-Math.cos(2*Math.PI*n*0.25))/(Math.PI*n);}
    osc.setPeriodicWave(ctx.createPeriodicWave(real,imag));
   }else osc.type=wave==='triangle'?'triangle':'square';
   osc.connect(gain);osc.start(at);osc.stop(at+duration+0.01);
   this.active.add(osc);osc.onended=()=>{this.active.delete(osc);osc.disconnect();gain.disconnect()};
  }
 }
}