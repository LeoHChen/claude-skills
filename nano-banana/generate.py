#!/usr/bin/env python3
"""Generate images with Google's Gemini image models ("Nano Banana" family).

Stdlib only — no `requests`, no `google-genai` dependency.

Usage:
    GEMINI_API_KEY=... ./generate.py \
        --prompt "a photo of …" \
        --out path/to/image.png

    # image edit / image-to-image (pass one or more reference images)
    GEMINI_API_KEY=... ./generate.py \
        --prompt "make it night-time" \
        --input scene.png \
        --out scene-night.png

    # higher-tier model (Nano Banana Pro)
    GEMINI_API_KEY=... ./generate.py --prompt "…" --out … --model gemini-2.5-pro-image

Reads API key from $GEMINI_API_KEY (preferred) or $GOOGLE_API_KEY.
"""

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_HOST = "https://generativelanguage.googleapis.com"
DEFAULT_MODEL = "gemini-3.1-flash-image-preview"


def load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        sys.exit(
            "ERROR: set GEMINI_API_KEY (or GOOGLE_API_KEY). "
            "Get a key at https://aistudio.google.com/apikey"
        )
    return key


def build_parts(prompt: str, inputs: list[Path]) -> list[dict]:
    parts: list[dict] = [{"text": prompt}]
    for path in inputs:
        if not path.exists():
            sys.exit(f"ERROR: input file not found: {path}")
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        parts.append({"inline_data": {"mime_type": mime, "data": data}})
    return parts


def call_api(model: str, parts: list[dict], api_key: str) -> dict:
    url = f"{API_HOST}/v1beta/models/{model}:generateContent"
    body = json.dumps(
        {
            "contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"]},
        }
    ).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"ERROR: API returned HTTP {e.code}\n{detail}")
    except urllib.error.URLError as e:
        sys.exit(f"ERROR: network failure: {e}")


def extract_image_bytes(response: dict) -> tuple[bytes, str]:
    candidates = response.get("candidates") or []
    if not candidates:
        sys.exit(f"ERROR: no candidates returned\n{json.dumps(response, indent=2)}")
    parts = candidates[0].get("content", {}).get("parts") or []
    for part in parts:
        inline = part.get("inline_data") or part.get("inlineData")
        if inline and inline.get("data"):
            mime = inline.get("mime_type") or inline.get("mimeType") or "image/png"
            return base64.b64decode(inline["data"]), mime
    sys.exit(
        "ERROR: response had no inline_data image part.\n"
        + json.dumps(response, indent=2)[:2000]
    )


def main() -> None:
    p = argparse.ArgumentParser(
        description="Generate images via Gemini Nano Banana / Nano Banana Pro."
    )
    p.add_argument("--prompt", required=True, help="Text prompt for the image.")
    p.add_argument("--out", required=True, help="Output PNG path.")
    p.add_argument(
        "--model",
        default=os.environ.get("NANO_BANANA_MODEL", DEFAULT_MODEL),
        help=f"Model ID (default: {DEFAULT_MODEL}; override via $NANO_BANANA_MODEL).",
    )
    p.add_argument(
        "--input",
        action="append",
        default=[],
        type=Path,
        help="Reference image path (repeat for multiple inputs).",
    )
    args = p.parse_args()

    api_key = load_api_key()
    parts = build_parts(args.prompt, args.input)
    response = call_api(args.model, parts, api_key)
    image_bytes, mime = extract_image_bytes(response)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(image_bytes)
    print(f"wrote {out_path}  ({len(image_bytes):,} bytes, {mime})")


if __name__ == "__main__":
    main()
