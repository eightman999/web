document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.querySelector('.title-bar .close');
  const windowEl = document.getElementById('sampleWindow');
  closeBtn.addEventListener('click', () => {
    windowEl.classList.add('hidden');
  });
});
