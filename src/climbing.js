import { formatDate, timeago, hexToRgba } from "./usefullFunc.js";
import Chart from "./sharedChartjs.js";
import { color } from "chart.js/helpers";

let climbingData = {};
let climbingChart;
let climbingToggleState = 0;
import { green1, green2, green3, green4 } from "./colours.js";

function switchClimbingDots() {
  const circles = Array.from(
    document.getElementsByClassName("climbingCircles")
  );
  const desc = document.getElementById("climbingDesc");

  switch (climbingToggleState) {
    case 0:
      desc.innerHTML =
        "This graph shows my climbing progression over time. The value above each bar is the maximum grade climbed.";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows how many climbs of each grade I have done.";
      break;
  }
  circles.forEach((c) => {
    if (c.id.slice(-1) == climbingToggleState) {
      c.classList.add("fill-green");
    } else {
      c.classList.remove("fill-green");
    }
  });
}

function climbingToggle() {
  switchClimbingDots();
  switch (climbingToggleState) {
    case 0:
      updateClimbingRunning();
      break;

    case 1:
      updateClimbingByGrade();
      break;
  }
  climbingToggleState == 1 ? (climbingToggleState = 0) : climbingToggleState++;
}

export function parseClimbing(data) {
  document
    .getElementById("climbingToggle")
    .addEventListener("click", climbingToggle);

  if (!data || data?.error) {
    console.log("Error processing fallback CSV data:");
    document.getElementById("climbingCard").classList.add("hidden");
  } else {
    try {
      showClimbingData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Climbing data", error);
      document.getElementById("climbingCard").classList.add("hidden");
    }
  }
}

function showClimbingData(data) {
  const formattedDate = formatDate(data.lastClimbDate);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.lastClimbDate
  )})`;
  document.getElementById("highestGrade").innerHTML = data.highestGrade;
  document.getElementById("climbingSessions").innerHTML = data.climbingSessions;

  document.getElementById("timeSinceLastClimb").innerHTML =
    dateOfLastTestMessage;

  climbingData = data;

  drawClimbingChart();
  climbingToggle();
}

function updateClimbingRunning() {
  const { latestLabels, attempts, successes, flashes, bestGrade } =
    climbingData.running;

  climbingChart.data.labels = latestLabels;

  climbingChart.data.datasets = [
    {
      label: "Flashes",
      data: flashes,
      backgroundColor: green1,
      stack: "Stack 0",
    },
    {
      label: "Successes",
      data: successes,
      backgroundColor: green4,
      stack: "Stack 0",
    },
    {
      label: "Attempts",
      data: attempts,
      backgroundColor: green3,
      stack: "Stack 0",
    },
  ];

  climbingChart.options.scales = {
    x: {
      stacked: true,
      ticks: {
        callback: function (value, index, ticks) {
          const tickDate = new Date(latestLabels[index]);
          return tickDate.toLocaleString("en-GB", {
            month: "short",
            year: "numeric",
          });
        },
        maxTicksLimit: 4,
        color: green1, // X-axis number color
      },

      grid: {
        color: green3, // Grid line color for X-axis
      },
    },
    y: {
      ticks: {
        color: green1, // X-axis number color
      },
      grid: {
        color: green3, // Grid line color for X-axis
      },
      stacked: false,
    },
  };

  climbingChart.options.plugins = {
    tooltip: {
      callbacks: {
        title: function (tooltipItem) {
          return formatDate(new Date(tooltipItem[0].label));
        },
      },
    },
    datalabels: {
      anchor: "end",
      align: "top",
      font: {
        weight: "bold",
        color: green1,
      },
      color: green1,
      offset: -4,

      formatter: function (value, context) {
        if (context.dataset.label == "Attempts") {
          const averageGrade = bestGrade[context.dataIndex]; // Get the corresponding average grade
          return averageGrade; // Display the average grade above the bar
        }
        return null;
      },
    },
  };
  climbingChart.update();
}

function updateClimbingByGrade() {
  const { byGradeLabels, byGradeAttempts, byGradeSuccesses, byGradeFlashes } =
    climbingData.byGrade;

  climbingChart.data.labels = byGradeLabels;

  climbingChart.data.datasets = [
    {
      label: "Flashes",
      data: byGradeFlashes,
      backgroundColor: green1,
      stack: "Stack 0",
    },
    {
      label: "Successes",
      data: byGradeSuccesses,
      backgroundColor: green2,
      stack: "Stack 0",
    },
    {
      label: "Attempts",
      data: byGradeAttempts,
      backgroundColor: green3,
      stack: "Stack 0",
    },
  ];

  climbingChart.options.scales = {
    x: {
      stacked: true,
      ticks: {
        color: green1, // X-axis number color
      },
      grid: {
        color: green3, // Grid line color for X-axis
      },
      maxTicksLimit: 4,
    },
    y: {
      ticks: {
        color: green1, // X-axis number color
      },
      grid: {
        color: green3, // Grid line color for X-axis
      },
      stacked: false,
    },
  };

  climbingChart.options.plugins = {
    datalabels: false,
  };
  climbingChart.update();
}

function drawClimbingChart() {
  const ctx = document.getElementById("climbingChart").getContext("2d");

  climbingChart = new Chart(ctx, {
    type: "bar",
  });
}
