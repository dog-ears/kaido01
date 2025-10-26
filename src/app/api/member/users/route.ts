import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";
import { Resend } from "resend";
import crypto from "crypto";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ユーザー一覧取得
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "管理者権限が必要です。" },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}

// 新しいユーザー作成
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "管理者権限が必要です。" },
                { status: 403 }
            );
        }

        const { email, name, role } = await request.json();

        if (!email || !role) {
            return NextResponse.json(
                { message: "メールアドレスと役割が必要です。" },
                { status: 400 }
            );
        }

        // メールアドレスの重複チェック
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "このメールアドレスは既に使用されています。" },
                { status: 400 }
            );
        }

        // 新しいユーザーを作成（パスワードは空で、初回ログイン時にパスワードリセットメールで設定）
        const user = await prisma.user.create({
            data: {
                email,
                name: name || null,
                role,
                password: null, // 初回ログイン時にパスワードリセットメールで設定
                isActive: true,
            },
        });

        // パスワードリセットメールを送信
        try {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日間有効

            // VerificationTokenを作成
            await prisma.verificationToken.create({
                data: {
                    identifier: email,
                    token: resetToken,
                    expires: resetTokenExpiry,
                },
            });

            // メール送信（Resendが設定されている場合のみ）
            if (process.env.RESEND_API_KEY) {
                const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

                // テスト環境では自分のメールアドレスに送信
                const testEmail = "info@dog-ears.net";

                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
                    to: testEmail, // テスト用に自分のメールアドレスを使用
                    subject: "アカウント作成完了 - パスワード設定",
                    html: `
                        <h2>アカウント作成完了</h2>
                        <p>こんにちは、${name || email}さん</p>
                        <p>アカウントが正常に作成されました。以下のリンクをクリックしてパスワードを設定してください：</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">パスワードを設定</a>
                        <p>このリンクは7日間有効です。</p>
                        <p>もしこのメールに心当たりがない場合は、無視してください。</p>
                        <hr>
                        <p><strong>テスト情報:</strong></p>
                        <p>実際の送信先: ${email}</p>
                        <p>テスト送信先: ${testEmail}</p>
                    `,
                });
            }
        } catch (emailError) {
            console.error("パスワードリセットメール送信エラー:", emailError);
            // メール送信に失敗してもユーザーは作成済みなので、成功レスポンスを返す
        }

        return NextResponse.json(
            { message: "ユーザーが正常に作成されました。", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}
