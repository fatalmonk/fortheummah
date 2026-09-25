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
        f'<article class="card"><a href="/product/{pid}/"><img src="{thumb}" width="720" height="360" alt="{title} puzzle design concept"><span class="static-label">{category}</span><h2>{title}</h2><span class="static-label">ID: {pid}</span></a></article>'
    )

(SITE / "catalogue.html").write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>Design catalogue | For the Ummah</title><meta name="description" content="All 27 For the Ummah Islamic puzzle design concepts, with stable IDs and enquiry links."><link rel="canonical" href="https://fortheummah.pages.dev/catalogue.html"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"></head><body><a class="skip-link" href="#catalogue">Skip to catalogue</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#ordering">How to enquire</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></nav></header><main id="catalogue"><p class="eyebrow">{len(products)} DESIGN CONCEPTS · BANGLADESH</p><h1>Full design catalogue</h1><p class="intro">Browse all 27 concepts across Sacred Architecture, Calligraphy, Qur’an Reflection and Eid collections.</p><section class="grid">{''.join(catalogue_cards)}</section></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p></footer></body></html>\n''')

urls = ["https://fortheummah.pages.dev/", "https://fortheummah.pages.dev/catalogue.html"]

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
        extra = '<p class="content-note">This concept shows an opening excerpt of Dua Qunoot, not the full supplication.</p>'
    elif pid == "A03":
        extra = '<p class="content-note">This architectural concept depicts the Qibli prayer hall at Al-Aqsa; the Dome of the Rock is a separate design.</p>'
    elif pid == "A06":
        extra = '<p class="content-note">This is a separate design featuring the Dome of the Rock; Al-Aqsa — Qibli Mosque is a distinct product concept.</p>'
    elif raw_cat == "Eid 2027 / 1448 AH":
        extra = '<p class="content-note">This concept retains its explicit Eid 2027 / 1448 AH theme. Confirm its seasonal relevance before presenting it as a current collection; the original artwork year has not been changed.</p>'

    ld_json = json.dumps({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": f"{raw_title} ({pid}) — Islamic Jigsaw Puzzle",
        "image": [
            f"https://fortheummah.pages.dev{full}"
        ],
        "description": f"{raw_title} ({pid}) Islamic jigsaw puzzle. Available in 500-piece (52x38 cm) and 1,000-piece (70x50 cm) variants with optional wooden frame kit.",
        "sku": pid,
        "brand": {
            "@type": "Brand",
            "name": "For the Ummah"
        },
        "category": raw_cat,
        "offers": [
            {
                "@type": "Offer",
                "name": f"{raw_title} - 500 Piece Puzzle",
                "priceCurrency": "BDT",
                "price": "3000.00",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                "url": f"https://fortheummah.pages.dev/product/{pid}/"
            },
            {
                "@type": "Offer",
                "name": f"{raw_title} - 1000 Piece Puzzle",
                "priceCurrency": "BDT",
                "price": "4000.00",
                "url": f"https://fortheummah.pages.dev/product/{pid}/",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock"
            }
        ]
    }, indent=2, ensure_ascii=False)

    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} ({pid}) — Islamic Jigsaw Puzzle | For the Ummah</title><meta name="description" content="Explore the {title} ({pid}) Islamic jigsaw puzzle in Bangladesh. Available in 500-piece (৳3,000) and 1,000-piece (৳4,000) variants with optional wooden frame kit."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://fortheummah.pages.dev/product/{pid}/"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="product"><meta property="og:site_name" content="For the Ummah"><meta property="og:title" content="{title} ({pid}) — Islamic Jigsaw Puzzle | For the Ummah"><meta property="og:description" content="Explore the {title} ({pid}) Islamic jigsaw puzzle in Bangladesh. 500 & 1000 piece variants available with nationwide delivery."><meta property="og:url" content="https://fortheummah.pages.dev/product/{pid}/"><meta property="og:image" content="https://fortheummah.pages.dev{full}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/style.css"><script type="application/ld+json">
{ld_json}
</script>
</head><body><a class="skip-link" href="#main">Skip to product details</a><header class="site-header"><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#collection">Collection</a><a class="nav-contact" href="https://wa.me/8801731944544" target="_blank" rel="noopener noreferrer">WhatsApp enquiry ↗</a></nav></header><main id="main" class="product-page"><p class="eyebrow"><a href="/">THE COLLECTION</a> / {category} / {pid}</p><h1>{title}</h1><p class="product-subtitle">Islamic Jigsaw Puzzle · Bangladesh</p><figure class="product-art"><a href="{full}" target="_blank" rel="noopener noreferrer" aria-label="Open full-resolution concept sheet in a new tab"><img src="{full}" width="1774" height="887" alt="{title} three-panel concept sheet: puzzle artwork, proposed packaging contents, and framed room display" fetchpriority="high"></a><figcaption>Open full-resolution concept sheet ↗</figcaption></figure>{extra}<section class="product-enquire"><p class="price-note">500-piece: ৳3,000 | 1,000-piece: ৳4,000 | Optional wooden frame kit: +৳3,000</p><a class="button" href="/?product={pid}#collection" target="_blank" rel="noopener noreferrer">Start an enquiry for {pid} ↗</a><p class="fine">This opens the selected-design enquiry form. It does not place or confirm an order.</p></section><p><a href="/">← Back to all designs</a></p></main><footer><a class="brand" href="/">For the Ummah<span>MEANING IN EVERY PIECE</span></a><p><a href="https://wa.me/8801731944544">WhatsApp: 01731944544</a></p><p class="fine">Religious text, Arabic lettering, diacritics and architecture have not received professional review.</p></footer></body></html>\n'''

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
