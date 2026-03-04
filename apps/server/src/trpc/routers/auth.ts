import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Jwt } from "hono/utils/jwt";
import { publicProcedure, protectedProcedure, router } from "../trpc.js";

export const authRouter = router({
  // 登录
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (
        input.username !== adminUsername ||
        input.password !== adminPassword
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户名或密码错误",
        });
      }

      const secret = process.env.JWT_SECRET || "default-secret";
      const token = await Jwt.sign(
        {
          username: input.username,
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 天
        },
        secret
      );

      return { token, username: input.username };
    }),

  // 获取当前用户信息
  me: protectedProcedure.query(({ ctx }) => {
    return { username: ctx.user.username };
  }),
});
