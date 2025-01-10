import { parseClimbing } from "./climbing";
import { loadCat } from "./cats";
import { initializeSocket } from "./rppiSocket";
import { initTouchButtons } from "./usefullFunc";
import { parseTyping } from "./typingSpeed";
import { parseDriving } from "./driving";
import { parseCod } from "./cod";
import { parseChess } from "./chess";
import { parseDuo } from "./duolingo";
import { parseDobble } from "./dobble";
import { parseSpotify } from "./spotifyChart";

function getAllData() {
  let url = "https://api.artomweb.com/cache/all";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Call each parsing function with individual error handling
      parseClimbing(data.climbing);
      parseTyping(data.typing);
      parseDriving(data.driving);
      parseCod(data.COD);
      parseChess(data.chess);
      parseDuo(data.duolingo);
      parseDobble(data.dobble);
      parseSpotify(data.spotify);
    })
    .catch((e) => {
      // Handle errors in the fetch operation
      console.error("Error fetching data:", e);
    });
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadCat").addEventListener("click", loadCat);
  initTouchButtons();
  getAllData();
  loadCat();
  initializeSocket();
});
