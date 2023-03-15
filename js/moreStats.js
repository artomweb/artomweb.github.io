// let timeAlive = document.getElementById("timeAlive");
let timeDriving = document.getElementById("timeAbleDrive");
// let timeWithPhone = document.getElementById("timePhone");
// let beginningOfAllTime = new Date(1050631200 * 1000);
let drivingPass = new Date(1626864660 * 1000);
// let getPhone = new Date(1582210140 * 1000);
let nowTime;

function updateTexts() {
  nowTime = new Date();

  // let ageDelta = (nowTime.getTime() - beginningOfAllTime.getTime()) / 1000;
  let drivingDelta = (nowTime.getTime() - drivingPass.getTime()) / 1000;
  // let phoneDelta = (nowTime.getTime() - getPhone.getTime()) / 1000;

  // let ageMessage = createTimeMessage(ageDelta);
  let drivingMessage = createTimeMessage(drivingDelta);
  // let phoneMessage = createTimeMessage(phoneDelta);

  console.log(drivingDelta);
  // timeAlive.innerHTML = ageMessage;
  timeDriving.innerHTML = drivingMessage;
  // timeWithPhone.innerHTML = phoneMessage;
}

updateTexts();
