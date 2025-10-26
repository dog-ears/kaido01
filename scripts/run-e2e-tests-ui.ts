import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runE2ETestsUI() {
  try {
    console.log('🔧 Setting up test users...');
    await execAsync('bunx tsx scripts/setup-test-users.ts');
    
    console.log('✅ Starting E2E tests in UI mode...');
    await execAsync('npx playwright test --ui');
  } catch (error) {
    console.error('❌ E2E tests failed:', error);
    process.exit(1);
  }
}

runE2ETestsUI();

