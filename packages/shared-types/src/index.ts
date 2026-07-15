export const FACTIONS = ['IRONVALE', 'ARCANUM', 'NEUTRAL'] as const;
export const CARD_TYPES = ['UNIT', 'SPELL', 'TRAP', 'TERRAIN', 'EQUIPMENT'] as const;
export const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'ANCIENT', 'MYTHIC', 'CELESTIAL', 'LIMITED'] as const;
export type Faction = typeof FACTIONS[number];
export type CardType = typeof CARD_TYPES[number];
export type Rarity = typeof RARITIES[number];
export interface CardDto { id:string; code:string; name:string; description:string; type:CardType; faction:Faction; rarity:Rarity; cost:number; attack:number|null; health:number|null; keywords:string[]; owned?:number; printLimit?:number|null; mintedCount?:number; serials?:number[] }
export interface AuthUser { id:string; email:string; role:'USER'|'ADMIN'; profile:{displayName:string; avatarUrl:string|null} }
export interface DeckCardInput { cardId:string; quantity:number; position:number }
export interface DeckInput { name:string; faction:Faction; cards:DeckCardInput[]; isDefault?:boolean }
export interface DeckDto extends DeckInput { id:string; cards:(DeckCardInput & {card:CardDto})[] }
export interface ApiError { error:{code:string; message:string; details?:unknown} }
