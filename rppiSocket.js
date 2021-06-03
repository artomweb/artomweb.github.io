let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

socket.on("new data", function(msg) {
    console.log(msg);
    document.getElementById("temperatureReading").innerHTML = msg.Temperature;
    document.getElementById("pressureReading").innerHTML = msg.Pressure;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});