let socket = io("https://rppi.artomweb.com", { reconnectionDelay: 500 });

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("temperatureReading").innerHTML =
        msg.Temperature.toFixed(2) + String.fromCharCode(176);
    document.getElementById("pressureReading").innerHTML =
        msg.Pressure.toFixed(2) + " hPa";
});

socket.on("server init", function(msg) {
    console.log(msg);
    let serverInit = new Date(msg.serverInitTime);
    let currentTime = new Date();

    let delta = Math.abs(currentTime - serverInit) / 1000;

    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    document.getElementById("serverUpTime").innerHTML =
        days + " days, " + hours + " hours";
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});