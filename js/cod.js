// https://docs.google.com/spreadsheets/d/e/2PACX-1vR1niW_6GahrZO8AwptrW72A3EAbgLhROhApyzhwfq5_m_OTAfQq0MBD6OCsRfL0vHFYs2FKYluYCHd/pub?output=csv

let codData = {};
let codChart;
let codToggleState = 0;

function switchCodDots() {
  let circles = Array.from(document.getElementsByClassName("codCircles"));
  let desc = document.getElementById("cod-desc");

  switch (codToggleState) {
    case 0:
      desc.innerHTML =
        "Ben and I sometimes play Call of Duty together, who's winning? This graph shows the margin that either of us was winning by overall.";
      break;
    case 1:
      desc.innerHTML = "This graph shows the number of games won per day";
      break;
  }
  circles.forEach((c) =>
    c.id.slice(-1) == codToggleState
      ? (c.style.fill = "black")
      : (c.style.fill = "none")
  );
}

function codToggle() {
  switchCodDots();
  switch (codToggleState) {
    case 0:
      updateCodRunning();
      break;

    case 1:
      updateCodNormal();
      break;
  }
  codToggleState == 1 ? (codToggleState = 0) : codToggleState++;
}

function parseCod(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkxuvS6JNMaDdFtWzxpH4GN2g7DDOVjM0fkjv9QviwwTFBYP_Y6F2g9Thdf2Zer3DNzTQnNraaJt5a/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    processCod(data); // Pass the relevant part of the data
  } catch (error) {
    console.log("Error processing cod data, trying the fallback URL:", error);
    parseCSV(fallbackUrl); // Fall back to CSV if processing fails
  }

  // Function to parse CSV data with PapaParse for the fallback URL
  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processCod(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let CODCard = document.getElementById("CODCard");
          CODCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let CODCard = document.getElementById("CODCard");
        CODCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

function processCod(dataIn) {
  updateCodData(dataIn);

  drawCodChart();
  codToggle();
}

function updateCodData(data) {
  data.forEach((day) => {
    day.Archie = +day.Archie;
    day.Ben = +day.Ben;
    const [d, month, year] = day.Date.split("/");
    const date = new Date(year, month - 1, d);
    day.jsDate = date;
  });

  const dataArchie = data.map((e) => e.Archie);
  const dataBen = data.map((e) => -e.Ben);

  const labels = data.map((e) => e.Date);

  codData.normalView = { dataArchie, dataBen, labels };

  data.forEach((day, idx) => {
    day.runningTotal = data[idx - 1] ? data[idx - 1].runningTotal : 0;
    day.runningTotal += day.Archie;
    day.runningTotal -= day.Ben;
  });

  const runningData = data.map((e) => e.runningTotal);

  codData.runningView = { runningData, labels };

  const totalArchie = _.sumBy(data, "Archie");
  document.getElementById("numGamesArchie").innerHTML = totalArchie;
  const totalBen = _.sumBy(data, "Ben");
  document.getElementById("numGamesBen").innerHTML = totalBen;
  // console.log(data);

  const dateOfLastTest = moment(data[data.length - 1].Date, "DD/MM/YYYY").hour(
    8
  );

  // console.log(dateOfLastTest.unix());
  // console.log(new Date().getTime());

  const dateOfLastTestMessage =
    dateOfLastTest.format("Do [of] MMMM") +
    " (" +
    timeago(data[data.length - 1].jsDate) +
    ")";

  document.getElementById("timeSinceLastCod").innerHTML = dateOfLastTestMessage;
}

function updateCodNormal() {
  const { dataArchie, dataBen, labels } = codData.normalView;

  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Archie",
      data: dataArchie,
      backgroundColor: "#8ecae6",
      tension: 0.1,
      fill: true,
    },
    {
      label: "Ben",
      data: dataBen,
      backgroundColor: "#F4A4A4",
      tension: 0.1,
      fill: true,
    },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Score",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  codChart.update();
}

function updateCodRunning() {
  const { runningData, labels } = codData.runningView;
  codChart.data.labels = labels;
  codChart.data.datasets = [
    {
      label: "Margin",
      data: runningData,
      showLine: false,

      fill: {
        target: "origin",
        above: "#8ecae6", // Area will be red above the origin
        below: "#F4A4A4", // And blue below the origin
      },
      pointBackgroundColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
      pointBorderColor: function (context) {
        var index = context.dataIndex;
        var value = context.dataset.data[index];
        return value > 0 ? "#8ecae6" : value < 0 ? "#F4A4A4" : "#000000";
      },
    },
    { label: "Archie", data: [], backgroundColor: "#8ecae6" },
    { label: "Ben", data: [], backgroundColor: "#F4A4A4" },
  ];

  codChart.options.scales.y = {
    title: {
      text: "Winning margin",
      display: true,
    },
    ticks: {
      beginAtZero: true,
      callback: function (value, index, values) {
        if (value % 1 == 0) {
          return Math.abs(value);
        }
      },
    },
  };

  codChart.options.plugins.legend = {
    labels: {
      filter: (item) => item.text !== "Margin",
    },
    display: true,
  };
  // codChart.options.plugins.legend = {
  //   display: false,
  // };

  codChart.update();
}

function drawCodChart() {
  let ctx = document.getElementById("CODChart").getContext("2d");

  codChart = new Chart(ctx, {
    type: "line",

    options: {
      maintainAspectRatio: true,
      responsive: true,

      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += " " + Math.abs(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 4,
          },
        },

        y: {
          ticks: {
            beginAtZero: true,
            callback: function (value, index, values) {
              if (value % 1 == 0) {
                return Math.abs(value);
              }
            },
          },
        },
      },
    },
  });
}
