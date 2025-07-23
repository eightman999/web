document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('search-btn');
  const input = document.getElementById('search-input');

  if (btn && input) {
    btn.addEventListener('click', () => {
      const query = input.value.trim();
      if (query) {
        alert('検索: ' + query);
      }
    });
  }
});
