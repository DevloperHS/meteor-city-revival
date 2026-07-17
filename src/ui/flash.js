let flashTimeout = null;
export function flashMessage(text, color) {
  const el = document.getElementById('flash-msg');
  if (!el) return;
  el.textContent = text;
  el.style.borderColor = '#' + (color || 0xffaa44).toString(16).padStart(6, '0');
  el.classList.add('show');
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => el.classList.remove('show'), 3000);
}
