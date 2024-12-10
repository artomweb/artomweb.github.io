let typingToggleState = 0;
let typingData = {};
let typingChart;

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

function parseTyping(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiOrp7SrLbvsgrusWvwFcllmSUov-GlAME8wvi7p3BTVCurKFh_KLlCVQ0A7luijiLa6F9fOKqxKAP/pub?output=csv";

  try {
    processTyping(data); // Attempt to process the data
  } catch (error) {
    console.log(
      "Error processing typing data, trying the fallback URL:",
      error
    );
    parseCSV(fallbackUrl); // Fallback to CSV if processing fails
  }

  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processTyping(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          const typingCard = document.getElementById("typingCard");
          typingCard.style.display = "none";
        }
      },
      error: function (error) {
        console.log("Failed to fetch typing data from CSV URL:", error);
        const typingCard = document.getElementById("typingCard");
        typingCard.style.display = "none";
      },
    });
  }
}

function showSymbols() {
  const symbols = document.getElementsByClassName("symbol");

  for (const s of symbols) {
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
      const date = new Date(d.timestamp);
      return date.getHours(); // Get the hour (0-23)
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

  const weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      const date = new Date(d.timestamp);
      return (
        date.toLocaleString("default", { month: "short" }) +
        " " +
        date.getFullYear()
      ); // Format as "MMM YY"
    })
    .map((entries, week) => {
      return {
        wofy: week,
        avg: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
      };
    })
    .value();

  // Sort weekAvg by date
  weekAvg.sort((a, b) => {
    const aDate = new Date(a.wofy);
    const bDate = new Date(b.wofy);
    return aDate - bDate; // Compare dates
  });

  // console.log(weekAvg);

  // console.log(weekAvg);

  const labels = weekAvg.map((el) => el.wofy);
  const data = weekAvg.map((el) => el.avg);

  const sortedWPM = _.sortBy(dataIn, (point) => point.timestamp.getTime());

  const maxWPM = +_.maxBy(dataIn, "wpm").wpm + " wpm";

  // Only last 500 tests

  const dataRecent = sortedWPM.slice(-500);

  // speed change per hour

  const wpmPoints = dataRecent.map((point) => +point.wpm);

  const trend = findLineByLeastSquares(wpmPoints);

  const wpmChange = trend[1][1] - trend[0][1];

  const delta = dataRecent.length * 30;

  const changeInWPMPerMinSigned = (wpmChange * (3600 / delta)).toFixed(2);

  const PorNchange = changeInWPMPerMinSigned > 0 ? "+" : "-";

  const changeInWPMPerMin = Math.abs(changeInWPMPerMinSigned) + " wpm";

  // console.log(changeInWPMPerMin, PorNchange);

  // avg wpm and acc

  const avgWPM = _.meanBy(dataRecent, (o) => +o.wpm).toFixed(2) + " wpm";
  const avgACC =
    Math.round(
      _.meanBy(dataRecent, (o) => +o.acc),
      0
    ) + " %";

  //time since last test

  const dateOfLastTest = formatDate(
    dataRecent[dataRecent.length - 1].timestamp
  );

  const dateOfLastTestMessage =
    dateOfLastTest +
    " (" +
    timeago(dataRecent[dataRecent.length - 1].timestamp) +
    ")";

  // number of tests per day

  const firstTest = dataRecent[0];
  const lastTest = dataRecent[dataRecent.length - 1];

  const dayDiff =
    (lastTest.timestamp - firstTest.timestamp) / (1000 * 60 * 60 * 24);

  const testsPerDay = (dataRecent.length / dayDiff).toFixed(1);

  const totalTimeMessage =
    Math.round((dataIn.length * 30) / (60 * 60)) + " hours";

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
  const ctx = document.getElementById("monkeyChart").getContext("2d");

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
