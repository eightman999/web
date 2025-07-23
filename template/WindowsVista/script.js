document.addEventListener('DOMContentLoaded', () => {
  const timeSpan = document.getElementById('time');
  function update() {
    const now = new Date();
    timeSpan.textContent = now.toLocaleTimeString();
  }
  update();
  setInterval(update, 1000);
});
