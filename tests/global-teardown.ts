import { PrismaClient } from '../../node_modules/.prisma/client-test';

async function globalTeardown() {
  console.log('🧹 Cleaning up test database... >>>');
  
  const prisma = new PrismaClient();

  try {
    // テストデータを削除
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Test database cleanup complete!');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;

