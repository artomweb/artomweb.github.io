import {
  formatDate,
  timeago,
  formatSeconds,
  hexToRgba,
} from "./usefullFunc.js";
import Chart from "./sharedChartjs.js";
import { red1, red2, red3 } from "./colours.js";

export default function parse5k(data) {
  if (!data || data?.error) {
    console.log("Error processing fallback CSV data:");
    document.getElementById("5kCard").classList.add("hidden");
  } else {
    try {
      show5Kdata(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Climbing data", error);
      document.getElementById("5kCard").classList.add("hidden");
    }
  }
}

function show5Kdata(data) {
  const formattedDate = formatDate(data.lastRun);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(data.lastRun)})`;
  document.getElementById("5kCount").innerHTML = data.numberOfRuns;

  document.getElementById("5kFastest").innerHTML = formatSeconds(
    data.fastestRun
  );
  document.getElementById("5kAvgSplit").innerHTML = formatSeconds(
    data.averageSplit
  );
  document.getElementById("5kFastestSplit").innerHTML = formatSeconds(
    data.fastestSplit
  );

  document.getElementById("last5k").innerHTML = dateOfLastTestMessage;

  draw5kChart(data);
}

function draw5kChart(dataIn) {
  const ctx = document.getElementById("5kChart").getContext("2d");

  function formatPUDate(value) {
    const date = new Date(value);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dataIn.graphData.labels,
      datasets: [
        {
          data: dataIn.graphData.data,
          backgroundColor: red2,
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: false,
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              //   return context.parsed.y;
              return formatSeconds(context.parsed.y);
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatSeconds(value);
            },
            color: red1,
          },
          grid: {
            color: red3, // Grid line color for X-axis
          },
        },
        x: {
          type: "time",
          time: {
            unit: "month",
            displayFormats: {
              month: "MMM yyyy",
            },
            tooltipFormat: "dd/MM/yyyy",
          },
          ticks: {
            maxTicksLimit: 5,
            color: red1,
          },
          grid: {
            color: red3, // Grid line color for X-axis
          },
        },
      },
    },
  });
}
