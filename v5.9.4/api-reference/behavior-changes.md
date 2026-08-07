---
layout: doc
title: API Behavior Changes in v5.9.4
description: Deliberate API behavior changes in Octeth v5.9.4 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v5.9.4

Octeth v5.9.4 closes a set of SQL-injection surfaces in the subscriber APIs. Every change on this page was deliberate.

None of them alter a *successful, well-formed* request. One turns a class of malformed input that used to **appear** to succeed into an explicit error — which is exactly the kind of thing an integration can be quietly relying on.

**Before upgrading, read Tier 1.** If you drive `subscribers.get` search with a field value you build or forward from another system, it is worth a few minutes of your time.

::: info This page is maintained through the release cycle
Entries are added as fixes merge and the list is finalized at release. If you are reading it mid-cycle, treat it as current-but-growing rather than frozen.
:::

## One general note on error codes

`ErrorCode` and `ErrorText` are **arrays**, not scalars, on most endpoints. A rejection typically returns `"ErrorCode": [13]`, not `"ErrorCode": 13`. Code written as `if (response.ErrorCode === 13)` will not match — use `response.ErrorCode.includes(13)` or your language's equivalent.

Note the exception below: `subscribers.get` returns a **scalar** `ErrorCode` (e.g. `"ErrorCode": 4`), consistent with its existing codes `1`, `2`, `3`. Match it as a scalar.

## Tier 1 — Calls that used to succeed now return an error

### `subscribers.get` — an invalid `SearchField` is now rejected

`SearchField` was previously forwarded unvalidated. A value that was neither a default search field nor a real custom field simply produced an internal *unknown column* error that surfaced as an empty success — `Success: true` with `Subscribers: false` and `TotalSubscribers: 0`, indistinguishable from a search that genuinely matched nothing.

It is now validated. A legitimate `SearchField` is either a default search field — `EmailAddress`, `SubscriberID`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate` — or the **numeric ID** of a custom field. Anything else is rejected with `Success: false` and the new `ErrorCode: 4` ("Invalid search field").

This closes a SQL-injection surface: the rejected values are exactly the ones that could smuggle SQL through the field name. A **successful, well-formed** search — a real field name or a numeric custom-field ID, which is every documented use — is unchanged. Only calls that were already failing (a typo'd field, a custom field passed by name instead of numeric ID, or an injection attempt) change, from a masked empty success to an explicit `ErrorCode: 4`.

If you treat `TotalSubscribers: 0` from a search as "no matches", add a `Success` check: a well-formed search that matches nothing still returns `Success: true`, while an invalid `SearchField` now returns `Success: false` / `ErrorCode: 4`.

## Tier 3 — Security closures

These only affect callers doing something that was never intended to work. Listed for completeness and for anyone auditing.

- **`subscribers.get` `SearchField`** — SQL injection through the criteria builder's field name closed (the caller-visible effect is the Tier 1 entry above). The value half of a search was always parameter-escaped; the field-name half is now identifier-escaped too.
- **`subscribers.search`** — the internal segment-engine call is now parameter-safe (a value can no longer smuggle an additional request parameter), and `OrderField` / `OrderType` are validated against an allowlist. An `OrderField` that is not a physical subscriber column (or a `CustomField<n>`) now falls back to `EmailAddress` ordering **silently, with HTTP 200**, where an unusual value could previously reach the query builder. A successful sort on a real column is unchanged. If your results come back in an unexpected order after upgrading, your sort parameter is being rejected — it is not reported as an error.
- **Legacy criteria builder** — every backtick-wrapped field name emitted by the shared `GetRows` query builder is now identifier-escaped (embedded backticks are doubled). No API-visible change for any legitimate caller; column names never contain a backtick, so the emitted SQL is byte-identical.

## Upgrade checklist

1. **Do you call `subscribers.get` with a `SearchField` you build or forward from another system?** Make sure it is a default search field (`EmailAddress`, `SubscriberID`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`) or a **numeric** custom-field ID. Anything else now returns `Success: false` / `ErrorCode: 4` instead of a masked empty success. In particular, if you pass a custom field by its **name** rather than its numeric ID, that call was already returning nothing and will now return an explicit error.
2. **Do you treat `TotalSubscribers: 0` from a `subscribers.get` search as "empty"?** Add a `Success` check — `Success: true` with `TotalSubscribers: 0` reliably means the search matched nothing; `Success: false` / `ErrorCode: 4` means the field was invalid.
3. **Do you sort `subscribers.search` results by a non-standard `OrderField`?** A value that is not a physical column or `CustomField<n>` now falls back to `EmailAddress` ordering silently (HTTP 200). Verify your sort field if results come back in an unexpected order.
