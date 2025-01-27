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
      document.getElementById("climbingCard").style.display = "none";
      document.getElementById("typingCard").style.display = "none";
      document.getElementById("CODCard").style.display = "none";
      document.getElementById("chessCard").style.display = "none";
      document.getElementById("dobbleCard").style.display = "none";
      document.getElementById("spotifyCard").style.display = "none";
      document.getElementById("drivingCard").style.display = "none";
      document.getElementById("duoCard").style.display = "none";
    });
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("container").style.display = "block";

  document.getElementById("loadCat").addEventListener("click", loadCat);
  loadCat();
  setTimeout(() => {
    document.getElementById("catImage").classList.remove("opacity-0");
    document.getElementById("catImage").classList.add("opacity-100");
  }, 10);

  getAllData();
  initTouchButtons();
  initializeSocket();
});
