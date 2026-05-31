# Deck content
# YAML stream — each slide is one document, separated by `---`.
# Edit any field, then run `node sync.js` (or `make sync DECK=<deck-name>` from the project root).
# Slide types: title, cards, flow, architecture, roadmap, proscons, questions.

---
type: title
slide_label: Subtitle · v0.1
title: TITLE
subtitle: One-line tagline.
vision: >-
  The vision statement — one to two sentences setting the frame for the rest of the deck.
pillars:
  - num: "01"
    title: First pillar
    desc: One-sentence supporting claim.
  - num: "02"
    title: Second pillar
    desc: One-sentence supporting claim.
  - num: "03"
    title: Third pillar
    desc: One-sentence supporting claim.
footer: Author · Date

---
type: cards
slide_label: 01 / Section
title: Section heading.
subtitle: One-sentence framing for the cards below.
columns: 3        # 2 or 3
# dense: true     # uncomment for tighter padding (e.g., 6 cards)
cards:
  - num: "01"
    title: Card 1 title
    role: Card subtitle / role
    body: One- or two-sentence body.
  - num: "02"
    title: Card 2 title
    role: Card subtitle / role
    body: One- or two-sentence body.
  - num: "03"
    title: Card 3 title
    role: Card subtitle / role
    body: One- or two-sentence body.
# footer: Optional supporting note
# footer_emphasis: true   # render footer as accented callout

---
type: flow
slide_label: 02 / Process
title: Pipeline / flow heading.
subtitle: One-sentence framing.
nodes:
  - letter: A
    name: Stage A
    desc: One-sentence description.
    tag: Optional Tag
  - letter: B
    name: Stage B
    desc: One-sentence description.
    tag: Optional Tag
  - letter: C
    name: Stage C
    desc: One-sentence description.
footer: Optional footer note explaining how the stages connect.

---
type: architecture
slide_label: 03 / Comparison
title: Two-card comparison heading.
subtitle: One-sentence framing.
cards:
  - tag: Side A · Tag
    accent: primary
    title: First card title.
    function_label: Function
    function_text: One- or two-sentence description.
    challenge_label: Challenge / Counterpoint Label
    challenge_text: One- or two-sentence highlighted callout.
  - tag: Side B · Tag
    accent: accent
    title: Second card title.
    function_label: Function
    function_text: One- or two-sentence description.
    challenge_label: Challenge / Counterpoint Label
    challenge_text: One- or two-sentence highlighted callout.

---
type: roadmap
slide_label: 04 / Execution
title: Phased roadmap heading.
subtitle: One-sentence framing.
phases:
  - num: "1"
    date: Phase 1 date
    status: in_progress    # remove for non-current phases
    title: Phase 1 title
    objective: What we're trying to do.
    scope: What's in scope for this phase.
    deps_label: Dependencies / Outputs
    deps: Critical dependencies or outputs (highlighted block).
  - num: "2"
    date: Phase 2 date
    title: Phase 2 title
    objective: What we're trying to do.
    scope: What's in scope for this phase.
    deps_label: Dependencies / Outputs
    deps: Critical dependencies or outputs.
  - num: "3"
    date: Phase 3 date
    title: Phase 3 title
    objective: What we're trying to do.
    scope: What's in scope for this phase.
    deps_label: Dependencies / Outputs
    deps: Critical dependencies or outputs.
primary_objective:
  label: Primary Objective
  text: Main objective text.
  highlight: "Headline metric or target."
phase1_metrics: >-
  Optional small italic footer line — e.g., success metrics for Phase 1.

---
type: proscons
slide_label: 05 / Trade-offs
title: Build the renderer in-house?
subtitle: Weighing a custom system against off-the-shelf slide tools.
pros:
  - Full control over themes, motion, and layout.
  - Single source of truth in content.md.
  - Clean, native 16:9 PDF export.
  - No per-seat licensing costs.
cons:
  - Upfront engineering investment.
  - We own ongoing maintenance.
  - No third-party template ecosystem.
footer: Recommendation — build it; control and PDF fidelity outweigh the upkeep.
