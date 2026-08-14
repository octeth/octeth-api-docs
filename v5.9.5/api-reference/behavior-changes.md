---
layout: doc
title: API Behavior Changes in v5.9.5
description: Deliberate API behavior changes in Octeth v5.9.5 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v5.9.5

This page lists every deliberate change in v5.9.5 that an existing integration can observe, so you can check your code against it before upgrading.

::: info This page is maintained through the release cycle
Entries are added as fixes merge and the list is finalized at release. If you are reading it mid-cycle, treat it as current-but-growing rather than frozen.
:::

**No behavior changes have been recorded yet for v5.9.5.** If that is still true when the release ships, this release changes no API behavior and you can upgrade without auditing your integration.

Looking for the previous release? See [API Behavior Changes in v5.9.4](/v5.9.4/api-reference/behavior-changes), which turned an invalid `subscribers.get` search field from a masked empty success into an explicit error.

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

Carry-over item for this cycle: the v5.9.4 page had its "Legacy criteria builder" Tier 3 bullet
removed before publication because it named the unescaped-identifier class and pointed at the one
function that was fixed, while issue #2720 left the sibling function open. If #2720 ships in
v5.9.5, restore that bullet here.
-->
