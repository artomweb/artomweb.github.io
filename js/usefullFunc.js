/**
 * Creates a time message from a number of seconds, eg 1 day, 2 hours
 *
 * @param {number} delta The amount of time to be converted (in seconds).
 * @returns {string} The time message EG: 1 years, 2 days, 3 hours, 4 minutes, 5 seconds
 */
function createTimeMessage(delta) {
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

    if (message === "") {
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

    if (message === "") {
        if (delta > 0) {
            if (message !== "") {
                message += ", ";
            }
            message += parseInt(delta);

            if (delta == 1) {
                message += " second";
            } else {
                message += " seconds";
            }
        }
    }

    return message;
}