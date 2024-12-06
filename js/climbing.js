let climbingData = {};
let climbingChart;
let climbingToggleState = 0;

function switchClimbingDots() {
  let circles = Array.from(document.getElementsByClassName("climbingCircles"));
  let desc = document.getElementById("climbingDesc");

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
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv&gid=1296486701";

  // Attempt to process the provided JSON data
  try {
    processClimbing(data); // Pass the relevant part of the data
  } catch (error) {
    console.log(
      "Error processing climbing data, trying the fallback URL:",
      error
    );
    parseCSV(fallbackUrl); // Fall back to CSV if processing fails
  }

  // Function to parse CSV data with PapaParse for the fallback URL
  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processClimbing(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let climbingCard = document.getElementById("climbingCard");
          climbingCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let climbingCard = document.getElementById("climbingCard");
        climbingCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

const gradeRanking = {
  VB: 0,
  V0: 1,
  V1: 3,
  V2: 4,
  V3: 5,
  V4: 6,
  V5: 7,
  V6: 8,
  V7: 9,
  V8: 10,
  V9: 11,
};

function processClimbing(data) {
  updateClimbingData(data);

  drawClimbingChart();
  climbingToggle();
}

function updateClimbingData(data) {
  // Find the highest grade
  data.map((d) => {
    d.Grade = d.Grade.split("+")[0];
    d.numericGrade = gradeRanking[d.Grade];
    d.DateJS = parseDate(d.Date);
    return d;
  });

  let highestGrade = _.maxBy(data, "numericGrade").Grade;
  document.getElementById("highestGrade").innerHTML = highestGrade;
  // Total number of climbing sessions

  const groupedByDay = _.groupBy(data, "Date");
  document.getElementById("climbingSessions").innerHTML =
    _.keys(groupedByDay).length;

  // Get the last date from the sorted groupedByDay object

  const routes = _.mapValues(groupedByDay, (climbs) => {
    // Count routes where Success == true and Attempts == 1
    const flashes = _.filter(
      climbs,
      (climb) => climb.Success === true && climb.Attempts === 1
    );

    const successes = _.filter(climbs, (climb) => climb.Success === true);
    const attempts = _.sumBy(climbs, (climb) => +climb.Attempts);

    const bestGrade = _.maxBy(climbs, "numericGrade").Grade;
    return {
      flashes: flashes.length,
      successes: successes.length,
      attempts,
      bestGrade,
      // Add other metrics as needed
    };
  });

  let sortedRoutes = _.pick(
    routes,
    Object.keys(routes).sort((a, b) => parseDate(a) - parseDate(b))
  );
  // // Prepare data for plotting
  const labels = _.map(_.keys(sortedRoutes), (d) => parseDate(d)); // Dates as labels

  const N = 10;
  const latestLabels = labels.slice(-N);
  const lastClimbDate = _.last(latestLabels);

  const dateOfLastClimb = lastClimbDate;

  const formattedDate = formatDate(dateOfLastClimb);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    dateOfLastClimb
  )})`;
  document.getElementById("timeSinceLastClimb").innerHTML =
    dateOfLastTestMessage;
  const attempts = Object.values(sortedRoutes)
    .slice(-N)
    .map((route) => route.attempts);
  const successes = Object.values(sortedRoutes)
    .slice(-N)
    .map((route) => route.successes);
  const flashes = Object.values(sortedRoutes)
    .slice(-N)
    .map((route) => route.flashes);
  const bestGrade = Object.values(sortedRoutes)
    .slice(-N)
    .map((route) => route.bestGrade);

  const gradeTotals = {};

  Object.values(groupedByDay).forEach((climbsOnDate) => {
    climbsOnDate.forEach((climb) => {
      const { Grade, Attempts, Success, numericGrade } = climb;

      if (!gradeTotals[Grade]) {
        gradeTotals[Grade] = {
          attempts: 0,
          successes: 0,
          flashes: 0,
          numericGrade,
        };
      }

      gradeTotals[Grade].attempts += Attempts;
      if (Success) {
        if (Attempts == 1) {
          gradeTotals[Grade].flashes += 1;
        }
        gradeTotals[Grade].successes += 1;
      }
    });
  });

  let sortedGrades = Object.fromEntries(
    Object.entries(gradeTotals).sort(
      ([, a], [, b]) => a.numericGrade - b.numericGrade
    )
  );

  // console.log(sortedGrades);

  const byGradeLabels = _.keys(sortedGrades); // Dates as labels
  // console.log(byGradeLabels);
  const byGradeAttempts = Object.values(sortedGrades).map(
    (route) => route.attempts
  );
  const byGradeSuccesses = Object.values(sortedGrades).map(
    (route) => route.successes
  );
  const byGradeflashes = Object.values(sortedGrades).map(
    (route) => route.flashes
  );

  climbingData = {
    running: {
      latestLabels,
      attempts,
      successes,
      flashes,
      bestGrade,
    },
    byGrade: {
      byGradeLabels,
      byGradeAttempts,
      byGradeSuccesses,
      byGradeflashes,
    },
  };
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
  const { byGradeLabels, byGradeAttempts, byGradeSuccesses, byGradeflashes } =
    climbingData.byGrade;

  climbingChart.data.labels = byGradeLabels;

  climbingChart.data.datasets = [
    {
      label: "Flashes",
      data: byGradeflashes,
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
