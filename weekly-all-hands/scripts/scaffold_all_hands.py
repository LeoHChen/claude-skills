#!/usr/bin/env python3
"""Scaffold Poseidon weekly all-hands transcript, notes, and next agenda files."""

from __future__ import annotations

import argparse
from datetime import date, datetime, timedelta
from pathlib import Path


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def next_monday(day: date) -> date:
    days_ahead = (0 - day.weekday()) % 7
    if days_ahead == 0:
        days_ahead = 7
    return day + timedelta(days=days_ahead)


def format_long_date(day: date) -> str:
    return f"{day.strftime('%A, %B')} {day.day}, {day.year}"


def write_new(path: Path, content: str) -> bool:
    if path.exists():
        return False
    path.write_text(content, encoding="utf-8")
    return True


def transcript_content(meeting_date: date, transcript_url: str) -> str:
    stamp = meeting_date.isoformat()
    return f"""# Poseidon Eng All Hands - Weekly

- **Date:** {format_long_date(meeting_date)}
- **Source:** [Granola transcript]({transcript_url})
- **Related Agenda:** [{stamp}-agenda-and-notes.md]({stamp}-agenda-and-notes.md)
- **Related Notes:** [{stamp}-meeting-notes.md]({stamp}-meeting-notes.md)

## Transcript

Paste or normalize the exported Granola transcript here.
"""


def notes_content(meeting_date: date, transcript_url: str) -> str:
    stamp = meeting_date.isoformat()
    return f"""# Engineering Weekly All-Hands Meeting Notes

- **Date:** {format_long_date(meeting_date)}
- **Meeting:** Engineering Weekly All-Hands
- **Transcript Source:** [Granola transcript]({transcript_url})
- **Agenda:** [{stamp}-agenda-and-notes.md]({stamp}-agenda-and-notes.md)

## TL;DR

- TBD from transcript.

## Key Outcomes

### Trinity Progress Dashboard

- TBD

### Console and Platform

- TBD

### Numo Processing and Data Quality

- TBD

### Subnet / SONAR / Research

- TBD

## Decisions

- TBD

## Follow-Ups

- [ ] TBD - owner and next step

## Open Questions

- TBD
"""


def agenda_content(next_date: date, prev_date: date) -> str:
    stamp = next_date.isoformat()
    prev = prev_date.isoformat()
    return f"""# Engineering Weekly All-Hands

- **Date:** {format_long_date(next_date)}
- **Time:** 30-45 min
- **Host:** TBD
- **Notes Owner:** TBD

**Meeting Notes:** [{stamp}-meeting-notes.md]({stamp}-meeting-notes.md)

**Related Materials:**
- [{prev} all-hands agenda]({prev}-agenda-and-notes.md)
- [{prev} all-hands meeting notes]({prev}-meeting-notes.md)
- [{prev} Granola transcript]({prev}-granola-transcript.md)
- [2026 data release and portal team plan](../../docs/team-plan-2026-data-release-and-portal.md)
- [Engineering org chart and team list](../../docs/engineering-org.md)
- [Project ownership and DRI](../../docs/project-ownership.md)

## Goal

- TBD from prior meeting outcomes and current milestone needs.

## TL;DR

- Continue weekly Console demo with production progress or production feature behavior.
- Review Trinity dashboard progress bars, milestone clarity, owners, blockers, and next decisions.
- Review data release and portal DRI progress.
- Review app consolidation and Sasi-owned new app policy.
- Carry forward unresolved transcript action items from the prior all-hands.

## Agenda

### 1. Trinity Workstream Progress Review

- Review progress bars, milestones, owners, blockers, and next decisions.

### 2. Console Weekly Demo

- Demo production progress or production feature behavior.

### 3. Data Release and Portal DRI Review

- Review status, percent complete, blockers, and next milestone.

### 4. App Consolidation and New App Policy

- Review Sasi-owned app surface inventory and new app / database guardrails.

### 5. Subnet / SONAR / Numo Carry-Forward Items

- Review transcript-derived action items and release blockers.

## Action Items

- [ ] Host - start the meeting recording
- [ ] Team leads - convert decisions and follow-ups into GitHub issues

## Meeting Notes

### Decisions

- TBD

### Follow-Ups

- TBD

### Open Questions

- TBD
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default="~/projects/tpm-agent")
    parser.add_argument("--meeting-date", required=True)
    parser.add_argument("--next-date")
    parser.add_argument("--transcript-url", required=True)
    args = parser.parse_args()

    repo = Path(args.repo).expanduser().resolve()
    meeting_date = parse_date(args.meeting_date)
    agenda_date = parse_date(args.next_date) if args.next_date else next_monday(meeting_date)
    all_hands = repo / "meetings" / "all-hands"
    all_hands.mkdir(parents=True, exist_ok=True)

    created = []
    files = {
        all_hands / f"{meeting_date.isoformat()}-granola-transcript.md": transcript_content(
            meeting_date, args.transcript_url
        ),
        all_hands / f"{meeting_date.isoformat()}-meeting-notes.md": notes_content(
            meeting_date, args.transcript_url
        ),
        all_hands / f"{agenda_date.isoformat()}-agenda-and-notes.md": agenda_content(
            agenda_date, meeting_date
        ),
    }

    for path, content in files.items():
        if write_new(path, content):
            created.append(path)

    if created:
        print("Created:")
        for path in created:
            print(f"- {path}")
    else:
        print("No files created; all scaffold targets already exist.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
