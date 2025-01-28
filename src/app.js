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
  let primaryUrl = "https://api.artomweb.com/cache/all";
  let fallbackUrl = "https://g-api.artomweb.com/cache/all";

  fetch(primaryUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Primary URL failed");
      }
      return response.json();
    })
    .then((data) => {
      handleData(data);
    })
    .catch((e) => {
      console.error("Primary request failed:", e);
      // Try the fallback URL if the primary fails
      fetch(fallbackUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fallback URL failed");
          }
          return response.json();
        })
        .then((data) => {
          handleData(data);
        })
        .catch((e) => {
          console.error("Fallback request also failed:", e);
          hideAllCards();
        });
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
}

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
  ];
  cardIds.forEach((id) => {
    document.getElementById(id).style.display = "none";
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
  // initializeSocket();
});
