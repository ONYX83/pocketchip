import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChipEngine,INITIAL_PATTERN,type Pattern,type Wave} from './audio';
import './style.css';
const TRACKS=[{name:'LEAD',icon:'◆',color:'#ffc857'},{name:'BASS',icon:'●',color:'#ff75a0'}];
function App(){
  const engine=useRef<ChipEngine|null>(null);
  if(!engine.current)engine.current=new ChipEngine();
  const [pattern,setPattern]=useState<Pattern>(()=>INITIAL_PATTERN.map(r=>[...r]));
  const [selected,setSelected]=useState(0);
  const [waves,setWaves]=useState<Wave[]>(['square','pulse']);
  const [bpm,setBpm]=useState(120);
  const [playing,setPlaying]=useState(false);
  const [step,setStep]=useState(-1);
  const [error,setError]=useState('');
  useEffect(()=>{engine.current?.setPattern(pattern)},[pattern]);
  useEffect(()=>{engine.current?.setBpm(bpm)},[bpm]);
  useEffect(()=>()=>engine.current?.stop(),[]);
  const toggle=(track:number,i:number)=>setPattern(p=>p.map((row,r)=>r===track?row.map((v,j)=>i===j?!v:v):row));
  async function play(){if(playing){engine.current?.stop();setPlaying(false);return;}try{await engine.current!.start(setStep);setPlaying(true);setError('')}catch{setError('Audio could not start. Tap Play again or check browser audio settings.')}}
  const wave=(w:Wave)=>{setWaves(prev=>prev.map((v,i)=>i===selected?w:v));engine.current?.setWave(selected,w)};
  return <main className="shell">
    <header><div><span className="eyebrow">★ 8-BIT ARCADE MUSIC LAB ★</span><h1>POCKET<span>CHIP</span><i>✦</i></h1><p>Tap a beat. Make a loop. Have fun.</p></div><div className="logo">♫</div></header>
    <section className="panel"><div className="section-title"><span>01 / THE LOOP MACHINE</span><span className="live">{playing?'● LIVE':'● READY'}</span></div>
      <div className="track-tabs">{TRACKS.map((t,i)=><button key={t.name} className={'track '+(selected===i?'selected':'')} style={{'--track':t.color} as React.CSSProperties} onClick={()=>setSelected(i)}><strong>{t.icon}</strong><span>{t.name}</span></button>)}</div>
      <div className="beat-head"><span>{TRACKS[selected].icon} {TRACKS[selected].name} PATTERN</span><span>16 STEPS · 1 BAR</span></div>
      <div className="grid">{pattern[selected].map((active,i)=><button key={i} aria-label={`${TRACKS[selected].name} step ${i+1} ${active?'on':'off'}`} aria-pressed={active} className={'cell '+(active?'on ':'')+(step===i?'playhead ':'')+(Math.floor(i/4)%2?'alternate':'')} style={{'--track':TRACKS[selected].color} as React.CSSProperties} onClick={()=>toggle(selected,i)}>{active?'✦':''}</button>)}</div>
      <div className="counts">{[1,2,3,4].map(n=><span key={n}>{String(n).padStart(2,'0')}</span>)}</div>
      <div className="actions"><button className="play" onClick={play}>{playing?'■ STOP':'▶ PLAY'}</button><button className="secondary" onClick={()=>setPattern(p=>p.map((row,r)=>r===selected?row.map(()=>false):row))}>CLEAR</button><button className="secondary" onClick={()=>setPattern(p=>p.map((row,r)=>r===selected?row.map((_,i)=>i%4===0||Math.random()<0.22):row))}>⚄ MIX IT!</button></div>
      {error&&<p role="alert" className="error">{error}</p>}
    </section>
    <section className="panel"><div className="section-title"><span>02 / CHIP SOUND</span><span>OSCILLATOR</span></div><div className="wave-options"><button className={waves[selected]==='square'?'chosen':''} onClick={()=>wave('square')}><span className="wave-icon">▔▏▁▏▔</span>SQUARE</button><button className={waves[selected]==='pulse'?'chosen':''} onClick={()=>wave('pulse')}><span className="wave-icon">▔▏▁▁▁▏▔</span>PULSE</button></div><p className="hint">Choose a track above, then give it a crunchy 8-bit voice.</p></section>
    <section className="panel"><div className="section-title"><span>03 / SPEED CONTROL</span><span>{bpm} BPM</span></div><input aria-label="Tempo in beats per minute" type="range" min="60" max="200" step="5" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><div className="tempo-labels"><span>CHILL · 60</span><span>200 · TURBO</span></div></section>
    <footer>POCKETCHIP v0.1 <span>★</span> MADE FOR HAPPY ACCIDENTS</footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);