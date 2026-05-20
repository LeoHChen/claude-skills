# Bake content.md into index.html for file:// previews and handoff.
#
# Usage:
#   make sync

NODE        ?= node
SYNC_SCRIPT ?= sync.js

.PHONY: sync

sync:
	@command -v $(NODE) >/dev/null 2>&1 || { echo "node not installed"; exit 1; }
	@if [ ! -f "$(SYNC_SCRIPT)" ]; then echo "File '$(SYNC_SCRIPT)' not found."; exit 1; fi
	@$(NODE) "$(SYNC_SCRIPT)"
