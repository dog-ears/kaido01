import { hashPassword } from "../src/lib/utils";
import { config } from "dotenv";

// 環境変数を読み込み
config({ path: ".env" });

// スクリプトでは@prisma/clientではなく、Prismaを直接使用する
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

        console.log(`管理者アカウントを作成します: ${adminEmail}`);

        // 既存の管理者をチェック
        const existingAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        });

        if (existingAdmin) {
            console.log("管理者アカウントは既に存在します。");
            return;
        }

        // 管理者アカウントを作成
        const hashedPassword = await hashPassword(adminPassword);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "管理者",
                password: hashedPassword,
                role: "ADMIN",
                isActive: true,
            },
        });

        console.log("管理者アカウントが正常に作成されました:");
        console.log(`- メールアドレス: ${admin.email}`);
        console.log(`- 名前: ${admin.name}`);
        console.log(`- 役割: ${admin.role}`);
    } catch (error) {
        console.error("管理者アカウントの作成中にエラーが発生しました:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
