# nano-banana

Small Claude / Claude Code skill that wraps Google's Gemini image-generation models — the "Nano Banana" family. Generates images, runs image-to-image edits, and composes multi-reference scenes from a one-line CLI.

## Setup

1. Get a Gemini API key at https://aistudio.google.com/apikey.
2. Export it: `export GEMINI_API_KEY=…` (add to `~/.zshrc` or `~/.bashrc`).
3. The skill is installed automatically via a symlink in `~/.claude/skills/nano-banana` → this folder. No package install needed (stdlib only).

## CLI usage

```bash
# Text-to-image
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "editorial photo of a clinic check-in counter, warm daylight" \
  --out clinic.png

# Image edit (pass a reference image)
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "remove the patient, keep the counter and device" \
  --input clinic.png \
  --out clinic-empty.png

# Multi-reference (compose subjects from several inputs)
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "put the device from device.png onto the desk in office.png" \
  --input device.png \
  --input office.png \
  --out composite.png

# Nano Banana Pro tier
python3 ~/.claude/skills/nano-banana/generate.py \
  --prompt "…" --out … --model nano-banana-pro-preview
```

## Files

- `generate.py` — CLI wrapper around `generativelanguage.googleapis.com`. Stdlib only.
- `SKILL.md` — instructions for Claude / Claude Code on when and how to invoke the skill.

## Notes

- Default model is `gemini-3.1-flash-image-preview` (newest flash-tier image model). Stable fallback is `gemini-2.5-flash-image`. Override with `--model` or `NANO_BANANA_MODEL=…`. Note: only models with `-image` in the name can generate images — `gemini-3.5-flash` is text-only and returns `NO_IMAGE`.
- Output is always PNG. If the API returns a non-image part, the script exits non-zero and prints the response for debugging.
- Image inputs are base64-inlined into the request — keep them reasonably sized (a few MB each is fine).
