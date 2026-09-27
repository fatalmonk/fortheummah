const { chromium } = require('playwright');
const fs = require('fs');

const baseURL = 'http://127.0.0.1:8765';
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const results = { routes: [], layouts: [], states: {}, errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    for (const width of [1440, 1024, 768, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.on('console', message => { if (message.type() === 'error') results.errors.push(`${width}: ${message.text()}`); });
      page.on('pageerror', error => results.errors.push(`${width}: ${error.message}`));
      const response = await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
      const layout = await page.evaluate(() => {
        const box = selector => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) };
        };
        const cards = [...document.querySelectorAll('.card')];
        return {
          viewport: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          hero: box('.hero'),
          collection: box('#collection'),
          controls: box('.controls'),
          firstCard: box('.card'),
          ordering: box('#ordering'),
          cardCount: cards.length,
          minCardButtonHeight: Math.min(...cards.map(card => card.querySelector('.card-button').getBoundingClientRect().height)),
        };
      });
      assert(response.status() === 200, `home returned ${response.status()} at ${width}`);
      assert(layout.scrollWidth === layout.viewport, `horizontal overflow at ${width}`);
      assert(layout.cardCount === 27, `expected 27 cards at ${width}`);
      assert(layout.minCardButtonHeight >= 44, `short card target at ${width}`);
      results.routes.push({ width, status: response.status() });
      results.layouts.push({ width, ...layout });
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
    const longest = await page.locator('.card h3').allTextContents().then(names => names.sort((a, b) => b.length - a.length)[0]);
    await page.locator('#search').fill(longest);
    assert(await page.locator('.card').count() === 1, 'long-name search did not narrow to one card');
    results.states.longName = { query: longest, count: await page.locator('#count').textContent() };
    await page.locator('#search').fill('');
    const filter = page.locator('#filters button').filter({ hasText: 'Calligraphy' });
    await filter.click();
    assert(await filter.getAttribute('aria-pressed') === 'true', 'filter did not become pressed');
    results.states.filter = { count: await page.locator('#count').textContent(), cards: await page.locator('.card').count() };
    await page.locator('#filters button').filter({ hasText: /^All$/ }).click();
    const trigger = page.locator('.card-button').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('#request').evaluate(element => element.open), 'dialog did not open from keyboard');
    await page.keyboard.press('Escape');
    assert(await trigger.evaluate(element => element === document.activeElement), 'dialog did not restore focus');
    results.states.dialogKeyboard = 'pass';
    const reduced = await page.locator('.button').first().evaluate(element => getComputedStyle(element).transitionDuration);
    results.states.reducedMotion = reduced;
    await context.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    await mobilePage.locator('.menu-toggle').click();
    assert(await mobilePage.locator('#mobile-menu').isVisible(), 'mobile menu did not open');
    await mobilePage.keyboard.press('Escape');
    assert(!(await mobilePage.locator('#mobile-menu').isVisible()), 'mobile menu did not close with Escape');
    results.states.mobileMenu = 'pass';
    await mobile.close();

    const noJS = await browser.newContext({ viewport: { width: 390, height: 900 }, javaScriptEnabled: false });
    const noJSPage = await noJS.newPage();
    await noJSPage.goto(baseURL + '/', { waitUntil: 'load' });
    assert(await noJSPage.locator('noscript').count() === 1, 'no-JS fallback content missing');
    assert(await noJSPage.locator('a[href="catalogue.html"]').count() > 0, 'static fallback catalogue link missing');
    results.states.noJS = 'pass';
    await noJS.close();

    const failed = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const failedPage = await failed.newPage();
    await failedPage.route('**/products.json', route => route.abort());
    await failedPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    assert(await failedPage.locator('#catalogue-status').isVisible(), 'failed catalogue status not visible');
    assert(await failedPage.locator('#retry-catalogue').isVisible(), 'failed catalogue retry not visible');
    results.states.failedCatalogue = 'pass';
    await failed.close();

    assert(results.errors.length === 0, `console/page errors: ${results.errors.join('; ')}`);
    fs.writeFileSync('design-task4/results.json', JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
