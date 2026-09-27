const { chromium } = require('playwright');

const baseURL = 'http://127.0.0.1:8765';
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const assert = (condition, message) => { if (!condition) throw new Error(message); };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const results = { routes: [], states: {}, errors: [] };
  try {
    for (const width of [1440, 768, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.on('console', message => { if (message.type() === 'error') results.errors.push(`${width}: ${message.text()}`); });
      page.on('pageerror', error => results.errors.push(`${width}: ${error.message}`));
      for (const route of ['/policies.html', '/404.html']) {
        const response = await page.goto(baseURL + route, { waitUntil: 'networkidle' });
        const state = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          title: document.title,
          h1: document.querySelector('h1')?.textContent.trim(),
        }));
        assert(response.status() === 200, `${route} returned ${response.status()}`);
        assert(state.scrollWidth === width, `${route} overflows at ${width}px`);
        results.routes.push({ route, width, ...state });
      }
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
    await page.locator('#search').fill('not-a-real-design');
    assert(await page.locator('#empty').isVisible(), 'empty state is not visible');
    await page.locator('#reset-filters').focus();
    assert(await page.locator('#reset-filters').evaluate(el => el === document.activeElement), 'empty-state action cannot receive focus');
    results.states.empty = 'pass';

    await page.locator('#search').fill('');
    const trigger = page.locator('.card-button').first();
    await trigger.click();
    await page.locator('#request-form').evaluate(form => form.requestSubmit());
    const validation = await page.evaluate(() => ({
      message: document.querySelector('#variant-error').textContent,
      invalid: document.querySelector('#variant').getAttribute('aria-invalid'),
      focused: document.activeElement?.id,
    }));
    assert(validation.message === 'Choose a puzzle size.', 'validation message changed');
    assert(validation.invalid === 'true', 'invalid field is not exposed');
    assert(validation.focused === 'variant', 'invalid field did not receive focus');
    results.states.validation = validation;
    await page.keyboard.press('Escape');
    await context.close();

    const failed = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const failedPage = await failed.newPage();
    await failedPage.route('**/products.json', route => route.abort());
    await failedPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    assert(await failedPage.locator('#catalogue-status').isVisible(), 'failed-catalogue state is hidden');
    assert(await failedPage.locator('#retry-catalogue').isVisible(), 'retry action is hidden');
    await failedPage.locator('#retry-catalogue').focus();
    assert(await failedPage.locator('#retry-catalogue').evaluate(el => el === document.activeElement), 'retry action cannot receive focus');
    results.states.failedCatalogue = await failedPage.locator('#catalogue-status-text').textContent();
    await failed.close();

    assert(results.errors.length === 0, `browser errors: ${results.errors.join('; ')}`);
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
