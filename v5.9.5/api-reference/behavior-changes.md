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

Looking for the previous release? See [API Behavior Changes in v5.9.4](/v5.9.4/api-reference/behavior-changes), which turned an invalid `subscribers.get` search field from a masked empty success into an explicit error.

## Tier 3: Security closures

These only affect callers doing something that was never intended to work. Listed for completeness and for anyone auditing.

- **Segment rules, legacy criteria builder.** A `SegmentRuleField` (or `SegmentRuleOperator`) that is not a known subscriber column, a `CustomField<n>` id, an activity field (`Opens`/`Clicks`), or a recognised operator phrase is now rejected. `segment.create` returns `Success: false` with `ErrorCode: 5` and `segment.update` returns `ErrorCode: [7]`, and no rule is written. Rules already stored with such a field are also dropped when the segment is evaluated. This closes an injection where a crafted rule field reached the legacy criteria builder as raw SQL. The value half of a rule was always escaped; the field and operator halves are now allowlisted at save time and again at evaluation. Segments built in the UI use the JSON rules format and always carry valid fields and operators, so they are unaffected. Only hand-crafted `SegmentRuleField[]`/`SegmentRuleOperator[]` values outside the allowlist change behavior (issue #2720).

## Upgrade checklist

1. **Do you call `segment.create` or `segment.update` with `SegmentRuleField[]` / `SegmentRuleOperator[]` values you build or forward from another system?** Make sure each field is a known subscriber column, a `CustomField<n>` id, or an activity field (`Opens`/`Clicks`), and each operator is a recognised phrase (e.g. `Contains`, `Equals to`, `Is`, `Is not`, `Is set`, `Between`). Anything else now returns `Success: false` (`ErrorCode: 5` on create, `[7]` on update) instead of being stored. Callers using the JSON `RulesJson` format are unaffected.

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
v5.9.5, restore that bullet here. DONE: #2720 is in this cycle; the "Legacy criteria builder"
Tier 3 bullet is restored above.
-->
