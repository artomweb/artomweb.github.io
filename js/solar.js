async function fetchSolar() {
    Papa.parse("https://rppi.artomweb.com/cache/spreadsheets/d/1QwrB_H8QE7fxDc05FGbmGm7ch59pXuJ73vM5Jl9VA-E/tq?tqx=out:csv&sheet=sheet1", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            solarMain(results.data);
        },
        error: function(error) {
            console.log("failed to fetch from cache, games");
            Papa.parse("https://docs.google.com/spreadsheets/d/1QwrB_H8QE7fxDc05FGbmGm7ch59pXuJ73vM5Jl9VA-E/gviz/tq?tqx=out:csv&sheet=sheet1", {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    solarMain(results.data);
                },
                error: function(error) {
                    console.log("failed to fetch from both sources, games");
                },
            });
        },
    });
}

fetchSolar();

function solarMain(data) {
    data = data.filter((d) => d.change != null);

    data.forEach((d) => {
        d.date = moment(d.image_taken_h);
    });

    // console.log(data);
    for (let i = 1; i < data.length; i++) {
        let duration = moment.duration(data[i].date.diff(data[i - 1].date));
        data[i].changePerMin = data[i].change / duration.asMinutes();
        // console.log(data[i].reading, duration.asMinutes(), data[i].changePerMin);
    }

    // console.log(Math.floor(data[0].date.valueOf() / (1000 * 60 * 15)));

    let dataAggr = _.chain(data)
        .groupBy((d) => {
            return d.date.format("DD-MM-YY");
        })
        .map((entries, day) => {
            return {
                day: moment(day, "DD-MM-YY"),
                avg: Math.floor(_.sumBy(entries, (entry) => +entry.change) * 100) / 100,
            };
        })
        // .sortBy((d) => +d.hour)
        .value();

    // console.log(dataAggr);
    dataAggr.pop();
    dataAggr = dataAggr.slice(-14);
    // console.log(dataAggr);

    let labels = dataAggr.map((d) => d.day);
    let dat = dataAggr.map((d) => d.avg);

    // let hours = ["01", "12", "24"];

    // let allLabels = labels.slice();

    // labels.forEach((label, idx) => {
    //     // idx % 6 == 0 ? label : "";
    //     if (!hours.includes(label)) {
    //         labels[idx] = "";
    //     }
    // });

    plotSolar(labels, dat, labels);
}

function plotSolar(labels, dat, allLabels) {
    let ctx2 = document.getElementById("solarChart").getContext("2d");
    config = {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                // tension: 0.3,
                // borderColor: "black",
                data: dat,
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
                        // let label = data.datasets[tooltipItem.datasetIndex].label || "";

                        // console.log(tooltipItem);

                        return (tooltipItem.yLabel += "k Watt Hours");
                    },
                },
            },
        },
    };
    let myChart = new Chart(ctx2, config);
}