let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("temperatureReading").innerHTML =
        "Temperature: " + msg.Temperature.toFixed(2) + String.fromCharCode(176);
    document.getElementById("pressureReading").innerHTML =
        "Pressure: " + msg.Pressure.toFixed(2) + " hPa";
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});