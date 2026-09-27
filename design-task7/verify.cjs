const { chromium } = require('playwright');
const fs = require('fs');

const baseURL = 'http://127.0.0.1:8765';
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = ['/', '/catalogue.html', '/policies.html', '/product/A01/', '/product/E01/', '/product/C01/', '/product/Q01/', '/404.html'];
const widths = [320, 360, 390, 768, 1024, 1440];
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function parseColor(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: values[0], g: values[1], b: values[2], a: values.length > 3 ? values[3] : 1 };
}
function luminance({ r, g, b }) {
  const channel = value => {
    const normalized = value / 255;
    return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
  };
  return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
}
function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + .05) / (darker + .05);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const results = { layouts: [], accessibility: {}, interactions: {}, contrast: {}, errors: [] };
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width === 320 ? 2 : 1 });
      const page = await context.newPage();
      page.on('console', message => { if (message.type() === 'error') results.errors.push(`${width}: ${message.text()}`); });
      page.on('pageerror', error => results.errors.push(`${width}: ${error.message}`));
      for (const route of routes) {
        const response = await page.goto(baseURL + route, { waitUntil: 'networkidle' });
        const layout = await page.evaluate(() => {
          const all = [...document.querySelectorAll('body *')];
          const visible = element => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          };
          const overflowing = all.filter(element => visible(element) && (
            element.getBoundingClientRect().right > innerWidth + 1 || element.getBoundingClientRect().left < -1
          )).slice(0, 10).map(element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.classList.length ? `.${[...element.classList].join('.')}` : ''}`);
          return {
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflowing,
            h1Count: document.querySelectorAll('h1').length,
            headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName[1])),
            unnamedImages: [...document.images].filter(image => !image.hasAttribute('alt')).length,
            unnamedControls: [...document.querySelectorAll('button,input,select,textarea')].filter(element => {
              if (element.type === 'hidden') return false;
              if (element.tagName === 'BUTTON' && element.textContent.trim()) return false;
              const labels = element.labels ? [...element.labels] : [];
              return !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby') && labels.length === 0;
            }).length,
          };
        });
        assert(response.status() === 200, `${route} returned ${response.status()} at ${width}`);
        assert(layout.scrollWidth <= layout.viewport, `${route} horizontal overflow at ${width}: ${layout.scrollWidth}/${layout.viewport}`);
        assert(layout.overflowing.length === 0, `${route} clipped elements at ${width}: ${layout.overflowing.join(', ')}`);
        assert(layout.h1Count === 1, `${route} has ${layout.h1Count} h1 elements`);
        for (let index = 1; index < layout.headings.length; index += 1) {
          assert(layout.headings[index] <= layout.headings[index - 1] + 1, `${route} skips heading levels`);
        }
        assert(layout.unnamedImages === 0, `${route} has images without alt text`);
        assert(layout.unnamedControls === 0, `${route} has unnamed form controls`);
        results.layouts.push({ width, route, ...layout });
      }
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });

    const focusFailures = [];
    const focusOrder = [];
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    for (let index = 0; index < 30; index += 1) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(180);
      const state = await page.evaluate(() => {
        const element = document.activeElement;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          name: element.getAttribute('aria-label') || element.textContent.trim().replace(/\s+/g, ' ').slice(0, 50) || element.id,
          tag: element.tagName,
          visible: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth,
          indicator: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
        };
      });
      focusOrder.push(state);
      if (!state.visible || !state.indicator) focusFailures.push(state);
    }
    assert(focusOrder.length === 30, `only checked ${focusOrder.length} focus targets`);
    assert(focusFailures.length === 0, `focus failures: ${JSON.stringify(focusFailures)}`);
    results.accessibility.focus = { checked: focusOrder.length, order: focusOrder };

    await page.locator('.menu-toggle').focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('#mobile-menu').isVisible(), 'mobile menu does not open by keyboard');
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#mobile-menu').isVisible()), 'mobile menu does not close with Escape');
    assert(await page.locator('.menu-toggle').evaluate(element => element === document.activeElement), 'mobile menu focus is not restored');
    results.interactions.mobileMenu = 'pass';

    const firstCard = page.locator('.card-button').first();
    await firstCard.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('#request');
    assert(await dialog.evaluate(element => element.open), 'dialog does not open by keyboard');
    assert(await page.locator('#variant').evaluate(element => element === document.activeElement), 'dialog initial focus is wrong');
    const dialogTabCycle = [];
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      dialogTabCycle.push(await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName));
    }
    await page.keyboard.press('Escape');
    assert(!(await dialog.evaluate(element => element.open)), 'dialog does not close with Escape');
    assert(await firstCard.evaluate(element => element === document.activeElement), 'dialog focus is not restored');
    results.interactions.dialog = { status: 'pass', tabCycle: dialogTabCycle };

    const liveRegions = await page.evaluate(() => ({
      count: document.querySelector('#count')?.getAttribute('aria-live'),
      status: document.querySelector('#catalogue-status-text')?.getAttribute('role'),
      errors: [...document.querySelectorAll('.field-error')].every(error => error.getAttribute('aria-live') === 'polite'),
      busy: document.querySelector('#grid')?.getAttribute('aria-busy'),
    }));
    assert(liveRegions.count === 'polite', 'result count is not a live region');
    assert(liveRegions.status === 'status', 'catalogue state is not announced');
    assert(liveRegions.errors, 'form errors are not live regions');
    assert(liveRegions.busy === 'false', 'catalogue busy state did not settle');
    results.accessibility.liveRegions = liveRegions;

    const contrastSamples = await page.evaluate(() => {
      const samples = ['body', '.intro', '.fine', '.eyebrow', '.button', '.concept-note', '.field-error'];
      return Object.fromEntries(samples.map(selector => {
        const element = document.querySelector(selector);
        const style = getComputedStyle(element);
        let parent = element;
        let background = null;
        while (parent && (!background || background.a === 0)) {
          const match = getComputedStyle(parent).backgroundColor.match(/rgba?\(([^)]+)\)/);
          if (match) {
            const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
            background = { r: values[0], g: values[1], b: values[2], a: values.length > 3 ? values[3] : 1 };
          }
          parent = parent.parentElement;
        }
        return [selector, { color: style.color, background: background || { r: 250, g: 248, b: 243, a: 1 }, fontSize: parseFloat(style.fontSize), fontWeight: Number(style.fontWeight) || 400 }];
      }));
    });
    for (const [selector, sample] of Object.entries(contrastSamples)) {
      const foreground = parseColor(sample.color);
      const ratio = contrast(foreground, sample.background);
      const large = sample.fontSize >= 24 || (sample.fontSize >= 18.66 && sample.fontWeight >= 700);
      assert(ratio >= (large ? 3 : 4.5), `${selector} contrast ${ratio.toFixed(2)} is insufficient`);
      results.contrast[selector] = Number(ratio.toFixed(2));
    }
    await context.close();

    const reduced = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    const motion = await reducedPage.evaluate(() => ({
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      smoothScroll: getComputedStyle(document.documentElement).scrollBehavior,
      maxTransitionMs: Math.max(...[...document.querySelectorAll('*')].map(element => {
        const value = getComputedStyle(element).transitionDuration.split(',')[0];
        return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
      }).filter(Number.isFinite)),
    }));
    assert(motion.matches, 'reduced motion media query does not match');
    assert(motion.smoothScroll === 'auto', 'smooth scroll remains enabled');
    assert(motion.maxTransitionMs <= .02, `transition remains at ${motion.maxTransitionMs}ms`);
    results.accessibility.reducedMotion = motion;
    await reduced.close();

    const zoomed = await browser.newContext({ viewport: { width: 640, height: 900 } });
    const zoomedPage = await zoomed.newPage();
    const zoomedClient = await zoomedPage.context().newCDPSession(zoomedPage);
    await zoomedPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    await zoomedClient.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    const zoomState = await zoomedPage.evaluate(() => ({
      scale: visualViewport.scale,
      viewportWidth: visualViewport.width,
      documentWidth: document.documentElement.scrollWidth,
      layoutWidth: document.documentElement.clientWidth,
    }));
    assert(zoomState.scale === 2, `page scale is ${zoomState.scale}, not 2`);
    assert(zoomState.documentWidth === zoomState.layoutWidth, 'page has horizontal document overflow at 200% zoom');
    await zoomedPage.locator('.menu-toggle').focus();
    await zoomedPage.locator('.menu-toggle').evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await zoomedPage.waitForTimeout(200);
    const zoomFocus = await zoomedPage.locator('.menu-toggle').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.left >= visualViewport.offsetLeft && rect.right <= visualViewport.offsetLeft + visualViewport.width;
    });
    assert(zoomFocus, 'focused mobile menu control is obscured at 200% zoom');
    results.accessibility.zoom200 = zoomState;
    await zoomed.close();

    const touch = await browser.newContext({ viewport: { width: 320, height: 900 }, hasTouch: true, isMobile: true });
    const touchPage = await touch.newPage();
    await touchPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
    const targets = await touchPage.evaluate(() => {
      const selectors = ['.menu-toggle', '.filters button', '.card-button', '#retry-catalogue', '#reset-filters', '.close', '.submit-button'];
      return Object.fromEntries(selectors.map(selector => {
        const dimensions = [...document.querySelectorAll(selector)].filter(element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return !element.closest('[hidden]') && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        }).map(element => {
          const rect = element.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        });
        return [selector, dimensions];
      }));
    });
    for (const [selector, dimensions] of Object.entries(targets)) {
      for (const dimension of dimensions) assert(dimension.height >= 44, `${selector} target is ${dimension.height}px tall at 320px`);
    }
    results.accessibility.touchTargets = targets;
    await touch.close();

    assert(results.errors.length === 0, `console/page errors: ${results.errors.join('; ')}`);
    fs.writeFileSync('design-task7/results.json', JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify({ layouts: results.layouts.length, accessibility: results.accessibility, interactions: results.interactions, contrast: results.contrast, errors: results.errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.stack); process.exit(1); });
