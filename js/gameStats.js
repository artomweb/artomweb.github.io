function fetchGames() {
  fetch("https://rppi.artomweb.com/cache/data/game")
    .then((res) => res.json())
    .then((out) => gamesMain(out))
    .catch((err) => {
      console.log("failed to fetch from cache, games", err);
    });
}

fetchGames();

function gamesMain(data) {
  let timeCSGO = document.getElementById("timeCSGO");
  let timeBF5 = document.getElementById("timeBF5");
  let timeRDR2 = document.getElementById("timeRDR2");

  let CSGOMsg = createTimeMessage(data[730]);
  let BF5Msg = createTimeMessage(data[1238810]);
  let RDR2Msg = createTimeMessage(data[1174180]);

  timeCSGO.innerHTML = CSGOMsg;
  timeBF5.innerHTML = BF5Msg;
  timeRDR2.innerHTML = RDR2Msg;
}
