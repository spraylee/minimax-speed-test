import { useState, Fragment } from "react";
import { useTRPC } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RunDetail } from "@/components/RunDetail";
import { isLoggedIn } from "@/lib/auth";
import dayjs from "dayjs";

export function History() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null);
  const pageSize = 20;

  const runsQuery = useQuery(
    trpc.benchmark.listRuns.queryOptions({ page, pageSize })
  );

  const deleteRunMutation = useMutation(
    trpc.benchmark.deleteRun.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.listRuns.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.getModelTrends.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.benchmark.getLatestComparison.queryKey() });
      },
    })
  );

  const data = runsQuery.data;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">运行历史</h2>
        <p className="text-muted-foreground">
          查看所有基准测试运行记录
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            运行记录 {data ? `(共 ${data.total} 次)` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runsQuery.isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : !data || data.runs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂无运行记录
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>状态</TableHead>
                    {["极速版", "标准版", "M2.1"].map((label) => (
                      <TableHead key={label} className="text-right">
                        {label} (tok/s)
                      </TableHead>
                    ))}
                    {isLoggedIn() && (
                      <TableHead className="w-24 text-right">操作</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.runs.map((run) => (
                    <Fragment key={run.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedRunId(
                            expandedRunId === run.id ? null : run.id
                          )
                        }
                      >
                        <TableCell className="font-mono">{run.id}</TableCell>
                        <TableCell>
                          {dayjs(run.startedAt).format("YYYY-MM-DD HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={run.status} />
                        </TableCell>
                        {["极速版", "标准版", "M2.1"].map((label) => {
                          const model = run.models.find(
                            (m) => m.label === label
                          );
                          return (
                            <TableCell key={label} className="text-right">
                              {model?.avgTps != null
                                ? model.avgTps.toFixed(1)
                                : "-"}
                            </TableCell>
                          );
                        })}
                        {isLoggedIn() && (
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={deleteRunMutation.isPending}
                                >
                                  删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除运行记录 #{run.id}（{dayjs(run.startedAt).format("YYYY-MM-DD HH:mm:ss")}）吗？该操作将同时删除所有关联的测试结果，且不可恢复。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteRunMutation.mutate({ id: run.id })}
                                  >
                                    确认删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                      {expandedRunId === run.id && (
                        <TableRow>
                          <TableCell colSpan={isLoggedIn() ? 8 : 7} className="p-0">
                            <RunDetail runId={run.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          完成
        </Badge>
      );
    case "running":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          运行中
        </Badge>
      );
    case "failed":
      return <Badge variant="destructive">失败</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
