let pubData = [];

function showCatFacts(facts) {
    const container = document.getElementById("factContainer");
    const factsList = facts.map((fact) => {
        return "<li>" + fact.fact + "</li>";
    });

    // console.log(factsList);

    container.innerHTML = factsList.join("");
}

function showCountryData(data) {
    const container = document.getElementById("visitors");

    data = data.sort((a, b) => {
        return b.Users - a.Users;
    });

    const countryList = data.map((cntry) => {
        if (cntry.Users != 1) {
            return "<li>" + cntry.Country + ": " + cntry.Users + " people</li>";
        }
        return "<li>" + cntry.Country + ": " + cntry.Users + " person</li>";
    });
    container.innerHTML = countryList.join("");
}

function newShowSpotify(data) {
    const container = document.getElementById("spotify");
    const factsList = data.map((elt) => {
        return "<li>" + elt.Date + ": " + elt.Value + "</li>";
    });

    // console.log(factsList);

    container.innerHTML = factsList.join("");
}

async function fetchCatFacts() {
    const response = await fetch(
        "https://catfact.ninja/facts?limit=5&max_length=140"
    );

    const json = await response.json();

    showCatFacts(json.data);
}

async function fetchScript() {
    const response = await fetch(
        "https://spreadsheets.google.com/feeds/list/1Sh95Z--GGIA4m1akcMSgHMeY06t8OR2JXffgYF9lC50/1/public/full?alt=json"
    );

    const json = await response.json();

    let data = json.feed.entry.map((elt) => {
        return {
            Country: elt.gsx$country.$t,
            Users: elt.gsx$users.$t,
        };
    });

    showCountryData(data);
}

async function newFetchSpotify() {
    const response = await fetch(
        "https://spreadsheets.google.com/feeds/list/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/1/public/full?alt=json"
    );

    const json = await response.json();

    let data = json.feed.entry.map((elt) => {
        return {
            Date: elt.gsx$date.$t,
            Value: elt.gsx$value.$t,
        };
    });

    // console.log(data);

    newShowSpotify(data);
}

newFetchSpotify();
fetchScript();
fetchCatFacts();