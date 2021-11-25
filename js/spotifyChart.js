let data; // sorted data from sheet
let myChart;
let config;
let toggleState = 0;
let ctx2;
let backgroundColor = "#81b29a";

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

function getPapaParseSpotify() {
    Papa.parse("https://rppi.artomweb.com/cache/spreadsheets/d/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/gviz/tq?tqx=out:csv&sheet=sheet1", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            parseSpotify(results.data);
        },
        error: function(error) {
            console.log("failed to fetch from cache, spotify");
            Papa.parse("https://docs.google.com/spreadsheets/d/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/gviz/tq?tqx=out:csv&sheet=sheet1", {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    parseSpotify(results.data);
                },
                error: function(error) {
                    console.log("failed both sources, uh oh, spotify");
                },
            });
        },
    });
}

getPapaParseSpotify();

// sorts the data and stores it globally as data,
function parseSpotify(results) {
    let dateParse = results.map((elem) => {
        return {
            Date: new Date(elem.Date),
            Value: elem.Value,
        };
    });

    data = dateParse.sort(function(a, b) {
        return b.Date.getTime() - a.Date.getTime();
    });

    spotifyChart(); // create the template chart
    spotifyToggle(); // change the text and dots with toggle state 0 and then increment toggle state for next call
}

// update the chart to show the data, aggregated by day, BAR CHART
function updateByDay() {
    const { avgs, labels } = aggregateByDay(data);

    if (myChart.config.type == "line") {
        myChart.destroy();
        let temp = {...config };

        temp.type = "bar";

        temp.data.labels = labels;

        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: avgs,
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

function aggregateByDay(dat) {
    let totalAvgs = _.chain(dat)
        .map((d) => {
            let day = moment(d.Date).format("dd");
            return {...d, dofw: day };
        })
        .groupBy("dofw")
        .map((entries, day) => ({
            dofw: day,
            avg: Math.round(_.meanBy(entries, (entry) => entry.Value)),
        }))
        .value();

    totalAvgs = _.sortBy(totalAvgs, (o) => {
        return moment(o.dofw, "dd").isoWeekday();
    });

    let labels = totalAvgs.map((val) => val.dofw);
    let avgs = totalAvgs.map((val) => val.avg);

    return { avgs, labels };
}

function processData(dat) {
    let labels = dat.map((e) => {
        return e.Date;
    });

    let rawData = dat.map((e) => {
        return e.Value;
    });

    return { rawData, labels };
}

// update the chart to show the data, for the last two weeks, LIN CHART
function updateTwoWeeks() {
    let { rawData, labels } = processData(data);
    rawData = rawData.slice(0, 14);
    labels = labels.slice(0, 14);

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: rawData,
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

function aggregateByWeek(dat) {
    let weekAvg = _.chain(dat)
        .groupBy((d) => {
            return moment(d.Date).format("W-YYYY");
        })
        .map((entries, week) => ({
            wofy: week,
            avg: _.sumBy(entries, (entry) => +entry.Value),
        }))
        .value();

    weekAvg.sort((a, b) => moment(a.wofy, "W-YYYY") - moment(b.wofy, "W-YYYY"));

    let labels = weekAvg.map((w) => w.wofy);
    let dataWeek = weekAvg.map((w) => w.avg);

    return { dataWeek, labels };
}

// update the chart to show the data, aggregated by week, LIN CHART
function updateAllData() {
    let { dataWeek, labels } = aggregateByWeek(data);
    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: dataWeek,
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