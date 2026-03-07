import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🚀 开始创建管理员账户...\n');

  // 管理员账户信息
  const adminInfo = {
    username: 'admin',
    email: 'admin@petcare.com',
    password: 'admin123456', // 默认密码，建议首次登录后修改
    role: 'admin',
    isActive: true,
  };

  try {
    // 检查是否已存在管理员账户
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminInfo.email },
    });

    if (existingAdmin) {
      // 如果存在，更新为管理员
      if (existingAdmin.role !== 'admin') {
        const hashedPassword = await bcrypt.hash(adminInfo.password, 10);
        const updatedAdmin = await prisma.user.update({
          where: { email: adminInfo.email },
          data: {
            role: 'admin',
            isActive: true,
            password: hashedPassword,
          },
        });
        console.log('✅ 已更新现有用户为管理员账户');
        console.log(`   用户名: ${updatedAdmin.username}`);
        console.log(`   邮箱: ${updatedAdmin.email}`);
        console.log(`   角色: ${updatedAdmin.role}`);
      } else {
        console.log('ℹ️  管理员账户已存在');
        console.log(`   用户名: ${existingAdmin.username}`);
        console.log(`   邮箱: ${existingAdmin.email}`);
        console.log(`   角色: ${existingAdmin.role}`);
      }
    } else {
      // 创建新的管理员账户
      const hashedPassword = await bcrypt.hash(adminInfo.password, 10);
      const admin = await prisma.user.create({
        data: {
          username: adminInfo.username,
          email: adminInfo.email,
          password: hashedPassword,
          role: adminInfo.role,
          isActive: adminInfo.isActive,
        },
      });

      console.log('✅ 管理员账户创建成功！\n');
      console.log('📝 管理员登录信息:');
      console.log(`   用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   密码: ${adminInfo.password}`);
      console.log(`   角色: ${admin.role}`);
    }

    console.log('\n⚠️  安全提示: 请在生产环境中修改默认密码！');
    console.log('\n🎉 完成！');
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

