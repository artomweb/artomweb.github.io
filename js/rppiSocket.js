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
  temperatureReading.innerHTML = msg.temperature.toFixed(2);
  pressureReading.innerHTML = msg.pressure.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });
  if (!msg.humidity) {
    document.getElementById("humid").style.display = "none";
  } else {
    humidityReading.innerHTML = msg.humidity.toFixed(2);
  }

  // console.log("Temp classes", tempIcon.classList);

  let icons = [
    ["temperature", tempIcon],
    ["pressure", pressIcon],
    ["humidity", humidIcon],
  ];

  // console.log(msg);

  if (msg.averages) {
    icons.map(([name, icon]) => {
      if (msg[name] >= msg.averages[name]) {
        if (icon.classList !== undefined) {
          if (icon.classList.contains("fa-caret-down"))
            icon.classList.remove("fa-caret-down");
          if (!icon.classList.contains("fa-caret-up"))
            icon.classList.add("fa-caret-up");
        } else {
          icon.classList.add("fa-caret-up");
        }
      } else {
        if (icon.classList !== undefined) {
          if (icon.classList.contains("fa-caret-up"))
            icon.classList.remove("fa-caret-up");
          if (!icon.classList.contains("fa-caret-down"))
            icon.classList.add("fa-caret-down");
        } else {
          icon.classList.add("fa-caret-down");
        }
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
  document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function () {
  document.getElementById("liveText").style.color = "black";
});
