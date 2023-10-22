function fetchSteps() {
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vROtCGD-KzCzJv5qxhMlSyXFBDC27Jxw9g5jqJfaXzw0IsPMDiKm0BWwjNpIETmhfjPhWRv2qzhztC1/pub?output=csv", {
    download: true,
    header: true,
    complete: function (results) {
      // gamesMain(results.data);
      console.log(results.data);
      processSteps(results.data);
    },
    error: function (error) {
      console.log("failed to fetch from cache, games");
    },
  });
}

fetchSteps();

function processSteps(dataIn) {
  dataIn.forEach((elt) => {
    elt.timestamp = moment(+elt.unix * 1000);
  });

  dataIn = _.sortBy(dataIn, "timestamp");

  let dayGroup = _.chain(dataIn)
    .groupBy((d) => {
      return d.timestamp.format("DD MMM YYYY");
    })
    .map((entries, week) => {
      return {
        timestamp: entries[0].timestamp,
        dofw: week,
        sum: _.sumBy(entries, (entry) => +entry.steps),
      };
    })
    .value();

  let maxStepsDay = _.maxBy(dayGroup, "sum");

  document.getElementById("mostStepsInDay").innerHTML = maxStepsDay.timestamp.format("Do [of] MMMM YYYY") + " (" + numberWithCommas(maxStepsDay.sum) + " steps)";

  let dateOfLastTest = dayGroup[dayGroup.length - 2].timestamp.format("Do [of] MMMM");

  let timeSinceLastTest = (new Date().getTime() - dayGroup[dayGroup.length - 2].timestamp.unix() * 1000) / 1000;

  let dateOfLastTestMessage = dateOfLastTest + " (" + createTimeMessage(timeSinceLastTest, "DH", 1) + " ago)";

  console.log(dateOfLastTestMessage);

  document.getElementById("timeSinceLastTestSteps").innerHTML = dateOfLastTestMessage;

  let weekGroup = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YYYY");
    })
    .map((entries, week) => {
      // console.log(entries);
      return {
        wofy: week,
        sum: _.sumBy(entries, (entry) => +entry.steps),
      };
    })
    .value();

  weekGroup.sort((a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY"));

  const labels = weekGroup.map((el) => el.wofy);
  const data = weekGroup.map((el) => el.sum);

  let ctx = document.getElementById("stepsChart").getContext("2d");

  let stepsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          data,
          backgroundColor: "#8ecae6",

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
              // beginAtZero: true,
              callback: function (value, index, values) {
                return numberWithCommas(value);
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
            label += numberWithCommas(tooltipItem.yLabel) + " Steps";
            return label;
          },
        },
      },
    },
  });
}
