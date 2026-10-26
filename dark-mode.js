const themeToggleButtons = document.querySelectorAll('[data-theme-toggle]');
const themeStorageKey = 'samara-theme';
let currentTheme = 'light';

try {
  currentTheme = localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
} catch (error) {
  console.warn('Saved theme preference could not be read.', error);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleButtons.forEach((button) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    button.setAttribute('title', `Switch to ${nextTheme} mode`);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}

applyTheme(currentTheme);

themeToggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      console.warn('Theme preference could not be saved.', error);
    }
  });
});
