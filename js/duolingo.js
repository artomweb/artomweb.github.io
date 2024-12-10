function parseDuo(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbTQbxWdJ6UPEfjqYtK-kjdLY1-aynlW8ZSzJNhxC98ie8S8oEvp-fTZrp-zfGWl4clOPsDMkbyh-0/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    processDuo(data); // Pass the relevant part of the data
  } catch (error) {
    console.log(
      "Error processing Duolingo data, trying the fallback URL:",
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
          processDuo(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          const chessCard = document.getElementById("duoCard");
          chessCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        const chessCard = document.getElementById("duoCard");
        chessCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

function processDuo(data) {
  data = data.sort((a, b) => a.date - b.date);
  // Find the highest grade
  const duoTotal = _.sumBy(data, "totalSessionTime");
  document.getElementById("duoTotal").innerHTML =
    Math.round(duoTotal / (60 * 60)) + " hours";

  // Total number of climbing sessions
  const lessonTotal = _.sumBy(data, "numLessons");
  document.getElementById("duoLessons").innerHTML = lessonTotal;

  let streak = 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].date - data[i].date < 86450) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("duoStreak").innerHTML = streak + " days";

  // Parse the date of the last game
  const lastLessonDate = new Date(data[data.length - 1].date * 1000); // Use the 'date' field

  // Format the date and calculate time ago
  const formattedDate = formatDate(lastLessonDate);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(lastLessonDate)})`;
  document.getElementById("timeSinceLastDuo").innerHTML = dateOfLastTestMessage;

  //   // data = data.slice(Math.max(data.length - 12, 0));

  const labels = data.map((d) => new Date(d.date * 1000)); // Dates as labels
  const graphData = data.map((item) =>
    Math.max(1, Math.round(item.totalSessionTime / 60))
  );

  plotDuo(labels, graphData);
}

function plotDuo(labels, data) {
  const ctx = document.getElementById("duoChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: "#81b29a",
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return formatDate(tooltipItem[0].label);
            },
            label: function (context) {
              let label = context.dataset.label || "";

              if (context.parsed.y !== null) {
                if (context.parsed.y === 1) {
                  label += "1 minute";
                } else {
                  label += context.parsed.y + " minutes";
                }
              }
              return label;
            },
          },
        },
      },
      responsive: true,

      scales: {
        x: {
          ticks: {
            callback: function (value, index, ticks) {
              const tickDate = new Date(labels[index]);
              return tickDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });

              //   tickDate.toLocaleString("en-US", {
              //     month: "short",
              //     year: "numeric",
              //   });
            },
            maxTicksLimit: 3,
          },
        },
        y: {
          title: {
            text: "Time spent (mins)",
            display: true,
          },
        },
      },
    },
  });
}
