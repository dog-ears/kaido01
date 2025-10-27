import { test, expect } from '@playwright/test';

test.describe('権限表示テスト', () => {
  test('一般ユーザーには管理者専用UIが表示されない', async ({ page }) => {
    // 一般ユーザーのメールアドレスとパスワードを想定
    const userEmail = 'user@example.com';
    const userPassword = 'userpassword123';

    // ログインページにアクセス
    await page.goto('/auth/signin');

    // ログインフォームが表示されるまで待つ
    await page.waitForSelector('#email');

    // ログイン情報を入力
    await page.fill('#email', userEmail);
    await page.fill('#password', userPassword);
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ダッシュボードにリダイレクトされるまで待機
    await page.waitForURL('/member');

    // 管理者専用UIが表示されないことを確認
    await expect(page.locator('text=ユーザー管理')).not.toBeVisible();
    await expect(page.locator('text=ユーザー管理へ')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '管理者ダッシュボード', exact: true })).not.toBeVisible();

    // 一般ユーザー用UIが表示されることを確認
    await expect(page.locator('text=メンバーダッシュボード')).toBeVisible();
  });

  test('管理者には管理者専用UIが表示される', async ({ page }) => {
    // 管理者のメールアドレスとパスワードを想定
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword123';

    // ログインページにアクセス
    await page.goto('/auth/signin');

    // ログインフォームが表示されるまで待つ
    await page.waitForSelector('#email');

    // ログイン情報を入力
    await page.fill('#email', adminEmail);
    await page.fill('#password', adminPassword);
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');

    // ダッシュボードにリダイレクトされるまで待機
    await page.waitForURL('/member');

    // 管理者専用UIが表示されることを確認
    await expect(page.getByRole('heading', { name: '管理者ダッシュボード', exact: true })).toBeVisible();
    await expect(page.locator('text=ユーザー管理')).toBeVisible();
    await expect(page.locator('text=ユーザー管理へ')).toBeVisible();
  });

  test('ログアウト機能が動作する', async ({ page }) => {
    // テスト用ユーザーでログイン
    const userEmail = 'user@example.com';
    const userPassword = 'userpassword123';

    await page.goto('/auth/signin');

    // ログインフォームが表示されるまで待つ
    await page.waitForSelector('#email');

    await page.fill('#email', userEmail);
    await page.fill('#password', userPassword);
    await page.click('button[type="submit"]');

    // ダッシュボードにいることを確認
    await page.waitForURL('/member');
    await expect(page.locator('text=メンバーダッシュボード')).toBeVisible();

    // ログアウトボタンをクリック
    await page.click('button:has-text("ログアウト")');

    // ログインページにリダイレクトされることを確認
    await page.waitForURL('/auth/signin');
    await expect(page.locator('text=ログイン')).toBeVisible();
  });
});

