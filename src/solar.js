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
  const batteryMinV = 12.4;
  const batteryMaxV = 16.2;
  const batteryV = data.V / 1000;

  const batteryPercentage = Math.max(((batteryV - batteryMinV) / (batteryMaxV - batteryMinV)) * 100, 0);

  // Existing fields
  document.getElementById("solarV").innerHTML = batteryPercentage.toFixed(1) + " %";
  document.getElementById("solarI").innerHTML = (data.I > 0 ? "+" : "") + data.I + " mA";
  document.getElementById("solarCPU").innerHTML = data.serverStats.cpu + " %";
  document.getElementById("solarPower").innerHTML = data.PPV + " W";

  // State logic
  const powerW = Math.abs(((data.V / 1000) * (data.I / 1000)).toFixed(1));
  document.getElementById("solarState").innerHTML = (data.I > 0 ? "Charging at " : "Discharging at ") + powerW + " W";

  if (data.uptime) {
    const uptime = data.uptime;

    // 7 Day Uptime
    const uptime7Str = `${uptime.uptime_7d_pct.toFixed(0)} %` + (uptime.downtime_7d_hours > 0 ? ` (${uptime.downtime_7d_hours} hours down)` : "");
    document.getElementById("solarUptime7").innerHTML = uptime7Str;

    // 30 Day Uptime
    const uptime30Str =
      `${uptime.uptime_30d_pct.toFixed(0)} %` + (uptime.downtime_30d_hours > 0 ? ` (${uptime.downtime_30d_hours.toFixed(0)} hours down)` : "");
    document.getElementById("solarUptime30").innerHTML = uptime30Str;
  }
}
