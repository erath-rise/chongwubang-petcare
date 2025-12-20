import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始填充护理员数据...');
  console.log('⚠️  注意：此脚本跳过用户创建，请确保数据库中已有用户');

  // 首先获取现有用户
  const existingUsers = await prisma.user.findMany({
    take: 5,
  });

  if (existingUsers.length === 0) {
    console.log('❌ 数据库中没有用户！请先注册一些用户或使用完整的 seed.js');
    console.log('💡 提示：你可以通过前端注册页面创建用户，或者修复 bcrypt 后运行 npm run seed');
    return;
  }

  console.log(`✅ 找到 ${existingUsers.length} 个现有用户`);

  // 为现有用户创建护理员档案
  const sitterData = [
    {
      name: '李明',
      avatar: 'https://i.pravatar.cc/150?img=12',
      description: '爱宠物的铲屎官，家有3只猫 • 细心、耐心、经验丰富',
      isNew: true,
      basePrice: 50,
      city: '北京',
      address: '朝阳区建国路88号',
      latitude: '39.9042',
      longitude: '116.4074',
      rating: 4.9,
      reviewCount: 24,
      certifications: ['宠物护理师证书', '急救培训证书'],
      experience: '3年宠物护理经验，擅长照顾猫咪',
    },
    {
      name: '王芳',
      avatar: 'https://i.pravatar.cc/150?img=45',
      description: '值得信赖的宠物保姆和遛狗员',
      isNew: true,
      basePrice: 45,
      city: '北京',
      address: '海淀区中关村大街1号',
      latitude: '39.9833',
      longitude: '116.3167',
      rating: 5.0,
      reviewCount: 18,
      certifications: ['宠物美容师证书'],
      experience: '2年宠物照护经验',
    },
    {
      name: '张晓雨',
      avatar: 'https://i.pravatar.cc/150?img=32',
      description: '专业且个性化的宠物照护服务',
      isNew: true,
      basePrice: 60,
      city: '北京',
      address: '东城区王府井大街138号',
      latitude: '39.9139',
      longitude: '116.4142',
      rating: 4.8,
      reviewCount: 32,
      certifications: ['宠物训练师证书', '宠物护理师证书'],
      experience: '5年宠物训练和照护经验',
    },
    {
      name: '刘强',
      avatar: 'https://i.pravatar.cc/150?img=15',
      description: '资深训犬师 • 周末时间充裕',
      isNew: false,
      basePrice: 75,
      city: '北京',
      address: '西城区西单北大街120号',
      latitude: '39.9075',
      longitude: '116.3761',
      rating: 4.7,
      reviewCount: 56,
      certifications: ['高级训犬师证书', '动物行为学证书'],
      experience: '8年专业训犬经验',
    },
    {
      name: '陈思琪',
      avatar: 'https://i.pravatar.cc/150?img=28',
      description: '热爱所有小动物 • 时间灵活可预约',
      isNew: false,
      basePrice: 55,
      city: '北京',
      address: '丰台区丽泽路18号',
      latitude: '39.8586',
      longitude: '116.3188',
      rating: 4.9,
      reviewCount: 41,
      certifications: ['宠物护理师证书'],
      experience: '4年宠物照护经验，特别擅长照顾小型犬',
    },
  ];

  const sitters = [];
  for (let i = 0; i < Math.min(existingUsers.length, sitterData.length); i++) {
    const user = existingUsers[i];
    const data = sitterData[i];

    // 检查用户是否已经是护理员
    const existingSitter = await prisma.sitter.findUnique({
      where: { userId: user.id },
    });

    if (existingSitter) {
      console.log(`  ⏭️  用户 ${user.username} 已经是护理员，跳过`);
      sitters.push(existingSitter);
      continue;
    }

    const sitter = await prisma.sitter.create({
      data: {
        userId: user.id,
        ...data,
      },
    });

    console.log(`  ✅ 为用户 ${user.username} 创建了护理员档案: ${data.name}`);
    sitters.push(sitter);
  }

  console.log(`\n✅ 成功创建 ${sitters.length} 个护理员档案`);

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

  console.log('\n🎉 护理员数据填充完成！');
  console.log('\n💡 现在你可以访问: http://localhost:5173/sitters?city=北京市');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
