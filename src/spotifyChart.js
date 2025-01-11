import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required components
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
let spotifyData;
let mySpotifyChart;
let config;
let toggleState = 0;
let ctx2;
const backgroundColor = "#81b29a";

export function parseSpotify(data) {
  const spotifyCard = document.getElementById("spotifyCard");
  document
    .getElementById("spotifyToggle")
    .addEventListener("click", spotifyToggle);

  if (!data || data?.error) {
    console.log("Error processing Spotify data");
    spotifyCard.style.display = "none"; // Hide the card if processing fails
  } else {
    try {
      showSpotifyData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Spotify data:", error);
      spotifyCard.style.display = "none"; // Hide the card if processing fails
    }
  }
}

function showSpotifyData(data) {
  document.getElementById("timeSinceLastSong").innerHTML =
    data.dateOfLastTestMessage;
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

function updateTwoWeeks() {
  const { data, labels } = spotifyData.lastTwoWeeks;

  const newDataset = {
    tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor,
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
  const { data, labels } = spotifyData.allWeeks;
  const newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: data,
    backgroundColor,
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
  ctx2 = document.getElementById("spotifyChart").getContext("2d");
  config = {
    type: "line",
    data: {
      datasets: [
        {
          backgroundColor,
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
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };
  mySpotifyChart = new Chart(ctx2, config);
}
