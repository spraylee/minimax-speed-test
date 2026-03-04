import {
  createTRPCClient,
  httpBatchLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/src/trpc/router.js";
import { getToken } from "./lib/auth";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      headers() {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
