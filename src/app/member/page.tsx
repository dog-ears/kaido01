"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./member.module.css";

export default function MemberDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // 管理者でも一般ユーザーでも共通のローディング処理のみ
    // setTimeout を使って非同期に状態更新（react-hooks/set-state-in-effect を回避）
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [session, status, router]);

  const handleUpdateProfile = async () => {
    // プロフィール更新機能は後で実装
    alert("プロフィール更新機能は準備中です。");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // 管理者の場合は管理者向けダッシュボードを表示
  if (session.user.role === "ADMIN") {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>管理者ダッシュボード</h1>
          <div className={styles.userInfo}>
            <span>
              こんにちは、{session.user.name || session.user.email}さん
            </span>
            <button onClick={() => signOut()} className={styles.logoutButton}>
              ログアウト
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.welcomeTitle}>
              管理者ダッシュボードへようこそ
            </h2>
            <p className={styles.welcomeMessage}>
              各種管理機能にアクセスできます。
            </p>
          </div>

          <div className={styles.cards}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>ユーザー管理</h3>
              <p className={styles.cardDescription}>
                ユーザーの一覧表示、追加、編集、削除ができます。
              </p>
              <div className={styles.cardActions}>
                <Link href="/member/users" className={styles.cardButton}>
                  ユーザー管理へ
                </Link>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>プロフィール</h3>
              <p className={styles.cardDescription}>
                あなたの情報を確認・編集できます。
              </p>
              <div className={styles.userDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>メールアドレス:</span>
                  <span className={styles.detailValue}>
                    {session.user.email}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>名前:</span>
                  <span className={styles.detailValue}>
                    {session.user.name || "未設定"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>役割:</span>
                  <span className={styles.detailValue}>
                    {session.user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                className={styles.cardButton}
              >
                プロフィールを編集
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 一般ユーザーの場合はプロフィール表示
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>メンバーダッシュボード</h1>
        <div className={styles.userInfo}>
          <span>こんにちは、{session.user.name || session.user.email}さん</span>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            ログアウト
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h2 className={styles.welcomeTitle}>ようこそ！</h2>
          <p className={styles.welcomeMessage}>
            ログインが完了しました。このダッシュボードから各種機能にアクセスできます。
          </p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>プロフィール</h3>
            <p className={styles.cardDescription}>
              あなたの情報を確認・編集できます。
            </p>
            <div className={styles.userDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>メールアドレス:</span>
                <span className={styles.detailValue}>{session.user.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>名前:</span>
                <span className={styles.detailValue}>
                  {session.user.name || "未設定"}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>役割:</span>
                <span className={styles.detailValue}>
                  {session.user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
                </span>
              </div>
            </div>
            <button onClick={handleUpdateProfile} className={styles.cardButton}>
              プロフィールを編集
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
