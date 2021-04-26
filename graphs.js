function showGraphs() {
    init();
    stepsInit();
    spotifyInit();
    hrInit();
}

let sleepSheetCsv =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7KSTLckW0c3wi-yuRfRD2SFpx1P3sSoVIK3IMFsoI26SLj-ycHqfdwwVW4zx1moJ4gXO1BTXOISjU/pub?gid=0&single=true&output=csv";

function init() {
    Papa.parse(sleepSheetCsv, {
        download: true,
        header: true,
        complete: showSleepGraph,
    });
}

window.addEventListener("DOMContentLoaded", showGraphs);

function secondsToMins(e) {
    let hours = (e / 3600).toString();
    let minutes = +(parseFloat("." + hours.split(".")[1]) * 60).toFixed() || "00";
    minutes = ("0" + minutes).slice(-2);
    return hours.split(".")[0] + ":" + minutes;
}

function showSleepGraph(inData) {
    allData = inData.data;

    allData.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    if (allData.length > 7) {
        allData = allData.slice(0, 7);
    }

    let labels = allData.map(function(e) {
        return new Date(e.Date);
    });

    let data = allData.map(function(e) {
        return e.Duration;
    });

    let ctx = document.getElementById("sleep").getContext("2d");
    let myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                tension: 0.3,
                data: data,
                backgroundColor: colors[0],
            }, ],
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                            day: "MMM D",
                        },
                    },
                }, ],
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
                },
            },
        },
    });
}

let stepsSheetCsv =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTuGUT0ubwboYgwiZo2owljuAdWeqH3uVeMJ4GkgHOLTZjMDQy5I4x1uTAGScssnkOLRcXkQY7WxOj-/pub?output=csv";

function stepsInit() {
    Papa.parse(stepsSheetCsv, {
        download: true,
        header: true,
        complete: showStepsGraph,
    });
}

function showStepsGraph(inData) {
    let allData = inData.data;

    allData.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    if (allData.length > 7) {
        allData = allData.slice(0, 7);
    }

    let labels = allData.map(function(e) {
        return new Date(e.Date);
    });

    let data = allData.map(function(e) {
        return e.Steps;
    });

    let ctx2 = document.getElementById("steps").getContext("2d");
    let myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                tension: 0.3,

                data: data,
                backgroundColor: colors[1],
            }, ],
        },

        options: {
            maintainAspectRatio: true,
            responsive: true,

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
                            day: "MMM D",
                        },
                    },
                }, ],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }, ],
            },
        },
    });
}

// Spotify

let spotifySheetCsv =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSw3m_yyTByllweTNnIM13oR_P4RSXG2NpF3jfYKpmPtsS8a_s8qA7YIOdzaRgl6h5b2TSaY5ohuh6J/pub?output=csv";

function spotifyInit() {
    Papa.parse(spotifySheetCsv, {
        download: true,
        header: true,
        complete: showSpotifyGraph,
    });
}

function showSpotifyGraph(inData) {
    let allData = inData.data;

    allData.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    if (allData.length > 7) {
        allData = allData.slice(0, 7);
    }

    let labels = allData.map(function(e) {
        return new Date(e.Date);
    });

    let data = allData.map(function(e) {
        // return e.Duration;
        return e.Value;
    });

    let ctx2 = document.getElementById("spotify").getContext("2d");
    let myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                tension: 0.3,

                data: data,
                backgroundColor: colors[2],
            }, ],
        },

        options: {
            maintainAspectRatio: true,
            responsive: true,

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
                            day: "MMM D",
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

                        label += tooltipItem.yLabel + " songs";
                        return label;
                    },
                },
            },
        },
    });
}

let hrSheetCsv =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-bk-dIWZk-rrHjQWwhjKx-6XcYYIoXKfMmfe3SxY9fWstqk_iqVvvnKT1wwH43eiZCVuRm-SWjCc_/pub?output=csv";

function hrInit() {
    Papa.parse(hrSheetCsv, {
        download: true,
        header: true,
        complete: showHrGraph,
    });
}

function showHrGraph(inData) {
    let allData = inData.data;

    allData.sort(function(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    if (allData.length > 7) {
        allData = allData.slice(0, 7);
    }

    let labels = allData.map(function(e) {
        return new Date(e.Date);
    });

    let data = allData.map(function(e) {
        return parseInt(e.Value);
    });

    let ctx2 = document.getElementById("hr").getContext("2d");
    let myChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                tension: 0.3,
                data: data,
                backgroundColor: colors[3],
            }, ],
        },

        options: {
            maintainAspectRatio: true,
            responsive: true,

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
                            day: "MMM D",
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

                        label += tooltipItem.yLabel + "BPM";
                        return label;
                    },
                },
            },
        },
    });
}