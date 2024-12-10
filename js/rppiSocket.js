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
  document.getElementById("liveDataCard").classList.remove("hidden");
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

  // console.log("Temp classes", tempIcon.classList);

  const icons = [
    ["temperature", tempIcon],
    ["pressure", pressIcon],
    ["humidity", humidIcon],
  ];

  // console.log(msg);

  if (msg.averages) {
    icons.forEach(([name, iconContainer]) => {
      const caretUpIcon = iconContainer.querySelector(".caret-up");
      const caretDownIcon = iconContainer.querySelector(".caret-down");

      if (msg[name] >= msg.averages[name]) {
        // Show caret-up, hide caret-down
        caretUpIcon.style.display = "inline";
        caretDownIcon.style.display = "none";
      } else {
        // Show caret-down, hide caret-up
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
  liveText.style.color = "red"; // text color
  liveText.querySelector("svg path").style.fill = "red"; // SVG color
});

socket.on("disconnect", function () {
  const liveText = document.getElementById("liveText");
  liveText.style.color = "black"; // text color
  liveText.querySelector("svg path").style.fill = "black"; // SVG color
});
