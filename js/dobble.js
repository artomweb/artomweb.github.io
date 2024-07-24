let dobbleToggleState = 0;
let dobbleData = {};
let dobbleChart;

function switchdobbleDots() {
  let circles = Array.from(document.getElementsByClassName("dobbleCircles"));
  let desc = document.getElementById("dobbleDesc");

  switch (dobbleToggleState) {
    case 0:
      desc.innerHTML =
        'I made <a href="https://dobble.artomweb.com">this</a> game to see if I can get better at playing Dobble. Can you beat my score?';
      break;
    case 1:
      desc.innerHTML =
        "This graph shows my average score at each hour of the day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == dobbleToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function dobbleToggle() {
  switchdobbleDots();
  switch (dobbleToggleState) {
    case 0:
      updatedobbleNormal();
      break;

    case 1:
      updatedobblePerHour();
      break;
  }
  dobbleToggleState == 1 ? (dobbleToggleState = 0) : dobbleToggleState++;
}
function fetchDobble() {
  const primaryUrl = "https://api.artomweb.com/cache/dobble";
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwLrwjE_FFzRj2Sq9S3-8MQDfpnGchacJGkM1s6Oidsswu82E4jBewlVWCNA4CwW9K3EauyYYlNfTL/pub?output=csv";

  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processDobble(results.data);
        } catch (error) {
          console.log("Error processing dobble data:", error);
          if (url !== fallbackUrl) {
            console.log("Trying the fallback URL...");
            parseCSV(fallbackUrl);
          } else {
            let dobbleCard = document.getElementById("dobbleCard");
            dobbleCard.style.display = "none";
          }
        }
      },
      error: function (error) {
        console.log("Failed to fetch dobble data from:", url);
        if (url === primaryUrl) {
          console.log("Trying the fallback URL...");
          parseCSV(fallbackUrl);
        } else {
          let dobbleCard = document.getElementById("dobbleCard");
          dobbleCard.style.display = "none";
        }
      },
    });
  }

  // Try to fetch data from the primary URL first
  parseCSV(primaryUrl);
}

fetchDobble();

function updatedobbleNormal() {
  const { labels, data } = dobbleData;

  dobbleChart.options.scales.x = {
    ticks: {
      autoSkip: true,
      maxTicksLimit: 5.1,
    },
  };

  dobbleChart.options.scales.y = {
    title: {
      text: "Average Score",
      display: true,
    },
    beginAtZero: true,
  };

  dobbleChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label;
  };

  dobbleChart.data.labels = labels;
  dobbleChart.data.datasets = [
    {
      data: data,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
  ];

  dobbleChart.update();
}

function updatedobblePerHour() {
  const { timOfDayLabels, timOfDayData, pointRadiusArray } = dobbleData;

  dobbleChart.options.scales.x = {
    type: "linear",
    position: "bottom",
    ticks: {
      stepSize: 1,
      callback: function (value, index, values) {
        return `${value}:00`;
      },
    },
  };

  dobbleChart.options.scales.y = {
    title: {
      text: "Average score",
      display: true,
    },
    beginAtZero: true,
  };

  dobbleChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label + ":00";
  };

  dobbleChart.data.labels = timOfDayLabels;
  dobbleChart.data.datasets = [
    {
      data: timOfDayData,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
      pointRadius: pointRadiusArray,
    },
  ];

  dobbleChart.update();
}

function processDobble(dataIn) {
  updateDobbleData(dataIn);

  plotDobble();

  dobbleToggle();
}

function updateDobbleData(dataIn) {
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.unix * 1000);
    elt.score = +elt.score;
  });

  const numTests = dataIn.length;

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YY");
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
  const timeMessage = toHours(numTests * 60);
  // console.log(timeMessage);

  document.getElementById("dobbleScoreChangePerHour").innerHTML =
    PorNchange + changeInScorePerMin;

  document.getElementById("dobbleTime").innerHTML = timeMessage;

  document.getElementById("highestDobble").innerHTML = maxScore;
  document.getElementById("numberDobble").innerHTML = numTests;

  dobbleData = {
    labels,
    data,
    timOfDayLabels,
    timOfDayData,
    pointRadiusArray,
  };

  // console.log(maxScore);
}

function plotDobble() {
  let ctx = document.getElementById("dobbleChart").getContext("2d");

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
  dobbleChart = new Chart(ctx, config);
}
