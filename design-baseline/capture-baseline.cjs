const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://127.0.0.1:8765';
const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = [
  ['home', '/'],
  ['catalogue', '/catalogue.html'],
  ['policies', '/policies.html'],
  ['product-A01', '/product/A01/'],
  ['product-E01', '/product/E01/'],
  ['product-C01', '/product/C01/'],
  ['product-Q01', '/product/Q01/'],
  ['404', '/404.html'],
];
const widths = [1440, 1024, 768, 390];
const results = { generatedAt: new Date().toISOString(), baseURL, routes: [], behavior: {}, modes: {}, contracts: {}, consoleErrors: [] };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.on('console', msg => { if (msg.type() === 'error') results.consoleErrors.push({ width, url: page.url(), text: msg.text() }); });
      page.on('pageerror', err => results.consoleErrors.push({ width, url: page.url(), text: err.message }));
      for (const [name, route] of routes) {
        const response = await page.goto(baseURL + route, { waitUntil: 'networkidle' });
        const file = `${name}-${width}.png`;
        await page.screenshot({ path: path.join(outDir, file), fullPage: true });
        results.routes.push({ name, route, width, status: response?.status(), title: await page.title(), h1: await page.locator('h1').first().textContent(), screenshot: `screenshots/${file}` });
      }
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    results.behavior.skipLink = { focusedText: await page.locator(':focus').textContent(), href: await page.locator(':focus').getAttribute('href') };
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
    results.behavior.keyboardOrder = [];
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      results.behavior.keyboardOrder.push(await page.locator(':focus').evaluate(el => ({
        tag: el.tagName,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        href: el.getAttribute('href'),
        id: el.id || null,
      })));
    }
    await page.locator('#search').fill('Kaaba');
    results.behavior.search = { count: await page.locator('#count').textContent(), cards: await page.locator('.card').count() };
    await page.locator('#search').fill('');
    const categoryButton = page.locator('#filters button').filter({ hasText: 'Calligraphy' });
    await categoryButton.click();
    results.behavior.filter = { label: await categoryButton.textContent(), pressed: await categoryButton.getAttribute('aria-pressed'), count: await page.locator('#count').textContent() };
    await page.locator('#filters button').filter({ hasText: /^All$/ }).click();
    const trigger = page.locator('.card-button').first();
    const triggerText = await trigger.textContent();
    await trigger.click();
    results.behavior.dialogOpen = { open: await page.locator('#request').evaluate(el => el.open), focusId: await page.locator(':focus').getAttribute('id') };
    await page.locator('#request-form').evaluate(form => form.requestSubmit());
    results.behavior.validation = {
      focusId: await page.locator(':focus').getAttribute('id'),
      variantError: await page.locator('#variant-error').textContent(),
      whatsappPrepared: await page.locator('#wa-link').getAttribute('href'),
    };
    await page.keyboard.press('Escape');
    results.behavior.dialogEscape = { open: await page.locator('#request').evaluate(el => el.open), restoredText: await page.locator(':focus').textContent(), expectedTriggerText: triggerText };
    results.contracts = await page.evaluate(() => ({
      canonical: document.querySelector('link[rel=canonical]')?.href,
      description: document.querySelector('meta[name=description]')?.content,
      bodyMentionsOrderNotAccepted: document.body.innerText.includes('orders are not yet being accepted'),
      bodyMentionsPrices: document.body.innerText.includes('৳3,000') && document.body.innerText.includes('৳4,000'),
      whatsappHrefs: [...document.querySelectorAll('a[href*="wa.me"]')].map(a => a.href),
      renderedProductCount: document.querySelectorAll('.card').length,
    }));
    await context.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mp = await mobile.newPage();
    await mp.goto(baseURL + '/', { waitUntil: 'networkidle' });
    await mp.locator('.menu-toggle').click();
    const opened = { hidden: await mp.locator('#mobile-menu').getAttribute('hidden'), expanded: await mp.locator('.menu-toggle').getAttribute('aria-expanded') };
    await mp.keyboard.press('Escape');
    results.behavior.mobileMenu = { opened, afterEscape: { hidden: await mp.locator('#mobile-menu').getAttribute('hidden'), expanded: await mp.locator('.menu-toggle').getAttribute('aria-expanded'), focusClass: await mp.locator(':focus').getAttribute('class') } };
    await mobile.close();

    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const rp = await reduced.newPage();
    await rp.goto(baseURL + '/', { waitUntil: 'networkidle' });
    results.modes.reducedMotion = { matches: await rp.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) };
    await rp.screenshot({ path: path.join(outDir, 'home-390-reduced-motion.png'), fullPage: true });
    await reduced.close();

    const nojs = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const np = await nojs.newPage();
    const nojsResponse = await np.goto(baseURL + '/', { waitUntil: 'load' });
    results.modes.javascriptDisabled = { status: nojsResponse.status(), h1: await np.locator('h1').textContent(), navLinks: await np.locator('nav a').count(), staticCatalogueLink: await np.locator('a[href="/catalogue.html"]').count() };
    await np.screenshot({ path: path.join(outDir, 'home-390-javascript-disabled.png'), fullPage: true });
    await nojs.close();

    const failed = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await failed.route('**/products.json', route => route.abort('failed'));
    const fp = await failed.newPage();
    await fp.goto(baseURL + '/', { waitUntil: 'networkidle' });
    results.modes.failedCatalogueRequest = {
      statusHidden: await fp.locator('#catalogue-status').getAttribute('hidden'),
      statusText: await fp.locator('#catalogue-status-text').textContent(),
      retryVisible: await fp.locator('#retry-catalogue').isVisible(),
    };
    await fp.screenshot({ path: path.join(outDir, 'home-1440-failed-catalogue.png'), fullPage: true });
    await failed.close();
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
