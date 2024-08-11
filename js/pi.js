let PIToggleState = 0;
let PIData = {};
let PIChart;

function switchPIDots() {
  let circles = Array.from(document.getElementsByClassName("PICircles"));
  let desc = document.getElementById("PIDesc");

  switch (PIToggleState) {
    case 0:
      desc.innerHTML =
        ' I made <a href="https://pi.artomweb.com/">this</a> game to see if I can learn more digits of Pi. How many digits of Pi have I learnt?';
      break;
    case 1:
      desc.innerHTML =
        "This graph shows my average score at each hour of the day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == PIToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function PIToggle() {
  switchPIDots();
  switch (PIToggleState) {
    case 0:
      updatePINormal();
      break;

    case 1:
      updatePIPerHour();
      break;
  }
  PIToggleState == 1 ? (PIToggleState = 0) : PIToggleState++;
}
function fetchPI() {
  // const primaryUrl = "https://api.artomweb.com/cache/pi";
  const primaryUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1ohhffWpYqRZdZ27NCDoAunJgCI-VNN--UFCBWbC05QkM9bWmu-bjoOABKIAHqzA8n3BGqvQkG7xk/pub?output=csv";

  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processPI(results.data);
        } catch (error) {
          console.log("Error processing pi data:", error);
          if (url !== fallbackUrl) {
            console.log("Trying the fallback URL...");
            parseCSV(fallbackUrl);
          } else {
            let PICard = document.getElementById("piCard");
            PICard.style.display = "none";
          }
        }
      },
      error: function (error) {
        console.log("Failed to fetch PI data from:", url);
        if (url === primaryUrl) {
          console.log("Trying the fallback URL...");
          parseCSV(fallbackUrl);
        } else {
          let PICard = document.getElementById("piCard");
          PICard.style.display = "none";
        }
      },
    });
  }

  // Try to fetch data from the primary URL first
  parseCSV(primaryUrl);
}

fetchPI();

function updatePINormal() {
  const { labels, data } = PIData;

  PIChart.options.scales.x = {
    ticks: {
      autoSkip: true,
      maxTicksLimit: 5.1,
    },
  };

  PIChart.options.scales.y = {
    title: {
      text: "Average Score",
      display: true,
    },
    beginAtZero: true,
  };

  PIChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label;
  };

  PIChart.data.labels = labels;
  PIChart.data.datasets = [
    {
      data: data,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
  ];

  PIChart.update();
}

function updatePIPerHour() {
  const { timOfDayLabels, timOfDayData, pointRadiusArray } = PIData;

  PIChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
    },
  };

  PIChart.options.scales.y = {
    title: {
      text: "Weighted average",
      display: true,
    },
    beginAtZero: true,
  };

  PIChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label + ":00";
  };

  PIChart.data.labels = timOfDayLabels;
  PIChart.data.datasets = [
    {
      data: timOfDayData,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
      pointRadius: pointRadiusArray,
    },
  ];

  PIChart.update();
}

function processPI(dataIn) {
  updatePIData(dataIn);

  plotPI();

  PIToggle();
}

function updatePIData(dataIn) {
  let totalTime = 0;
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.timestamp * 1000);
    elt.score = +elt.score;
    elt.timeSpent = +elt.timeSpent;
    totalTime += elt.timeSpent;
  });

  console.log(totalTime);

  const numTests = dataIn.length;

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("DD MM YYYY");
    })
    .map((entries, mofy) => {
      return {
        mofy,
        avg: Math.round(_.meanBy(entries, (entry) => entry.score) * 10) / 10,
        // avg: Math.round(_.maxBy(entries, "score").score * 10) / 10,
      };
    })
    .value();

  const labels = weekAvg.map((el) => el.mofy);
  const data = weekAvg.map((el) => el.avg);

  const hoursOfDay = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const byTimeOfDay = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("HH");
    })
    .map((entries, hour) => {
      return {
        hour: +hour,
        avg: Math.round(_.meanBy(entries, (entry) => +entry.score) * 10) / 10,
        // avg: Math.round(_.maxBy(entries, "score").score * 10) / 10,
        // avg: entries.length,
      };
    })
    .sortBy((d) => d.hour)
    .value();

  console.log(byTimeOfDay);

  const completedByTimeOfDay = _.map(hoursOfDay, (hour) => {
    const existingHourData = byTimeOfDay.find(
      (item) => item.hour === parseInt(hour)
    );
    return existingHourData || { hour: +hour, avg: 0 };
  });

  const timOfDayLabels = completedByTimeOfDay.map((item) => item.hour);
  const timOfDayData = completedByTimeOfDay.map((item) => item.avg);

  const pointRadiusArray = completedByTimeOfDay.map((item) =>
    item.avg !== 0 ? 3 : 0
  );

  let scorePoints = dataIn.map((point) => +point.score);

  const trend = findLineByLeastSquares(scorePoints);

  const scoreChange = trend[1][1] - trend[0][1];

  const delta = dataIn.length * 60;

  const changeInScorePerMinSigned = (scoreChange * (3600 / delta)).toFixed(2);

  const PorNchange = changeInScorePerMinSigned > 0 ? "+" : "-";

  const changeInScorePerMin = Math.abs(changeInScorePerMinSigned);

  const maxScore = _.maxBy(dataIn, "score").score;
  const timeMessage = toHours(totalTime);
  console.log(totalTime);

  document.getElementById("PIScoreChangePerHour").innerHTML =
    PorNchange + changeInScorePerMin;

  document.getElementById("timePI").innerHTML = timeMessage;

  document.getElementById("highestPI").innerHTML = maxScore;
  document.getElementById("numberPI").innerHTML = numTests;

  PIData = {
    labels,
    data,
    timOfDayLabels,
    timOfDayData,
    pointRadiusArray,
  };

  // console.log(maxScore);
}

function plotPI() {
  let ctx = document.getElementById("PIChart").getContext("2d");

  config = {
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
              let title = context[0].label;
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
  PIChart = new Chart(ctx, config);
}
