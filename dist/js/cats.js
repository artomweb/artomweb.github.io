const MAX_CATS = 78;

// Create an array of integers
let imageNumbers = Array(MAX_CATS)
  .fill()
  .map((v, i) => i + 1);

imageNumbers = shuffle(imageNumbers);

let currentImageIndex = 0;

// When the button is clicked, change the image source to the current index
function loadCat() {
  const catImg = document.getElementById("catImage");
  const imageCache = document.getElementById("imageCache");

  catImg.src = "standingCats/" + imageNumbers[currentImageIndex] + ".webp";

  // When on last cat, set index to 0 and reshuffle
  if (currentImageIndex >= MAX_CATS - 1) {
    currentImageIndex = 0;
    imageNumbers = shuffle(imageNumbers);
  } else {
    // Cache the next image
    imageCache.src =
      "standingCats/" + imageNumbers[currentImageIndex + 1] + ".webp";
    currentImageIndex++;
  }
}

loadCat();
