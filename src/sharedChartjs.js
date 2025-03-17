import ChartDataLabels from "chartjs-plugin-datalabels";
import "chartjs-adapter-date-fns";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  Filler,
  TimeScale,
} from "chart.js";

// Register components only once
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  LineController,
  LineElement,
  PointElement,
  Filler
);

export default Chart;
