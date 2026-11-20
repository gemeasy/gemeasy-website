(() => {
  const asset = 'assets/gemeasy-cta-mascot.webp';
  const anchors = document.querySelectorAll('.button-nav, .nav-cta, main .button-primary, footer .button-primary, main #contactForm button[type="submit"]');
  function mascot(className, source = asset) {
    const image = document.createElement('img');
    image.className = className;
    image.src = source;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    return image;
  }
  anchors.forEach(anchor => {
    anchor.classList.add('mascot-anchor');
    anchor.append(mascot('cta-mascot'));
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const footer = document.querySelector('footer .footer-bottom') || document.querySelector('footer');
  if (!footer) return;
  const rover = document.createElement('span');
  rover.className = 'roaming-mascot';
  rover.setAttribute('aria-hidden', 'true');
  const blue = document.createElement('span');
  blue.className = 'sapphire-bull';
  blue.append(
    mascot('natural-bull', 'assets/gemeasy-natural-bull.webp'),
    mascot('robot-bull')
  );
  rover.append(blue, mascot('ruby-mascot', 'assets/gemeasy-ruby-mascot.webp'));
  document.body.append(rover);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mascot-motion-toggle';
  footer.append(toggle);
  let paused = false;
  try { paused = sessionStorage.getItem('gem-mascot-paused') === 'true'; } catch {}

  function label() {
    const hindi = document.documentElement.lang.startsWith('hi');
    toggle.textContent = paused ? (hindi ? 'मैस्कॉट चलाएँ' : 'Play mascot') : (hindi ? 'मैस्कॉट रोकें' : 'Pause mascot');
  }
  label();
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('gem-mascot-paused', String(paused)); } catch {}
    rover.classList.remove('is-playing');
    label();
  });
  rover.addEventListener('animationend', event => {
    if (event.target === rover && !event.pseudoElement) rover.classList.remove('is-playing');
  });
  const moves = [
    ['transform', 'right'],
    ['scrape', 'left'],
    ['toss', 'right'],
    ['charge', 'right'],
    ['face-off', 'left'],
    ['buck', 'right'],
    ['clash', 'center'],
    ['stomp', 'left'],
    ['snort', 'right'],
    ['sidestep', 'left'],
    ['rear', 'right'],
    ['parade', 'right'],
    ['feint', 'left'],
    ['bow', 'right'],
    ['recoil', 'left']
  ];
  let turn = 0;
  setInterval(() => {
    if (paused || reduced.matches || document.hidden || document.activeElement?.matches('input, textarea, select')) return;
    const [move, corner] = moves[turn++ % moves.length];
    rover.dataset.move = move;
    rover.dataset.corner = corner;
    rover.classList.add('is-playing');
  }, 5000);
})();
