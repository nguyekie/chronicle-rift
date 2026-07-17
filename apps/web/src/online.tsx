import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { api } from './api';
import type { DeckDto } from '@chronicle/shared-types';
import './online.css';
import { BattleWithDeckSelection } from './advanced';

export function PvpLobby() {
  const [decks, setDecks] = useState<DeckDto[]>([]);
  const [deckId, setDeckId] = useState('');
  const [status, setStatus] = useState('Sẵn sàng ghép trận');
  const [match, setMatch] = useState<any>(null);
  const [matchId, setMatchId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    api<DeckDto[]>('/decks').then(items => { setDecks(items); setDeckId(items[0]?.id ?? ''); });
    const client = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3100', { auth: { token: localStorage.getItem('accessToken') } });
    client.on('matchmaking:status', () => setStatus('Đang tìm đối thủ…'));
    client.on('match:found', data => { setMatchId(data.matchId); setStatus(`Đã ghép trận ${data.matchId.slice(-6)}`); });
    client.on('match:state', setMatch);
    client.on('match:reconnected', setMatch);
    client.on('match:error', data => setStatus(`Lỗi: ${data.code}`));
    client.on('match:end', data => setStatus(`Trận kết thúc · Người thắng ${data.winnerId?.slice(-6)}`));
    setSocket(client);
    return () => { client.disconnect(); };
  }, []);
  const join = (mode: string) => socket?.emit('matchmaking:join', { mode, deckId });
  return <div className="pvp"><section><h2>Đấu trường trực tiếp</h2><label>Chọn bộ bài</label><select value={deckId} onChange={event => setDeckId(event.target.value)}>{decks.map(deck => <option key={deck.id} value={deck.id}>{deck.name}</option>)}</select><button onClick={() => join('CASUAL')}>ĐẤU THƯỜNG</button><button onClick={() => join('RANKED')}>ĐẤU XẾP HẠNG</button><p>{status}</p></section>{match && <section><b>Phiên bản trạng thái {match.version}</b><p>Lượt hiện tại: {match.state.activePlayerId}</p><p>Máu thủ lĩnh: {match.state.players.map((player: any) => player.leaderHealth).join(' / ')}</p><button onClick={() => socket?.emit('match:action', { matchId, actionId: crypto.randomUUID(), action: { type: 'END_TURN' } })}>Kết thúc lượt</button><button onClick={() => socket?.emit('match:action', { matchId, actionId: crypto.randomUUID(), action: { type: 'CONCEDE' } })}>Đầu hàng</button></section>}</div>;
}

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
