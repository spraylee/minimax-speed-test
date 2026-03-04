import ReactECharts from "echarts-for-react";
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
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        暂无趋势数据
      </div>
    );
  }

  const modelSet = new Set<string>();
  for (const point of data) {
    for (const m of point.models) {
      modelSet.add(m.model);
    }
  }
  const models = Array.from(modelSet);

  const series = models.map((model) => ({
    name: data[0]?.models.find((m) => m.model === model)?.label || model,
    type: "line" as const,
    smooth: true,
    symbol: "circle",
    symbolSize: 4,
    lineStyle: { width: 2 },
    itemStyle: { color: MODEL_COLORS[model] || undefined },
    data: data.map((d) => {
      const m = d.models.find((m) => m.model === model);
      return [dayjs(d.time).valueOf(), m ? m.avgDuration : null];
    }),
  }));

  const option = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => `${value}ms`,
    },
    legend: {
      top: 0,
    },
    grid: {
      top: 36,
      left: 50,
      right: 16,
      bottom: 30,
    },
    xAxis: {
      type: "time",
      axisLabel: {
        fontSize: 11,
        formatter: (value: number) => dayjs(value).format("MM-DD HH:mm"),
      },
    },
    yAxis: {
      type: "value",
      name: "ms",
      axisLabel: { fontSize: 11 },
    },
    series,
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
