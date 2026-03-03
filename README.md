# MiniMax 模型速度对比测试

本项目用于测试 MiniMax 各版本模型（M2.1、M2.5、M2.5-highspeed）的性能差异。

## 测试配置

- **Base URL**: https://api.minimaxi.com/anthropic
- **模型**: MiniMax-M2.1、MiniMax-M2.5、MiniMax-M2.5-highspeed
- **限制生成 token**: 256（所有模型相同）
- **测试次数**: 3 轮，每轮 5 个不同 prompt
- **测试日期**: 2026-03-02

## 测试结果

| 模型 | 平均响应时间 | 生成速度 (tokens/s) | 相对 M2.5 |
|------|-------------|-------------------|-----------|
| MiniMax-M2.5-highspeed (极速版) | 7422ms | 49.6 | **+85%** |
| MiniMax-M2.5 (标准版) | 10209ms | 26.8 | 基准 |
| MiniMax-M2.1 | 10931ms | 25.6 | -4.4% |

## 结论

- **极速版（M2.5-highspeed）最快**，生成速度达 49.6 tokens/s，比 M2.5 标准版快 **85%**（约 1.85 倍）
- **M2.5 标准版**比 M2.1 快约 **4%**，几乎持平
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
- `MAX_TOKENS`: 限制生成的 token 数量
