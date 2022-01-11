function getNewImage() {
    fetch("https://rppi.artomweb.com/ml/catDog")
        .then((res) => res.json())
        .then((out) => insertCatDog(out))
        .catch((err) => {
            console.log("Could not get image data", err);
        });
}

getNewImage();

let catDogImageRef = document.getElementById("catDogImage");

function insertCatDog(data) {
    catDogImageRef.src = "https://rppi.artomweb.com" + data.imageLink;
    catDogImageRef.setAttribute("imageURI", data.imageURI);
    console.log(data);
}

function catDogChoice(cORd) {
    getNewImage();
    let imageURI = catDogImageRef.getAttribute("imageURI");
    console.log(cORd);
    fetch(
            "https://rppi.artomweb.com/ml/label?" +
            new URLSearchParams({
                imageURI: imageURI,
                catORdog: cORd,
            }), { method: "POST" }
        )
        .then((res) => res.text())
        .then((out) => console.log(out))
        .catch((err) => {
            console.log("Could not send query", err);
        });
}