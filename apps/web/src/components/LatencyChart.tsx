import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

interface TrendPoint {
  runId: number;
  time: string | Date;
  models: {
    model: string;
    label: string;
    avgDuration: number;
    avgTps: number | null;
  }[];
}

const MODEL_COLORS: Record<string, string> = {
  "MiniMax-M2.5-highspeed": "#22c55e",
  "MiniMax-M2.5": "#3b82f6",
  "MiniMax-M2.1": "#f59e0b",
};

export function LatencyChart({ data }: { data: TrendPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        暂无趋势数据
      </div>
    );
  }

  const { chartData, models, labelMap } = useMemo(() => {
    const modelSet = new Set<string>();
    const labelMap: Record<string, string> = {};

    for (const point of data) {
      for (const m of point.models) {
        modelSet.add(m.model);
        if (!labelMap[m.model]) labelMap[m.model] = m.label;
      }
    }

    const chartData = data.map((d) => {
      const row: Record<string, number | null> = {
        time: dayjs(d.time).valueOf(),
      };
      for (const m of d.models) {
        row[m.model] = m.avgDuration;
      }
      return row;
    });

    return { chartData, models: Array.from(modelSet), labelMap };
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke={isDark ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v: number) => dayjs(v).format("MM-DD HH:mm")}
          fontSize={11}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
        />
        <YAxis
          fontSize={11}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
          label={{ value: "ms", position: "insideTopLeft", offset: -4, fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
        />
        <Tooltip
          labelFormatter={(v: ReactNode) => dayjs(Number(v)).format("MM-DD HH:mm")}
          formatter={(value: number | undefined) => [`${value ?? '-'} ms`]}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#f9fafb" : "#111827"
          }}
        />
        <Legend />
        {models.map((model) => (
          <Line
            key={model}
            type="monotone"
            dataKey={model}
            name={labelMap[model] || model}
            stroke={MODEL_COLORS[model]}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
