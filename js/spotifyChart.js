let spotifyData;
let mySpotifyChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

function parseSpotify(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSw3m_yyTByllweTNnIM13oR_P4RSXG2NpF3jfYKpmPtsS8a_s8qA7YIOdzaRgl6h5b2TSaY5ohuh6J/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    useSpotifyData(data); // Pass the relevant part of the data
  } catch (error) {
    console.log(
      "Error processing Spotify data, trying the fallback URL:",
      error
    );
    parseCSV(fallbackUrl); // Fall back to CSV if processing fails
  }

  // Function to parse CSV data with PapaParse for the fallback URL
  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          useSpotifyData(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let spotifyCard = document.getElementById("spotifyCard");
          spotifyCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let spotifyCard = document.getElementById("spotifyCard");
        spotifyCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

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

function useSpotifyData(dataIn) {
  spotifyData = updateSpotify(dataIn);

  spotifyChart();
  spotifyToggle();
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
  dat.sort((a, b) => b.Date - a.Date);

  // Slice to get the most recent 14 items (last two weeks)
  const recentData = dat.slice(0, 14);

  // Reverse to make it ascending order (oldest first)
  recentData.reverse();

  let rawLabels = recentData.map((e) => {
    const date = new Date(e.Date); // Create a Date object from e.Date
    return date.toLocaleString("default", { month: "short", day: "numeric" }); // Format as "Oct 14"
  });

  let rawData = recentData.map((e) => {
    return e.Value;
  });

  let data = rawData;
  let labels = rawLabels;

  return { data, labels };
}

function getAllWeeks(dat) {
  // Get the current date and subtract 3 years
  let twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 3);

  dat = dat.filter((d) => {
    const date = new Date(d.Date); // Convert d.Date to a Date object
    return date >= twoYearsAgo; // Check if the date is on or after twoYearsAgo
  });

  let weekAvg = _.chain(dat)
    .groupBy((d) => {
      const date = new Date(d.Date);
      return `${date.toLocaleString("default", {
        month: "short",
      })}-${date.getFullYear()}`; // Format to "MMM-YYYY"
    })
    .map((entries, week) => ({
      wofy: week,
      avg: _.sumBy(entries, (entry) => +entry.Value),
    }))
    .value();

  weekAvg.sort((a, b) => {
    // Create a Date object from the formatted string
    const dateA = new Date(`${a.wofy}-01`); // Add a day to create a valid date
    const dateB = new Date(`${b.wofy}-01`); // Add a day to create a valid date
    return dateA - dateB; // Sort by date
  });

  let labels = weekAvg.map((w) => w.wofy);
  let data = weekAvg.map((w) => w.avg);

  return { data, labels };
}

function getByDay(dat) {
  let totalAvgs = _.chain(dat)
    .map((d) => {
      const date = new Date(d.Date); // Create a Date object
      const options = { weekday: "short" }; // Define options for weekday formatting
      const day = date.toLocaleDateString("en-US", options); // Get the short weekday name
      return { ...d, dofw: day };
    })
    .groupBy("dofw")
    .map((entries, day) => ({
      dofw: day,
      avg: Math.round(_.meanBy(entries, (entry) => entry.Value)),
    }))
    .value();

  // Define a function to get ISO weekday (1-7 for Monday-Sunday)
  const getIsoWeekday = (day) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.indexOf(day) + 1; // Convert to 1-7
  };

  // Sort totalAvgs based on ISO weekday
  totalAvgs = _.sortBy(totalAvgs, (o) => {
    return getIsoWeekday(o.dofw);
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

  let dateOfLastTest = formatDate(parsed[0].Date);

  let dateOfLastTestMessage =
    dateOfLastTest + " (" + timeago(parsed[0].Date) + ")";

  document.getElementById("timeSinceLastSong").innerHTML =
    dateOfLastTestMessage;

  let byDay = getByDay(parsed);
  let lastTwoWeeks = getLastTwoWeeks(parsed);
  let byWeek = getAllWeeks(parsed);

  const dataToSave = { byDay, byWeek, lastTwoWeeks };

  return dataToSave;
}
