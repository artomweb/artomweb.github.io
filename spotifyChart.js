let data;
let myChart;
let toggleState = 1;

function switchDots(dot) {
    let circle1 = document.getElementById("circle1");
    let circle2 = document.getElementById("circle2");
    let circle3 = document.getElementById("circle3");
    let desc = document.getElementById("spotify-desc");

    switch (dot) {
        case 0:
            desc.innerHTML =
                "How many songs have I listened to in the last two weeks";
            circle1.style.fill = "black";
            circle2.style.fill = "none";
            circle3.style.fill = "none";
            break;
        case 1:
            desc.innerHTML = "All data by week";
            circle2.style.fill = "black";
            circle1.style.fill = "none";
            circle3.style.fill = "none";

            break;
        case 2:
            desc.innerHTML = "On average, which days do I listen to the most music";
            circle3.style.fill = "black";
            circle1.style.fill = "none";
            circle2.style.fill = "none";
            break;
    }
}

function spotifyToggle() {
    switch (toggleState) {
        case 0:
            updateChartTwoWeeks(data);
            switchDots(0);
            break;

        case 1:
            updateChartWeeks();
            switchDots(1);
            break;

        case 2:
            updateAggregate();
            switchDots(2);
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

    switchDots(0);

    spotifyChart();
}

newFetchSpotify();

function updateAggregate() {
    const { avgs, labels } = aggregateByDay(data);

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

function aggregateByDay(dat) {
    dat = dat.map((d) => {
        let day = moment(d.Date).format("dd");
        return { dofw: day, Date: d.Date, Value: +d.Value };
    });

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

    return { avgs, labels };
}

function aggregateByWeek(dat) {
    // console.log(moment(dat[0].Date).format("YY-M"));
    let weekAvg = _.chain(dat)
        .groupBy((d) => {
            return moment(d.Date).format("W-YYYY");
        })
        .map((entries, week) => ({
            wofy: week,
            avg: Math.round(_.meanBy(entries, (entry) => +entry.Value) * 100) / 100,
        }))
        .value();

    let labels = weekAvg.map((w) => w.wofy);
    let dataWeek = weekAvg.map((w) => w.avg);

    return { dataWeek, labels };
}

function updateChartWeeks() {
    let { dataWeek, labels } = aggregateByWeek(data);
    // console.log(values);
    myChart.data.labels = labels;

    // console.log(labels, dataWeek);

    let newDataset = {
        // tension: 0.3,
        // borderColor: "black",
        data: dataWeek,
        backgroundColor: "#81b29a",
        // fill: false,
    };
    myChart.data.datasets = [newDataset];

    myChart.options.scales = {};

    //   console.log(myChart.data.datasets);

    myChart.update();
}

function updateChartTwoWeeks() {
    let { rawData, labels } = processData(data);
    rawData = rawData.slice(0, 14);
    labels = labels.slice(0, 14);

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
    let labels = dat.map((e) => {
        return new Date(e.Date);
    });

    let rawData = dat.map((e) => {
        return e.Value;
    });

    return { rawData, labels };
}

function spotifyChart() {
    allData = data.slice(0, 14);
    let { rawData, labels } = processData(allData);

    //   console.log(currData);

    let ctx2 = document.getElementById("spotifyChart").getContext("2d");
    myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: rawData,
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

                    title: function(tooltipItem, data) {
                        let title = tooltipItem[0].xLabel;
                        if (toggleState == 0) {
                            title = moment(title, "dd").format("dddd");
                        }
                        return title;
                    },
                },
            },
        },
    });
    Chart.defaults.global.defaultFontColor = "#000";
}