function showCatFacts(facts) {
    const container = document.getElementById("factContainer");
    const factsList = facts.map((fact) => {
        return "<li>" + fact.fact + "</li>";
    });

    // console.log(factsList);

    container.innerHTML = "<ul>" + factsList.join("") + "</ul>";
}

async function fetchCatFacts() {
    const response = await fetch(
        "https://catfact.ninja/facts?limit=5&max_length=140"
    );

    const json = await response.json();

    showCatFacts(json.data);
}

fetchCatFacts();