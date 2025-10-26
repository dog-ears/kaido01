import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  // テスト用データベースに接続
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL environment variable is not set');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });

  try {
    const adminPassword = await hashPassword('adminpassword123');
    const userPassword = await hashPassword('userpassword123');

    // 既存のユーザーを削除（クリーンアップ）
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

    console.log('✅ Test database setup complete!');
    console.log('  - admin@example.com (password: adminpassword123)');
    console.log('  - user@example.com (password: userpassword123)');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();

