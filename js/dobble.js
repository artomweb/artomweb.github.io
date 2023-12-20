function fetchDobble() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwLrwjE_FFzRj2Sq9S3-8MQDfpnGchacJGkM1s6Oidsswu82E4jBewlVWCNA4CwW9K3EauyYYlNfTL/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        console.log(results.data);
        plotDobble(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, driving");
        let drivingCard = document.getElementById("drivingCard");
        drivingCard.style.display = "none";
      },
    }
  );
}

fetchDobble();

function plotDobble(dataIn) {
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.unix * 1000);
    elt.score = +elt.score;
  });

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("DD MMM YYYY");
    })
    .map((entries, week) => {
      return {
        mofy: week,
        avg: Math.round(_.meanBy(entries, (entry) => entry.score) * 10) / 10,
      };
    })
    .value();

  console.log(dataIn);
  console.log(weekAvg);

  const labels = weekAvg.map((el) => el.mofy);
  const data = weekAvg.map((el) => el.avg);

  const maxScore = _.maxBy(dataIn, "score").score;

  document.getElementById("highestDobble").innerHTML = maxScore;

  console.log(maxScore);

  let ctx = document.getElementById("dobbleChart").getContext("2d");

  config = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          data: data,
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
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              // min: 5,
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

            label += tooltipItem.yLabel + " average";

            // label += tooltipItem.yLabel + (toggleState == 2 ? " average" : " songs");

            return label;
          },

          title: function (tooltipItem, data) {
            let title = tooltipItem[0].xLabel;
            // if (toggleState == 1) {
            //   title = moment(title, "dd").format("dddd");
            // }
            return title;
          },
        },
      },
    },
  };
  new Chart(ctx, config);
}
