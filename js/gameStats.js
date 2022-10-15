async function fetchGames() {
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vRd3YjXEoMgwyej-Y6uIwHtZUlWtBYjB6nBoexbjVxreBsbDPaY9cPsr8QnUuY-WthpVfS3gNbIXidV/pub?output=csv", {
        download: true,
        complete: function(results) {
            gamesMain(results.data);
        },
        error: function(error) {
            console.log("failed to fetch from cache, games");
        },
    });
}

fetchGames();

function gamesMain(data) {
    let timeCSGO = document.getElementById("timeCSGO");
    let timeBF5 = document.getElementById("timeBF5");
    let timeRDR2 = document.getElementById("timeRDR2");
    let dataJson = {};
    data.forEach((elem) => {
        dataJson[elem[0]] = elem[1];
    });

    let CSGOMsg = createTimeMessage(dataJson[730] * 60);
    let BF5Msg = createTimeMessage(dataJson[1238810] * 60);
    let RDR2Msg = createTimeMessage(dataJson[1174180] * 60);

    timeCSGO.innerHTML = CSGOMsg;
    timeBF5.innerHTML = BF5Msg;
    timeRDR2.innerHTML = RDR2Msg;
}