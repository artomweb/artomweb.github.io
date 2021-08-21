/**
 * Creates a time message from a number of seconds, eg 1 day, 2 hours
 *
 * @param {number} delta The amount of time to be converted (in seconds).
 * @param {string} format The format of the result, ydhms for {years, days, hours, minutes, seconds}
 * @returns {string} The time message EG: 1 years, 2 days, 3 hours, 4 minutes, 5 seconds
 */
function createTimeMessage(delta, format = "dh") {
  let messages = [];

  if (format.includes("y")) {
    let years = Math.floor(delta / 31540000);
    delta -= years * 31540000;

    if (years > 0) {
      if (years == 1) {
        messages.push(years + " year");
      } else {
        messages.push(years + " years");
      }
    }
  }

  if (format.includes("d")) {
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    if (days > 0) {
      if (days == 1) {
        messages.push(days + " day");
      } else {
        messages.push(days + " days");
      }
    }
  }

  if (format.includes("h")) {
    let hours = Math.floor(delta / 3600);
    delta -= hours * 3600;
    hours %= 24;

    if (hours > 0) {
      if (hours == 1) {
        messages.push(hours + " hour");
      } else {
        messages.push(hours + " hours");
      }
    }
  }

  if (format.includes("m")) {
    let minutes = Math.floor(delta / 60);
    delta -= minutes * 60;

    if (minutes > 0) {
      if (minutes == 1) {
        messages.push(minutes + " minute");
      } else {
        messages.push(minutes + " minutes");
      }
    }
  }

  if (format.includes("s")) {
    if (delta > 0) {
      if (delta == 1) {
        messages.push(delta + " seconds");
      } else {
        messages.push(delta + " seconds");
      }
    }
  }

  return messages.join(", ");
}
