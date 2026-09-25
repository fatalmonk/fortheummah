"""Generate indexable detail pages, static catalogue, and sitemap from products.json."""
from html import escape
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
products = json.loads((SITE / "products.json").read_text())

catalogue_cards = []
for product in products:
    pid, title, category = map(escape, (product["id"], product["title"], product["category"]))
    thumb = escape(product["image"]["thumbnail"])
    catalogue_cards.append(
        f'<article class="card"><a href="/product/{pid}/"><img src="{thumb}" width="720" height="360" alt="{title} three-panel puzzle design sheet"><span class="static-label">{category}</span><h2>{title}</h2><span class="static-label">ID: {pid}</span><span class="static-label">500 pieces ৳3,000 · 1,000 pieces ৳4,000</span></a></article>'
    )

(SITE / "catalogue.html").write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>Design catalogue | For the Ummah</title><meta name="description" content="Browse 27 For the Ummah Islamic puzzle designs. Enquiries only; orders are not yet being accepted."><link rel="canonical" href="https://fortheummah.pages.dev/catalogue.html"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"></head><body><a class="skip-link" href="#catalogue">Skip to catalogue</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#ordering">How to enquire</a><a href="/policies.html">Policies</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></nav></header><main id="catalogue"><p class="eyebrow">{len(products)} DESIGNS · BANGLADESH</p><h1>Full design catalogue</h1><p class="intro">Browse all 27 designs across Sacred Architecture, Calligraphy, Qur’an Reflection and Eid 2027 / 1448 AH. Enquiries are welcome; orders are not yet being accepted while production readiness is confirmed.</p><p class="concept-note">500 pieces: ৳3,000 · 1,000 pieces: ৳4,000 · Optional wooden frame kit: +৳3,000. Delivery is charged separately. Supplier specifications, physical sample, and production lead time remain pending. Age guidance is 14+ (final supplier/sample specifications remain pending). Frames shown in design sheets are style references and are not included.</p><section class="grid">{''.join(catalogue_cards)}</section></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p><a href="/policies.html">Delivery &amp; customer policies</a><br><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p></footer></body></html>\n''')

urls = ["https://fortheummah.pages.dev/", "https://fortheummah.pages.dev/catalogue.html"]

policy_page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Delivery &amp; customer policies | For the Ummah</title><meta name="description" content="Delivery, payment, cancellation, refund and product-issue information for For the Ummah puzzle enquiries."><meta name="robots" content="index,follow"><link rel="canonical" href="https://fortheummah.pages.dev/policies.html"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"></head><body><a class="skip-link" href="#main">Skip to policies</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/catalogue.html">Catalogue</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></nav></header><main id="main" class="product-page"><p class="eyebrow">CUSTOMER INFORMATION · BANGLADESH</p><h1>Delivery &amp; customer policies</h1><p class="concept-note">Enquiries are open, but orders are not yet being accepted. Supplier specifications, a physical sample, production/preparation time, and bank-transfer details remain pending. The terms below apply once order acceptance begins and are subject to confirmation in your explicit WhatsApp order-confirmation message.</p><h2>Prices and products</h2><p>500-piece puzzle: ৳3,000. 1,000-piece puzzle: ৳4,000. Optional wooden frame kit: ৳3,000 extra; a frame is not included with the puzzle. Delivery is charged separately. Product availability and production time must be confirmed before an order is accepted.</p><p>Final puzzle dimensions, piece count, material, finish, packaging and manufacturing feasibility are subject to supplier confirmation and physical sample approval. Age guidance is 14+; final labeling will be confirmed with supplier/sample approval.</p><h2>Delivery</h2><p>Delivery is available nationwide in Bangladesh. Delivery charges: ৳80 in Chattogram and ৳120 elsewhere in Bangladesh. Estimated courier transit after the order is ready for dispatch: 1–2 business days in Chattogram and 2–4 business days elsewhere. Production/preparation lead time is not yet confirmed. We will confirm product availability, production time, delivery charge and estimated transit before accepting an order. Exceptions are discussed on WhatsApp.</p><h2>Payment and order confirmation</h2><p>Payment methods are bKash and bank transfer. A 50% deposit reserves an order only after payment is received and verified; the remaining 50% is due before delivery. Send the transaction ID or payment screenshot through WhatsApp for verification. Payment account details are shared privately after order confirmation and are not published here.</p><p>An enquiry is not an order. An order is confirmed only when For the Ummah sends an explicit order-confirmation message through WhatsApp. Do not make a payment until the order details and private payment instructions have been confirmed directly by For the Ummah.</p><h2>Cancellation and delivery inspection</h2><p>You may cancel before production/preparation begins and receive a full refund of the deposit. Once production/preparation has begun, this cancellation right no longer applies. You may inspect the product in front of the courier at delivery. If you reject it after inspection, the order may be cancelled at delivery; the deposit is refunded minus applicable delivery and return-courier charges.</p><h2>Returns, defects, damage and missing pieces</h2><p>There are no change-of-mind returns or exchanges after you inspect and accept the product from the courier. Report damage, manufacturing defects or missing pieces within 3 days of delivery.</p><ul><li>For a genuine manufacturing defect or qualifying damage that could not reasonably be identified during courier inspection, choose a free replacement or a full refund.</li><li>If a puzzle is confirmed to have missing pieces, we will provide a free replacement puzzle.</li></ul><p>Approved refunds are processed within 7 business days, using the original payment method where possible.</p><h2>Contact</h2><p>For enquiries and support, contact us on <a href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp at 01731944544</a>.</p><p><a href="/">← Back to the catalogue</a></p></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p>Bangladesh · Prices in BDT<br><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p><p class="fine">Orders are not yet being accepted. This page will be reviewed again before commercial launch.</p></footer></body></html>\n'''
(SITE / "policies.html").write_text(policy_page)
urls.append("https://fortheummah.pages.dev/policies.html")

for product in products:
    pid = product["id"]
    raw_title = product["title"]
    raw_cat = product["category"]
    title = escape(raw_title)
    category = escape(raw_cat)
    full = escape(product["image"]["full"])
    urls.append(f"https://fortheummah.pages.dev/product/{pid}/")
    
    extra = ""
    if pid == "C05":
        extra = '<p class="content-note">This design shows an opening excerpt of Dua Qunoot, not the full supplication.</p>'
    elif pid == "A03":
        extra = '<p class="content-note">This design depicts the Qibli prayer hall at Al-Aqsa; the Dome of the Rock is a separate design.</p>'
    elif pid == "A06":
        extra = '<p class="content-note">This design features the Dome of the Rock; Al-Aqsa — Qibli Mosque is a separate design.</p>'
    elif raw_cat == "Eid 2027 / 1448 AH":
        extra = '<p class="content-note">The collection is labelled Eid 2027 / 1448 AH. Original artwork files were preserved unchanged; check any year shown in the artwork before selection.</p>'

    ld_json = json.dumps({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": f"{raw_title} ({pid}) — Islamic Jigsaw Puzzle",
        "image": [
            f"https://fortheummah.pages.dev{full}"
        ],
        "description": f"{raw_title} ({pid}) For the Ummah puzzle design. Enquiries only; orders are not yet being accepted while supplier specifications, sample approval, and production lead time are confirmed.",
        "sku": pid,
        "brand": {
            "@type": "Brand",
            "name": "For the Ummah"
        },
        "category": raw_cat,
        "additionalProperty": [
            {"@type": "PropertyValue", "name": "500-piece price", "value": "BDT 3000"},
            {"@type": "PropertyValue", "name": "1000-piece price", "value": "BDT 4000"},
            {"@type": "PropertyValue", "name": "Ordering status", "value": "Enquiries only; orders are not yet being accepted"}
        ]
    }, indent=2, ensure_ascii=False)

    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} ({pid}) — Islamic Puzzle Design | For the Ummah</title><meta name="description" content="Browse the {title} ({pid}) design. 500 pieces ৳3,000; 1,000 pieces ৳4,000. Enquiries only; orders are not yet being accepted."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://fortheummah.pages.dev/product/{pid}/"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="product"><meta property="og:site_name" content="For the Ummah"><meta property="og:title" content="{title} ({pid}) — Islamic Puzzle Design | For the Ummah"><meta property="og:description" content="500 pieces ৳3,000; 1,000 pieces ৳4,000. Enquire via WhatsApp; orders are not yet being accepted."><meta property="og:url" content="https://fortheummah.pages.dev/product/{pid}/"><meta property="og:image" content="https://fortheummah.pages.dev{full}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/style.css"><script type="application/ld+json">
{ld_json}
</script>
</head><body><a class="skip-link" href="#main">Skip to product details</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#collection">Collection</a><a href="/policies.html">Policies</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp enquiry ↗</a></nav></header><main id="main" class="product-page"><p class="eyebrow"><a href="/">THE COLLECTION</a> / {category} / {pid}</p><h1>{title}</h1><p class="product-subtitle">Puzzle design · Bangladesh · Enquiries only; orders are not yet being accepted.</p><figure class="product-art"><a href="{full}" target="_blank" rel="noopener noreferrer" aria-label="Open full-resolution design sheet in a new tab"><img src="{full}" width="1774" height="887" alt="{title} three-panel design sheet with puzzle image, proposed packaging, and a frame style reference" fetchpriority="high"></a><figcaption>Open full-resolution design sheet ↗</figcaption></figure><p class="content-note">Age guidance is 14+; final labeling will be confirmed with supplier/sample approval. The frame shown is a style reference and is not included.</p>{extra}<section class="product-enquire"><p class="price-note">Proposed specifications (supplier/sample confirmation pending):<br>500-piece: ৳3,000 (52 × 38 cm landscape / 38 × 52 cm portrait)<br>1,000-piece: ৳4,000 (70 × 50 cm landscape / 50 × 70 cm portrait)<br>Cardboard, glossy finish, printed puzzle box · age suitability 14+<br>Optional wooden frame kit: +৳3,000 · delivery charged separately</p><p class="fine">Supplier specification, physical sample and production lead time remain pending. Designs with Arabic or religious material require qualified review before manufacture.</p><a class="button" href="/?product={pid}#collection" target="_blank" rel="noopener noreferrer">Enquire about {pid} ↗</a><p class="fine">This opens the selected-design enquiry form. It does not place or confirm an order.</p></section><p><a href="/">← Back to all designs</a></p></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p><a href="/policies.html">Delivery &amp; customer policies</a><br><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p><p class="fine">Supplier/sample approval is pending. Arabic lettering, religious text and references require qualified review before manufacture.</p></footer></body></html>\n'''

    out_dir = SITE / "product" / pid
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html)

sitemap_urls_xml = []
for url in urls:
    sitemap_urls_xml.append(
        "  <url>\n"
        f"    <loc>{escape(url)}</loc>\n"
        "      <lastmod>2026-09-25T01:36:55+00:00</lastmod>\n"
        "  </url>"
    )

sitemap_content = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(sitemap_urls_xml)
    + "\n</urlset>\n"
)
(SITE / "sitemap.xml").write_text(sitemap_content)

print(f"Generated static catalogue, {len(products)} detail pages, and sitemap with {len(urls)} URLs.")
