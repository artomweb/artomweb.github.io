let spotifyData;
let mySpotifyChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

function getPapaParseSpotify() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSw3m_yyTByllweTNnIM13oR_P4RSXG2NpF3jfYKpmPtsS8a_s8qA7YIOdzaRgl6h5b2TSaY5ohuh6J/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // gamesMain(results.data);
        parseSpotify(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, spotify");
      },
    }
  );
}

getPapaParseSpotify();

// changes the description to the relevant text and changes the fill of the circles
function switchSpotifyDots() {
  let circles = Array.from(document.getElementsByClassName("spotifyCircles"));
  let desc = document.getElementById("spotify-desc");

  switch (toggleState) {
    case 0:
      desc.innerHTML = "On average, which days do I listen to the most music";
      break;
    case 1:
      desc.innerHTML =
        "How many songs have I listened to in the last two weeks";
      break;
    case 2:
      desc.innerHTML = "Each month, for the last two years";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == toggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

// updates the chart, calls the function to update the text and switch the dots and LASTLY increments the toggleState
function spotifyToggle() {
  switchSpotifyDots();
  switch (toggleState) {
    case 0:
      updateByDay();
      break;

    case 1:
      updateTwoWeeks();
      break;

    case 2:
      updateAllData();
      break;
  }
  toggleState == 2 ? (toggleState = 0) : toggleState++;
}

function parseSpotify(dataIn) {
  spotifyData = updateSpotify(dataIn);

  spotifyChart();
  spotifyToggle();
}

function createDatabase(dataIn) {
  let dataOut = {};
  dataOut.lastTwoWeeks = getLastTwoWeeks(dataIn);
  return dataOut;
}

// update the chart to show the data, aggregated by day, BAR CHART
function updateByDay() {
  const { data, labels } = spotifyData.byDay;

  mySpotifyChart.destroy();
  let temp = { ...config };

  temp.type = "bar";

  temp.data.labels = labels;

  let newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor,
    // fill: false,
  };
  temp.data.datasets = [newDataset];

  temp.options.scales.x = { offset: true };

  mySpotifyChart.options.scales.y = {
    title: {
      text: "Average songs played",
      display: true,
    },
  };

  mySpotifyChart = new Chart(ctx2, temp);
}

// update the chart to show the data, for the last two weeks, LIN CHART
function updateTwoWeeks() {
  let { data, labels } = spotifyData.lastTwoWeeks;

  labels = labels.map((l) => new Date(l));

  let newDataset = {
    tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor,
    fill: true,
  };

  mySpotifyChart.destroy();
  let temp = { ...config };

  temp.type = "line";

  temp.data.labels = labels;

  temp.data.datasets = [newDataset];

  temp.options.scales = {
    x: {
      ticks: {
        maxTicksLimit: 6.3,
      },
      type: "time",
      time: {
        tooltipFormat: "dd-MM-yyyy",
      },
    },

    y: {
      title: {
        text: "Total songs played",
        display: true,
      },
      ticks: {
        beginAtZero: true,
      },
    },
  };

  mySpotifyChart = new Chart(ctx2, temp);
}

// update the chart to show the data, aggregated by week, LINE CHART
function updateAllData() {
  let { data, labels } = spotifyData.byWeek;
  let newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor,
    fill: true,
  };
  // console.log(values);

  mySpotifyChart.data.labels = labels;

  mySpotifyChart.data.datasets = [newDataset];

  mySpotifyChart.options.scales = {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 4,
        maxRotation: 0,
        minRotation: 0,
      },
    },
  };

  mySpotifyChart.options.scales.y = {
    title: {
      text: "Total songs played",
      display: true,
    },
  };

  //   console.log(mySpotifyChart.data.datasets);

  mySpotifyChart.update();
}

// plot the template chart
function spotifyChart() {
  // let rawData = [589, 445, 483, 503, 689, 692, 634];
  // let labels = ["S", "M", "T", "W", "T", "F", "S"];

  //   console.log(currData);

  ctx2 = document.getElementById("spotifyChart").getContext("2d");
  config = {
    type: "line",
    data: {
      // labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          // data: rawData,
          backgroundColor,
          // fill: false,
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
                if (toggleState == 1) {
                  label += context.parsed.y + " average";
                } else {
                  label += context.parsed.y + " songs";
                }
              }
              return label;
            },

            title: function (context) {
              let title = context[0].label;
              if (toggleState == 1) {
                title = moment(title, "dd").format("dddd");
              }

              return title;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          // ticks: {
          // min: 5,
          // },
        },
      },
    },
  };
  mySpotifyChart = new Chart(ctx2, config);
}

function getLastTwoWeeks(dat) {
  let rawLabels = dat.map((e) => {
    return e.Date;
  });

  let rawData = dat.map((e) => {
    return e.Value;
  });

  let data = rawData.slice(0, 14);
  let labels = rawLabels.slice(0, 14);

  return { data, labels };
}

function getAllWeeks(dat) {
  let twoYearsAgo = moment().subtract(3, "years");
  dat = dat.filter((d) => {
    return moment(d.Date).isSameOrAfter(twoYearsAgo);
  });
  let weekAvg = _.chain(dat)
    .groupBy((d) => {
      return moment(d.Date).format("MMM-YYYY");
    })
    .map((entries, week) => ({
      wofy: week,
      avg: _.sumBy(entries, (entry) => +entry.Value),
    }))
    .value();

  weekAvg.sort(
    (a, b) => moment(a.wofy, "MMM-YYYY") - moment(b.wofy, "MMM-YYYY")
  );

  let labels = weekAvg.map((w) => w.wofy);
  let data = weekAvg.map((w) => w.avg);

  return { data, labels };
}

function getByDay(dat) {
  let totalAvgs = _.chain(dat)
    .map((d) => {
      let day = moment(d.Date).format("dd");
      return { ...d, dofw: day };
    })
    .groupBy("dofw")
    .map((entries, day) => ({
      dofw: day,
      avg: Math.round(_.meanBy(entries, (entry) => entry.Value)),
    }))
    .value();

  totalAvgs = _.sortBy(totalAvgs, (o) => {
    return moment(o.dofw, "dd").isoWeekday();
  });

  let labels = totalAvgs.map((val) => val.dofw);
  let data = totalAvgs.map((val) => val.avg);

  return { data, labels };
}

function parseSpotifyDates(results) {
  let dateParse = results.map((elem) => {
    return {
      Date: new Date(elem.Date),
      Value: +elem.Value,
    };
  });

  spotifyData = dateParse.sort(function (a, b) {
    return b.Date.getTime() - a.Date.getTime();
  });

  return spotifyData;
}

function updateSpotify(dataIn) {
  let parsed = parseSpotifyDates(dataIn);

  let dateOfLastTest = moment(parsed[0].Date).format("Do [of] MMMM");

  let timeSinceLastTest =
    (new Date().getTime() - parsed[0].Date.getTime()) / 1000;

  let dateOfLastTestMessage =
    dateOfLastTest + " (" + createTimeMessage(timeSinceLastTest) + " ago)";

  document.getElementById("timeSinceLastSong").innerHTML =
    dateOfLastTestMessage;

  let byDay = getByDay(parsed);
  let lastTwoWeeks = getLastTwoWeeks(parsed);
  let byWeek = getAllWeeks(parsed);

  const dataToSave = { byDay, byWeek, lastTwoWeeks };

  return dataToSave;
}
