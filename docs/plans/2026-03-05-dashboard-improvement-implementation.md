# Dashboard 改进实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Dashboard 添加时间范围筛选、响应式布局优化和暗色模式支持

**Architecture:** 使用 next-themes 管理暗色模式，后端 API 添加时间参数支持，前端使用 TailwindCSS 响应式类优化布局

**Tech Stack:** next-themes, TailwindCSS 4, tRPC, Prisma

---

## 准备工作

### Task 1: 安装 next-themes 依赖

**Files:**
- Modify: `apps/web/package.json`

**Step 1: 安装依赖**

Run: `cd apps/web && pnpm add next-themes`

Expected: 依赖安装成功

**Step 2: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml
git commit -m "chore: add next-themes dependency"
```

---

## 暗色模式

### Task 2: 创建 ThemeProvider 组件

**Files:**
- Create: `apps/web/src/components/ThemeProvider.tsx`

**Step 1: 创建 ThemeProvider 组件**

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/ThemeProvider.tsx
git commit -m "feat(theme): add ThemeProvider component"
```

---

### Task 3: 修改 App.tsx 添加 ThemeProvider

**Files:**
- Modify: `apps/web/src/App.tsx`

**Step 1: 读取当前 App.tsx 内容**

**Step 2: 添加 ThemeProvider 包裹**

在 return 语句的最外层添加 ThemeProvider：

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  <RouterProvider router={router} />
</ThemeProvider>
```

**Step 3: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat(theme): integrate ThemeProvider in App"
```

---

### Task 4: 创建主题切换按钮组件

**Files:**
- Create: `apps/web/src/components/ThemeToggle.tsx`

**Step 1: 创建 ThemeToggle 组件**

```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute top-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/ThemeToggle.tsx
git commit -m "feat(theme): add ThemeToggle component"
```

---

### Task 5: 添加 shadcn/ui 组件的暗色模式样式

**Files:**
- Modify: `apps/web/src/index.css`

**Step 1: 读取当前 index.css**

**Step 2: 添加暗色模式 CSS 变量**

在 :root 后面添加：

```css
.dark {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 9%;
}
```

**Step 3: Commit**

```bash
git add apps/web/src/index.css
git commit -m "feat(theme): add dark mode CSS variables"
```

---

### Task 6: 修改 Layout 添加主题切换按钮

**Files:**
- Modify: `apps/web/src/components/Layout.tsx`

**Step 1: 读取 Layout.tsx**

**Step 2: 导入 ThemeToggle 并添加到导航栏**

在合适位置添加 ThemeToggle 组件

**Step 3: Commit**

```bash
git add apps/web/src/components/Layout.tsx
git commit -m "feat(theme): add ThemeToggle to Layout"
```

---

## 时间范围筛选

### Task 7: 修改后端 API 支持时间参数

**Files:**
- Modify: `apps/server/src/trpc/routers/benchmark.ts`

**Step 1: 读取 benchmark.ts 找到 getModelTrends 和 getLatestComparison**

**Step 2: 修改 input 添加时间参数**

在 getModelTrends 和 getLatestComparison 的 input 中添加：

```typescript
startDate: z.string().optional(),
endDate: z.string().optional(),
```

**Step 3: 修改 query 添加时间过滤**

在 Prisma 查询中添加时间过滤逻辑：

```typescript
where: {
  createdAt: {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(endDate) : undefined,
  },
}
```

**Step 4: Commit**

```bash
git add apps/server/src/trpc/routers/benchmark.ts
git commit -m "feat(api): add time range filter to benchmark queries"
```

---

### Task 8: 创建 TimeRangeSelector 组件

**Files:**
- Create: `apps/web/src/components/TimeRangeSelector.tsx`

**Step 1: 创建 TimeRangeSelector 组件**

```tsx
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type TimeRange = "7d" | "30d" | "all" | "custom"

interface TimeRangeSelectorProps {
  value: { start: Date | undefined; end: Date | undefined }
  onChange: (range: { start: Date | undefined; end: Date | undefined }) => void
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const [preset, setPreset] = React.useState<TimeRange>("7d")
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (newPreset: TimeRange) => {
    setPreset(newPreset)
    const now = new Date()
    if (newPreset === "7d") {
      onChange({ start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now })
    } else if (newPreset === "30d") {
      onChange({ start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now })
    } else if (newPreset === "all") {
      onChange({ start: undefined, end: undefined })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md">
        <Button
          variant={preset === "7d" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("7d")}
        >
          近 7 天
        </Button>
        <Button
          variant={preset === "30d" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("30d")}
        >
          近 30 天
        </Button>
        <Button
          variant={preset === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("all")}
        >
          全部
        </Button>
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[240px] justify-start text-left font-normal")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value.start ? (
              value.end ? (
                <>
                  {format(value.start, "yyyy-MM-dd")} - {format(value.end, "yyyy-MM-dd")}
                </>
              ) : (
                format(value.start, "yyyy-MM-dd")
              )
            ) : (
              "选择日期范围"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: value.start, to: value.end }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setPreset("custom")
                onChange({ start: range.from, end: range.to })
                setIsOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/TimeRangeSelector.tsx
git commit -m "feat(ui): add TimeRangeSelector component"
```

---

### Task 9: 安装 date-fns 和 shadcn Calendar 组件

**Files:**
- Modify: `apps/web/package.json`

**Step 1: 安装 date-fns**

Run: `cd apps/web && pnpm add date-fns`

**Step 2: 添加 shadcn Calendar 组件**

Run: `cd apps/web && pnpm dlx shadcn@latest add calendar -y`

**Step 3: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml apps/web/src/components/ui/calendar.tsx
git commit -m "chore: add date-fns and shadcn calendar"
```

---

### Task 10: 修改 Dashboard 集成时间筛选

**Files:**
- Modify: `apps/web/src/pages/Dashboard.tsx`

**Step 1: 读取 Dashboard.tsx**

**Step 2: 导入 TimeRangeSelector 和添加状态**

```tsx
import { TimeRangeSelector } from "@/components/TimeRangeSelector"
import { useSearchParams } from "react-router-dom"

// 在组件内添加
const [searchParams, setSearchParams] = useSearchParams()

// 解析 URL 参数或默认 7 天
const getInitialRange = () => {
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  if (start && end) {
    return { start: new Date(start), end: new Date(end) }
  }
  const now = new Date()
  return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now }
}

const [timeRange, setTimeRange] = React.useState(getInitialRange)
```

**Step 3: 修改 tRPC 调用传入时间参数**

在 getModelTrends 和 getLatestComparison 调用时添加：

```tsx
startDate: timeRange.start?.toISOString(),
endDate: timeRange.end?.toISOString(),
```

**Step 4: 当时间范围变化时更新 URL**

```tsx
const handleTimeRangeChange = (range: { start: Date | undefined; end: Date | undefined }) => {
  setTimeRange(range)
  if (range.start && range.end) {
    setSearchParams({
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    })
  } else {
    setSearchParams({})
  }
}
```

**Step 5: 在图表上方添加 TimeRangeSelector**

```tsx
<TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
```

**Step 6: Commit**

```bash
git add apps/web/src/pages/Dashboard.tsx
git commit -m "feat(dashboard): integrate time range filter"
```

---

## 响应式布局

### Task 11: 修改 Dashboard 统计卡片响应式布局

**Files:**
- Modify: `apps/web/src/pages/Dashboard.tsx`

**Step 1: 读取 Dashboard.tsx 找到统计卡片网格**

**Step 2: 修改 grid 布局**

将 `grid-cols-4` 改为响应式：

```tsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

**Step 3: Commit**

```bash
git add apps/web/src/pages/Dashboard.tsx
git commit -m "feat(responsive): make stat cards responsive"
```

---

### Task 12: 修改图表容器响应式布局

**Files:**
- Modify: `apps/web/src/pages/Dashboard.tsx`

**Step 1: 找到图表网格容器**

**Step 2: 修改响应式布局**

将图表网格从 `grid-cols-2` 改为：

```tsx
grid grid-cols-1 lg:grid-cols-2
```

**Step 3: Commit**

```bash
git add apps/web/src/pages/Dashboard.tsx
git commit -m "feat(responsive): make charts grid responsive"
```

---

### Task 13: 修改 History 页面表格为卡片式布局

**Files:**
- Modify: `apps/web/src/pages/History.tsx`

**Step 1: 读取 History.tsx**

**Step 2: 修改表格渲染为卡片式**

将表格行的渲染改为条件渲染：桌面端显示表格，移动端显示卡片

```tsx
{/* 桌面端表格 */}
<div className="hidden md:block overflow-x-auto">
  <Table>...</Table>
</div>

{/* 移动端卡片 */}
<div className="md:hidden space-y-4">
  {runs?.map((run) => (
    <Card key={run.id}>
      <CardHeader>
        <CardTitle>Run #{run.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <Badge>{run.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">开始时间</span>
            <span>{format(new Date(run.startedAt), "yyyy-MM-dd HH:mm")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Step 3: Commit**

```bash
git add apps/web/src/pages/History.tsx
git commit -m "feat(responsive): make History table responsive"
```

---

### Task 14: 修改 Navigation 移动端适配

**Files:**
- Modify: `apps/web/src/components/Layout.tsx`

**Step 1: 读取 Layout.tsx**

**Step 2: 添加移动端导航**

- 桌面端：显示完整导航栏
- 移动端：显示汉堡菜单，点击展开

```tsx
{/* 移动端汉堡菜单按钮 */}
<button
  className="md:hidden p-2"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
  <MenuIcon />
</button>

{/* 移动端下拉菜单 */}
{mobileMenuOpen && (
  <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b p-4">
    <nav className="flex flex-col space-y-2">
      <Link to="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
      <Link to="/history" onClick={() => setMobileMenuOpen(false)}>历史记录</Link>
    </nav>
  </div>
)}
```

**Step 3: Commit**

```bash
git add apps/web/src/components/Layout.tsx
git commit -m "feat(responsive): add mobile navigation"
```

---

## 图表暗色模式适配

### Task 15: 修改 SpeedChart 支持暗色模式

**Files:**
- Modify: `apps/web/src/components/SpeedChart.tsx`

**Step 1: 读取 SpeedChart.tsx**

**Step 2: 添加 useTheme 获取当前主题**

```tsx
import { useTheme } from "next-themes"

const { theme } = useTheme()
const isDark = theme === "dark"
```

**Step 3: 配置 Recharts 颜色**

```tsx
<ResponsiveContainer>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
    <XAxis
      dataKey="date"
      stroke={isDark ? "#9ca3af" : "#6b7280"}
      tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
    />
    <YAxis
      stroke={isDark ? "#9ca3af" : "#6b7280"}
      tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        color: isDark ? "#f9fafb" : "#111827"
      }}
    />
    <Legend />
    <Line type="monotone" dataKey="M2.1" stroke="#8884d8" />
    <Line type="monotone" dataKey="M2.5" stroke="#82ca9d" />
    <Line type="monotone" dataKey="M2.5-highspeed" stroke="#ffc658" />
  </LineChart>
</ResponsiveContainer>
```

**Step 4: Commit**

```bash
git add apps/web/src/components/SpeedChart.tsx
git commit -m "feat(theme): add dark mode support to SpeedChart"
```

---

### Task 16: 修改 LatencyChart 支持暗色模式

**Files:**
- Modify: `apps/web/src/components/LatencyChart.tsx`

**Step 1: 读取 LatencyChart.tsx**

**Step 2: 应用与 SpeedChart 相同的暗色模式修改**

**Step 3: Commit**

```bash
git add apps/web/src/components/LatencyChart.tsx
git commit -m "feat(theme): add dark mode support to LatencyChart"
```

---

### Task 17: 修改 ComparisonTable 支持暗色模式

**Files:**
- Modify: `apps/web/src/components/ComparisonTable.tsx`

**Step 1: 读取 ComparisonTable.tsx**

**Step 2: 检查表格样式，添加暗色模式支持**

表格的暗色模式主要由 shadcn/ui Table 组件处理，确保使用了正确的 class

**Step 3: Commit**

```bash
git add apps/web/src/components/ComparisonTable.tsx
git commit -m "feat(theme): add dark mode support to ComparisonTable"
```

---

## 最终验证

### Task 18: 测试完整功能

**Step 1: 启动开发服务器**

Run: `pnpm dev:all`

**Step 2: 验证时间筛选**
- 打开 Dashboard
- 选择不同的时间范围
- 确认图表数据正确更新
- 确认 URL 参数同步

**Step 3: 验证响应式**
- 用浏览器开发者工具切换到移动端视图
- 确认布局正确显示

**Step 4: 验证暗色模式**
- 点击主题切换按钮
- 确认主题正确切换
- 刷新页面，确认主题偏好被记住

**Step 5: Commit**

```bash
git add .
git commit -m "feat: complete dashboard improvement - time filter, responsive, dark mode"
```
