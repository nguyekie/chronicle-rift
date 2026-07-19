import { useEffect, useState } from 'react';
import { api } from './api';

const tutorialSteps = [
  ['Chào mừng đến Chronicle Rift', 'Hãy bắt đầu ở Bộ bài. Một bộ bài hợp lệ có đúng 30 lá và chỉ dùng thẻ cùng phe hoặc Trung lập.'],
  ['Năng lượng và lượt chơi', 'Năng lượng chưa dùng được giữ lại, tối đa 20. Triệu hồi đơn vị vào ba hàng rồi kết thúc lượt để AI hành động.'],
  ['Tấn công và kỹ năng', 'Chọn đơn vị của bạn, sau đó chọn mục tiêu. Khiêu khích phải bị hạ trước; Khiên chặn đòn đầu; Xung kích có thể đánh ngay.'],
  ['Kinh tế thẻ bài', 'Mở gói bằng Vàng hoặc Bụi. Thẻ trùng tự đổi thành Bụi; dùng Bụi để chế tạo thẻ còn thiếu.'],
  ['Sẵn sàng', 'Hãy thử Luyện tập trước, sau đó tiến vào Chiến dịch, Sự kiện hoặc Đấu trực tiếp.'],
];

export function Onboarding({ force=false, onClose }:{ force?:boolean;onClose:()=>void }) {
  const [step,setStep]=useState(0);
  const close=()=>{localStorage.setItem('chronicle-tutorial-complete','1');onClose()};
  return <div className="onboarding"><section className="onboarding-card"><small>HƯỚNG DẪN {step+1}/{tutorialSteps.length}</small><h2>{tutorialSteps[step]![0]}</h2><p>{tutorialSteps[step]![1]}</p><footer><button disabled={step===0} onClick={()=>setStep(value=>value-1)}>Quay lại</button>{step<tutorialSteps.length-1?<button onClick={()=>setStep(value=>value+1)}>Tiếp tục</button>:<button onClick={close}>Bắt đầu chơi</button>}</footer>{force&&<button className="link" onClick={close}>Đóng hướng dẫn</button>}</section></div>;
}

export function AdminPanel(){
 const[data,setData]=useState<any>();const[message,setMessage]=useState(''),[identity,setIdentity]=useState(''),[amount,setAmount]=useState(1_000_000),[granting,setGranting]=useState(false);
 const load=()=>api('/admin/overview').then(setData).catch(error=>setMessage((error as Error).message));useEffect(()=>{load()},[]);
 const update=async(id:string,input:any)=>{await api(`/admin/packs/${id}`,{method:'PATCH',body:JSON.stringify(input)});setMessage('Đã cập nhật cấu hình gói');load()};
 const grantGold=async(event:React.FormEvent)=>{event.preventDefault();try{setGranting(true);const result=await api<any>('/admin/users/gold',{method:'POST',body:JSON.stringify({identity,amount})});setMessage(`Đã cộng ${result.added.toLocaleString('vi-VN')} Vàng cho ${result.user.displayName}. Số dư mới: ${result.balance.toLocaleString('vi-VN')}`);setIdentity('')}catch(error){setMessage((error as Error).message)}finally{setGranting(false)}};
 if(!data)return <p>{message||'Đang tải quản trị…'}</p>;
 return <section className="admin-panel"><div className="admin-stats"><b>{data.users} tài khoản</b><b>{data.cards} thẻ</b><b>{data.openings} lượt mở gói</b></div><form className="admin-gold" onSubmit={grantGold}><div><small>CÔNG CỤ QUẢN TRỊ KINH TẾ</small><h2>Cộng Vàng cho nhân vật</h2><p>Nhập chính xác tên nhân vật hoặc email. Nếu có người trùng tên, hệ thống sẽ yêu cầu email.</p></div><label>Nhân vật hoặc email<input value={identity} onChange={event=>setIdentity(event.target.value)} placeholder="Ví dụ: nguyekie" required minLength={2}/></label><label>Số Vàng<input type="number" min="1" max="100000000" value={amount} onChange={event=>setAmount(Number(event.target.value))} required/></label><button disabled={granting}>{granting?'ĐANG CỘNG…':'CỘNG VÀNG'}</button></form><h2 className="admin-section-title">Cấu hình gói thẻ</h2>{data.packs.map((pack:any)=><article className="admin-pack" key={pack.id}><div><b>{pack.name}</b><small>{pack.code}</small></div><input type="number" defaultValue={pack.priceGold} onBlur={event=>update(pack.id,{priceGold:Number(event.target.value)})}/><button onClick={()=>update(pack.id,{enabled:!pack.enabled})}>{pack.enabled?'Đang bán':'Đã ẩn'}</button></article>)}{message&&<p className="admin-message">{message}</p>}</section>;
}
