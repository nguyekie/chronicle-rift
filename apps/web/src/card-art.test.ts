import { describe, expect, it } from 'vitest';
import { cardArt } from './card-art';
import { cards } from '@chronicle/card-data';

describe('semantic card art', () => {
  it('keeps artwork stable when a card name changes', () => {
    expect(cardArt('Nhà Luyện Kim Ánh Trăng', 'AR-036')).toEqual(cardArt('Tên đã đổi', 'AR-036'));
  });

  it('maps Mảnh Vỡ Khởi Nguyên to the floating origin shard', () => {
    const art = cardArt('Mảnh Vỡ Khởi Nguyên', 'NE-029');
    expect(art.className).toBe('faction-neutral');
    expect(art.style).toMatchObject({ '--art-x': '40%', '--art-y': '100%' });
  });

  it('keeps beasts in their card faction', () => {
    expect(cardArt('Chó Săn Khe Nứt', 'NE-003').className).toBe('neutral-core-v2-art');
  });

  it('assigns the iron giant its own Ironvale catalog cell', () => {
    const art = cardArt('Cự Thần Thép Đỏ', 'IV-043');
    expect(art.className).toBe('faction-ironvale');
    expect(art.style).toMatchObject({ '--art-x': '60%', '--art-y': '0%' });
  });

  it('assigns the living library its own Arcanum catalog cell', () => {
    const art = cardArt('Thư Viện Sống', 'AR-024');
    expect(art.className).toBe('faction-arcanum');
    expect(art.style).toMatchObject({ '--art-x': '60%', '--art-y': '0%' });
  });

  it('uses unique AI artwork for every reservoir card', () => {
    const positions = ['IV-051','IV-052','IV-053','AR-051','AR-052','AR-053','NE-051','NE-052','NE-053']
      .map(code => JSON.stringify(cardArt('Reservoir', code).style));
    expect(new Set(positions).size).toBe(9);
    expect(cardArt('Kỹ Sư Tích Năng', 'IV-051').className).toBe('reservoir-art');
  });

  it('uses twelve reviewed artworks for the first Ironvale set', () => {
    const artwork = Array.from({ length: 12 }, (_, index) => cardArt('Ironvale', `IV-${String(index + 1).padStart(3, '0')}`));
    expect(artwork.every(art => art.className === 'ironvale-core-v2-art')).toBe(true);
    expect(new Set(artwork.map(art => JSON.stringify(art.style))).size).toBe(12);
  });

  it('uses twelve reviewed artworks for the first Arcanum set', () => {
    const artwork = Array.from({ length: 12 }, (_, index) => cardArt('Arcanum', `AR-${String(index + 1).padStart(3, '0')}`));
    expect(artwork.every(art => art.className === 'arcanum-core-v2-art')).toBe(true);
    expect(new Set(artwork.map(art => JSON.stringify(art.style))).size).toBe(12);
  });

  it('uses eight reviewed artworks for the first Neutral set', () => {
    const artwork = Array.from({ length: 8 }, (_, index) => cardArt('Neutral', `NE-${String(index + 1).padStart(3, '0')}`));
    expect(artwork.every(art => art.className === 'neutral-core-v2-art')).toBe(true);
    expect(new Set(artwork.map(art => JSON.stringify(art.style))).size).toBe(8);
  });

  it('assigns every existing catalog card a unique artwork inside its faction', () => {
    for (const faction of ['IRONVALE','ARCANUM','NEUTRAL']) {
      const factionCards=cards.filter(card=>card.faction===faction);
      const artwork=factionCards.map(card=>JSON.stringify(cardArt(card.name,card.code)));
      expect(new Set(artwork).size).toBe(factionCards.length);
    }
  });

  it('uses six distinct apex artworks for cards 49 and 50', () => {
    const artwork = ['IV-049','IV-050','AR-049','AR-050','NE-049','NE-050']
      .map(code => cardArt('Apex', code));
    expect(artwork.every(art => art.className === 'apex-art')).toBe(true);
    expect(new Set(artwork.map(art => JSON.stringify(art.style))).size).toBe(6);
  });

  it('uses twelve distinct artworks for the low-cost dawn set', () => {
    const artwork = ['IV','AR','NE'].flatMap(prefix => [54,55,56,57].map(number => cardArt('Dawn', `${prefix}-0${number}`)));
    expect(artwork.every(art => art.className === 'dawn-art')).toBe(true);
    expect(new Set(artwork.map(art => JSON.stringify(art.style))).size).toBe(12);
  });

  it.each([
    ['Cờ Lệnh Bất Khuất','IV-026','20%','100%'],
    ['Cây Cổ Thụ Biết Đi','NE-034','100%','60%'],
    ['Học Giả Sao Chổi','AR-031','20%','80%'],
    ['Cá Voi Trên Mây','NE-031','80%','20%'],
    ['Đại Pháp Sư Orin','AR-020','0%','0%'],
    ['Người Dệt Thời Gian','AR-023','80%','40%'],
    ['Hòn Đảo Trôi Dạt','NE-039','80%','40%'],
    ['Thư Viện Vô Tận','AR-043','100%','100%'],
    ['Mặt Nạ Cổ Thần','NE-047','60%','20%'],
    ['Mắt Bão Vĩnh Hằng','AR-025','80%','20%'],
  ])('keeps reviewed artwork for %s', (name,code,x,y) => {
    expect(cardArt(name,code).style).toMatchObject({'--art-x':x,'--art-y':y});
  });
});
