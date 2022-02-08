async function fetchSolar() {
  fetch("https://rppi.artomweb.com/cache/data/solar")
    .then((res) => res.json())
    .then((out) => solarMain(out))
    .catch((err) => {
      console.log("failed to fetch from cache, solar", err);
    });
}

fetchSolar();

function solarMain(dat) {
  let { labels, data } = dat;

  labels = labels.map((l) => new Date(l));

  plotSolar(labels, data);
}

function plotSolar(labels, dat) {
  let ctx2 = document.getElementById("solarChart").getContext("2d");
  let config = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.2,
          // borderColor: "black",
          data: dat,
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
        xAxes: [
          {
            autoSkip: true,
            maxTicksLimit: 2,
            type: "time",
            time: {
              unit: "day",
              round: "day",
              displayFormats: {
                day: "dd",
              },
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            // let label = data.datasets[tooltipItem.datasetIndex].label || "";

            // console.log(tooltipItem);

            return (tooltipItem.yLabel += "k Watt Hours");
          },
        },
      },
    },
  };
  let myChart = new Chart(ctx2, config);
}
