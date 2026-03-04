import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../db.js";

// ==================== 配置 ====================
const API_KEY = process.env.MINIMAX_API_KEY;
const BASE_URL = "https://api.minimaxi.com/anthropic";

export const MODELS = [
  { name: "MiniMax-M2.5-highspeed", label: "极速版" },
  { name: "MiniMax-M2.5", label: "标准版" },
  { name: "MiniMax-M2.1", label: "M2.1" },
];

export const TEST_PROMPTS = [
  "用 Python 写一个快速排序算法",
  "解释一下什么是闭包",
  "用 JavaScript 实现一个防抖函数",
  "什么是 HTTP 缓存？",
  "写一个二分查找的代码",
];

export const TEST_COUNT = 3;
export const MAX_TOKENS = 256;
// ==================== 配置结束 ====================

function createClient() {
  if (!API_KEY) {
    throw new Error("请在 .env 文件中设置 MINIMAX_API_KEY");
  }
  return new Anthropic({
    apiKey: API_KEY,
    baseURL: BASE_URL,
    defaultHeaders: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
}

async function testModel(
  client: Anthropic,
  modelName: string,
  prompt: string
): Promise<{
  duration: number;
  outputTokens: number;
  tokensPerSecond: number | null;
}> {
  const startTime = Date.now();

  const response = await client.messages.create({
    model: modelName,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const duration = Date.now() - startTime;
  const outputTokens = response.usage?.output_tokens || 0;
  const tokensPerSecond =
    outputTokens > 0 ? (outputTokens / duration) * 1000 : null;

  return { duration, outputTokens, tokensPerSecond };
}

export async function runBenchmark(): Promise<number> {
  const client = createClient();

  // 创建一次运行记录
  const run = await prisma.benchmarkRun.create({
    data: { status: "running" },
  });

  console.log(`[Benchmark] 开始运行 #${run.id}`);

  try {
    for (const model of MODELS) {
      console.log(`[Benchmark] 测试模型: ${model.name} (${model.label})`);

      for (let i = 0; i < TEST_COUNT; i++) {
        for (const prompt of TEST_PROMPTS) {
          try {
            const result = await testModel(client, model.name, prompt);

            await prisma.benchmarkResult.create({
              data: {
                runId: run.id,
                model: model.name,
                label: model.label,
                prompt,
                duration: result.duration,
                outputTokens: result.outputTokens,
                tokensPerSecond: result.tokensPerSecond,
                maxTokens: MAX_TOKENS,
              },
            });

            const tps = result.tokensPerSecond
              ? `(${result.tokensPerSecond.toFixed(1)} tok/s, ${result.outputTokens} tokens)`
              : "";
            console.log(
              `  [OK] ${result.duration}ms ${tps} - ${prompt.slice(0, 20)}...`
            );
          } catch (error) {
            const errMsg =
              error instanceof Error ? error.message : "Unknown error";
            console.log(`  [ERR] ${errMsg} - ${prompt.slice(0, 20)}...`);

            await prisma.benchmarkResult.create({
              data: {
                runId: run.id,
                model: model.name,
                label: model.label,
                prompt,
                duration: 0,
                outputTokens: 0,
                tokensPerSecond: null,
                maxTokens: MAX_TOKENS,
                error: errMsg,
              },
            });
          }
        }
      }
    }

    // 更新运行状态为完成
    await prisma.benchmarkRun.update({
      where: { id: run.id },
      data: { status: "completed", endedAt: new Date() },
    });

    console.log(`[Benchmark] 运行 #${run.id} 完成`);
    return run.id;
  } catch (error) {
    // 整体失败
    await prisma.benchmarkRun.update({
      where: { id: run.id },
      data: { status: "failed", endedAt: new Date() },
    });
    throw error;
  }
}
