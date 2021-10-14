let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

function updateReadingText(msg) {
    document.getElementById("temperatureReading").innerHTML = msg.temperature.toFixed(2);
    document.getElementById("pressureReading").innerHTML = msg.pressure.toFixed(2);
    if (!msg.humidity) {
        document.getElementById("humid").style.display = "none";
    } else {
        document.getElementById("humidityReading").innerHTML = msg.humidity.toFixed(2);
    }
}

function showSymbols() {
    let symbols = document.getElementsByClassName("liveDataSymbol");

    for (let s of symbols) {
        s.style.display = "inline";
    }
}
socket.on("new data", function(msg) {
    updateReadingText(msg);
});

socket.on("server init", function(msg) {
    if ("lastData" in msg) {
        updateReadingText(msg.lastData);
        showSymbols();
    }
    let serverInit = new Date(msg.serverInitTime);
    let currentTime = new Date();

    let delta = Math.abs(currentTime - serverInit) / 1000;

    let message = createTimeMessage(delta, "dhm");

    document.getElementById("serverUpTime").innerHTML = message;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});