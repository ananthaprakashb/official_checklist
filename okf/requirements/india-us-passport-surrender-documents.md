---
type: requirement
id: requirement-india-us-passport-surrender-documents
title: Surrender of Indian Passport Requirements - USA
generated: 2026-08-12
verified: 2026-08-12
stale_after: 2026-09-11
status: verified
sources:
  - ../sources/passport-seva-surrender-2026.md
  - ../sources/vfs-us-surrender-2026.md
---

# Surrender of Indian Passport Requirements — USA

Run only after service classification resolves `surrender_indian_passport`.

## Eligibility/classification gates

- applicant previously held Indian citizenship/passport and has acquired foreign nationality;
- applicant is not being routed to an Ordinary Passport Fresh/Re-issue service;
- latest passport status is identified, including expired/lost or any adverse-action status.

## Core workflow

- complete the Government surrender/renunciation application;
- complete the current mandatory online photograph/signature upload where required by the U.S. VFS flow;
- provide the latest Indian passport for surrender when available; Passport Seva permits surrender of an expired latest passport;
- provide proof of acquisition of foreign nationality;
- use the current U.S. VFS surrender checklist for any additional applicant-specific evidence;
- pay the current surrender/VFS fees and submit according to the verified consular jurisdiction and available VFS mode.

## Important exceptions

- Ordinary police verification is not required for a Surrender Certificate under Passport Seva guidance.
- If the passport is impounded, revoked, suspended or cancelled against re-issue, do not force the ordinary surrender route; return `NEEDS_AUTHORITATIVE_CONFIRMATION` for the applicable authority/action.
- If the passport is lost, use the current VFS surrender checklist's lost-passport evidence branch rather than inventing replacement-passport steps.

## Hard blocker

A person who has acquired foreign nationality must not be told to renew/reissue the Indian passport. Resolve surrender/renunciation first.
