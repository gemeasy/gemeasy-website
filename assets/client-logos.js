(() => {
  const showcase = document.querySelector('.client-showcase');
  const button = showcase?.querySelector('.client-showcase-control');
  if (!button) return;
  const label = paused => document.documentElement.lang.startsWith('hi')
    ? (paused ? 'स्लाइडशो चलाएँ' : 'स्लाइडशो रोकें')
    : (paused ? 'Play slideshow' : 'Pause slideshow');
  button.textContent = label(false);
  button.addEventListener('click', () => {
    const paused = showcase.classList.toggle('is-paused');
    button.textContent = label(paused);
  });
})();
