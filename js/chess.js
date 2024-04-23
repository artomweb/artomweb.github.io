function fetchChess1() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0RbVnsngyVYHx18kQQIMDg8zB3sCqHXSznIPQBrt3YA4OO_x17IDCEUZX0XPB5-9qb0M5Tx3oSbCH/pub?output=csv",
    {
      download: true,
      header: true,
      complete: function (results) {
        // console.log(results.data);
        processChess(results.data);
      },
      error: function (error) {
        console.log("failed to fetch from cache, climbing");
        let climbingCard = document.getElementById("climbingCard");
        climbingCard.style.display = "none";
      },
    }
  );
}
fetchChess1();

function fetchChess2() {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0RbVnsngyVYHx18kQQIMDg8zB3sCqHXSznIPQBrt3YA4OO_x17IDCEUZX0XPB5-9qb0M5Tx3oSbCH/pub?output=csv&gid=808327424",
    {
      download: true,
      header: true,
      complete: function (results) {
        // console.log(results.data);
        processChess2(results.data[0]);
      },
      error: function (error) {
        console.log("failed to fetch from cache, climbing");
        let climbingCard = document.getElementById("climbingCard");
        climbingCard.style.display = "none";
      },
    }
  );
}
fetchChess2();

function processChess2(data) {
  console.log(data);

  document.getElementById("ChessHighestRating").innerHTML = data.rating_max;
  document.getElementById("ChessNumGames").innerHTML = data.rated_count;
}

function processChess(data) {
  console.log(data);
  data.forEach((elt) => {
    elt.timestamp = +elt.timestamp;
    elt.Date = moment(+elt.timestamp).format("DD/MM/YYYY");
  });
  data = data.sort((a, b) => a.timestamp - b.timestamp);
  // console.log(data);

  const dateOfLastGame = data[data.length - 1].timestamp;

  const timeSinceLastTest = (new Date().getTime() - dateOfLastGame) / 1000;

  const dateOfLastTestMessage =
    moment(dateOfLastGame).format("Do [of] MMMM") +
    " (" +
    createTimeMessage(timeSinceLastTest) +
    " ago)";

  document.getElementById("timeSinceLastChess").innerHTML =
    dateOfLastTestMessage;

  let labels = data.map((elt) => elt.Date);
  let graphData = data.map((elt) => +elt.rating);

  plotChess(graphData, labels);
}

function plotChess(data, labels) {
  let ctx = document.getElementById("ChessChart").getContext("2d");

  // console.log(data, labels);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          tension: 0.3,
          // borderColor: "black",
          data,
          backgroundColor: "#8ecae6",
          fill: true,
          // fill: false,
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
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 4,
          },
        },

        y: {
          title: {
            text: "Chess rating",
            display: true,
          },
          beginAtZero: true,
        },
      },
    },
  });
}
