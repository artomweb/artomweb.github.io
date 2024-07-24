function fetchDriving() {
  const primaryUrl = "https://api.artomweb.com/cache/driving";
  const fallbackUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFhe-8wZDuYkepfvfo3g0uP4OEFh-r1PFkqaf_M73SyphJD8sSVIWsJ17-B2z-Hfu8MscZ8TfB9K8/pub?output=csv";

  function parseCSV(url) {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        try {
          processDriving(results.data);
        } catch (error) {
          console.log("Error processing driving data:", error);
          if (url !== fallbackUrl) {
            console.log("Trying the fallback URL...");
            parseCSV(fallbackUrl);
          } else {
            let drivingCard = document.getElementById("drivingCard");
            drivingCard.style.display = "none";
          }
        }
      },
      error: function (error) {
        console.log("Failed to fetch driving data from:", url);
        if (url === primaryUrl) {
          console.log("Trying the fallback URL...");
          parseCSV(fallbackUrl);
        } else {
          let drivingCard = document.getElementById("drivingCard");
          drivingCard.style.display = "none";
        }
      },
    });
  }

  // Try to fetch data from the primary URL first
  parseCSV(primaryUrl);
}

fetchDriving();

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

  let timeDriving = document.getElementById("timeDriving");
  let milesDriven = document.getElementById("milesDriven");

  let timeMessage = toHours(totalSeconds);

  timeDriving.innerHTML = timeMessage;
  milesDriven.innerHTML = totalMiles.toFixed(1);

  let sortedData = data.sort(function (a, b) {
    return b.startTimestamp - a.startTimestamp;
  });

  let dateOfLastDrive = moment
    .unix(sortedData[0].endTimestamp / 1000)
    .format("Do [of] MMMM");

  let timeSinceLastDrive =
    (new Date().getTime() - sortedData[0].endTimestamp) / 1000;

  let dateOfLastDriveMessage =
    dateOfLastDrive + " (" + createTimeMessage(timeSinceLastDrive) + " ago)";

  document.getElementById("timeSinceLastDrive").innerHTML =
    dateOfLastDriveMessage;
}
