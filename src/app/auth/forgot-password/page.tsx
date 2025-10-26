"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./forgot-password.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.message || "エラーが発生しました。");
      }
    } catch (error) {
      setError("パスワードリセット中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>📧</div>
          <h1 className={styles.title}>メールを送信しました</h1>
          <p className={styles.message}>
            パスワードリセットのリンクを送信しました。
            メールボックスをご確認ください。
          </p>
          <Link href="/auth/signin" className={styles.button}>
            ログインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>パスワードリセット</h1>
        <p className={styles.description}>
          登録されているメールアドレスを入力してください。
          パスワードリセットのリンクを送信します。
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "送信中..." : "リセットリンクを送信"}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/auth/signin" className={styles.link}>
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}






