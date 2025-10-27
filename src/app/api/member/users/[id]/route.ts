import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ユーザー削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "管理者権限が必要です。" },
                { status: 403 }
            );
        }

        const { id } = await params;

        // ユーザーが存在するか確認
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        // ユーザーを削除（カスケード削除でセッションとアカウント情報も削除される）
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "ユーザーが削除されました。" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}

// ユーザー情報更新（主にisActiveの切り替え）
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "管理者権限が必要です。" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const { isActive } = await request.json();

        // ユーザーが存在するか確認
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        // ユーザー情報を更新
        await prisma.user.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(
            { message: "ユーザー情報が更新されました。" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}

