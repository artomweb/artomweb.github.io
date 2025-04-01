import Chart from "./sharedChartjs.js";
import { formatDate, timeago, hexToRgba } from "./usefullFunc.js";
let typingToggleState = 0;
let typingData = {};
let typingChart;

const element = document.querySelector(":root");
const red = getComputedStyle(element).getPropertyValue("--color-red1").trim();
const red1 = hexToRgba(red, 1);
const red2 = hexToRgba(red, 0.6);
const red3 = hexToRgba(red, 0.4);

function switchTypingDots() {
  const circles = Array.from(document.getElementsByClassName("typingCircles"));
  const desc = document.getElementById("typingDesc");

  switch (typingToggleState) {
    case 0:
      desc.innerHTML = "How has my typing speed improved over time?";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows my average WPM at each hour of the day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == typingToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function typingToggle() {
  switchTypingDots();
  switch (typingToggleState) {
    case 0:
      updateTypingNormal();
      break;

    case 1:
      updateTypingPerHour();
      break;
  }
  typingToggleState == 1 ? (typingToggleState = 0) : typingToggleState++;
}

export function parseTyping(data) {
  document
    .getElementById("typingToggle")
    .addEventListener("click", typingToggle);

  if (!data || data.error) {
    console.log("Error processing Chess data:");
    document.getElementById("typingCard").classList.add("hidden");
  } else {
    try {
      showTypingData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Typing data", error);
      document.getElementById("typingCard").classList.add("hidden");
    }
  }
}

function showSymbols() {
  const symbols = document.getElementsByClassName("symbol");

  for (const s of symbols) {
    s.style.display = "inline";
  }
}

function showTypingData(data) {
  showSymbols();
  const formattedDate = formatDate(data.dateOfLastTest);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastTest
  )})`;
  document.getElementById("timeSinceLastTest").innerHTML =
    dateOfLastTestMessage;
  document.getElementById("highestTypingSpeed").innerHTML = data.maxWPM;
  document.getElementById("averageTypingSpeed").innerHTML = data.avgWPM;
  document.getElementById("averageAccuracy").innerHTML = data.avgACC;
  document.getElementById("totalTime").innerHTML = data.totalTimeMessage;
  document.getElementById("testsPerDay").innerHTML = data.testsPerDay;
  document.getElementById("wpmChangePerHour").innerHTML =
    data.changeInWPMPerMin;

  typingData = data;

  drawtypingChart();
  typingToggle();
}

function updateTypingPerHour() {
  const { timOfDayLabels, timOfDayData, pointRadiusArray } = typingData;

  typingChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
      color: red1, // X-axis number color
    },
    grid: {
      color: red3, // Grid line color for X-axis
    },
  };

  typingChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label + ":00";
  };

  typingChart.data.labels = timOfDayLabels;
  typingChart.data.datasets = [
    {
      data: timOfDayData,
      backgroundColor: red1,
      tension: 0.1,
      fill: true,
      pointRadius: pointRadiusArray,
    },
  ];

  typingChart.update();
}

function updateTypingNormal() {
  const { labels, data } = typingData;

  typingChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label;
  };

  typingChart.options.scales.x = {
    maxTicksLimit: 6.3,
    ticks: {
      stepSize: 5,
      maxRotation: 0,
      minRotation: 0,
      color: red1, // X-axis number color
    },
    grid: {
      color: red3, // Grid line color for X-axis
    },
  };
  typingChart.data.labels = labels;
  typingChart.data.datasets = [
    {
      data: data,
      backgroundColor: red1,
      tension: 0.1,
      fill: true,
    },
  ];

  typingChart.update();
}

function drawtypingChart() {
  const ctx = document.getElementById("monkeyChart").getContext("2d");

  typingChart = new Chart(ctx, {
    type: "line",
    data: {},

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
                label += context.parsed.y + " WPM";
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          title: {
            text: "Average WPM",
            display: true,
            color: red1, // X-axis number color
          },
          beginAtZero: true,
          ticks: {
            color: red1, // X-axis number color
          },
          grid: {
            color: red3, // Grid line color for X-axis
          },
        },
        x: {
          ticks: {
            color: red1, // X-axis number color
          },
          grid: {
            color: red3, // Grid line color for X-axis
          },
        },
      },
    },
  });
}
