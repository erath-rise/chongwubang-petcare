import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSitterData() {
  console.log('🧹 开始清理护理员数据...');

  // 删除预订记录
  const deletedBookings = await prisma.booking.deleteMany({});
  console.log(`  ✅ 删除了 ${deletedBookings.count} 条预订记录`);

  // 删除护理员评价
  const deletedReviews = await prisma.sitterReview.deleteMany({});
  console.log(`  ✅ 删除了 ${deletedReviews.count} 条评价记录`);

  // 删除护理员可用时间
  const deletedAvailability = await prisma.sitterAvailability.deleteMany({});
  console.log(`  ✅ 删除了 ${deletedAvailability.count} 条可用时间记录`);

  // 删除护理员服务
  const deletedServices = await prisma.sitterService.deleteMany({});
  console.log(`  ✅ 删除了 ${deletedServices.count} 条服务记录`);

  // 删除护理员
  const deletedSitters = await prisma.sitter.deleteMany({});
  console.log(`  ✅ 删除了 ${deletedSitters.count} 个护理员档案`);

  console.log('\n🎉 护理员数据清理完成！');
  console.log('💡 现在可以运行: node seed-no-auth.js 重新载入数据');
}

cleanSitterData()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
