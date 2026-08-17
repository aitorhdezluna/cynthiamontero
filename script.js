(() => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  const header = qs('[data-header]');
  let previousY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 20);
    header?.classList.toggle('is-hidden', y > previousY && y > 240 && !document.body.classList.contains('menu-open'));
    previousY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  const menu = qs('[data-menu]');
  const nav = qs('[data-nav]');
  const setMenu = (open) => {
    menu?.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (header) header.classList.remove('is-hidden');
  };

  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  qsa('[data-nav-link]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .13, rootMargin: '0px 0px -5% 0px' });
  qsa('.reveal').forEach(el => revealObserver.observe(el));

  qsa('[data-area]').forEach(area => {
    const trigger = qs('.area__trigger', area);
    const content = qs('.area__content', area);
    trigger?.addEventListener('click', () => {
      qsa('[data-area]').forEach(other => {
        const otherTrigger = qs('.area__trigger', other);
        const otherContent = qs('.area__content', other);
        const active = other === area;
        other.classList.toggle('is-active', active);
        otherTrigger?.setAttribute('aria-expanded', String(active));
        if (otherContent) otherContent.hidden = !active;
      });
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    qsa('[data-parallax]').forEach(box => {
      const img = qs('img', box);
      window.addEventListener('scroll', () => {
        const rect = box.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < innerHeight) {
          const progress = (innerHeight - rect.top) / (innerHeight + rect.height);
          const offset = (progress - .5) * 28;
          if (img) img.style.transform = `translateY(${offset}px) scale(1.05)`;
        }
      }, { passive: true });
    });

    const orbit = qs('[data-orbit]');
    if (orbit && matchMedia('(pointer:fine)').matches) {
      let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
      document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      const follow = () => {
        x += (tx - x) * .14;
        y += (ty - y) * .14;
        orbit.style.left = `${x}px`;
        orbit.style.top = `${y}px`;
        requestAnimationFrame(follow);
      };
      follow();
      qsa('a, button, .mode').forEach(el => {
        el.addEventListener('mouseenter', () => orbit.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => orbit.classList.remove('is-hover'));
      });
    }
  }

  qsa('[data-dialog-open]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialogOpen);
      if (dialog?.showModal) dialog.showModal();
    });
  });
  qsa('[data-dialog-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
  qsa('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
      const rect = dialog.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  });
})();
