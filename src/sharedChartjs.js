import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

// Register components only once
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  LineController,
  LineElement,
  PointElement,
  Filler
);

export default Chart;
