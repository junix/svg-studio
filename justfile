set shell := ["bash", "-euo", "pipefail", "-c"]

default: build

# Install deps on demand and build the bundle.
build:
    #!/usr/bin/env bash
    [[ -d node_modules ]] || npm ci --no-fund --no-audit
    npm run build

# Type-check, then re-render all captures.
test: build
    npm test

# Browser demo repo — no binary, no launcher (ADR-749: nothing to install).
install:
    @echo "svg-studio: browser demos, nothing to install"

# Regenerate gallery.html from catalog.json.
gallery:
    python3 scripts/gen-gallery.py

# Verify gallery.html matches catalog.json (exit 1 on drift).
gallery-check:
    python3 scripts/gen-gallery.py --check
