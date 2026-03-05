# Dashboard 改进设计文档

## 1. 项目概述

本项目是 MiniMax 模型速度对比测试系统。本次改进旨在提升数据展示能力和用户体验，主要包括：时间范围筛选、响应式布局优化、暗色模式支持。

## 2. 设计方案

### 2.1 时间范围筛选

#### 功能需求
- 在 Dashboard 图表上方添加时间范围筛选器
- 支持预设选项：近 7 天、近 30 天、全部
- 支持自定义日期范围选择
- 筛选条件通过 URL 参数持久化（便于分享）

#### 后端 API 修改
在 `getModelTrends` 和 `getLatestComparison` 两个路由中添加可选的时间参数：

```typescript
// apps/server/src/trpc/routers/benchmark.ts
input: z.object({
  startDate: z.string().optional(),  // ISO 日期字符串
  endDate: z.string().optional(),
})
```

#### 前端组件
- 新增 `TimeRangeSelector` 组件
- 使用 shadcn 的 DropdownMenu 或 Popover 实现日期选择
- 通过 tRPC 将筛选参数传给后端

### 2.2 响应式布局

#### 设计原则
- 移动优先（Mobile First）
- 利用 TailwindCSS 4 的响应式断点

#### 断点定义
| 断点 | 宽度 | 适用场景 |
|------|------|----------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板 |
| lg | 1024px | 小笔记本 |
| xl | 1280px | 桌面 |

#### 优化要点
1. **Dashboard 布局**
   - 桌面端：统计卡片 4 列，图表 2 列
   - 平板：统计卡片 2 列，图表 1 列
   - 手机：统计卡片 1 列，图表 1 列

2. **History 页面**
   - 表格在移动端改为卡片式展示
   - 分页控件在底部固定

3. **Navigation**
   - 桌面端：顶部导航栏
   - 移动端：汉堡菜单 + 底部导航

### 2.3 暗色模式

#### 技术方案
使用 `next-themes` 库管理主题，提供：
- 亮色模式（默认）
- 暗色模式
- 跟随系统（自动检测 OS 偏好）

#### 实现细节
1. 安装依赖：`pnpm add next-themes`
2. 创建 ThemeProvider 组件包裹应用
3. 添加主题切换按钮（在 Layout 导航栏）
4. 主题偏好存储在 localStorage

#### 样式适配
- 使用 TailwindCSS 的 `dark:` 前缀
- 覆盖 shadcn/ui 组件的暗色样式
- 图表（Recharts）暗色主题适配

## 3. 架构设计

### 组件结构
```
apps/web/src/
├── components/
│   ├── TimeRangeSelector.tsx    # 新增
│   ├── ThemeToggle.tsx          # 新增
│   ├── Layout.tsx               # 修改：添加主题切换、移动端导航
│   ├── SpeedChart.tsx           # 修改：响应式 + 暗色
│   ├── LatencyChart.tsx         # 修改：响应式 + 暗色
│   └── ComparisonTable.tsx      # 修改：响应式 + 暗色
├── pages/
│   ├── Dashboard.tsx            # 修改：集成时间筛选
│   └── History.tsx              # 修改：响应式表格
└── App.tsx                      # 修改：添加 ThemeProvider
```

### 数据流
1. 用户选择时间范围 → 更新 URL 参数
2. 组件触发 tRPC 查询 → 带上时间参数
3. 后端过滤数据 → 返回筛选结果
4. 前端更新图表

## 4. 验收标准

### 时间范围筛选
- [ ] 默认显示近 7 天数据
- [ ] 可选择预设时间范围（7天、30天、全部）
- [ ] 可选择自定义日期范围
- [ ] 筛选后图表数据正确更新
- [ ] URL 参数同步更新

### 响应式布局
- [ ] 桌面端（>1024px）：4列统计卡片 + 2列图表
- [ ] 平板端（768px-1024px）：2列统计卡片 + 1列图表
- [ ] 手机端（<768px）：1列统计卡片 + 1列图表
- [ ] History 表格在移动端转为卡片式布局
- [ ] 导航菜单在移动端正常切换

### 暗色模式
- [ ] 默认跟随系统主题
- [ ] 亮色/暗色模式可手动切换
- [ ] 切换后偏好被记住，刷新后保持
- [ ] 所有 UI 组件（按钮、卡片、表格）在两种模式下正常显示
- [ ] 图表在两种模式下都可读

## 5. 依赖清单

```json
{
  "next-themes": "^0.4.0"
}
```

如需自定义日期选择器，可考虑添加：
```json
{
  "react-day-picker": "^9.0.0"
}
```
