// https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv

const codData = {};
let codChart;
let codToggleState = 0;

function switchCodDots() {
  const circles = Array.from(document.getElementsByClassName("codCircles"));
  const desc = document.getElementById("cod-desc");

  switch (codToggleState) {
    case 0:
      desc.innerHTML =
        "Ben and I sometimes play Call of Duty together, who's winning? This graph shows the margin that either of us was winning by overall.";
      break;
    case 1:
      desc.innerHTML =
        "This graph shows who won the most games at each hour of the day.";
      break;
    case 2:
      desc.innerHTML = "This graph shows the number of games won per day.";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == codToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function codToggle() {
  switchCodDots();
  switch (codToggleState) {
    case 0:
      updateCodRunning();
      break;

    case 1:
      updateCodPerHour();
      break;

    case 2:
      updateCodNormal();
      break;
  }
  codToggleState == 2 ? (codToggleState = 0) : codToggleState++;
}

function parseCod(codData, codAllGamesData) {
  const fallbackUrlCod =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkxuvS6JNMaDdFtWzxpH4GN2g7DDOVjM0fkjv9QviwwTFBYP_Y6F2g9Thdf2Zer3DNzTQnNraaJt5a/pub?output=csv";
  const fallbackUrlAllGames =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkxuvS6JNMaDdFtWzxpH4GN2g7DDOVjM0fkjv9QviwwTFBYP_Y6F2g9Thdf2Zer3DNzTQnNraaJt5a/pub?output=csv&gid=1902563249";

  // Attempt to process the provided JSON data for cod and codAllGames
  try {
    processCod(codData, codAllGamesData); // Pass both datasets to processCod
  } catch (error) {
    console.log(
      "Error processing cod and codAllGames data, trying fallback URLs:",
      error
    );

    // Fetch the fallback for cod and codAllGames
    parseCSV(fallbackUrlCod, fallbackUrlAllGames);
  }

  // Function to parse CSV data with PapaParse for fallback URLs
  function parseCSV(urlCod, urlAllGames) {
    let codResults, allGamesResults; // Store results for both fetches

    // Fetch fallback for cod
    Papa.parse(urlCod, {
      download: true,
      header: true,
      complete: function (results) {
        codResults = results.data; // Store cod results

        // Now fetch fallback for codAllGames
        Papa.parse(urlAllGames, {
          download: true,
          header: true,
          complete: function (allGamesResultsData) {
            allGamesResults = allGamesResultsData.data; // Store codAllGames results

            try {
              // Process both datasets from the fallbacks
              processCod(codResults, allGamesResults);
            } catch (error) {
              console.log("Error processing fallback CSV data:", error);
              const CODCard = document.getElementById("CODCard");
              CODCard.style.display = "none"; // Hide the card if processing fails
            }
          },
          error: function (error) {
            console.log(
              "Failed to fetch data from codAllGames fallback URL:",
              error
            );
            const CODCard = document.getElementById("CODCard");
            CODCard.style.display = "none"; // Hide the card if fetching fails
          },
        });
      },
      error: function (error) {
        console.log("Failed to fetch data from cod fallback URL:", error);
        const CODCard = document.getElementById("CODCard");
        CODCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

// Example usage of the function
// parseCodAndAllGames(codData, codAllGamesData);

function processCod(cod, allGames) {
  updateCodData(cod, allGames);

  drawCodChart();
  codToggle();
}

function updateCodData(data, allGames) {
  const hourlyData = {};
  // Iterate through the allGames array to populate hourlyData
  allGames.forEach((game) => {
    const date = new Date(+game.UnixTimestamp * 1000); // Parse the date string
    const hour = date.getHours(); // Get the hour of the game
    // Initialize the hour if it doesn't exist
    if (!hourlyData[hour]) {
      hourlyData[hour] = { A: 0, B: 0, total: 0 }; // A and B winners and total games
    }
    // Increment counts based on the winner
    if (game.Winner === "A") {
      hourlyData[hour].A++;
    } else if (game.Winner === "B") {
      hourlyData[hour].B++;
    }
    // Increment the total games for the hour
    hourlyData[hour].total++;
  });
  // Prepare arrays for hours and win percentages
  const hours = [];
  const winPercentagesA = [];
  const winPercentagesB = [];
  // Calculate percentages for each hour
  for (let hour = 0; hour < 24; hour++) {
    if (hourlyData[hour]) {
      hours.push(hour); // Add hour to the array
      const { A, B, total } = hourlyData[hour];
      const percentageA = total > 0 ? (A / total) * 100 : 0; // Win percentage for A
      const percentageB = total > 0 ? (B / total) * 100 : 0; // Win percentage for B
      winPercentagesA.push(Math.round(percentageA)); // Add to percentages array for A
      winPercentagesB.push(Math.round(-percentageB)); // Add to percentages array for B
    } else {
      hours.push(hour); // Add hour even if no games were played
      winPercentagesA.push(0); // No wins for A
      winPercentagesB.push(0); // No wins for B
    }
  }
  codData.hourView = { winPercentagesA, winPercentagesB, hours };

  const winCountsByDate = {};

  allGames.forEach((game) => {
    const date = new Date(+game.UnixTimestamp * 1000);
    const formattedDate = date.toLocaleDateString("en-GB"); // Format as dd/mm/yyyy

    // Initialize the entry if it doesn't exist
    if (!winCountsByDate[formattedDate]) {
      winCountsByDate[formattedDate] = { A: 0, B: 0 };
    }

    // Increment counts based on the winner
    if (game.Winner === "A") {
      winCountsByDate[formattedDate].A++;
    } else if (game.Winner === "B") {
      winCountsByDate[formattedDate].B++;
    }
  });

  for (const date in winCountsByDate) {
    const { A, B } = winCountsByDate[date];

    // Append the new data to the existing data array
    data.push({
      Date: date,
      Archie: A, // Wins for Archie (A)
      Ben: B, // Wins for Ben (B)
    });
  }

  data.forEach((day) => {
    day.Archie = +day.Archie;
    day.Ben = +day.Ben;
    const [d, month, year] = day.Date.split("/");
    const date = new Date(year, month - 1, d);
    day.jsDate = date;
  });

  const dataArchie = data.map((e) => e.Archie);
  const dataBen = data.map((e) => -e.Ben);

  const labels = data.map((e) => e.Date);

  codData.normalView = { dataArchie, dataBen, labels };

  data.forEach((day, idx) => {
    day.runningTotal = data[idx - 1] ? data[idx - 1].runningTotal : 0;
    day.runningTotal += day.Archie;
    day.runningTotal -= day.Ben;
  });

  const runningData = data.map((e) => e.runningTotal);

  codData.runningView = { runningData, labels };

  const totalArchie = _.sumBy(data, "Archie");
  document.getElementById("numGamesArchie").innerHTML = totalArchie;
  const totalBen = _.sumBy(data, "Ben");
  document.getElementById("numGamesBen").innerHTML = totalBen;
  // console.log(data);

  const lastDateString = data[data.length - 1].Date;
  const [day, month, year] = lastDateString.split("/").map(Number);
  const dateOfLastTest = new Date(year, month - 1, day);
  dateOfLastTest.setHours(8, 0, 0, 0); // Sets the time to 08:00

  const formattedDate = formatDate(dateOfLastTest);

  // Construct the final message
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data[data.length - 1].jsDate
  )})`;

  document.getElementById("timeSinceLastCod").innerHTML = dateOfLastTestMessage;
}

function updateCodPerHour() {
  console.log("per hour");
  const { winPercentagesA, winPercentagesB, hours } = codData.hourView;

  codChart.data.labels = hours;
  codChart.data.datasets = [
    {
      label: "Archie",
      data: winPercentagesA,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: winPercentagesB,
      backgroundColor: "#F4A4A4",
      borderColor: "#F4A4A4",
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Win %",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };
  codChart.options.scales.x = {
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        return value + ":00";
      },
    },
  };

  codChart.update();
}

function updateCodNormal() {
  const { dataArchie, dataBen, labels } = codData.normalView;

  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Archie",
      data: dataArchie,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: dataBen,
      backgroundColor: "#F4A4A4",
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Score",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  codChart.update();
}

function updateCodRunning() {
  const { runningData, labels } = codData.runningView;
  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Margin",
      data: runningData,
      showLine: false,

      fill: {
        target: "origin",
        above: "#8ecae6", // Area will be red above the origin
        below: "#F4A4A4", // And blue below the origin
      },
      pointBackgroundColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
      pointBorderColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
    },
    { label: "Archie", data: [], backgroundColor: "#8ecae6" },
    { label: "Ben", data: [], backgroundColor: "#F4A4A4" },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Winning margin",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.scales.x = {
    ticks: {
      maxTicksLimit: 4,
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  // codChart.options.plugins.legend = {
  //   display: false,
  // };

  codChart.update();
}

function drawCodChart() {
  const ctx = document.getElementById("CODChart").getContext("2d");

  codChart = new Chart(ctx, {
    type: "line",

    options: {
      maintainAspectRatio: true,
      responsive: true,

      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += " " + Math.abs(context.parsed.y);
              }
              if (codToggleState == 2) {
                label += "%";
              }
              return label;
            },
            title: function (context) {
              let title = context[0].label;
              if (codToggleState == 2) {
                title += ":00";
              }
              return title;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 4,
          },
        },

        y: {
          ticks: {
            beginAtZero: true,
            callback: function (value, index, values) {
              if (value % 1 == 0) {
                return Math.abs(value);
              }
            },
          },
        },
      },
    },
  });
}
