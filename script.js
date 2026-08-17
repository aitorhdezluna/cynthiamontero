(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const menuLinks = nav ? nav.querySelectorAll('a') : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);

    if (y > 150 && y > lastY + 6 && !document.body.classList.contains('menu-open')) {
      header?.classList.add('is-hidden');
    } else if (y < lastY - 6 || y < 80) {
      header?.classList.remove('is-hidden');
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  const setMenu = (open) => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.querySelector('span:first-child').textContent = open ? 'Cerrar' : 'Menú';
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  document.querySelectorAll('.practice-item__trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.practice-item');
      const panel = item?.querySelector('.practice-item__panel');
      const symbol = item?.querySelector('.practice-item__symbol');
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

      document.querySelectorAll('.practice-item__trigger').forEach((otherTrigger) => {
        const otherItem = otherTrigger.closest('.practice-item');
        const otherPanel = otherItem?.querySelector('.practice-item__panel');
        const otherSymbol = otherItem?.querySelector('.practice-item__symbol');
        otherTrigger.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.hidden = true;
        if (otherSymbol) otherSymbol.textContent = '+';
      });

      if (willOpen && panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        if (symbol) symbol.textContent = '−';
      }
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  document.querySelectorAll('[data-dialog-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialogOpen);
      dialog?.showModal();
    });
  });

  document.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
