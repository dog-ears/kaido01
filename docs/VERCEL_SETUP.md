# Vercel デプロイ設定ガイド

## 必須環境変数

Vercel のダッシュボードで以下の環境変数を設定してください：

### 1. データベース接続

```
DATABASE_URL="postgresql://user:password@host:port/database"
```

### 2. NextAuth.js 設定

```
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
```

**NEXTAUTH_SECRET の生成方法:**

```bash
openssl rand -base64 32
```

### 3. Resend（メール送信）

```
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**注意:** 現在、Resendのドメイン検証が未完了のため、本番環境でのメール送信は制限されています。

#### ドメイン検証（後で対応）

Resendで任意のメールアドレスに送信するには、ドメインの検証が必要です。

1. Resendダッシュボード（`resend.com/domains`）でドメインを追加
2. 指示されたDNSレコードを設定
3. 検証完了後、`RESEND_FROM_EMAIL`を検証済みドメインのアドレスに設定
4. 任意の受信先へ送信可能になります

現在の状態では、テスト用メールアドレス（`info@dog-ears.net`）へのみ送信可能です。

## データベースセットアップ

Vercel にデプロイ後、以下のコマンドを実行してデータベースを初期化してください：

```bash
# ローカルから本番データベースに接続してマイグレーション実行
DATABASE_URL="postgresql://user:password@host:port/database" bun run db:push
```

### 管理者アカウントの作成

本番環境で管理者アカウントを作成するには、以下を実行してください：

```bash
# 本番データベースのURLを使用
DATABASE_URL="postgresql://user:password@host:port/database" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="your-password" bun run create-admin
```

## 環境変数の設定手順

1. Vercel ダッシュボードにログイン
2. プロジェクトを選択
3. Settings → Environment Variables に移動
4. 上記の環境変数を追加
5. 再デプロイを実行

## トラブルシューティング

### ログインできない場合

1. **環境変数の確認**

   - `NEXTAUTH_URL` が正しいドメインに設定されているか確認
   - `NEXTAUTH_SECRET` が設定されているか確認
   - `DATABASE_URL` が正しい接続文字列か確認

2. **データベースの確認**

   - データベースに管理者アカウントが存在するか確認
   - 管理者アカウントのパスワードが正しいか確認

3. **デプロイログの確認**
   - Vercel ダッシュボードでデプロイログを確認
   - エラーメッセージがないか確認

### よくある問題

#### 問題: "メールアドレスまたはパスワードが正しくありません"

**原因:**

- データベースにユーザーが存在しない
- 環境変数（特に `DATABASE_URL`）が正しく設定されていない
- パスワードハッシュが一致しない

**解決方法:**

1. ローカル環境で管理者を作成
2. 本番データベースに管理者を作成（上記の手順参照）
3. 環境変数を再確認

#### 問題: データベース接続エラー

**原因:**

- `DATABASE_URL` が正しく設定されていない
- データベースが起動していない
- ネットワーク接続の問題

**解決方法:**

1. データベース接続文字列を確認
2. データベースが起動しているか確認
3. ネットワーク接続を確認
