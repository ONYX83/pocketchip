import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChipEngine,makeProject,isProject,randomizeTrack,SCALE_INTERVALS,midiFor,type Project,type Wave} from './audio';
import './style.css';
const LABELS=['LEAD','BASS','ARP','DRUMS'],ICONS=['◆','●','✦','▣'],COLORS=['#ffc857','#ff75a0','#8de5ff','#a6ed83'];
const NOTES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const KEY='pocketchip-v02-project';
function load():Project{try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(isProject(data))return data;}catch{}return makeProject();}
function App(){
 const engine=useRef<ChipEngine|null>(null);if(!engine.current)engine.current=new ChipEngine();
 const [project,setProject]=useState<Project>(load),[selected,setSelected]=useState(0),[step,setStep]=useState(-1),[playing,setPlaying]=useState(false),[mode,setMode]=useState<'beats'|'notes'>('beats'),[error,setError]=useState(''),[saved,setSaved]=useState(true);
 const [editStep,setEditStep]=useState(0);
 useEffect(()=>{engine.current?.setProject(project);setSaved(false);const id=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(project));setSaved(true);}catch{setError('Autosave unavailable: check browser storage settings.')}},300);return()=>clearTimeout(id)},[project]);
 useEffect(()=>()=>engine.current?.stop(),[]);
 function change(fn:(p:Project)=>void){setProject(p=>{const next=structuredClone(p);fn(next);return next})}
 async function play(){if(playing){engine.current?.stop();setPlaying(false);return;}try{await engine.current!.start(setStep);setPlaying(true);setError('')}catch{setError('Audio could not start. Tap Play again.')}}
 const degrees=SCALE_INTERVALS[project.scale];
 const track=project.tracks[selected];
 return <main className="shell"><header><div><span className="eyebrow">★ 8-BIT ARCADE MUSIC LAB ★</span><h1>POCKET<span>CHIP</span><i>✦</i></h1><p>Make a beat. Shape a melody. Play!</p></div><div className="logo">♫</div></header>
 <section className="panel"><div className="section-title"><span>01 / LOOP MACHINE</span><span className="live">{playing?'● LIVE':'● READY'}</span></div>
 <div className="track-tabs four">{LABELS.map((name,i)=><button key={name} className={'track '+(selected===i?'selected':'')} style={{'--track':COLORS[i]} as React.CSSProperties} onClick={()=>{setSelected(i);setEditStep(0)}}><strong>{ICONS[i]}</strong><span>{name}</span></button>)}</div>
 <div className="mode-tabs"><button className={mode==='beats'?'chosen':''} onClick={()=>setMode('beats')}>▦ BEATS</button><button className={mode==='notes'?'chosen':''} onClick={()=>setMode('notes')}>♫ NOTES</button></div>
 <div className="beat-head"><span>{ICONS[selected]} {LABELS[selected]} PATTERN</span><span>16 STEPS</span></div>
 <div className="grid">{track.map((s,i)=><button key={i} aria-label={`${LABELS[selected]} step ${i+1} ${s.on?'on':'off'}`} aria-pressed={s.on} className={'cell '+(s.on?'on ':'')+(step===i?'playhead ':'')+(editStep===i&&mode==='notes'?'editing ':'')+(Math.floor(i/4)%2?'alternate':'')} style={{'--track':COLORS[selected]} as React.CSSProperties} onClick={()=>{if(mode==='beats')change(p=>{p.tracks[selected][i].on=!p.tracks[selected][i].on});else setEditStep(i)}}>{mode==='notes'&&selected!==3?s.degree+1:s.on?'✦':''}</button>)}</div>
 <div className="counts">{[1,2,3,4].map(n=><span key={n}>{String(n).padStart(2,'0')}</span>)}</div>
 {mode==='notes'&&<div className="note-editor"><div className="beat-head"><span>EDIT STEP {editStep+1}</span><span>{selected===3?'DRUM VOICE':'SCALE-LOCKED PITCH'}</span></div><div className="pitch-grid">{(selected===3?['KICK','SNARE','HAT']:Array.from({length:degrees.length*2},(_,i)=>NOTES[midiFor(project,selected,i)%12]+(Math.floor(midiFor(project,selected,i)/12)-1))).map((label,i)=><button key={i} className={track[editStep].degree===i?'chosen':''} onClick={()=>change(p=>{p.tracks[selected][editStep].degree=i;p.tracks[selected][editStep].on=true})}>{label}</button>)}</div><button className="secondary wide" onClick={()=>change(p=>{p.tracks[selected][editStep].on=!p.tracks[selected][editStep].on})}>{track[editStep].on?'MUTE STEP':'ENABLE STEP'}</button></div>}
 <div className="actions"><button className="play" onClick={play}>{playing?'■ STOP':'▶ PLAY'}</button><button className="secondary" onClick={()=>change(p=>{p.tracks[selected].forEach(s=>s.on=false)})}>CLEAR</button><button className="secondary" onClick={()=>setProject(p=>randomizeTrack(p,selected))}>⚄ MIX IT!</button></div>
 {error&&<p className="error" role="alert">{error}</p>}</section>
 <section className="panel"><div className="section-title"><span>02 / MELODY SETTINGS</span><span>♪ SCALE LOCK</span></div><div className="setting-grid"><label>ROOT NOTE<select value={project.root} onChange={e=>change(p=>{p.root=Number(e.target.value)})}>{NOTES.map((n,i)=><option key={i} value={i}>{n}</option>)}</select></label><label>SCALE<select value={project.scale} onChange={e=>change(p=>{p.scale=e.target.value as Project['scale'];p.tracks.forEach((row,t)=>{if(t!==3)row.forEach(s=>s.degree=Math.min(s.degree,SCALE_INTERVALS[p.scale].length*2-1))})})}><option value="minor">MINOR</option><option value="major">MAJOR</option><option value="pentatonic">PENTATONIC</option></select></label></div></section>
 <section className="panel"><div className="section-title"><span>03 / CHIP SOUNDS</span><span>PRESETS</span></div><div className="wave-options">{(selected===3?['noise']:['square','pulse','triangle'] as Wave[]).map(w=><button key={w} className={project.waves[selected]===w?'chosen':''} onClick={()=>change(p=>{p.waves[selected]=w as Wave})}>{w.toUpperCase()}</button>)}</div><p className="hint">Try Pulse Lead, Square Bass, Triangle Arp and Noise Drums.</p></section>
 <section className="panel"><div className="section-title"><span>04 / SPEED CONTROL</span><span>{project.bpm} BPM</span></div><input aria-label="Tempo" type="range" min="60" max="200" step="5" value={project.bpm} onChange={e=>change(p=>{p.bpm=Number(e.target.value)})}/><div className="tempo-labels"><span>CHILL · 60</span><span>200 · TURBO</span></div></section>
 <footer>POCKETCHIP v0.2 <span>★</span> {saved?'AUTOSAVED ✓':'SAVING…'}</footer></main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);