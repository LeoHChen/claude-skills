---
name: nano-banana
description: Generate or edit images via Google's Gemini "Nano Banana" family (gemini-2.5-flash-image / Nano Banana Pro). Use when the user asks to generate an image, render a mockup, create deck/blog/doc artwork, do an image edit ("make this brighter / change the background / put it in night-time"), or produce concept renders. Wraps a stdlib-only Python CLI. Requires $GEMINI_API_KEY. Image-to-image works by passing reference PNGs via --input.
---

# nano-banana

Wrapper around Google's Gemini image-generation models — the "Nano Banana" family. Stdlib-only Python; no external deps.

## Prereqs

- `GEMINI_API_KEY` in env. Get one at https://aistudio.google.com/apikey.
- macOS/Linux + Python 3.9+ (uses `pathlib`, f-strings, type-hints).

## How to invoke from Claude

Call the script via Bash. Always pass `--prompt` and `--out`; optionally `--input` (for image edits / image-to-image) and `--model` (for Nano Banana Pro tier).

### Text-to-image

```bash
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "editorial photo of …" \
  --out path/to/output.png
```

### Image edit / image-to-image

```bash
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "make it night-time, warm window light" \
  --input path/to/reference.png \
  --out path/to/output.png
```

Pass `--input` multiple times to give the model several reference images (e.g. "compose subject A into scene B").

### Nano Banana Pro (higher tier)

```bash
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "…" \
  --out … \
  --model nano-banana-pro-preview
```

Or set `NANO_BANANA_MODEL=nano-banana-pro-preview` in env for the session.

## Model catalog (as of 2026-05)

| Model ID | Use for |
|---|---|
| `gemini-3.1-flash-image-preview` | **Default.** Newest flash-tier image model. Successor to 2.5-flash-image. Preview tier so the ID may rename. |
| `gemini-2.5-flash-image` | Stable fallback. Use if 3.1-flash-image-preview rate-limits or returns oddly. |
| `nano-banana-pro-preview` | Pro tier — higher fidelity, slower, costlier. Best for hero / investor-deck images. |
| `gemini-3-pro-image-preview` | Gemini-3 family pro image (preview). Try when `nano-banana-pro-preview` is rate-limited. |
| `imagen-4.0-generate-001`, `imagen-4.0-fast-generate-001`, `imagen-4.0-ultra-generate-001` | Imagen line — **NOT compatible** with this wrapper (different `:predict` endpoint, not `generateContent`). |

**Gotcha:** `gemini-3.5-flash` (and any other model without `-image` in the name) is a text / multimodal-input model. Asking it to generate an image returns `finishReason: NO_IMAGE`. Always pick an `-image` model for generation.

To list what your key can actually call:

```bash
zsh -ic 'curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | python3 -c "import json,sys; [print(m[\"name\"]) for m in json.load(sys.stdin).get(\"models\",[]) if \"image\" in m[\"name\"].lower() or \"banana\" in m[\"name\"].lower()]"'
```

Override per-call with `--model` or globally with `NANO_BANANA_MODEL`.

## Prompt-writing rules (apply by default)

Nano Banana responds best to **photographic, scene-grounded prompts** with explicit lighting, camera, and material details — not single-noun prompts.

Always include:

- **Scene + subject** in one sentence ("a 45-year-old patient checking in at a clinic counter").
- **The hero object/device** if relevant, described concretely (material, size, surface, what's on its display).
- **Lighting** ("soft daylight from camera left", "warm tungsten from a desk lamp").
- **Camera** ("counter-height ¾ angle, shallow depth of field").
- **Mood / register** ("competent, calm, modern — not toy-like, not clinical-stock").
- **What NOT to include** ("no logos, no medical equipment in frame, no synthetic HDR glow").

For consistency across a series (e.g. three slides of the same product in different contexts), put a **shared style sheet** at the top of each prompt and only vary the scene.

## Output

The script writes the PNG to `--out` and prints one line:

```
wrote /full/path.png  (1,234,567 bytes, image/png)
```

If the API returns no image, the script exits non-zero and dumps the response — surface that to the user verbatim.

## Common failure modes

| Failure | Likely cause | Fix |
|---|---|---|
| `HTTP 400 ... API key not valid` | Wrong / missing key | `export GEMINI_API_KEY=…` |
| `HTTP 403 ... not enabled` | Project doesn't have the model enabled | Enable Gemini API in AI Studio for this key |
| `HTTP 429` | Rate limit | Wait and retry; consider lowering parallel calls |
| `response had no inline_data image part` | Model returned only text (often because the prompt sounded like a question) | Rewrite as a noun-phrase scene description, not a question |
| `HTTP 404 ... model not found` | Model ID renamed/retired | Check current ID at ai.google.dev/gemini-api/docs/models |

## Anti-patterns

- Do not retry on a 400 without changing the prompt — it will fail the same way.
- Do not paste an entire chat transcript into the prompt — the model treats every clause as a constraint and collapses.
- Do not call this from inside `~/.claude/skills/nano-banana/` directly — always invoke via the symlink path so the skill stays portable.
