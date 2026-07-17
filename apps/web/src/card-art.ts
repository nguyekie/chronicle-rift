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

export function cardArt(name: string, code: string) {
  const normalizedName = normalize(name);
  const semanticTile = Object.entries(rules).find(([keyword]) => normalizedName.includes(keyword))?.[1];
  const faction = code.startsWith('IV') ? 'ironvale' : code.startsWith('AR') ? 'arcanum' : 'neutral';
  const fallback = Number(code.split('-')[1] ?? 1) - 1;
  const tile = semanticTile ?? fallback % 36;
  return {
    className: `faction-${faction}`,
    style: {
      '--art-x': `${tile % 6 * 20}%`,
      '--art-y': `${Math.floor(tile / 6) * 20}%`,
    } as CSSProperties,
  };
}
