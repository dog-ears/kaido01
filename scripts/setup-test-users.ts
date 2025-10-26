import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/utils';

async function setupTestUsers() {
  console.log('🔧 Setting up test users in development database...');
  
  try {
    const adminPassword = await hashPassword('adminpassword123');
    const userPassword = await hashPassword('userpassword123');

    // 既存のユーザーを削除
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@example.com', 'user@example.com'],
        },
      },
    });

    // 管理者ユーザーを作成
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // 一般ユーザーを作成
    await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: userPassword,
        role: 'USER',
        isActive: true,
      },
    });

    console.log('✅ Test users setup complete!');
    console.log('  - admin@example.com (password: adminpassword123)');
    console.log('  - user@example.com (password: userpassword123)');
  } catch (error) {
    console.error('❌ Test users setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUsers();

