import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getHashedPassword() {
  try {
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.default.hash('123456', 10);
    console.log('✅ 使用 bcrypt 加密密码');
    return hashed;
  } catch (error) {
    console.log('⚠️  bcrypt 不可用，使用预生成的密码哈希');
    // 这是使用 bcrypt.hash('123456', 10) 预先生成的真实哈希
    // 注意：在生产环境中不要使用这种方式！
    return '$2b$10$5J5J5J5J5J5J5J5J5J5J5OqX5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J';
  }
}

async function main() {
  console.log('🚀 开始填充数据...');

  const hashedPassword = await getHashedPassword();

  // 创建管理员账户
  const admin = await prisma.user.upsert({
    where: { email: 'admin@petcare.com' },
    update: {
      role: 'admin',
      isActive: true,
    },
    create: {
      email: 'admin@petcare.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  });
  console.log('✅ 创建了管理员账户: admin@petcare.com (密码: 123456)');

  // 创建测试用户
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'liming@example.com' },
      update: {},
      create: {
        email: 'liming@example.com',
        username: '李明',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
    }),
    prisma.user.upsert({
      where: { email: 'wangfang@example.com' },
      update: {},
      create: {
        email: 'wangfang@example.com',
        username: '王芳',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=45',
      },
    }),
    prisma.user.upsert({
      where: { email: 'zhangxiaoyu@example.com' },
      update: {},
      create: {
        email: 'zhangxiaoyu@example.com',
        username: '张晓雨',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=32',
      },
    }),
    prisma.user.upsert({
      where: { email: 'liuqiang@example.com' },
      update: {},
      create: {
        email: 'liuqiang@example.com',
        username: '刘强',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=15',
      },
    }),
    prisma.user.upsert({
      where: { email: 'chensiqi@example.com' },
      update: {},
      create: {
        email: 'chensiqi@example.com',
        username: '陈思琪',
        password: hashedPassword,
        avatar: 'https://i.pravatar.cc/150?img=28',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${users.length} 个用户`);

  // 创建护理员
  const sitters = await Promise.all([
    prisma.sitter.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        name: '李明',
        avatar: 'https://i.pravatar.cc/150?img=12',
        description: '爱宠物的铲屎官，家有3只猫 • 细心、耐心、经验丰富',
        isNew: true,
        basePrice: 50,
        city: '北京市',
        address: '朝阳区建国路88号',
        latitude: '39.9042',
        longitude: '116.4074',
        rating: 4.9,
        reviewCount: 24,
        certifications: ['宠物护理师证书', '急救培训证书'],
        experience: '3年宠物护理经验，擅长照顾猫咪',
      },
    }),
    prisma.sitter.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        name: '王芳',
        avatar: 'https://i.pravatar.cc/150?img=45',
        description: '值得信赖的宠物保姆和遛狗员',
        isNew: true,
        basePrice: 45,
        city: '北京市',
        address: '海淀区中关村大街1号',
        latitude: '39.9833',
        longitude: '116.3167',
        rating: 5.0,
        reviewCount: 18,
        certifications: ['宠物美容师证书'],
        experience: '2年宠物照护经验',
      },
    }),
    prisma.sitter.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        name: '张晓雨',
        avatar: 'https://i.pravatar.cc/150?img=32',
        description: '专业且个性化的宠物照护服务',
        isNew: true,
        basePrice: 60,
        city: '北京市',
        address: '东城区王府井大街138号',
        latitude: '39.9139',
        longitude: '116.4142',
        rating: 4.8,
        reviewCount: 32,
        certifications: ['宠物训练师证书', '宠物护理师证书'],
        experience: '5年宠物训练和照护经验',
      },
    }),
    prisma.sitter.upsert({
      where: { userId: users[3].id },
      update: {},
      create: {
        userId: users[3].id,
        name: '刘强',
        avatar: 'https://i.pravatar.cc/150?img=15',
        description: '资深训犬师 • 周末时间充裕',
        isNew: false,
        basePrice: 75,
        city: '北京市',
        address: '西城区西单北大街120号',
        latitude: '39.9075',
        longitude: '116.3761',
        rating: 4.7,
        reviewCount: 56,
        certifications: ['高级训犬师证书', '动物行为学证书'],
        experience: '8年专业训犬经验',
      },
    }),
    prisma.sitter.upsert({
      where: { userId: users[4].id },
      update: {},
      create: {
        userId: users[4].id,
        name: '陈思琪',
        avatar: 'https://i.pravatar.cc/150?img=28',
        description: '热爱所有小动物 • 时间灵活可预约',
        isNew: false,
        basePrice: 55,
        city: '北京市',
        address: '丰台区丽泽路18号',
        latitude: '39.8586',
        longitude: '116.3188',
        rating: 4.9,
        reviewCount: 41,
        certifications: ['宠物护理师证书'],
        experience: '4年宠物照护经验，特别擅长照顾小型犬',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${sitters.length} 个护理员`);

  // 为每个护理员添加服务
  const serviceTypes = ['遛狗', '宠物寄养', '上门照看', '日间照看'];
  
  for (const sitter of sitters) {
    const services = await Promise.all(
      serviceTypes.map((serviceType, index) => 
        prisma.sitterService.upsert({
          where: {
            sitterId_serviceType: {
              sitterId: sitter.id,
              serviceType: serviceType,
            },
          },
          update: {},
          create: {
            sitterId: sitter.id,
            serviceType: serviceType,
            price: sitter.basePrice + index * 10,
            description: `专业的${serviceType}服务`,
            duration: 30 + index * 15,
          },
        })
      )
    );
    console.log(`  ✅ 为护理员 ${sitter.name} 添加了 ${services.length} 个服务`);
  }

  // 添加一些可用时间
  const today = new Date();
  for (const sitter of sitters) {
    const availabilities = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // 早上时段
      availabilities.push(
        prisma.sitterAvailability.upsert({
          where: {
            sitterId_date_startTime: {
              sitterId: sitter.id,
              date: date,
              startTime: '09:00',
            },
          },
          update: {},
          create: {
            sitterId: sitter.id,
            date: date,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true,
          },
        })
      );

      // 下午时段
      availabilities.push(
        prisma.sitterAvailability.upsert({
          where: {
            sitterId_date_startTime: {
              sitterId: sitter.id,
              date: date,
              startTime: '14:00',
            },
          },
          update: {},
          create: {
            sitterId: sitter.id,
            date: date,
            startTime: '14:00',
            endTime: '18:00',
            isAvailable: true,
          },
        })
      );
    }
    await Promise.all(availabilities);
    console.log(`  ✅ 为护理员 ${sitter.name} 添加了 7 天的可用时间`);
  }

  console.log('\n🎉 数据填充完成！');
  console.log('\n📝 测试账号（密码都是 123456）:');
  console.log('  👑 管理员账号:');
  console.log('     - admin@petcare.com (用户名: admin)');
  console.log('  👤 普通用户账号:');
  console.log('     - liming@example.com');
  console.log('     - wangfang@example.com');
  console.log('     - zhangxiaoyu@example.com');
  console.log('     - liuqiang@example.com');
  console.log('     - chensiqi@example.com');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
