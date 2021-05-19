let data;
let myChart;
let aggrData;
let toggleState = 1;
let desc = document.getElementById("spotify-desc");

function spotifyToggle() {
    switch (toggleState) {
        case 0:
            desc.innerHTML =
                "How many songs have I listened to in the last two weeks";
            updateChartBase(true);
            break;

        case 1:
            desc.innerHTML = "How many songs have I listened to all time";
            updateChartBase(false);
            break;

        case 2:
            desc.innerHTML = "On which days do I listen to the most music";
            updateAggregate();
            break;
    }
    toggleState == 2 ? (toggleState = 0) : toggleState++;
}

async function newFetchSpotify() {
    const response = await fetch(
        "https://spreadsheets.google.com/feeds/list/1UYWe_3L4NiBU8_bwAbI1XTIRCToCDkOF44wUWVQ2gRE/1/public/full?alt=json"
    );

    const json = await response.json();

    data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            Value: elt.gsx$value.$t,
        };
    });

    data = data.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    aggregate(data);

    data = processData(data);

    let firstData = data.rawData.slice(0, 14);
    desc.innerHTML = "How many songs have I listened to in the last two weeks";

    spotifyChart(firstData);
}

newFetchSpotify();

function updateAggregate() {
    const { avgs, labels } = aggrData;
    // console.log(avgs);

    myChart.data.labels = labels;

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: avgs,
        backgroundColor: "#81b29a",
        // fill: false,
    };
    myChart.data.datasets = [newDataset];

    myChart.options.scales = {};

    //   console.log(myChart.data.datasets);

    myChart.update();
}

function aggregate(dat) {
    dat = dat.map((d) => {
        let day = moment(d.Date).format("dd");
        return { dofw: day, Date: d.Date, Value: +d.Value };
    });

    // console.log(dat);

    let totalAvgs = _.chain(dat)
        .groupBy("dofw")
        .map((entries, day) => ({
            dofw: day,
            avg: Math.round(_.meanBy(entries, (entry) => entry.Value) * 100) / 100,
        }))
        .value();

    totalAvgs = _.sortBy(totalAvgs, (o) => {
        return moment(o.dofw, "dd").isoWeekday();
    });

    let labels = totalAvgs.map((val) => val.dofw);
    let avgs = totalAvgs.map((val) => val.avg);

    // console.log(avgs);

    aggrData = { avgs, labels };
}

function updateChartBase(twoWeeks) {
    let { rawData, labels } = data;
    if (twoWeeks) {
        rawData = rawData.slice(0, 14);
        labels = labels.slice(0, 14);
    }

    myChart.data.labels = labels;

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: rawData,
        backgroundColor: "#81b29a",
        // fill: false,
    };
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

function processData(dat) {
    let labels = dat.map(function(e) {
        return new Date(e.Date);
    });

    let rawData = dat.map(function(e) {
        return e.Value;
    });

    return { rawData, labels };
}

function spotifyChart(allData) {
    let currData = data.rawData.slice(0, 14);
    let labels = data.labels.slice(0, 14);

    //   console.log(currData);

    let ctx2 = document.getElementById("spotifyChart").getContext("2d");
    myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: currData,
                backgroundColor: "#81b29a",
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
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label || "";

                        if (label) {
                            label += ": ";
                        }

                        if (toggleState == 0) {
                            label += tooltipItem.yLabel + " average";
                        } else {
                            label += tooltipItem.yLabel + " songs";
                        }

                        // label += tooltipItem.yLabel + (toggleState == 2 ? " average" : " songs");

                        return label;
                    },
                },
            },
        },
    });
    Chart.defaults.global.defaultFontColor = "#000";
}