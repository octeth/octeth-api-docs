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

### `smssuppression.browse` — retrieval failures now error instead of returning an empty list

Previously, a failed retrieval was reported as `Success: true` with `TotalRecords: 0` and `Suppressions: []` — indistinguishable from a list that genuinely has no suppressed numbers. It now returns `Success: false` with the new `ErrorCode: [5]`.

This matters more than a typical error-code addition, because `Level=list` was failing **for every account**: the list owner was resolved from a table that does not exist, so the query always failed and the failure was masked as an empty success. If you have a per-list SMS suppression view that has always rendered empty, this is why — it will start returning rows after upgrading.

If you treat `TotalRecords: 0` as "empty", add a `Success` check. `Success: true` with `TotalRecords: 0` now reliably means the filter matched nothing.

### `admin.campaign.retryfailed` — a failed commit is no longer reported as success

The retry transaction's `COMMIT` result was never inspected. A failed commit fell straight through to the message-queue publish, so the endpoint could return `Success: true` for work that never became durable — and a delivery worker consuming that message would find the campaign without the pending batches it was told to process.

A failed commit is now caught and returned as `ErrorCode: 6`.

The same fix separates two failures that used to look identical. Once the commit **has** succeeded, a message-queue dispatch failure is no longer reported as a "Database error" alongside a `ROLLBACK` that was a no-op against already-durable state. It still returns `ErrorCode: 6`, but with an `ErrorText` stating plainly that the recipients were re-queued, the campaign is in `Sending`, nothing was rolled back, and delivery is resumed with `admin.campaign.unstuck`. The publish is now retried up to three times first.

If you parse `ErrorText`, note that code `6` now carries two distinguishable messages. If you treated any `Success: true` from this endpoint as "the retry is under way", that assumption is now actually true.

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

### `user.current` — `GroupInfo` now carries the account's capability flags

`GroupInfo` previously held four keys (`UserGroupID`, `GroupName`, `GroupPlanName`, `DefaultSenderDomain`). It now also returns the group's `Permissions`, the `Limit*` quota set, the `Force*` content constraints, and the sender-domain / sender-info feature gates. See [Get Current User Information](./users.md#userinfo-groupinfo).

The change is **purely additive** — the four pre-existing keys are unchanged in name and value, and nothing was removed. The only way this breaks a caller is if it iterates `GroupInfo` and assumes exactly four entries.

The practical upside: these flags previously required an **admin-authenticated** `user.get`, which forced frontend integrations to hold an admin API key purely to render a user's own UI. That is no longer necessary.

Note that delivery-server records and their `ConnectionParams`, `SendMethod*` SMTP settings, all `Payment*` values, and the `ThresholdImport` / `ThresholdEmailSend` moderation thresholds are deliberately **not** included and remain admin-only.

### `campaign.get` — the `ParentCampaign` key is omitted when there is no parent

Previously present as `"ParentCampaign": null`; now absent entirely. Use a key-existence check rather than a null check.

Note that the sibling `AutoResendCampaign` key emits `[]` in the equivalent situation — the two are not consistent with each other.

### `campaign.recipients.get` — two audience-definition rejections moved out of the catch-all code

Two conditions previously reported as the generic `ErrorCode: 10` now return their own codes:

| Code | Meaning |
|---|---|
| 5 | A criterion carries an invalid `list_id` (joins the existing "targeting definition unusable" code) |
| 6 | A list referenced by the campaign's criteria is unavailable |

The message changes with them: what used to be `"Error retrieving campaign recipients: List 42 not found"` is now `"List 42 not found"`.

The old code `10` also absorbs genuine internal faults, so a caller had no way to tell "your campaign references a list that no longer exists" — something the account owner can fix — from "something broke server-side". That is the distinction these codes restore.

`Success: false` and **HTTP 200** are unchanged, so only a caller that branches on the specific value of `ErrorCode`, or matches the full message string, is affected. Code `10` still exists and is still returned for unexpected internal failures — including a **database failure** during the list lookup, which is deliberately not reported as code `6`.

Code `6` intentionally does not distinguish "the list does not exist" from "the list belongs to another account" — the response is byte-identical in both cases so it cannot be used to probe for other accounts' lists.

### Email Gateway send rate limits are now reported as they are enforced

`user.get` and `users.get` (when limit utilization is requested), the admin user **Limit Utilization** tab, and the limit-utilization cron all report Email Gateway send rate limits under `LimitUtilization.EmailGateway.SendRateLimits`. Those numbers were computed differently from the numbers the send path actually enforces, so they could disagree with reality. They now come from the same normalisation the enforcement check uses.

Two stored shapes were reported wrongly and now change:

- An interval whose limit was stored as the **string** `"-1"` rather than the number `-1` was reported as a real limit of `-1`, with `remaining` = `-1 - used` and `exceeded: true` for any usage at all. It is now recognised as *unlimited* and, like every other unlimited interval, is **omitted** from `SendRateLimits`.
- An interval the operator never configured was reported with a limit equal to its **position** in the interval list — `0`/minute, `1`/hour, `2`/day, `3`/week, `4`/month, `5`/year. Unconfigured intervals are now unlimited and are omitted.

A user group whose rate limits are entirely unlimited no longer emits an `EmailGateway` block at all; the positional-index defect could previously make one appear.

Accounts with a correctly stored, all-integer rate-limit configuration — the overwhelming majority — see **no change**. If you parse `SendRateLimits`, treat a missing interval as unlimited rather than assuming every interval is present.

### `user.update` — `RateLimits` is normalised before it is stored

Rate limits saved through `user.update`, and through the admin user-edit page's JSON editor (which routes to the same endpoint), are now normalised to the canonical document shape before they are written — the same way user-group default rate limits already were.

The stored value becomes `{"EmailGateway":{Minute,Hour,Day,Week,Month,Year},"SMS":{…}}` with integer values, where `-1` means unlimited and an omitted interval becomes `-1`. This is what stops a limit entering the table as the string `"-1"`, which is the source of the display defect above.

Two things deliberately did **not** change:

- **An empty value still means "no user-level override"** — the account inherits its user group's default rate limits. Only a value that decodes to an object is normalised; anything else is stored exactly as sent. This matters: normalising an empty value into an all-unlimited document would silently promote those accounts from their group's limits to no limit at all.
- **Existing stored values are not modified.** There is no migration or backfill; rows are normalised as they are next written.

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

### `user.get` / `users.get` no longer create payment-period rows as a side effect

Reading a user's limit utilization used to **write** to the payment log. `user.get`, `users.get` with `IncludeLimitUtilization=true`, the admin Limit Utilization tab, and the 15-minute all-users cron each inserted rows when no period covered today — and because the read path passed an incomplete user record, those rows were written with an empty `PeriodStartDate`.

Those malformed rows still satisfied the "does a period cover today" test, so the **send path** found them and booked real metering (`CampaignsSent`, `CampaignsTotalRecipients`, `EmailGatewayEmailsDelivered`) into a window anchored at `0000-00-00` instead of creating a correct period anchored to the account's signup anniversary.

Read paths are now strictly read-only. Two consequences worth knowing:

- **`LimitCampaignSendPerPeriod` counters may reset once, shortly after upgrading.** An account whose current period was one of these malformed rows keeps it until it expires (at most one month), then gets a correctly anchored period on its next send. Their in-flight counter effectively resets at that moment. The previous boundary was arbitrary, so this is a correction rather than a loss.
- **Reported values are unchanged** for any account that already had a valid payment-period row. `LimitUtilization.MonthlyLimits.CampaignsSent` returns the same figure as before.

Existing malformed rows are not deleted by the upgrade. They age out on their own, and no new ones are created.

### `event.track` / `oct.eventI()` — custom fields are no longer dropped

Two separate defects, both silent:

- Passing a custom field by its **`CustomField<ID>`** key stored an **empty value** when the subscriber was created for the first time. It worked correctly on update, so the loss only affected brand-new subscribers. Merge tag aliases were unaffected.
- The **`event.track` API command discarded `IdentifyProperties` entirely**, so custom fields could not be set server-to-server at all — only through the browser tracker.

Both are fixed, and both key formats now behave identically on create and update across both ingress paths. If you worked around either by using merge tag aliases only, or by following up with a `subscriber.update` call, those workarounds remain valid and need no change.

### Website tracker — an email-link click now identifies the visitor

When a subscriber clicks a tracked campaign link, the landing URL carries a token that already identifies them authoritatively. Revenue attribution has always used it. Website-event **activity logging** and **Website Event journeys** did not — they resolved the visitor only through an explicit `oct.eventI()` call, so a single identified click produced inconsistent outcomes: the sale was credited to the subscriber, but their pageviews and custom events never appeared in their activity and never drove a journey.

That token now seeds the visitor↔subscriber binding the same way an explicit identify does.

::: warning Expect higher Website Event journey volume
`WebsiteEvent_pageView` and `WebsiteEvent_customEvent` triggers may now fire for every clicked-through recipient who lands on a page running the tracker, where previously they fired only for visitors who had been explicitly identified. If you have journeys on those triggers, review them before upgrading — particularly any that send email.
:::

`WebsiteEvent_identify` deliberately does **not** fire for this implicit binding. The visitor never called `eventI()`, so an identify journey firing on a mere link click would be surprising. An explicit `eventI()` with a real email address still takes precedence and is never overwritten by the implicit binding.

Revenue attribution behavior is unchanged.

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
7. **Do you read `smssuppression.browse` and treat `TotalRecords: 0` as "empty"?** Add a `Success` check for the new `ErrorCode: [5]`. If your per-list SMS suppression view has always been empty, expect it to start returning rows.
8. **Do you iterate `GroupInfo` from `user.current` assuming exactly four keys?** It now returns the full capability set. If you were calling the admin-authenticated `user.get` purely to read capability flags, you can stop.
9. **Do you have journeys on `WebsiteEvent_pageView` or `WebsiteEvent_customEvent` triggers?** Review them before upgrading — an email-link click now identifies the visitor, so these can fire for every clicked-through recipient.
10. **Do you monitor payment-period rows or `LimitCampaignSendPerPeriod` counters?** Expect a one-time counter reset for accounts that were on a malformed period, and expect read endpoints to stop creating rows.
11. **Do you branch on `ErrorCode: 10` from `campaign.recipients.get`, or match its full `ErrorMessage` string?** An invalid `list_id` is now code `5` and an unavailable list is now code `6`, and the `Error retrieving campaign recipients:` prefix is gone from those two messages. Code `10` now means an unexpected internal failure.
12. **Do you call `admin.campaign.retryfailed` and treat `Success: true` as "the retry is under way"?** That is now accurate — but handle `ErrorCode: 6`, which covers both a failed commit and a committed retry that could not be dispatched. The `ErrorText` tells you which, and the second case is recovered with `admin.campaign.unstuck`, not by retrying.
