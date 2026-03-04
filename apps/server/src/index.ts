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
import { verify } from "hono/jwt";
import { appRouter } from "./trpc/router.js";
import { startScheduler } from "./scheduler.js";
import type { Context } from "./trpc/trpc.js";

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
    createContext: async (_opts, c): Promise<Context> => {
      const authHeader = c.req.header("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return {};
      }
      try {
        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET || "default-secret";
        const payload = await verify(token, secret);
        return { user: { username: payload.username as string } };
      } catch {
        return {};
      }
    },
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

const port = Number(process.env.PORT) || 8010;

serve({ fetch: app.fetch, port }, () => {
  console.log(`[Server] 运行在 http://localhost:${port}`);
});

// 启动定时任务
startScheduler();
