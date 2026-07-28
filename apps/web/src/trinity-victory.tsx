import {useEffect,useRef,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import type {GameEvent} from '@chronicle/game-engine';
import './trinity-victory.css';

function TrinityScene({event}:{event:GameEvent}){
 return <div className="trinity-victory">
  <div className="trinity-rift"/><div className="trinity-rays"/>
  <section className="trinity-seals">
   <i className="seal-eye"><span>◉</span><b>NHÃN ẤN</b></i>
   <i className="seal-hand"><span>♜</span><b>THỦ ẤN</b></i>
   <i className="seal-heart"><span>♥</span><b>TÂM ẤN</b></i>
  </section>
  <div className="trinity-title"><small>BA MẢNH KHẢI HUYỀN ĐÃ HỢP NHẤT</small><strong>TAM ẤN KHẢI HOÀN</strong><em>CHIẾN THẮNG TỨC THÌ</em><p>{event.message}</p></div>
  <div className="trinity-shards">{Array.from({length:24},(_,index)=><i key={index}/>)}</div>
 </div>;
}

export function useTrinityVictory(events:GameEvent[],revision:number|string){
 const seen=useRef(events.length),host=useRef<HTMLDivElement|null>(null),root=useRef<Root|null>(null),timer=useRef<number|undefined>(undefined);
 useEffect(()=>{const node=document.createElement('div');document.body.appendChild(node);host.current=node;root.current=createRoot(node);return()=>{if(timer.current)window.clearTimeout(timer.current);root.current?.unmount();node.remove()}},[]);
 useEffect(()=>{
  const fresh=events.slice(seen.current);seen.current=events.length;
  const event=[...fresh].reverse().find(item=>item.type==='TRINITY_VICTORY');if(!event)return;
  root.current?.render(<TrinityScene event={event}/>);
  timer.current=window.setTimeout(()=>root.current?.render(null),4800);
 },[events,revision]);
}
