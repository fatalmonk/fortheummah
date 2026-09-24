"""Generate indexable detail pages, static catalogue, and sitemap from products.json."""
from html import escape
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
products = json.loads((SITE / "products.json").read_text())
manifest = {item["id"]: item for item in json.loads((ROOT / "mockups" / "manifest.json").read_text())}

catalogue_cards = []
for product in products:
    pid, title, category = map(escape, (product["id"], product["title"], product["category"]))
    thumb = escape(product["image"]["thumbnail"])
    catalogue_cards.append(
        f'<article class="card"><a href="/product/{pid}/"><img src="{thumb}" width="720" height="360" alt="{title} puzzle design concept"><span class="static-label">{category}</span><h2>{title}</h2><span class="static-label">ID: {pid}</span></a></article>'
    )

(SITE / "catalogue.html").write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>Design catalogue | For the Ummah</title><meta name="description" content="All 27 For the Ummah Islamic puzzle design concepts, with stable IDs and enquiry links."><link rel="canonical" href="https://fortheummah.pages.dev/catalogue.html"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"></head><body><a class="skip-link" href="#catalogue">Skip to catalogue</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#ordering">How to enquire</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></nav></header><main id="catalogue"><p class="eyebrow">{len(products)} DESIGN CONCEPTS · BANGLADESH</p><h1 class="catalogue-title">The collection</h1><div class="concept-note"><strong>Concept previews:</strong> AI-generated design mockups, not product photographs. Artwork and proposed specifications need review.</div><div class="static-grid">{"".join(catalogue_cards)}</div></main><footer><p>WhatsApp: <a href="https://wa.me/8801731944544">01731944544</a></p><p class="fine">No stock, specification, or artwork review has been confirmed.</p></footer></body></html>''')

for product in products:
    pid, title, category = map(escape, (product["id"], product["title"], product["category"]))
    full = escape(product["image"]["full"])
    message = quote(
        f"Assalamu alaikum! I would like to enquire about For the Ummah design {product['id']} — {product['title']}. "
        "Please confirm final artwork, specification, exact price, availability, delivery charge and timing. "
        "I understand this is an enquiry, not a confirmed order."
    )
    extra = ""
    if product["id"] == "C05":
        extra = '<p class="content-note">This concept shows an opening excerpt of Dua Qunoot, not the full supplication.</p>'
    elif product["id"] == "A03":
        extra = '<p class="content-note">This architectural concept depicts the Qibli prayer hall at Al-Aqsa; the Dome of the Rock is a separate design.</p>'
    elif product["id"] == "A06":
        extra = '<p class="content-note">This is a separate design featuring the Dome of the Rock; Al-Aqsa — Qibli Mosque is a distinct product concept.</p>'
    elif product["category"] == "Eid 2026":
        extra = '<p class="content-note">This concept retains its explicit Eid 2026 theme. Confirm its seasonal relevance before presenting it as a current collection; the original artwork year has not been changed.</p>'
    original_title = title
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} ({pid}) concept | For the Ummah</title><meta name="description" content="Explore the {title} ({pid}) Islamic puzzle design concept. Artwork, specifications, availability and final price require confirmation."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://fortheummah.pages.dev/product/{pid}/"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="product"><meta property="og:site_name" content="For the Ummah"><meta property="og:title" content="{title} ({pid}) concept | For the Ummah"><meta property="og:description" content="A design concept preview. Confirm artwork, specifications, price and availability before ordering."><meta property="og:url" content="https://fortheummah.pages.dev/product/{pid}/"><meta property="og:image" content="https://fortheummah.pages.dev{full}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/style.css"></head><body><a class="skip-link" href="#main">Skip to product details</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#collection">Collection</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp enquiry ↗</a></nav></header><main id="main" class="product-page"><p class="eyebrow"><a href="/">THE COLLECTION</a> / {category} / {pid}</p><h1>{title}</h1><p class="product-subtitle">Design concept · Bangladesh</p><figure class="product-art"><a href="{full}" target="_blank" rel="noopener noreferrer" aria-label="Open full-resolution concept sheet in a new tab"><img src="{full}" width="1774" height="887" alt="{original_title} three-panel concept sheet: puzzle artwork, proposed packaging contents, and framed room display" fetchpriority="high"></a><figcaption>Open full-resolution concept sheet ↗</figcaption></figure><div class="concept-note"><strong>Preview only:</strong> this AI-generated mockup is not a photograph of manufactured stock. The framed display is for inspiration and a frame is not confirmed as included. Artwork and specifications need professional production review. “1,000 pieces” and “14+” labels, where shown, are proposed and unverified.</div>{extra}<section class="product-enquire"><p class="price-note">Indicative range: ৳3,000–৳4,000 per puzzle. Exact price, availability, delivery charge, timing and payment arrangements must be confirmed.</p><a class="button" href="/?product={pid}#collection" target="_blank" rel="noopener noreferrer">Start an enquiry for {pid} ↗</a><p class="fine">This opens the selected-design enquiry form. It does not place or confirm an order.</p></section><p><a href="/">← Back to all designs</a></p></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p><p class="fine">Religious text, Arabic lettering, diacritics and architecture have not received professional review.</p></footer></body></html>'''
    target = SITE / "product" / product["id"] / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)

urls = ["https://fortheummah.pages.dev/", "https://fortheummah.pages.dev/catalogue.html"]
urls += [f"https://fortheummah.pages.dev/product/{item['id']}/" for item in products]
(SITE / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(f"<url><loc>{escape(url)}</loc></url>" for url in urls)
    + "</urlset>\n"
)
print(f"Generated static catalogue, {len(products)} detail pages, and sitemap with {len(urls)} URLs.")
