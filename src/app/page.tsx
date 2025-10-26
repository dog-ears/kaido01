import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Kaido01 認証システム</h1>
          <p>
            Next.js + NextAuth.js による認証システムのデモアプリケーションです。
            ログインしてダッシュボードにアクセスできます。
          </p>
        </div>
        <div className={styles.ctas}>
          <Link href="/auth/signin" className={styles.primary}>
            ログイン
          </Link>
        </div>
      </main>
    </div>
  );
}
