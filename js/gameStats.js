async function fetchGames() {
    Papa.parse("https://docs.google.com/spreadsheets/d/1HcMmJBfNWdwyX4rMhh-b_pCnTvTkQ1CfACv37JTCuzE/gviz/tq?tqx=out:csv&sheet=sheet1", {
        download: true,
        complete: function(results) {
            gamesMain(results.data);
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

    let CSGOMsg = createTimeMessage(dataJson[730] * 60, "dhm");
    let BF5Msg = createTimeMessage(dataJson[1238810] * 60, "dhm");
    let RDR2Msg = createTimeMessage(dataJson[1174180] * 60, "dhm");

    timeCSGO.innerHTML = CSGOMsg;
    timeBF5.innerHTML = BF5Msg;
    timeRDR2.innerHTML = RDR2Msg;
}