function fetchWork() {
    fetch("https://rppi.artomweb.com/cache/work")
        .then((res) => res.json())
        .then((out) => working(out))
        .catch((err) => {
            console.log("failed to fetch from cache, work", err);
        });
}

fetchWork();

function working(data) {
    // console.log(data);
    let totalSeconds = data.totalSeconds;

    document.getElementById("hoursWorking").innerHTML = (totalSeconds / 3600).toFixed(2) + " hours";
}