/**
 * Creates a time message from a number of seconds, eg 1 day, 2 hours
 *
 * @param {number} delta The amount of time to be converted (in seconds).
 * @param {boolean} noMins If true, the message will not contain time shorter than minutes
 * @returns {string} The time message EG: 1 years, 2 days, 3 hours, 4 minutes, 5 seconds
 */
function createTimeMessage(delta, noMins = false) {
    let message = "";

    let years = Math.floor(delta / 31540000);
    delta -= years * 31540000;

    if (years > 0) {
        message += years;

        if (years == 1) {
            message += " year";
        } else {
            message += " years";
        }
    }

    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    if (days > 0) {
        if (message !== "") {
            message += ", ";
        }
        message += days;

        if (days == 1) {
            message += " day";
        } else {
            message += " days";
        }
    }

    let hours = Math.floor(delta / 3600);
    delta -= hours * 3600;
    hours %= 24;

    if (years == 0) {
        if (hours > 0) {
            if (message !== "") {
                message += ", ";
            }
            message += hours;

            if (hours == 1) {
                message += " hour";
            } else {
                message += " hours";
            }
        }
    }

    if ((message === "" || days == 0 || hours == 0) && !noMins) {
        let minutes = Math.floor(delta / 60);
        delta -= minutes * 60;

        if (minutes > 0) {
            if (message !== "") {
                message += ", ";
            }
            message += minutes;

            if (minutes == 1) {
                message += " minute";
            } else {
                message += " minutes";
            }
        }
    }

    if (message === "" && !noMins) {
        if (delta > 0) {
            if (message !== "") {
                message += ", ";
            }
            message += delta;

            if (delta == 1) {
                message += " second";
            } else {
                message += " seconds";
            }
        }
    }

    return message;
}

function findLineByLeastSquares(values_y) {
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let count = 0;

    let x = 0;
    let y = 0;
    let values_length = values_y.length;

    if (values_length === 0) {
        return [
            [],
            []
        ];
    }

    for (let v = 0; v < values_length; v++) {
        x = v + 1;
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
        count++;
    }

    let m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
    let b = sum_y / count - (m * sum_x) / count;

    let returnpoint1 = [1, 1 * m + b];
    let returnpoint2 = [values_length, values_length * m + b];
    return [returnpoint1, returnpoint2];
}

let touchButtons = document.querySelectorAll(".button");

touchButtons.forEach((but) => {
    but.addEventListener("touchstart", function(e) {
        but.classList.add("active");
        setTimeout(function() {
            but.classList.remove("active");
        }, 200);
    });
});