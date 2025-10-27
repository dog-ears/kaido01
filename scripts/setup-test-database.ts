import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '../src/lib/utils';

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');

  // テスト用データベースに接続
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL environment variable is not set');
  }

  // Driver Adapterを使用
  const pool = new Pool({ connectionString: testDatabaseUrl });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    // テーブルが存在しない場合はエラーを無視
    try {
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
    } catch (error) {
      console.log('⚠️ テーブルが存在しないため、スキーマをプッシュします...');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      await execAsync(`bunx prisma db push --skip-generate`, {
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      });
    }

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

