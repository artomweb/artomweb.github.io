let imageNumbers = Array(92)
    .fill()
    .map((v, i) => i + 1);

imageNumbers = shuffle(imageNumbers);

let currentImageIndex = 90;

const MAX_CATS = 92;

function loadCat() {
    let catImg = document.getElementById("catImage");

    catImg.src = "standingCats/" + imageNumbers[currentImageIndex] + ".jpg";

    if (currentImageIndex >= MAX_CATS - 1) {
        currentImageIndex = 0;
    } else {
        currentImageIndex++;
    }
}

loadCat();