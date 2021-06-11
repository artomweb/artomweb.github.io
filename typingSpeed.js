async function fetchMonkey() {
    const response = await fetch("https://spreadsheets.google.com/feeds/list/1KAEkM0SmmBlPAdkg7vcQyYMsSsMsjKcMnDf2xJijOFo/1/public/full?alt=json");

    const json = await response.json();

    console.log(json);

    let data = json.feed.entry.map((elt) => {
        return {
            Date: new Date(elt.gsx$date.$t),
            wpmAvg: elt.gsx$wpmavg.$t,
            rawAvg: elt.gsx$rawavg.$t,
            accAvg: elt.gsx$accavg.$t,
            corrAvg: elt.gsx$corravg.$t,
            incorrAvg: elt.gsx$incorravg.$t,
            consAvg: elt.gsx$consavg.$t,
        };
    });

    let weekAvg = _.chain(data)
        .groupBy((d) => {
            return moment(d.Date).format("W-YYYY");
        })
        .map((entries, week) => ({
            wofy: week,
            sum: Math.round(_.meanBy(entries, (entry) => +entry.wpmAvg) * 100) / 100,
        }))
        .sortBy((e) => e.Date)
        .value();

    console.log(weekAvg);

    plotMonkey(weekAvg);
}

function plotMonkey(data) {
    let labels = data.map((el) => el.wofy);
    let dat = data.map((el) => el.sum);
    let ctx = document.getElementById("monkeyChart").getContext("2d");

    let sleepChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: dat,
                backgroundColor: "#EFC7C2",
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
                // xAxes: [{
                //     type: "time",
                //     time: {
                //         unit: "day",
                //         round: "day",
                //         displayFormats: {
                //             day: "dd",
                //         },
                //     },
                // }, ],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        //             callback: function(value, index, values) {
                        //                 return secondsToMins(value);
                        //             },
                    },
                }, ],
            },
            tooltips: {
                //     callbacks: {
                //         label: function(tooltipItem, data) {
                //             let label = data.datasets[tooltipItem.datasetIndex].label || "";
                //             if (label) {
                //                 label += ": ";
                //             }
                //             label += secondsToMins(tooltipItem.yLabel);
                //             return label;
                //         },
                //         title: function(tooltipItem, data) {
                //             let title = tooltipItem[0].xLabel;
                //             title = moment(title, "dd").format("dddd");
                //             return title;
                //         },
                //     },
            },
        },
    });
}

fetchMonkey();