let timeAlive = document.getElementById("timeAlive");
let timeDriving = document.getElementById("timeAbleDrive");
let timeWithPhone = document.getElementById("timePhone");
let timeDateCerys = document.getElementById("timeDateCerys");
let timeCerys = document.getElementById("timeCerys");
let consCerys = document.getElementById("consCerys");
let beginningOfAllTime = new Date(1050631200 * 1000);
let drivingPass = new Date(1626864660 * 1000);
let getPhone = new Date(1582210140 * 1000);
let cerysOut = new Date(1662049800 * 1000);
let nowTime;

function fetchMoreData() {
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vRd3YjXEoMgwyej-Y6uIwHtZUlWtBYjB6nBoexbjVxreBsbDPaY9cPsr8QnUuY-WthpVfS3gNbIXidV/pub?output=csv", {
    download: true,
    header: true,
    complete: function (results) {
      // console.log(results.data)
      updateTexts(results.data);
    },
    error: function (error) {
      console.log("failed to fetch from cache, driving");
      let drivingCard = document.getElementById("drivingCard");
      drivingCard.style.display = "none";
    },
  });
}

fetchMoreData();

function updateTexts(data) {
  nowTime = new Date();

  let ageDelta = (nowTime.getTime() - beginningOfAllTime.getTime()) / 1000;
  let drivingDelta = (nowTime.getTime() - drivingPass.getTime()) / 1000;
  let phoneDelta = (nowTime.getTime() - getPhone.getTime()) / 1000;
  let cerysDelta = (nowTime.getTime() - cerysOut.getTime()) / 1000;

  let ageMessage = createTimeMessage(ageDelta);
  let drivingMessage = createTimeMessage(drivingDelta);
  let phoneMessage = createTimeMessage(phoneDelta);
  let cerysMessage = createTimeMessage(cerysDelta, 1);

  console.log(data);

  timeAlive.innerHTML = ageMessage;
  timeDriving.innerHTML = drivingMessage;
  timeWithPhone.innerHTML = phoneMessage;
  timeCerys.innerHTML = cerysMessage;
  timeDateCerys.innerHTML = data[0].CDays + " days";
  consCerys.innerHTML = data[0].CLong + " days";
}
