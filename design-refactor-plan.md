# For the Ummah design refactor — authoritative implementation plan

**Status:** Approved execution plan; implementation has not started  
**Repository:** `/Users/mac.alvi/workspace/fortheummah`  
**Deployment output:** `site/` (Cloudflare Pages Direct Upload)  
**Last grounded against repository:** 2026-09-27

## 1. Objective

Refine the existing visual system and responsive presentation without changing what the storefront says or does. Preserve the current information architecture, product catalogue, prices, disclosures, contact destination, enquiry flow, search/filter behavior, SEO, and accessibility while improving visual consistency and clarity.

This is a dependency-free static site. The implementation must remain plain HTML, CSS, and JavaScript. Do not introduce React, Tailwind, Motion, GSAP, npm, a bundler, or a component framework.

## 2. Repository ownership map

Use the real source of truth for each surface:

| Surface | Authoritative source | Rule |
|---|---|---|
| Homepage structure and metadata | `site/index.html` | Edit directly and minimally. Preserve section order, IDs, copy, JSON-LD, canonical/OG/Twitter metadata, and link behavior. |
| Shared visual system and responsive styles | `site/style.css` | This is the only deployed stylesheet and the source of truth for design tokens. Extend/refactor here; do not add a second token file. |
| Homepage interactions | `site/store.js` | Preserve unless a verified design requirement cannot be met with HTML/CSS. Do not alter catalogue, filter, dialog, focus, or URL-selection behavior for visual polish. |
| WhatsApp message construction | `site/order-message.js` | Do not change during the design refactor. |
| Catalogue, customer policies, product detail pages, sitemap | `scripts/generate_pages.py` | Never hand-edit generated outputs. Change their markup only in the generator, regenerate, and review the resulting diff. |
| Generated outputs | `site/catalogue.html`, `site/policies.html`, `site/product/*/index.html`, `site/sitemap.xml` | Treat as build artifacts owned by `scripts/generate_pages.py`. |
| Product records | `site/products.json` | Do not change product IDs, titles, categories, prices, or image paths as part of this refactor. |
| Integrity checks | `scripts/check_site.py`, `scripts/check_order_message.js` | Keep passing after every implementation slice. Add assertions before altering a contract not already covered. |
| Launch facts and unresolved gates | `LAUNCH_DECISIONS.md` | Preserve all public claims and TBD/unconfirmed status. Do not visually imply that orders are accepted. |

`tokens.css` at the repository root is untracked, unused, and accidental. It is not a source file and must be removed in the first implementation slice.

## 3. Non-negotiable preservation contract

Every implementation task must preserve all of the following:

- Existing information architecture and section order, including navigation targets and IDs such as `#collection` and `#ordering`.
- All 27 stable product IDs, category assignments, titles, image references, and product URLs.
- Prices: 500 pieces at ৳3,000, 1,000 pieces at ৳4,000, optional wooden frame kit at +৳3,000, and delivery charged separately.
- Every readiness disclosure: enquiries are welcome, orders are not currently accepted, and supplier/sample/specification/production/payment gates remain pending where stated.
- WhatsApp destination `8801731944544`, external-link safety attributes, preselected-product URLs, form validation, and encoded message content.
- Search, category filters, result count, retry/empty states, mobile menu, dialog open/close behavior, Escape handling, focus restoration, and no-JavaScript/static catalogue fallback.
- Canonical URLs, robots directives, titles/descriptions, Open Graph/Twitter metadata, structured data, sitemap contents, and indexable product detail routes.
- Semantic landmarks, heading hierarchy, labels, alternative text, skip links, keyboard operation, visible focus, adequate target sizes, status announcements, and reduced-motion behavior.
- All approved policy and product copy. A design task must not silently become a content, pricing, fulfilment, or commerce-readiness change.
- The existing deployment model: upload only `site/`; never copy internal `mockups/`, `design-boards/`, or `archives/` into it.

## 4. Required verification loop

Run from `/Users/mac.alvi/workspace/fortheummah` after each slice:

```bash
python3 scripts/check_site.py
node scripts/check_order_message.js
git diff --check
git status --short
```

When `scripts/generate_pages.py` changes, also run:

```bash
python3 scripts/generate_pages.py
python3 scripts/check_site.py
node scripts/check_order_message.js
```

Then inspect the generated diff and confirm it contains only intended markup/style-hook changes. Never accept unrelated generated copy, metadata, URL, price, or disclosure changes.

For browser verification, serve the actual deployment directory:

```bash
python3 -m http.server 8765 --directory site
```

Verify at minimum:

- `/`
- `/catalogue.html`
- `/policies.html`
- `/product/A01/`
- one product from each remaining category
- `/404.html`

Test desktop and narrow mobile viewports, keyboard-only navigation, `prefers-reduced-motion: reduce`, JavaScript enabled and disabled, and a failed catalogue request. Do not send a WhatsApp message; verify only the generated destination and decoded payload through the existing test.

Record each completed slice, commands, results, reviewed routes/viewports, and deviations in `design-refactor-log.md` before moving on.

## 5. Incremental implementation tasks

### Task 0 — Freeze the preservation baseline

**Files:** `design-refactor-log.md`; tests only if a preservation contract is uncovered and untested.

1. Record current branch/commit and `git status --short`.
2. Run the required verification loop and record exact outputs.
3. Capture baseline browser references for the required routes at representative widths: 1440 px, 1024 px, 768 px, and 390 px.
4. Exercise keyboard order, skip links, mobile menu, filters, search, product enquiry dialog, validation, Escape close, and focus restoration.
5. Record the visible copy/metadata contracts most likely to regress: prices, order-readiness disclosure, WhatsApp number, canonical URLs, and product count.
6. If any baseline failure exists, stop and log it as pre-existing; do not hide it inside design work.

**Acceptance:** baseline checks and behavior are recorded, all current failures are distinguished from refactor regressions, and there is enough evidence for before/after comparison.

### Task 1 — Remove the accidental undeployed stylesheet

**Files:** delete root `tokens.css` only.

1. Confirm `tokens.css` is untracked and not referenced by any deployed HTML/CSS.
2. Delete it.
3. Run the required verification loop.
4. Record cleanup in the execution log.

**Acceptance:** root `tokens.css` is absent, `site/style.css` remains the sole deployed stylesheet, and all checks pass.

### Task 2 — Consolidate the design foundation in the deployed stylesheet

**File:** `site/style.css`.

1. Inventory repeated colors, type stacks, radii, spacing, borders, shadows, content widths, and control heights already used in the stylesheet.
2. Extend the existing `:root` block with only tokens justified by repeated current usage or the approved visual direction.
3. Replace repeated literals incrementally, one token family at a time (color/type first, then spacing/radii/shadows).
4. Keep existing variable names when their meaning is sound; avoid broad renaming with no user-visible benefit.
5. Preserve focus contrast, readable body contrast, minimum interactive target sizes, and the current system-font/dependency-free strategy.
6. Add or retain a `prefers-reduced-motion: reduce` path for any transition or motion introduced.

**Acceptance:** no second stylesheet or external font dependency exists; computed styles remain intentional across all required routes; focus and contrast remain usable; checks pass.

### Task 3 — Refine shared shell and controls

**Files:** `site/style.css`; `site/index.html` only if a semantic/style hook is strictly needed; `scripts/generate_pages.py` for shared generated-page markup hooks.

1. Refine header, brand, navigation, buttons, inputs, filter pills, cards, badges, footer, and focus/hover/disabled states using the consolidated tokens.
2. Keep links as links and buttons as buttons; do not replace semantics for styling convenience.
3. Preserve all IDs, hrefs, labels, `aria-*` attributes, `target`, and `rel` values.
4. If generated pages need a class or wrapper, add it in `scripts/generate_pages.py`, regenerate, and review every generated file category.
5. Confirm touch targets, wrapping, and overflow at all baseline widths.

**Acceptance:** shared elements are visually consistent on homepage, catalogue, policies, product, and 404 pages; no navigation or accessibility contract changes; checks pass.

### Task 4 — Refine the homepage hierarchy without changing IA

**Files:** `site/style.css`; `site/index.html` only for minimal presentational hooks.

1. Improve hierarchy, spacing, line length, and responsive composition of the existing hero.
2. Improve discovery of the existing collection controls and reduce time to first product interaction without adding or reordering sections.
3. Improve product-card scanability while keeping current card content, prices, disclosures, image sources, and actions.
4. Refine the existing ordering/enquiry and supporting information sections without changing claims or implying checkout/order acceptance.
5. Preserve the static fallback link and all no-JavaScript content.
6. Compare against baseline at all target widths and with long product names/filter states.

**Acceptance:** the first product action and catalogue controls remain obvious; no copy, section, product, ID, price, or action changes; no layout overflow; checks pass.

### Task 5 — Refine catalogue and product-detail templates at the generator

**Files:** `scripts/generate_pages.py`, `site/style.css`; regenerated `site/catalogue.html` and `site/product/*/index.html`.

1. Make only the markup-hook changes required for the shared visual system.
2. Keep catalogue cards and product details generated from `site/products.json`.
3. Preserve canonical URLs, metadata, breadcrumb/navigation destinations, image dimensions/loading behavior, prices, disclosures, enquiry links, and WhatsApp destination.
4. Regenerate all owned outputs.
5. Inspect representative products from every category and diff all generated files for unintended content changes.

**Acceptance:** all 27 detail routes and catalogue remain indexable and factually identical; only intended presentational markup/style changes occur; checks pass.

### Task 6 — Refine policies, empty/error states, and 404

**Files:** `scripts/generate_pages.py`, `site/style.css`, and `site/404.html` only if needed.

1. Improve reading width, section rhythm, lists, notices, and action hierarchy on the policies page without altering policy language.
2. Apply the same system to catalogue loading, retry, empty, validation, and WhatsApp fallback states.
3. Refine the 404 presentation while preserving `noindex`, navigation, and recovery link.
4. Verify state messaging remains perceivable and keyboard accessible.

**Acceptance:** secondary and failure states are consistent with the primary experience; all factual and SEO contracts remain intact; checks pass.

### Task 7 — Responsive, accessibility, and motion hardening

**Files:** primarily `site/style.css`; markup/JS only for demonstrated defects.

1. Test at 320–390 px, 768 px, 1024 px, and 1440 px, plus zoom to 200%.
2. Verify no horizontal scrolling, clipped copy, obscured focus, or overlapping controls.
3. Verify keyboard order and operation for navigation, filters, search, cards, dialog, form, and close/retry actions.
4. Verify semantic landmarks/headings, form names/errors, live status, image alternative text, contrast, and visible focus.
5. Verify reduced motion and that functionality does not depend on animation.
6. Fix only observed defects and add regression coverage where practical.

**Acceptance:** required flows work without mouse input or animation; no critical accessibility or responsive regressions remain; checks pass.

### Task 8 — Final release verification and handoff

**Files:** `design-refactor-log.md`; any test documentation justified by the work.

1. Regenerate generator-owned files once from a clean working tree state.
2. Run the full required verification loop and record exact output.
3. Re-run the complete browser route/viewport matrix and compare with baseline references.
4. Inspect `git diff --stat`, `git diff --check`, and the full diff for forbidden content, behavior, SEO, pricing, URL, dependency, or deployment changes.
5. Confirm no source art or internal directory entered `site/`, no new dependency/build step was added, and only `site/` remains deployable.
6. Update the execution log with completed tasks, evidence, unresolved issues, and rollback notes.
7. Do not deploy or commit unless separately instructed.

**Acceptance:** all automated checks pass; browser verification is recorded; preservation contract is satisfied; generated files match their generator; working-tree changes are fully accounted for.

## 6. Stop conditions

Stop implementation and request a decision rather than guessing if any proposed visual change requires:

- changing section order or information architecture;
- changing approved copy, pricing, product data, delivery/payment claims, or order readiness;
- changing the WhatsApp number, payload, or enquiry behavior;
- removing an accessibility or SEO contract;
- adding a dependency, framework, analytics tool, remote font, build pipeline, or third-party service;
- modifying generated output in a way that cannot be represented in `scripts/generate_pages.py`;
- deploying or committing.

## 7. Definition of done

The refactor is complete only when every task marked completed in `design-refactor-log.md` has evidence; the automated checks pass; the required browser matrix has been reviewed; all generated outputs come from the generator; the preservation contract is intact; and no unapproved dependency, production behavior, deployment, or commit has been introduced.
