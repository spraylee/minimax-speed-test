# MiniMax 模型速度对比测试

本项目用于测试 MiniMax 各版本模型（M2.1、M2.5、M2.5-highspeed）的性能差异。

## 测试配置

- **Base URL**: https://api.minimaxi.com/anthropic
- **模型**: MiniMax-M2.1、MiniMax-M2.5、MiniMax-M2.5-highspeed
- **测试次数**: 3 轮，每轮 5 个不同 prompt
- **测试日期**: 2026-03-02

## 测试结果

| 模型 | 平均响应时间 | 平均生成速度 | 相对 M2.1 提速 |
|------|-------------|-------------|---------------|
| MiniMax-M2.5-highspeed (极速版) | 7701ms | 68.9 tokens/s | **53.2%** |
| MiniMax-M2.5 (标准版) | 16368ms | 34.2 tokens/s | 0.5% |
| MiniMax-M2.1 | 16445ms | 35.7 tokens/s | 基准 |

## 结论

- **极速版（M2.5-highspeed）最快**，比 M2.1 快约 **53%**，生成速度达 68.9 tokens/s
- **M2.5 标准版与 M2.1 速度相近**
- 如果追求速度，**极速版是最佳选择**

## 运行测试

```bash
# 安装依赖
pnpm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，填入你的 API Key
# MINIMAX_API_KEY=你的APIKey

# 运行测试
pnpm test
```

## 配置修改

如需修改测试配置，请编辑 `src/index.ts` 中的以下常量：

- `MODELS`: 测试的模型列表
- `TEST_PROMPTS`: 测试用的 prompt 列表
- `TEST_COUNT`: 每个模型的测试轮数
