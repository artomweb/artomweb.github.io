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
import { parseDuo } from "./duolingo";
import parsePushups from "./pushup";
import parse5k from "./5k";
import { initializeSocket } from "./rppiSocket";

function getAllData() {
  let primaryUrl = "https://api.artomweb.com/cache/all";

  fetch(primaryUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Primary URL failed");
      }
      return response.json();
    })
    .then((data) => {
      try {
        handleData(data); // Handle data, but don't propagate errors here
      } catch (e) {
        console.error("Error handling data:", e); // Only log error if handling fails
      }
    })
    .catch((e) => {
      console.error("Primary request failed:", e);
      hideAllCards();
    });
}

function handleData(data) {
  parseClimbing(data.climbing);
  parseTyping(data.typing);
  parseCod(data.COD);
  parseChess(data.chess);
  parseDobble(data.dobble);
  parseSpotify(data.spotify);
  parseDriving(data.driving);
  parseDuo(data.duolingo);
  parsePushups(data.pushups);
  parse5k(data.k5);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadCat").addEventListener("click", loadCat);
  loadCat();
  setTimeout(() => {
    document.getElementById("catImage").classList.remove("opacity-0");
    document.getElementById("catImage").classList.add("opacity-100");
  }, 10);

  getAllData();
  initTouchButtons();
  // initializeSocket();
});

function hideAllCards() {
  let cardIds = [
    "climbingCard",
    "typingCard",
    "CODCard",
    "chessCard",
    "dobbleCard",
    "spotifyCard",
    "drivingCard",
    "duoCard",
    "pushupCard",
    "5kCard",
  ];
  cardIds.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
}
