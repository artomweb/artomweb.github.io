let chessToggleState = 0;
let chessData = {};
let chessChart;

function switchChessDots() {
  let circles = Array.from(document.getElementsByClassName("chessCircles"));
  let desc = document.getElementById("chessDesc");

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

  console.log(circles);
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

function parseChess(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqA27pG_xkV7W0Gu4KfYcV3fjkIj0WNz7-DlGDMNtXtNkR4ECA85-BWEgBbz7vYh7aqijPtLpFhw8h/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    processChess(data); // Pass the relevant part of the data
  } catch (error) {
    console.log("Error processing chess data, trying the fallback URL:", error);
    parseCSV(fallbackUrl); // Fall back to CSV if processing fails
  }

  // Function to parse CSV data with PapaParse for the fallback URL
  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processChess(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let chessCard = document.getElementById("chessCard");
          chessCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let chessCard = document.getElementById("chessCard");
        chessCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

function processChess(data) {
  updateChessData(data);

  plotChess();
  chessToggle();
}

function updateChessAccuracyPerHour() {
  const { labelsByHour, accuracyByHour, accpointRadiusArray } = chessData;

  console.log(accuracyByHour, labelsByHour, accpointRadiusArray);

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
  const { labels, graphData } = chessData;

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
  const { labelsByHour, dataByHour, pointRadiusArray } = chessData;

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

function updateChessData(data) {
  // Parse and process chess data
  data.forEach((elt) => {
    elt.startTime = +elt.startTime * 1000;
    const date = new Date(+elt.startTime);
    elt.Date = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    elt.gameLength = +elt.gameLength;
  });

  // Sort data by start time
  data = _.sortBy(data, "startTime");

  // Calculate highest rating per day
  const dataByDay = _.chain(data)
    .groupBy((d) => d.Date)
    .map((entries, day) => {
      let highest = _.maxBy(entries, (entry) => +entry.myRating);
      return {
        startTime: highest.startTime,
        day,
        highest: +highest.myRating,
      };
    })
    .sortBy("startTime")
    .value();

  // Array of hours from 00 to 23 for each hour of the day
  const hoursOfDay = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Group data by hour for win % calculation
  const byHour = _.chain(data)
    .groupBy((d) => {
      const date = new Date(+d.startTime);
      return date.getHours().toString().padStart(2, "0");
    })
    .map((entries, hour) => {
      const winPercent =
        Math.round(
          (entries.filter((e) => e.myResult === "win").length /
            entries.length) *
            1000
        ) / 10;
      const avgAccuracy =
        entries.reduce((sum, entry) => sum + +entry.myAccuracy, 0) /
        entries.length;
      return {
        hour: +hour,
        winPercent,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10, // Rounded to 1 decimal place
      };
    })
    .sortBy("hour")
    .value();

  // Ensure data exists for each hour of the day
  const completedByTimeOfDay = _.map(hoursOfDay, (hour) => {
    const existingHourData = byHour.find(
      (item) => item.hour === parseInt(hour)
    );
    return existingHourData || { hour: +hour, winPercent: 0, avgAccuracy: 0 };
  });

  // Extract labels, win % data, and accuracy data by hour
  const labelsByHour = completedByTimeOfDay.map((item) => item.hour);
  const dataByHour = completedByTimeOfDay.map((item) => item.winPercent);
  const accuracyByHour = completedByTimeOfDay.map((item) => item.avgAccuracy);

  const pointRadiusArray = completedByTimeOfDay.map((item) =>
    item.winPercent !== 0 ? 3 : 0
  );

  const accpointRadiusArray = completedByTimeOfDay.map((item) =>
    item.avgAccuracy !== 0 ? 3 : 0
  );

  const dateOfLastGame = new Date(data[data.length - 1].startTime);
  const formattedDate = formatDate(dateOfLastGame);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(dateOfLastGame)})`;

  document.getElementById("timeSinceLastChess").innerHTML =
    dateOfLastTestMessage;

  const highestRating = _.maxBy(data, "myRating").myRating;
  const numGames = data.length;

  let ratings = data.map((game) => +game.myRating);
  const trend = findLineByLeastSquares(ratings);
  const ratingChange = trend[1][1] - trend[0][1];

  const delta = _.sumBy(data, "gameLength");
  const changeInScorePerHourSigned = (ratingChange * (3600 / delta)).toFixed(2);
  const PorNchange = changeInScorePerHourSigned > 0 ? "+" : "-";
  const changeInScorePerHour = Math.abs(changeInScorePerHourSigned);
  const timeMessage = Math.round(delta / (60 * 60)) + " hours";

  document.getElementById("ChessHighestRating").innerHTML = highestRating;
  document.getElementById("ChessTimePlaying").innerHTML = timeMessage;
  document.getElementById("ChessNumGames").innerHTML = numGames;
  document.getElementById("ChessChangePerHour").innerHTML =
    PorNchange + changeInScorePerHour;

  let labels = dataByDay.map((elt) => elt.day);
  let graphData = dataByDay.map((elt) => +elt.highest);

  // Update chessData object with new data
  chessData = {
    labels,
    graphData,
    labelsByHour,
    dataByHour,
    accuracyByHour,
    pointRadiusArray,
    accpointRadiusArray,
  };
}

function plotChess(data, labels) {
  let ctx = document.getElementById("ChessChart").getContext("2d");

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
