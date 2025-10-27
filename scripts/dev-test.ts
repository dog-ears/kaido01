import { spawn } from 'child_process';

async function startDevServerWithTestDB() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  
  if (!testDatabaseUrl) {
    console.error('❌ TEST_DATABASE_URL 環境変数が設定されていません');
    console.log('💡 .env.local に TEST_DATABASE_URL を設定してください');
    process.exit(1);
  }

  console.log('🔧 テスト用データベースで開発サーバーを起動します...');
  console.log('📍 DATABASE_URL:', testDatabaseUrl);

  // DATABASE_URL を TEST_DATABASE_URL に設定して開発サーバーを起動
  const devServer = spawn('bun', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    shell: true,
  });

  devServer.on('error', (error) => {
    console.error('❌ 開発サーバーの起動に失敗しました:', error);
    process.exit(1);
  });

  devServer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ 開発サーバーがエラーで終了しました: ${code}`);
      process.exit(code);
    }
  });

  // Ctrl+C で終了
  process.on('SIGINT', () => {
    console.log('\n🛑 開発サーバーを停止します...');
    devServer.kill();
    process.exit(0);
  });
}

startDevServerWithTestDB();

