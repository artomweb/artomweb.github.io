const socket = io("https://api.artomweb.com", {
  path: "/readingSock",
  reconnectionDelay: 500,
});

let tempIcon = document.getElementById("tempIcon");
let pressIcon = document.getElementById("pressIcon");
let humidIcon = document.getElementById("humidIcon");

let temperatureReading = document.getElementById("temperatureReading");
let pressureReading = document.getElementById("pressureReading");
let humidityReading = document.getElementById("humidityReading");

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

  let icons = [
    ["temperature", tempIcon],
    ["pressure", pressIcon],
    ["humidity", humidIcon],
  ];

  // console.log(msg);

  if (msg.averages) {
    icons.forEach(([name, iconContainer]) => {
      let caretUpIcon = iconContainer.querySelector(".caret-up");
      let caretDownIcon = iconContainer.querySelector(".caret-down");

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
  let symbols = document.getElementsByClassName("liveDataSymbol");

  for (let s of symbols) {
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
  let serverInit = new Date(msg.serverInitTime);

  let message = uptime(serverInit);

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
