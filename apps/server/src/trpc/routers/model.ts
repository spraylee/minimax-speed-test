import { MODELS } from "../../services/benchmark.js";
import { publicProcedure, router } from "../trpc.js";

export const modelRouter = router({
  list: publicProcedure.query(() => {
    return MODELS;
  }),
});
