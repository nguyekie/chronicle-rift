import {useEffect,useRef} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import type {GameEvent} from '@chronicle/game-engine';
import './trinity-victory.css';

function TrinityScene({event}:{event:GameEvent}){
 return <div className="trinity-victory" role="status" aria-label="Tam Ấn Khải Hoàn">
  <div className="trinity-key-art"/>
  <div className="trinity-vignette"/><div className="trinity-flash"/><div className="trinity-shockwave"/><div className="trinity-rune-ring"/>
  <section className="trinity-seals">
   <i className="seal-eye"><span>◉</span><b>NHÃN ẤN</b><em>THẤU SUỐT VẬN MỆNH</em></i>
   <i className="seal-hand"><span>♜</span><b>THỦ ẤN</b><em>NẮM GIỮ QUYỀN NĂNG</em></i>
   <i className="seal-heart"><span>♥</span><b>TÂM ẤN</b><em>PHÁN QUYẾT SINH MỆNH</em></i>
  </section>
  <div className="trinity-title"><small>BA THÁNH ẤN ĐÃ HỢP NHẤT</small><strong>TAM ẤN KHẢI HOÀN</strong><em>CHIẾN THẮNG TỨC THÌ</em><p>{event.message}</p></div>
  <div className="trinity-shards">{Array.from({length:30},(_,index)=><i style={{'--i':index} as React.CSSProperties} key={index}/>)}</div>
 </div>;
}

function playTrinitySound(){
 try{
  const Audio=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Audio)return;
  const context=new Audio(),master=context.createGain();master.gain.setValueAtTime(.0001,context.currentTime);master.gain.exponentialRampToValueAtTime(.16,context.currentTime+.12);master.gain.exponentialRampToValueAtTime(.0001,context.currentTime+3.8);master.connect(context.destination);
  [110,164.81,220,329.63].forEach((frequency,index)=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=index<2?'sawtooth':'sine';oscillator.frequency.setValueAtTime(frequency,context.currentTime);oscillator.frequency.exponentialRampToValueAtTime(frequency*2,context.currentTime+2.6);gain.gain.value=.18/(index+1);oscillator.connect(gain).connect(master);oscillator.start(context.currentTime+index*.08);oscillator.stop(context.currentTime+3.9)});
  window.setTimeout(()=>context.close(),4200);
 }catch{/* Trình duyệt có thể chặn âm thanh; hình ảnh vẫn chạy bình thường. */}
}

export function useTrinityVictory(events:GameEvent[],revision:number|string){
 const seen=useRef(events.length),root=useRef<Root|null>(null),timer=useRef<number|undefined>(undefined);
 useEffect(()=>{const node=document.createElement('div');node.className='trinity-victory-host';document.body.appendChild(node);root.current=createRoot(node);return()=>{if(timer.current)clearTimeout(timer.current);document.body.classList.remove('trinity-active');root.current?.unmount();node.remove()}},[]);
 useEffect(()=>{
  const fresh=events.slice(seen.current);seen.current=events.length;
  const event=[...fresh].reverse().find(item=>item.type==='TRINITY_VICTORY');if(!event)return;
  if(timer.current)clearTimeout(timer.current);document.body.classList.add('trinity-active');playTrinitySound();root.current?.render(<TrinityScene event={event}/>);
  timer.current=window.setTimeout(()=>{root.current?.render(null);document.body.classList.remove('trinity-active')},6500);
 },[events,revision]);
}
