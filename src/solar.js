export default function parseSolar(data) {
  if (!data || data?.error) {
    console.log("Error processing solar data");
    document.getElementById("solarCard").classList.add("hidden");
  } else {
    try {
      showSolarData(data);
    } catch (error) {
      console.log("Error processing solar chart data", error);
      document.getElementById("solarCard").classList.add("hidden");
    }
  }
}

function showSolarData(data) {
  const batteryMinV = 14; // 22.4V
  const batteryMaxV = 15.2; // 28.35V
  const batteryV = data.V / 1000;

  const batteryPercentage = Math.max(
    ((batteryV - batteryMinV) / (batteryMaxV - batteryMinV)) * 100,
    0
  );

  document.getElementById("solarV").innerHTML =
    batteryPercentage.toFixed(2) + " %";
  document.getElementById("solarI").innerHTML =
    (data.I > 0 ? "+" : "") + data.I + " mA";
  document.getElementById("solarCPU").innerHTML = data.serverStats.cpu + " %";
  document.getElementById("solarPower").innerHTML = data.PPV + " W";

  if (data.I > 0) {
    document.getElementById("solarState").innerHTML =
      "Charging at " +
      Math.abs(((data.V / 1000) * (data.I / 1000)).toFixed(2)) +
      " W";
  } else {
    document.getElementById("solarState").innerHTML =
      "Discharging at " +
      Math.abs(((data.V / 1000) * (data.I / 1000)).toFixed(2)) +
      " W";
  }
  //   document.getElementById("lastSolar").innerHTML = dateOfLastReading;

  //   drawSolarChart(data.dailyData); // Array of daily entries
}
