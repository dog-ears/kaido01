import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';
import { join } from 'path';

// SQLiteテストデータベースに接続
const testDbPath = join(process.cwd(), 'prisma', 'test.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${testDbPath}`,
    },
  },
});

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  try {
    // テスト用のユーザーを作成
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
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();
