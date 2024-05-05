function createTimeMessage(seconds, detailed = false) {
  var interval = seconds / 31536000;
  var message = "";

  if (interval >= 1) {
    message +=
      Math.floor(interval) + (Math.floor(interval) === 1 ? " year" : " years");
    if (detailed) {
      seconds %= 31536000;
      interval = seconds / 2592000;
      if (interval >= 1) {
        message +=
          " and " +
          Math.floor(interval) +
          (Math.floor(interval) === 1 ? " month" : " months");
        seconds %= 2592000;
      }
    }
    return message;
  }

  interval = seconds / 2592000;
  if (interval >= 1) {
    message +=
      Math.floor(interval) +
      (Math.floor(interval) === 1 ? " month" : " months");
    if (detailed) {
      seconds %= 2592000;
      interval = seconds / 86400;
      if (interval >= 1) {
        message +=
          " and " +
          Math.floor(interval) +
          (Math.floor(interval) === 1 ? " day" : " days");
        seconds %= 86400;
      }
    }
    return message;
  }

  interval = seconds / 86400;
  if (interval >= 1) {
    message +=
      Math.floor(interval) + (Math.floor(interval) === 1 ? " day" : " days");
    if (detailed) {
      seconds %= 86400;
      interval = seconds / 3600;
      if (interval >= 1) {
        message +=
          " and " +
          Math.floor(interval) +
          (Math.floor(interval) === 1 ? " hour" : " hours");
        seconds %= 3600;
      }
    }
    return message;
  }

  interval = seconds / 3600;
  if (interval >= 1) {
    message +=
      Math.floor(interval) + (Math.floor(interval) === 1 ? " hour" : " hours");
    if (detailed) {
      seconds %= 3600;
      interval = seconds / 60;
      if (interval >= 1) {
        message +=
          " and " +
          Math.floor(interval) +
          (Math.floor(interval) === 1 ? " minute" : " minutes");
        seconds %= 60;
      }
    }
    return message;
  }

  interval = seconds / 60;
  if (interval >= 1) {
    message +=
      Math.floor(interval) +
      (Math.floor(interval) === 1 ? " minute" : " minutes");
    if (detailed) {
      seconds %= 60;
      if (seconds >= 1) {
        message +=
          " and " +
          Math.floor(seconds) +
          (Math.floor(seconds) === 1 ? " second" : " seconds");
      }
    }
    return message;
  }

  return (
    Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second" : " seconds")
  );
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
