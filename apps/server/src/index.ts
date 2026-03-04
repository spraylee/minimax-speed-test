import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { appRouter } from "./trpc/router.js";
import { startScheduler } from "./scheduler.js";

const app = new Hono();

// CORS（开发环境允许 Vite dev server）
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173"],
  })
);

// 挂载 tRPC
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
  })
);

// 健康检查
app.get("/api/health", (c) => c.json({ status: "ok" }));

// 生产环境托管前端静态文件
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./web" }));
  // SPA fallback
  app.get("/*", serveStatic({ root: "./web", path: "index.html" }));
}

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`[Server] 运行在 http://localhost:${port}`);
});

// 启动定时任务
startScheduler();
