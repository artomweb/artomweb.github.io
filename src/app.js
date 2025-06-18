import "./style.css";
import loadCat from "./cats";
import { parseClimbing } from "./climbing";
import parseTyping from "./typingSpeed";
import { parseCod } from "./cod";
import { parseChess } from "./chess";
import { initTouchButtons } from "./usefullFunc";
import { parseDobble } from "./dobble";
import { parseSpotify } from "./spotifyChart";
import { parseDriving } from "./driving";
import { parseDuo } from "./duolingo";
import parsePushups from "./pushup";
import parse5k from "./5k";
import parseSolar from "./solar";
import { initializeSocket } from "./rppiSocket";

function getAllData() {
  let primaryUrl = "https://solar.artomweb.com/cache/all"; // Try this first
  let fallbackUrl = "https://api.artomweb.com/cache/all"; // Fallback URL

  // Function to fetch data from a given URL
  function fetchData(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request to ${url} failed`);
        }
        return response.json();
      })
      .catch((e) => {
        console.error(`${url} failed:`, e);
        throw e; // Rethrow the error so we can handle it
      });
  }

  fetchData(primaryUrl)
    .then((data) => {
      document.getElementById("solarCard").classList.remove("hidden");
      parseSolar(data.solar);
      handleData(data); // Handle data from the primary URL
    })
    .catch(() => {
      console.log("Primary URL failed, trying fallback URL...");
      fetchData(fallbackUrl) // Try the fallback URL if primary URL fails
        .then((data) => {
          document.getElementById("solarCard").classList.add("hidden");
          handleData(data); // Handle data from the fallback URL
        })
        .catch((e) => {
          console.error("Both requests failed:", e);
          hideAllCards(); // Hide all cards if both requests fail
        });
    });
}

function handleData(data) {
  parseClimbing(data.climbing);
  parseTyping(data.typing);
  parseCod(data.COD);
  parseChess(data.chess);
  parseDobble(data.dobble);
  parseDriving(data.driving);
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
    "drivingCard",
    "pushupCard",
    "5kCard",
    "solarCard",
  ];
  cardIds.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
}
