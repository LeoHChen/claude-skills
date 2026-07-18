# Placeholder Deck — template-besharp example
# YAML stream — each slide is one document, separated by `---`.
# Slide types (template-besharp): hero, stats-split, columns, tiers, panels,
#   score, matrix, loop, people, close.
# `hero` and `close` render dark; all others light. Any slide can force dark
#   with `variant: dark`. Use **bold** inside `lead`/`subtitle` for teal emphasis.
# Icons are Font Awesome 6 solid names (fa-house, fa-users, ...).
# This is placeholder content — replace every field with your own. Then run `make sync`.

---
type: hero
icon: fa-bolt
title_parts:
  - text: "Your"
  - text: "Product"
    accent: true
  - text: " Name"
tagline: One-line value proposition — what you do, for whom, and why it matters
meta: "Round Name  ·  Month Year"
team: "Founder, CEO    ·    Founder, CTO    ·    Founder, COO"

---
type: stats-split
kicker: The problem
title: State the problem in a single, memorable sentence.
stats:
  - value: "00%"
    label: Headline statistic that frames the size or urgency of the problem
  - value: 1 in 4
    label: A second proof point — a rate, cost, or trend that makes it concrete
  - value: "~00%"
    label: A third data point reinforcing why this problem persists today
cards:
  - icon: fa-user
    title: Audience one
    body: >-
      Describe the first stakeholder and the pain they feel today. Keep it to
      two or three tight sentences that a reader can absorb at a glance.
  - icon: fa-users
    title: Audience two
    body: >-
      Describe the second stakeholder — who they are, what they want, and why
      current options fall short for them.
  - icon: fa-handshake-angle
    title: Audience three
    body: >-
      Describe the third stakeholder or the broader market pressure that makes
      this problem worth solving now.
sources: >-
  List your sources here — reports, surveys, and datasets that back the numbers
  above. Replace with real citations.

---
type: columns
kicker: Why now
title: Explain the timing — why this is solvable today, not five years ago.
items:
  - icon: fa-chart-line
    title: Trend one
    bullets:
      - First reason the moment is right — a market or demographic shift
      - A supporting data point with a concrete figure
      - A third bullet that reinforces the trend
  - icon: fa-dollar-sign
    title: Trend two
    bullets:
      - "A cost or economic pressure: $00,000/yr median, rising ~0%/yr"
      - A second bullet quantifying the pain
      - Why the status quo can't scale
  - icon: fa-microchip
    title: Trend three
    bullets:
      - A technology or regulatory enabler that just became available
      - What it now makes possible that wasn't possible before
      - Why incumbents are poorly positioned for this shift
sources: >-
  Sources for the trends above — replace with your own citations.

---
type: tiers
kicker: Market
title: Size the market from the top down, then your beachhead.
tiers:
  - value: $0.0T
    shade: 1
    title: TAM — Total addressable market (Year)
    body: The full market you could eventually serve; note the largest segment
  - value: $00B
    shade: 2
    title: SAM — Serviceable market (Year)
    body: The slice your product realistically targets; add a growth rate
  - value: $000M
    shade: 3
    title: SOM — Initial wedge (illustrative)
    body: Your bottoms-up beachhead — units × price × penetration
chart:
  title: Market size over time ($B)
  labels: ["Year 1", "Year 2", "Year 5E"]
  values: [39, 45, 90]
  caption: ~00% CAGR over the period — replace with your projection
sources: >-
  Market-sizing sources here. SOM is a bottoms-up company estimate — label
  assumptions clearly.

---
type: columns
kicker: The solution
title: "Your Product: the one-line description of what you built"
lead: >-
  Two-sentence summary of the solution and the wedge it opens. **Put the single
  most important claim in bold** so it lands first.
items:
  - icon: fa-shield-halved
    title: Pillar one
    body: >-
      Describe the first core capability. What it does, how it works, and why it
      is differentiated from what exists today.
  - icon: fa-mobile-screen
    title: Pillar two
    body: >-
      Describe the second capability — the layer that delivers ongoing value to
      the user or buyer.
  - icon: fa-brain
    title: Pillar three
    accent: true
    body: >-
      Describe the standout pillar — the one that becomes your moat. The accent
      flag highlights it visually.

---
type: panels
kicker: Product
title: What ships now, and what comes next
left:
  icon: fa-box
  title: Phase 1 — available today
  note: What is shipping or pilot-ready
  bullets:
    - First capability that exists today
    - Second capability, described in a short phrase
    - Third capability
    - A fourth item if the list needs it
    - "A fifth item: keep each to one line"
right:
  icon: fa-microchip
  title: Phase 2 — in development
  note: What you are building next, in layers
  layers:
    - icon: fa-bolt
      title: Layer 1 — foundational capability
      body: One sentence on what this layer does and why it matters
    - icon: fa-phone
      title: Layer 2 — building on layer 1
      body: One sentence describing the next layer of value
    - icon: fa-comments
      title: Layer 3 — the differentiated layer
      body: One sentence on the capability that sets you apart
  footnote: + an optional footnote for a caveat, dependency, or consent note

---
type: score
kicker: The wedge
title: "Your key metric: the one number that changes behavior"
score: 87
score_label: metric label
caption: Short description of what the score measures and how it is computed
rows:
  - title: First reason this metric matters
    body: >-
      Explain the insight — for example, that a single clear index drives daily
      habits. Two or three sentences.
  - title: Second reason, highlighted
    highlight: true
    body: >-
      Use the highlight flag for the strongest supporting point. Back it with a
      statistic and a source where possible.
  - title: Third reason
    body: >-
      A benefit to the user, buyer, or ecosystem — why this metric becomes a
      shared language.
  - title: Fourth reason — the moat
    body: >-
      Why this is hard to copy: the data, model, or network effect that
      compounds over time.
sources: >-
  Sources supporting the claims above — replace with your citations.

---
type: matrix
kicker: Competition
title: Position yourself against alternatives on the axes that matter.
columns:
  - Capability one
  - Capability two
  - Capability three
  - Capability four
  - Capability five
rows:
  - name: Your Product
    highlight: true
    cells: [full, full, full, full, full]
  - name: Competitor A (short descriptor)
    cells: [full, partial, none, partial, none]
  - name: Competitor B (short descriptor)
    cells: [none, none, none, none, none]
  - name: Competitor C (short descriptor)
    cells: [none, partial, partial, none, partial]
  - name: Competitor D (short descriptor)
    cells: [partial, partial, none, none, partial]
callout:
  label: Market validation
  text: >-
    Use this box to make the "why the gap is real" argument — a comparable that
    raised or grew, and the specific space that is still unclaimed. Keep it to a
    few sentences.
sources: >-
  Competitive sources here. Legend: ✓ full  ◐ partial  — absent

---
type: loop
kicker: Business model
title: How you make money, and why it compounds
blocks:
  - title: Revenue
    body: >-
      Describe your pricing — one-time, recurring, tiered — and when revenue
      starts. Two or three sentences.
  - title: The buyer
    body: >-
      Who pays versus who uses. Explain the buyer's motivation and the user's
      motivation if they differ.
  - title: Go-to-market
    body: >-
      Your primary channel and any secondary channel. How you reach customers
      efficiently.
flywheel:
  title: Your compounding advantage
  nodes:
    - text: First step in the loop
      shade: 1
    - text: Second step — what it produces
      shade: 2
    - text: Third step — the value it creates
      shade: 1
    - text: Fourth step — how it feeds back in
      shade: 2

---
type: people
kicker: Team
title: Why this team wins
people:
  - initial: A
    name: Founder One
    role: Co-founder & CEO
    accent: true
    bullets:
      - Relevant prior role and what it proves
      - A second credential — domain or technical depth
      - A third line on track record
      - Education or notable affiliation
  - initial: B
    name: Founder Two
    role: Co-founder & CTO
    bullets:
      - Relevant prior role and what it proves
      - A second credential
      - What they own in the company
      - Education or notable affiliation
  - initial: C
    name: Founder Three
    role: Co-founder & COO
    bullets:
      - Relevant prior role and what it proves
      - A second credential
      - What they own in the company
      - Education or notable affiliation

---
type: close
kicker: The ask
title: Raising a $0.0M round
subtitle: "What the capital buys — the milestone you will reach in N months"
cards:
  - icon: fa-gear
    title: Use of funds — 50%
    body: >-
      The largest allocation and what it delivers — for example, product
      development and the next release.
  - icon: fa-rocket
    title: Use of funds — 30%
    body: >-
      The second allocation — traction, pilots, or partnerships you will land.
  - icon: fa-users
    title: Use of funds — 20%
    body: >-
      The third allocation — key hires or advisory support.
milestones:
  label: Milestones to next round
  items:
    - First concrete, measurable milestone
    - Second milestone — a validation point
    - Third milestone — a product or tech proof
    - A revenue or run-rate target
brand:
  parts:
    - text: "Your"
    - text: "Product"
      accent: true
    - text: " Name"
  text: "·   Your tagline or closing line goes here."
