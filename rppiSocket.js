let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

socket.on("new data", function(msg) {
    console.log(msg);
    document.getElementById("temperatureReading").innerHTML =
        "Temperature: " + Math.round(msg.Temperature * 100) / 1000;
    document.getElementById("pressureReading").innerHTML =
        "Pressure: " + Math.round(msg.Pressure * 1000) / 1000;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});