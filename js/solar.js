let solarData = {};
let mySolarChart;
let solarCTX;
let solarToggleState = 0;

let solarBackgroundColor = "#8ecae6";

async function fetchSolar() {
    fetch("https://rppi.artomweb.com/cache/solar")
        .then((res) => res.json())
        .then((out) => solarMain(out))
        .catch((err) => {
            console.log("failed to fetch from cache, solar", err);
        });
}

fetchSolar();

function switchSolarDots() {
    let circles = Array.from(document.getElementsByClassName("solarCircles"));
    let desc = document.getElementById("solar-desc");

    switch (solarToggleState) {
        case 0:
            desc.innerHTML = "Which months have been the most sunny, in the past year";
            break;
        case 1:
            desc.innerHTML = "Which days have been the most sunny, in the past two weeks";
            break;
    }
    circles.forEach((c) => (c.id.slice(-1) == solarToggleState ? (c.style.fill = "black") : (c.style.fill = "none")));
}

function solarToggle() {
    switchSolarDots();
    switch (solarToggleState) {
        case 0:
            solarLastTwoMonths();
            break;

        case 1:
            solarLastTwoWeeks();
            break;
    }
    solarToggleState == 1 ? (solarToggleState = 0) : solarToggleState++;
}

function solarMain(dataIn) {
    solarData = dataIn;

    plotSolar();
    solarToggle();
}

function solarLastTwoMonths() {
    let { data, labels } = solarData.lastTwoMonths;

    // console.log(data, labels);

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: data,
        backgroundColor: solarBackgroundColor,
        // fill: false,
    };

    if (mySolarChart.config.type == "bar") {
        mySolarChart.destroy();
        let temp = {...config };

        temp.type = "line";

        temp.data.labels = labels;

        temp.data.datasets = [newDataset];

        temp.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    unit: "month",
                    round: "month",
                    displayFormats: {
                        day: "MM",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        mySolarChart = new Chart(ctx2, temp);
    } else {
        mySolarChart.data.labels = labels;

        mySolarChart.data.datasets = [newDataset];

        mySolarChart.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    tooltipFormat: "MMMM-YYYY",
                    unit: "month",
                    round: "month",
                    displayFormats: {
                        day: "MM",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        //   console.log(mySolarChart.data.datasets);

        mySolarChart.update();
    }
}

function solarLastTwoWeeks() {
    const { data, labels } = solarData.lastTwoWeeks;

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: data,
        backgroundColor: solarBackgroundColor,
        // fill: false,
    };

    if (mySolarChart.config.type == "bar") {
        mySolarChart.destroy();
        let temp = {...config };

        temp.type = "line";

        temp.data.labels = labels;

        temp.data.datasets = [newDataset];

        temp.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    unit: "day",
                    round: "day",
                    displayFormats: {
                        day: "dd",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        mySolarChart = new Chart(ctx2, temp);
    } else {
        mySolarChart.data.labels = labels;

        mySolarChart.data.datasets = [newDataset];

        mySolarChart.options.scales = {
            xAxes: [{
                type: "time",
                time: {
                    unit: "day",
                    round: "day",
                    displayFormats: {
                        day: "dd",
                    },
                },
            }, ],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
            }, ],
        };

        //   console.log(mySolarChart.data.datasets);

        mySolarChart.update();
    }
}

function plotSolar() {
    solarCTX = document.getElementById("solarChart").getContext("2d");

    let config = {
        type: "line",
        data: {
            // labels: labels,
            datasets: [{
                tension: 0.2,
                // borderColor: "black",
                // data: dat,
                backgroundColor: "#8ecae6",
                // fill: false,
            }, ],
        },

        options: {
            maintainAspectRatio: true,
            responsive: true,

            // layout: {
            //     padding: {
            //         left: 0,
            //         right: 25,
            //         top: 20,
            //         bottom: 20,
            //     },
            // },

            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,

                        // min: 5,
                    },
                }, ],
                xAxes: [{
                    autoSkip: true,
                    maxTicksLimit: 2,
                    type: "time",
                    time: {
                        unit: "day",
                        round: "day",
                        displayFormats: {
                            day: "dd",
                        },
                    },
                }, ],
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return (tooltipItem.yLabel += "k Watt Hours");
                    },
                },
            },
        },
    };

    mySolarChart = new Chart(solarCTX, config);
}