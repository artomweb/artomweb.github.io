function showGraphs() {
  init();
  stepsInit();
  spotifyInit();
  hrInit();
}

var sleepSheet =
  "https://docs.google.com/spreadsheets/d/1TqN1Lsj9MxGrfsVrmywdFkLdW3zbqU75zjyslvIRHNM/edit?usp=sharing";

function init() {
  Tabletop.init({
    key: sleepSheet,
    callback: showInfo,
    simpleSheet: true,
  });
}

function showInfo(data, tabletop) {
  showSleepGraph(data);
}

window.addEventListener("DOMContentLoaded", showGraphs);

function secondsToMins(e) {
  let hours = (e / 3600).toString();
  let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
  minutes = ("0" + minutes).slice(-2);
  return hours.split(".")[0] + ":" + minutes;
}

function showSleepGraph(allData) {
  //   allData = inData.data;

  allData.sort(function (a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  if (allData.length > 7) {
    allData = allData.slice(0, 7);
  }

  let labels = allData.map(function (e) {
    return new Date(e.Date);
  });

  let data = allData.map(function (e) {
    return e.Duration;
  });

  let ctx = document.getElementById("sleep").getContext("2d");
  let myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,
          data: data,
          backgroundColor: colors[0],
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: true,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
              round: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return secondsToMins(value);
              },
            },
          },
        ],
      },

      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";

            if (label) {
              label += ": ";
            }

            label += secondsToMins(tooltipItem.yLabel);
            return label;
          },
        },
      },
    },
  });
}

var stepsSheet =
  "https://docs.google.com/spreadsheets/d/15PbAyFyxjhlkCjpsk-VR2v1KsRIQCydOISzUBg88O9o/edit?usp=sharing";

function stepsInit() {
  Tabletop.init({
    key: stepsSheet,
    callback: showInfo2,
    simpleSheet: true,
  });
}

function showInfo2(data, tabletop) {
  showStepsGraph(data);
}

function showStepsGraph(allData) {
  //   let allData = inData.data;

  allData.sort(function (a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  if (allData.length > 7) {
    allData = allData.slice(0, 7);
  }

  let labels = allData.map(function (e) {
    return new Date(e.Date);
  });

  let data = allData.map(function (e) {
    return e.Steps;
  });

  let ctx2 = document.getElementById("steps").getContext("2d");
  let myChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,

          data: data,
          backgroundColor: colors[1],
        },
      ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
              round: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

// Spotify

var spotifySheet =
  "https://docs.google.com/spreadsheets/d/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/edit?usp=sharing";

function spotifyInit() {
  Tabletop.init({
    key: spotifySheet,
    callback: showInfoSpotify,
    simpleSheet: true,
  });
}

function showInfoSpotify(data, tabletop) {
  showSpotifyGraph(data);
}

function showSpotifyGraph(allData) {
  //   let allData = inData.data;

  allData.sort(function (a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  if (allData.length > 7) {
    allData = allData.slice(0, 7);
  }

  let labels = allData.map(function (e) {
    return new Date(e.Date);
  });

  let data = allData.map(function (e) {
    // return e.Duration;
    return e.Value;
  });

  let ctx2 = document.getElementById("spotify").getContext("2d");
  let myChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,

          data: data,
          backgroundColor: colors[2],
        },
      ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
              round: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";

            if (label) {
              label += ": ";
            }

            label += tooltipItem.yLabel + " songs";
            return label;
          },
        },
      },
    },
  });
}

var hrSheet =
  "https://docs.google.com/spreadsheets/d/1KsHEkF63AQaFQT5Ed0KidRiOewfqT3R40eufufjlGWE/edit?usp=sharing";

function hrInit() {
  Tabletop.init({
    key: hrSheet,
    callback: showInfoHr,
    simpleSheet: true,
  });
}

function showInfoHr(data, tabletop) {
  console.log(data);
  showHrGraph(data);
}

function showHrGraph(allData) {
  //   let allData = inData.data;

  allData.sort(function (a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  if (allData.length > 7) {
    allData = allData.slice(0, 7);
  }

  let labels = allData.map(function (e) {
    return new Date(e.Date);
  });

  let data = allData.map(function (e) {
    return parseInt(e.Value);
  });

  let ctx2 = document.getElementById("hr").getContext("2d");
  let myChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,
          data: data,
          backgroundColor: colors[3],
        },
      ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
              round: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";

            if (label) {
              label += ": ";
            }

            label += tooltipItem.yLabel + "BPM";
            return label;
          },
        },
      },
    },
  });
}
