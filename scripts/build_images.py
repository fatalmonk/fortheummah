"""Build public thumbnail/full-size WebP derivatives from preserved mockup PNGs."""
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
PRODUCTS = json.loads((SITE / "products.json").read_text())
CWEBP = shutil.which("cwebp")
if not CWEBP:
    raise SystemExit("cwebp is required to regenerate images; existing WebP assets remain usable.")

for product in PRODUCTS:
    source = ROOT / "mockups" / f"{product['id']}.png"
    if not source.is_file():
        raise SystemExit(f"Missing source artwork: {source}")
    thumbnail = SITE / product["image"]["thumbnail"].lstrip("/")
    full = SITE / product["image"]["full"].lstrip("/")
    thumbnail.parent.mkdir(parents=True, exist_ok=True)
    full.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([CWEBP, "-quiet", "-q", "78", "-resize", "720", "0", str(source), "-o", str(thumbnail)], check=True)
    subprocess.run([CWEBP, "-quiet", "-q", "86", str(source), "-o", str(full)], check=True)
print(f"Built {len(PRODUCTS) * 2} WebP derivatives from unchanged source PNGs.")
