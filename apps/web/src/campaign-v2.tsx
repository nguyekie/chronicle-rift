import {useEffect,useState} from 'react';
import {api} from './api';
import {BattleWithDeckSelection} from './advanced';
import './campaign-v2.css';
import './campaign-layout-fix.css';

type Stage={id:string;number:number;name:string;kind:string;aiLevel:string;rewardGold:number;rewardDust:number;unlocked:boolean;progress?:{stars:number}|null};
type Chapter={id:string;number:number;name:string;description:string;stages:Stage[]};
const laws=['Dòng mana bất ổn: AI ưu tiên dùng hết năng lượng.','Trọng lực nặng: đơn vị AI nhận thêm Máu.','Màn đêm chiến thuật: AI bảo toàn quân giá trị cao.','Dây chuyền chiến tranh: AI có nhiều thẻ chi phí thấp.','Phản chiếu: AI ưu tiên hóa giải đơn vị mạnh nhất.','Sao tắt: phép AI tăng sát thương.'];

export function CampaignV2(){
 const[chapters,setChapters]=useState<Chapter[]>([]),[chapterIndex,setChapterIndex]=useState(0),[selected,setSelected]=useState<Stage|null>(null),[active,setActive]=useState<Stage|null>(null),[message,setMessage]=useState('');
 const load=()=>api<Chapter[]>('/campaign').then(setChapters);useEffect(()=>{load()},[]);
 const chapter=chapters[chapterIndex];
 const start=async(stage:Stage)=>{try{await api(`/campaign/stages/${stage.id}/start`,{method:'POST'});setSelected(null);setActive(stage)}catch(error){setMessage((error as Error).message)}};
 const reward=async(stage:Stage)=>{const result=await api<any>(`/campaign/stages/${stage.id}/complete`,{method:'POST',body:JSON.stringify({won:true,turns:8,leaderHealth:80})});setMessage(result.alreadyClaimed?'Phần thưởng màn này đã được nhận.':`Chiến thắng · +${result.reward.gold} Vàng · +${result.reward.dust} Bụi · ${result.progress.stars} sao`);setActive(null);load()};
 const difficulty=(chapter?.number??1)*8+(active?.number??0);
 if(active)return <section className="chapter-battle"><button className="chapter-back" onClick={()=>setActive(null)}>← Trở lại bản đồ</button><div className="battle-law"><small>LUẬT CHIẾN TRƯỜNG</small><b>{laws[(active.number-1)%laws.length]}</b><span>AI cấp {difficulty} · bộ bài tinh tuyển 30 lá</span></div><BattleWithDeckSelection title={active.name} difficulty={difficulty} onComplete={()=>reward(active)} onBack={()=>setActive(null)}/></section>;
 if(!chapter)return <p>Đang mở bản đồ Biên Niên Sử…</p>;
 return <section className={`campaign-v2 chapter-${chapter.number}`}><div className="chapter-tabs">{chapters.map((item,index)=><button className={index===chapterIndex?'active':''} onClick={()=>{setChapterIndex(index);setSelected(null)}} key={item.id}><small>CHƯƠNG {item.number}</small><b>{item.name}</b><span>{item.stages.filter(stage=>stage.progress).length}/{item.stages.length}</span></button>)}</div><header className="chapter-hero"><small>BIÊN NIÊN SỬ · CHƯƠNG {chapter.number}</small><h2>{chapter.name}</h2><p>{chapter.description}</p><div><b>{chapter.stages.length} bản đồ</b><b>AI thích nghi</b><b>Bộ bài 30 lá</b></div></header><div className="chapter-route">{chapter.stages.map((stage,index)=><article className={`${stage.unlocked?'open':'locked'} ${stage.kind==='BOSS'?'boss':''}`} key={stage.id}><i/><button disabled={!stage.unlocked} onClick={()=>setSelected(stage)}><span>{stage.kind==='BOSS'?'♛':stage.number}</span></button><div><small>MÀN {stage.number} · {stage.aiLevel}</small><b>{stage.name}</b><p>{laws[index%laws.length]}</p><em>{stage.progress?'★'.repeat(stage.progress.stars):stage.unlocked?`${stage.rewardGold} Vàng · ${stage.rewardDust} Bụi`:'Khóa'}</em></div></article>)}</div>{selected&&<div className="chapter-modal"><div className={`chapter-art chapter-art-${selected.number%6}`}/><small>MÀN {selected.number} · AI {selected.aiLevel}</small><h2>{selected.name}</h2><p>{laws[(selected.number-1)%laws.length]}</p><ul><li>Bộ bài AI gồm 30 lá được chọn theo sức mạnh và đường cong năng lượng.</li><li>AI tính trao đổi quân, sát thương kết liễu và chuỗi thẻ trong lượt.</li><li>Phần thưởng: {selected.rewardGold} Vàng · {selected.rewardDust} Bụi.</li></ul><button onClick={()=>start(selected)}>CHỌN BỘ BÀI & VÀO TRẬN</button><button className="close" onClick={()=>setSelected(null)}>Đóng</button></div>}{message&&<div className="map-message">{message}</div>}</section>
}
