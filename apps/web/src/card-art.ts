import type { CSSProperties } from 'react';

const rules: Record<string, number> = {
  'manh vo': 32,
  'phuong hoang': 2,
  'cho san': 1,
  'linh thu': 1,
  'than thu': 13,
  'cu than': 3,
  golem: 3,
  'tho ren': 5,
  'luyen kim': 13,
  'phao dai': 17,
  phao: 6,
  no: 13,
  'chien xa': 21,
  'ky si': 10,
  'ky binh': 10,
  'hiep si': 20,
  'nu vuong': 23,
  khien: 11,
  giap: 15,
  'thanh kiem': 7,
  kiem: 7,
  'menh lenh': 8,
  'co lenh': 8,
  'doi hinh': 8,
  'thanh tri': 9,
  'thanh luy': 24,
  cong: 14,
  'thu vien': 3,
  'hoc gia': 0,
  'hoc vien': 1,
  'phap su': 13,
  'phu thuy': 22,
  'tien tri': 15,
  'tinh cau': 4,
  'vong lap': 14,
  'thoi gian': 16,
  'dong ho': 6,
  'vuong mien': 5,
  'mat bao': 9,
  'tia chop': 1,
  'sam set': 31,
  'hu khong': 24,
  'ngan ha': 9,
  'tinh van': 26,
  'tinh tu': 2,
  'mua sao': 4,
  'ban do': 3,
  'la ban': 6,
  'chia khoa': 7,
  'thuong nhan': 4,
  'chua thuong': 3,
  'du hanh': 0,
  'mat na': 9,
  cay: 23,
  dao: 16,
  'di vat': 32,
  'ca voi': 10,
  'chim ung': 26,
  'dai bang': 26,
  'sa mac': 22,
  rong: 19,
  soi: 1,
  bao: 9,
  sao: 4,
};

const normalize = (value: string) => value
  .toLocaleLowerCase('vi')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd');

const reservoirTiles: Record<string, number> = {
  'IV-051': 0, 'IV-052': 1, 'IV-053': 2,
  'AR-051': 3, 'AR-052': 4, 'AR-053': 5,
  'NE-051': 6, 'NE-052': 7, 'NE-053': 8,
};

const ironvaleCoreV2: Record<string, [string, string]> = {
  'IV-001': ['0%', '0%'], 'IV-002': ['33.3333%', '0%'], 'IV-003': ['66.6667%', '0%'], 'IV-004': ['100%', '0%'],
  'IV-005': ['0%', '50%'], 'IV-006': ['33.3333%', '50%'], 'IV-007': ['66.6667%', '50%'], 'IV-008': ['100%', '50%'],
  'IV-009': ['0%', '100%'], 'IV-010': ['33.3333%', '100%'], 'IV-011': ['66.6667%', '100%'], 'IV-012': ['100%', '100%'],
};
const arcanumCoreV2: Record<string, [string, string]> = {
  'AR-001': ['0%', '0%'], 'AR-002': ['33.3333%', '0%'], 'AR-003': ['66.6667%', '0%'], 'AR-004': ['100%', '0%'],
  'AR-005': ['0%', '50%'], 'AR-006': ['33.3333%', '50%'], 'AR-007': ['66.6667%', '50%'], 'AR-008': ['100%', '50%'],
  'AR-009': ['0%', '100%'], 'AR-010': ['33.3333%', '100%'], 'AR-011': ['66.6667%', '100%'], 'AR-012': ['100%', '100%'],
};
const neutralCoreV2: Record<string, [string, string]> = {
  'NE-001': ['0%', '0%'], 'NE-002': ['33.3333%', '0%'], 'NE-003': ['66.6667%', '0%'], 'NE-004': ['100%', '0%'],
  'NE-005': ['0%', '100%'], 'NE-006': ['33.3333%', '100%'], 'NE-007': ['66.6667%', '100%'], 'NE-008': ['100%', '100%'],
};

export function cardArt(name: string, code: string) {
  const catalogCode = code.match(/^(IV|AR|NE)-\d{3}/)?.[0] ?? code;
  const reviewedIronvaleArt = ironvaleCoreV2[catalogCode];
  if (reviewedIronvaleArt) {
    return {
      className: 'ironvale-core-v2-art',
      style: {
        '--art-x': reviewedIronvaleArt[0],
        '--art-y': reviewedIronvaleArt[1],
      } as CSSProperties,
    };
  }
  const reviewedArcanumArt = arcanumCoreV2[catalogCode];
  if (reviewedArcanumArt) return {
    className: 'arcanum-core-v2-art',
    style: { '--art-x': reviewedArcanumArt[0], '--art-y': reviewedArcanumArt[1] } as CSSProperties,
  };
  const reviewedNeutralArt = neutralCoreV2[catalogCode];
  if (reviewedNeutralArt) return {
    className: 'neutral-core-v2-art',
    style: { '--art-x': reviewedNeutralArt[0], '--art-y': reviewedNeutralArt[1] } as CSSProperties,
  };
  const reservoirTile = reservoirTiles[catalogCode];
  if (reservoirTile !== undefined) return {
    className: 'reservoir-art',
    style: {
      '--art-x': `${reservoirTile % 3 * 50}%`,
      '--art-y': `${Math.floor(reservoirTile / 3) * 50}%`,
    } as CSSProperties,
  };
  const normalizedName = normalize(name);
  const semanticTile = Object.entries(rules).find(([keyword]) => normalizedName.includes(keyword))?.[1];
  const faction = catalogCode.startsWith('IV') ? 'ironvale' : catalogCode.startsWith('AR') ? 'arcanum' : 'neutral';
  const fallback = Number(catalogCode.split('-')[1] ?? 1) - 1;
  const tile = semanticTile ?? fallback % 36;
  return {
    className: `faction-${faction}`,
    style: {
      '--art-x': `${tile % 6 * 20}%`,
      '--art-y': `${Math.floor(tile / 6) * 20}%`,
    } as CSSProperties,
  };
}
