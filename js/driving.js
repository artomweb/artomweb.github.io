function fetchDriving() {
        Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vSlFhe-8wZDuYkepfvfo3g0uP4OEFh-r1PFkqaf_M73SyphJD8sSVIWsJ17-B2z-Hfu8MscZ8TfB9K8/pub?output=csv", {
            download: true,
            header: true,
            complete: function(results) {
                // console.log(results.data)
                driving(results.data)
            },
            error: function(error) {
                console.log("failed to fetch from cache, driving");
                let drivingCard = document.getElementById("drivingCard");
                drivingCard.style.display = "none";
            },
        });
}

fetchDriving();

function showdrivingSymbols() {
    let symbols = document.getElementsByClassName("drivingSymbol");

    for (let s of symbols) {
        s.style.display = "inline";
    }
}

function driving(data) {
    showdrivingSymbols();
    let totalMiles = _.sumBy(data, function(o) { return +o.totalMiles; });
    let totalSeconds = _.sumBy(data, function(o) { return +o.totalSeconds; });


    let timeDriving = document.getElementById("timeDriving");
    let milesDriven = document.getElementById("milesDriven");

    let timeMessage = createTimeMessage(totalSeconds);

    timeDriving.innerHTML = timeMessage;
    milesDriven.innerHTML = totalMiles.toFixed(1);
}