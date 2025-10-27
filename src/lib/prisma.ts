import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// シングルトンインスタンスを作成
const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 開発環境ではグローバルキャッシュを使用、本番環境では毎回新規作成
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// 開発環境でのみグローバルにキャッシュ
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
