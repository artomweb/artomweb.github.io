function fetchHealth() {
  fetch("https://rppi.artomweb.com/cache/data/sleep")
    .then((res) => res.json())
    .then((out) => parseHealth(out))
    .catch((err) => {
      console.log("failed to fetch from cache, health", err);
    });
}

fetchHealth();

function parseHealth(results) {
  let { dataByDay, labels, sleepDaysTotal } = results;

  plotSleep(dataByDay, labels);

  let sleepDays = document.getElementById("sleepDaysTotal");

  sleepDays.innerHTML = sleepDaysTotal;
}

function secondsToMins(e) {
  let hours = (e / 3600).toString();
  let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
  minutes = ("0" + minutes).slice(-2);
  return hours.split(".")[0] + ":" + minutes;
}

function plotSleep(data, labels) {
  // let rawData = data.map((e) => e.SleepDuration);
  // let labels = data.map((e) => e.Date);
  let ctx = document.getElementById("sleepChart").getContext("2d");

  let sleepChart = new Chart(ctx, {
    type: "bar",
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
        // xAxes: [{
        //     type: "time",
        //     time: {
        //         unit: "day",
        //         round: "day",
        //         displayFormats: {
        //             day: "dd",
        //         },
        //     },
        // }, ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return secondsToMins(value);
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

            label += secondsToMins(tooltipItem.yLabel);
            return label;
          },
          title: function (tooltipItem, data) {
            let title = tooltipItem[0].xLabel;
            title = moment(title, "dd").format("dddd");
            return title;
          },
        },
      },
    },
  });
}
