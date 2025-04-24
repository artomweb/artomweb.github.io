import { formatDate, timeago, hexToRgba } from "./usefullFunc.js";
import Chart from "./sharedChartjs.js";
import { solarColors } from "./colours.js"; // The yellow to red color gradient

export default function parseSolar(data) {
  if (!data || data?.error) {
    console.log("Error processing solar data");
    document.getElementById("solarCard").classList.add("hidden");
  } else {
    try {
      showSolarData(data);
    } catch (error) {
      console.log("Error processing solar chart data", error);
      document.getElementById("solarCard").classList.add("hidden");
    }
  }
}

function showSolarData(data) {
  //   const formattedDate = formatDate(data.lastReading);
  //   const dateOfLastReading = `${formattedDate} (${timeago(data.lastReading)})`;
  const batteryMinV = 22.4; // 22.4V
  const batteryMaxV = 28.35; // 28.35V
  const batteryV = data.V / 1000;

  const batteryPercentage =
    ((batteryV - batteryMinV) / (batteryMaxV - batteryMinV)) * 100;

  document.getElementById("solarV").innerHTML =
    batteryPercentage.toFixed(2) + " %";
  document.getElementById("solarI").innerHTML = data.I + " mA";
  document.getElementById("solarCPU").innerHTML = data.cpu + " %";

  if (data.I > 0) {
    document.getElementById("solarState").innerHTML =
      "Charging at " +
      Math.abs(((data.VPV / 1000) * (data.I / 1000)).toFixed(2)) +
      " W";
  } else {
    document.getElementById("solarState").innerHTML =
      "Discharging at " +
      Math.abs(((data.V / 1000) * (data.I / 1000)).toFixed(2)) +
      " W";
  }
  //   document.getElementById("lastSolar").innerHTML = dateOfLastReading;

  //   drawSolarChart(data.dailyData); // Array of daily entries
}

function drawSolarChart(dailyData) {
  const ctx = document.getElementById("solarChart").getContext("2d");

  // Function to map kWh values to color based on thresholds
  function getColorForKWh(kWh) {
    if (kWh > 15) return solarColors[6]; // Dark red for high solar production
    if (kWh > 12) return solarColors[5]; // Bright red
    if (kWh > 9) return solarColors[4]; // Deep orange
    if (kWh > 6) return solarColors[3]; // Orange
    if (kWh > 3) return solarColors[2]; // Yellow-orange
    return solarColors[1]; // Light yellow for low production
  }

  // Prepare matrix data (heatmap)
  const matrixData = dailyData.map((entry, index) => ({
    x: new Date(entry.date),
    y: 0, // single-row heatmap
    v: entry.kWh,
  }));

  new Chart(ctx, {
    type: "matrix", // Ensure Chart.js Matrix plugin is included
    data: {
      datasets: [
        {
          label: "Daily Solar kWh",
          data: matrixData,
          backgroundColor: (ctx) => {
            const value = ctx.raw.v;
            return getColorForKWh(value);
          },
          borderWidth: 1,
          width: ({ chart }) => chart.chartArea.width / dailyData.length,
          height: () => 20,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => formatDate(items[0].raw.x),
            label: (ctx) => `${ctx.raw.v.toFixed(1)} kWh`,
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "dd/MM/yyyy",
            displayFormats: {
              day: "dd/MM",
            },
          },
          ticks: {
            maxTicksLimit: 10,
            color: solarColors[6], // Color for x-axis ticks
          },
          grid: {
            color: solarColors[1], // Lighter grid line color
          },
        },
        y: {
          display: false, // We don't need y-axis for a heatmap
        },
      },
    },
  });
}
