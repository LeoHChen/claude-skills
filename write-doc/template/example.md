# Document Title

> **Status:** v0.1 · YYYY-MM-DD
> **Purpose:** One-line statement of what this doc is for.

---

## 1. Section Heading

Lead paragraph stating the thesis. One or two sentences. Direct.

Supporting paragraph that elaborates with detail, data, or reasoning.

### Subsection

Subsection content with **emphasis** where it matters.

- Bullet item one.
- Bullet item two.
- Bullet item three.

---

## 2. Tables Look Like This

| Column | Description | Status |
| --- | --- | --- |
| Alpha | First column body | ✅ |
| Beta | Second column body | 🟡 |
| Gamma | Third column body | ❌ |

---

## 3. Code and Diagrams

Inline `code` reads like this. Code blocks render in a dark themed
background regardless of theme:

```
COLLECT  →  PARSE  →  VALIDATE  →  SCORE  →  VIEW
```

ASCII flow diagrams keep their alignment in monospace.

---

## 4. Open Questions

If your doc has open design questions, structure them like this:

### 4.1 First question
**Question.** What's the actual decision being weighed?
**Why it matters.** One-sentence stake.
**Options.** Brief enumeration.
**Lean.** Where the team is leaning, if anywhere.

### 4.2 Second question
*(same shape)*

---

*This doc syncs to HTML via `make sync DOC=example` and renders to PDF via `make pdf DOC=example`. Pick a theme with*
*`THEME=carbon` (or `berry`, `lab`, `terracotta`).*
