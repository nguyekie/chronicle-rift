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
 const[data,setData]=useState<any>();const[message,setMessage]=useState('');
 const load=()=>api('/admin/overview').then(setData).catch(error=>setMessage((error as Error).message));useEffect(()=>{load()},[]);
 const update=async(id:string,input:any)=>{await api(`/admin/packs/${id}`,{method:'PATCH',body:JSON.stringify(input)});setMessage('Đã cập nhật cấu hình gói');load()};
 if(!data)return <p>{message||'Đang tải quản trị…'}</p>;
 return <section className="admin-panel"><div className="admin-stats"><b>{data.users} tài khoản</b><b>{data.cards} thẻ</b><b>{data.openings} lượt mở gói</b></div>{data.packs.map((pack:any)=><article className="admin-pack" key={pack.id}><div><b>{pack.name}</b><small>{pack.code}</small></div><input type="number" defaultValue={pack.priceGold} onBlur={event=>update(pack.id,{priceGold:Number(event.target.value)})}/><button onClick={()=>update(pack.id,{enabled:!pack.enabled})}>{pack.enabled?'Đang bán':'Đã ẩn'}</button></article>)}{message&&<p>{message}</p>}</section>;
}
