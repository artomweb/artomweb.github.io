let socket = io("https://artomweb.duckdns.org");

socket.on("new data", function(msg) {
    // console.log(msg);
    document.getElementById("SensorReading").innerHTML = msg.LDR;
});