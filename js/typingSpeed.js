function fetchTyping() {
  fetch("https://rppi.artomweb.com/cache/data/typing")
    .then((res) => res.json())
    .then((out) => parseTyping(out))
    .catch((err) => {
      console.log("failed to fetch from cache, typing", err);
    });
}

fetchTyping();

function showSymbols() {
  let symbols = document.getElementsByClassName("symbol");

  for (let s of symbols) {
    s.style.display = "inline";
  }
}

function parseTyping(data) {
  showSymbols();

  plotMonkey(data.labels, data.data);

  document.getElementById("highestTypingSpeed").innerHTML = data.maxWPM;
  document.getElementById("averageTypingSpeed").innerHTML = data.avgWPM;
  document.getElementById("averageAccuracy").innerHTML = data.avgACC;
  document.getElementById("totalTime").innerHTML = data.totalTimeMessage;
  document.getElementById("testsPerDay").innerHTML = data.testsPerDay;
  document.getElementById("wpmChangePerHour").innerHTML = data.PorNchange + data.changeInWPMPerMin;
}

function plotMonkey(labels, data) {
  let ctx = document.getElementById("monkeyChart").getContext("2d");

  let sleepChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          data,
          backgroundColor: "#F4A4A4",

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
              //             callback: function(value, index, values) {
              //                 return secondsToMins(value);
              //             },
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
            label += tooltipItem.yLabel + " WPM";
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

// fetchMonkey();
