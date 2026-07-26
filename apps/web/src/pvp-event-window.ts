export function unseenBattleEvents<T>(events:T[],seen:number){
 const safeSeen=seen<=events.length?seen:0;
 return{fresh:events.slice(safeSeen),next:events.length};
}
