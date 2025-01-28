import Chart from "./sharedChartjs.js";
import { formatDate, timeago } from "./usefullFunc.js";

let chessToggleState = 0;
let chessData = {};
let chessChart;

function switchChessDots() {
  const circles = Array.from(document.getElementsByClassName("chessCircles"));
  const desc = document.getElementById("chessDesc");

  switch (chessToggleState) {
    case 0:
      desc.innerHTML = "How has my chess rating improved over time?";
      break;
    case 1:
      desc.innerHTML = "This graph shows my win % at each hour of the day.";
      break;
    case 2:
      desc.innerHTML =
        "This graph shows my average accuracy at each hour of the day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == chessToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function chessToggle() {
  switchChessDots();
  switch (chessToggleState) {
    case 0:
      updateChessNormal();
      break;

    case 1:
      updateChessPerHour();
      break;

    case 2:
      updateChessAccuracyPerHour();
      break;
  }
  chessToggleState = (chessToggleState + 1) % 3;
}

export function parseChess(data) {
  document.getElementById("chessToggle").addEventListener("click", chessToggle);

  if (!data || data?.error) {
    console.log("Error processing Chess data:");
  } else {
    try {
      showChessData(data.data); // Pass the relevant part of the data
      document.getElementById("chessCard").classList.remove("hidden");
    } catch (error) {
      console.log("Error processing Chess data", error);
    }
  }
}

function showChessData(data) {
  const formattedDate = formatDate(data.dateOfLastGame);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastGame
  )})`;
  document.getElementById("timeSinceLastChess").innerHTML =
    dateOfLastTestMessage;
  document.getElementById("ChessHighestRating").innerHTML = data.highestRating;
  document.getElementById("ChessTimePlaying").innerHTML = data.timeMessage;
  document.getElementById("ChessNumGames").innerHTML = data.numGames;
  document.getElementById("ChessChangePerHour").innerHTML =
    data.changeInScorePerHour;

  chessData = data;
  plotChess();
  chessToggle();
}

function updateChessAccuracyPerHour() {
  const { labelsByHour, accuracyByHour, accpointRadiusArray } =
    chessData.gameStatsByHour;

  // console.log(accuracyByHour, labelsByHour, accpointRadiusArray);

  chessChart.options.scales.y = {
    title: {
      text: "Average Accuracy",
      display: true,
    },
    beginAtZero: true,
  };

  chessChart.options.plugins.tooltip.callbacks = {
    label: function (context) {
      let label = context.dataset.label || "";

      if (label) {
        label += ": ";
      }

      if (context.parsed.y !== null) {
        label += context.parsed.y + "%";
      }
      return label;
    },
    title: function (tooltipItem) {
      return tooltipItem[0].label + ":00";
    },
  };

  chessChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
    },
  };

  chessChart.data.labels = labelsByHour;
  chessChart.data.datasets = [
    {
      data: accuracyByHour,
      backgroundColor: "#81b29a",
      tension: 0.1,
      fill: true,
      pointRadius: accpointRadiusArray,
    },
  ];

  chessChart.update();
}

function updateChessNormal() {
  const { labels, graphData } = chessData.dataByDay;

  chessChart.options.scales = {
    x: {
      ticks: {
        maxTicksLimit: 4,
      },
    },

    y: {
      title: {
        text: "Chess rating",
        display: true,
      },
      beginAtZero: true,
    },
  };

  chessChart.options.plugins.tooltip.callbacks = {};

  chessChart.data.labels = labels;
  chessChart.data.datasets = [
    {
      data: graphData,
      backgroundColor: "#81b29a",
      tension: 0.1,
      fill: true,
    },
  ];

  chessChart.update();
}

function updateChessPerHour() {
  const { labelsByHour, dataByHour, pointRadiusArray } =
    chessData.gameStatsByHour;
  chessChart.options.scales.y = {
    title: {
      text: "Win %",
      display: true,
    },
    beginAtZero: true,
  };

  chessChart.options.plugins.tooltip.callbacks = {
    label: function (context) {
      let label = context.dataset.label || "";

      if (label) {
        label += ": ";
      }

      if (context.parsed.y !== null) {
        label += context.parsed.y + "%";
      }
      return label;
    },
    title: function (tooltipItem) {
      return tooltipItem[0].label + ":00";
    },
  };

  chessChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
    },
  };

  chessChart.data.labels = labelsByHour;
  chessChart.data.datasets = [
    {
      data: dataByHour,
      backgroundColor: "#81b29a",
      tension: 0.1,
      fill: true,
      pointRadius: pointRadiusArray,
    },
  ];

  chessChart.update();
}

function plotChess() {
  const ctx = document.getElementById("ChessChart").getContext("2d");

  // console.log(data, labels);

  chessChart = new Chart(ctx, {
    type: "line",
    data: {
      // labels: labels,
      // datasets: [
      //   {
      //     tension: 0.3,
      //     // borderColor: "black",
      //     data,
      //     backgroundColor: "#81b29a",
      //     fill: true,
      //     // fill: false,
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
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 4,
          },
        },

        y: {
          title: {
            text: "Chess rating",
            display: true,
          },
          beginAtZero: true,
        },
      },
    },
  });
}
