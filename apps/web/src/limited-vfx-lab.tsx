import { useEffect, useState } from 'react';
import { cards } from '@chronicle/card-data';
import { cardArt } from './card-art';
import './limited-vfx-lab.css';

const effects:Record<string,{slug:string;label:string}>={
  'IV-028':{slug:'valen-blade',label:'THÁNH KIẾM PHÁ TRẬN'},
  'IV-029':{slug:'last-bastion',label:'HÀO LŨY BẤT DIỆT'},
  'IV-030':{slug:'eclipse-rider',label:'KỴ SĨ NHẬT THỰC'},
  'AR-028':{slug:'void-crown',label:'VƯƠNG MIỆN HƯ KHÔNG'},
  'AR-029':{slug:'starfall',label:'MƯA SAO BĂNG'},
  'AR-030':{slug:'time-break',label:'ELIRA BẺ GÃY THỜI GIAN'},
  'NE-028':{slug:'balance',label:'CÂN BẰNG TUYỆT ĐỐI'},
  'NE-029':{slug:'origin-shard',label:'MẢNH VỠ KHỞI NGUYÊN'},
  'NE-030':{slug:'first-riftborn',label:'RIFTBORN THỨC TỈNH'},
};

export function LimitedVfxLab(){
  const limited=cards.filter(card=>card.rarity==='LIMITED'&&effects[card.code]);
  const[active,setActive]=useState<{key:number;slug:string;label:string}|null>(null);
  const[auto,setAuto]=useState(false),[cursor,setCursor]=useState(0);
  const play=(index:number)=>{const card=limited[index];if(!card)return;const effect=effects[card.code];if(!effect)return;setCursor(index);setActive({key:Date.now(),slug:effect.slug,label:effect.label});window.setTimeout(()=>setActive(null),2600)};
  useEffect(()=>{if(!auto)return;play(cursor);const timer=window.setInterval(()=>setCursor(value=>(value+1)%limited.length),3100);return()=>window.clearInterval(timer)},[auto]);
  useEffect(()=>{if(auto)play(cursor)},[cursor]);
  return <main className="vfx-lab">
    <header><div><small>CHRONICLE RIFT · PHÒNG THỬ ĐỘC LẬP</small><h1>Hiệu ứng thẻ Limited</h1><p>Không cần đăng nhập · Không gọi API · Không thay đổi tài khoản hoặc kho seri.</p></div><a href="/#">Về trang game</a></header>
    <section className="vfx-stage"><div className="lab-board"><span>ĐỐI THỦ</span><i/><b>◆ KHE NỨT CHRONICLE ◆</b><i/><span>BẠN</span></div><div className="stage-note">Chọn một thẻ bên dưới để phát lại hiệu ứng triệu hồi.</div></section>
    <div className="lab-controls"><button className={auto?'active':''} onClick={()=>setAuto(value=>!value)}>{auto?'DỪNG TRÌNH DIỄN':'TỰ ĐỘNG TRÌNH DIỄN TẤT CẢ'}</button><span>{limited.length} hiệu ứng Limited</span></div>
    <section className="vfx-list">{limited.map((card,index)=>{const art=cardArt(card.name,card.code);return <button key={card.code} onClick={()=>play(index)} className={cursor===index?'selected':''}><span className={`lab-card-art ${art.className}`} style={art.style}/><small>{card.code} · {card.faction}</small><b>{card.name}</b><em>{card.description}</em><strong>▶ PHÁT HIỆU ỨNG</strong></button>})}</section>
    {active&&<div key={active.key} className={`limited-cinematic limited-${active.slug} owner-keeper`}><i/><i/><i/>{active.slug==='eclipse-rider'&&<video className="limited-alpha-video" autoPlay muted playsInline preload="auto"><source src="/vfx/eclipse-rider.webm" type="video/webm"/></video>}<span className="limited-particles">{Array.from({length:18},(_,index)=><i key={index}/>)}</span><div><small>THỬ NGHIỆM HIỆU ỨNG GIỚI HẠN</small><b>{active.label}</b></div></div>}
  </main>
}
