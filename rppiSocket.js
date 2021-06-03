let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("temperatureReading").innerHTML =
        "Temperature: " + Math.round(msg.Temperature * 100) / 100;
    document.getElementById("pressureReading").innerHTML =
        "Pressure: " + Math.round(msg.Pressure * 100) / 100;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});