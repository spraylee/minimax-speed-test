import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// ==================== 配置 ====================
const API_KEY = process.env.MINIMAX_API_KEY;
if (!API_KEY) {
  console.error("请在 .env 文件中设置 MINIMAX_API_KEY");
  console.error("复制 .env.example 为 .env 并填入你的 API Key");
  process.exit(1);
}

// Base URL
const BASE_URL = "https://api.minimaxi.com/anthropic";

// 模型配置 - 按速度从快到慢排序
const MODELS = [
  { name: "MiniMax-M2.5-highspeed", label: "极速版" },
  { name: "MiniMax-M2.5", label: "标准版" },
  { name: "MiniMax-M2.1", label: "M2.1" },
];

// 测试配置
const TEST_PROMPTS = [
  "用 Python 写一个快速排序算法",
  "解释一下什么是闭包",
  "用 JavaScript 实现一个防抖函数",
  "什么是 HTTP 缓存？",
  "写一个二分查找的代码",
];

// 每个模型测试次数
const TEST_COUNT = 3;
// ==================== 配置结束 ====================

// 创建各个模型的客户端
const clients = MODELS.map(
  (m) =>
    new Anthropic({
      apiKey: API_KEY,
      baseURL: BASE_URL,
      defaultHeaders: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
);

interface TestResult {
  model: string;
  label: string;
  prompt: string;
  duration: number; // 毫秒
  tokensPerSecond?: number;
}

async function testModel(
  client: Anthropic,
  modelName: string,
  modelLabel: string,
  prompt: string
): Promise<TestResult> {
  const startTime = Date.now();

  const response = await client.messages.create({
    model: modelName,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const duration = Date.now() - startTime;
  const outputTokens = response.usage?.output_tokens || 0;
  const tokensPerSecond =
    outputTokens > 0 ? (outputTokens / duration) * 1000 : undefined;

  return {
    model: modelName,
    label: modelLabel,
    prompt,
    duration,
    tokensPerSecond,
  };
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("MiniMax M2.1 / M2.5 / M2.5-highspeed 速度对比测试");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`测试次数: ${TEST_COUNT} 次/模型`);
  console.log("=".repeat(60));
  console.log();

  const results: TestResult[] = [];

  // 测试每个模型
  for (let m = 0; m < MODELS.length; m++) {
    const model = MODELS[m];
    const client = clients[m];

    console.log(`🔄 测试模型: ${model.name} (${model.label})`);
    console.log("-".repeat(40));

    for (let i = 0; i < TEST_COUNT; i++) {
      for (const prompt of TEST_PROMPTS) {
        try {
          const result = await testModel(
            client,
            model.name,
            model.label,
            prompt
          );
          results.push(result);
          const tps = result.tokensPerSecond
            ? `(${result.tokensPerSecond.toFixed(1)} tok/s)`
            : "";
          console.log(
            `  ✅ ${result.duration}ms ${tps} - ${prompt.slice(0, 20)}...`
          );
        } catch (error) {
          console.log(
            `  ❌ 错误: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }
    console.log();
  }

  // 统计结果
  console.log("=".repeat(60));
  console.log("📊 测试结果统计");
  console.log("=".repeat(60));

  for (const model of MODELS) {
    const modelResults = results.filter((r) => r.model === model.name);
    const avgDuration =
      modelResults.reduce((a, b) => a + b.duration, 0) / modelResults.length;
    const validTpsResults = modelResults.filter((r) => r.tokensPerSecond);
    const avgTps =
      validTpsResults.reduce((a, b) => a + (b.tokensPerSecond || 0), 0) /
      validTpsResults.length;

    console.log();
    console.log(`📈 ${model.name} (${model.label}):`);
    console.log(`   平均响应时间: ${avgDuration.toFixed(0)}ms`);
    console.log(`   平均生成速度: ${avgTps.toFixed(1)} tokens/s`);
    console.log(`   总测试次数: ${modelResults.length}`);
  }

  // 对比结论
  console.log();
  console.log("=".repeat(60));
  console.log("🏆 对比结论:");
  console.log("=".repeat(60));

  const baseModel = MODELS[MODELS.length - 1]; // M2.1 作为基准
  const baseResults = results.filter((r) => r.model === baseModel.name);
  const baseAvgDuration =
    baseResults.reduce((a, b) => a + b.duration, 0) / baseResults.length;

  for (let i = 0; i < MODELS.length - 1; i++) {
    const model = MODELS[i];
    const modelResults = results.filter((r) => r.model === model.name);
    const avgDuration =
      modelResults.reduce((a, b) => a + b.duration, 0) / modelResults.length;

    const speedup = ((baseAvgDuration - avgDuration) / baseAvgDuration * 100).toFixed(1);
    console.log(`   ${model.name} 比 ${baseModel.name} 快 ${speedup}%`);
  }

  console.log("=".repeat(60));
}

runTests().catch(console.error);
