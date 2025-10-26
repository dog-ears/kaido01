import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils";

// パスワードリセット完了
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { message: "トークンとパスワードが必要です。" },
                { status: 400 }
            );
        }

        // パスワードの長さチェック
        if (password.length < 8) {
            return NextResponse.json(
                { message: "パスワードは8文字以上で入力してください。" },
                { status: 400 }
            );
        }

        // リセットトークンを検証
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return NextResponse.json(
                { message: "無効または期限切れのトークンです。" },
                { status: 400 }
            );
        }

        // ユーザーを検索
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        // パスワードをハッシュ化して更新
        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // 使用済みトークンを削除
        await prisma.verificationToken.delete({
            where: { token },
        });

        return NextResponse.json(
            { message: "パスワードが正常にリセットされました。" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password reset completion error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}