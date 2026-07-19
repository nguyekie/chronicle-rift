import type {Server as HttpServer} from 'node:http';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import {randomUUID} from 'node:crypto';
import {applyAction,createGame,type EngineCard,type GameState,type GameAction} from '@chronicle/game-engine';
import {config} from './config.js';
import {db} from './db.js';
import {elo,tier} from './rank-logic.js';
import {allowWebOrigin} from './web-origin.js';

type Session={state:GameState;version:number;users:[string,string];timer?:ReturnType<typeof setTimeout>};
type QueueEntry={userId:string;deckId:string;socketId:string};
type PrivateRoom={code:string;host:QueueEntry};
const queues=new Map<string,QueueEntry[]>(),sessions=new Map<string,Session>(),rooms=new Map<string,PrivateRoom>();

export const pruneQueue=(queue:QueueEntry[],connected:Set<string>)=>queue.filter((entry,index,all)=>connected.has(entry.socketId)&&all.findIndex(item=>item.userId===entry.userId)===index);
export const engineCardId=(catalogCode:string,copy:number)=>`${catalogCode}-${copy}`;
const removeFromQueues=(userId:string)=>{for(const[mode,queue]of queues)queues.set(mode,queue.filter(entry=>entry.userId!==userId))};
const filtered=(state:GameState,userId:string)=>({...state,viewerId:userId,players:state.players.map(player=>player.id===userId?player:{...player,hand:player.hand.map(()=>({hidden:true})),deck:Array(player.deck.length).fill({hidden:true})})});
const spellDamage=(description:string,cost:number)=>Number(description.match(/gây\s+(\d+)\s+sát thương/i)?.[1]??Math.max(2,Math.min(7,cost)));

async function engineDeck(deckId:string,userId:string){
 const deck=await db.deck.findFirst({where:{id:deckId,userId},include:{cards:{include:{card:true}}}});
 if(!deck)throw new Error('DECK_NOT_FOUND');
 return deck.cards.flatMap(item=>Array.from({length:item.quantity},(_,index):EngineCard=>({id:engineCardId(item.card.code,index),name:item.card.name,description:item.card.description,type:item.card.type==='UNIT'?'UNIT':'SPELL',cost:item.card.cost,attack:item.card.attack??undefined,health:item.card.health??undefined,keywords:(item.card.keywords as string[]).filter(keyword=>['Taunt','Shield','Rush','Silence','Ward','Foresee','Resonance'].includes(keyword))as any[],damage:item.card.type==='UNIT'?undefined:spellDamage(item.card.description,item.card.cost)})));
}

async function startMatch(io:Server,a:QueueEntry,b:QueueEntry,mode:string){
 if(a.userId===b.userId)throw new Error('SAME_PLAYER');
 const clients=[io.sockets.sockets.get(a.socketId),io.sockets.sockets.get(b.socketId)];
 if(!clients[0]?.connected||!clients[1]?.connected)throw new Error('PLAYER_DISCONNECTED');
 const match=await db.match.create({data:{mode:mode==='RANKED'?'RANKED':'CASUAL',status:'ACTIVE',seed:randomUUID(),players:{create:[{userId:a.userId,deckId:a.deckId,seat:0},{userId:b.userId,deckId:b.deckId,seat:1}]}}});
 const state=createGame({seed:Date.now()>>>0,players:[{id:a.userId,deck:await engineDeck(a.deckId,a.userId)},{id:b.userId,deck:await engineDeck(b.deckId,b.userId)}]});
 sessions.set(match.id,{state,version:0,users:[a.userId,b.userId]});
 for(const[index,entry]of[a,b].entries()){const client=clients[index]!;client.join(match.id);client.emit('match:found',{matchId:match.id});client.emit('match:state',{state:filtered(state,entry.userId),version:0})}
}

async function finishRank(session:Session){
 if(!session.state.winnerId)return;
 const season=await db.rankedSeason.findFirst({where:{active:true}});if(!season)return;
 const[w,l]=session.state.winnerId===session.users[0]?session.users:[session.users[1],session.users[0]];
 const ranks=await Promise.all([w,l].map(userId=>db.userRank.upsert({where:{userId_seasonId:{userId,seasonId:season.id}},update:{},create:{userId,seasonId:season.id}}))),calc=elo(ranks[0].rating,ranks[1].rating,true);
 await db.$transaction([db.userRank.update({where:{userId_seasonId:{userId:w,seasonId:season.id}},data:{rating:calc.winner,tier:tier(calc.winner),wins:{increment:1}}}),db.userRank.update({where:{userId_seasonId:{userId:l,seasonId:season.id}},data:{rating:calc.loser,tier:tier(calc.loser),losses:{increment:1}}})]);
}

export function attachRealtime(http:HttpServer){
 const io=new Server(http,{cors:{origin:allowWebOrigin}});
 io.use((socket,next)=>{try{const token=socket.handshake.auth.token,claims=jwt.verify(token,config.JWT_ACCESS_SECRET)as any;socket.data.userId=claims.sub;next()}catch{next(new Error('UNAUTHORIZED'))}});
 io.on('connection',socket=>{
  const userId=socket.data.userId as string;
  socket.on('matchmaking:join',async({mode='CASUAL',deckId}:{mode:string;deckId:string})=>{try{
   await engineDeck(deckId,userId);removeFromQueues(userId);
   const connected=new Set([...io.sockets.sockets.values()].filter(client=>client.connected).map(client=>client.id));
   const queue=pruneQueue(queues.get(mode)??[],connected);queue.push({userId,deckId,socketId:socket.id});queues.set(mode,queue);
   socket.emit('matchmaking:status',{queued:true,mode});
   if(queue.length>=2){const a=queue.shift()!,b=queue.shift()!;await startMatch(io,a,b,mode)}
  }catch(error){socket.emit('match:error',{code:(error as Error).message})}});
  socket.on('matchmaking:leave',()=>{removeFromQueues(userId);socket.emit('matchmaking:status',{queued:false})});
  socket.on('room:create',async({deckId}:{deckId:string})=>{try{
   await engineDeck(deckId,userId);removeFromQueues(userId);
   for(const[code,room]of rooms)if(room.host.userId===userId)rooms.delete(code);
   let code='';do{code=Math.random().toString(36).slice(2,8).toUpperCase()}while(rooms.has(code));
   rooms.set(code,{code,host:{userId,deckId,socketId:socket.id}});socket.emit('room:created',{code});
  }catch(error){socket.emit('match:error',{code:(error as Error).message})}});
  socket.on('room:join',async({code,deckId}:{code:string;deckId:string})=>{try{
   await engineDeck(deckId,userId);const key=code.trim().toUpperCase(),room=rooms.get(key);if(!room)throw new Error('ROOM_NOT_FOUND');if(room.host.userId===userId)throw new Error('SAME_PLAYER');
   rooms.delete(key);await startMatch(io,room.host,{userId,deckId,socketId:socket.id},'CASUAL');
  }catch(error){socket.emit('match:error',{code:(error as Error).message})}});
  socket.on('room:cancel',()=>{for(const[code,room]of rooms)if(room.host.userId===userId)rooms.delete(code);socket.emit('room:cancelled')});
  socket.on('match:join',async({matchId}:{matchId:string})=>{const membership=await db.matchPlayer.findUnique({where:{matchId_userId:{matchId,userId}}});if(!membership)return socket.emit('match:error',{code:'FORBIDDEN'});const session=sessions.get(matchId);if(!session)return socket.emit('match:error',{code:'MATCH_NOT_IN_MEMORY'});if(session.timer){clearTimeout(session.timer);delete session.timer}socket.join(matchId);io.to(matchId).emit('match:presence',{userId,online:true});socket.emit('match:reconnected',{state:filtered(session.state,userId),version:session.version})});
  socket.on('match:action',async({matchId,actionId,action}:{matchId:string;actionId:string;action:GameAction})=>{const session=sessions.get(matchId);if(!session||!session.users.includes(userId))return socket.emit('match:error',{code:'MATCH_NOT_FOUND',actionId});if(await db.matchAction.findUnique({where:{matchId_actionId:{matchId,actionId}}}))return socket.emit('match:state',{state:filtered(session.state,userId),version:session.version,duplicate:true});const result=applyAction(session.state,{...action,playerId:userId}as GameAction);if(!result.ok)return socket.emit('match:error',{code:result.error,actionId});session.state=result.state;session.version++;await db.matchAction.create({data:{actionId,matchId,userId,version:session.version,payload:action as any}});for(const uid of session.users)for(const client of await io.in(matchId).fetchSockets())if(client.data.userId===uid)client.emit('match:state',{state:filtered(session.state,uid),version:session.version});if(session.state.phase==='ENDED'){await db.match.update({where:{id:matchId},data:{status:'COMPLETED',winnerId:session.state.winnerId,reason:action.type==='CONCEDE'?'CONCEDE':'LEADER_DEFEATED',endedAt:new Date()}});await finishRank(session);io.to(matchId).emit('match:end',{winnerId:session.state.winnerId})}});
  socket.on('disconnect',async()=>{removeFromQueues(userId);for(const[code,room]of rooms)if(room.host.userId===userId||room.host.socketId===socket.id)rooms.delete(code);for(const[matchId,session]of sessions)if(session.users.includes(userId)){const connected=await io.in(matchId).fetchSockets();if(connected.some(client=>client.data.userId===userId))continue;await db.matchPlayer.updateMany({where:{matchId,userId},data:{disconnectedAt:new Date()}});io.to(matchId).emit('match:presence',{userId,online:false,graceSeconds:30});session.timer=setTimeout(async()=>{const sockets=await io.in(matchId).fetchSockets();if(!sockets.some(client=>client.data.userId===userId)&&session.state.phase!=='ENDED'){const result=applyAction(session.state,{type:'CONCEDE',playerId:userId});if(result.ok){session.state=result.state;await db.match.update({where:{id:matchId},data:{status:'COMPLETED',winnerId:session.state.winnerId,reason:'DISCONNECT_TIMEOUT',endedAt:new Date()}});io.to(matchId).emit('match:end',{winnerId:session.state.winnerId,reason:'DISCONNECT_TIMEOUT'})}}},30_000)}});
 });
 return io;
}
