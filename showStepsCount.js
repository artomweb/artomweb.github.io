async function fetchSteps() {
    const response = await fetch(
        "https://spreadsheets.google.com/feeds/list/15PbAyFyxjhlkCjpsk-VR2v1KsRIQCydOISzUBg88O9o/1/public/full?alt=json"
    );

    const json = await response.json();

    let data = json.feed.entry.map((elt) => {
        return {
            Date: elt.gsx$date.$t,
            Steps: elt.gsx$steps.$t,
        };
    });

    data = data.sort(
        (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    console.log(data[data.length - 1]);

    // let chosenDate = data[data.length - 2];
    let chosenDate = data[Math.floor(Math.random() * data.length)];

    let lengthSteps = (chosenDate.Steps * 0.67056).toFixed();

    const response2 = await fetch(
        "https://blog-one-roan-39.vercel.app/api?measure=" + lengthSteps
    );

    const json2 = await response2.json();

    console.log(json2);

    let elem = document.getElementById("stepsDistance");

    let closeWords = ["about", "close to", "approximately", "roughly"];

    elem.innerHTML =
        "On " +
        new Date(chosenDate.Date).toDateString() +
        " I walked " +
        lengthSteps +
        " meters. Thats " +
        closeWords[Math.floor(Math.random() * closeWords.length)] +
        " the " +
        json2["measureName"] +
        " (" +
        json2["actualValue"] +
        "m)";
}

fetchSteps();