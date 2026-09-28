(() => {
  document.documentElement.classList.add('js');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  function closeMenu(restoreFocus = false) {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    menuToggle.setAttribute('aria-expanded', String(!open));
  });
  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => closeMenu());

  const grid = document.querySelector('#grid');
  const filters = document.querySelector('#filters');
  const search = document.querySelector('#search');
  const controls = document.querySelector('.controls');
  const status = document.querySelector('#catalogue-status');
  const statusText = document.querySelector('#catalogue-status-text');
  const retry = document.querySelector('#retry-catalogue');
  const count = document.querySelector('#count');
  const empty = document.querySelector('#empty');
  const backToTop = document.querySelector('.back-to-top');
  const dialog = document.querySelector('#request');
  const form = document.querySelector('#request-form');
  const fallback = document.querySelector('#wa-fallback');
  const fallbackLink = document.querySelector('#wa-link');
  const fields = {
    variant: document.querySelector('#variant'),
    quantity: document.querySelector('#quantity'),
    name: document.querySelector('#customer-name'),
    phone: document.querySelector('#customer-phone'),
    area: document.querySelector('#area'),
    note: document.querySelector('#note'),
  };
  let products = [];
  const params = new URLSearchParams(window.location.search);
  const allowedCategories = ['All', 'Eid 2027 / 1448 AH', 'Sacred Architecture', 'Calligraphy', 'Qur’an Reflection'];
  let category = allowedCategories.includes(params.get('category')) ? params.get('category') : 'All';
  let selected = null;
  let lastTrigger = null;
  let requestedProductOpened = false;

  function syncFilters() {
    for (const button of filters.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.textContent === category));
    }
    for (const link of filters.querySelectorAll('.filter-link')) {
      const active = link.textContent === category;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = products.filter((product) =>
      (category === 'All' || product.category === category) &&
      `${product.title} ${product.id} ${product.category}`.toLocaleLowerCase().includes(query),
    );
    const url = new URL(window.location.href);
    if (category === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', category);
    if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    if (params.has('product')) url.searchParams.set('product', params.get('product'));
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    const visibleIds = new Set(matches.map((product) => product.id));
    for (const card of grid.querySelectorAll('.static-card')) {
      card.hidden = !visibleIds.has(card.dataset.productId) || !(card.dataset.search || '').toLocaleLowerCase().includes(query);
    }
    syncFilters();
    
    count.textContent = `Showing ${matches.length} ${matches.length === 1 ? 'design' : 'designs'}`;
    empty.hidden = matches.length !== 0;
  }

  function clearPreparedLink() {
    fallback.hidden = true;
    fallbackLink.removeAttribute('href');
  }
  function setError(key, message) {
    document.querySelector(`#${key}-error`).textContent = message;
    fields[key].setAttribute('aria-invalid', String(Boolean(message)));
  }
  function openEnquiry(product, trigger) {
    selected = product;
    lastTrigger = trigger;
    form.reset();
    document.querySelector('#chosen').textContent = `${product.title} (${product.id})`;
    clearPreparedLink();
    for (const key of Object.keys(fields)) setError(key, '');
    closeMenu();
    dialog.showModal();
    document.body.classList.add('has-dialog');
    fields.variant.focus({preventScroll: true});
    dialog.scrollTop = 0;
  }
  search.value = params.get('q') || '';
  for (const link of filters.querySelectorAll('.filter-link')) { if (link.textContent !== category) link.removeAttribute('aria-current'); }
  search.addEventListener('input', render);
  for (const card of grid.querySelectorAll('.static-card')) {
    const productId = card.dataset.productId;
    const link = card.querySelector('.card-link');
    link.addEventListener('click', (event) => {
      const product = products.find((item) => item.id === productId);
      if (product) { event.preventDefault(); openEnquiry(product, link); }
    });
  }
  document.querySelector('#reset-filters').addEventListener('click', () => {
    category = 'All';
    search.value = '';
    syncFilters();
    render();
    search.focus();
  });
  document.querySelector('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-dialog');
    lastTrigger?.focus();
  });
  function outsideDialog(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  let backdropPress = false;
  dialog.addEventListener('pointerdown', (event) => {
    backdropPress = event.target === dialog && outsideDialog(event);
  });
  dialog.addEventListener('click', (event) => {
    if (backdropPress && event.target === dialog && outsideDialog(event)) dialog.close();
    backdropPress = false;
  });
  for (const [key, field] of Object.entries(fields)) {
    field.addEventListener('input', () => { setError(key, ''); clearPreparedLink(); });
    field.addEventListener('change', clearPreparedLink);
  }
  document.querySelector('#frame').addEventListener('change', clearPreparedLink);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selected) return;
    const variant = fields.variant.value;
    const quantity = Number(fields.quantity.value);
    const name = fields.name.value.trim();
    const phone = fields.phone.value.trim();
    const area = fields.area.value.trim();
    const note = fields.note.value.trim();
    const errors = {
      variant: ['500', '1000'].includes(variant) ? '' : 'Choose a puzzle size.',
      quantity: Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 ? '' : 'Enter a whole number from 1 to 99.',
      name: name && name.length <= 100 ? '' : 'Enter your name (up to 100 characters).',
      phone: /^\+?[0-9][0-9 -]{7,18}$/.test(phone) ? '' : 'Enter a valid mobile number.',
      area: area.length <= 300 ? '' : 'Keep your area or district to 300 characters or fewer.',
      note: note.length <= 500 ? '' : 'Keep your note to 500 characters or fewer.',
    };
    for (const [key, message] of Object.entries(errors)) setError(key, message);
    const invalid = Object.keys(errors).find((key) => errors[key]);
    if (invalid) { fields[invalid].focus(); return; }
    const url = window.ForTheUmmahOrder.buildWhatsAppUrl(selected, variant, quantity, name, phone, area, document.querySelector('#frame').checked, note);
    fallbackLink.href = url;
    fallback.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  async function loadProducts() {
    controls.hidden = true;
    grid.setAttribute('aria-busy', 'true');
    status.hidden = false;
    retry.hidden = true;
    empty.hidden = true;
    count.textContent = 'Loading designs…';
    statusText.textContent = 'Loading the collection…';
    try {
      const response = await fetch('/products.json');
      if (!response.ok) throw new Error('Catalogue request failed.');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length || data.some((p) => !p.id || !p.title || !p.category || !p.image?.thumbnail)) {
        throw new Error('Invalid catalogue data.');
      }
      products = data;
      for (const name of ['All', ...new Set(products.map((product) => product.category))]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = name;
        button.setAttribute('aria-pressed', String(name === category));
         button.addEventListener('click', () => { category = name; syncFilters(); render(); });
        filters.append(button);
      }
      controls.hidden = false;
      search.value = new URLSearchParams(window.location.search).get('q') || '';
      render();
      status.hidden = true;
      const requestedId = new URLSearchParams(window.location.search).get('product');
      const requested = products.find((product) => product.id === requestedId);
      if (requested && !requestedProductOpened) {
        requestedProductOpened = true;
        openEnquiry(requested, [...grid.querySelectorAll('button')].find((b) => b.dataset.productId === requested.id));
      }
    } catch {
      count.textContent = 'Catalogue unavailable';
      statusText.textContent = 'The collection could not load. Try again or browse the static catalogue below.';
      retry.hidden = false;
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  }
  retry.addEventListener('click', loadProducts);
  let scrollMilestones = 0;
  window.addEventListener('scroll', () => {
    const next = Math.floor(window.scrollY / Math.max(window.innerHeight, 1));
    scrollMilestones = Math.max(scrollMilestones, next);
    backToTop.hidden = scrollMilestones < 3;
  }, {passive: true});
  backToTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  loadProducts();
})();
