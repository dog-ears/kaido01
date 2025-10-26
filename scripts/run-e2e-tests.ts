import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runE2ETests() {
  try {
    console.log('🔧 Setting up test users...');
    const { stdout: setupStdout, stderr: setupStderr } = await execAsync('bunx tsx scripts/setup-test-users.ts');
    if (setupStdout) console.log(setupStdout);
    if (setupStderr) console.error(setupStderr);
    
    console.log('✅ Starting E2E tests...');
    const { stdout: testStdout, stderr: testStderr } = await execAsync('npx playwright test', {
      cwd: process.cwd(),
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

runE2ETests();
