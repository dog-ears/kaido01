import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const authOptions: NextAuthOptions = {
    // JWT戦略を使用するため、adapterは不要
    // adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("=== 認証開始 ===");
                console.log("メールアドレス:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("認証情報が不完全");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    console.log("ユーザー検索結果:", user ? `見つかりました (ID: ${user.id}, Role: ${user.role})` : "見つかりませんでした");

                    if (!user || !user.password) {
                        console.log("ユーザーまたはパスワードが見つかりません");
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    console.log("パスワード検証結果:", isPasswordValid ? "成功" : "失敗");

                    if (!isPasswordValid) {
                        console.log("パスワードが一致しません");
                        return null;
                    }

                    if (!user.isActive) {
                        console.log("ユーザーがアクティブではありません");
                        return null;
                    }

                    console.log("認証成功:", { id: user.id, email: user.email, role: user.role });
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("認証エラー:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30日
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};
