import { useEffect, useState } from 'react';
import { api } from './api';
import { cardArt } from './card-art';
import './bulk-open.css';
import './limited-rate.css';
import './dust-pack.css';

const rarity:Record<string,string>={COMMON:'Thường',UNCOMMON:'Ít gặp',RARE:'Hiếm',EPIC:'Sử thi',LEGENDARY:'Huyền thoại',ANCIENT:'Cổ Đại',MYTHIC:'Thần thoại',CELESTIAL:'Thiên Giới',LIMITED:'Giới hạn'};
const rateOrder=['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','ANCIENT','MYTHIC','CELESTIAL','LIMITED'];
const pageSize=10;

export function PackShop(){
 const[data,setData]=useState<any>({packs:[],currency:[]});
 const[cards,setCards]=useState<any[]>([]);
 const[busy,setBusy]=useState<{done:number;total:number}|null>(null);
 const[detail,setDetail]=useState<any>();
 const[visible,setVisible]=useState(0);
 const[page,setPage]=useState(0);
 const[error,setError]=useState('');
 const[history,setHistory]=useState<any[]>([]);
 const[showHistory,setShowHistory]=useState(false);
 const load=()=>api<any>('/packs').then(setData).catch(reason=>setError((reason as Error).message));
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(cards.length&&visible<cards.length){const bulk=cards.length>5;const timer=window.setTimeout(()=>setVisible(value=>Math.min(cards.length,value+(bulk?5:1))),bulk?110:350);return()=>clearTimeout(timer)}},[cards,visible]);

 const open=async(id:string,count:1|10)=>{
  setBusy({done:0,total:count});setCards([]);setVisible(0);setPage(0);setError('');
  const opened:any[]=[];
  try{
   for(let index=0;index<count;index++){
    const result=await api<any>(`/packs/${id}/open`,{method:'POST',body:JSON.stringify({requestId:crypto.randomUUID()})});
    opened.push(...(result.opened??result.history.result));
    setBusy({done:index+1,total:count});
   }
   await new Promise(resolve=>setTimeout(resolve,350));
  }catch(reason){setError(`${(reason as Error).message||'Không thể mở gói.'}${opened.length?` · Đã mở thành công ${opened.length/5}/${count} gói trước khi gián đoạn.`:''}`)}
  finally{if(opened.length)setCards(opened);await load();setBusy(null)}
 };
 const picture=(card:any)=>cardArt(card.name,card.code);
 const balance=(code:string)=>data.currency.find((item:any)=>item.code===code)?.balance??0;
 const currencyLabel:Record<string,string>={GOLD:'VÀNG',DUST:'BỤI'};
 const pages=Math.ceil(cards.length/pageSize);
 const shownCards=cards.slice(page*pageSize,(page+1)*pageSize);
 const openHistory=async()=>{setHistory(await api<any[]>('/packs/history'));setShowHistory(true)};

 return <>
  <div className="wallet">{data.testMode&&<strong className="sandbox-badge"/>}{data.currency.map((item:any)=><b key={item.code}>{item.code}: {data.testMode?'∞':item.balance.toLocaleString('vi-VN')}</b>)}<button onClick={openHistory}>LỊCH SỬ MỞ GÓI</button></div>
  {error&&<div className="pack-error"><b>MỞ GÓI CHƯA THÀNH CÔNG</b><span>{error}</span><button onClick={()=>setError('')}>Đóng</button></div>}
  <div className="packs pack-catalog">{data.packs.map((pack:any)=>{
   const paymentCode=pack.currencyCode??'GOLD',paymentPrice=pack.price??pack.priceGold;
   const canOpenOne=data.testMode||balance(paymentCode)>=paymentPrice,canOpenTen=data.testMode||balance(paymentCode)>=paymentPrice*10;
   const limitedTotal=(data.limited??[]).reduce((sum:number,card:any)=>sum+(card.printLimit??0),0);
   const limitedRemaining=(data.limited??[]).reduce((sum:number,card:any)=>sum+Math.max(0,(card.printLimit??0)-(card.mintedCount??0)),0);
   return <article key={pack.id} className={pack.code==='RIFT_SEAL'?'seal-pack':''}>
    <div className={`pack-art art-${pack.code.length%8}`}><span>✦</span><i>CHRONICLE</i></div>
    <h2>{pack.name}</h2><p>{pack.code==='RIFT_SEAL'?'Gói duy nhất có thể xuất hiện thẻ đánh số giới hạn.':'5 thẻ · Không chứa thẻ đánh số giới hạn.'}</p>
    <div className="pack-rates"><b>TỶ LỆ CỦA MỖI LÁ</b>{rateOrder.filter(key=>(pack.rates?.[key]??0)>0).map(key=><span key={key}><i className={`rate-dot ${key.toLowerCase()}`}/>{rarity[key]??key}<strong>{Number(pack.rates[key]).toLocaleString('vi-VN',{maximumFractionDigits:3})}%</strong></span>)}</div>
    {pack.code==='RIFT_SEAL'&&<div className={`limited-rate-panel ${limitedRemaining===0&&!data.testMode?'sold-out':''}`}><div><i className="rate-dot limited"/><b>THẺ GIỚI HẠN · LIMITED</b><strong>0,5% MỖI LÁ</strong></div><p>Mỗi lá được quay LIMITED độc lập · một gói 5 lá có khoảng 2,48% cơ hội trúng ít nhất một thẻ · chưa có bảo hiểm.</p><small>{data.testMode?'CHẾ ĐỘ TEST · Không chiếm seri thật':limitedRemaining>0?`KHO SERI THẬT: CÒN ${limitedRemaining}/${limitedTotal} BẢN`:'KHO SERI ĐÃ HẾT · HIỆN KHÔNG THỂ MỞ RA LIMITED'}</small></div>}
    <div className="pack-buy-actions">
     <button className={`pack-open-button currency-${paymentCode.toLowerCase()}`} disabled={Boolean(busy)||!canOpenOne} onClick={()=>open(pack.id,1)}>MỞ 1 GÓI<strong>{data.testMode?'∞':paymentPrice.toLocaleString('vi-VN')} {currencyLabel[paymentCode]??paymentCode}</strong></button>
     <button className={`pack-open-button open-ten currency-${paymentCode.toLowerCase()}`} disabled={Boolean(busy)||!canOpenTen} onClick={()=>open(pack.id,10)}>MỞ 10 GÓI<strong>{data.testMode?'∞':(paymentPrice*10).toLocaleString('vi-VN')} {currencyLabel[paymentCode]??paymentCode} · 50 THẺ</strong></button>
    </div>
   </article>})}</div>
  {busy&&<div className="opening-stage active"><div className="rift-pack">✦</div><b>ĐANG MỞ {busy.done}/{busy.total} GÓI…</b></div>}
  {cards.length>0&&<section className="loot-result">
   <header><div><small>KẾT QUẢ · {cards.length/5} GÓI</small><h2>Nhấn vào thẻ để đọc chi tiết</h2></div><b>{Math.min(visible,cards.length)}/{cards.length}</b></header>
   <div className="loot-cards">{shownCards.map((card,localIndex)=>{const index=page*pageSize+localIndex,pic=picture(card);return <article key={index} style={pic.style} onClick={()=>index<visible&&setDetail(card)} className={`loot-card ${index<visible?'shown':''} ${card.rarity.toLowerCase()}`}><div className="card-back">✦</div><div className={`loot-art ${pic.className}`}/><small>{rarity[card.rarity]??card.rarity}</small><h3>{card.name}</h3><div className="loot-stats"><b>✦ {card.cost}</b>{card.attack!==null&&<><b>⚔ {card.attack}</b><b>♥ {card.health}</b></>}</div><p>{card.description}</p></article>})}</div>
   {pages>1&&<nav className="loot-pages"><button disabled={page===0} onClick={()=>setPage(value=>value-1)}>←</button><b>Trang {page+1}/{pages}</b><button disabled={page===pages-1} onClick={()=>setPage(value=>value+1)}>→</button></nav>}
   <button className="open-again" onClick={()=>{setCards([]);setVisible(0);setPage(0)}}>ĐÓNG</button>
  </section>}
  {detail&&(()=>{const pic=picture(detail);return <div className="card-detail-overlay" onClick={()=>setDetail(null)}><article onClick={event=>event.stopPropagation()} className="card-detail"><button onClick={()=>setDetail(null)}>×</button><div style={pic.style} className={`loot-art ${pic.className}`}/><small>{rarity[detail.rarity]}</small><h2>{detail.name}</h2><div className="detail-stats"><b>Năng lượng {detail.cost}</b>{detail.attack!==null&&<><b>Công {detail.attack}</b><b>Máu {detail.health}</b></>}</div><div className="detail-keywords">{(detail.keywords??[]).map((keyword:string)=><span key={keyword}>{keyword}</span>)}</div><p>{detail.description}</p>{detail.serial&&<strong>SERI {detail.serial}/{detail.printLimit}</strong>}</article></div>})()}
  {showHistory&&<div className="card-detail-overlay" onClick={()=>setShowHistory(false)}><section className="pack-history" onClick={event=>event.stopPropagation()}><button onClick={()=>setShowHistory(false)}>×</button><h2>Lịch sử mở gói</h2>{history.length===0?<p>Chưa có lần mở gói nào.</p>:history.map(entry=><article key={entry.id}><b>{entry.pack.name}</b><time>{new Date(entry.openedAt).toLocaleString('vi-VN')}</time><div>{entry.cards.map((card:any,index:number)=><span className={card.rarity?.toLowerCase()} key={index}>{card.name}{card.serial?` #${card.serial}`:''}</span>)}</div></article>)}</section></div>}
 </>;
}
