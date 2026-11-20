(() => {
  const cards = document.querySelectorAll('.client-logo-grid .client-logo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .2 });
    cards.forEach(card => observer.observe(card));
  }
  cards.forEach(card => card.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    card.style.setProperty('--logo-x', `${(.5 - (event.clientY - bounds.top) / bounds.height) * 16}deg`);
    card.style.setProperty('--logo-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 16}deg`);
  }));
})();
