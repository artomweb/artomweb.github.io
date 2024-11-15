function parseClimbing(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    processClimbing(data); // Pass the relevant part of the data
  } catch (error) {
    console.log(
      "Error processing climbing data, trying the fallback URL:",
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
          processClimbing(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let chessCard = document.getElementById("chessCard");
          chessCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let chessCard = document.getElementById("chessCard");
        chessCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // Months are zero-based
}

function processClimbing(data) {
  // Find the highest grade
  let highestGrade = _.maxBy(data, "bestGrade").bestGrade;
  document.getElementById("highestGrade").innerHTML = highestGrade;

  // Total number of climbing sessions
  document.getElementById("climbingSessions").innerHTML = data.length;

  // Parse the date of the last game
  const lastGameDateStr = data[data.length - 1].date; // Use the 'date' field
  const dateOfLastGame = parseDate(lastGameDateStr); // Parse into a Date object

  // Format the date and calculate time ago
  const formattedDate = formatDate(dateOfLastGame);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(dateOfLastGame)})`;
  document.getElementById("timeSinceLastClimb").innerHTML =
    dateOfLastTestMessage;

  // data = data.slice(Math.max(data.length - 12, 0));

  // Prepare data for plotting
  const labels = data.map((item) => parseDate(item.date)); // Dates as labels
  const attempts = data.map((item) => item.attemptsCount);
  const successes = data.map((item) => item.sucessesCount);
  const flashes = data.map((item) => item.flashesCount);
  const bestGrade = data.map((item) => item.bestGrade);

  plotClimbing(labels, { attempts, successes, flashes, bestGrade });
}

function plotClimbing(labels, datasets) {
  const ctx = document.getElementById("climbingChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Flashes",
          data: datasets.flashes,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          stack: "Stack 0",
        },
        {
          label: "Successes",
          data: datasets.successes,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          stack: "Stack 0",
        },
        {
          label: "Attempts",
          data: datasets.attempts,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          stack: "Stack 0",
        },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return formatDate(new Date(tooltipItem[0].label));
            },
          },
        },
        datalabels: {
          anchor: "end",
          align: "top",
          font: {
            weight: "bold",
          },

          formatter: function (value, context) {
            if (context.dataset.label == "Attempts") {
              const averageGrade = datasets.bestGrade[context.dataIndex]; // Get the corresponding average grade
              return averageGrade; // Display the average grade above the bar
            }
            return null;
          },
        },
      },
      responsive: true,

      scales: {
        x: {
          stacked: true,
          ticks: {
            callback: function (value, index, ticks) {
              const tickDate = new Date(labels[index]);
              return tickDate.toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              });
            },
            maxTicksLimit: 4,
          },
        },
        y: {
          stacked: false,
        },
      },
    },
  });
}
