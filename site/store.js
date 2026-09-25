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
    preview.setAttribute('aria-label', `View ${product.title} details and concept artwork`);
    const picture = document.createElement('img');
    picture.src = product.image.thumbnail;
    picture.srcset = `${product.image.thumbnail} 720w`;
    picture.sizes = '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw';
    picture.alt = `${product.title} three-panel puzzle design concept`;
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
    price.append(document.createTextNode('৳3,000–৳4,000'));
    const note = document.createElement('small');
    note.textContent = '500 or 1,000 pieces · frame +৳3,000';
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
  document.querySelector('#count').textContent = `${matches.length} design ${matches.length === 1 ? 'concept' : 'concepts'}`;
  document.querySelector('#empty').hidden = matches.length !== 0;
}

function openEnquiry(product, trigger) {
  selected = product;
  lastTrigger = trigger;
  document.querySelector('#request-form').reset();
  document.querySelector('#chosen').textContent = `${product.title} (${product.id})`;
  document.querySelector('#wa-fallback').hidden = true;
  document.querySelector('#quantity-error').textContent = '';
  document.querySelector('#area-error').textContent = '';
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

  const quantityField = document.querySelector('#quantity');
  const areaField = document.querySelector('#area');
  const quantity = Number(quantityField.value);
  const area = areaField.value.trim();
  const quantityError = document.querySelector('#quantity-error');
  const areaError = document.querySelector('#area-error');
  quantityError.textContent = Number.isInteger(quantity) && quantity >= 1 && quantity <= 99
    ? '' : 'Enter a whole number from 1 to 99.';
  areaError.textContent = area ? '' : 'Enter your delivery area or district.';
  if (quantityError.textContent) { quantityField.focus(); return; }
  if (areaError.textContent) { areaField.focus(); return; }

  const url = window.ForTheUmmahOrder.buildWhatsAppUrl(selected, quantity, area, document.querySelector('#note').value);
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
