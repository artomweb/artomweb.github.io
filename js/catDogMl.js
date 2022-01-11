function getNewImage() {
    fetch("https://rppi.artomweb.com/ml/catDog")
        .then((res) => res.json())
        .then((out) => insertCatDog(out))
        .catch((err) => {
            console.log("Could not get image data");
        });
}

getNewImage();

function insertCatDog(data) {
    let catDogImageRef = document.getElementById("catDogImage");
    catDogImageRef.src = "https://rppi.artomweb.com" + data.imageLink;
    console.log(data);
}