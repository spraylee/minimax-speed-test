import cron from "node-cron";
import { runBenchmark } from "./services/benchmark.js";

let isRunning = false;

export function startScheduler() {
  // 每小时整点执行
  cron.schedule("0 * * * *", async () => {
    if (isRunning) {
      console.log("[Scheduler] 上一次任务还在运行中，跳过");
      return;
    }

    isRunning = true;
    console.log("[Scheduler] 开始定时测试...");

    try {
      const runId = await runBenchmark();
      console.log(`[Scheduler] 完成运行 #${runId}`);
    } catch (err) {
      console.error("[Scheduler] 运行失败:", err);
    } finally {
      isRunning = false;
    }
  });

  console.log("[Scheduler] 定时任务已启动（每小时整点执行）");
}
