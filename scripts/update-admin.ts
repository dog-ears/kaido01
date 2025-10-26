import { hashPassword } from "../src/lib/utils";
import { config } from "dotenv";

// 環境変数を読み込み
config({ path: ".env" });

// スクリプトでは@prisma/clientではなく、Prismaを直接使用する
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

        console.log(`管理者アカウントを更新します: ${adminEmail}`);

        // 既存の管理者を検索
        const existingAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        });

        if (!existingAdmin) {
            console.log("管理者アカウントが見つかりません。");
            return;
        }

        // 新しいパスワードをハッシュ化
        const hashedPassword = await hashPassword(adminPassword);

        // 管理者アカウントを更新
        const updatedAdmin = await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: "管理者",
                role: "ADMIN",
                isActive: true,
            },
        });

        console.log("管理者アカウントが正常に更新されました:");
        console.log(`- メールアドレス: ${updatedAdmin.email}`);
        console.log(`- 名前: ${updatedAdmin.name}`);
        console.log(`- 役割: ${updatedAdmin.role}`);
    } catch (error) {
        console.error("管理者アカウントの更新中にエラーが発生しました:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
