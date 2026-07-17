import { describe, expect, it } from 'vitest';
import { cardArt } from './card-art';

describe('semantic card art', () => {
  it('maps Vietnamese names after removing accents', () => {
    expect((cardArt('Nhà Luyện Kim Ánh Trăng', 'AR-036').style as Record<string, string>)['--art-x']).toBe('20%');
  });

  it('maps Mảnh Vỡ Khởi Nguyên to the floating origin shard', () => {
    const art = cardArt('Mảnh Vỡ Khởi Nguyên', 'NE-029');
    expect(art.className).toBe('faction-neutral');
    expect(art.style).toMatchObject({ '--art-x': '40%', '--art-y': '100%' });
  });

  it('keeps beasts in their card faction', () => {
    expect(cardArt('Chó Săn Khe Nứt', 'NE-003').className).toBe('faction-neutral');
  });

  it('maps iron giants semantically in Ironvale', () => {
    const art = cardArt('Cự Thần Thép Đỏ', 'IV-043');
    expect(art.className).toBe('faction-ironvale');
    expect(art.style).toMatchObject({ '--art-x': '60%', '--art-y': '0%' });
  });

  it('maps libraries semantically in Arcanum', () => {
    const art = cardArt('Thư Viện Sống', 'AR-024');
    expect(art.className).toBe('faction-arcanum');
    expect(art.style).toMatchObject({ '--art-x': '60%', '--art-y': '0%' });
  });
});
