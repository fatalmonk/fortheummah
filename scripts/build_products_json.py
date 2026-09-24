"""Build the public product data from the original mockup manifest."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "mockups" / "manifest.json").read_text())
products = [{
    "id": item["id"],
    "title": item["title"],
    "category": item["category"],
    "image": {
        "thumbnail": f"/assets/thumbs/{item['id']}.webp",
        "full": f"/assets/full/{item['id']}.webp",
    },
} for item in manifest]
(root / "site" / "products.json").write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n")
stale = root / "site" / "products.js"
if stale.exists():
    stale.unlink()
print(f"Wrote {len(products)} public product records with derived image paths.")
