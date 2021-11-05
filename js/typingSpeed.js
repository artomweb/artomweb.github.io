function getPapaParse() {
    Papa.parse("https://docs.google.com/spreadsheets/d/1bpABRveXtGeY5Sqlzi2ul33i8Qp-ehhSDIFaMigKGfk/gviz/tq?tqx=out:csv&sheet=sheet1", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results, file) {
            fetchMonkey(results.data);
        },
    });
}

getPapaParse();

function showSymbols() {
    let symbols = document.getElementsByClassName("symbol");

    for (let s of symbols) {
        s.style.display = "inline";
    }
}

function fetchMonkey(data) {
    // console.log(data);
    showSymbols();

    data.forEach((elt) => {
        elt.dateTime = new Date(elt.dateTime);
    });

    let weekAvg = _.chain(data)
        .groupBy((d) => {
            return moment(d.dateTime).format("MMM YYYY");
        })
        .map((entries, week) => {
            // console.log(entries);
            return {
                wofy: week,
                sum: Math.round(_.meanBy(entries, (entry) => +entry.wpm) * 10) / 10,
            };
        })
        .value();

    weekAvg.sort((a, b) => moment(a.wofy, "MMM YYYY") - moment(b.wofy, "MMM YYYY"));
    // console.log(weekAvg);

    // console.log(weekAvg);

    let labels = weekAvg.map((el) => el.wofy);
    let dat = weekAvg.map((el) => el.sum);

    plotMonkey(labels, dat);

    let maxWPM = +_.maxBy(data, "wpm").wpm;

    let sortedWPM = _.sortBy(data, (point) => point.dateTime.getTime());

    let firstTest = sortedWPM[0];
    let lastTest = sortedWPM[sortedWPM.length - 1];

    let dayDiff = (lastTest.dateTime - firstTest.dateTime) / (1000 * 60 * 60 * 24);

    let testsPerDay = sortedWPM.length / dayDiff;

    console.log(testsPerDay);

    let wpmPoints = sortedWPM.map((point) => point.wpm);

    let trend = findLineByLeastSquares(wpmPoints);

    let wpmChange = trend[1][1] - trend[0][1];

    let delta = data.length * 30;

    let changeInWPMPerMin = wpmChange * (3600 / delta);

    let plus = changeInWPMPerMin > 0 ? "+" : "";

    let avgWPM = _.meanBy(data, (o) => +o.wpm).toFixed(2);
    let avgAcc = Math.round(
        _.meanBy(data, (o) => +o.acc),
        0
    );

    let message = createTimeMessage(delta);

    document.getElementById("highestTypingSpeed").innerHTML = maxWPM.toFixed(2);
    document.getElementById("averageTypingSpeed").innerHTML = avgWPM;
    document.getElementById("averageAccuracy").innerHTML = avgAcc;
    document.getElementById("totalTime").innerHTML = message;
    document.getElementById("testsPerDay").innerHTML = testsPerDay.toFixed(1);
    document.getElementById("wpmChangePerHour").innerHTML = plus + changeInWPMPerMin.toFixed(2);
}

function plotMonkey(labels, dat) {
    let ctx = document.getElementById("monkeyChart").getContext("2d");

    let sleepChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: dat,
                backgroundColor: "#F4A4A4",

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
                    ticks: {
                        // autoSkip: true,
                        maxTicksLimit: 6.3,
                        stepSize: 5,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                    // type: "time",
                    // time: {
                    //     unit: "week",
                    //     round: "week",
                    //     displayFormats: {
                    //         day: "W-YYYY",
                    //     },
                    // },
                }, ],
                yAxes: [{
                    ticks: {
                        // beginAtZero: true,
                        //             callback: function(value, index, values) {
                        //                 return secondsToMins(value);
                        //             },
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
                        label += tooltipItem.yLabel + " WPM";
                        return label;
                    },
                    //         title: function(tooltipItem, data) {
                    //             let title = tooltipItem[0].xLabel;
                    //             title = moment(title, "dd").format("dddd");
                    //             return title;
                    //         },
                },
            },
        },
    });
}

// fetchMonkey();