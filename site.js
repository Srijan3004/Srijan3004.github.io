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
  const controls = document.querySelector('.research-controls');
  if (!controls) return;
  const cards = [...document.querySelectorAll('.research-papers .paper')];
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  const search = document.getElementById('paper-search');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('no-results');
  let filter = 'all';
  const render = () => {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const visible = (filter === 'all' || card.dataset.kind === filter) && card.textContent.toLowerCase().includes(query);
      card.hidden = !visible;
      if (visible) shown++;
    });
    count.textContent = `Showing ${shown} of ${cards.length} works`;
    empty.hidden = shown !== 0;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  search.addEventListener('input', render);
  controls.hidden = false; count.hidden = false; render();
})();
