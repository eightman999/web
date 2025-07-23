(function() {
  const clock = document.getElementById('clock');
  const startButton = document.getElementById('start-button');
  const windowEl = document.getElementById('window');
  const closeBtn = document.querySelector('.close-btn');

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  }

  setInterval(updateClock, 1000);
  updateClock();

  startButton.addEventListener('click', () => {
    windowEl.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    windowEl.classList.add('hidden');
  });
})();
