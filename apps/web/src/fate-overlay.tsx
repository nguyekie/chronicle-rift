import {useEffect,useRef,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import type {GameEvent} from '@chronicle/game-engine';
import './fate-overlay.css';

const fateTypes=new Set(['FATE_DICE','FATE_JACKPOT','FATE_BACKFIRE','FATE_DRAW','FATE_ENERGY','FATE_POWER','FATE_STORM','FATE_TREASURE','FATE_LIFE']);
const dots=['','●','● ●','● ● ●','● ●\n● ●','● ●\n ● \n● ●','● ●\n● ●\n● ●'];

export function FateOverlay({events,revision}:{events:GameEvent[];revision:number|string}){
 const seen=useRef(events.length),[shown,setShown]=useState<(GameEvent&{key:number})|null>(null),[settled,setSettled]=useState(false);
 useEffect(()=>{
  const fresh=events.slice(seen.current);seen.current=events.length;
  const event=[...fresh].reverse().find(item=>fateTypes.has(item.type));
  if(!event)return;
  setSettled(false);setShown({...event,key:Date.now()});
  const settle=window.setTimeout(()=>setSettled(true),720),close=window.setTimeout(()=>setShown(null),2600);
  return()=>{window.clearTimeout(settle);window.clearTimeout(close)};
 },[revision,events]);
 if(!shown)return null;
 const rolls=shown.rolls??[];
 const coin=rolls.length===1&&(rolls[0]===0||rolls[0]===1)&&shown.type!=='FATE_DICE';
 return <div key={shown.key} className={`fate-overlay ${settled?'settled':'rolling'} ${shown.type.toLowerCase().replaceAll('_','-')}`}>
  <div className="fate-aura"/><small>{coin?'PHÁN QUYẾT VẬN MỆNH':shown.type==='FATE_DICE'?'XÚC XẮC ĐỊNH MỆNH':'VÒNG QUAY VẬN MỆNH'}</small>
  <div className="fate-rolls">{rolls.map((roll,index)=>coin?<i className="fate-coin" key={index}>{roll?'✦':'◆'}</i>:<i className="fate-die" key={index}><span>{dots[Math.max(1,Math.min(6,roll))]}</span><b>{roll}</b></i>)}</div>
  <strong>{settled?(shown.outcome??shown.message):'ĐANG TUNG…'}</strong>
  {settled&&<em>{shown.message}</em>}
 </div>;
}

export function useFateOverlay(events:GameEvent[],revision:number|string){
 const host=useRef<HTMLDivElement|null>(null),root=useRef<Root|null>(null);
 useEffect(()=>{
  const node=document.createElement('div');node.className='fate-overlay-host';document.body.appendChild(node);
  host.current=node;root.current=createRoot(node);
  return()=>{root.current?.unmount();node.remove();root.current=null;host.current=null};
 },[]);
 useEffect(()=>{root.current?.render(<FateOverlay events={events} revision={revision}/>)},[events,revision]);
}
