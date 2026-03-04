import { useTRPC } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RunDetail({ runId }: { runId: number }) {
  const trpc = useTRPC();
  const runQuery = useQuery(
    trpc.benchmark.getRun.queryOptions({ id: runId })
  );

  if (runQuery.isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">加载中...</div>
    );
  }

  if (!runQuery.data) {
    return (
      <div className="p-4 text-center text-muted-foreground">未找到数据</div>
    );
  }

  const results = runQuery.data.results;

  return (
    <div className="bg-muted/30 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>模型</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead className="text-right">响应时间</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">速度</TableHead>
            <TableHead>错误</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-sm">
                {r.label}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm">
                {r.prompt}
              </TableCell>
              <TableCell className="text-right text-sm">
                {r.error ? "-" : `${r.duration}ms`}
              </TableCell>
              <TableCell className="text-right text-sm">
                {r.error ? "-" : r.outputTokens}
              </TableCell>
              <TableCell className="text-right text-sm">
                {r.tokensPerSecond != null
                  ? `${r.tokensPerSecond.toFixed(1)} tok/s`
                  : "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-destructive">
                {r.error || ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
