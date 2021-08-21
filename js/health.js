function healthMain(results) {
  // console.log(results);
  results.shift();

  let data = results.map((elt) => {
    return {
      Date: new Date(elt[0]),
      SleepDuration: elt[1],
      AwakeDuration: elt[2],
      BedIn: elt[3],
      BedOut: elt[4],
      DeepDuration: elt[5],
      LightDuration: elt[6],
      HrAverage: +elt[7],
      nbawake: +elt[8],
      SleepScore: +elt[9],
    };
  });

  data = data.sort(function (a, b) {
    return b.Date.getTime() - a.Date.getTime();
  });

  // console.log(data);

  plotSleep(data);
  updateTotalDaysRecorded(data);

  // plotDailySleep(data)
}

async function fetchHealth() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/1CIYOalNR0s8359XEJRbpMfnixpXUIfuHOL1o_IQfn4E/gviz/tq?tqx=out:csv&sheet=sheet1",
    {
      download: true,
      complete: function (results, file) {
        // console.log(results);
        healthMain(results.data);
      },
    }
  );
}

fetchHealth();

function updateTotalDaysRecorded(data) {
  let daysOfSleep = document.getElementById("daysOfSleep");

  let days = data.length;

  if (days == 1) {
    daysOfSleep.innerHTML = data.length + " day";
  } else {
    daysOfSleep.innerHTML = data.length + " days";
  }
}

function aggregateSleepByDay(data) {
  let dailyAvg = _.chain(data)
    .groupBy((d) => {
      return moment(d.Date).format("dd");
    })
    .map((entries, week) => ({
      dofw: week,
      avg: _.meanBy(entries, (entry) => +entry.SleepDuration),
    }))
    .sortBy((o) => moment(o.dofw, "dd").isoWeekday())
    .value();

  let labels = dailyAvg.map((w) => w.dofw);
  let dataDay = dailyAvg.map((w) => w.avg);

  // console.log(dailyAvg);

  return { dataDay, labels };
}

function secondsToMins(e) {
  let hours = (e / 3600).toString();
  let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
  minutes = ("0" + minutes).slice(-2);
  return hours.split(".")[0] + ":" + minutes;
}

function plotSleep(data) {
  let { dataDay, labels } = aggregateSleepByDay(data);

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
          data: dataDay,
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
              callback: function (value, index, values) {
                console.log(value, index, values);
                let fromVal;
                if (index === 0) {
                  fromVal = values[values.length - 1];
                } else {
                  fromVal = values[index - 1];
                }
                return fromVal + "-" + value;
              },
            },
          },
        ],
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
