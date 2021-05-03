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

    // showCountryData(data);
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

fetchScript();