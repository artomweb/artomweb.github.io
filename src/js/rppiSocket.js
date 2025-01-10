import { io } from "socket.io-client";
import { uptime } from "./usefullFunc";

export function initializeSocket() {
  const socket = io("https://api.artomweb.com", {
    path: "/readingSock",
    reconnectionDelay: 500,
  });

  const tempIcon = document.getElementById("tempIcon");
  const pressIcon = document.getElementById("pressIcon");
  const humidIcon = document.getElementById("humidIcon");

  const temperatureReading = document.getElementById("temperatureReading");
  const pressureReading = document.getElementById("pressureReading");
  const humidityReading = document.getElementById("humidityReading");

  function updateReadingText(msg) {
    temperatureReading.innerHTML = msg.temperature.toFixed(2) + " &#176;";
    pressureReading.innerHTML =
      msg.pressure.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }) + " mbar";
    if (!msg.humidity) {
      document.getElementById("humid").style.display = "none";
    } else {
      humidityReading.innerHTML = msg.humidity.toFixed(2) + " %";
    }

    const icons = [
      ["temperature", tempIcon],
      ["pressure", pressIcon],
      ["humidity", humidIcon],
    ];

    if (msg.averages) {
      icons.forEach(([name, iconContainer]) => {
        const caretUpIcon = iconContainer.querySelector(".caret-up");
        const caretDownIcon = iconContainer.querySelector(".caret-down");

        if (msg[name] >= msg.averages[name]) {
          caretUpIcon.style.display = "inline";
          caretDownIcon.style.display = "none";
        } else {
          caretUpIcon.style.display = "none";
          caretDownIcon.style.display = "inline";
        }
      });
    }
  }

  function showDataSymbols() {
    const symbols = document.getElementsByClassName("liveDataSymbol");

    for (const s of symbols) {
      s.style.display = "inline";
    }
  }

  socket.on("new data", function (msg) {
    updateReadingText(msg);
  });

  socket.on("server init", function (msg) {
    if ("lastData" in msg) {
      updateReadingText(msg.lastData);
    }
    showDataSymbols();
    const serverInit = new Date(msg.serverInitTime);

    const message = uptime(serverInit);

    document.getElementById("serverUpTime").innerHTML = message;
  });

  socket.on("connect", function () {
    const liveText = document.getElementById("liveText");
    liveText.style.color = "red";
    liveText.querySelector("svg path").style.fill = "red";
  });

  socket.on("disconnect", function () {
    const liveText = document.getElementById("liveText");
    liveText.style.color = "black";
    liveText.querySelector("svg path").style.fill = "black";
  });
}
