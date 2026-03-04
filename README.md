# MiniMax 模型速度对比测试

自动化监控 MiniMax 各版本模型（M2.1、M2.5、M2.5-highspeed）的性能差异，每小时定时测试，结果存入数据库，通过 Web 界面查看趋势。

## 技术栈

- **后端**: Hono + tRPC + Prisma 7 (MySQL) + node-cron
- **前端**: Vite + React + TailwindCSS + shadcn/ui + ECharts
- **部署**: Docker + GitHub Actions

## 项目结构

```
apps/
├── server/     # 后端服务（API + 定时任务 + 数据库）
└── web/        # 前端界面（Dashboard + History）
```

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 MINIMAX_API_KEY 和 DATABASE_URL

# 生成 Prisma 客户端 & 同步数据库
cd apps/server
pnpm prisma generate
pnpm prisma db push

# 启动开发服务（前后端同时）
cd ../..
pnpm dev:all
```

- 后端运行在 `http://localhost:3000`
- 前端运行在 `http://localhost:5173`（自动代理 `/api` 到后端）

## 测试配置

- **模型**: MiniMax-M2.1、MiniMax-M2.5、MiniMax-M2.5-highspeed
- **限制生成 token**: 256
- **测试次数**: 3 轮/模型，每轮 5 个不同 prompt
- **定时任务**: 每小时整点自动执行

## 部署

项目通过 GitHub Actions 自动部署到腾讯云服务器：

- 前端：Vite 构建后上传静态文件到 `/data/apps/minimax-speed-test/web/`
- 后端：源码推送到服务器，服务器上 Docker 构建并运行
- Nginx：反向代理 + SSL

首次部署需在服务器创建环境变量文件：
```bash
# 在服务器上
vim /data/apps/minimax-speed-test/.env
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `MINIMAX_API_KEY` | MiniMax API Key |
| `DATABASE_URL` | MySQL 连接字符串 |
| `PORT` | 服务端口（默认 3000） |
