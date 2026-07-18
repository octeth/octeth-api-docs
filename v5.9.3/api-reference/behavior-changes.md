---
layout: doc
title: API Behavior Changes in v5.9.3
description: Deliberate API behavior changes in Octeth v5.9.3 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v5.9.3

Octeth v5.9.3 tightens a set of API behaviors that previously accepted bad input, returned fabricated success, or silently corrupted data. Every change on this page was deliberate.

None of them alter a *successful, well-formed* request. Several, however, turn calls that used to **appear** to succeed into explicit errors — which is exactly the kind of thing an integration can be quietly relying on.

**Before upgrading, read Tier 1.** If you have an integration that ignores `Success` and reads the payload directly, or that submits partial update payloads, it is worth a few minutes of your time.

## One general note on error codes

`ErrorCode` and `ErrorText` are **arrays**, not scalars. A rejection returns `"ErrorCode": [13]`, not `"ErrorCode": 13`.

This is long-standing behavior, but it becomes relevant now that several endpoints return codes they never returned before. Code written as `if (response.ErrorCode === 13)` will not match. Use `response.ErrorCode.includes(13)` or your language's equivalent.

## Tier 1 — Calls that used to succeed now return an error

These are the changes that can break a working integration on upgrade. In each case the old behavior was returning success for a request that could not actually be honored.

### `autoresponder.get` — unknown or non-owned auto-responder now errors

Previously returned `Success: true` with a fabricated, near-empty `AutoResponder` object. Now returns `Success: false` with `ErrorCode: [2]`.

If you were treating any 200 response as a valid auto-responder, you were reading placeholder data. Handle the error case.

### `emailgateway.sendemail` — failed recipient resolution now errors instead of silently dropping

Previously returned HTTP 200 with `{"MessageID": []}` when the recipient list could not be resolved. The send never happened, but the caller was told it did. Now returns **HTTP 502** with error `Code: 39`.

If your sender treats non-200 as retryable, note this condition is **not transient** — retrying an unresolvable recipient set fails identically. If you were monitoring for "sends that returned 200 but produced no message ID", you can drop that workaround.

### `global.customfield.create` — `Date field` now requires `Years`

Previously, omitting `Years` created the field with an implicit `currentYear-10 .. currentYear+10` range. Now rejected with `ErrorCode: [5]`.

Supply `Years` explicitly. Existing date fields are unaffected — this is creation-time only.

### `customfield.update` — the field's list is now immutable, and omitting it no longer detaches the field

Two related fixes:

- Omitting `SubscriberListID` previously **wiped** the field's list association. It is now preserved, so partial updates (renaming a field, for example) are safe.
- Supplying a `SubscriberListID` you do not own returns `ErrorCode: [13]`. Supplying one you *do* own but that differs from the field's current list returns `ErrorCode: [14]` — custom fields cannot be moved between lists, because the underlying column lives on that list's subscriber table and no schema change was ever performed. Create the field on the target list instead.
- Passing the field's **current** list ID still works, so integrations that echo it back are unaffected.

### `journey.get` / `journey.list` — date parameters are now strictly validated

Date bounds must be exactly `YYYY-MM-DD`. Previously, invalid dates were silently coerced and inverted ranges silently returned empty results. Now the request is rejected with **HTTP 422**:

| Code | Meaning |
|---|---|
| 4 | Start date malformed |
| 5 | End date malformed |
| 6 | Start date is after end date |

Multiple errors are returned together.

The strictness is broader than just overflow dates. All of the following are now **rejected**, and some are common in real integrations:

| Input | Result | Why |
|---|---|---|
| `2026-01-05` | accepted | |
| `2026-02-31` | rejected | Overflows into March; used to silently roll over |
| `0000-00-00` | rejected | MySQL-style zero date |
| `2026-1-5` | rejected | Not zero-padded |
| `2026-01-05 ` | rejected | Trailing whitespace is not trimmed |
| `20260105` | rejected | Wrong format |

If you build date strings by concatenation, or pass MySQL zero dates through, audit that first.

Note also that omitted bounds are still defaulted (`-30 days` / today) and *then* range-checked — so a future `StartDate` with no `EndDate` now returns `Code 6` rather than an empty result set.

### `campaign.update` — Untrusted accounts are held at `Pending Approval` again

For accounts with `ReputationLevel = Untrusted`, a `Draft → Ready` transition is now held at `Pending Approval` and an admin notification is sent.

This approval hold already existed but had been inoperative due to a key-casing bug, so on a live installation it will read as new behavior.

**Important:** the call still returns `Success: true` while the resulting status differs from the one you requested. Re-read the campaign rather than assuming your requested status took effect.

## Tier 2 — Same success or failure, different values or shapes

These will not raise an error. They change what you get back, which makes them easier to miss.

### `emailgateway.getapis` / `emailgateway.getsmtps` — empty results are now `[]`, not `false`

`"APIKeys": false` becomes `"APIKeys": []`, and `"SMTPs": false` becomes `"SMTPs": []`. The documented shape was always an array; the `false` was a bug.

In JavaScript this flips a truthiness check — `if (!data.APIKeys)` used to be true for an empty result and is now false, because `[]` is truthy. Check length instead.

### `emailgateway.smtprelay` — rejection responses now carry real error codes

Rejections previously returned an empty `ErrorCode: []`, so callers could not tell why a relay attempt was refused. They now return one of:

| Code | Meaning |
|---|---|
| 9 | TO address count limit exceeded |
| 10 | CC address count limit exceeded |
| 11 | BCC address count limit exceeded |
| 12 | Send rate limit reached |
| 13 | Delivery credit limit reached |

The `SMTPResponse` strings are unchanged, so anything parsing those keeps working.

### `suppression.import` — the counters now reflect reality, and no longer sum to your input

`TotalFailed` previously included blank lines and a phantom entry emitted when only JSON addresses were supplied. `TotalImported` now counts only rows actually persisted.

The practical consequence:

> `TotalImported + TotalFailed` may be **less than** the number of addresses you submitted.

Addresses that duplicate an existing entry, or that are whitelisted, are now counted as **neither** imported nor failed — they were skipped, which is neither an error nor a new row. `TotalFailed` now means specifically "malformed email address", and those are listed in `FailedEmailAddresses`.

If you reconcile counts against your input length, that check needs updating.

### `campaign.get` — the `ParentCampaign` key is omitted when there is no parent

Previously present as `"ParentCampaign": null`; now absent entirely. Use a key-existence check rather than a null check.

Note that the sibling `AutoResendCampaign` key emits `[]` in the equivalent situation — the two are not consistent with each other.

### Sorting parameters are now validated

As part of closing a SQL injection surface, `users.get`, `admin.events.search` and `admin.users.activity` validate the sort parameters they receive. A sort value containing anything outside a plain identifier is discarded and the endpoint falls back to its default ordering — **silently, with HTTP 200**.

For `admin.users.activity` the accepted columns are `Username`, `CompanyName`, `LastActivityDateTime`, `LastSendingActivityDateTime`, `AccountStatus` and `UserActivityStatus`. Anything else is ignored.

If your results come back in an unexpected order after upgrading, your sort parameter is being rejected — it is not reported as an error.

## Tier 3 — Security closures

These only affect callers doing something that was never intended to work. Listed for completeness and for anyone auditing.

- **`segment.update`** — a `SubscriberListID` belonging to another account can no longer be used to repoint a segment. Rejected with `ErrorCode: [6]`, HTTP 200. Note that a malformed (non-numeric) value is still silently ignored rather than rejected.
- **`users.get`, `admin.events.search`, `admin.users.activity`** — SQL injection surface in `ORDER BY` handling closed. See the sorting note in Tier 2 for the caller-visible effect.
- **Internal campaign counters** — SQL injection surface closed. No API-visible change.
- **API-created user API keys** are now generated with a cryptographically secure random number generator. Existing keys are unaffected and do not need rotation for this reason alone.

## Fixed, not broken

### `theme.update` — omitting `ThemeSettings` now preserves the stored settings

Previously, a partial update that omitted both `ThemeSettings` and `Template` **wiped** the theme's stored settings to an empty value. Omitting only `ThemeSettings` while supplying `Template` reset every setting to its default.

Neither happens now — omitted means unchanged.

This is strictly a fix, but it is still a behavior change for anyone who worked around the old behavior by always resending the full settings payload. Note there is no longer any way to reset a theme to its defaults through this endpoint.

## Upgrade checklist

1. **Do you call `journey.get` / `journey.list` with dates you build or forward from another system?** Verify the format is strictly `YYYY-MM-DD` — unpadded and untrimmed values now return 422.
2. **Do you send partial `customfield.update` or `theme.update` payloads?** These now preserve omitted fields instead of clearing them. If you were compensating for the old wipe by always resending everything, that compensation is now redundant.
3. **Do you reconcile `suppression.import` counters against your input row count?** Update the check.
4. **Do you rely on `APIKeys` / `SMTPs` being falsy when empty, or on `ParentCampaign` being present?** Update both.
5. **Do you treat any HTTP 200 from `emailgateway.sendemail` as a successful send?** Handle HTTP 502 / code 39.
6. **Are any of your accounts `Untrusted`?** Expect `Pending Approval` rather than `Ready`, and re-read the campaign status.
