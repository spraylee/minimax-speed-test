import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-dayjs-4";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
);

/**
 * 根据当前主题更新 Chart.js 全局默认颜色。
 * 仅需设置 color（文本/图例）和 borderColor（网格线）两个变量即可完成明暗模式切换。
 */
export function applyChartTheme(isDark: boolean) {
  ChartJS.defaults.color = isDark ? "#9ca3af" : "#6b7280";
  ChartJS.defaults.borderColor = isDark ? "#374151" : "#e5e7eb";
}
