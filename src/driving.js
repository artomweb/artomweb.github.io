import { formatDate, timeago } from "./usefullFunc.js";
export function parseDriving(data) {
  if (!data || data?.error) {
    console.log("Error processing Driving data");
  } else {
    try {
      showDrivingData(data.data); // Pass the relevant part of the data
      document.getElementById("drivingCard").classList.remove("hidden");
    } catch (error) {
      console.log("Error processing Driving data:", error);
    }
  }
}

function showdrivingSymbols() {
  const symbols = document.getElementsByClassName("drivingSymbol");

  for (const s of symbols) {
    s.style.display = "inline";
  }
}

function showDrivingData(data) {
  const formattedDate = formatDate(data.dateOfLastDrive);
  const dateOfLastTestMessage = `${formattedDate} (${timeago(
    data.dateOfLastDrive
  )})`;
  showdrivingSymbols();
  document.getElementById("timeDriving").innerHTML = data.timeSpentDriving;
  document.getElementById("milesDriven").innerHTML = data.milesDriven;
  document.getElementById("timeSinceLastDrive").innerHTML =
    dateOfLastTestMessage;
  document.getElementById("timeAbleDrive").innerHTML = data.timeDriving;
}
