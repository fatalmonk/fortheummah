#!/usr/bin/env bash
set -euo pipefail

# Orca worktree setup script for fortheummah
# Executed automatically by Orca when creating new worktrees.

WORKTREE_ROOT="${ORCA_WORKTREE_PATH:-$(pwd)}"
echo "==> Setting up fortheummah worktree at: ${WORKTREE_ROOT}"
cd "${WORKTREE_ROOT}"

echo "==> Building public product catalog (site/products.json)..."
python3 scripts/build_products_json.py

echo "==> Generating static pages, fallback catalog, policies & sitemap..."
python3 scripts/generate_pages.py

echo "==> Verifying site integrity..."
python3 scripts/check_site.py
node scripts/check_order_message.js

echo "==> Worktree setup complete!"
