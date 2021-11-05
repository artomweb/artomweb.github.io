// colorPallets = [
//     // ["#62bdc7", "#d8a0a1", "#657786", "#c37777"],
//     ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"],
//     // ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
//     // ["#cae7b9", "#f3de8a", "#eb9486", "#7e7f9a"]
// ];

function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

let buttons = document.querySelectorAll(".button");

buttons.forEach((but) => {
    but.addEventListener("touchstart", function(e) {
        but.classList.add("active");
        setTimeout(function() {
            but.classList.remove("active");
        }, 200);
    });

    // but.addEventListener("touchend", function(e) {

    // });
});

// colors = colorPallets[Math.floor(Math.random() * colorPallets.length)];

// let colors = ["#81b29a", "#8ecae6", "#f08080", "#62bdc7"];
// // colors = shuffle(colors);
// let butns = document.getElementById("butns").children;
// let i, e;
// for (i = 0; i < butns.length; i++) {
//     e = butns[i];
//     e.style.backgroundColor = colors[i];
// }