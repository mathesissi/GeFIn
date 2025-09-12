(function () {
  const root = document.documentElement;
  const key = 'gefin-theme';
  const toggle = document.getElementById('toggleTheme');
  const saved = localStorage.getItem(key);

  function updateIcon(theme) {
    toggle.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  if (saved) {
    root.setAttribute('data-theme', saved);
    updateIcon(saved);
  } else {
    updateIcon('light');
  }

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(key, next);
    updateIcon(next);
  });
})();
