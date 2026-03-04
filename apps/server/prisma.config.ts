import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// 加载根目录的 .env 文件
dotenv.config({ path: path.join(import.meta.dirname, "../../.env") });

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(import.meta.dirname, "prisma/migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
