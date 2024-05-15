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
  }
  chessToggleState == 1 ? (chessToggleState = 0) : chessToggleState++;
}

function fetchChess() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqA27pG_xkV7W0Gu4KfYcV3fjkIj0WNz7-DlGDMNtXtNkR4ECA85-BWEgBbz7vYh7aqijPtLpFhw8h/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // console.log(results.data);
        processChess(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, climbing");
        let chessCard = document.getElementById("chessCard");
        chessCard.style.display = "none";
      },
    }
  );
}
fetchChess();

function processChess(data) {
  updateChessData(data);

  plotChess();
  chessToggle();
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
  data.forEach((elt) => {
    elt.timestamp = +elt.timestamp * 1000;
    elt.Date = moment(+elt.timestamp).format("DD/MM/YYYY");
  });

  data = _.sortBy(data, "timestamp");

  const dataByDay = _.chain(data)
    .groupBy((d) => d.Date)
    .map((entries, day) => {
      let highest = _.maxBy(entries, (entry) => +entry.myRating);
      return {
        timestamp: highest.timestamp,
        day,
        highest: +highest.myRating,
      };
    })
    .sortBy("timestamp")
    .value();

  const hoursOfDay = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const byHour = _.chain(data)
    .groupBy((d) => moment(+d.timestamp).format("HH"))
    .map((entries, hour) => {
      return {
        hour: +hour,
        winPercent:
          Math.round(
            (entries.filter((e) => e.myResult == "win").length /
              entries.length) *
              100 *
              10
          ) / 10,
      };
    })
    .sortBy("timestamp")
    .value();

  const completedByTimeOfDay = _.map(hoursOfDay, (hour) => {
    const existingHourData = byHour.find(
      (item) => item.hour === parseInt(hour)
    );
    return existingHourData || { hour: +hour, winPercent: 0 };
  });

  // console.log(completedByTimeOfDay);

  const labelsByHour = completedByTimeOfDay.map((item) => item.hour);
  const dataByHour = completedByTimeOfDay.map((item) => item.winPercent);

  const pointRadiusArray = completedByTimeOfDay.map((item) =>
    item.winPercent !== 0 ? 3 : 0
  );

  const dateOfLastGame = data[data.length - 1].timestamp;

  const timeSinceLastTest = (new Date().getTime() - dateOfLastGame) / 1000;

  const dateOfLastTestMessage =
    moment(dateOfLastGame).format("Do [of] MMMM") +
    " (" +
    createTimeMessage(timeSinceLastTest) +
    " ago)";

  document.getElementById("timeSinceLastChess").innerHTML =
    dateOfLastTestMessage;

  const highestRating = _.maxBy(data, "myRating").myRating;

  const numGames = data.length;

  document.getElementById("ChessHighestRating").innerHTML = highestRating;
  document.getElementById("ChessNumGames").innerHTML = numGames;

  let labels = dataByDay.map((elt) => elt.day);
  let graphData = dataByDay.map((elt) => +elt.highest);

  // plotChess(graphData, labels);

  chessData = {
    labels,
    graphData,
    labelsByHour,
    dataByHour,
    pointRadiusArray,
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
