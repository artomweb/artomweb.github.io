import "./style.css";
import { loadCat } from "./cats";
import { parseClimbing } from "./climbing";
import { parseTyping } from "./typingSpeed";
import { parseCod } from "./cod";
import { parseChess } from "./chess";
import { initTouchButtons } from "./usefullFunc";
import { parseDobble } from "./dobble";
import { parseSpotify } from "./spotifyChart";
import { parseDriving } from "./driving";
import { initializeSocket } from "./rppiSocket";
import { parseDuo } from "./duolingo";

function getAllData() {
  let url = "https://api.artomweb.com/cache/all";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Call each parsing function with individual error handling
      parseClimbing(data.climbing);
      parseTyping(data.typing);
      parseCod(data.COD);
      parseChess(data.chess);
      parseDobble(data.dobble);
      parseSpotify(data.spotify);
      parseDriving(data.driving);
      parseDuo(data.duolingo);
    })
    .catch((e) => {
      // Handle errors in the fetch operation
      console.error("Error fetching data:", e);
    });
}
document.addEventListener("DOMContentLoaded", () => {
  loadCat();
  document.getElementById("loadCat").addEventListener("click", loadCat);
  getAllData();
  initTouchButtons();
  initializeSocket();
});
