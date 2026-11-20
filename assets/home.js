const hindi = document.documentElement.lang === 'hi-IN';

if (hindi) {
  document.querySelectorAll('[data-hi]').forEach(element => {
    element.textContent = element.dataset.hi;
  });
  document.querySelectorAll('[data-hi-label]').forEach(element => {
    element.setAttribute('aria-label', element.dataset.hiLabel);
  });
  document.querySelector('#languageToggle').setAttribute('aria-label', 'अंग्रेज़ी में बदलें');
}

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#home-nav');
const mobile = matchMedia('(max-width: 860px)');

function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
}

function updateMenu() {
  menuButton.hidden = !mobile.matches;
  setMenu(false);
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') === 'false'));
document.querySelector('.home-header').addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenu(false);
    menuButton.focus();
  }
});
mobile.addEventListener('change', updateMenu);
document.documentElement.classList.add('menu-ready');
updateMenu();

const tabList = document.querySelector('.audience-tabs');
const tabs = [...tabList.querySelectorAll('button')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

function showAudience(index) {
  tabs.forEach((tab, position) => {
    const selected = index === position;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[position].hidden = !selected;
  });
}

tabList.setAttribute('role', 'tablist');
tabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
  panels[index].tabIndex = 0;
  tab.addEventListener('click', () => showAudience(index));
  tab.addEventListener('keydown', event => {
    let next;
    switch (event.key) {
      case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break;
      case 'ArrowRight': next = (index + 1) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    showAudience(next);
    tabs[next].focus();
  });
});
showAudience(0);
tabList.hidden = false;

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.nav-glass, .footer-glass').forEach(surface => {
    surface.addEventListener('pointermove', event => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--light-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
      surface.style.setProperty('--light-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
    });
    surface.addEventListener('pointerleave', () => {
      surface.style.removeProperty('--light-x');
      surface.style.removeProperty('--light-y');
    });
  });
}
