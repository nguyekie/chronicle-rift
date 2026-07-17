export const craftCost={COMMON:50,UNCOMMON:100,RARE:300,EPIC:800,LEGENDARY:2000,ANCIENT:3500,MYTHIC:6000,CELESTIAL:12000,LIMITED:0}as const;
export const dismantleValue={COMMON:10,UNCOMMON:20,RARE:60,EPIC:160,LEGENDARY:400,ANCIENT:700,MYTHIC:1200,CELESTIAL:2400,LIMITED:0}as const;
export const packRates={
 STARTER:{COMMON:70,UNCOMMON:22,RARE:7,EPIC:.9,LEGENDARY:.1,ANCIENT:0,MYTHIC:0,CELESTIAL:0,LIMITED:0},
 BASIC:{COMMON:58,UNCOMMON:25,RARE:11,EPIC:4.5,LEGENDARY:1.2,ANCIENT:.25,MYTHIC:.045,CELESTIAL:.005,LIMITED:0},
 IRONVALE:{COMMON:50,UNCOMMON:28,RARE:14,EPIC:6,LEGENDARY:1.6,ANCIENT:.3,MYTHIC:.09,CELESTIAL:.01,LIMITED:0},
 ARCANUM:{COMMON:50,UNCOMMON:28,RARE:14,EPIC:6,LEGENDARY:1.6,ANCIENT:.3,MYTHIC:.09,CELESTIAL:.01,LIMITED:0},
 RIFT_SEAL:{COMMON:35,UNCOMMON:28,RARE:18,EPIC:10,LEGENDARY:5,ANCIENT:2.5,MYTHIC:1.2,CELESTIAL:.3,LIMITED:0}
}as const;
export const limitedRatePerPack=.5;
export type PackCode=keyof typeof packRates;
export function ratesFor(code:string){return packRates[code as PackCode]??packRates.BASIC}
export function pickPackRarity(code:string,r:number,e:number,l:number){if(l>=40)return'LEGENDARY';const rates=ratesFor(code),entries=(['CELESTIAL','MYTHIC','ANCIENT','LEGENDARY','EPIC','RARE','UNCOMMON','COMMON']as const).map(name=>[name,rates[name]]as const);let cursor=0,target=r*100;for(const[name,weight]of entries){let adjusted=weight;if(name==='EPIC')adjusted+=Math.max(0,e-11);cursor+=adjusted;if(target<cursor)return name}return'COMMON'}
export function nextPity(e:number,l:number,rs:string[]){const legendary=['LEGENDARY','ANCIENT','MYTHIC','CELESTIAL','LIMITED'].some(x=>rs.includes(x)),epic=legendary||rs.includes('EPIC');return{epicMisses:epic?0:e+1,legendaryMisses:legendary?0:l+1}}
export function pickRarity(r:number,e:number,l:number){if(l>=40)return'LEGENDARY';const boost=Math.max(0,e-11)*.01;if(r<.00005)return'CELESTIAL';if(r<.0005)return'MYTHIC';if(r<.003)return'ANCIENT';if(r<.015)return'LEGENDARY';if(r<.06+boost)return'EPIC';if(r<.17)return'RARE';if(r<.42)return'UNCOMMON';return'COMMON'}
