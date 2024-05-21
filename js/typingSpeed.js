let typingToggleState = 0;
let typingData = {};
let typingChart;

function switchTypingDots() {
  let circles = Array.from(document.getElementsByClassName("typingCircles"));
  let desc = document.getElementById("typingDesc");

  switch (typingToggleState) {
    case 0:
      desc.innerHTML = "How has my typing speed improved over time?";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows my weighted average WPM at each hour of the day.";
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

function fetchTyping() {
  const primaryUrl = "https://rppi.artomweb.com/cache/typing";
  const fallbackUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiOrp7SrLbvsgrusWvwFcllmSUov-GlAME8wvi7p3BTVCurKFh_KLlCVQ0A7luijiLa6F9fOKqxKAP/pub?output=csv";

  function parseCSV(url) {
      Papa.parse(url, {
          download: true,
          header: true,
          complete: function (results) {
            try {
              processTyping(results.data, url);
            } catch (error) {
                console.log("Error processing data:", error);
                if (url !== fallbackUrl) {
                    console.log("Trying the fallback URL...");
                    parseCSV(fallbackUrl);
                } else {
                    let typingCard = document.getElementById("typingCard");
                    typingCard.style.display = "none";
                }
            }
          },
          error: function (error) {
              console.log("Failed to fetch typing data from:", url);
              if (url === primaryUrl) {
                  console.log("Trying the fallback URL...");
                  parseCSV(fallbackUrl);
              } else {
                  let typingCard = document.getElementById("typingCard");
                  typingCard.style.display = "none";
              }
          }
      });
  }

  // Try to fetch data from the primary URL first
  parseCSV(primaryUrl);
}

fetchTyping();

function showSymbols() {
  let symbols = document.getElementsByClassName("symbol");

  for (let s of symbols) {
    s.style.display = "inline";
  }
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
    },
  };

  typingChart.options.plugins.tooltip.callbacks.title = function (tooltipItem) {
    return tooltipItem[0].label + ":00";
  };

  typingChart.data.labels = timOfDayLabels;
  typingChart.data.datasets = [
    {
      data: timOfDayData,
      backgroundColor: "#f4a4a4",
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
    },
  };
  typingChart.data.labels = labels;
  typingChart.data.datasets = [
    {
      data: data,
      backgroundColor: "#f4a4a4",
      tension: 0.1,
      fill: true,
    },
  ];

  typingChart.update();
}

function processTyping(dataIn) {
  showSymbols();
  updateTypingData(dataIn);

  drawtypingChart();
  typingToggle();
}

function updateTypingData(dataIn) {
  // dataIn = dataIn.slice(-2000);
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.timestamp);
    elt.wpm = +elt.wpm;
  });

  dataIn = _.sortBy(dataIn, (point) => point.timestamp.getTime());

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
        avg: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
        // avg: Math.round(_.maxBy(entries, "wpm").wpm * 10) / 10,
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

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YY");
    })
    .map((entries, week) => {
      // console.log(entries);
      return {
        wofy: week,
        avg: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
      };
    })
    .value();

  weekAvg.sort(
    (a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY")
  );
  // console.log(weekAvg);

  // console.log(weekAvg);

  const labels = weekAvg.map((el) => el.wofy);
  const data = weekAvg.map((el) => el.avg);

  let sortedWPM = _.sortBy(dataIn, (point) => point.timestamp.getTime());

  const maxWPM = +_.maxBy(dataIn, "wpm").wpm;

  // Only last 500 tests

  let dataRecent = sortedWPM.slice(-500);

  // speed change per hour

  let wpmPoints = dataRecent.map((point) => +point.wpm);

  const trend = findLineByLeastSquares(wpmPoints);

  const wpmChange = trend[1][1] - trend[0][1];

  const delta = dataRecent.length * 30;

  const changeInWPMPerMinSigned = (wpmChange * (3600 / delta)).toFixed(2);

  const PorNchange = changeInWPMPerMinSigned > 0 ? "+" : "-";

  const changeInWPMPerMin = Math.abs(changeInWPMPerMinSigned);

  // console.log(changeInWPMPerMin, PorNchange);

  // avg wpm and acc

  const avgWPM = _.meanBy(dataRecent, (o) => +o.wpm).toFixed(2);
  const avgACC = Math.round(
    _.meanBy(dataRecent, (o) => +o.acc),
    0
  );

  //time since last test

  const dateOfLastTest = moment(
    dataRecent[dataRecent.length - 1].timestamp
  ).format("Do [of] MMMM");

  const timeSinceLastTest =
    (new Date().getTime() -
      dataRecent[dataRecent.length - 1].timestamp.getTime()) /
    1000;

  const dateOfLastTestMessage =
    dateOfLastTest + " (" + createTimeMessage(timeSinceLastTest) + " ago)";

  // number of tests per day

  const firstTest = dataRecent[0];
  const lastTest = dataRecent[dataRecent.length - 1];

  const dayDiff =
    (lastTest.timestamp - firstTest.timestamp) / (1000 * 60 * 60 * 24);

  const testsPerDay = (dataRecent.length / dayDiff).toFixed(1);

  const totalTimeMessage = createTimeMessage(dataIn.length * 30, "HMS", 2);

  typingData = {
    labels,
    data,
    timOfDayLabels,
    timOfDayData,
    pointRadiusArray,
  };

  document.getElementById("timeSinceLastTest").innerHTML =
    dateOfLastTestMessage;
  document.getElementById("highestTypingSpeed").innerHTML = maxWPM;
  document.getElementById("averageTypingSpeed").innerHTML = avgWPM;
  document.getElementById("averageAccuracy").innerHTML = avgACC;
  document.getElementById("totalTime").innerHTML = totalTimeMessage;
  document.getElementById("testsPerDay").innerHTML = testsPerDay;
  document.getElementById("wpmChangePerHour").innerHTML =
    PorNchange + changeInWPMPerMin;
}

function drawtypingChart() {
  let ctx = document.getElementById("monkeyChart").getContext("2d");

  typingChart = new Chart(ctx, {
    type: "line",
    data: {},

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
          },
          beginAtZero: true,
        },
      },
    },
  });
}
