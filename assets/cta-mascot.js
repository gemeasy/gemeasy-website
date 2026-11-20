(() => {
  function layer(part) {
    const image = document.createElement('img');
    image.className = `monkey-layer monkey-${part}`;
    image.src = sprites[part];
    image.alt = '';
    return image;
  }

  const sprites = {
    'body': 'assets/gemeasy-monkey-body.webp',
    'arm-left': 'assets/gemeasy-monkey-arm-left.webp',
    'arm-right': 'assets/gemeasy-monkey-arm-right.webp',
    'leg-left': 'assets/gemeasy-monkey-leg-left.webp',
    'leg-right': 'assets/gemeasy-monkey-leg-right.webp'
  };
  document.querySelectorAll('.button-nav, .nav-cta, main .button-primary, footer .button-primary, main #contactForm button[type="submit"]').forEach(button => {
    const icon = document.createElement('img');
    icon.src = 'assets/gemeasy-robot-monkey.webp';
    icon.className = 'cta-monkey';
    icon.alt = '';
    button.classList.add('monkey-cta');
    button.append(icon);
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const footer = document.querySelector('footer .footer-bottom') || document.querySelector('footer');
  if (!footer) return;
  const rover = document.createElement('span');
  rover.className = 'roaming-mascot';
  rover.setAttribute('aria-hidden', 'true');
  const monkey = document.createElement('span');
  monkey.className = 'robot-monkey';
  monkey.append(...Object.keys(sprites).map(layer));
  rover.append(monkey);
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
    'perch', 'swing', 'rock', 'hop', 'peek', 'backflip', 'cartwheel',
    'slide', 'bounce', 'nod', 'stretch', 'twirl', 'tiptoe', 'pose', 'nap'
  ];
  const headings = [...document.querySelectorAll('main h1, main h2, main h3')];
  const protectedText = [...document.querySelectorAll('header, main, footer')];
  let turn = 0;
  let frame;
  let textRects = [];

  function measureText() {
    textRects = [];
    const range = document.createRange();
    protectedText.forEach(section => {
      const nodes = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      while (nodes.nextNode()) {
        const node = nodes.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('script, style, svg')) continue;
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight) textRects.push(rect);
        }
      }
    });
  }

  function keepTextClear() {
    if (!rover.classList.contains('is-playing')) return;
    const rect = monkey.getBoundingClientRect();
    rover.style.visibility = textRects.some(text =>
      rect.right + 7 > text.left && rect.left - 7 < text.right &&
      rect.bottom + 7 > text.top && rect.top - 7 < text.bottom
    ) ? 'hidden' : '';
    frame = requestAnimationFrame(keepTextClear);
  }

  function play() {
    if (paused || reduced.matches || document.hidden || document.activeElement?.matches('input, textarea, select, button')) return;
    const move = moves[turn % moves.length];
    const lane = Math.floor(turn++ / 2) % 4;
    rover.dataset.move = move;
    rover.dataset.lane = lane;
    rover.style.removeProperty('--perch-x');
    rover.style.removeProperty('--perch-y');
    measureText();
    if (move === 'perch') {
      const range = document.createRange();
      const line = headings.flatMap(heading => {
        range.selectNodeContents(heading);
        return [...range.getClientRects()];
      }).find(rect => rect.width && rect.top > 100 && rect.bottom < innerHeight);
      if (line) {
        const size = rover.offsetWidth;
        const right = line.right + 14;
        const left = line.left - size - 14;
        const beside = right + size < innerWidth - 10 || left > 10;
        const x = right + size < innerWidth - 10 ? right : left > 10 ? left : Math.max(12, line.left);
        rover.style.setProperty('--perch-x', `${Math.min(innerWidth - size - 10, x)}px`);
        rover.style.setProperty('--perch-y', `${beside ? line.top + size * .6 : line.top - 16}px`);
      }
    }
    rover.classList.add('is-playing');
    keepTextClear();
  }

  addEventListener('scroll', () => {
    if (rover.dataset.move === 'perch') rover.classList.remove('is-playing');
    else if (rover.classList.contains('is-playing')) measureText();
  }, { passive: true });
  addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    rover.classList.remove('is-playing');
  });
  setInterval(play, 5000);
})();
