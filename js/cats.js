const MAX_CATS = 127;

// Create an array of integers
let imageNumbers = Array(MAX_CATS)
    .fill()
    .map((v, i) => i + 1);

imageNumbers = shuffle(imageNumbers);

let currentImageIndex = 0;

// When the button is clicked, change the image source to the current index
function loadCat() {
    let catImg = document.getElementById("catImage");
    let imageCache = document.getElementById("imageCache");

    catImg.src = "standingCats/" + imageNumbers[currentImageIndex] + ".jpg";

    // When on last cat, set index to 0 and reshuffle
    if (currentImageIndex >= MAX_CATS - 1) {
        currentImageIndex = 0;
        imageNumbers = shuffle(imageNumbers);
    } else {
        // Cache the next image
        imageCache.src = "standingCats/" + imageNumbers[currentImageIndex + 1] + ".jpg";
        currentImageIndex++;
    }
}

loadCat();