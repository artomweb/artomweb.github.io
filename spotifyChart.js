let data;
let allDays = true;
let myChart;

async function newFetchSpotify() {
  const response = await fetch(
    "https://spreadsheets.google.com/feeds/list/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/1/public/full?alt=json"
  );

  const json = await response.json();

  data = json.feed.entry.map((elt) => {
    return {
      Date: elt.gsx$date.$t,
      Value: elt.gsx$value.$t,
    };
  });

  data = processData(data);

  let firstData = data.dataTemp.slice(0, 14);

  spotifyChart(firstData);
}

newFetchSpotify();

function switchChart() {
  let allData = data.dataTemp;
  let labels = data.labels;
  if (!allDays) {
    allData = allData.slice(0, 14);
    labels = labels.slice(0, 14);
    allDays = true;
  } else {
    allDays = false;
  }

  myChart.data.labels = labels;

  let newDataset = {
    // tension: 0.3,
    // borderColor: "black",
    data: allData,
    backgroundColor: "#81b29a",
    // fill: false,
  };
  myChart.data.datasets = [newDataset];

  //   console.log(myChart.data.datasets);

  myChart.update();
}

function processData(dat) {
  dat.sort(function (a, b) {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  //   if (allData.length > days) {
  //     allData = allData.slice(0, days);
  //   }

  let labels = dat.map(function (e) {
    return new Date(e.Date);
  });

  let dataTemp = dat.map(function (e) {
    // return e.Duration;
    return e.Value;
  });

  //   console.log(dataTemp);
  return { dataTemp, labels };
}

function spotifyChart(allData) {
  let currData = data.dataTemp.slice(0, 14);
  let labels = data.labels.slice(0, 14);

  //   console.log(currData);

  let ctx2 = document.getElementById("spotifyChart").getContext("2d");
  myChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          // tension: 0.3,
          // borderColor: "black",
          data: currData,
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
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
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

            label += tooltipItem.yLabel + " songs";
            return label;
          },
        },
      },
    },
  });
  Chart.defaults.global.defaultFontColor = "#000";
}
