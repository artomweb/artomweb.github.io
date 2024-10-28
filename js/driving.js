function parseDriving(data) {
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFhe-8wZDuYkepfvfo3g0uP4OEFh-r1PFkqaf_M73SyphJD8sSVIWsJ17-B2z-Hfu8MscZ8TfB9K8/pub?output=csv";

  // Attempt to process the provided JSON data
  try {
    processDriving(data); // Pass the relevant part of the data
  } catch (error) {
    console.log(
      "Error processing driving data, trying the fallback URL:",
      error
    );
    parseCSV(fallbackUrl); // Fall back to CSV if processing fails
  }

  // Function to parse CSV data with PapaParse for the fallback URL
  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processDriving(results.data); // Process the CSV data
        } catch (error) {
          console.log("Error processing fallback CSV data:", error);
          let drivingCard = document.getElementById("drivingCard");
          drivingCard.style.display = "none"; // Hide the card if processing fails
        }
      },
      error: function (error) {
        console.log("Failed to fetch data from CSV URL:", error);
        let drivingCard = document.getElementById("drivingCard");
        drivingCard.style.display = "none"; // Hide the card if fetching fails
      },
    });
  }
}

function showdrivingSymbols() {
  let symbols = document.getElementsByClassName("drivingSymbol");

  for (let s of symbols) {
    s.style.display = "inline";
  }
}

function processDriving(data) {
  showdrivingSymbols();
  let totalMiles = _.sumBy(data, function (o) {
    return +o.totalMiles;
  });
  let totalSeconds = _.sumBy(data, function (o) {
    return +o.totalSeconds;
  });

  let timeSpentDriving = document.getElementById("timeDriving");
  let milesDriven = document.getElementById("milesDriven");

  let timeMessage = Math.round(totalSeconds / (60 * 60)) + " hours";

  timeSpentDriving.innerHTML = timeMessage;
  milesDriven.innerHTML = totalMiles.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });

  let sortedData = data.sort(function (a, b) {
    return b.startTimestamp - a.startTimestamp;
  });

  const endTimestamp = sortedData[0].endTimestamp / 1000; // Convert to seconds
  const date = new Date(endTimestamp * 1000); // Create a Date object

  const dateOfLastDrive = formatDate(date);

  let dateOfLastDriveMessage =
    dateOfLastDrive +
    " (" +
    timeago(new Date(+sortedData[0].endTimestamp)) +
    ")";

  document.getElementById("timeSinceLastDrive").innerHTML =
    dateOfLastDriveMessage;

  let timeDriving = document.getElementById("timeAbleDrive");
  let drivingPass = new Date(1626864660 * 1000);

  let drivingMessage = timeago(drivingPass).replace(" ago", "");

  timeDriving.innerHTML = drivingMessage;
}
