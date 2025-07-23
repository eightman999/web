document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('alertButton');
  if (btn) {
    btn.addEventListener('click', function() {
      alert('Hello from Windows XP style!');
    });
  }
});
