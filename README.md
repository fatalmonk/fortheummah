# For the Ummah

Responsive Islamic puzzle catalogue for Bangladesh. The site prepares WhatsApp enquiries only; order acceptance remains disabled until the listed supplier, sample, production-time, and payment-detail gates are cleared.

## Project contents

- `site/` is the complete Cloudflare Pages Direct Upload directory. Upload only this directory.
- `site/products.json` is the public product catalog (stable ID, title, category, WebP derivative paths). Original asset filenames and prompts remain in internal source material.
- `site/product/<ID>/index.html` contains indexable product detail and share URLs.
- `site/assets/thumbs/` and `site/assets/full/` are WebP delivery derivatives. Original concept artwork stays unchanged as PNGs in `mockups/`, outside the deployment output.
- `mockups/`, `design-boards/`, and `archives/` are internal source material; never upload them as the Pages output directory.

## Local preview

From this folder, run `python3 -m http.server 8765 --directory site` and visit <http://localhost:8765/>. Product detail paths work with this server. Their enquiry buttons return to the catalogue and pre-open the selected-design form. The directory also has a static catalogue fallback at `/catalogue.html` and customer terms at `/policies.html`.

## Checks

Refresh the static release files from project root with `python3 scripts/build_products_json.py`, `python3 scripts/build_images.py` (requires `cwebp`), and `python3 scripts/generate_pages.py`. These recreate public image derivatives, the product detail routes, static catalogue, customer policies and sitemap. Then run `python3 scripts/check_site.py` and `node scripts/check_order_message.js` for catalog IDs, referenced assets, SEO URLs, contact destinations, deployment files, customer-term coverage and WhatsApp message generation/validation. These checks do not send a message. Check links, mobile layout, keyboard/focus, and browser console manually in a browser.

## Business and content status

The authoritative business decision record is [LAUNCH_DECISIONS.md](LAUNCH_DECISIONS.md). All 27 designs are approved in principle, and the site may display owner-approved variant prices, delivery charges and customer terms. The catalogue currently accepts WhatsApp enquiries only; orders are not yet being accepted. Do not claim stock or a confirmed production lead time.

All 27 supplied images are three-panel AI mockup sheets, not manufactured product photos. The approved prices are ৳3,000 for 500 pieces and ৳4,000 for 1,000 pieces; the optional wooden frame kit is ৳3,000 extra. Frame inclusion is not implied. Supplier/sample confirmation remains outstanding for specifications, piece counts, dimensions, material, finish, packaging, manufacturing feasibility, and the final frame specification. Age suitability is 6+ as owner-approved, pending supplier/sample confirmation. A qualified reviewer and documented approval are still required before manufacture of designs with Arabic/religious material. `C05` is an opening Dua Qunoot excerpt. `A03` depicts Al-Aqsa's Qibli prayer hall; `A06` is the separate Dome of the Rock. E01–E05 are labelled Eid 2027 / 1448 AH; source artwork remains unchanged. Original PNG artwork has not been edited.

## Cloudflare Pages deployment

The current production hostname is `https://fortheummah.pages.dev/`. Project: `fortheummah`; account: Lucky Store (`8e457654e12c3b75d2094bbd8914030b`). The live dashboard shows GitHub integration to `fatalmonk/fortheummah`, automatic deployments enabled, production branch `main`, and `site` as the build output directory. Wrangler authentication was verified with `wrangler whoami`. Use an explicit Wrangler Pages upload of `site/` to branch `main` for this release. This deploys only public site files and does not push the internal workspace or alter the GitHub repository. Do not create a public preview.

1. Confirm all required checks pass and outstanding commercial/manufacturing gates remain accurately disclosed.
2. Deploy from this directory using `wrangler pages deploy site --project-name=fortheummah --branch=main`.
3. Verify Cloudflare reports a successful Production deployment on branch `main`.
4. Open the canonical site and verify `/`, `/catalogue.html`, `/policies.html`, `/product/A01/`, a second product, `/robots.txt`, `/sitemap.xml`, and a missing path. Check response headers and browser console on desktop and mobile.
5. Verify the prepared WhatsApp destination and decoded message without sending it. Do not create or delete projects or change DNS. Preview deployments are public and are not authorized by this release approval.

The dashboard’s project settings and Production deployment list are the source of truth for deployment method, output directory and branch. Reconfirm them before a future release. Wrangler supports manually deploying assets to an existing Git-integrated Pages project; a repository push is not required for this release.

## Rollback

Cloudflare Pages keeps previous deployments. In the Pages dashboard, open project `fortheummah`, select the previously serving deployment, and use the deployment rollback action (or redeploy its exact prior artifact). Verify the canonical hostname and core paths after rollback. Keep the previous deployment available until the candidate passes production checks. Do not delete deployments or alter project/domain configuration as part of rollback.

## Release status

- Technical: owner-directed wording and enquiry changes passed the catalogue and message checks, plus local desktop/mobile interaction checks. Production routes, content, response headers, assets and custom 404 were verified after deployment.
- Content/artwork: 27 designs approved in principle; Arabic/religious artwork review remains required before manufacture.
- Commercial: prices and customer terms approved for display. Enquiries may be collected; order acceptance remains gated by supplier/sample confirmation, production lead time, and bank-transfer details.
- Deployment: production deployment completed to the existing `main` production branch from `site/`. The prior deployment remains available for rollback. No GitHub push or public preview was made; these workspace changes remain uncommitted.
