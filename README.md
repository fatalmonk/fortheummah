# For the Ummah

Responsive Islamic puzzle concept catalogue for Bangladesh. The site prepares WhatsApp enquiries; it does not process payments or confirm orders.

## Project contents

- `site/` is the complete Cloudflare Pages Direct Upload directory. Upload only this directory.
- `site/products.json` is the public product catalog (stable ID, title, category, WebP derivative paths). Original asset filenames and prompts remain in internal source material.
- `site/product/<ID>/index.html` contains indexable product detail and share URLs.
- `site/assets/thumbs/` and `site/assets/full/` are WebP delivery derivatives. Original concept artwork stays unchanged as PNGs in `mockups/`, outside the deployment output.
- `mockups/`, `design-boards/`, and `archives/` are internal source material; never upload them as the Pages output directory.

## Local preview

From this folder, run `python3 -m http.server 8765 --directory site` and visit <http://localhost:8765/>. Product detail paths work with this server. Their enquiry buttons return to the catalogue and pre-open the selected-design form. The directory also has a static catalogue fallback at `/catalogue.html`.

## Checks

Refresh the static release files from project root with `python3 scripts/build_products_json.py`, `python3 scripts/build_images.py` (requires `cwebp`), and `python3 scripts/generate_pages.py`. These recreate public image derivatives, the product detail routes, catalogue and sitemap from the source manifest. Then run `python3 scripts/check_site.py` and `node scripts/check_order_message.js` for catalog IDs, referenced assets, SEO URLs, contact destinations, deployment files, and exact WhatsApp message generation/validation. These checks do not send a message. Check links, mobile layout, keyboard/focus, and browser console manually in a browser.

## Business and content status

The authoritative business decision record is [LAUNCH_DECISIONS.md](LAUNCH_DECISIONS.md). The confirmed position is concept previews plus WhatsApp enquiries. No design is approved for manufacture; exact SKU prices, specifications, stock, delivery coverage/fees/timing, payment, order confirmation, cancellation and returns are **TBD**. The intended price range is indicative only. The site does not accept payment or promise availability or delivery.

All 27 supplied images are three-panel AI mockup sheets, not manufactured product photos. The frame is not confirmed included; piece count, dimensions, material, finish, packaging and age suitability are TBD. Arabic lettering, diacritics, Qur'anic text, religious references and architecture have no recorded professional production approval. `C05` is an opening Dua Qunoot excerpt. `A03` depicts Al-Aqsa's Qibli prayer hall; `A06` is the separate Dome of the Rock concept. Eid designs retain their explicit 2026 theme and year in the original art. That is now a past-season theme as of 2026-09-25, but visibility for this release is TBD. Original PNG artwork has not been edited.

## Cloudflare Pages Direct Upload

The current production hostname is `https://fortheummah.pages.dev/`. Project: `fortheummah`; account: Lucky Store (`8e457654e12c3b75d2094bbd8914030b`). Direct Upload is the existing deployment model. Wrangler must be authenticated to that account. Check with `wrangler whoami` without printing tokens. At candidate preparation the existing Wrangler token was expired, so the configured production branch could not be read. Verify the selected account, project, and production branch in the Cloudflare dashboard first. After owner approval to publish this release candidate:

1. Review the candidate and [business/content launch decisions](LAUNCH_DECISIONS.md).
2. From this directory, deploy the explicit output directory to the branch verified in the dashboard: `wrangler pages deploy site --project-name=fortheummah --branch=YOUR_CONFIRMED_PRODUCTION_BRANCH`.
3. Open the deployment URL and verify `/`, `/catalogue.html`, `/product/A01/`, a second product, `/robots.txt`, `/sitemap.xml`, and a missing path. Check response headers and browser console on desktop and mobile.
4. Verify the prepared WhatsApp destination and decoded message without sending it.
5. Confirm Cloudflare associates that branch deployment with the existing production alias. Do not create or delete projects or change DNS. If the branch would create a preview, stop; preview URLs are public and require separate approval.

Do not deploy from the workspace root. Preview deployments are publicly reachable by URL: get owner approval before publishing a preview unless authorized separately.

## Rollback

Cloudflare Pages keeps previous deployments. In the Pages dashboard, open project `fortheummah`, select the previously serving deployment, and use the deployment rollback action (or redeploy its exact prior artifact). Verify the canonical hostname and core paths after rollback. Keep the previous deployment available until the candidate passes production checks. Do not delete deployments or alter project/domain configuration as part of rollback.

## Release status

- Technical: local release candidate verified in desktop and mobile Chrome; production deployment not approved or run.
- Content/artwork: not production approved; reviewer and final art approval TBD.
- Commercial: concept-enquiry release only; commercial launch pending the unresolved entries in [LAUNCH_DECISIONS.md](LAUNCH_DECISIONS.md).
