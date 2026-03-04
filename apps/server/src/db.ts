import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 确保环境变量在模块初始化时就已加载
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

export const prisma = new PrismaClient({ adapter });
