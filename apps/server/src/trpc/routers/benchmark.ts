import { z } from "zod";
import { prisma } from "../../db.js";
import { runBenchmark } from "../../services/benchmark.js";
import { publicProcedure, protectedProcedure, router } from "../trpc.js";

export const benchmarkRouter = router({
  // 分页查询运行列表
  listRuns: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const [runs, total] = await Promise.all([
        prisma.benchmarkRun.findMany({
          orderBy: { startedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            results: {
              where: { error: null },
              select: {
                model: true,
                label: true,
                duration: true,
                tokensPerSecond: true,
              },
            },
          },
        }),
        prisma.benchmarkRun.count(),
      ]);

      // 计算每个 run 的各模型平均指标
      const runsWithStats = runs.map((run) => {
        const modelStats = new Map<
          string,
          { label: string; durations: number[]; tps: number[] }
        >();

        for (const r of run.results) {
          if (!modelStats.has(r.model)) {
            modelStats.set(r.model, {
              label: r.label,
              durations: [],
              tps: [],
            });
          }
          const stats = modelStats.get(r.model)!;
          stats.durations.push(r.duration);
          if (r.tokensPerSecond != null) {
            stats.tps.push(r.tokensPerSecond);
          }
        }

        const models = Array.from(modelStats.entries()).map(
          ([model, stats]) => ({
            model,
            label: stats.label,
            avgDuration: Math.round(
              stats.durations.reduce((a, b) => a + b, 0) /
                stats.durations.length
            ),
            avgTps:
              stats.tps.length > 0
                ? stats.tps.reduce((a, b) => a + b, 0) / stats.tps.length
                : null,
          })
        );

        return {
          id: run.id,
          startedAt: run.startedAt,
          endedAt: run.endedAt,
          status: run.status,
          models,
        };
      });

      return { runs: runsWithStats, total, page, pageSize };
    }),

  // 查询单次运行的所有结果
  getRun: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const run = await prisma.benchmarkRun.findUnique({
        where: { id: input.id },
        include: {
          results: {
            orderBy: [{ model: "asc" }, { createdAt: "asc" }],
          },
        },
      });
      return run;
    }),

  // 趋势数据（用于图表）
  getModelTrends: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        status: "completed",
      };

      if (input.startDate || input.endDate) {
        where.startedAt = {};
        if (input.startDate) {
          (where.startedAt as Record<string, unknown>).gte = new Date(
            input.startDate
          );
        }
        if (input.endDate) {
          (where.startedAt as Record<string, unknown>).lte = new Date(
            input.endDate
          );
        }
      }

      const runs = await prisma.benchmarkRun.findMany({
        where,
        orderBy: { startedAt: "asc" },
        include: {
          results: {
            where: { error: null },
            select: {
              model: true,
              label: true,
              duration: true,
              tokensPerSecond: true,
            },
          },
        },
      });

      // 按 run 和 model 聚合
      return runs.map((run) => {
        const modelStats = new Map<
          string,
          { label: string; durations: number[]; tps: number[] }
        >();

        for (const r of run.results) {
          if (!modelStats.has(r.model)) {
            modelStats.set(r.model, {
              label: r.label,
              durations: [],
              tps: [],
            });
          }
          const stats = modelStats.get(r.model)!;
          stats.durations.push(r.duration);
          if (r.tokensPerSecond != null) {
            stats.tps.push(r.tokensPerSecond);
          }
        }

        const models = Array.from(modelStats.entries()).map(
          ([model, stats]) => ({
            model,
            label: stats.label,
            avgDuration: Math.round(
              stats.durations.reduce((a, b) => a + b, 0) /
                stats.durations.length
            ),
            avgTps:
              stats.tps.length > 0
                ? stats.tps.reduce((a, b) => a + b, 0) / stats.tps.length
                : null,
          })
        );

        return {
          runId: run.id,
          time: run.startedAt,
          models,
        };
      });
    }),

  // 最新一次运行的对比数据
  getLatestComparison: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        status: "completed",
      };

      if (input.startDate || input.endDate) {
        where.startedAt = {};
        if (input.startDate) {
          (where.startedAt as Record<string, unknown>).gte = new Date(
            input.startDate
          );
        }
        if (input.endDate) {
          (where.startedAt as Record<string, unknown>).lte = new Date(
            input.endDate
          );
        }
      }

      const latestRun = await prisma.benchmarkRun.findFirst({
        where,
        orderBy: { startedAt: "desc" },
        include: {
          results: {
            where: { error: null },
          },
        },
      });

      if (!latestRun) return null;

    const modelStats = new Map<
      string,
      {
        label: string;
        durations: number[];
        tps: number[];
        tokens: number[];
      }
    >();

    for (const r of latestRun.results) {
      if (!modelStats.has(r.model)) {
        modelStats.set(r.model, {
          label: r.label,
          durations: [],
          tps: [],
          tokens: [],
        });
      }
      const stats = modelStats.get(r.model)!;
      stats.durations.push(r.duration);
      if (r.tokensPerSecond != null) stats.tps.push(r.tokensPerSecond);
      stats.tokens.push(r.outputTokens);
    }

    // 以 M2.5 为基准计算速度对比
    const baseStats = modelStats.get("MiniMax-M2.5");
    const baseTps =
      baseStats && baseStats.tps.length > 0
        ? baseStats.tps.reduce((a, b) => a + b, 0) / baseStats.tps.length
        : null;

    const models = Array.from(modelStats.entries()).map(([model, stats]) => {
      const avgTps =
        stats.tps.length > 0
          ? stats.tps.reduce((a, b) => a + b, 0) / stats.tps.length
          : null;
      const speedup =
        avgTps != null && baseTps != null
          ? ((avgTps - baseTps) / baseTps) * 100
          : null;

      return {
        model,
        label: stats.label,
        avgDuration: Math.round(
          stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
        ),
        avgTps,
        avgTokens: Math.round(
          stats.tokens.reduce((a, b) => a + b, 0) / stats.tokens.length
        ),
        testCount: stats.durations.length,
        speedup,
      };
    });

    return {
      runId: latestRun.id,
      startedAt: latestRun.startedAt,
      models,
    };
  }),

  // 手动触发一次测试（需要登录）
  triggerRun: protectedProcedure.mutation(async () => {
    const runId = await runBenchmark();
    return { runId };
  }),

  // 删除运行记录（需要登录，级联删除关联的 results）
  deleteRun: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // 先删除关联的结果记录，再删除运行记录
      await prisma.benchmarkResult.deleteMany({
        where: { runId: input.id },
      });
      await prisma.benchmarkRun.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
