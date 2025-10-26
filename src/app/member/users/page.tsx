"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../member.module.css";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/member/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("ユーザー一覧の取得に失敗しました。");
      }
    } catch (error) {
      setError("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("このユーザーを削除しますか？")) return;

    try {
      const response = await fetch(`/api/member/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        setError("ユーザーの削除に失敗しました。");
      }
    } catch (error) {
      setError("エラーが発生しました。");
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/member/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, isActive: !isActive } : user
          )
        );
      } else {
        setError("ユーザー状態の更新に失敗しました。");
      }
    } catch (error) {
      setError("エラーが発生しました。");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>ユーザー管理</h1>
        <div className={styles.userInfo}>
          <span>こんにちは、{session.user.name || session.user.email}さん</span>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            ログアウト
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.actions}>
          <Link href="/member/users/new" className={styles.addButton}>
            新しいユーザーを追加
          </Link>
          <Link href="/member" className={styles.backButton}>
            ダッシュボードに戻る
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>メールアドレス</th>
                <th>名前</th>
                <th>役割</th>
                <th>状態</th>
                <th>作成日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name || "-"}</td>
                  <td>
                    <span
                      className={`${styles.role} ${
                        styles[user.role.toLowerCase()]
                      }`}
                    >
                      {user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        user.isActive ? styles.active : styles.inactive
                      }`}
                    >
                      {user.isActive ? "アクティブ" : "無効"}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.isActive)
                        }
                        className={`${styles.button} ${styles.toggleButton}`}
                      >
                        {user.isActive ? "無効化" : "有効化"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`${styles.button} ${styles.deleteButton}`}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
