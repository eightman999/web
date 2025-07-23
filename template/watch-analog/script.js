function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  document.getElementById('second-hand').style.transform = `rotate(${secondAngle}deg)`;
  document.getElementById('minute-hand').style.transform = `rotate(${minuteAngle}deg)`;
  document.getElementById('hour-hand').style.transform = `rotate(${hourAngle}deg)`;
}

setInterval(updateClock, 1000);
updateClock();
