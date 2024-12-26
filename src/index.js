import loadCat from "./cats.js";
loadCat();
document
  .getElementById("loadCatButton")
  .addEventListener("click", () => loadCat());

//   function getAllData() {
//     let url = "https://api.artomweb.com/cache/all";
//     fetch(url)
//       .then((response) => response.json())
//       .then((data) => {
//         // Call each parsing function with individual error handling
//         parseClimbing(data.climbing);
//         parseTyping(data.typing);
//         parseDriving(data.driving);
//         parseCod(data.COD);
//         parseChess(data.chess);
//         parseDuo(data.duolingo);
//         parseDobble(data.dobble);
//         parseSpotify(data.spotify);
//       })
//       .catch((e) => {
//         // Handle errors in the fetch operation
//         console.error("Error fetching data:", e);
//       });
//   }

//   // Use DOMContentLoaded to ensure HTML is loaded before calling the function
//   document.addEventListener("DOMContentLoaded", () => {
//     getAllData();
//   });
