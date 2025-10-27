import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let pool: Pool;
let adapter: PrismaPg;

// シングルトンインスタンスを作成
const prismaClientSingleton = () => {
  // プールとアダプターを毎回新規作成（環境変数が変わった場合に対応）
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// グローバルにキャッシュしない（毎回新しいインスタンスを作成して環境変数を反映）
export const prisma = prismaClientSingleton();
