import Chart from "./sharedChartjs.js";
import { formatDate, timeago } from "./usefullFunc.js";
let spotifyData;
let mySpotifyChart;
let config;
let toggleState = 0;
let ctx2;
import { green1, green2, green3 } from "./colours.js";

export function parseSpotify(data) {
  document
    .getElementById("spotifyToggle")
    .addEventListener("click", spotifyToggle);

  if (!data || data?.error) {
    console.log("Error processing Spotify data");
    document.getElementById("spotifyCard").classList.add("hidden");
  } else {
    try {
      showSpotifyData(data.data); // Pass the relevant part of the data
      document.getElementById("spotifyCard").classList.remove("hidden");
    } catch (error) {
      console.log("Error processing Spotify data:", error);
      document.getElementById("spotifyCard").classList.add("hidden");
    }
  }
}

function showSpotifyData(data) {
  const formattedDate = formatDate(data.dateOfLastTest);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastTest
  )})`;
  document.getElementById("timeSinceLastSong").innerHTML =
    dateOfLastTestMessage;
  spotifyData = data;
  spotifyChart();
  spotifyToggle();
}

// changes the description to the relevant text and changes the fill of the circles
function switchSpotifyDots() {
  const circles = Array.from(document.getElementsByClassName("spotifyCircles"));
  const desc = document.getElementById("spotify-desc");

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

function useSpotifyData(dataIn) {
  spotifyData = updateSpotify(dataIn);

  spotifyChart();
  spotifyToggle();
}

// update the chart to show the data, aggregated by day, BAR CHART
function updateByDay() {
  const { data, labels } = spotifyData.byDay;

  mySpotifyChart.destroy();
  const temp = { ...config };

  temp.type = "bar";

  temp.data.labels = labels;

  const newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor: green2,
    // fill: false,
  };
  temp.data.datasets = [newDataset];

  temp.options.scales.x = {
    offset: true,
    ticks: {
      color: green1, // X-axis number color
    },
  };

  mySpotifyChart.options.scales.y = {
    title: {
      text: "Average songs played",
      display: true,
      color: green1,
    },
    grid: {
      color: green3, // Grid line color for X-axis
    },
    ticks: {
      color: green1, // X-axis number color
    },
  };

  mySpotifyChart = new Chart(ctx2, temp);
}

function updateTwoWeeks() {
  const { data, labels } = spotifyData.lastTwoWeeks;

  const newDataset = {
    tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor: green2,
    fill: true,
  };

  mySpotifyChart.destroy();
  const temp = { ...config };

  temp.type = "line";

  temp.data.labels = labels;

  temp.data.datasets = [newDataset];

  temp.options.scales = {
    x: {
      ticks: {
        maxTicksLimit: 6.3,
        color: green1,
      },
    },

    y: {
      title: {
        text: "Total songs played",
        display: true,
        color: green1,
      },
      ticks: {
        beginAtZero: true,
        color: green1,
      },
    },
  };

  mySpotifyChart = new Chart(ctx2, temp);
}

// update the chart to show the data, aggregated by week, LINE CHART
function updateAllData() {
  const { data, labels } = spotifyData.allWeeks;
  const newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor: green2,
    fill: true,
  };

  mySpotifyChart.data.labels = labels;

  mySpotifyChart.data.datasets = [newDataset];

  mySpotifyChart.options.scales = {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 4,
        maxRotation: 0,
        minRotation: 0,
        color: green1,
      },
      grid: {
        color: green3, // Grid line color for X-axis
      },
    },
  };

  mySpotifyChart.options.scales.y = {
    title: {
      text: "Total songs played",
      display: true,
      color: green1,
    },
    ticks: {
      color: green1, // X-axis number color
    },
    grid: {
      color: green3, // Grid line color for X-axis
    },
  };

  //   console.log(mySpotifyChart.data.datasets);

  mySpotifyChart.update();
}

// plot the template chart
function spotifyChart() {
  ctx2 = document.getElementById("spotifyChart").getContext("2d");
  config = {
    type: "line",
    data: {
      datasets: [
        {
          backgroundColor: green2,
        },
      ],
    },

    options: {
      maintainAspectRatio: true,
      responsive: true,

      plugins: {
        datalabels: false,
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
          },
        },
      },
    },
  };
  mySpotifyChart = new Chart(ctx2, config);
}
