import Chart from "./sharedChartjs";
let codData = {};
let codChart;
let codToggleState = 0;

function switchCodDots() {
  const circles = Array.from(document.getElementsByClassName("codCircles"));
  const desc = document.getElementById("cod-desc");

  switch (codToggleState) {
    case 0:
      desc.innerHTML =
        "Ben and I sometimes play Call of Duty together, who's winning? This graph shows the margin that either of us was winning by overall.";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows who won the most games at each hour of the day.";
      break;
    case 2:
      desc.innerHTML = "This graph shows the number of games won per day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == codToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
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
  const CODCard = document.getElementById("CODCard");
  document.getElementById("codToggle").addEventListener("click", codToggle);

  if (!data || data?.error) {
    console.log("Error processing COD data");
    CODCard.style.display = "none"; // Hide the card if processing fails
  } else {
    try {
      showCODData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing COD data:", error);
      CODCard.style.display = "none"; // Hide the card if processing fails
    }
  }
}

function showCODData(data) {
  document.getElementById("numGamesArchie").innerHTML = data.totalArchie;
  document.getElementById("numGamesBen").innerHTML = data.totalBen;
  document.getElementById("timeSinceLastCod").innerHTML =
    data.dateOfLastTestMessage;

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
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: winPercentagesB,
      backgroundColor: "#F4A4A4",
      borderColor: "#F4A4A4",
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Win %",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };
  codChart.options.scales.x = {
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        return value + ":00";
      },
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
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: dataBen,
      backgroundColor: "#F4A4A4",
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Score",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
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
        above: "#8ecae6", // Area will be red above the origin
        below: "#F4A4A4", // And blue below the origin
      },
      pointBackgroundColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
      pointBorderColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
    },
    { label: "Archie", data: [], backgroundColor: "#8ecae6" },
    { label: "Ben", data: [], backgroundColor: "#F4A4A4" },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Winning margin",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
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
