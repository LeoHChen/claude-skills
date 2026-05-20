# Render Markdown documents to themed PDFs via pandoc + headless Chromium.
#
# Usage:
#   make sync DOC=<name>                 # bake DOC.md into index.html
#   make sync DOC=<name> THEME=<theme>   # bake with explicit theme
#   make pdf DOC=<name>                  # default theme (terracotta)
#   make pdf DOC=<name> THEME=<theme>    # explicit theme
#   make themes                          # list available themes
#   make clean-html                      # remove generated index.html
#   make clean-pdf                       # remove generated *.pdf files

PANDOC      ?= pandoc
THEMES_DIR  ?= themes
THEME       ?= terracotta
PDF_STYLE   ?= $(THEMES_DIR)/$(THEME).css
HTML_OUT    ?= index.html
# PDF_BROWSER  override: full path to Brave/Chrome/Chromium binary

.PHONY: sync pdf themes clean-html clean-pdf

sync:
	@if [ -z "$(DOC)" ]; then echo "Usage: make sync DOC=<name> [THEME=<theme>]"; exit 1; fi
	@if [ ! -f "$(DOC).md" ]; then echo "File '$(DOC).md' not found."; exit 1; fi
	@if [ ! -f "$(PDF_STYLE)" ]; then \
	  echo "Theme '$(PDF_STYLE)' not found. Available themes:"; \
	  ls $(THEMES_DIR)/*.css 2>/dev/null | xargs -n1 basename | sed 's/\.css$$//' | sed 's/^/  /'; \
	  exit 1; \
	fi
	@command -v $(PANDOC) >/dev/null 2>&1 || { echo "pandoc not installed (brew install pandoc)"; exit 1; }
	@$(PANDOC) "$(DOC).md" --standalone --css "$(PDF_STYLE)" --embed-resources -o "$(HTML_OUT)"
	@echo "→ $(HTML_OUT)  [source: $(DOC).md, theme: $(THEME)]"

pdf:
	@if [ -z "$(DOC)" ]; then echo "Usage: make pdf DOC=<name> [THEME=<theme>]"; exit 1; fi
	@if [ ! -f "$(DOC).md" ]; then echo "File '$(DOC).md' not found."; exit 1; fi
	@if [ ! -f "$(PDF_STYLE)" ]; then \
	  echo "Theme '$(PDF_STYLE)' not found. Available themes:"; \
	  ls $(THEMES_DIR)/*.css 2>/dev/null | xargs -n1 basename | sed 's/\.css$$//' | sed 's/^/  /'; \
	  exit 1; \
	fi
	@command -v $(PANDOC) >/dev/null 2>&1 || { echo "pandoc not installed (brew install pandoc)"; exit 1; }
	@BROWSER="$(PDF_BROWSER)"; \
	if [ -z "$$BROWSER" ] || [ ! -x "$$BROWSER" ]; then \
	  for b in \
	    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
	    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
	    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
	    "$$(command -v google-chrome 2>/dev/null)" \
	    "$$(command -v chromium 2>/dev/null)" \
	    "$$(command -v chrome 2>/dev/null)"; \
	  do [ -n "$$b" ] && [ -x "$$b" ] && BROWSER="$$b" && break; done; \
	fi; \
	if [ -z "$$BROWSER" ] || [ ! -x "$$BROWSER" ]; then \
	  echo "No Brave/Chrome/Chromium found. Set PDF_BROWSER=/path/to/browser to override."; exit 1; \
	fi; \
	TMP=$$(mktemp -t doc-pdf.XXXXXX).html; \
	$(PANDOC) "$(DOC).md" --standalone --css "$(PDF_STYLE)" --embed-resources -o "$$TMP" || { rm -f "$$TMP"; exit 1; }; \
	"$$BROWSER" --headless --disable-gpu --no-pdf-header-footer \
	  --print-to-pdf="$(DOC).pdf" --print-to-pdf-no-header \
	  --virtual-time-budget=4000 "$$TMP" 2>&1 | grep -E "written|error" || true; \
	rm -f "$$TMP"; \
	echo "→ $(DOC).pdf  [theme: $(THEME)]"

themes:
	@echo "Available themes:"
	@ls $(THEMES_DIR)/*.css 2>/dev/null | xargs -n1 basename | sed 's/\.css$$//' | sed 's/^/  /'

clean-html:
	@rm -f "$(HTML_OUT)"

clean-pdf:
	@find . -maxdepth 1 -name "*.pdf" -print -delete
