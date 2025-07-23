document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value;
  if (query.trim()) {
    window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
  }
});

document.getElementById('lucky').addEventListener('click', function(e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value;
  if (query.trim()) {
    window.location.href = 'https://www.google.com/search?btnI=1&q=' + encodeURIComponent(query);
  }
});
