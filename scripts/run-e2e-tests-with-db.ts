import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local から環境変数を読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const execAsync = promisify(exec);

async function runE2ETestsWithDB() {
  const uiMode = process.argv.includes('--ui');

  // テスト用データベースURLを設定
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  try {
    console.log('🔧 Setting up test database...');
    const { stdout: setupStdout, stderr: setupStderr } = await execAsync('bunx tsx scripts/setup-test-database.ts', {
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL },
    });
    if (setupStdout) console.log(setupStdout);
    if (setupStderr) console.error(setupStderr);

    console.log('✅ Starting E2E tests...');
    const playwrightCommand = uiMode ? 'npx playwright test --ui' : 'npx playwright test';
    const { stdout: testStdout, stderr: testStderr } = await execAsync(playwrightCommand, {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL },
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    if (testStdout) console.log(testStdout);
    if (testStderr) console.error(testStderr);

    console.log('✅ E2E tests completed!');
  } catch (error: any) {
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    console.error('❌ E2E tests failed:', error.message);
    process.exit(1);
  }
}

runE2ETestsWithDB();

