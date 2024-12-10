function parseDuo(data) {
  const duoCard = document.getElementById("duoCard");

  if (!data || data.error) {
    console.log("Error processing data:", data.error);
    duoCard.style.display = "none"; // Hide the card if processing fails
  } else {
    try {
      showDuoData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Duolingo data", error);
      duoCard.style.display = "none"; // Hide the card if processing fails
    }
  }
}

function showDuoData(data) {
  console.log(data);
  document.getElementById("timeSinceLastDuo").innerHTML = data.timeSinceLastDuo;
  document.getElementById("duoLessons").innerHTML = data.duoLessons;
  document.getElementById("duoStreak").innerHTML = data.duoStreak;
  document.getElementById("duoTotal").innerHTML = data.duoTotal;

  plotDuo(data.graphData.labels, data.graphData.graphData);
}

function plotDuo(labels, data) {
  const ctx = document.getElementById("duoChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: "#81b29a",
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return formatDate(tooltipItem[0].label);
            },
            label: function (context) {
              let label = context.dataset.label || "";

              if (context.parsed.y !== null) {
                if (context.parsed.y === 1) {
                  label += "1 minute";
                } else {
                  label += context.parsed.y + " minutes";
                }
              }
              return label;
            },
          },
        },
      },
      responsive: true,

      scales: {
        x: {
          ticks: {
            callback: function (value, index, ticks) {
              const tickDate = new Date(labels[index]);
              return tickDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });

              //   tickDate.toLocaleString("en-US", {
              //     month: "short",
              //     year: "numeric",
              //   });
            },
            maxTicksLimit: 3,
          },
        },
        y: {
          title: {
            text: "Time spent (mins)",
            display: true,
          },
        },
      },
    },
  });
}
