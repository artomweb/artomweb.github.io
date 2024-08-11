import "./usefullFunc";
import "./cats";
import "./chess";
import "./cod";
import "./dobble";
import "./driving";
import "./moreStats";
import "./rppiSocket";
import "./spotifyChart";
import "./typingSpeed";

// fix button animation on mobile
let touchButtons = document.querySelectorAll(".button");

touchButtons.forEach((but) => {
  but.addEventListener("touchstart", function (e) {
    but.classList.add("active");
    setTimeout(function () {
      but.classList.remove("active");
    }, 200);
  });
});
