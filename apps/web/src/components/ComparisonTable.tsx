import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ModelComparison {
  model: string;
  label: string;
  avgDuration: number;
  avgTps: number | null;
  avgTokens: number;
  testCount: number;
  speedup: number | null;
}

interface Props {
  models: ModelComparison[];
  startedAt: string | Date;
}

export function ComparisonTable({ models, startedAt }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>模型</TableHead>
          <TableHead className="text-right">平均响应时间</TableHead>
          <TableHead className="text-right">生成速度</TableHead>
          <TableHead className="text-right">平均 Tokens</TableHead>
          <TableHead className="text-right">测试次数</TableHead>
          <TableHead className="text-right">相对 M2.5</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((m) => (
          <TableRow key={m.model}>
            <TableCell className="font-medium">
              {m.model}
              <span className="ml-2 text-muted-foreground">({m.label})</span>
            </TableCell>
            <TableCell className="text-right">{m.avgDuration}ms</TableCell>
            <TableCell className="text-right">
              {m.avgTps != null ? `${m.avgTps.toFixed(1)} tok/s` : "-"}
            </TableCell>
            <TableCell className="text-right">{m.avgTokens}</TableCell>
            <TableCell className="text-right">{m.testCount}</TableCell>
            <TableCell className="text-right">
              {m.speedup != null ? (
                <Badge
                  variant={m.speedup > 0 ? "default" : "secondary"}
                  className={
                    m.speedup > 0
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : ""
                  }
                >
                  {m.speedup > 0 ? "+" : ""}
                  {m.speedup.toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline">基准</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
