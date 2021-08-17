let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

function updateReadingText(msg) {
    document.getElementById("temperatureReading").innerHTML = msg.temperature.toFixed(2) + String.fromCharCode(176);
    document.getElementById("pressureReading").innerHTML = msg.pressure.toFixed(2) + "mb";
    if (!msg.humidity) {
        document.getElementById("humid").style.display = "none";
    } else {
        document.getElementById("humidityReading").innerHTML = msg.humidity.toFixed(2) + " %";
    }
}
socket.on("new data", function(msg) {
    // console.log(msg);
    updateReadingText(msg);
});

socket.on("server init", function(msg) {
    // console.log(msg);
    if ("lastData" in msg) updateReadingText(msg.lastData);
    let serverInit = new Date(msg.serverInitTime);
    let currentTime = new Date();

    let delta = Math.abs(currentTime - serverInit) / 1000;

    let message = createTimeMessage(delta);

    document.getElementById("serverUpTime").innerHTML = message;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});