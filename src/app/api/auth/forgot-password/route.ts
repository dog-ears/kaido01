import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

// パスワードリセット用のメール送信
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: "メールアドレスが必要です。" },
                { status: 400 }
            );
        }

        // ユーザーが存在するかチェック
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
            return NextResponse.json(
                { message: "パスワードリセットのリンクを送信しました。" },
                { status: 200 }
            );
        }

        // リセットトークンを生成
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

        // 既存のVerificationTokenを削除
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // 新しいVerificationTokenを作成
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: resetToken,
                expires: resetTokenExpiry,
            },
        });

        // メール送信（Resendが設定されている場合のみ）
        const isDev = process.env.NODE_ENV === 'development';
        
        if (isDev) {
            console.log("=== パスワードリセットメール送信チェック ===");
            console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "設定済み" : "未設定");
            console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "未設定");
            console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "未設定");
            console.log("送信先メール:", email);
        }

        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

            if (isDev) {
                console.log("リセットURL:", resetUrl);
                console.log("送信元メール:", process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com");
            }

            try {
                const result = await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
                    to: email,
                    subject: "パスワードリセット",
                    html: `
                        <h2>パスワードリセット</h2>
                        <p>以下のリンクをクリックしてパスワードをリセットしてください：</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">パスワードをリセット</a>
                        <p>このリンクは24時間有効です。</p>
                        <p>もしこのメールに心当たりがない場合は、無視してください。</p>
                    `,
                });
                if (isDev) console.log("メール送信成功:", result);
            } catch (emailError) {
                console.error("メール送信エラー:", emailError);
                // メール送信に失敗してもトークンは作成済みなので、成功レスポンスを返す
            }
        } else {
            if (isDev) console.log("RESEND_API_KEYが設定されていないため、メールを送信しませんでした");
        }

        return NextResponse.json(
            { message: "パスワードリセットのリンクを送信しました。" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}