import { router } from "./trpc.js";
import { benchmarkRouter } from "./routers/benchmark.js";
import { modelRouter } from "./routers/model.js";

export const appRouter = router({
  benchmark: benchmarkRouter,
  model: modelRouter,
});

export type AppRouter = typeof appRouter;
