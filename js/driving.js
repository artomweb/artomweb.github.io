function parseDriving(data) {
  const drivingCard = document.getElementById("drivingCard");

  if (!data || data?.error) {
    console.log("Error processing Driving data");
    drivingCard.style.display = "none"; // Hide the card if processing fails
  } else {
    try {
      showDrivingData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing Driving data:", error);
      drivingCard.style.display = "none"; // Hide the card if processing fails
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
  console.log(data);
  showdrivingSymbols();
  document.getElementById("timeDriving").innerHTML = data.timeSpentDriving;
  document.getElementById("milesDriven").innerHTML = data.milesDriven;
  document.getElementById("timeSinceLastDrive").innerHTML =
    data.timeSinceLastDrive;
  document.getElementById("timeAbleDrive").innerHTML = data.timeDriving;
}

function processDriving(data) {
  showdrivingSymbols();
  const totalMiles = _.sumBy(data, function (o) {
    return +o.totalMiles;
  });
  const totalSeconds = _.sumBy(data, function (o) {
    return +o.totalSeconds;
  });

  const timeMessage = Math.round(totalSeconds / (60 * 60)) + " hours";

  timeSpentDriving.innerHTML = timeMessage;
  milesDriven.innerHTML =
    totalMiles.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    }) + " miles";

  const sortedData = data.sort(function (a, b) {
    return b.startTimestamp - a.startTimestamp;
  });

  const endTimestamp = sortedData[0].endTimestamp / 1000; // Convert to seconds
  const date = new Date(endTimestamp * 1000); // Create a Date object

  const dateOfLastDrive = formatDate(date);

  const dateOfLastDriveMessage =
    dateOfLastDrive +
    " (" +
    timeago(new Date(+sortedData[0].endTimestamp)) +
    ")";

  const timeDriving = document.getElementById("timeAbleDrive");
  const drivingPass = new Date(1626864660 * 1000);

  const drivingMessage = timeago(drivingPass).replace(" ago", "");

  timeDriving.innerHTML = drivingMessage;
}
