let climbingData = {};
let climbingChart;
let climbingToggleState = 0;

function switchClimbingDots() {
  const circles = Array.from(document.getElementsByClassName("climbingCircles"));
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
  circles.forEach((c) =>
    c.id.slice(-1) == climbingToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
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

function parseClimbing(data) {
  const climbingCard = document.getElementById("climbingCard");

  if (!data || data.error) {
    console.log("Error processing fallback CSV data:", data.error);
    climbingCard.style.display = "none"; // Hide the card if processing fails
  } else {
    try {
      showClimbingData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Climbing data", error);
      climbingCard.style.display = "none"; // Hide the card if processing fails
    }
  }
}

function showClimbingData(data) {
  console.log(data);
  document.getElementById("highestGrade").innerHTML = data.highestGrade;
  document.getElementById("climbingSessions").innerHTML = data.climbingSessions;

  document.getElementById("timeSinceLastClimb").innerHTML =
    data.timeSinceLastClimb;

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
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      stack: "Stack 0",
    },
    {
      label: "Successes",
      data: successes,
      backgroundColor: "rgba(153, 102, 255, 0.6)",
      stack: "Stack 0",
    },
    {
      label: "Attempts",
      data: attempts,
      backgroundColor: "rgba(255, 159, 64, 0.6)",
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
      },
    },
    y: {
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
      },
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
  console.log(climbingData.byGrade);
  const { byGradeLabels, byGradeAttempts, byGradeSuccesses, byGradeFlashes } =
    climbingData.byGrade;

  climbingChart.data.labels = byGradeLabels;

  climbingChart.data.datasets = [
    {
      label: "Flashes",
      data: byGradeFlashes,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      stack: "Stack 0",
    },
    {
      label: "Successes",
      data: byGradeSuccesses,
      backgroundColor: "rgba(153, 102, 255, 0.6)",
      stack: "Stack 0",
    },
    {
      label: "Attempts",
      data: byGradeAttempts,
      backgroundColor: "rgba(255, 159, 64, 0.6)",
      stack: "Stack 0",
    },
  ];

  climbingChart.options.scales = {
    x: {
      stacked: true,

      maxTicksLimit: 4,
    },
    y: {
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
    plugins: [ChartDataLabels],
  });
}
