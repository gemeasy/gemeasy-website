(() => {
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const headers = document.querySelectorAll('.nav-glass, .site-header');
  const footers = document.querySelectorAll('.footer-glass, .site-footer');

  function addGlass(surface, footer) {
    surface.classList.add('glass-hover-surface');
    if (footer) surface.classList.add('glass-hover-footer');
    const layer = document.createElement('span');
    layer.className = 'glass-hover-light';
    layer.setAttribute('aria-hidden', 'true');
    surface.prepend(layer);

    surface.addEventListener('pointermove', event => {
      if (!motion.matches || event.pointerType === 'touch') return;
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const values = {
        '--light-x': `${x * 100}%`,
        '--light-y': `${y * 100}%`,
        '--drift-x': `${(x - .5) * 36}%`,
        '--drift-y': `${(y - .5) * 24}%`,
        '--glass-rx': `${(.5 - y) * 24}deg`,
        '--glass-ry': `${(x - .5) * 30}deg`
      };
      for (const [key,value] of Object.entries(values)) surface.style.setProperty(key,value);
    });
  }

  headers.forEach(surface => addGlass(surface, false));
  footers.forEach(surface => addGlass(surface, true));
})();
