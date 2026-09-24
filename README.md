# For the Ummah

Responsive Islamic puzzle concept catalogue for Bangladesh. The site prepares WhatsApp enquiries; it does not process payments or confirm orders.

## Project contents

- `site/` is the complete Cloudflare Pages Direct Upload directory. Upload only this directory.
- `site/products.json` is the public product catalog (stable ID, title, category, WebP derivative paths). Original asset filenames and prompts remain in internal source material.
- `site/product/<ID>/index.html` contains indexable product detail and share URLs.
- `site/assets/thumbs/` and `site/assets/full/` are WebP delivery derivatives. Original concept artwork stays unchanged as PNGs in `mockups/`, outside the deployment output.
- `mockups/`, `design-boards/`, and `archives/` are internal source material; never upload them as the Pages output directory.

## Local preview

From this folder, run `python3 -m http.server 8765 --directory site` and visit <http://localhost:8765/>. Product detail paths work with this server. Their enquiry buttons return to the catalogue and pre-open the selected-design form. Their enquiry buttons return to the catalogue and pre-open the selected-design form. The directory also has a static catalogue fallback at `/catalogue.html`.

## Checks

Refresh the static release files from project root with `python3 scripts/build_products_json.py`, `python3 scripts/build_images.py` (requires `cwebp`), and `python3 scripts/generate_pages.py`. These recreate public image derivatives, the product detail routes, catalogue and sitemap from the source manifest. Then run `python3 scripts/check_site.py` and `node scripts/check_order_message.js` for catalog IDs, referenced assets, SEO URLs, contact destinations, deployment files, and exact WhatsApp message generation/validation. These checks do not send a message. Check links, mobile layout, keyboard/focus, and browser console manually in a browser.

## Business and content status

Indicative range only: BDT 3,000–4,000 per puzzle. Enquiries use WhatsApp `8801731944544`; the customer reviews and sends the prepared message. Exact prices, inventory, shipping, timing, payment, fulfilment and policies are not configured. No stock or production claims are made.

All 27 supplied images are three-panel AI mockup sheets, not manufactured product photos. The frame is not confirmed included; piece count and age rating are proposed. Arabic lettering, diacritics, Qur'anic text, religious references and architecture need professional review. `C05` is an opening Dua Qunoot excerpt. `A03` depicts Al-Aqsa's Qibli prayer hall; `A06` is the separate Dome of the Rock concept. Eid designs retain their explicit 2026 theme and year in the original art; as of 2026-09-25 that season's Eid occasions have passed. Original PNG artwork has not been edited.

## Cloudflare Pages Direct Upload

The current production hostname is `https://fortheummah.pages.dev/`. Project: `fortheummah`; account: Lucky Store (`8e457654e12c3b75d2094bbd8914030b`). Direct Upload is the existing deployment model. Wrangler must be authenticated to that account. Check with `wrangler whoami` without printing tokens. After owner approval to publish this release candidate:

1. Review the candidate and business/content launch decisions below.
2. From this directory, deploy the explicit output directory: `wrangler pages deploy site --project-name=fortheummah`.
3. Open the deployment URL and verify `/`, `/catalogue.html`, `/product/A01/`, a second product, `/robots.txt`, `/sitemap.xml`, and a missing path. Check response headers and browser console on desktop and mobile.
4. Verify the prepared WhatsApp destination and decoded message without sending it.
5. Promote/set the production alias only using the existing Cloudflare Pages deployment flow; do not create or delete projects or change DNS.

Do not deploy from the workspace root. Preview deployments are publicly reachable by URL: get owner approval before publishing a preview unless authorized separately.

## Rollback

Cloudflare Pages keeps previous deployments. In the Pages dashboard, open project `fortheummah`, select the previously serving deployment, and use the deployment rollback action (or redeploy its exact prior artifact). Verify the canonical hostname and core paths after rollback. Keep the previous deployment available until the candidate passes production checks. Do not delete deployments or alter project/domain configuration as part of rollback.

## Release status

- Technical: local release candidate; production deployment not approved or run.
- Content/artwork: not production reviewed.
- Commercial: exact price, availability, delivery, timing, payment arrangements, policies, and order handling still need owner decisions.
