---
name: weekly-all-hands
description: Use when creating or updating Poseidon weekly all-hands agenda, meeting notes, TL;DR sections, Granola transcript imports, and next-week carry-forward agendas after a meeting transcript is posted.
---

# Weekly All-Hands

Use this skill for the Poseidon engineering all-hands workflow after a weekly meeting transcript is available.

## Workflow

1. Sync the meeting repo before editing.
   - Default repo: `~/projects/tpm-agent`
   - Run `git fetch origin main`.
   - Branch from current `origin/main`; do not stack on stale or merged PR branches.
2. Identify dates in Pacific Time.
   - Current meeting date is the transcript meeting date.
   - Next agenda date is usually the next Monday; adjust for holidays or explicit user instruction.
3. Import the transcript.
   - Save the raw or lightly normalized transcript to `meetings/all-hands/YYYY-MM-DD-granola-transcript.md`.
   - Include the Granola URL, date, attendees if available, and related agenda/notes links.
   - If the Granola URL is login-gated, ask for pasted/exported transcript text or create only a source-link placeholder. Do not invent transcript content.
4. Update the current weekly agenda.
   - Ensure it links to the meeting notes and transcript file.
   - Add or refresh `## TL;DR` with the actual meeting outcomes, decisions, and carry-forward items.
   - Preserve populated team sections such as AI Research, Platform Engineering, and Subnet updates.
5. Create or update the current meeting notes.
   - File: `meetings/all-hands/YYYY-MM-DD-meeting-notes.md`
   - Required sections: metadata, `## TL;DR`, key outcomes, decisions, follow-ups, open questions.
   - Convert transcript action items into checkbox follow-ups with owners.
6. Create the next weekly agenda.
   - File: `meetings/all-hands/NEXT-YYYY-MM-DD-agenda-and-notes.md`
   - Use prior agendas as the template.
   - Carry forward recurring weekly items:
     - Trinity dashboard progress bars and milestone clarity
     - weekly Console demo with production progress or production feature behavior
     - data release and portal DRI reporting
     - app consolidation and Sasi-owned new app policy
     - subnet / Testnet readiness
     - SONAR / EvalBench status
     - Numo processing, data quality, and deepfake follow-ups
     - onsite, vacation, and launch-readiness logistics when relevant
   - Extract next-week review items from transcript action items and unresolved decisions.
7. Verify before committing.
   - Run `git diff --check`.
   - Render or lint Markdown when the repo has an established check.
   - Review links and relative paths manually.
8. Commit and PR when requested.
   - Use a conventional commit, usually `docs: add weekly all-hands notes and agenda`.
   - Push a PR branch; do not push directly to `main`.

## Scaffold Script

For the initial file skeleton, use:

```bash
weekly-all-hands/scripts/scaffold_all_hands.py \
  --repo ~/projects/tpm-agent \
  --meeting-date YYYY-MM-DD \
  --transcript-url '<granola-url>'
```

The script creates missing transcript, meeting-note, and next-agenda files without overwriting existing files. After scaffolding, replace placeholders with transcript-derived content and update TL;DR sections manually.

## Quality Bar

- TL;DR sections must be specific enough to brief a leader who missed the meeting.
- Next agenda must carry forward decisions and unresolved action items, not just repeat the previous agenda.
- Do not remove already populated team updates unless the user explicitly asks.
- Make ownership explicit: owner, status, blocker, next step.
- Prefer concise agenda language over transcript-style narration.
