# 認証機能の仕様

## 概要

このシステムは NextAuth.js v4 と Prisma を使用した認証システムを実装しています。Email/Password の認証方式を採用し、役割ベースのアクセス制御（RBAC）によりユーザーの権限を管理します。

## 認証方式

### プロバイダー

- **CredentialsProvider**: メールアドレスとパスワードによる認証
- **セッション戦略**: JWT（JSON Web Token）
- **セッション有効期間**: 30 日間

### 認証フロー

1. ユーザーがログインフォームにメールアドレスとパスワードを入力
2. NextAuth.js の `authorize` 関数が実行される
3. データベースからユーザー情報を取得
4. パスワードを bcrypt で検証
5. ユーザーが有効（`isActive = true`）かつパスワードが正しい場合、認証成功
6. JWT トークンにユーザー情報（ID、メール、名前、役割）を含めて返却
7. セッションが確立され、ダッシュボードにリダイレクト

## データベーススキーマ

### User モデル

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // ハッシュ化されたパスワード
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}
```

### UserRole 列挙型

```prisma
enum UserRole {
  USER   // 一般ユーザー
  ADMIN  // 管理者
}
```

### NextAuth.js 標準モデル

- **Account**: OAuth プロバイダーのアカウント情報
- **Session**: セッション管理
- **VerificationToken**: パスワードリセット用のトークン

## セキュリティ機能

### パスワードハッシュ化

- **アルゴリズム**: bcrypt（salt rounds: 12）
- **関数**: `hashPassword()` と `verifyPassword()` で実装
- **場所**: `src/lib/utils.ts`

### パスワード検証

```typescript
// パスワード要件
- 最小長: 8文字
- 検証関数: validatePassword()
```

### セキュリティ対策

1. **パスワードリセットの実装**

   - ユーザーが存在しない場合でも成功レスポンスを返す（ユーザー列挙攻撃の防止）
   - リセットトークンは 24 時間有効
   - トークン使用後は即座に削除

2. **セッション管理**

   - JWT 戦略によるステートレスな認証
   - セッション有効期間: 30 日間
   - ログアウト時にセッションを無効化

3. **アクティブ状態のチェック**
   - 無効化されたユーザー（`isActive = false`）はログイン不可

## パスワードリセット機能

### フロー

1. **パスワードリセット要求** (`/auth/forgot-password`)

   - ユーザーがメールアドレスを入力
   - システムがリセットトークンを生成（32 バイトのランダム文字列）
   - トークンを `VerificationToken` テーブルに保存（24 時間有効）
   - メールでリセットリンクを送信（Resend を使用）

2. **パスワードリセット実行** (`/auth/reset-password`)
   - ユーザーがリセットリンクをクリック
   - トークンが有効期限内で存在するか確認
   - 新しいパスワードを入力（8 文字以上）
   - パスワードをハッシュ化してデータベースに更新
   - 使用済みトークンを削除

### メール送信

- **サービス**: Resend
- **送信元**: 環境変数 `RESEND_FROM_EMAIL`
- **API キー**: 環境変数 `RESEND_API_KEY`
- **有効期限**: 24 時間

## ユーザー管理機能

### 管理者専用機能

1. **ユーザー一覧表示** (`/member/users`)

   - 全ユーザーの情報をテーブル形式で表示
   - メールアドレス、名前、役割、状態、作成日

2. **新規ユーザー作成** (`/member/users/new`)

   - メールアドレス、名前、役割を設定
   - 新規ユーザー作成時はパスワードリセットメールを自動送信
   - ユーザーは初回ログイン時にパスワードを設定

3. **ユーザー状態の変更** (`PATCH /api/member/users/[id]`)

   - アクティブ/無効の切り替え

4. **ユーザー削除** (`DELETE /api/member/users/[id]`)
   - 永続的な削除（カスケード削除でセッションとアカウント情報も削除）

### 権限チェック

- API エンドポイントで `getServerSession()` を使用して管理者権限を確認
- 一般ユーザーが管理者専用ページにアクセスした場合、リダイレクトされる

## API エンドポイント

### 認証関連

| エンドポイント              | メソッド | 概要                                                           |
| --------------------------- | -------- | -------------------------------------------------------------- |
| `/api/auth/[...nextauth]`   | GET/POST | NextAuth.js の認証 API（ログイン・ログアウト・セッション管理） |
| `/api/auth/forgot-password` | POST     | パスワードリセット用のメール送信                               |
| `/api/auth/reset-password`  | POST     | 新しいパスワードの設定                                         |

### ユーザー管理（管理者専用）

| エンドポイント           | メソッド | 概要             |
| ------------------------ | -------- | ---------------- |
| `/api/member/users`      | GET      | ユーザー一覧取得 |
| `/api/member/users`      | POST     | 新規ユーザー作成 |
| `/api/member/users/[id]` | PATCH    | ユーザー情報更新 |
| `/api/member/users/[id]` | DELETE   | ユーザー削除     |

## ユーティリティ関数

### パスワード関連

```typescript
// src/lib/utils.ts
- hashPassword(password: string): Promise<string>
- verifyPassword(password: string, hashedPassword: string): Promise<boolean>
- validatePassword(password: string): boolean  // 8文字以上をチェック
- validateEmail(email: string): boolean       // メールアドレスの形式チェック
```

### セッション関連

```typescript
// src/lib/auth.ts
- NextAuth の設定: authOptions
- JWT コールバック: トークンに role を付与
- セッションコールバック: セッションに role を追加
```

## スクリプト

### 管理者アカウント作成

```bash
bun run create-admin
```

- **環境変数**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **動作**:
  - 既存の管理者がいない場合のみ作成
  - パスワードをハッシュ化してデータベースに保存
  - メールは送信しない

### 管理者アカウント更新

```bash
bun run update-admin
```

- **環境変数**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **動作**:
  - 既存の管理者を検索して更新
  - 新しいパスワードをハッシュ化して更新
  - メールは送信しない

## 環境変数

### 必須環境変数

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Resend（メール送信）
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### オプション環境変数

```env
# 管理者アカウント（スクリプト用）
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
```

## 認証フロー

### ログイン

1. `/` にアクセス
2. 未認証の場合 → `/auth/signin` にリダイレクト
3. 認証成功 → `/member`（ダッシュボード）にリダイレクト
4. 既にログイン済みの場合 → `/member` に直接リダイレクト

### ログアウト

1. ログアウトボタンをクリック
2. NextAuth.js のログアウト処理を実行
3. `/auth/signin` にリダイレクト

### 権限に基づくアクセス制御

- **管理者**:
  - `/member`: プロフィール情報とユーザー管理へのリンク
  - `/member/users`: ユーザー一覧表示
  - `/member/users/new`: 新規ユーザー作成
- **一般ユーザー**:
  - `/member`: プロフィール情報のみ
  - `/member/users`: アクセス不可（リダイレクト）
  - `/member/users/new`: アクセス不可（リダイレクト）

## TypeScript 型定義

### セッション型の拡張

```typescript
// src/types/next-auth.d.ts
- Session.user に role プロパティを追加
- User インターフェースに role プロパティを追加
- JWT トークンに role プロパティを追加
```

## エラーハンドリング

### 認証エラー

- 無効な認証情報: `null` を返却（UI でエラーメッセージ表示）
- 無効なユーザー: `null` を返却
- 一般ユーザーが管理者ページにアクセス: ログインページにリダイレクト

### パスワードリセットエラー

- 無効なトークン: 400 エラー
- 期限切れトークン: 400 エラー
- パスワードが短い: 400 エラー（8 文字以上）
- ユーザーが見つからない: 404 エラー

## 注意事項

1. **環境変数の取り扱い**

   - `.env` と `.env.local` は手動で編集する必要がある
   - AI アシスタントはこれらのファイルを編集しない

2. **パスワード要件**

   - 最小長: 8 文字
   - bcrypt でハッシュ化（salt rounds: 12）

3. **メール送信**

   - Resend を使用
   - テスト環境では送信制限がある可能性
   - 本番環境ではドメイン認証が必要

4. **セッション管理**
   - JWT を使用したステートレスな認証
   - セッション有効期間: 30 日間
   - ブラウザを閉じてもセッションは維持される
