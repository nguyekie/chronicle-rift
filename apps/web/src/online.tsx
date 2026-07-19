import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { api } from './api';
import type { DeckDto } from '@chronicle/shared-types';
import './online.css';
import './pvp-live.css';
import './pvp-arena-v2.css';
import { BattleWithDeckSelection } from './advanced';
import { resolveViewerId } from './pvp-state';
import { cardArt } from './card-art';
import { OnlineCampaignBattle } from './online-battle-campaign';

export function PvpLobby() {
  const [decks, setDecks] = useState<DeckDto[]>([]);
  const [deckId, setDeckId] = useState('');
  const [status, setStatus] = useState('Sẵn sàng ghép trận');
  const [match, setMatch] = useState<any>(null);
  const [matchId, setMatchId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mode,setMode]=useState<'CASUAL'|'RANKED'>('CASUAL');
  const [queueing,setQueueing]=useState(false);
  const [roomCode,setRoomCode]=useState('');
  const [joinCode,setJoinCode]=useState('');
  const [opponentOffline,setOpponentOffline]=useState(false);
  useEffect(() => {
    api<DeckDto[]>('/decks').then(items => { setDecks(items); setDeckId(items[0]?.id ?? ''); });
    const client = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3100', { auth: { token: localStorage.getItem('accessToken') } });
    client.on('matchmaking:status', data => {setQueueing(Boolean(data.queued));setStatus(data.queued?'Đang tìm người chơi đang trực tuyến…':'Đã hủy tìm trận')});
    client.on('room:created', data=>{setRoomCode(data.code);setStatus('Phòng đã tạo · gửi mã cho bạn bè')});
    client.on('room:cancelled',()=>{setRoomCode('');setStatus('Đã đóng phòng')});
    client.on('match:found', data => {setQueueing(false);setRoomCode('');setMatchId(data.matchId);localStorage.setItem('chronicle-live-match',data.matchId); setStatus(`Đã ghép trận ${data.matchId.slice(-6)}`); });
    client.on('connect',()=>{setStatus('Đã kết nối máy chủ');const saved=localStorage.getItem('chronicle-live-match');if(saved){setMatchId(saved);client.emit('match:join',{matchId:saved})}});
    client.on('disconnect',()=>setStatus('Mất kết nối · đang tự kết nối lại…'));
    client.on('connect_error',error=>setStatus(`Không thể kết nối máy chủ · ${error.message}`));
    client.on('match:state', data=>{setOpponentOffline(false);setMatch(data)});
    client.on('match:reconnected', data=>{setOpponentOffline(false);setStatus('Đã kết nối lại trận đấu');setMatch(data)});
    client.on('match:presence',data=>{if(!data.online){setOpponentOffline(true);setStatus(`Đối thủ mất kết nối · chờ tối đa ${data.graceSeconds??30} giây`)}else setOpponentOffline(false)});
    client.on('match:error', data => {setStatus(`Lỗi: ${data.code}`);if(['MATCH_NOT_IN_MEMORY','MATCH_NOT_FOUND','FORBIDDEN'].includes(data.code)){localStorage.removeItem('chronicle-live-match');setMatch(null);setMatchId('')}});
    client.on('match:end', data => {localStorage.removeItem('chronicle-live-match');setMatch(null);setMatchId('');setOpponentOffline(false);setStatus(data.reason==='DISCONNECT_TIMEOUT'?'Đối thủ mất kết nối · bạn thắng trận':`Trận kết thúc · Người thắng ${data.winnerId?.slice(-6)}`)});
    setSocket(client);
    return () => { client.disconnect(); };
  }, []);
  const join = (nextMode:'CASUAL'|'RANKED') => {setMode(nextMode);setQueueing(true);setStatus(nextMode==='RANKED'?'Đang tìm đối thủ xếp hạng…':'Đang tìm đối thủ thường…');socket?.emit('matchmaking:join', { mode:nextMode, deckId })};
  const cancelQueue=()=>socket?.emit('matchmaking:leave');
  const createRoom=()=>{setMode('CASUAL');socket?.emit('room:create',{deckId})};
  const closeRoom=()=>socket?.emit('room:cancel');
  const enterRoom=()=>{if(joinCode.trim()){setMode('CASUAL');setStatus('Đang vào phòng…');socket?.emit('room:join',{code:joinCode,deckId})}};
  if(match)return match.state.phase==='MULLIGAN'?<OnlineMulligan payload={match} matchId={matchId} mode={mode} socket={socket} status={status} opponentOffline={opponentOffline}/>:<OnlineCampaignBattle payload={match} matchId={matchId} mode={mode} socket={socket} status={status}/>;
  return <div className="pvp-lobby"><section className="pvp-search"><small>CHRONICLE ARENA · MÁY CHỦ TRỰC TIẾP</small><h2>Đối đầu Người Giữ Ký Ức</h2><p>Chỉ ghép với người chơi đang kết nối. Bạn có thể tìm trận hoặc tạo phòng riêng bằng mã mời.</p><label>Chọn bộ bài<select value={deckId} disabled={queueing||Boolean(roomCode)} onChange={event => setDeckId(event.target.value)}>{decks.map(deck => <option key={deck.id} value={deck.id}>{deck.name} · {deck.cards.reduce((sum,item)=>sum+item.quantity,0)}/30</option>)}</select></label>{queueing?<div className="pvp-waiting"><i/><b>{mode==='RANKED'?'ĐANG TÌM TRẬN XẾP HẠNG':'ĐANG TÌM TRẬN THƯỜNG'}</b><span>Chỉ nhận đối thủ còn trực tuyến</span><button onClick={cancelQueue}>HỦY SẴN SÀNG</button></div>:roomCode?<div className="pvp-room-ready"><small>MÃ PHÒNG CỦA BẠN</small><strong>{roomCode}</strong><p>Gửi mã này cho người chơi còn lại. Phòng tự đóng nếu chủ phòng rời trang.</p><button onClick={()=>navigator.clipboard?.writeText(roomCode)}>SAO CHÉP MÃ</button><button className="room-cancel" onClick={closeRoom}>ĐÓNG PHÒNG</button></div>:<><div className="pvp-modes"><button disabled={!deckId} onClick={() => join('CASUAL')}><b>TÌM ĐẤU THƯỜNG</b><span>Ghép nhanh · không ảnh hưởng điểm hạng</span></button><button disabled={!deckId} onClick={() => join('RANKED')}><b>ĐẤU XẾP HẠNG</b><span>Có thể hủy trước khi tìm thấy đối thủ</span></button></div><div className="private-room"><div><b>PHÒNG ĐẤU THƯỜNG RIÊNG</b><span>Tạo phòng hoặc nhập mã của bạn bè</span></div><button disabled={!deckId} onClick={createRoom}>TẠO PHÒNG</button><input maxLength={6} value={joinCode} onChange={event=>setJoinCode(event.target.value.toUpperCase())} placeholder="NHẬP MÃ 6 KÝ TỰ"/><button disabled={!deckId||joinCode.trim().length!==6} onClick={enterRoom}>VÀO PHÒNG</button></div></>}<p className="queue-status">{status}</p></section></div>;
}

function OnlineMulligan({payload,matchId,mode,socket,status,opponentOffline}:{payload:any;matchId:string;mode:string;socket:Socket|null;status:string;opponentOffline:boolean}){
 const state=payload.state,viewerId=resolveViewerId(state),me=state.players.find((player:any)=>player.id===viewerId)??state.players[0],myTurn=state.activePlayerId===viewerId;
 const send=(action:any)=>socket?.emit('match:action',{matchId,actionId:crypto.randomUUID(),action});
 return <section className="pvp-mulligan"><small>{mode==='RANKED'?'ĐẤU XẾP HẠNG':'ĐẤU THƯỜNG'}</small><h2>{opponentOffline?'Đối thủ đã mất kết nối':myTurn?'Chọn bài khởi đầu':'Đối thủ đang chọn bài khởi đầu'}</h2><div>{me.hand.map((card:any)=><OnlineCard key={card.instanceId} card={card}/>)}</div>{opponentOffline?<p className="presence-warning">Đang chờ kết nối lại. Bạn sẽ thắng sau tối đa 30 giây.</p>:myTurn?<button onClick={()=>send({type:'MULLIGAN',cardInstanceIds:[]})}>GIỮ BÀI VÀ BẮT ĐẦU</button>:<p>Trận đấu sẽ bắt đầu ngay khi đối thủ sẵn sàng…</p>}<p className="mulligan-status">{status}</p><button className="mulligan-leave" onClick={()=>send({type:'CONCEDE'})}>RỜI TRẬN</button></section>;
}

const rows=['BACK','MIDDLE','FRONT'] as const;
const rowLabel:Record<string,string>={BACK:'HÀNG SAU',MIDDLE:'HÀNG GIỮA',FRONT:'HÀNG TRƯỚC'};
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
function OnlineCard({card,enemy=false,selected=false,onClick}:{card:any;enemy?:boolean;selected?:boolean;onClick?:()=>void}){if(card.hidden)return <i className="online-card card-back"><span>✦</span></i>;const art=cardArt(card.name,card.id??'');return <button type="button" className={`online-card ${enemy?'enemy':''} ${selected?'selected':''}`} onClick={onClick} title={`${card.name}\n${card.description??''}`}><i className={`online-card-art ${art.className}`} style={art.style}/><span className="online-card-cost">{card.cost}</span><b>{card.name}</b><small>{(card.keywords??[]).join(' · ')||card.type}</small>{card.type==='UNIT'?<em><strong>⚔ {card.currentAttack}</strong><strong>♥ {card.currentHealth}</strong></em>:<em className="spell-mark">✦ PHÉP</em>}</button>}
// Giữ tạm renderer cũ để các phiên cache trước khi deploy vẫn có thể hydrate an toàn.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OnlineBattle({payload,matchId,mode,socket,status}:{payload:any;matchId:string;mode:string;socket:Socket|null;status:string}){const state=payload.state,viewerId=resolveViewerId(state),me=state.players.find((player:any)=>player.id===viewerId)??state.players[0],enemy=state.players.find((player:any)=>player.id!==viewerId)??state.players[1],[row,setRow]=useState<'FRONT'|'MIDDLE'|'BACK'>('FRONT'),[attacker,setAttacker]=useState(''),[pendingSpell,setPendingSpell]=useState<any>(),myTurn=state.activePlayerId===viewerId,send=(action:any)=>socket?.emit('match:action',{matchId,actionId:crypto.randomUUID(),action});const play=(card:any)=>{if(!myTurn)return;if(card.type==='UNIT'){send({type:'PLAY_CARD',cardInstanceId:card.instanceId,row});return}const text=normalize(card.description??''),targeted=text.includes('len muc tieu')||text.includes('mot don vi');if(targeted)setPendingSpell(card);else send({type:'PLAY_CARD',cardInstanceId:card.instanceId})};const target=(id:string)=>{if(pendingSpell){send({type:'PLAY_CARD',cardInstanceId:pendingSpell.instanceId,targetId:id});setPendingSpell(undefined)}else if(attacker){send({type:'ATTACK',attackerId:attacker,targetId:id});setAttacker('')}};if(state.phase==='MULLIGAN')return <section className="pvp-mulligan"><small>{mode==='RANKED'?'ĐẤU XẾP HẠNG':'ĐẤU THƯỜNG'}</small><h2>{myTurn?'Chọn bài khởi đầu':'Đối thủ đang chọn bài khởi đầu'}</h2><div>{me.hand.map((card:any)=><OnlineCard key={card.instanceId} card={card}/>)}</div>{myTurn?<button onClick={()=>send({type:'MULLIGAN',cardInstanceIds:[]})}>GIỮ BÀI VÀ BẮT ĐẦU</button>:<p>Trận đấu sẽ bắt đầu ngay khi đối thủ sẵn sàng…</p>}</section>;return <section className="online-battle">{state.phase==='ENDED'&&<div className="online-result"><small>{mode==='RANKED'?'KẾT QUẢ XẾP HẠNG':'KẾT QUẢ TRẬN ĐẤU'}</small><h2>{state.winnerId===viewerId?'CHIẾN THẮNG':'THẤT BẠI'}</h2><p>{state.winnerId===viewerId?'Điểm xếp hạng đang được máy chủ cập nhật.':'Hãy điều chỉnh bộ bài và thử lại.'}</p><button onClick={()=>location.reload()}>TRỞ LẠI ĐẤU TRƯỜNG</button></div>}<header><div><small>{mode==='RANKED'?'XẾP HẠNG · ELO':'ĐẤU THƯỜNG'} · #{matchId.slice(-6)}</small><b>{myTurn?'LƯỢT CỦA BẠN':'ĐANG CHỜ ĐỐI THỦ'}</b></div><span>Phiên bản {payload.version}</span></header>{state.pendingForesee?.playerId===viewerId&&<div className="online-foresee"><b>TIÊN KIẾN</b><p>{me.deck[0]?.name??'Bộ bài đã hết lá'}</p><button onClick={()=>send({type:'RESOLVE_FORESEE',choice:'KEEP'})}>GIỮ TRÊN ĐẦU</button><button onClick={()=>send({type:'RESOLVE_FORESEE',choice:'BOTTOM'})}>ĐƯA XUỐNG CUỐI</button></div>}<div className="online-leader enemy-leader" onClick={()=>target(enemy.id)}><b>ĐỐI THỦ　♥ {enemy.leaderHealth}</b><span>{enemy.hand.length} lá trên tay · {enemy.deck.length} lá trong bộ</span></div><div className="online-board enemy-board">{rows.map(name=><div className="online-row" key={name}><label>{rowLabel[name]}</label>{enemy.board[name].map((card:any)=><OnlineCard key={card.instanceId} card={card} enemy onClick={()=>target(card.instanceId)}/>)}</div>)}</div><div className="rift-line">◆ KHE NỨT CHRONICLE ◆</div><div className="online-board own-board">{[...rows].reverse().map(name=><div className={`online-row ${row===name?'active':''}`} key={name} onClick={()=>setRow(name)}><label>{rowLabel[name]}</label>{me.board[name].map((card:any)=><OnlineCard key={card.instanceId} card={card} selected={attacker===card.instanceId} onClick={()=>myTurn&&setAttacker(card.instanceId)}/>)}</div>)}</div><footer><div className="online-resources"><b>♥ {me.leaderHealth}</b><b>✦ {me.energy}/{me.maxEnergy}</b><span>{me.deck.length} lá còn lại</span></div><div className="online-hand">{me.hand.map((card:any)=><OnlineCard key={card.instanceId} card={card} selected={pendingSpell?.instanceId===card.instanceId} onClick={()=>play(card)}/>)}</div><div className="online-actions"><button disabled={!myTurn} onClick={()=>send({type:'END_TURN'})}>KẾT THÚC LƯỢT</button><button className="concede" onClick={()=>send({type:'CONCEDE'})}>ĐẦU HÀNG</button></div></footer><p className="online-hint">{pendingSpell?`Đã chọn ${pendingSpell.name} · chọn mục tiêu đối phương`:attacker?'Chọn đơn vị đối phương để tấn công':status}</p></section>}

export function Leaderboard() {
  const [rank, setRank] = useState<any>();
  const [board, setBoard] = useState<any[]>([]);
  useEffect(() => { api('/rank').then(setRank); api<any>('/rank/leaderboard').then(result => setBoard(result.items)); }, []);
  const tierVi:Record<string,string>={BRONZE:'ĐỒNG',SILVER:'BẠC',GOLD:'VÀNG',PLATINUM:'BẠCH KIM',DIAMOND:'KIM CƯƠNG',LEGEND:'HUYỀN THOẠI'};return <div className="leaderboard"><div className="rank-card"><small>MÙA RIFTFALL</small><h2>{tierVi[rank?.tier]??'ĐỒNG'}</h2><b>{rank?.rating ?? 1000} điểm</b><p>{rank?.wins ?? 0} thắng · {rank?.losses ?? 0} thua</p></div><ol>{board.map((item, index) => <li key={index}><b>#{index + 1}</b><span>{item.user.profile?.displayName ?? 'Người Giữ Ký Ức'}</span><em>{tierVi[item.tier]??item.tier}</em><strong>{item.rating}</strong></li>)}</ol></div>;
}

export function EventHub() {
  const [events, setEvents] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>();
  const [message, setMessage] = useState('');
  const [battleStage,setBattleStage]=useState<number>();
  const [loading,setLoading]=useState(true);
  const refresh=async(id:string)=>setDetail(await api(`/events/${id}`));
  useEffect(() => { api<any[]>('/events/active').then(async items => { setEvents(items); if (items[0]) await refresh(items[0].id); }).catch(error=>setMessage((error as Error).message)).finally(()=>setLoading(false)); }, []);
  if(loading)return <p>Đang tải sự kiện…</p>;
  if (!events[0]) return <div className="event-error"><b>Không thể mở sự kiện</b><p>{message||'Hiện không có sự kiện đang hoạt động.'}</p></div>;
  const event = events[0];
  const complete = async (number: number) => { try{const result = await api<any>(`/events/${event.id}/stages/${number}/complete`, { method: 'POST' }); setMessage(result.alreadyClaimed?'Màn này đã nhận thưởng. Hãy thử màn khác.':`Chiến thắng · +${result.token} Xu Nhật Thực`);setBattleStage(undefined);await refresh(event.id)}catch(error){setMessage((error as Error).message)} };
  const buy = async (itemId: string) => { try { const result = await api<any>(`/events/${event.id}/shop/${itemId}/buy`, { method: 'POST' }); setMessage(`Đã nhận ${result.item.name}` + (result.serial ? ` · ${result.serial}` : '')); setDetail(await api(`/events/${event.id}`)); } catch (error) { setMessage((error as Error).message); } };
  if(battleStage)return <div className="event-battle"><BattleWithDeckSelection title={battleStage===12?'Chúa Tể Nhật Thực':`Khe Nhật Thực ${battleStage}`} difficulty={battleStage} onComplete={()=>complete(battleStage)} onBack={()=>setBattleStage(undefined)}/></div>;
  return <div className="event-hub"><div className="event-banner"><small>SỰ KIỆN GIỚI HẠN</small><h2>{event.name}</h2><p>{event.description}</p><b>{detail?.wallet.balance ?? 0} XU NHẬT THỰC</b></div><p className="event-guide">Chọn một khe nứt và chiến thắng trận đấu để nhận thưởng. Mỗi màn chỉ phát thưởng một lần.</p><div className="event-stages">{Array.from({ length: 12 }, (_, index) => {const stage=index+1,done=detail?.completed?.includes(stage);return <button className={done?'completed':''} key={stage} onClick={() => setBattleStage(stage)}><span>{index === 11 ? 'TRÙM' : stage}</span><small>{done?'ĐÃ XONG':`${50+stage*5} XU`}</small></button>})}</div><h3>Cửa hàng quy đổi</h3><div className="event-shop">{event.shopItems.map((item: any) => <article key={item.id}><b>{item.name}</b><span>{item.cost} Xu</span><button onClick={() => buy(item.id)}>QUY ĐỔI</button></article>)}</div>{message&&<p className="event-message">{message}</p>}</div>;
}
