(async function initStorefront() {
document.documentElement.classList.add('js');
const products = await fetch('/products.json').then((response) => {
  if (!response.ok) throw new Error('Could not load the catalogue.');
  return response.json();
});

const grid = document.querySelector('#grid');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const dialog = document.querySelector('#request');
let category = 'All';
let selected = null;
let lastTrigger = null;

const categories = ['All', ...new Set(products.map((product) => product.category))];
for (const name of categories) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = name;
  button.setAttribute('aria-pressed', String(name === category));
  button.addEventListener('click', () => {
    category = name;
    for (const filter of filters.children) filter.setAttribute('aria-pressed', String(filter === button));
    render();
  });
  filters.append(button);
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = products.filter((product) =>
    (category === 'All' || product.category === category) &&
    `${product.title} ${product.id} ${product.category}`.toLocaleLowerCase().includes(query),
  );
  const fragment = document.createDocumentFragment();

  for (const product of matches) {
    const card = document.createElement('article');
    card.className = 'card';
    const preview = document.createElement('a');
    preview.className = 'card-image';
    preview.href = `/product/${encodeURIComponent(product.id)}/`;
    preview.setAttribute('aria-label', `View ${product.title} details and design sheet`);
    const picture = document.createElement('img');
    picture.src = product.image.thumbnail;
    picture.srcset = `${product.image.thumbnail} 720w`;
    picture.sizes = '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw';
    picture.alt = `${product.title} three-panel puzzle design sheet`;
    picture.width = 720;
    picture.height = 360;
    picture.loading = product.id === 'A01' ? 'eager' : 'lazy';
    picture.decoding = 'async';
    preview.append(picture);

    const details = document.createElement('div');
    details.className = 'details';
    const label = document.createElement('p');
    label.className = 'category';
    label.textContent = `${product.category} · ${product.id}`;
    const title = document.createElement('h3');
    const titleLink = document.createElement('a');
    titleLink.href = preview.href;
    titleLink.textContent = product.title;
    title.append(titleLink);
    const row = document.createElement('div');
    row.className = 'row';
    const price = document.createElement('p');
    price.className = 'price';
    price.append(document.createTextNode('500 pcs ৳3,000 · 1,000 pcs ৳4,000'));
    const note = document.createElement('small');
    note.textContent = 'Optional frame kit +৳3,000';
    price.append(note);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button card-button';
    button.textContent = 'Ask about this design';
    button.setAttribute('aria-label', `Ask about ${product.title} on WhatsApp`);
    button.addEventListener('click', () => openEnquiry(product, button));
    row.append(price, button);
    details.append(label, title, row);
    card.append(preview, details);
    fragment.append(card);
  }

  grid.replaceChildren(fragment);
  document.querySelector('#count').textContent = `${matches.length} ${matches.length === 1 ? 'design' : 'designs'}`;
  document.querySelector('#empty').hidden = matches.length !== 0;
}

function openEnquiry(product, trigger) {
  selected = product;
  lastTrigger = trigger;
  document.querySelector('#request-form').reset();
  document.querySelector('#chosen').textContent = `${product.title} (${product.id})`;
  document.querySelector('#wa-fallback').hidden = true;
  for (const error of document.querySelectorAll('.field-error')) error.textContent = '';
  dialog.showModal();
  document.querySelector('#quantity').focus();
}

search.addEventListener('input', render);
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => lastTrigger?.focus());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
  event.currentTarget.setAttribute('aria-expanded', String(!expanded));
  document.querySelector('#mobile-menu').hidden = expanded;
});

document.querySelector('#request-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!selected) return;

  const variantField = document.querySelector('#variant');
  const quantityField = document.querySelector('#quantity');
  const nameField = document.querySelector('#customer-name');
  const phoneField = document.querySelector('#customer-phone');
  const areaField = document.querySelector('#area');
  const frameField = document.querySelector('#frame');
  const quantity = Number(quantityField.value);
  const variant = variantField.value;
  const name = nameField.value.trim();
  const phone = phoneField.value.trim();
  const area = areaField.value.trim();
  const errors = {
    variant: document.querySelector('#variant-error'),
    quantity: document.querySelector('#quantity-error'),
    name: document.querySelector('#name-error'),
    phone: document.querySelector('#phone-error'),
    area: document.querySelector('#area-error'),
  };
  for (const error of Object.values(errors)) error.textContent = '';
  errors.variant.textContent = ['500', '1000'].includes(variant) ? '' : 'Choose a puzzle size.';
  errors.quantity.textContent = Number.isInteger(quantity) && quantity >= 1 && quantity <= 99
    ? '' : 'Enter a whole number from 1 to 99.';
  errors.name.textContent = name && name.length <= 100 ? '' : 'Enter your name (up to 100 characters).';
  errors.phone.textContent = /^\+?[0-9][0-9 -]{7,18}$/.test(phone) ? '' : 'Enter a valid mobile number.';
  errors.area.textContent = area && area.length <= 300 ? '' : 'Enter your full delivery address (up to 300 characters).';
  const firstInvalid = Object.entries(errors).find(([, error]) => error.textContent);
  if (firstInvalid) {
    document.querySelector(`#${firstInvalid[0] === 'name' ? 'customer-name' : firstInvalid[0] === 'phone' ? 'customer-phone' : firstInvalid[0]}`).focus();
    return;
  }

  const url = window.ForTheUmmahOrder.buildWhatsAppUrl(selected, variant, quantity, name, phone, area, frameField.checked, document.querySelector('#note').value);
  const fallbackLink = document.querySelector('#wa-link');
  fallbackLink.href = url;
  document.querySelector('#wa-fallback').hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
});

render();
const requestedProductId = new URLSearchParams(window.location.search).get('product');
const requestedProduct = products.find((product) => product.id === requestedProductId);
if (requestedProduct) openEnquiry(requestedProduct, document.querySelector('.hero-image'));
})();
