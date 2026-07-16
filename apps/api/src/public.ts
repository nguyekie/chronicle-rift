import{Router}from'express';
import{craftCost,dismantleValue,packRates}from'./pack-logic.js';
const r=Router();
r.get('/pack-rates',(_q,s)=>s.json({updatedAt:'2026-07-16',slots:5,packs:packRates,rates:packRates.BASIC,pity:{epicBoostAfter:12,legendaryGuaranteedAfter:40,separateByBanner:true},duplicate:'Thẻ vượt quá giới hạn bộ bài sẽ tự động chuyển thành Bụi',craftCost,dismantleValue}));
r.get('/legal',(_q,s)=>s.json({privacy:{title:'Chính sách quyền riêng tư',summary:'Chronicle Rift chỉ lưu dữ liệu tài khoản, trận đấu, vật phẩm và nhật ký bảo mật cần thiết để vận hành trò chơi. Mật khẩu được băm bằng Argon2 và dữ liệu cá nhân không được bán.'},terms:{title:'Điều khoản sử dụng',summary:'Người chơi không được khai thác lỗi, dùng công cụ tự động để gian lận, dàn xếp trận đấu hoặc đảo ngược giao dịch trái phép. Vật phẩm ảo không được bảo đảm có giá trị quy đổi thành tiền mặt.'},contact:'support@chronicle-rift.example'}));
export default r;
