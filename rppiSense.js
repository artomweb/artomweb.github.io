async function mainFetchRppi() {
    const response = await fetch("https://rppi.artomweb.com");

    const json = await response.json();

    console.log(json);
}

mainFetchRppi();