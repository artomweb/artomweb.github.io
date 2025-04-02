import { formatDate, timeago } from "./usefullFunc.js";
import Chart from "./sharedChartjs.js";
import { blue1, blue2 } from "./colours";

export default function parsePushups(data) {
  document
    .getElementById("climbingToggle")
    .addEventListener("click", climbingToggle);

  if (!data || data?.error) {
    console.log("Error processing fallback CSV data:");
    document.getElementById("pushupCard").classList.add("hidden");
  } else {
    try {
      showClimbingData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Climbing data", error);
      document.getElementById("pushupCard").classList.add("hidden");
    }
  }
}

function showClimbingData(data) {
  const formattedDate = formatDate(data.dateOfLastTraining);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastTraining
  )})`;
  document.getElementById("pushupMax").innerHTML = data.maxPushups;
  document.getElementById("pushupTrainings").innerHTML = data.numTraining;
  document.getElementById("numMaxTests").innerHTML = data.numTests;

  document.getElementById("timeSinceLastPushup").innerHTML =
    dateOfLastTestMessage;

  drawPushupChart(data);
}

function drawPushupChart(dataIn) {
  const ctx = document.getElementById("pushupChart").getContext("2d");

  function formatPUDate(value) {
    const date = new Date(value);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dataIn.graphData.labels,
      datasets: [
        {
          data: dataIn.graphData.data,
          //   borderColor: "#36A2EB",
          backgroundColor: blue2,
          borderColor: blue1,
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
            label: function (context) {
              return context.parsed.y + " push-ups";
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          type: "time",
          time: {
            unit: "month",
            displayFormats: {
              month: "MMM yyyy",
            },
            tooltipFormat: "dd/MM/yyyy",
          },
          ticks: {
            maxTicksLimit: 5,
          },
        },
      },
    },
  });
}
