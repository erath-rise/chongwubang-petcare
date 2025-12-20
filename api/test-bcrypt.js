// 测试 bcrypt 是否正常工作
import bcrypt from 'bcrypt';

async function testBcrypt() {
  try {
    console.log('🔐 测试 bcrypt...\n');
    
    const password = '123456';
    console.log(`原始密码: ${password}`);
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`加密后: ${hashedPassword}\n`);
    
    // 验证正确密码
    const isValid = await bcrypt.compare('123456', hashedPassword);
    console.log(`验证 "123456": ${isValid ? '✅ 通过' : '❌ 失败'}`);
    
    // 验证错误密码
    const isInvalid = await bcrypt.compare('wrong', hashedPassword);
    console.log(`验证 "wrong": ${isInvalid ? '❌ 不应该通过' : '✅ 正确拒绝'}\n`);
    
    console.log('🎉 bcrypt 工作正常！');
    console.log('\n你可以在 seed.js 中使用这个哈希值：');
    console.log(`const hashedPassword = '${hashedPassword}';`);
    
  } catch (error) {
    console.error('❌ bcrypt 测试失败:', error.message);
    console.log('\n💡 解决方案：');
    console.log('1. 运行: pnpm rebuild bcrypt');
    console.log('2. 或运行: pnpm remove bcrypt && pnpm add bcrypt');
    console.log('3. 如果还是失败，使用备用种子脚本: node prisma/seed-no-auth.js');
  }
}

testBcrypt();
