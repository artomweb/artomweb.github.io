// https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv

function fetchClimbing() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // console.log(results.data);
        processClimbing(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, climbing");
        let climbingCard = document.getElementById("climbingCard");
        climbingCard.style.display = "none";
      },
    }
  );
}

fetchClimbing();

function processClimbing(data) {
  console.log(data);

  data.forEach((elt) => {
    elt.timestamp = moment(elt.date, "DD/MM/YYYY").hour(10);
  });

  data = _.sortBy(data, "timestamp");

  let highestGrade = _.maxBy(data, "bestGrade").bestGrade;

  document.getElementById("highestGrade").innerHTML = highestGrade;
  document.getElementById("climbingSessions").innerHTML = data.length;

  let dateOfLastTest = data[data.length - 1].timestamp;

  console.log(dateOfLastTest.unix());
  console.log(new Date().getTime());

  let timeSinceLastTest = new Date().getTime() / 1000 - dateOfLastTest.unix();

  console.log(timeSinceLastTest);

  let dateOfLastTestMessage =
    dateOfLastTest.format("Do [of] MMMM") +
    " (" +
    createTimeMessage(timeSinceLastTest, "DH", 1) +
    " ago)";

  console.log(dateOfLastTestMessage);

  document.getElementById("timeSinceLastClimb").innerHTML =
    dateOfLastTestMessage;

  let labels = data.map((elt) => elt.date);
  let graphData = data.map((elt) => elt.bestGrade[1]);

  console.log(labels);
  console.log(graphData);

  plotClimbing(labels, graphData);
}

function plotClimbing(labels, data) {
  let ctx = document.getElementById("climbingChart").getContext("2d");

  let climbingChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          data,
          backgroundColor: "#81b29a",

          // fill: false,
        },
      ],
    },
    options: {
      maintainAspectRatio: true,
      responsive: true,

      // layout: {
      //     padding: {
      //         left: 0,
      //         right: 25,
      //         top: 20,
      //         bottom: 20,
      //     },
      // },

      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              // autoSkip: true,
              maxTicksLimit: 6.3,
              stepSize: 5,
              maxRotation: 0,
              minRotation: 0,
            },
            // type: "time",
            // time: {
            //     unit: "week",
            //     round: "week",
            //     displayFormats: {
            //         day: "W-YYYY",
            //     },
            // },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                if (value % 1 === 0) {
                  return "V" + value;
                }
              },
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";
            label += "V" + tooltipItem.yLabel;
            return label;
          },
          //         title: function(tooltipItem, data) {
          //             let title = tooltipItem[0].xLabel;
          //             title = moment(title, "dd").format("dddd");
          //             return title;
          //         },
        },
      },
    },
  });
}
