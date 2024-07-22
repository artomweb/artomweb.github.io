

function fetchClimbing() {
  const primaryUrl = "https://api.artomweb.com/climbing";
  const fallbackUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv";

  function parseCSV(url) {
      Papa.parse(url, {
          download: true,
          header: true,
          complete: function (results) {
              processClimbing(results.data);
          },
          error: function (error) {
              console.log("Failed to fetch climbing data from:", url);
              if (url === primaryUrl) {
                  console.log("Trying the fallback URL...");
                  parseCSV(fallbackUrl);
              } else {
                  // let climbingCard = document.getElementById("climbingCard");
                  // climbingCard.style.display = "none";
              }
          }
      });
  }

  // Try to fetch data from the primary URL first
  parseCSV(primaryUrl);
}

fetchClimbing();

function processClimbing(data) {
  // console.log(data);

  data.forEach((elt) => {
    elt.timestamp = moment(elt.date, "DD/MM/YYYY").hour(10);
  });

  data = _.sortBy(data, "timestamp");

  let highestGrade = _.maxBy(data, "bestGrade").bestGrade;

  document.getElementById("highestGrade").innerHTML = highestGrade;
  document.getElementById("climbingSessions").innerHTML = data.length;

  let dateOfLastTest = data[data.length - 1].timestamp;

  // console.log(dateOfLastTest.unix());
  // console.log(new Date().getTime());

  let timeSinceLastTest = new Date().getTime() / 1000 - dateOfLastTest.unix();

  // console.log(timeSinceLastTest);

  let dateOfLastTestMessage =
    dateOfLastTest.format("Do [of] MMMM") +
    " (" +
    createTimeMessage(timeSinceLastTest) +
    " ago)";

  // console.log(dateOfLastTestMessage);

  document.getElementById("timeSinceLastClimb").innerHTML =
    dateOfLastTestMessage;

  let labels = data.map((elt) => elt.date);
  let graphData = data.map((elt) => +elt.bestGrade[1]);

  // console.log(labels);
  // console.log(graphData);

  plotClimbing(labels, graphData);
}

function plotClimbing(labels, data) {
  let ctx = document.getElementById("climbingChart").getContext("2d");

  // console.log(data, labels);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,
          // borderColor: "black",
          data,
          backgroundColor: "#81b29a",
          fill: true,
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
                label += "V" + context.parsed.y;
              }
              return label;
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
          title: {
            text: "Highest grade",
            display: true,
          },
          beginAtZero: true,
          ticks: {
            callback: function (value, index, values) {
              if (value % 1 === 0) {
                return "V" + value;
              }
            },
          },
        },
      },
    },
  });
}
