export type Wave = 'square' | 'pulse';
export type Pattern = boolean[][];
export const INITIAL_PATTERN: Pattern = [
  [true,false,false,true,false,false,true,false,true,false,false,true,false,true,false,false],
  [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false]
];
export class ChipEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private active: Set<OscillatorNode> = new Set();
  private onStep: (step:number)=>void = ()=>{};
  private bpm = 120;
  private pattern: Pattern = INITIAL_PATTERN;
  private waves: Wave[] = ['square','pulse'];
  private notes: number[][] = [
    [72,72,76,79,72,72,76,79,84,79,76,72,79,76,72,72],
    [48,48,48,48,53,53,53,53,55,55,55,55,48,48,48,48]
  ];
  async start(onStep:(step:number)=>void) {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.23;
      this.master.connect(this.ctx.destination);
    }
    await this.ctx.resume();
    this.onStep = onStep;
    if (this.timer!==null) return;
    this.step=0;
    this.nextTime=this.ctx.currentTime+0.06;
    this.tick();
    this.timer=window.setInterval(()=>this.tick(),25);
  }
  stop() {
    if(this.timer!==null) window.clearInterval(this.timer);
    this.timer=null;
    this.active.forEach(osc=>{try{osc.stop()}catch{}});
    this.active.clear();
    this.onStep(-1);
  }
  setBpm(v:number){this.bpm=v;}
  setPattern(p:Pattern){this.pattern=p;}
  setWave(track:number,wave:Wave){this.waves[track]=wave;}
  setNote(track:number,step:number,note:number){this.notes[track][step]=note;}
  private tick(){
    if(!this.ctx)return;
    while(this.nextTime<this.ctx.currentTime+0.12){
      const index=this.step;
      for(let t=0;t<this.pattern.length;t++) if(this.pattern[t][index]) this.play(t,index,this.nextTime);
      const delay=Math.max(0,(this.nextTime-this.ctx.currentTime)*1000);
      window.setTimeout(()=>{if(this.timer!==null)this.onStep(index)},delay);
      this.nextTime+=60/this.bpm/4;
      this.step=(this.step+1)%16;
    }
  }
  private play(track:number,step:number,at:number){
    if(!this.ctx||!this.master)return;
    const osc=this.ctx.createOscillator();
    const gain=this.ctx.createGain();
    const freq=440*Math.pow(2,(this.notes[track][step]-69)/12);
    osc.type='square';
    osc.frequency.setValueAtTime(freq,at);
    if(this.waves[track]==='pulse'){
      const harmonics=32;
      const real=new Float32Array(harmonics+1);
      const imag=new Float32Array(harmonics+1);
      for(let n=1;n<=harmonics;n++){
        real[n]=2*Math.sin(2*Math.PI*n*0.25)/(Math.PI*n);
        imag[n]=2*(1-Math.cos(2*Math.PI*n*0.25))/(Math.PI*n);
      }
      osc.setPeriodicWave(this.ctx.createPeriodicWave(real,imag,{disableNormalization:false}));
    }
    const length=Math.min(0.18,60/this.bpm/4*0.88);
    gain.gain.setValueAtTime(0.0001,at);
    gain.gain.exponentialRampToValueAtTime(track===0?0.5:0.38,at+0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001,at+length);
    osc.connect(gain).connect(this.master);
    osc.start(at);
    osc.stop(at+length+0.01);
    this.active.add(osc);
    osc.onended=()=>{this.active.delete(osc);osc.disconnect();gain.disconnect()};
  }
}