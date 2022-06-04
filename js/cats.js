const NUMCATS = 63;

function loadCat() {
    let catInt = Math.floor(Math.random() * NUMCATS) + 1;
    // console.log(catInt);
    let catImg = document.getElementById("catImage");

    catImg.src = "standingCats/" + catInt + ".jpg";
}

loadCat();