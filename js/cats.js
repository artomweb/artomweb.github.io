const MAX_CATS = 127;

let imageNumbers = Array(MAX_CATS)
    .fill()
    .map((v, i) => i + 1);

imageNumbers = shuffle(imageNumbers);

let currentImageIndex = 120;

function loadCat() {
    let catImg = document.getElementById("catImage");
    let imageCache = document.getElementById("imageCache");

    catImg.src = "standingCats/" + imageNumbers[currentImageIndex] + ".jpg";

    if (currentImageIndex >= MAX_CATS - 1) {
        currentImageIndex = 0;
        imageNumbers = shuffle(imageNumbers);
    } else {
        imageCache.src = "standingCats/" + imageNumbers[currentImageIndex + 1] + ".jpg";
        currentImageIndex++;
    }
}

loadCat();