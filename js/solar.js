let solarData = {};
let mySolarChart;
let solarCTX;
let solarToggleState = 0;

let solarBackgroundColor = "#8ecae6";

async function fetchRawSolar() {
    fetch("https://rppi.artomweb.com/cache/raw/solar")
        .then((res) => res.json())
        .then((out) => solarRawMain(out))
        .catch((err) => {
            console.log("failed to fetch from cache, solar", err);
        });
}

fetchRawSolar();

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

function solarRawMain(dataIn) {
    // console.log(dataIn);
    // solarData = data;

    dataIn.forEach((d) => {
        d.date = moment(d.image_taken_h);
    });

    let newData = _.chain(dataIn)
        .groupBy((d) => {
            return d.date.format("DD-MM-YY");
        })
        .map((entries, day) => {
            return {
                day: moment(day, "DD-MM-YY"),
                end: _.maxBy(entries, (entry) => entry.reading).reading,
            };
        })
        // .sortBy("date")
        .value();

    for (let i = 0; i < newData.length; i++) {
        let thisDay = newData[i];

        let yest = thisDay.day.clone().subtract(1, "day").format("DD-MM-YY");

        let found = newData.find((el) => {
            return el.day.format("DD-MM-YY") === yest;
        });

        if (found) {
            thisDay.changeDay = Math.floor((thisDay.end - found.end) * 100) / 100;
        }
    }

    newData = newData.filter((el) => el.changeDay !== undefined);

    let monthlyData = _.chain(newData)
        .groupBy((d) => {
            return d.day.format("MM-YY");
        })
        .map((entries, day) => {
            return {
                month: moment(day, "MM-YY"),
                changeMonth: Math.floor(_.sumBy(entries, (entry) => entry.changeDay) * 100) / 100,
            };
        })
        .value();
    console.log(monthlyData);

    newData.pop();
    let twoWeeks = newData.slice(-14);

    let twoWeekslabels = twoWeeks.map((d) => d.day);
    let twoWeeksdata = twoWeeks.map((d) => d.changeDay);

    solarData.lastTwoWeeks = { data: twoWeeksdata, labels: twoWeekslabels };

    let twoMonths = monthlyData.slice(-12);

    let twoMonthslabels = twoMonths.map((d) => d.month);
    let twoMonthsdata = twoMonths.map((d) => d.changeMonth);

    solarData.lastTwoMonths = { data: twoMonthsdata, labels: twoMonthslabels };

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