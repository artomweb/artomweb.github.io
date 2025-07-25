import Chart from "./sharedChartjs.js";
import { formatDate, timeago, updateToggleIndicators } from "./usefullFunc.js";
let dobbleToggleState = 0;
let dobbleData = {};
let dobbleChart;
import { blue1, blue2, blue3 } from "./colours";

function switchdobbleDots() {
  const desc = document.getElementById("dobbleDesc");

  switch (dobbleToggleState) {
    case 0:
      desc.innerHTML =
        'I made <a href="https://dobble.artomweb.com" class="text-blue-600  underline">this game</a> to see if I can get better at playing Dobble. Can you beat my score?';
      break;
    case 1:
      desc.innerHTML =
        "This graph shows my average score at each hour of the day.";
      break;
  }
  updateToggleIndicators("dobble-toggle-indicators", dobbleToggleState, blue1);
}

function dobbleToggle() {
  switchdobbleDots();
  switch (dobbleToggleState) {
    case 0:
      updatedobbleNormal();
      break;

    case 1:
      updatedobblePerHour();
      break;
  }
  dobbleToggleState == 1 ? (dobbleToggleState = 0) : dobbleToggleState++;
}

export function parseDobble(data) {
  document
    .getElementById("dobbleToggle")
    .addEventListener("click", dobbleToggle);

  if (!data || data?.error) {
    console.log("Error processing Dobble data");
    document.getElementById("dobbleCard").classList.add("hidden");
  } else {
    try {
      showDobbleData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Dobble data:", error);
      document.getElementById("dobbleCard").classList.add("hidden");
    }
  }
}

function showDobbleData(data) {
  const formattedDate = formatDate(data.lastTimestamp);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.lastTimestamp
  )})`;
  document.getElementById("dobbleScoreChangePerHour").innerHTML =
    data.scoreChangePerMin;

  document.getElementById("dobbleTime").innerHTML = data.timeMessage;

  document.getElementById("highestDobble").innerHTML = data.maxScore;
  document.getElementById("numberDobble").innerHTML = data.numTests;

  document.getElementById("timeSinceLastDobble").innerHTML =
    dateOfLastTestMessage;

  dobbleData = data;
  plotDobble();

  dobbleToggle();
}

function updatedobbleNormal() {
  const { labels, data } = dobbleData;

  dobbleChart.options.scales.x = {
    ticks: {
      autoSkip: true,
      maxTicksLimit: 5.1,
      color: blue1,
    },
    grid: {
      color: blue3, // Grid line color for X-axis
    },
  };

  dobbleChart.options.scales.y = {
    title: {
      text: "Average Score",
      display: true,
      color: blue1,
    },
    grid: {
      color: blue3, // Grid line color for X-axis
    },
    ticks: {
      color: blue1, // X-axis number color
    },
    beginAtZero: true,
  };

  dobbleChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label;
  };

  dobbleChart.data.labels = labels;
  dobbleChart.data.datasets = [
    {
      data: data,
      backgroundColor: blue2,
      borderColor: blue1,
      tension: 0.1,
      fill: true,
    },
  ];

  dobbleChart.update();
}

function updatedobblePerHour() {
  const { timOfDayLabels, timOfDayData, pointRadiusArray } = dobbleData;

  dobbleChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
      color: blue1,
    },
    grid: {
      color: blue3, // Grid line color for X-axis
    },
  };

  dobbleChart.options.scales.y = {
    title: {
      text: "Average score",
      display: true,
      color: blue1,
    },
    grid: {
      color: blue3, // Grid line color for X-axis
    },
    ticks: {
      color: blue1, // X-axis number color
    },
    beginAtZero: true,
  };

  dobbleChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label + ":00";
  };

  dobbleChart.data.labels = timOfDayLabels;
  dobbleChart.data.datasets = [
    {
      data: timOfDayData,
      backgroundColor: blue1,
      tension: 0.1,
      fill: true,
      pointRadius: pointRadiusArray,
    },
  ];

  dobbleChart.update();
}

function plotDobble() {
  const ctx = document.getElementById("dobbleChart").getContext("2d");

  let config = {
    type: "line",
    data: {
      // labels: labels,
      // datasets: [
      //   {
      //     tension: 0.3,
      //     // borderColor: "black",
      //     data: data,
      //     backgroundColor: "#8ecae6",
      //     fill: true,
      //   },
      // ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      plugins: {
        datalabels: false,
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += "Average: " + context.parsed.y;
              }
              return label;
            },

            title: function (context) {
              const title = context[0].label;
              return title;
            },
          },
        },
      },
      scales: {
        y: {
          title: {
            text: "Average score",
            display: true,
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },

        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 5.1,
          },
        },
      },
    },
  };
  dobbleChart = new Chart(ctx, config);
}
