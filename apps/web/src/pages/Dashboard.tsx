import { useTRPC } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeedChart } from "@/components/SpeedChart";
import { LatencyChart } from "@/components/LatencyChart";
import { ComparisonTable } from "@/components/ComparisonTable";
import { isLoggedIn } from "@/lib/auth";
import dayjs from "dayjs";

export function Dashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const trendsQuery = useQuery(trpc.benchmark.getModelTrends.queryOptions({}));
  const comparisonQuery = useQuery(
    trpc.benchmark.getLatestComparison.queryOptions()
  );
  const runsQuery = useQuery(
    trpc.benchmark.listRuns.queryOptions({ page: 1, pageSize: 1 })
  );

  const triggerMutation = useMutation(
    trpc.benchmark.triggerRun.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.listRuns.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.getModelTrends.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.getLatestComparison.queryKey() });
      },
    })
  );

  const totalRuns = runsQuery.data?.total ?? 0;
  const latestTime = comparisonQuery.data?.startedAt;

  return (
    <div className="space-y-6">
      {/* 顶部统计 + 操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            MiniMax 模型速度对比监控
          </p>
        </div>
        {isLoggedIn() && (
          <Button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? "运行中..." : "手动触发测试"}
          </Button>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总运行次数</CardDescription>
            <CardTitle className="text-3xl">{totalRuns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>最近测试时间</CardDescription>
            <CardTitle className="text-lg">
              {latestTime ? dayjs(latestTime).format("YYYY-MM-DD HH:mm") : "-"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>监控模型数</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 趋势图表 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>生成速度趋势</CardTitle>
            <CardDescription>tokens/s 随时间变化</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsQuery.isLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                加载中...
              </div>
            ) : (
              <SpeedChart data={trendsQuery.data ?? []} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>响应时间趋势</CardTitle>
            <CardDescription>平均响应时间随时间变化</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsQuery.isLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                加载中...
              </div>
            ) : (
              <LatencyChart data={trendsQuery.data ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最新对比表格 */}
      {comparisonQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle>最新一次对比</CardTitle>
            <CardDescription>
              运行 #{comparisonQuery.data.runId} -{" "}
              {dayjs(comparisonQuery.data.startedAt).format(
                "YYYY-MM-DD HH:mm:ss"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonTable
              models={comparisonQuery.data.models}
              startedAt={comparisonQuery.data.startedAt}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
