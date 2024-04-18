function createTimeMessage(seconds, detailed = false) {
  const units = {
    y: 31536000, // seconds in a year
    M: 2628000, // seconds in a month (approx)
    w: 604800, // seconds in a week
    d: 86400, // seconds in a day
    h: 3600, // seconds in an hour
    m: 60, // seconds in a minute
    s: 1, // seconds
  };

  const timeAgoStrings = {
    y: "year",
    M: "month",
    w: "week",
    d: "day",
    h: "hour",
    m: "minute",
    s: "second",
  };

  let remainingSeconds = seconds;
  let output = [];
  let detailedOutput = "";

  let unitsUsed = 0;

  for (let [unit, value] of Object.entries(units)) {
    if (unitsUsed >= 2) {
      break;
    }

    if (remainingSeconds >= value) {
      const num = Math.floor(remainingSeconds / value);
      const timeString = `${num} ${timeAgoStrings[unit]}${
        num !== 1 ? "s" : ""
      }`;
      output.push(timeString);

      if (detailed) {
        detailedOutput += `${timeString}, `;
      }

      remainingSeconds %= value;
      unitsUsed++;
    }
  }

  // Remove the trailing ", " from detailedOutput if it exists
  if (detailedOutput.endsWith(", ")) {
    detailedOutput = detailedOutput.slice(0, -2);
  }

  if (detailed && detailedOutput) {
    return detailedOutput;
  }

  return output[0];

  // If output array is empty, it means seconds are less than a second
  return "Just now";
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
    return [[], []];
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

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// fix button animation on mobile
let touchButtons = document.querySelectorAll(".button");

touchButtons.forEach((but) => {
  but.addEventListener("touchstart", function (e) {
    but.classList.add("active");
    setTimeout(function () {
      but.classList.remove("active");
    }, 200);
  });
});
