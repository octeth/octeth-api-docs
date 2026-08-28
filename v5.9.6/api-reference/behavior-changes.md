---
layout: doc
title: API Behavior Changes in v5.9.6
description: Deliberate API behavior changes in Octeth v5.9.6 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v5.9.6

This page lists every deliberate change in v5.9.6 that an existing integration can observe, so you can check your code against it before upgrading.

::: info This page is maintained through the release cycle
Entries are added as fixes merge and the list is finalized at release. If you are reading it mid-cycle, treat it as current-but-growing rather than frozen.
:::

Looking for the previous release? See [API Behavior Changes in v5.9.5](/v5.9.5/api-reference/behavior-changes), which repointed the Email Gateway recipient domain report at the send queue, scoped per-domain statistics to the sender domain requested, and allowlisted segment rule fields and operators.

## No changes recorded yet

Nothing in this cycle has changed observable API behavior so far.

## One general note on error codes

`ErrorCode` and `ErrorText` are **arrays**, not scalars, on most endpoints. A rejection typically returns `"ErrorCode": [13]`, not `"ErrorCode": 13`. Code written as `if (response.ErrorCode === 13)` will not match, so use `response.ErrorCode.includes(13)` or your language's equivalent.

`subscribers.get` is the exception: it returns a **scalar** `ErrorCode` (for example `"ErrorCode": 4`), consistent with its existing codes `1`, `2` and `3`. Match it as a scalar.

<!--
MAINTAINER NOTES (remove before release)

Structure to follow, copied from the v5.9.4 page, which is the reference for tone and tiering:

  Tier 1 - Calls that used to succeed now return an error. Read this first; it is the tier that
           breaks integrations silently relying on a fabricated success.
  Tier 2 - Same call, different results. No request change, but the response values or result set
           differ.
  Tier 3 - Security closures. Only affects callers doing something never intended to work. Listed
           for completeness and for auditors.
  Upgrade checklist - one numbered, actionable question per change.

Add entries AS FIXES MERGE, not at release time. A deliberate contract change reads as an ordinary
`fix:` in git log, so a changelog derived from commit subjects will miss it. That is exactly how
v5.9.3 shipped with "Breaking Changes: None" while this page already documented 8 Tier-1 changes.

Delete the "No changes recorded yet" section as soon as the first real entry lands. If it is still
there at release, keep it and say so plainly. A release with no observable API change is a normal
outcome and worth stating, not hiding.

Watch list for this cycle, both carried over from the v5.9.5 window:

- #2731 - campaigns browse SortField reaches ORDER BY unmapped. The last named sink from the #2720
  audit, and the reason the v5.9.5 page's Tier 3 "Legacy criteria builder" bullet does not claim the
  whole class is closed. If this ships here it is a Tier 3 security closure, and also a Tier 1 entry
  if an invalid sort field starts returning an error rather than being silently accepted.
- #2730 - subscribers.search returns Success:true with a non-zero TotalSubscribers and an empty
  Subscribers array when the ORDER BY column does not exist. A Tier 1 candidate: it converts a
  fabricated success into an explicit error, exactly the shape that breaks integrations treating an
  empty result as "no matches". Note the reachable trigger is ordering by a GLOBAL custom field,
  which has no column on the subscriber table.
-->
