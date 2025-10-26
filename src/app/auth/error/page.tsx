"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./error.module.css";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "サーバー設定に問題があります。";
      case "AccessDenied":
        return "アクセスが拒否されました。";
      case "Verification":
        return "認証トークンが無効または期限切れです。";
      default:
        return "認証中にエラーが発生しました。";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⚠️</div>
        <h1 className={styles.title}>認証エラー</h1>
        <p className={styles.message}>{getErrorMessage(error)}</p>
        <div className={styles.actions}>
          <Link href="/auth/signin" className={styles.button}>
            ログインページに戻る
          </Link>
          <Link href="/" className={styles.link}>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}






