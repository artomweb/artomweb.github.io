function fetchTyping() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiOrp7SrLbvsgrusWvwFcllmSUov-GlAME8wvi7p3BTVCurKFh_KLlCVQ0A7luijiLa6F9fOKqxKAP/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // gamesMain(results.data);
        // console.log(results.data);
        processTyping(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, games");
      },
    }
  );
}

fetchTyping();

function showSymbols() {
  let symbols = document.getElementsByClassName("symbol");

  for (let s of symbols) {
    s.style.display = "inline";
  }
}

function processTyping(dataIn) {
  // dataIn = dataIn.slice(-3000);
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.timestamp);
    elt.wpm = +elt.wpm;
  });

  dataIn = _.sortBy(dataIn, (point) => point.timestamp.getTime());

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YYYY");
    })
    .map((entries, week) => {
      // console.log(entries);
      return {
        wofy: week,
        sum: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
      };
    })
    .value();

  weekAvg.sort(
    (a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY")
  );
  // console.log(weekAvg);

  // console.log(weekAvg);

  const labels = weekAvg.map((el) => el.wofy);
  const data = weekAvg.map((el) => el.sum);

  let sortedWPM = _.sortBy(dataIn, (point) => point.timestamp.getTime());

  const maxWPM = +_.maxBy(dataIn, "wpm").wpm;

  // Only last 500 tests

  let dataRecent = sortedWPM.slice(-500);

  // speed change per hour

  let wpmPoints = dataRecent.map((point) => +point.wpm);

  let trend = findLineByLeastSquares(wpmPoints);

  let wpmChange = trend[1][1] - trend[0][1];

  let delta = dataRecent.length * 30;

  let changeInWPMPerMinSigned = (wpmChange * (3600 / delta)).toFixed(2);

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

  let dateOfLastTest = moment(
    dataRecent[dataRecent.length - 1].timestamp
  ).format("Do [of] MMMM");

  let timeSinceLastTest =
    (new Date().getTime() -
      dataRecent[dataRecent.length - 1].timestamp.getTime()) /
    1000;

  let dateOfLastTestMessage =
    dateOfLastTest + " (" + createTimeMessage(timeSinceLastTest) + " ago)";

  // number of tests per day

  let firstTest = dataRecent[0];
  let lastTest = dataRecent[dataRecent.length - 1];

  let dayDiff =
    (lastTest.timestamp - firstTest.timestamp) / (1000 * 60 * 60 * 24);

  const testsPerDay = (dataRecent.length / dayDiff).toFixed(1);

  const totalTimeMessage = createTimeMessage(dataIn.length * 30, "HMS", 2);

  const dataToSave = {
    totalTimeMessage,
    dateOfLastTestMessage,
    maxWPM,
    avgWPM,
    avgACC,
    testsPerDay,
    PorNchange,
    changeInWPMPerMin,
    labels,
    data,
  };

  typingMain(dataToSave);
}

function typingMain(data) {
  showSymbols();

  plotMonkey(data.labels, data.data);

  document.getElementById("timeSinceLastTest").innerHTML =
    data.dateOfLastTestMessage;
  document.getElementById("highestTypingSpeed").innerHTML = data.maxWPM;
  document.getElementById("averageTypingSpeed").innerHTML = data.avgWPM;
  document.getElementById("averageAccuracy").innerHTML = data.avgACC;
  document.getElementById("totalTime").innerHTML = data.totalTimeMessage;
  document.getElementById("testsPerDay").innerHTML = data.testsPerDay;
  document.getElementById("wpmChangePerHour").innerHTML =
    data.PorNchange + data.changeInWPMPerMin;
}

function plotMonkey(labels, data) {
  let ctx = document.getElementById("monkeyChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data,
          backgroundColor: "#F4A4A4",

          fill: true,
        },
      ],
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
                label += context.parsed.y + " WPM";
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          maxTicksLimit: 6.3,
          ticks: {
            stepSize: 5,
            maxRotation: 0,
            minRotation: 0,
          },
        },

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
