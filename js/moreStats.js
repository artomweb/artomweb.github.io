let timeAlive = document.getElementById("timeAlive");
let timeDriving = document.getElementById("timeDriving");
let seconds;
let begginingOfAllTime = new Date(1050631200 * 1000);
let drivingPass = new Date(1626864660 * 1000);
let nowTime;

function updateTexts() {
    nowTime = new Date();

    let ageDelta = (nowTime.getTime() - begginingOfAllTime.getTime()) / 1000;
    let drivingDelta = (nowTime.getTime() - drivingPass.getTime()) / 1000;

    let ageMessage = createTimeMessage(ageDelta, "yd");
    let drivingMessage = createTimeMessage(drivingDelta, "yd");

    timeAlive.innerHTML = ageMessage;
    timeDriving.innerHTML = drivingMessage;
}

function mainMoreStats() {
    // let inst = setInterval(updateTexts, 1000);

    updateTexts();
}

mainMoreStats();