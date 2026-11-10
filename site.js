(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
  const update = () => {
    if (!toggle) return;
    const dark = current() === 'dark';
    toggle.querySelector('.theme-icon').textContent = dark ? '☀' : '◐';
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    toggle.title = toggle.getAttribute('aria-label');
  };
  if (toggle) {
    toggle.hidden = false; update();
    toggle.addEventListener('click', () => {
      root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('sc-theme', root.dataset.theme); } catch (_) {}
      update();
    });
    system.addEventListener('change', update);
  }
  // Optional slide-in experiment. Content stays visible without JS or with reduced motion.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = [...document.querySelectorAll([
    'main .hero-copy', 'main .portrait', 'main .page-intro',
    'main .section-heading', 'main .paper', 'main .timeline article',
    'main .honors', 'main .resource-card', 'main .contact-card', 'main .talk'
  ].join(','))];
  let observer;
  const clearMotion = el => {
    el.classList.remove('slide-pending', 'slide-reveal');
    if (observer) observer.unobserve(el);
  };
  if (!motion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.remove('slide-pending');
        el.classList.add('slide-reveal');
        observer.unobserve(el);
      });
    }, { threshold: 0.06 });
    revealTargets.forEach(el => {
      // Avoid delaying the first page heading; stagger peers, not whole sections.
      const siblings = [...el.parentElement.children].filter(sibling => revealTargets.includes(sibling));
      el.style.setProperty('--slide-delay', `${Math.min(siblings.indexOf(el), 2) * 75}ms`);
      if (el.classList.contains('hero-copy')) {
        el.style.setProperty('--slide-x', '-24px');
        el.style.setProperty('--slide-y', '0px');
      } else if (el.classList.contains('portrait')) {
        el.style.setProperty('--slide-x', '24px');
        el.style.setProperty('--slide-y', '0px');
      }
      el.classList.add('slide-pending');
      el.addEventListener('animationend', e => {
        if (e.target === el && e.animationName === 'academic-slide-in') clearMotion(el);
      });
      el.addEventListener('focusin', () => clearMotion(el));
      observer.observe(el);
    });
    motion.addEventListener('change', e => {
      if (e.matches) revealTargets.forEach(clearMotion);
    });
  }
  const controls = document.querySelector('.research-controls');
  if (!controls) return;
  const cards = [...document.querySelectorAll('.research-papers .paper')];
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  const search = document.getElementById('paper-search');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('no-results');
  let filter = 'all';
  const render = (immediate = false) => {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const visible = (filter === 'all' || card.dataset.kind === filter) && card.textContent.toLowerCase().includes(query);
      card.hidden = !visible;
      if (immediate && visible) clearMotion(card);
      if (visible) shown++;
    });
    count.textContent = `Showing ${shown} of ${cards.length} works`;
    empty.hidden = shown !== 0;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render(true);
  }));
  search.addEventListener('input', () => render(true));
  controls.hidden = false; count.hidden = false; render();
})();
