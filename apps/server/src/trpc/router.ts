import { router } from "./trpc.js";
import { authRouter } from "./routers/auth.js";
import { benchmarkRouter } from "./routers/benchmark.js";
import { modelRouter } from "./routers/model.js";

export const appRouter = router({
  auth: authRouter,
  benchmark: benchmarkRouter,
  model: modelRouter,
});

export type AppRouter = typeof appRouter;
