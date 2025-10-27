"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./new.module.css";

export default function NewUser() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "USER" as "USER" | "ADMIN",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!session || !session.user || session.user.role !== "ADMIN") {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/member/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/member/users");
      } else {
        const data = await response.json();
        setError(data.message || "ユーザーの作成に失敗しました。");
      }
    } catch {
      setError("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>新しいユーザーを追加</h1>
        <Link href="/member/users" className={styles.backButton}>
          ユーザー一覧に戻る
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                メールアドレス *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="role" className={styles.label}>
                役割 *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.select}
                required
                disabled={isLoading}
              >
                <option value="USER">一般ユーザー</option>
                <option value="ADMIN">管理者</option>
              </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "作成中..." : "ユーザーを作成"}
              </button>
              <Link href="/member/users" className={styles.cancelButton}>
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
