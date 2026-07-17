import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db=new PrismaClient();
const [displayName,rawAmount]=process.argv.slice(2);
const amount=Number(rawAmount);

if(!displayName||!Number.isSafeInteger(amount)||amount<=0||amount>100_000_000){
 console.error('Cách dùng: corepack pnpm grant:gold <tên-nhân-vật> <số-vàng-từ-1-đến-100000000>');
 process.exitCode=1;
}else{
 try{
  const profile=await db.userProfile.findFirst({where:{displayName:{equals:displayName,mode:'insensitive'}},select:{userId:true,displayName:true}});
  if(!profile)throw new Error(`Không tìm thấy nhân vật "${displayName}"`);
  const wallet=await db.userCurrency.upsert({where:{userId_code:{userId:profile.userId,code:'GOLD'}},update:{balance:{increment:amount}},create:{userId:profile.userId,code:'GOLD',balance:amount}});
  console.log(`Đã cộng ${amount.toLocaleString('vi-VN')} vàng cho ${profile.displayName}. Số dư mới: ${wallet.balance.toLocaleString('vi-VN')}.`);
 }catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1}
 finally{await db.$disconnect()}
}
