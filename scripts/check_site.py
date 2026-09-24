#!/usr/bin/env python3
"""Dependency-free integrity checks for the For the Ummah static site."""
import json
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
products = json.loads((SITE / "products.json").read_text())
ids = [product["id"] for product in products]
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

check(len(products) == 27, f"expected 27 products, got {len(products)}")
check(len(ids) == len(set(ids)), "product IDs are not unique")
check({category: sum(p["category"] == category for p in products) for category in {p["category"] for p in products}} == {
    "Eid 2026": 5, "Sacred Architecture": 8, "Calligraphy": 8, "Qur’an Reflection": 6
}, "unexpected product category counts")
check((SITE / "index.html").is_file(), "missing site index")
check((SITE / "404.html").is_file(), "missing 404 page")
check((SITE / "_headers").is_file(), "missing Pages headers")
check("default-src 'self'" in (SITE / "_headers").read_text(), "invalid or missing Content Security Policy")
check((SITE / "robots.txt").is_file(), "missing robots.txt")
check((SITE / "sitemap.xml").is_file(), "missing sitemap.xml")
check(not (SITE / "mockups").exists() and not (SITE / "design-boards").exists(), "internal sources copied into deployment root")

for product in products:
    product_id = product["id"]
    original = ROOT / "mockups" / f"{product_id}.png"
    check(original.is_file(), f"missing preserved source artwork {product_id}.png")
    check((SITE / product["image"]["thumbnail"].lstrip("/")).is_file(), f"missing thumbnail {product_id}")
    check((SITE / product["image"]["full"].lstrip("/")).is_file(), f"missing full WebP {product_id}")
    check(not (SITE / f"{product_id}.png").exists(), f"source artwork is in deployment output: {product_id}.png")
    detail = SITE / "product" / product_id / "index.html"
    check(detail.is_file(), f"missing detail route {product_id}")
    if detail.is_file():
        html = detail.read_text()
        check(f"/product/{product_id}/" in html, f"bad canonical URL for {product_id}")
        check(f"/?product={product_id}#collection" in html, f"detail enquiry does not preselect {product_id}")
        check(f"/assets/full/{product_id}.webp" in html, f"missing full-resolution preview for {product_id}")
        check("8801731944544" in html, f"missing WhatsApp destination for {product_id}")

for file in [SITE / "index.html", SITE / "order-message.js", *[SITE / "product" / i / "index.html" for i in ids]]:
    text = file.read_text()
    check("8801731944544" in text, f"missing international WhatsApp number in {file.relative_to(ROOT)}")
    check(not re.search(r"wa\.me/(?!8801731944544)", text), f"unexpected WhatsApp number in {file.relative_to(ROOT)}")

check((ROOT / "mockups" / "manifest.json").is_file(), "original mockup manifest missing")
manifest = json.loads((ROOT / "mockups" / "manifest.json").read_text())
check([(x["id"], x["title"], x["category"]) for x in products] ==
      [(x["id"], x["title"], x["category"]) for x in manifest], "catalog differs from original manifest")
check("opening excerpt" in (SITE / "product" / "C05" / "index.html").read_text(), "Dua Qunoot excerpt disclosure missing")
check("Qibli prayer hall" in (SITE / "product" / "A03" / "index.html").read_text(), "Al-Aqsa distinction missing")
check("Dome of the Rock" in (SITE / "product" / "A06" / "index.html").read_text(), "Dome of the Rock distinction missing")
check("Eid 2026" in (SITE / "product" / "E01" / "index.html").read_text(), "Eid year disclosure missing")
check("seasonal relevance" in (SITE / "product" / "E01" / "index.html").read_text(), "Eid seasonal relevance disclosure missing")

try:
    sitemap = ET.parse(SITE / "sitemap.xml").getroot()
    check(len(sitemap) == len(products) + 2, "sitemap URL count does not match the catalogue")
except ET.ParseError as error:
    check(False, f"invalid sitemap XML: {error}")
check((SITE / "robots.txt").read_text().startswith("User-agent: *\nAllow: /\n"), "robots.txt is malformed")
check((SITE / "catalogue.html").read_text().count('<article class="card">') == len(products), "static catalogue does not render every product")

if errors:
    print("FAILED")
    print("\n".join(f"- {error}" for error in errors))
    sys.exit(1)
check(not list(SITE.glob("*.png")), "original PNG artwork remains in deployment output")
print(f"PASS: {len(products)} stable product records, 27 details, 81 image files, preserved private source art, contact URLs, disclosures, sitemap and Pages configuration")
