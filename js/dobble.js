function fetchDobble() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwLrwjE_FFzRj2Sq9S3-8MQDfpnGchacJGkM1s6Oidsswu82E4jBewlVWCNA4CwW9K3EauyYYlNfTL/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // console.log(results.data);
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
  let totalTime = 0;
  dataIn.forEach((elt) => {
    elt.timestamp = new Date(+elt.unix * 1000);
    elt.score = +elt.score;
    totalTime += +elt.testTime;
  });

  const numTests = dataIn.length;

  let weekAvg = _.chain(dataIn)
    .groupBy((d) => {
      return moment(d.timestamp).format("MMM YY");
    })
    .map((entries, week) => {
      return {
        mofy: week,
        avg: Math.round(_.meanBy(entries, (entry) => entry.score) * 10) / 10,
        // avg: Math.round(_.maxBy(entries, "score").score * 10) / 10,
      };
    })
    .value();

  if (weekAvg.length > 20) {
    const step = Math.round(weekAvg.length / 20); // Calculate step size, limit to n
    weekAvg = weekAvg.filter((_, index) => index % step === 0); // Keep points at regular intervals
  }

  const labels = weekAvg.map((el) => el.mofy);
  const data = weekAvg.map((el) => el.avg);

  const maxScore = _.maxBy(dataIn, "score").score;
  const timeMessage = createTimeMessage(totalTime, true);
  // console.log(timeMessage);

  document.getElementById("dobbleTime").innerHTML = timeMessage;

  document.getElementById("highestDobble").innerHTML = maxScore;
  document.getElementById("numberDobble").innerHTML = numTests;

  // console.log(maxScore);

  let ctx = document.getElementById("dobbleChart").getContext("2d");

  config = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,
          // borderColor: "black",
          data: data,
          backgroundColor: "#8ecae6",
          fill: true,
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
                label += "Average was " + context.parsed.y;
              }
              return label;
            },

            title: function (context) {
              let title = context[0].label;
              return title;
            },
          },
        },
      },
      scales: {
        y: {
          title: {
            text: "Average score",
            display: true,
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },

        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 5.1,
          },
        },
      },
    },
  };
  new Chart(ctx, config);
}
