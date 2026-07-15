import { io } from 'socket.io-client';
const api='http://localhost:3100/api',stamp=Date.now();
async function register(n){const r=await fetch(`${api}/auth/register`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`pvp${stamp}-${n}@example.com`,password:'SecurePass123!',displayName:`PvP ${n}`})});const a=await r.json();const decks=await fetch(`${api}/decks`,{headers:{authorization:`Bearer ${a.accessToken}`}}).then(x=>x.json());return{...a,deckId:decks[0].id}}
const [a,b]=await Promise.all([register(1),register(2)]),url='http://localhost:3100';
const sockets=[a,b].map(x=>io(url,{auth:{token:x.accessToken},transports:['websocket']}));
const results=await Promise.all(sockets.map((socket,i)=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('matchmaking timeout')),10000);socket.on('connect',()=>socket.emit('matchmaking:join',{mode:'RANKED',deckId:[a,b][i].deckId}));socket.on('match:found',found=>socket.once('match:state',state=>{clearTimeout(timeout);resolve({socket,found,state})}));socket.on('connect_error',reject)})));
const hidden=results.every((x,i)=>x.state.state.players.some(p=>p.id!==[a.user.id,b.user.id][i]&&p.hand.every(c=>c.hidden)));
const first=results[0],actionId=crypto.randomUUID();first.socket.emit('match:action',{matchId:first.found.matchId,actionId,action:{type:'CONCEDE'}});
await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('end timeout')),5000);first.socket.once('match:end',()=>{clearTimeout(t);resolve()})});
for(const x of results)x.socket.disconnect();
console.log(JSON.stringify({matched:results[0].found.matchId===results[1].found.matchId,hidden,version:results[0].state.version,ended:true}));
