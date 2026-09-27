# Task 0 browser baseline

Captured from `http://127.0.0.1:8765` on 2026-09-27 with Playwright driving the installed Google Chrome executable (no dependency installation).

## Contents

- `results.json` — machine-readable route, viewport, interaction, fallback-mode, metadata-contract, and console-error results.
- `screenshots/` — full-page PNG references for 8 required routes at 1440, 1024, 768, and 390 px, plus reduced-motion, JavaScript-disabled, and failed-catalogue-request states.
- `capture-baseline.cjs` — reproducible capture/interaction script. Run from repository root with:

  ```sh
  NODE_PATH=/Users/mac.alvi/node_modules node design-baseline/capture-baseline.cjs
  ```

The script does not submit a valid enquiry and does not open/send WhatsApp. It tests invalid form submission only and confirms that no WhatsApp URL is prepared.
