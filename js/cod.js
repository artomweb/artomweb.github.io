// https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv

function fetchCod() {
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vSkxuvS6JNMaDdFtWzxpH4GN2g7DDOVjM0fkjv9QviwwTFBYP_Y6F2g9Thdf2Zer3DNzTQnNraaJt5a/pub?output=csv", {
    download: true,
    header: true,
    complete: function (results) {
      // console.log(results.data);
      processCod(results.data);
    },
    error: function (error) {
      console.log("failed to fetch from cache, climbing");
      let climbingCard = document.getElementById("climbingCard");
      climbingCard.style.display = "none";
    },
  });
}

fetchCod();

function processCod(data) {
  console.log(data);
  data.forEach((day) => {
    day.Archie = +day.Archie;
    day.Ben = +day.Ben;

    let totalGames = day.Archie + day.Ben;
    day.ArchiePerc = day.Archie / totalGames;
    day.BenPerc = day.Ben / totalGames;
  });

  let totalArchie = _.sumBy(data, "Archie");
  document.getElementById("numGamesArchie").innerHTML = totalArchie;
  let totalBen = _.sumBy(data, "Ben");
  document.getElementById("numGamesBen").innerHTML = totalBen;
  console.log(data);

  let dataArchie = data.map((e) => e.Archie);
  let dataBen = data.map((e) => -e.Ben);

  let labels = data.map((e) => e.Date);

  plotCod(labels, [
    { label: "Archie", data: dataArchie, backgroundColor: "#8ecae6", tension: 0.1 },
    {
      label: "Ben",
      data: dataBen,
      backgroundColor: "#F4A4A4",
      tension: 0.1,
    },
  ]);

  //   console.log(labels);
  //   console.log(graphData);

  //   plotCod(labels, graphData);
}

function plotCod(labels, data) {
  let ctx = document.getElementById("CODChart").getContext("2d");

  let codChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: data,
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
        display: true,
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
                return Math.abs(value);
              },
            },
          },
        ],
      },
      tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";
            label += " " + Math.abs(tooltipItem.yLabel);
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
