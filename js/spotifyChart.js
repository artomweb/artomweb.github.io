let spotifyData;
let myChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

function getPapaParseSpotify() {
    fetch("https://rppi.artomweb.com/cache/spotify")
        .then((res) => res.json())
        .then((out) => parseSpotify(out))
        .catch((err) => {
            console.log("failed to fetch from cache, spotify", err);
        });
}

getPapaParseSpotify();

// changes the description to the relevant text and changes the fill of the circles
function switchDots() {
    let circles = [document.getElementById("circle0"), document.getElementById("circle1"), document.getElementById("circle2")];
    let desc = document.getElementById("spotify-desc");

    switch (toggleState) {
        case 0:
            desc.innerHTML = "On average, which days do I listen to the most music";
            break;
        case 1:
            desc.innerHTML = "How many songs have I listened to in the last two weeks";
            break;
        case 2:
            desc.innerHTML = "All data";
            break;
    }
    circles.forEach((c) => (c.id.slice(-1) == toggleState ? (c.style.fill = "black") : (c.style.fill = "none")));
}

// updates the chart, calls the function to update the text and switch the dots and LASTLY increments the toggleState
function spotifyToggle() {
    switchDots();
    switch (toggleState) {
        case 0:
            updateByDay();
            break;

        case 1:
            updateTwoWeeks();
            break;

        case 2:
            updateAllData();
            break;
    }
    toggleState == 2 ? (toggleState = 0) : toggleState++;
}

function parseSpotify(dataIn) {
    spotifyData = dataIn;

    spotifyChart();
    spotifyToggle();
}

// update the chart to show the data, aggregated by day, BAR CHART
function updateByDay() {
    const { data, labels } = spotifyData.byDay;

    if (myChart.config.type == "line") {
        myChart.destroy();
        let temp = {...config };

        temp.type = "bar";

        temp.data.labels = labels;

        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: data,
            backgroundColor,
            // fill: false,
        };
        temp.data.datasets = [newDataset];

        temp.options.scales.xAxes[0] = { offset: true };

        myChart = new Chart(ctx2, temp);
    } else {
        myChart.data.labels = labels;
        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: avgs,
            backgroundColor,
            // fill: false,
        };
        myChart.data.datasets = [newDataset];
        myChart.options.scales = {};
        //   console.log(myChart.data.datasets);
        myChart.update();
    }
}

// update the chart to show the data, for the last two weeks, LIN CHART
function updateTwoWeeks() {
    let { data, labels } = spotifyData.lastTwoWeeks;

    labels = labels.map((l) => new Date(l));

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: data,
        backgroundColor,
        // fill: false,
    };

    if (myChart.config.type == "bar") {
        myChart.destroy();
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

        myChart = new Chart(ctx2, temp);
    } else {
        myChart.data.labels = labels;

        myChart.data.datasets = [newDataset];

        myChart.options.scales = {
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

        //   console.log(myChart.data.datasets);

        myChart.update();
    }
}

// update the chart to show the data, aggregated by week, LINE CHART
function updateAllData() {
    let { data, labels } = spotifyData.byWeek;
    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: data,
        backgroundColor,
        // fill: false,
    };
    // console.log(values);

    if (myChart.config.type == "bar") {
        myChart.destroy();
        let temp = {...config };
        temp.type = "line";

        temp.data.labels = labels;

        temp.data.datasets = [newDataset];

        temp.options.scales = {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }, ],
        };
    } else {
        myChart.data.labels = labels;

        myChart.data.datasets = [newDataset];

        myChart.options.scales = {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }, ],
        };

        //   console.log(myChart.data.datasets);

        myChart.update();
    }
}

// plot the template chart
function spotifyChart() {
    // let rawData = [589, 445, 483, 503, 689, 692, 634];
    // let labels = ["S", "M", "T", "W", "T", "F", "S"];

    //   console.log(currData);

    ctx2 = document.getElementById("spotifyChart").getContext("2d");
    config = {
        type: "line",
        data: {
            // labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                // data: rawData,
                backgroundColor,
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
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label || "";

                        if (label) {
                            label += ": ";
                        }

                        if (toggleState == 1) {
                            label += tooltipItem.yLabel + " average";
                        } else {
                            label += tooltipItem.yLabel + " songs";
                        }

                        // label += tooltipItem.yLabel + (toggleState == 2 ? " average" : " songs");

                        return label;
                    },

                    title: function(tooltipItem, data) {
                        let title = tooltipItem[0].xLabel;
                        if (toggleState == 1) {
                            title = moment(title, "dd").format("dddd");
                        }
                        return title;
                    },
                },
            },
        },
    };
    myChart = new Chart(ctx2, config);
    Chart.defaults.global.defaultFontColor = "#000";
}