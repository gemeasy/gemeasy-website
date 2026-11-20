(() => {
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  document.querySelectorAll('[data-tilt]').forEach(art => {
    art.addEventListener('pointermove', event => {
      if (!motion.matches) return;
      const bounds = art.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      art.style.setProperty('--tilt-x', `${-y * 22}deg`);
      art.style.setProperty('--tilt-y', `${x * 26}deg`);
    });
    art.addEventListener('pointerleave', () => {
      art.style.removeProperty('--tilt-x');
      art.style.removeProperty('--tilt-y');
    });
  });
})();
