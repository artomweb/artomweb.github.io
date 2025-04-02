import Chart from "./sharedChartjs.js";
import { formatDate, timeago } from "./usefullFunc.js";
import { green1, green2, green3 } from "./colours.js";

export function parseDuo(data) {
  if (!data || data?.error) {
    console.log("Error processing data");
    document.getElementById("duoCard").classList.add("hidden");
  } else {
    try {
      showDuoData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Duolingo data", error);
      document.getElementById("duoCard").classList.add("hidden");
    }
  }
}

function showDuoData(data) {
  const formattedDate = formatDate(data.lastLessonDate);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.lastLessonDate
  )})`;
  document.getElementById("timeSinceLastDuo").innerHTML = dateOfLastTestMessage;
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
          backgroundColor: green2,
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: false,
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
            color: green1,
            maxTicksLimit: 3,
          },
          grid: {
            color: green3, // Grid line color for X-axis
          },
        },
        y: {
          title: {
            text: "Time spent (mins)",
            display: true,
            color: green1,
          },
          grid: {
            color: green3, // Grid line color for X-axis
          },
          ticks: {
            color: green1, // X-axis number color
          },
        },
      },
    },
  });
}
