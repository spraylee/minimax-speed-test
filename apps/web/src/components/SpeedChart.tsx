import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
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

export function SpeedChart({ data }: { data: TrendPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { chartData, options } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: null, options: null };

    const modelSet = new Set<string>();
    const labelMap: Record<string, string> = {};

    for (const point of data) {
      for (const m of point.models) {
        modelSet.add(m.model);
        if (!labelMap[m.model]) labelMap[m.model] = m.label;
      }
    }

    const models = Array.from(modelSet);
    const timestamps = data.map((d) => dayjs(d.time).valueOf());

    const datasets = models.map((model) => ({
      label: labelMap[model] || model,
      data: data.map((d) => {
        const found = d.models.find((m) => m.model === model);
        return found?.avgTps != null ? Number(found.avgTps.toFixed(1)) : null;
      }),
      borderColor: MODEL_COLORS[model] ?? "#888",
      backgroundColor: MODEL_COLORS[model] ?? "#888",
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.3,
      spanGaps: true,
    }));

    const chartData = {
      labels: timestamps,
      datasets,
    };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            tooltipFormat: "MM-DD HH:mm",
            displayFormats: { hour: "MM-DD HH:mm", day: "MM-DD" },
          },
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          title: { display: true, text: "tokens/s", font: { size: 11 } },
          ticks: { font: { size: 11 } },
          grid: { drawTicks: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y ?? "-"} tok/s`,
          },
        },
        legend: {
          labels: {
            font: { size: 12 },
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
      },
    };

    return { chartData, options };
  }, [data, isDark]);

  if (!chartData || !options) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        暂无趋势数据
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
