import Chart from "./sharedChartjs.js";
import { formatDate, timeago, updateToggleIndicators } from "./usefullFunc.js";
import { blue1, blue2, red1, red2 } from "./colours.js";

let codData = {};
let codChart;
let codToggleState = 0;

function switchCodDots() {
  const desc = document.getElementById("cod-desc");

  switch (codToggleState) {
    case 0:
      desc.innerHTML =
        "Ben and I sometimes play Call of Duty together, who's winning? This graph shows the margin that either of us was winning by overall.";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows who won the most games at each hour of the day.";
    case 2:
      desc.innerHTML = "This graph shows the number of games won per day.";
      break;
      break;
  }
  updateToggleIndicators("cod-toggle-indicators", codToggleState, blue1);
}

function codToggle() {
  switchCodDots();
  switch (codToggleState) {
    case 0:
      updateCodRunning();
      break;

    case 1:
      updateCodPerHour();
      break;

    case 2:
      updateCodNormal();
      break;
  }
  codToggleState == 2 ? (codToggleState = 0) : codToggleState++;
}

export function parseCod(data) {
  document.getElementById("codToggle").addEventListener("click", codToggle);

  if (!data || data?.error) {
    console.log("Error processing COD data");
    document.getElementById("CODCard").classList.add("hidden");
  } else {
    try {
      showCODData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing COD data:", error);
      document.getElementById("CODCard").classList.add("hidden");
    }
  }
}

function showCODData(data) {
  const formattedDate = formatDate(data.dateOfLastTest);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastTest
  )})`;
  document.getElementById("numGamesArchie").innerHTML = data.totalArchie;
  document.getElementById("numGamesBen").innerHTML = data.totalBen;
  document.getElementById("timeSinceLastCod").innerHTML = dateOfLastTestMessage;

  codData = data;
  drawCodChart();
  codToggle();
}

function updateCodPerHour() {
  console.log("per hour");
  const { winPercentagesA, winPercentagesB, hours } = codData.hourlyView;

  codChart.data.labels = hours;
  codChart.data.datasets = [
    {
      label: "Archie",
      data: winPercentagesA,
      backgroundColor: red2,
      borderColor: red1,
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: winPercentagesB,
      backgroundColor: blue2,
      borderColor: blue1,
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    max: 100,
    min: -100,
    title: {
      text: "Win %",
      display: true,
      color: blue1,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };
  codChart.options.scales.x = {
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        return value + ":00";
      },
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };

  codChart.update();
}

function updateCodNormal() {
  const { dataArchie, dataBen, labels } = codData.normalView;

  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Archie",
      data: dataArchie,
      backgroundColor: red2,
      borderColor: red1,
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: dataBen,
      backgroundColor: blue2,
      borderColor: blue1,
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Score",
      display: true,
      color: blue1,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  codChart.update();
}

function updateCodRunning() {
  const { runningData, labels } = codData.runningView;
  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Margin",
      data: runningData,
      showLine: false,

      fill: {
        target: "origin",
        above: red2, // Area will be red above the origin
        below: blue2, // And blue below the origin
      },
      pointBackgroundColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? red1 : value < 0 ? blue1 : "#000000";
      },
      pointBorderColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? red1 : value < 0 ? blue1 : "#000000";
      },
    },
    { label: "Archie", data: [], backgroundColor: red2 },
    { label: "Ben", data: [], backgroundColor: blue1 },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Winning margin",
      display: true,
      color: blue1,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
      color: blue1,
    },
    grid: {
      color: blue2, // Grid line color for X-axis
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  // codChart.options.plugins.legend = {
  //   display: false,
  // };

  codChart.update();
}

function drawCodChart() {
  const ctx = document.getElementById("CODChart").getContext("2d");

  codChart = new Chart(ctx, {
    type: "line",

    options: {
      maintainAspectRatio: true,
      responsive: true,

      plugins: {
        datalabels: false,
        legend: {
          display: true,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += " " + Math.abs(context.parsed.y);
              }
              if (codToggleState == 2) {
                label += "%";
              }
              return label;
            },
            title: function (context) {
              let title = context[0].label;
              if (codToggleState == 2) {
                title += ":00";
              }
              return title;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 4,
          },
        },

        y: {
          ticks: {
            beginAtZero: true,
            callback: function (value, index, values) {
              if (value % 1 == 0) {
                return Math.abs(value);
              }
            },
          },
        },
      },
    },
  });
}
