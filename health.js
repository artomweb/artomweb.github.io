let sleepData;
let sleepChart;
let configSl;
let toggleStateSl = 0;
let ctxSl;
let backgroundColorSl = "#8ecae6";

async function fetchHealth() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1CIYOalNR0s8359XEJRbpMfnixpXUIfuHOL1o_IQfn4E/1/public/full?alt=json");

    const json = await response.json();

    // console.log(json);

    let data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            SleepDuration: elt.gsx$sleepduration.$t,
            AwakeDuration: elt.gsx$awakeduration.$t,
            BedIn: elt.gsx$bedin.$t,
            BedOut: elt.gsx$bedout.$t,
            DeepDuration: elt.gsx$deepduration.$t,
            LightDuration: elt.gsx$lightduration.$t,
            HrAverage: elt.gsx$hraverage.$t,
            nbawake: elt.gsx$nbawake.$t,
            SleepScore: elt.gsx$sleepscore.$t,
        };
    });

    sleepData = data.sort(function(a, b) {
        return b.Date.getTime() - a.Date.getTime();
    });

    console.log(data);

    plotSleep();
    sleepToggle();

    // plotDailySleep(data)
}

fetchHealth();

function switchDotsSl() {
    let circles = [document.getElementById("Slcircle0"), document.getElementById("Slcircle1")];
    let desc = document.getElementById("sleepDesc");

    switch (toggleStateSl) {
        case 0:
            desc.innerHTML = "On average, which days do I listen to the most music";
            break;
        case 1:
            desc.innerHTML = "On average, what time do I usually wake up";
            break;
    }
    circles.forEach((c) => (c.id.slice(-1) == toggleStateSl ? (c.style.fill = "black") : (c.style.fill = "none")));
}

function sleepToggle() {
    switchDotsSl();
    switch (toggleStateSl) {
        case 0:
            updateSleepDays();
            break;

        case 1:
            updateSleepHours();
            break;
    }
    toggleStateSl == 1 ? (toggleStateSl = 0) : toggleStateSl++;
}

function aggregateSleepByDay() {
    let dailyAvg = _.chain(sleepData)
        .groupBy((d) => {
            return moment(d.Date).format("dd");
        })
        .map((entries, week) => ({
            dofw: week,
            avg: _.meanBy(entries, (entry) => +entry.SleepDuration),
        }))
        .sortBy((o) => moment(o.dofw, "dd").isoWeekday())
        .value();

    let labels = dailyAvg.map((w) => w.dofw);
    let dataDay = dailyAvg.map((w) => w.avg);

    return { dataDay, labels };
}

function aggregateSleepByHour() {
    let hourAvg = _.chain(sleepData)
        .groupBy((h) => {
            return moment(h.BedOut, "H:m").format("h a");
        })
        .map((entries, hour) => ({
            hofd: hour,
            tot: entries.length,
        }))
        .sortBy((o) => moment(o.hofd, "H a"))
        .value();

    let labels = hourAvg.map((w) => w.hofd);
    let dataTot = hourAvg.map((w) => w.tot);

    return { dataTot, labels };
}

function updateSleepHours() {
    let { dataTot, labels } = aggregateSleepByHour();

    if (sleepChart.config.type == "bar") {
        sleepChart.destroy();
        let temp = jQuery.extend(true, {}, configSl);

        // let minVal = _.min(dataDay);

        temp.type = "line";

        temp.data.labels = labels;

        let newDataset = {
            // tension: 0.3,
            // borderColor: "black",
            data: dataTot,
            backgroundColor: backgroundColorSl,
            // fill: false,
        };
        temp.data.datasets = [newDataset];

        // temp.options.scales.xAxes[0] = { offset: true };
        temp.options.scales = {};
        temp.options.tooltips = {};

        sleepChart = new Chart(ctxSl, temp);
    } else {
        sleepChart.data.labels = labels;
        let newDataset = {
            data: dataTot,
            backgroundColor: backgroundColorSl,
        };
        sleepChart.data.datasets = [newDataset];
        sleepChart.options.scales = {};
        sleepChart.options.tooltips = {};
    }

    sleepChart.options.scales.yAxes[0].ticks.beginAtZero = true;

    sleepChart.options.scales.xAxes = [{
        ticks: {
            maxTicksLimit: 6.3,
            stepSize: 5,
            maxRotation: 0,
            minRotation: 0,
        },
    }, ];
    sleepChart.update();
}

function secondsToMins(e) {
    let hours = (e / 3600).toString();
    let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
    minutes = ("0" + minutes).slice(-2);
    return hours.split(".")[0] + ":" + minutes;
}

function updateSleepDays() {
    let { dataDay, labels } = aggregateSleepByDay();

    if (sleepChart.config.type == "line") {
        sleepChart.destroy();
        let temp = jQuery.extend(true, {}, configSl);

        temp.type = "bar";

        temp.data.labels = labels;

        let newDataset = {
            data: dataDay,
            backgroundColor: backgroundColorSl,
        };
        temp.data.datasets = [newDataset];

        temp.options.scales.xAxes[0] = { offset: true };

        sleepChart = new Chart(ctxSl, temp);
    } else {
        sleepChart.data.labels = labels;
        let newDataset = {
            data: dataDay,
            backgroundColor: backgroundColorSl,
        };
        sleepChart.data.datasets = [newDataset];
        sleepChart.update();
    }
}

function plotSleep() {
    // let rawData = data.map((e) => e.SleepDuration);
    // let labels = data.map((e) => e.Date);
    ctxSl = document.getElementById("sleepChart").getContext("2d");

    configSl = {
        type: "bar",
        data: {
            datasets: [{
                backgroundColor: "#8ecae6",
            }, ],
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,

            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return secondsToMins(value);
                        },
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

                        label += secondsToMins(tooltipItem.yLabel);
                        return label;
                    },
                    title: function(tooltipItem, data) {
                        let title = tooltipItem[0].xLabel;
                        title = moment(title, "dd").format("dddd");
                        return title;
                    },
                },
            },
        },
    };
    sleepChart = new Chart(ctxSl, configSl);
}