/**
 * Creates a time message from a number of seconds, eg 1 day, 2 hours
 *
 * @param {number} delta The amount of time to be converted (in seconds).
 * @param {number} units The number of units to return, 2 will be days and hours, 1 will be just hours etc beginning with the largest unit
 * @returns {string} The time message EG: 1 year, 2 days, 3 hours, 4 minutes, 5 seconds
 */
function createTimeMessage(delta, units = 1) {
    let message = "";

    let numberOfUnits = 0;

    let years = Math.floor(delta / 31540000);

    if (years > 0) {
        delta -= years * 31540000;
        message += years;

        if (years == 1) {
            message += " year";
        } else {
            message += " years";
        }
        numberOfUnits++;
    }

    if (numberOfUnits >= units) return message;

    let days = Math.floor(delta / 86400);

    if (days > 0) {
        delta -= days * 86400;

        if (message !== "") {
            message += ", ";
        }
        message += days;

        if (days == 1) {
            message += " day";
        } else {
            message += " days";
        }
        numberOfUnits++;
    }

    if (numberOfUnits >= units) return message;

    let hours = Math.floor(delta / 3600);

    if (hours > 0) {
        delta -= hours * 3600;
        hours %= 24;

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

        numberOfUnits++;
    }

    if (numberOfUnits >= units) return message;

    let minutes = Math.floor(delta / 60);

    if (minutes > 0) {
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
        numberOfUnits++;
    }
    if (numberOfUnits >= units) return message;

    if (delta > 0) {
        if (message !== "") {
            message += ", ";
        }
        message += delta.toFixed(0);

        if (delta.toFixed(0) == "1") {
            message += " second";
        } else {
            message += " seconds";
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