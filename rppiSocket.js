let socket = io("https://rppi.artomweb.com");

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("SensorReading").innerHTML = msg.LDR;
});

socket.on("connect", function() {
    document.getElementById("liveText").style.color = "red";
});

socket.on("disconnect", function() {
    document.getElementById("liveText").style.color = "black";
});